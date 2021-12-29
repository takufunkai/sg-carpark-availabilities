import { Box, Button, Card, Grid, TextField } from "@mui/material";
import type { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";
import {
  HDBCarparkAvailability,
  HDBCarparkInformation,
  HDBCarparkInformationParams,
} from "../types/carpark";
import { getHdbCarparkInfo, getHdbCarparksAvailability } from "../utils/api";
import {
  CarparkLotType,
  CarparkLotTypes,
  LotTypeToLabelMap,
} from "../utils/helper";

const initialValues = {
  loading: {
    isLoading: false,
    resource: "",
  },
  HDBCarparkInformationParams: {
    q: "",
    limit: 15,
    offset: 0,
  },
};

const Home: NextPage = () => {
  const [searchedCarparks, setSearchedCarparks] = useState<
    HDBCarparkInformation[]
  >([]);
  const [carparkAvailabilities, setCarparkAvailabilities] = useState<
    HDBCarparkAvailability[]
  >([]);
  const [loading, setLoading] = useState<{
    isLoading: boolean;
    resource: string;
  }>(initialValues.loading);
  const [totalCarparks, setTotalCarparks] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [params, setParams] = useState<HDBCarparkInformationParams>(
    initialValues.HDBCarparkInformationParams
  );

  const fetchCarparkData = useCallback(async () => {
    setLoading({ isLoading: true, resource: "Loading carparks..." });
    try {
      const { carparks, total } = await getHdbCarparkInfo(params);
      setTotalCarparks(total);
      setSearchedCarparks(carparks);

      if (carparkAvailabilities.length === 0) {
        const _carparkAvailabilities = await getHdbCarparksAvailability();
        setCarparkAvailabilities(_carparkAvailabilities);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(initialValues.loading);
  }, [params]);

  useEffect(() => {
    fetchCarparkData();
  }, [params]);

  const handleSearch = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    setSearchedCarparks([]);
    setParams({ ...initialValues.HDBCarparkInformationParams, q: search });
    setTotalCarparks(0);
  };

  const handleNextPage = () => {
    if (params.offset + 15 >= totalCarparks) {
      return;
    }
    setSearchedCarparks([]);
    setParams({ ...params, offset: params.offset + 15 });
  };

  const handlePrevPage = () => {
    if (params.offset === 0) {
      return;
    }
    setSearchedCarparks([]);
    setParams({ ...params, offset: params.offset - 15 });
  };

  const getAvailabilityString = (cp: HDBCarparkInformation) => {
    const availability = carparkAvailabilities.find(
      (availability) => availability.carpark_number === cp.car_park_no
    );
    if (!availability) return "No data";

    let availabilityString = "";
    availability.carpark_info.forEach((cpInfo) => {
      if (!CarparkLotTypes.includes(cpInfo.lot_type as CarparkLotType)) {
        console.error("Unknown carpark lot type: ", cpInfo.lot_type);
        return;
      }
      const lotTypeLabel = LotTypeToLabelMap[cpInfo.lot_type as CarparkLotType];

      availabilityString += `${lotTypeLabel}: ${cpInfo.lots_available}/${cpInfo.total_lots} `;
    });
    return availabilityString;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        Carpark Checker
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <form onSubmit={(e) => handleSearch(e)}>
          <TextField
            onSubmit={(e) => e.preventDefault()}
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" disabled={loading.isLoading}>
            Search
          </Button>
        </form>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          style={{ margin: "5px" }}
          onClick={handlePrevPage}
          disabled={loading.isLoading || params.offset === 0}
          variant="outlined"
        >
          Prev
        </Button>
        <Button
          style={{ margin: "5px" }}
          onClick={handleNextPage}
          disabled={loading.isLoading || params.offset + 15 >= totalCarparks}
          variant="outlined"
        >
          Next
        </Button>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {loading.isLoading ? (
          <>{loading.resource}</>
        ) : (
          <p>
            Showing {params.offset + 1} -{" "}
            {params.offset + searchedCarparks.length} of {totalCarparks ?? 0}
          </p>
        )}
      </div>
      <Grid container justifyContent="center" spacing={2}>
        {searchedCarparks.map((cp, i) => (
          <Grid
            key={"" + cp.car_park_no + i}
            container
            item
            xs={12}
            justifyContent="center"
          >
            <Card
              style={{
                width: "500px",
                maxWidth: "80vw",
                height: "100%",
                padding: "1vw",
                backgroundColor: "#f5f5f5",
              }}
            >
              <Grid item xs={12}>
                <p style={{ textDecoration: "underline" }}>{cp.address}</p>
              </Grid>
              <Grid container item>
                <Grid xs={12}>
                  <p>Carpark number: {cp.car_park_no}</p>
                </Grid>
                <Grid xs={12}>
                  <p>Carpark type: {cp.car_park_type}</p>
                </Grid>
                <Grid xs={12}>
                  <p>Availability: {getAvailabilityString(cp)}</p>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Home;

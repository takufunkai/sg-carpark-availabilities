import { Button, Card, CircularProgress, Grid, TextField } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { CarparkAvailability, CarparkView } from "../types/carpark";
import { HDBCarparkInformationParams } from "../types/hdb";
import {
  fetchAndPopulateDatabase,
  getLastUpdated,
  getCarparks,
  getHdbCarparksAvailability,
  getUraCarparksAvailability,
  getUraToken,
} from "../utils/api";

const initialValues = {
  HDBCarparkInformationParams: {
    q: "",
    limit: 15,
    offset: 0,
  },
};

interface AvailabilityHashMap {
  [carparkNumber: string]: CarparkAvailability[];
}

export const getStaticProps = async () => {
  let availabilities: AvailabilityHashMap = {};

  try {
    const hdbCarparkAvailability = await getHdbCarparksAvailability();
    hdbCarparkAvailability.reduce((map, obj) => {
      const availabilities: CarparkAvailability[] = obj.carpark_info.map(
        (info) => ({
          lotType: info.lot_type,
          lotsAvailable: info.lots_available,
          totalLots: info.total_lots,
        })
      );
      if (map[obj.carpark_number]) {
        map[obj.carpark_number] = [
          ...map[obj.carpark_number],
          ...availabilities,
        ];
      } else {
        map[obj.carpark_number] = availabilities;
      }
      return map;
    }, availabilities as Record<string, CarparkAvailability[]>);

    const uraToken = await getUraToken(process.env.uraAccessKey!);
    const uraCarparkAvailability = await getUraCarparksAvailability(
      process.env.uraAccessKey!,
      uraToken
    );
    uraCarparkAvailability.reduce((map, obj) => {
      const availability = {
        lotType: obj.lotType,
        lotsAvailable: obj.lotsAvailable,
      };
      if (map[obj.carparkNo]) {
        map[obj.carparkNo] = [...map[obj.carparkNo], availability];
      } else {
        map[obj.carparkNo] = [availability];
      }
      return map;
    }, availabilities as Record<string, CarparkAvailability[]>);
  } catch (e) {
    console.error(e);
  }
  return {
    props: { availabilities },
    revalidate: 30,
  };
};

interface HomeProps {
  availabilities: AvailabilityHashMap;
}

const Home: React.FC<HomeProps> = ({ availabilities }) => {
  const [params, setParams] = useState<HDBCarparkInformationParams>(
    initialValues.HDBCarparkInformationParams
  );
  const [carparks, setCarparks] = useState<CarparkView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAndSetCarparks = React.useCallback(async () => {
    setLoading(true);
    try {
      const lastUpdated = await getLastUpdated();
      if (dayjs().isAfter(dayjs(lastUpdated), "day")) {
        await fetchAndPopulateDatabase();
      }
      const result = await getCarparks();
      const resultWithAvailability = result.map((cp) => ({
        ...cp,
        availability: availabilities[cp.carparkNumber] ?? [],
      }));
      setCarparks(resultWithAvailability);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [availabilities]);

  useEffect(() => {
    fetchAndSetCarparks();
  }, []);

  const filteredCarparks = carparks.filter((carpark) => {
    const searchParams = (params.q as string).split(" ");
    return searchParams.reduce(
      (prev, curr) =>
        prev && carpark.address.toLowerCase().includes(curr.toLowerCase()),
      true as boolean
    );
  });
  const filteredPaginatedCarparks = filteredCarparks.slice(
    params.offset,
    params.offset + params.limit
  );

  useEffect(() => setParams({ ...params, offset: 0 }), [params.q]);

  const handleNextPage = () => {
    if (params.offset + 15 >= filteredCarparks.length) return;
    setParams({ ...params, offset: params.offset + 15 });
  };

  const handlePrevPage = () => {
    if (params.offset === 0) return;
    setParams({ ...params, offset: params.offset - 15 });
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
        <TextField
          onSubmit={(e) => e.preventDefault()}
          size="small"
          value={params.q}
          onChange={(e) => setParams({ ...params, q: e.target.value })}
        />
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
          disabled={params.offset === 0}
          variant="outlined"
        >
          Prev
        </Button>
        <Button
          style={{ margin: "5px" }}
          onClick={handleNextPage}
          disabled={params.offset + 15 >= filteredCarparks.length}
          variant="outlined"
        >
          Next
        </Button>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <p>
          Showing {filteredPaginatedCarparks.length > 0 ? params.offset + 1 : 0}{" "}
          - {params.offset + filteredPaginatedCarparks.length} of{" "}
          {filteredCarparks.length ?? 0}
        </p>
      </div>
      {loading && (
        <div style={{ textAlign: "center" }}>
          <CircularProgress />
          <p>Loading carparks...</p>
        </div>
      )}
      <Grid container justifyContent="center" spacing={2}>
        {filteredPaginatedCarparks.map((cp, i) => (
          <Grid
            key={"" + cp.carparkNumber + i}
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
              <p style={{ textDecoration: "underline" }}>{cp.address}</p>
              <p>Carpark number: {cp.carparkNumber}</p>
              <p>Availabilities</p>
              {cp.availability.map((avail) => (
                <li key={avail.lotType}>
                  {avail.lotType}: {avail.lotsAvailable}/
                  {cp.capacity ?? avail.totalLots ?? ""}
                </li>
              ))}
              <p>Coordinates:</p>
              {cp.coordinates?.map((coords) => (
                <li>
                  x: {coords.xCoord}, y: {coords.yCoord}
                </li>
              ))}
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Home;

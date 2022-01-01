import { Button, Card, CircularProgress, Grid, TextField } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { CarparkView } from "../types/carpark";
import { HDBCarparkInformationParams } from "../types/hdb";
import {
  fetchAndPopulateDatabase,
  getLastUpdated,
  getCarparks,
} from "../utils/api";

const initialValues = {
  HDBCarparkInformationParams: {
    q: "",
    limit: 15,
    offset: 0,
  },
};

const Home: React.FC = () => {
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
      setCarparks(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAndSetCarparks();
  }, []);

  const filteredCarparks = carparks.filter((carpark) =>
    carpark.address.toLowerCase().includes((params.q as string).toLowerCase())
  );
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
        <div
          style={{
            textAlign: "center",
          }}
        >
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
              {cp.availability.map((avail) => (
                <p>
                  {avail.lotType}: {avail.lotsAvailable}/{avail.totalLots}
                </p>
              ))}
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Home;

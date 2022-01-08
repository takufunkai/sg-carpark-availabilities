import { TextField, Button, CircularProgress, Grid, Card } from "@mui/material";
import { useEffect, useState } from "react";
import { CarparkView } from "../../types/carpark";
import { HDBCarparkInformationParams } from "../../types/hdb";
import { measureDistance } from "../../utils/helper";
import { useStore } from "../../utils/store";
import styles from "./Carpark.module.scss";

const initialValues = {
  HDBCarparkInformationParams: {
    q: "",
    limit: 15,
    offset: 0,
  },
};

const Carparks = () => {
  const { filterCarparks, filteredCarparks, setCenter, currentLocation } =
    useStore((state) => ({
      filterCarparks: state.filterCarparks,
      filteredCarparks: state.filteredCarparks,
      setCenter: state.setCenter,
      currentLocation: state.currentLocation,
    }));
  const [params, setParams] = useState<HDBCarparkInformationParams>(
    initialValues.HDBCarparkInformationParams
  );
  const [mode, setMode] = useState<"all" | "nearby">("all");

  const allFilter = (carpark: CarparkView) => {
    const searchParams = (params.q as string).split(" ");
    return searchParams.reduce(
      (prev, curr) =>
        prev && carpark.address.toLowerCase().includes(curr.toLowerCase()),
      true as boolean
    );
  };

  const nearbyFilter = (carpark: CarparkView) => {
    const searchParams = (params.q as string).split(" ");
    if (!carpark.latLon || !carpark.latLon[0]) return false;
    if (measureDistance(carpark.latLon[0], currentLocation) > 1000) {
      return false;
    }
    return searchParams.reduce(
      (prev, curr) =>
        prev && carpark.address.toLowerCase().includes(curr.toLowerCase()),
      true as boolean
    );
  };

  useEffect(() => {
    filterCarparks(mode === "all" ? allFilter : nearbyFilter);
    setParams({ ...params, offset: 0 });
  }, [params.q, mode]);

  const filteredPaginatedCarparks = filteredCarparks.slice(
    params.offset,
    params.offset + params.limit
  );

  const handleNextPage = () => {
    if (params.offset + 15 >= filteredCarparks.length) return;
    setParams({ ...params, offset: params.offset + 15 });
  };

  const handlePrevPage = () => {
    if (params.offset === 0) return;
    setParams({ ...params, offset: params.offset - 15 });
  };

  const handleClickAddress = (carpark: CarparkView) => () => {
    if (carpark.latLon) {
      setCenter(carpark.latLon[0]);
    }
  };

  return (
    <>
      <div className={styles.textFieldDiv}>
        <TextField
          className={styles.textField}
          onSubmit={(e) => e.preventDefault()}
          size="small"
          value={params.q}
          onChange={(e) => setParams({ ...params, q: e.target.value })}
        />
      </div>
      <div className={styles.scrollPageButtonsDiv}>
        <Button
          className={styles.button}
          onClick={handlePrevPage}
          disabled={params.offset === 0}
          variant="outlined"
        >
          Prev
        </Button>
        <Button
          className={styles.button}
          onClick={handleNextPage}
          disabled={params.offset + 15 >= filteredCarparks.length}
          variant="outlined"
        >
          Next
        </Button>
      </div>
      <div className={styles.metaDiv}>
        <p>
          Showing {filteredPaginatedCarparks.length > 0 ? params.offset + 1 : 0}{" "}
          - {params.offset + filteredPaginatedCarparks.length} of{" "}
          {filteredCarparks.length ?? 0}
        </p>
      </div>
      <div className={styles.setModeDiv}>
        <p className={styles.setModeText} onClick={() => setMode("all")}>
          ALL CARPARKS
        </p>
        <p className={styles.setModeText} onClick={() => setMode("nearby")}>
          NEARBY CARPARKS
        </p>
      </div>
      <Grid className={styles.listContainer} container spacing={2}>
        {filteredPaginatedCarparks.map((cp, i) => (
          <Grid
            key={"" + cp.carparkNumber + i}
            container
            item
            xs={12}
            justifyContent="center"
          >
            <Card className={styles.carparkCard}>
              <p className={styles.address} onClick={handleClickAddress(cp)}>
                {cp.address}
              </p>
              <p>Availabilities:</p>
              {cp.availability.map((avail) => (
                <li key={avail.lotType}>
                  {avail.lotType}: {avail.lotsAvailable}/
                  {avail.totalLots ?? cp.capacity}
                </li>
              ))}
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Carparks;

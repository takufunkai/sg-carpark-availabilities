import { Paper } from "@mui/material";
import Carparks from "./Carparks";
import styles from "./index.module.scss";

const Sidebar = () => {
  return (
    <Paper elevation={10} className={styles.container}>
      <Carparks />
    </Paper>
  );
};

export default Sidebar;

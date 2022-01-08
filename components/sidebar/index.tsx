import { Fab, Paper } from "@mui/material";
import { useState } from "react";
import Carparks from "./Carparks";
import styles from "./index.module.scss";
import MenuIcon from "@mui/icons-material/Menu";

const Sidebar = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  return (
    <>
      <Fab
        className={styles.showButton}
        color={showSidebar ? "primary" : undefined}
        size="small"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <MenuIcon />
      </Fab>
      {showSidebar && (
        <Paper elevation={10} className={styles.container}>
          <Carparks />
        </Paper>
      )}
    </>
  );
};

export default Sidebar;

import React from "react";
import { AppBar, Box, Button, Toolbar, Typography, IconButton } from "@mui/material";
import logo from "../images/logo.png";

function NavBar({ connectWallet }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="logo">
          <img src={logo} alt="Logo" style={{ height: "40px", width: "auto" }} />
        </IconButton>
        <Button color="inherit" href="https://path/to/documentation/page">
          Documentation
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          View/Claim Holdings
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="inherit" onClick={() => console.log("Chain functionality")}>
          Chain
        </Button>
        <Button color="inherit" onClick={connectWallet}>
          Connect
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;

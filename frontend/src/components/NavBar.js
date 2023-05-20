import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import logo from "../images/logo.png";
import "../App.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTheme } from '@mui/system';

function NavBar({ onDeveloperModeChange }) {
  const [developerMode, setDeveloperMode] = useState(false);
  const theme = useTheme();

  const handleDeveloperModeChange = (event) => {
    setDeveloperMode(event.target.checked);
    onDeveloperModeChange(event.target.checked);
  };

  return (
    <AppBar position="static" sx={{ background: theme.palette.background.default }} elevation={0}>
      <Toolbar
        sx={{ minHeight: "90px", display: "flex", alignItems: "flex-end" }}
      >
        <IconButton edge="start" color="inherit" aria-label="logo">
          <img
            src={logo}
            alt="Logo"
            style={{ height: "40px", width: "auto" }}
          />
        </IconButton>
        <Button
          color="secondary"
          href="https://lila-finance.gitbook.io/lila-documentation/"
        >
          Documentation
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {/* <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: "#9c88ff",
          }}
        >
          View/Claim Holdings
        </Typography> */}
        <Box sx={{ flexGrow: 1 }} />
        <ConnectButton />
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;

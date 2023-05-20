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
import MenuBookIcon from '@mui/icons-material/MenuBook';

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
        <IconButton className="mr-3" edge="start" color="inherit" aria-label="logo">
          <img
            src={logo}
            alt="Logo"
            style={{ height: "40px", width: "auto" }}
          />
        </IconButton>
        <Button
          color="secondary"
          variant="outlined"
          href="https://lila-finance.gitbook.io/lila-documentation/"
          startIcon={<MenuBookIcon />}
        >
          Documentation
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ flexGrow: 1 }} />
        <ConnectButton />
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;

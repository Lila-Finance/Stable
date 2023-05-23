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
import Link from '@mui/material/Link';
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

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
          sx={{
            '&:hover': {
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
            },
          }}
          target="_blank"
          rel="noreferrer noopener"
        >
          Documentation
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ flexGrow: 1 }} />
        <Link className="mr-2" href="https://twitter.com/LilaFinance" color="inherit" target="_blank" rel="noreferrer noopener">
          <IconButton 
            color="secondary"
            sx={{
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <FaTwitter />
          </IconButton>
        </Link>
        <Link className="mr-3" href="https://discord.gg/y2xzVcSuCq" color="inherit" target="_blank" rel="noreferrer noopener">
          <IconButton 
            color="secondary"
            sx={{
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <FaDiscord />
          </IconButton>
        </Link>
        <ConnectButton />
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;

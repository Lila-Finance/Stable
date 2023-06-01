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
  Menu,
  MenuItem
} from "@mui/material";
import logo from "../images/logo.png";
import "../App.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTheme } from '@mui/system';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Link from '@mui/material/Link';
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import MoreVertIcon from '@mui/icons-material/MoreVert'; // import for the dropdown icon
import { Link as RouterLink } from 'react-router-dom';


function NavBar({ onDeveloperModeChange }) {
  const [developerMode, setDeveloperMode] = useState(false);
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null); // this state is for the dropdown menu
  const open = Boolean(anchorEl);

  const handleDeveloperModeChange = (event) => {
    setDeveloperMode(event.target.checked);
    onDeveloperModeChange(event.target.checked);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ background: 'transparent' }} elevation={0}>
      <Toolbar
        sx={{ minHeight: "90px", display: "flex", alignItems: "flex-end" }}
      >
        <div className="logo-text">LILA Finance</div>
        <Button component={RouterLink} to="/earn" sx={{color: `rgba(76, 76, 81, 1)`}}>Earn</Button>
        <Button component={RouterLink} to="/positions" sx={{color: `rgba(76, 76, 81, 1)`}}>Positions</Button>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          sx={{
            color: `rgba(76, 76, 81, 1)`,
            '&:hover': {
              color: theme.palette.primary.main,
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleClose}>
            <Link underline="none" href="https://lila-finance.gitbook.io/lila-documentation/" color="inherit" target="_blank" rel="noreferrer noopener">
              Documentation
            </Link>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Link underline="none" href="https://twitter.com/LilaFinance" color="inherit" target="_blank" rel="noreferrer noopener">
              Twitter
            </Link>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Link underline="none" href="https://discord.gg/y2xzVcSuCq" color="inherit" target="_blank" rel="noreferrer noopener">
              Discord
            </Link>
          </MenuItem>
        </Menu>
        <Box sx={{ flexGrow: 1 }} />
        <ConnectButton />
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;

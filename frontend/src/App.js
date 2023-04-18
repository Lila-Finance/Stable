import React, { useState } from "react";
import { ethers } from "ethers";
import SupplyFixed from "./components/SupplyFixed";
import SupplyVariable from "./components/SupplyVariable";
import FixedNFTs from "./components/FixedNFTs";
import VariableNFTs from "./components/VariableNFTs";
import FundFixed from "./components/FundFixed";
import FundVariable from "./components/FundVariable";
import FixedNFTData from "./components/FixedNFTData";
import VariableNFTData from "./components/VariableNFTData";
import NavBar from "./components/NavBar";
import { Box, Container, Grid, Typography, CssBaseline, createTheme, ThemeProvider, Card, CardContent } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: '#9c88ff', // #D3BAFB
    },
    secondary: {
      main: '#e6d7ff',
    },
    background: {
      default: '#f8f9fa',
    },
  },
});

function App() {
  const [web3Provider, setWeb3Provider] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setWeb3Provider(web3Provider);

        const accounts = await web3Provider.listAccounts();
        setSelectedAddress(accounts[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar connectWallet={connectWallet} />
      <Container>
        <Box mt={10} mb={6}>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            The platform that allows you to choose <span className="gradient-text">FIXED</span> or <span className="gradient-text">VARIABLE</span> yields
          </Typography>
        </Box>
        <Grid container spacing={5} sx={{ marginBottom: "200px" }}>
          <Grid item xs={12}>
            <Box marginBottom={7}>
              <Box display="flex" alignItems="center" marginBottom={1}>
                <AccountBalanceWalletIcon sx={{ marginRight: 1 }} />
                <Typography variant="h6">
                  Provider: {web3Provider && web3Provider.provider.chainId}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <AccountCircleIcon sx={{ marginRight: 1}} />
                <Typography variant="h6">
                  User address: {selectedAddress}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid container spacing={5}>
          <Grid item xs={6}>
            <Card sx={{ boxShadow: '0 0 100px 5px rgba(156, 136, 255, 0.5)' }}>
              <CardContent>
                <Box marginBottom={5}>
                  <FixedNFTData address={selectedAddress} />
                </Box>
                <Box marginBottom={5}>
                  <SupplyFixed address={selectedAddress} />
                </Box>
                <FixedNFTs address={selectedAddress} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ boxShadow: '0 0 100px 5px rgba(156, 136, 255, 0.5)' }}>
              <CardContent>
                <Box marginBottom={5}>
                  <VariableNFTData address={selectedAddress} />
                </Box>
                <Box marginBottom={5}>
                  <SupplyVariable address={selectedAddress} />
                </Box>
                <VariableNFTs address={selectedAddress} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
          {/* <Grid item xs={6}>
            <FundFixed address={selectedAddress} />
          </Grid>
          <Grid item xs={6}>
            <FundVariable address={selectedAddress} />
          </Grid> */}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;

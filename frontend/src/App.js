import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import NavBar from "./components/NavBar";
import PoolCard from "./components/PoolCard";
import FixedNFTs from "./components/FixedNFTs";
import VariableNFTs from "./components/VariableNFTs";
import PoolManagement from "./components/PoolManagement";
import {
  Container,
  Grid,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import "./App.css";
import { useAccount } from "wagmi";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";


const theme = createTheme({
  palette: {
    primary: {
      main: "#9c88ff",
    },
    secondary: {
      main: "#e6d7ff",
    },
    background: {
      default: "#FFFDFF",
    },
  },
});

function App() {
  const [numPools, setNumPools] = useState(2);
  const [developerMode, setDeveloperMode] = useState(false);
  const { address } = useAccount();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline
        sx={{
          'body': {
            backgroundImage: `linear-gradient(0deg, rgba(235, 239, 255, 1) 20.833335500350913%, rgba(255, 253, 255, 1) 100.00000266372291%)`,
          },
        }}
      />
      <Alert
        variant="outlined"
        severity="info"
        sx={{
          borderColor: "transparent",
          "& .MuiAlert-icon": {
            color: "#9c88ff",
          },
          color: "#9c88ff",
        }}
      >
        <AlertTitle>Welcome to our alpha stage app!</AlertTitle>
        Your positions are minted as NFTs, and this app is currently on the
        Polygon mainnet and yield is generated through Aave. You need DAI on
        Polygon to test this app.
      </Alert>
      <NavBar onDeveloperModeChange={setDeveloperMode} />
      <Container>
          <Grid container spacing={7} justifyContent="center" alignItems="center" mt={4}>
            <Grid item xs={4}>
              <PoolCard 
                status={"expired"} 
                address={address}
                numPools={numPools}
                poolNum={0}
              />
            </Grid>
            <Grid item xs={4}>
              <PoolCard 
                status={"inprogress"} 
                address={address}
                numPools={numPools}
                poolNum={1}
              />
            </Grid>
            <Grid item xs={4}>
              <PoolCard 
                status={"done"} 
                address={address}
                numPools={numPools}
                poolNum={2}
              />
            </Grid>
          </Grid>
        {/* 
            <Grid container spacing={5}>
              <FixedNFTs
                address={address}
                rate={fixedRate}
                fixedNFTContract={fixedNFTContract}
                poolContract={poolContract}
                refreshKey={refreshKey}
              />
              <VariableNFTs
                address={address}
                rate={variableRate}
                variableNFTContract={variableNFTContract}
                poolContract={poolContract}
                refreshKey={refreshKey}
              />
            </Grid>
        )*/}
      </Container>
    </ThemeProvider>
  );
}

export default App;

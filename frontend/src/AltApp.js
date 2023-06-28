import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import NavBar from "./components/NavBar";
import AltCard from "./components/AltCard";
import "./App.css";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAccount } from "wagmi";
import poolDeployerAbi from "./abi/PoolDeployer.json";
import { useContractReads, useContractRead } from "wagmi";
import addresses from "./addresses/addresses.json";
import PoolCard from "./components/PoolCard"
import Positions from "./Positions"
// import displayPositions from "./Positions"

const poolDeployerContract = {
  abi: poolDeployerAbi.abi,
  address: addresses.POOL_DEPLOYER_ADDRESS,
};

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

function AltApp() {
  const [numPools, setNumPools] = useState(1);
  const { address } = useAccount();

  const { data } = useContractRead({
    ...poolDeployerContract,
    functionName: "getPoolLength",
    args: [],
  });
  const earn = () => (
    <Container>
      <Grid
        container
        spacing={7}
        justifyContent="center"
        alignItems="center"
        mt={4}
      >
        <Grid item xs={12} md={4}>
          <PoolCard
            status={"expired"}
            address={address}
            numPools={numPools}
            poolNum={0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PoolCard
            status={"inprogress"}
            address={address}
            numPools={numPools}
            poolNum={1}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PoolCard
            status={"done"}
            address={address}
            numPools={numPools}
            poolNum={2}
          />
        </Grid>
      </Grid>
    </Container>
  );

  const alt = () => (
    <Container>
      <Grid
        container
        spacing={7}
        justifyContent="center"
        alignItems="center"
        mt={4}
      >
        <Grid item xs={12} md={4}>
          <AltCard
            status={"expired"}
            poolNum={data ? 0 % parseInt(data) : null}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AltCard
            status={"inprogress"}
            poolNum={data ? 1 % parseInt(data) : null}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AltCard status={"done"} poolNum={data ? 2 % parseInt(data) : null} />
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <ThemeProvider theme={theme}>
      <Router>
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
          Use a browser with a wallet provider to access the full app.
        </Alert>
        <NavBar />
        <Routes>
          <Route path="/" element={alt()} />
          <Route path="/earn" element={earn()} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/alt" element={alt()} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default AltApp;

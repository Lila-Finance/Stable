import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import FixedNFTs from "./components/FixedNFTs";
import SupplyFixed from "./components/SupplyFixed";
import FixedNFTData from "./components/FixedNFTData";
import { poolDeployerContract } from "./components/Provider";
import SupplyVariable from "./components/SupplyVariable";
import VariableNFTs from "./components/VariableNFTs";
import VariableNFTData from "./components/VariableNFTData";
import NavBar from "./components/NavBar";
import CreatePool from "./components/CreatePool";
import DeletePool from "./components/DeletePool";
import FastForward from "./components/FastForward";
import PoolManagement from "./components/PoolManagement";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  CssBaseline,
  createTheme,
  ThemeProvider,
  Card,
  CardContent,
  Link,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import "./App.css";
import FixedNFTAbi from "./abi/FixedNFT.json";
import VariableNFTAbi from "./abi/VariableNFT.json";
import PoolAbi from "./abi/Pool.json";
import { useAccount } from "wagmi";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';

const poolAbi = PoolAbi.abi;
const fixedNFTAbi = FixedNFTAbi.abi;
const variableNFTAbi = VariableNFTAbi.abi;

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const theme = createTheme({
  palette: {
    primary: {
      main: "#9c88ff",
    },
    secondary: {
      main: "#e6d7ff",
    },
    background: {
      default: "#04070E",
    },
  },
});

/*const FixedNFT = await ethers.getContractFactory("FixedNFT");
const VariableNFT = await ethers.getContractFactory("VariableNFT");
const Pool = await ethers.getContractFactory("Pool");*/

function App() {
  const [fixedRate, setFixedRate] = useState(ethers.BigNumber.from("0"));
  const [variableRate, setVariableRate] = useState(ethers.BigNumber.from("0"));
  const [timeSinceStart, setTimeSinceStart] = useState(0);
  const [lockDuration, setLockDuration] = useState(0);
  const [poolContract, setPoolContract] = useState(null);
  const [fixedNFTContract, setFixedNFTContract] = useState(null);
  const [variableNFTContract, setVariableNFTContract] = useState(null);
  const [numPools, setNumPools] = useState(3);
  const [poolNum, setPoolNum] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [developerMode, setDeveloperMode] = useState(false);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [loading, setLoading] = useState(false);


  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  //effect when address changes
  useEffect(() => {
    async function setPool() {
      if (numPools > 0) {
        const poolInfo = await poolDeployerContract.pools(poolNum % numPools);
        const poolContract = new ethers.Contract(poolInfo, poolAbi, signer);
        const fixedNFTContract = new ethers.Contract(
          await poolContract.fixedNFT(),
          fixedNFTAbi,
          signer
        );
        const variableNFTContract = new ethers.Contract(
          await poolContract.variableNFT(),
          variableNFTAbi,
          signer
        );
        setPoolContract(poolContract);
        setFixedNFTContract(fixedNFTContract);
        setVariableNFTContract(variableNFTContract);
      }
      //const pools = await poolDeployerContract.getPools();
    }
    if (address) {
      setPool();
    }
  }, [poolNum, address]);

  useEffect(() => {
    async function setRate() {
      const rates = await poolContract.interests();
      const lockDuration = await poolContract.lockDuration();
      const secondsInADay = 86400;
      const lockDurationInDays = lockDuration.div(secondsInADay);

      setLockDuration(`${lockDurationInDays.toString()} days`);
      const timeSinceStart = await poolContract.timeSinceStart();
      const timeSinceStartInDays = timeSinceStart.div(secondsInADay);
      setTimeSinceStart(`${timeSinceStartInDays.toString()} days`);

      setFixedRate(rates[0]);
      setVariableRate(rates[1]);
    }
    if (poolContract) {
      setRate();
    }
  }, [poolContract, refreshKey]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Alert
        variant="outlined"
        severity="info"
        sx={{
          borderColor: 'transparent',
          '& .MuiAlert-icon': {
            color: '#9c88ff',
          },
          color: '#9c88ff',
        }}
      >
        <AlertTitle>Welcome to our alpha stage app!</AlertTitle>
        Your positions are minted as NFTs, and
        this app is currently on the Polygon mainnet. Yield is generated
        through Aave with varying rates. You need DAI on Polygon to test this
        app.
      </Alert>
      <NavBar onDeveloperModeChange={setDeveloperMode} />
      <Container>
        <Box mt={10} mb={9}>
          <Typography
            variant="h2"
            component="div"
            align="center"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            Interest Rate Swap
          </Typography>
        </Box>
        {poolContract ? (
          <Box position="relative">
            <PoolManagement
              poolContract={poolContract}
              timeSinceStart={timeSinceStart}
              lockDuration={lockDuration}
              numPools={numPools}
              setPoolNum={setPoolNum}
              poolNum={poolNum}
              handleRefresh={handleRefresh}
              setIsLoading={setLoading}
            />
            <Grid container spacing={5}>
              <Grid item xs={6}>
                <FixedNFTData
                  poolContract={poolContract}
                  rate={fixedRate}
                  refreshKey={refreshKey}
                />
                <Card
                  className="mb-4"
                  sx={{ backgroundColor: "#40386b" }}
                >
                  <CardContent>
                    <SupplyFixed
                      address={address}
                      poolContract={poolContract}
                    />
                  </CardContent>
                </Card>
                <Card
                  className="mb-4"
                  sx={{ backgroundColor: "#40386b" }}
                >
                  <CardContent>
                      <FixedNFTs
                        address={address}
                        rate={fixedRate}
                        fixedNFTContract={fixedNFTContract}
                        poolContract={poolContract}
                        refreshKey={refreshKey}
                      />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <VariableNFTData
                  poolContract={poolContract}
                  rate={variableRate}
                  refreshKey={refreshKey}
                />
                <Card
                  className="mb-4"
                  sx={{ backgroundColor: "#40386b" }}
                >
                  <CardContent>
                      <SupplyVariable
                        address={address}
                        poolContract={poolContract}
                      />
                  </CardContent>
                </Card>
                <Card
                  className="mb-4"
                  sx={{ backgroundColor: "#40386b" }}
                >
                  <CardContent>
                      <VariableNFTs
                        address={address}
                        rate={variableRate}
                        variableNFTContract={variableNFTContract}
                        poolContract={poolContract}
                        refreshKey={refreshKey}
                      />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {loading && (
              <Box 
                position="absolute"
                top={0} right={0} bottom={0} left={0}
                bgcolor="rgba(0,0,0,0.5)"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <CircularProgress color="primary" />
              </Box>
            )}
          </Box>
        ) : (
          <Container>
            <Box mt={10} mb={6}>
              <Typography
                variant="h4"
                component="div"
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  marginTop: 2,
                  marginBottom: 2,
                }}
              >
                Please Connect Wallet
              </Typography>
            </Box>
          </Container>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;

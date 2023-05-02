import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import FixedNFTs from "./components/FixedNFTs";
import SupplyFixed from "./components/SupplyFixed";
import FixedNFTData from "./components/FixedNFTData";
import Faucet from "./components/Faucet";
import { poolDeployerContract, tokenContract } from "./components/Provider";
import SupplyVariable from "./components/SupplyVariable";
import VariableNFTs from "./components/VariableNFTs";
import VariableNFTData from "./components/VariableNFTData";
import NavBar from "./components/NavBar";
import CreatePool from "./components/CreatePool";
import DeletePool from "./components/DeletePool";
import FastForward from "./components/FastForward";
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

const poolAbi = PoolAbi.abi;
const fixedNFTAbi = FixedNFTAbi.abi;
const variableNFTAbi = VariableNFTAbi.abi;

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const theme = createTheme({
  palette: {
    primary: {
      main: "#9c88ff", // #D3BAFB
    },
    secondary: {
      main: "#e6d7ff",
    },
    background: {
      default: "#f8f9fa",
    },
  },
});

/*const FixedNFT = await ethers.getContractFactory("FixedNFT");
const VariableNFT = await ethers.getContractFactory("VariableNFT");
const Pool = await ethers.getContractFactory("Pool");*/

function App() {
  const [web3Provider, setWeb3Provider] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [fixedRate, setFixedRate] = useState(ethers.BigNumber.from("0"));
  const [variableRate, setVariableRate] = useState(ethers.BigNumber.from("0"));
  const [timeSinceStart, setTimeSinceStart] = useState(0);
  const [lockDuration, setLockDuration] = useState(0);
  const [poolContract, setPoolContract] = useState(null);
  const [fixedNFTContract, setFixedNFTContract] = useState(null);
  const [variableNFTContract, setVariableNFTContract] = useState(null);
  const [numPools, setNumPools] = useState(0);
  const [poolNum, setPoolNum] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        // Request user to connect their MetaMask wallet
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        // Set the selected address to the currently active account
        const selectedAccount = accounts[0];
        setSelectedAddress(selectedAccount);

        // Create a Web3Provider instance and set it to the state
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setWeb3Provider(provider);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  //effect when selectedAddress changes
  useEffect(() => {
    async function setPool() {
      const numPools = (await poolDeployerContract.getPoolLength()).toNumber();
      setNumPools(numPools);
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
    setPool();
  }, [poolNum]);

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
      <Box
        sx={{
          backgroundColor: "secondary.light",
          borderRadius: 1,
          padding: 2,
          marginBottom: 3,
        }}
      >
        <Typography variant="body1" component="div">
          Welcome to our alpha stage app! Your positions are minted as NFTs, and
          this app is currently on the Sepolia testnet.
        </Typography>
        <br />
        <Typography variant="body1" component="div">
          You will need Sepolia ETH to test, which you can get for free. Follow
          these instructions:
        </Typography>
        <ul>
          <li>
            <Link
              href="https://www.alchemy.com/overviews/how-to-add-sepolia-to-metamask"
              target="_blank"
              rel="noopener noreferrer"
            >
              Connect to Sepolia network
            </Link>
          </li>
          <li>
            <Link
              href="https://sepoliafaucet.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sepolia Eth Faucet
            </Link>
          </li>
        </ul>
      </Box>
      <NavBar connectWallet={connectWallet} />
      <CreatePool />
      <Container>
        <Box mt={10} mb={6}>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            The platform that allows you to choose{" "}
            <span className="gradient-text">FIXED</span> or{" "}
            <span className="gradient-text">VARIABLE</span> yields
          </Typography>
        </Box>
        <Box mb={6}>
          <Box display="flex" alignItems="center" marginBottom={1}>
            <AccountBalanceWalletIcon sx={{ marginRight: 1 }} />
            <Typography variant="h6">
              Provider: {web3Provider && web3Provider.provider.chainId}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <AccountCircleIcon sx={{ marginRight: 1 }} />
            <Typography variant="h6">
              User address: {selectedAddress}
            </Typography>
          </Box>
          <Faucet address={selectedAddress} />
        </Box>
        {poolContract ? (
          <Grid container spacing={5} sx={{ marginBottom: "200px" }}>
            <Grid item xs={12}>
              <Box marginBottom={7}>
                <Box display="flex" alignItems="center">
                  <AccountCircleIcon sx={{ marginRight: 1 }} />
                  <Typography variant="h6">
                    timeSinceStart: {timeSinceStart}, lockDuration:{" "}
                    {lockDuration}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <AccountCircleIcon sx={{ marginRight: 1 }} />
                  <Typography variant="h6">
                    Import Token Contract: {tokenContract.address}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <DeletePool poolContract={poolContract} />
            <FastForward poolContract={poolContract} />
            {numPools > 0 && (
              <Box
                sx={{
                  backgroundColor: "secondary.light",
                  borderRadius: 1,
                  padding: 2,
                }}
              >
                <Typography variant="body1" component="div">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      setPoolNum(poolNum - 1);
                    }}
                  >
                    Prev Pool
                  </Button>
                </Typography>
                <Typography variant="body1" component="div">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      setPoolNum(poolNum + 1);
                    }}
                  >
                    Next Pool
                  </Button>
                </Typography>
              </Box>
            )}
            <Button
              className="refresh-button"
              fullWidth={true}
              variant="contained"
              color="primary"
              size="large"
              onClick={handleRefresh}
            >
              Refresh Contracts
            </Button>
            <Grid container spacing={5}>
              <Grid item xs={6}>
                <Card
                  sx={{ boxShadow: "0 0 100px 5px rgba(156, 136, 255, 0.5)" }}
                >
                  <CardContent>
                    <Box marginBottom={5}>
                      <FixedNFTData
                        poolContract={poolContract}
                        rate={fixedRate}
                        refreshKey={refreshKey}
                      />
                    </Box>
                    <Box marginBottom={5}>
                      <SupplyFixed
                        address={selectedAddress}
                        poolContract={poolContract}
                      />
                    </Box>
                    <FixedNFTs
                      address={selectedAddress}
                      rate={fixedRate}
                      fixedNFTContract={fixedNFTContract}
                      poolContract={poolContract}
                      refreshKey={refreshKey}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{ boxShadow: "0 0 100px 5px rgba(156, 136, 255, 0.5)" }}
                >
                  <CardContent>
                    <Box marginBottom={5}>
                      <VariableNFTData
                        poolContract={poolContract}
                        rate={variableRate}
                        refreshKey={refreshKey}
                      />
                    </Box>
                    <Box marginBottom={5}>
                      <SupplyVariable
                        address={selectedAddress}
                        poolContract={poolContract}
                      />
                    </Box>
                    <VariableNFTs
                      address={selectedAddress}
                      rate={variableRate}
                      variableNFTContract={variableNFTContract}
                      poolContract={poolContract}
                      refreshKey={refreshKey}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Container>
            <Box mt={10} mb={6}>
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  marginTop: 2,
                  marginBottom: 2,
                }}
              >
                No Pools Deployed
              </Typography>
            </Box>
          </Container>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;

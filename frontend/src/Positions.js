import React, { useState , useEffect } from "react";
import { Container, Grid, CircularProgress, Card, CardContent, Typography } from "@mui/material";
import NavBar from "./components/NavBar";
import PositionCard from "./components/PositionCard"
import AltCard from "./components/AltCard"
import PoolCard from "./components/PoolCard"
import DemoPositionCard from "./components/DemoPositionCard"
import "./App.css";
import { useAccount } from "wagmi";
import FixedNFTs from "./components/FixedNFTs";
import VariableNFTs from "./components/VariableNFTs"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { formatEther } from "viem"

const testNFTs = [
  {
    status: 'done',
    address: '0x987654321',
    numPools: 2,
    poolNum: 0,
  },
  {
    status: 'done',
    address: '0x123456789',
    numPools: 3,
    poolNum: 1,
  },
  
  {
    status: 'done',
    address: '0xabcdef123',
    numPools: 5,
    poolNum: 2,
  },
];

const getNFTs = async ({
  address,
  rate,
  poolContract,
  variableNFTContract,
  fixedNFTContract,
  refreshKey,
}) => {
  try {
    const variableNFTCount = await variableNFTContract.balanceOf(address);
    const fixedNFTCount = await fixedNFTContract.balanceOf(address);
    const myNFTs = [];

    for (let i = 0; i < variableNFTCount; i++) {
      const nftId = await variableNFTContract.tokenOfOwnerByIndex(address, i);
      const depositData = await variableNFTContract.getDepositData(nftId);
      const nftIdNumber = nftId.toNumber();
      const interest = await poolContract.calculateInterestVariable(nftIdNumber);
      myNFTs.push({
        tokenId: nftIdNumber,
        value: formatEther(depositData.amount),
        interest: formatEther(interest),
        claim: formatEther(depositData.claim),
      });
    }

    for (let i = 0; i < fixedNFTCount; i++) {
      const nftId = await fixedNFTContract.tokenOfOwnerByIndex(address, i);
      const depositData = await fixedNFTContract.getDepositData(nftId);
      const nftIdNumber = nftId.toNumber();
      const interest = await poolContract.calculateInterestFixed(nftIdNumber);
      myNFTs.push({
        tokenId: nftIdNumber,
        value: formatEther(depositData.amount),
        interest: formatEther(interest),
        claim: formatEther(depositData.claim),
      });
    }

    return myNFTs;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const Positions = ({ address, rate, poolContract, variableNFTContract, fixedNFTContract, refreshKey }) => {
  const [NFTs, setNFTs] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [fixedRate, setFixedRate] = useState(0);
  const [variableRate, setVariableRate] = useState(0);
  const [fixedLimit, setFixedLimit] = useState(0);
  const [variableLimit, setVariableLimit] = useState(0);
  const [fixedSupply, setFixedSupply] = useState(0);
  const [variableSupply, setVariableSupply] = useState(0);

  useEffect(() => {
    async function fetchNFTs() {
      if (variableNFTContract && fixedNFTContract) {
        // Fetch real NFTs using the contracts
        const realNFTs = await /* Fetch real NFTs using the contracts */
        setNFTs(realNFTs);
        setLoading(false);
      } else {
        // Real NFTs are not available, use the testNFTs array
        setNFTs(testNFTs);
        setLoading(false);
      }
    }

    if (address && variableNFTContract && fixedNFTContract) {
      fetchNFTs();
    }

    setNFTs(testNFTs);
    setLoading(false);
  }, [address, variableNFTContract, fixedNFTContract]);

  useEffect(() => {
    async function fetchRates() {
      // Simulating an API call with setTimeout
      setTimeout(() => {
        setFixedRate(5);
        setVariableRate(7);
      }, 2000);
    }

    if (poolContract) {
      fetchRates();
    }
  }, [poolContract]);

  useEffect(() => {
    async function fetchData() {
      // Simulating an API call with setTimeout
      setTimeout(() => {
        setFixedSupply(1000);
        setVariableSupply(2000);
        setFixedLimit(5000);
        setVariableLimit(8000);
      }, 2000);
    }
    fetchData();
  }, []);

  return (
    <Container>
      <h1 style={{ position: 'absolute', left: '35px', top: '100px' }}>Your Positions</h1>
      <Grid container spacing={7} justifyContent="center" alignItems="center" mt={4}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          testNFTs.map((NFT, index) => (
            <Grid item xs={12} md={4} key={index}>
              <DemoPositionCard
                status={NFT.status}
                address={NFT.address}
                numPools={NFT.numPools}
                poolNum={NFT.poolNum}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default Positions;
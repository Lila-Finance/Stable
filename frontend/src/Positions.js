import React, { useState , useEffect } from "react";
import { Container, Grid, CircularProgress, Card, CardContent, Typography } from "@mui/material";
import NavBar from "./components/NavBar";
import PositionCard from "./components/PositionCard"
import "./App.css";
import { useAccount } from "wagmi";
import FixedNFTs from "./components/FixedNFTs";
import VariableNFTs from "./components/VariableNFTs"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Positions = ({ address, rate, poolContract, variableNFTContract, fixedNFTContract, refreshKey }) => {
  const [NFTs, setNFTs] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [fixedRate, setFixedRate] = useState(0);
  const [variableRate, setVariableRate] = useState(0);
  const [fixedLimit, setFixedLimit] = useState(0);
  const [variableLimit, setVariableLimit] = useState(0);
  const [fixedSupply, setFixedSupply] = useState(0);
  const [variableSupply, setVariableSupply] = useState(0);

  const testNFTs = [
    {
      status: 'expired',
      address: '0x123456789',
      numPools: 3,
      poolNum: 1,
    },
    {
      status: 'inprogress',
      address: '0x987654321',
      numPools: 2,
      poolNum: 0,
    },
    {
      status: 'done',
      address: '0xabcdef123',
      numPools: 5,
      poolNum: 2,
    },
  ];

  useEffect(() => {
    async function fetchNFTs() {
      if (variableNFTContract && fixedNFTContract) {
        // Real NFTs are available
        const realNFTs = /* Fetch real NFTs using the contracts */
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
      <h1 style={{ position: 'absolute', left: '35px', top: '120px' }}>Your Positions</h1>

      <Grid container spacing={7} justifyContent="center" alignItems="center" mt={4}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          NFTs.map((NFT, index) => (
            <Grid item xs={12} md={4} key={index}>
              <PositionCard
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

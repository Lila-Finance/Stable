import React, { useState } from "react";
import { Container, Grid, Card, CardContent, Typography } from "@mui/material";
import NavBar from "./components/NavBar";
import PositionCard from "./components/PositionCard"
import "./App.css";
import { useAccount } from "wagmi";
import FixedNFTs from "./components/FixedNFTs";
import VariableNFTs from "./components/VariableNFTs"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TASK_COMPILE_SOLIDITY_LOG_DOWNLOAD_COMPILER_END } from "hardhat/builtin-tasks/task-names";

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

  const [numPools, setNumPools] = useState(2);
  const [developerMode, setDeveloperMode] = useState(false);
  const { address } = useAccount();

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
          value: ethers.utils.formatEther(depositData.amount),
          interest: ethers.utils.formatEther(interest),
          claim: ethers.utils.formatEther(depositData.claim),
        });
      }
  
      for (let i = 0; i < fixedNFTCount; i++) {
        const nftId = await fixedNFTContract.tokenOfOwnerByIndex(address, i);
        const depositData = await fixedNFTContract.getDepositData(nftId);
        const nftIdNumber = nftId.toNumber();
        const interest = await poolContract.calculateInterestFixed(nftIdNumber);
        myNFTs.push({
          tokenId: nftIdNumber,
          value: ethers.utils.formatEther(depositData.amount),
          interest: ethers.utils.formatEther(interest),
          claim: ethers.utils.formatEther(depositData.claim),
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
  
    useEffect(() => {
      async function fetchNFTs() {
        const myNFTs = await getNFTs({
          address,
          rate,
          poolContract,
          variableNFTContract,
          fixedNFTContract,
          refreshKey,
        });
        setNFTs(myNFTs);
      }
  
      if (address && variableNFTContract && fixedNFTContract) {
        fetchNFTs();
      }
    }, [address, variableNFTContract, fixedNFTContract, poolContract, rate, refreshKey]);
  
    return (
      <Container>
        <h1>Your Positions</h1>
        {NFTs.length > 0 && (
          <Grid container spacing={7} justifyContent="center" alignItems="center" mt={4}>
            {NFTs.map((NFT, index) => (
              <Grid item xs={12} md={4} key={index}>
                <PositionCard
                  status={NFT.status}
                  address={NFT.address}
                  numPools={NFT.numPools}
                  poolNum={NFT.poolNum}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );
  };
  

export default Positions;

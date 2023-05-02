import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { sendParams } from "./Provider";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

function FixedNFTs({
  address,
  rate,
  fixedNFTContract,
  poolContract,
  refreshKey,
}) {
  const [fixedNFTs, setFixedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getFixedNFTs() {
      try {
        const nftCount = await fixedNFTContract.balanceOf(address);
        const myFixedNFTs = [];

        for (let i = 0; i < nftCount; i++) {
          const nftId = await fixedNFTContract.tokenOfOwnerByIndex(address, i);
          const depositData = await fixedNFTContract.getDepositData(nftId);
          const nftIdNumber = nftId.toNumber();

          // Calculate the interest using BigNumber multiplication
          const time = await poolContract.timeSinceStart();
          const interest = await poolContract.calculateInterest(
            depositData["amount"],
            rate,
            time
          );
          myFixedNFTs.push({
            tokenId: nftIdNumber,
            value: ethers.utils.formatEther(depositData["amount"]),
            interest: ethers.utils.formatEther(interest),
          });
        }

        setFixedNFTs(myFixedNFTs);
      } catch (err) {
        console.error(err);
      }
    }
    if (address && fixedNFTContract) {
      getFixedNFTs();
    }
  }, [address, fixedNFTContract, poolContract, rate, refreshKey]);

  const redeemFixed = async (tokenId) => {
    try {
      setIsLoading(true);
      await poolContract.withdrawFixed(tokenId, sendParams);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const SampleNFTCard = () => (
    <Card sx={{ mt: 2, mb: 2, backgroundColor: "#e6d7ff" }}>
      <CardContent>
        <Typography>Sample Token ID: 12345</Typography>
        <Typography>Sample Value: 100</Typography>
        <Typography sx={{ marginBottom: 2 }}>Sample Interest: 10</Typography>
        <Button
          className="redeem-button"
          variant="contained"
          color="secondary"
          disabled
        >
          Redeem Fixed
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold">
        My Fixed NFTs
      </Typography>
      {fixedNFTs.map((fixedNFT) => (
        <Card
          key={fixedNFT.tokenId}
          sx={{ mt: 2, mb: 2, backgroundColor: "#e6d7ff" }}
        >
          <CardContent>
            <Typography>Token ID: {fixedNFT.tokenId}</Typography>
            <Typography>Value: {fixedNFT.value}</Typography>
            <Typography sx={{ marginBottom: 2 }}>
              Interest: {fixedNFT.interest}
            </Typography>
            <Button
              className="redeem-button"
              variant="contained"
              color="primary"
              onClick={() => redeemFixed(fixedNFT.tokenId)}
              disabled={isLoading}
            >
              Redeem Fixed
            </Button>
          </CardContent>
        </Card>
      ))}
      {fixedNFTs.length === 0 && <SampleNFTCard />}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}

export default FixedNFTs;

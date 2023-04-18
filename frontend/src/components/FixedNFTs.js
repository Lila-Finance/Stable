import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { fixedNFTContract, aavePoolSupplyWithNFTContract, sendParams } from "./Provider";
import { Typography, Box, Button, Card, CardContent, CircularProgress } from "@mui/material";

function FixedNFTs({ address }) {
  const [fixedNFTs, setFixedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getFixedNFTs() {
      try {
        const filter = fixedNFTContract.filters.Transfer(null, null);
        const transferEvents = await fixedNFTContract.queryFilter(filter);

        let myFixedNFTs = await Promise.all(
          transferEvents
            .filter((event) => event.args.to === address)
            .map(async (event) => {
              const tokenId = event.args.tokenId.toNumber();
              if (tokenId === null) {
                return null;
              }
              try {
                const owner = await fixedNFTContract.ownerOf(tokenId);
                if (owner !== address) {
                  return null;
                }
              } catch (err) {
                return null; // Skip if token does not exist
              }
              const rates = await aavePoolSupplyWithNFTContract.calcFixed(
                tokenId
              );
              return {
                tokenId,
                value: ethers.utils.formatEther(rates[0]),
                interest: ethers.utils.formatEther(rates[1]),
              };
            })
        );
        myFixedNFTs = myFixedNFTs.filter((nft) => nft !== null);

        setFixedNFTs(myFixedNFTs);
      } catch (err) {
        console.error(err);
      }
    }

    getFixedNFTs();
  }, [address]);

  const redeemFixed = async (tokenId) => {
    try {
      setIsLoading(true);
      await aavePoolSupplyWithNFTContract.redeemFixed(tokenId, sendParams);
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
        <Button className="redeem-button" variant="contained" color="secondary" disabled>
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
        <Card key={fixedNFT.tokenId} sx={{ mt: 2, mb: 2, backgroundColor: "#e6d7ff" }}>
          <CardContent>
            <Typography>Token ID: {fixedNFT.tokenId}</Typography>
            <Typography>Value: {fixedNFT.value}</Typography>
            <Typography sx={{ marginBottom: 2 }}>Interest: {fixedNFT.interest}</Typography>
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

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { variableNFTContract, aavePoolSupplyWithNFTContract, sendParams } from "./Provider";
import { Typography, Box, Button, Card, CardContent, CircularProgress } from "@mui/material";

function VariableNFTs({ address }) {
  const [variableNFTs, setVariableNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getVariableNFTs() {
      try {
        const filter = variableNFTContract.filters.Transfer(null, null);
        const transferEvents = await variableNFTContract.queryFilter(filter);

        let myVariableNFTs = await Promise.all(
          transferEvents
            .filter((event) => event.args.to === address)
            .map(async (event) => {
              const tokenId = event.args.tokenId.toNumber();
              try {
                const owner = await variableNFTContract.ownerOf(tokenId);
                if (owner !== address) {
                  return null;
                }
              } catch (err) {
                return null; // Skip if token does not exist
              }
              let rates = await aavePoolSupplyWithNFTContract.calcVariable(
                tokenId
              );
              return {
                tokenId: tokenId,
                value: ethers.utils.formatEther(rates[0]),
                interest: ethers.utils.formatEther(rates[1]),
              };
            })
        );
        myVariableNFTs = myVariableNFTs.filter((nft) => nft !== null);

        setVariableNFTs(myVariableNFTs);
      } catch (err) {
        console.error(err);
      }
    }

    getVariableNFTs();
  }, [address]);

  const redeemVariable = async (tokenId) => {
    try {
      setIsLoading(true);
      await aavePoolSupplyWithNFTContract.redeemVariable(tokenId, sendParams);
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
      <Typography variant="h4" fontWeight="bold">My Variable NFTs</Typography>
      {variableNFTs.map((variableNFT) => (
        <Card key={variableNFT.tokenId} sx={{ mt: 2, mb: 2, backgroundColor: "#e6d7ff" }}>
          <CardContent>
            <Typography>Token ID: {variableNFT.tokenId}</Typography>
            <Typography>Value: {variableNFT.value}</Typography>
            <Typography sx={{ marginBottom: 2 }}>Interest: {variableNFT.interest}</Typography>
            <Button
              className="redeem-button"
              variant="contained"
              color="primary"
              onClick={() => redeemVariable(variableNFT.tokenId)}
            >
              Redeem Variable
            </Button>
          </CardContent>
        </Card>
      ))}
      {variableNFTs.length === 0 && <SampleNFTCard />}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );  
}

export default VariableNFTs;

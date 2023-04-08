import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { variableNFTContract, aavePoolSupplyWithNFTContract, sendParams } from "./Provider";
import { Typography, Box, Button, Card, CardContent } from "@mui/material";

function VariableNFTs({ address }) {
  const [variableNFTs, setVariableNFTs] = useState([]);

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
      await aavePoolSupplyWithNFTContract.redeemVariable(tokenId, sendParams);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold">My Variable NFTs</Typography>
      {variableNFTs.map((variableNFT) => (
        <Card key={variableNFT.tokenId} sx={{ mb: 2 }}>
          <CardContent>
            <Typography>Token ID: {variableNFT.tokenId}</Typography>
            <Typography>Value: {variableNFT.value}</Typography>
            <Typography>Interest: {variableNFT.interest}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => redeemVariable(variableNFT.tokenId)}
            >
              Redeem Variable
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );  
}

export default VariableNFTs;

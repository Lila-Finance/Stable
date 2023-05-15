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

function VariableNFTs({
  address,
  rate,
  poolContract,
  variableNFTContract,
  refreshKey,
}) {
  const [variableNFTs, setVariableNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getVariableNFTs() {
      try {
        const nftCount = await variableNFTContract.balanceOf(address);
        const myVariableNFTs = [];

        for (let i = 0; i < nftCount; i++) {
          const nftId = await variableNFTContract.tokenOfOwnerByIndex(
            address,
            i
          );
          const depositData = await variableNFTContract.getDepositData(nftId);
          const nftIdNumber = nftId.toNumber();

          // Calculate the interest using BigNumber multiplication

          const interest = await poolContract.calculateInterestVariable(
            nftIdNumber
          );
          myVariableNFTs.push({
            tokenId: nftIdNumber,
            value: ethers.utils.formatEther(depositData["amount"]),
            interest: ethers.utils.formatEther(interest),
            claim: ethers.utils.formatEther(depositData["claim"]),
          });
        }

        setVariableNFTs(myVariableNFTs);
      } catch (err) {
        console.error(err);
      }
    }
    if (address && variableNFTContract) {
      getVariableNFTs();
    }
  }, [address, variableNFTContract, poolContract, rate, refreshKey]);

  const redeemVariable = async (tokenId) => {
    try {
      setIsLoading(true);
      try {
        // Calculate the interest
        const interest = await poolContract.calculateInterestVariable(tokenId);
        console.log("Calculated interest:", interest.toString());

        //get total supply
        const totalSupply = await poolContract.getTotalSupply();
        console.log("Total supply:", totalSupply.toString());

        // Calculate totalClaimedVariable
        const totalClaimedVariable = await poolContract.totalClaimedVariable();
        console.log("Total claimed variable:", totalClaimedVariable.toString());
        // Execute withdrawal
        await poolContract.withdrawVariable(tokenId, sendParams);
      } catch (error) {
        console.error("Error during withdrawal:", error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const SampleNFTCard = () => (
    <Card sx={{ mt: 2, mb: 2, backgroundColor: "#e6d7ff" }}>
      <CardContent>
        <Typography>Sample Value: 100</Typography>
        <Typography sx={{ marginBottom: 2 }}>Sample Interest: 10</Typography>
        <Button
          className="redeem-button"
          variant="contained"
          color="secondary"
          disabled
        >
          Redeem Interest
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold">
        My Variable NFTs
      </Typography>
      {variableNFTs.map((variableNFT) => (
        <Card
          key={variableNFT.tokenId}
          sx={{ mt: 2, mb: 2, backgroundColor: "#e6d7ff" }}
        >
          <CardContent>
            <Typography>Value: {variableNFT.value}</Typography>
            <Typography>Claim: {variableNFT.claim}</Typography>
            <Typography sx={{ marginBottom: 2 }}>
              Interest: {variableNFT.interest}
            </Typography>
            <Button
              className="redeem-button"
              variant="contained"
              color="primary"
              onClick={() => redeemVariable(variableNFT.tokenId)}
              disabled={variableNFT.interest === "0.0"}
            >
              Redeem Interest
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

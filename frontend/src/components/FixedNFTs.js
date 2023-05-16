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
          console.log(nftIdNumber);
          /*const interest = await poolContract.calculateInterestFixedParts(
            nftIdNumber
          );*/

          // Calculate the interest using BigNumber multiplication
          const interest = await poolContract.calculateInterestFixed(
            nftIdNumber
          );
          myFixedNFTs.push({
            tokenId: nftIdNumber,
            value: ethers.utils.formatEther(depositData["amount"]),
            interest: ethers.utils.formatEther(interest),
            claim: ethers.utils.formatEther(depositData["claim"]),
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
      try {
        // Calculate the interest
        const interestParts = await poolContract.calculateInterestFixedParts(
          tokenId
        );
        console.log(
          "Calculated interest start part:",
          interestParts[0].toString()
        );
        console.log(
          "Calculated interest mid part:",
          interestParts[1].toString()
        );

        const interest = interestParts[0].add(interestParts[1]);
        console.log("Total interest:", interest.toString());

        // Calculate totalClaimedFixedPrev
        const totalClaimedFixedPrev =
          await poolContract.totalClaimedFixedPrev();
        console.log(
          "Total claimed fixed prev:",
          totalClaimedFixedPrev.toString()
        );

        // Execute withdrawal
        await poolContract.withdrawFixed(tokenId, sendParams);
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
        My Fixed NFTs
      </Typography>
      {fixedNFTs.map((fixedNFT) => (
        <Card
          key={fixedNFT.tokenId}
          sx={{ mt: 2, mb: 2, backgroundColor: "#e6d7ff" }}
        >
          <CardContent>
            <Typography>Value: {fixedNFT.value}</Typography>
            <Typography>Claimed: {fixedNFT.claim}</Typography>
            <Typography sx={{ marginBottom: 2 }}>
              Interest: {fixedNFT.interest}
            </Typography>
            <Button
              className="redeem-button"
              variant="contained"
              color="primary"
              onClick={() => redeemFixed(fixedNFT.tokenId)}
              disabled={isLoading || fixedNFT.interest === "0.0"}
            >
              Redeem Interest
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

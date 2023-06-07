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
          const tokenURI = await fixedNFTContract.tokenURI(nftId);
          console.log(tokenURI);
          const nftIdNumber = nftId.toNumber();
          console.log(nftIdNumber);
          /*const interest = await poolContract.calculateInterestFixedParts(
            nftIdNumber
          );*/

          // Calculate the interest using BigNumber multiplication
          const interest = await poolContract.calculateInterestFixed(
            nftIdNumber
          );

          let interestRateRay = await poolContract.getInterestRate();
          let interestRate =
            interestRateRay.div(ethers.constants.WeiPerEther).toNumber() / 1e7; // Dividing by 10 to convert from ray to ether format
          let roundedInterestRatePercent = interestRate.toFixed(2); // Rounding to two decimal places

          console.log(roundedInterestRatePercent); // Should print '0.68'
          const interestParts = await poolContract.calculateInterestFixedParts(
            nftIdNumber
          );
          console.log(interestParts.map((x) => ethers.utils.formatEther(x)));
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
          sx={{ mt: 2, mb: 2, backgroundColor: "#e6d7ff", cursor: "pointer" }}
          onClick={() => {
            window.open(
              `https://sepolia.etherscan.io/nft/${fixedNFTContract.address}/${fixedNFT.tokenId}`,
              "_blank"
            );
          }}
        >
          <CardContent>
            <Typography>Token ID: {fixedNFT.tokenId}</Typography>
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
              disabled={isLoading}
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

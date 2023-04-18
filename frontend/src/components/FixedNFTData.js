import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { aavePoolSupplyWithNFTContract } from "./Provider";
import { Card, CardContent, Typography } from "@mui/material";

function FixedNFTData() {
  const [fixedSupply, setFixedSupply] = useState(0);
  const [fixedInterestRate, setFixedInterestRate] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const rates = await aavePoolSupplyWithNFTContract.interests();

      const fixedRateInDecimals = ethers.BigNumber.from(rates[0]);
      const divisor = ethers.BigNumber.from("10000000"); // Equivalent to 1e12

      const fixedRateDivided = fixedRateInDecimals.div(divisor);
      setFixedInterestRate(fixedRateDivided);

      const multiplier = ethers.BigNumber.from("10000000000");
      let fixedSupply = await aavePoolSupplyWithNFTContract.fixedSupply();
      fixedSupply = fixedSupply.mul(multiplier);
      setFixedSupply(fixedSupply);
    }
    fetchData();
  }, []);

  return (
    <Card sx={{ backgroundColor: "#e6d7ff" }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">Fixed Pool</Typography>
        <Typography variant="body1">
          Supply: {ethers.utils.formatEther(fixedSupply)} DAI
        </Typography>
        <Typography variant="body1">
          Interest Rate: {ethers.utils.formatEther(fixedInterestRate)}%
        </Typography>
      </CardContent>
    </Card>
  );
}

export default FixedNFTData;

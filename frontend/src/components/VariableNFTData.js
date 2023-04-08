import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { aavePoolSupplyWithNFTContract } from "./Provider";
import { Card, CardContent, Typography } from "@mui/material";

function VariableNFTData() {
  const [variableSupply, setVariableSupply] = useState(0);
  const [variableInterestRate, setVariableInterestRate] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const rates = await aavePoolSupplyWithNFTContract.interests();

      const variableRateInDecimals = ethers.BigNumber.from(rates[1]);
      const divisor = ethers.BigNumber.from("10000000"); // Equivalent to 1e12

      const variableRateDivided = variableRateInDecimals.div(divisor);
      setVariableInterestRate(variableRateDivided);

      let variableSupply = await aavePoolSupplyWithNFTContract.variableSupply();
      setVariableSupply(variableSupply);
    }
    fetchData();
  }, []);

  return (
    <Card sx={{ backgroundColor: "#c2d9f0" }}>
    <CardContent>
      <Typography variant="h5" fontWeight="bold">Variable Pool</Typography>
      <Typography variant="body1">
        Supply: {ethers.utils.formatEther(variableSupply)} DAI
      </Typography>
      <Typography variant="body1">
        Interest Rate: {ethers.utils.formatEther(variableInterestRate)}%
      </Typography>
    </CardContent>
  </Card>
  );
}

export default VariableNFTData;

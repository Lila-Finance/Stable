import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent, Typography } from "@mui/material";

function VariableNFTData({ rate, poolContract, refreshKey }) {
  const [variableSupply, setVariableSupply] = useState(0);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let variableSupply = await poolContract.totalDepositedVariable();
      setVariableSupply(variableSupply);
      let limit = await poolContract.variablePoolLimit();
      setLimit(limit);
    }
    fetchData();
  }, [poolContract, refreshKey]);

  return (
    <Card sx={{ backgroundColor: "#e6d7ff" }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          Variable Pool
        </Typography>
        <Typography variant="body1">
          Supply: {ethers.utils.formatEther(variableSupply)} TKN
        </Typography>
        <Typography variant="body1">
          Limit: {ethers.utils.formatEther(limit)} TKN
        </Typography>
        {/*Since it is wrong
        
        <Typography variant="body1">
          Estimated Interest Rate: {ethers.utils.formatEther(rate)}%
  </Typography>*/}
      </CardContent>
    </Card>
  );
}

export default VariableNFTData;

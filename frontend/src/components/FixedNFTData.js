import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent, Typography } from "@mui/material";

function FixedNFTData({ rate, poolContract, refreshKey }) {
  const [fixedSupply, setFixedSupply] = useState(0);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let fixedSupply = await poolContract.totalDepositedFixed();
      setFixedSupply(fixedSupply);
      let limit = await poolContract.fixedPoolLimit();
      setLimit(limit);
    }
    fetchData();
  }, [poolContract, refreshKey]);

  return (
    <Card sx={{ backgroundColor: "#e6d7ff" }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          Fixed Pool
        </Typography>
        <Typography variant="body1">
          Supply: {ethers.utils.formatEther(fixedSupply)} TKN
        </Typography>
        <Typography variant="body1">
          Limit: {ethers.utils.formatEther(limit)} TKN
        </Typography>
        <Typography variant="body1">
          Interest Rate: {ethers.utils.formatEther(rate)}%
        </Typography>
      </CardContent>
    </Card>
  );
}

export default FixedNFTData;

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { sendParams, poolDeployerContract, tokenContract } from "./Provider";

import { Typography, Box, Button, TextField, Grid } from "@mui/material";
import addresses from "../addresses/addresses.json";

const {
  DAI_ADDRESS,
  AAVE_ADDRESSES_PROVIDER,
  POOL_DEPLOYER_ADDRESS,
  POOL_LOGIC_ADDRESS,
} = addresses;

const CreatePool = () => {
  const [status, setStatus] = useState("");
  const [fixedPoolLimit, setFixedPoolLimit] = useState("500");
  const [lockDurationDays, setLockDurationDays] = useState("30.417");
  const [interestRatePercentage, setInterestRatePercentage] = useState("10");

  const createPool = async () => {
    setStatus("Creating pool...");

    try {
      // Convert user input to proper values
      const fixedPoolLimitParsed = ethers.utils.parseEther(fixedPoolLimit);
      const lockDuration = Math.round(
        parseFloat(lockDurationDays) * 24 * 60 * 60
      ); // Convert days to seconds
      const interestRate = ethers.utils.parseEther(interestRatePercentage);

      const createPoolTx = await poolDeployerContract.createPool(
        AAVE_ADDRESSES_PROVIDER,
        DAI_ADDRESS,
        fixedPoolLimitParsed,
        lockDuration,
        interestRate,
        POOL_LOGIC_ADDRESS
      );
      await createPoolTx.wait();

      setStatus("Pool created.");
    } catch (error) {
      console.error("Error creating pool:", error);
      setStatus("Error creating pool. Check console for details.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create Pool
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Fixed Pool Limit"
            variant="outlined"
            value={fixedPoolLimit}
            onChange={(e) => setFixedPoolLimit(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Lock Duration (Days)"
            variant="outlined"
            value={lockDurationDays}
            onChange={(e) => setLockDurationDays(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Interest Rate (%)"
            variant="outlined"
            value={interestRatePercentage}
            onChange={(e) => setInterestRatePercentage(e.target.value)}
          />
        </Grid>
      </Grid>
      <Box mt={2}>
        <Button variant="contained" onClick={createPool}>
          Create Pool
        </Button>
      </Box>
    </Box>
  );
};

export default CreatePool;

import CreatePool from "./CreatePool";
import DeletePool from "./DeletePool";
import FastForward from "./FastForward";
import Faucet from "./Faucet";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { tokenContract } from "./Provider";
import React from "react";
import { Box, Button, Typography, Grid, ButtonBase } from "@mui/material";
import { poolDeployerContract } from "./Provider";

function PoolManagement({
  poolContract,
  timeSinceStart,
  lockDuration,
  numPools,
  setPoolNum,
  poolNum,
  handleRefresh,
}) {
  const deletePool = async () => {
    try {
      const poolAddress = poolContract.address;
      await poolDeployerContract.deletePool(poolAddress);
      console.log("Pool deleted:", poolAddress);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Box
        className="mb-3"
        sx={{
          borderRadius: 1,
          padding: 2,
        }}
      >
        {numPools > 0 && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                setPoolNum(poolNum - 1);
              }}
              sx={{ marginRight: 1 }}
            >
              Prev Pool
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                setPoolNum(poolNum + 1);
              }}
              sx={{ marginRight: 1 }}
            >
              Next Pool
            </Button>
            <Button
              className="refresh-button"
              variant="contained"
              color="primary"
              onClick={handleRefresh}
            >
              Refresh Contracts
            </Button>
          </>
        )}
      </Box>
      <Box className="mb-3">
        <Box display="flex" alignItems="center">
          <MonetizationOnIcon sx={{ marginRight: 1 }} />
          <Typography variant="h6">
            Import DAI Contract: {tokenContract.address}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <AccessTimeFilledIcon sx={{ marginRight: 1 }} />
          <Typography variant="h6">
            Time Since Start: {timeSinceStart}, lockDuration: {lockDuration}
          </Typography>
        </Box>
      </Box>
    </div>
  );
}

export default PoolManagement;

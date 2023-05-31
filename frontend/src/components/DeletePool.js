import React from "react";
import { ethers } from "ethers";
import { sendParams, poolDeployerContract } from "./Provider";
import { Button, Box, Typography } from "@mui/material";

function DeletePool({ poolContract }) {
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
    <Box>
      {/* <Typography variant="h4" fontWeight="bold" mb={3}>
        Delete Pool
      </Typography> */}
      <Button
        className="delete-pool-button"
        fullWidth={true}
        variant="contained"
        color="primary"
        size="large"
        onClick={deletePool}
      >
        Delete Pool
      </Button>
    </Box>
  );
}

export default DeletePool;

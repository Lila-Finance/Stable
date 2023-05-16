import React, { useState } from "react";
import { approveSpend, sendParams } from "./Provider";
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  Alert,
} from "@mui/material";
import { ethers } from "ethers";

function SupplyFixed({ address, poolContract }) {
  const [amount, setAmount] = useState("");
  const [max, setMax] = useState(null);
  const [error, setError] = useState(null);

  const handleMaxClick = async () => {
    let maxFixed = await poolContract.fixedPoolLimit();
    let subFixed = await poolContract.totalDepositedFixed();

    setMax(maxFixed.sub(subFixed));
    //set ethers maxFixed
    maxFixed = ethers.utils.formatEther(maxFixed);
    subFixed = ethers.utils.formatEther(subFixed);
    maxFixed = maxFixed - subFixed;
    setAmount(maxFixed.toString());
  };

  const supplyFixed = async () => {
    try {
      let amountWei;
      if (max) {
        amountWei = ethers.BigNumber.from(max);
        await approveSpend(
          address,
          ethers.utils.formatEther(amountWei),
          poolContract
        );
      } else {
        amountWei = await approveSpend(address, amount, poolContract);
      }
      setError(null);
      await poolContract.depositFixed(amountWei, sendParams);
    } catch (err) {
      console.error(err);
      setError("Insufficient balance");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Supply Fixed
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box mb={2}>
        <TextField
          label="Amount"
          type="number"
          inputProps={{ step: "0.0001" }}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setMax(null);
          }}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button size="small" onClick={handleMaxClick}>
                  Max
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Button
        className="supply-button"
        fullWidth={true}
        variant="contained"
        color="primary"
        size="large"
        onClick={supplyFixed}
      >
        Supply
      </Button>
    </Box>
  );
}

export default SupplyFixed;

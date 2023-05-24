import React, { useState } from "react";
import { approveSpend, sendParams } from "./Provider";
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ethers } from "ethers";

function SupplyFixed({ address, poolContract }) {
  const [amount, setAmount] = useState("");
  const [max, setMax] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
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
      const txResponse = await poolContract.depositFixed(amountWei, sendParams);
      // Wait for the transaction to be mined
      await txResponse.wait();
    } catch (err) {
      console.error(err);
      setError("Insufficient balance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography color="secondary" variant="h4" fontWeight="bold" mb={3}>
        Supply Fixed
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box mb={2}>
        <TextField
          color="secondary"
          label="Amount"
          type="number"
          inputProps={{ 
            step: "0.0001",
            style: { color: "#ffffff" }
          }}
          FormHelperTextProps={{ style: { color: "#ffffff" } }}
          value={amount}
          focused
          helperText="Make sure you have DAI on Polygon"
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
        disabled={isLoading}
        onClick={supplyFixed}
      >
        {isLoading ? (
          <>
            <CircularProgress size={24} />
            <span style={{ marginLeft: "10px" }}>Transacting...</span>
          </>
        ) : (
          'Supply'
        )}
      </Button>
    </Box>
  );
}

export default SupplyFixed;

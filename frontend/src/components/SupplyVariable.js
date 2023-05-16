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

function SupplyVariable({ address, poolContract }) {
  const [amount, setAmount] = useState("");
  const [max, setMax] = useState(null);
  const [error, setError] = useState(null);

  const handleMaxClick = async () => {
    let maxVariable = await poolContract.variablePoolLimit();
    let subVariable = await poolContract.totalDepositedVariable();

    setMax(maxVariable.sub(subVariable));
    //set ethers maxVariable
    maxVariable = ethers.utils.formatEther(maxVariable);
    subVariable = ethers.utils.formatEther(subVariable);
    maxVariable = maxVariable - subVariable;
    setAmount(maxVariable.toString());
  };

  const supplyVariable = async () => {
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
      await poolContract.depositVariable(amountWei, sendParams);
    } catch (err) {
      console.error(err);
      setError("Insufficient balance");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Supply Variable
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
        onClick={supplyVariable}
      >
        Supply
      </Button>
    </Box>
  );
}

export default SupplyVariable;

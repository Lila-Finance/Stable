import React, { useState } from "react";
import {
  aavePoolSupplyWithNFTContract,
  approveSpend,
  sendParams,
} from "./Provider";
import { TextField, Button, Box, Typography } from "@mui/material";


function SupplyVariable({ address }) {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");

  const supplyVariable = async () => {
    try {
      let amountWei = await approveSpend(address, amount);
      //update to use contract with others
      await aavePoolSupplyWithNFTContract.supplyVariable(
        amountWei,
        days,
        sendParams
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Supply Variable</Typography>
      <Box mb={2}>
        <TextField
          label="Amount"
          type="number"
          inputProps={{ step: "0.0001" }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Days in the past"
          type="number"
          inputProps={{ step: "0.0001" }}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          fullWidth
        />
        <Typography variant="caption" display="block" color="text.secondary">
          Note: This "Days in the past" box is for testing purposes. It will not appear on the production site.
        </Typography>
      </Box>
      <Button className="supply-button" fullWidth={true}  variant="contained" color="primary" size="large" onClick={supplyVariable}>
        Supply
      </Button>
    </Box>
  );
}

export default SupplyVariable;

import React, { useState } from "react";
import { ethers } from "ethers";
import { sendParams, approveSpend, aavePoolSupplyWithNFTContract } from './Provider'
import { TextField, Button, Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

const TestComponentWrapper = styled(Box)({
  backgroundColor: "rgba(128, 128, 128, 0.1)", // Gray background with opacity
  padding: "1rem",
  borderRadius: "4px",
});


function FundVariable({ address }) {
  const [amount, setAmount] = useState("");

  const fundVariable = async () => {
    try {
      let amountWei = await approveSpend(address, amount);
      await aavePoolSupplyWithNFTContract.fundVariable(amountWei, sendParams);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TestComponentWrapper>
      <Box>
        <Typography variant="h4">Fund Variable</Typography>
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
        <Button variant="contained" color="primary" onClick={fundVariable}>
          Fund Variable
        </Button>
        <Typography variant="subtitle2" color="text.secondary">
          This component is for testing purposes only. They will not appear on the production site.
        </Typography>
      </Box>
    </TestComponentWrapper>
  );  
}

export default FundVariable;

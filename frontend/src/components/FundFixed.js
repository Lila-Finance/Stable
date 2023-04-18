import React, { useState } from "react";
import { ethers } from "ethers";
import { aavePoolSupplyWithNFTContract, approveSpend, sendParams } from "./Provider";
import { TextField, Button, Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

// Create a styled Box component for the wrapper
const TestComponentWrapper = styled(Box)({
  backgroundColor: "rgba(128, 128, 128, 0.1)", // Gray background with opacity
  padding: "1rem",
  borderRadius: "4px",
});

function FundFixed({ address }) {
  const [amount, setAmount] = useState("");

  const fundFixed = async () => {
    try {
      let amountWei = await approveSpend(address, amount);
      await aavePoolSupplyWithNFTContract.fundFixed(amountWei, 0, sendParams);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TestComponentWrapper>
      <Box>
        <Typography variant="h4">Fund Fixed</Typography>
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
        <Button variant="contained" color="primary" onClick={fundFixed}>
          Fund Fixed
        </Button>
      </Box>
      <Typography variant="subtitle2" color="text.secondary">
        This component is for testing purposes only. They will not appear on the production site.
      </Typography>
    </TestComponentWrapper>
  );  
}

export default FundFixed;

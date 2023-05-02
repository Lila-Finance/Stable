import React, { useState } from "react";
import { Button, TextField, Box } from "@mui/material";
import { ethers } from "ethers";
import { tokenContract } from "./Provider";

const Faucet = ({ userAddress }) => {
  const [amount, setAmount] = useState("");

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleMintFromFaucet = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amountWei = ethers.utils.parseEther(amount);
    try {
      const tx = await tokenContract.mintFromFaucet(amountWei, {
        from: userAddress,
      });
      await tx.wait();
      alert(`Successfully minted ${amount} tokens`);
    } catch (err) {
      console.error(err);
      alert("Error minting tokens from faucet");
    }
  };

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        label="Amount"
        variant="outlined"
        type="number"
        value={amount}
        onChange={handleAmountChange}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" onClick={handleMintFromFaucet}>
        Mint from Faucet
      </Button>
    </Box>
  );
};

export default Faucet;

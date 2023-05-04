import React, { useState } from "react";
import { Button, TextField, Box } from "@mui/material";
import { ethers } from "ethers";

const FastForward = ({ poolContract }) => {
  const [daysToFastForward, setDaysToFastForward] = useState("");

  const fastForward = async () => {
    if (!poolContract || !daysToFastForward) return;

    try {
      const days = parseFloat(daysToFastForward);
      if (isNaN(days)) {
        console.error("Invalid input");
        return;
      }

      const secondsInADay = 86400;
      const timeInSeconds = Math.round(days * secondsInADay);

      // Call fastForward function
      const tx = await poolContract.fastForward(timeInSeconds);
      await tx.wait();

      console.log("Fast forward successful:", days, "days");
    } catch (err) {
      console.error("Error calling fastForward:", err);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <TextField
        label="Time to fast forward (days)"
        value={daysToFastForward}
        onChange={(e) => setDaysToFastForward(e.target.value)}
        fullWidth
        style={{ marginRight: "8px" }}
      />
      <Button onClick={fastForward} variant="contained">
        Fast Forward
      </Button>
    </div>
  );  
};

export default FastForward;

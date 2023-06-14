import React, { useState } from "react";
import { Container, Grid, Card, CardContent, Typography } from "@mui/material";
import NavBar from "./components/NavBar";
import PositionCard from "./components/PositionCard"
import "./App.css";
import { useAccount } from "wagmi";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TASK_COMPILE_SOLIDITY_LOG_DOWNLOAD_COMPILER_END } from "hardhat/builtin-tasks/task-names";

const theme = createTheme({
    palette: {
      primary: {
        main: "#9c88ff",
      },
      secondary: {
        main: "#e6d7ff",
      },
      background: {
        default: "#FFFDFF",
      },
    },
  });

  const [numPools, setNumPools] = useState(2);
  const [developerMode, setDeveloperMode] = useState(false);
  const { address } = useAccount();
  const Positions = ({ positions }) => {
    <h1>Your Positions</h1>
    return (
      <Container>
        {positions.length > 0 && (
          <Grid container spacing={7} justifyContent="center" alignItems="center" mt={4}>
            {positions.map((position, index) => (
              <Grid item xs={12} md={4} key={index}>
                <PositionCard
                  status={position.status}
                  address={position.address}
                  numPools={position.numPools}
                  poolNum={position.poolNum}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );

  };

export default Positions;

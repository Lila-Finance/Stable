import React, { useState } from "react";
import { Container, Grid, Card, CardContent, Typography } from "@mui/material";
import NavBar from "./components/NavBar";
import PositionCard from "./components/PositionCard"
import "./App.css";
import { useAccount } from "wagmi";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Positions() {
    const [numPools, setNumPools] = useState(2);
    const [developerMode, setDeveloperMode] = useState(false);
    const { address } = useAccount();
        return (
            <h1>Positions</h1>
             
        );
}

export default Positions;

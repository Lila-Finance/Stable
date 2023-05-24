import CreatePool from "./CreatePool";
import DeletePool from "./DeletePool";
import FastForward from "./FastForward";
import Faucet from "./Faucet";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { tokenContract } from "./Provider";
import React, { useState } from "react";
import { Box, Button, Typography, Grid, ButtonBase } from "@mui/material";
import { poolDeployerContract } from "./Provider";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RefreshIcon from "@mui/icons-material/Refresh";
import LockIcon from "@mui/icons-material/Lock";
import CircularProgress from "@mui/material/CircularProgress";

function PoolManagement({
  poolContract,
  timeSinceStart,
  lockDuration,
  numPools,
  setPoolNum,
  poolNum,
  handleRefresh,
  setIsLoading,
}) {
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const deletePool = async () => {
    try {
      const poolAddress = poolContract.address;
      await poolDeployerContract.deletePool(poolAddress);
      console.log("Pool deleted:", poolAddress);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Box className="mb-4" sx={{ borderRadius: 1 }}>
        {numPools > 0 && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 1,
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={async () => {
                  if (poolNum > 0) {
                    setLoadingPrev(true);
                    setIsLoading(true);
                    setPoolNum(poolNum - 1);
                    setTimeout(() => {
                      setLoadingPrev(false);
                      setIsLoading(false);
                    }, 1000);
                  }
                }}
                sx={{ marginRight: 1 }}
                startIcon={
                  loadingPrev ? (
                    <CircularProgress size={24} />
                  ) : (
                    <KeyboardArrowLeftIcon />
                  )
                }
              >
                Prev Pool
              </Button>

              <Typography color="secondary" align="center" variant="h6">
                Pool {poolNum}
              </Typography>

              <Button
                variant="outlined"
                color="secondary"
                onClick={async () => {
                  if (poolNum < numPools - 1) {
                    setLoadingNext(true);
                    setIsLoading(true);
                    setPoolNum(poolNum + 1);
                    setTimeout(() => {
                      setLoadingNext(false);
                      setIsLoading(false);
                    }, 1000);
                  }
                }}
                sx={{ marginRight: 1 }}
                endIcon={
                  loadingNext ? (
                    <CircularProgress size={24} />
                  ) : (
                    <KeyboardArrowRightIcon />
                  )
                }
              >
                Next Pool
              </Button>
            </Box>
          </>
        )}
      </Box>
      <Box
        className="mb-3"
        sx={{
          // backgroundColor: '#40386b',
          border: "1px solid #40386b",
          borderRadius: "4px",
          padding: "20px",
        }}
      >
        <Box display="flex" alignItems="center">
          <MonetizationOnIcon color="secondary" sx={{ marginRight: 1 }} />
          <Typography variant="h6" color="secondary">
            Import DAI Contract: {tokenContract.address}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <AccessTimeFilledIcon color="secondary" sx={{ marginRight: 1 }} />
          <Typography variant="h6" color="secondary">
            Time Since Start: {timeSinceStart}
          </Typography>
        </Box>
        <Box className="mb-2" display="flex" alignItems="center">
          <LockIcon color="secondary" sx={{ marginRight: 1 }} />
          <Typography variant="h6" color="secondary">
            Lock Duration: {lockDuration}
          </Typography>
        </Box>
        <Button
          className="refresh-button"
          variant="outlined"
          color="secondary"
          onClick={async () => {
            setLoadingRefresh(true);
            handleRefresh();
            setTimeout(() => {
              setLoadingRefresh(false);
            }, 1000);
          }}
          startIcon={
            loadingRefresh ? <CircularProgress size={24} /> : <RefreshIcon />
          }
        >
          Refresh Contracts
        </Button>
      </Box>
    </div>
  );
}

export default PoolManagement;

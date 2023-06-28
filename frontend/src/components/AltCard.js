import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  InputAdornment,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import redEllipse from "../images/red_ellipse.png";
import yellowEllipse from "../images/yellow_ellipse.png";
import greenEllipse from "../images/green_ellipse.png";
import poolDeployerAbi from "../abi/PoolDeployer.json";
import poolAbi from "../abi/Pool.json";
import { useContractReads, useContractRead } from "wagmi";
import { formatEther } from "viem";
import addresses from "../addresses/addresses.json";

const poolDeployerContract = {
  abi: poolDeployerAbi.abi,
  address: addresses.POOL_DEPLOYER_ADDRESS,
};

const AltCard = ({ status, numPools, poolNum }) => {
  const { data: address } = useContractRead({
    ...poolDeployerContract,
    functionName: "pools",
    args: [poolNum],
  });
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address,
        abi: poolAbi.abi,
        functionName: "fixedPoolLimit",
      },
      {
        address,
        abi: poolAbi.abi,
        functionName: "variablePoolLimit",
      },
      {
        address,
        abi: poolAbi.abi,
        functionName: "totalDepositedFixed",
      },
      {
        address,
        abi: poolAbi.abi,
        functionName: "totalDepositedVariable",
      },
      {
        address,
        abi: poolAbi.abi,
        functionName: "interests",
      },
    ],
  });

  console.log(data);
  const [poolStatus, setPoolStatus] = useState(null);
  useEffect(() => {
    console.log("status: ", status);
    switch (status) {
      case "expired":
        setPoolStatus(redEllipse);
        break;
      case "inprogress":
        setPoolStatus(yellowEllipse);
        break;
      case "done":
        setPoolStatus(greenEllipse);
        break;
      default:
        setPoolStatus(null);
    }
  }, [status]);

  function get(arr) {
    try {
      let res = data[arr[0]].result;
      for (let i = 1; i < arr.length; i++) {
        res = res[i];
      }
      res = formatEther(res);

      // Check if decimals are present
      if (res % 1 !== 0) {
        // Rounding to 2 decimal places
        res = parseFloat(res).toFixed(2);
      }

      return res;
    } catch (error) {
      return null;
    }
  }

  const poolDataTable = () => (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell
            size="small"
            component="th"
            scope="row"
            style={{ color: "#9C9CA6", border: "none" }}
          >
            {" "}
          </TableCell>
          <TableCell
            size="small"
            align="right"
            style={{ color: "#9C9CA6", border: "none" }}
          >
            Fixed
          </TableCell>
          <TableCell
            size="small"
            align="right"
            style={{ color: "#9C9CA6", border: "none" }}
          >
            Variable
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            size="small"
            component="th"
            scope="row"
            style={{ color: "#9C9CA6", border: "none" }}
          >
            APR
          </TableCell>
          <TableCell
            size="small"
            align="right"
            style={{ color: "#4C4C51", border: "none" }}
          >
            {get([4, 0])}%
          </TableCell>
          <TableCell
            size="small"
            align="right"
            style={{ color: "#4C4C51", border: "none" }}
          >
            {get([4, 1])}%
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            size="small"
            component="th"
            scope="row"
            style={{ color: "#9C9CA6", border: "none" }}
          >
            Cap
          </TableCell>
          <TableCell
            size="small"
            align="right"
            style={{ color: "#4C4C51", border: "none" }}
          >
            {get([0])} DAI
          </TableCell>
          <TableCell
            size="small"
            align="right"
            style={{ color: "#4C4C51", border: "none" }}
          >
            {get([1])} DAI
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            size="small"
            component="th"
            scope="row"
            style={{ color: "#9C9CA6", border: "none" }}
          >
            Deposits
          </TableCell>
          <TableCell
            size="small"
            align="right"
            style={{ color: "#4C4C51", border: "none" }}
          >
            {get([2])} DAI
          </TableCell>
          <TableCell
            size="small"
            align="right"
            style={{ color: "#4C4C51", border: "none" }}
          >
            {get([3])} DAI
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  const statusTable = () => {
    const emptyRow = (
      <TableRow>
        <TableCell
          size="small"
          component="th"
          scope="row"
          style={{ color: "#9C9CA6", border: "none" }}
        ></TableCell>
      </TableRow>
    );

    if (status === "expired") {
      return (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                size="small"
                component="th"
                scope="row"
                style={{ color: "#9C9CA6", border: "none" }}
              >
                Expired
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                size="small"
                component="th"
                scope="row"
                style={{ color: "#9C9CA6", border: "none" }}
              >
                Payout
              </TableCell>
              <TableCell
                size="small"
                align="right"
                style={{ color: "#4C4C51", border: "none" }}
              ></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    } else if (status === "inprogress") {
      return (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                size="small"
                component="th"
                scope="row"
                style={{ color: "#9C9CA6", border: "none" }}
              >
                Expiry
              </TableCell>
              <TableCell
                size="small"
                align="right"
                style={{ color: "#4C4C51", border: "none" }}
              >
                xxx. xx,xx
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                size="small"
                component="th"
                scope="row"
                style={{ color: "#9C9CA6", border: "none" }}
              >
                Payout
              </TableCell>
              <TableCell
                size="small"
                align="right"
                style={{ color: "#4C4C51", border: "none" }}
              >
                0 of x
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    } else if (status === "done") {
      return (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                size="small"
                component="th"
                scope="row"
                style={{ color: "#9C9CA6", border: "none" }}
              >
                Maturity
              </TableCell>
              <TableCell
                size="small"
                align="right"
                style={{ color: "#4C4C51", border: "none" }}
              >
                xxx. xx,xx
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                size="small"
                component="th"
                scope="row"
                style={{ color: "#9C9CA6", border: "none" }}
              >
                Payout
              </TableCell>
              <TableCell
                size="small"
                align="right"
                style={{ color: "#4C4C51", border: "none" }}
              >
                x of x+1
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    } else {
      return (
        <Table>
          <TableBody>
            {emptyRow}
            {emptyRow}
          </TableBody>
        </Table>
      );
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: "#FBFBEC",
        backgroundColor: "#ECECFB",
        borderRadius: "10px",
        height: "100%",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          color="#4C4C51"
          gutterBottom
          align="center"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ flexGrow: 1, textAlign: "center" }}>
            DAI (Aave) <strong>{poolNum}</strong>
          </div>
          {redEllipse && (
            <img
              src={redEllipse}
              alt="status ellipse"
              style={{ width: "10%", height: "10%", marginLeft: "auto" }}
            />
          )}
        </Typography>
        <Divider sx={{ bgcolor: "#FBFBEC" }} />
        {poolDataTable()}
        <Divider
          sx={{ bgcolor: "#FBFBEC", marginTop: "10px", marginBottom: "10px" }}
        />
        {statusTable()}
      </CardContent>
    </Card>
  );
};

export default AltCard;

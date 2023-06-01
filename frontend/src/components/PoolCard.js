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
  ToggleButtonGroup
} from '@mui/material';
import redEllipse from '../images/red_ellipse.png';
import yellowEllipse from '../images/yellow_ellipse.png';
import greenEllipse from '../images/green_ellipse.png';
import { approveSpend, sendParams } from "./Provider";
import { ethers } from "ethers";

const PoolCard = ({ status, address, poolContract }) => {
  const [poolStatus, setPoolStatus] = useState(null);
  // TODO: change days
  const [days, setDays] = useState(7);
  // State to handle "Fix" and "Variable" toggle button
  const [supplyType, setSupplyType] = useState('Variable');
  // state from supplyFixed.js
  const [fixMax, setFixMax] = useState(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // state from supplyVariable.js
  const [varMax, setVarMax] = useState(null);

  // function from supplyFixed.js
  const handleFixMaxClick = async () => {
    let maxFixed = await poolContract.fixedPoolLimit();
    let subFixed = await poolContract.totalDepositedFixed();

    setFixMax(maxFixed.sub(subFixed));
    //set ethers maxFixed
    maxFixed = ethers.utils.formatEther(maxFixed);
    subFixed = ethers.utils.formatEther(subFixed);
    maxFixed = maxFixed - subFixed;
    setAmount(maxFixed.toString());
  };

  // function from supplyVariable.js
  const handleVarMaxClick = async () => {
    let maxVariable = await poolContract.variablePoolLimit();
    let subVariable = await poolContract.totalDepositedVariable();

    setVarMax(maxVariable.sub(subVariable));
    //set ethers maxVariable
    maxVariable = ethers.utils.formatEther(maxVariable);
    subVariable = ethers.utils.formatEther(subVariable);
    maxVariable = maxVariable - subVariable;
    setAmount(maxVariable.toString());
  };

  // function from supplyFixed.js
  const supplyFixed = async () => {
    setIsLoading(true);
    try {
      let amountWei;
      if (fixMax) {
        amountWei = ethers.BigNumber.from(fixMax);
        await approveSpend(
          address,
          ethers.utils.formatEther(amountWei),
          poolContract
        );
      } else {
        amountWei = await approveSpend(address, amount, poolContract);
      }
      setError(null);
      const txResponse = await poolContract.depositFixed(amountWei, sendParams);
      // Wait for the transaction to be mined
      await txResponse.wait();
    } catch (err) {
      console.error(err);
      setError("Insufficient balance");
    } finally {
      setIsLoading(false);
    }
  };

  const supplyVariable = async () => {
    setIsLoading(true);
    try {
      let amountWei;
      if (varMax) {
        amountWei = ethers.BigNumber.from(varMax);
        await approveSpend(
          address,
          ethers.utils.formatEther(amountWei),
          poolContract
        );
      } else {
        amountWei = await approveSpend(address, amount, poolContract);
      }
      setError(null);
      const txResponse = await poolContract.depositVariable(amountWei, sendParams);
      // Wait for the transaction to be mined
      await txResponse.wait();
    } catch (err) {
      console.error(err);
      setError("Insufficient balance");
    } finally {
      console.log("done transaction");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('status: ', status);
    switch (status) {
      case "expired":
        setPoolStatus(redEllipse);
        break;
      case 'inprogress':
        setPoolStatus(yellowEllipse);
        break;
      case 'done':
        setPoolStatus(greenEllipse);
        break;
      default:
        setPoolStatus(null);
    }
  }, [status]);

const statusTable = () => {
  const emptyRow = (
    <TableRow>
      <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>P</TableCell>
    </TableRow>
  );

  if (status === 'expired') {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Expired</TableCell>
          </TableRow>
          {emptyRow}
        </TableBody>
      </Table>
    );
  } else if (status === 'inprogress') {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Expiry</TableCell>
            <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>xxx. xx,xx</TableCell>
          </TableRow>
          <TableRow>
            <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Payout</TableCell>
            <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>0 of x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  } else if (status === 'done') {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Maturity</TableCell>
            <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>xxx. xx,xx</TableCell>
          </TableRow>
          <TableRow>
            <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Payout</TableCell>
            <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>x of x+1</TableCell>
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
    )
  }
}

  return (
  <Card variant="outlined" sx={{ borderColor: '#FBFBEC', backgroundColor: '#ECECFB', borderRadius: '10px' }}>
      <CardContent>
        <Typography 
          variant="h6" 
          color="#4C4C51" 
          gutterBottom 
          align="center" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}
        >
          <div style={{ flexGrow: 1, textAlign: 'center' }}>
            DAI (Aave) <strong>{`${days}d`}</strong>
          </div>
          {poolStatus && <img src={poolStatus} alt="status ellipse" style={{ width: '10%', height: '10%', marginLeft: 'auto' }}/>}
        </Typography>
        <Divider sx={{ bgcolor: '#FBFBEC' }} />
        <Table>
          <TableBody>
            <TableRow>
              <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}> </TableCell>
              <TableCell size="small" align="right" style={{ color: "#9C9CA6", border: 'none' }}>Fixed</TableCell>
              <TableCell size="small" align="right" style={{ color: "#9C9CA6", border: 'none' }}>Variable</TableCell>
            </TableRow>
            <TableRow>
              <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>APR</TableCell>
              <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>2.50%</TableCell>
              <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>3.00%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Cap</TableCell>
              <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>50,000</TableCell>
              <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>1,250</TableCell>
            </TableRow>
            <TableRow>
              <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Deposits</TableCell>
              <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>xx,xxx</TableCell>
              <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>x,xxx</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Divider sx={{ bgcolor: '#FBFBEC', marginTop: '10px', marginBottom: '10px' }} />
        {statusTable()}
        <Divider sx={{ bgcolor: '#FBFBEC', marginTop: '10px', marginBottom: '10px' }} />
        <ToggleButtonGroup
          size="small"
          value={supplyType}
          exclusive
          onChange={(event, newValue) => setSupplyType(newValue)}
          fullWidth
          sx={{ marginBottom: '10px' }}
        >
          <ToggleButton
            value="Fix"
            style={{
              width: '50%',
              backgroundColor: supplyType === 'Fix' ? '#99CEFF' : '#FFFFFF',
              color: supplyType === 'Fix' ? '#FFFFFF' : '#9C9CA6'
            }}
          >
            Fix
          </ToggleButton>
          <ToggleButton
            value="Variable"
            style={{
              width: '50%',
              backgroundColor: supplyType === 'Variable' ? '#99CEFF' : '#FFFFFF',
              color: supplyType === 'Variable' ? '#FFFFFF' : '#9C9CA6'
            }}
          >
            Variable
          </ToggleButton>
        </ToggleButtonGroup>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Amount"
          type="number"
          size="small"
          value={amount}
          inputProps={{ 
            step: "0.0001",
            style: { color: "#4C4C51", backgroundColor: '#FFFFFF' }
          }}
          FormHelperTextProps={{ style: { color: "#9C9CA6" } }}
          helperText="Make sure you have DAI on Polygon"
          onChange={(e) => {
            setAmount(e.target.value);
            setFixMax(null);
            setVarMax(null);
          }}
          InputProps={{
            style: { backgroundColor: '#FFFFFF' },
            endAdornment: (
              <InputAdornment position="end">
                <Button size="small" onClick={supplyType === 'Fix' ? handleFixMaxClick : handleVarMaxClick}>
                  Max
                </Button>
              </InputAdornment>
            ),
          }}
        />
        <Button 
          variant="contained"
          fullWidth={true}
          style={{ fontSize: '0.7rem', flex: 1, padding: '10px 20px' }} 
          sx={{ marginTop:'10px', backgroundColor: '#99CEFF', color: '#FFFFFF' }}
          disabled={isLoading}
          onClick={supplyType === 'Fix' ? supplyFixed : supplyVariable}
        >
          {isLoading ? (
            <>
              <CircularProgress size={24} />
              <span style={{ marginLeft: "10px" }}>Transacting...</span>
            </>
          ) : (
            'Supply'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PoolCard;

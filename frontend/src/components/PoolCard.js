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
  const [max, setMax] = useState(null);
  // state from supplyFixed.js
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // function from supplyFixed.js
  const handleMaxClick = async () => {
    let maxFixed = await poolContract.fixedPoolLimit();
    let subFixed = await poolContract.totalDepositedFixed();

    setMax(maxFixed.sub(subFixed));
    //set ethers maxFixed
    maxFixed = ethers.utils.formatEther(maxFixed);
    subFixed = ethers.utils.formatEther(subFixed);
    maxFixed = maxFixed - subFixed;
    setAmount(maxFixed.toString());
  };

  // function from supplyFixed.js
  const supplyFixed = async () => {
    setIsLoading(true);
    try {
      let amountWei;
      if (max) {
        amountWei = ethers.BigNumber.from(max);
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
        <div style={{ height: '20%' }}>
          {statusTable()}
        </div>
        <Divider sx={{ bgcolor: '#FBFBEC', marginTop: '10px', marginBottom: '10px' }} />
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
            setMax(null);
          }}
          InputProps={{
            style: { backgroundColor: '#FFFFFF' },
            endAdornment: (
              <InputAdornment position="end">
                <Button size="small" onClick={handleMaxClick}>
                  Max
                </Button>
              </InputAdornment>
            ),
          }}
        />
        <div style={{ display: 'flex', marginTop: '5px' }}>
          <Button 
            variant="contained" 
            style={{ fontSize: '0.7rem', flex: 1, padding: '10px 20px' }} 
            sx={{ backgroundColor: '#99CEFF', color: '#FFFFFF', mr: '0.5px', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            disabled={isLoading}
            onClick={supplyFixed}
          >
            {isLoading ? (
              <>
                <CircularProgress size={24} />
                <span style={{ marginLeft: "10px" }}>Transacting...</span>
              </>
            ) : (
              'Supply Fixed'
            )}
          </Button>
          <Button 
            variant="contained" 
            style={{ fontSize: '0.7rem', flex: 1, padding: '10px 20px' }} 
            sx={{ backgroundColor: '#99CEFF', color: '#FFFFFF', ml: '0.5px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            Supply Variable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoolCard;

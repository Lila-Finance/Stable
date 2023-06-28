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
import { ethers } from "ethers";
import { approveSpend, sendParams } from "./Provider";
import { poolDeployerContract } from "./Provider";
import PoolAbi from "../abi/Pool.json";
import FixedNFTAbi from "../abi/FixedNFT.json";
import VariableNFTAbi from "../abi/VariableNFT.json";
import FixedNFTs from "./FixedNFTs";

const poolAbi = PoolAbi.abi;
const fixedNFTAbi = FixedNFTAbi.abi;
const variableNFTAbi = VariableNFTAbi.abi;

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const PositionCard = ({ status, address, numPools, poolNum }) => {
  const [poolStatus, setPoolStatus] = useState(null);
  // State to handle "Fix" and "Variable" toggle button
  const [supplyType, setSupplyType] = useState('Variable');
  // state from supplyFixed.js
  const [fixMax, setFixMax] = useState(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // state from supplyVariable.js
  const [varMax, setVarMax] = useState(null);
  // state from FixedNFTData.js
  const [fixedSupply, setFixedSupply] = useState(0);
  const [fixedLimit, setFixedLimit] = useState(0);
  // state from VariableNFTData.js
  const [variableSupply, setVariableSupply] = useState(0);
  const [variableLimit, setVariableLimit] = useState(0);
  // state from App.js
  const [poolContract, setPoolContract] = useState(null);
  const [fixedNFTContract, setFixedNFTContract] = useState(null);
  const [variableNFTContract, setVariableNFTContract] = useState(null);
  const [lockDuration, setLockDuration] = useState(0);
  const [timeSinceStart, setTimeSinceStart] = useState(0);
  const [fixedRate, setFixedRate] = useState(ethers.BigNumber.from("0"));
  const [variableRate, setVariableRate] = useState(ethers.BigNumber.from("0"));

  // function from App.js
  useEffect(() => {
    async function setPool() {
      if (numPools > 0) {
        const poolInfo = await poolDeployerContract.pools(poolNum % numPools);
        const poolContract = new ethers.Contract(poolInfo, poolAbi, signer);
        const fixedNFTContract = new ethers.Contract(
          await poolContract.fixedNFT(),
          fixedNFTAbi,
          signer
        );
        const variableNFTContract = new ethers.Contract(
          await poolContract.variableNFT(),
          variableNFTAbi,
          signer
        );
        setPoolContract(poolContract);
        setFixedNFTContract(fixedNFTContract);
        setVariableNFTContract(variableNFTContract);
      }
      //const pools = await poolDeployerContract.getPools();
    }
    if (address) {
      setPool();
    }
  }, [poolNum, address, numPools]);

  // function from App.js 
  useEffect(() => {
    async function setRate() {
      const rates = await poolContract.interests();
      const lockDuration = await poolContract.lockDuration();
      const secondsInADay = 86400;
      const lockDurationInDays = lockDuration.div(secondsInADay);

      setLockDuration(`${lockDurationInDays.toString()}D`);
      const timeSinceStart = await poolContract.timeSinceStart();
      const timeSinceStartInDays = timeSinceStart.div(secondsInADay);
      setTimeSinceStart(`${timeSinceStartInDays.toString()} days`);

      setFixedRate(rates[0]);
      setVariableRate(rates[1]);
    }
    if (poolContract) {
      setRate();
    }
  }, [poolContract]);

 // function from FixedNFTData.js
 useEffect(() => {
  async function fetchData() {
    let fixedSupply = await poolContract.totalDepositedFixed();
    setFixedSupply(fixedSupply);
    let limitFixed = await poolContract.fixedPoolLimit();
    setFixedLimit(limitFixed);

    let variableSupply = await poolContract.totalDepositedVariable();
    setVariableSupply(variableSupply);
    let limitVariable = await poolContract.variablePoolLimit();
    setVariableLimit(limitVariable);
  }
  fetchData();
}, [poolContract]);

// need claim interest and exit vault options
// same style as pool card - fork

const PositionCard = ({ status, address, numPools, poolNum }) => {
  const poolDataTable = () => (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}> </TableCell>
          <TableCell size="small" align="right" style={{ color: "#9C9CA6", border: 'none' }}>Fixed</TableCell>
          <TableCell size="small" align="right" style={{ color: "#9C9CA6", border: 'none' }}>Variable</TableCell>
        </TableRow>
        <TableRow>
          <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>APR</TableCell>
          <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>{ethers.utils.formatEther(fixedRate)}%</TableCell>
          <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>{ethers.utils.formatEther(variableRate)}%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Cap</TableCell>
          <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>{ethers.utils.formatEther(fixedLimit)} DAI</TableCell>
          <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>{ethers.utils.formatEther(variableLimit)} DAI</TableCell>
        </TableRow>
        <TableRow>
          <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}>Deposits</TableCell>
          <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>{ethers.utils.formatEther(fixedSupply)} DAI</TableCell>
          <TableCell size="small" align="right" style={{ color: "#4C4C51", border: 'none' }}>{ethers.utils.formatEther(variableSupply)} DAI</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )

  const statusTable = () => {
    const emptyRow = (
      <TableRow>
        <TableCell size="small" component="th" scope="row" style={{ color: "#9C9CA6", border: 'none' }}></TableCell>
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
  <Card variant="outlined" sx={{ borderColor: '#FBFBEC', backgroundColor: '#ECECFB', borderRadius: '10px', height:'100%' }}>
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
            DAI (Aave) <strong>{lockDuration}</strong>
          </div>
          {poolStatus && <img src={poolStatus} alt="status ellipse" style={{ width: '10%', height: '10%', marginLeft: 'auto' }}/>}
        </Typography>
        <Divider sx={{ bgcolor: '#FBFBEC' }} />
        {poolDataTable()}
        <Divider sx={{ bgcolor: '#FBFBEC', marginTop: '10px', marginBottom: '10px' }} />
        {statusTable()}
        <Divider sx={{ bgcolor: '#FBFBEC', marginTop: '10px', marginBottom: '10px' }} />
        
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Button
        variant="contained"
        fullWidth={true}
        style={{ fontSize: '0.7rem', flex: 1, padding: '10px 20px' }} 
        sx={{ marginTop: '10px', backgroundColor: '#99CEFF', color: '#FFFFFF' }}
        onClick={() => {
          window.open(
            `https://sepolia.etherscan.io/nft/${fixedNFTContract.address}/${fixedNFTContract.tokenId}`,
            "_blank"
          );
        }}
      >
        View Position: ${fixedNFTContract.address}
      </Button>

        <Divider sx={{ bgcolor: '#FBFBEC', marginTop: '10px', marginBottom: '10px' }} />

        <Button 
          variant="contained"
          fullWidth={true}
          style={{ fontSize: '0.7rem', flex: 1, padding: '10px 20px' }} 
          sx={{ marginTop:'10px', backgroundColor: '#99CEFF', color: '#FFFFFF' }}
          disabled={isLoading}
          // have claim interest function here
          // is clickable attribute
          onClick={null}
        >
          {isLoading ? (
            <>
              <CircularProgress size={24} />
              <span style={{ marginLeft: "10px" }}>Transacting...</span>
            </>
          ) : (
            'Claim Interest'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
}

export default PositionCard;
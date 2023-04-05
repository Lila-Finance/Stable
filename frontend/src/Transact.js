import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import FixedNFTAbi from "./abi/FixedNFT.json";
import VariableNFTAbi from "./abi/VariableNFT.json";
import AavePoolSupplyWithNFTAbi from "./abi/AavePoolSupplyWithNFT.json";
import IERC20Abi from "./abi/IERC20.json";
import addresses from "./addresses/addresses.json";

const {
  DAI_ADDRESS,
  AAVE_ADDRESSES_PROVIDER,
  FIXED_NFT_ADDRESS,
  VARIABLE_NFT_ADDRESS,
  AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS,
} = addresses;

const fixedNFTAbi = FixedNFTAbi.abi;
const variableNFTAbi = VariableNFTAbi.abi;
const aavePoolSupplyWithNFTAbi = AavePoolSupplyWithNFTAbi.abi;
const erc20Abi = IERC20Abi.abi;

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const daiContract = new ethers.Contract(DAI_ADDRESS, erc20Abi, signer);

const fixedNFTContract = new ethers.Contract(
  FIXED_NFT_ADDRESS,
  fixedNFTAbi,
  signer
);
const variableNFTContract = new ethers.Contract(
  VARIABLE_NFT_ADDRESS,
  variableNFTAbi,
  signer
);
const aavePoolSupplyWithNFTContract = new ethers.Contract(
  AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS,
  aavePoolSupplyWithNFTAbi,
  signer
);

const sendParams = {
  /*gasLimit: 1000000,
  gasPrice: ethers.utils.parseUnits("10", "gwei"),*/
};

async function approveSpend(walletAddress, amount) {
  const amountWei = ethers.utils.parseEther(amount);
  const allowance = await daiContract.allowance(
    walletAddress,
    AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS
  );
  if (allowance.lt(amountWei)) {
    const amountWithBuffer = amountWei.mul(110).div(100);
    const tx = await daiContract.approve(
      AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS,
      amountWithBuffer
    );
    console.log("Approval transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log(
      "Approval transaction confirmed in block:",
      receipt.blockNumber
    );
  }
  return amountWei;
}

function SupplyFixed({ address }) {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");

  const supplyFixed = async () => {
    try {
      let amountWei = await approveSpend(address, amount);
      //update to use contract with others
      await aavePoolSupplyWithNFTContract.supplyFixed(
        amountWei,
        0,
        days,
        sendParams
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Supply Fixed</h2>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label>Days in the past:</label>
        <input
          type="number"
          step="0.0001"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
      </div>
      <button onClick={supplyFixed}>Supply</button>
    </div>
  );
}

function SupplyVariable({ address }) {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");

  const supplyVariable = async () => {
    try {
      let amountWei = await approveSpend(address, amount);
      //update to use contract with others
      await aavePoolSupplyWithNFTContract.supplyVariable(
        amountWei,
        days,
        sendParams
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Supply Variable</h2>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label>Days in the past:</label>
        <input
          type="number"
          step="0.0001"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
      </div>
      <button onClick={supplyVariable}>Supply</button>
    </div>
  );
}

function NFTData() {
  const [fixedSupply, setFixedSupply] = useState(0);
  const [fixedInterestRate, setFixedInterestRate] = useState(0);
  const [variableSupply, setVariableSupply] = useState(0);
  const [variableInterestRate, setVariableInterestRate] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const rates = await aavePoolSupplyWithNFTContract.interests();

      const fixedRateInDecimals = ethers.BigNumber.from(rates[0]);
      const variableRateInDecimals = ethers.BigNumber.from(rates[1]);

      const divisor = ethers.BigNumber.from("10000000"); // Equivalent to 1e12

      const fixedRateDivided = fixedRateInDecimals.div(divisor);
      const variableRateDivided = variableRateInDecimals.div(divisor);

      setFixedInterestRate(fixedRateDivided);
      setVariableInterestRate(variableRateDivided);

      const multiplier = ethers.BigNumber.from("10000000000");
      let fixedSupply = await aavePoolSupplyWithNFTContract.fixedSupply();
      fixedSupply = fixedSupply.mul(multiplier);
      setFixedSupply(fixedSupply);

      let variableSupply = await aavePoolSupplyWithNFTContract.variableSupply();
      setVariableSupply(variableSupply);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h2>Data</h2>
      <div>
        <h3>Fixed Pool</h3>
        <div>Supply: {ethers.utils.formatEther(fixedSupply)} DAI</div>
        <div>Interest Rate: {ethers.utils.formatEther(fixedInterestRate)}%</div>
      </div>
      <div>
        <h3>Variable Pool</h3>
        <div>Supply: {ethers.utils.formatEther(variableSupply)} DAI</div>
        <div>
          Interest Rate: {ethers.utils.formatEther(variableInterestRate)}%
        </div>
      </div>
    </div>
  );
}

function FixedNFTs({ address }) {
  const [fixedNFTs, setFixedNFTs] = useState([]);

  useEffect(() => {
    async function getFixedNFTs() {
      try {
        const filter = fixedNFTContract.filters.Transfer(null, null);
        const transferEvents = await fixedNFTContract.queryFilter(filter);

        let myFixedNFTs = await Promise.all(
          transferEvents
            .filter((event) => event.args.to === address)
            .map(async (event) => {
              const tokenId = event.args.tokenId.toNumber();
              if (tokenId === null) {
                return null;
              }
              try {
                const owner = await fixedNFTContract.ownerOf(tokenId);
                if (owner !== address) {
                  return null;
                }
              } catch (err) {
                return null; // Skip if token does not exist
              }
              const rates = await aavePoolSupplyWithNFTContract.calcFixed(
                tokenId
              );
              return {
                tokenId,
                value: ethers.utils.formatEther(rates[0]),
                interest: ethers.utils.formatEther(rates[1]),
              };
            })
        );
        myFixedNFTs = myFixedNFTs.filter((nft) => nft !== null);

        setFixedNFTs(myFixedNFTs);
      } catch (err) {
        console.error(err);
      }
    }

    getFixedNFTs();
  }, [address]);

  const redeemFixed = async (tokenId) => {
    try {
      await aavePoolSupplyWithNFTContract.redeemFixed(tokenId, sendParams);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>My Fixed NFTs</h2>
      {fixedNFTs.map((fixedNFT) => (
        <div key={fixedNFT.tokenId}>
          <div>Token ID: {fixedNFT.tokenId}</div>
          <div>Value: {fixedNFT.value}</div>
          <div>Interest: {fixedNFT.interest}</div>
          <button onClick={() => redeemFixed(fixedNFT.tokenId)}>
            Redeem Fixed
          </button>
        </div>
      ))}
    </div>
  );
}

function VariableNFTs({ address }) {
  const [variableNFTs, setVariableNFTs] = useState([]);

  useEffect(() => {
    async function getVariableNFTs() {
      try {
        const filter = variableNFTContract.filters.Transfer(null, null);
        const transferEvents = await variableNFTContract.queryFilter(filter);

        let myVariableNFTs = await Promise.all(
          transferEvents
            .filter((event) => event.args.to === address)
            .map(async (event) => {
              const tokenId = event.args.tokenId.toNumber();
              try {
                const owner = await variableNFTContract.ownerOf(tokenId);
                if (owner !== address) {
                  return null;
                }
              } catch (err) {
                return null; // Skip if token does not exist
              }
              let rates = await aavePoolSupplyWithNFTContract.calcVariable(
                tokenId
              );
              return {
                tokenId: tokenId,
                value: ethers.utils.formatEther(rates[0]),
                interest: ethers.utils.formatEther(rates[1]),
              };
            })
        );
        myVariableNFTs = myVariableNFTs.filter((nft) => nft !== null);

        setVariableNFTs(myVariableNFTs);
      } catch (err) {
        console.error(err);
      }
    }

    getVariableNFTs();
  }, [address]);

  const redeemVariable = async (tokenId) => {
    try {
      await aavePoolSupplyWithNFTContract.redeemVariable(tokenId, sendParams);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>My Variable NFTs</h2>
      {variableNFTs.map((variableNFT) => (
        <div key={variableNFT.tokenId}>
          <div>Token ID: {variableNFT.tokenId}</div>
          <div>Value: {variableNFT.value}</div>
          <div>Interest: {variableNFT.interest}</div>
          <button onClick={() => redeemVariable(variableNFT.tokenId)}>
            Redeem Variable
          </button>
        </div>
      ))}
    </div>
  );
}

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
    <div>
      <h2>Fund Fixed</h2>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button onClick={fundFixed}>Fund Fixed</button>
    </div>
  );
}

function FundVariable({ address }) {
  const [amount, setAmount] = useState("");

  const fundVariable = async () => {
    try {
      let amountWei = await approveSpend(address, amount);
      await aavePoolSupplyWithNFTContract.fundVariable(amountWei, sendParams);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Fund Variable</h2>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button onClick={fundVariable}>Fund Variable</button>
    </div>
  );
}

export {
  SupplyFixed,
  SupplyVariable,
  NFTData,
  FixedNFTs,
  VariableNFTs,
  FundFixed,
  FundVariable,
};

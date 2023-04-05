import React, { useState } from "react";
import { ethers } from "ethers";
import {
  SupplyFixed,
  SupplyVariable,
  NFTData,
  FixedNFTs,
  VariableNFTs,
  FundFixed,
  FundVariable,
} from "./Transact";

function App() {
  const [web3Provider, setWeb3Provider] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setWeb3Provider(web3Provider);

        const accounts = await web3Provider.listAccounts();
        setSelectedAddress(accounts[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>Connect to wallet</button>
      <div>Provider: {web3Provider && web3Provider.provider.chainId}</div>
      <div>Selected address: {selectedAddress}</div>
      <NFTData address={selectedAddress} />
      <SupplyFixed address={selectedAddress} />
      <SupplyVariable address={selectedAddress} />
      <FixedNFTs address={selectedAddress} />
      <VariableNFTs address={selectedAddress} />
      <FundFixed address={selectedAddress} />
      <FundVariable address={selectedAddress} />
    </div>
  );
}

export default App;

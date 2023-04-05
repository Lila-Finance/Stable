import { HardhatUserConfig } from "hardhat/types";

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.10",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [
        process.env.SEPOLIA_PRIVATE_KEY as string,
        process.env.SEPOLIA_PRIVATE_KEY_2 as string,
      ],
      gas: 8000000,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [
        process.env.SEPOLIA_PRIVATE_KEY as string,
        process.env.SEPOLIA_PRIVATE_KEY_2 as string,
      ],
    },
  },
  defaultNetwork: "sepolia",
  mocha: {
    timeout: 60000, // 60 seconds
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;

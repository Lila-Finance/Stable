// scripts/deploy.ts
//@ts-ignore
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const DAI_ADDRESS = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const AAVE_ADDRESSES_PROVIDER = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";

async function main() {
  const PoolDeployerFactory = await ethers.getContractFactory("PoolDeployer");
  const poolDeployer = await PoolDeployerFactory.deploy();
  await poolDeployer.deployed();
  console.log("PoolDeployer deployed to:", poolDeployer.address);

  // Copy ABIs to frontend
  const abiDir = path.join(__dirname, "../frontend/src/abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  for (const contractName of [
    "PoolDeployer",
    "Pool",
    "FixedNFT",
    "VariableNFT",
  ]) {
    fs.copyFile(
      path.join(
        __dirname,
        `../artifacts/contracts/${contractName}.sol/${contractName}.json`
      ),
      path.join(abiDir, `${contractName}.json`),
      (err) => {
        if (err) throw err;
        console.log(`${contractName} ABI copied to frontend`);
      }
    );
  }

  // Write addresses to JSON file
  const addresses = {
    POOL_DEPLOYER_ADDRESS: poolDeployer.address,
    DAI_ADDRESS,
    AAVE_ADDRESSES_PROVIDER,
  };
  const addressDir = path.join(__dirname, "../frontend/src/addresses");
  if (!fs.existsSync(addressDir)) {
    fs.mkdirSync(addressDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(addressDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("Addresses written to file:", addresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

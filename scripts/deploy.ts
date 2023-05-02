// scripts/deploy.ts
//@ts-ignore
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const TokenFactory = await ethers.getContractFactory("Token");
  const token = await TokenFactory.deploy();
  await token.deployed();
  console.log("Token deployed to:", token.address);

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
    "Token",
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
    TOKEN_ADDRESS: token.address,
    POOL_DEPLOYER_ADDRESS: poolDeployer.address,
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

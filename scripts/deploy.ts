// scripts/deploy.ts
//@ts-ignore
import { ethers, upgrades } from "hardhat";
import fs from "fs";
import path from "path";

const DAI_ADDRESS = "0x68194a729C2450ad26072b3D33ADaCbcef39D574";
const AAVE_ADDRESSES_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F";

async function main() {
  const PoolDeployerFactory = await ethers.getContractFactory("PoolDeployer");
  const poolDeployer = await PoolDeployerFactory.deploy();
  await poolDeployer.deployed();
  console.log("PoolDeployer deployed to:", poolDeployer.address);

  const PoolLogicFactory = await ethers.getContractFactory("PoolLogic");
  const poolLogic = await upgrades.deployProxy(PoolLogicFactory);
  await poolLogic.deployed();
  console.log("PoolLogic deployed to:", poolLogic.address);

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
    "PoolLogic",
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
    POOL_LOGIC_ADDRESS: poolLogic.address,
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

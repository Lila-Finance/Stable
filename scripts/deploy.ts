const path = require("path");
const fs = require("fs");

const DAI_ADDRESS = "0x68194a729C2450ad26072b3D33ADaCbcef39D574";
const AAVE_ADDRESSES_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F";

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const FixedNFT = await ethers.getContractFactory("FixedNFT");
  const fixedNFT = await FixedNFT.deploy("FixedNFT", "FNFT");
  await fixedNFT.deployed();

  const VariableNFT = await ethers.getContractFactory("VariableNFT");
  const variableNFT = await VariableNFT.deploy("VariableNFT", "VNFT");
  await variableNFT.deployed();

  const AavePoolSupplyWithNFT = await ethers.getContractFactory(
    "AavePoolSupplyWithNFT"
  );
  const aavePoolSupplyWithNFT = await AavePoolSupplyWithNFT.deploy(
    AAVE_ADDRESSES_PROVIDER, // Aave Addresses Provider address
    DAI_ADDRESS, // DAI address
    fixedNFT.address,
    variableNFT.address
  );
  await aavePoolSupplyWithNFT.deployed();

  console.log("FixedNFT deployed to:", fixedNFT.address);
  console.log("VariableNFT deployed to:", variableNFT.address);
  console.log(
    "AavePoolSupplyWithNFT deployed to:",
    aavePoolSupplyWithNFT.address
  );

  // Copy ABIs to frontend
  const abiDir = path.join(__dirname, "../frontend/src/abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  fs.copyFile(
    path.join(__dirname, "../artifacts/contracts/FixedNFT.sol/FixedNFT.json"),
    path.join(abiDir, "FixedNFT.json"),
    (err) => {
      if (err) throw err;
      console.log("FixedNFT ABI copied to frontend");
    }
  );
  fs.copyFile(
    path.join(
      __dirname,
      "../artifacts/contracts/VariableNFT.sol/VariableNFT.json"
    ),
    path.join(abiDir, "VariableNFT.json"),
    (err) => {
      if (err) throw err;
      console.log("VariableNFT ABI copied to frontend");
    }
  );
  fs.copyFile(
    path.join(
      __dirname,
      "../artifacts/contracts/Aave.sol/AavePoolSupplyWithNFT.json"
    ),
    path.join(abiDir, "AavePoolSupplyWithNFT.json"),
    (err) => {
      if (err) throw err;
      console.log("AavePoolSupplyWithNFT ABI copied to frontend");
    }
  );
  // Write addresses to JSON file
  const addresses = {
    DAI_ADDRESS,
    AAVE_ADDRESSES_PROVIDER,
    FIXED_NFT_ADDRESS: fixedNFT.address,
    VARIABLE_NFT_ADDRESS: variableNFT.address,
    AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS: aavePoolSupplyWithNFT.address,
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

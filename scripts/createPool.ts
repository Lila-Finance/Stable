//@ts-ignore
import { ethers, upgrades } from "hardhat";
import addresses from "../frontend/src/addresses/addresses.json";

async function main() {
  const fixedPoolLimit = ethers.utils.parseEther("100"); // Placeholder value
  const lockDurationDays = 30.417; // Placeholder value
  const interestRatePercentage = ethers.utils.parseEther("2"); // Placeholder value

  const lockDuration = Math.round(lockDurationDays * 24 * 60 * 60); // Convert days to seconds

  // Retrieve the necessary contract factories
  const PoolDeployerFactory = await ethers.getContractFactory("PoolDeployer");
  const PoolLogicFactory = await ethers.getContractFactory("PoolLogic");

  // Initialize the PoolLogic contract
  const poolLogic = PoolLogicFactory.attach(addresses.POOL_LOGIC_ADDRESS);

  // Initialize the PoolDeployer contract
  const poolDeployer = PoolDeployerFactory.attach(
    addresses.POOL_DEPLOYER_ADDRESS
  );

  // Create the pool
  const tx = await poolDeployer.createPool(
    addresses.AAVE_ADDRESSES_PROVIDER,
    addresses.DAI_ADDRESS,
    fixedPoolLimit,
    lockDuration,
    interestRatePercentage,
    addresses.POOL_LOGIC_ADDRESS
  );
  const receipt = await tx.wait();
  console.log("Pool created. Transaction hash:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

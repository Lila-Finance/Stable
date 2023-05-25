//@ts-ignore
import { ethers, upgrades } from "hardhat";
import addresses from "../frontend/src/addresses/addresses.json";

async function main() {
  const PoolLogicFactory = await ethers.getContractFactory("PoolLogic");
  const poolLogic = await upgrades.upgradeProxy(
    addresses.POOL_LOGIC_ADDRESS,
    PoolLogicFactory
  );
  console.log("PoolLogic upgraded");
}

main();

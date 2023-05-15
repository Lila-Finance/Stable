import { expect } from "chai";
//@ts-ignore
import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber } from "ethers";

import { IERC20 } from "../typechain-types/@openzeppelin/contracts/token/ERC20/IERC20";

const DAI_ADDRESS = "0x68194a729C2450ad26072b3D33ADaCbcef39D574";
const AAVE_ADDRESSES_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F";

const poolLimit = ethers.utils.parseEther("500");
const lockDuration = 365 * 24 * 60 * 5; // 1 month
const fixedInterestRate = ethers.utils.parseEther("10");
let variablePoolLimit: ethers.BigNumber = null;

describe("Pool Contract", function () {
  let FixedNFT: ContractFactory;
  let VariableNFT: ContractFactory;
  let PoolDeployer: ContractFactory;
  let Pool: ContractFactory;
  let fixedNFT: Contract;
  let dai: IERC20;
  let variableNFT: Contract;
  let poolDeployer: Contract;
  let pool: Contract;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  beforeEach(async () => {
    FixedNFT = await ethers.getContractFactory("FixedNFT");
    VariableNFT = await ethers.getContractFactory("VariableNFT");
    Pool = await ethers.getContractFactory("Pool");
    PoolDeployer = await ethers.getContractFactory("PoolDeployer"); // Add this line
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    poolDeployer = await PoolDeployer.deploy();
    await poolDeployer.deployed();

    await poolDeployer.createPool(
      AAVE_ADDRESSES_PROVIDER,
      DAI_ADDRESS,
      poolLimit,
      lockDuration,
      fixedInterestRate
    );

    const poolInfoIndex = (await poolDeployer.getPoolLength()) - 1;
    console.log(poolInfoIndex);

    //const poolInfoIndex = (await poolDeployer.getPoolLength()) - 1;
    //const poolInfo = await poolDeployer.pools(poolInfoIndex);

    /*pool = Pool.attach(poolInfo);
    fixedNFT = FixedNFT.attach(await pool.fixedNFT());
    variableNFT = VariableNFT.attach(await pool.variableNFT());

    variablePoolLimit = await pool.calculateInterest(
      poolLimit,
      fixedInterestRate,
      lockDuration
    );

    dai = await ethers.getContractAt("IERC20", DAI_ADDRESS);
    await dai.connect(owner).approve(pool.address, ethers.constants.MaxUint256);*/
  });

  describe("Deposit", function () {
    it("Should deposit DAI into the pool", async function () {
      // Code here to test depositFixed and depositVariable
    });
  });
});

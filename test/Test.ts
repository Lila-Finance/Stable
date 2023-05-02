import { expect } from "chai";
//@ts-ignore
import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber } from "ethers";

const poolLimit = ethers.utils.parseEther("500");
const lockDuration = 365 * 24 * 60 * 5; // 1 month
const dailyInterestRates = [ethers.utils.parseEther("11")];
const fixedInterestRate = ethers.utils.parseEther("10");
let variablePoolLimit: ethers.BigNumber = null;

describe("Fixed Interest Pool", () => {
  let Token: ContractFactory;
  let FixedNFT: ContractFactory;
  let VariableNFT: ContractFactory;
  let PoolDeployer: ContractFactory;
  let Pool: ContractFactory;
  let token: Contract;
  let fixedNFT: Contract;
  let variableNFT: Contract;
  let poolDeployer: Contract;
  let pool: Contract;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  beforeEach(async () => {
    Token = await ethers.getContractFactory("Token");
    FixedNFT = await ethers.getContractFactory("FixedNFT");
    VariableNFT = await ethers.getContractFactory("VariableNFT");
    Pool = await ethers.getContractFactory("Pool");
    PoolDeployer = await ethers.getContractFactory("PoolDeployer"); // Add this line
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    token = await Token.deploy();
    await token.deployed();

    // Deploy PoolDeployer
    poolDeployer = await PoolDeployer.deploy();
    await poolDeployer.deployed();

    // Use createPool function from PoolDeployer
    await poolDeployer.createPool(
      token.address,
      poolLimit,
      lockDuration,
      fixedInterestRate,
      dailyInterestRates
    );

    // Get the last PoolInfo element
    const poolInfoIndex = (await poolDeployer.getPoolLength()) - 1;
    const poolInfo = await poolDeployer.pools(poolInfoIndex);

    pool = Pool.attach(poolInfo);
    fixedNFT = FixedNFT.attach(await pool.fixedNFT());
    variableNFT = VariableNFT.attach(await pool.variableNFT());

    variablePoolLimit = await pool.calculateInterest(
      poolLimit,
      fixedInterestRate,
      lockDuration
    );
  });

  it("Should mint tokens from faucet", async () => {
    const faucetMintAmount = ethers.utils.parseEther("200");
    await token.connect(addr1).mintFromFaucet(faucetMintAmount);
    expect(await token.balanceOf(addr1.address)).to.equal(faucetMintAmount);
  });

  it("Should deposit tokens to FixedPool and mint FixedNFT", async () => {
    const depositAmount = ethers.utils.parseEther("200");
    await token.connect(addr1).mintFromFaucet(depositAmount);
    await token.connect(addr1).approve(pool.address, depositAmount);
    await pool.connect(addr1).depositFixed(depositAmount);

    expect(await fixedNFT.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should not allow withdrawal before lock duration", async () => {
    const depositAmount = poolLimit + variablePoolLimit;
    await token.connect(addr1).mintFromFaucet(depositAmount);
    await token.connect(addr1).approve(pool.address, depositAmount);
    await pool.connect(addr1).depositFixed(poolLimit);
    await pool.connect(addr1).depositVariable(variablePoolLimit);

    //const variableAmount = ethers.utils.parseEther("100");

    await expect(pool.connect(addr1).withdrawFixed(0)).to.be.rejectedWith(
      "Tokens are still locked"
    );
  });

  it("Should allow withdrawal after lock duration", async () => {
    const depositAmount = poolLimit + variablePoolLimit;
    await token.connect(addr1).mintFromFaucet(depositAmount);
    await token.connect(addr1).approve(pool.address, depositAmount);
    await pool.connect(addr1).depositFixed(poolLimit);
    await pool.connect(addr1).depositVariable(variablePoolLimit);

    // Fast forward time to simulate lock duration
    await pool.connect(owner).fastForward(lockDuration);

    const balanceBeforeWithdraw = await token.balanceOf(addr1.address);
    await pool.connect(addr1).withdrawFixed(0);
    await pool.connect(addr1).withdrawVariable(0);
    const balanceAfterWithdraw = await token.balanceOf(addr1.address);

    expect(balanceAfterWithdraw.gt(balanceBeforeWithdraw)).to.be.true;
    expect(await fixedNFT.balanceOf(addr1.address)).to.equal(0);
  });

  it("prints fixed and variable interest rates after 2 days", async function () {
    const initialInterestRates = await pool.interests();
    console.log(
      "Initial fixed interest rate:",
      ethers.utils.formatUnits(initialInterestRates[0], 16),
      "%"
    );
    console.log(
      "Initial variable interest rate:",
      ethers.utils.formatUnits(initialInterestRates[1], 16),
      "%"
    );

    const depositAmount = poolLimit + variablePoolLimit;
    await token.connect(addr1).mintFromFaucet(depositAmount);
    await token.connect(addr1).approve(pool.address, depositAmount);
    await pool.connect(addr1).depositFixed(poolLimit);
    await pool.connect(addr1).depositVariable(variablePoolLimit);
    const days = 6;
    await pool.fastForward(Math.round(days * 24 * 60 * 60));

    const interestRatesAfter2Days = await pool.interests();
    console.log(
      `Fixed interest rate after ${days} days:`,
      ethers.utils.formatUnits(interestRatesAfter2Days[0], 16),
      "%"
    );
    console.log(
      `Variable interest rate after ${days} days:`,
      ethers.utils.formatUnits(interestRatesAfter2Days[1], 16),
      "%"
    );
  });
});

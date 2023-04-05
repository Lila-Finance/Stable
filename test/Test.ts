import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { IERC20 } from "../typechain-types/@openzeppelin/contracts/token/ERC20/IERC20";

const DAI_ADDRESS = "0x68194a729C2450ad26072b3D33ADaCbcef39D574";
const AAVE_ADDRESSES_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F";

describe("AavePoolSupplyWithNFT", function () {
  let owner: Signer;
  let addr1: Signer;
  let dai: IERC20;
  let fixednft: Contract;
  let variablenft: Contract;
  let aavePoolSupplyWithNFT: Contract;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    fixednft = await (
      await ethers.getContractFactory("FixedNFT")
    ).deploy("FixedNFT", "FNFT");
    await fixednft.deployed();

    variablenft = await (
      await ethers.getContractFactory("VariableNFT")
    ).deploy("VariableNFT", "VNFT");
    await variablenft.deployed();

    aavePoolSupplyWithNFT = await (
      await ethers.getContractFactory("AavePoolSupplyWithNFT")
    ).deploy(
      AAVE_ADDRESSES_PROVIDER,
      DAI_ADDRESS,
      fixednft.address,
      variablenft.address
    );
    await aavePoolSupplyWithNFT.deployed();

    dai = await ethers.getContractAt("IERC20", DAI_ADDRESS);
    await dai
      .connect(owner)
      .approve(aavePoolSupplyWithNFT.address, ethers.constants.MaxUint256);

    const startTx = await aavePoolSupplyWithNFT
      .connect(owner)
      .start(ethers.utils.parseEther("10"));

    // Wait for the transaction to be mined
    await startTx.wait();
  });

  it("should redeem the DAI from the Aave pool and burn the Sepolia NFT", async function () {
    // Define amount and referral code
    const amount = ethers.utils.parseEther("5");

    // Supply DAI to the pool, approve max amount

    console.log("Supplying DAI to the pool, ", amount.toString());
    const supplyTx = await aavePoolSupplyWithNFT
      .connect(owner)
      .supplyFixed(amount, 0, 365);

    // Wait for the transaction to be mined
    await supplyTx.wait();

    // Get the token ID of the minted NFT
    const tokenId = (await fixednft.totalSupply()) - 1;

    const [fixedInterest, variableInterest] =
      await aavePoolSupplyWithNFT.interests();
    console.log(`Fixed Interest: ${fixedInterest}`);
    console.log(`Variable Interest: ${variableInterest}`);

    const variableSupply = await aavePoolSupplyWithNFT.variableSupply();
    console.log(`Variable Supply: ${variableSupply}`);

    const fixedSupply = await aavePoolSupplyWithNFT.fixedSupply();
    console.log(`Fixed Supply: ${fixedSupply}`);

    const [fix_amount, interest] = await aavePoolSupplyWithNFT.calcFixed(
      tokenId
    );
    console.log(`Fixed NFT Amount: ${fix_amount}`);
    console.log(`Fixed NFT Interest: ${interest}`);

    /*// Redeem DAI from the pool
    const redeemTx = await aavePoolSupplyWithNFT.connect(owner).redeem(tokenId);

    // Wait for the transaction to be mined
    await redeemTx.wait();

    // Get the final DAI balance of the owner
    const finalBalance = await dai.balanceOf(await owner.getAddress());
    console.log("Final DAI balance: ", finalBalance.toString());*/
  });
});

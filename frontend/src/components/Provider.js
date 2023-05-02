import { ethers } from "ethers";
import TokenAbi from "../abi/Token.json";
import PoolDeployerAbi from "../abi/PoolDeployer.json";
import addresses from "../addresses/addresses.json";

const { TOKEN_ADDRESS, POOL_DEPLOYER_ADDRESS } = addresses;

const tokenAbi = TokenAbi.abi;
const poolDeployerAbi = PoolDeployerAbi.abi;

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
const poolDeployerContract = new ethers.Contract(
  POOL_DEPLOYER_ADDRESS,
  poolDeployerAbi,
  signer
);

const sendParams = {
  /*gasLimit: 1000000,
  gasPrice: ethers.utils.parseUnits("10", "gwei"),*/
};

async function approveSpend(walletAddress, amount, poolContract) {
  const amountWei = ethers.utils.parseEther(amount);
  const userBalance = await tokenContract.balanceOf(walletAddress);
  if (userBalance.lt(amountWei)) {
    // Show an error message to the user
    console.error("Insufficient balance");
    return;
  }

  const allowance = await tokenContract.allowance(
    walletAddress,
    poolContract.address
  );
  if (allowance.lt(amountWei)) {
    const tx = await tokenContract.approve(poolContract.address, amountWei);
    const receipt = await tx.wait();
  }

  return amountWei;
}

export {
  provider,
  signer,
  tokenContract,
  poolDeployerContract,
  sendParams,
  approveSpend,
};

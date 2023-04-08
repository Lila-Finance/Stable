import { ethers } from "ethers";
import FixedNFTAbi from "../abi/FixedNFT.json";
import VariableNFTAbi from "../abi/VariableNFT.json";
import AavePoolSupplyWithNFTAbi from "../abi/AavePoolSupplyWithNFT.json";
import IERC20Abi from "../abi/IERC20.json";
import addresses from "../addresses/addresses.json";

const {
    DAI_ADDRESS,
    AAVE_ADDRESSES_PROVIDER,
    FIXED_NFT_ADDRESS,
    VARIABLE_NFT_ADDRESS,
    AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS,
  } = addresses;


const fixedNFTAbi = FixedNFTAbi.abi;
const variableNFTAbi = VariableNFTAbi.abi;
const aavePoolSupplyWithNFTAbi = AavePoolSupplyWithNFTAbi.abi;
const erc20Abi = IERC20Abi.abi;

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const daiContract = new ethers.Contract(DAI_ADDRESS, erc20Abi, signer);

const fixedNFTContract = new ethers.Contract(
  FIXED_NFT_ADDRESS,
  fixedNFTAbi,
  signer
);
const variableNFTContract = new ethers.Contract(
  VARIABLE_NFT_ADDRESS,
  variableNFTAbi,
  signer
);
const aavePoolSupplyWithNFTContract = new ethers.Contract(
  AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS,
  aavePoolSupplyWithNFTAbi,
  signer
);

const sendParams = {
  /*gasLimit: 1000000,
  gasPrice: ethers.utils.parseUnits("10", "gwei"),*/
};

async function approveSpend(walletAddress, amount) {
  const amountWei = ethers.utils.parseEther(amount);
  const allowance = await daiContract.allowance(
    walletAddress,
    AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS
  );
  if (allowance.lt(amountWei)) {
    const amountWithBuffer = amountWei.mul(110).div(100);
    const tx = await daiContract.approve(
      AAVE_POOL_SUPPLY_WITH_NFT_ADDRESS,
      amountWithBuffer
    );
    console.log("Approval transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log(
      "Approval transaction confirmed in block:",
      receipt.blockNumber
    );
  }
  return amountWei;
}

export {
  provider,
  signer,
  daiContract,
  fixedNFTContract,
  variableNFTContract,
  aavePoolSupplyWithNFTContract,
  sendParams,
  approveSpend,
};

const ethers = require("ethers");

const provider = new ethers.providers.Web3Provider("http://localhost:8545"); // Replace with the local network URL (Ganache or Hardhat)
const privateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Replace with the private key of the pre-funded account you want to send ETH from
const toAddress = "0x96e5456D194d326ab0cFc92300308de7204DDd90"; // Replace with your MetaMask account address

async function transferEth() {
  const wallet = new ethers.Wallet(privateKey, provider);
  const tx = {
    to: toAddress,
    value: ethers.utils.parseEther("1"), // Amount of ETH to send
  };

  const transactionResponse = await wallet.sendTransaction(tx);
  console.log(`Transaction sent: ${transactionResponse.hash}`);

  await transactionResponse.wait();
  console.log("Transaction mined");
}

transferEth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

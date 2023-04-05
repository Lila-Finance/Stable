# Notes

This is on the sepolia test network and uses DAI. If you are developing, look at aave-v3 docs at https://docs.aave.com/developers/getting-started/readme.

Sepolia Faucet: https://sepoliafaucet.com/
DAI faucet: https://staging.aave.com/faucet/

Wait for transactions to execute on your wallet before executing another one. Frontend sucks, so you have to reload and connect to refresh the numbers on the page.

Since we can't fast forward the Sepolia network, I added days in the past when you are supplying tokens. Then you are minted an NFT that corresponds to the value and interest generated based on the rate and the number of days back.

Use Fund only for testing since that just funds the pools without giving you an NFT, use Supply for getting an NFT receipt that you can redeem with interest.

Current Variable rate is just based off Aave rate and a better formula has to be made.

# Run the react app

```
npm i
npm run start
```

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

# Deploy

App at https://rapturt9.github.io/Fixed_Yield/

```shell
npm run deploy -- -m "Deploy React app to GitHub Pages"
```

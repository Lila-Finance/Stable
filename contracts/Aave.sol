// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/interfaces/IAToken.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

import { FixedNFT } from "./FixedNFT.sol";
import { VariableNFT } from "./VariableNFT.sol";

contract AavePoolSupplyWithNFT {
  IPool private _pool;
  IERC20 private _dai;
  FixedNFT private _fixedNFT;
  VariableNFT private _variableNFT;
  IPoolAddressesProvider private poolAddressesProvider;
  address private poolAddress;

  constructor(address aaveAddresses, address daiAddress, address fixedAddress, address variableAddress) {
    poolAddressesProvider = IPoolAddressesProvider(aaveAddresses);
    poolAddress = poolAddressesProvider.getPool();
    _pool = IPool(poolAddress);
    _dai = IERC20(daiAddress);
    _fixedNFT = FixedNFT(fixedAddress);
    _variableNFT = VariableNFT(variableAddress);
  }

function fundVariable(uint256 amount) external {
    // Approve Aave pool to transfer DAI on behalf of the sender
    require(_dai.transferFrom(msg.sender, address(this), amount), "Transfer failed");
  }

  function fundFixed(uint256 amount, uint16 referralCode) external {
  // Approve Aave pool to transfer DAI on behalf of the sender
  require(_dai.transferFrom(msg.sender, address(this), amount), "Transfer failed");
  require(_dai.approve(address(_pool), amount), "Approve failed");

  _pool.supply(address(_dai), amount, address(this), referralCode);
}

  function supplyFixed(uint256 amount, uint16 referralCode, uint256 daysToSubtract) external returns (uint256) {
  // Approve Aave pool to transfer DAI on behalf of the sender
  require(_dai.transferFrom(msg.sender, address(this), amount), "Transfer failed");
  require(_dai.approve(address(_pool), amount), "Approve failed");

  // Supply DAI to the Aave pool
  _pool.supply(address(_dai), amount, address(this), referralCode);

  // Mint a Sepolia NFT as a receipt
  uint256 timestamp = block.timestamp - (daysToSubtract * 1 days);
  uint256 tokenId = _fixedNFT.mint(msg.sender, timestamp, amount);

  return tokenId;
}

function supplyVariable(uint256 amount, uint256 daysToSubtract) external returns (uint256) {
  // Approve Aave pool to transfer DAI on behalf of the sender
  require(_dai.transferFrom(msg.sender, address(this), amount), "Transfer failed");

  // Mint a Sepolia NFT as a receipt
  uint256 timestamp = block.timestamp - (daysToSubtract * 1 days);
  uint256 tokenId = _variableNFT.mint(msg.sender, timestamp, amount);

  return tokenId;
}

function calcFixed(uint256 tokenId) public view returns (uint256, uint256) {
  uint256 amount = _fixedNFT.getTokenAmount(tokenId);
  uint256 timestamp = _fixedNFT.getTimestamp(tokenId);
  return (amount, (amount * (block.timestamp - timestamp) / 1e3) / 365 days);
}

function calcVariable(uint256 tokenId) public view returns (uint256, uint256) {
  uint256 amount = _variableNFT.getTokenAmount(tokenId);
  uint256 timestamp = _variableNFT.getTimestamp(tokenId);
  uint256 liquidityRate = _pool.getReserveData(address(_dai)).currentLiquidityRate;
   uint256 reducedLiquidityRate = (liquidityRate) * 8 / 10;
  //0.8 is the discount to current aave rate
  return (amount, (amount * (block.timestamp - timestamp) * reducedLiquidityRate / 1e26) / 365 days);
}

function interests () external view returns (uint256, uint256) {
  uint256 fixedInterest = 1e24;
  uint256 liquidityRate = _pool.getReserveData(address(_dai)).currentLiquidityRate;
  uint256 variableInterest = (liquidityRate) * 8 / 10;
  return (fixedInterest, variableInterest);
}

function variableSupply() external view returns (uint256) {
  //total supply in this contract
  return _dai.balanceOf(address(this));
}

function fixedSupply() external view returns (uint256) {
  //total supply in the pool owned by this contract
  (uint256 totalCollateralBase, , , , , ) = _pool.getUserAccountData(address(this));
  return totalCollateralBase;
}


  function redeemFixed(uint256 tokenId) external {
    require(_fixedNFT.ownerOf(tokenId) == msg.sender, "Sender is not NFT owner");
    (uint256 amount, uint256 interest) = calcFixed(tokenId);
    _pool.withdraw(address(_dai), amount, address(this));
    require(_dai.transfer(msg.sender, amount + interest), "Transfer failed");
    _fixedNFT.burn(tokenId);
}

  function redeemVariable(uint256 tokenId) external {
    require(_variableNFT.ownerOf(tokenId) == msg.sender, "Sender is not NFT owner");
    (uint256 amount, uint256 interest) = calcVariable(tokenId);
    _pool.withdraw(address(_dai), interest, address(this));
    require(_dai.transfer(msg.sender, amount + interest), "Transfer failed");
    _variableNFT.burn(tokenId);
  }


}

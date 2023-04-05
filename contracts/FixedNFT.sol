// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract FixedNFT is ERC721 {
  uint256 private _tokenIdCounter;
  mapping(uint256 => uint256) private _timestamps;
  mapping(uint256 => uint256) private _amounts;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function mint(address to, uint256 timestamp, uint256 amount) external returns (uint256) {
    uint256 tokenId = _tokenIdCounter;
    _safeMint(to, tokenId);
    _timestamps[tokenId] = timestamp;
    _amounts[tokenId] = amount;
    _tokenIdCounter++;
    console.log("Minted Sepolia NFT with token ID %d and metadata {timestamp: %d, amount: %d}", tokenId, timestamp, amount);
    return tokenId;
  }

  function getTimestamp(uint256 tokenId) external view returns (uint256) {
    require(_exists(tokenId), "SepoliaNFT: token does not exist");
    return _timestamps[tokenId];
  }

  function getTokenAmount(uint256 tokenId) external view returns (uint256) {
    require(_exists(tokenId), "SepoliaNFT: token does not exist");
    return _amounts[tokenId];
  }

  function totalSupply() public view returns (uint256) {
    return _tokenIdCounter;
  }

  function burn(uint256 tokenId) public virtual {
    _burn(tokenId);
  }
}

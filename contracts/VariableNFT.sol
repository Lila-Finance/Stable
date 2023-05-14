// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "hardhat/console.sol";

contract VariableNFT is ERC721Enumerable {
    uint256 private nextTokenId = 0;
    address private pool;

    struct DepositData {
        uint256 amount;
        uint256 depositTime;
        uint256 claim;
    }

    mapping(uint256 => DepositData) private tokenIdToDepositData;

    constructor(address _pool) ERC721("Variable Interest NFT", "VINFT") {
        pool = _pool;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "Caller is not the Pool contract");
        _;
    }

    function mint(address to, uint256 amount, uint256 depositTime) external onlyPool returns (uint256) {
        //console.log("Minting NFT for %s with amount %s and deposit time %s", to, amount, depositTime);

        uint256 newTokenId = nextTokenId;
        _safeMint(to, newTokenId);
        nextTokenId++;

        tokenIdToDepositData[newTokenId] = DepositData(amount, depositTime, 0);

        return newTokenId;
    }

    function claim(uint256 tokenId, uint256 amount) external onlyPool {
        DepositData storage depositData = tokenIdToDepositData[tokenId];
        depositData.claim += amount;
    }

    function totalSupply() public override view returns (uint256) {
        return nextTokenId;
    }

    function burn(uint256 tokenId) external onlyPool {
        _burn(tokenId);
    }


    function getDepositData(uint256 tokenId) external view returns (DepositData memory) {
        return tokenIdToDepositData[tokenId];
    }
}

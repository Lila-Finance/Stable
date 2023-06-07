// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";
import { Base64 } from "./libraries/Base64.sol";
// Import OpenZeppelin's Strings library
import "@openzeppelin/contracts/utils/Strings.sol";

contract PositionNFT is ERC721, ERC721Enumerable, ERC721URIStorage {
    uint256 private nextTokenId = 0;
    address private pool;

    struct DepositData {
        uint256 amount;
        uint256 depositTime;
        uint256 claim;
    }

    mapping(uint256 => DepositData) private tokenIdToDepositData;

    constructor(address _pool) ERC721("Position NFT", "LILA") {
        pool = _pool;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "Caller is not the Pool contract");
        _;
    }

    function mint(address to, uint256 amount, uint256 depositTime, string memory typeNFT) external onlyPool returns (uint256) {
        //console.log("Minting NFT for %s with amount %s and deposit time %s", to, amount, depositTime);

        uint256 newTokenId = nextTokenId;
        _safeMint(to, newTokenId);

        //string memory metadata = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]));

        //_setTokenURI(newTokenId, metadata);
        generateNFT(typeNFT, amount);

        nextTokenId++;

        tokenIdToDepositData[newTokenId] = DepositData(amount, depositTime, 0);

        return newTokenId;
    }

    function generateNFT(string memory typeNFT, uint256 amount) internal {
        string memory startAmountAsString = Strings.toString(amount / 1e18);
        string memory endAmountAsString = Strings.toString((amount % 1e18) / 1e16);
        string memory amountAsString = string(abi.encodePacked(startAmountAsString, ".", endAmountAsString));
        string memory combinedWord = string(abi.encodePacked(typeNFT, ": ", amountAsString));
        string memory finalSvg = string(abi.encodePacked(
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: black; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='#D9D9D9'/><text x='10%' y='40%' class='base'>Type: ", 
        typeNFT,
        "</text><text x='10%' y='50%' class='base'>Vault: ",
        "DAI Aave",
        "</text><text x='10%' y='60%' class='base'>Deposit: ",
        amountAsString,
        "</text></svg>"));

        // Get all the JSON metadata in place and base64 encode it.
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        // We set the title of our NFT as the generated word.
                        combinedWord,
                        '", "description": "Lila Position NFT", "image": "data:image/svg+xml;base64,',
                        // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        
        // Update your URI!!!
        _setTokenURI(nextTokenId, finalTokenUri);
    }


    function claim(uint256 tokenId, uint256 amount) external onlyPool {
        DepositData storage depositData = tokenIdToDepositData[tokenId];
        depositData.claim += amount;
    }

    function totalSupply() public override view returns (uint256) {
        return nextTokenId;
    }

    function getDepositData(uint256 tokenId) external view returns (DepositData memory) {
        return tokenIdToDepositData[tokenId];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function burn(uint256 tokenId) external onlyPool {
        _burn(tokenId);
    }


    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    uint256 public faucetMintLimit;

    mapping(address => uint256) public mintedByFaucet;

    constructor() ERC20("Token", "TKN") {}

    function mintFromFaucet(uint256 amount) external {
        _mint(msg.sender, amount);
        mintedByFaucet[msg.sender] += amount;
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), allowance(sender, _msgSender()) - amount);
        return true;
    }
}

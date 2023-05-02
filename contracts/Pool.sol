// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./Token.sol"; // Add this import at the top of the Pool contract
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FixedNFT.sol";
import "./VariableNFT.sol";

contract Pool is Ownable {
    Token public token;
    FixedNFT public fixedNFT;
    VariableNFT public variableNFT;

    uint256 public fixedPoolLimit;
    uint256 public variablePoolLimit;
    uint256 public lockDuration;
    uint256 public interestRate;
    uint256 public totalDepositedFixed;
    uint256 public totalDepositedVariable;
    uint256 public poolStartTime;
    uint256[] public dailyInterestRates;

    constructor(
        Token _token,
        uint256 _fixedPoolLimit,
        uint256 _lockDuration,
        uint256 _interestRate,
        uint256[] memory _dailyInterestRates
    ) {
        token = _token;
        fixedPoolLimit = _fixedPoolLimit;
        lockDuration = _lockDuration;
        interestRate = _interestRate;
        variablePoolLimit = calculateInterest(fixedPoolLimit, interestRate, lockDuration);
        dailyInterestRates = _dailyInterestRates;

        // Instantiate the FixedNFT contract with the address of this Pool contract
        fixedNFT = new FixedNFT(address(this));
        variableNFT = new VariableNFT(address(this));
    }


    function getIsLocked() external view returns (bool) {
        return block.timestamp > poolStartTime;
    }

    function depositFixed(uint256 amount) external {
        require(totalDepositedFixed + amount <= fixedPoolLimit, "Pool limit reached");

        // Transfer tokens from the user to the Pool contract
        token.transferFrom(msg.sender, address(this), amount);

        // Mint the NFT representing the deposit position
        uint256 tokenId = fixedNFT.mint(msg.sender, amount, block.timestamp);

        // Update the total deposited amount and pool start time if necessary
        totalDepositedFixed += amount;

        if (totalDepositedVariable == variablePoolLimit && totalDepositedFixed == fixedPoolLimit && poolStartTime == 0)  {
            poolStartTime = block.timestamp;
        }
    }

    function depositVariable(uint256 amount) external {
        require(totalDepositedVariable + amount <= variablePoolLimit, "Variable pool limit reached");

        // Transfer tokens from the user to the Pool contract
        token.transferFrom(msg.sender, address(this), amount);

        // Mint the NFT representing the deposit position
        uint256 tokenId = variableNFT.mint(msg.sender, amount, block.timestamp);

        // Update the total deposited amount and pool start time if necessary
        totalDepositedVariable += amount;
        if (totalDepositedVariable == variablePoolLimit && totalDepositedFixed == fixedPoolLimit && poolStartTime == 0) {
            poolStartTime = block.timestamp;
        }
    }


    function withdrawFixed(uint256 tokenId) external {
        require(poolStartTime > 0, "Pool not locked yet");
        require(block.timestamp >= poolStartTime + lockDuration, "Tokens are still locked");

        FixedNFT.DepositData memory depositData = fixedNFT.getDepositData(tokenId);
        require(fixedNFT.ownerOf(tokenId) == msg.sender, "Caller is not the owner of the NFT");

        // Burn the NFT representing the deposit position
        fixedNFT.burn(tokenId);

        // Calculate the interest and total amount to be returned to the user
        uint256 interest = calculateInterest(depositData.amount, interestRate, lockDuration);
        uint256 totalAmount = depositData.amount + interest;

        // Transfer the tokens back to the user
        //token.mintFromFaucet(interest); //comment later
        token.transfer(msg.sender, totalAmount);
    }

    function withdrawVariable(uint256 tokenId) external {
        require(poolStartTime > 0, "Pool not locked yet");
        require(block.timestamp >= poolStartTime + lockDuration, "Tokens are still locked");

        VariableNFT.DepositData memory depositData = variableNFT.getDepositData(tokenId);
        require(variableNFT.ownerOf(tokenId) == msg.sender, "Caller is not the owner of the NFT");

        // Burn the NFT representing the deposit position
        variableNFT.burn(tokenId);

        // Calculate the interest and total amount to be returned to the user
        uint256 totalValue = getTotalSupply() - fixedPoolLimit;
        uint256 totalAmount = (depositData.amount * totalValue) / variablePoolLimit;

        // Transfer the tokens back to the user
        token.mintFromFaucet(totalAmount);
        token.transfer(msg.sender, totalAmount);
    }

    function getTotalSupply() public view returns (uint256) {
        uint256 totalSupply = fixedPoolLimit;
        if (poolStartTime > 0){ //pool started
            uint256 time = timeSinceStart();
            //get length of dailyInterestRates and set to variable
            uint256 length = dailyInterestRates.length;
            uint256 interest;
            uint256 numDays = time / 1 days;
            for (uint256 i = 0; i < numDays; i++) {
                interest = calculateInterest(totalSupply, dailyInterestRates[i % length], 1 days);
                totalSupply += interest;
            }
            //get remainder of time and calculate interest
            uint256 remainder = time % 1 days;
            interest = calculateInterest(totalSupply, dailyInterestRates[numDays % length], remainder);
            totalSupply += interest;
        }
        return totalSupply;
    }

    function interests() public view returns (int256, int256) {
        int256 variableInterestRate = int256(interestRate);
        if (poolStartTime > 0 && block.timestamp > poolStartTime + 1 days) {
            int256 totalValue = int256(getTotalSupply());
            uint256 time = timeSinceStart();
            uint256 subVariable = ((variablePoolLimit * time) / lockDuration);
            int256 totalSub = totalValue - int256(fixedPoolLimit) - int256(subVariable);
            variableInterestRate = 1e19 * (365 days) * totalSub / int256(time * variablePoolLimit);
        }
        return (int256(interestRate), variableInterestRate);
    }


    function calculateInterest(uint256 amount, uint256 interestRateAmount, uint256 time) public pure returns (uint256) {
        return (amount * interestRateAmount * time) / 1e18 / (100 * 365 days);
    }

    function timeSinceStart() public view returns (uint256) {
        if (poolStartTime == 0) {
            return 0;
        } else if (block.timestamp < poolStartTime + lockDuration) {
            return block.timestamp - poolStartTime;
        } else {
            return lockDuration;
        }
    }

    function fastForward(uint256 numSeconds) external {
        if(poolStartTime > 0){
            poolStartTime -= numSeconds;
        }   
    }
}

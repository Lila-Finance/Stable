// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./Token.sol"; // Add this import at the top of the Pool contract
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FixedNFT.sol";
import "./VariableNFT.sol";
import "hardhat/console.sol";

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
    uint256 public totalClaimedFixedPrev;
    uint256 public totalClaimedFixed;
    uint256 public totalClaimedVariable;
    uint256 public fixedDepositSumTime;
    uint256 public fixedDepositNum;
    uint256 public poolStartTime;
    uint256[] public dailyInterestRates;
    uint256 public prevMaxSupply;
    uint256 public addTimestamp;

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

    function depositFixed(uint256 amount) external {
        require(totalDepositedFixed + amount <= fixedPoolLimit, "Pool limit reached");

        // Transfer tokens from the user to the Pool contract
        token.transferFrom(msg.sender, address(this), amount);

        uint256 curTime = blocktime();

        // Mint the NFT representing the deposit position
        uint256 tokenId = fixedNFT.mint(msg.sender, amount, curTime);

        // Update the total deposited amount and pool start time if necessary
        totalDepositedFixed += amount;

        fixedDepositNum += 1;
        fixedDepositSumTime += curTime;
        startPool();
    }

    function depositVariable(uint256 amount) external {
        require(totalDepositedVariable + amount <= variablePoolLimit, "Variable pool limit reached");

        // Transfer tokens from the user to the Pool contract
        token.transferFrom(msg.sender, address(this), amount);

        // Mint the NFT representing the deposit position
        uint256 tokenId = variableNFT.mint(msg.sender, amount, blocktime());

        // Update the total deposited amount and pool start time if necessary
        totalDepositedVariable += amount;
        startPool();
    }

    function startPool() internal {
        //print out totalDepositedFixed, totalDepositedVariable, and poolStartTime
        if (totalDepositedVariable == variablePoolLimit && totalDepositedFixed == fixedPoolLimit && poolStartTime == 0) {
            poolStartTime = blocktime();
            prevMaxSupply = getTotalSupply() + totalClaimedFixedPrev;
        }
    }

    function getTotalSupply() public view returns (uint256) { //don't use for aave
        uint256 totalSupply = totalDepositedFixed * 5 / 4 - totalClaimedFixedPrev;
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
        return totalSupply - totalClaimedVariable;
    }

    function interests() public view returns (int256, int256) {
        int256 variableInterestRate = int256(interestRate);
        if (poolStartTime > 0 && blocktime() > poolStartTime + 1 days) {
            uint256 totalValue = getTotalSupply() + totalClaimedVariable + totalClaimedFixedPrev - prevMaxSupply;
            uint256 time = timeSinceStart();
            uint256 expectedValue = variablePoolLimit * (time / lockDuration);
            int256 totalSub = int256(totalValue) - int256(expectedValue);
            variableInterestRate = 1e19 * (365 days) * totalSub / int256(time * variablePoolLimit);
        }
        return (int256(interestRate), variableInterestRate);
    }


    function calculateInterestFixed(uint256 tokenId) public view returns (uint256) {
    FixedNFT.DepositData memory depositData = fixedNFT.getDepositData(tokenId);
    uint256 depositTime = depositData.depositTime;
    uint256 fixedDepositAvgTime = fixedDepositSumTime / fixedDepositNum;
    uint256 prevMaxSupplyNow = prevMaxSupply;
    uint256 prevTime = poolStartTime;

    if (poolStartTime == 0){ //pool hasn't started yet
        prevTime = blocktime();
        prevMaxSupplyNow = getTotalSupply() + totalClaimedFixedPrev;
    }
    uint256 avgInterest = (prevMaxSupplyNow - totalDepositedFixed) / fixedDepositNum;
    uint256 interest = 0;
    if (prevTime - fixedDepositAvgTime > 1){
        interest=avgInterest * (prevTime - depositTime) / (prevTime - fixedDepositAvgTime);
    }

    if(poolStartTime > 0){
        uint256 timeLocked = timeSinceStart();
        interest += calculateInterest(depositData.amount, interestRate, timeLocked);
        if(blocktime() >= poolStartTime + lockDuration){
            interest += depositData.amount;
        }
    }

    return interest - depositData.claim;
}


    function calculateInterestVariable(uint256 tokenId) public view returns (uint256) {
        VariableNFT.DepositData memory depositData = variableNFT.getDepositData(tokenId);
        if(poolStartTime > 0){
            uint256 totalValue = getTotalSupply() + totalClaimedVariable + totalClaimedFixedPrev - prevMaxSupply;
            uint256 totalAmount = (depositData.amount * totalValue) / variablePoolLimit;
            return totalAmount - depositData.claim;
        }
        return 0;
    }

    function withdrawFixed(uint256 tokenId) external {
        uint256 interest = calculateInterestFixed(tokenId);
        if (poolStartTime == 0){
            totalClaimedFixedPrev += interest;
        }
        token.mintFromFaucet(interest);
        token.transfer(msg.sender, interest);
        fixedNFT.claim(tokenId,interest);
        if(poolStartTime > 0 && blocktime() >= poolStartTime + lockDuration){
            fixedNFT.burn(tokenId);
        }
    }

    function withdrawVariable(uint256 tokenId) external {
        uint256 interest = calculateInterestVariable(tokenId);
        totalClaimedVariable += interest;
        token.mintFromFaucet(interest);
        token.transfer(msg.sender, interest);
        variableNFT.claim(tokenId,interest);
        if(poolStartTime > 0 && blocktime() >= poolStartTime + lockDuration){
            variableNFT.burn(tokenId);
        }
    }

    function calculateInterest(uint256 amount, uint256 interestRateAmount, uint256 time) public pure returns (uint256) {
        return (amount * interestRateAmount * time) / 1e18 / (100 * 365 days);
    }

    function timeSinceStart() public view returns (uint256) {
        if (poolStartTime == 0) {
            return 0;
        } else if (blocktime() < poolStartTime + lockDuration) {
            return blocktime() - poolStartTime;
        } else {
            return lockDuration;
        }
    }

    function blocktime() public view returns (uint256) {
        return block.timestamp + addTimestamp;
    }

    function fastForward(uint256 numSeconds) external {
        addTimestamp += numSeconds;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/interfaces/IAToken.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FixedNFT.sol";
import "./VariableNFT.sol";
import "hardhat/console.sol";

contract Pool is Ownable {
    IPool private _pool;
    IERC20 private _dai;
    IPoolAddressesProvider private poolAddressesProvider;
    address private poolAddress;
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
    uint256 public prevMaxSupply;

    uint256 public addTimestamp;
    uint256 public addSupply;

    constructor(
        address aaveAddresses, 
        address daiAddress,
        uint256 _fixedPoolLimit,
        uint256 _lockDuration,
        uint256 _interestRate
    ) {
        poolAddressesProvider = IPoolAddressesProvider(aaveAddresses);
        poolAddress = poolAddressesProvider.getPool();
        _pool = IPool(poolAddress);
        _dai = IERC20(daiAddress);
        fixedPoolLimit = _fixedPoolLimit;
        lockDuration = _lockDuration;
        interestRate = _interestRate;
        variablePoolLimit = calculateInterest(fixedPoolLimit, interestRate, lockDuration);

        // Instantiate the FixedNFT contract with the address of this Pool contract
        fixedNFT = new FixedNFT(address(this));
        variableNFT = new VariableNFT(address(this));
    }

    function depositFixed(uint256 amount) external {
        require(totalDepositedFixed + amount <= fixedPoolLimit, "Pool limit reached");

        // Transfer tokens from the user to the Pool contract
        require(_dai.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        require(_dai.approve(address(_pool), amount), "Approve failed");
        _pool.supply(address(_dai), amount, address(this), 0);

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
        require(_dai.transferFrom(msg.sender, address(this), amount), "Transfer failed");

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
        (uint256 totalCollateralBase, , , , , ) = _pool.getUserAccountData(address(this));
        return totalCollateralBase * 1e10 + addSupply;
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


    function calculateInterestFixedParts(uint256 tokenId) public view returns (uint256, uint256) {
    FixedNFT.DepositData memory depositData = fixedNFT.getDepositData(tokenId);
    uint256 depositTime = depositData.depositTime;
    require(fixedDepositNum > 0, "Fixed Deposit Num is zero");
    uint256 fixedDepositAvgTime = fixedDepositSumTime / fixedDepositNum;
    uint256 prevMaxSupplyNow = prevMaxSupply;
    uint256 prevTime = poolStartTime;

    if (poolStartTime == 0){ //pool hasn't started yet
        prevTime = blocktime();
        prevMaxSupplyNow = getTotalSupply() + totalClaimedFixedPrev;
    }
    require(prevMaxSupplyNow >= totalDepositedFixed, "totalDepositedFixed is greater than prevMaxSupplyNow");
    uint256 avgInterest = (prevMaxSupplyNow - totalDepositedFixed) / fixedDepositNum;
    uint256 startinterest = 0;
    if (prevTime - fixedDepositAvgTime > 1){
        require(prevTime >= depositTime, "Deposit time is greater than Prev time");
        require(prevTime >= fixedDepositAvgTime, "fixedDepositAvgTime is greater than Prev time");
        startinterest=avgInterest * (prevTime - depositTime) / (prevTime - fixedDepositAvgTime);
    }

    uint256 midinterest = 0;
    if(poolStartTime > 0){
        uint256 timeLocked = timeSinceStart();
        midinterest += calculateInterest(depositData.amount, interestRate, timeLocked);
        if(blocktime() >= poolStartTime + lockDuration){
            midinterest += depositData.amount;
        }
    }
    if (depositData.claim > startinterest){
        require(startinterest + midinterest >= depositData.claim, "depositData.claim is greater than the sum of startinterest and midinterest");
        return (0, startinterest + midinterest - depositData.claim);
    } else {
        require(startinterest >= depositData.claim, "depositData.claim is greater than startinterest");
        return (startinterest - depositData.claim, midinterest);
    }
}

    function calculateInterestFixed(uint256 tokenId) public view returns (uint256) {
        (uint256 startinterest, uint256 midinterest) = calculateInterestFixedParts(tokenId);
        return startinterest + midinterest;
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
        require(fixedNFT.ownerOf(tokenId) == msg.sender, "Sender is not NFT owner");
        (uint256 startinterest, uint256 midinterest) = calculateInterestFixedParts(tokenId);
        uint256 interest = startinterest + midinterest;
        if (startinterest > 0){
            totalClaimedFixedPrev += startinterest;
            _pool.withdraw(address(_dai), startinterest, address(this));
        }
        require(_dai.transfer(msg.sender, interest), "Transfer failed");
        fixedNFT.claim(tokenId,interest);
        if(poolStartTime > 0 && blocktime() >= poolStartTime + lockDuration){
            fixedNFT.burn(tokenId);
        }
    }

    function withdrawVariable(uint256 tokenId) external {
        require(variableNFT.ownerOf(tokenId) == msg.sender, "Sender is not NFT owner");
        uint256 interest = calculateInterestVariable(tokenId);
        totalClaimedVariable += interest;
        _pool.withdraw(address(_dai), interest, address(this));
        require(_dai.transfer(msg.sender, interest), "Transfer failed");
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
        uint256 totalSupply = getTotalSupply();
        addSupply += calculateInterest(totalSupply, interestRate, numSeconds);
    }
}

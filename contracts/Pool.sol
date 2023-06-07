// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/interfaces/IAToken.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PoolLogic.sol";
import "./PositionNFT.sol";

contract Pool is Ownable {
    IPool private _pool;
    IERC20 private _dai;
    IPoolAddressesProvider private poolAddressesProvider;
    address private poolAddress;
    // Use contract address directly and cast it to your contract type
    PositionNFT public fixedNFT;
    PositionNFT public variableNFT;

    uint256 public fixedPoolLimit;
    uint256 public variablePoolLimit;
    uint256 public lockDuration;
    uint256 public interestRate;
    uint256 public totalDepositedFixed;
    uint256 public totalDepositedVariable;
    uint256 public totalClaimedFixedPrev;
    uint256 public totalClaimedFixed;
    uint256 public totalClaimedVariable;
    uint256 public poolStartTime;
    uint256 public prevMaxSupply;
    uint256 public addSupply;

    uint256 public addTimestamp;
    PoolLogic public poolLogic;
    uint256 public poolDeployTime;
    uint256 public totalTimeWeight;

    bool public poolStopped;
    address private maker = 0xDaBd0faBd68235eD23432fAf2272a46a618b7dcd;

    constructor(
        address aaveAddresses, 
        address daiAddress,
        uint256 _fixedPoolLimit,
        uint256 _lockDuration,
        uint256 _interestRate,
        address _poolLogic
    ) {
        poolLogic = PoolLogic(_poolLogic);
        poolAddressesProvider = IPoolAddressesProvider(aaveAddresses);
        poolAddress = poolAddressesProvider.getPool();
        _pool = IPool(poolAddress);
        _dai = IERC20(daiAddress);
        fixedPoolLimit = _fixedPoolLimit;
        lockDuration = _lockDuration;
        interestRate = _interestRate;
        variablePoolLimit = poolLogic.calculateInterest(fixedPoolLimit, interestRate, lockDuration);
        poolDeployTime = block.timestamp;

        // Cast the address to the contract type
        fixedNFT = new PositionNFT(address(this));
        variableNFT = new PositionNFT(address(this));
    }

    function depositFixed(uint256 amount) external {
        require(totalDepositedFixed + amount <= fixedPoolLimit, "Pool limit reached");
        require(_dai.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        require(_dai.approve(address(_pool), amount), "Approve failed");
        _pool.supply(address(_dai), amount, address(this), 0);

        uint256 curTime = blocktime();
        uint256 timeSinceDeploy = curTime - poolDeployTime;
        uint256 timeWeight = timeSinceDeploy * amount;
        totalTimeWeight += timeWeight;

        // Mint the NFT representing the deposit position
        uint256 tokenId = fixedNFT.mint(msg.sender, amount, curTime, "Fixed", interestRate);

        // Update the total deposited amount and pool start time if necessary
        totalDepositedFixed += amount;
        startPool();
    }

    function depositVariable(uint256 amount) external {
        require(totalDepositedVariable + amount <= variablePoolLimit, "Variable pool limit reached");
        require(_dai.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Mint the NFT representing the deposit position
        uint256 tokenId = variableNFT.mint(msg.sender, amount, blocktime(), "Variable", getInterestRate());

        // Update the total deposited amount and pool start time if necessary
        totalDepositedVariable += amount;
        startPool();
    }

    function startPool() internal {
        //print out totalDepositedFixed, totalDepositedVariable, and poolStartTime
        if (totalDepositedVariable == variablePoolLimit && totalDepositedFixed == fixedPoolLimit && poolStartTime == 0) {
            poolStartTime = blocktime();
            prevMaxSupply = getTotalSupply() + totalClaimedFixedPrev + totalClaimedVariable;
        }
    }

    function getTotalSupply() public view returns (uint256) { //don't use for aave
        (uint256 totalCollateralBase, , , , , ) = _pool.getUserAccountData(address(this));
        return totalCollateralBase * 1e10;
    }

    function interests() public view returns (int256, int256) {
        return poolLogic.interests(interestRate, poolStartTime, variablePoolLimit, lockDuration, totalClaimedVariable, totalClaimedFixedPrev, prevMaxSupply, getTotalSupply(), blocktime());
    }


    function zeroed(uint256 a, uint256 b) internal pure returns (uint256) {
        if(a > b){
            return a - b;
        }
        return 0;
    }


    function calculateInterestFixedParts(uint256 tokenId) public view returns (uint256, uint256) {
        PositionNFT.DepositData memory depositData = fixedNFT.getDepositData(tokenId);
        PoolLogic.Times memory times = PoolLogic.Times({
            poolStartTime: poolStartTime,
            blocktime: blocktime(),
            lockDuration: lockDuration,
            poolStopped: poolStopped,
            poolDeployTime: poolDeployTime,
            totalTimeWeight: totalTimeWeight,
            interestRate: interestRate
        });
        return poolLogic.calculateInterestFixedParts(depositData, times, prevMaxSupply, totalDepositedFixed, totalClaimedFixedPrev, getTotalSupply());
    }

    function calculateInterestFixed(uint256 tokenId) public view returns (uint256) {
        (uint256 startinterest, uint256 midinterest) = calculateInterestFixedParts(tokenId);
        return startinterest + midinterest;
    }


    function calculateInterestVariable(uint256 tokenId) public view returns (uint256) {
        PositionNFT.DepositData memory depositData = variableNFT.getDepositData(tokenId);
        PoolLogic.Times memory times = PoolLogic.Times({
            poolStartTime: poolStartTime,
            blocktime: blocktime(),
            lockDuration: lockDuration,
            poolStopped: poolStopped,
            poolDeployTime: poolDeployTime,
            totalTimeWeight: totalTimeWeight,
            interestRate: interestRate
        });
        return poolLogic.calculateInterestVariable(depositData, times, prevMaxSupply, totalDepositedVariable, totalClaimedVariable, getTotalSupply(), variablePoolLimit, totalClaimedFixedPrev);
    }

    function withdrawFixed(uint256 tokenId) external {
        require(fixedNFT.ownerOf(tokenId) == msg.sender, "Sender is not NFT owner");
        require(poolStartTime > 0 && blocktime() >= poolStartTime + lockDuration, "Lock duration not reached");
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

    function getInterestRate() public view returns (uint256) {
        return _pool.getReserveData(address(_dai)).currentLiquidityRate;
    }

    function withdrawVariable(uint256 tokenId) external {
        require(variableNFT.ownerOf(tokenId) == msg.sender, "Sender is not NFT owner");
        require(poolStartTime > 0 && blocktime() >= poolStartTime + lockDuration, "Lock duration not reached");
        uint256 interest = calculateInterestVariable(tokenId);
        totalClaimedVariable += interest;
        _pool.withdraw(address(_dai), interest, address(this));
        require(_dai.transfer(msg.sender, interest), "Transfer failed");
        variableNFT.claim(tokenId,interest);
        if(poolStartTime > 0 && blocktime() >= poolStartTime + lockDuration){
            variableNFT.burn(tokenId);
        }
    }

    function timeSinceStart() public view returns (uint256) {
        if (poolStartTime == 0) {
            return 0;
        } else if (blocktime() < poolStartTime + lockDuration) {
            return zeroed(blocktime(), poolStartTime);
        } else {
            return lockDuration;
        }
    }

    function blocktime() public view returns (uint256) {
        return block.timestamp + addTimestamp;
    }
    
    function fastForward(uint256 numSeconds) external {
        require(msg.sender == maker, "Sender is not owner");
        if (poolStartTime == 0) {
            poolStopped = true;
            uint256 totalSupply = getTotalSupply();
            _pool.withdraw(address(_dai), totalSupply, address(this));
            //withhraw all funds from aave

        }
        addTimestamp += numSeconds;
    }
}
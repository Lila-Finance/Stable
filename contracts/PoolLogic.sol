// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./FixedNFT.sol";
import "./VariableNFT.sol";

contract PoolLogic {

    struct Times {
        uint256 poolStartTime;
        uint256 blocktime;
        uint256 lockDuration;
        bool poolStopped;
    }
    
    function calculateInterestFixedParts(
        FixedNFT.DepositData memory depositData,
        uint256 interestRate,
        Times memory times,
        uint256 prevMaxSupply,
        uint256 totalDepositedFixed,
        uint256 totalClaimedFixedPrev,
        uint256 totalSupply
    ) public pure returns (uint256, uint256) {
        uint256 timeToStart = times.blocktime - depositData.depositTime;
        if (times.poolStartTime == 0) { //pool hasn't started yet
            prevMaxSupply = totalSupply + totalClaimedFixedPrev;
        } else {
            timeToStart = times.poolStartTime - depositData.depositTime;
        }
        uint256 startinterest = calculateInterest(depositData.amount, interestRate, timeToStart);
        if (times.poolStopped){
            return (startinterest + depositData.amount, 0);
        }
        if(startinterest > zeroed(prevMaxSupply, totalDepositedFixed)){
            startinterest = 0;
        }

        uint256 midinterest = 0;
        if(times.poolStartTime > 0){
            uint256 timeLocked = timeSinceStart(times.poolStartTime, times.blocktime, times.lockDuration);
            midinterest += calculateInterest(depositData.amount, interestRate, timeLocked);
            if(times.blocktime >= times.poolStartTime + times.lockDuration){
                startinterest += depositData.amount;
            }
        }
        if (depositData.claim > startinterest){
            return (0, startinterest + zeroed(midinterest, depositData.claim));
        } else {
            return (zeroed(startinterest, depositData.claim), midinterest);
        }
    }

    

    function calculateInterestVariable(VariableNFT.DepositData memory depositData, Times memory times, uint256 prevMaxSupply, uint256 totalDepositedVariable, uint256 totalClaimedVariable, uint256 totalSupply, uint256 variablePoolLimit, uint256 totalClaimedFixedPrev) public pure returns (uint256) {
        if (times.poolStopped){
            return depositData.amount;
        }
        if(times.poolStartTime > 0){
            uint256 totalValue = zeroed(totalSupply + totalClaimedVariable + totalClaimedFixedPrev, prevMaxSupply);
            uint256 totalAmount = (depositData.amount * totalValue) / variablePoolLimit;
            uint256 out = zeroed(totalAmount, depositData.claim);
            if (out > totalSupply){
                return totalSupply;
            }
            return out;
        }
        return 0;
    }

    function calculateInterest(uint256 amount, uint256 interestRateAmount, uint256 time) public pure returns (uint256) {
        return (amount * interestRateAmount * time) / 1e18 / (100 * 365 days);
    }

    function interests(
        uint256 _interestRate,
        uint256 _poolStartTime,
        uint256 _variablePoolLimit,
        uint256 _lockDuration,
        uint256 _totalClaimedVariable,
        uint256 _totalClaimedFixedPrev,
        uint256 _prevMaxSupply,
        uint256 _totalSupply,
        uint256 _blocktime
    ) public pure returns (int256, int256) {
        int256 variableInterestRate = int256(_interestRate);
        if (_poolStartTime > 0 && _blocktime > _poolStartTime + 1 days) {
            uint256 totalValue = zeroed(_totalSupply + _totalClaimedVariable + _totalClaimedFixedPrev, _prevMaxSupply);
            uint256 time = timeSinceStart(_poolStartTime, _blocktime, _lockDuration);
            uint256 expectedValue = _variablePoolLimit * (time / _lockDuration);
            int256 totalSub = int256(totalValue) - int256(expectedValue);
            if (time == 0 || _variablePoolLimit == 0) {
                return (int256(_interestRate), 0);
            }
            variableInterestRate = 1e19 * (365 days) * totalSub / int256(time * _variablePoolLimit);
        }
        return (int256(_interestRate), variableInterestRate);
    }


    function timeSinceStart(uint256 poolStartTime, uint256 blocktime, uint256 lockDuration) public pure returns (uint256) {
        if (poolStartTime == 0) {
            return 0;
        } else if (blocktime < poolStartTime + lockDuration) {
            return zeroed(blocktime, poolStartTime);       
        } else {
            return lockDuration;
        }
    }

    function zeroed(uint256 a, uint256 b) internal pure returns (uint256) {
        if(a > b){
            return a - b;
        }
        return 0;
    }

}

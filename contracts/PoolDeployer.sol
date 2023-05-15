pragma solidity ^0.8.0;
import "./Pool.sol";

contract PoolDeployer {
    struct PoolInfo {
        Pool pool;
    }

    PoolInfo[] public pools;

    event PoolCreated(Pool pool);

    function createPool(
        address _aaveAddresses, 
        address _daiAddress,
        uint256 _fixedPoolLimit,
        uint256 _lockDuration,
        uint256 _interestRate
    ) public {
        Pool newPool = new Pool(_aaveAddresses, _daiAddress, _fixedPoolLimit, _lockDuration, _interestRate);

        pools.push(PoolInfo({
            pool: newPool
        }));

        emit PoolCreated(newPool);
    }

    function deletePool(Pool poolToRemove) public {
        for (uint256 i = 0; i < pools.length; i++) {
            if (address(pools[i].pool) == address(poolToRemove)) {
                pools[i] = pools[pools.length - 1];
                pools.pop();
                break;
            }
        }
    }

    function getPoolLength() public view returns (uint256) {
    return pools.length;
}

}
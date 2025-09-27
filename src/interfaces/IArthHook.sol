// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";


interface IArthHook {
    function clearFundingOwedToken1(
        address owner,
        PoolKey calldata key,
        int24 lower,
        int24 upper,
        bytes32 salt
    ) external returns (int256);

    struct Position {
        uint128 liquidity;
        uint256 fundingGrowthSnapshotX128;
        int256 fundingOwedToken1;
    }

    function getUserPositionKeys(
        address user
    ) external view returns (bytes32[] memory);

    function positions(
        bytes32 key
    ) external view returns (uint128, uint256, int256);

    function getPositionLocator(
        bytes32 key
    )
        external
        view
        returns (
            PoolId id,
            int24 lower,
            int24 upper,
            bytes32 salt,
            address owner
        );
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IArthHook} from "../interfaces/IArthHook.sol";

contract ArthReader {
    IArthHook public immutable hook;

    constructor(IArthHook _hook) {
        hook = _hook;
    }

    struct PositionView {
        bytes32 key;
        PoolId poolId;
        int24 tickLower;
        int24 tickUpper;
        bytes32 salt;
        address owner;
        uint128 liquidity;
        uint256 fundingGrowthSnapshotX128;
        int256 fundingOwedToken1;
    }

    function positionsOf(
        address user
    ) external view returns (PositionView[] memory out) {
        bytes32[] memory keys = hook.getUserPositionKeys(user);
        out = new PositionView[](keys.length);
        for (uint256 i = 0; i < keys.length; i++) {
            (
                PoolId pid,
                int24 lower,
                int24 upper,
                bytes32 salt,
                address owner
            ) = hook.getPositionLocator(keys[i]);
            (uint128 L, uint256 snap, int256 owed) = hook.positions(keys[i]);

            out[i] = PositionView({
                key: keys[i],
                poolId: pid,
                tickLower: lower,
                tickUpper: upper,
                salt: salt,
                owner: owner,
                liquidity: L,
                fundingGrowthSnapshotX128: snap,
                fundingOwedToken1: owed
            });
        }
    }

    function positionByKey(
        bytes32 key
    ) external view returns (PositionView memory p) {
        (
            PoolId pid,
            int24 lower,
            int24 upper,
            bytes32 salt,
            address owner
        ) = hook.getPositionLocator(key);
        (uint128 L, uint256 snap, int256 owed) = hook.positions(key);

        p = PositionView({
            key: key,
            poolId: pid,
            tickLower: lower,
            tickUpper: upper,
            salt: salt,
            owner: owner,
            liquidity: L,
            fundingGrowthSnapshotX128: snap,
            fundingOwedToken1: owed
        });
    }
}

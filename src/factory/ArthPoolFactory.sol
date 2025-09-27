// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IBaseIndex} from "../interfaces/IBaseIndex.sol";
import {IRiskEngine} from "../interfaces/IRiskEngine.sol";
import {PythOracleAdapter} from "../oracles/PythOracleAdapter.sol";
import {ArthHook} from "../hooks/ArthHook.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ArthPoolFactory is Ownable {
    using PoolIdLibrary for PoolKey;

    IPoolManager public immutable MANAGER;

    /// @notice singleton hook used for all pools (set once, then reused)
    address public HOOK;

    event HookSet(address hook);
    event PoolCreated(PoolId poolId, address hook, uint64 maturity);

    constructor(IPoolManager _manager, address owner) Ownable(owner) {
        MANAGER = _manager;
    }

    /// @notice Owner wires the singleton hook once (must be deployed already).
    function setHook(address hook) external onlyOwner {
        // verify flags match what ArthHook.getHookPermissions() returns
        uint160 EXPECTED = uint160(
              Hooks.AFTER_INITIALIZE_FLAG
            | Hooks.BEFORE_SWAP_FLAG
            | Hooks.BEFORE_ADD_LIQUIDITY_FLAG
            | Hooks.AFTER_ADD_LIQUIDITY_FLAG
            | Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG
            | Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );
        require((uint160(hook) & Hooks.ALL_HOOK_MASK) == EXPECTED, "HookFlagsMismatch");
        // verify hook bound to this factory for onlyFactory()
        require(ArthHook(hook).FACTORY() == address(this), "WrongFactory");
        HOOK = hook;
        emit HookSet(hook);
    }

    function createPool(
        Currency currency0,
        Currency currency1,
        uint24 fee,
        int24 tickSpacing,
        uint160 sqrtPriceX96,
        uint64 maturityTs,
        IBaseIndex baseIndex,
        IRiskEngine riskEngine,
        PythOracleAdapter pythAdapter
    ) external returns (PoolId id, address hook) {
        require(HOOK != address(0), "HookNotSet");

        PoolKey memory key = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(HOOK)
        });

        MANAGER.initialize(key, sqrtPriceX96);

        id = key.toId();
        // Register per-pool modules and maturity on the singleton hook
        ArthHook(HOOK).registerPool(key, baseIndex, riskEngine, pythAdapter, maturityTs);
        emit PoolCreated(id, HOOK, maturityTs);
        hook = HOOK;
    }

    function setRouter(address hookAddr, address router) external onlyOwner {
        // for convenience, keep setter signature—but it should be the singleton HOOK
        require(hookAddr == HOOK, "NotSingletonHook");
        ArthHook(hookAddr).setRouter(router);
    }
}

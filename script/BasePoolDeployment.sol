// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";

import {ArthHook} from "../src/hooks/ArthHook.sol";
import {BaseIndex} from "../src/oracles/BaseIndex.sol";
import {PythOracleAdapter} from "../src/oracles/PythOracleAdapter.sol";
import {ArthPoolFactory} from "../src/factory/ArthPoolFactory.sol";
import {ArthLiquidityCaps} from "../src/risk/ArthLiquidityCaps.sol";

import {IBaseIndex} from "../src/interfaces/IBaseIndex.sol";
import {IRiskEngine} from "../src/interfaces/IRiskEngine.sol";

abstract contract BasePoolDeployment is Script {
    using PoolIdLibrary for PoolKey;

    // Sepolia PoolManager - hardcoded for safety
    address constant POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;

    // Infrastructure addresses - loaded from env
    address public baseIndex;
    address public riskEngine;
    address public factory;
    address public caps;
    address public pythAdapter;

    function _envAddress(string memory key) internal view returns (address a) {
        try vm.envAddress(key) returns (address v) {
            require(v != address(0), string.concat("Zero env: ", key));
            a = v;
        } catch {
            revert(string.concat("Missing env: ", key));
        }
    }

    function _sort(
        address a,
        address b
    ) internal pure returns (address c0, address c1, bool flipped) {
        require(a != address(0) && b != address(0), "ZERO_TOKEN");
        require(a != b, "TOKENS_EQUAL");
        if (a < b) return (a, b, false);
        return (b, a, true);
    }

    function _invertSqrtPriceX96(uint160 sp) internal pure returns (uint160) {
        require(sp != 0, "BAD_SQRT_PRICE");
        uint256 Q96 = 2 ** 96;
        return uint160((Q96 * Q96) / sp);
    }

    function _requiredFlags() internal pure returns (uint160) {
        // Build exactly the flags that ArthHook implements
        return uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );
    }

    function _hooksMask() internal pure returns (uint160) {
        // Use the official Uniswap v4 hooks mask
        return uint160(0xFFFF); // Last 16 bits for hook permissions
    }

    function _initCodeHash(
        address manager,
        address baseIndexAddr,
        address riskEngineAddr,
        address factoryAddr,
        address pythAdapterAddr
    ) internal pure returns (bytes32) {
        // Must match ArthHook constructor exactly
        bytes memory init = abi.encodePacked(
            type(ArthHook).creationCode,
            abi.encode(manager, baseIndexAddr, riskEngineAddr, factoryAddr, pythAdapterAddr)
        );
        return keccak256(init);
    }

    function _mine(
        bytes32 initHash,
        address factoryAddress,
        uint256 saltStart
    ) internal view returns (bytes32, address) {
        uint160 requiredFlags = _requiredFlags();
        uint160 mask = _hooksMask();

        console2.log("Mining hook address with flags:", requiredFlags);
        console2.log("Using mask:", mask);
        console2.log("Starting salt search from:", saltStart);

        // Search up to 50M salts with better entropy distribution
        for (uint256 i = 0; i < 50_000_000; ++i) {
            // Better dispersion than bytes32(i) - hash the salt for entropy
            bytes32 salt = keccak256(abi.encodePacked(saltStart + i, initHash, block.timestamp));
            address predicted = Create2.computeAddress(salt, initHash, factoryAddress);

            // Check if the address matches our required hook flags
            if ((uint160(predicted) & mask) == requiredFlags) {
                // Verify address is not already deployed
                uint256 size;
                assembly { size := extcodesize(predicted) }
                if (size == 0) {
                    console2.log("Found valid hook address after", i, "attempts");
                    return (salt, predicted);
                }
            }

            // Progress logging every 1M attempts
            if (i % 1_000_000 == 0 && i > 0) {
                console2.log("Searched", i, "salts...");
            }
        }
        
        revert("Salt not found (expand search or relax flags)");
    }

    function deployPool(
        address token0,
        address token1,
        uint24 fee,
        int24 tickSpacing,
        uint160 sqrtPriceX96,
        uint64 maturity,
        string memory description,
        uint256 saltStart
    ) internal returns (PoolId poolId, address hook) {
        console2.log(string.concat("=== Deploying ", description, " ==="));
        
        // Sort tokens
        (address c0, address c1, bool flipped) = _sort(token0, token1);
        uint160 price = sqrtPriceX96;
        if (flipped) price = _invertSqrtPriceX96(price);
        
        console2.log("Token0 (sorted):", c0);
        console2.log("Token1 (sorted):", c1);
        console2.log("Price flipped:", flipped);
        
        // Generate init code hash
        bytes32 initHash = _initCodeHash(
            POOL_MANAGER,
            baseIndex,
            riskEngine,
            factory,
            pythAdapter
        );
        
        // Mine salt for proper hook address
        (bytes32 salt, address predictedHook) = _mine(initHash, factory, saltStart);
        console2.log("Mined salt:", vm.toString(salt));
        console2.log("Predicted hook:", predictedHook);
        
        // Create pool
        (poolId, hook) = ArthPoolFactory(factory).createPool(
            Currency.wrap(c0),
            Currency.wrap(c1),
            fee,
            tickSpacing,
            price,
            maturity,
            IBaseIndex(baseIndex),
            IRiskEngine(riskEngine),
            PythOracleAdapter(pythAdapter),
            salt
        );
        
        // Verify hook address matches prediction
        require(hook == predictedHook, "HOOK_ADDR_MISMATCH");
        console2.log("Pool ID:", vm.toString(PoolId.unwrap(poolId)));
        console2.log("Hook deployed at:", hook);
        console2.log("Maturity:", maturity);
        
        // Set router for hook
        ArthPoolFactory(factory).setRouter(hook, _envAddress("ROUTER_ADDRESS"));
        console2.log("Set router for hook");
        
        // Configure unlimited caps for testing
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(c0),
            currency1: Currency.wrap(c1),
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(hook)
        });
        
        ArthLiquidityCaps(caps).setCap(key.toId(), type(uint128).max);
        console2.log("Set unlimited cap for pool");
        
        console2.log(string.concat(description, " deployed successfully!"));
        console2.log("");
        
        // Log final summary for this pool
        console2.log(string.concat("=== ", description, " Summary ==="));
        console2.log("Pool ID:", vm.toString(PoolId.unwrap(poolId)));
        console2.log("Hook Address:", hook);
        console2.log("Maturity:", maturity);
        console2.log("Tokens:", string.concat(
            token0 == c0 ? "token0/token1" : "token1/token0"
        ));
        console2.log("Fee Tier:", fee);
        console2.log("");
    }

    function loadInfrastructureAddresses() internal {
        // Load deployed infrastructure addresses from environment
        baseIndex = _envAddress("BASE_INDEX");
        riskEngine = _envAddress("RISK_ENGINE"); 
        factory = _envAddress("FACTORY");
        caps = _envAddress("CAPS");
        pythAdapter = _envAddress("PYTH_ADAPTER");
        
        console2.log("Loaded infrastructure addresses:");
        console2.log("BaseIndex:", baseIndex);
        console2.log("RiskEngine:", riskEngine);
        console2.log("Factory:", factory);
        console2.log("Caps:", caps);
        console2.log("PythAdapter:", pythAdapter);
        console2.log("");
    }
}
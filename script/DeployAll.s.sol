// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
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
import {ArthV4Router} from "../src/periphery/ArthV4Router.sol";
import {ArthReceipts} from "../src/periphery/ArthReceipts.sol";
import {ArthController} from "../src/governance/ArthController.sol";
import {IWETH9} from "../src/interfaces/IWETH.sol";

import {IBaseIndex} from "../src/interfaces/IBaseIndex.sol";
import {IRiskEngine} from "../src/interfaces/IRiskEngine.sol";
import {RiskEngine} from "../src/risk/RiskEngine.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

contract DeployAll is Script {
    using Strings for uint256;
    using PoolIdLibrary for PoolKey;

    function _envAddress(string memory key) internal view returns (address a) {
        try vm.envAddress(key) returns (address v) {
            require(v != address(0), string.concat("Zero env: ", key));
            a = v;
        } catch {
            revert(string.concat("Missing env: ", key));
        }
    }

    function _envAddressOrZero(string memory key) internal view returns (address a) {
        try vm.envAddress(key) returns (address v) {
            a = v;
        } catch {
            a = address(0);
        }
    }

    function _getPythContract() internal view returns (address) {
        uint256 chainId = block.chainid;
        
        if (chainId == 1) {
            return 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
        } else if (chainId == 11155111) {
            return 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21;
        } else if (chainId == 42161) {
            return 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
        } else if (chainId == 421614) {
            return 0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF;
        } else if (chainId == 10) {
            return 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
        } else if (chainId == 137) {
            return 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
        } else if (chainId == 8453) {
            return 0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a;
        } else {
            address envPyth = _envAddressOrZero("PYTH_CONTRACT");
            require(envPyth != address(0), "Unknown network and PYTH_CONTRACT not set");
            return envPyth;
        }
    }

    function _resolvePoolManager() internal view returns (address pm) {
        pm = _envAddressOrZero("POOL_MANAGER");
        if (pm != address(0)) return pm;

        string memory cidKey = string.concat(
            "POOL_MANAGER_",
            block.chainid.toString()
        );
        pm = _envAddressOrZero(cidKey);
        if (pm != address(0)) return pm;

        if (block.chainid == 1) pm = _envAddressOrZero("POOL_MANAGER_MAINNET");
        else if (block.chainid == 11155111)
            pm = _envAddressOrZero("POOL_MANAGER_SEPOLIA");
        else if (block.chainid == 8453)
            pm = _envAddressOrZero("POOL_MANAGER_BASE");
        else if (block.chainid == 84532)
            pm = _envAddressOrZero("POOL_MANAGER_BASE_SEPOLIA");
        else if (block.chainid == 42161)
            pm = _envAddressOrZero("POOL_MANAGER_ARBITRUM");
        else if (block.chainid == 421614)
            pm = _envAddressOrZero("POOL_MANAGER_ARBITRUM_SEPOLIA");
        else if (block.chainid == 10)
            pm = _envAddressOrZero("POOL_MANAGER_OPTIMISM");
        else if (block.chainid == 137)
            pm = _envAddressOrZero("POOL_MANAGER_POLYGON");

        require(
            pm != address(0),
            string.concat(
                "PoolManager not set. Provide POOL_MANAGER or ",
                cidKey,
                " (or a network alias env var). chainId=",
                block.chainid.toString()
            )
        );
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

    function _initCodeHash(
        address manager,
        address baseIndex,
        address riskEngine,
        address factory
    ) internal pure returns (bytes32) {
        bytes memory init = abi.encodePacked(
            type(ArthHook).creationCode,
            abi.encode(manager, baseIndex, riskEngine, factory)
        );
        return keccak256(init);
    }

    function _mine(
        bytes32 initCodeHash,
        address deployer
    ) internal pure returns (bytes32 salt, address predicted) {
        uint160 FLAGS = Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG;

        uint160 MASK = uint160((1 << 16) - 1); 

        unchecked {
            for (uint256 i = 1; ; ++i) {
                bytes32 s = bytes32(i);
                bytes32 h = keccak256(
                    abi.encodePacked(bytes1(0xff), deployer, s, initCodeHash)
                );
                address a = address(uint160(uint256(h)));
                if ((uint160(a) & MASK) == FLAGS) return (s, a);
            }
        }
    }

    function run() external {
        address pmAddr = _envAddressOrZero("POOL_MANAGER");
        if (pmAddr == address(0)) {
            string memory cidKey = string.concat("POOL_MANAGER_", block.chainid.toString());
            pmAddr = _envAddressOrZero(cidKey);
            if (pmAddr == address(0)) {
                if (block.chainid == 1) pmAddr = _envAddressOrZero("POOL_MANAGER_MAINNET");
                else if (block.chainid == 11155111) pmAddr = _envAddressOrZero("POOL_MANAGER_SEPOLIA");
                else if (block.chainid == 8453) pmAddr = _envAddressOrZero("POOL_MANAGER_BASE");
                else if (block.chainid == 84532) pmAddr = _envAddressOrZero("POOL_MANAGER_BASE_SEPOLIA");
                else if (block.chainid == 42161) pmAddr = _envAddressOrZero("POOL_MANAGER_ARBITRUM");
                else if (block.chainid == 421614) pmAddr = _envAddressOrZero("POOL_MANAGER_ARBITRUM_SEPOLIA");
                else if (block.chainid == 10) pmAddr = _envAddressOrZero("POOL_MANAGER_OPTIMISM");
                else if (block.chainid == 137) pmAddr = _envAddressOrZero("POOL_MANAGER_POLYGON");
            }
        }
        address wethAddr = _envAddress("WETH");
        address token0Env = _envAddress("TOKEN0");
        address token1Env = _envAddress("TOKEN1");
        address uiWallet = _envAddress("UI_WALLET");

        uint64 maturity = uint64(vm.envUint("MATURITY")); 
        uint24 fee = uint24(vm.envUint("FEE")); 
        int24 tickSpacing = int24(uint24(vm.envUint("TICK_SPACING"))); 
        uint160 sqrtPriceX96 = uint160(vm.envUint("SQRT_PRICE_X96")); 

        require(maturity > block.timestamp, "BAD_MATURITY");
        require(sqrtPriceX96 != 0, "BAD_SQRT_PRICE");

        (address c0Addr, address c1Addr, bool flipped) = _sort(
            token0Env,
            token1Env
        );
        if (flipped) {
            sqrtPriceX96 = _invertSqrtPriceX96(sqrtPriceX96);
        }

        vm.startBroadcast();

        if (pmAddr == address(0)) {
            PoolManager pm = new PoolManager(msg.sender);
            pmAddr = address(pm);
            console2.log("Deployed local PoolManager:", pmAddr);
        }

        IPoolManager manager = IPoolManager(pmAddr);

        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = msg.sender;
        executors[0] = msg.sender;
        TimelockController timelock = new TimelockController(
            1 days, 
            proposers,
            executors,
            msg.sender 
        );

        BaseIndex base = new BaseIndex(
            msg.sender, 
            wethAddr, 
            200_000, 
            200_000, 
            1 hours, 
            new address[](0) 
        );
        RiskEngine risk = new RiskEngine(msg.sender);
        ArthPoolFactory factory = new ArthPoolFactory(manager);

        ArthController controller = new ArthController(msg.sender, timelock);

        ArthLiquidityCaps caps = new ArthLiquidityCaps(msg.sender);
        
        address pythContract = _getPythContract();
        console2.log("Deploying PythOracleAdapter with Pyth contract:", pythContract);
        PythOracleAdapter pythAdapter = new PythOracleAdapter(
            pythContract,
            12 hours 
        );
        console2.log("PythOracleAdapter deployed at:", address(pythAdapter));
        
        ArthV4Router router = new ArthV4Router(
            manager,
            IWETH9(wethAddr),
            caps,
            pythAdapter,
            msg.sender
        );
        
        ArthReceipts receipts = new ArthReceipts(msg.sender, address(router));

        vm.stopBroadcast();

        bytes32 initHash = _initCodeHash(
            address(manager),
            address(base),
            address(risk),
            address(factory)
        );
        (bytes32 salt, address predictedHook) = _mine(
            initHash,
            address(factory)
        );
        console2.log("Mined salt:        ", vm.toString(salt));
        console2.log("Predicted hook:    ", predictedHook);

        vm.startBroadcast();

        (PoolId id, address hook) = factory.createPool(
            Currency.wrap(c0Addr),
            Currency.wrap(c1Addr),
            fee,
            tickSpacing,
            sqrtPriceX96,
            maturity,
            IBaseIndex(address(base)),
            IRiskEngine(address(risk)),
            pythAdapter,
            salt
        );

        factory.setRouter(hook, address(router));
        
        base.setController(address(controller));
        base.transferOwnership(address(controller));

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(c0Addr),
            currency1: Currency.wrap(c1Addr),
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(hook)
        });
        caps.setLP(uiWallet, true);
        caps.setCap(key.toId(), type(uint128).max);

        vm.stopBroadcast();

        console2.log("=== Arth v4 Deployment ===");
        console2.log("chainId");
        console2.log(block.chainid);
        console2.log("PoolManager");
        console2.log(pmAddr);
        console2.log("WETH");
        console2.log(wethAddr);

        console2.log("Env TOKEN0");
        console2.log(token0Env);
        console2.log("Env TOKEN1");
        console2.log(token1Env);
        console2.log("Pool currency0");
        console2.log(c0Addr);
        console2.log("Pool currency1");
        console2.log(c1Addr);
        console2.log("flipped (env->pool)");
        console2.log(flipped);

        console2.log("Index");
        console2.log(address(base));
        console2.log("RiskEngine");
        console2.log(address(risk));
        console2.log("ArthPoolFactory");
        console2.log(address(factory));
        console2.log("ArthController");
        console2.log(address(controller));
        console2.log("TimelockController");
        console2.log(address(timelock));
        console2.log("ArthLiquidityCaps");
        console2.log(address(caps));
        console2.log("ArthV4Router");
        console2.log(address(router));
        console2.log("ArthReceipts");
        console2.log(address(receipts));
        console2.log("Hook (Pool)");
        console2.log(hook);
        console2.log("Predicted hook");
        console2.log(predictedHook);

        console2.log("PoolId (bytes32)");
        console2.logBytes32(PoolId.unwrap(id));
        console2.log("PoolId (uint)");
        console2.log(uint256(PoolId.unwrap(id)));
    }
}

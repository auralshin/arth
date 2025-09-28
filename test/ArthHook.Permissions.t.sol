// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams, ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";

import {ArthHook} from "../src/hooks/ArthHook.sol";
import {ArthPoolFactory} from "../src/factory/ArthPoolFactory.sol";
import {BaseIndex} from "../src/oracles/BaseIndex.sol";
import {PythOracleAdapter} from "../src/oracles/PythOracleAdapter.sol";
import {MockPyth} from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";
import {IRiskEngine} from "../src/interfaces/IRiskEngine.sol";
import {IBaseIndex} from "../src/interfaces/IBaseIndex.sol";
import {RiskEngine} from "../src/risk/RiskEngine.sol";
import {Errors} from "../src/libraries/Errors.sol";

contract ArthHook_Permissions is Test {
    using PoolIdLibrary for PoolKey;

    IPoolManager manager;
    ArthPoolFactory factory;
    BaseIndex base;
    RiskEngine risk;
    MockPyth mockPyth;
    PythOracleAdapter pyth;
    ArthHook hook;

    address public owner = address(0xBEEF);
    address public router = address(0xCAFE);
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    // Hook flag constants
    uint16 constant HOOK_PREFIX = 0x4000;        // 0100_0000_0000_0000 (isHook bit)
    uint16 constant FLAGS_ONLY_MASK = 0x3FFF;    // lower 14 bits (strip prefix)

    function _computeAddress(
        address deployer,
        uint256 salt,
        bytes memory creationCodeWithArgs
    ) internal pure returns (address) {
        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                bytes1(0xFF),
                                deployer,
                                salt,
                                keccak256(creationCodeWithArgs)
                            )
                        )
                    )
                )
            );
    }

    function _findSalt(address deployer) internal view returns (bytes32) {
        bytes memory creation = type(ArthHook).creationCode;

        // Constructor arguments for ArthHook (new singleton pattern)
        bytes memory constructorArgs = abi.encode(
            manager,
            address(factory)
        );
        bytes memory creationWithArgs = abi.encodePacked(creation, constructorArgs);

        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );

        // Use a more systematic approach to find the salt
        // The flags need to match the lower bits of the address
        for (uint256 s = 0; s < 100_000; ++s) {
            address predicted = _computeAddress(deployer, s, creationWithArgs);
            
            // Check if the lower bits match our desired flags
            if ((uint160(predicted) & uint160(0xFFFF)) == (flags & uint160(0xFFFF))) {
                // Additional check to make sure we're not colliding with existing code
                if (predicted.code.length == 0) {
                    return bytes32(s);
                }
            }
        }
        revert("could not find salt");
    }

    function setUp() public {
        manager = new PoolManager(owner);

        address[] memory srcs;
        base = new BaseIndex(address(this), address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2), 200_000, 200_000, 3600, srcs);

        risk = new RiskEngine(owner);
        vm.prank(owner);
        risk.setOperator(address(this), true);

        mockPyth = new MockPyth(60, 1);
        pyth = new PythOracleAdapter(address(mockPyth), 60);

        factory = new ArthPoolFactory(manager, owner);

        // Fix: mine and deploy hook with CREATE2 so BaseHook validation passes
        (ArthHook h,) = _deployArthHookViaMiner(
            address(this), // deployer (the test itself)
            manager, 
            address(factory)
        );
        hook = h;

        // wire router (ArthHook.onlyFactory)
        vm.prank(address(factory));
        hook.setRouter(router);
    }

    function _deployArthHookViaMiner(
        address deployer,
        IPoolManager _manager,
        address _factory
    ) internal returns (ArthHook h, address predicted) {
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG     |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG  |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );
        bytes memory args = abi.encode(_manager, _factory);
        (address want, bytes32 salt) = HookMiner.find(deployer, flags, type(ArthHook).creationCode, args);
        h = new ArthHook{salt: salt}(_manager, _factory);
        require(address(h) == want, "mined addr mismatch");
        predicted = want;
    }

    function _mkKey(address t0, address t1) internal view returns (PoolKey memory key) {
        key = PoolKey({
            currency0: Currency.wrap(t0),
            currency1: Currency.wrap(t1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(hook))
        });
    }    function _createPool()
        internal
        returns (PoolKey memory key, PoolId id, address hookAddr)
    {
        Currency c0 = Currency.wrap(address(0xC002)); 
        Currency c1 = Currency.wrap(address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)); 

        // set singleton hook
        vm.prank(owner);
        factory.setHook(address(hook));

        (id, hookAddr) = factory.createPool(
            c0,
            c1,
            3000,
            60,
            79228162514264337593543950336, 
            uint64(block.timestamp + 30 days),
            IBaseIndex(address(base)),
            IRiskEngine(address(risk)),
            pyth
        );

        key = PoolKey({
            currency0: c0,
            currency1: c1,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(hookAddr)
        });
    }


    function test_FlagsIncludeAddRemoveHooks() public {
        (, , address hookAddr) = _createPool();

        uint160 expectedFlags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );

        // Compare flags-only (ignoring hook prefix)
        uint16 actualFlags = uint16(uint160(hookAddr)) & FLAGS_ONLY_MASK;
        uint16 expectedFlagsOnly = uint16(expectedFlags) & FLAGS_ONLY_MASK;
        
        assertEq(actualFlags, expectedFlagsOnly, "hook LSB flags must include add/remove");
    }

    function test_RiskGate_UsesSender_Address() public {
        (PoolKey memory key, , address hookAddr) = _createPool();

        risk.onFundingAccrued(bob, int256(1e18));

        SwapParams memory sp = SwapParams({
            zeroForOne: true,
            amountSpecified: 1,
            sqrtPriceLimitX96: 0
        });
        
        // Call hook as PoolManager (BaseHook check) with router as tx.origin (UseRouter check)
        vm.prank(address(manager), router);
        (bytes4 sel, BeforeSwapDelta d, uint24 optFee) = ArthHook(hookAddr)
            .beforeSwap(router, key, sp, abi.encode(alice));

        assertEq(sel, IHooks.beforeSwap.selector);
        assertEq(
            BeforeSwapDelta.unwrap(d),
            BeforeSwapDelta.unwrap(BeforeSwapDeltaLibrary.ZERO_DELTA)
        );
        assertEq(optFee, 0);

        // Call hook as PoolManager but expect revert due to bob's insufficient equity
        vm.prank(address(manager), router);
        vm.expectRevert(Errors.InsufficientEquity.selector);
        ArthHook(hookAddr).beforeSwap(router, key, sp, abi.encode(bob));
    }

    function test_AfterInitialize_Selector() public {
        (PoolKey memory key, , address hookAddr) = _createPool();

        vm.prank(address(manager));
        bytes4 sel = ArthHook(hookAddr).afterInitialize(
            address(this),
            key,
            79228162514264337593543950336,
            0
        );
        assertEq(sel, IHooks.afterInitialize.selector);
    }

    function test_SetMaturity_OnlyFactoryAndBlocksAdd() public {
        (PoolKey memory key, PoolId id, address hookAddr) = _createPool();

        vm.expectRevert(Errors.NotFactory.selector);
        ArthHook(hookAddr).setMaturity(id, uint64(block.timestamp + 5 days));

        vm.prank(address(factory));
        ArthHook(hookAddr).setMaturity(id, uint64(block.timestamp - 1)); 

        ModifyLiquidityParams memory ap = ModifyLiquidityParams({
            tickLower: -60,
            tickUpper: 60,
            liquidityDelta: 1,
            salt: bytes32(0)
        });

        // Call hook as PoolManager (BaseHook check) with router as tx.origin and sender
        vm.prank(address(manager), router);
        vm.expectRevert(Errors.PoolMatured.selector);
        ArthHook(hookAddr).beforeAddLiquidity(
            router,
            key,
            ap,
            abi.encode(alice)
        );
    }
}

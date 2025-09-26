// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

import {ArthPoolFactory} from "../src/factory/ArthPoolFactory.sol";
import {ArthHook} from "../src/hooks/ArthHook.sol";
import {BaseIndex} from "../src/oracles/BaseIndex.sol";
import {PythOracleAdapter} from "../src/oracles/PythOracleAdapter.sol";
import {MockPyth} from "../lib/pyth-sdk-solidity/MockPyth.sol";
import {IBaseIndex} from "../src/interfaces/IBaseIndex.sol";
import {IRiskEngine} from "../src/interfaces/IRiskEngine.sol";
import {RiskEngine} from "../src/risk/RiskEngine.sol";
import {Errors} from "../src/libraries/Errors.sol";

contract ArthHook_Permissions is Test {
    using PoolIdLibrary for PoolKey;

    IPoolManager manager;
    BaseIndex base;
    ArthPoolFactory factory;
    RiskEngine risk;
    MockPyth mockPyth;
    PythOracleAdapter pythAdapter;

    address owner = address(0xa);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

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

        bytes memory args = abi.encode(
            manager,
            IBaseIndex(address(base)),
            IRiskEngine(address(risk)),
            address(factory),
            pythAdapter
        );
        bytes memory creationWithArgs = abi.encodePacked(creation, args);

        uint160 want = (Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG);
        uint160 mask = Hooks.ALL_HOOK_MASK;

        for (uint256 s = 1; s < 50_000; ++s) {
            address a = _computeAddress(deployer, s, creationWithArgs);
            if ((uint160(a) & mask) == want && a.code.length == 0) {
                return bytes32(s);
            }
        }
        revert("could not find salt");
    }

    function setUp() public {
        manager = new PoolManager(owner);

        address[] memory sources = new address[](0);
        base = new BaseIndex(
            address(this), 
            address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2), 
            200_000, 
            200_000, 
            3600, 
            sources
        );

        risk = new RiskEngine(owner);
        vm.prank(owner);
        risk.setOperator(address(this), true); 

        mockPyth = new MockPyth(60, 1); 
        pythAdapter = new PythOracleAdapter(address(mockPyth), 60); 

        factory = new ArthPoolFactory(manager);
    }

    function _createPool()
        internal
        returns (PoolKey memory key, PoolId id, address hook)
    {
        Currency c0 = Currency.wrap(address(0xC002)); 
        Currency c1 = Currency.wrap(address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)); 

        bytes32 salt = _findSalt(address(factory));

        (id, hook) = factory.createPool(
            c0,
            c1,
            3000,
            60,
            79228162514264337593543950336, 
            uint64(block.timestamp + 30 days),
            IBaseIndex(address(base)),
            IRiskEngine(address(risk)),
            pythAdapter,
            salt
        );

        key = PoolKey({
            currency0: c0,
            currency1: c1,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(hook)
        });

        vm.prank(address(factory));
        ArthHook(hook).setRouter(address(this));
    }


    function test_FlagsIncludeAddRemoveHooks() public {
        (, , address hookAddr) = _createPool();

        uint160 mask = Hooks.ALL_HOOK_MASK;
        uint160 want = (Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG);

        uint160 flags = uint160(hookAddr) & mask;
        assertEq(flags, want, "hook LSB flags must include add/remove");
    }

    function test_RiskGate_UsesSender_Address() public {
        (PoolKey memory key, , address hookAddr) = _createPool();

        risk.onFundingAccrued(bob, int256(1e18));

        vm.startPrank(address(manager), address(this));
        SwapParams memory sp = SwapParams({
            zeroForOne: true,
            amountSpecified: 1,
            sqrtPriceLimitX96: 0
        });
        (bytes4 sel, BeforeSwapDelta d, uint24 optFee) = ArthHook(hookAddr)
            .beforeSwap(address(this), key, sp, abi.encode(alice));
        vm.stopPrank();

        assertEq(sel, IHooks.beforeSwap.selector);
        assertEq(
            BeforeSwapDelta.unwrap(d),
            BeforeSwapDelta.unwrap(BeforeSwapDeltaLibrary.ZERO_DELTA)
        );
        assertEq(optFee, 0);

        vm.startPrank(address(manager), address(this));
        vm.expectRevert(Errors.InsufficientEquity.selector);
        ArthHook(hookAddr).beforeSwap(address(this), key, sp, abi.encode(bob));
        vm.stopPrank();
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

        vm.prank(address(manager));
        ModifyLiquidityParams memory ap = ModifyLiquidityParams({
            tickLower: -60,
            tickUpper: 60,
            liquidityDelta: 1,
            salt: bytes32(0)
        });

        vm.expectRevert(Errors.PoolMatured.selector);
        ArthHook(hookAddr).beforeAddLiquidity(
            address(this),
            key,
            ap,
            abi.encode(alice)
        );
    }
}

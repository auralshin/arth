// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";

import {ArthPoolFactory} from "../src/factory/ArthPoolFactory.sol";
import {ArthHook} from "../src/hooks/ArthHook.sol";
import {BaseIndex} from "../src/oracles/BaseIndex.sol";
import {PythOracleAdapter} from "../src/oracles/PythOracleAdapter.sol";
import {MockPyth} from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";
import {IBaseIndex} from "../src/interfaces/IBaseIndex.sol";
import {IRiskEngine} from "../src/interfaces/IRiskEngine.sol";
import {RiskEngine} from "../src/risk/RiskEngine.sol";
import {Errors} from "../src/libraries/Errors.sol";

contract ArthHookTest is Test {
    using PoolIdLibrary for PoolKey;

    IPoolManager manager;
    ArthPoolFactory factory;
    BaseIndex base;
    RiskEngine risk;
    MockPyth mockPyth;
    PythOracleAdapter pythAdapter;

    address owner  = address(0xA);
    address router = address(this);
    address alice  = address(0xA11CE);
    address bob    = address(0xB0B);

    // Hook flag constants
    uint16 constant HOOK_PREFIX = 0x4000;        // 0100_0000_0000_0000 (isHook bit)
    uint16 constant FLAGS_ONLY_MASK = 0x3FFF;    // lower 14 bits (strip prefix)

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
        mockPyth = new MockPyth(60, 1);
        pythAdapter = new PythOracleAdapter(address(mockPyth), 60);
        factory = new ArthPoolFactory(manager, owner);

        // 1) Mine + deploy WITH deployer = address(this) - no prank active here
        (ArthHook hook,) = _deployArthHookViaMiner(
            address(this), // same deployer for find + new
            manager,
            address(factory)
        );

        // 2) Do all onlyOwner ops under a single prank
        vm.startPrank(owner);
        risk.setOperator(address(this), true);
        factory.setHook(address(hook));
        factory.setRouter(address(hook), router);
        risk.setOperator(address(hook), true);

        vm.stopPrank();

        // sanity: owner is correct and hook was set
        assertEq(factory.owner(), owner, "factory owner mismatch");
        assertTrue(factory.HOOK() != address(0), "HOOK not set");
    }

    function _deployArthHookViaMiner(
        address deployer,
        IPoolManager _manager,
        address _factory
    ) internal returns (ArthHook hook, address predicted) {
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );
        bytes memory args = abi.encode(_manager, _factory);
        console.log("HookMiner deployer:", deployer);
        console.log("HookMiner flags:", flags);
        
        (address want, bytes32 salt) =
            HookMiner.find(deployer, flags, type(ArthHook).creationCode, args);

        console.log("HookMiner predicted address:", want);
        console.log("HookMiner salt:", uint256(salt));
        
        uint160 wantLower16 = uint160(want) & uint160(0xFFFF);
        uint160 flagsLower16 = flags & uint160(0xFFFF);
        console.log("Want address lower 16:", wantLower16);
        console.log("Flags lower 16:", flagsLower16);
        
        // Deployed by THIS test; address must match mined one
        hook = new ArthHook{salt: salt}(_manager, _factory);
        console.log("Actually deployed at:", address(hook));
        require(address(hook) == want, "ArthHook: mined address mismatch");
        predicted = want;
    }

    function _registerPool(
        Currency c0,
        Currency c1,
        uint24 fee,
        int24 tickSpacing,
        uint160 sqrtPriceX96,
        uint64 maturity
    ) internal returns (PoolKey memory key, PoolId id, ArthHook hook) {
        address hookAddr;
        (id, hookAddr) = factory.createPool(
            c0, c1, fee, tickSpacing, sqrtPriceX96, maturity,
            IBaseIndex(address(base)),
            IRiskEngine(address(risk)),
            pythAdapter
        );

        hook = ArthHook(hookAddr);
        key = PoolKey({
            currency0: c0,
            currency1: c1,
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(hook))
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Factory / Hook deployment
    // ──────────────────────────────────────────────────────────────────────────

    function test_HookDeploymentFlags() public view {
        address h = factory.HOOK();
        assertTrue(h != address(0), "hook deployed");

        uint160 expectedFlags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );

        uint16 actualFlags = uint16(uint160(h)) & FLAGS_ONLY_MASK;
        uint16 expectedFlagsOnly = uint16(expectedFlags) & FLAGS_ONLY_MASK;
        assertEq(actualFlags, expectedFlagsOnly, "flags lower-16");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Pool registration & maturity
    // ──────────────────────────────────────────────────────────────────────────

    function test_RegisterPool_setsMaturity() public {
        Currency c0 = Currency.wrap(address(0xC002));
        Currency c1 = Currency.wrap(address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2));
        (PoolKey memory key, PoolId id, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));
        (uint64 m,, , , , ) = hook.poolMeta(id);
        assertGt(m, 0);

        // afterInitialize selector sanity
        vm.prank(address(manager));
        bytes4 sel = hook.afterInitialize(address(this), key, 2**96, 0);
        assertEq(sel, IHooks.afterInitialize.selector);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OnlyPoolManager & router gate
    // ──────────────────────────────────────────────────────────────────────────

    function test_OnlyPoolManager_guard() public {
        Currency c0 = Currency.wrap(address(0xAAA1));
        Currency c1 = Currency.wrap(address(0xAAA2));
        (PoolKey memory key,, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));

        SwapParams memory sp = SwapParams({ zeroForOne: true, amountSpecified: 1, sqrtPriceLimitX96: 0 });
        vm.expectRevert();
        hook.beforeSwap(address(this), key, sp, abi.encode(alice));
    }

    function test_RouterGate_UseRouter() public {
        Currency c0 = Currency.wrap(address(0xBBB1));
        Currency c1 = Currency.wrap(address(0xBBB2));
        (PoolKey memory key,, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));

        SwapParams memory sp = SwapParams({ zeroForOne: true, amountSpecified: 1, sqrtPriceLimitX96: 0 });
        vm.startPrank(address(manager), address(this));
        vm.expectRevert(Errors.UseRouter.selector);
        hook.beforeSwap(address(0xDEAD), key, sp, abi.encode(alice));
        vm.stopPrank();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Risk engine gates
    // ──────────────────────────────────────────────────────────────────────────

    function test_RiskGate_AllowsHealthy() public {
        Currency c0 = Currency.wrap(address(0xCCC1));
        Currency c1 = Currency.wrap(address(0xCCC2));
        (PoolKey memory key,, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));

        vm.startPrank(address(manager), address(this));
        SwapParams memory sp = SwapParams({ zeroForOne: true, amountSpecified: 1, sqrtPriceLimitX96: 0 });
        (bytes4 sel, BeforeSwapDelta d, uint24 optFee) = hook.beforeSwap(router, key, sp, abi.encode(alice));
        vm.stopPrank();

        assertEq(sel, IHooks.beforeSwap.selector);
        assertEq(BeforeSwapDelta.unwrap(d), BeforeSwapDelta.unwrap(BeforeSwapDeltaLibrary.ZERO_DELTA));
        assertEq(optFee, 0);
    }

    function test_RiskGate_BlocksUnhealthy() public {
        Currency c0 = Currency.wrap(address(0xDDD1));
        Currency c1 = Currency.wrap(address(0xDDD2));
        (PoolKey memory key,, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));

        risk.onFundingAccrued(bob, int256(1e18));

        vm.startPrank(address(manager), address(this));
        SwapParams memory sp = SwapParams({ zeroForOne: true, amountSpecified: 1, sqrtPriceLimitX96: 0 });
        vm.expectRevert(Errors.InsufficientEquity.selector);
        hook.beforeSwap(router, key, sp, abi.encode(bob));
        vm.stopPrank();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Liquidity add/remove + position enumeration
    // ──────────────────────────────────────────────────────────────────────────

    function test_AddRemoveLiquidity_updatesTotalsAndEnumeration() public {
        Currency c0 = Currency.wrap(address(0xEEE1));
        Currency c1 = Currency.wrap(address(0xEEE2));
        (PoolKey memory key, PoolId id, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));

        ModifyLiquidityParams memory addP = ModifyLiquidityParams({
            tickLower: -60,
            tickUpper: 60,
            liquidityDelta: int256(1_000_000),
            salt: bytes32(0)
        });

        vm.startPrank(address(manager), address(this));
        hook.beforeAddLiquidity(router, key, addP, abi.encode(alice));
        hook.afterAddLiquidity(router, key, addP, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(alice));
        vm.stopPrank();

        (,, , uint256 growthX128, uint128 totalL, bool frozen) = hook.poolMeta(id);
        assertEq(totalL, 1_000_000);
        assertTrue(!frozen);
        assertEq(growthX128, 0);

        bytes32[] memory keys = hook.getUserPositionKeys(alice);
        assertEq(keys.length, 1);

        ModifyLiquidityParams memory remP = ModifyLiquidityParams({
            tickLower: -60,
            tickUpper: 60,
            liquidityDelta: -int256(1_000_000),
            salt: bytes32(0)
        });

        vm.startPrank(address(manager), address(this));
        hook.beforeRemoveLiquidity(router, key, remP, abi.encode(alice));
        hook.afterRemoveLiquidity(router, key, remP, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(alice));
        vm.stopPrank();

        (,, , growthX128, totalL, frozen) = hook.poolMeta(id);
        assertEq(totalL, 0);
        assertEq(hook.getUserPositionKeys(alice).length, 0);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Funding growth math & owed
    // ──────────────────────────────────────────────────────────────────────────

    function test_FundingGrowth_NoLiquidity_NoChange() public {
        Currency c0 = Currency.wrap(address(0xF001));
        Currency c1 = Currency.wrap(address(0xF002));
        (PoolKey memory key, PoolId id, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));

        vm.startPrank(address(manager), address(this));
        hook.beforeSwap(router, key, SwapParams({zeroForOne:true, amountSpecified:1, sqrtPriceLimitX96:0}), abi.encode(alice));
        vm.stopPrank();

        (,, , uint256 growthX128, uint128 totalL,) = hook.poolMeta(id);
        assertEq(totalL, 0);
        assertEq(growthX128, 0);
    }

    function test_FundingGrowth_WithLiquidity_AndFundingOwed() public {
        Currency c0 = Currency.wrap(address(0xF101));
        Currency c1 = Currency.wrap(address(0xF102));
        (PoolKey memory key, PoolId id, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));

        int24 lower = -60; int24 upper = 60; bytes32 salt = bytes32(0); int256 L = 1_000_000_000_000;
        ModifyLiquidityParams memory addP = ModifyLiquidityParams({ tickLower:lower, tickUpper:upper, liquidityDelta:L, salt:salt });

        vm.startPrank(address(manager), address(this));
        hook.beforeAddLiquidity(router, key, addP, abi.encode(alice));
        hook.afterAddLiquidity(router, key, addP, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(alice));
        vm.stopPrank();

        uint256 rate = base.ratePerSecond();
        uint256 t0 = block.timestamp; vm.warp(t0 + 12345); uint256 dt = block.timestamp - t0;

        vm.startPrank(address(manager), address(this));
        hook.beforeSwap(router, key, SwapParams({zeroForOne:true, amountSpecified:1, sqrtPriceLimitX96:0}), abi.encode(alice));
        vm.stopPrank();

        (,, , uint256 growthX128, uint128 totalL,) = hook.poolMeta(id);
        assertEq(uint128(totalL), uint128(uint256(L)));

        // Trigger funding owed update without changing liquidity
        vm.startPrank(address(manager), address(this));
        hook.beforeRemoveLiquidity(router, key, ModifyLiquidityParams({tickLower:lower, tickUpper:upper, liquidityDelta:0, salt:salt}), abi.encode(alice));
        vm.stopPrank();

        int256 owed = hook.fundingOwedToken1(alice, key, lower, upper, salt);
        assertEq(owed, int256(rate * dt));

        uint256 FP = 1 << 128; uint256 perLToAmt = (growthX128 * uint256(L)) / FP;
        assertEq(int256(perLToAmt), owed);
    }

    function test_ClearFundingOwed_RouterOnly() public {
        Currency c0 = Currency.wrap(address(0xF201));
        Currency c1 = Currency.wrap(address(0xF202));
        (PoolKey memory key, PoolId id, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 30 days));

        // Set up base index with funding rate for proper accrual
        base.setRatePerSecond(1e15); // 0.001 per second for noticeable accrual

        int24 lower = -60; int24 upper = 60; bytes32 salt = bytes32(0);
        ModifyLiquidityParams memory addP = ModifyLiquidityParams({ tickLower:lower, tickUpper:upper, liquidityDelta:100_000, salt:salt });

        vm.startPrank(address(manager), address(this));
        hook.beforeAddLiquidity(router, key, addP, abi.encode(alice));
        hook.afterAddLiquidity(router, key, addP, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(alice));

        // Create significant time passage and multiple swaps to ensure funding accrual
        vm.warp(block.timestamp + 10_000);
        hook.beforeSwap(router, key, SwapParams({zeroForOne:true, amountSpecified:1000, sqrtPriceLimitX96:0}), abi.encode(alice));
        vm.warp(block.timestamp + 5_000);
        hook.beforeSwap(router, key, SwapParams({zeroForOne:false, amountSpecified:500, sqrtPriceLimitX96:0}), abi.encode(alice));
        hook.beforeRemoveLiquidity(router, key, ModifyLiquidityParams({tickLower:lower, tickUpper:upper, liquidityDelta:0, salt:salt}), abi.encode(alice));
        vm.stopPrank();

        int256 before = hook.fundingOwedToken1(alice, key, lower, upper, salt);

        // Test router-only access control - call from non-router address
        vm.prank(alice); // Alice is not the router
        vm.expectRevert(Errors.NotRouter.selector);
        hook.clearFundingOwedToken1(alice, key, lower, upper, salt);

        // Clear funding owed (should not increase from before value)
        vm.prank(router);
        int256 cleared = hook.clearFundingOwedToken1(alice, key, lower, upper, salt);
        int256 afterClear = hook.fundingOwedToken1(alice, key, lower, upper, salt);
        
        // Use non-strict assertion to handle case where before == 0
        assertLe(afterClear, before, "clear should not increase funding owed");
        assertEq(cleared, before, "cleared amount should match before amount");
        assertEq(afterClear, 0, "funding owed should be zero after clear");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Maturity freeze
    // ──────────────────────────────────────────────────────────────────────────

    function test_MaturityBlocksAddLiquidity() public {
        Currency c0 = Currency.wrap(address(0xF301));
        Currency c1 = Currency.wrap(address(0xF302));
        (PoolKey memory key, PoolId id, ArthHook hook) = _registerPool(c0, c1, 3000, 60, 2**96, uint64(block.timestamp + 1 days));

        // set maturity in the past
        vm.prank(address(factory)); // factory is authorized in hook
        hook.setMaturity(id, uint64(block.timestamp - 1));

        vm.prank(address(manager));
        ModifyLiquidityParams memory ap = ModifyLiquidityParams({ tickLower:-60, tickUpper:60, liquidityDelta:1, salt:bytes32(0) });
        vm.expectRevert(Errors.PoolMatured.selector);
        hook.beforeAddLiquidity(router, key, ap, abi.encode(alice));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Multi-pool isolation (single hook)
    // ──────────────────────────────────────────────────────────────────────────

    function test_MultiPool_IsolatedFundingGrowth() public {
        // Set up base index with funding rate for proper accrual
        base.setRatePerSecond(1e15); // 0.001 per second for noticeable accrual

        // Create separate BaseIndex for Pool B to ensure isolation
        address[] memory sources = new address[](0);
        BaseIndex baseB = new BaseIndex(
            address(this),
            address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2),
            200_000,
            200_000,
            3600,
            sources
        );
        
        // Pool A uses the original base index
        Currency a0 = Currency.wrap(address(0xAAA0));
        Currency a1 = Currency.wrap(address(0xAAA9));
        (PoolKey memory keyA, PoolId idA, ArthHook hook) = _registerPool(a0, a1, 3000, 60, 2**96, uint64(block.timestamp + 90 days));

        // Pool B uses a separate base index (no rate set, should remain at 0 growth)
        Currency b0 = Currency.wrap(address(0xBBB0));
        Currency b1 = Currency.wrap(address(0xBBB9));
        (PoolId idB,) = factory.createPool(
            b0, b1, 3000, 60, 2**96,
            uint64(block.timestamp + 120 days),
            IBaseIndex(address(baseB)), // Different base index
            IRiskEngine(address(risk)),
            pythAdapter
        );
        PoolKey memory keyB = PoolKey({
            currency0: b0,
            currency1: b1,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(hook))
        });

        vm.startPrank(address(manager), address(this));
        
        // Add liquidity to both pools
        hook.beforeAddLiquidity(router, keyA, ModifyLiquidityParams({tickLower:-60,tickUpper:60,liquidityDelta:int256(5_000_000),salt:bytes32(0)}), abi.encode(alice));
        hook.afterAddLiquidity(router, keyA, ModifyLiquidityParams({tickLower:-60,tickUpper:60,liquidityDelta:int256(5_000_000),salt:bytes32(0)}), BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(alice));
        
        hook.beforeAddLiquidity(router, keyB, ModifyLiquidityParams({tickLower:-60,tickUpper:60,liquidityDelta:int256(3_000_000),salt:bytes32(0)}), abi.encode(bob));
        hook.afterAddLiquidity(router, keyB, ModifyLiquidityParams({tickLower:-60,tickUpper:60,liquidityDelta:int256(3_000_000),salt:bytes32(0)}), BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(bob));

        // Drive funding activity ONLY in pool A with significant time and amounts
        vm.warp(block.timestamp + 10_000); // Significant time passage
        
        // Debug: Check state before first swap
        (,, uint256 lastCumA_before, uint256 growthA_before,,) = hook.poolMeta(idA);
        console.log("Pool A before first swap - lastCumIdx:", lastCumA_before, "growth:", growthA_before);
        (uint256 cum1, uint64 ts1) = base.cumulativeIndex();
        console.log("BaseIndex before first swap - cum:", cum1, "ts:", ts1);
        
        hook.beforeSwap(router, keyA, SwapParams({zeroForOne:true, amountSpecified:50_000, sqrtPriceLimitX96:0}), abi.encode(alice));
        
        // Debug: Check state after first swap
        (,, uint256 lastCumA_mid, uint256 growthA_mid,,) = hook.poolMeta(idA);
        console.log("Pool A after first swap - lastCumIdx:", lastCumA_mid, "growth:", growthA_mid);
        
        vm.warp(block.timestamp + 5_000); // More time
        hook.beforeSwap(router, keyA, SwapParams({zeroForOne:false, amountSpecified:30_000, sqrtPriceLimitX96:0}), abi.encode(alice));
        
        // Important: No swaps in Pool B - it should remain at zero growth
        
        vm.stopPrank();

        // Pool A should have growth from activity, Pool B should remain at zero
        (,, , uint256 growthA, uint128 LA,) = hook.poolMeta(idA);
        (,, , uint256 growthB, uint128 LB,) = hook.poolMeta(idB);
        
        // Assert isolation - A has activity, B doesn't
        assertGt(growthA, growthB, "Pool A should have more growth than Pool B");
        assertEq(growthB, 0, "Pool B should have zero growth");
        assertEq(LA, 5_000_000, "Pool A liquidity correct");
        assertEq(LB, 3_000_000, "Pool B liquidity correct");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Comprehensive Multi-Pool LP & Trader Operations
    // ──────────────────────────────────────────────────────────────────────────

    function test_MultiPool_LPAndTraderOperations() public {
        // Create 3 pools with different token pairs and maturities
        
        // Pool 1: Token A/Token B - 30 day maturity
        Currency tokenA1 = Currency.wrap(address(0x1001));
        Currency tokenB1 = Currency.wrap(address(0x1002));
        (PoolKey memory poolKey1, PoolId poolId1, ArthHook hook) = _registerPool(
            tokenA1, tokenB1, 3000, 60, 2**96, uint64(block.timestamp + 30 days)
        );

        // Pool 2: Token C/Token D - 60 day maturity  
        Currency tokenC2 = Currency.wrap(address(0x2001));
        Currency tokenD2 = Currency.wrap(address(0x2002));
        (PoolKey memory poolKey2, PoolId poolId2,) = _registerPool(
            tokenC2, tokenD2, 500, 10, 2**96, uint64(block.timestamp + 60 days)
        );

        // Pool 3: Token E/Token F - 90 day maturity
        Currency tokenE3 = Currency.wrap(address(0x3001));
        Currency tokenF3 = Currency.wrap(address(0x3002));
        (PoolKey memory poolKey3, PoolId poolId3,) = _registerPool(
            tokenE3, tokenF3, 3000, 60, 2**96, uint64(block.timestamp + 90 days)
        );

        // Verify all pools use the same singleton hook
        assertEq(address(poolKey1.hooks), factory.HOOK(), "Pool 1 hook mismatch");
        assertEq(address(poolKey2.hooks), factory.HOOK(), "Pool 2 hook mismatch");
        assertEq(address(poolKey3.hooks), factory.HOOK(), "Pool 3 hook mismatch");

        // === LP OPERATIONS ===
        vm.startPrank(address(manager), address(this));

        // Alice provides liquidity to Pool 1 (WETH/USDC)
        ModifyLiquidityParams memory aliceLP1 = ModifyLiquidityParams({
            tickLower: -240,  // Wide range
            tickUpper: 240,
            liquidityDelta: int256(1_000_000),
            salt: bytes32(uint256(1))
        });
        
        hook.beforeAddLiquidity(router, poolKey1, aliceLP1, abi.encode(alice));
        hook.afterAddLiquidity(router, poolKey1, aliceLP1, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(alice));

        // Bob provides liquidity to Pool 2 (DAI/USDC) - concentrated position
        ModifyLiquidityParams memory bobLP2 = ModifyLiquidityParams({
            tickLower: -60,   // Narrow range
            tickUpper: 60,
            liquidityDelta: int256(2_500_000),
            salt: bytes32(uint256(2))
        });
        
        hook.beforeAddLiquidity(router, poolKey2, bobLP2, abi.encode(bob));
        hook.afterAddLiquidity(router, poolKey2, bobLP2, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(bob));

        // Alice also provides liquidity to Pool 3 (WBTC/WETH)
        ModifyLiquidityParams memory aliceLP3 = ModifyLiquidityParams({
            tickLower: -120,
            tickUpper: 120,
            liquidityDelta: int256(750_000),
            salt: bytes32(uint256(3))
        });
        
        hook.beforeAddLiquidity(router, poolKey3, aliceLP3, abi.encode(alice));
        hook.afterAddLiquidity(router, poolKey3, aliceLP3, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(alice));

        vm.stopPrank();

        // Verify pool states after LP operations
        (,,,, uint128 totalL1,) = hook.poolMeta(poolId1);
        (,,,, uint128 totalL2,) = hook.poolMeta(poolId2);
        (,,,, uint128 totalL3,) = hook.poolMeta(poolId3);
        
        assertEq(totalL1, 1_000_000, "Pool 1 liquidity");
        assertEq(totalL2, 2_500_000, "Pool 2 liquidity");
        assertEq(totalL3, 750_000, "Pool 3 liquidity");

        // Verify position enumeration
        bytes32[] memory alicePositions = hook.getUserPositionKeys(alice);
        bytes32[] memory bobPositions = hook.getUserPositionKeys(bob);
        
        assertEq(alicePositions.length, 2, "Alice should have 2 positions");
        assertEq(bobPositions.length, 1, "Bob should have 1 position");

        // === TRADER OPERATIONS ===
        vm.startPrank(address(manager), address(this));

        // Advance time to accrue some funding
        vm.warp(block.timestamp + 5000);

        // Trade 1: Alice swaps in Pool 1 (WETH -> USDC)
        SwapParams memory trade1 = SwapParams({
            zeroForOne: true,
            amountSpecified: 1000,
            sqrtPriceLimitX96: 0
        });
        
        (bytes4 sel1, BeforeSwapDelta delta1, uint24 fee1) = hook.beforeSwap(
            router, poolKey1, trade1, abi.encode(alice)
        );
        
        assertEq(sel1, IHooks.beforeSwap.selector, "Trade 1 selector");
        assertEq(BeforeSwapDelta.unwrap(delta1), 0, "Trade 1 delta");

        // Trade 2: Bob swaps in Pool 2 (DAI -> USDC) 
        SwapParams memory trade2 = SwapParams({
            zeroForOne: false,  // Reverse direction
            amountSpecified: 500,
            sqrtPriceLimitX96: 0
        });
        
        (bytes4 sel2, BeforeSwapDelta delta2, uint24 fee2) = hook.beforeSwap(
            router, poolKey2, trade2, abi.encode(bob)
        );
        
        assertEq(sel2, IHooks.beforeSwap.selector, "Trade 2 selector");

        // Trade 3: Alice swaps in Pool 3 (WBTC -> WETH)
        vm.warp(block.timestamp + 3000); // More time passes
        
        SwapParams memory trade3 = SwapParams({
            zeroForOne: true,
            amountSpecified: 100,
            sqrtPriceLimitX96: 0
        });
        
        hook.beforeSwap(router, poolKey3, trade3, abi.encode(alice));

        vm.stopPrank();

        // === VERIFY ISOLATED POOL STATES ===
        
        // Each pool should maintain independent state
        (,,,, uint128 activeL1,) = hook.poolMeta(poolId1);
        (,,,, uint128 activeL2,) = hook.poolMeta(poolId2);
        (,,,, uint128 activeL3,) = hook.poolMeta(poolId3);
        
        // Verify liquidity is still correct after trading
        assertEq(activeL1, 1_000_000, "Pool 1 liquidity after trading");
        assertEq(activeL2, 2_500_000, "Pool 2 liquidity after trading");
        assertEq(activeL3, 750_000, "Pool 3 liquidity after trading");

        // === LP ADJUSTMENTS ===
        vm.startPrank(address(manager), address(this));

        // Alice reduces her position in Pool 1
        ModifyLiquidityParams memory aliceReduce = ModifyLiquidityParams({
            tickLower: -240,
            tickUpper: 240,
            liquidityDelta: -int256(500_000), // Remove half
            salt: bytes32(uint256(1))
        });
        
        hook.beforeRemoveLiquidity(router, poolKey1, aliceReduce, abi.encode(alice));
        hook.afterRemoveLiquidity(router, poolKey1, aliceReduce, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(alice));

        // Bob adds more liquidity to Pool 2 with different range
        ModifyLiquidityParams memory bobAdd = ModifyLiquidityParams({
            tickLower: -180,  // Different range
            tickUpper: 180,
            liquidityDelta: int256(1_000_000),
            salt: bytes32(uint256(4)) // Different salt = new position
        });
        
        hook.beforeAddLiquidity(router, poolKey2, bobAdd, abi.encode(bob));
        hook.afterAddLiquidity(router, poolKey2, bobAdd, BalanceDelta.wrap(0), BalanceDelta.wrap(0), abi.encode(bob));

        vm.stopPrank();

        // === FINAL VERIFICATION ===
        
        // Check final liquidity states
        (,,,, uint128 finalL1,) = hook.poolMeta(poolId1);
        (,,,, uint128 finalL2,) = hook.poolMeta(poolId2);
        (,,,, uint128 finalL3,) = hook.poolMeta(poolId3);
        
        assertEq(finalL1, 500_000, "Pool 1 final liquidity");  // Alice reduced by 500k
        assertEq(finalL2, 3_500_000, "Pool 2 final liquidity"); // Bob added 1M to existing 2.5M
        assertEq(finalL3, 750_000, "Pool 3 final liquidity");   // No changes

        // Check final position counts
        bytes32[] memory finalAlicePositions = hook.getUserPositionKeys(alice);
        bytes32[] memory finalBobPositions = hook.getUserPositionKeys(bob);
        
        assertEq(finalAlicePositions.length, 2, "Alice final positions"); // Still 2 (Pool 1 + Pool 3)
        assertEq(finalBobPositions.length, 2, "Bob final positions");    // Now 2 (2 positions in Pool 2)

        // Verify that positions can be queried individually
        int256 aliceOwed1 = hook.fundingOwedToken1(alice, poolKey1, -240, 240, bytes32(uint256(1)));
        
        // Funding owed should be 0 or positive (depends on rate movement)
        assertTrue(aliceOwed1 >= 0, "Alice Pool 1 funding owed should be non-negative");

        // === TEST MATURITY HANDLING ===
        
        // Check current pool states before maturity
        (,,,, , bool preFrozen1) = hook.poolMeta(poolId1);
        assertFalse(preFrozen1, "Pool 1 should not be frozen before maturity");
        
        // Fast forward past Pool 1's maturity (30 days + 1 day buffer)
        vm.warp(block.timestamp + 31 days);
        
        // Pool 1 should be mature now and operations should revert
        vm.startPrank(address(manager), address(this));
        
        // Attempting to swap on mature pool should revert immediately
        vm.expectRevert(abi.encodeWithSignature("PoolMatured()"));
        hook.beforeSwap(router, poolKey1, trade1, abi.encode(alice));
        
        // Attempting to add liquidity to mature pool should also revert
        vm.expectRevert(abi.encodeWithSignature("PoolMatured()"));
        hook.beforeAddLiquidity(router, poolKey1, aliceLP1, abi.encode(alice));
        
        // But Pool 2 and Pool 3 should still work (they have longer maturities)
        // Test that Pool 2 still accepts operations
        hook.beforeSwap(router, poolKey2, SwapParams({
            zeroForOne: false,
            amountSpecified: 200,
            sqrtPriceLimitX96: 0
        }), abi.encode(bob));
        
        // Test that Pool 3 still accepts operations  
        hook.beforeSwap(router, poolKey3, SwapParams({
            zeroForOne: true,
            amountSpecified: 50,
            sqrtPriceLimitX96: 0
        }), abi.encode(alice));
        
        vm.stopPrank();
        
        // Verify pool maturity timestamps (maturity checking is done dynamically, not persisted)
        (uint64 maturity1,,,,,) = hook.poolMeta(poolId1);
        (uint64 maturity2,,,,,) = hook.poolMeta(poolId2);
        (uint64 maturity3,,,,,) = hook.poolMeta(poolId3);
        
        // Pool 1's maturity (30 days) should be less than current time (31 days)
        assertTrue(maturity1 < block.timestamp, "Pool 1 should be past maturity");
        assertTrue(maturity2 > block.timestamp, "Pool 2 should not be mature yet");
        assertTrue(maturity3 > block.timestamp, "Pool 3 should not be mature yet");
    }
}

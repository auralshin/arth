// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ManagerHarness} from "./mocks/ManagerHarness.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockWETH} from "./mocks/MockWETH.sol";

import {ArthV4Router} from "../src/periphery/ArthV4Router.sol";
import {PythOracleAdapter} from "../src/oracles/PythOracleAdapter.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {SwapParams, ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {
    BalanceDelta,
    toBalanceDelta
} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {IWETH9} from "../src/interfaces/IWETH.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {ArthLiquidityCaps} from "../src/risk/ArthLiquidityCaps.sol";

contract Router_SettlementInvariants is Test {
    using CurrencyLibrary for Currency;

    ManagerHarness manager;
    MockERC20 token0;
    MockERC20 token1;
    MockWETH weth;
    ArthV4Router router;
    ArthLiquidityCaps caps;

    address user = address(0xAAA1);
    address recv = address(0xAABB);

    function setUp() public {
        manager = new ManagerHarness();
        token0 = new MockERC20("T0", "T0");
        token1 = new MockERC20("T1", "T1");
        weth = new MockWETH();

        caps = new ArthLiquidityCaps(address(this));
        PythOracleAdapter pythAdapter = new PythOracleAdapter(address(0), 12 hours);
        router = new ArthV4Router(
            IPoolManager(address(manager)), IWETH9(address(weth)), caps, pythAdapter, address(this)
        );

        PoolKey memory k = _key(address(token0), address(token1));
        caps.setLP(user, true);
        caps.setCap(k.toId(), type(uint128).max);

        token0.mint(user, 1_000_000 ether);
        token1.mint(user, 1_000_000 ether);
        token1.mint(address(manager), 1_000_000 ether);

        vm.startPrank(user);
        IERC20(address(token0)).approve(address(router), type(uint256).max);
        IERC20(address(token1)).approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    function _key(address a0, address a1) internal pure returns (PoolKey memory k) {
        k = PoolKey({
            currency0: Currency.wrap(a0),
            currency1: Currency.wrap(a1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });
    }

    function test_swap_invariants_payCollectMatchDeltas() public {
        PoolKey memory key = _key(address(token0), address(token1));

        manager.setNextSwapDelta(int128(-250 ether), int128(180 ether));

        uint256 m0Before = token0.balanceOf(address(manager));
        uint256 m1Before = token1.balanceOf(address(manager));
        uint256 r1Before = token1.balanceOf(user);

        ArthV4Router.SwapEx memory sx = ArthV4Router.SwapEx({
            key: key,
            params: SwapParams({
                zeroForOne: true,
                amountSpecified: int256(1),
                sqrtPriceLimitX96: uint160(0)
            }),
            hookData: bytes(""),
            maxPay: 250 ether,
            useNative: false
        });

        vm.prank(user);
        router.swap(sx);

        assertEq(
            token0.balanceOf(address(manager)) - m0Before, 250 ether, "manager must get T0 pay"
        );

        assertEq(token1.balanceOf(user) - r1Before, 180 ether, "trader must get T1 collect");

        assertEq(
            int256(token1.balanceOf(address(manager))) - int256(m1Before),
            -int256(180 ether),
            "manager T1 out"
        );

        assertEq(manager.settlesLength(), 1, "one settle");
        assertEq(manager.takesLength(), 1, "one take");

        (,, uint256 amt0Settled,) = manager.settlesAt(0);
        (,, uint256 amt1Taken,) = manager.takesAt(0);
        assertEq(amt0Settled, 250 ether);
        assertEq(amt1Taken, 180 ether);
    }

    function test_addLiquidity_invariants() public {
        PoolKey memory key = _key(address(token0), address(token1));

        BalanceDelta d0 = toBalanceDelta(int128(-100 ether), 0);
        BalanceDelta d1 = toBalanceDelta(0, int128(-90 ether));
        manager.setNextModifyLiquidity(d0, d1);

        uint256 m0Before = token0.balanceOf(address(manager));
        uint256 m1Before = token1.balanceOf(address(manager));

        ArthV4Router.AddLiq memory al = ArthV4Router.AddLiq({
            key: key,
            params: ModifyLiquidityParams({
                tickLower: int24(-60),
                tickUpper: int24(60),
                liquidityDelta: int256(100),
                salt: bytes32(0)
            }),
            hookData: bytes(""),
            amount0: 100 ether,
            amount1: 90 ether,
            useNative0: false,
            useNative1: false
        });

        vm.prank(user);
        router.addLiquidity(al);

        assertEq(token0.balanceOf(address(manager)) - m0Before, 100 ether, "manager +T0");
        assertEq(token1.balanceOf(address(manager)) - m1Before, 90 ether, "manager +T1");
        assertEq(manager.settlesLength(), 2, "two settles");
        assertEq(manager.takesLength(), 0, "no takes");
    }

    function test_removeLiquidity_invariants() public {
        PoolKey memory key = _key(address(token0), address(token1));

        BalanceDelta d0 = toBalanceDelta(int128(55 ether), 0);
        BalanceDelta d1 = toBalanceDelta(0, int128(77 ether));
        manager.setNextModifyLiquidity(d0, d1);

        token0.mint(address(manager), 100 ether);
        token1.mint(address(manager), 100 ether);

        uint256 r0Before = token0.balanceOf(recv);
        uint256 r1Before = token1.balanceOf(recv);

        ArthV4Router.RemoveLiq memory rl = ArthV4Router.RemoveLiq({
            key: key,
            params: ModifyLiquidityParams({
                tickLower: int24(-60),
                tickUpper: int24(60),
                liquidityDelta: int256(-100),
                salt: bytes32(0)
            }),
            hookData: bytes(""),
            to: recv
        });

        vm.prank(user);
        router.removeLiquidity(rl);

        assertEq(token0.balanceOf(recv) - r0Before, 55 ether, "recv +T0");
        assertEq(token1.balanceOf(recv) - r1Before, 77 ether, "recv +T1");
        assertEq(manager.takesLength(), 2, "two takes");
    }
}

interface ManagerHarnessExt {
    function settles(uint256) external view returns (address, address, uint256, bool);
    function takes(uint256) external view returns (address, address, uint256, bool);
    function settlesLength() external view returns (uint256);
    function takesLength() external view returns (uint256);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {ManagerHarness} from "./mocks/ManagerHarness.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockWETH} from "./mocks/MockWETH.sol";
import {ArthV4Router} from "../src/periphery/ArthV4Router.sol";
import {PythOracleAdapter} from "../src/oracles/PythOracleAdapter.sol";

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {
    BalanceDelta,
    toBalanceDelta
} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {ArthLiquidityCaps} from "../src/risk/ArthLiquidityCaps.sol";
import {IWETH9} from "../src/interfaces/IWETH.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";

interface ArthV4RouterUnwrapLike {
    function removeLiquidityWithUnwrap(
        PoolKey memory key,
        bytes memory params,
        address recipient,
        bool unwrapWeth0,
        bool unwrapWeth1
    ) external returns (BalanceDelta, BalanceDelta);
}

contract Router_WETH_Unwrap is Test {
    using CurrencyLibrary for Currency;

    ManagerHarness manager;
    MockERC20 token1;
    MockWETH weth;
    ArthV4Router router;

    address user = address(0xAAA1);

    function setUp() public {
        manager = new ManagerHarness();
        token1 = new MockERC20("T1", "T1");
        weth = new MockWETH();

        ArthLiquidityCaps caps = new ArthLiquidityCaps(address(this));
        PythOracleAdapter pythAdapter = new PythOracleAdapter(address(0), 12 hours);
        router = new ArthV4Router(
            IPoolManager(address(manager)), IWETH9(address(weth)), caps, pythAdapter, address(this)
        );

        weth.deposit{value: 5 ether}();
        bool transferSuccess = weth.transfer(address(manager), 5 ether);
        assert(transferSuccess);

        token1.mint(address(manager), 5 ether);

        vm.deal(address(this), 100 ether); 
    }

    function _key() internal view returns (PoolKey memory k) {
        k = PoolKey({
            currency0: Currency.wrap(address(weth)), 
            currency1: Currency.wrap(address(token1)),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });
    }

    function test_removeLiquidity_collectWethAsEth() public {
        PoolKey memory key = _key();

        BalanceDelta d0 = toBalanceDelta(int128(1 ether), 0);
        BalanceDelta d1 = toBalanceDelta(0, int128(0.5 ether));
        manager.setNextModifyLiquidity(d0, d1);

        uint256 ethBefore = user.balance;
        uint256 t1Before = token1.balanceOf(user);

        ArthV4Router.RemoveLiq memory rl = ArthV4Router.RemoveLiq({
            key: key,
            params: ModifyLiquidityParams({
                tickLower: int24(-60),
                tickUpper: int24(60),
                liquidityDelta: int256(-100),
                salt: bytes32(0)
            }),
            hookData: bytes(""),
            to: user
        });

        vm.prank(user);
        router.removeLiquidity(rl);

        vm.prank(user);
        weth.withdraw(1 ether);

        assertEq(user.balance - ethBefore, 1 ether, "received 1 ETH (unwrapped)");
        assertEq(token1.balanceOf(user) - t1Before, 0.5 ether, "received 0.5 T1 as ERC20");
    }
}

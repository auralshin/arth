// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams, ModifyLiquidityParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {
    BalanceDelta,
    toBalanceDelta
} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ManagerHarness is IPoolManager {
    BalanceDelta internal _nextSwapDelta;
    BalanceDelta internal _nextModD0;
    BalanceDelta internal _nextModD1;

    struct Settled {
        address who;
        address token;
        uint256 amount;
        bool isNative;
    }

    struct Taken {
        address to;
        address token;
        uint256 amount;
        bool isNative;
    }

    Settled[] public settles;
    Taken[] public takes;
    address public lastSyncToken;
    uint256 public lastSyncNative; 
    mapping(address => uint256) internal _lastBalance;

    function setNextSwapDelta(int128 a0, int128 a1) external {
        _nextSwapDelta = toBalanceDelta(a0, a1);
    }

    function setNextModifyLiquidity(BalanceDelta d0, BalanceDelta d1) external {
        _nextModD0 = d0;
        _nextModD1 = d1;
    }

    function settlesLength() external view returns (uint256) {
        return settles.length;
    }

    function takesLength() external view returns (uint256) {
        return takes.length;
    }

    function settlesAt(uint256 i)
        external
        view
        returns (address who, address token, uint256 amount, bool isNative)
    {
        Settled memory s = settles[i];
        return (s.who, s.token, s.amount, s.isNative);
    }

    function takesAt(uint256 i)
        external
        view
        returns (address to, address token, uint256 amount, bool isNative)
    {
        Taken memory t = takes[i];
        return (t.to, t.token, t.amount, t.isNative);
    }


    function swap(PoolKey memory, SwapParams memory, bytes calldata)
        external
        view
        override
        returns (BalanceDelta)
    {
        return _nextSwapDelta;
    }

    function modifyLiquidity(PoolKey memory, ModifyLiquidityParams memory, bytes calldata)
        external
        view
        override
        returns (BalanceDelta, BalanceDelta)
    {
        return (_nextModD0, _nextModD1);
    }

    function initialize(PoolKey memory, uint160) external pure override returns (int24) {
        return 0;
    }

    function unlock(bytes calldata data) external override returns (bytes memory) {
        (bool ok, bytes memory out) =
            msg.sender.call(abi.encodeWithSelector(IUnlockCallback.unlockCallback.selector, data));
        require(ok, "unlockCallback failed");
        return out;
    }

    function donate(PoolKey memory, uint256, uint256, bytes calldata)
        external
        pure
        override
        returns (BalanceDelta)
    {
        return BalanceDelta.wrap(0);
    }


    function sync(Currency currency) external {
        address t = Currency.unwrap(currency);
        lastSyncToken = t;
        lastSyncNative = 0;
        if (t != address(0)) {
            _lastBalance[t] = IERC20(t).balanceOf(address(this));
        }
    }

    function settle(Currency currency) external payable {
        address t = Currency.unwrap(currency);
        bool isNative = (t == address(0));
        uint256 amt;
        if (isNative) {
            amt = msg.value;
        } else {
            uint256 nowBal = IERC20(t).balanceOf(address(this));
            uint256 prev = _lastBalance[t];
            amt = nowBal >= prev ? nowBal - prev : 0;
            _lastBalance[t] = nowBal;
        }
        settles.push(Settled({who: msg.sender, token: t, amount: amt, isNative: isNative}));
    }

    function take(Currency currency, address to, uint256 amount) external {
        address t = Currency.unwrap(currency);
        bool isNative = (t == address(0));
        if (isNative) {
            (bool ok,) = payable(to).call{value: amount}("");
            require(ok, "native take fail");
        } else {
            require(IERC20(t).transfer(to, amount), "erc20 take fail");
        }
        takes.push(Taken({to: to, token: t, amount: amount, isNative: isNative}));
    }

    receive() external payable {}

    function updateDynamicLPFee(PoolKey memory, uint24) external override {}

    function clear(Currency, uint256) external override {}

    function mint(address, uint256, uint256) external override {}

    function burn(address, uint256, uint256) external override {}

    function balanceOf(address, uint256) external pure override returns (uint256) {
        return 0;
    }

    function allowance(address, address, uint256) external pure override returns (uint256) {
        return 0;
    }

    function approve(address, uint256, uint256) external pure override returns (bool) {
        return true;
    }

    function transfer(address, uint256, uint256) external pure override returns (bool) {
        return true;
    }

    function transferFrom(address, address, uint256, uint256)
        external
        pure
        override
        returns (bool)
    {
        return true;
    }

    function isOperator(address, address) external pure override returns (bool) {
        return false;
    }

    function setOperator(address, bool) external pure override returns (bool) {
        return true;
    }

    function protocolFeesAccrued(Currency) external pure override returns (uint256) {
        return 0;
    }

    function collectProtocolFees(address, Currency, uint256)
        external
        pure
        override
        returns (uint256)
    {
        return 0;
    }

    function take(Currency, address, uint256, bytes calldata) external {}

    function settle(Currency, uint256, bytes calldata) external payable {}

    function setProtocolFee(Currency, uint24) external {}

    function setProtocolFeeController(address) external override {}

    function protocolFeeController() external pure override returns (address) {
        return address(0);
    }

    function setProtocolFee(PoolKey memory, uint24) external override {}

    function extsload(bytes32) external pure override returns (bytes32) {
        return bytes32(0);
    }

    function extsload(bytes32, uint256) external pure override returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    function extsload(bytes32[] calldata) external pure override returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    function exttload(bytes32) external pure override returns (bytes32) {
        return bytes32(0);
    }

    function exttload(bytes32[] calldata) external pure override returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    function settle() external payable returns (uint256) {
        address t = lastSyncToken;
        bool isNative = (t == address(0));
        uint256 amt;
        if (isNative) {
            amt = msg.value;
        } else {
            uint256 nowBal = IERC20(t).balanceOf(address(this));
            uint256 prev = _lastBalance[t];
            amt = nowBal >= prev ? nowBal - prev : 0;
            _lastBalance[t] = nowBal;
        }
        settles.push(Settled({who: msg.sender, token: t, amount: amt, isNative: isNative}));
        return amt;
    }

    function settleFor(address) external payable returns (uint256) {
        return msg.value;
    }
}

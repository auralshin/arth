// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

import {IRiskEngine} from "../interfaces/IRiskEngine.sol";
import {IBaseIndex} from "../interfaces/IBaseIndex.sol";
import {PythOracleAdapter} from "../oracles/PythOracleAdapter.sol";
import {Errors} from "../libraries/Errors.sol";

contract ArthHook is IHooks {
    event FundingAccrued(PoolId indexed id, int256 growthX128Delta, uint32 dt);

    event FundingOwedCleared(
        address indexed owner,
        PoolId indexed id,
        int24 lower,
        int24 upper,
        int256 amount
    );

    address public ROUTER;

    function setRouter(address r) external onlyFactory {
        ROUTER = r;
    }

    using PoolIdLibrary for PoolKey;

    IPoolManager public immutable MANAGER;

    IBaseIndex public immutable BASE_INDEX;

    IRiskEngine public immutable RISK;

    address public immutable FACTORY;

    PythOracleAdapter public immutable PYTH_ADAPTER;

    uint256 internal constant FP = 1 << 128;

    struct PoolMeta {
        uint64 maturity;
        uint64 lastTs;
        uint256 lastCumIdx;
        uint256 fundingGrowthGlobalX128;
        uint128 totalLiquidity;
        bool frozen;
    }

    struct Position {
        uint128 liquidity;
        uint256 fundingGrowthSnapshotX128;
        int256 fundingOwedToken1;
    }

    mapping(PoolId => PoolMeta) public poolMeta;

    mapping(bytes32 => Position) public positions;

    function fundingOwedToken1(
        address owner,
        PoolKey calldata key,
        int24 lower,
        int24 upper,
        bytes32 salt
    ) external view returns (int256) {
        bytes32 pkey = _positionKey(owner, key.toId(), lower, upper, salt);
        return positions[pkey].fundingOwedToken1;
    }

    function clearFundingOwedToken1(
        address owner,
        PoolKey calldata key,
        int24 lower,
        int24 upper,
        bytes32 salt
    ) external returns (int256 amt) {
        if (msg.sender != ROUTER) revert Errors.NotRouter();
        bytes32 pkey = _positionKey(owner, key.toId(), lower, upper, salt);
        amt = positions[pkey].fundingOwedToken1;
        positions[pkey].fundingOwedToken1 = 0;
        emit FundingOwedCleared(owner, key.toId(), lower, upper, amt);
    }

    constructor(
        IPoolManager _manager,
        IBaseIndex _base,
        IRiskEngine _risk,
        address _factory,
        PythOracleAdapter _pythAdapter
    ) {
        MANAGER = _manager;
        BASE_INDEX = _base;
        RISK = _risk;
        FACTORY = _factory;
        PYTH_ADAPTER = _pythAdapter;
    }

    function getHookPermissions()
        external
        pure
        returns (Hooks.Permissions memory p)
    {
        p.afterInitialize = true;
        p.beforeSwap = true;
        p.beforeAddLiquidity = true;
        p.afterAddLiquidity = true;
        p.beforeRemoveLiquidity = true;
        p.afterRemoveLiquidity = true;
        return p;
    }

    modifier onlyFactory() {
        _onlyFactory();
        _;
    }

    function _onlyFactory() internal view {
        if (msg.sender != FACTORY) revert Errors.NotFactory();
    }

    function setMaturity(PoolId id, uint64 maturityTs) external onlyFactory {
        (uint256 cum, uint64 ts) = BASE_INDEX.cumulativeIndex();
        PoolMeta storage pm = poolMeta[id];
        pm.maturity = maturityTs;
        pm.lastCumIdx = cum;
        pm.lastTs = ts;
        if (
            maturityTs == 0 ||
            (maturityTs != 0 && block.timestamp >= maturityTs)
        ) {
            pm.frozen = true;
        }
    }

    function _positionKey(
        address owner,
        PoolId id,
        int24 tickLower,
        int24 tickUpper,
        bytes32 salt
    ) internal pure returns (bytes32) {
        bytes32 idv = PoolId.unwrap(id);
        uint256 tl = uint256(int256(tickLower));
        uint256 tu = uint256(int256(tickUpper));
        bytes32 pkey;
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(ptr, owner)
            mstore(add(ptr, 0x20), idv)
            mstore(add(ptr, 0x40), tl)
            mstore(add(ptr, 0x60), tu)
            mstore(add(ptr, 0x80), salt)
            pkey := keccak256(ptr, 0xa0)
            mstore(0x40, add(ptr, 0xa0))
        }
        return pkey;
    }

    function _accrue(PoolId id) internal {
        PoolMeta storage pm = poolMeta[id];
        (uint256 cum, uint64 ts) = BASE_INDEX.cumulativeIndex();
        if (ts == pm.lastTs) return;

        if (pm.totalLiquidity > 0) {
            uint256 idxDelta = cum - pm.lastCumIdx;
            int256 growthDelta = int256((idxDelta * FP) / pm.totalLiquidity);
            if (growthDelta >= 0) {
                pm.fundingGrowthGlobalX128 += uint256(growthDelta);
            } else {
                pm.fundingGrowthGlobalX128 -= uint256(-growthDelta);
            }
            emit FundingAccrued(id, growthDelta, uint32(ts - pm.lastTs));
        }

        pm.lastCumIdx = cum;
        pm.lastTs = ts;

        if (!pm.frozen && pm.maturity != 0 && block.timestamp >= pm.maturity) {
            pm.frozen = true;
        }
    }

    function _updatePositionOwed(
        address owner,
        PoolId id,
        int24 tickLower,
        int24 tickUpper,
        bytes32 salt
    ) internal {
        PoolMeta storage pm = poolMeta[id];
        bytes32 key = _positionKey(owner, id, tickLower, tickUpper, salt);
        Position storage p = positions[key];

        if (p.liquidity == 0) {
            p.fundingGrowthSnapshotX128 = pm.fundingGrowthGlobalX128;
            return;
        }

        uint256 growthDelta = pm.fundingGrowthGlobalX128 -
            p.fundingGrowthSnapshotX128;
        if (growthDelta != 0) {
            int256 delta = int256((growthDelta * p.liquidity) / FP);
            p.fundingOwedToken1 += delta;
            p.fundingGrowthSnapshotX128 = pm.fundingGrowthGlobalX128;

            RISK.onFundingAccrued(owner, -delta);
        }
    }

    function _applyLiquidityDelta(
        address owner,
        PoolId id,
        int24 tickLower,
        int24 tickUpper,
        bytes32 salt,
        int256 liquidityDelta
    ) internal {
        PoolMeta storage pm = poolMeta[id];
        bytes32 key = _positionKey(owner, id, tickLower, tickUpper, salt);
        Position storage p = positions[key];

        if (liquidityDelta > 0) {
            uint128 add = uint128(uint256(liquidityDelta));
            p.liquidity += add;
            pm.totalLiquidity += add;
        } else if (liquidityDelta < 0) {
            uint128 sub = uint128(uint256(-liquidityDelta));
            if (p.liquidity < sub) revert Errors.LiquidityUnderflow();
            p.liquidity -= sub;
            if (pm.totalLiquidity < sub) revert Errors.PoolLiquidityUnderflow();
            pm.totalLiquidity -= sub;
        }
        p.fundingGrowthSnapshotX128 = pm.fundingGrowthGlobalX128;
    }

    function _collectFundingAccounting(
        address owner,
        PoolKey calldata key,
        int24 tickLower,
        int24 tickUpper,
        bytes32 salt
    ) internal returns (int256 amount) {
        PoolId id = key.toId();
        _accrue(id);
        _updatePositionOwed(owner, id, tickLower, tickUpper, salt);

        bytes32 pkey = _positionKey(owner, id, tickLower, tickUpper, salt);
        Position storage p = positions[pkey];
        amount = p.fundingOwedToken1;
        p.fundingOwedToken1 = 0;
    }

    function beforeInitialize(
        address,
        PoolKey calldata,
        uint160
    ) external pure override returns (bytes4) {
        return IHooks.beforeInitialize.selector;
    }

    function afterInitialize(
        address,
        PoolKey calldata key,
        uint160,
        int24
    ) external view override returns (bytes4) {
        if (msg.sender != address(MANAGER)) revert Errors.NotManager();

        address underlying = BASE_INDEX.underlying();
        address currency0 = Currency.unwrap(key.currency0);
        address currency1 = Currency.unwrap(key.currency1);

        if (currency0 != underlying && currency1 != underlying) {
            revert Errors.UnderlyingMismatch();
        }

        return IHooks.afterInitialize.selector;
    }

    function beforeAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external override returns (bytes4) {
        if (msg.sender != address(MANAGER)) revert Errors.NotManager();
        if (sender != ROUTER) revert Errors.UseRouter();
        address trader = abi.decode(hookData, (address));

        PoolId id = key.toId();
        _accrue(id);
        if (poolMeta[id].frozen) revert Errors.PoolMatured();
        _updatePositionOwed(
            trader,
            id,
            params.tickLower,
            params.tickUpper,
            params.salt
        );

        RISK.requireIM(trader, block.timestamp);

        return IHooks.beforeAddLiquidity.selector;
    }

    function afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta,
        BalanceDelta,
        bytes calldata hookData
    ) external override returns (bytes4, BalanceDelta) {
        if (msg.sender != address(MANAGER)) revert Errors.NotManager();
        if (sender != ROUTER) revert Errors.UseRouter();
        address trader = abi.decode(hookData, (address));

        PoolId id = key.toId();
        _applyLiquidityDelta(
            trader,
            id,
            params.tickLower,
            params.tickUpper,
            params.salt,
            params.liquidityDelta
        );
        return (
            IHooks.afterAddLiquidity.selector,
            BalanceDeltaLibrary.ZERO_DELTA
        );
    }

    function beforeRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external override returns (bytes4) {
        if (msg.sender != address(MANAGER)) revert Errors.NotManager();
        if (sender != ROUTER) revert Errors.UseRouter();
        address trader = abi.decode(hookData, (address));

        PoolId id = key.toId();
        _accrue(id);
        _updatePositionOwed(
            trader,
            id,
            params.tickLower,
            params.tickUpper,
            params.salt
        );
        return IHooks.beforeRemoveLiquidity.selector;
    }

    function afterRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta,
        BalanceDelta,
        bytes calldata hookData
    ) external override returns (bytes4, BalanceDelta) {
        if (msg.sender != address(MANAGER)) revert Errors.NotManager();
        if (sender != ROUTER) revert Errors.UseRouter();
        address trader = abi.decode(hookData, (address));

        PoolId id = key.toId();
        _applyLiquidityDelta(
            trader,
            id,
            params.tickLower,
            params.tickUpper,
            params.salt,
            params.liquidityDelta
        );
        return (
            IHooks.afterRemoveLiquidity.selector,
            BalanceDeltaLibrary.ZERO_DELTA
        );
    }

    function beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata,
        bytes calldata hookData
    ) external override returns (bytes4, BeforeSwapDelta, uint24) {
        if (msg.sender != address(MANAGER)) revert Errors.NotManager();
        if (sender != ROUTER) revert Errors.UseRouter();
        address trader = abi.decode(hookData, (address));

        PoolId id = key.toId();
        _accrue(id);
        if (poolMeta[id].frozen) revert Errors.PoolMatured();

        RISK.requireIM(trader, block.timestamp);

        return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function afterSwap(
        address,
        PoolKey calldata,
        SwapParams calldata,
        BalanceDelta,
        bytes calldata
    ) external pure override returns (bytes4, int128) {
        return (IHooks.afterSwap.selector, int128(0));
    }

    function beforeDonate(
        address,
        PoolKey calldata,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IHooks.beforeDonate.selector;
    }

    function afterDonate(
        address,
        PoolKey calldata,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IHooks.afterDonate.selector;
    }
}

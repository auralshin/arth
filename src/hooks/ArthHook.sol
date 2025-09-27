// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "uniswap-hooks/base/BaseHook.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";

import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

import {IRiskEngine} from "../interfaces/IRiskEngine.sol";
import {IBaseIndex} from "../interfaces/IBaseIndex.sol";
import {PythOracleAdapter} from "../oracles/PythOracleAdapter.sol";
import {Errors} from "../libraries/Errors.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Single hook reused by many pools; per-pool config stored in mappings.
contract ArthHook is BaseHook, ReentrancyGuard {
    using PoolIdLibrary for PoolKey;

    // ── Events ───────────────────────────────────────────────────────────────────
    event FundingAccrued(PoolId indexed id, int256 growthX128Delta, uint32 dt);
    event FundingOwedCleared(
        address indexed owner,
        PoolId indexed id,
        int24 lower,
        int24 upper,
        int256 amount
    );

    event PositionUpdated(
        address indexed owner,
        PoolId indexed poolId,
        int24 indexed tickLower,
        int24 tickUpper,
        bytes32 salt,
        bytes32 positionKey,
        uint128 liquidityBefore,
        uint128 liquidityAfter,
        int256 liquidityDelta
    );

    event PositionCreated(
        address indexed owner,
        PoolId indexed poolId,
        int24 indexed tickLower,
        int24 tickUpper,
        bytes32 salt,
        bytes32 positionKey,
        uint128 initialLiquidity
    );

    event PositionClosed(
        address indexed owner,
        PoolId indexed poolId,
        int24 indexed tickLower,
        int24 tickUpper,
        bytes32 salt,
        bytes32 positionKey,
        uint128 finalLiquidity
    );

    // ── Config / deps ────────────────────────────────────────────────────────────
    address public ROUTER; // set by factory
    address public immutable FACTORY; // factory that registers pools

    uint256 internal constant FP = 1 << 128; // global growth fixed-point

    // ── Storage ──────────────────────────────────────────────────────────────────
    struct PoolMeta {
        uint64 maturity;
        uint64 lastTs;
        uint256 lastCumIdx;
        uint256 fundingGrowthGlobalX128; // growth per unit L
        uint128 totalLiquidity;
        bool frozen;
    }

    struct PoolConfig {
        IBaseIndex base;
        IRiskEngine risk;
        PythOracleAdapter pyth;
    }

    struct Position {
        uint128 liquidity;
        uint256 fundingGrowthSnapshotX128;
        int256 fundingOwedToken1;
    }

    // For tools: store a non-reversible key → locator to expose full details
    struct Locator {
        PoolId poolId;
        int24 tickLower;
        int24 tickUpper;
        bytes32 salt;
        address owner;
    }

    mapping(PoolId => PoolMeta) public poolMeta;
    mapping(PoolId => PoolConfig) public poolConfig; // NEW: per-pool modules
    mapping(bytes32 => Position) public positions;
    mapping(bytes32 => Locator) public positionLocator; // NEW

    // Per-user enumeration
    mapping(address => bytes32[]) public userPositionKeys;
    mapping(bytes32 => uint256) public positionKeyIndex;
    mapping(address => uint256) public userPositionCount;

    // ── Constructor & admin ──────────────────────────────────────────────────────
    constructor(IPoolManager _poolManager, address _factory) BaseHook(_poolManager) {
        FACTORY = _factory;
    }

    modifier onlyFactory() {
        _onlyFactory();
        _;
    }

    function _onlyFactory() internal view {
        if (msg.sender != FACTORY) revert Errors.NotFactory();
    }

    function setRouter(address r) external nonReentrant onlyFactory {
        ROUTER = r;
    }

    /// @notice Factory wires per-pool modules + seeds meta
    function registerPool(
        PoolKey calldata key,
        IBaseIndex base,
        IRiskEngine risk,
        PythOracleAdapter pyth,
        uint64 maturityTs
    ) external nonReentrant onlyFactory {
        PoolId id = key.toId();
        require(address(poolConfig[id].base) == address(0), "PoolAlreadyRegistered");
        poolConfig[id] = PoolConfig({base: base, risk: risk, pyth: pyth});
        (uint256 cum, uint64 ts) = base.cumulativeIndex();
        PoolMeta storage pm = poolMeta[id];
        pm.maturity = maturityTs;
        pm.lastCumIdx = cum;
        pm.lastTs = ts;
        if (maturityTs == 0 || (maturityTs != 0 && block.timestamp >= maturityTs)) pm.frozen = true;
    }

    function setMaturity(PoolId id, uint64 maturityTs) external nonReentrant onlyFactory {
        IBaseIndex base = poolConfig[id].base;
        require(address(base) != address(0), "PoolNotRegistered");
        (uint256 cum, uint64 ts) = base.cumulativeIndex();
        PoolMeta storage pm = poolMeta[id];
        pm.maturity = maturityTs;
        pm.lastCumIdx = cum;
        pm.lastTs = ts;
        if (maturityTs == 0 || (maturityTs != 0 && block.timestamp >= maturityTs)) pm.frozen = true;
    }

    // ── Permissions (matches your current flags) ─────────────────────────────────
    function getHookPermissions() public pure override returns (Hooks.Permissions memory p) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: true,
            beforeAddLiquidity: true,
            beforeRemoveLiquidity: true,
            afterAddLiquidity: true,
            afterRemoveLiquidity: true,
            beforeSwap: true,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            // return-delta flags
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ── Views ────────────────────────────────────────────────────────────────────
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

    function getUserPositionKeys(
        address user
    ) external view returns (bytes32[] memory) {
        return userPositionKeys[user];
    }

    function getUserPositionAt(
        address user,
        uint256 index
    ) external view returns (bytes32) {
        require(index < userPositionKeys[user].length, "Index out of bounds");
        return userPositionKeys[user][index];
    }

    function getUserPositionDetails(
        address user,
        uint256 index
    )
        external
        view
        returns (
            bytes32 key,
            uint128 liquidity,
            uint256 fundingGrowthSnapshot,
            int256 fundingOwed
        )
    {
        require(index < userPositionKeys[user].length, "Index out of bounds");
        key = userPositionKeys[user][index];
        Position storage pos = positions[key];
        return (
            key,
            pos.liquidity,
            pos.fundingGrowthSnapshotX128,
            pos.fundingOwedToken1
        );
    }

    // NEW: expose locator by key so tools can show ticks/pool/salt/owner
    function getPositionLocator(
        bytes32 key
    )
        external
        view
        returns (
            PoolId id,
            int24 lower,
            int24 upper,
            bytes32 salt,
            address owner
        )
    {
        Locator storage L = positionLocator[key];
        return (L.poolId, L.tickLower, L.tickUpper, L.salt, L.owner);
    }

    // ── External (router) ────────────────────────────────────────────────────────
    function clearFundingOwedToken1(
        address owner,
        PoolKey calldata key,
        int24 lower,
        int24 upper,
        bytes32 salt
    ) external nonReentrant returns (int256 amt) {
        if (msg.sender != ROUTER) revert Errors.NotRouter();
        bytes32 pkey = _positionKey(owner, key.toId(), lower, upper, salt);
        amt = positions[pkey].fundingOwedToken1;
        positions[pkey].fundingOwedToken1 = 0;
        emit FundingOwedCleared(owner, key.toId(), lower, upper, amt);
    }

    // ── BaseHook internal overrides ──────────────────────────────────────────────
    function _afterInitialize(
        address,
        PoolKey calldata,
        uint160,
        int24
    ) internal pure override returns (bytes4) {
        return IHooks.afterInitialize.selector;
    }

    function _beforeAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) internal override nonReentrant returns (bytes4) {
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
        poolConfig[id].risk.requireIM(trader, block.timestamp);

        return IHooks.beforeAddLiquidity.selector;
    }

    function _afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta /*delta0*/,
        BalanceDelta /*delta1*/,
        bytes calldata hookData
    ) internal override nonReentrant returns (bytes4, BalanceDelta) {
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

    function _beforeRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) internal override nonReentrant returns (bytes4) {
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

    function _afterRemoveLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta /*delta0*/,
        BalanceDelta /*delta1*/,
        bytes calldata hookData
    ) internal override nonReentrant returns (bytes4, BalanceDelta) {
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

    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata /*params*/,
        bytes calldata hookData
    ) internal override nonReentrant returns (bytes4, BeforeSwapDelta, uint24) {
        if (sender != ROUTER) revert Errors.UseRouter();

        address trader = abi.decode(hookData, (address));
        PoolId id = key.toId();

        _accrue(id);
        if (poolMeta[id].frozen) revert Errors.PoolMatured();
        poolConfig[id].risk.requireIM(trader, block.timestamp);

        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _afterSwap(address, PoolKey calldata, SwapParams calldata, BalanceDelta, bytes calldata)
        internal
        override
        returns (bytes4, int128)
    { return (IHooks.afterSwap.selector, int128(0)); }

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

    function _removePositionKey(address owner, bytes32 key) internal {
        uint256 index = positionKeyIndex[key];
        uint256 lastIndex = userPositionKeys[owner].length - 1;
        if (index != lastIndex) {
            bytes32 lastKey = userPositionKeys[owner][lastIndex];
            userPositionKeys[owner][index] = lastKey;
            positionKeyIndex[lastKey] = index;
        }
        userPositionKeys[owner].pop();
        delete positionKeyIndex[key];
        userPositionCount[owner]--;
        delete positionLocator[key]; // keep locator map tight
    }

    function _accrue(PoolId id) internal {
        PoolMeta storage pm = poolMeta[id];
        IBaseIndex base = poolConfig[id].base;
        if (address(base) == address(0)) return; // not registered yet
        (uint256 cumNow, uint64 tsNow) = base.cumulativeIndex();

        uint64 tsCap = pm.maturity != 0 && tsNow > pm.maturity
            ? pm.maturity
            : tsNow;
        if (tsCap == pm.lastTs) {
            if (
                !pm.frozen && pm.maturity != 0 && block.timestamp >= pm.maturity
            ) pm.frozen = true;
            return;
        }

        if (pm.totalLiquidity > 0) {
            // When a pool is past maturity, clamp cumulative to maturity time
            uint256 cumCap = tsCap == tsNow
                ? cumNow
                : cumNow - (base.ratePerSecond() * (tsNow - tsCap));
            uint256 idxDelta = cumCap - pm.lastCumIdx;
            // growth per unit L, X128
            int256 growthDelta = int256((idxDelta * FP) / pm.totalLiquidity);
            if (growthDelta >= 0)
                pm.fundingGrowthGlobalX128 += uint256(growthDelta);
            else pm.fundingGrowthGlobalX128 -= uint256(-growthDelta);
            pm.lastCumIdx = cumCap;
        }

        pm.lastTs = tsCap;
        if (!pm.frozen && pm.maturity != 0 && block.timestamp >= pm.maturity)
            pm.frozen = true;
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
            poolConfig[id].risk.onFundingAccrued(owner, -delta);
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

        uint128 beforeL = p.liquidity;
        bool isNew = beforeL == 0 && liquidityDelta > 0;

        if (liquidityDelta > 0) {
            uint256 add256 = uint256(liquidityDelta);
            if (add256 > type(uint128).max)
                revert Errors.LiquidityDeltaTooLarge();
            uint128 add = uint128(add256);
            p.liquidity = beforeL + add;
            pm.totalLiquidity += add;
        } else if (liquidityDelta < 0) {
            uint256 sub256 = uint256(-liquidityDelta);
            if (sub256 > type(uint128).max)
                revert Errors.LiquidityDeltaTooLarge();
            uint128 sub = uint128(sub256);
            if (beforeL < sub) revert Errors.LiquidityUnderflow();
            p.liquidity = beforeL - sub;
            if (pm.totalLiquidity < sub) revert Errors.PoolLiquidityUnderflow();
            pm.totalLiquidity -= sub;
        }

        p.fundingGrowthSnapshotX128 = pm.fundingGrowthGlobalX128;
        uint128 afterL = p.liquidity;

        if (isNew) {
            userPositionKeys[owner].push(key);
            positionKeyIndex[key] = userPositionKeys[owner].length - 1;
            userPositionCount[owner]++;
            positionLocator[key] = Locator({
                poolId: id,
                tickLower: tickLower,
                tickUpper: tickUpper,
                salt: salt,
                owner: owner
            });
            emit PositionCreated(
                owner,
                id,
                tickLower,
                tickUpper,
                salt,
                key,
                afterL
            );
        } else if (afterL == 0 && beforeL > 0) {
            _removePositionKey(owner, key);
            emit PositionClosed(
                owner,
                id,
                tickLower,
                tickUpper,
                salt,
                key,
                beforeL
            );
        }

        emit PositionUpdated(
            owner,
            id,
            tickLower,
            tickUpper,
            salt,
            key,
            beforeL,
            afterL,
            liquidityDelta
        );
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
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IPriceAdapter} from "../interfaces/IPriceAdapter.sol";
import {Errors} from "../libraries/Errors.sol";

contract RiskEngine is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant YEAR = 365 days; 
    uint256 public constant ONE = 1e18; 
    uint256 public constant BPS = 10_000; 

    struct PriceSource {
        address adapter;      
        bytes32 pythId;       
        uint64  maxAge;       
        uint16  minConfBps;   
        uint8   denom;        
        uint256 manualPriceX18; 
        bool    useAdapter;   
    }

    struct Collateral {
        IERC20  token;
        uint8   decimals;
        uint256 scale;        
        uint16  haircutBps;   
        bool    enabled;
        PriceSource price;    
    }

    address public quoteToken;         
    PriceSource public quotePrice;     
    mapping(address => Collateral) public collat; 
    address[] public collateralList;             

    bool public frozen; 
    bool public operatorsFrozen; 

    event Frozen();
    event OperatorsFrozen();
    event CollateralUpsert(
        address indexed token,
        uint8 decimals,
        uint16 haircutBps,
        bool enabled
    );
    event CollateralPriceSourceSet(
        address indexed token,
        address adapter,
        bytes32 pythId,
        uint64 maxAge,
        uint16 minConfBps,
        uint8 denom,
        bool useAdapter
    );
    event QuoteSet(address indexed quote);
    event QuotePriceSourceSet(
        address adapter, bytes32 pythId, uint64 maxAge, uint16 minConfBps, uint8 denom, bool useAdapter
    );

    modifier onlyWhenActive() {
        _onlyWhenActive();
        _;
    }

    function _onlyWhenActive() internal view {
        if (frozen) revert Errors.SystemFrozen();
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function freeze() external onlyOwner onlyWhenActive {
        frozen = true;
        emit Frozen();
    }

    function freezeOperators() external onlyOwner {
        operatorsFrozen = true;
        emit OperatorsFrozen();
    }

    mapping(address => bool) public operators; 

    event OperatorSet(address indexed op, bool allowed);

    function setOperator(address op, bool allowed) external onlyOwner {
        if (operatorsFrozen) revert Errors.OperatorsFrozen();
        operators[op] = allowed;
        emit OperatorSet(op, allowed);
    }

    function setQuoteToken(address _quote) external onlyOwner {
        if (_quote == address(0)) revert Errors.ZeroAddress();
        quoteToken = _quote;
        emit QuoteSet(_quote);
    }

    function setQuotePriceSource(PriceSource calldata ps) external onlyOwner {
        quotePrice = ps;
        emit QuotePriceSourceSet(ps.adapter, ps.pythId, ps.maxAge, ps.minConfBps, ps.denom, ps.useAdapter);
    }

    modifier onlyOperator() {
        _onlyOperator();
        _;
    }

    function _onlyOperator() internal view {
        if (!operators[msg.sender]) revert Errors.NotOperator();
    }



    function upsertCollateral(
        address token,
        uint16 haircutBps,
        bool enabled,
        PriceSource calldata ps
    ) external onlyOwner onlyWhenActive {
        if (token == address(0)) revert Errors.ZeroAddress();
        if (haircutBps >= BPS) revert Errors.HaircutTooHigh();

        Collateral storage c = collat[token];

        if (address(c.token) == address(0)) {
            uint8 dec = 18;
            try IERC20Metadata(token).decimals() returns (uint8 d) { dec = d; } catch {}
            c.token    = IERC20(token);
            c.decimals = dec;
            c.scale    = 10 ** dec;
            collateralList.push(token);
        }

        c.haircutBps = haircutBps;
        c.enabled    = enabled;
        c.price      = ps;

        emit CollateralUpsert(token, c.decimals, haircutBps, enabled);
        emit CollateralPriceSourceSet(token, ps.adapter, ps.pythId, ps.maxAge, ps.minConfBps, ps.denom, ps.useAdapter);
    }

    struct PoolRiskParams {
        uint256 imBps; 
        uint256 mmBps; 
        uint256 durationFactor; 
        uint256 maxSingleNotional; 
        uint256 maxAccountNotional; 
        bool enabled;
    }

    mapping(bytes32 => PoolRiskParams) public poolRiskParams;

    event PoolRiskConfigured(bytes32 indexed poolId, PoolRiskParams params);

    function setPoolRiskParams(
        bytes32 poolId,
        PoolRiskParams calldata p
    ) external onlyOwner onlyWhenActive {
        if (p.imBps == 0 || p.mmBps == 0) revert Errors.InvalidBPS();
        if (p.durationFactor == 0) revert Errors.InvalidDurationFactor();
        if (p.maxSingleNotional == 0 || p.maxAccountNotional == 0) revert Errors.InvalidBPS();
        poolRiskParams[poolId] = p;
        emit PoolRiskConfigured(poolId, p);
    }

    struct Position {
        bytes32 poolId;
        int24 tickLower;
        int24 tickUpper;
        bytes32 salt; 
        uint256 L; 
        uint256 kappa; 
        int256 entryFix; 
        int256 lastPhi; 
        uint256 maturity; 
    }

    struct Account {
        mapping(address => uint256) collateralIdless;
        int256 fundingDebt; 
        Position[] positions;
        mapping(bytes32 => uint256) posIndex; 
        uint256 notionalSum; 
        mapping(bytes32 => uint256) notionalSumByPool;
    }

    mapping(address => Account) private accounts;

    event Deposited(address indexed trader, address indexed token, uint256 amount);
    event Withdrawn(address indexed trader, address indexed token, uint256 amount);
    event PositionDelta(
        address indexed trader,
        bytes32 indexed key,
        int256 LDelta,
        uint256 newL,
        uint256 kappa,
        uint256 maturity
    );
    event PositionClosed(address indexed trader, bytes32 indexed key);
    event FundingAccrued(address indexed trader, int256 deltaToken1);

    address public fundingSink;
    event FundingSinkSet(address indexed sink);

    function positionKey(
        bytes32 poolId,
        int24 tickLower,
        int24 tickUpper,
        bytes32 salt
    ) public pure returns (bytes32) {
        bytes32 result;
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, poolId)
            mstore(add(ptr, 0x20), tickLower)
            mstore(add(ptr, 0x40), tickUpper)
            mstore(add(ptr, 0x60), salt)
            result := keccak256(ptr, 0x80)
        }
        return result;
    }

    function _readRawPriceX18(PriceSource storage ps)
        internal view
        returns (uint256 priceX18, uint256 confBps, uint256 age)
    {
        if (!ps.useAdapter) {
            return (ps.manualPriceX18, 10_000, 0);
        }
        if (ps.adapter == address(0)) revert Errors.PythAdapterNotSet();

        (uint256 p, uint256 cX18, uint256 t) = IPriceAdapter(ps.adapter).readPriceX18(ps.pythId);
        age = block.timestamp - t;
        if (ps.maxAge != 0 && age > ps.maxAge) revert Errors.PriceTooStale();

        confBps = p == 0 ? 0 : uint16(Math.min(10_000, (p * 10_000) / (p + cX18)));
        if (ps.minConfBps != 0 && confBps < ps.minConfBps) revert Errors.PriceConfidenceTooLow();

        return (p, confBps, age);
    }

    function _usdToQuote(uint256 usdX18) internal view returns (uint256 quoteX18) {
        if (quoteToken == address(0)) revert Errors.ZeroAddress();
        if (quotePrice.denom == 0 && !quotePrice.useAdapter) {
            return usdX18;
        }
        (uint256 qPrice, , ) = _readRawPriceX18(quotePrice);
        require(quotePrice.denom == 1, "QUOTE_PRICE_DENOM");
        require(qPrice != 0, "QUOTE_PRICE_ZERO");
        return Math.mulDiv(usdX18, 1e18, qPrice);
    }

    function _priceInQuoteX18(Collateral storage c)
        internal view
        returns (uint256 px18, uint256 confBps, uint256 age)
    {
        (uint256 p, uint256 conf, uint256 a) = _readRawPriceX18(c.price);
        if (c.price.denom == 1) {
            p = _usdToQuote(p);
        }
        return (p, conf, a);
    }


    function tokenValueInQuote(
        address token,
        uint256 amount
    ) public view returns (uint256 valueX18, uint256 confBps, uint256 age) {
        Collateral storage c = collat[token];
        if (!c.enabled) revert Errors.CollateralDisabled();
        if (amount == 0) return (0, 10_000, 0);

        (uint256 px, uint256 conf, uint256 a) = _priceInQuoteX18(c);
        uint256 gross = Math.mulDiv(amount, px, c.scale);
        valueX18 = Math.mulDiv(gross, (BPS - c.haircutBps), BPS);
        return (valueX18, conf, a);
    }

    function tokenValueInQuoteUnsafe(address token, uint256 amount) external view returns (uint256) {
        (uint256 v,,) = tokenValueInQuote(token, amount);
        return v;
    }

    function collateralValue(
        address trader
    ) public view returns (uint256 value1e18) {
        Account storage acct = accounts[trader];
        for (uint256 i = 0; i < collateralList.length; ++i) {
            address token = collateralList[i];
            uint256 bal = acct.collateralIdless[token];
            if (bal != 0) {
                (uint256 v,,) = tokenValueInQuote(token, bal);
                value1e18 += v;
            }
        }
    }

    function _equity(address trader) internal view returns (int256 eq) {
        eq = int256(collateralValue(trader)) - accounts[trader].fundingDebt;
    }

    function equity(address trader) external view returns (int256) {
        return _equity(trader);
    }

    function deposit(address token, uint256 amount) external nonReentrant {
        Collateral storage c = collat[token];
        if (!c.enabled) revert Errors.CollateralDisabled();
        if (amount == 0) revert Errors.AmountZero();

        uint256 before = c.token.balanceOf(address(this));
        c.token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = c.token.balanceOf(address(this)) - before;
        if (received == 0) revert Errors.NoTokensReceived();

        accounts[msg.sender].collateralIdless[token] += received;
        emit Deposited(msg.sender, token, received);
    }

    function withdraw(address token, uint256 amount) external nonReentrant {
        Account storage acct = accounts[msg.sender];
        if (acct.collateralIdless[token] < amount) revert Errors.InsufficientCollateral();

        int256 eqBefore = _equity(msg.sender);
        (uint256 val1e18,,) = tokenValueInQuote(token, amount);
        int256 eqAfter = eqBefore - int256(val1e18);

        uint256 im = imRequirement(msg.sender, block.timestamp);
        if (eqAfter < int256(im)) revert Errors.WithdrawIMBreach();

        acct.collateralIdless[token] -= amount;
        collat[token].token.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, token, amount);
    }

    function onPositionDelta(
        address trader,
        bytes32 poolId,
        int24 tickL,
        int24 tickU,
        bytes32 salt,
        uint256 kappa,
        uint256 maturity,
        int256 LDelta
    ) external onlyOperator {
        PoolRiskParams storage pr = poolRiskParams[poolId];
        if (!pr.enabled) revert Errors.PoolNotEnabled();
        if (maturity <= block.timestamp) revert Errors.PoolMatured();

        Account storage acct = accounts[trader];
        bytes32 key = positionKey(poolId, tickL, tickU, salt);
        uint256 idx = acct.posIndex[key];

        if (idx == 0) {
            if (LDelta <= 0) revert Errors.NoExistingPosition();
            Position memory p = Position({
                poolId: poolId,
                tickLower: tickL,
                tickUpper: tickU,
                salt: salt,
                L: uint256(LDelta),
                kappa: kappa,
                entryFix: 0,
                lastPhi: 0,
                maturity: maturity
            });
            acct.positions.push(p);
            acct.posIndex[key] = acct.positions.length; 
            uint256 addNotional = p.L * p.kappa;
            acct.notionalSum += addNotional;
            acct.notionalSumByPool[p.poolId] =
                acct.notionalSumByPool[p.poolId] +
                addNotional;
            _enforceCaps(
                trader,
                p.poolId,
                acct.notionalSumByPool[p.poolId],
                pr
            );
            requireIM(trader, block.timestamp);
            emit PositionDelta(trader, key, LDelta, p.L, kappa, maturity);
            return;
        }

        Position storage pos = acct.positions[idx - 1];
        if (pos.poolId != poolId) revert Errors.PoolMismatch();

        if (LDelta == 0) {
            emit PositionDelta(trader, key, 0, pos.L, pos.kappa, pos.maturity);
            return;
        }

        if (LDelta > 0) {
            uint256 u = uint256(LDelta);
            pos.L += u;
            if (pos.kappa == 0) pos.kappa = kappa;
            if (pos.maturity == 0) pos.maturity = maturity;
            uint256 addNotional = u * (pos.kappa == 0 ? kappa : pos.kappa);
            acct.notionalSum += addNotional;
            acct.notionalSumByPool[pos.poolId] =
                acct.notionalSumByPool[pos.poolId] +
                addNotional;
            _enforceCaps(
                trader,
                pos.poolId,
                acct.notionalSumByPool[pos.poolId],
                pr
            );
            requireIM(trader, block.timestamp);
        } else {
            uint256 d = uint256(-LDelta);
            if (pos.L < d) revert Errors.BurnExceedsLiquidity();
            pos.L -= d;
            uint256 subNotional = d * (pos.kappa == 0 ? kappa : pos.kappa);
            acct.notionalSum = (acct.notionalSum >= subNotional)
                ? (acct.notionalSum - subNotional)
                : 0;
            uint256 s = acct.notionalSumByPool[poolId];
            acct.notionalSumByPool[poolId] = s >= subNotional
                ? s - subNotional
                : 0;

            if (pos.L == 0) {
                _removePosition(acct, key, idx - 1);
                emit PositionClosed(trader, key);
                emit PositionDelta(
                    trader,
                    key,
                    LDelta,
                    0,
                    pos.kappa,
                    pos.maturity
                );
                return;
            }
        }

        emit PositionDelta(trader, key, LDelta, pos.L, pos.kappa, pos.maturity);
    }

    function _removePosition(
        Account storage acct,
        bytes32 key,
        uint256 i
    ) internal {
        uint256 last = acct.positions.length - 1;
        if (i != last) {
            Position memory moved = acct.positions[last];
            acct.positions[i] = moved;
            bytes32 movedKey = positionKey(
                moved.poolId,
                moved.tickLower,
                moved.tickUpper,
                moved.salt
            );
            acct.posIndex[movedKey] = i + 1;
        }
        acct.positions.pop();
        acct.posIndex[key] = 0;
    }

    function onFundingAccrued(
        address trader,
        int256 deltaToken1
    ) external onlyOperator {
        accounts[trader].fundingDebt += deltaToken1;
        emit FundingAccrued(trader, deltaToken1);
        if (fundingSink != address(0) && deltaToken1 != 0) {
            accounts[fundingSink].fundingDebt -= deltaToken1;
            emit FundingAccrued(fundingSink, -deltaToken1);
        }
    }

    function setFundingSink(address sink) external onlyOwner onlyWhenActive {
        fundingSink = sink;
        emit FundingSinkSet(sink);
    }

    function dv01(
        Position memory pos,
        uint256 nowTs,
        uint256 durationFactor
    ) public pure returns (uint256) {
        if (nowTs >= pos.maturity) return 0;
        uint256 duration = pos.maturity - nowTs;
        uint256 N = pos.L * pos.kappa; 
        uint256 timeScaled = Math.mulDiv(N, duration, YEAR);
        return Math.mulDiv(timeScaled, durationFactor, ONE);
    }

    function _sumDv01(address trader, uint256 nowTs)
        internal view
        returns (uint256 totalByIM, uint256 totalByMM)
    {
        Account storage acct = accounts[trader];
        uint256 len = acct.positions.length;
        for (uint256 i = 0; i < len; ++i) {
            Position storage p = acct.positions[i];
            PoolRiskParams storage pr = poolRiskParams[p.poolId];
            if (!pr.enabled) continue;

            uint256 dv = dv01(p, nowTs, pr.durationFactor);
            totalByIM += Math.mulDiv(dv, pr.imBps, BPS);
            totalByMM += Math.mulDiv(dv, pr.mmBps, BPS);
        }
    }

    function imRequirement(address trader, uint256 nowTs) public view returns (uint256 im) {
        (im,) = _sumDv01(trader, nowTs);
    }

    function mmRequirement(address trader, uint256 nowTs) public view returns (uint256 mm) {
        (,mm) = _sumDv01(trader, nowTs);
    }

    function healthFactor(
        address trader,
        uint256 nowTs
    ) public view returns (uint256 hf, int256 eq, uint256 im, uint256 mm) {
        eq = _equity(trader);
        im = imRequirement(trader, nowTs);
        mm = mmRequirement(trader, nowTs);
        if (mm == 0) {
            hf = type(uint256).max;
        } else {
            hf = (eq <= 0) ? 0 : Math.mulDiv(uint256(eq), ONE, mm);
        }
    }

    function requireIM(address trader, uint256 nowTs) public view {
        int256 eq = _equity(trader);
        uint256 im = imRequirement(trader, nowTs);
        if (eq < int256(im)) revert Errors.InsufficientEquity();
    }

    function _enforceCaps(
        address,
        bytes32,
        uint256 newPoolSum,
        PoolRiskParams storage pr
    ) internal view {
        if (!pr.enabled) revert Errors.PoolDisabled();
        if (newPoolSum > pr.maxAccountNotional) revert Errors.AccountNotionalCap();
    }

    struct Health {
        uint256 hf; 
        int256 equity; 
        uint256 im; 
        uint256 mm; 
        int256 funding; 
    }

    function previewHealth(
        address trader,
        uint256 nowTs
    ) external view returns (Health memory h) {
        (h.hf, h.equity, h.im, h.mm) = healthFactor(trader, nowTs);
        h.funding = accounts[trader].fundingDebt;
    }

    function previewAfterPositionDelta(
        address trader,
        bytes32 poolId,
        uint256 kappa,
        uint256 maturity,
        int256 LDelta,
        uint256 nowTs
    ) external view returns (Health memory h) {
        (h.hf, h.equity, h.im, h.mm) = healthFactor(trader, nowTs);
        PoolRiskParams storage pr = poolRiskParams[poolId];
        if (!pr.enabled || LDelta == 0) return h;

        uint256 dv;
        if (LDelta > 0) {
            uint256 Nadd = uint256(LDelta) * kappa;
            uint256 timeScaled = Math.mulDiv(
                Nadd,
                (maturity > nowTs ? (maturity - nowTs) : 0),
                YEAR
            );
            dv = Math.mulDiv(timeScaled, pr.durationFactor, ONE);
            h.im += Math.mulDiv(dv, pr.imBps, BPS);
            h.mm += Math.mulDiv(dv, pr.mmBps, BPS);
        } else {
            uint256 Nsub = uint256(-LDelta) * kappa;
            uint256 timeScaled = Math.mulDiv(
                Nsub,
                (maturity > nowTs ? (maturity - nowTs) : 0),
                YEAR
            );
            dv = Math.mulDiv(timeScaled, pr.durationFactor, ONE);
            uint256 dim = Math.mulDiv(dv, pr.imBps, BPS);
            uint256 dmm = Math.mulDiv(dv, pr.mmBps, BPS);
            h.im = h.im > dim ? (h.im - dim) : 0;
            h.mm = h.mm > dmm ? (h.mm - dmm) : 0;
        }
        h.hf = h.mm == 0
            ? type(uint256).max
            : (h.equity <= 0 ? 0 : Math.mulDiv(uint256(h.equity), ONE, h.mm));
    }

    function previewAfterSwapNotional(
        address trader,
        bytes32 poolId,
        uint256 absNotional,
        uint256 maturity,
        uint256 nowTs
    ) external view returns (Health memory h) {
        (h.hf, h.equity, h.im, h.mm) = healthFactor(trader, nowTs);
        PoolRiskParams storage pr = poolRiskParams[poolId];
        if (!pr.enabled || absNotional == 0) return h;

        uint256 timeScaled = Math.mulDiv(
            absNotional,
            (maturity > nowTs ? (maturity - nowTs) : 0),
            YEAR
        );
        uint256 dv = Math.mulDiv(timeScaled, pr.durationFactor, ONE);
        h.im += Math.mulDiv(dv, pr.imBps, BPS);
        h.mm += Math.mulDiv(dv, pr.mmBps, BPS);
        h.hf = h.mm == 0
            ? type(uint256).max
            : (h.equity <= 0 ? 0 : Math.mulDiv(uint256(h.equity), ONE, h.mm));
    }

    uint256 public liquidationPenaltyBps = 600; 
    uint256 public closeFactorMinBps = 5000; 
    uint256 public closeFactorMaxBps = 10000; 
    uint256 public hfCritical = 9e17; 

    address public insurance;
    uint256 public liqFeeShareBps; 

    event LiquidationParamsSet(
        uint256 penaltyBps,
        uint256 closeMinBps,
        uint256 closeMaxBps,
        uint256 hfCritical
    );
    event InsuranceSet(address indexed insurance, uint256 feeShareBps);
    event SeizedCollateral(
        address indexed trader,
        address indexed token,
        uint256 amount,
        uint256 value1e18
    );
    event Liquidated(
        address indexed trader,
        address indexed liquidator,
        uint256 repaidToken1,
        uint256 seizedValue1e18,
        uint256 insuranceValue1e18
    );
    event BadDebt(address indexed trader, uint256 shortfallToken1);

    function setLiquidationParams(
        uint256 penaltyBps,
        uint256 closeMinBps,
        uint256 closeMaxBps,
        uint256 _hfCritical
    ) external onlyOwner onlyWhenActive {
        if (penaltyBps > 2000) revert Errors.PenaltyTooHigh(); 
        if (closeMinBps == 0 || closeMinBps > BPS) revert Errors.InvalidBPS();
        if (closeMaxBps < closeMinBps || closeMaxBps > BPS) revert Errors.InvalidBPS();
        if (_hfCritical >= ONE) revert Errors.InvalidHealthFactorCritical();
        liquidationPenaltyBps = penaltyBps;
        closeFactorMinBps = closeMinBps;
        closeFactorMaxBps = closeMaxBps;
        hfCritical = _hfCritical;
        emit LiquidationParamsSet(
            penaltyBps,
            closeMinBps,
            closeMaxBps,
            _hfCritical
        );
    }

    function setInsurance(
        address _insurance,
        uint256 feeShareBps_
    ) external onlyOwner onlyWhenActive {
        if (feeShareBps_ > BPS) revert Errors.FeeShareTooHigh();
        insurance = _insurance;
        liqFeeShareBps = feeShareBps_;
        emit InsuranceSet(_insurance, feeShareBps_);
    }

    function _ceilMulDiv(
        uint256 x,
        uint256 y,
        uint256 d
    ) internal pure returns (uint256) {
        uint256 z = Math.mulDiv(x, y, d);
        if (Math.mulDiv(z, d, y) < x) z += 1; 
        return z;
    }

    function _computeCloseFactorBps(
        uint256 hf
    ) internal view returns (uint256 bps) {
        if (hf <= hfCritical) return closeFactorMaxBps;
        if (hf >= ONE) return 0;
        unchecked {
            uint256 range = ONE - hfCritical;
            uint256 prog = ((ONE - hf) * BPS) / range; 
            uint256 added = ((closeFactorMaxBps - closeFactorMinBps) * prog) /
                BPS;
            return closeFactorMinBps + added;
        }
    }

    function _sumSeizeableValue(
        address trader,
        address[] memory seizeOrder
    ) internal view returns (uint256 v) {
        Account storage acct = accounts[trader];
        for (uint256 i = 0; i < seizeOrder.length; ++i) {
            address token = seizeOrder[i];
            uint256 bal = acct.collateralIdless[token];
            if (bal == 0) continue;
            (uint256 val,,) = tokenValueInQuote(token, bal);
            v += val;
        }
    }

    function _seizeTo(
        address trader,
        address recipient,
        uint256 value1e18,
        address[] memory seizeOrder
    ) internal {
        if (value1e18 == 0) return;
        Account storage acct = accounts[trader];
        uint256 remaining = value1e18;

        for (uint256 i = 0; i < seizeOrder.length && remaining > 0; ++i) {
            address token = seizeOrder[i];
            Collateral storage c = collat[token];
            if (!c.enabled) continue;

            uint256 avail = acct.collateralIdless[token];
            if (avail == 0) continue;

            (uint256 px,,) = _priceInQuoteX18(c);
            uint256 denom = Math.mulDiv(px, (BPS - c.haircutBps), BPS);
            if (denom == 0) continue;

            uint256 needed = _ceilMulDiv(remaining, c.scale, denom);
            uint256 seizeAmt = needed > avail ? avail : needed;
            if (seizeAmt == 0) continue;

            (uint256 seizedVal,,) = tokenValueInQuote(token, seizeAmt);
            if (seizedVal > remaining) seizedVal = remaining;

            acct.collateralIdless[token] = avail - seizeAmt;
            c.token.safeTransfer(recipient, seizeAmt);

            emit SeizedCollateral(trader, token, seizeAmt, seizedVal);
            remaining -= seizedVal;
        }

        if (remaining > 0) revert Errors.InsufficientCollateralToSeize();
    }

    function previewLiquidation(
        address trader,
        uint256 repayDesired,
        address[] calldata seizeOrder
    )
        external
        view
        returns (
            uint256 repayCap,
            uint256 seizeValue1e18,
            uint256 debtBefore,
            uint256 hf
        )
    {
        (uint256 hfLocal, int256 eq, , ) = healthFactor(
            trader,
            block.timestamp
        );
        if (eq >= 0 && hfLocal >= ONE) revert Errors.NotLiquidatable();
        hf = hfLocal;

        int256 debtSigned = accounts[trader].fundingDebt;
        uint256 debt = debtSigned > 0 ? uint256(debtSigned) : 0;

        uint256 cf = _computeCloseFactorBps(hf);
        uint256 byCloseFactor = Math.mulDiv(debt, cf, BPS);

        uint256 seizeable = _sumSeizeableValue(trader, seizeOrder);
        uint256 byCollateral = Math.mulDiv(
            seizeable,
            BPS,
            BPS + liquidationPenaltyBps
        );

        uint256 cap = debt;
        if (byCloseFactor < cap) cap = byCloseFactor;
        if (byCollateral < cap) cap = byCollateral;
        if (repayDesired < cap) cap = repayDesired;

        repayCap = cap;
        seizeValue1e18 = Math.mulDiv(
            repayCap,
            (BPS + liquidationPenaltyBps),
            BPS
        );
        debtBefore = debt;
    }

    function liquidate(
        address trader,
        uint256 repayDesired,
        address recipient,
        address[] calldata seizeOrder
    ) external nonReentrant {
        if (recipient == address(0)) revert Errors.ZeroAddress();
        if (repayDesired == 0) revert Errors.AmountZero();

        (uint256 hf, int256 eq, , ) = healthFactor(trader, block.timestamp);
        if (eq >= 0 && hf >= ONE) revert Errors.NotLiquidatable();

        Account storage acct = accounts[trader];
        int256 debtSigned = acct.fundingDebt;
        if (debtSigned <= 0) revert Errors.AmountZero();
        uint256 debt = uint256(debtSigned);

        uint256 cf = _computeCloseFactorBps(hf);
        uint256 byCloseFactor = Math.mulDiv(debt, cf, BPS);
        uint256 seizeable = _sumSeizeableValue(trader, seizeOrder);
        uint256 byCollateral = Math.mulDiv(
            seizeable,
            BPS,
            (BPS + liquidationPenaltyBps)
        );

        uint256 repay = repayDesired;
        if (repay > debt) repay = debt;
        if (repay > byCloseFactor) repay = byCloseFactor;
        if (repay > byCollateral) repay = byCollateral;
        if (repay == 0) revert Errors.AmountZero();

        if (quoteToken == address(0)) revert Errors.ZeroAddress();
        Collateral storage c1 = collat[quoteToken];
        if (!c1.enabled) revert Errors.CollateralDisabled();
        c1.token.safeTransferFrom(msg.sender, address(this), repay);

        acct.fundingDebt = int256(debt - repay);

        uint256 totalSeize = Math.mulDiv(
            repay,
            (BPS + liquidationPenaltyBps),
            BPS
        );

        uint256 penaltyVal = totalSeize - repay;
        uint256 insuranceVal = (insurance != address(0) && liqFeeShareBps != 0)
            ? Math.mulDiv(penaltyVal, liqFeeShareBps, BPS)
            : 0;

        if (insuranceVal > 0) {
            _seizeTo(trader, insurance, insuranceVal, seizeOrder);
        }
        _seizeTo(trader, recipient, totalSeize - insuranceVal, seizeOrder);

        emit Liquidated(trader, msg.sender, repay, totalSeize, insuranceVal);

        if (acct.fundingDebt > 0) {
            uint256 residual;
            for (uint256 i = 0; i < collateralList.length; ++i) {
                residual += acct.collateralIdless[collateralList[i]];
            }
            if (residual == 0) emit BadDebt(trader, uint256(acct.fundingDebt));
        }
    }

    function collateralBalance(
        address trader,
        address token
    ) external view returns (uint256) {
        return accounts[trader].collateralIdless[token];
    }

    function fundingDebt(address trader) external view returns (int256) {
        return accounts[trader].fundingDebt;
    }

    function positionsLength(address trader) external view returns (uint256) {
        return accounts[trader].positions.length;
    }

    function getPosition(
        address trader,
        uint256 index
    ) external view returns (Position memory) {
        return accounts[trader].positions[index];
    }

    function rescueTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }

    mapping(uint8 => address) public legacyIdToToken;

    function setLegacyId(uint8 id, address token) external onlyOwner {
        legacyIdToToken[id] = token;
    }

    function depositById(uint8 id, uint256 amount) external { 
        this.deposit(legacyIdToToken[id], amount); 
    }
    
    function withdrawById(uint8 id, uint256 amount) external { 
        this.withdraw(legacyIdToToken[id], amount); 
    }

    function collateralBalanceById(address trader, uint8 id) external view returns (uint256) {
        return this.collateralBalance(trader, legacyIdToToken[id]);
    }
}

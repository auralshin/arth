### Delta-Neutral Strategies

> info **Metadata** Level: Advanced | Prerequisites: Futures, Options Greeks, Basis, Leverage | Tags: delta-neutral, hedging, carry, greeks, market-neutral, margin

A **delta-neutral** position is one whose value does not change, to first order, when the underlying price moves. It is built by holding an exposure and an offsetting hedge sized so their price sensitivities cancel. The purpose is not to eliminate risk — it is to eliminate *one particular* risk, so that the return comes from whatever else is left: carry, spread, volatility, or fees.

That framing is the whole subject. Delta-neutrality is a construction technique, not a strategy. A position with no delta and no other source of return is simply an expensive way to hold cash. Every delta-neutral strategy therefore has to answer two questions: what is the compensated exposure being kept, and what are the uncompensated exposures that survived the hedge.

> warning **Not Financial Advice** "Delta-neutral" is one of the most misused terms in finance and is frequently presented as a synonym for "low risk". It is not. This page explains what the hedge removes and, more importantly, what it leaves behind.

---

#### Why It Might Work: The Economic Rationale

Suppose you believe you are paid for supplying something specific — liquidity, balance sheet, insurance, or the willingness to hold an unpopular exposure. The return from that service is typically small: tens of basis points, not tens of percent. If you take the position without hedging, the underlying's own volatility — which may be 20% or 80% annualised — completely swamps the signal. The carry becomes undetectable noise inside a directional bet you never intended to take.

Hedging the delta does three things:

- **It isolates the compensated exposure.** If your edge is in the basis, then holding the underlying's direction adds variance without adding expected return. Removing it raises the strategy's information ratio even though it lowers the raw return.
- **It makes leverage rational.** A small, stable expected return is only economically meaningful when levered. Levering an unhedged directional position amplifies the noise as much as the signal; levering a hedged carry position amplifies the part you were paid for.
- **It changes what you are exposed to, not whether you are exposed.** After the hedge, the residual risks are gamma, vega, basis, financing, correlation, and — the one that ends careers — margin and funding fragmentation across the two legs.

**What would have to be true.** For a delta-neutral strategy to earn anything, there must be a genuine, identifiable premium in the residual exposure: a positive basis, a positive funding rate, an implied-versus-realised volatility gap, a fee stream, or a mispriced spread. If the answer to "what am I being paid for?" is "the position is neutral", there is no answer. And crucially, the *size* of that premium must exceed the cost of maintaining the hedge, which is not zero and rises with volatility.

---

#### Formal Definition

For a portfolio of instruments `i` with quantities `q_i` on a common underlying `S`:

```text
delta_i   = dV_i / dS

Delta_p   = sum_i ( q_i * delta_i )

neutral:  Delta_p = 0
```

where:

- `V_i` is the value of instrument `i`
- `delta_i` is 1 for a unit of spot, 1 for a unit of a linear future or perpetual (approximately, ignoring discounting), and `N(d1)` for a European call under Black–Scholes
- `q_i` is the signed quantity held

For the simple two-leg case of a spot position hedged with a linear derivative, the hedge quantity is:

```text
q_hedge = - q_spot * (delta_spot / delta_hedge)
```

Delta is a *local* derivative, so neutrality holds only in a neighbourhood of the current price. The rate at which it decays is **gamma**:

```text
gamma = d(delta) / dS
```

A position with zero delta and non-zero gamma becomes directional as soon as the price moves. This is why delta-hedging is a continuous activity rather than a one-off trade, and why the choice of rebalancing rule is itself a strategy decision. See [Greeks](/derivatives/greeks) and [Delta Hedging](/derivatives/delta-hedging).

**What survives the hedge.** After delta is neutralised, the remaining exposures are:

<table>
  <tbody>
    <tr><td><strong>Residual</strong></td><td><strong>What it is</strong></td></tr>
    <tr><td>Gamma</td><td>Curvature. Delta drifts as the underlying moves, so a static hedge decays into a directional position.</td></tr>
    <tr><td>Vega</td><td>Sensitivity to implied volatility. Unchanged by a delta hedge, and often the actual source of P&amp;L.</td></tr>
    <tr><td>Theta and carry</td><td>Time decay, funding, dividends, borrow fees. Usually the intended return.</td></tr>
    <tr><td>Basis risk</td><td>The hedge instrument is not identical to the exposure. Their prices can diverge.</td></tr>
    <tr><td>Correlation risk</td><td>Where the hedge is a proxy (an index against a single name), the hedge ratio depends on a beta that is unstable.</td></tr>
    <tr><td>Funding and margin</td><td>The two legs may be at different venues with separate collateral. Economic neutrality does not imply operational neutrality.</td></tr>
  </tbody>
</table>

---

#### The Classical Case: Spot Against a Dated Future

The original delta-neutral trade is [cash-and-carry](/strategies/cash-carry): long the asset, short a futures contract on it. Delta is exactly zero because the future is linear in the underlying, and the return is the basis, which is known at inception and realised at delivery.

This version is unusually clean, and it is worth being explicit about why:

- **Convergence is contractual.** At delivery the futures price equals the settlement price. There is a terminal date at which the position self-liquidates at a known relationship.
- **The residual is a financing spread, not a random variable.** Once the trade is on, the P&L is determined, subject to financing costs.
- **The path still matters.** Variation margin on the futures leg is settled in cash daily; the spot leg is not. A large move against the futures leg drains cash before the offsetting gain is realised.

Every other delta-neutral strategy is a variation that gives up one of these properties.

---

#### The Perpetual Case, and Its Worked Example

A **perpetual future** has no delivery date, so convergence is enforced by a recurring funding payment rather than by settlement. The trade is: hold the asset, short the perpetual, collect funding while it is positive. See [Perpetual Futures](/building-blocks/perpetual-futures) and [Funding Rate](/signals/funding-rate).

The delta arithmetic is trivial and the margin arithmetic is not. Consider a position built with 125,000 of capital. All figures are illustrative arithmetic constructed to demonstrate the mechanism, not a measured result.

<table>
  <tbody>
    <tr><td><strong>Leg</strong></td><td><strong>Position</strong></td><td><strong>Capital used</strong></td></tr>
    <tr><td>Spot</td><td>Long 50 units at 2,000</td><td>100,000, fully paid</td></tr>
    <tr><td>Perpetual</td><td>Short 50 units at 2,000</td><td>25,000 margin against 100,000 notional</td></tr>
    <tr><td>Net delta</td><td>Zero</td><td>&mdash;</td></tr>
  </tbody>
</table>

With funding at 0.01% per eight-hour interval, the short perpetual accrues `100,000 * 0.0001 * 3 = 30.00` per day. Over twenty days that is 600.

Now suppose the price rises. The maintenance margin requirement is 5% of notional, and the perpetual account is liquidated when its equity falls to that level. Solving for the liquidation price `P`:

1. **Perpetual account equity**: `25,000 - 50 * (P - 2,000)`
2. **Maintenance requirement**: `0.05 * 50 * P = 2.5 * P`
3. **Set equal**: `25,000 - 50P + 100,000 = 2.5P`, so `125,000 = 52.5P`
4. **Liquidation price**: `P = 2,380.95`, a rise of 19.05%
5. **Check**: the short's loss is `50 * 380.95 = 19,047.60`, leaving equity of `5,952.40`, and the requirement is `2.5 * 2,380.95 = 5,952.38`

The combined book was never economically exposed: the 19,047.60 loss on the perpetual is exactly matched by an unrealised 19,047.60 gain on the spot. But the gain sits in a different account and cannot meet the margin call. The perpetual leg is closed, the trader is left accidentally long 50 units of spot, and twenty days of funding — 600 — has been erased many times over by a single forced close.

> warning **Delta-neutral is not margin-neutral** A hedged book can be liquidated by a move that costs it nothing economically. The exposure that killed it was not price risk but the segregation of collateral between two venues. Cross-margining, over-collateralisation of the derivative leg, and pre-computing the liquidation price are the standard mitigations, and none of them are free.

---

#### In Practice Across Asset Classes

**Equity market-neutral.** Long and short baskets sized so the portfolio's beta to the market is zero. "Neutral" here has several inequivalent definitions — dollar-neutral, beta-neutral, sector-neutral, factor-neutral — and they can imply very different books from the same signal. Beta is estimated, so beta-neutrality is neutral only to the extent the estimate holds. See [Factor Models](/stat-methods/factor-models).

**Options market making.** Quote a two-sided market, hedge the resulting delta immediately, and retain the spread plus a vega and gamma position. The residual is the difference between the implied volatility sold and the volatility subsequently realised, accumulated through the hedging programme. See [Implied Volatility](/derivatives/implied-volatility).

**Convertible arbitrage.** Long a convertible bond, short the issuer's equity in the ratio given by the conversion delta. The residual is cheap volatility plus credit exposure plus the bond's carry — a combination that behaves well until credit and equity move together, at which point both legs lose.

**Fixed income.** Neutrality is expressed in DV01 rather than in units, so a curve trade is constructed to have zero sensitivity to a parallel shift while retaining exposure to the slope. See [Duration and Convexity](/markets/duration-convexity).

**Commodities.** Spread trades between grades, locations, or delivery months are delta-neutral to the outright price and exposed to the relationship between them. Physical constraints mean the residual can gap.

**On-chain markets.** Delta-hedged liquidity provision is the canonical case: an automated market maker position has a delta that changes continuously with price, so hedging it requires a dynamic short. The residual is the fee income against the convexity cost, which is [Impermanent Loss](/building-blocks/impermanent-loss) by another name. See [Delta-Hedged LP](/strategies/delta-hedged-lp) and [Hedging LP](/strategies/hedging-lp).

---

#### Assumptions and Failure Modes

- **Assumes delta is a sufficient description of exposure.** It is a first-order approximation. Large or fast moves activate gamma, and the hedge that was neutral at 2,000 is directional at 2,400.
- **Assumes rebalancing is cheap.** Continuous hedging is impossible; discrete hedging leaves hedge error. Tightening the rebalance band cuts error and raises cost, and the optimum depends on volatility, which is itself changing. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Assumes the hedge instrument tracks the exposure.** Proxy hedges — an index against a single name, one token against a wrapped variant, a futures contract against a slightly different deliverable — leave a basis that can move independently and is usually widest under stress.
- **Assumes correlations and betas are stable.** They are least stable exactly when the hedge is most needed. Neutrality computed from a calm-period estimate is a fiction during a dislocation. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Assumes collateral is fungible across legs.** It usually is not. Separate venues, separate margin accounts, and delays in moving collateral convert a hedged position into a forced liquidation, as the worked example shows.
- **Assumes the carry stays positive.** Funding rates invert, bases go negative, and borrow fees spike. A strategy whose entire return is a floating rate is exposed to that rate, and to the crowding that determines it.
- **Assumes the neutral position is genuinely low-variance.** It is low-variance in normal conditions and fat-tailed in the tail. The historical record of delta-neutral books is a long series of quiet periods interrupted by severe, correlated losses, because the residual exposures across apparently unrelated neutral strategies turn out to be the same exposure: leverage and funding.
- **Assumes correct measurement.** Delta computed from a model is only as good as the model's inputs. A stale volatility surface or a wrong dividend assumption produces a hedge that is neutral only in the spreadsheet.

---

#### Code

```python
import numpy as np


def hedge_quantity(spot_units, hedge_delta=1.0):
    """Units of hedge instrument to neutralise a spot position.

    hedge_delta is 1.0 for a linear future or perpetual, and the option
    delta otherwise. The sign convention returns a short hedge for a
    long spot position.
    """
    return -spot_units / hedge_delta


def rebalance_with_band(current_hedge, target_hedge, band):
    """Only re-hedge when drift exceeds `band` units.

    A no-trade band trades hedge error against transaction cost. A band
    of zero means continuous hedging, which is infinitely expensive.
    """
    if abs(current_hedge - target_hedge) <= band:
        return current_hedge
    return target_hedge


def liquidation_price_short(entry_price, units, margin_posted,
                            maintenance_fraction):
    """Price at which a short derivative leg is liquidated.

    Compute this before the position is opened. A delta-neutral book
    can be liquidated by a move that costs it nothing economically,
    because the offsetting gain sits in a different account.
    """
    # margin - units*(P - entry) = maintenance_fraction * units * P
    numerator = margin_posted + units * entry_price
    denominator = units * (1.0 + maintenance_fraction)
    return numerator / denominator


def funding_accrual(notional, rate_per_interval, intervals):
    """Carry collected by the short leg. Positive funding means longs
    pay shorts; the rate floats and can invert without warning."""
    return notional * rate_per_interval * intervals
```

---

#### See Also

* [Cash-and-Carry](/strategies/cash-carry)
* [Delta Hedging](/derivatives/delta-hedging)
* [Greeks](/derivatives/greeks)
* [Perpetual Futures](/building-blocks/perpetual-futures)
* [Leverage and Liquidation](/risk/leverage-liquidation)
* [Delta-Hedged LP](/strategies/delta-hedged-lp)

---

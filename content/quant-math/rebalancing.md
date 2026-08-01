### Rebalancing

> info **Metadata** Level: Intermediate | Prerequisites: Mean-Variance, Position Sizing | Tags: rebalancing, portfolios, drift, trading-costs

A portfolio built to target weights does not stay there. Assets that rise gain weight, assets that fall lose it, and after any material move the portfolio's risk profile is no longer the one that was chosen. Rebalancing is the act of trading back towards the target — and, equivalently, the decision about how much drift to tolerate before doing so.

The decision is a trade-off with no free side. Rebalancing frequently keeps the portfolio close to its intended risk and generates continuous trading costs. Rebalancing rarely saves costs and allows the portfolio to become something the mandate never authorised. Every rebalancing rule is a position on where that balance sits, and the honest way to evaluate one is to measure both sides rather than to assume the trading is free.

---

#### Formal Definition

At time `t`, with target weights `w*` and drifted weights `w_t`:

```text
drift_i = w_{t,i} - w*_i
```

The trade required to restore targets, as a fraction of portfolio value:

```text
trade_i = (w*_i - w_{t,i}) * portfolio_value
```

**One-way turnover** is the standard measure of activity:

```text
turnover = 0.5 * sum over i of  |w*_i - w_{t,i}|
```

Three families of rule:

- **Calendar.** Rebalance every `k` periods regardless of drift. Simple, auditable, and blind to whether any drift has occurred.
- **Threshold (band).** Rebalance when any weight breaches a band. Bands may be **absolute** (`60% ± 5` percentage points) or **relative** (`60% ± 5%` of target, so `57%` to `63%`), and the two are very different for small weights.
- **Hybrid.** Check on a schedule, trade only if a band is breached. This is the common institutional compromise.

Within a threshold rule there is a second choice: rebalance **to target**, or only **to the edge of the band**. Trading to the band edge reduces turnover materially and leaves the portfolio at a known, bounded deviation.

---

#### Worked Example

A `£1,000,000` portfolio at a `60/40` equity-bond target. Over the period, equities return `+18%` and bonds `+2%`.

1. **New values**: equities `£600,000 * 1.18 = £708,000`; bonds `£400,000 * 1.02 = £408,000`
2. **Total**: `£1,116,000`
3. **Drifted weights**: `708,000 / 1,116,000 = 63.44%` equities, `36.56%` bonds
4. **Drift**: `3.44` percentage points above target

Whether this triggers a trade depends on the rule:

<table>
  <tbody>
    <tr>
      <td><strong>Rule</strong></td>
      <td><strong>Band on equities</strong></td>
      <td><strong>Triggered?</strong></td>
    </tr>
    <tr><td>Absolute, ±5pp</td><td>55% to 65%</td><td>No</td></tr>
    <tr><td>Absolute, ±3pp</td><td>57% to 63%</td><td>Yes</td></tr>
    <tr><td>Relative, ±5% of target</td><td>57% to 63%</td><td>Yes</td></tr>
  </tbody>
</table>

Assume the rule triggers and the portfolio rebalances fully to target.

5. **Target equity value**: `0.60 * £1,116,000 = £669,600`
6. **Trade**: sell `£708,000 - £669,600 = £38,400` of equities, buy the same in bonds
7. **One-way turnover**: `£38,400 / £1,116,000 = 3.44%` of the portfolio
8. **Cost** at 10 basis points per side, across both legs: `2 * £38,400 * 0.0010 = £76.80`, which is `0.69` basis points of the portfolio

The cost is small here because the drift is small and the instruments are cheap to trade. Both of those conditions fail regularly: a 20-point drift, a 40-basis-point cost, or a monthly instead of annual schedule each multiply the figure substantially.

**What happens without rebalancing.** Suppose equities compound at `8%` and bonds at `3%` for ten years. The equity sleeve grows to `60 * 1.08^10 = 129.5`, the bond sleeve to `40 * 1.03^10 = 53.8`, and the total to `183.3`. The equity weight has become `70.7%`. A portfolio described to its owner as 60/40 is now closer to 71/29, and its volatility has risen accordingly — without any decision having been taken.

> info **Drift is a decision by default** Choosing not to rebalance is choosing to let past returns set the current allocation. That is a legitimate choice, but it should be made deliberately rather than by omission.

---

#### Does Rebalancing Add Return?

It is often claimed that rebalancing produces a "rebalancing premium" by mechanically selling what has risen and buying what has fallen. The claim is conditional, not general.

- If returns **mean-revert** at the rebalancing horizon, systematically selling winners and buying losers earns something. The premium is real and it is a payment for supplying liquidity to the reversal.
- If returns **trend**, the same rule cuts the winners early and adds to the losers. Rebalancing then costs return. This is why trend-following strategies deliberately let winners run.
- If returns are a **random walk**, the expected return effect is approximately zero before costs and negative after them.

There is a separate, unconditional effect: a rebalanced portfolio has lower volatility than a drifting one, because it does not allow concentration to build. That risk reduction is real regardless of the return process, and it is the defensible reason to rebalance. Treat any expected return contribution as an unproven bonus. See [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion).

---

#### In Practice Across Asset Classes

- **Equities.** Index funds must rebalance on index reconstitution dates, and because everyone trades in the same direction at the same moment, those dates carry predictable impact. Tax matters for taxable accounts: realising a gain to restore a weight can cost more than the drift. See [Equity Indices](/markets/equity-indices).
- **Futures.** Exposure can be adjusted without touching the underlying holdings, which makes futures the cheapest rebalancing instrument in a multi-asset book. Contracts must be rolled regardless of any rebalancing decision, so the roll is a natural point at which to reset exposure. See [Roll and Carry](/markets/roll-and-carry).
- **Fixed income.** Duration drifts continuously as bonds age, so a fixed-duration target requires trading even when nothing moves. Benchmark indices reconstitute monthly as new issues enter, which forces a matching turnover on anything tracking them.
- **FX.** Hedge ratios on foreign holdings drift as the underlying assets change value, so a currency overlay needs its own rebalancing schedule. Forward contracts must be rolled on a fixed cycle, which creates natural rebalancing points and its own cash-flow timing risk.
- **Credit.** Rebalancing is limited by what can actually be traded. A drifted weight in an illiquid issue may be uneconomic to correct, and index-tracking credit portfolios routinely accept tracking error rather than pay the spread.
- **Options.** Delta hedging is rebalancing at high frequency, and the trade-off is explicit: hedge more often to reduce path dependence, and pay more in spread and impact. See [Delta Hedging](/derivatives/delta-hedging).
- **On-chain.** Costs have a large **fixed** component. If a transaction costs a flat `£5` in gas, then at a 10 basis point proportional cost the fixed charge dominates for any trade below `£5,000`. This turns the continuous rebalancing problem into one with a hard minimum economic trade size, and the correct answer is usually a much wider no-trade band than an equivalent traditional portfolio would use. Concentrated liquidity positions add a second dimension, since the range itself, not only the weights, must be reset. See [Concentrated Liquidity](/protocols/concentrated-liquidity).

---

#### Assumptions and Failure Modes

- **Costs are assumed proportional and small.** Fixed costs, market impact, and spread all break the assumption, and impact grows faster than linearly with size. See [Market Impact](/execution/market-impact).
- **Trading is assumed possible at the marked price.** Rebalancing requires buying what has fallen, which is when liquidity is thinnest and the model price is least achievable.
- **Rules are calibrated on history.** A band width chosen by backtesting is fitted to the volatility and correlation of the sample. Both change. See [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **Weights are the wrong variable for some books.** For a levered, derivative, or market-neutral portfolio, capital weight does not describe the exposure. Rebalance on risk contribution instead. See [Position Sizing](/quant-math/position-sizing).
- **Rebalancing into a structural break.** Buying an asset that has fallen for a permanent reason — a defaulted credit, a broken peg, a failed protocol — converts a mechanical rule into repeated purchases of a terminal decline. Every mechanical rebalancing rule needs an override for permanent impairment.
- **Cash flows are ignored.** Contributions and withdrawals can be directed towards underweight assets, achieving rebalancing at near-zero marginal cost. Ignoring this and trading separately pays for something available free.
- **Tax and accounting effects are omitted from the backtest.** For a taxable investor, the after-tax rebalancing frequency is usually far lower than the pre-tax optimum.

> warning **Measure both sides of the trade-off** A rebalancing rule that reports only tracking error is measuring half of it. Report realised turnover, realised cost, and tracking error together, or the rule cannot be compared with any other.

---

#### Code

```python
import numpy as np

def rebalance_trades(current_values, target_weights, band=0.0, to_band_edge=False):
    """Trades required to restore target weights, subject to a no-trade band.

    to_band_edge trades only to the band boundary rather than to target,
    which cuts turnover substantially at the cost of a known residual drift.
    """
    values = np.asarray(current_values, dtype=float)
    targets = np.asarray(target_weights, dtype=float)
    total = values.sum()
    current_weights = values / total

    breached = np.abs(current_weights - targets) > band
    if not breached.any():
        return np.zeros_like(values)

    if to_band_edge:
        destination = np.clip(current_weights, targets - band, targets + band)
        destination = destination / destination.sum()
    else:
        destination = targets

    return destination * total - values


def turnover(current_weights, target_weights):
    """One-way turnover as a fraction of portfolio value."""
    return 0.5 * np.abs(
        np.asarray(target_weights, dtype=float)
        - np.asarray(current_weights, dtype=float)
    ).sum()


def minimum_economic_trade(fixed_cost, proportional_cost):
    """Trade size below which a flat fee dominates the proportional cost.

    Sets the practical floor on band width wherever gas or ticket fees apply.
    """
    return fixed_cost / proportional_cost
```

---

#### See Also

* [Position Sizing](/quant-math/position-sizing)
* [Mean-Variance](/quant-math/mean-variance)
* [Optimization](/quant-math/optimization)
* [Rolling Windows](/quant-math/rolling-windows)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Market Impact](/execution/market-impact)
* [Delta Hedging](/derivatives/delta-hedging)

---

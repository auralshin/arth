### Concentrated Liquidity LP

> info **Metadata** Level: Advanced | Prerequisites: AMMs, Impermanent Loss, Volatility, LP as a Business | Tags: concentrated-liquidity, amm, range-orders, realised-volatility, capital-efficiency, defi

A constant-product pool spreads liquidity across every price from zero to infinity, which means almost all of the capital sits at prices that will never trade. Concentrated liquidity lets a provider allocate their capital to an explicit price interval instead. Inside that interval the position behaves exactly like a much larger constant-product position; outside it, the position stops earning entirely and holds a single asset.

Choosing that interval is the strategy, and it is not a preference or a risk setting. **A range is a position on realised volatility.** A narrow range earns far more per unit of capital while the price stays inside it and exits far sooner; a wide range earns less and survives longer. The provider who picks a range is stating, in effect, how much the price will move before they next intervene — which is a volatility forecast, whether or not it is recognised as one.

> warning **Not Financial Advice** This page describes how concentrated liquidity positions behave and how they lose money. It is not a recommendation to provide liquidity in any range or on any protocol.

---

#### Why It Might Work: The Economic Rationale

The economics are the market-making economics of [LP as a Business](/strategies/lp-business), with one structural change: the provider chooses where to quote. Three arguments support the change and one important argument limits it.

**Capital that quotes nowhere earns nothing.** In a full-range pool, the reserves notionally available at extreme prices are real capital doing no work. Withdrawing it from those prices and redeploying it near the current price is a straightforward efficiency gain. Nothing about the trade's economics improves — the same fees are earned by less capital.

**Providers have views and the curve should express them.** A stable pair trades in a narrow band; a liquid staking derivative drifts slowly against its underlying in a known direction; a volatile pair does neither. A single curve shape cannot be right for all three, and the range is the parameter that adapts it. See [Concentrated Liquidity](/protocols/concentrated-liquidity) for the mechanism.

**Range selection is a genuine forecasting problem, so it can be done better or worse.** Unlike a full-range position, where the provider has no decisions to make after deposit, a concentrated position rewards a correct view on realised volatility and punishes an incorrect one. That is a real edge if the forecast has skill.

**What concentration does not do.** It does not improve the ratio of fees to inventory risk. Within the range, both the fee income and the loss-versus-rebalancing scale by *exactly the same* capital-efficiency multiplier. Concentration is leverage on the underlying market-making business: it multiplies a positive edge and it multiplies a negative one. The demonstration is in the worked example below, and it is the single most important thing on this page.

---

#### Formal Definition

A position with liquidity `L` over the price interval `[Pa, Pb]` holds, while the current price `P` lies inside the interval:

```text
x(P) = L * (1 / sqrt(P) - 1 / sqrt(Pb))
y(P) = L * (sqrt(P) - sqrt(Pa))
V(P) = x(P) * P + y(P) = L * (2 * sqrt(P) - P / sqrt(Pb) - sqrt(Pa))
```

where:

- `x` is the reserve of the risky asset, `y` the reserve of the numeraire
- `L` is the liquidity parameter, constant while the price is in range
- `Pa`, `Pb` are the lower and upper bounds of the range

Outside the range the position is entirely one-sided: below `Pa` it holds only the risky asset, above `Pb` only the numeraire. Fees accrue only while in range.

**Capital efficiency.** A full-range position with the same `L` would require `2 * L * sqrt(P)`. The ratio of the two is the concentration multiplier, which collapses to a clean form for a range placed geometrically around the current price, `Pa = P / m` and `Pb = P * m`:

```text
E = 2 * sqrt(P) / (2 * sqrt(P) - P / sqrt(Pb) - sqrt(Pa))

  = 1 / (1 - m^(-1/2))        for the geometric case
```

<table>
  <tbody>
    <tr><td><strong>Range width m</strong></td><td><strong>Interval</strong></td><td><strong>Multiplier E</strong></td></tr>
    <tr><td>1.05</td><td>about -4.8% to +5.0%</td><td>41.5x</td></tr>
    <tr><td>1.10</td><td>about -9.1% to +10.0%</td><td>21.5x</td></tr>
    <tr><td>1.25</td><td>about -20% to +25%</td><td>9.5x</td></tr>
    <tr><td>1.50</td><td>about -33% to +50%</td><td>5.4x</td></tr>
    <tr><td>2.00</td><td>-50% to +100%</td><td>3.4x</td></tr>
  </tbody>
</table>

**The key identity.** Loss-versus-rebalancing for an in-range position depends only on `L` and `P`, not on the range bounds:

```text
LVR rate = (sigma^2 / 4) * L * sqrt(P)
         = (sigma^2 / 8) * (2 * L * sqrt(P))
```

That second form is the full-range LVR of a pool with the same `L`. Since fee income also depends only on `L` — a position earns in proportion to its share of the liquidity active at the traded price — **both sides of the profit and loss scale with `E` and their ratio is unchanged.**

**Time in range.** Modelling log price as a driftless random walk with volatility `sigma`, the expected time to first exit a symmetric log-band of half-width `h = ln(m)` is:

```text
E[time to exit] = h^2 / sigma^2
```

---

#### Worked Example: Narrow Range Versus Wide

Two positions, same capital, same pair, same fee tier. All inputs are illustrative and chosen for the arithmetic; the full-range baseline is a stipulated assumption, not a measurement.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Capital deployed</td><td>100,000</td></tr>
    <tr><td>Annualised volatility <code>sigma</code></td><td>60%</td></tr>
    <tr><td>Fee APR a full-range position would earn</td><td>5.0%</td></tr>
    <tr><td>Full-range LVR, <code>sigma^2 / 8</code></td><td>4.5%</td></tr>
    <tr><td>Cost per rebalance, all-in</td><td>0.15% of position</td></tr>
    <tr><td>Range A</td><td>m = 1.10</td></tr>
    <tr><td>Range B</td><td>m = 1.50</td></tr>
  </tbody>
</table>

The full-range business has an edge of `5.0% - 4.5% = 0.5%` per year. Now apply the multipliers.

**Range A (m = 1.10, E = 21.49):**

1. **Fee APR while in range**: `5.0% * 21.49 = 107.4%`
2. **LVR while in range**: `4.5% * 21.49 = 96.7%`
3. **Gross edge**: `107.4% - 96.7% = 10.74%` — which is exactly `0.5% * 21.49`
4. **Expected time to first exit**: `ln(1.10)^2 / 0.60^2 = 0.009084 / 0.36 = 0.0252` years, about **9.2 days**
5. **Implied rebalances per year**: `365 / 9.2 = 39.6`
6. **Rebalancing drag**: `39.6 * 0.15% = 5.94%`
7. **Net**: `10.74% - 5.94% = 4.80%`

**Range B (m = 1.50, E = 5.45)** follows the identical seven steps: fee APR of `27.2%` against LVR of `24.5%`, a gross edge of `2.72%` — again exactly `0.5% * 5.45` — an expected `ln(1.50)^2 / 0.36 = 0.4567` years or **166.7 days** to first exit, implying `2.19` rebalances per year, a drag of `0.33%`, and a **net of 2.39%**.

Three conclusions follow, and the third is the one people miss.

First, **the gross edge is the full-range edge times `E`, nothing more.** Concentration multiplied a 0.5% business into 10.7% and 2.7% respectively. Had the full-range business been *negative* — fee APR below `sigma^2 / 8` — concentration would have multiplied the loss by the same factor, and the narrow range would have been the worse choice by a factor of four.

Second, **rebalancing cost is what breaks the tie, and it is not a small term.** At the assumed 0.15% per rebalance, Range A still wins. Raise it to 0.25% and Range A nets 0.84% against Range B's 2.18% — the ranking inverts on a cost assumption, not on a market view.

Third, step 4 in each case is a volatility forecast wearing a disguise. If realised volatility comes in at 90% rather than 60%, Range A's expected time in range falls to about 4.1 days and its rebalance count roughly doubles, while its LVR more than doubles. Nothing about the range changed; the bet lost.

---

#### Out of Range: The Asymmetry That Is Not in the Formulas

Everything above describes in-range behaviour. Out of range the position changes character entirely, and the change is unfavourable in both directions.

- **Fees stop.** The position earns zero until the price returns or the range is moved.
- **The position is fully one-sided, on the wrong side.** Above `Pb` it is entirely in the numeraire, having sold the risky asset the whole way up. Below `Pa` it is entirely in the risky asset, having bought all the way down. The range converted a continuous quote into a completed limit order at the worst available average price.
- **The provider now holds a directional position they did not choose.** An out-of-range position that is left alone is no longer a market-making book; it is an unhedged spot position with the market-making label still attached.

This creates the strategy's central operating dilemma. Rebalancing back around the price crystallises the divergence loss and pays the cost immediately. Waiting risks the price never returning, and earns nothing meanwhile. Both are real costs and there is no configuration in which neither is paid — which is another way of saying the position is short gamma. See [Delta-Hedged LP Strategies](/strategies/delta-hedged-lp) for that framing made explicit, and [Uniswap v3 LP](/case-studies/uniswap-v3-lp) for a worked position walkthrough.

> info **Fee APR is quoted for in-range positions only** A dashboard showing a high APR is describing the rate while the position is active. Multiply by the fraction of time in range, and subtract the cost of every re-entry, before comparing it to anything.

---

#### Range Selection in Practice

**Volatility-scaled ranges.** The natural construction sets the half-width from a volatility estimate and a target holding period: `h = c * sigma * sqrt(T)`, with `c` around 1 to 2 covering a reasonable share of the distribution. This makes the volatility forecast explicit rather than implicit, which is the main benefit.

**Passive-wide versus active-narrow.** These are different businesses with different cost structures. Wide ranges are near-fire-and-forget and compete on capital cost. Narrow ranges require monitoring, automation, and per-rebalance costs low enough to survive step 6 above — which in practice means an operational edge, not a market view.

**Asymmetric and multiple ranges.** Placing a range off-centre expresses a directional view and changes the initial asset mix — a legitimate construction, provided it is recognised as adding a directional bet rather than tweaking a neutral one. Splitting capital across a tight inner range and a wide outer range approximates a smoother liquidity distribution, at higher gas cost and with no change to the fee-to-LVR ratio.

**Stable and correlated pairs.** Here concentration is most defensible, because `sigma` is genuinely small and the range genuinely holds. It is also where the tail risk is starkest: a very tight range around a peg produces a large multiplier and converts entirely into the depreciating asset if the peg breaks.

---

#### Assumptions and Failure Modes

- **Assumes the volatility forecast has skill.** The range *is* the forecast. Setting it from trailing realised volatility assumes volatility is persistent, which it is on average and is not during the moves that matter. See [Volatility](/quant-math/volatility).
- **Assumes the underlying market-making business is profitable.** Concentration multiplies whatever edge exists. Applied to a pool where fee APR is below `sigma^2 / 8`, it is a mechanism for losing money faster.
- **Assumes drift is zero.** The expected-exit-time formula ignores drift. A trending price exits a range far sooner than the symmetric calculation implies, and always through the boundary that leaves the position holding the worse asset.
- **Assumes rebalancing costs are known and small.** Each rebalance is a withdrawal, a swap to re-establish the correct asset ratio, and a redeposit — with gas, slippage, and price impact at each step. Step 6 of the worked example is the whole strategy at narrow widths.
- **Assumes the fee share is stable.** Your earnings depend on your share of *active* liquidity at the traded price. Other providers can and do crowd into the same tight band around the price, silently diluting the rate the position was opened for.
- **Ignores the tick grid.** Real implementations quantise ranges to discrete ticks, so the requested range and the achieved range differ, especially for very tight bands.
- **Assumes the price series is diffusive.** A gap straight through the range is the worst case: the position converts fully to the losing asset with almost no fee collected on the way, because the arbitrage crossed it in a single transaction.
- **Backtesting this is unusually treacherous.** Range width, rebalance trigger, rebalance cost, and holding period are four free parameters evaluated on short history in one or two volatility regimes. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

> warning **A high in-range APR is not a return** It is a rate that applies for as long as the position remains active, on a position that is designed to become inactive. The realised return is that rate times time-in-range, minus the cost of every re-entry, minus the divergence crystallised at each one.

---

#### Code

```python
import numpy as np


def concentrated_reserves(liquidity, price, lower, upper):
    """Token reserves of an in-range position. Returns (risky, numeraire)."""
    x = liquidity * (1.0 / np.sqrt(price) - 1.0 / np.sqrt(upper))
    y = liquidity * (np.sqrt(price) - np.sqrt(lower))
    return x, y


def capital_efficiency(price, lower, upper):
    """Multiplier versus a full-range position with the same liquidity.

    Scales fee income and LVR identically, so it is leverage on the
    underlying business rather than an improvement to it.
    """
    deployed = 2 * np.sqrt(price) - price / np.sqrt(upper) - np.sqrt(lower)
    return 2 * np.sqrt(price) / deployed


def expected_days_in_range(range_multiple, volatility):
    """Time to first exit a geometric range, driftless log random walk.

    Drift shortens this, always through the boundary that leaves you
    holding the asset that moved against you.
    """
    return (np.log(range_multiple) ** 2 / volatility**2) * 365.0


def range_economics(range_multiple, volatility, full_range_fee_apr,
                    rebalance_cost=0.0015):
    """Net annualised rate for a geometric range, on an in-range basis.

    Returns (multiplier, gross_edge, rebalance_drag, net). Note that
    gross_edge is just the full-range edge times the multiplier.
    """
    eff = 1.0 / (1.0 - range_multiple**-0.5)
    gross = (full_range_fee_apr - volatility**2 / 8.0) * eff
    drag = (365.0 / expected_days_in_range(range_multiple, volatility)
            ) * rebalance_cost
    return eff, gross, drag, gross - drag
```

---

#### See Also

* [Concentrated Liquidity](/protocols/concentrated-liquidity)
* [Uniswap v3 LP](/case-studies/uniswap-v3-lp)
* [LP as a Business](/strategies/lp-business)
* [Delta-Hedged LP Strategies](/strategies/delta-hedged-lp)
* [Impermanent Loss](/building-blocks/impermanent-loss)
* [Implied Volatility](/derivatives/implied-volatility)
* [LP Returns Simulation](/simulation/lp-returns)

---

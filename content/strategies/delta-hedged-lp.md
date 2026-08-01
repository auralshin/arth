### Delta-Hedged LP Strategies

> info **Metadata** Level: Advanced | Prerequisites: Greeks, Delta Hedging, AMMs, Impermanent Loss | Tags: delta-hedging, gamma, lvr, amm, options, realised-volatility, defi

An automated market maker position has a price exposure that changes as the price changes. As the risky asset rises the pool sells it, so the position becomes less long; as it falls the pool buys, so the position becomes more long. That is the definition of negative gamma, and it means a liquidity provider is running an options book whether or not they think of it that way.

Once the position is recognised as an options position, the strategy writes itself: hedge the delta, and what remains is a pure bet on volatility. A delta-hedged liquidity position is economically **short a straddle** — it collects a steady income stream (fees, the analogue of theta) and pays out in proportion to how much the price actually moves (the gamma cost). It makes money when realised volatility comes in below a level the pool's fee rate implies, and loses when it does not. This page derives that level. For the general theory of the sensitivities see [Greeks](/derivatives/greeks), and for the hedging argument itself see [Delta Hedging](/derivatives/delta-hedging).

> warning **Not Financial Advice** This page explains the option-like structure of a liquidity position and how a hedged version behaves. It is not a recommendation to run any of it.

---

#### Why It Might Work: The Economic Rationale

An unhedged liquidity position mixes two unrelated bets: a directional view on the pair, and a market-making business. Most of the position's variance comes from the first, and none of the expected return does. Hedging separates them.

**The remaining bet is well-defined and comparable.** Once delta is removed, the position's profit and loss depends on fee income against realised variance. That is a quantity with an external market price — the implied volatility of listed options on the same asset. A liquidity pool and an options market are then two venues quoting the same thing, and a relative-value comparison becomes possible. See [Implied Volatility](/derivatives/implied-volatility).

**Volatility risk premia are a documented phenomenon in other asset classes.** Sellers of options are, on average and over long samples, compensated for bearing the risk of large moves. If the same premium exists on-chain, a delta-hedged liquidity provider harvests it in a form that requires no options market to exist. And unlike a straddle seller, the provider is also paid for a *service*: part of the fee is payment for providing executable depth to uninformed flow, a component with no options analogue, which is why the trade can be attractive even when the implied-versus-realised comparison is neutral. See [LP as a Business](/strategies/lp-business).

**What would have to be true.** Realised volatility over the holding period must come in below the level implied by the fee rate, *and* the hedge must be maintainable at a cost below the difference. The second condition is where the strategy usually fails, and it is the subject of [Hedging LP Positions with Perps](/strategies/hedging-lp).

---

#### Formal Definition

For a constant-product pool, the position value in the numeraire is `V(P) = 2 * sqrt(k * P)`. Differentiating gives the sensitivities directly:

```text
V(P)   = 2 * sqrt(k * P)

Delta  = dV/dP   = sqrt(k / P)  =  x(P)

Gamma  = d2V/dP2 = -(1/2) * sqrt(k) * P^(-3/2)  =  -x(P) / (2 * P)
```

where:

- `x(P)` is the pool's reserve of the risky asset at price `P`
- `k` is the constant-product invariant

Two facts fall out immediately.

**The delta is the reserve.** A liquidity position's exposure in units of the risky asset is exactly the number of tokens the pool holds on your behalf. There is no model risk in the hedge ratio — it is an observable balance.

**The gamma is negative and the cash gamma is constant.** Multiplying by `P^2` gives `P^2 * Gamma = -(1/2) * sqrt(k) * sqrt(P) = -V / 4`. The position is short a quarter of its value in cash gamma at *every* price. This is why the exposure never "runs out": a liquidity position is short gamma uniformly across the whole price range, unlike a single option whose gamma peaks near the strike.

**The hedged profit and loss.** For any position with gamma, the profit and loss over a short interval after removing delta is the standard result from [Delta Hedging](/derivatives/delta-hedging). With `Gamma` negative the second term is a loss, and taking expectations with `E[(dP)^2] = sigma^2 * P^2 * dt`:

```text
dPnL          = fee_income + (1/2) * Gamma * (dP)^2

E[gamma cost] = (1/2) * (V / 4) * sigma^2 * dt = (sigma^2 / 8) * V * dt
```

This is exactly the loss-versus-rebalancing rate from [LP as a Business](/strategies/lp-business). **LVR and the gamma cost of a delta-hedged liquidity position are the same quantity derived two ways** — one from a market-making argument about stale quotes, one from an options argument about convexity.

**The pool's implied volatility.** Setting fee income equal to the gamma cost defines a breakeven volatility:

```text
f * V = (sigma^2 / 8) * V

sigma_breakeven = sqrt(8 * f)
```

where `f` is the fee income as an annualised fraction of position value. This is the number the whole strategy turns on, and it is directly comparable to an option's implied volatility.

<table>
  <tbody>
    <tr><td><strong>Fee APR</strong></td><td><strong>Breakeven volatility</strong></td></tr>
    <tr><td>2%</td><td>40.0%</td></tr>
    <tr><td>5%</td><td>63.2%</td></tr>
    <tr><td>10%</td><td>89.4%</td></tr>
    <tr><td>18%</td><td>120.0%</td></tr>
    <tr><td>45%</td><td>189.7%</td></tr>
  </tbody>
</table>

---

#### Worked Example: The Gamma Bleed on a Round Trip

Discrete hedging on a price path that ends where it started. All numbers are illustrative arithmetic.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Initial price <code>P0</code></td><td>2,000</td></tr>
    <tr><td>Pool reserves</td><td>50 risky, 100,000 numeraire</td></tr>
    <tr><td>Invariant <code>k</code></td><td>5,000,000</td></tr>
    <tr><td>Position value <code>V</code></td><td>200,000</td></tr>
    <tr><td>Initial hedge</td><td>short 50 units of perpetual</td></tr>
    <tr><td>Price path</td><td>2,000 to 2,200 to 2,000</td></tr>
  </tbody>
</table>

**Leg 1: price rises to 2,200.**

1. **New position value**: `2 * sqrt(5,000,000 * 2,200) = 209,761.77`, a gain of `9,761.77`
2. **Hedge loss**: `50 * (2,200 - 2,000) = 10,000.00`
3. **Combined**: `9,761.77 - 10,000.00 = -238.23`
4. **New delta**: `sqrt(5,000,000 / 2,200) = 47.6731`, so buy back `2.3269` units to rehedge

Note that step 3 equals the impermanent loss exactly: holding the original basket would be worth `50 * 2,200 + 100,000 = 210,000`, and `209,761.77 - 210,000 = -238.23`. A *static* hedge held across the whole move loses precisely the impermanent loss and nothing more.

**Leg 2: price falls back to 2,000, hedge now 47.6731 short.**

5. **Position value returns to** `200,000`, a loss of `9,761.77`
6. **Hedge gain**: `47.6731 * (2,200 - 2,000) = 9,534.63`
7. **Combined**: `-9,761.77 + 9,534.63 = -227.14`

**Total round trip**: `-238.23 - 227.14 = -465.37`, or **0.233% of the position**, before any fees.

The price ended exactly where it began. Impermanent loss is zero. The rebalanced hedge nevertheless lost 465.37, and that loss is real, realised, and paid in cash. This is the clearest possible demonstration that **impermanent loss understates what a liquidity position costs**: it measures only the endpoints, while the position bleeds along the path.

Cross-check against the formula. With `dlnP = ln(1.10) = 0.09531` on each leg, the predicted gamma cost is `(V/8) * (dlnP)^2` per leg: `200,000/8 * 0.009084 = 227.10` and `209,762/8 * 0.009084 = 238.15`, summing to `465.25` against the exact `465.37`. The continuous-time approximation is accurate to within 0.03% over moves of this size.

**Now add fees.** Suppose this position earns an 18% fee APR. Its breakeven volatility is `sqrt(8 * 0.18) = 120%`. If realised volatility over the holding period is 85%:

8. **Gamma cost**: `0.85^2 / 8 = 9.03%` per year, or `18,062` on 200,000
9. **Fee income**: `18%` per year, or `36,000`
10. **Net, delta-hedged**: `36,000 - 18,062 = 17,938`, an **8.97%** annualised rate on the position

That 8.97% is the answer to a well-posed question — was the pool's implied volatility above realised? — and it is gross of every hedging cost, which is where it goes to die.

---

#### Reading the Position as an Options Book

The mapping is exact enough to be worth stating as a table, because it makes the whole risk profile familiar to anyone who has traded volatility.

<table>
  <tbody>
    <tr><td><strong>Liquidity position</strong></td><td><strong>Options equivalent</strong></td></tr>
    <tr><td>Fee income</td><td>Theta collected by an option seller</td></tr>
    <tr><td>Loss-versus-rebalancing</td><td>Gamma cost of a short position</td></tr>
    <tr><td>Impermanent loss</td><td>Payoff at a single point, not the path cost</td></tr>
    <tr><td>Fee APR</td><td>Implied volatility, via square root of eight times the rate</td></tr>
    <tr><td>Pool reserve of the risky asset</td><td>Position delta</td></tr>
    <tr><td>Price exiting a concentrated range</td><td>Option finishing deep in or out of the money</td></tr>
  </tbody>
</table>

The payoff shape of a full-range constant-product position is a square root in price, which is concave everywhere and therefore short convexity at every price — closer to a short position in a continuum of options across all strikes than to any single contract. A concentrated position truncates that continuum to the chosen range, which is why its behaviour at the boundaries resembles an option expiring. See [Concentrated Liquidity LP](/strategies/concentrated-lp) and [Variance Swaps](/derivatives/variance-swaps) for the instrument that prices realised variance directly.

> info **The comparison that makes this a trade** If listed options on the same asset imply 70% volatility and the pool's fee rate implies 120%, the pool is selling volatility dearer than the options market. That is a relative-value observation with two tradable legs, and it is a genuinely different question from "is this pool's APR high".

---

#### Assumptions and Failure Modes

- **Assumes the delta can actually be hedged.** The hedge requires a liquid instrument on the same asset, margin in a separate account, and the operational capacity to rebalance. All three are constraints, and the second is a capital cost the 8.97% above does not include. See [Hedging LP Positions with Perps](/strategies/hedging-lp).
- **Hedging more often does not reduce the expected gamma cost.** This is the most common misconception. The expected loss per interval is `(1/2) * Gamma * E[(dP)^2]`, which is the same whether you rebalance hourly or daily. Frequent rebalancing reduces the *variance* of the hedging error around that expectation; it does not reduce the expectation. What it does increase is transaction cost.
- **Assumes a diffusive price.** The gamma cost formula prices continuous movement. A jump delivers a loss proportional to the *square* of the gap with no opportunity to rehedge inside it, and short-gamma positions are precisely the ones for which the difference between a diffusion and a jump is catastrophic. See [Jumps](/quant-math/jumps).
- **Assumes fee income is stable, and it is correlated with the cost.** Fee APR is measured backwards from realised volume, so the "implied volatility" derived from it is a trailing estimate rather than a quoted price. Worse, volatile periods generate both more volume and more variance, so the revenue and the gamma cost move together — which dampens the strategy's variance relative to a short straddle but means the two legs are never as cleanly separated as the arithmetic implies.
- **Assumes the hedge instrument tracks the pool price.** A perpetual marks against its own index, which is not the pool's price. That residual is basis risk and it does not disappear at any rebalance frequency.
- **The short-gamma loss profile is the point, not a bug.** Steady small gains and occasional large losses is the signature of every volatility-selling strategy. Performance statistics computed over a calm sample say nothing about the loss that defines the strategy. See [Sharpe Ratio](/quant-math/sharpe).
- **Assumes the two legs settle.** Pool value and hedge value sit on different systems. Being right about volatility and unable to move collateral between venues is the standard operational failure.

---

#### Code

```python
import numpy as np


def lp_greeks(k, price):
    """Value, delta and gamma of a full-range constant-product position.

    Delta is the pool's risky-asset reserve, so the hedge ratio is an
    observable balance rather than a model output.
    """
    value = 2.0 * np.sqrt(k * price)
    delta = np.sqrt(k / price)
    gamma = -0.5 * np.sqrt(k) * price**-1.5
    return value, delta, gamma


def pool_implied_vol(fee_apr):
    """Volatility at which fee income exactly offsets the gamma cost.

    Directly comparable to an option's implied volatility on the same
    asset, which is what turns an LP position into a relative-value trade.
    """
    return np.sqrt(8.0 * fee_apr)


def hedged_lp_rate(fee_apr, realised_vol):
    """Annualised rate of a delta-hedged position, before hedging costs.

    Positive when realised volatility undershoots the pool's implied.
    """
    return fee_apr - realised_vol**2 / 8.0


def simulate_hedged_path(k, prices, fee_rate_annual, dt):
    """Discretely delta-hedged profit and loss along a price path.

    Rehedges to the pool's exact reserve each step, which is the best
    case: it isolates gamma bleed from execution error.
    """
    value = lambda p: 2.0 * np.sqrt(k * p)
    pnl = 0.0
    for prev, now in zip(prices[:-1], prices[1:]):
        pnl += value(now) - value(prev)                 # position
        pnl -= np.sqrt(k / prev) * (now - prev)         # hedge over the step
        pnl += fee_rate_annual * value(prev) * dt       # fee accrual
    return pnl
```

---

#### See Also

* [Greeks](/derivatives/greeks)
* [Delta Hedging](/derivatives/delta-hedging)
* [Hedging LP Positions with Perps](/strategies/hedging-lp)
* [LP as a Business](/strategies/lp-business)
* [Concentrated Liquidity LP](/strategies/concentrated-lp)
* [Implied Volatility](/derivatives/implied-volatility)
* [Variance Swaps](/derivatives/variance-swaps)

---

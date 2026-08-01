### Market Impact

> info **Metadata** Level: Advanced | Prerequisites: Execution Overview, Volatility, Slippage | Tags: execution, market-impact, square-root-law, capacity, liquidity

Market impact is the price move caused by your own trading. It is the reason capacity is finite: doubling your size does not double your cost, it more than doubles it, and at some point the marginal cost of the last share exceeds the marginal edge on it. Every discussion of how much capital a strategy can carry is, underneath, a discussion about impact.

The distinction that organises the whole subject is **temporary versus permanent**. Temporary impact is the concession you pay for demanding immediacy; it decays once you stop trading. Permanent impact is the market's revision of its own valuation in response to your flow, on the assumption that flow carries information. Only permanent impact is a genuine transfer of wealth to the rest of the market; temporary impact is a rent paid to liquidity providers, and it is the part a good execution schedule can reduce.

---

#### Formal Definition

Decompose the price during and after a parent order:

```text
S(t)  = S_0 + permanent(t) + temporary(t) + noise(t)

permanent(t)  = g(v) accumulated, persists after trading ends
temporary(t)  = h(v), decays to ~0 once trading stops
```

where:

- `S_0` is the price before trading began
- `v` is the trading rate (shares per unit time)
- `g(v)` is the permanent impact function, usually modelled as linear: `g(v) = gamma * v`
- `h(v)` is the temporary impact function, modelled as linear or concave in `v`
- `noise(t)` is exogenous price movement unrelated to your order

The most widely used empirical description of total impact for a completed order is the **square-root law**:

```text
impact = Y * sigma * sqrt(Q / V)
```

where:

- `Q` is the order size in shares
- `V` is a reference volume, conventionally average daily volume (ADV)
- `Q / V` is the **participation** of the order relative to that reference
- `sigma` is the volatility of the instrument over the reference period (daily volatility for daily ADV)
- `Y` is a dimensionless constant

> warning **`Y` is fitted, not universal** The constant is estimated from a broker's or fund's own execution data. Published estimates cluster loosely around order-unity but vary substantially with the asset class, the sample period, the definition of `V`, and how the pre-trade reference price is chosen. Treat any single number for `Y` as a property of one dataset, not a law of nature. The same caution applies to the exponent: one-half is a convenient and widely used approximation, and fitted exponents differ across studies.

The structural content of the law is not the constant but the **concavity**: impact scales sub-linearly in size and linearly in volatility. That means the cost per share rises with size, but more slowly than size itself.

---

#### Worked Example

A stock trades at 40.00 with the following inputs. `Y = 1.0` is illustrative only, for the reasons above.

<table>
  <tbody>
    <tr><td><strong>Order <code>Q</code></strong></td><td><strong>ADV <code>V</code></strong></td><td><strong>Daily vol <code>sigma</code></strong></td><td><strong>Price</strong></td><td><strong><code>Y</code></strong></td></tr>
    <tr><td>400,000 shares</td><td>10,000,000 shares</td><td>2.0%</td><td>40.00</td><td>1.0</td></tr>
  </tbody>
</table>

1. **Participation**: `Q / V = 400,000 / 10,000,000 = 0.04`, and `sqrt(0.04) = 0.20`
2. **Impact**: `1.0 * 0.02 * 0.20 = 0.004 = 40 bps`
3. **Cash cost**: notional is `400,000 * 40.00 = 16,000,000`, so `16,000,000 * 0.004 = 64,000`

Now double the order to 800,000 shares:

1. `Q / V = 0.08`, and `sqrt(0.08) = 0.2828`, so **impact** is `0.02 * 0.2828 = 0.005657 = 56.6 bps`
2. **Cash cost**: notional `32,000,000`, so `32,000,000 * 0.005657 = 181,020`

Doubling the size raised the cost per share by `sqrt(2) = 1.414`, and the total cash cost by `2 * 1.414 = 2.83` times. That factor of 2.83 is the whole capacity argument in one number: the second half of the order costs 1.83 times what the first half did.

**Splitting temporary from permanent.** Suppose during execution the price rises from 40.00 to a peak of 40.20, and thirty minutes after you stop it settles at 40.08.

- Peak displacement: `(40.20 - 40.00) / 40.00 = 50 bps`, of which
- Permanent component: `(40.08 - 40.00) / 40.00 = 20 bps`, and temporary component: `(40.20 - 40.08) / 40.00 = 30 bps`

Trading more slowly would have reduced the 30 bps and left the 20 bps roughly unchanged — which is precisely the lever [Almgren–Chriss](/execution/almgren-chriss) optimises.

---

#### Why Concavity, and What It Implies

Several mechanisms produce sub-linear scaling, and they are not mutually exclusive. Resting liquidity is replenished continuously, so a slow order meets fresh depth rather than exhausting a static book. Liquidity providers who observe a persistent buyer widen only gradually, since they cannot immediately distinguish informed from uninformed flow. And the market's inference about the information content of an order does not scale one-for-one with its size.

Three practical consequences follow. **Cost per share is not a constant** — quoting "we pay 8 bps" is meaningful only alongside the size and participation rate that produced it.

**Capacity has a closed-ish form.** If gross edge per unit is roughly constant and impact grows as `sqrt(Q)`, then net profit `Q * (edge - k*sqrt(Q))` is maximised at a finite `Q`. Beyond that point, adding size destroys money even though gross edge is still positive.

**Halving the order more than halves the cost.** Total cash cost is size times impact, so a single order of `Q` costs `k * Q^1.5`. Two orders of `Q/2` executed far enough apart in time to avoid overlapping impact cost `2 * (Q/2) * k * sqrt(Q/2) = k * Q^1.5 / sqrt(2)` in total — about 71% of the single-shot cost. The catch is "far enough apart": if the children are close in time, the market treats them as one parent and the saving disappears.

---

#### In Practice Across Asset Classes

**Equities.** The canonical setting for the square-root law and the one with the richest calibration data. `V` is normally an ADV estimate over 20 to 60 days, and index membership, listing venue, and time of day all shift the effective depth.

**Futures.** Impact is concentrated in a single book, so participation is measured cleanly against contract volume. The front month absorbs size far better than deferred months, and impact spikes around the roll window and around scheduled macro releases. **FX.** No consolidated volume figure exists, so `Q / V` has no agreed denominator; practitioners substitute a dealer's own observed flow or a venue's volume, which makes cross-desk comparisons unreliable. Impact also manifests as widening quotes rather than as a walked book.

**Fixed income.** Impact appears mostly as spread deterioration in request-for-quote: asking five dealers for a price in size *is* the impact event, because the information leaks before any trade occurs. For off-the-run issues a single order can be a large multiple of a typical day's volume, far outside the range where a square-root fit is meaningful. **On-chain.** Impact for an automated market maker swap is not statistical at all — it is a deterministic function of the bonding curve and the pool reserves, computable exactly before the trade. That makes on-chain impact the one case where the counterfactual price is knowable. The statistical part reappears in the *inter-block* dynamics: arbitrageurs restore the pool price toward the wider market between blocks, and searchers can sandwich a large swap. See [Slippage](/microstructure/slippage), [AMMs 101](/building-blocks/amms-101), and [MEV Overview](/building-blocks/mev-overview).

---

#### Assumptions and Failure Modes

- **ADV is a stable denominator.** It is not. Volume clusters around earnings, index rebalances, and expiries, and a 30-day average badly misestimates depth on any of those days.
- **The order is the only large order.** If several participants are trading the same direction on the same signal — a crowded factor unwind, an index reconstitution — realised impact far exceeds any single-order model. This is the mechanism behind most execution disasters.
- **Impact decays.** Temporary impact is assumed to relax over minutes to hours. In a stressed market depth does not return on that timescale, and the "temporary" component becomes indistinguishable from permanent.
- **Volatility is known and the parent order is anonymous.** `sigma` is an estimate, and it is least reliable exactly when it is largest. Predictable schedules leak, so if your pattern is detectable others trade ahead and realised impact exceeds the model — see [Adverse Selection](/execution/adverse-selection) and [TWAP & VWAP](/execution/twap-vwap).
- **Impact is separable from alpha.** It usually is not. If you buy because the price is about to rise, the subsequent rise is attributed to your impact when much of it was going to happen anyway. Disentangling the two requires either randomised execution or a very careful control group, and most published impact estimates are contaminated by this.

> warning **Fitting impact on your own fills is circular** Your execution algorithm chose when and how fast to trade based on conditions. Regressing realised cost on participation then mixes the impact function with the algorithm's decision rule. Randomising a fraction of orders is the only clean identification, and few desks are willing to pay for it.

---

#### Code

```python
import numpy as np


def square_root_impact_bps(order_qty, adv, daily_vol, y=1.0):
    """Total impact in basis points under the square-root law.

    `y` must be calibrated on your own executions; there is no universal value.
    daily_vol is a decimal (0.02 for 2%) over the same period as adv.
    """
    participation = order_qty / adv
    return y * daily_vol * np.sqrt(participation) * 1e4


square_root_impact_bps(400_000, 10_000_000, 0.02)   # 40.0
square_root_impact_bps(800_000, 10_000_000, 0.02)   # 56.57


def optimal_size(edge_bps, adv, daily_vol, y=1.0):
    """Size maximising net profit when gross edge per share is constant.

    Net = Q*edge - Q*k*sqrt(Q/V) with k = y*sigma. Maximised where
    marginal cost equals marginal edge, i.e. (3/2)*k*sqrt(Q/V) = edge.
    """
    k_bps = y * daily_vol * 1e4
    return adv * (2.0 * edge_bps / (3.0 * k_bps)) ** 2


# A 20 bps gross edge in this name is exhausted well before 1% of ADV.
optimal_size(20.0, 10_000_000, 0.02)   # ~44,400 shares
```

---

#### See Also

* [Almgren–Chriss](/execution/almgren-chriss)
* [Execution Overview](/execution/execution-overview)
* [Adverse Selection](/execution/adverse-selection)
* [Implementation Shortfall](/execution/implementation-shortfall)
* [Slippage](/microstructure/slippage)
* [Volatility](/quant-math/volatility)

---

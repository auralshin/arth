### Impermanent Loss

> info **Metadata** Level: Intermediate | Prerequisites: AMMs 101, Liquidity Pools, Volatility | Tags: impermanent-loss, amm, liquidity-provision, lvr, gamma, defi

**Impermanent loss** is the shortfall between a liquidity position's value and the value of simply holding the tokens that were deposited into it. It arises because an automated market maker rebalances mechanically along its curve: as the price of one asset rises, the pool sells that asset; as it falls, the pool buys more. The pool is a systematic seller of whatever is going up and a systematic buyer of whatever is going down, and it does this without any view on whether that is a good idea.

For a constant-product pool the shortfall has a closed form that depends on nothing except the ratio of the ending price to the starting price. That is unusual and worth exploiting: the entire market-risk cost of the position collapses to one number, so the liquidity provision decision reduces to whether the fees earned along the path exceed a quantity you can compute in one line. The name is the misleading part — nothing about the loss is temporary — and the last third of this page is about what it actually is.

---

#### Formal Definition

A constant-product pool holds `x` units of a risky asset and `y` units of a numeraire, subject to `x * y = k`. Its marginal price is `P = y / x`. Assuming arbitrage keeps the pool price equal to the external market price, the reserves at any price are pinned:

```text
x(P) = sqrt(k / P)
y(P) = sqrt(k * P)
V_pool(P) = x(P) * P + y(P) = 2 * sqrt(k * P)
```

Note that `x(P) * P = y(P)` at every price: a constant-product position is always exactly half its value in each asset, whatever the price has done.

Deposit at price `P_0`, so the initial holding is `x_0 = sqrt(k / P_0)` and `y_0 = sqrt(k * P_0)`. The benchmark is holding those same tokens, whose value is linear in price:

```text
V_hold(P) = x_0 * P + y_0
```

Write `p = P / P_0` for the price ratio. Substituting `k * P_0 = y_0^2` into both expressions gives `V_pool = 2 * y_0 * sqrt(p)` and `V_hold = y_0 * (1 + p)`, so:

```text
IL(p) = V_pool / V_hold - 1 = 2 * sqrt(p) / (1 + p) - 1
```

where:

- `p` is the ending price divided by the starting price
- `IL(p)` is the fractional shortfall against holding, always at or below zero

Three properties fall out immediately.

- **It is never positive.** By the inequality between arithmetic and geometric means, `2 * sqrt(p)` is at most `1 + p`, with equality only at `p = 1`.
- **It is symmetric in log price.** `IL(p) = IL(1/p)`, so a doubling and a halving cost exactly the same 5.719%.
- **It has an exact hyperbolic form.** Writing `u = ln(p)`, the ratio is `1 / cosh(u / 2)`, so `IL = sech(u / 2) - 1`, whose second-order expansion is `IL ~= -u^2 / 8`. That `/8` is the same `/8` that appears in loss-versus-rebalancing, and for the same reason: it is the curvature of a square root.

---

#### Worked Example

An illustrative position. None of these figures is measured from a live pool.

<table>
  <tbody>
    <tr><td><strong>Item</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Deposit price</td><td>3,000</td></tr>
    <tr><td>Deposited</td><td>10 base and 30,000 numeraire</td></tr>
    <tr><td>Position value at deposit</td><td>60,000</td></tr>
    <tr><td>Invariant k</td><td>300,000</td></tr>
    <tr><td>Ending price</td><td>4,500, so p equals 1.5</td></tr>
  </tbody>
</table>

1. **Reserves at 4,500**: `x = sqrt(300,000 / 4,500) = 8.164966` base, `y = sqrt(300,000 * 4,500) = 36,742.35`
2. **Position value**: `8.164966 * 4,500 + 36,742.35 = 73,484.69`
3. **Hold value**: `10 * 4,500 + 30,000 = 75,000.00`
4. **Impermanent loss**: `73,484.69 / 75,000.00 - 1 = -2.0204%`, matching `2 * sqrt(1.5) / 2.5 - 1`
5. **Shortfall in currency**: `75,000.00 - 73,484.69 = 1,515.31`
6. **Fee volume needed to offset it**: at a 30 bps fee, `1,515.31 / 0.0030 = 505,103` of volume must pass through this position

Now read the same event as inventory. The pool sold `10 - 8.164966 = 1.835034` base and received `36,742.35 - 30,000 = 6,742.35` for it, an average of **3,674.23** per unit against a closing price of 4,500. That average is exactly `sqrt(3,000 * 4,500)`, and the identity is general:

```text
average rebalancing price = sqrt(P_start * P_end)
```

A constant-product pool always executes its rebalancing at the geometric mean of the endpoints. Impermanent loss is nothing more than the arithmetic consequence of selling into a rise, and buying into a fall, at that price rather than at the final one.

---

#### The Shape of the Loss

<table>
  <tbody>
    <tr><td><strong>Price ratio p</strong></td><td><strong>Exact IL</strong></td><td><strong>Approximation minus u squared over 8</strong></td></tr>
    <tr><td>0.10 or 10.0</td><td>-42.504%</td><td>-66.274%</td></tr>
    <tr><td>0.25 or 4.00</td><td>-20.000%</td><td>-24.023%</td></tr>
    <tr><td>0.50 or 2.00</td><td>-5.719%</td><td>-6.006%</td></tr>
    <tr><td>0.75 or 1.33</td><td>-1.026%</td><td>-1.034%</td></tr>
    <tr><td>0.90 or 1.11</td><td>-0.139%</td><td>-0.139%</td></tr>
    <tr><td>1.00</td><td>0.000%</td><td>0.000%</td></tr>
  </tbody>
</table>

The quadratic approximation is excellent for moves inside about 25% and degrades badly beyond a factor of two: a good tool for expectations, a bad one for stress scenarios.

There is a one-line reason the loss is never positive, and it explains more than the algebra does. `V_pool(P) = 2 * sqrt(k * P)` is strictly concave in `P`. Its derivative is `sqrt(k / P)`, which is exactly `x(P)` — the pool's base-asset balance. At the deposit price that derivative equals `x_0`, which is precisely the slope of the hold portfolio, and the two portfolios have equal value there. So **the hold benchmark is the tangent line to the pool's value curve at the deposit price**, and a concave function lies at or below every one of its tangents. Impermanent loss is Jensen's inequality with a specific curve attached. That framing also fixes the bounds: as `p` goes to zero or to infinity the ratio goes to zero, so the loss approaches -100% at both extremes, and no price movement ever helps relative to holding.

> info **Weighted pools follow the same pattern** For a constant-weight pool with weight `w` on the risky asset, the ratio is `p^w / (w * p + 1 - w)`. Setting `w = 0.5` recovers the formula above; at `p = 2`, a weight of 0.8 gives -3.272% instead of -5.719%. Less rebalancing, less shortfall, more directional exposure.

---

#### Why It Is Not "Impermanent"

The name encodes an assumption that nothing in the mechanism supports: that the price will come back. Three corrections.

**It is realised continuously, not at withdrawal.** The shortfall was not created by an accounting comparison. It was paid out one arbitrage at a time, every time someone corrected the pool's stale quote and kept the difference. By the time you withdraw, the money is long gone; withdrawal only records the fact.

**It is permanent to the extent the price move is.** The loss reverses if and only if the price reverses. Calling it impermanent is equivalent to asserting mean reversion in the pair, which is a directional view, not a property of the pool.

**The endpoint measure understates what was paid.** `IL(p)` depends only on the endpoints, so a price that leaves and returns shows zero. The arbitrageurs who moved the pool out and back were paid on both legs; the money left and the metric cannot see it. That gap is the subject of the next section. Better names exist — divergence loss, rebalancing shortfall — but the original stuck.

> warning **Withdrawing during a dislocation converts a mark into a settled outcome** The moment of maximum shortfall is the moment of maximum price divergence, which is also when the pressure to exit is greatest. See [Walkthrough: LP During Volatility](/case-studies/lp-volatility).

---

#### Loss-Versus-Rebalancing

**Loss-versus-rebalancing (LVR)** replaces the hold benchmark with a portfolio carrying the same exposure but rebalanced continuously at the external market price. Same market risk, no stale quote. For a constant-product pool with instantaneous volatility `sigma`, it accrues at:

```text
LVR rate = (sigma^2 / 8) * V     per unit time
```

The two measures are related but not interchangeable.

<table>
  <tbody>
    <tr><td><strong>Property</strong></td><td><strong>Impermanent loss</strong></td><td><strong>Loss-versus-rebalancing</strong></td></tr>
    <tr><td>Benchmark</td><td>Holding the deposited tokens</td><td>The same exposure, rebalanced at the external price</td></tr>
    <tr><td>Depends on</td><td>The endpoints only</td><td>The whole path</td></tr>
    <tr><td>A round trip in price</td><td>Zero</td><td>Strictly positive</td></tr>
    <tr><td>What it measures</td><td>What is visible at withdrawal</td><td>What was actually paid to arbitrageurs</td></tr>
  </tbody>
</table>

They coincide in expectation and not pathwise. Under a driftless diffusion, `E[u^2] ~= sigma^2 * T`, so the quadratic approximation gives `E[IL] ~= -sigma^2 * T / 8` — the same quantity as accumulated LVR over the same horizon. The pathwise difference is the profit and loss of the rebalancing strategy itself, which has zero expectation under a martingale price and is not zero on any particular path. At 60% annualised volatility over thirty days, expected impermanent loss is about -0.37%; annualised, LVR is 4.5% of pool value.

The practical upshot: use impermanent loss to price a scenario, and LVR to decide whether the pool is a business at all. The breakeven condition and its consequences are worked through in [LP as a Business](/strategies/lp-business).

---

#### Short Gamma: The Options View

Differentiate the pool's value function:

```text
dV/dP    = sqrt(k / P) = x(P)               the position's delta
d2V/dP2  = -0.5 * sqrt(k) * P^(-1.5)        strictly negative
         = -x(P) / (2 * P)
```

The delta is literally the base-asset balance, and it falls as the price rises — the definition of negative gamma. In the worked example at a price of 4,500, delta is 8.164966 base and gamma is -0.000907 base per unit of price.

So a liquidity position is a **short gamma** position with no expiry, whose payoff is concave and symmetric in log price, and which is paid a running premium in the form of fees. Its economics are those of a continuously written straddle. See [The Greeks](/derivatives/greeks) for what these derivatives mean generally.

Two consequences follow that surprise people.

- **Delta hedging removes the direction, not the cost.** Shorting `x(P)` units of the base asset flattens the linear term and leaves the curvature untouched, so a hedged position is a pure bet on realised volatility against the fee stream — a cleaner trade, not a safer one. See [Delta-Hedged LP](/strategies/delta-hedged-lp).
- **Concentration is leverage, not improvement.** It multiplies the effective reserves within a range, so fee income and impermanent loss scale by the *same* factor. Once the price leaves the range the position is entirely in one asset and becomes linear again — holding only the asset that fell, or having sold all of the one that rose. See [Concentrated Liquidity](/protocols/concentrated-liquidity).

---

#### Assumptions and Failure Modes

- **Assumes arbitrage pins the pool to the external price.** Fees create a no-arbitrage band inside which the pool is allowed to sit stale, so realised reserves differ slightly from `x(P)` and `y(P)`. The formula is an accurate approximation, not an identity.
- **Assumes the fee is excluded.** `IL(p)` is the market-risk leg only. The outcome of the position is fees plus impermanent loss, and reporting either alone is reporting one side of a two-sided trade.
- **Assumes constant product and two assets.** Stable-swap curves, weighted pools, and concentrated ranges each have their own formula. The concavity result is general; the constant is not.
- **Assumes a meaningful external price, and a constant pool share.** Where the pool *is* the price discovery venue there is no reference against which the quote is stale, so the benchmark is ill-defined rather than merely hard to measure; and providers entering during a high-volume episode dilute your fee income while leaving your impermanent loss unchanged.
- **Assumes the endpoint is what matters, and ignores jumps.** A round trip shows zero and cost real money; and a gap move delivers the full endpoint loss with none of the intervening fee income, which is the case a diffusion model prices least well.
- **Bounded at -100%, which is not protection.** Constant-product mechanics guarantee that you end up holding more of whichever asset failed. The bound exists because the position cannot be worth less than nothing, not because the curve defends you.
- **Ignores every non-market risk.** Contract failure, governance action, and oracle dependency are outside this model entirely and are not compensated by the fee.

---

#### Code

```python
import math


def impermanent_loss(price_ratio):
    """Fractional shortfall against holding, for a constant-product pool.

    Depends only on the endpoints, which is precisely why it understates
    what was paid to arbitrageurs along the path.
    """
    return 2.0 * math.sqrt(price_ratio) / (1.0 + price_ratio) - 1.0


def impermanent_loss_approx(price_ratio):
    """Second-order approximation. Good inside about 25%, poor beyond 2x."""
    return -math.log(price_ratio) ** 2 / 8.0


def weighted_pool_loss(price_ratio, risky_weight=0.5):
    """Constant-weight generalisation; risky_weight=0.5 is constant product."""
    w = risky_weight
    return price_ratio**w / (w * price_ratio + 1.0 - w) - 1.0


def rebalancing_price(price_start, price_end):
    """Average price at which the pool traded its inventory.

    Exactly the geometric mean of the endpoints, whatever the path.
    """
    return math.sqrt(price_start * price_end)


def breakeven_volume(position_value, price_ratio, fee_rate):
    """Volume through the position needed to offset the shortfall."""
    shortfall = -impermanent_loss(price_ratio) * position_value
    return shortfall / fee_rate
```

---

#### See Also

* [LP as a Business](/strategies/lp-business)
* [Walkthrough: LP During Volatility](/case-studies/lp-volatility)
* [The Greeks](/derivatives/greeks)
* [AMMs 101](/building-blocks/amms-101)
* [Concentrated Liquidity](/protocols/concentrated-liquidity)
* [Delta-Hedged LP](/strategies/delta-hedged-lp)
* [Simulating LP Returns](/simulation/lp-returns)

---

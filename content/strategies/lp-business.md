### LP as a Business: Fees vs Inventory Risk

> info **Metadata** Level: Intermediate | Prerequisites: AMMs, Impermanent Loss, Volatility | Tags: liquidity-provision, market-making, amm, lvr, adverse-selection, defi

Providing liquidity to an automated market maker is not a deposit and it is not yield. It is a market-making business. When you add tokens to a constant-product pool you are posting a two-sided quote that is live every second, at every size, to every counterparty, and you cannot cancel it, skew it, or pull it when you suspect the person hitting you knows something you do not. In exchange, you are paid a fee on every trade that crosses your quote.

That trade — continuous compensation for continuously carrying inventory you did not choose — is the entire subject. A traditional market maker earns the spread and manages inventory by adjusting quotes; an AMM liquidity provider earns a fixed fee and lets a deterministic curve manage inventory on their behalf. The curve is honest but it is not clever, and the gap between what a quote *should* be and what the curve *says* it is is the liquidity provider's cost of doing business. Everything below is an attempt to measure that cost against the fees.

> warning **Not Financial Advice** This page explains the economics and failure modes of liquidity provision. It is not a recommendation to provide liquidity to any pool or protocol.

---

#### Why It Might Work: The Economic Rationale

A market maker's profit and loss decomposes into two terms with permanently opposite signs: revenue from uninformed flow, and losses to informed flow. This is true on an equities exchange and it is true in an AMM. See [Adverse Selection](/execution/adverse-selection) for the general theory and [Market Making Lite](/strategies/mm-lite) for the quoting problem in its classical form.

**Who pays you.** Somebody who swaps because they want the other token — a user paying for something, a treasury rebalancing, a retail buyer, a protocol converting revenue — has no view on where the price will be in the next block. Their trade is as likely to be on the profitable side as the unprofitable one. On average their flow is a pure transfer of the fee to the liquidity provider. This is **uninformed flow**, and it is the only genuine revenue in the business.

**Who takes from you.** When the price moves on a deeper, faster venue, the AMM's quote is stale. An arbitrageur buys the underpriced side of the pool until the pool price matches the external price. That trade pays the fee like any other, but it is systematically on the side that hurts: the pool is left holding more of the asset that just fell and less of the asset that just rose. This is **adverse selection**, and in an AMM it is not occasional but structural, because a passive curve is by construction always the *last* quote to update.

**Why the compensation might still be adequate.** The AMM's offer is a real service. It provides guaranteed executable depth without a counterparty needing to find a maker, it operates without inventory management or infrastructure, and it accepts flow at hours and sizes a discretionary maker would refuse. Fee tiers price this explicitly: a wider fee is a wider spread, which both compensates more per trade and shrinks the set of arbitrages worth executing.

**What would have to be true.** For the business to have positive expected return, the fees collected from *all* flow must exceed the systematic losses to *arbitrage* flow. Losses scale with realised variance; revenue scales with volume. The condition is therefore a relationship between **volume and volatility** — not a property of the token, the protocol, or the advertised APR. A pool with high volume relative to its volatility is a good business. A pool with high volatility relative to its volume is a bad one at any headline yield.

---

#### Formal Definition

A constant-product pool holds reserves `x` of the risky asset and `y` of the numeraire, subject to:

```text
x * y = k
```

The marginal price is `P = y / x`, from which the reserves and the pool value at any price follow:

```text
x(P) = sqrt(k / P)
y(P) = sqrt(k * P)
V(P) = x(P) * P + y(P) = 2 * sqrt(k * P)
```

**Impermanent loss** compares the pool value to simply holding the initial basket. With `r` the price ratio `P_new / P_old`:

```text
IL(r) = 2 * sqrt(r) / (1 + r) - 1
```

This is always negative or zero and symmetric in `log(r)`: a doubling and a halving both cost 5.72%. See [Impermanent Loss](/building-blocks/impermanent-loss).

**Loss-versus-rebalancing (LVR)** is the sharper measure, because it isolates the cost of the stale quote rather than the cost of the price move. It compares the pool against a portfolio holding the same exposure but rebalanced continuously *at the external market price* — same market risk, no stale-quote problem. For a constant-product pool with instantaneous volatility `sigma`, the loss accrues at:

```text
LVR rate = (sigma^2 / 8) * V    per unit time
```

where:

- `sigma` is the annualised volatility of the pool's price
- `V` is the current pool value in the numeraire

The two measures answer different questions and neither replaces the other. Impermanent loss depends only on the endpoints, so a price that round-trips produces zero impermanent loss. LVR accumulates along the path, so the same round trip produces a strictly positive loss. **LVR is what the liquidity provider actually paid to arbitrageurs; impermanent loss is only what remains visible at the end.**

Fee revenue over the same period, with fee rate `f` and traded volume `Q`, is `f * Q`. Setting the two equal gives the **breakeven turnover** condition, the single most useful number in this business:

```text
Q / V  >=  sigma^2 / (8 * f)      per unit time
```

---

#### Worked Example: Is This Pool a Business?

An illustrative pool. Every number is chosen for the arithmetic and none is measured from a real venue.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Pool value <code>V</code></td><td>10,000,000</td></tr>
    <tr><td>Fee tier <code>f</code></td><td>0.30% (30 basis points)</td></tr>
    <tr><td>Annualised volatility <code>sigma</code></td><td>60%</td></tr>
    <tr><td>Observed daily volume <code>Q</code></td><td>600,000</td></tr>
    <tr><td>Of which arbitrage flow</td><td>250,000</td></tr>
  </tbody>
</table>

1. **Daily variance**: `0.60^2 / 365 = 0.000986`
2. **Daily LVR**: `0.000986 / 8 * 10,000,000 = 1,232.88`
3. **Breakeven daily volume**: `1,232.88 / 0.0030 = 410,959`
4. **Breakeven turnover**: `410,959 / 10,000,000 = 4.11%` of pool value per day
5. **Actual turnover**: `600,000 / 10,000,000 = 6.00%` per day — above breakeven, so this pool is a business
6. **Daily fees**: `600,000 * 0.0030 = 1,800.00`
7. **Daily net**: `1,800.00 - 1,232.88 = 567.12`
8. **Annualised**: fees are `1,800 * 365 / 10,000,000 = 6.57%` of pool value, LVR is `4.50%`, net is **2.07%**

The step-4 quantity generalises: breakeven turnover is `sigma^2 / (8 * f)` per day and depends on nothing else. At the same 30 basis point fee, a pool at 30% volatility needs about 1.03% daily turnover to break even; at 100% volatility it needs about 11.4%; at 150% it needs about 25.7%. **This is why stable-pair pools survive on thin fees and long-tail pools do not survive on fat ones.**

Now read step 8 honestly. A headline "6.6% fee APR" is a 2.1% business, and that 2.1% is before gas, before the opportunity cost of the capital, and before any protocol risk. The advertised number describes the revenue line of a firm whose largest cost never appears on the dashboard.

---

#### Decomposing the Flow

What matters operationally is not volume versus volatility but *whose* volume. In the example above, 250,000 of the 600,000 daily volume was arbitrage:

- **Arbitrage flow** paid `250,000 * 0.0030 = 750.00` in fees and imposed the full 1,232.88 of LVR. On its own it is a loss of 482.88 per day.
- **Uninformed flow** paid `350,000 * 0.0030 = 1,050.00` in fees and imposed no systematic loss. It is pure revenue.

The business is profitable only because the second bucket exceeds the deficit in the first. That reframes every operational decision. Chasing "volume" is meaningless; the question is whether a pool sits where real users transact or merely where prices need correcting.

> info **The fee is charged on the arbitrage too** A higher fee tier does not only earn more per trade — it widens the no-arbitrage band, so the price must move further before correcting the pool is worthwhile. That reduces both the frequency and the profitability of arbitrage, which makes the fee tier a genuine quoting decision rather than a revenue dial.

Two further levers exist and both are covered elsewhere. Concentrating liquidity into a price range multiplies fee income and LVR by the *same* factor, which is leverage on this business rather than an improvement to it — see [Concentrated Liquidity LP](/strategies/concentrated-lp). Hedging the pool's price exposure removes directional risk but not LVR, because LVR is a gamma cost rather than a delta cost — see [Delta-Hedged LP Strategies](/strategies/delta-hedged-lp).

---

#### In Practice Across Pool Types

**Stable pairs.** Two assets pegged to the same reference have very low `sigma`, so the LVR term nearly vanishes and almost all fee income is profit. Fee tiers are correspondingly thin. The risk is not volatility but *regime*: the whole calculation assumes the peg holds, and a depeg converts a low-variance business into a one-sided inventory problem in a single block.

**Correlated pairs.** A liquid staking token against its underlying, or two wrapped forms of the same asset, behave like stable pairs with a slow drift. That drift is not noise and does not round-trip, so it accrues as a persistent one-directional inventory loss that a pure variance model understates.

**Blue-chip volatile pairs.** The competitive core of the business and the case the arithmetic above describes. Volume and volatility are both high, margins are thin, and the outcome depends on execution details — fee tier, range, rebalancing — far more than on pool selection.

**Long-tail pairs.** Headline APRs are highest here and the underlying business is usually worst. Volatility is extreme, so breakeven turnover is enormous, and much of the observed volume is one-directional flow from holders exiting rather than two-sided user activity. A high advertised yield in this category is generally a measure of risk, not of revenue.

**Versus a traditional market maker.** A quoting firm on a central limit order book can widen, skew, or withdraw when it detects toxicity, and can hold inventory targets independent of price. See [Order Books vs AMMs](/microstructure/orderbooks-vs-amms). The AMM liquidity provider has none of these controls, which is exactly why its inventory risk is analytically tractable — and why the compensation must be structurally higher per unit of variance to be worth taking.

---

#### Assumptions and Failure Modes

- **Assumes volume is exogenous to your capital.** Adding liquidity does not create trades; it splits the same fee pool across more capital. Yield quoted at current total value locked falls mechanically as capital arrives, so the advertised figure is a snapshot of a quantity you are about to change.
- **Assumes the LVR formula's conditions hold.** The `sigma^2 / 8` result assumes a diffusive price with no jumps and continuous arbitrage. Gaps, thin blocks, and slow finality all break it, and they break it asymmetrically: a jump is one large adverse fill rather than many small ones.
- **Assumes realised volatility, not implied.** The cost is driven by what volatility actually does over the holding period, which is unknown at entry. A pool selected on trailing volatility is priced on stale information. See [Volatility](/quant-math/volatility).
- **Assumes flow composition is stable.** The uninformed share is the profit source, and it is neither observable in the raw volume series nor constant. A pool can be a good business for months and become a pure arbitrage venue the moment its users route elsewhere.
- **Assumes fees are actually retained.** Protocol fee switches, gauge mechanics, and referral splits can divert part of the fee. The rate you model must be the rate that reaches your position.
- **Assumes the pool is not being routed around.** Aggregators and solvers send flow where execution is best. A small share of a large pool receives a small share of the flow; the wrong venue receives only the arbitrage. See [MEV Overview](/building-blocks/mev-overview).
- **Ignores gas and operational cost.** Entering, exiting, claiming fees, and rebalancing all cost money. On small positions these dominate everything computed above.
- **Ignores protocol risk entirely.** The model prices market risk only. Contract failure, governance action, and oracle dependency are separate hazards that a fee-versus-LVR calculation cannot see and does not compensate. See [Smart Contract Risk](/risk/smart-contract).

> warning **A yield figure is a revenue line, not a profit line** Fee APR, incentive APR, and total value locked all measure gross revenue. None nets off inventory risk, and inventory risk is the largest cost in the business.

---

#### Code

```python
import numpy as np


def pool_value(k, price):
    """Value of a constant-product position in numeraire terms."""
    return 2.0 * np.sqrt(k * price)


def impermanent_loss(price_ratio):
    """Pool value relative to holding the initial basket.

    Depends only on the endpoints, which is exactly why it
    understates what was actually paid along the path.
    """
    return 2.0 * np.sqrt(price_ratio) / (1.0 + price_ratio) - 1.0


def lvr_rate(volatility, periods_per_year=365):
    """Loss-versus-rebalancing per period, as a fraction of pool value.

    Constant-product result: variance over eight. Assumes a diffusive
    price and continuous arbitrage, so treat it as a floor in jumpy markets.
    """
    return volatility**2 / (8.0 * periods_per_year)


def breakeven_turnover(volatility, fee_rate, periods_per_year=365):
    """Volume-to-pool-value ratio per period at which fees offset LVR.

    Independent of pool size: a statement about the pair, not the position.
    """
    return volatility**2 / (8.0 * periods_per_year * fee_rate)


def net_lp_rate(volume, pool_value_now, fee_rate, volatility,
                periods_per_year=365):
    """Fee revenue minus inventory cost, per period, as a rate."""
    fee_yield = fee_rate * volume / pool_value_now
    return fee_yield - lvr_rate(volatility, periods_per_year)
```

---

#### See Also

* [Market Making Lite](/strategies/mm-lite)
* [Adverse Selection](/execution/adverse-selection)
* [Impermanent Loss](/building-blocks/impermanent-loss)
* [Concentrated Liquidity LP](/strategies/concentrated-lp)
* [Delta-Hedged LP Strategies](/strategies/delta-hedged-lp)
* [AMM Deep Dive](/protocols/amms-depth)
* [LP Returns Simulation](/simulation/lp-returns)

---

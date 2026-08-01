### No-Arbitrage & Replication

> info **Metadata** Level: Intermediate | Prerequisites: Present value, Put-call parity | Tags: derivatives, arbitrage, replication, law-of-one-price, pricing-theory

Derivatives pricing has one idea in it. If you can build a portfolio of traded instruments that pays exactly what a contract pays, in every state of the world, then the contract must cost what the portfolio costs. Otherwise buy the cheap one, sell the dear one, and collect the difference with no exposure left over. Everything else — trees, Black-Scholes, Monte Carlo, the entire risk-neutral apparatus — is a technique for constructing that portfolio.

This matters because it inverts the naive question. A beginner asks "what is this option worth?", expecting an answer that depends on whether the underlying is likely to go up. Replication says the expected direction is irrelevant: the price is the cost of the hedge, and the hedge cost depends on how much the underlying moves, not which way. Two traders who violently disagree about direction must still agree on the option price, or one of them is offering the other a free lunch.

---

#### Formal Definition

An **arbitrage** is a self-financing trading strategy with initial value zero, terminal value never negative, and terminal value strictly positive with positive probability. In symbols, with `V_t` the portfolio value:

```text
V_0 = 0,  V_T >= 0 in every state,  P(V_T > 0) > 0
```

The **law of one price** is the weaker statement that two portfolios with identical payoffs in every state must have the same price today:

```text
If  X_T = Y_T  in every state,  then  X_0 = Y_0
```

A claim is **attainable** (or replicable) if there exists a self-financing strategy in traded assets whose terminal value equals the claim's payoff. The **replication principle** is then:

```text
Price of claim = Initial cost of the replicating portfolio
```

where:

- **self-financing** means no cash is added or withdrawn after inception; rebalancing is funded entirely by selling one holding to buy another
- **every state** means every outcome the model admits, not every outcome you consider likely
- the argument gives a price, not a probability — it is a statement about relative prices of traded things

> info **Two theorems in the background** The first fundamental theorem of asset pricing says no-arbitrage is equivalent to the existence of an equivalent martingale measure. The second says the market is complete — every claim attainable — if and only if that measure is unique. [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing) develops both.

---

#### Worked Example: Static Replication of a Forward

The simplest replication involves no rebalancing at all. Take an asset at `S = 100`, a continuously compounded rate `r = 4%`, a continuous dividend yield `q = 1%`, and a six-month horizon `T = 0.5`.

To hold exactly one unit of the asset at `T` without paying for it today:

1. **Buy `exp(-q * T)` units now**: `exp(-0.01 * 0.5) = 0.995012` units, costing `99.5012`
2. **Reinvest dividends** into more units as they arrive. Over `T`, the holding grows by `exp(q * T)`, so `0.995012 * exp(0.005) = 1.000000` units at expiry
3. **Fund the purchase by borrowing** `99.5012` at 4%
4. **Repay at expiry**: `99.5012 * exp(0.04 * 0.5) = 99.5012 * 1.020201 = 101.5113`

The strategy costs nothing today and delivers one unit of the asset at `T` in exchange for a certain payment of 101.5113. That is the definition of a forward, so the fair forward price is:

```text
F = S * exp((r - q) * T) = 100 * exp(0.03 * 0.5) = 101.5113
```

Now suppose the forward is quoted at 102.20. Sell the forward, run the replication above. At expiry you deliver the unit you hold and receive 102.20, while owing 101.5113 on the loan. Profit `102.20 - 101.5113 = 0.6887` with certainty, worth `0.6887 * exp(-0.02) = 0.6751` today. No view on `S` was needed at any point.

This is **static replication**: set the portfolio once and leave it. The forward is attainable statically because its payoff is linear in `S_T`, and a fixed share holding already has a linear payoff.

---

#### Worked Example: Dynamic Replication of an Option

An option's payoff is not linear, so no fixed share holding can match it. But over a single period with only two possible outcomes, a fixed holding can.

Let `S = 100`. Over one period the price goes to `110` or `90`. The gross risk-free return over the period is `R = 1.02`. Price a call struck at `K = 100`, which pays `10` in the up state and `0` in the down state.

Look for a portfolio of `delta` units of the asset plus `B` invested in the bond that matches both payoffs:

```text
delta * 110 + B * 1.02 = 10
delta *  90 + B * 1.02 =  0
```

1. **Subtract**: `delta * 20 = 10`, so `delta = 0.5`. This is the ratio of payoff spread to price spread — the **hedge ratio**.
2. **Substitute** into the down equation: `0.5 * 90 + B * 1.02 = 0`, so `B = -45 / 1.02 = -44.1176`. The negative sign means borrowing.
3. **Cost today**: `0.5 * 100 - 44.1176 = 5.8824`

The call must be worth `5.8824`. Check the up state: `0.5 * 110 - 44.1176 * 1.02 = 55 - 45 = 10`. Correct. Check the down state: `0.5 * 90 - 45 = 0`. Correct.

Notice that the probability of the up move never entered the calculation. If you believed the up state had 90% probability and your counterparty believed 10%, you would both compute 5.8824, because the hedge costs what it costs regardless. This is the single most important consequence of replication, and it is why [risk-neutral probabilities](/derivatives/binomial-trees) are a computational device rather than a forecast.

Over many periods the hedge ratio changes at every node, so replication becomes **dynamic**: rebalance continuously as the price and the time remaining change. The cost of that rebalancing programme is the option premium. [Delta Hedging](/derivatives/delta-hedging) is what this looks like when you actually run it.

---

#### Model-Free Bounds

Replication also produces inequalities that hold with no model at all. For a European call on a non-dividend-paying asset:

```text
max(0, S - K * exp(-r * T))  <=  C  <=  S
```

The upper bound: the call can never be worth more than the asset, since the most it can deliver is the asset itself. The lower bound: a portfolio of long call plus `K * exp(-r * T)` in cash dominates holding the asset, because it pays `max(S_T, K)`, so it must cost at least `S`.

Further constraints across strikes, all provable by payoff dominance:

- **Monotonicity**: `C(K)` is non-increasing in `K`. A lower strike call dominates a higher strike call.
- **Slope bound**: `C(K1) - C(K2)` is between `0` and `(K2 - K1) * exp(-r * T)` for `K1` below `K2`. A call spread cannot pay more than the strike width.
- **Convexity**: `C(K1) - 2 * C(K2) + C(K3)` is non-negative for equally spaced strikes. This is the butterfly, whose payoff is never negative.

These are the constraints an arbitrage-free volatility surface must satisfy, and they are checked directly in [The Volatility Surface](/derivatives/vol-surface).

---

#### Static Versus Dynamic Replication

<table>
  <tbody>
    <tr><td><strong>Property</strong></td><td><strong>Static</strong></td><td><strong>Dynamic</strong></td></tr>
    <tr><td>Rebalancing</td><td>None after inception</td><td>Continuous in theory, discrete in practice</td></tr>
    <tr><td>Model dependence</td><td>None, or very weak</td><td>Requires a model of how the price moves</td></tr>
    <tr><td>Transaction costs</td><td>Paid once</td><td>Paid at every rebalance, unbounded in principle</td></tr>
    <tr><td>Typical use</td><td>Forwards, parity, variance swaps, digitals via spreads</td><td>Vanilla and exotic options</td></tr>
    <tr><td>Failure mode</td><td>The replicating instruments are not liquid</td><td>The model is wrong, or you cannot rebalance fast enough</td></tr>
  </tbody>
</table>

Static replication is strictly preferable when available, because it does not depend on a model being right. The replication of a [variance swap](/derivatives/variance-swaps) by a strip of options is the most valuable example: it prices a fundamentally non-linear payoff without assuming any particular dynamics.

---

#### In Practice Across Asset Classes

**Equities.** Dynamic replication works reasonably at index level, where the underlying is liquid and continuous. At single-stock level, gaps around earnings break the continuity assumption, so the replication argument systematically understates the cost of hedging short gamma.

**Futures.** Replication is cleanest here because the underlying is the hedge instrument and financing is embedded in the contract. Options on futures are hedged with the future itself, so there is no borrow cost and no dividend forecast. See [Futures 101](/markets/futures-101).

**FX.** Both legs pay interest, so the replicating portfolio holds two bonds rather than one. Deliverability matters: a non-deliverable forward cannot be replicated by holding the currency, which is why NDF markets can price away from covered interest parity for extended periods.

**Fixed income.** The "underlying" of a swaption is a swap, not a tradable asset with a price, so replication runs through an annuity numeraire rather than a cash bond. The change of numeraire is the standard machinery; see [Change of Measure](/stochastic-calculus/change-of-measure).

**Credit.** Replication is weakest here. The hedge instrument for a bond is a CDS on a different reference obligation with different deliverables, and the basis between them is persistent and volatile. Pricing is calibration to observed spreads rather than genuine replication.

**On-chain.** Replication requires the hedge to be executable at the quoted price. On-chain, the hedge leg pays gas, faces [slippage](/microstructure/slippage) that grows with size, and can be [front-run](/risk/slippage-frontrunning). An arbitrage of a few basis points is not accessible if the round trip costs more. Automated market makers are the clearest case: a constant-product pool's value function is a fixed, known function of price, which makes an LP position statically replicable by a portfolio of options — the formal statement of why LPs are short gamma. See [Impermanent Loss](/building-blocks/impermanent-loss) and [Delta-Hedged LP](/strategies/delta-hedged-lp).

---

#### Assumptions and Failure Modes

- **Frictionless trading.** The argument assumes you can trade any quantity at the quoted price with no cost. Dynamic replication rebalances often, so transaction costs accumulate; with proportional costs, perfect replication has infinite cost in the continuous limit.
- **Continuous prices.** Dynamic hedging assumes the price does not jump. A gap move leaves the hedge stale and produces a loss no rebalancing schedule could have prevented. See [Jumps](/quant-math/jumps).
- **Market completeness.** Replication requires enough traded instruments to span the payoff. Add a second source of randomness — stochastic volatility, jumps of random size — and most claims stop being attainable. Prices then depend on a risk premium, not on replication alone.
- **Unlimited, symmetric funding.** The argument borrows and lends at the same rate in any size. Real funding is asymmetric, capital-charged, and can be withdrawn precisely when the arbitrage widens.
- **No shorting constraints.** Half of every arbitrage is a short. Borrow costs, recall risk, and short bans convert an arbitrage into a trade with real risk.
- **Arbitrage is a limit, not a mechanism.** Prices converge because someone with capital and risk tolerance forces them to. Both can be absent for long stretches, and a position that is certain to converge by expiry can still be liquidated before then. See [Leverage & Liquidation](/risk/leverage-liquidation).

> warning **"No-arbitrage" does not mean "cannot lose money"** It means a specific, fully hedged, self-financing portfolio has no riskless profit. Every real implementation of that portfolio carries basis risk, funding risk, and execution risk, none of which appear in the mathematics.

---

#### Code

```python
def one_period_replication(spot, up, down, payoff_up, payoff_down, gross_rate):
    """Replicating portfolio for any one-period, two-state claim.

    Returns the share holding, the bond holding, and the resulting price.
    Works for calls, puts, digitals, or an arbitrary pair of state payoffs.
    """
    hedge_ratio = (payoff_up - payoff_down) / (up - down)
    bond = (payoff_down - hedge_ratio * down) / gross_rate
    return {
        "delta": hedge_ratio,
        "bond": bond,
        "price": hedge_ratio * spot + bond,
    }


# Call struck at 100: S=100 goes to 110 or 90, gross rate 1.02
# -> delta 0.5, bond -44.1176, price 5.8824
```

---

#### See Also

* [Payoffs & Put-Call Parity](/derivatives/payoffs-parity)
* [Binomial Trees](/derivatives/binomial-trees)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [Delta Hedging](/derivatives/delta-hedging)
* [Variance Swaps](/derivatives/variance-swaps)
* [Change of Measure](/stochastic-calculus/change-of-measure)

---

### Delta Hedging

> info **Metadata** Level: Advanced | Prerequisites: The Greeks, Black-Scholes, Replication | Tags: derivatives, hedging, gamma, theta, pnl-attribution, transaction-costs

Delta hedging is the replication argument turned into a job. You hold an option, you hold an offsetting position in the underlying sized by delta, and you adjust that position as the price moves. In the model this is costless and exact. In practice you rebalance a finite number of times, pay a spread on every adjustment, and end up with a profit and loss that differs from the model premium by an amount that is itself a random variable.

Understanding that difference is the point. A delta-hedged option is not a directional bet; it is a bet on **realised volatility against implied volatility**, contaminated by discretisation error and transaction costs. The gamma-theta tradeoff is the mechanism, and the P&L attribution is how a desk checks whether the day's result came from where it thought.

---

#### Formal Definition

Over a short interval `dt`, expand the option value in spot, time, and volatility:

```text
dV  =  Delta * dS  +  0.5 * Gamma * (dS)^2  +  Theta * dt  +  Vega * dsigma  +  higher order
```

A delta-hedged position holds `-Delta` units of the underlying, cancelling the first term. What remains is the **hedged P&L**:

```text
hedged P&L  ~=  0.5 * Gamma * (dS)^2  +  Theta * dt  +  Vega * dsigma
```

Under Black-Scholes with `r = 0`, theta and gamma are linked exactly:

```text
Theta = -0.5 * sigma_implied^2 * S^2 * Gamma
```

Substituting, and holding implied volatility fixed so the vega term drops out:

```text
hedged P&L  ~=  0.5 * Gamma * S^2 * [ (dS/S)^2  -  sigma_implied^2 * dt ]
```

where:

- `(dS/S)^2` is the squared realised return over the interval
- `sigma_implied^2 * dt` is the variance the option was priced with
- `0.5 * Gamma * S^2` is the **dollar gamma**, the scaling that converts a variance difference into money

The interpretation is exact and worth stating without hedging: **each period, a delta-hedged long option earns the difference between realised variance and implied variance, weighted by dollar gamma.** You are long realised volatility and short implied volatility. That is the entire economics of the position.

---

#### Worked Example: Five Days of a Hedged Long Call

Buy one at-the-money call: `S = 100`, `K = 100`, `sigma_implied = 20%`, `r = 0`, five trading days to expiry. The initial premium is `1.1239`, with delta `0.5056`, gamma `0.1416`, and theta `-0.1124` per day. Rehedge once daily at the close, and hold implied volatility constant at 20% so all P&L is gamma against theta.

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td><strong>Spot move</strong></td><td><strong>Delta held</strong></td><td><strong>Option P&amp;L</strong></td><td><strong>Hedge P&amp;L</strong></td><td><strong>Net</strong></td><td><strong>Gamma term</strong></td><td><strong>Theta term</strong></td></tr>
    <tr><td>1</td><td>100.0 to 101.6</td><td>0.5056</td><td>+0.8840</td><td>-0.8090</td><td>+0.0751</td><td>+0.1812</td><td>-0.1124</td></tr>
    <tr><td>2</td><td>101.6 to 99.9</td><td>0.7397</td><td>-1.1869</td><td>+1.2576</td><td>+0.0707</td><td>+0.1832</td><td>-0.1039</td></tr>
    <tr><td>3</td><td>99.9 to 101.4</td><td>0.4861</td><td>+0.8022</td><td>-0.7291</td><td>+0.0731</td><td>+0.2058</td><td>-0.1449</td></tr>
    <tr><td>4</td><td>101.4 to 100.2</td><td>0.7850</td><td>-1.0138</td><td>+0.9420</td><td>-0.0718</td><td>+0.1164</td><td>-0.1320</td></tr>
    <tr><td>5</td><td>100.2 to 102.0</td><td>0.5655</td><td>+1.3906</td><td>-1.0179</td><td>+0.3727</td><td>+0.5050</td><td>-0.2484</td></tr>
  </tbody>
</table>

Working through it:

1. **Day 1.** The delta held into the move was 0.5056, so the hedge lost `0.5056 * 1.6 = 0.8090` while the option gained 0.8840. Net `+0.0751`. The gamma term `0.5 * 0.1416 * 1.6^2 = 0.1812` minus theta `0.1124` gives `+0.0689` — close, and the small gap is gamma changing during the move.
2. **Day 4.** The move was only 1.2 points. The gamma gain `0.5 * 0.1617 * 1.2^2 = 0.1164` did not cover the theta of `0.1320`, so the day lost money. This is what a quiet day costs.
3. **Day 5.** A 1.8-point move on the last day, when gamma had risen to 0.31, produced `+0.3727`. The approximation is worst here, at `+0.2566`, because gamma more than doubles during the final day and a fixed-gamma estimate cannot capture that.
4. **Total over five days**: `+0.5198` against a premium paid of `1.1239`.

Cross-check against the variance interpretation. The five daily log returns imply an annualised realised volatility of about **24.8%** against an implied of 20%. Using the initial dollar gamma:

```text
0.5 * 0.1416 * 100^2 * (0.248^2 - 0.20^2) * (5 / 252) = 0.300
```

The realised `+0.5198` exceeds this because gamma rose sharply into expiry and the large moves happened to arrive on the high-gamma days. **Path matters**: the same set of five returns delivered in a different order would produce a different P&L, even though realised volatility is identical. This is the gamma-weighting effect, and it is the main reason a delta-hedged option is an imperfect variance instrument. A [variance swap](/derivatives/variance-swaps) is the fix.

---

#### The Breakeven Move

Setting the gamma term equal to the theta term gives the daily move at which a hedged option breaks even:

```text
|dS| = S * sigma_implied * sqrt(dt)
```

For `S = 100`, `sigma = 20%`, one trading day out of 252:

```text
|dS| = 100 * 0.20 / sqrt(252) = 20 / 15.87 = 1.26 points
```

A move larger than 1.26 points in either direction is a profitable day for a long-gamma book; anything smaller loses. Notice that this threshold does **not** depend on the option's expiry — a one-week and a two-year option have the same breakeven move, because gamma and theta scale together. What differs is the size of the P&L, not its sign.

> info **The trader's version** "Am I long or short gamma, and is the market moving more or less than the option implies?" Those two questions determine the sign of the day's hedged P&L. Everything else is second order.

---

#### P&L Attribution

At the end of each day, a desk decomposes the change in book value into explained and unexplained components:

```text
Explained  =  Delta * dS
           +  0.5 * Gamma * (dS)^2
           +  Vega * dsigma
           +  Theta * dt
           +  Rho * dr

Unexplained  =  Actual P&L  -  Explained
```

The unexplained residual is a diagnostic, not a nuisance. Persistent unexplained P&L means one of:

- **Higher-order terms are material** — large moves make third-order effects (speed, vanna, volga) significant.
- **The volatility shift was not parallel** — a single vega number cannot explain a surface that twisted.
- **The marks are wrong** — stale or mid-of-a-wide-spread option marks produce residuals that mean-revert.
- **Something is missing from the model** — a dividend, a borrow change, an early assignment.

A desk that cannot explain 95% or more of its daily P&L on quiet days does not understand its own book. On violent days the residual grows for legitimate reasons, which is itself informative.

---

#### Rehedging Frequency and Transaction Costs

Rebalancing more often reduces discretisation error and increases cost. The two scale in opposite directions:

- **Hedging error** falls roughly as `1 / sqrt(n)` in the number of rehedges. Doubling the frequency reduces the standard deviation of the replication error by about 29%.
- **Transaction cost** rises roughly as `sqrt(n)`, because the expected absolute delta change per interval scales as `sqrt(dt)` while there are `1/dt` intervals.

Applying a 5 basis point round-trip cost to the example above, the five rehedges cost `0.0729` in total, taking the result from `+0.5198` to `+0.4469` — 14% of the gross. On a one-week option that is tolerable; on a programme hedging intraday it is often the dominant term.

Three practical regimes:

- **Fixed time intervals.** Simple, auditable, and blind to whether anything happened. Standard for end-of-day risk management.
- **Delta bands.** Rehedge only when delta drifts outside a tolerance. Fewer trades, larger residual risk, and provably closer to optimal under proportional costs than fixed-time hedging.
- **Move-based triggers.** Rehedge on a percentage move in the underlying. Behaves like delta bands but is easier to reason about near expiry, where delta moves fast for small price changes.

> warning **Perfect replication has infinite cost** With proportional transaction costs, the total cost of hedging grows without bound as the rebalancing interval goes to zero. There is no "correct" frequency — only a tradeoff between variance and cost. Leland's adjustment prices this by inflating the volatility used for a short position and deflating it for a long one.

---

#### In Practice Across Asset Classes

**Equity indices.** Hedged with futures rather than the basket, which is cheap and liquid but introduces basis risk against the cash index. Overnight gaps between the cash close and the futures open are unhedgeable and are a systematic cost of short-gamma books.

**Single stocks.** Hedging requires borrow for the short leg, and borrow can be recalled. Earnings gaps make short-gamma positions genuinely dangerous: no rebalancing schedule protects against a 15% overnight move. Desks reduce or close short gamma into scheduled events rather than trying to hedge through them.

**FX.** The most hedgeable market — deep liquidity nearly around the clock, tiny spreads in the majors, and no borrow problem. This is why FX option desks can run higher gamma than equity desks at comparable risk. Weekend gaps and central bank interventions remain the exception.

**Rates.** Swaption delta is hedged with swaps or futures, and the "delta" is a DV01 across a curve rather than a single number. A hedge that is DV01-flat can still lose from a curve twist, so hedges are bucketed by tenor. See [Duration & Convexity](/markets/duration-convexity).

**Commodities.** Hedged in the futures contract of the matching delivery month. Rolling the hedge introduces the roll cost directly into the hedged P&L, and physical delivery constraints can make the hedge instrument unavailable near expiry. See [Roll & Carry](/markets/roll-and-carry).

**On-chain.** Hedging costs are explicit and high: gas per rebalance, [slippage](/microstructure/slippage) that scales with size, and exposure to [front-running](/risk/slippage-frontrunning) on every predictable rebalance. This flips the calculus towards infrequent, band-based hedging. The clearest application is a liquidity provider hedging the negative gamma of an AMM position — the position's delta is a known function of price, so the hedge is computable, but each adjustment pays the same frictions. See [Delta-Hedged LP](/strategies/delta-hedged-lp) and [Hedging LP Positions](/strategies/hedging-lp).

---

#### Assumptions and Failure Modes

- **Continuous prices.** Delta hedging fails completely against a gap. A short-gamma book loses `0.5 * Gamma * (gap)^2` with no opportunity to rebalance, and that term is quadratic in the gap size.
- **Constant implied volatility.** The clean gamma-theta decomposition assumes the option is marked at an unchanged implied vol. In reality implied vol moves with spot, so the vega term is not zero and is correlated with the gamma term.
- **The hedge instrument tracks the underlying.** Futures-versus-cash, ADR-versus-local-line, and perpetual-versus-spot all introduce basis. Basis risk is not hedged by delta.
- **Liquidity when you need it.** Rehedging requirements are largest exactly when markets are most disorderly, because that is when gamma-driven delta changes are largest. Short-gamma hedging is procyclical and can amplify the move it is responding to.
- **Costs are proportional and small.** Market impact is not proportional; it grows with size. A large book's rehedge moves the market against itself. See [Market Impact](/execution/market-impact).
- **Realised variance is what you get paid on.** Only true in the continuous limit. In discrete time you are paid on a gamma-weighted average of squared returns, which is path-dependent and can differ substantially from plain realised variance.
- **The delta is the right delta.** Black-Scholes delta is not variance-minimising on a skewed surface. Using a skew-adjusted delta changes the hedge materially for equity index options.

---

#### Code

```python
def hedged_pnl_path(prices, price_fn, delta_fn, cost_bps=0.0):
    """Simulate a daily-rehedged long option and attribute the result.

    price_fn(spot, step) and delta_fn(spot, step) supply the mark and hedge
    ratio at each step; passing them in keeps the loop model-agnostic.
    Returns gross P&L, transaction costs, and the per-day series.
    """
    held = delta_fn(prices[0], 0)
    gross, costs, daily = 0.0, 0.0, []

    for step in range(1, len(prices)):
        move = prices[step] - prices[step - 1]
        option_pnl = price_fn(prices[step], step) - price_fn(prices[step - 1], step - 1)
        hedge_pnl = -held * move
        gross += option_pnl + hedge_pnl
        daily.append(option_pnl + hedge_pnl)

        new_delta = delta_fn(prices[step], step)
        # Cost is charged on the notional traded, not on the delta change itself.
        costs += abs(new_delta - held) * prices[step] * cost_bps / 10_000.0
        held = new_delta

    return {"gross": gross, "costs": costs, "net": gross - costs, "daily": daily}
```

---

#### See Also

* [The Greeks](/derivatives/greeks)
* [Implied Volatility](/derivatives/implied-volatility)
* [Variance Swaps](/derivatives/variance-swaps)
* [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication)
* [Delta-Neutral Strategies](/strategies/delta-neutral)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)

---

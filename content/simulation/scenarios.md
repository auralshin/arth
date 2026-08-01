### Scenario and Stress Testing

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility, Risk Types | Tags: stress-testing, scenarios, risk, tail-risk, simulation

A backtest asks what would have happened if you had traded through the past. A stress test asks a harder question: what happens under conditions the past did not supply. The two are complements. History is the only sample you have, and it is a sample of one path — it contains the crises that occurred and none of the ones that did not. Any risk estimate derived purely from realised returns is, by construction, blind to everything outside its own window.

Scenario analysis fills that gap by *specifying* the shock rather than sampling it. You choose the move, apply it to the portfolio through a model of how positions respond, and read off the loss. This makes the exercise transparent and falsifiable in a way that a Value-at-Risk number is not: every input is a number a person chose and can be argued with. It also makes it vulnerable in a specific way — a scenario suite tests only the futures someone thought to write down, and the assumptions inside the revaluation are as capable of flattering you as anything in a backtest.

---

#### Formal Definition

A scenario is a vector of shocks to risk factors, and its loss is the portfolio revaluation under those shocks:

```text
loss(s)  =  V(F + s)  -  V(F)
```

where:

- `F` is the current vector of risk factors — index levels, rates, spreads, volatilities, funding rates, exchange rates
- `s` is the scenario: a specified move in each factor, applied jointly
- `V(.)` is the portfolio valuation function

For small shocks, a factor expansion is often used instead of full revaluation:

```text
loss(s)  ~=  SUM_i [ delta_i * s_i ]  +  0.5 * SUM_i SUM_j [ gamma_ij * s_i * s_j ]
```

where:

- `delta_i` is the first-order sensitivity of the portfolio to factor `i`
- `gamma_ij` is the second-order sensitivity, including cross-terms

> warning **First-order approximations understate stress by design** The linear term is a local approximation. Stress scenarios are by definition not local. Any portfolio with optionality, leverage-dependent margin, or a liquidation threshold has convexity that the delta term cannot see — and it is almost always convex against you.

A complete stress figure adds two things the revaluation above omits: the cost of actually exiting under stress, and any funding or margin obligation triggered by the move.

```text
stress_loss  =  revaluation_loss  +  liquidation_cost  +  funding_shortfall
```

---

#### Worked Example

A hypothetical book, stressed under an equity shock. All figures are illustrative arithmetic.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Long position, beta 1.0 to the index</td><td>10,000,000</td></tr>
    <tr><td>Short hedge basket, normal-regime beta 0.9</td><td>4,000,000</td></tr>
    <tr><td>Capital (equity)</td><td>5,000,000</td></tr>
    <tr><td>Scenario: index move</td><td>-25%</td></tr>
    <tr><td>Stressed hedge beta (correlation breakdown)</td><td>0.6</td></tr>
    <tr><td>Liquidation cost on gross notional</td><td>40 bps</td></tr>
  </tbody>
</table>

Step by step:

1. **Normal-regime net exposure**: `10,000,000 - 0.9 * 4,000,000 = 10,000,000 - 3,600,000 = 6,400,000`
2. **Naive loss** at the normal beta: `6,400,000 * 25% = 1,600,000`
3. **Stressed net exposure**, with the hedge's beta falling to 0.6: `10,000,000 - 0.6 * 4,000,000 = 7,600,000`
4. **Revaluation loss** under the stressed beta: `7,600,000 * 25% = 1,900,000`
5. **Liquidation cost** on gross notional of `10,000,000 + 4,000,000 = 14,000,000`: `14,000,000 * 0.0040 = 56,000`
6. **Total stress loss**: `1,900,000 + 56,000 = 1,956,000`, or `1,956,000 / 5,000,000 = 39.1%` of capital

The naive figure was 1,600,000, or 32.0% of capital. The difference of 356,000 comes entirely from two assumptions that a scenario grid built on historical correlations would have kept constant: that the hedge keeps working, and that exiting is free. Both fail together and for the same reason — the shock that breaks the correlation is the shock that widens the spread.

This is the general lesson. Stress losses are not linear extrapolations of normal losses, because the parameters used to compute normal losses are themselves state-dependent. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).

---

#### Four Kinds of Scenario

**Historical replay.** Take the factor moves from a past episode and apply them to today's book. Concrete, defensible and easy to explain, because the moves actually occurred. The limitation is that today's portfolio is not the portfolio that existed then, and today's market structure is not that market's structure.

**Hypothetical.** Construct a shock that has not occurred: a rate move of a specified size, a simultaneous equity and credit selloff, a funding freeze. This is where judgement enters, and where the suite's blind spots live.

**Factor-shock grids.** Vary two factors across a grid and tabulate the loss surface. This finds non-monotonicity — the cases where a moderate move hurts more than a large one, typically because a hedge or a threshold behaves differently in between.

**Reverse stress testing.** Invert the question. Rather than choosing a shock and computing the loss, fix an unacceptable loss and solve for the smallest shock that produces it. The output is a description of what would have to happen for the strategy to fail, which is usually far more informative than a table of losses under scenarios that seem unlikely. It also surfaces the combinations nobody would have written down.

---

#### In Practice Across Asset Classes

**Equities.** Shock the index, then separately shock the dispersion around it — a market-neutral book can be flat to the index and badly exposed to a factor rotation. Add a short-squeeze case for any borrow-dependent position. See [Short Selling](/markets/short-selling).

**Futures and commodities.** Stress the curve shape, not only the front price. A parallel shift is the easy case; a steepening or an inversion changes roll economics and can invert a carry position's sign. Margin is the second axis: exchanges raise requirements exactly when volatility spikes.

**FX.** The relevant scenarios are regime breaks — a peg abandonment, a capital control, an intervention. These are step changes rather than distributional moves, and no volatility-based measure anticipates them.

**Fixed income and credit.** Standard practice shocks the level, the slope and the curvature of the curve separately, plus a spread widening. Convexity means the second-order term matters even for moderate shocks. See [Duration and Convexity](/markets/duration-convexity) and [Credit Curves](/credit/credit-curves).

**Options books.** Scenario grids in spot and volatility jointly are the standard tool, because the delta and gamma at the new spot are not the delta and gamma at the old one. See [Greeks](/derivatives/greeks) and [Volatility Surface](/derivatives/vol-surface).

**On-chain positions.** Add mechanism-specific scenarios that have no analogue elsewhere: an oracle stall or manipulation, a liquidation cascade, a bridge failure, a stablecoin depeg, a sudden gas spike that makes exiting uneconomic. See [Simulating Liquidations](/simulation/liquidations) and [Oracle Manipulation](/risk/oracle-manipulation).

---

#### Assumptions and Failure Modes

- **The scenario set is complete.** Assumes someone imagined the relevant shock. This is the central weakness, and reverse stress testing is the only partial remedy.
- **Correlations hold.** Assumes hedge relationships persist under stress. They compress toward one for risky assets and break for basis trades — precisely when the hedge is needed.
- **Positions can be exited.** Assumes liquidation at or near the stressed mark. Liquidity evaporates in the same event, so the exit price is worse than the revaluation price, sometimes by a wide margin.
- **The book is static.** Assumes no trading during the shock. Real books deleverage, and forced deleveraging is itself a source of price pressure. See [Agent-Based Simulation](/simulation/agent-based).
- **Shocks are instantaneous.** Assumes a single jump. A drawn-out move through a margin threshold produces a different, usually worse, outcome than the same move delivered at once.
- **Sensitivities are stable.** Assumes `delta` and `gamma` computed at current levels apply at stressed levels. Untrue for anything path-dependent or near a barrier.
- **Funding is available.** Assumes you can meet margin calls. A scenario that is survivable on paper is not survivable if the cash arrives a day late. See [Operational Risk](/risk/operational).

---

#### Code

A reverse stress test: rather than asking what a shock costs, solve for the shock that breaches a loss limit.

```python
def reverse_stress(revalue, loss_limit, upper_bound=1.0, tolerance=1e-4):
    """Smallest downward shock whose loss reaches `loss_limit`.

    `revalue(shock)` returns the portfolio loss for a given factor move
    and must include exit costs and funding effects, not just mark-to-market.
    Bisection assumes loss is monotone in the shock; check that before trusting it.
    """
    low, high = 0.0, upper_bound
    if revalue(high) < loss_limit:
        return None                       # limit unreachable within the search range

    while high - low > tolerance:
        mid = 0.5 * (low + high)
        if revalue(mid) < loss_limit:
            low = mid
        else:
            high = mid
    return high


def stressed_loss(shock, long_notional, hedge_notional, stressed_beta, exit_cost_bps):
    """Revaluation under a stressed hedge beta, plus the cost of getting out."""
    net_exposure = long_notional - stressed_beta * hedge_notional
    gross_notional = long_notional + hedge_notional
    return net_exposure * shock + gross_notional * exit_cost_bps / 10_000


breach = reverse_stress(
    lambda s: stressed_loss(s, 10_000_000, 4_000_000, 0.6, 40),
    loss_limit=2_500_000,
)
print(round(breach, 4))    # index move that consumes half the 5m capital base
```

---

#### See Also

* [Why Backtest and Simulate?](/simulation/why-backtest)
* [Agent-Based Simulation](/simulation/agent-based)
* [VaR & CVaR](/quant-math/var-cvar)
* [Risk Types](/risk/types)
* [Correlation Breakdown](/regimes-macro/correlation-breakdown)
* [Risk Checklists](/risk/checklists)

---

### Why Backtest and Simulate?

> info **Metadata** Level: Beginner | Prerequisites: Returns, Basic statistics | Tags: backtesting, methodology, simulation, research-process

A backtest replays a strategy over historical data and reports what it would have earned. That sentence contains a word doing enormous work: *would*. The strategy did not trade. The orders were never sent, the counterparties never responded, and the prices you are marking against were produced by a market that never saw your size. A backtest is not a measurement of the past. It is a **simulation of a counterfactual** — a hypothetical world in which you were present and everything else stayed the same.

That framing is the whole discipline. Every line of a backtester encodes an assumption about that counterfactual world: how quickly you learned things, what price you got, what you paid, how much you could have done. Each of those assumptions has a lenient setting and a harsh one, and the lenient setting always produces a better equity curve. Backtesting is therefore not primarily a programming problem. It is the problem of building a simulation whose assumptions you can defend to someone who wants you to be wrong.

---

#### Formal Definition

A backtest computes a hypothetical profit-and-loss series:

```text
PnL = SUM_t [ w_(t-1) * R_t ]  -  SUM_t c_t
```

where:

- `w_(t-1)` is the position held into period `t`, chosen using **only** information available at or before `t-1`
- `R_t` is the realised return of the instrument over period `t`
- `c_t` is every cost incurred in period `t`: spread paid, commission, exchange fees, market impact, financing, borrow, taxes

Two identifying assumptions are hiding in that expression, and neither is testable from the data alone:

1. **Information assumption.** `w_(t-1)` really was computable at `t-1`. Any leakage of `t` or later information into the decision is *lookahead bias*, and it is the fastest known way to manufacture a beautiful curve.
2. **Invariance assumption.** `R_t` would have been unchanged by your participation. This is false for any size that matters. It is approximately true for small size in deep markets, and badly false for a large position in a thin one.

> warning **The counterfactual is unfalsifiable** No amount of historical data can tell you what price you would have got for an order that was never sent. That number comes from your fill model, which is a belief, not an observation.

---

#### Worked Example

Consider a daily signal that opens and closes one position per trading day. The gross return figure comes out of the simulation; the cost per round trip is an assumption you supply. Watch what a five basis-point disagreement about that assumption does. The numbers below are illustrative arithmetic, not a result from any real system.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Gross annual return (before costs)</td><td>18.0%</td></tr>
    <tr><td>Annualised volatility of returns</td><td>10.0%</td></tr>
    <tr><td>Round trips per year</td><td>250</td></tr>
    <tr><td>Optimistic cost per round trip</td><td>4 bps (0.04%)</td></tr>
    <tr><td>Realistic cost per round trip</td><td>9 bps (0.09%)</td></tr>
  </tbody>
</table>

Step by step:

1. **Optimistic annual cost**: `250 * 0.04% = 10.0%`
2. **Optimistic net return**: `18.0% - 10.0% = 8.0%`, giving a Sharpe of `8.0 / 10.0 = 0.80` against a zero risk-free rate
3. **Realistic annual cost**: `250 * 0.09% = 22.5%`
4. **Realistic net return**: `18.0% - 22.5% = -4.5%`, a Sharpe of `-0.45`

The signal is identical in both runs. The prices are identical. The only thing that changed was a number nobody can verify from a price file — and it flipped the sign of the result. This is the general shape of the problem: at high turnover, the cost assumption dominates the signal.

Note also that the break-even cost is `18.0% / 250 = 7.2 bps` per round trip. Quoting that number is far more informative than quoting the Sharpe ratio, because a reader can judge for themselves whether 7.2 bps is achievable in the instrument concerned.

---

#### What a Backtest Can and Cannot Establish

<table>
  <tbody>
    <tr><td><strong>Can establish</strong></td><td><strong>Cannot establish</strong></td></tr>
    <tr><td>That the rules are unambiguous and mechanically implementable</td><td>That the edge exists out of sample</td></tr>
    <tr><td>That the idea is arithmetically incapable of working — a cheap, useful rejection</td><td>That the edge would survive competition once deployed</td></tr>
    <tr><td>The turnover, holding period and gross exposure the idea implies</td><td>The fill price you would actually have received</td></tr>
    <tr><td>Sensitivity: how the result moves as assumptions move</td><td>Capacity, unless impact is modelled explicitly</td></tr>
    <tr><td>The break-even cost the idea can tolerate</td><td>Behaviour in regimes absent from the sample</td></tr>
  </tbody>
</table>

The asymmetry is the point. A backtest is a strong *rejection* tool and a weak *confirmation* tool. A strategy that loses money before costs is dead, and you learned that in an afternoon. A strategy that makes money in a backtest has passed a filter that a great many worthless strategies also pass.

---

#### Why Simulate At All, Then

Three legitimate purposes survive the scepticism above.

**Falsification.** Most ideas are wrong, and a backtest kills them cheaply rather than in a live account over six months. The value is concentrated in the ideas you discard.

**Specification.** Writing a backtest forces every vague rule into code. "Buy on strength" becomes a lookback, a threshold, a rebalance frequency and a sizing rule. Ambiguity that would otherwise surface as a live-trading incident surfaces instead as a failing test.

**Sensitivity mapping.** The most useful output is rarely the headline Sharpe. It is the surface: how the result changes as costs, latency, slippage, start date and parameters vary. A result that survives a wide range of assumptions is qualitatively different from one that exists only at a single point. See [Parameter Sweeps and Sensitivity Analysis](/simulation/param-sweeps).

A fourth, adjacent use is **scenario analysis**: rather than asking what happened, you ask what would happen under a shock that has not yet occurred. That is covered in [Scenario and Stress Testing](/simulation/scenarios).

---

#### In Practice Across Asset Classes

**Daily equities.** The easiest case to simulate and the easiest to get quietly wrong. Index membership, delistings, splits and dividends must all be point-in-time, or the universe you test on is a universe of known survivors. See [Data Preparation for Backtests](/simulation/data-prep) and [Corporate Actions](/markets/corporate-actions).

**Intraday futures.** Continuous, centrally cleared and well timestamped, so the raw data is comparatively honest. The trap is the roll: a stitched continuous series is a synthetic construction, and the adjustment method changes the return series it produces. See [Roll and Carry](/markets/roll-and-carry).

**FX.** There is no central tape. Your "price" is one venue's or one aggregator's view, and another participant's history genuinely differs. Backtests that assume a single canonical mid understate execution uncertainty. See [FX 101](/markets/fx-101).

**Fixed income and credit.** Many instruments do not trade every day. Marks are model-derived or dealer-quoted, which smooths the return series, suppresses measured volatility and inflates risk-adjusted metrics. See [Credit 101](/credit/credit-101).

**On-chain markets.** Uniquely, the full state transition history is public and replayable at block level, so a simulation can come closer to a true replay than anywhere else. The counterfactual problem does not disappear; it moves to transaction ordering, gas and extractable value. See [On-Chain Data in Backtests](/simulation/onchain-data) and [Simulating LP Returns](/simulation/lp-returns).

---

#### Assumptions and Failure Modes

Each of these is a place where the simulation flatters you by default.

- **No lookahead.** Assumes every input was knowable when the decision was made. Broken by restated fundamentals, vendor data backfilled with a later timestamp, indicators computed over the full sample, or a shift you forgot. Fix it by construction, not by inspection — see [Event-Driven Backtesting Basics](/simulation/event-driven).
- **Survivorship-free universe.** Assumes the instruments you tested were selectable at the time. Broken by any universe built from a current membership list, which silently excludes everything that failed.
- **Fills at observed prices.** Assumes you traded at a price someone else traded at. Passive orders are the worst offender: touching a price is not the same as reaching the front of the queue. See [Orderbook Simulation](/simulation/orderbook).
- **Costs are a constant.** Assumes spreads and impact do not widen exactly when your signal fires. They usually do, because the volatility that generates the signal also widens the spread. See [Market Impact](/execution/market-impact).
- **Infinite capacity.** Assumes the market absorbs your size at the modelled price. Every strategy has a size at which its own trading destroys the edge it is trying to harvest.
- **Stationarity.** Assumes the relationship you found persists. Broken by regime change, competitor entry, market structure reform and rule changes. See [Regimes Overview](/regimes-macro/regimes-overview).
- **One test.** Assumes the reported result was not selected from many attempts. Almost never true. See [Multiple Testing](/stat-methods/multiple-testing) and [Backtest Overfitting](/stat-methods/backtest-overfitting).

> warning **Educational content, not advice** Nothing here recommends any strategy or instrument. A backtest that survives every check in this section is still only a hypothesis about the future.

---

#### Code

The most valuable summary of a backtest is not its return. It is the cost level at which the return disappears.

```python
def break_even_cost_bps(gross_annual_return, round_trips_per_year):
    """Cost per round trip, in bps, that reduces the strategy to zero.

    Quote this next to any headline result. A reader who knows the
    instrument can judge feasibility directly; they cannot judge a Sharpe.
    """
    return (gross_annual_return / round_trips_per_year) * 10_000


def cost_sensitivity(gross_annual_return, round_trips_per_year, cost_grid_bps):
    """Net annual return across a grid of cost assumptions.

    Reporting the curve rather than a single point makes the dependence
    on an unobservable assumption impossible to hide.
    """
    return [
        (cost_bps, gross_annual_return - round_trips_per_year * cost_bps / 10_000)
        for cost_bps in cost_grid_bps
    ]


gross_return, round_trips = 0.18, 250
print(round(break_even_cost_bps(gross_return, round_trips), 1))   # 7.2
print(cost_sensitivity(gross_return, round_trips, [2, 4, 6, 8, 10]))
```

---

#### See Also

* [Event-Driven Backtesting Basics](/simulation/event-driven)
* [Building a Simple Backtester](/simulation/building-backtester)
* [Performance Metrics for Backtests](/simulation/metrics)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)

---

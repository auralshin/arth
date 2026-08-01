### Transaction Cost Analysis

> info **Metadata** Level: Intermediate | Prerequisites: Implementation Shortfall, TWAP & VWAP, Hypothesis Testing | Tags: execution, tca, benchmarks, measurement, attribution

Transaction cost analysis (TCA) is the measurement discipline of execution: taking a population of orders and their fills, comparing them against reference prices, and producing statements about how much trading cost and why. **Pre-trade TCA** forecasts the cost of an order that has not happened yet, in order to choose a strategy. **Post-trade TCA** measures what actually happened, in order to improve the forecast and hold the process accountable.

The discipline's chief difficulty is that the answer depends on the question. The same order can be reported as a 36 basis point gain or an 80 basis point loss depending purely on which reference price is used, with no arithmetic error anywhere. That is not a flaw in the technique — it is the technique correctly reporting that "cost" is meaningless without a stated counterfactual.

---

#### Formal Definition

Cost against a benchmark price `P_b`, for an order with average fill `P_avg`:

```text
cost_bps = side * (P_avg - P_b) / P_b * 1e4        side = +1 buy, -1 sell
```

Positive is a cost. The candidate benchmarks are not variations on a theme; they answer different questions:

<table>
  <tbody>
    <tr><td><strong>Benchmark</strong></td><td><strong>Question it answers</strong></td></tr>
    <tr><td>Decision price</td><td>What did the whole implementation process cost the fund? This is implementation shortfall.</td></tr>
    <tr><td>Arrival price</td><td>What did the trading desk cost, given the order it received?</td></tr>
    <tr><td>Interval VWAP</td><td>Did the schedule track the market over the window it traded?</td></tr>
    <tr><td>Closing price</td><td>How does the fill compare to the mark the portfolio is valued at?</td></tr>
    <tr><td>Previous close / open</td><td>Almost nothing useful — it is dominated by overnight and intraday drift.</td></tr>
  </tbody>
</table>

Because a single order's cost is dominated by market movement, TCA is only meaningful in aggregate. For `n` orders with costs `c_i`:

```text
mean_cost = mean(c_i)
se        = stdev(c_i) / sqrt(n)
t         = mean_cost / se
```

---

#### Worked Example

A single buy order of 200,000 shares filling at an average of 30.14. The reference prices for that day:

<table>
  <tbody>
    <tr><td><strong>Benchmark</strong></td><td><strong>Price</strong></td><td><strong>Cost (bps)</strong></td><td><strong>Reads as</strong></td></tr>
    <tr><td>Arrival</td><td>30.08</td><td>+19.9</td><td>Cost of 19.9 bps</td></tr>
    <tr><td>Interval VWAP</td><td>30.12</td><td>+6.6</td><td>Cost of 6.6 bps</td></tr>
    <tr><td>Close</td><td>30.25</td><td>&minus;36.4</td><td>Beat the close by 36.4 bps</td></tr>
    <tr><td>Previous close</td><td>29.90</td><td>+80.3</td><td>Cost of 80.3 bps</td></tr>
  </tbody>
</table>

Check the first and third rows: `(30.14 - 30.08) / 30.08 = 0.001995 = 19.95 bps`, and `(30.14 - 30.25) / 30.25 = -0.003636 = -36.36 bps`.

One trade, one set of fills, a range of 116 basis points across benchmarks. The previous-close number is almost pure overnight drift and says nothing about execution. The close number rewards the trader for the market rising after they finished, which they did not cause. Only arrival and interval VWAP are about the trading window at all, and even they measure different things — arrival includes the price move during execution, interval VWAP nets it out.

**Aggregating.** Suppose the same desk ran 400 orders with a mean cost against arrival of 8.0 bps and a standard deviation across orders of 45 bps.

1. Standard error: `45 / sqrt(400) = 45 / 20 = 2.25 bps`, so `t = 8.0 / 2.25 = 3.56`
2. To detect a 2 bps improvement from a new algorithm with the same dispersion, at roughly the same confidence, you would need `n` such that `2.0 / (45 / sqrt(n))` is about `3.56`, giving `sqrt(n)` near 80 and `n` near 6,400 orders

The mean is roughly three and a half standard errors from zero, so the cost is clearly real rather than noise. Notice the implication for the individual order: with a per-order standard deviation of 45 bps, a single order at 19.9 bps sits **well inside one standard deviation** of the mean and is not evidence of anything. And the 6,400-order figure is before accounting for the fact that two samples are never drawn from the same market conditions.

> warning **Most algorithm comparisons are underpowered** Desks routinely switch strategies on a few hundred orders. At realistic dispersion that sample cannot distinguish a genuine few-basis-point improvement from luck. See [Hypothesis Testing](/stat-methods/hypothesis-testing) and [Multiple Testing](/stat-methods/multiple-testing).

---

#### Pre-Trade versus Post-Trade

**Pre-trade TCA** produces a forecast — expected cost and its uncertainty — from order size, participation, spread, volatility, and the chosen strategy, typically via an [impact model](/execution/market-impact) calibrated on the firm's own history. Its output is a decision: how urgently to trade, whether to break the order across days, whether the expected edge survives the expected cost.

**Post-trade TCA** compares realised to forecast. Its most valuable output is not the cost number but the **residual**: systematic deviation from the pre-trade forecast, sliced by name, size bucket, time of day, algorithm, and venue. A model that is unbiased on average but consistently underestimates cost for large orders in illiquid names is telling you something specific and actionable, which the aggregate mean hides. The loop between the two is the whole point: a TCA report that is only produced and filed is a compliance artefact, whereas one that recalibrates the pre-trade model is a control system.

---

#### Normalisation and Fair Comparison

Raw cost comparisons across orders are meaningless because orders differ in difficulty, so two normalisations are standard. **Cost per unit of expected difficulty** divides realised cost by the pre-trade forecast, or by `sigma * sqrt(Q/V)` from the square-root law, producing a dimensionless ratio comparable across names and sizes. **Cost per unit of volatility** expresses cost in units of the day's volatility rather than in basis points: a 20 bps cost in a name with 1% daily volatility is a much larger execution failure than 20 bps in a name with 4% daily volatility.

The residual after normalisation is where attribution lives. Without it, a desk that happened to receive easy orders looks skilled.

---

#### In Practice Across Asset Classes

**Equities.** The most developed TCA ecosystem, supported by a consolidated tape that makes interval VWAP and arrival prices well defined and independently verifiable. Third-party providers offer peer-universe comparisons, whose usefulness depends entirely on whether the peer set trades comparable difficulty.

**Futures.** Clean benchmarks from a single book. The complication is the roll: comparing fills across contract months requires adjusting for the calendar spread, and unadjusted TCA on a rolling position produces nonsense. **FX.** No consolidated tape, so every benchmark is venue- or composite-specific and providers disagree on the same trade. Published fixing rates are widely used, which concentrates flow into the fixing window and creates its own dynamics.

**Fixed income.** Benchmarks are evaluated or composite prices rather than traded prices, so TCA measures the fill against a model. In less liquid issues there may be no independent price at all for the relevant moment, and the honest report is that cost is not measurable — a statement most reporting frameworks have no field for. **On-chain.** Benchmarks are unusually clean, since the pool's pre-trade mid price is computable exactly from reserves at a known block. Meaningful TCA decomposes the fill into pool fee, curve slippage, gas in the traded numeraire, and any sandwich extraction inferable from the surrounding transactions in the same block. Reverted transactions must be included: they cost gas and produce no fill, and excluding them flatters the result systematically. See [Slippage](/microstructure/slippage), [Gas & Mempool](/microstructure/gas-mempool), and [MEV Formalised](/microstructure/mev-formal).

---

#### Assumptions and Failure Modes

- **The benchmark is independent of the trade.** VWAP and closing benchmarks are not, once you are a material share of volume. See [Execution Benchmarks](/execution/execution-benchmarks).
- **The order sample is representative.** It is selected: orders cancelled early, or never sent because pre-trade cost looked prohibitive, are absent, and they are the expensive ones. Measured average cost is therefore biased downward.
- **Cost is independent of alpha.** It is not. Orders are generated when prices are about to move, so those with the most edge are systematically the most expensive, and TCA that ignores this attributes alpha-driven drift to execution.
- **Per-order costs are independent draws.** They are not: orders in the same name, day, or factor cluster share market conditions, and treating them as independent understates the standard error, sometimes by a large factor.
- **The distribution is symmetric.** Cost distributions are fat-tailed and right-skewed. Reporting only the mean lets a handful of stressed-market orders dominate; reporting only the median hides them entirely. Report both.
- **Better measurement causes better execution.** Only if the measure is not the objective. Whatever TCA benchmark the desk is graded on will be optimised, including in ways that raise true cost.

---

#### Code

```python
import numpy as np


def cost_bps(avg_fill_px, benchmark_px, side="buy"):
    sign = 1.0 if side == "buy" else -1.0
    return sign * (avg_fill_px - benchmark_px) / benchmark_px * 1e4


def multi_benchmark(avg_fill_px, benchmarks, side="buy"):
    """Same fill against every reference. The spread between the outputs
    is the honest summary of how much the benchmark choice matters."""
    return {k: cost_bps(avg_fill_px, px, side) for k, px in benchmarks.items()}


multi_benchmark(30.14, {"arrival": 30.08, "interval_vwap": 30.12,
                        "close": 30.25, "prev_close": 29.90})
# {'arrival': 19.95, 'interval_vwap': 6.64, 'close': -36.36, 'prev_close': 80.27}


def cost_summary(costs_bps):
    """Aggregate TCA. Report the t-statistic, never a mean on its own."""
    c = np.asarray(costs_bps, dtype=float)
    se = c.std(ddof=1) / np.sqrt(len(c))
    return {"n": len(c), "mean": c.mean(), "median": float(np.median(c)),
            "stdev": c.std(ddof=1), "std_error": se,
            "t_stat": c.mean() / se if se else np.nan,
            "p95": float(np.percentile(c, 95))}


def orders_needed(effect_bps, dispersion_bps, t_target=2.0):
    """Sample size to detect an effect of a given size. Usually sobering."""
    return int(np.ceil((t_target * dispersion_bps / effect_bps) ** 2))


orders_needed(2.0, 45.0)        # 2025 orders for t = 2
orders_needed(2.0, 45.0, 3.56)  # 6417 orders for t = 3.56
```

---

#### See Also

* [Implementation Shortfall](/execution/implementation-shortfall)
* [Execution Benchmarks](/execution/execution-benchmarks)
* [Market Impact](/execution/market-impact)
* [Smart Order Routing](/execution/smart-order-routing)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Hypothesis Testing](/stat-methods/hypothesis-testing)

---

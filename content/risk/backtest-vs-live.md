### Backtest vs Live Trading: Why Results Differ

> info **Metadata** Level: Intermediate | Prerequisites: Sharpe Ratio, Slippage, Why Backtest | Tags: backtesting, overfitting, transaction-costs, capacity, selection-bias, risk

Almost every backtest overstates live performance. The interesting question is not whether yours does, but by how much and through which channels. The gap is not one mistake — it is a stack of small, individually defensible modelling choices, each of which happens to point the same way. Same-bar fills, a universe of names that still exist, costs assumed at the quoted spread, a size that never moves the market, parameters chosen with the benefit of the whole sample: none of these is fraudulent, and together they can turn a Sharpe of 1.2 into one near zero.

The productive discipline is to build an explicit bridge from the backtest number to a realistic live expectation, itemising every deduction. A bridge you can argue about is worth far more than a headline figure you cannot. It also tells you where to spend effort: if capacity is the largest line, better signal research will not help, and if costs dominate, a slower version of the same strategy may be the entire fix.

---

#### The Backtest-to-Live Bridge

The decomposition below is not an identity — the terms interact, and their order matters — but it names the channels that have to be accounted for.

```text
R_live = R_backtest
       - survivorship_and_universe_bias
       - lookahead_bias
       - transaction_costs (spread + fees + impact)
       - financing_and_borrow
       - capacity_decay(size)
       - regime_drift
       - selection_bias(number_of_trials)
```

where:

- `survivorship_and_universe_bias` is the return earned on instruments the backtest could see only because they survived
- `lookahead_bias` is return earned from information unavailable at decision time
- `capacity_decay(size)` is the additional impact incurred at real size, not backtested size
- `regime_drift` is the decay of the relationship the strategy exploits
- `selection_bias(number_of_trials)` is the portion of the result attributable to search rather than edge

The last term is different in kind from the others. The first six shrink a real edge. The last can manufacture an apparent edge where none exists at all.

---

#### Worked Example

A daily-rebalanced equity long/short backtest reports a 14.0% annual return on 12.0% annual volatility — a gross Sharpe of `14 / 12 = 1.17`. The bridge below applies illustrative haircuts to show the shape of the calculation. The percentages are assumptions for the example, not measured constants.

<table>
  <tbody>
    <tr><td><strong>Step</strong></td><td><strong>Adjustment</strong></td><td><strong>Effect</strong></td><td><strong>Running return</strong></td></tr>
    <tr><td>0</td><td>Gross backtest return as reported</td><td>&mdash;</td><td>14.0%</td></tr>
    <tr><td>1</td><td>Rebuild the universe from point-in-time index membership</td><td>-1.5%</td><td>12.5%</td></tr>
    <tr><td>2</td><td>Replace same-bar fills with next-bar fills; 80% of gross survives</td><td>-2.5%</td><td>10.0%</td></tr>
    <tr><td>3</td><td>Transaction costs: 50 one-way turns per year at 8 bps</td><td>-4.0%</td><td>6.0%</td></tr>
    <tr><td>4</td><td>Short borrow: 100% average short exposure at 80 bps</td><td>-0.8%</td><td>5.2%</td></tr>
    <tr><td>5</td><td>Capacity at 5x backtested size: impact rises 4 bps to 9 bps</td><td>-2.5%</td><td>2.7%</td></tr>
  </tbody>
</table>

Working through the arithmetic:

1. **Point-in-time universe**: `14.0% - 1.5% = 12.5%`
2. **Delay**: `12.5% * 0.80 = 10.0%`, a loss of 2.5 points
3. **Costs**: the 8 bps per one-way turn splits into a 3 bps half-spread, 1 bp of commission and 4 bps of impact. At 50 turns, `50 * 8 = 400 bps = 4.0%`
4. **Borrow**: `0.8%` on the short leg
5. **Capacity**: under a square-root impact law, impact scales with the square root of participation. At 5x size, `4 bps * sqrt(5) = 4 * 2.236 = 8.9 bps`, so about 5 bps more per turn. `50 * 5 = 250 bps = 2.5%`

Net expected return is 2.7%. If volatility is unchanged, the live Sharpe is `2.7 / 12 = 0.23` — one fifth of the reported figure. Nothing in this bridge required the signal to be fake.

> warning **Costs are not a footnote** In this example, execution-related deductions (steps 2, 3 and 5) account for 9.0 of the 11.3 percentage points lost. For a high-turnover strategy, cost modelling is the model. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).

---

#### The Six Channels

**Lookahead.** Using information that did not exist at decision time. The blatant form — trading on tomorrow's close — is easy to catch. The subtle forms are not: restated fundamentals, index membership applied from the announcement date rather than the effective date, forward-filled reference data, a z-score normalised over the full sample, or a corporate action applied on the wrong date. See [Data Cleaning](/data-tooling/cleaning).

**Survivorship and universe construction.** Testing on instruments that exist today omits every delisting, default, merger and failed venue. The bias is largest exactly where the strategy is most attractive: distressed names, small caps, new listings, young tokens.

**Costs.** A backtest that fills at the midpoint has assumed away the spread; one that fills at the touch has assumed away impact; one with a flat basis-point cost has assumed away the dependence on size and volatility. Each simplification is defensible on its own and understates cost in combination. See [Slippage](/microstructure/slippage) and [Fees & Routing](/microstructure/fees-routing).

**Capacity.** A strategy is a function of size. Impact grows roughly with the square root of participation, so returns per unit of capital decline as the book grows, and the decline is steepest in exactly the illiquid corners where the raw signal looks strongest. See [Market Impact](/execution/market-impact).

**Regime change.** The relationship being exploited may weaken because the environment changed, or because other participants found it. Both look identical in live P&L. A backtest spanning one interest-rate cycle or one volatility regime has tested one draw from a distribution of regimes. See [Regimes Overview](/regimes-macro/regimes-overview).

**Selection bias.** The result you report was chosen from many you computed. This is the channel most likely to be denied and most likely to matter.

---

#### Selection Bias and Multiple Testing

Suppose you test 50 strategy variants that all have genuinely zero edge, and you accept any variant significant at the 5% level. The probability that at least one passes is:

```text
P(at least one false positive) = 1 - (1 - 0.05)^50
                              = 1 - 0.95^50
                              = 1 - 0.077
                              = 0.923
```

You will find a "significant" strategy about 92% of the time, from nothing. And you will not report the 49 failures, so the reader sees a single 5%-level result rather than the search that produced it.

The trial count that matters is not the number of backtests you saved. It includes every parameter you nudged, every date range you shortened, every filter you tried and abandoned, and every idea you rejected after looking at its equity curve. This is why the honest number is almost always far larger than the recorded one, and why a p-value computed from a single final run is not a meaningful quantity. [Multiple Testing](/stat-methods/multiple-testing) covers the corrections; [Backtest Overfitting](/stat-methods/backtest-overfitting) covers the specific machinery — deflated Sharpe ratios, the probability of backtest overfitting, and combinatorially purged cross-validation.

> warning **Reusing a holdout destroys it** A holdout set that has informed even one decision is now part of the training data. Each look costs some of its protective value, and there is no way to spend it and keep it.

---

#### Diagnosing the Gap After Go-Live

Once live, the gap becomes measurable. Three comparisons do most of the work.

- **Shadow backtest.** Run the backtest over the live period with the same data and parameters, then compare its P&L to realised P&L day by day. A persistent, roughly constant gap points to costs. A gap that appears only on high-turnover days points to impact or fills. A gap that appears suddenly points to a regime change or a data problem.
- **Fill quality attribution.** Compare realised fills against arrival price and against a benchmark such as interval VWAP. Systematic underperformance versus arrival isolates execution from signal. See [Implementation Shortfall](/execution/implementation-shortfall) and [Execution Benchmarks](/execution/execution-benchmarks).
- **Signal decay curve.** Measure the strategy's gross return as a function of implementation delay. A steep curve means the edge is a microstructure effect that costs will consume; a flat curve means delay is not your problem.

Paper trading catches software bugs and data-availability errors well. It catches impact and adverse selection badly, because a simulated order neither moves the market nor competes for the queue.

---

#### In Practice Across Asset Classes

**Equities.** Survivorship and point-in-time universe construction are the dominant biases, along with corporate-action handling. Borrow availability and cost are frequently omitted entirely from short-side backtests. See [Corporate Actions](/markets/corporate-actions).

**Futures.** The continuous series is a construction, not a traded instrument. Roll methodology, roll timing and the treatment of the roll gap all change the return series materially. See [Roll and Carry](/markets/roll-and-carry).

**FX.** Quoted spreads in historical data often come from indicative feeds that were never tradeable in size. Carry strategies additionally depend on funding assumptions that a backtest usually treats as frictionless.

**Fixed income and credit.** Prices are frequently evaluated rather than traded, which smooths returns, understates volatility and inflates Sharpe. Liquidity assumptions in a backtest bear little relation to a stressed market.

**Options.** Backtests using end-of-day surfaces implicitly assume you could trade at the mid of a wide market. The spread on an out-of-the-money option can exceed its entire theoretical edge. See [Vol Surface](/derivatives/vol-surface).

**On-chain.** Historical pool state can be reconstructed exactly, which is a genuine advantage, but a replay does not simulate competition. Your transaction would have changed the ordering, the price and the behaviour of other searchers. Failed transactions, gas costs and priority fees are routinely excluded. See [Gas & Mempool](/microstructure/gas-mempool).

---

#### Assumptions and Failure Modes

- **Fills are assumed available.** Backtests fill every order. Live, resting orders miss, market orders get worse prices, and the fills you do get are disproportionately the ones you would rather not have had. See [Adverse Selection](/execution/adverse-selection).
- **Costs are assumed independent of the strategy.** They are not: a strategy trades most when volatility is high, which is exactly when spreads and impact are widest. Applying an average cost understates the correlation.
- **The sample is assumed representative.** A backtest is a single path. Bootstrap or block-resample it to see the distribution of outcomes rather than the one that happened. See [Bootstrap](/stat-methods/bootstrap).
- **Volatility is assumed unchanged live.** Live volatility usually exceeds backtested volatility, because the backtest smoothed away gaps, halts and failed executions.
- **Parameters are assumed stable.** A parameter fitted to the full sample is not a parameter you could have chosen. Walk-forward evaluation is the minimum honest standard. See [Param Sweeps](/simulation/param-sweeps).
- **Data is assumed clean.** Bad ticks, stale quotes and misaligned timestamps generate spurious edge, and the optimiser will find every one of them. See [Data Prep](/simulation/data-prep).
- **Independence across trials is assumed when correcting for multiple testing.** Strategy variants are highly correlated, so naive Bonferroni corrections are too harsh and naive p-values far too lenient. Neither extreme is right.

> warning **Educational content only** This page explains why measured backtest performance overstates live results. It is not advice to trade any strategy, and no figure here is a forecast.

---

#### Code

```python
def backtest_to_live_bridge(gross_return, survivorship_haircut, delay_retention,
                            one_way_turns, cost_bps, borrow_cost, size_multiple,
                            impact_bps):
    """Itemised deductions from a backtest return to a live expectation.

    Returns the running total at each step so the largest line is visible.
    Impact scales with the square root of participation.
    """
    steps = [("gross", gross_return)]
    running = gross_return - survivorship_haircut
    steps.append(("point_in_time_universe", running))

    running *= delay_retention
    steps.append(("execution_delay", running))

    running -= one_way_turns * cost_bps / 10_000
    steps.append(("transaction_costs", running))

    running -= borrow_cost
    steps.append(("financing", running))

    extra_impact = impact_bps * (size_multiple ** 0.5 - 1)
    running -= one_way_turns * extra_impact / 10_000
    steps.append(("capacity", running))

    return steps
```

---

#### See Also

* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Sharpe Ratio](/quant-math/sharpe)
* [Why Backtest](/simulation/why-backtest)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Risk Checklists](/risk/checklists)

---

### Walkthrough: Backtesting a Simple RSI Strategy

> info **Metadata** Level: Intermediate | Prerequisites: RSI, Returns, Sharpe Ratio, Hypothesis Testing | Tags: case-study, backtesting, rsi, research-process, transaction-costs

This page walks a single oscillator rule from hypothesis to verdict. The point is not the rule — it is the sequence of checks that turns a promising equity curve into an honest answer, and the arithmetic that shows where an apparent edge actually came from.

The result is negative, which is the normal outcome of a research project. Most of the work in systematic research is establishing that something does *not* work, cheaply and before capital is committed.

> info **A constructed example** The numbers below are chosen to illustrate the mechanism clearly. This is not a report of a specific historical event, instrument, or backtest.

---

#### Setup: The Hypothesis, Data, and Rules

State the hypothesis before writing code, in a form that can be wrong. Ours: *in a single liquid instrument, short-horizon oversold readings are followed by above-average returns over the following one to two weeks, by more than it costs to trade them.*

<table>
  <tbody>
    <tr><td><strong>Element</strong></td><td><strong>Choice</strong></td></tr>
    <tr><td>Instrument</td><td>One liquid, continuously-traded instrument</td></tr>
    <tr><td>Data</td><td>Daily open/high/low/close, six years, 1,512 trading days</td></tr>
    <tr><td>Signal</td><td>14-period <code>RSI</code> on closes, Wilder smoothing</td></tr>
    <tr><td>Entry</td><td>Buy at the next open after a close with <code>RSI</code> below 30</td></tr>
    <tr><td>Exit</td><td>Sell at the next open after a close with <code>RSI</code> above 50, or after 20 days</td></tr>
    <tr><td>Sizing</td><td>Full notional, long only, no leverage, one position at a time</td></tr>
    <tr><td>Costs</td><td>2 bps commission and 5 bps spread per side, so 14 bps per round trip</td></tr>
  </tbody>
</table>

Three details do most of the work in avoiding lookahead bias. The signal is computed on the close and acted on at the *next* open, so no bar's own information is used to trade it. The exit is symmetric with the entry. And the time stop means the sample has no open-ended positions whose fate depends on where the data happens to end.

---

#### What Happens: The Raw Result

The rule fires 128 times over six years, about 21 round trips per year, with a mean holding period of seven trading days. That puts the strategy in the market for `128 * 7 / 1512 = 59%` of the sample.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Round-trip trades</td><td>128</td></tr>
    <tr><td>Mean gross return per trade</td><td>0.55%</td></tr>
    <tr><td>Standard deviation per trade</td><td>2.40%</td></tr>
    <tr><td>Gross compounded return, six years</td><td>101.8%, or 12.4% per annum</td></tr>
    <tr><td>Net compounded return, six years</td><td>68.8%, or 9.1% per annum</td></tr>
    <tr><td>Annualised volatility of the strategy</td><td>11.1%</td></tr>
    <tr><td>Sharpe ratio, net, zero cash rate</td><td>0.79</td></tr>
    <tr><td>Buy-and-hold over the same window</td><td>10.5% per annum, 22% volatility, Sharpe 0.48</td></tr>
  </tbody>
</table>

A Sharpe of 0.79 against a buy-and-hold Sharpe of 0.48, with two-fifths of the time in cash, looks like a result. It is not.

---

#### The Arithmetic

**Step 1 — costs.** Commission and spread cost 14 bps per round trip. Mean gross return per trade is 0.55%, so the mean net return is `0.55% - 0.14% = 0.41%`. Compounded over 128 trades: `1.0041^128 = 1.688`, or 9.1% per annum. Costs removed 3.3 percentage points a year.

**Step 2 — subtract the market you were holding anyway.** A long position earns the instrument's drift whether or not the signal has any content. Over the same seven-day average holding period, at the buy-and-hold rate of 10.5% per annum:

```text
passive_drift = (1 + 0.105)^(7/252) - 1 = 0.278% per trade
```

So of the 0.55% gross per trade, 0.28% is simply being long for a week. The **timing component** — everything the signal contributed — is `0.55% - 0.28% = 0.27%` per trade, and after the 14 bps of costs, `0.13%`.

**Step 3 — put an error bar on it.** With a per-trade standard deviation of 2.40% and 128 trades, the standard error of the mean is:

```text
SE = 0.0240 / sqrt(128) = 0.212% per trade
```

<table>
  <tbody>
    <tr><td><strong>Measure</strong></td><td><strong>Mean per trade</strong></td><td><strong>t-statistic</strong></td></tr>
    <tr><td>Gross</td><td>0.55%</td><td>2.59</td></tr>
    <tr><td>Net of costs</td><td>0.41%</td><td>1.93</td></tr>
    <tr><td>Net of costs and passive drift</td><td>0.13%</td><td>0.62</td></tr>
  </tbody>
</table>

The headline `t = 2.59` becomes 0.62 once the two things that were never the signal's doing are removed. Annualised, the genuine timing edge is worth about 2.9 percentage points a year, and it is indistinguishable from zero.

**Step 4 — account for the search.** The 14/30/50 parameters were not handed down; they were the best of a grid of 48 combinations of lookback, entry threshold, and exit threshold. The expected largest t-statistic among 48 independent draws from a distribution with no edge at all is approximately:

```text
E[max t] ~= sqrt(2 * ln 48) - (ln ln 48 + ln(4 * pi)) / (2 * sqrt(2 * ln 48)) = 2.08
```

The net-of-cost `t = 1.93` is *below* what pure search would be expected to produce. A Bonferroni threshold for 5% significance across 48 tests requires an absolute t-statistic above 3.28. Neither figure survives.

**Step 5 — hold out data you never looked at.** Split the sample: fit on the first four years, evaluate on the last two.

<table>
  <tbody>
    <tr><td><strong>Window</strong></td><td><strong>Net return per annum</strong></td></tr>
    <tr><td>Years 1 to 4, used to choose parameters</td><td>12.9%</td></tr>
    <tr><td>Years 5 to 6, never examined</td><td>1.9%</td></tr>
    <tr><td>Full six years combined</td><td>9.1%</td></tr>
  </tbody>
</table>

Two years is far too short to conclude the edge is gone; that is exactly the problem. The honest statement is that the out-of-sample window neither confirms nor refutes anything, and the in-sample window was never evidence to begin with.

> warning **A held-out window is spent the first time you look at it** Once the out-of-sample result informs a change to the rules, that data has become in-sample and the next evaluation is no longer clean.

---

#### What This Teaches

The apparent edge decomposed into three parts, only one of which was the signal:

<table>
  <tbody>
    <tr><td><strong>Component</strong></td><td><strong>Per trade</strong></td><td><strong>Per annum</strong></td></tr>
    <tr><td>Passive exposure while holding</td><td>0.28%</td><td>6.1 pp</td></tr>
    <tr><td>Trading costs</td><td>-0.14%</td><td>-3.0 pp</td></tr>
    <tr><td>Signal timing, the only part in question</td><td>0.27%</td><td>6.0 pp</td></tr>
    <tr><td>Net realised</td><td>0.41%</td><td>9.1 pp</td></tr>
  </tbody>
</table>

The Sharpe advantage over buy-and-hold is also less impressive than it looked. The strategy is in cash 41% of the time, which mechanically lowers volatility. Comparing a part-time position to a full-time one on Sharpe without adjusting for time in market flatters the part-time one.

---

#### How to Do This Better

- **Benchmark against a null that shares the exposure.** Draw 128 random seven-day entry dates and measure the same statistics. Any result that a random-entry control also produces is not a signal.
- **Record the size of the search.** Count every parameter combination, every variant of the exit, and every instrument tried. That count is an input to the significance threshold, not a footnote.
- **Model costs before admiring the curve.** At a seven-day holding period, 14 bps per round trip consumed a quarter of the gross return. At a one-day holding period it would consume all of it. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Test the conclusion, not the parameters.** If the hypothesis is about oversold readings, it should survive replacing `RSI` with a different oscillator. If it only works at one setting, the setting is the finding.
- **Use resampling for the error bar.** A block bootstrap over trades gives a distribution of Sharpe ratios and is more informative than a single point estimate. See [Bootstrap](/stat-methods/bootstrap).

---

#### Assumptions and Failure Modes

- **Costs are constant.** The 14 bps assumes the same spread in calm and stressed conditions. Mean-reversion entries fire disproportionately when spreads are wide, so realised costs skew higher than the average.
- **Fills at the open are achievable.** Every trade is assumed to execute at the next open at no additional impact. For a small position in a liquid instrument this is reasonable; it is not general.
- **Idle capital earns nothing.** The Sharpe of 0.79 uses a zero cash rate. With a positive cash rate the strategy's 41% idle time earns interest, but so does the comparison, and the ranking against buy-and-hold shifts.
- **One instrument, one sample.** A single six-year window on a single instrument gives no cross-sectional replication. The same test across many uncorrelated instruments is far stronger evidence than the same test with more parameters.
- **The passive-drift adjustment uses the realised drift.** The 0.278% figure is computed from the buy-and-hold return actually observed in the sample, which is itself a noisy estimate. A wider confidence interval on the drift widens the interval on the timing component.
- **Survivorship in instrument choice.** Choosing the instrument after seeing which one the rule worked on is the same selection problem as choosing the parameters, and is usually invisible in the write-up.

---

#### See Also

* [RSI](/signals/rsi)
* [RSI Strategy](/strategies/rsi-strategy)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Case Study: A Strategy That Failed, and Why](/case-studies/failed-strategy)

---

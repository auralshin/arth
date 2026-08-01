### Metric Index

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility | Tags: reference, metrics, performance, risk, evaluation, lookup

Every performance and risk measure used across Arth: what it measures, its formula in brief, how to read the number, and where it is derived. These are the quantities that decide whether a strategy is worth running, and each of them closes off one specific way a backtest can flatter you.

No single metric is sufficient. Sharpe cannot see skew, drawdown cannot see frequency, turnover cannot see fillability. The right output of an evaluation is a battery, and the point of this index is to make the battery easy to assemble.

> info **Metrics versus indicators** Metrics evaluate a strategy's *results*. Indicators are computed from market data and feed into the strategy's decisions — moving averages, RSI, order book imbalance. For those, see the [Indicator Index](/reference/indicators).

---

#### Return

<table>
  <tbody>
    <tr>
      <td><strong>Metric</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Period return</td>
      <td>Change in equity over one period</td>
      <td><code>R_t = E_t / E_prev - 1</code></td>
      <td>Compute from the ledger equity curve, never from signal values</td>
    </tr>
    <tr>
      <td>Cumulative return</td>
      <td>Total growth over the sample</td>
      <td><code>prod(1 + R_t) - 1</code></td>
      <td>Dominated by the sample window chosen; always report the window</td>
    </tr>
    <tr>
      <td>Annualised return (CAGR)</td>
      <td>The constant yearly rate that produces the same ending wealth</td>
      <td><code>g = (W_n / W_0)^(1/n) - 1</code></td>
      <td>Always below the arithmetic mean; the gap grows with volatility</td>
    </tr>
    <tr>
      <td>Excess return</td>
      <td>Return above the risk-free rate or a benchmark</td>
      <td><code>R_t - Rf</code> or <code>R_t - R_benchmark</code></td>
      <td>State which baseline you used; the choice changes every ratio below</td>
    </tr>
    <tr>
      <td>Alpha</td>
      <td>Return not explained by factor exposures</td>
      <td>Intercept of <code>R_i - Rf = alpha + sum b_ij F_j + e_i</code></td>
      <td>Falls as you add factors; report the factor set alongside it</td>
    </tr>
  </tbody>
</table>

Pages: [Returns](/quant-math/returns), [Factor Models](/stat-methods/factor-models), [Benchmark: Buy and Hold vs Do Nothing](/strategies/buy-hold).

---

#### Risk and Dispersion

<table>
  <tbody>
    <tr>
      <td><strong>Metric</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Volatility</td>
      <td>Dispersion of period returns, annualised</td>
      <td><code>sigma * sqrt(periods_per_year)</code></td>
      <td>Treats upside and downside identically; scaling assumes no autocorrelation</td>
    </tr>
    <tr>
      <td>Downside deviation</td>
      <td>Dispersion of returns below a target only</td>
      <td><code>sqrt( sum min(R_t - MAR, 0)^2 / n )</code></td>
      <td>Dividing by n rather than the count of losses is the usual convention; state yours</td>
    </tr>
    <tr>
      <td>Skewness</td>
      <td>Asymmetry of the return distribution</td>
      <td>Third standardised moment</td>
      <td>Negative skew means many small gains and rare large losses</td>
    </tr>
    <tr>
      <td>Excess kurtosis</td>
      <td>Tail weight relative to a normal distribution</td>
      <td>Fourth standardised moment minus three</td>
      <td>Large positive values make normal-based risk numbers optimistic</td>
    </tr>
    <tr>
      <td>Value at Risk (VaR)</td>
      <td>Loss quantile over a horizon</td>
      <td><code>VaR_a = z_a * sigma</code> under normality</td>
      <td>Says nothing about how bad the tail is beyond the threshold</td>
    </tr>
    <tr>
      <td>Conditional VaR (CVaR)</td>
      <td>Average loss conditional on breaching VaR</td>
      <td><code>E[L | L at least VaR_a]</code></td>
      <td>Coherent where VaR is not, but needs more data to estimate</td>
    </tr>
    <tr>
      <td>Beta</td>
      <td>Sensitivity to a benchmark or factor</td>
      <td><code>Cov(R_p, R_m) / Var(R_m)</code></td>
      <td>A market-neutral book with nonzero beta is not market-neutral</td>
    </tr>
    <tr>
      <td>Tracking error</td>
      <td>Volatility of return differences against a benchmark</td>
      <td><code>stdev(R_p - R_benchmark)</code></td>
      <td>The denominator of the information ratio</td>
    </tr>
  </tbody>
</table>

Pages: [Volatility](/quant-math/volatility), [VaR & CVaR](/quant-math/var-cvar), [Expectation & Variance](/quant-math/expectation-variance), [Types of Risk](/risk/types), [Equity Indices](/markets/equity-indices).

---

#### Risk-Adjusted Return

<table>
  <tbody>
    <tr>
      <td><strong>Metric</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Sharpe ratio</td>
      <td>Excess return per unit of volatility</td>
      <td><code>S = (E[R] - Rf)/sigma(R)</code></td>
      <td>Blind to skew, kurtosis, path, and autocorrelation. Quote it with the sample length</td>
    </tr>
    <tr>
      <td>Annualised Sharpe</td>
      <td>Sharpe put on a yearly footing</td>
      <td><code>S_period * sqrt(periods_per_year)</code></td>
      <td>Inflated when returns are positively autocorrelated or marks are smoothed</td>
    </tr>
    <tr>
      <td>Sharpe standard error</td>
      <td>Uncertainty in the Sharpe estimate</td>
      <td><code>sqrt((1 + 0.5*S^2)/n)</code></td>
      <td>At small n the interval is wide enough to contain almost any conclusion</td>
    </tr>
    <tr>
      <td>Sortino ratio</td>
      <td>Excess return per unit of downside deviation</td>
      <td><code>(E[R] - MAR)/DD</code></td>
      <td>Fixes Sharpe's symmetry problem, not its path blindness</td>
    </tr>
    <tr>
      <td>Calmar ratio</td>
      <td>Annual return per unit of worst drawdown</td>
      <td><code>annualised_return / abs(MDD)</code></td>
      <td>Rests on a single order statistic, so it is extremely noisy</td>
    </tr>
    <tr>
      <td>Information ratio</td>
      <td>Active return per unit of tracking error</td>
      <td><code>mean(R_p - R_b)/stdev(R_p - R_b)</code></td>
      <td>The right ratio when the mandate is relative rather than absolute</td>
    </tr>
    <tr>
      <td>t-statistic of returns</td>
      <td>Whether mean return is distinguishable from zero</td>
      <td><code>t = Sharpe_annual * sqrt(years)</code></td>
      <td>Makes the sample-length requirement explicit</td>
    </tr>
    <tr>
      <td>Deflated Sharpe ratio</td>
      <td>Sharpe corrected for trial count, skew, kurtosis, and sample length</td>
      <td>See the derivation on the linked page</td>
      <td>The honest version of a Sharpe found by searching</td>
    </tr>
  </tbody>
</table>

Pages: [Sharpe Ratio](/quant-math/sharpe), [Sortino Ratio](/quant-math/sortino), [Confidence Intervals](/stat-methods/confidence-intervals), [Backtest Overfitting](/stat-methods/backtest-overfitting), [Performance Metrics for Backtests](/simulation/metrics).

---

#### Drawdown Family

<table>
  <tbody>
    <tr>
      <td><strong>Metric</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Drawdown</td>
      <td>Current decline from the running peak</td>
      <td><code>DD_t = (V_t - Peak_t)/Peak_t</code></td>
      <td>The number an investor actually experiences, unlike volatility</td>
    </tr>
    <tr>
      <td>Maximum drawdown</td>
      <td>Worst peak-to-trough decline in the sample</td>
      <td><code>MDD = min(DD_t)</code></td>
      <td>Grows mechanically with sample length even with no change in the process</td>
    </tr>
    <tr>
      <td>Required recovery gain</td>
      <td>Gain needed to return to the old peak</td>
      <td><code>d / (1 - d)</code></td>
      <td>A 50% loss needs a 100% gain; the asymmetry is the point</td>
    </tr>
    <tr>
      <td>Time to trough</td>
      <td>How long the decline took</td>
      <td>Periods from peak to lowest point</td>
      <td>Fast declines and slow bleeds feel entirely different</td>
    </tr>
    <tr>
      <td>Recovery time</td>
      <td>How long it took to regain the old peak</td>
      <td>Periods from trough back to peak</td>
      <td>Often the binding constraint on whether a strategy survives</td>
    </tr>
    <tr>
      <td>Time under water</td>
      <td>Total periods spent below a previous peak</td>
      <td>Count of periods with drawdown below zero</td>
      <td>Captures frequency where maximum drawdown captures only depth</td>
    </tr>
  </tbody>
</table>

Pages: [Drawdown](/quant-math/drawdown), [Performance Metrics for Backtests](/simulation/metrics), [Bootstrap](/stat-methods/bootstrap).

---

#### Trade-Level Metrics

<table>
  <tbody>
    <tr>
      <td><strong>Metric</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Hit rate</td>
      <td>Frequency of positive periods or trades</td>
      <td><code>count(R positive)/count(R nonzero)</code></td>
      <td>Meaningless alone; a 30% hit rate can be excellent</td>
    </tr>
    <tr>
      <td>Payoff ratio</td>
      <td>Average win against average loss</td>
      <td><code>mean(win)/|mean(loss)|</code></td>
      <td>Read jointly with hit rate; the two trade off by construction</td>
    </tr>
    <tr>
      <td>Break-even hit rate</td>
      <td>The win rate a given payoff ratio requires</td>
      <td><code>p* = s / (s + g)</code> for stop s and target g</td>
      <td>Turns an exit rule into an explicit accuracy requirement</td>
    </tr>
    <tr>
      <td>Number of trades</td>
      <td>Effective sample size for inference</td>
      <td>Count of independent round trips</td>
      <td>Overlapping positions reduce the effective count below the nominal one</td>
    </tr>
    <tr>
      <td>Fill rate</td>
      <td>Share of passive orders that trade</td>
      <td><code>filled / submitted</code></td>
      <td>A high fill rate on passive orders often signals adverse selection</td>
    </tr>
  </tbody>
</table>

Pages: [Stop-Loss and Take-Profit Frameworks](/strategies/stop-loss), [Meta-Labelling](/ml-finance/meta-labelling), [Order Types](/execution/order-types), [Adverse Selection](/execution/adverse-selection).

---

#### Cost, Capacity, and Implementation

These are the metrics a return series cannot produce. The backtester must record them as it runs, and a framework that reports only returns has already discarded the information.

<table>
  <tbody>
    <tr>
      <td><strong>Metric</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Turnover</td>
      <td>Traded notional relative to capital</td>
      <td><code>sum |traded_notional| / (periods * average_equity)</code></td>
      <td>The multiplier converting per-trade cost into annual drag</td>
    </tr>
    <tr>
      <td>Cost drag</td>
      <td>Performance lost to trading costs</td>
      <td><code>turnover * round_trip_cost_bps</code></td>
      <td>Compare directly against gross edge before anything else</td>
    </tr>
    <tr>
      <td>Net edge per trade</td>
      <td>Gross edge less the round-trip cost</td>
      <td><code>gross_edge_bps - round_trip_cost_bps</code></td>
      <td>If this is negative, no amount of Sharpe engineering helps</td>
    </tr>
    <tr>
      <td>Slippage</td>
      <td>Achieved price against a reference</td>
      <td><code>10000 * side * (P_exec - P_ref)/P_ref</code></td>
      <td>Depends entirely on which reference you chose</td>
    </tr>
    <tr>
      <td>Implementation shortfall</td>
      <td>Full cost from decision to completion</td>
      <td><code>delay + execution + opportunity + fees</code></td>
      <td>The only cost measure that counts the trade you failed to do</td>
    </tr>
    <tr>
      <td>Markout</td>
      <td>Mid-price drift after a fill</td>
      <td><code>side * (mid(t+h) - fill_price)</code></td>
      <td>Persistently negative markouts mean the flow is toxic</td>
    </tr>
    <tr>
      <td>Participation rate</td>
      <td>Your share of market volume while trading</td>
      <td><code>your_volume / market_volume</code></td>
      <td>Drives impact; a backtest that ignores it overstates capacity</td>
    </tr>
    <tr>
      <td>Capacity</td>
      <td>Size at which impact consumes the edge</td>
      <td>Solve <code>edge_bps = impact_bps(Q)</code> for Q</td>
      <td>Falls as competitors crowd into the same trade</td>
    </tr>
  </tbody>
</table>

Pages: [Market Impact](/execution/market-impact), [Implementation Shortfall](/execution/implementation-shortfall), [Transaction Cost Analysis](/execution/transaction-cost-analysis), [Backtest vs Live Trading](/risk/backtest-vs-live), [Rebalancing](/quant-math/rebalancing).

---

#### Exposure and Leverage

<table>
  <tbody>
    <tr>
      <td><strong>Metric</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Gross exposure</td>
      <td>Total absolute position value relative to equity</td>
      <td><code>sum |position_i| / equity</code></td>
      <td>What determines margin usage and financing cost</td>
    </tr>
    <tr>
      <td>Net exposure</td>
      <td>Signed position value relative to equity</td>
      <td><code>sum position_i / equity</code></td>
      <td>Directional tilt; zero net does not imply zero factor risk</td>
    </tr>
    <tr>
      <td>Leverage</td>
      <td>Position notional against capital at risk</td>
      <td><code>L = q * P_0 / E_0</code></td>
      <td>Scales returns and shortens the distance to liquidation equally</td>
    </tr>
    <tr>
      <td>Health factor</td>
      <td>Distance from a forced close on a collateralised position</td>
      <td><code>collateral * threshold / debt</code></td>
      <td>Below one triggers liquidation; monitor the path, not the level</td>
    </tr>
    <tr>
      <td>Concentration</td>
      <td>Share of risk in the largest positions</td>
      <td>Largest weights, or a Herfindahl index of weights</td>
      <td>A diversified-looking book can be one bet in disguise</td>
    </tr>
  </tbody>
</table>

Pages: [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation), [Position Sizing](/quant-math/position-sizing), [Building Risk Notes into Every Strategy](/risk/checklists).

---

#### Robustness and Research Hygiene

<table>
  <tbody>
    <tr>
      <td><strong>Metric</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Number of trials</td>
      <td>How many variants were tested before this one was reported</td>
      <td>Count every configuration run, including abandoned ones</td>
      <td>Without it, no Sharpe can be interpreted</td>
    </tr>
    <tr>
      <td>Expected best-of-N Sharpe</td>
      <td>What pure noise would have produced across N trials</td>
      <td><code>sqrt(2 * ln N)/sqrt(T)</code></td>
      <td>The hurdle a reported Sharpe must clear to mean anything</td>
    </tr>
    <tr>
      <td>Minimum backtest length</td>
      <td>Sample needed for a target Sharpe to be credible after N trials</td>
      <td>See the derivation on the linked page</td>
      <td>Often longer than the data you have</td>
    </tr>
    <tr>
      <td>Probability of backtest overfitting</td>
      <td>Chance the selected configuration underperforms out of sample</td>
      <td>Estimated by combinatorially split resampling</td>
      <td>Values near one half mean the selection carried no information</td>
    </tr>
    <tr>
      <td>Information coefficient</td>
      <td>Raw predictive correlation of a signal</td>
      <td><code>IC = corr(s_t, R_next)</code></td>
      <td>Small is normal; the sample size decides whether it is real</td>
    </tr>
    <tr>
      <td>Bootstrap confidence interval</td>
      <td>Sampling uncertainty in any of the metrics above</td>
      <td>Percentiles of the resampled statistic</td>
      <td>Use block resampling so serial dependence survives</td>
    </tr>
  </tbody>
</table>

Pages: [Backtest Overfitting](/stat-methods/backtest-overfitting), [Multiple Testing](/stat-methods/multiple-testing), [Bootstrap](/stat-methods/bootstrap), [Parameter Sweeps and Sensitivity Analysis](/simulation/param-sweeps), [What Is a Trading Signal?](/signals/what-is-signal).

---

#### Reading a Battery Rather Than a Number

Each metric closes off a specific failure. Read them together in this order and most bad results reveal themselves early.

- **Is the edge real?** Number of trials, t-statistic, deflated Sharpe, out-of-sample performance.
- **Does it survive costs?** Turnover, net edge per trade, participation rate, capacity.
- **Is the risk what it appears to be?** Skew, kurtosis, CVaR, gross and net exposure, factor beta.
- **Could it be lived through?** Maximum drawdown, recovery time, time under water.
- **Does it depend on one period?** Distribution of daily profit, performance excluding the best five sessions, stability across regimes.

> warning **Every metric on this page is a sample statistic** Each has a standard error, and at typical sample lengths that error is large. Reporting a metric without its sample length and trial count is not a result, it is a claim. See [Backtest vs Live Trading](/risk/backtest-vs-live).

---

#### See Also

* [Performance Metrics for Backtests](/simulation/metrics)
* [Sharpe Ratio](/quant-math/sharpe)
* [Drawdown](/quant-math/drawdown)
* [Indicator Index](/reference/indicators)
* [Formula Reference](/reference/formulas)
* [Glossary](/reference/glossary)

---

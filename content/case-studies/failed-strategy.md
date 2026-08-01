### Case Study: A Strategy That Failed, and Why

> info **Metadata** Level: Advanced | Prerequisites: Sharpe Ratio, Backtesting, Market Impact, Multiple Testing | Tags: case-study, backtest-vs-live, capacity, overfitting, regime-change

In the constructed example on this page, a backtest promised a Sharpe ratio of 1.89 and eighteen months of live trading delivered 0.26. What follows takes that gap apart and assigns a number to each cause, because "the backtest was overfit" is a diagnosis that explains everything and therefore nothing.

The value of the exercise is that the four causes below have different remedies. Cost misestimation is fixed by measurement. Capacity is fixed by sizing. Overfitting is fixed by discipline before the fact. Regime change cannot be fixed at all, only survived. Knowing which one dominated determines whether the strategy is repairable.

> info **A constructed example** Every number on this page, including the two Sharpe ratios above, is chosen to illustrate the mechanism clearly. This is not a report of a specific fund, strategy, or period.

---

#### Setup: The Strategy and Its Backtest

A cross-sectional mean-reversion strategy on a universe of 200 liquid names. Each day, rank names by their residual return over the past five days after removing a market factor, go long the bottom decile and short the top decile, dollar-neutral, and rebalance daily.

<table>
  <tbody>
    <tr><td><strong>Backtest parameter</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>History</td><td>12 years of daily data</td></tr>
    <tr><td>Universe</td><td>200 names, median daily volume 8,000,000 per name</td></tr>
    <tr><td>Rebalance</td><td>Daily, 25% one-way turnover per day</td></tr>
    <tr><td>Assumed cost</td><td>2.0 bps per unit of one-way notional, commission only</td></tr>
    <tr><td>Reported return</td><td>18.0% per annum, net of assumed costs</td></tr>
    <tr><td>Reported volatility</td><td>9.5% per annum</td></tr>
    <tr><td>Reported Sharpe</td><td>1.89</td></tr>
    <tr><td>Configurations tested</td><td>24, across lookback, decile width, and neutralisation choice</td></tr>
  </tbody>
</table>

The strategy was piloted at 15,000,000 of capital for three months, then scaled to 120,000,000. Eighteen months after the pilot began, the live record showed 2.6% per annum at 10.1% volatility, a Sharpe of 0.26.

---

#### The Arithmetic: Attributing 15.4 Percentage Points

Annual one-way turnover is `0.25 * 252 = 63` times the portfolio value. That multiplier is what makes every per-trade error large.

**1. Cost understatement — 4.4 percentage points.** The backtest charged 2.0 bps of commission and nothing else. Measured live, the all-in one-way cost was 9.0 bps: 2.0 of commission, 4.5 of half-spread, and 2.5 of impact at pilot size. The gap is 7.0 bps:

```text
cost_drag = 63 * 7.0 bps = 441 bps = 4.41 percentage points per year
```

**2. Capacity — 3.1 percentage points.** Impact grows with participation. Using a square-root model calibrated as `impact_bps = 55 * sqrt(participation)`:

<table>
  <tbody>
    <tr><td><strong>Size</strong></td><td><strong>Daily notional per name</strong></td><td><strong>Participation</strong></td><td><strong>Impact</strong></td></tr>
    <tr><td>Pilot, 15,000,000</td><td>18,750</td><td>0.234%</td><td>2.66 bps</td></tr>
    <tr><td>Full, 120,000,000</td><td>150,000</td><td>1.875%</td><td>7.53 bps</td></tr>
  </tbody>
</table>

The incremental 4.87 bps of one-way impact, at 63 turns a year, costs `63 * 4.87 bps = 307 bps`, or 3.07 percentage points. Note that the pilot's three-month record was measured at the low participation and could not have revealed this.

**3. Selection across the search — 5.0 percentage points.** Twenty-four configurations were evaluated on the same 12 years. The expected maximum t-statistic among 24 independent tests with no edge at all is approximately:

```text
E[max t] ~= sqrt(2 * ln 24) - (ln ln 24 + ln(4 * pi)) / (2 * sqrt(2 * ln 24)) = 1.79
```

Over 12 years, an annualised Sharpe `S` produces `t = S * sqrt(12)`, so `t = 1.79` corresponds to `S = 1.79 / 3.464 = 0.52`. At 9.5% volatility that is 4.9 percentage points of return per year that the search alone would be expected to manufacture out of noise.

**4. Regime change — 2.9 percentage points, as a residual.** Whatever the first three do not explain:

```text
18.0 - 4.4 - 3.1 - 5.0 - 2.6 = 2.9 percentage points
```

Calling this "regime change" is a label, not a measurement. It is the part of the gap the other three cannot account for, and it may equally be crowding, a data error, or an execution defect not yet found.

<table>
  <tbody>
    <tr><td><strong>Source</strong></td><td><strong>Percentage points per year</strong></td><td><strong>Remedy</strong></td></tr>
    <tr><td>Backtest reported</td><td>18.0</td><td>—</td></tr>
    <tr><td>Cost understatement</td><td>-4.4</td><td>Measure realised costs, recharge the backtest</td></tr>
    <tr><td>Capacity at full size</td><td>-3.1</td><td>Cap capital at the size the impact model supports</td></tr>
    <tr><td>Selection across 24 tests</td><td>-5.0</td><td>Deflate for the search beforehand, not after</td></tr>
    <tr><td>Unexplained residual</td><td>-2.9</td><td>Keep investigating</td></tr>
    <tr><td>Live realised</td><td>2.6</td><td>—</td></tr>
  </tbody>
</table>

---

#### What This Teaches: The Live Sample Is Too Short to Conclude Anything

Before declaring the strategy dead, ask whether 18 months of live data can distinguish 0.26 from 1.89. For an annualised Sharpe `S` measured over `T` years:

```text
SE(S) ~= sqrt((1 + S^2 / (2 * q)) / T)
```

where `q` is the number of return observations per year. With `S = 0.26`, `q = 252`, and `T = 1.5`, the standard error is 0.82, and the 95% interval on the live Sharpe runs from -1.34 to 1.86.

The backtest value of 1.89 sits just outside that interval. It is rejected, but barely. Had the live period been twelve months instead of eighteen, the interval would have contained it and there would be no statistical case at all.

> warning **Live underperformance is usually unfalsifiable in the short run** A Sharpe estimate needs years, not months, to become precise. Cutting a strategy after a short live period is a risk-management decision, not a statistical one, and should be argued as such.

This is the uncomfortable core of the discipline. The evidence that *killed* the strategy is weak. The evidence that *launched* it was weaker still, and nobody demanded a confidence interval on the 1.89.

---

#### How to Avoid or Manage It

- **Charge the backtest what execution actually costs.** Feed realised slippage from live or pilot fills back into the simulator as the default cost model. A backtest whose cost assumption has never been measured is a hypothesis about costs, not a result.
- **Make capacity a first-class output.** Report the return at several assumed sizes, not one. The size at which expected return crosses zero is a more useful number than a Sharpe ratio at an unstated size.
- **Pre-register the search.** Record the parameter grid and the acceptance threshold before running it. Once the threshold is chosen after seeing results, no correction for multiple testing is valid.
- **Size the pilot to reveal impact.** A pilot at one-eighth of target capital tests the plumbing, not the capacity. Either run it at a participation rate close to target, or treat capacity as untested.
- **Set the kill criterion in advance, in risk terms.** "Stop if the drawdown exceeds twice the backtest maximum" is a rule that can be executed. "Stop if it stops working" is not.
- **Keep the residual visible.** A decomposition ending in a large unexplained term is honest; one that assigns every point to a named cause is usually fitted.

---

#### Code

The two adjustments that would have changed the launch decision are both a few lines. Neither requires the live data that did not yet exist.

```python
import numpy as np
from scipy.stats import norm


def selection_adjusted_sharpe(best_sharpe, n_trials, years):
    """Subtract the Sharpe that pure search would produce from no edge.

    Uses the expected maximum of n_trials standard normals as the null,
    converted back to annualised Sharpe via t = S * sqrt(years).
    """
    a = np.sqrt(2 * np.log(n_trials))
    expected_max_t = a - (np.log(np.log(n_trials)) + np.log(4 * np.pi)) / (2 * a)
    return best_sharpe - expected_max_t / np.sqrt(years)


def capacity_drag(aum, names, adv, daily_turnover, impact_coef, days=252):
    """Annual return drag in percentage points from square-root impact.

    impact_coef is calibrated in bps per unit sqrt(participation).
    """
    per_name = daily_turnover * aum / names
    impact_bps = impact_coef * np.sqrt(per_name / adv)
    return daily_turnover * days * impact_bps / 100.0


print(selection_adjusted_sharpe(1.89, 24, 12))          # 1.37
print(capacity_drag(120e6, 200, 8e6, 0.25, 55))          # 4.74 pp
```

The first call turns a reported 1.89 into 1.37 before any live data exists. The second says that at 120,000,000 the impact term alone costs 4.7 percentage points a year, of which 1.7 was already present at pilot size.

---

#### Assumptions and Failure Modes

- **The square-root impact model is a convention, not a law.** The coefficient of 55 is calibrated, and impact in stressed conditions is both larger and more convex than the model implies. A different coefficient moves the capacity term substantially.
- **The four causes are treated as additive and independent.** They are not. Higher costs reduce effective capacity, and a regime shift changes both spreads and the signal at once. The decomposition is an accounting device, not a causal model.
- **The selection adjustment assumes 24 independent tests.** Configurations sharing a lookback are correlated, so the effective number of independent tests is smaller than 24 and the true deflation is somewhat less than 5.0 points.
- **The residual absorbs every unmeasured error.** Borrow costs on the short leg, corporate-action handling, and stale reference data all land in the residual and get mislabelled as regime change.
- **Live volatility is measured over 18 months.** At 10.1% this estimate carries its own wide interval, and the Sharpe inherits that uncertainty on top of the uncertainty in the mean.
- **Nothing here establishes that the signal never existed.** The evidence supports the narrower claim that the strategy could not survive its own costs and size, which is the more common failure.

---

#### See Also

* [Backtest vs Live](/risk/backtest-vs-live)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Market Impact](/execution/market-impact)
* [Regimes Overview](/regimes-macro/regimes-overview)
* [ML Pitfalls](/ml-finance/ml-pitfalls)
* [Writing a Post-Mortem](/case-studies/post-mortem)

---

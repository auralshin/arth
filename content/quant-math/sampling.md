### Sampling

> info **Metadata** Level: Intermediate | Prerequisites: Random Variables, Expectation & Variance | Tags: statistics, sampling, estimation, data, backtesting

A sample is the finite set of observations you actually have; the population is the process you wish you could observe. Sampling is the set of decisions connecting the two — which instruments, over which period, at which frequency, aligned to which clock, and with which records excluded. Those decisions are made before any statistic is computed, and they place a hard ceiling on how much the statistic can tell you.

In finance the sampling stage is where most errors enter, and they are rarely visible afterwards. A volatility estimate is not wrong because the standard-deviation formula was misapplied; it is wrong because the window straddled a regime change, or the series excluded delisted names, or overlapping windows made 233 observations look like 233 independent facts when there were about a dozen.

---

#### Formal Definition

Given `n` observations `x_1, ..., x_n` drawn from a distribution with mean `mu` and variance `sigma^2`:

```text
xbar   = (1/n) * sum of x_t                              sample mean
s^2    = (1/(n-1)) * sum of (x_t - xbar)^2               sample variance
```

The divisor `n - 1` is **Bessel's correction**. Deviations are taken from `xbar` rather than the unknown `mu`, which makes them slightly too small; dividing by `n - 1` restores unbiasedness. The correction matters when `n` is small: with `n = 5`, dividing by `n` returns only 80% of the unbiased estimate.

The precision of these estimators, under independence:

```text
sd(xbar) = sigma / sqrt(n)                               standard error of the mean
sd(s) / sigma  approximately  1 / sqrt(2 * (n - 1))      relative error of the volatility estimate
```

where:

- `n` is the number of **independent** observations, not the number of rows
- the second expression is the usual approximation for a roughly normal sample

Volatility is far easier to estimate than the mean. That asymmetry — variance converging quickly, mean converging slowly — shapes almost all of quantitative portfolio construction.

---

#### Worked Example

You estimate annualised volatility from daily returns with a sample standard deviation of `1.2%` per day.

1. **Annualise**: `1.2% * sqrt(252) = 19.05%`
2. **One month of data**, `n = 21`. Relative error `1 / sqrt(2 * 20) = 1 / sqrt(40) = 0.158`, so one standard error is `19.05% * 0.158 = 3.01 percentage points`. An approximate 95% interval runs from `13.1%` to `25.0%`.
3. **One year of data**, `n = 252`. Relative error `1 / sqrt(502) = 0.0446`, one standard error is `0.85 percentage points`, and the interval narrows to roughly `17.4%` to `20.7%`.

Now compare frequencies over the same one calendar year:

<table>
  <tbody>
    <tr>
      <td><strong>Sampling frequency</strong></td>
      <td><strong>Observations in one year</strong></td>
      <td><strong>Relative error of volatility</strong></td>
    </tr>
    <tr>
      <td>Monthly</td><td>12</td><td>21.3%</td>
    </tr>
    <tr>
      <td>Weekly</td><td>52</td><td>9.9%</td>
    </tr>
    <tr>
      <td>Daily</td><td>252</td><td>4.5%</td>
    </tr>
  </tbody>
</table>

Sampling more finely buys precision on volatility without needing a longer history — the reason realised-volatility estimators use intraday data. It buys nothing at all for the mean, whose standard error depends on the calendar span rather than the number of subdivisions of it. And at high enough frequency the gain reverses: bid-ask bounce and stale quotes inject spurious variance. See [Volatility](/quant-math/volatility).

---

#### Overlapping Samples

To study 20-day returns from 252 daily observations you can form 233 overlapping windows, or 12 non-overlapping ones. The overlapping version looks vastly richer and is not.

Consecutive overlapping windows share 19 of their 20 days, so they are close to perfectly correlated. The effective sample size is nearer `252 / 20 = 12.6` than 233. Treating the 233 as independent shrinks every reported standard error by roughly a factor of four and makes almost anything significant.

Overlapping samples are legitimate for *estimating* a quantity — they use the data efficiently. They are not legitimate for *inference* unless the standard errors are corrected, typically with a Newey-West adjustment or a block bootstrap. See [Bootstrap](/stat-methods/bootstrap).

> warning **Row count is not sample size** Every form of overlap — rolling windows, overlapping horizons, correlated assets, repeated observation of the same regime — inflates the apparent sample without adding information.

---

#### How the Bars Themselves Are Built

Before any estimator runs, someone chose how to slice the tape.

- **Time bars** (one minute, one day) are the default and the least statistically convenient. Activity is wildly uneven across the session, so a time bar contains a variable amount of information and the resulting series has strong heteroskedasticity and non-normality.
- **Tick, volume, and dollar bars** sample after a fixed number of trades or a fixed traded value. They produce return series with closer-to-constant information content and noticeably better statistical behaviour. See [Feature Engineering](/ml-finance/feature-engineering).
- **Event bars** sample on a condition — a data release, a threshold breach, a block. Useful, but they condition the sample on the thing being studied, which is a bias source in itself.
- **Alignment.** Combining series that close at different times creates spurious lead-lag structure and understates correlation. See [Time Series Data](/data-tooling/time-series).

---

#### In Practice Across Asset Classes

- **Equities.** Survivorship bias is the classic problem: a universe of currently listed names excludes every company that failed, and the excluded ones are precisely the left tail. Corporate actions must be adjusted for or returns are wrong on specific dates. See [Corporate Actions](/markets/corporate-actions).
- **Futures.** There is no single price series — only a stitched one. Back-adjusted, ratio-adjusted, and perpetual-style series give different returns from identical raw data, and the choice changes measured volatility and Sharpe. See [Roll and Carry](/markets/roll-and-carry).
- **Fixed income.** Many bonds barely trade, so the "price" is a model mark. The resulting series is smoothed, autocorrelated, and understates volatility. Sampling government benchmarks instead of the actual holdings solves the data problem by changing the question.
- **FX.** Trading is continuous across sessions, so the daily bar boundary is a convention. Different providers cut the day at different times and produce different daily volatilities from the same market.
- **Credit.** Default data is sparse by construction, so samples are pooled across issuers and years. That pooling assumes exchangeability across very different credits and cycles, which is a strong assumption applied silently. See [Default Probability](/credit/default-probability).
- **On-chain.** Block times define an irregular clock, and reorganisations mean early observations can change retroactively. Failed transactions, private-mempool flow, and unindexed venues are systematically missing, so a pool-level sample is a sample of *observed* activity rather than all of it.

---

#### Assumptions and Failure Modes

- **The sample represents the population.** It usually does not. Selection on survival, on listing, on data availability, or on liquidity all remove the same part of the distribution: the bad part.
- **Observations are independent.** Financial data is serially correlated and cross-sectionally correlated. Standard errors computed under independence are too small, often by a large factor.
- **The process is stationary over the window.** A five-year window that spans a regime change estimates parameters describing neither regime. See [Stationarity](/quant-math/stationarity).
- **Look-ahead through restatement.** Fundamental data, index membership, and reference data are revised after the fact. Sampling today's version of a historical record embeds information that was not available then. See [Backtest vs Live](/risk/backtest-vs-live).
- **Missing data is not missing at random.** Gaps cluster during exactly the halts, outages, and congestion events that carry the most risk information. Dropping them removes stress from the sample.
- **The window was chosen after seeing the result.** Start and end dates selected to make a strategy look good are a form of sampling, and the most common one. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Code

```python
import numpy as np

def volatility_confidence_interval(returns, periods_per_year=252, z=1.96):
    """Annualised volatility with an approximate confidence interval.

    Relative error of a volatility estimate is roughly 1/sqrt(2(n-1)),
    so a one-month estimate is worth far less than it looks.
    """
    r = np.asarray(returns, dtype=float)
    n = len(r)
    annualised = r.std(ddof=1) * np.sqrt(periods_per_year)
    relative_error = 1.0 / np.sqrt(2.0 * (n - 1))
    return annualised, (
        annualised * (1 - z * relative_error),
        annualised * (1 + z * relative_error),
    )


def effective_sample_size(n_observations, window_length):
    """Independent observations available from overlapping windows.

    Overlapping samples inflate the row count without adding information.
    """
    return n_observations / window_length
```

---

#### See Also

* [LLN & CLT](/quant-math/lln-clt)
* [Rolling Windows](/quant-math/rolling-windows)
* [Returns](/quant-math/returns)
* [Stationarity](/quant-math/stationarity)
* [Bootstrap](/stat-methods/bootstrap)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Data Cleaning](/data-tooling/cleaning)

---

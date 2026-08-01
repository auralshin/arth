### Bootstrap

> info **Metadata** Level: Intermediate | Prerequisites: Sampling, Confidence Intervals | Tags: resampling, bootstrap, block-bootstrap, confidence-intervals, monte-carlo

The bootstrap estimates the sampling distribution of a statistic by resampling the data itself, rather than deriving that distribution from an assumed model. Draw a new sample of the same size from the observed data with replacement, recompute the statistic, and repeat a few thousand times. The spread of the resulting values approximates the spread the statistic would show across new samples from the underlying process.

Its appeal in finance is that closed-form standard errors are available only for simple statistics under assumptions that return data violate. There is no clean analytic standard error for a maximum drawdown, a Calmar ratio, a hit rate conditional on a signal, or a strategy's turnover-adjusted return. The bootstrap gives one for any of them, provided the resampling scheme respects the dependence in the data — which is exactly the point at which the naive version fails on time series.

---

#### Formal Definition

For an observed sample `x = (x_1, ..., x_n)` and a statistic `T(x)`:

```text
for b in 1..B:
    x*_b = n observations drawn from x with replacement
    T*_b = T(x*_b)

the empirical distribution of {T*_1, ..., T*_B} approximates the
sampling distribution of T, from which:

    bootstrap standard error   = stdev({T*_b})
    percentile CI at level 1-a = [ quantile(T*, a/2), quantile(T*, 1 - a/2) ]
    bootstrap bias estimate    = mean({T*_b}) - T(x)
```

`B` is conventionally 1,000 for a standard error and at least 10,000 for interval endpoints, since tail quantiles need more draws to stabilise. **The core assumption** is that the observed sample stands in for the population: everything the bootstrap can tell you is already latent in the data, so it quantifies sampling uncertainty, not model uncertainty.

> warning **The IID bootstrap destroys time-series structure** Resampling individual returns independently breaks [autocorrelation](/quant-math/autocorrelation), volatility clustering, and every path-dependent property. A drawdown bootstrap built this way will systematically understate drawdown risk, because it removes the clustering of losses that creates deep drawdowns in the first place.

---

#### Worked Example

Eight monthly returns from a strategy, in percent, with the risk-free rate taken as zero.

<table>
  <tbody>
    <tr><td><strong>Month</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td></tr>
    <tr><td><strong>Return (%)</strong></td><td>3.0</td><td>-2.0</td><td>1.5</td><td>4.0</td><td>-1.0</td><td>2.5</td><td>0.5</td><td>-0.5</td></tr>
  </tbody>
</table>

**The point estimate:**

1. **Sum**: `3.0 - 2.0 + 1.5 + 4.0 - 1.0 + 2.5 + 0.5 - 0.5 = 8.0`, so `mean = 8.0 / 8 = 1.00%`
2. **Deviations**: `2.0, -3.0, 0.5, 3.0, -2.0, 1.5, -0.5, -1.5` — they sum to zero
3. **Sum of squared deviations**: `4 + 9 + 0.25 + 9 + 4 + 2.25 + 0.25 + 2.25 = 31.0`
4. **Sample standard deviation**: `sqrt(31.0 / 7) = sqrt(4.4286) = 2.104%`
5. **Monthly Sharpe**: `1.00 / 2.104 = 0.475`
6. **Annualised Sharpe**: `0.475 * sqrt(12) = 1.646`

**One bootstrap resample.** Drawing eight observations with replacement produces, say, `4.0, -2.0, 4.0, 0.5, 3.0, -0.5, 2.5, 4.0` — `4.0` appeared three times and several original observations not at all, which is exactly how resampling with replacement behaves.

7. **Sum**: `15.5`, so `mean = 1.9375%`
8. **Sum of squared deviations**: `37.719`, so `sd = sqrt(37.719 / 7) = sqrt(5.3884) = 2.321%`
9. **Monthly Sharpe**: `1.9375 / 2.321 = 0.835`, annualising to `0.835 * sqrt(12) = 2.891`

A single resample of the same data moved the annualised Sharpe from 1.65 to 2.89. That is not an error — it is the measurement, and it is the reason a Sharpe ratio from eight observations should never be quoted as a number.

**Building the interval.** Repeat steps 7 to 9 several thousand times, collect the annualised Sharpe values, and read off the 2.5th and 97.5th percentiles. With `n = 8` the interval will span from clearly negative to well above 3. This mirrors the analytic result in [Confidence Intervals](/stat-methods/confidence-intervals), and unlike the analytic version it assumes no normality — which matters more as the sample shrinks and the return distribution skews.

---

#### Block Bootstrap for Dependent Data

Financial returns are not independent, so resampling them one at a time discards the dependence. The **block bootstrap** resamples contiguous blocks instead, preserving dependence *within* each block while randomising the order *between* them.

<table>
  <tbody>
    <tr><td><strong>Variant</strong></td><td><strong>How blocks are formed</strong></td><td><strong>Notes</strong></td></tr>
    <tr><td>Non-overlapping block</td><td>Series cut into fixed blocks of length L, drawn with replacement</td><td>Simplest; wastes data at the boundaries</td></tr>
    <tr><td>Moving block</td><td>Every contiguous window of length L is a candidate block</td><td>Standard choice; more blocks, more variety</td></tr>
    <tr><td>Circular block</td><td>Moving blocks, with the series wrapped end to start</td><td>Treats every observation equally; avoids edge under-sampling</td></tr>
    <tr><td>Stationary bootstrap</td><td>Block length drawn randomly from a geometric distribution</td><td>Produces a stationary resample; less sensitive to the exact L</td></tr>
  </tbody>
</table>

**Choosing the block length.** `L` must be long enough to contain the dependence you care about and short enough that resamples still differ from each other. A rule of thumb scales as `n^(1/3)`, giving roughly 10 for `n = 1000`; automatic procedures based on the autocorrelation structure are preferable when dependence is strong. Too small an `L` destroys the dependence and collapses toward the IID case; too large an `L` leaves few distinct blocks, so resamples resemble one another. Both errors understate uncertainty. The right `L` also depends on the statistic: for the mean it need only cover the autocorrelation of returns, which is short, while for a maximum drawdown it must cover the typical length of a drawdown episode — which may be many months, and which no block bootstrap on three years of data can honestly represent.

---

#### In Practice Across Asset Classes

**Equities.** Used to put intervals on factor premia and long-short strategy statistics without assuming normality, and to test whether one strategy's Sharpe genuinely exceeds another's by bootstrapping the *difference* rather than comparing two separate intervals. Monthly factor returns have modest autocorrelation, so short blocks suffice.

**Futures.** Block bootstrap on trend-following returns must use blocks long enough to preserve trend episodes. Trend strategies earn their return in extended runs, and an IID bootstrap chops those runs into pieces, producing resamples with better Sharpe ratios and shallower drawdowns than the strategy could ever deliver.

**Fixed income, FX and credit.** Cross-sectional bootstrapping over bonds understates portfolio risk, because resampling them independently discards their shared duration exposure — bootstrap the factor returns and reconstruct instead. FX carry returns are strongly negatively skewed with clustered losses, so IID intervals on carry statistics are far too narrow in the left tail. Credit default and recovery data are sparse and clustered in time: where the sample contains no severe default cycle, the bootstrap will confidently report that severe default cycles are impossible.

**On-chain.** Short samples make the bootstrap especially valuable — it is honest about how little the data support — and especially limited, since it can only resample the regimes present. A liquidity provision strategy backtested through a single calm quarter will bootstrap a narrow, reassuring, and meaningless interval.

---

#### Assumptions and Failure Modes

- **The sample represents the population.** The bootstrap resamples what happened. If a crisis is absent from the data, it is absent from every resample and from the interval. See [Scenario Analysis](/simulation/scenarios) for the complementary approach of imposing events the sample never contained.
- **IID resampling on dependent data understates uncertainty.** The single most common misuse. Always use blocks for time series, and report `L` with a sensitivity check across a range of values.
- **Stationarity within the sample.** Blocks are exchangeable only if the process is stationary. A resample that mixes a low-volatility year with a crisis year describes a process that never existed. See [Stationarity](/quant-math/stationarity).
- **Percentile intervals can be biased.** When the statistic's distribution is skewed or its bias depends on the parameter, plain percentile intervals under-cover. Bias-corrected and accelerated (BCa) intervals adjust for both and are the safer default for ratios such as the Sharpe.
- **Extreme statistics need enormous B**, and the tail of a bootstrap distribution is limited by the tail of the original sample regardless of `B`.
- **It fixes neither selection bias nor bad data.** Bootstrapping the winner of a search gives an honest interval around a biased point estimate, and stale marks, survivorship bias, and look-ahead leakage propagate into every resample unchanged. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Code

```python
import numpy as np


def bootstrap_statistic(returns, statistic, n_boot=10000, block_length=1, seed=0):
    """Bootstrap distribution of any statistic of a return series.

    block_length=1 is the IID bootstrap, valid only without serial
    dependence. Blocks wrap circularly so every observation is equally
    likely to appear; plain moving blocks under-sample the edges.
    """
    data = np.asarray(returns, float)
    n = data.size
    rng = np.random.default_rng(seed)
    offsets = np.arange(block_length)
    n_blocks = int(np.ceil(n / block_length))

    draws = np.empty(n_boot)
    for b in range(n_boot):
        starts = rng.integers(0, n, size=n_blocks)
        idx = ((starts[:, None] + offsets[None, :]) % n).ravel()[:n]
        draws[b] = statistic(data[idx])
    return draws


def sharpe_interval(returns, periods_per_year=12, block_length=3, confidence=0.95):
    """Percentile confidence interval for the annualised Sharpe ratio."""
    scale = np.sqrt(periods_per_year)

    def annualised_sharpe(sample):
        sd = sample.std(ddof=1)
        return np.nan if sd == 0 else sample.mean() / sd * scale

    draws = bootstrap_statistic(returns, annualised_sharpe, block_length=block_length)
    draws = draws[np.isfinite(draws)]
    tail = (1 - confidence) / 2
    point = annualised_sharpe(np.asarray(returns, float))
    return point, np.quantile(draws, tail), np.quantile(draws, 1 - tail)
```

---

#### See Also

* [Confidence Intervals](/stat-methods/confidence-intervals)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [GARCH](/stat-methods/garch)
* [Sampling](/quant-math/sampling)
* [Drawdown](/quant-math/drawdown)
* [Scenario Analysis](/simulation/scenarios)

---

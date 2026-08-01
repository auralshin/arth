### Rolling Windows

> info **Metadata** Level: Intermediate | Prerequisites: Sampling, Returns | Tags: time-series, estimation, rolling, volatility, metrics

A rolling window computes a statistic over the most recent `n` observations and recomputes it as each new observation arrives and the oldest leaves. It is how a single-number summary becomes a time series: rolling volatility, rolling correlation, rolling beta, rolling Sharpe. Almost every risk dashboard and every systematic strategy that adapts to conditions is built on one.

The window length is a parameter, and it is not free. A short window reacts quickly and is dominated by noise; a long window is stable and describes conditions that may have ended. There is no correct answer, only a trade-off that should be made explicitly against how quickly the underlying quantity actually changes.

---

#### Formal Definition

For a statistic `f` and window length `n`, the rolling estimate at time `t` uses only observations up to and including `t`:

```text
f_t = f( x_{t-n+1}, ..., x_t )
```

Rolling volatility, the most common case:

```text
sigma_t = sqrt( sum over s = t-n+1 to t of (r_s - rbar_t)^2 / (n - 1) )
```

where `rbar_t` is the mean over the same window.

**Exponentially weighted** alternatives replace the hard cut-off with a geometric decay:

```text
sigma^2_t = lambda * sigma^2_{t-1} + (1 - lambda) * r^2_{t-1}
```

where `lambda` between 0 and 1 controls persistence. Two useful summaries of `lambda`:

```text
half_life    = ln(0.5) / ln(lambda)
centre_of_mass = lambda / (1 - lambda)
```

With `lambda = 0.94` the half-life is about 11 days and the centre of mass about 16 days. With `lambda = 0.97` they are about 23 and 32 days.

**Lag.** An equal-weighted window of length `n` has an average lag of `(n - 1) / 2` periods. A 21-day rolling volatility is, on average, describing conditions from 10 days ago. Exponential weighting reduces this at the cost of a noisier estimate.

---

#### Worked Example

Twelve daily returns, in per cent:

<table>
  <tbody>
    <tr>
      <td><strong>Day</strong></td>
      <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>
      <td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td>
    </tr>
    <tr>
      <td><strong>Return (%)</strong></td>
      <td>0.4</td><td>-0.3</td><td>0.9</td><td>-1.6</td><td>2.2</td><td>-2.8</td>
      <td>1.9</td><td>-0.5</td><td>0.3</td><td>0.6</td><td>-0.4</td><td>0.2</td>
    </tr>
  </tbody>
</table>

Rolling 5-day sample standard deviation, annualised with `sqrt(252)`:

<table>
  <tbody>
    <tr>
      <td><strong>Window ending day</strong></td>
      <td><strong>Daily sd (%)</strong></td>
      <td><strong>Annualised (%)</strong></td>
    </tr>
    <tr><td>5</td><td>1.41</td><td>22.4</td></tr>
    <tr><td>6</td><td>1.98</td><td>31.4</td></tr>
    <tr><td>7</td><td>2.21</td><td>35.1</td></tr>
    <tr><td>8</td><td>2.18</td><td>34.6</td></tr>
    <tr><td>9</td><td>2.02</td><td>32.1</td></tr>
    <tr><td>10</td><td>1.74</td><td>27.6</td></tr>
    <tr><td>11</td><td>0.97</td><td>15.4</td></tr>
    <tr><td>12</td><td>0.47</td><td>7.5</td></tr>
  </tbody>
</table>

The full-sample estimate over all twelve days is `1.37%` daily, or `21.8%` annualised.

The rolling series moves from `22%` to `35%` and down to `7.5%` — a factor of nearly five — while the full-sample number sits at `22%`. Is that a volatility regime change? At `n = 5`, the relative standard error of a volatility estimate is roughly `1 / sqrt(2 * 4) = 35%`. Almost the entire swing is estimation noise.

Watch the mechanism at day 11. The large `-2.8%` observation from day 6 drops out of the window, and the estimate falls from `27.6%` to `15.4%` in a single step on a day whose own return was `-0.4%`. Nothing happened in the market; an old observation left the window. Equal-weighted rolling estimates always contain this artefact, and it is the strongest argument for exponential weighting, where observations fade rather than vanish.

> warning **A moving estimate is not a moving quantity** Most of the variation in a short rolling window is variation in the estimator, not in the thing being estimated. Before treating a rise in rolling volatility as a signal, check whether it exceeds the estimator's own noise.

---

#### Choosing a Window

<table>
  <tbody>
    <tr>
      <td><strong>Window</strong></td>
      <td><strong>Relative error of a volatility estimate</strong></td>
      <td><strong>Average lag</strong></td>
    </tr>
    <tr><td>5 days</td><td>35%</td><td>2 days</td></tr>
    <tr><td>21 days</td><td>16%</td><td>10 days</td></tr>
    <tr><td>63 days</td><td>9%</td><td>31 days</td></tr>
    <tr><td>252 days</td><td>4.5%</td><td>126 days</td></tr>
  </tbody>
</table>

The choice should follow the persistence of the underlying quantity. If volatility shocks have a half-life of roughly two weeks, a 252-day window will average across many half-lives and describe none of them; a 5-day window will be pure noise. Something in the region of the shock's own half-life is the defensible starting point, and the honest way to report it is to show two or three window lengths together rather than tuning one.

**Expanding windows** use all data from the start of the sample. They are the right choice for a quantity believed constant, and the wrong choice for anything regime-dependent, because early observations never lose influence.

**Minimum periods.** A rolling calculation with a partially filled window produces an estimate from fewer observations without saying so. Requiring the full window and returning nothing before it is filled is the safer default.

---

#### In Practice Across Asset Classes

- **Equities.** Rolling beta against a benchmark is the standard exposure diagnostic, and it is unstable: 60-day and 250-day rolling betas on the same stock often disagree materially. Rolling correlation between sectors is the usual early indicator that diversification is weakening. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Futures.** Margin models are effectively rolling volatility estimates, so the window used by the exchange determines how quickly requirements rise after a shock. A short window means faster, larger margin calls. See [Leverage & Liquidation](/risk/leverage-liquidation).
- **FX.** Rolling correlations between pairs are used to monitor how concentrated a nominally diversified book really is. Because many crosses share a currency, these correlations move together and change fast around policy events.
- **Fixed income.** Rolling estimates are applied to yield changes rather than price returns, since duration changes as bonds age. Failing to account for that puts a slow trend into the rolling volatility that is an ageing effect, not a market one.
- **Credit.** Rolling spread volatility is contaminated by mark staleness, so it understates risk and responds late. Rolling measures on a liquid index equivalent are more responsive than those on the actual holdings.
- **Execution.** Rolling estimates of spread, depth, and participation rate drive live execution scheduling. Here windows are minutes rather than months, and the drop-out artefact becomes a genuine operational problem. See [TWAP & VWAP](/execution/twap-vwap).
- **On-chain.** Rolling windows on a block clock are irregular in wall-clock time, so a 1,000-block window spans different durations under different congestion. Fixing the window in time rather than in blocks avoids comparing unequal intervals.

---

#### Assumptions and Failure Modes

- **Stationarity within the window.** The estimate is only meaningful if the quantity is roughly constant over the window. If it were constant over a long window there would be no reason to roll at all — the technique assumes exactly enough change to be worth tracking and not so much that the window is meaningless.
- **Look-ahead through centring.** A centred window uses future observations. Perfectly acceptable for description, fatal in a backtest. Every rolling statistic used as a signal must be strictly backward-looking. See [Backtest vs Live](/risk/backtest-vs-live).
- **The drop-out artefact.** Extreme observations leaving an equal-weighted window cause step changes unrelated to current data.
- **Window length chosen by outcome.** Selecting the window that produces the best backtest is parameter fitting. Report performance across a range of windows. See [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **Overlapping windows are not independent.** Consecutive rolling estimates share most of their data, so a rolling series has far fewer independent observations than points. Confidence intervals computed as if they were independent are badly too narrow. See [Sampling](/quant-math/sampling).
- **Ratios of rolling estimates compound the noise.** A rolling Sharpe divides one noisy estimate by another. Over short windows it is close to uninterpretable.
- **Revisions.** If the underlying data is restated, historical rolling values change. A dashboard that silently rewrites its own history makes past decisions impossible to audit.

---

#### Code

```python
import numpy as np
import pandas as pd

def rolling_volatility(returns, window=21, periods_per_year=252):
    """Backward-looking rolling volatility, annualised.

    min_periods=window refuses to emit an estimate from a partial window,
    which otherwise silently reports a different statistic.
    """
    series = pd.Series(returns)
    return series.rolling(window, min_periods=window).std(ddof=1) * np.sqrt(
        periods_per_year
    )


def ewma_volatility(returns, lam=0.94, periods_per_year=252):
    """Exponentially weighted volatility: no drop-out artefact.

    Observations fade out instead of leaving the window in one step.
    """
    series = pd.Series(returns)
    variance = series.pow(2).ewm(alpha=1 - lam, adjust=False).mean()
    return np.sqrt(variance * periods_per_year)


def estimator_noise_band(window):
    """Approximate relative standard error of a rolling volatility estimate.

    Compare any observed move in rolling vol against this before calling it a regime change.
    """
    return 1.0 / np.sqrt(2.0 * (window - 1))
```

---

#### See Also

* [Volatility](/quant-math/volatility)
* [Sampling](/quant-math/sampling)
* [Sharpe Ratio](/quant-math/sharpe)
* [Drawdown](/quant-math/drawdown)
* [Stationarity](/quant-math/stationarity)
* [GARCH](/stat-methods/garch)
* [Changepoint Detection](/regimes-macro/changepoint-detection)

---

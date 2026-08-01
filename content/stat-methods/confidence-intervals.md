### Confidence Intervals

> info **Metadata** Level: Intermediate | Prerequisites: Sampling, Hypothesis Testing | Tags: statistics, inference, standard-error, estimation, uncertainty

A confidence interval is a range constructed so that, across repeated samples from the same process, a stated proportion of such ranges would contain the true parameter. It converts a point estimate into an honest statement about what the data can and cannot rule out.

For financial estimates the intervals are startlingly wide, and this is the whole point of computing them. A backtest reporting a Sharpe ratio of 0.78 sounds like a result. The same backtest reporting a 95% interval from -0.11 to 1.67 tells you the data are consistent with a strategy that loses money and with one that is excellent. Both statements describe the same sample.

---

#### Formal Definition

For an estimate that is approximately normally distributed, a two-sided interval at confidence level `1 - alpha` is:

```text
CI = estimate  plus/minus  critical_value * standard_error(estimate)
```

where:

- `estimate` is the sample statistic, e.g. the mean return
- `standard_error` is the standard deviation of that statistic across hypothetical repeated samples
- `critical_value` is the quantile of the reference distribution, roughly 1.96 for a 95% normal interval and slightly larger for the t-distribution at small sample sizes

For a sample mean of `n` observations with sample standard deviation `s`:

```text
standard_error(mean) = s / sqrt(n)
```

The width shrinks only as `1 / sqrt(n)`. Halving the interval requires four times the data. This is why extending a backtest from three years to four barely moves the uncertainty.

For an estimated Sharpe ratio `S` from `n` periods of independent returns, a widely used approximation is:

```text
standard_error(S) = sqrt((1 + 0.5 * S^2) / n)
```

with `S` and `n` measured in the same period units. Annualise the standard error by the same `sqrt(periods_per_year)` factor used for the ratio itself.

> info **Interpretation, precisely** The correct statement is "95% of intervals built this way contain the true value". It is not "there is a 95% probability the true value lies in this particular interval" — under the frequentist construction the true value is fixed and the interval is the random object.

---

#### Worked Example

Five years of monthly returns from a strategy, with the risk-free rate assumed zero for simplicity:

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Observations (months)</td><td>60</td></tr>
    <tr><td>Mean monthly return</td><td>0.90%</td></tr>
    <tr><td>Monthly standard deviation</td><td>4.00%</td></tr>
  </tbody>
</table>

**Interval for the mean return:**

1. **Standard error**: `4.00% / sqrt(60) = 4.00% / 7.746 = 0.516%`
2. **Critical value**: t with 59 degrees of freedom at 97.5%, approximately 2.00
3. **Interval**: `0.90% plus/minus 2.00 * 0.516% = 0.90% plus/minus 1.03%`
4. **Result**: monthly mean between `-0.13%` and `1.93%`
5. **Annualised** (multiply by 12): between `-1.6%` and `23.2%` per year

The point estimate is 10.8% per year. Five years of data cannot distinguish that from a small loss.

**Interval for the Sharpe ratio:**

1. **Monthly Sharpe**: `0.90 / 4.00 = 0.225`
2. **Annualised Sharpe**: `0.225 * sqrt(12) = 0.779`
3. **Standard error, monthly**: `sqrt((1 + 0.5 * 0.225^2) / 60) = sqrt(1.0253 / 60) = 0.1307`
4. **Annualised**: `0.1307 * sqrt(12) = 0.453`
5. **Interval**: `0.779 plus/minus 1.96 * 0.453` gives `-0.11` to `1.67`

A five-year track record with a headline Sharpe of 0.78 does not statistically distinguish itself from zero.

---

#### Why Financial Intervals Are So Wide

Three effects compound.

**The signal-to-noise ratio is inherently low.** Annualised equity volatility is an order of magnitude larger than annualised expected excess return. The quantity you want to estimate is buried in noise of roughly ten times its size, and no amount of clever modelling changes that ratio.

**Serial dependence reduces the effective sample.** With positively autocorrelated returns, `n` observations carry less information than `n` independent ones. A rough adjustment for first-order [autocorrelation](/quant-math/autocorrelation) `rho` scales the variance of the mean by `(1 + rho) / (1 - rho)`. At `rho = 0.3` that factor is 1.86, widening the interval by about 36%.

**The estimate itself may be selected.** If the reported strategy is the best of many tested, its interval is not the right interval at all — the sampling distribution of a maximum is shifted upward. See [Multiple Testing](/stat-methods/multiple-testing) and [Backtest Overfitting](/stat-methods/backtest-overfitting).

Intervals on volatility behave differently and are narrower in relative terms. For roughly normal returns the relative standard error of an estimated standard deviation is about `1 / sqrt(2n)`: at `n = 60` that is roughly 9%. Volatility is far easier to estimate than mean return, which is why risk models are more trustworthy than return forecasts. See [Volatility](/quant-math/volatility).

---

#### In Practice Across Asset Classes

**Equity factor research.** Intervals on factor premia are reported from decades of monthly data and are still wide enough to overlap zero for many published factors. Rolling-window intervals are usually far wider than full-sample ones, which is diagnostic of time-varying premia rather than of estimation noise alone.

**Futures.** Interval width on a trend programme's Sharpe depends on how many genuinely independent markets are traded. Twenty markets that all rally together in a risk-off move contribute far fewer than twenty independent observations.

**Fixed income.** Duration and convexity exposures are estimated precisely; expected excess returns are not. A rates portfolio can have a tight interval on its risk and a useless one on its return.

**FX.** Carry returns have severe negative [skew](/quant-math/var-cvar), so a symmetric normal interval understates downside and overstates the reliability of the central estimate. Bootstrap intervals are preferable.

**Credit.** Infrequent marks on illiquid bonds smooth the return series, shrinking measured volatility and producing spuriously narrow intervals. The apparent precision is a data artifact.

**On-chain strategies.** Interval width is dominated by sample length. A liquidity provision strategy with four months of history has an interval so wide that comparing two such strategies on point estimates is meaningless.

---

#### Assumptions and Failure Modes

- **Approximate normality of the estimate.** Rests on the [central limit theorem](/quant-math/lln-clt). With heavy-tailed returns and `n` in the dozens, convergence is incomplete and coverage is below nominal.
- **Independent observations.** Serial correlation, overlapping return horizons, and cross-sectionally correlated assets all shrink the effective sample and produce intervals that are too narrow.
- **Constant parameter over the sample.** An interval assumes there is one true value to cover. Under regime change the interval covers a time-average that never described any single period.
- **No selection.** The construction assumes this estimate was not chosen for being large. Selection biases the point estimate upward and leaves the interval width unchanged, so coverage collapses.
- **The Sharpe standard error formula assumes IID returns.** With skew and excess kurtosis it understates uncertainty; [Backtest Overfitting](/stat-methods/backtest-overfitting) covers a correction. Interval width is not itself a quality score: a narrow interval on a smoothed, stale-marked series is worse evidence than a wide one on clean daily data.

> warning **Never report a point estimate alone** A Sharpe ratio, an alpha, or a hit rate quoted without a sample length and an interval is not a result. It is a number.

---

#### Code

```python
import numpy as np
from scipy import stats


def mean_confidence_interval(returns, confidence=0.95):
    """Two-sided t-interval for the mean of a return series."""
    r = np.asarray(returns, dtype=float)
    standard_error = r.std(ddof=1) / np.sqrt(r.size)
    critical = stats.t.ppf(0.5 + confidence / 2, df=r.size - 1)
    return r.mean() - critical * standard_error, r.mean() + critical * standard_error


def sharpe_confidence_interval(returns, periods_per_year=252, confidence=0.95):
    """Interval for the annualised Sharpe (IID approximation).
    Optimistic: it ignores skew, kurtosis and serial correlation.
    """
    r = np.asarray(returns, dtype=float)
    sharpe_period = r.mean() / r.std(ddof=1)
    se_period = np.sqrt((1 + 0.5 * sharpe_period**2) / r.size)
    scale = np.sqrt(periods_per_year)
    half_width = stats.norm.ppf(0.5 + confidence / 2) * se_period * scale
    return sharpe_period * scale - half_width, sharpe_period * scale + half_width
```

---

#### See Also

* [Hypothesis Testing](/stat-methods/hypothesis-testing)
* [Bootstrap](/stat-methods/bootstrap)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Sharpe Ratio](/quant-math/sharpe)
* [Sampling](/quant-math/sampling)
* [Backtest vs Live](/risk/backtest-vs-live)

---

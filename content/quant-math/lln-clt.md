### LLN & CLT

> info **Metadata** Level: Advanced | Prerequisites: Random Variables, Expectation & Variance | Tags: math, probability, convergence, asymptotics

The **Law of Large Numbers (LLN)** says that a sample average converges to the true mean as observations accumulate. The **Central Limit Theorem (CLT)** says more: that the *error* in that average, scaled by the square root of the sample size, converges to a normal distribution regardless of the shape of the underlying variable. The first justifies estimating anything at all from data; the second tells you how wrong your estimate is likely to be.

For quantitative finance the practical content of these theorems is almost entirely negative. Convergence happens at rate `1/sqrt(n)`, which is punishingly slow when the signal-to-noise ratio of financial returns is as low as it is. A great deal of quantitative research consists of discovering that a result which looked convincing was inside the confidence interval implied by the CLT all along.

---

#### Formal Definition

Let `X_1, ..., X_n` be independent and identically distributed with mean `mu` and finite variance `sigma^2`, and let `Xbar_n` be their average.

**Law of Large Numbers.** For any positive tolerance `e`:

```text
P( |Xbar_n - mu| > e )  ->  0    as n -> infinity
```

The average settles on `mu`. The LLN says nothing about how quickly.

**Central Limit Theorem.** The standardised average converges in distribution to a standard normal:

```text
sqrt(n) * (Xbar_n - mu) / sigma  ->  Normal(0, 1)
```

Equivalently, for large `n` the sample mean is approximately normal with:

```text
E[Xbar_n]  = mu
sd(Xbar_n) = sigma / sqrt(n)          the standard error
```

where:

- `sigma` is the standard deviation of a single observation
- `n` is the number of independent observations
- `sigma / sqrt(n)` is the **standard error of the mean**

The `sqrt(n)` in the denominator is the entire story. To halve your uncertainty you need four times the data. To gain one more decimal place you need one hundred times.

---

#### Worked Example

A strategy produces daily returns with a sample mean of `0.04%` and a sample standard deviation of `1.2%`. You have one year of data, `n = 252`. Is the mean distinguishable from zero?

1. **Standard error**: `1.2% / sqrt(252) = 1.2% / 15.875 = 0.0756%`
2. **t-statistic**: `0.04% / 0.0756% = 0.53`
3. **Verdict**: a t-statistic of 0.53 is nowhere near the conventional threshold of about 2. One year of data cannot distinguish this strategy from noise.

How much data would you need? Set the t-statistic to 2 and solve for `n`:

```text
n = (2 * sigma / mu)^2 = (2 * 1.2 / 0.04)^2 = 60^2 = 3600 days
```

That is roughly **14.3 years** of daily data — assuming the process is stationary throughout, which over fourteen years it will not be.

The same arithmetic across sample lengths:

<table>
  <tbody>
    <tr>
      <td><strong>Sample</strong></td>
      <td><strong>n (days)</strong></td>
      <td><strong>Standard error of daily mean</strong></td>
      <td><strong>t-statistic at mean = 0.04%</strong></td>
    </tr>
    <tr>
      <td>1 month</td><td>21</td><td>0.262%</td><td>0.15</td>
    </tr>
    <tr>
      <td>1 year</td><td>252</td><td>0.0756%</td><td>0.53</td>
    </tr>
    <tr>
      <td>5 years</td><td>1260</td><td>0.0338%</td><td>1.18</td>
    </tr>
    <tr>
      <td>10 years</td><td>2520</td><td>0.0239%</td><td>1.67</td>
    </tr>
  </tbody>
</table>

Ten years of daily data still fails to reach conventional significance. This is not a defect of the example; it is the ordinary condition of return prediction.

> warning **The same slowness applies to Sharpe ratios** A Sharpe ratio is a mean divided by a standard deviation, so its precision inherits the same `1/sqrt(n)` behaviour. A high Sharpe on a two-year sample is compatible with a very wide range of true values.

---

#### Where the Theorems Are Doing Silent Work

You rely on the CLT far more often than you invoke it.

- **Every confidence interval and t-test** on a mean return, a regression coefficient, or a difference between strategies. See [Hypothesis Testing](/stat-methods/hypothesis-testing).
- **Annualisation by `sqrt(T)`.** Scaling volatility or Sharpe from daily to annual assumes independent increments, which is the same assumption that makes variance additive.
- **The normal approximation in parametric VaR.** Aggregating many small independent shocks over a horizon pushes the sum towards normality — which is why VaR at a monthly horizon is better behaved than at a daily one, and why neither helps if the true driver is a single jump.
- **Monte Carlo simulation.** Simulation error also falls as `1/sqrt(paths)`. Ten thousand paths gives about one per cent relative precision on a well-behaved expectation, and far worse on a deep tail quantile.
- **Aggregation of returns.** Daily returns are visibly non-normal; monthly returns much less so. The CLT is why, and it is also why fitting a normal to monthly data and then scaling down to daily is a mistake.

---

#### In Practice Across Asset Classes

- **Equities.** Daily index returns have heavy tails and volatility clustering, so convergence to normality on aggregation is slower than the independent case would predict. Monthly returns are noticeably closer to normal than daily.
- **Fixed income.** Yield changes are better behaved than equity returns in normal conditions, but rate moves cluster tightly around policy meetings and data releases, so effective independent sample size is much lower than the raw count of days.
- **Futures.** Long histories are available on liquid contracts, but a stitched series spans multiple contract specifications and market structures. The number of *observations* grows while the number of *regimes* stays small.
- **FX.** Carry returns look well-behaved for long stretches and then deliver one severe move. The LLN eventually applies; the horizon over which it applies may exceed the life of the strategy.
- **Credit.** Defaults are rare events. Estimating a default probability of one per cent to within a relative tolerance of ten per cent requires an enormous number of issuer-years, and defaults are correlated, so those issuer-years are not independent.
- **On-chain.** Sample lengths are short and dominated by a handful of market-wide events. A statistic estimated from an on-chain series is frequently based on far fewer independent episodes than the row count implies.

---

#### Assumptions and Failure Modes

- **Independence.** Serial correlation reduces the *effective* sample size. If returns are positively autocorrelated, `n` observations carry less information than `n` independent ones, and the standard error `sigma / sqrt(n)` is too small. Correct with a Newey-West style adjustment or a block bootstrap. See [Autocorrelation](/quant-math/autocorrelation) and [Bootstrap](/stat-methods/bootstrap).
- **Identical distribution.** Financial series shift regime. Averaging across a regime change estimates a blend that describes no actual period. See [Stationarity](/quant-math/stationarity).
- **Finite variance.** The classical CLT requires it. For sufficiently heavy tails the sum converges to a stable law with infinite variance instead, and the `sqrt(n)` scaling is simply wrong.
- **Slow convergence in the tails.** The CLT describes the centre of the distribution well and the extreme tails badly. Using a normal approximation for a 99.9% quantile is exactly the case where the theorem gives least support.
- **The LLN applies to the mean, not to the maximum.** Sample averages stabilise; sample maxima do not. Drawdown and worst-case measures keep growing with sample length, so a longer backtest mechanically shows a deeper maximum drawdown. See [Drawdown](/quant-math/drawdown).
- **Multiple testing destroys the guarantee.** A t-statistic of 2 means something when one hypothesis was tested. After a hundred variants, the largest t-statistic is expected to exceed 2 whether or not any edge exists. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### Code

```python
import numpy as np

def mean_standard_error(returns, autocorrelation_lags=0):
    """Standard error of a sample mean, optionally adjusted for serial correlation.

    Ignoring positive autocorrelation understates the error and
    manufactures significance that is not there.
    """
    r = np.asarray(returns, dtype=float)
    n = len(r)
    variance = r.var(ddof=1)

    # Newey-West style correction with Bartlett weights.
    deviations = r - r.mean()
    for lag in range(1, autocorrelation_lags + 1):
        weight = 1.0 - lag / (autocorrelation_lags + 1)
        gamma = (deviations[lag:] * deviations[:-lag]).sum() / n
        variance += 2.0 * weight * gamma

    return np.sqrt(max(variance, 0.0) / n)


def periods_for_significance(mean, std, target_t=2.0):
    """How many observations before a mean of this size reaches a target t-stat."""
    return (target_t * std / mean) ** 2
```

---

#### See Also

* [Sampling](/quant-math/sampling)
* [Returns](/quant-math/returns)
* [Volatility](/quant-math/volatility)
* [Expectation & Variance](/quant-math/expectation-variance)
* [Hypothesis Testing](/stat-methods/hypothesis-testing)
* [Confidence Intervals](/stat-methods/confidence-intervals)
* [Bootstrap](/stat-methods/bootstrap)
* [Backtest vs Live](/risk/backtest-vs-live)

---

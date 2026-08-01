### Hypothesis Testing

> info **Metadata** Level: Intermediate | Prerequisites: Sampling, Expectation & Variance | Tags: statistics, inference, p-values, significance, power

Hypothesis testing is a procedure for deciding whether a pattern in a sample is large enough that random noise is an implausible explanation for it. In quantitative finance the question is almost always the same: this strategy made money in the backtest, but would a strategy with no edge at all have made this much money by luck?

The machinery is simple and the interpretation is where nearly everyone goes wrong. A test does not tell you the probability that your strategy works. It tells you how surprising your data would be if your strategy did not work. Those are different statements, and confusing them is the single most common statistical error in trading research.

---

#### Formal Definition

A test has two competing statements about the world:

```text
H0 (null)        : the parameter equals some value, usually zero
H1 (alternative) : the parameter is different from that value
```

You compute a **test statistic** that measures how far the sample estimate sits from the null value, in units of its own uncertainty:

```text
t = (estimate - null_value) / standard_error(estimate)

for a sample mean of n observations with sample std dev s:
standard_error(mean) = s / sqrt(n)
```

where `estimate` is the quantity measured from data (e.g. the sample mean return), `null_value` is what `H0` asserts (typically 0), and `standard_error` is the standard deviation of the estimate across hypothetical repeated samples.

The **p-value** is the probability of observing a test statistic at least as extreme as the one you got, *assuming `H0` is true*. If the p-value falls below a pre-chosen threshold `alpha` (conventionally 0.05), the result is called statistically significant and `H0` is rejected.

> warning **What a p-value is not** It is not the probability the null is true, not the probability your result is a fluke, and not the size of the effect. A p-value of 0.01 on a strategy with a 0.02% daily edge is a statement about noise, not about profitability.

---

#### Worked Example

A daily strategy is tested over one year. The observed statistics:

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Observations (trading days)</td><td>252</td></tr>
    <tr><td>Mean daily return</td><td>0.040%</td></tr>
    <tr><td>Daily standard deviation</td><td>0.800%</td></tr>
    <tr><td>Null hypothesis</td><td>true mean daily return is 0</td></tr>
  </tbody>
</table>

Step by step:

1. **Standard error of the mean**: `0.800% / sqrt(252) = 0.800% / 15.87 = 0.0504%`
2. **Test statistic**: `t = 0.040% / 0.0504% = 0.79`
3. **Critical value**: for a two-tailed test at 5% with 251 degrees of freedom, roughly 1.97 — near enough to the normal value of 1.96
4. **Decision**: `0.79` is far below `1.97`, so the null is not rejected
5. **Approximate p-value**: about 0.43

The strategy earned roughly 10.1% over the year with an annualised volatility of about 12.7%, an annualised [Sharpe ratio](/quant-math/sharpe) of 0.79. That is a perfectly respectable-sounding result, and one year of data cannot distinguish it from zero.

This is not a coincidence. For returns with mean zero under the null, the t-statistic on the mean is almost exactly the Sharpe ratio scaled by the square root of the sample length in years:

```text
t = Sharpe_annualised * sqrt(years_of_data)
```

One year at Sharpe 0.79 gives `t = 0.79`. To clear `t = 2` at that Sharpe you would need about `(2 / 0.79)^2 = 6.4` years.

---

#### Type I and Type II Errors, and Power

<table>
  <tbody>
    <tr><td></td><td><strong>H0 is true</strong></td><td><strong>H0 is false</strong></td></tr>
    <tr><td><strong>Reject H0</strong></td><td>Type I error (false positive), probability alpha</td><td>Correct — a genuine detection</td></tr>
    <tr><td><strong>Do not reject H0</strong></td><td>Correct</td><td>Type II error (false negative), probability beta</td></tr>
  </tbody>
</table>

**Power** is `1 - beta`: the probability the test detects a real effect of a given size, depending on the effect size, the sample size, and `alpha`. Quant research is chronically underpowered because return effects are tiny relative to return volatility. To detect a true annualised Sharpe of 0.5 with 80% power at a two-tailed 5% level, the required sample follows from `Sharpe * sqrt(years) = z_alpha/2 + z_beta`, where the two critical values are roughly 1.96 and 0.84:

```text
years = ((1.96 + 0.84) / 0.5)^2 = (2.80 / 0.5)^2 = 31.4
```

Thirty-one years of daily data to reliably confirm a Sharpe of 0.5. Most published strategy research has a fraction of that, which means most negative results are uninformative and most positive results are selected. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### One-Tailed versus Two-Tailed

A **two-tailed** test asks whether the parameter differs from the null in either direction, splitting `alpha` between both tails. A **one-tailed** test asks whether it exceeds the null in one specified direction and puts all of `alpha` in that tail, giving a lower critical value (roughly 1.64 rather than 1.96 at 5%). It is legitimate only when the direction was fixed before seeing the data and a result in the opposite direction would be treated the same as no result. Switching to one-tailed after observing the sign silently doubles the false positive rate. In strategy research the honest default is two-tailed, because a strategy that loses money reliably is a finding, not a non-result.

---

#### In Practice Across Asset Classes

**Equity factor research.** Tests on long-short factor portfolios use monthly returns over decades, so the t-statistic on the mean is the standard reporting convention. Because thousands of candidate factors have been screened by the profession as a whole, a t-statistic of 2 on a newly proposed factor carries far less evidential weight than the nominal 5% suggests.

**Futures and managed futures.** Trend-following signals are tested across many markets simultaneously. Returns across markets are correlated during trends, so the effective number of independent observations is much smaller than the count of market-days, and naive standard errors are too small.

**FX.** Carry and momentum tests must contend with pegged and managed currencies, where the null of zero mean change is mechanically true for long stretches and then violently false. Pooling pegged and floating currencies in one test mixes two different data-generating processes.

**Fixed income and credit.** Returns are driven by a small number of slow-moving factors, so consecutive monthly observations carry overlapping information. Overlapping-horizon regressions (12-month returns sampled monthly) inflate t-statistics badly unless the standard errors are corrected. See [Regression Diagnostics](/stat-methods/regression-diagnostics).

**On-chain strategies.** Sample histories are short and structural change is fast — a fee tier changes, an incentive programme ends, a competing venue launches. A significant result on eight months of data is best treated as a hypothesis to be pre-registered and tested forward, not as a conclusion.

---

#### Assumptions and Failure Modes

- **Independent observations.** The `s / sqrt(n)` standard error assumes serially uncorrelated data. Positive [autocorrelation](/quant-math/autocorrelation) means the true standard error is larger, so t-statistics are inflated and false positives multiply.
- **Stable distribution.** The test assumes the parameter being estimated is constant over the sample. If the edge existed for two years and then decayed, the pooled test answers a question nobody asked. See [Stationarity](/quant-math/stationarity).
- **Normality of the estimate.** Justified for large `n` by the [central limit theorem](/quant-math/lln-clt), but returns have heavy tails and finite samples, so convergence is slower than the theory's asymptotics suggest. [Bootstrap](/stat-methods/bootstrap) methods avoid the assumption.
- **A single pre-specified test.** The entire framework assumes you decided what to test before looking. Testing many variants and reporting the winner invalidates every p-value on the page.
- **Alpha chosen in advance.** Moving the threshold after seeing the p-value, or reporting "marginally significant", converts a decision rule into a narrative device.
- **Statistical significance is not economic significance.** With enough data a 0.1 basis point per day edge becomes significant and stays uninvestable after costs. Report the effect size next to the p-value.

> warning **Absence of evidence** Failing to reject `H0` does not establish that the effect is zero. On a short sample it usually means the test had no power to detect anything. Report the [confidence interval](/stat-methods/confidence-intervals) so readers can see what effect sizes remain plausible.

---

#### Code

```python
import numpy as np
from scipy import stats


def t_test_mean(returns, null_mean=0.0):
    """Two-tailed t-test that the mean return differs from null_mean.

    Assumes serially uncorrelated returns; use a HAC standard error
    when that fails.
    """
    r = np.asarray(returns, dtype=float)
    standard_error = r.std(ddof=1) / np.sqrt(r.size)
    t_stat = (r.mean() - null_mean) / standard_error
    return t_stat, 2 * stats.t.sf(abs(t_stat), df=r.size - 1)


def years_for_power(target_sharpe, alpha=0.05, power=0.80):
    """Sample length needed to detect an annualised Sharpe at given power."""
    z_sum = stats.norm.ppf(1 - alpha / 2) + stats.norm.ppf(power)
    return (z_sum / target_sharpe) ** 2
```

---

#### See Also

* [Confidence Intervals](/stat-methods/confidence-intervals)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Sharpe Ratio](/quant-math/sharpe)
* [Backtest vs Live](/risk/backtest-vs-live)

---

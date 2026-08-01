### Expectation & Variance

> info **Metadata** Level: Intermediate | Prerequisites: Random Variables | Tags: math, expectation, variance, risk, dispersion

Expectation is the probability-weighted average of a random variable; variance is the probability-weighted average squared distance from that mean. Together they are the first two moments, and they carry an outsized share of the work in finance: expected return drives allocation, and variance — through its square root, volatility — drives almost every risk limit, margin calculation, and option price in use.

The asymmetry between them matters. Expectation is **linear**: the expected return of a portfolio is the weighted sum of the constituents' expected returns, always, with no assumption about how they co-move. Variance is **not** linear: portfolio variance depends on the pairwise interactions between assets, which is precisely why diversification works and why estimating a covariance matrix is harder than estimating a vector of means.

---

#### Formal Definition

For a discrete random variable `X` with mass `p(x)`, and for a continuous one with density `f(x)`:

```text
E[X] = sum over x of  x * p(x)
E[X] = integral of    x * f(x) dx
```

Variance is defined as the expected squared deviation, with a computational shortcut:

```text
Var(X) = E[(X - E[X])^2] = E[X^2] - (E[X])^2
sigma  = sqrt(Var(X))
```

where:

- `E[X]` is the mean, also written `mu`
- `Var(X)` is the variance, also written `sigma^2`
- `sigma` is the standard deviation, in the same units as `X`

The key algebraic rules, for constants `a` and `b`:

```text
E[aX + b]     = a * E[X] + b
E[X + Y]      = E[X] + E[Y]              always, dependence irrelevant
Var(aX + b)   = a^2 * Var(X)
Var(X + Y)    = Var(X) + Var(Y) + 2 * Cov(X, Y)
```

The last line is the whole of portfolio theory in one equation. Only when `Cov(X, Y) = 0` do variances add.

**Higher moments.** Skewness (third standardised moment) measures asymmetry; kurtosis (fourth) measures tail weight. A strategy that sells insurance has negative skew and high kurtosis, and the first two moments will not reveal it.

---

#### Worked Example

A portfolio holds 60% in an equity fund and 40% in a short-duration bond fund. Annual estimates:

<table>
  <tbody>
    <tr>
      <td><strong>Asset</strong></td>
      <td><strong>Weight</strong></td>
      <td><strong>Expected return</strong></td>
      <td><strong>Volatility</strong></td>
    </tr>
    <tr>
      <td>Equity fund</td>
      <td>0.60</td>
      <td>8.0%</td>
      <td>20.0%</td>
    </tr>
    <tr>
      <td>Bond fund</td>
      <td>0.40</td>
      <td>3.0%</td>
      <td>6.0%</td>
    </tr>
  </tbody>
</table>

Correlation between them is `rho = 0.25`.

1. **Expected portfolio return** (linearity, no correlation needed): `E[R_p] = (0.60)(8.0%) + (0.40)(3.0%) = 4.8% + 1.2% = 6.0%`
2. **Covariance from correlation**: `Cov = rho * sigma_1 * sigma_2 = 0.25 * 0.20 * 0.06 = 0.0030`
3. **Portfolio variance**, term by term:
   - equity term: `(0.60)^2 * (0.20)^2 = 0.36 * 0.04 = 0.014400`
   - bond term: `(0.40)^2 * (0.06)^2 = 0.16 * 0.0036 = 0.000576`
   - cross term: `2 * 0.60 * 0.40 * 0.0030 = 0.001440`
   - total: `Var(R_p) = 0.016416`
4. **Portfolio volatility**: `sqrt(0.016416) = 0.1281 = 12.81%`

Compare that to the weighted average of the two volatilities, `(0.60)(20%) + (0.40)(6%) = 14.4%`. The portfolio is 1.59 percentage points less volatile than a naive weighted average, and every bit of that reduction comes from the correlation being below 1. Note also that the equity term alone is 88% of the total variance despite equities being only 60% of the capital — variance weights by the square of the exposure.

---

#### Conditional Expectation and Variance Decomposition

Conditioning is how information enters. `E[X | I]` is the expectation given information set `I`, and it is itself a random variable until `I` is observed. Two identities do most of the work:

```text
E[X]   = E[ E[X | Y] ]                                    tower property
Var(X) = E[ Var(X | Y) ] + Var( E[X | Y] )                law of total variance
```

The second decomposition is genuinely useful. Suppose returns are drawn from a calm regime or a stressed regime. The first term is the average within-regime variance; the second is the variance *of the regime means*. A model that fits a single unconditional variance silently merges the two and will understate risk in the stressed regime while overstating it in the calm one. See [Regimes Overview](/regimes-macro/regimes-overview).

Conditional expectation is also the formal definition of a forecast: the minimum mean-squared-error predictor of `X` given `I` is `E[X | I]`. That is the link between this page and every regression you will fit. See [Linear Regression](/stat-methods/linear-regression).

---

#### In Practice Across Asset Classes

- **Equities.** Expected returns are notoriously hard to estimate and variances comparatively easy — the reason robust portfolio construction leans on the covariance structure and treats mean estimates with suspicion. Factor models reduce the number of parameters that need estimating. See [Factor Models](/stat-methods/factor-models).
- **Fixed income.** Expected return decomposes cleanly into yield, roll-down, and expected capital gain from rate moves. Variance is dominated by duration times the variance of yield changes, so a single duration number carries most of the risk. See [Duration & Convexity](/markets/duration-convexity).
- **Futures.** Expected return on a fully collateralised position is roughly the collateral yield plus expected roll yield. Getting the variance right requires the return series to be built on a consistent roll. See [Roll and Carry](/markets/roll-and-carry).
- **FX.** The expected return of a carry position is the interest differential minus expected depreciation. Variance understates the risk badly, because the loss distribution is sharply negatively skewed. See [FX Carry & Parity](/markets/fx-carry-parity).
- **Credit.** Expected loss factors as `probability of default * loss given default * exposure`. The variance of that product is driven by the correlation between defaults, not by the individual probabilities. See [Credit Spreads](/credit/credit-spreads).
- **Options.** The whole of derivatives pricing is an expectation under a changed measure, and the second moment of the underlying is the pricing input. See [Black-Scholes](/derivatives/black-scholes).
- **On-chain.** Fee income on a liquidity position has a positive mean and a variance driven by volume, while the position's inventory loss is a convex function of price. The mean of a convex function is not the function of the mean, so evaluating expected liquidity-provision profit at the expected price is systematically wrong.

---

#### Assumptions and Failure Modes

- **Variance treats gains and losses identically.** A `+10%` month and a `-10%` month contribute equally. Where that is unacceptable, use downside deviation ([Sortino Ratio](/quant-math/sortino)) or a tail measure ([VaR & CVaR](/quant-math/var-cvar)).
- **The first two moments do not identify a distribution.** Two return series can share a mean and a variance and have completely different tail behaviour. Selling deep out-of-the-money options is the standard illustration.
- **Variance may not exist.** For sufficiently heavy tails the population variance is infinite and the sample variance simply grows with the sample. Every ratio built on it becomes an artefact of sample size.
- **Sample moments are estimates, not facts.** The mean has standard error `sigma / sqrt(n)`, which converges slowly. Estimating an equity risk premium to within a percentage point takes decades of data. See [LLN & CLT](/quant-math/lln-clt).
- **Outliers dominate.** Variance squares deviations, so a single extreme observation can control the estimate. Decide deliberately whether an outlier is data or an error before removing it.
- **Estimation error compounds in optimisation.** Portfolio optimisers push weight towards assets whose means were overestimated and whose variances were underestimated. See [Optimization](/quant-math/optimization).

> warning **Averages of ratios are not ratios of averages** `E[X / Y]` does not equal `E[X] / E[Y]`. The mistake appears whenever performance is aggregated across periods or accounts by averaging percentages.

---

#### Code

```python
import numpy as np

def portfolio_moments(weights, expected_returns, covariance_matrix):
    """Expected return and volatility of a portfolio.

    Linearity gives the mean directly; the quadratic form is required
    for variance because cross terms do not vanish.
    """
    w = np.asarray(weights, dtype=float)
    mean = w @ np.asarray(expected_returns, dtype=float)
    variance = w @ np.asarray(covariance_matrix, dtype=float) @ w
    return mean, np.sqrt(variance)


def variance_contributions(weights, covariance_matrix):
    """Each asset's share of total portfolio variance.

    Contributions sum to 1 and are usually far from the capital weights.
    """
    w = np.asarray(weights, dtype=float)
    cov = np.asarray(covariance_matrix, dtype=float)
    marginal = cov @ w
    return (w * marginal) / (w @ marginal)
```

---

#### See Also

* [Random Variables](/quant-math/random-variables)
* [Covariance](/quant-math/covariance)
* [Volatility](/quant-math/volatility)
* [Mean-Variance](/quant-math/mean-variance)
* [LLN & CLT](/quant-math/lln-clt)
* [Linear Regression](/stat-methods/linear-regression)
* [Duration & Convexity](/markets/duration-convexity)

---

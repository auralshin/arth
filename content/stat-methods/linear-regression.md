### Linear Regression

> info **Metadata** Level: Intermediate | Prerequisites: Covariance, Hypothesis Testing | Tags: statistics, regression, ols, alpha, beta, factor-models

Linear regression fits a straight line through a cloud of points by minimising the sum of squared vertical distances. It is the workhorse of quantitative finance: beta to the market, factor exposures, hedge ratios, the sensitivity of a spread to a driver, and the risk decomposition behind most portfolio analytics are all regression outputs wearing different names.

The mechanics are undergraduate algebra. What matters is knowing which assumptions the standard errors depend on, because in financial data those assumptions fail routinely and the coefficient estimates stay usable while the significance tests quietly stop meaning anything. This page covers estimation and interpretation; [Regression Diagnostics](/stat-methods/regression-diagnostics) covers what to do when the assumptions break.

---

#### Formal Definition

The simple regression model with one explanatory variable:

```text
y_i = alpha + beta * x_i + e_i
```

where:

- `y_i` is the dependent variable (an asset's excess return), `x_i` the independent one (the market's)
- `alpha` is the intercept: the expected value of `y` when `x` is zero
- `beta` is the slope: the expected change in `y` per unit change in `x`
- `e_i` is the residual, the part of `y_i` the line does not explain

**Ordinary Least Squares (OLS)** chooses `alpha` and `beta` to minimise `sum(e_i^2)`. The closed form, the goodness-of-fit measure `R^2`, and the standard errors, with `n` observations and `k` regressors plus intercept:

```text
beta_hat       = Cov(x, y) / Var(x)
alpha_hat      = mean(y) - beta_hat * mean(x)

SSR            = sum((y_i - y_fitted_i)^2)     residual sum of squares
SST            = sum((y_i - mean(y))^2)        total sum of squares
R^2            = 1 - SSR / SST

s^2            = SSR / (n - k - 1)
Sxx            = sum((x_i - mean(x))^2)
se(beta_hat)   = s / sqrt(Sxx)
se(alpha_hat)  = s * sqrt(1/n + mean(x)^2 / Sxx)
t(beta_hat)    = beta_hat / se(beta_hat)
```

**The classical assumptions.** OLS is unbiased under the first three; the standard errors above additionally require the last two.

1. **Linearity** — the true relationship is linear in the parameters
2. **Exogeneity** — residuals have zero mean and are uncorrelated with the regressors
3. **No perfect collinearity** — no regressor is an exact linear combination of the others
4. **Homoskedasticity** — residual variance is constant across observations
5. **No autocorrelation** — residuals are uncorrelated with each other

---

#### Worked Example

Five monthly observations of an asset's excess return against the market's excess return, in percent. Five points is far too few for real inference — it is used here so every number can be checked by hand.

<table>
  <tbody>
    <tr><td><strong>Month</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td><strong>Market x (%)</strong></td><td>2.0</td><td>-1.0</td><td>3.0</td><td>0.0</td><td>1.0</td></tr>
    <tr><td><strong>Asset y (%)</strong></td><td>3.5</td><td>-1.5</td><td>5.0</td><td>0.5</td><td>2.5</td></tr>
  </tbody>
</table>

1. **Means**: `mean(x) = 5.0 / 5 = 1.0`, `mean(y) = 10.0 / 5 = 2.0`
2. **Deviations from the mean**: `x` gives `1, -2, 2, -1, 0`; `y` gives `1.5, -3.5, 3.0, -1.5, 0.5`
3. **Sxx**: `1 + 4 + 4 + 1 + 0 = 10`
4. **Sxy**: `1.5 + 7.0 + 6.0 + 1.5 + 0 = 16.0`
5. **Beta**: `16.0 / 10 = 1.60`
6. **Alpha**: `2.0 - 1.60 * 1.0 = 0.40%` per month
7. **Fitted values**: `3.6, -1.2, 5.2, 0.4, 2.0`
8. **Residuals**: `-0.1, -0.3, -0.2, 0.1, 0.5` — they sum to zero, as OLS guarantees
9. **SSR**: `0.01 + 0.09 + 0.04 + 0.01 + 0.25 = 0.40`
10. **SST**: `2.25 + 12.25 + 9.00 + 2.25 + 0.25 = 26.00`
11. **R-squared**: `1 - 0.40 / 26.00 = 0.985`

Now the standard errors, with `n - 2 = 3` degrees of freedom:

12. **Residual variance**: `s^2 = 0.40 / 3 = 0.1333`, so `s = 0.365`
13. **se(beta)**: `0.365 / sqrt(10) = 0.115`, giving `t = 1.60 / 0.115 = 13.9`
14. **se(alpha)**: `0.365 * sqrt(1/5 + 1/10) = 0.365 * 0.548 = 0.200`, giving `t = 0.40 / 0.200 = 2.00`
15. **Critical value**: two-tailed 5% with 3 degrees of freedom, roughly 3.18

The beta of 1.60 is overwhelmingly significant. The alpha of 0.40% per month is not — its t-statistic of 2.00 falls short of the 3.18 hurdle. This is the normal state of affairs: exposures are easy to estimate, alpha is not.

---

#### Interpreting the Output

**Beta** is the exposure. A beta of 1.60 says the asset historically moved 1.6% for every 1% move in the market. It is also a hedge ratio: shorting 1.6 units of market exposure per unit of the asset removes the fitted market sensitivity. Beta is a conditional expectation, not a physical constant — it drifts, and it typically rises in market stress.

**Alpha** is average return unexplained by the regressors. It is only interpretable relative to the specific right-hand side used. An "alpha" against the market alone frequently vanishes once size, value, and momentum factors are added; see [Factor Models](/stat-methods/factor-models).

**R-squared** is the fraction of variance explained. High `R^2` means the regressors capture most of the variation; it says nothing about whether the relationship is causal, stable, or tradable. A regression of one asset on a nearly identical asset gives `R^2` near 1 and no information. The decomposition `Residual variance = (1 - R^2) * Var(y)` matters more than `R^2` itself: `1 - R^2 = 0.015` above means 1.5% of the asset's variance is idiosyncratic, and that residual is what an alpha strategy trades.

> warning **A significant beta does not validate a model** OLS will fit a line through any cloud of points. Significance of the slope tests whether the slope differs from zero, not whether a linear model is the right description.

---

#### In Practice Across Asset Classes

**Equities.** The canonical use is estimating market beta from 60 monthly or 250 daily returns. Daily estimates are noisier per observation but more numerous; monthly estimates are less contaminated by microstructure noise. Betas for illiquid small caps are biased downward by stale prices, which motivates including lagged market returns and summing the coefficients.

**Futures and fixed income.** Regressions of a portfolio's returns on individual contracts recover implied exposures for risk reporting, but the regressors are highly correlated within a sector, so individual coefficients are unstable even when the fitted values are reliable. Yield changes are regressed on principal components of the curve rather than on individual tenors for exactly this reason. See [PCA](/stat-methods/pca).

**FX and credit.** Regressions between currency pairs sharing a common leg produce mechanically correlated residuals, so cross-rate regressions must account for the shared numeraire. Spread changes regressed on the equity returns of the same issuer recover an empirical version of the structural equity-credit link, with non-synchronous pricing between the two markets biasing the slope toward zero.

**On-chain.** Regressions of a liquidity provider's realised returns on realised volatility and volume estimate fee capture versus adverse selection. The regressors are jointly determined with the outcome, so the coefficients are descriptive rather than causal.

---

#### Assumptions and Failure Modes

- **Linearity.** Option-like payoffs, leveraged products, and liquidation-driven positions have curved relationships. A linear beta on a convex payoff is wrong in both tails at once — adding a squared term reveals this immediately.
- **Exogeneity.** If the regressor is determined jointly with the outcome, or an omitted variable drives both, the coefficient is biased and no amount of data fixes it.
- **Homoskedasticity and no autocorrelation.** Financial residuals cluster in volatility, and overlapping return horizons or slow-moving regressors make them serially correlated. Coefficients stay unbiased; the standard errors are wrong and t-statistics inflated. Use robust and HAC standard errors.
- **Stable coefficients.** Betas move with regime. A full-sample beta is an average over periods in which the exposure genuinely differed. Rolling estimation shows this; see [Rolling Windows](/quant-math/rolling-windows).
- **Outlier sensitivity.** Squared-error loss gives extreme observations enormous leverage. A single crisis day can dominate a beta estimated on a quiet year.
- **Non-stationary variables.** Regressing one price level on another produces spurious significance. Regress returns or differences, or test for [cointegration](/stat-methods/cointegration) first. See [Unit Roots](/stat-methods/unit-roots).

---

#### Code

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm


def market_model(asset_excess_returns, market_excess_returns):
    """Estimate alpha and beta against a single market factor.
    Robust ('HC1') errors: return residuals are always heteroskedastic.
    """
    frame = pd.concat(
        {"asset": asset_excess_returns, "market": market_excess_returns}, axis=1
    ).dropna()
    design = sm.add_constant(frame[["market"]])
    return sm.OLS(frame["asset"], design).fit(cov_type="HC1")


# Manual check of the closed form, useful when debugging a pipeline.
def ols_slope_intercept(x, y):
    x, y = np.asarray(x, float), np.asarray(y, float)
    beta = np.cov(x, y, ddof=1)[0, 1] / np.var(x, ddof=1)
    return beta, y.mean() - beta * x.mean()
```

---

#### See Also

* [Regression Diagnostics](/stat-methods/regression-diagnostics)
* [Factor Models](/stat-methods/factor-models)
* [Cointegration](/stat-methods/cointegration)
* [Covariance](/quant-math/covariance)
* [Rolling Windows](/quant-math/rolling-windows)

---

### Regression Diagnostics

> info **Metadata** Level: Advanced | Prerequisites: Linear Regression, Autocorrelation | Tags: statistics, regression, hac, newey-west, heteroskedasticity, multicollinearity

Ordinary least squares gives you two things: coefficient estimates and standard errors. In financial data the coefficients are usually fine and the standard errors are usually wrong. Diagnostics are the process of finding out which assumption failed and correcting the inference rather than the fit.

The stakes are concrete. A t-statistic of 3.5 that becomes 1.8 after correcting for autocorrelated residuals is the difference between a publishable finding and noise. Most of the "edges" that fail to survive live trading were never significant to begin with — they were significant under an independence assumption that the data never satisfied. See [Backtest vs Live](/risk/backtest-vs-live).

---

#### Heteroskedasticity

**Homoskedasticity** means the residual variance is constant across observations. Financial residuals cluster: volatile periods produce large residuals in runs, calm periods produce small ones. This is heteroskedasticity, and it is the normal condition of return data.

What breaks: OLS coefficients remain unbiased and consistent, but the conventional standard error formula, which assumes a single residual variance `s^2`, is biased — usually downward when large residuals coincide with extreme regressor values. The fix is a **heteroskedasticity-consistent (White) covariance estimator**, replacing the single `s^2` with observation-specific squared residuals:

```text
Var(beta_hat) = (X'X)^-1  *  ( sum_i  e_i^2 * x_i x_i' )  *  (X'X)^-1
```

where `x_i` is the row of regressors for observation `i` and `e_i` its residual. In statsmodels this is `cov_type="HC1"`, the small-sample corrected version, and there is essentially no cost to using it by default. To detect the problem, plot residuals against fitted values and look for a fan shape, or run a Breusch-Pagan test — but in practice, assume it is present.

---

#### Autocorrelated Residuals and HAC Standard Errors

Correlated residuals are the more damaging problem, because the bias in the standard error can be large. Three common causes:

- **Overlapping horizons.** Regressing 12-month forward returns sampled monthly means consecutive observations share 11 months of data. Residuals are correlated by construction out to lag 11.
- **Persistent regressors.** Slow-moving predictors such as valuation ratios or carry produce residuals that inherit their persistence.
- **Omitted slow variables.** Any missing driver with memory pushes its [autocorrelation](/quant-math/autocorrelation) into the residual.

The **Newey-West** estimator, a heteroskedasticity- and autocorrelation-consistent (HAC) covariance estimator, adds weighted lagged cross-products so the variance accounts for the dependence. For the mean of a series the correction factor takes a readable form, and the corrected standard error is the naive one multiplied by `sqrt(factor)`:

```text
factor = 1 + 2 * sum_{j=1..L} w_j * rho_j

w_j    = 1 - j / (L + 1)          Bartlett weights, decaying to zero
rho_j  = residual autocorrelation at lag j
L      = maximum lag included
```

**Worked example.** A regression reports a coefficient with a naive t-statistic of 2.50. The residual autocorrelations are `rho_1 = 0.30`, `rho_2 = 0.15`, `rho_3 = 0.05`, and `L = 3` lags are used.

1. **Bartlett weights**: `w_1 = 1 - 1/4 = 0.75`, `w_2 = 1 - 2/4 = 0.50`, `w_3 = 1 - 3/4 = 0.25`
2. **Weighted sum**: `0.75 * 0.30 + 0.50 * 0.15 + 0.25 * 0.05 = 0.225 + 0.075 + 0.0125 = 0.3125`
3. **Factor**: `1 + 2 * 0.3125 = 1.625`
4. **Standard error inflation**: `sqrt(1.625) = 1.275`
5. **Corrected t-statistic**: `2.50 / 1.275 = 1.96`

The result lands exactly on the conventional two-tailed 5% boundary instead of comfortably clearing it. Mild residual autocorrelation was doing 22% of the work.

**Choosing L.** A rule of thumb sets `L` near `4 * (n / 100)^(2/9)`; for overlapping-horizon regressions `L` should be at least the overlap length. Too small an `L` leaves dependence uncorrected, too large adds noise to the variance estimate. Report the choice.

> warning **HAC corrects inference, not estimation** Newey-West widens the standard error. It does not fix a biased coefficient caused by an omitted variable or a simultaneity problem. If the coefficient is wrong, a correct standard error just gives you an honest interval around a wrong number.

A quicker back-of-envelope check for first-order residual autocorrelation `rho` uses `variance inflation = (1 + rho) / (1 - rho)`. At `rho = 0.30` that is `1.3 / 0.7 = 1.857`, so standard errors rise by `sqrt(1.857) = 1.36` and the same t of 2.50 becomes 1.83.

---

#### Multicollinearity

When regressors are highly correlated with one another, the design matrix is close to singular. The fitted values and `R^2` remain fine; the individual coefficients become unstable, with large standard errors and signs that flip when one observation is added.

The **variance inflation factor (VIF)** for regressor `j` is `VIF_j = 1 / (1 - R_j^2)`, where `R_j^2` comes from regressing `x_j` on all the other regressors. A `VIF` of 10 (from `R_j^2 = 0.90`) means the standard error of that coefficient is `sqrt(10) = 3.16` times what it would be with orthogonal regressors.

Financial examples are everywhere: 2-year and 5-year yields, sector ETFs and the market, momentum measured over 6 and 12 months, and value factors built from different accounting ratios. Standard responses are to drop a redundant regressor, combine correlated regressors into a single index, orthogonalise them via [PCA](/stat-methods/pca), or accept the imprecision and interpret only the joint effect.

---

#### Outliers and Leverage

Squared-error loss weights an observation by the square of its residual, so extreme points dominate. Two distinct concepts:

<table>
  <tbody>
    <tr><td><strong>Concept</strong></td><td><strong>Meaning</strong></td><td><strong>Effect on the fit</strong></td></tr>
    <tr><td>Outlier</td><td>Large residual: the point sits far from the fitted line</td><td>Inflates the residual variance, widening all standard errors</td></tr>
    <tr><td>High leverage</td><td>Extreme regressor value, far from mean(x)</td><td>Pulls the line toward itself, changing the coefficients</td></tr>
    <tr><td>Influential point</td><td>Both at once, measured by Cook's distance</td><td>Can determine the result single-handedly</td></tr>
  </tbody>
</table>

The practical test: refit with the most extreme few observations removed. If the conclusion changes, the conclusion belongs to those observations. Whether that invalidates the result depends on whether the extreme days are data errors (remove them) or genuine crisis behaviour (keep them and say so — for many risk questions those days *are* the question). See [Cleaning](/data-tooling/cleaning).

---

#### In Practice Across Asset Classes

**Equity factor research.** Newey-West standard errors are the default reporting convention for factor premia because monthly factor returns retain some persistence and researchers frequently use overlapping formation windows. Cross-sectional regressions run period by period are aggregated using standard errors across periods, which handles cross-sectional dependence within a period automatically.

**Fixed income and FX.** Regressions of yield changes on macro variables face both near-collinear regressors (tenors move together) and persistent residuals; running PCA on the curve first and regressing on the components resolves the collinearity cleanly. Uncovered interest parity regressions use overlapping horizons almost by construction, so HAC with `L` at least the horizon is mandatory, and currency residuals share regional common factors, so panel regressions need clustering by date.

**Credit.** Spread-change regressions have extreme leverage points at credit events, where a handful of defaults can drive an entire panel coefficient. Winsorising or reporting median regressions alongside OLS is common.

**On-chain.** Regressions on blockchain data face heavy-tailed regressors (transaction sizes, gas prices) and event-driven outliers around exploits and incentive changes. Both effects appear as extreme leverage. Log transforms tame the regressors; the events need explicit dummy variables or exclusion with the exclusion documented.

---

#### Assumptions and Failure Modes

- **Diagnostics assume the model form is right.** A significant heteroskedasticity test can be a symptom of a missing nonlinear term, not of genuinely varying variance. Check the functional form before reaching for robust errors.
- **HAC needs enough observations relative to L.** With `n = 60` and `L = 12` the covariance estimate is itself very noisy, and can fail to be positive definite in the multivariate case.
- **Robust standard errors are not a licence.** They fix the variance, not endogeneity, not selection, not [multiple testing](/stat-methods/multiple-testing).
- **Removing outliers changes the question.** Excluding crisis observations from a risk regression produces a model that is well-behaved and useless exactly when it matters. VIF likewise has no universal threshold: 5 or 10 are conventions, and what matters is whether the coefficient of interest is stable.
- **Residual diagnostics are in-sample.** A model can pass every diagnostic on the estimation sample and fail out of sample. See [Why Backtest](/simulation/why-backtest).

---

#### Code

```python
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor


def fit_with_hac(y, X, max_lag):
    """OLS with Newey-West standard errors.
    max_lag must be at least the overlap length when the dependent
    variable uses overlapping return horizons.
    """
    return sm.OLS(y, sm.add_constant(X)).fit(
        cov_type="HAC", cov_kwds={"maxlags": max_lag}
    )


def hac_inflation(residuals, max_lag):
    """Bartlett-weighted variance inflation for the mean.
    Multiply naive standard errors by the square root of this.
    """
    e = np.asarray(residuals, float)
    e = e - e.mean()
    denom = (e**2).sum()
    total = 1.0
    for lag in range(1, max_lag + 1):
        rho = (e[lag:] * e[:-lag]).sum() / denom
        total += 2 * (1 - lag / (max_lag + 1)) * rho
    return total


def vif_table(X):
    """Variance inflation factor per column; X excludes the constant."""
    values = np.asarray(X, float)
    return {n: variance_inflation_factor(values, i) for i, n in enumerate(X.columns)}
```

---

#### See Also

* [Linear Regression](/stat-methods/linear-regression)
* [Factor Models](/stat-methods/factor-models)
* [Unit Roots](/stat-methods/unit-roots)
* [PCA](/stat-methods/pca)
* [Autocorrelation](/quant-math/autocorrelation)
* [Backtest vs Live](/risk/backtest-vs-live)

---

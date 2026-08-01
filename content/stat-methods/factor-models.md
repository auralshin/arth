### Factor Models

> info **Metadata** Level: Advanced | Prerequisites: Linear Regression, Covariance | Tags: factors, capm, alpha, beta, risk-model, attribution

A factor model explains the returns of many assets using a small number of common drivers. Instead of tracking `n * (n + 1) / 2` covariances between 2,000 stocks, you track each stock's exposure to a handful of factors plus its idiosyncratic variance. The dimensionality collapse is what makes portfolio risk estimation tractable at all.

Factor models also answer the attribution question: of this portfolio's return, how much came from exposures anyone could have bought cheaply, and how much is unexplained? That residual is what most people mean by alpha, and it shrinks every time a new factor is added to the right-hand side.

---

#### Formal Definition

The general linear factor model for asset `i`:

```text
R_i - Rf = alpha_i + b_i1 * F_1 + b_i2 * F_2 + ... + b_ik * F_k + e_i
```

where:

- `R_i - Rf` is the asset's excess return over the risk-free rate
- `F_j` is the return of factor `j` (itself usually a long-short portfolio return)
- `b_ij` is the asset's exposure or loading on factor `j`
- `alpha_i` is the expected return unexplained by the factors
- `e_i` is the idiosyncratic residual, assumed uncorrelated with the factors

The single-factor case is the **Capital Asset Pricing Model (CAPM)** in its empirical form:

```text
R_i - Rf = alpha_i + beta_i * (R_m - Rf) + e_i
```

This is exactly the regression in [Linear Regression](/stat-methods/linear-regression). CAPM as *theory* asserts `alpha_i = 0` for all assets; CAPM as *regression* simply measures `beta_i` and whatever `alpha_i` the data show.

**Risk decomposition.** Because factors and residual are assumed uncorrelated:

```text
Var(R_i) = sum_j sum_l  b_ij * b_il * Cov(F_j, F_l)  +  Var(e_i)
```

The first term is systematic (factor) risk; the second is specific risk. For a portfolio the specific terms diversify away while the factor exposures aggregate linearly:

```text
b_pj = sum_i  w_i * b_ij
```

---

#### Worked Example

A long-short equity portfolio is regressed on three factors: market, size, and value. The regression output and the sample average factor returns:

<table>
  <tbody>
    <tr><td><strong>Factor</strong></td><td><strong>Portfolio exposure</strong></td><td><strong>Mean factor return (% / month)</strong></td><td><strong>Contribution (% / month)</strong></td></tr>
    <tr><td>Market</td><td>0.95</td><td>0.55</td><td>0.5225</td></tr>
    <tr><td>Size</td><td>0.40</td><td>0.20</td><td>0.0800</td></tr>
    <tr><td>Value</td><td>-0.25</td><td>0.15</td><td>-0.0375</td></tr>
  </tbody>
</table>

The portfolio's realised mean excess return was 0.80% per month, with a total return standard deviation of 4.20% per month and a regression `R^2` of 0.88.

1. **Factor-explained return**: `0.5225 + 0.0800 - 0.0375 = 0.565%` per month
2. **Alpha**: `0.80 - 0.565 = 0.235%` per month
3. **Annualised alpha**: `0.235 * 12 = 2.82%` per year
4. **Residual variance share**: `1 - R^2 = 0.12`
5. **Residual volatility, monthly**: `4.20 * sqrt(0.12) = 4.20 * 0.3464 = 1.455%`
6. **Residual volatility, annualised**: `1.455 * sqrt(12) = 5.04%`
7. **Information ratio**: `2.82 / 5.04 = 0.56`

Two readings of the same portfolio. Naively it delivered 0.80% per month; after paying for exposures that could be replicated with cheap index products, 0.235% per month remains. The information ratio of 0.56 on that residual is the relevant risk-adjusted number, and it is a good deal less impressive than the headline. Whether even 0.56 is real depends on the sample length — see [Confidence Intervals](/stat-methods/confidence-intervals).

> info **Negative exposure is still an exposure** The value loading of -0.25 *added* to alpha here, because value's mean return was positive and the portfolio was short it. Had value performed well, the same tilt would have subtracted. Exposures are bets whether or not they were intended.

---

#### How Factors Are Constructed

Three broad approaches, which produce different objects that all get called "factors".

**Characteristic-sorted portfolios (Fama-French style).** Rank the universe on an observable characteristic — market capitalisation, book-to-market, past 12-month return — split into groups, and form a long-short portfolio that is long the group with the higher expected return and short the other; the factor's return series is that portfolio's return. Double-sorting on two characteristics controls for their interaction. Construction choices (breakpoints, weighting, rebalance frequency, universe filters) materially change the resulting series.

**Statistical factors.** Extract factors directly from the return covariance matrix via [PCA](/stat-methods/pca). These maximise explained variance by construction and need no economic story, at the cost of interpretability and of instability when re-estimated.

**Fundamental / cross-sectional models.** Take exposures as *known* from the characteristic itself (a stock's book-to-market is its value exposure, standardised across the universe), then estimate the factor returns period by period by cross-sectional regression of returns on exposures. This is the structure most commercial risk models use.

The distinction matters for interpretation. In a time-series model the loading is estimated and the factor return is given; in a cross-sectional model the loading is given and the factor return is estimated.

---

#### In Practice Across Asset Classes

**Equities.** The most developed use case: a market factor, size, value, momentum, profitability, investment, plus industry and country factors in global models. Exposures are estimated on 3-5 years of monthly data or shorter windows of daily data, with shrinkage toward the universe mean to stabilise them.

**Futures.** Cross-asset factors are usually defined as strategies rather than characteristics: time-series momentum, carry (roll yield), and value across commodity, rate, and equity index contracts. Because each factor is itself a trading rule, its construction assumptions (rebalance lag, contract selection) are also the factor's definition.

**Fixed income and credit.** The dominant factors are curve level, slope, and curvature extracted from yields plus a credit spread factor, coming from PCA rather than from sorted portfolios since bonds are defined by cash flows rather than cross-sectional characteristics. In credit, duration, spread duration, and rating or sector buckets serve as exposures; because bond returns come from infrequent marks, estimated betas are biased toward zero and residual variance is understated.

**FX.** Carry (interest rate differential), momentum, and value (deviation from purchasing power parity) form the standard triad. Carry's residuals are strongly cross-correlated during unwinds, which breaks the "idiosyncratic risk diversifies" assumption exactly when it is needed.

**On-chain.** Token returns load heavily on a single dominant market factor, with secondary factors sometimes identified for sector (layer-1, decentralised finance, infrastructure) and for liquidity. Short histories and rapid universe turnover — tokens that did not exist two years ago — make exposures unstable and survivorship bias severe.

---

#### Assumptions and Failure Modes

- **Residuals are uncorrelated across assets.** The whole risk decomposition depends on it. During crises residual correlations rise together, so the model understates portfolio risk exactly when accuracy matters. See [Types of Risk](/risk/types).
- **Exposures are stable.** Betas drift with the business, with leverage, and with the market regime. A three-year exposure estimate describes a portfolio that no longer exists.
- **The factor set is complete.** Any missing priced factor shows up as alpha; much of what is reported as skill is exposure to a factor nobody put on the right-hand side.
- **Factors are genuinely distinct.** Real factor returns are correlated, so exposures suffer the multicollinearity problem in [Regression Diagnostics](/stat-methods/regression-diagnostics) and individual loadings become unstable.
- **Linear exposure.** Options, convertible bonds, and any position with a liquidation boundary have exposures that change with the level of the factor. A single beta averages two different regimes.
- **Factor returns are estimated, not observed**, so two providers' "value" factors are correlated but not identical and alpha measured against them differs. Alpha is also search-dependent: adding factors shrinks it, searching over specifications inflates it. See [Multiple Testing](/stat-methods/multiple-testing).

> warning **Alpha is a residual, not a discovery** Every reported alpha is the leftover from one specific right-hand side, estimated on one specific sample. Report the factor set, the sample, and the standard error, or the number is uninterpretable.

---

#### Code

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm


def factor_regression(portfolio_excess, factor_returns):
    """Time-series factor regression: exposures plus alpha.
    HAC errors because factor and residual returns retain some
    persistence at monthly frequency.
    """
    data = pd.concat([portfolio_excess.rename("y"), factor_returns], axis=1).dropna()
    design = sm.add_constant(data[factor_returns.columns])
    return sm.OLS(data["y"], design).fit(cov_type="HAC", cov_kwds={"maxlags": 3})


def risk_decomposition(exposures, factor_cov, residual_variance):
    """Split portfolio variance into systematic and specific parts.
    exposures is a 1-D array of loadings; factor_cov is k x k.
    """
    b = np.asarray(exposures, float)
    systematic = b @ np.asarray(factor_cov, float) @ b
    return {
        "systematic_variance": systematic,
        "specific_variance": residual_variance,
        "systematic_share": systematic / (systematic + residual_variance),
    }
```

---

#### See Also

* [Linear Regression](/stat-methods/linear-regression)
* [Regression Diagnostics](/stat-methods/regression-diagnostics)
* [PCA](/stat-methods/pca)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Mean-Variance Optimisation](/quant-math/mean-variance)

---

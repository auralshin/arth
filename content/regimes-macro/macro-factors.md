### Macro Factors

> info **Metadata** Level: Intermediate | Prerequisites: Linear Regression, Factor Models, Market Regimes | Tags: regimes, macro, factors, growth, inflation, nowcasting, point-in-time, data-revisions

A **macro factor lens** reduces the sprawl of economic data to a small number of axes — most commonly **growth**, **inflation**, and **liquidity** — and asks how much of each asset's return is explained by movement along them. It is the same idea as an equity [factor model](/stat-methods/factor-models), applied one level up: instead of decomposing a stock's return into market, size, and value, you decompose an asset class's return into its sensitivity to the macro environment.

The lens earns its keep in two places. It explains why apparently unrelated positions lose together — they share a macro exposure that no asset-class-level risk report shows. And it makes explicit that a portfolio has an implicit macro view whether or not anyone chose one. The lens is also where the most avoidable errors in quantitative research live, because macro data is published late, revised repeatedly, and almost always used incorrectly in backtests.

---

#### Formal Definition

The macro factor regression is:

```text
R_t = alpha + b_g * G_t + b_i * I_t + b_l * L_t + e_t
```

where:

- `R_t` is the asset's excess return over period `t`
- `G_t`, `I_t`, `L_t` are the growth, inflation, and liquidity factors for that period
- `b_g`, `b_i`, `b_l` are the asset's **macro betas** — its sensitivities
- `e_t` is the residual, everything the macro factors do not explain

The critical design decision is what goes into `G_t`, `I_t`, `L_t`. **They must be surprises, not levels.** Expected macro outcomes are already in the price; only the unexpected component moves it. A common construction:

```text
surprise_t = (actual_t - consensus_t) / stdev(actual - consensus)
```

standardised so the betas are comparable across factors and expressed per standard deviation of surprise. Using the level of inflation rather than the surprise produces a regression that mostly measures the slow drift of both series and has almost no forecasting content.

> info **Growth, inflation, liquidity is a choice, not a law** Other decompositions exist — real rates and breakevens; growth, inflation, and risk appetite; principal components of a wide macro panel. The three-axis version is popular because the axes are interpretable and roughly independent, not because it is uniquely correct.

---

#### Worked Example: Estimating and Using Macro Betas

Suppose an equity index's monthly excess returns are regressed on standardised growth and inflation surprise factors, over 120 months. The factors are constructed to be orthogonal and unit-variance. The estimated betas are:

<table>
  <tbody>
    <tr>
      <td><strong>Factor</strong></td><td><strong>Beta (% per 1sd surprise)</strong></td><td><strong>Standard error</strong></td><td><strong>t-statistic</strong></td>
    </tr>
    <tr>
      <td>Growth surprise</td><td>+1.80</td><td>0.363</td><td>4.96</td>
    </tr>
    <tr>
      <td>Inflation surprise</td><td>-1.10</td><td>0.363</td><td>-3.03</td>
    </tr>
  </tbody>
</table>

The index has monthly volatility of 4.5%.

1. **Scenario return.** For a month with a growth surprise of +1.0sd and an inflation surprise of +1.5sd:

```text
expected return = 1.80 * 1.0 + (-1.10) * 1.5
                = 1.80 - 1.65
                = +0.15%
```

A strong growth print and a hotter inflation print nearly cancel. This is the single most useful output of the lens: it stops you attributing a flat month to "the market ignoring good news".

2. **Variance explained.** With orthogonal unit-variance factors, the explained variance is just the sum of squared betas:

```text
explained = 1.80^2 + 1.10^2 = 3.24 + 1.21 = 4.45  (%^2 per month)
total     = 4.5^2                        = 20.25  (%^2 per month)
R^2       = 4.45 / 20.25                 = 22.0%
```

3. **Residual volatility and standard errors.** `sqrt(20.25 - 4.45) = sqrt(15.80) = 3.97%` per month. With orthogonal unit-variance regressors, `SE(b) = residual_vol / sqrt(n) = 3.97 / sqrt(120) = 0.363`, which produces the t-statistics in the table.

Both betas are statistically convincing, and together they still leave 78% of monthly variance unexplained. That is the honest headline. A macro lens is a decomposition of risk, not a return forecast: knowing `b_g` tells you what happens *if* growth surprises, and says nothing about whether it will.

---

#### The Growth-Inflation Grid

The two most-used axes define four environments. The mapping below states *mechanisms*, which are reliable, rather than historical performance, which is regime-dependent and cannot be summarised in a table.

<table>
  <tbody>
    <tr>
      <td><strong>Environment</strong></td><td><strong>Mechanism acting on asset prices</strong></td>
    </tr>
    <tr>
      <td>Growth up, inflation down</td><td>Cash flows rise while discount rates stay contained. Both terms of a valuation move favourably; the most straightforwardly supportive quadrant for risk assets.</td>
    </tr>
    <tr>
      <td>Growth up, inflation up</td><td>Cash flows rise but discount rates rise too. The net effect depends on which dominates, so equity-rate correlation is unstable here. Real assets benefit from the price level directly.</td>
    </tr>
    <tr>
      <td>Growth down, inflation down</td><td>Cash flows fall, discount rates fall. Nominal duration is the natural offset, which is why high-quality bonds can hedge equities in this quadrant specifically.</td>
    </tr>
    <tr>
      <td>Growth down, inflation up</td><td>Cash flows fall while discount rates rise. Both terms move against long-duration claims at once, and the nominal-bond hedge fails because bonds are being hurt by the same force. The quadrant where diversification is hardest.</td>
    </tr>
  </tbody>
</table>

The bottom-right cell is the reason a fixed equity-bond correlation assumption is unsafe. The sign of that correlation is a function of which macro shock dominates, and it can flip without any warning from a rolling estimate. See [Correlation Breakdown](/regimes-macro/correlation-breakdown) and [Rates and Inflation Regimes](/regimes-macro/rates-and-inflation).

**The liquidity axis** sits partly outside this grid. It captures the availability of balance sheet and the price of leverage, and it moves risk assets largely without regard to which growth-inflation quadrant is active. See [Liquidity Cycles](/regimes-macro/liquidity-cycles).

---

#### Release Timing, Revisions, and Nowcasting

This is where most macro backtests break, and the failures are silent.

**Release lag.** Macro series are published well after the period they describe. Survey and market-based series are timely; national accounts are not. A backtest that timestamps a quarterly figure to the end of the quarter it measures is trading on data that did not exist for weeks afterwards. The timestamp must be the **release** date, not the reference period.

**Revisions.** Most macro series are revised, often several times, and sometimes enough to change the sign of a change. The figure in a current database is the *final vintage*; the figure available at the time was the *first release*. A model fitted on final vintages is fitted on data nobody ever had. Point-in-time or **vintage** databases store what was known on each date, and are the only correct input for research meant to be tradeable. Redefinitions compound this: methodologies change, baskets are reweighted, and seasonal adjustment factors are re-estimated over the whole history, each rewriting the past in the current database.

**Nowcasting** attempts to solve the lag problem by estimating a slow-moving quantity from timely indicators. It genuinely helps, and it carries its own caveats:

- The nowcast is a model output with its own error, which is largest at turning points — exactly when it matters.
- Nowcast models are frequently estimated on final-vintage data and then applied to first releases, importing a bias invisible in the fitted statistics.
- Even a perfect nowcast is not tradeable if the market nowcasts as well as you do. The tradeable quantity is your nowcast minus the market's, which is the surprise, not the level.

> warning **Almost every impressive macro backtest is a vintage problem** If a macro strategy looks good and the research did not use point-in-time data, assume the result comes from revisions and release lags until proven otherwise. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### In Practice Across Asset Classes

**Equities.** The dominant macro exposure is growth, with a discount-rate offset that grows with the index's duration. Sector betas differ sharply, so a sector-tilted portfolio carries a macro tilt that no equity risk model will label as one.

**Rates.** Inflation surprise is the dominant factor; growth enters through its effect on expected policy. Because the curve is multi-dimensional, macro betas should be estimated against level, slope, and curvature separately rather than against a single yield. See [Yield Curves](/markets/yield-curves).

**FX.** Sensitivities are relative rather than absolute — what matters is a surprise in one economy *versus* another. A single-country macro factor mis-specifies the exposure of every cross.

**Commodities.** The most direct inflation exposure of any asset class, since many commodities enter the inflation basket by construction. Growth sensitivity is concentrated in the industrial complex rather than uniform. See [Commodities](/markets/commodities).

**Credit.** Behaves like a short volatility position on growth: modest gains when growth is fine, large losses when it is not. The macro beta is state-dependent, so a linear regression estimated across calm periods understates the downside sensitivity.

**On-chain markets.** Macro sensitivities exist but are hard to estimate: the history is short, covers few complete macro cycles, and is dominated by idiosyncratic variance. The clearest transmission channel is liquidity rather than growth or inflation — the price of leverage, visible in [funding rates](/signals/funding-rate) and stablecoin borrowing costs, responds to the same forces as traditional funding conditions. Treat any macro beta fitted on a few years of on-chain data as a hypothesis with wide error bars. See [On-chain Activity](/signals/onchain-activity).

---

#### Assumptions and Failure Modes

- **Stable macro betas.** Sensitivities change with the regime, and they change most at turning points. A beta estimated over a decade is an average across environments that may never recur in that mix.
- **Linear response.** Macro effects are frequently asymmetric and threshold-dependent. A small inflation surprise may be ignored while a large one reprices everything; a single linear coefficient cannot represent that.
- **Orthogonal factors.** Growth and inflation surprises are not truly independent, and the liquidity axis overlaps with both. Correlated regressors make individual betas unstable even when the overall fit is stable. See [Regression Diagnostics](/stat-methods/regression-diagnostics).
- **Surprises are measurable.** The expectation is proxied by a consensus survey with its own sampling, timing, and participation issues. A consensus collected days before a release is not the market's expectation at the release.
- **Point-in-time data.** Final-vintage data leaks the future, and this single error accounts for a large share of good-looking macro results.
- **Enough independent observations.** Macro cycles are long, so a twenty-year monthly sample may contain only a handful of independent episodes. The effective sample size is far below the number of rows.
- **Attribution is not prediction.** Explaining a return after the fact is a different and much easier problem than forecasting it. Macro factor models are honest about the first and routinely oversold on the second.

---

#### Code

```python
import numpy as np
import pandas as pd

def standardise_surprises(actual, consensus, release_dates, window=60):
    """Standardised macro surprises, indexed by RELEASE date.

    Indexing by the reference period instead is the classic lookahead:
    it dates a figure to the period it describes, not the day it was known.
    The dispersion scale is trailing and shifted, so it is also causal.
    """
    surprise = pd.Series(
        np.asarray(actual) - np.asarray(consensus),
        index=pd.to_datetime(release_dates),
    ).sort_index()
    scale = surprise.rolling(window, min_periods=12).std().shift(1)
    return (surprise / scale).dropna()


def macro_betas(asset_returns, factor_frame):
    """OLS macro betas with standard errors and t-statistics.

    Both inputs must already be aligned on release dates.
    """
    X = np.column_stack([np.ones(len(factor_frame)), factor_frame.values])
    y = np.asarray(asset_returns)
    coefficients, *_ = np.linalg.lstsq(X, y, rcond=None)
    residuals = y - X @ coefficients
    residual_var = residuals @ residuals / (len(y) - X.shape[1])
    errors = np.sqrt(np.diag(residual_var * np.linalg.pinv(X.T @ X)))
    return pd.DataFrame(
        {"beta": coefficients[1:], "std_error": errors[1:],
         "t_stat": coefficients[1:] / errors[1:]},
        index=factor_frame.columns,
    )
```

---

#### See Also

* [Rates and Inflation Regimes](/regimes-macro/rates-and-inflation)
* [Liquidity Cycles](/regimes-macro/liquidity-cycles)
* [Correlation Breakdown](/regimes-macro/correlation-breakdown)
* [Factor Models](/stat-methods/factor-models)
* [Linear Regression](/stat-methods/linear-regression)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Data Sources](/data-tooling/data-sources)

---

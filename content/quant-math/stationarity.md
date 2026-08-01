### Stationarity

> info **Metadata** Level: Advanced | Prerequisites: Autocorrelation, Sampling | Tags: time-series, stationarity, regimes, modelling

A series is stationary if its statistical properties do not depend on when you look. The mean is the same in 2010 and 2024; the variance is the same; the correlation between observations depends only on the gap between them, not on their position in the sample. Stationarity is what makes estimation meaningful — it is the assumption that the past and the future are draws from the same distribution.

Prices are not stationary. Returns are closer to it. Almost nothing in finance is fully stationary, because volatility shifts, correlations move with regime, and market structure changes underneath the data. The practical question is never "is this stationary?" but "over what window is the departure from stationarity small enough that the estimate remains useful?"

---

#### Formal Definition

**Strict stationarity** requires the joint distribution of any collection of observations to be unchanged by a shift in time. This is stronger than anything you can test, and stronger than anything financial data satisfies.

**Weak (covariance) stationarity** requires only the first two moments to be time-invariant:

```text
E[x_t]           = mu           for all t
Var(x_t)         = gamma_0      for all t
Cov(x_t, x_{t+k}) = gamma_k     depends on k only, not on t
```

This is the working definition. It is what autocorrelation functions, ARIMA models, and ordinary least squares standard errors assume.

**Integration.** A series that is non-stationary but becomes stationary after differencing `d` times is **integrated of order d**, written `I(d)`. A random walk is `I(1)`: the level wanders, but the first difference is stationary. Log prices are usually treated as `I(1)` and log returns as `I(0)`.

**Two ways to be non-stationary**, which look similar and behave completely differently:

```text
Trend-stationary:       x_t = a + b*t + e_t          shocks die out around a fixed trend
Difference-stationary:  x_t = x_{t-1} + c + e_t      shocks are permanent, the level wanders
```

Detrending a difference-stationary series, or differencing a trend-stationary one, both produce badly misspecified models. Distinguishing them is what unit-root testing is for. See [Unit Roots](/stat-methods/unit-roots).

**The augmented Dickey-Fuller test** regresses the change on the level:

```text
delta_x_t = a + gamma * x_{t-1} + (lagged delta terms) + e_t
```

The null hypothesis is `gamma = 0` — a unit root, non-stationary. A significantly negative `gamma` means the series pulls back towards a level. The test statistic is `gamma_hat` divided by its standard error, but it does **not** follow a t-distribution; the critical values come from the Dickey-Fuller distribution and are considerably more demanding. With a constant and no trend the 5% critical value is approximately `-2.86`.

---

#### Worked Example

Two series are tested with the same regression over the same window.

<table>
  <tbody>
    <tr>
      <td><strong>Series</strong></td>
      <td><strong>gamma_hat</strong></td>
      <td><strong>Std. error</strong></td>
      <td><strong>Test statistic</strong></td>
      <td><strong>Verdict at 5%</strong></td>
    </tr>
    <tr>
      <td>A: log price of an index</td>
      <td>-0.018</td>
      <td>0.011</td>
      <td>-1.64</td>
      <td>Fail to reject a unit root</td>
    </tr>
    <tr>
      <td>B: spread between two related instruments</td>
      <td>-0.142</td>
      <td>0.039</td>
      <td>-3.64</td>
      <td>Reject; consistent with stationarity</td>
    </tr>
  </tbody>
</table>

1. **Test statistics**: `-0.018 / 0.011 = -1.64` and `-0.142 / 0.039 = -3.64`
2. **Compare to `-2.86`**, not to `-1.96`. Series A does not clear it; series B does comfortably.
3. **Implied persistence.** The autoregressive coefficient is `phi = 1 + gamma`, so `phi_A = 0.982` and `phi_B = 0.858`.
4. **Half-life** of a shock is `ln(2) / (-ln(phi))`:
   - Series A: `0.6931 / 0.01816 = 38.2 periods`
   - Series B: `0.6931 / 0.15315 = 4.5 periods`

Series A is not proven to be a random walk — failing to reject is not accepting. It is a series whose shocks decay so slowly that 38 periods of data cannot distinguish decay from no decay at all. Series B reverts fast enough to be modelled, and a 4.5-period half-life is the number a mean-reversion strategy would size its holding period against. See [Mean Reversion](/quant-math/mean-reversion).

**A second, cruder check.** Split a two-year daily sample in half and compute volatility in each. Suppose the first half gives `0.9%` daily and the second `1.9%`. Annualised, that is `14.3%` against `30.2%` — a variance ratio of `4.46`. No unit-root test is needed to conclude that the variance is not constant, and any model fitted to the full sample describes neither half.

> info **Test the thing you will model** Running a stationarity test on prices and then modelling returns tells you nothing. Test the exact series that enters the model.

---

#### Making a Series Usable

- **Differencing.** Log prices to log returns. This is the standard first move and it is nearly always right for price levels.
- **Ratios and spreads.** Price divided by earnings, one leg minus a hedge ratio times another, an implied rate minus a realised one. Constructing a stationary combination out of non-stationary inputs is exactly what cointegration formalises. See [Cointegration](/stat-methods/cointegration).
- **Normalising by volatility.** Dividing returns by a rolling volatility estimate removes the dominant form of second-moment non-stationarity and makes the result far closer to identically distributed.
- **Seasonal adjustment.** Removing day-of-week, month-of-year, or expiry-cycle effects before testing for anything else.
- **Regime segmentation.** If the series is stationary within regimes but not across them, model the regimes explicitly rather than averaging over them. See [Markov Switching](/regimes-macro/markov-switching) and [Changepoint Detection](/regimes-macro/changepoint-detection).

---

#### In Practice Across Asset Classes

- **Equities.** Log prices are treated as `I(1)` and returns as approximately `I(0)`. Valuation ratios are the interesting case: they look mean-reverting but with half-lives measured in years, so a lifetime of data provides only a handful of independent observations.
- **Fixed income.** Yield levels are highly persistent and are bounded in ways a pure random walk is not, which is why term-structure models impose mean reversion rather than testing for it. Spreads between maturities are far closer to stationary than the levels. See [Yield Curves](/markets/yield-curves).
- **Futures.** A stitched contract series inherits its stationarity properties from the roll method. The basis and calendar spreads are typically much closer to stationary than outright prices, which is why relative-value structures dominate curve trading. See [Calendar Spreads](/markets/calendar-spreads).
- **FX.** Real exchange rates are the classic case: economic reasoning suggests eventual reversion to purchasing power parity, but estimated half-lives are long enough that available data cannot confirm it. Nominal rates are treated as `I(1)`.
- **Credit.** Spreads are bounded below by zero and driven by a slow-moving cycle, so they appear stationary over long windows and behave like random walks over short ones. Which is true depends entirely on the horizon you care about. See [Credit Spreads](/credit/credit-spreads).
- **Commodities.** Storage and production costs anchor prices in the long run, producing slow mean reversion overlaid with strong seasonality and occasional structural shifts in the anchor itself.
- **On-chain.** Protocol metrics are usually non-stationary in a structural way: total value locked, user counts, and fee revenue trend with adoption and change discontinuously at upgrades or incentive changes. Funding rates and pool utilisation, being mechanically bounded, are the on-chain series most likely to pass a stationarity test.

---

#### Assumptions and Failure Modes

- **Failing to reject is not accepting.** Unit-root tests have low power. Failing to reject means the data is insufficient to distinguish a random walk from a slowly reverting series, not that the series is a random walk.
- **Structural breaks masquerade as unit roots.** A stationary series with one level shift will typically fail a unit-root test. Test for breaks before concluding the series is integrated.
- **Spurious regression.** Regressing one `I(1)` series on another produces high R-squared and large t-statistics even when the two are entirely unrelated. This is the single most common time-series error in finance. Difference both, or establish cointegration first.
- **Stationarity in the mean is not stationarity in the variance.** Returns can have a stable mean and wildly time-varying volatility. Most financial series fail the variance condition even where the mean condition holds.
- **Window length changes the answer.** A series that is stationary over five years may not be over twenty. Report the window with the conclusion.
- **In-sample stationarity does not persist.** Market structure, participants, and regulation change. A relationship stable through the estimation sample can fail immediately out of sample. See [Backtest vs Live](/risk/backtest-vs-live).

> warning **The most expensive form of non-stationarity is the one that arrives after deployment** A relationship can be stationary throughout every test you run, and then stop, because the mechanism generating it was competed away or regulated out of existence.

---

#### Code

```python
import numpy as np

def half_life(series):
    """Half-life of a shock, from an AR(1) fit on the level.

    Returns infinity for a non-reverting series. This is the number
    a mean-reversion holding period should be sized against.
    """
    x = np.asarray(series, dtype=float)
    lagged = x[:-1]
    delta = np.diff(x)
    design = np.column_stack([np.ones_like(lagged), lagged])
    _, gamma = np.linalg.lstsq(design, delta, rcond=None)[0]
    if gamma >= 0:
        return np.inf
    return np.log(2.0) / -np.log(1.0 + gamma)


def split_sample_variance_ratio(series):
    """Crude non-stationarity check: variance in the second half over the first.

    A ratio far from 1 rules out constant variance without any formal test.
    """
    x = np.asarray(series, dtype=float)
    midpoint = len(x) // 2
    return x[midpoint:].var(ddof=1) / x[:midpoint].var(ddof=1)
```

---

#### See Also

* [Autocorrelation](/quant-math/autocorrelation)
* [Random Walks](/quant-math/random-walks)
* [Mean Reversion](/quant-math/mean-reversion)
* [Rolling Windows](/quant-math/rolling-windows)
* [Unit Roots](/stat-methods/unit-roots)
* [Cointegration](/stat-methods/cointegration)
* [Regimes Overview](/regimes-macro/regimes-overview)

---

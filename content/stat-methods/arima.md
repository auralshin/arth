### ARIMA Models

> info **Metadata** Level: Advanced | Prerequisites: Autocorrelation, Stationarity | Tags: time-series, arima, forecasting, acf, pacf, mean-reversion

ARIMA — AutoRegressive Integrated Moving Average — is the standard linear framework for modelling a single time series from its own past. The three letters name three ideas: regress on lagged values (AR), regress on lagged forecast errors (MA), and difference the series first if it is not [stationary](/quant-math/stationarity) (I).

ARIMA earns its place in finance on spreads, volatility proxies, funding rates, volumes, and macro series — quantities with genuine memory. On price levels it is nearly useless, and understanding why is more valuable than any fitted model: an ARIMA that has learned a price series correctly has learned that the best forecast of tomorrow is today, the random walk you already had.

---

#### Formal Definition

An ARIMA(p, d, q) model applies ARMA(p, q) to the series after differencing it `d` times.

```text
AR(p)      x_t = c + phi_1*x_{t-1} + ... + phi_p*x_{t-p} + e_t
MA(q)      x_t = mu + e_t + theta_1*e_{t-1} + ... + theta_q*e_{t-q}

ARMA(p,q)  x_t = c + sum_{i=1..p} phi_i*x_{t-i}
                   + e_t + sum_{j=1..q} theta_j*e_{t-j}
```

where:

- `x_t` is the (differenced) series at time `t`
- `phi_i` are autoregressive coefficients, `theta_j` moving-average coefficients
- `e_t` is white noise with mean zero and variance `sigma_e^2`, and `c` sets the level

**Differencing.** `d = 1` fits the model to `x_t - x_{t-1}` rather than to `x_t`; on log prices that gives log returns. **Stationarity for AR(1)** holds when `abs(phi)` is below 1, in which case:

```text
mean         mu     = c / (1 - phi)
variance            = sigma_e^2 / (1 - phi^2)
autocorrelation     rho_k = phi^k
half-life           = ln(0.5) / ln(phi)
```

At `phi = 1` the series is a random walk with a unit root and no finite mean — see [Unit Roots](/stat-methods/unit-roots).

---

#### Worked Example

A mean-reverting spread is modelled as AR(1) with `phi = 0.60`, `c = 0.80`, and residual standard deviation `sigma_e = 1.00`. The last observed value is `x_T = 5.00`. The **long-run mean** is `mu = 0.80 / (1 - 0.60) = 2.00`, so the **current deviation** is `5.00 - 2.00 = 3.00`, and the **half-life** is `ln(0.5) / ln(0.60) = -0.693 / -0.511 = 1.36` periods.

Forecasts iterate the model, replacing future shocks with their expectation of zero:

<table>
  <tbody>
    <tr><td><strong>Horizon h</strong></td><td><strong>Point forecast</strong></td><td><strong>Deviation from mu</strong></td><td><strong>Forecast variance</strong></td><td><strong>Forecast std dev</strong></td></tr>
    <tr><td>1</td><td>3.800</td><td>1.800</td><td>1.000</td><td>1.000</td></tr>
    <tr><td>2</td><td>3.080</td><td>1.080</td><td>1.360</td><td>1.166</td></tr>
    <tr><td>3</td><td>2.648</td><td>0.648</td><td>1.490</td><td>1.221</td></tr>
    <tr><td>4</td><td>2.389</td><td>0.389</td><td>1.536</td><td>1.239</td></tr>
    <tr><td>infinity</td><td>2.000</td><td>0.000</td><td>1.563</td><td>1.250</td></tr>
  </tbody>
</table>

Working the first three by hand: `0.80 + 0.60 * 5.00 = 3.80` with variance `sigma_e^2 = 1.00`; then `0.80 + 0.60 * 3.80 = 3.08` with variance `1 + phi^2 = 1.36`; then `0.80 + 0.60 * 3.08 = 2.648` with variance `1 + 0.36 + 0.1296 = 1.4896`.

Two structural facts fall out. The deviation from the mean decays geometrically — `3.00 * 0.60^h` reproduces the deviation column exactly. And the forecast variance rises but converges, to `sigma_e^2 / (1 - phi^2) = 1 / 0.64 = 1.5625`, the unconditional variance. A stationary series has finite long-horizon forecast uncertainty; a random walk does not, its forecast variance growing without bound as `h * sigma_e^2`.

---

#### Identification via ACF and PACF

The classical Box-Jenkins procedure identifies `p` and `q` from two functions of the stationary series:

the **autocorrelation function (ACF)** at lag `k`, the correlation between `x_t` and `x_{t-k}` including everything transmitted through the intermediate lags; and the **partial autocorrelation function (PACF)** at lag `k`, the same correlation *after removing* the effect of lags 1 through `k-1`.

<table>
  <tbody>
    <tr><td><strong>Model</strong></td><td><strong>ACF</strong></td><td><strong>PACF</strong></td></tr>
    <tr><td>AR(p)</td><td>Decays geometrically or in a damped wave</td><td>Cuts off sharply after lag p</td></tr>
    <tr><td>MA(q)</td><td>Cuts off sharply after lag q</td><td>Decays geometrically</td></tr>
    <tr><td>ARMA(p, q)</td><td>Decays after the first q lags</td><td>Decays after the first p lags</td></tr>
    <tr><td>Random walk (undifferenced)</td><td>Near 1 at every lag, decaying very slowly</td><td>Near 1 at lag 1, near 0 after</td></tr>
  </tbody>
</table>

For the AR(1) above, the theoretical ACF is `0.60`, `0.36`, `0.216`, `0.130` at lags 1 to 4, and the PACF is `0.60` at lag 1 and zero thereafter. A sample autocorrelation is significantly different from zero at roughly the `2 / sqrt(n)` level: with `n = 500` observations, anything inside `plus/minus 0.089` is indistinguishable from noise. Modern practice supplements visual identification with information criteria — AIC or BIC over a grid of `(p, d, q)` — with BIC preferring smaller models. The classical result runs the other way from what practitioners often assume: AIC is asymptotically efficient for prediction, while BIC is consistent for identifying the true order when it is among the candidates. In low signal-to-noise financial data, though, BIC's heavier penalty is frequently the better practical default, because the larger models AIC selects tend to fit noise that does not survive out of sample. See [Autocorrelation](/quant-math/autocorrelation).

---

#### Why ARIMA Rarely Beats a Random Walk on Prices

Fit ARIMA to a price series and the estimation will usually select `d = 1` and coefficients close to zero on the differenced series. That is the model telling you the data look like a random walk: the best forecast of tomorrow's price is today's price plus a drift term. The reason is economic rather than statistical. A reliably forecastable price path is a standing invitation to trade against, and the trading removes the pattern. Return autocorrelations that survive are small, unstable, and frequently smaller than transaction costs. See [Random Walks](/quant-math/random-walks) and [Slippage](/microstructure/slippage).

Two traps follow. **In-sample fit is not forecast skill** — adding lags always lowers in-sample residual variance, so comparison must be against the naive benchmark on held-out data, and for a random walk that benchmark is "tomorrow equals today". And **apparent structure is often microstructure**: negative first-order autocorrelation in high-frequency returns is largely bid-ask bounce, trades alternating between the two sides of the spread. An AR(1) fitted to it captures a real statistical feature that is not tradable, since capturing it requires crossing the spread that creates it.

ARIMA is far more productive where mean reversion is structural: calendar spreads pinned by storage or carry, funding rates anchored by an arbitrage mechanism, realised volatility, order flow imbalance, and the residual of a [cointegrating](/stat-methods/cointegration) relationship.

> warning **Differencing is not free** Over-differencing an already-stationary series introduces artificial negative autocorrelation at lag 1 and inflates forecast variance. Test for a unit root before setting `d`.

---

#### In Practice Across Asset Classes

**Equities.** Applied to volume, realised volatility, and dispersion rather than to returns. Daily volume shows strong weekly seasonality, so a seasonal term (SARIMA) or day-of-week dummies are needed before the residual looks like noise.

**Futures.** Calendar spreads are the natural candidate: anchored by carry and storage economics, so an AR(1) with a slow half-life is often reasonable, though roll dates introduce discontinuities that must be handled before fitting.

**Fixed income and credit.** Yield *levels* are close to non-stationary over short samples, so models fitted to them approximate a random walk; curve slopes and swap spreads are better behaved, and the residual from a curve model is often the most genuinely mean-reverting object available. Credit spread levels are persistent with occasional jumps, and an ARIMA fitted across a credit event describes neither the calm nor the stressed regime. See [Changepoint Detection](/regimes-macro/changepoint-detection).

**FX.** Spot rates are the canonical hard case: short-horizon forecastability against a random walk benchmark has proved persistently elusive. Interest rate differentials and realised volatility are far more amenable.

**On-chain.** Perpetual funding rates and gas prices are strong candidates — both mean-revert around a mechanism-imposed anchor — while fee revenue and active-address counts show weekly seasonality. Token prices behave like other prices, which is to say the model will find a random walk.

---

#### Assumptions and Failure Modes

- **Stationarity after differencing.** If the differenced series still trends or has a growing variance, the model is misspecified regardless of how well the coefficients fit.
- **Constant coefficients.** Financial persistence is regime-dependent. A `phi` estimated across two regimes describes neither; consider rolling estimation or an explicit regime model.
- **Homoskedastic residuals.** Financial residuals cluster in volatility, which does not bias the mean forecasts but makes the forecast intervals wrong. Pair with [GARCH](/stat-methods/garch).
- **Linear dependence only.** ARIMA cannot represent asymmetry, thresholds, or interaction with other series.
- **Order selection is a search.** Grid-searching over `(p, d, q)` on BIC and reporting the winner's in-sample statistics is exactly the [multiple testing](/stat-methods/multiple-testing) problem. A single outlying [jump](/quant-math/jumps) can also dominate the estimated persistence.
- **Forecast intervals assume the model is true.** They reflect residual variance only, ignoring parameter uncertainty and the possibility that the specification is wrong. Treat them as lower bounds on real uncertainty.

---

#### Code

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm


def fit_arima(series, order=(1, 0, 0)):
    """Fit ARIMA and report the persistence implied by the AR terms."""
    result = sm.tsa.ARIMA(series.dropna(), order=order).fit()
    persistence = result.arparams.sum() if order[0] else 0.0
    half_life = np.log(0.5) / np.log(persistence) if 0 < persistence < 1 else np.nan
    return result, persistence, half_life


def beats_random_walk(actual, forecast):
    """Model RMSE over naive 'tomorrow equals today' RMSE.
    A value at or above 1 means the model added nothing.
    """
    naive = actual.shift(1)
    frame = pd.concat({"a": actual, "f": forecast, "n": naive}, axis=1).dropna()
    model_rmse = np.sqrt(((frame["a"] - frame["f"]) ** 2).mean())
    naive_rmse = np.sqrt(((frame["a"] - frame["n"]) ** 2).mean())
    return model_rmse / naive_rmse
```

---

#### See Also

* [Unit Roots](/stat-methods/unit-roots)
* [GARCH](/stat-methods/garch)
* [Cointegration](/stat-methods/cointegration)
* [Autocorrelation](/quant-math/autocorrelation)
* [Stationarity](/quant-math/stationarity)
* [Random Walks](/quant-math/random-walks)

---

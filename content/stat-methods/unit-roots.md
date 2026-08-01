### Unit Roots

> info **Metadata** Level: Advanced | Prerequisites: Stationarity, Linear Regression | Tags: time-series, unit-root, adf, kpss, spurious-regression, differencing

A series has a **unit root** when shocks to it never decay. Today's surprise permanently relocates the level, so the series has no mean to return to and its variance grows without bound. A random walk is the canonical example, and it is a good first description of most asset prices.

The distinction between a unit-root process and a persistent stationary one is not a technicality. Regressions between unit-root series produce impressive statistics from nothing at all — the spurious regression problem — and every conventional t-statistic and `R^2` in such a regression is invalid. Deciding whether to difference a series is therefore the first substantive modelling decision, taken before any model is fitted.

---

#### Formal Definition

Consider the simplest autoregressive process, `y_t = phi * y_{t-1} + e_t`, where `e_t` is white noise. Three cases:

<table>
  <tbody>
    <tr><td><strong>Value of phi</strong></td><td><strong>Behaviour</strong></td><td><strong>Effect of a shock</strong></td></tr>
    <tr><td>abs(phi) below 1</td><td>Stationary; mean-reverting</td><td>Decays geometrically, half-life ln(0.5)/ln(phi)</td></tr>
    <tr><td>phi equal to 1</td><td>Unit root; random walk</td><td>Permanent; variance grows as t * sigma^2</td></tr>
    <tr><td>abs(phi) above 1</td><td>Explosive</td><td>Amplifies without bound; rare outside bubbles</td></tr>
  </tbody>
</table>

A series that becomes stationary after differencing `d` times is **integrated of order d**, written `I(d)`. Prices are usually treated as `I(1)`; their differences, returns, as `I(0)`.

**The Augmented Dickey-Fuller (ADF) test.** Rewrite the AR(1) in differences by subtracting `y_{t-1}` from both sides, and add lagged differences to soak up higher-order dynamics:

```text
delta_y_t = mu + gamma * y_{t-1} + sum_{i=1..p} d_i * delta_y_{t-i} + e_t
gamma     = phi - 1
```

The null hypothesis is `gamma = 0`, a unit root; the alternative is `gamma` below 0, stationarity. The test statistic is the usual `gamma_hat / se(gamma_hat)`, but **it does not follow a t-distribution** — under a unit root the standard asymptotics fail entirely, and the correct critical values (the Dickey-Fuller distribution) are considerably more negative. With a constant and no trend, roughly `-2.9` at 5% and `-3.4` at 1%; adding a linear trend term pushes the 5% value to roughly `-3.4`. These are approximate and depend mildly on sample size, and a statistics package will report exact values for your sample. The test is one-sided because only negative `gamma` is evidence against a unit root.

**KPSS** reverses the hypotheses: its null is that the series *is* stationary (around a level or a trend), so rejection is evidence of a unit root. Because the two place the burden of proof on opposite sides, running both is standard practice.

<table>
  <tbody>
    <tr><td><strong>ADF</strong></td><td><strong>KPSS</strong></td><td><strong>Reading</strong></td></tr>
    <tr><td>Rejects unit root</td><td>Does not reject stationarity</td><td>Consistent evidence of stationarity</td></tr>
    <tr><td>Does not reject unit root</td><td>Rejects stationarity</td><td>Consistent evidence of a unit root</td></tr>
    <tr><td>Does not reject unit root</td><td>Does not reject stationarity</td><td>Inconclusive — the sample is too short to tell</td></tr>
    <tr><td>Rejects unit root</td><td>Rejects stationarity</td><td>Neither model fits; suspect a break or long memory</td></tr>
  </tbody>
</table>

---

#### Worked Example

An ADF regression with a constant and no trend, run on a price series of 500 daily observations and then on its first differences:

<table>
  <tbody>
    <tr><td><strong>Series tested</strong></td><td><strong>gamma_hat</strong></td><td><strong>se(gamma_hat)</strong></td><td><strong>ADF statistic</strong></td></tr>
    <tr><td>Price level</td><td>-0.040</td><td>0.025</td><td>-1.60</td></tr>
    <tr><td>First difference (returns)</td><td>-0.850</td><td>0.060</td><td>-14.17</td></tr>
  </tbody>
</table>

1. **Level test statistic**: `-0.040 / 0.025 = -1.60`. Against the 5% critical value of roughly `-2.9`, this is not more negative, so the unit root is **not rejected**
2. **Difference test statistic**: `-0.850 / 0.060 = -14.17`, far more negative than `-2.9`, so the unit root **is rejected**
3. **Conclusion**: the price series is `I(1)` and returns are `I(0)`

Note what the level regression quietly implies if taken at face value. `gamma = -0.040` means `phi = 0.960`, a half-life of `ln(0.5) / ln(0.96) = -0.693 / -0.0408 = 17.0` days — which sounds like strong, tradable mean reversion. The test says the estimate is statistically indistinguishable from `phi = 1`, where the half-life is infinite. This gap between a plausible-looking point estimate and a useless confidence interval is the entire reason the test exists.

> warning **Failing to reject is not proof of a unit root** ADF has low power against a persistent stationary alternative. Distinguishing `phi = 0.99` from `phi = 1.00` requires far more data than most samples contain, and both hypotheses typically survive.

---

#### Spurious Regression

Take two completely independent random walks and regress one on the other. The regression will frequently report a large `R^2`, a t-statistic on the slope far above 2, and residuals with strong positive autocorrelation. Nothing connects the two series; the apparent relationship is an artifact of both having a unit root. The mechanism: OLS inference assumes stationary residuals. When both variables wander without a fixed level, the residual wanders too, its variance grows with the sample, and the standard error formula — which assumes a fixed residual variance — reports a number far too small. Adding more data makes it worse, not better, because the t-statistic diverges as the sample grows. Three diagnostics indicate a spurious regression: a very high `R^2` combined with a Durbin-Watson statistic close to zero (near-perfect positive residual autocorrelation); a t-statistic that keeps growing as the sample is extended rather than stabilising; and residuals that visibly trend or wander when plotted.

The standard remedies:

1. **Difference both series** and regress returns on returns. Always safe for inference, but it discards any long-run relationship between the levels.
2. **Test for [cointegration](/stat-methods/cointegration).** If a linear combination of the levels is stationary, the levels regression is not spurious — it estimates a genuine long-run relationship, and this is the foundation of relative value trading.
3. **Include a lagged dependent variable or model the levels dynamically**, so the residual is stationary by construction.

Never respond by "fixing" the standard errors alone: HAC corrections widen them but cannot rescue a regression whose residual is non-stationary. See [Regression Diagnostics](/stat-methods/regression-diagnostics).

---

#### In Practice Across Asset Classes

**Equities.** Log prices are treated as `I(1)` and log returns as `I(0)` without testing, by convention. Testing becomes meaningful on constructed series — log price ratios between related names, valuation ratios, long-short spread levels — where the answer is not obvious in advance.

**Fixed income.** Yield levels are the hardest case. Economically, yields are bounded and anchored by policy, so they cannot literally have a unit root; statistically, over a decade of data they usually behave as if they do. Practitioners often model curve slopes and spreads, which test as stationary far more reliably.

**FX.** Nominal spot rates test as `I(1)` in almost every sample. Real exchange rates and deviations from purchasing power parity are the classic case where theory predicts stationarity and tests on typical sample lengths lack the power to confirm it.

**Futures, commodities and credit.** Calendar spreads and the basis are strong stationarity candidates, pinned by storage and financing arbitrage; outright prices are not. See [Basis](/signals/basis). Credit spread levels are highly persistent with occasional jumps, and jumps sharply reduce ADF power, so testing across a credit event usually produces an inconclusive result driven entirely by the event.

**On-chain.** Token prices behave as `I(1)` like other prices, while funding rates, pool utilisation, and gas prices are mechanism-anchored and typically test as stationary. Short histories make any on-chain test weak evidence, and structural changes — a fee change, a competing venue — are frequent enough that a break-robust variant is worth running.

---

#### Assumptions and Failure Modes

- **Low power is the defining weakness.** ADF struggles to reject a unit root when the truth is `phi` near 1. Failing to reject usually means the data are uninformative, not that a unit root is established.
- **Structural breaks masquerade as unit roots.** A stationary series whose mean shifted once typically fails to reject the unit root null. Break-robust variants exist, and plotting the series first catches most cases. See [Changepoint Detection](/regimes-macro/changepoint-detection).
- **The deterministic specification and lag length matter.** Including a trend term when there is none costs power; omitting one that exists biases toward not rejecting. Too few lags leave autocorrelation in the residual, too many waste degrees of freedom. Report both choices.
- **Both tests assume constant variance.** Volatility clustering distorts ADF and KPSS alike. See [GARCH](/stat-methods/garch).
- **Statistical stationarity is not economic stability.** A series can test stationary over a sample and be governed by a mechanism about to change — a peg, an incentive programme, a policy regime.
- **The result drives everything downstream.** Under-differencing gives spurious regressions; over-differencing injects artificial negative autocorrelation at lag 1.

---

#### Code

```python
import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import adfuller, kpss


def integration_order_report(series, max_diff=2):
    """ADF and KPSS on successive differences until the two agree.

    ADF null: unit root. KPSS null: stationary. Agreement across the
    two is much stronger evidence than either alone.
    """
    working = series.dropna()
    rows = []
    for d in range(max_diff + 1):
        adf_stat, adf_p = adfuller(working, regression="c", autolag="AIC")[:2]
        kpss_stat, kpss_p = kpss(working, regression="c", nlags="auto")[:2]
        rows.append({
            "d": d,
            "adf_stat": adf_stat,
            "adf_rejects_unit_root": adf_p < 0.05,
            "kpss_stat": kpss_stat,
            "kpss_rejects_stationarity": kpss_p < 0.05,
        })
        working = working.diff().dropna()
    return pd.DataFrame(rows)


def implied_half_life(series):
    """Half-life from an AR(1) on the level. Meaningful only once the
    unit root has been rejected — otherwise it describes a process
    with no mean to revert to.
    """
    y = series.dropna()
    frame = pd.concat({"d": y.diff(), "lag": y.shift(1)}, axis=1).dropna()
    phi = 1 + np.polyfit(frame["lag"], frame["d"], 1)[0]
    return np.log(0.5) / np.log(phi) if 0 < phi < 1 else np.inf
```

---

#### See Also

* [Cointegration](/stat-methods/cointegration)
* [ARIMA Models](/stat-methods/arima)
* [Stationarity](/quant-math/stationarity)
* [Random Walks](/quant-math/random-walks)

---

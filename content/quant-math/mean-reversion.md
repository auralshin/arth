### Mean Reversion

> info **Metadata** Level: Advanced | Prerequisites: Autocorrelation, Random Walks | Tags: mean-reversion, time-series, signals, regimes

A mean-reverting process is pulled back towards a central level. The further it strays, the stronger the pull, so deviations decay rather than accumulate. This is the direct alternative to the random walk: where a random walk's variance grows without bound, a mean-reverting process has a stationary distribution it keeps returning to.

The distinction matters because it changes what "extreme" means. In a random walk, a price two standard deviations from where it started carries no information about where it goes next. In a mean-reverting process, that same deviation is a forecast — and the strength of the forecast is measured by a single number, the half-life. Most relative-value trading, from bond curve trades to pairs, is an assertion that some constructed quantity is mean-reverting with a half-life short enough to be traded.

This page is applied. For the continuous-time theory of the Ornstein-Uhlenbeck process, its transition density, and its role in term-structure models, see [Ornstein-Uhlenbeck](/stochastic-calculus/ornstein-uhlenbeck).

---

#### Formal Definition

**Discrete time — the AR(1) process:**

```text
x_t = mu + phi * (x_{t-1} - mu) + e_t
```

where:

- `mu` is the long-run mean
- `phi` is the persistence, with `|phi|` below 1 for stationarity
- `e_t` are independent shocks with standard deviation `sigma_e`

Key quantities:

```text
half_life        = ln(2) / (-ln(phi))
stationary sd    = sigma_e / sqrt(1 - phi^2)
E[x_{t+k} | x_t] = mu + phi^k * (x_t - mu)
```

`phi = 1` is the random walk; `phi = 0` is white noise around `mu`.

**Continuous time — the Ornstein-Uhlenbeck process:**

```text
dX = kappa * (mu - X) * dt + sigma * dW
```

where `kappa` is the reversion speed and `mu` the long-run level. The corresponding quantities:

```text
half_life     = ln(2) / kappa
stationary sd = sigma / sqrt(2 * kappa)
E[X_t | X_0]  = mu + (X_0 - mu) * exp(-kappa * t)
```

The two are the same model at different resolutions: `phi = exp(-kappa * dt)`.

> info **Notation across pages** This process is the Ornstein-Uhlenbeck process. [Ornstein-Uhlenbeck](/stochastic-calculus/ornstein-uhlenbeck) writes the same equation as `dX = kappa * (theta - X) * dt + sigma * dW`, using `theta` for the long-run level written as `mu` here. The speed is `kappa` on both pages.

**Estimating it.** Regress the change on the level:

```text
delta_x_t = a + gamma * x_{t-1} + e_t
```

Then `kappa = -gamma` per period, `mu = -a / gamma`, and `sigma` is the residual standard deviation. This is the same regression as the Dickey-Fuller test, which is not a coincidence: testing for mean reversion and estimating its speed are one procedure. See [Unit Roots](/stat-methods/unit-roots).

---

#### Worked Example

A spread between two related instruments is regressed on its own lagged level. The fitted slope is `gamma = -0.15` per day and the residual standard deviation is `sigma = 0.80` spread units per square-root day.

1. **Reversion speed**: `kappa = 0.15` per day
2. **Half-life**: `ln(2) / 0.15 = 0.6931 / 0.15 = 4.62 days`
3. **Stationary standard deviation**: `0.80 / sqrt(2 * 0.15) = 0.80 / 0.5477 = 1.46 units`
4. **A two-sigma deviation** is therefore `2 * 1.46 = 2.92 units` from the mean
5. **Expected decay**: from `2.92` units away, the expected deviation after one half-life is `1.46` units, after two half-lives `0.73`, and so on

The half-life is the number that drives the trade design. It sets the expected holding period, and with the expected holding period comes the cost budget: if a round trip costs `0.10` units and the expected convergence over one half-life from a two-sigma entry is `1.46` units, the edge covers the cost comfortably. Halve the entry threshold to one sigma and the expected convergence over a half-life falls to `0.73` units — still viable. Enter at a quarter sigma and it is `0.18` units, and the cost starts to dominate.

**Reading the persistence.** The relationship between `phi` and half-life is strongly non-linear near 1:

<table>
  <tbody>
    <tr>
      <td><strong>phi (daily)</strong></td>
      <td>0.50</td><td>0.80</td><td>0.90</td><td>0.95</td><td>0.99</td>
    </tr>
    <tr>
      <td><strong>Half-life (days)</strong></td>
      <td>1.0</td><td>3.1</td><td>6.6</td><td>13.5</td><td>69.0</td>
    </tr>
  </tbody>
</table>

Moving `phi` from 0.95 to 0.99 multiplies the half-life by five. Since `phi` is estimated with a standard error, so is the half-life — and near the unit root the uncertainty in the half-life is enormous. A point estimate of "roughly 14 days" from a noisy `phi` of 0.95 may be consistent with anything from a week to several months.

> warning **The half-life you estimate is the half-life of the sample** Reversion speed is not a constant of nature. It changes with liquidity, participation, and regime, and it lengthens exactly when a relationship is breaking down.

---

#### Trading a Mean-Reverting Process

Three design decisions follow directly from the parameters.

- **Entry threshold.** Wider entry means fewer trades, larger expected convergence per trade, and more capital idle. Narrower entry means more trades, thinner edge per trade, and greater sensitivity to cost. The threshold should be set in units of the *stationary* standard deviation, not in raw units, so it adapts as volatility changes.
- **Sizing.** A position proportional to the deviation is the natural expression, because the expected convergence is proportional to the deviation. This makes the strategy add to losers by construction, which is precisely why an independent limit on total size is essential.
- **Exit and stop.** An exit at the mean is standard. A stop is harder: a stop-loss on a mean-reverting position exits at the point of maximum expected return, which is self-defeating if the model is right and essential if it is wrong. The only coherent resolution is a **time stop** or a stop justified by a structural break rather than by the deviation itself. See [Stop Loss](/strategies/stop-loss).

**Distinguishing reversion from a broken relationship** is the whole problem. Both look identical in real time: a large deviation that is not yet reverting. Formal tools help — cointegration tests on the underlying series, changepoint detection, monitoring the rolling half-life for lengthening — but none resolves it in the moment. See [Cointegration](/stat-methods/cointegration) and [Changepoint Detection](/regimes-macro/changepoint-detection).

---

#### In Practice Across Asset Classes

- **Equities.** Single-name prices are not mean-reverting in any tradable way, but *spreads* between economically linked names can be. Pairs trading is the canonical application, and its failure mode is that the economic link breaks — a merger, a spin-off, a change in business model. See [Pairs Trading](/strategies/pairs).
- **Fixed income.** The richest source of genuine mean reversion. Yield levels are highly persistent, but curve spreads, butterflies, and swap spreads revert around levels anchored by arbitrage and by policy. Half-lives are typically longer than in equity pairs, and the positions are correspondingly more levered. See [Yield Curves](/markets/yield-curves).
- **Futures.** Calendar spreads revert around a carry-determined level, bounded by storage economics on one side and by convenience yield on the other. The bounds are asymmetric: full carry provides a firm ceiling, while the floor in a shortage is not bounded at all. See [Calendar Spreads](/markets/calendar-spreads).
- **FX.** Real exchange rates are the textbook case of reversion whose half-life is too long to trade — estimated in years, with confidence intervals spanning a working career. Nominal rates show little short-horizon reversion in major pairs.
- **Credit.** Spreads revert within a cycle and reset discontinuously across cycles, so the "mean" being reverted to is itself regime-dependent. A model fitted through one credit cycle will mis-specify the level in the next. See [Credit Spreads](/credit/credit-spreads).
- **Volatility.** Among the most reliably mean-reverting quantities in markets: variance is far more predictable than direction, which is the foundation of both GARCH forecasting and variance-swap trading. See [GARCH](/stat-methods/garch) and [Variance Swaps](/derivatives/variance-swaps).
- **On-chain.** Perpetual funding rates are anchored to a target by mechanism rather than by economics, so they revert by construction — but the mechanism can change with a governance vote, which is a form of structural break with no analogue in traditional markets. See [Funding Rate](/signals/funding-rate).

---

#### Assumptions and Failure Modes

- **The mean is assumed known and stable.** It is estimated, and it moves. A shift in the true mean is indistinguishable in real time from a large deviation, and the strategy responds to both by adding exposure.
- **Reversion speed is assumed constant.** It varies with regime, generally slowing when relationships are under stress. The half-life used for sizing is a historical average of something that is not constant.
- **Low power to detect it at all.** Distinguishing slow reversion from a random walk requires long samples. A half-life comparable to the sample length cannot be measured. See [Stationarity](/quant-math/stationarity).
- **The payoff profile is short-tailed on the upside and long-tailed on the downside.** Many small convergent gains and occasional large divergent losses. Sharpe ratios flatter this profile badly during calm periods. See [Sortino Ratio](/quant-math/sortino).
- **Position size grows as losses grow.** Deviation-proportional sizing means the position is largest at the worst moment. Without an absolute cap this is an unbounded exposure to a broken relationship.
- **Leverage is the norm, because the edge per unit is small.** That combination — thin edge, high leverage, adding to losers — is the standard anatomy of a relative-value blow-up.
- **In-sample selection.** Screening many candidate pairs and keeping those that reverted guarantees a strong in-sample result whether or not any relationship exists. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### Code

```python
import numpy as np

def fit_ornstein_uhlenbeck(series, dt=1.0):
    """Calibrate an OU process by regressing the change on the level.

    This is the same regression as the Dickey-Fuller test: estimating
    reversion speed and testing for it are one procedure.
    """
    x = np.asarray(series, dtype=float)
    lagged = x[:-1]
    delta = np.diff(x)
    design = np.column_stack([np.ones_like(lagged), lagged])
    (intercept, slope), *_ = np.linalg.lstsq(design, delta, rcond=None)

    if slope >= 0:
        return None  # no reversion detected in this sample

    kappa = -slope / dt
    long_run_mean = -intercept / slope
    residual_sd = (delta - design @ [intercept, slope]).std(ddof=2)
    sigma = residual_sd / np.sqrt(dt)

    return {
        "kappa": kappa,
        "mean": long_run_mean,
        "sigma": sigma,
        "half_life": np.log(2.0) / kappa,
        "stationary_sd": sigma / np.sqrt(2.0 * kappa),
    }


def z_score(series, params):
    """Deviation in units of the stationary standard deviation.

    Entry thresholds belong in these units, not in raw units,
    so the rule adapts as volatility changes.
    """
    return (np.asarray(series, dtype=float) - params["mean"]) / params["stationary_sd"]
```

---

#### See Also

* [Autocorrelation](/quant-math/autocorrelation)
* [Random Walks](/quant-math/random-walks)
* [Stationarity](/quant-math/stationarity)
* [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion)
* [Ornstein-Uhlenbeck](/stochastic-calculus/ornstein-uhlenbeck)
* [Cointegration](/stat-methods/cointegration)
* [Pairs Trading](/strategies/pairs)

---

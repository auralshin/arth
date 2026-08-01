### Market Regimes: An Overview

> info **Metadata** Level: Intermediate | Prerequisites: Volatility, Rolling Windows, Stationarity | Tags: regimes, macro, non-stationarity, estimation, model-risk

A **regime** is a stretch of time over which the parameters that govern a market — expected return, volatility, correlation, the speed of mean reversion — are approximately stable, followed by a stretch in which they are stable at materially different values. The word encodes a specific claim: that markets are not one process with fat tails, but a small number of processes that take turns. Under that view a crisis is not an improbable draw from a calm distribution; it is an ordinary draw from a different distribution that happens to be active less often.

This matters because almost every quantitative estimate is a sample average, and a sample average taken across mixed regimes describes no regime in particular. A volatility figure computed over calm and stressed periods together is too high for the calm one and far too low for the stressed one. Position sizes, hedge ratios, correlation matrices, and stop distances all inherit the error, and they inherit it in the direction that hurts: too much risk exactly when risk is expensive. [Stationarity](/quant-math/stationarity) is the assumption that quietly fails here, and regime modelling is one honest response to that failure.

---

#### Formal Definition

The regime view replaces a single parameter vector with a state-dependent one. Let `s_t` be a latent discrete state taking values in `{1, 2, ..., K}`. Then:

```text
y_t | (s_t = k)  ~  D(theta_k)
```

where:

- `y_t` is the observed quantity (typically a return, or a vector of returns)
- `s_t` is the unobserved regime label active at time `t`
- `D` is a distribution family, most often Normal
- `theta_k` is the parameter set belonging to regime `k`, for example `(mu_k, sigma_k)`

The series is then **piecewise stationary**: stationary within each segment, non-stationary across them. Two further quantities define the regime structure itself:

```text
p_k        = P(s_t = k | s_(t-1) = k)        persistence of regime k
E[duration] = 1 / (1 - p_k)                   expected length of a visit
```

The duration formula follows because, conditional on being in regime `k`, each subsequent period is an independent Bernoulli trial that either stays or leaves. The number of periods until the first exit is geometric with success probability `1 - p_k`, whose mean is `1 / (1 - p_k)`.

> info **Regimes are a modelling choice, not a fact** No exchange publishes the regime. It is a latent variable you posit because it makes the data easier to describe. A two-state model with fat-tailed innovations and a one-state model with fatter tails can fit the same series comparably well.

---

#### Worked Example: What Pooling Costs You

Take a stylised two-regime daily series. Regime 1 is calm, regime 2 is stressed.

<table>
  <tbody>
    <tr>
      <td><strong>Quantity</strong></td><td><strong>Calm (k = 1)</strong></td><td><strong>Stressed (k = 2)</strong></td>
    </tr>
    <tr>
      <td>Persistence <code>p_k</code></td><td>0.95</td><td>0.80</td>
    </tr>
    <tr>
      <td>Expected duration (days)</td><td>20</td><td>5</td>
    </tr>
    <tr>
      <td>Daily mean <code>mu_k</code></td><td>+0.05%</td><td>-0.10%</td>
    </tr>
    <tr>
      <td>Daily volatility <code>sigma_k</code></td><td>0.80%</td><td>2.50%</td>
    </tr>
    <tr>
      <td>Annualised volatility</td><td>12.70%</td><td>39.69%</td>
    </tr>
  </tbody>
</table>

Steps:

1. **Long-run regime weights.** A chain that spends 20 days in calm per visit and 5 in stress spends `20 / (20 + 5) = 0.80` of its time calm. So `pi = (0.80, 0.20)`.
2. **Pooled mean.** `0.80 * 0.05 + 0.20 * (-0.10) = 0.04 - 0.02 = 0.02%` per day.
3. **Pooled second moment.** `0.80 * (0.80^2 + 0.05^2) + 0.20 * (2.50^2 + 0.10^2) = 0.514 + 1.252 = 1.766`.
4. **Pooled variance.** `1.766 - 0.02^2 = 1.7656`, so pooled daily volatility is `sqrt(1.7656) = 1.329%`.
5. **Annualised.** `1.329 * sqrt(252) = 21.09%`.

Now use that pooled number for volatility targeting at a 10% annualised target. The weight is `10 / 21.09 = 0.474`. Feed it through each regime:

- In calm, realised portfolio volatility is `0.474 * 12.70 = 6.02%` — barely half the target, so the book is chronically under-risked.
- In stress, realised volatility is `0.474 * 39.69 = 18.81%` — almost double the target, at the worst possible moment.

The pooled estimate is not wrong on average. It is simply never right, and its errors are correlated with the thing you were trying to control.

---

#### Adaptivity Versus Stability

The obvious fix is to estimate parameters on a shorter, more recent window. That trade is never free. For a volatility estimate from `n` observations, the sampling error of the estimate is roughly `sigma / sqrt(2n)` in absolute terms — about 15.8% of `sigma` at `n = 20`, and about 4.5% at `n = 250`.

<table>
  <tbody>
    <tr>
      <td><strong>Window</strong></td><td><strong>Adapts to a switch in</strong></td><td><strong>Relative error of vol estimate</strong></td>
    </tr>
    <tr>
      <td>20 days</td><td>days</td><td>~16%</td>
    </tr>
    <tr>
      <td>60 days</td><td>weeks</td><td>~9%</td>
    </tr>
    <tr>
      <td>250 days</td><td>quarters</td><td>~4.5%</td>
    </tr>
  </tbody>
</table>

A short window tracks the regime but is noisy enough that its own fluctuations look like regime changes. A long window is stable but stale, and if the window exceeds the expected regime duration it is guaranteed to be mixing regimes again. In the example above, any window longer than about 20 days will straddle the boundary. See [Rolling Windows](/quant-math/rolling-windows) for the mechanics and [GARCH](/stat-methods/garch) for the continuous alternative, which replaces a discrete switch with a smoothly decaying memory.

There is no window that resolves this. The tension is structural: you cannot simultaneously estimate a parameter precisely and detect that it has changed quickly.

---

#### Hindsight in Regime Labels

The single most common error in regime work is labelling regimes with information that was not available at the time.

Any smoothing procedure — a two-sided moving average, an in-sample fitted state path, a chart annotated after the fact — assigns to each date a label informed by what came next. Backtests built on such labels are not backtests; they are demonstrations that returns are predictable given the returns. The distinction between **filtered** state estimates (using data up to `t`) and **smoothed** ones (using the whole sample) is the formal version of this, and is developed in [Hidden Markov Models](/regimes-macro/hidden-markov-models).

A second, subtler version: the number of regimes and their parameters are usually chosen by looking at the whole history. Even if you then run the filter causally, the model's structure encodes the future. Honest evaluation requires re-fitting the model on expanding windows, which is expensive and usually produces less impressive results. See [Backtest Overfitting](/stat-methods/backtest-overfitting) and [Purged Cross-Validation](/ml-finance/purged-cross-validation).

> warning **A fitted regime may just be a fitted period** Adding states always improves in-sample likelihood. With enough states, a regime model degenerates into a lookup table of historical episodes, each with its own parameters and no predictive content.

---

#### In Practice Across Asset Classes

**Equities.** Regimes are most visible in volatility and dispersion. Index volatility clusters strongly, and the correlation between single names rises with it, which compresses the opportunity set for stock-selection strategies at the same time as it raises portfolio risk.

**Rates.** Regimes are policy-defined more than statistically defined. The level, slope, and curvature of a yield curve behave differently depending on where policy sits and what it is expected to do next. See [Rates and Inflation Regimes](/regimes-macro/rates-and-inflation).

**FX.** Carry-like currency exposures show long stretches of low volatility punctuated by sharp unwinds. A two-state model fits the shape of that behaviour naturally, but the calm state is so persistent that the estimated stress parameters rest on very few observations.

**Commodities.** Regimes are often driven by inventory and physical constraint rather than by financial conditions, so a commodity's regime can be uncorrelated with the market-wide one. Curve shape carries much of the information.

**Credit.** Regimes appear in spread levels and in liquidity simultaneously. Because marks are infrequent, measured volatility understates the true regime shift and the switch appears smoother than it was.

**On-chain markets.** Cycles are shorter and the history is thin, so there may be only a handful of complete regime visits in the entire record. Funding rates, leverage, and liquidation activity are unusually direct regime indicators here — see [Funding Rate](/signals/funding-rate) and [Liquidations](/building-blocks/liquidations) — but any parameter estimate for the stressed state is built on very few days.

---

#### Assumptions and Failure Modes

- **A small number of discrete states.** Real conditions may vary continuously. Forcing a continuum into `K` boxes produces spurious switching near the boundaries and stale parameters in the middle.
- **Constant parameters within a regime.** If volatility drifts inside a state, the model compensates by switching more often, inflating the apparent transition rate.
- **A time-invariant transition process.** The model assumes the probability of switching is itself stable. If the structure of the market changes, both the states and the transitions are wrong.
- **Enough observations per state.** Rare regimes are, by construction, estimated from few data points. The stressed-state parameters are the ones you most need and least know.
- **The regime is detectable in the data you have.** A model reading only returns cannot see a change in funding conditions or positioning until it shows up in prices, by which time it is not news.
- **Labels are causal.** Smoothed labels leak future information. If a result depends on them, it is not a result.
- **Regimes recur.** Fitting says nothing about whether a state observed in the past will ever be visited again on similar terms.

---

#### Code

```python
import numpy as np

def regime_mixture_moments(weights, means, vols):
    """Unconditional mean and volatility of a mixture of regimes.

    Shows the gap between the pooled figure and any single regime's figure.
    """
    weights, means, vols = map(np.asarray, (weights, means, vols))
    pooled_mean = float(weights @ means)
    second_moment = float(weights @ (vols**2 + means**2))
    pooled_vol = np.sqrt(second_moment - pooled_mean**2)
    return pooled_mean, float(pooled_vol)


def expected_duration(persistence):
    # Visits are geometric; mean of a geometric with exit prob (1 - p).
    return 1.0 / (1.0 - persistence)


def stationary_weights(persistences):
    # Time share is proportional to expected visit length, for a 2-state chain.
    durations = np.array([expected_duration(p) for p in persistences])
    return durations / durations.sum()
```

---

#### See Also

* [Markov Switching Models](/regimes-macro/markov-switching)
* [Hidden Markov Models](/regimes-macro/hidden-markov-models)
* [Correlation Breakdown](/regimes-macro/correlation-breakdown)
* [Stationarity](/quant-math/stationarity)
* [Rolling Windows](/quant-math/rolling-windows)
* [GARCH](/stat-methods/garch)
* [Backtest vs Live](/risk/backtest-vs-live)

---

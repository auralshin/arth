### Momentum vs Mean Reversion

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Autocorrelation, Stationarity | Tags: signals, momentum, mean-reversion, autocorrelation, variance-ratio

Almost every price-based signal is a bet on one of two claims. **Momentum** says a move that has begun is more likely to continue than to reverse. **Mean reversion** says a price that has strayed from some anchor is more likely to come back to it. The two are direct opposites, they cannot both be true of the same series at the same horizon, and an indicator built on the wrong one loses money in a perfectly systematic way.

What makes this hard is that both are true — at different horizons, in different regimes, on different instruments. Short-horizon returns in liquid markets tend to show weak reversal, largely a microstructure artefact of bid-ask bounce. Medium horizons of months tend to show continuation. Very long horizons of several years tend to revert. The horizon at which a signal is evaluated is therefore not a detail of the backtest; it *is* the hypothesis. This page gives the statistical machinery for deciding which regime a series is in, and is deliberately honest about how weak the evidence usually is.

---

#### Formal Definition

Both hypotheses are claims about the **autocorrelation** of returns. The lag-`k` sample autocorrelation of a return series is:

```text
rho_k = sum_{t=1}^{n-k} (r_t - mean(r)) * (r_{t+k} - mean(r))
        / sum_{t=1}^{n} (r_t - mean(r))^2
```

where:

- `r_t` is the return in period `t`
- `mean(r)` is the sample mean return
- `n` is the number of observations

Positive `rho_1` means momentum at that sampling frequency; negative `rho_1` means reversal; `rho_1` near zero means the series is close to a [random walk](/quant-math/random-walks).

A more robust test aggregates across horizons. The **variance ratio** compares the variance of `q`-period returns with `q` times the variance of one-period returns:

```text
VR(q) = Var(r_t(q)) / (q * Var(r_t))
```

where `r_t(q)` is the sum of `q` consecutive one-period returns. Under a pure random walk, variance scales linearly with time, so `VR(q) = 1`. A ratio above 1 indicates trending behaviour (moves compound); below 1 indicates reversal (moves cancel). For large samples the two statistics are linked approximately by `VR(2) ≈ 1 + 2 * rho_1`.

> info **The null is a random walk, not zero return** Both tests ask whether the series deviates from a random walk. Neither says anything about the *direction* of drift, which is a separate question addressed by expected-return models.

---

#### Worked Example

Two constructed 12-period return series, in per cent. Series A moves in runs; series B alternates.

<table>
  <tbody>
    <tr><td><strong>Period</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td></tr>
    <tr><td><strong>Series A</strong></td><td>0.9</td><td>1.2</td><td>0.7</td><td>-0.4</td><td>-1.0</td><td>-0.8</td><td>-0.3</td><td>0.6</td><td>1.1</td><td>0.8</td><td>-0.5</td><td>-0.9</td></tr>
    <tr><td><strong>Series B</strong></td><td>1.4</td><td>-1.1</td><td>0.9</td><td>-0.6</td><td>1.2</td><td>-1.3</td><td>0.7</td><td>-0.4</td><td>1.0</td><td>-1.2</td><td>0.8</td><td>-0.5</td></tr>
  </tbody>
</table>

**Series A, lag-1 autocorrelation.** The mean is `1.4 / 12 = 0.1167`. Summing the lagged cross products gives `4.3131`, and the sum of squared deviations is `7.7367`:

```text
rho_1 = 4.3131 / 7.7367 = 0.558
```

**Series A, variance ratio at q = 2.** Adding non-overlapping pairs gives `[2.1, 0.3, -1.8, 0.3, 1.9, -1.4]`. The sample variance of those six two-period returns is `2.6147`; the sample variance of the twelve one-period returns is `0.7033`:

```text
VR(2) = 2.6147 / (2 * 0.7033) = 1.859
```

Both statistics point the same way: trending. The approximation `1 + 2 * rho_1 = 2.115` is in the same region as the measured 1.859, the gap being ordinary small-sample noise.

**Series B.** The same calculations give `rho_1 = -0.835` and `VR(2) = 0.027`. The paired sums are almost identical to each other, so nearly all the one-period variance cancels within pairs — textbook mean reversion.

**How much of this is signal?** Under a random walk the standard deviation of a sample autocorrelation is roughly `1 / sqrt(n) = 1 / sqrt(12) = 0.289`. Series A's `rho_1 = 0.558` is about 1.9 standard errors from zero: suggestive, not conclusive, on twelve points.

> warning **These series are constructed to make the arithmetic visible** Real daily equity or futures returns have lag-1 autocorrelations far closer to zero, typically within a few hundredths in absolute value. A value near 0.5 in live data almost always means stale prices, a data error, or an illiquid instrument rather than an exploitable edge.

---

#### The Horizon Structure

The same instrument can be trending and reverting at once, at different scales.

<table>
  <tbody>
    <tr><td><strong>Horizon</strong></td><td><strong>Commonly observed behaviour</strong></td><td><strong>Usual explanation</strong></td></tr>
    <tr><td>Seconds to minutes</td><td>Reversal</td><td>Bid-ask bounce and transient liquidity demand, not a forecast of value</td></tr>
    <tr><td>Days to weeks</td><td>Weak, unstable, direction varies by market</td><td>Mostly noise; whichever sign appears is often sample-specific</td></tr>
    <tr><td>1 to 12 months</td><td>Continuation</td><td>Slow information diffusion and flow effects; the classic momentum window</td></tr>
    <tr><td>3 to 5 years</td><td>Reversal</td><td>Valuation anchors reassert; sample sizes here are very small</td></tr>
  </tbody>
</table>

Two further distinctions matter. **Time-series momentum** compares an asset with its own past and can hold every asset long at once. **Cross-sectional momentum** ranks assets against each other and is market-neutral by construction. They behave differently in a broad sell-off: cross-sectional momentum stays hedged, time-series momentum is either fully long or fully out.

Mean reversion also needs an anchor. Reverting to a moving average is a claim about a moving target; reverting to the spread of a [cointegrated pair](/stat-methods/cointegration) is a claim with a testable statistical basis. The second is a much stronger footing than the first.

---

#### In Practice Across Asset Classes

**Equities.** Cross-sectional momentum over roughly 12 months, skipping the most recent month, is one of the most studied effects in finance. It is also famous for sharp reversals during market rebounds, when yesterday's losers rally hardest. Short-horizon single-name reversal is largely a liquidity-provision return rather than a forecast.

**Futures.** The natural home of time-series momentum: managed futures programmes apply trend rules across dozens of contracts in currencies, rates, energy, metals, and agriculture. Because signals run on stitched continuous series, part of the measured trend can come from the [roll](/markets/roll-and-carry) rather than the outright price.

**FX.** Trend behaviour is weaker and more regime-dependent than in futures generally, because central banks actively resist certain moves and pegged or managed currencies can hold a level for years before jumping.

**Fixed income.** Yields mean-revert over long horizons under policy anchoring, but "long" can exceed a career. Momentum on yield changes is more tractable than momentum on prices, which mixes signal with duration.

**Crypto.** Continuous trading removes the overnight gap that shapes daily statistics in traditional markets, so intraday and daily statistics are more comparable than elsewhere. The reflexive relationship with leverage cuts both ways: crowded positioning can extend trends and then reverse them violently through liquidation cascades. See [Open Interest](/signals/open-interest) and [Leverage and Liquidation](/risk/leverage-liquidation).

---

#### Assumptions and Failure Modes

- **Stationarity.** Autocorrelation and variance-ratio estimates assume the return series is stationary. Prices are not; returns usually are close enough, but a structural break invalidates the estimate. See [Stationarity](/quant-math/stationarity) and [Unit Roots](/stat-methods/unit-roots).
- **Stability of the regime.** The dominant behaviour switches. A rule fitted to a trending sample and deployed into a range-bound one produces exactly the losses the fit was designed to avoid. See [Regimes Overview](/regimes-macro/regimes-overview).
- **Microstructure contamination.** Bid-ask bounce induces negative autocorrelation with no economic content. Sample from midpoints or trade-weighted prices rather than last trades. See [Slippage](/microstructure/slippage).
- **Stale and illiquid prices.** Infrequently traded assets marked at last trade show artificial positive autocorrelation. This inflates apparent momentum and understates volatility.
- **Horizon selection.** Scanning lookback windows for the strongest result guarantees an attractive number. See [Multiple Testing](/stat-methods/multiple-testing).
- **Small effective sample.** Overlapping windows inflate the apparent number of observations. Twenty years of monthly data is 240 points, and a 12-month overlapping lookback provides far fewer independent ones.
- **Cost asymmetry.** Mean-reversion rules trade often and against the prevailing flow, so they pay more in spread and are exposed to [adverse selection](/execution/adverse-selection). Momentum rules trade less but suffer entry lag.

---

#### Code

```python
import numpy as np
import pandas as pd

def variance_ratio(returns, q):
    """Lo-MacKinlay style variance ratio using non-overlapping q-period sums.

    Overlapping windows give a lower-variance estimator but need a
    heteroskedasticity-robust standard error; this version keeps the
    arithmetic transparent at the cost of discarding data.
    """
    r = pd.Series(returns).dropna()
    usable = len(r) - (len(r) % q)
    aggregated = r.iloc[:usable].values.reshape(-1, q).sum(axis=1)
    return aggregated.var(ddof=1) / (q * r.var(ddof=1))


def horizon_scan(returns, lags=(1, 2, 5, 10, 21, 63)):
    """Autocorrelation and variance ratio by horizon, with the random-walk
    band under the null so weak results are not read as evidence."""
    r = pd.Series(returns).dropna()
    band = 1.96 / np.sqrt(len(r))
    return pd.DataFrame(
        {
            "autocorr": [r.autocorr(lag=k) for k in lags],
            "variance_ratio": [variance_ratio(r, k) if k > 1 else 1.0 for k in lags],
            "null_band": band,
        },
        index=pd.Index(lags, name="lag"),
    )
```

---

#### See Also

* [What Is a Trading Signal?](/signals/what-is-signal)
* [Autocorrelation](/quant-math/autocorrelation)
* [Mean Reversion](/quant-math/mean-reversion)
* [Cointegration](/stat-methods/cointegration)
* [Momentum Strategy](/strategies/momentum)
* [Ornstein-Uhlenbeck Process](/stochastic-calculus/ornstein-uhlenbeck)

---

### Random Walks

> info **Metadata** Level: Intermediate | Prerequisites: Random Variables, Autocorrelation | Tags: random-walks, time-series, prices, martingales

A random walk is a process whose next value is its current value plus an independent shock. Applied to log prices, it says that the change over the next period is unrelated to any change that has already happened — that the level carries all the information and the path carries none. It is the null hypothesis of price behaviour: not a claim that markets are random, but the baseline that any claim of predictability has to beat.

Most of the practical content is in the arithmetic of accumulation. Variance grows linearly with horizon and volatility with its square root, so risk scales as `sqrt(T)` while drift scales as `T`. That single asymmetry explains why short-horizon prediction is so difficult, why long-horizon expected returns dominate short-term noise, and why the `sqrt(252)` in every annualisation formula is there.

---

#### Formal Definition

The discrete random walk with drift:

```text
X_t = X_{t-1} + mu + e_t
```

where:

- `mu` is the per-period drift
- `e_t` are independent, identically distributed shocks with mean 0 and variance `sigma^2`

Accumulating `T` steps from `X_0`:

```text
E[X_T]   = X_0 + mu * T
Var(X_T) = sigma^2 * T
sd(X_T)  = sigma * sqrt(T)
```

Applied to log prices, `X_t = ln(P_t)`, so log returns are the increments and prices follow the geometric version. See [Geometric Brownian Motion](/quant-math/gbm).

**Martingale.** When `mu = 0`, the process satisfies:

```text
E[X_{t+1} | information at t] = X_t
```

The best forecast of tomorrow is today. This is the economically meaningful statement — it follows from the absence of exploitable predictability — and it is considerably weaker than the full random walk, which additionally requires the increments to be independent and identically distributed. Returns can be a martingale difference sequence while their *squares* are strongly dependent, which is exactly what volatility clustering is. See [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations).

**Variance ratio.** The natural test statistic compares variance at two horizons:

```text
VR(q) = Var(q-period return) / (q * Var(1-period return))
```

Under a random walk `VR(q) = 1` for every `q`. Above 1 means positive serial correlation and trend; below 1 means reversal. The identity `VR(2) = 1 + rho_1` links it directly to [Autocorrelation](/quant-math/autocorrelation).

---

#### Worked Example

Daily log returns with `sigma = 1.2%` and drift `mu = 0.04%` per day. Under a random walk:

<table>
  <tbody>
    <tr>
      <td><strong>Horizon</strong></td>
      <td><strong>Drift</strong></td>
      <td><strong>Standard deviation</strong></td>
      <td><strong>Drift / sd</strong></td>
    </tr>
    <tr><td>1 day</td><td>0.04%</td><td>1.20%</td><td>0.03</td></tr>
    <tr><td>1 week (5)</td><td>0.20%</td><td>2.68%</td><td>0.07</td></tr>
    <tr><td>1 month (20)</td><td>0.80%</td><td>5.37%</td><td>0.15</td></tr>
    <tr><td>1 year (252)</td><td>10.08%</td><td>19.05%</td><td>0.53</td></tr>
  </tbody>
</table>

1. **Standard deviations**: `1.2% * sqrt(5) = 2.68%`, `1.2% * sqrt(20) = 5.37%`, `1.2% * sqrt(252) = 19.05%`
2. **The ratio grows as `sqrt(T)`**: drift accumulates linearly while noise accumulates as a square root, so the signal-to-noise ratio improves with horizon — but slowly, and it is still only 0.53 after a full year
3. **Probability of finishing the year higher**: the normal approximation gives `N(10.08 / 19.05) = N(0.529) = 70.2%`
4. **Expected absolute displacement** over the year, for a driftless walk, is `sigma * sqrt(2T/pi) = 19.05% * 0.798 = 15.2%`

Point 4 is the intuition people usually lack: a driftless process does not stay near its origin. It wanders, and the typical distance from the start grows without bound. There is no restoring force.

**A variance ratio test.** Suppose the measured 5-day return variance is 30% larger than five times the daily variance, so `VR(5) = 1.30`. Then the true 5-day volatility is `1.2% * sqrt(1.30 * 5) = 1.2% * 2.550 = 3.06%`, against the `2.68%` that `sqrt(T)` scaling predicts. Naive annualisation understates 5-day risk by about 14%, and any Sharpe ratio annualised from daily data would be correspondingly overstated.

> warning **`sqrt(T)` scaling is a random walk assumption, not an identity** Every annualised volatility, annualised Sharpe, and multi-day VaR in common use inherits it. Test it with a variance ratio before relying on it.

---

#### Why the Null Is Hard to Reject

Random walk tests have low power against the alternatives that matter. A process with a true lag-1 autocorrelation of 0.02 — economically meaningful if it can be traded cheaply — requires thousands of observations to distinguish from zero, and by the time enough data has accumulated the market structure that generated it has probably changed.

This produces a persistent asymmetry in research. Rejecting the random walk on a short sample is usually a false positive; failing to reject it is usually uninformative. Both errors are common, and the multiple-testing problem makes the first one worse: search enough series and horizons and some will reject at any threshold. See [Multiple Testing](/stat-methods/multiple-testing) and [LLN & CLT](/quant-math/lln-clt).

The random walk also fails in a way that does not help a directional trader. Returns are close to serially uncorrelated while *squared* returns are strongly autocorrelated. Volatility is predictable; direction largely is not. Most of what looks like structure in a price chart is structure in the second moment.

---

#### In Practice Across Asset Classes

- **Equities.** Index returns are close to a random walk at daily and weekly horizons. Deviations appear at very short horizons, where they are microstructure rather than information, and at multi-month horizons in the cross-section rather than in a single series.
- **Futures.** Trend-following is a bet against the random walk at horizons of weeks to months. The evidence rests on breadth — the same weak effect across many markets — rather than on a decisive rejection in any one series. See [Momentum](/strategies/momentum).
- **Fixed income.** Yield levels behave close to a random walk over short horizons but are bounded by policy and by economic limits in a way a true random walk is not. Yield *spreads* between maturities revert far more reliably than levels. See [Yield Curves](/markets/yield-curves).
- **FX.** Major pairs are among the closest things in finance to a random walk at short horizons, which is consistent with their depth. Managed rates behave like a constant punctuated by a jump, which fails the model in the opposite direction.
- **Credit.** Spreads show slow mean reversion within a cycle and jump discontinuously at defaults, so neither the random walk nor a simple reverting model captures them across a full cycle. See [Credit Spreads](/credit/credit-spreads).
- **Commodities.** Storage costs and production economics anchor prices, producing slow reversion around a level that itself moves. The random walk is a poor description at multi-year horizons and a reasonable one within a season.
- **On-chain.** Block-level price series show strong negative lag-1 autocorrelation, because each swap moves the price along a bonding curve and the next trade often moves it back. That is mechanical rather than informational, and it is consumed by fees and slippage. See [AMMs 101](/building-blocks/amms-101).

---

#### Assumptions and Failure Modes

- **Independent increments.** Volatility clustering violates identical distribution even when returns are uncorrelated. The `sqrt(T)` scaling of *variance* survives serial uncorrelatedness; the assumption of a stable distribution does not.
- **Finite variance.** With sufficiently heavy tails, sums converge to a stable law rather than a normal one and the scaling exponent is not `1/2`. Estimates then depend on sample length rather than on the market.
- **No drift uncertainty.** In practice `mu` is estimated with a standard error comparable to its own size. Forecasts that treat the drift as known are far too confident. See [Sampling](/quant-math/sampling).
- **Symmetric shocks.** Real return distributions are skewed, and price levels are bounded below by zero, which the arithmetic random walk does not respect. The geometric version fixes the boundary but not the skew.
- **Unbounded wandering.** The model has no equilibrium. For quantities with economic anchors — spreads, real exchange rates, inventory-driven commodity prices — a mean-reverting model is the better null. See [Mean Reversion](/quant-math/mean-reversion).
- **Confusing the martingale with the random walk.** Market efficiency implies the weaker martingale property. Rejecting full independence is not evidence of exploitable predictability.
- **Continuous paths.** A random walk with finite-variance shocks produces no discontinuities in the limit. Real markets gap. See [Jump Processes](/quant-math/jumps).

---

#### Code

```python
import numpy as np

def simulate_random_walk(n_steps, drift=0.0, sigma=0.01, x0=0.0, seed=None):
    """Cumulative sum of iid shocks: the baseline any signal must beat."""
    rng = np.random.default_rng(seed)
    shocks = rng.normal(drift, sigma, n_steps)
    return x0 + np.cumsum(shocks)


def variance_ratio(returns, q):
    """VR = 1 under a random walk. Above 1 implies trend, below implies reversal.

    Uses overlapping q-period sums, so the sampling distribution is not
    the naive one — bootstrap the critical values rather than assuming them.
    """
    r = np.asarray(returns, dtype=float)
    aggregated = np.convolve(r, np.ones(q), mode="valid")
    return aggregated.var(ddof=1) / (q * r.var(ddof=1))


def horizon_scaling(daily_sigma, days):
    """sqrt(T) scaling. Valid only if the variance ratio is close to 1."""
    return daily_sigma * np.sqrt(days)
```

---

#### See Also

* [Geometric Brownian Motion](/quant-math/gbm)
* [Mean Reversion](/quant-math/mean-reversion)
* [Autocorrelation](/quant-math/autocorrelation)
* [LLN & CLT](/quant-math/lln-clt)
* [Stationarity](/quant-math/stationarity)
* [Brownian Motion](/stochastic-calculus/brownian-motion)
* [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations)
* [Unit Roots](/stat-methods/unit-roots)

---

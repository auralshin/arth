### Autocorrelation

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Expectation & Variance | Tags: time-series, autocorrelation, dependence, momentum, mean-reversion

Autocorrelation is the correlation of a series with a lagged copy of itself. At lag `k` it asks whether knowing today's value tells you anything about the value `k` periods ahead. In returns, a positive value indicates persistence — the raw material of trend and momentum strategies. A negative value indicates reversal, which is either a genuine mean-reverting force or an artefact of how prices are recorded.

It is the first diagnostic to run on any return series, for two reasons. It is where predictability, if any exists, will show up. And it is the assumption that most downstream machinery quietly depends on: `sqrt(T)` annualisation, standard errors, variance additivity, and every independence-based confidence interval all break when returns are autocorrelated.

---

#### Formal Definition

For a stationary series with mean `mu`, the autocovariance and autocorrelation at lag `k` are:

```text
gamma_k = E[(x_t - mu) * (x_{t+k} - mu)]
rho_k   = gamma_k / gamma_0
```

where `gamma_0` is the variance, so `rho_0 = 1` by construction and `rho_k` lies between -1 and +1.

The sample estimator from `n` observations:

```text
rho_hat_k = sum over t=1..n-k of (x_t - xbar)(x_{t+k} - xbar)
            / sum over t=1..n of (x_t - xbar)^2
```

Note the asymmetry: the numerator has `n - k` terms, the denominator `n`. This biases estimates towards zero at long lags, which is deliberate — it keeps the estimated autocorrelation function well-behaved.

**Standard error.** Under the null hypothesis of no autocorrelation, `rho_hat_k` has approximate standard error `1 / sqrt(n)`. This is the Bartlett bound, and it is the dashed line on every correlogram.

**Joint test.** The Ljung-Box statistic tests whether the first `h` autocorrelations are jointly zero:

```text
Q = n * (n + 2) * sum over k=1..h of  rho_hat_k^2 / (n - k)
```

Under the null, `Q` follows a chi-squared distribution with `h` degrees of freedom.

**Partial autocorrelation (PACF)** gives the correlation at lag `k` after removing the effect of all shorter lags. The ACF and PACF together identify autoregressive and moving-average structure. See [ARIMA](/stat-methods/arima).

---

#### Worked Example

Ten daily returns, in per cent:

<table>
  <tbody>
    <tr>
      <td><strong>Day</strong></td>
      <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td>
      <td>6</td><td>7</td><td>8</td><td>9</td><td>10</td>
    </tr>
    <tr>
      <td><strong>Return (%)</strong></td>
      <td>1.2</td><td>0.8</td><td>-0.4</td><td>-1.1</td><td>0.6</td>
      <td>1.5</td><td>0.2</td><td>-0.9</td><td>-1.3</td><td>0.4</td>
    </tr>
  </tbody>
</table>

1. **Mean**: the ten values sum to `1.0`, so `xbar = 0.10%`
2. **Deviations**: `[1.1, 0.7, -0.5, -1.2, 0.5, 1.4, 0.1, -1.0, -1.4, 0.3]`
3. **Denominator**: squared deviations sum to `8.66`
4. **Lag-1 numerator**: the nine consecutive products are `0.77, -0.35, 0.60, -0.60, 0.70, 0.14, -0.10, 1.40, -0.42`, summing to `2.14`
5. **Lag-1 autocorrelation**: `2.14 / 8.66 = 0.247`
6. **Lag-2**: numerator `-5.11`, so `rho_2 = -0.590`. **Lag-3**: numerator `-4.22`, so `rho_3 = -0.487`

Now the honest interpretation. With `n = 10`, the standard error is `1 / sqrt(10) = 0.316`.

<table>
  <tbody>
    <tr>
      <td><strong>Lag</strong></td>
      <td><strong>rho_hat</strong></td>
      <td><strong>t-statistic</strong></td>
    </tr>
    <tr><td>1</td><td>0.247</td><td>0.78</td></tr>
    <tr><td>2</td><td>-0.590</td><td>-1.87</td></tr>
    <tr><td>3</td><td>-0.487</td><td>-1.54</td></tr>
  </tbody>
</table>

Not one of them clears the conventional threshold of about 2, and three lags were examined, so even the largest deserves a multiple-testing discount. The Ljung-Box statistic over these three lags is `Q = 10.11` against a 5% chi-squared critical value of `7.81` for 3 degrees of freedom — nominally a rejection, but the chi-squared approximation is unreliable at `n = 10`, so this is a demonstration of the arithmetic, not evidence of structure.

> warning **Ten observations cannot detect autocorrelation** To distinguish a true `rho_1` of 0.05 from zero you need thousands of observations. Any strong autocorrelation found in a short sample is more likely to be noise than a discovery.

---

#### Where the Structure Actually Lives

Raw return autocorrelation in liquid markets is small — that is roughly what market efficiency means. Three places where it is reliably not small:

- **Squared or absolute returns.** Volatility clusters, so `|r_t|` and `r_t^2` are strongly and persistently autocorrelated even when `r_t` is not. In the example above the lag-1 autocorrelation of squared returns is `-0.56`, which with ten points is again noise, but on real series this is the most robust feature in all of financial time series. It is the empirical fact GARCH exists to model. See [GARCH](/stat-methods/garch).
- **Microstructure.** Bid-ask bounce induces negative lag-1 autocorrelation in trade-price returns at high frequency. It is a recording artefact of alternating buys and sells, not a tradable reversal, and it disappears on mid-quote returns. See [Slippage](/microstructure/slippage).
- **Smoothed or stale marks.** Infrequently priced assets show strong positive autocorrelation because today's mark partly repeats yesterday's. This inflates Sharpe ratios and deflates measured volatility.

**Link to variance ratios.** Autocorrelation and multi-period variance scaling are the same fact viewed two ways:

```text
VR(q) = 1 + 2 * sum over k=1..q-1 of  (1 - k/q) * rho_k
```

For `q = 2` this reduces to `VR(2) = 1 + rho_1`. The example's `rho_1 = 0.247` implies two-day variance is 1.25 times twice the one-day variance — meaning `sqrt(T)` scaling would understate two-day volatility by about 12%. See [Random Walks](/quant-math/random-walks).

---

#### In Practice Across Asset Classes

- **Equities.** Individual-name daily returns show weak short-horizon reversal; index returns show very little at any horizon. Cross-sectional momentum at multi-month horizons is a different phenomenon from time-series autocorrelation of a single series and should not be conflated with it.
- **Futures.** Trend-following rests on the claim of positive autocorrelation at horizons of weeks to months across a diversified set of contracts. The per-market effect is far too small to detect reliably in one series; the case is built on breadth across many markets. See [Momentum](/strategies/momentum).
- **Fixed income.** Yield *levels* are extremely persistent — close to a unit root — while yield *changes* are much less so. Testing the wrong one produces near-perfect autocorrelation that means nothing. See [Unit Roots](/stat-methods/unit-roots).
- **FX.** Major pairs show very little return autocorrelation, consistent with the depth of the market. Managed and pegged currencies show strong positive autocorrelation punctuated by discontinuous repricing.
- **Credit.** Spread series are heavily autocorrelated, partly economic and partly a marking artefact. Separating the two requires comparing dealer marks against traded prices or liquid index equivalents.
- **Commodities.** Seasonality creates deterministic autocorrelation at the annual lag which is calendar structure rather than predictability, and it must be removed before testing for anything else. See [Commodities](/markets/commodities).
- **On-chain.** Block-level return series inherit strong negative lag-1 autocorrelation from discrete swap arrivals against a bonding curve. Funding rates, being mechanically anchored to a target, are strongly positively autocorrelated by construction. See [Funding Rate](/signals/funding-rate).

---

#### Assumptions and Failure Modes

- **Stationarity is required.** The autocorrelation function is only defined for a series whose moments do not change with time. Applied to a trending price series it will report near-1.0 at every lag, which reflects the trend and nothing else. Difference first. See [Stationarity](/quant-math/stationarity).
- **Linear dependence only.** Zero autocorrelation does not mean independence. Returns can be serially uncorrelated while their squares are strongly dependent, which is the normal state of financial data.
- **Multiple lags mean multiple tests.** Examining 20 lags at the 5% level produces one apparent rejection on average under pure noise. Use a joint test rather than picking the largest bar. See [Multiple Testing](/stat-methods/multiple-testing).
- **Non-constant variance breaks the standard errors.** The `1 / sqrt(n)` bound assumes homoskedastic returns. Under volatility clustering the true standard error is larger, so the bound is too tight and over-rejects.
- **Autocorrelation is unstable.** It changes with market structure, liquidity, and regime. A relationship estimated over a five-year window need not have been present in any particular year of it.
- **Detected structure is not necessarily tradable.** Lag-1 reversal at tick frequency is real and is consumed by the spread. Statistical significance and net-of-cost profitability are different tests. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).

---

#### Code

```python
import numpy as np

def autocorrelation(series, max_lag=10):
    """Sample ACF with the standard n-denominator convention."""
    x = np.asarray(series, dtype=float)
    deviations = x - x.mean()
    denominator = (deviations**2).sum()
    return np.array([
        (deviations[:-lag] * deviations[lag:]).sum() / denominator
        for lag in range(1, max_lag + 1)
    ])


def ljung_box(series, max_lag=10):
    """Joint test that the first max_lag autocorrelations are all zero.

    Prefer this to eyeballing the tallest bar on a correlogram.
    """
    x = np.asarray(series, dtype=float)
    n = len(x)
    rho = autocorrelation(x, max_lag)
    lags = np.arange(1, max_lag + 1)
    return n * (n + 2) * np.sum(rho**2 / (n - lags))


def variance_ratio(returns, q):
    """VR = 1 under a random walk; above 1 implies persistence, below implies reversal."""
    r = np.asarray(returns, dtype=float)
    aggregated = np.convolve(r, np.ones(q), mode="valid")
    return aggregated.var(ddof=1) / (q * r.var(ddof=1))
```

---

#### See Also

* [Stationarity](/quant-math/stationarity)
* [Random Walks](/quant-math/random-walks)
* [Mean Reversion](/quant-math/mean-reversion)
* [Volatility](/quant-math/volatility)
* [ARIMA](/stat-methods/arima)
* [GARCH](/stat-methods/garch)
* [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion)

---

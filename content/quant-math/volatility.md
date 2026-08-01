### Volatility

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Expectation & Variance | Tags: volatility, dispersion, risk, time-series

Volatility is the standard deviation of returns, usually annualised. It is the single most-used number in quantitative finance: it sets position sizes, feeds margin models, appears in the denominator of every risk-adjusted performance ratio, and is the one unobservable input to an option price. Nothing else does as much work on as thin a definition.

The thinness matters. "Volatility" names at least three different objects — the realised dispersion of a past return sample, a forecast of future dispersion, and the number implied by an option price. They are related but distinct, they routinely disagree, and a great deal of trading is the exploitation of the gaps between them.

---

#### Formal Definition

From a sample of `n` period returns:

```text
sigma_period = sqrt( sum of (r_t - rbar)^2 / (n - 1) )
```

Annualisation assumes returns are serially uncorrelated, so variance is additive over time:

```text
sigma_annual = sigma_period * sqrt(periods_per_year)
```

where:

- `r_t` is the return in period `t`, usually a log return
- `rbar` is the sample mean return
- `periods_per_year` is 252 for daily data on exchange-traded markets, 52 weekly, 12 monthly

A common variant sets `rbar` to zero:

```text
sigma_period = sqrt( sum of r_t^2 / n )
```

At daily frequency the mean return is small relative to the noise around it, and estimating it costs a degree of freedom for no benefit. Zero-mean estimators are standard in risk systems for this reason.

**Range-based estimators** use the intraday high and low rather than the close alone, which extracts more information from the same daily bar. The Parkinson estimator is:

```text
sigma^2_Parkinson = (1 / (4 * ln 2)) * (ln(High / Low))^2
```

For a day with high 101.0 and low 99.5: `ln(101/99.5) = 0.014963`, squared is `0.00022389`, multiplied by `0.36067` gives a daily variance of `0.0000808`, so `sigma = 0.899%` daily, or `14.3%` annualised. Garman-Klass and Rogers-Satchell extend the idea using the open and close as well.

**Exponentially weighted (EWMA)** volatility weights recent observations more heavily:

```text
sigma^2_t = lambda * sigma^2_{t-1} + (1 - lambda) * r^2_{t-1}
```

With `lambda = 0.94`, the half-life of a shock is about 11 days; with `lambda = 0.97`, about 23 days.

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
      <td>0.8</td><td>-1.2</td><td>0.3</td><td>2.1</td><td>-0.5</td>
      <td>-1.8</td><td>0.9</td><td>0.4</td><td>-0.7</td><td>1.3</td>
    </tr>
  </tbody>
</table>

1. **Mean**: the returns sum to `1.6`, so `rbar = 0.16%`
2. **Squared deviations** sum to `12.964`
3. **Sample variance**: `12.964 / 9 = 1.4404` (per cent squared)
4. **Daily volatility**: `sqrt(1.4404) = 1.2002%`
5. **Annualised**: `1.2002% * sqrt(252) = 19.05%`

Now the zero-mean version. The raw squared returns sum to `13.22`, so the variance is `13.22 / 10 = 1.322`, the daily volatility is `1.150%`, and the annualised figure is `18.25%`.

The two estimates differ by 0.8 percentage points from the same ten numbers, purely from a convention choice. Over ten observations that gap is meaningless noise; the point is that a volatility number without its convention attached cannot be compared to another one.

> warning **`sqrt(252)` is an assumption** The square-root rule holds only if returns are serially uncorrelated. Positive autocorrelation makes true multi-period volatility higher than the scaled figure; negative autocorrelation makes it lower. Verify with a variance ratio before relying on it. See [Random Walks](/quant-math/random-walks).

---

#### Realised, Forecast, and Implied

<table>
  <tbody>
    <tr>
      <td><strong>Type</strong></td>
      <td><strong>What it is</strong></td>
      <td><strong>Main weakness</strong></td>
    </tr>
    <tr><td>Realised</td><td>Dispersion measured over a past window</td><td>Backward-looking; the window choice determines the answer</td></tr>
    <tr><td>Forecast</td><td>Model output — EWMA, GARCH, range-based</td><td>Fitted on history; fails at regime turns, when it is most needed</td></tr>
    <tr><td>Implied</td><td>The volatility reproducing an observed option price</td><td>Contains a risk premium, so it is not a pure forecast</td></tr>
  </tbody>
</table>

Implied volatility typically sits above subsequently realised volatility, and the gap is compensation for bearing variance risk rather than a forecasting error. It also varies systematically with strike and maturity, producing the volatility surface. See [Implied Volatility](/derivatives/implied-volatility) and [Vol Surface](/derivatives/vol-surface).

**Volatility clusters.** Large moves follow large moves. Squared returns are strongly autocorrelated even when returns themselves are not, which is the empirical fact that motivates GARCH-family models. See [GARCH](/stat-methods/garch).

---

#### In Practice Across Asset Classes

- **Equities.** Daily close-to-close, annualised with 252. Volatility is asymmetric: it rises far more on down moves than on equivalent up moves, so symmetric models systematically misprice the left tail. Index volatility is well below the average single-name volatility because of diversification.
- **Futures.** Volatility must be computed on a properly rolled series or roll gaps enter as spurious returns. Front contracts are typically more volatile than deferred ones, so a term structure of volatility exists alongside the price curve. See [Roll and Carry](/markets/roll-and-carry).
- **FX.** Trading is effectively continuous, so the daily bar is a convention and different cut times give different volatilities. Pegged and managed rates show near-zero volatility for extended periods followed by a single discontinuous move — a regime the standard estimator cannot represent.
- **Fixed income.** Risk is usually quoted as basis-point volatility of yields rather than percentage volatility of prices, because the price-yield map depends on duration. Converting between them requires the duration at the time. See [Duration & Convexity](/markets/duration-convexity).
- **Credit.** Marks on illiquid bonds are smoothed and stale, producing measured volatility well below economic volatility. Any Sharpe ratio built on such a series is inflated by a measurement artefact.
- **Commodities.** Seasonality and inventory constraints make volatility state-dependent — low with ample storage, sharply higher near capacity limits. A single unconditional number describes neither state. See [Commodities](/markets/commodities).
- **On-chain.** Markets trade continuously, so 365 is the conventional annualisation factor rather than 252, which alone raises the annualised figure by about 20% relative to the same daily volatility scaled with 252. Thin pools also produce price series driven by individual trades, so measured volatility partly reflects liquidity rather than information.

---

#### Assumptions and Failure Modes

- **Constant volatility within the window.** Volatility clusters, so any window average blends calm and stressed periods into a number that describes neither. See [Rolling Windows](/quant-math/rolling-windows).
- **Serial independence.** Required for `sqrt(T)` scaling. Trending or mean-reverting series break it in opposite directions.
- **Finite variance.** With sufficiently heavy tails the sample standard deviation does not converge; it simply grows with the sample. The estimate then reflects the window length rather than the market.
- **Volatility is not risk.** It measures dispersion, treating a large gain exactly like a large loss, and it says nothing about skew, tails, or path. See [VaR & CVaR](/quant-math/var-cvar) and [Drawdown](/quant-math/drawdown).
- **Stale and smoothed prices deflate it.** Anything marked infrequently — model-priced credit, private positions, thin tokens — reports volatility below its true level.
- **Microstructure noise inflates it at high frequency.** Bid-ask bounce adds spurious negative autocorrelation and variance. Sampling every trade gives a *higher* volatility estimate than sampling every five minutes, and the difference is noise, not information. See [Slippage](/microstructure/slippage).
- **The estimate is noisy.** Relative standard error is roughly `1 / sqrt(2(n - 1))`, so a one-month estimate carries around 16% relative error. Small changes in a rolling volatility are usually not signal. See [Sampling](/quant-math/sampling).

---

#### Code

```python
import numpy as np

def realised_volatility(returns, periods_per_year=252, subtract_mean=False):
    """Annualised realised volatility from periodic returns.

    Risk systems usually leave the mean in place at daily frequency:
    estimating it costs a degree of freedom and adds noise.
    """
    r = np.asarray(returns, dtype=float)
    variance = r.var(ddof=1) if subtract_mean else np.mean(r**2)
    return np.sqrt(variance * periods_per_year)


def ewma_volatility(returns, lam=0.94, periods_per_year=252):
    """Exponentially weighted volatility; lam = 0.94 has an 11-day half-life."""
    r = np.asarray(returns, dtype=float)
    variance = r[0] ** 2
    for observation in r[1:]:
        variance = lam * variance + (1 - lam) * observation**2
    return np.sqrt(variance * periods_per_year)


def parkinson_volatility(high, low, periods_per_year=252):
    """Range-based estimator; uses more of the bar than the close alone."""
    log_range = np.log(np.asarray(high) / np.asarray(low))
    variance = np.mean(log_range**2) / (4.0 * np.log(2.0))
    return np.sqrt(variance * periods_per_year)
```

---

#### See Also

* [Returns](/quant-math/returns)
* [Rolling Windows](/quant-math/rolling-windows)
* [Autocorrelation](/quant-math/autocorrelation)
* [VaR & CVaR](/quant-math/var-cvar)
* [GARCH](/stat-methods/garch)
* [Implied Volatility](/derivatives/implied-volatility)
* [Vol Term Structure](/derivatives/vol-term-structure)

---

### GARCH Models

> info **Metadata** Level: Advanced | Prerequisites: Volatility, Autocorrelation | Tags: volatility, garch, arch, volatility-clustering, forecasting, risk

Returns are close to unforecastable in their mean and highly forecastable in their variance. Large moves cluster: a violent day is followed by more violent days, a quiet week by more quiet weeks. GARCH — Generalised AutoRegressive Conditional Heteroskedasticity — is the standard parametric model of that clustering, turning "volatility is high right now" into a forecast with a horizon and a mean-reversion speed.

The practical payoff is a **term structure of variance**. A rolling standard deviation tells you what volatility has been; GARCH tells you what it is expected to be one day, one week, and one quarter ahead, and how fast it decays back toward its long-run level. That distinction drives position sizing, option pricing, and risk limits.

---

#### Formal Definition

**ARCH(1)** makes today's variance a function of yesterday's squared shock; **GARCH(1,1)** adds a lagged variance term, which is what makes the model usable:

```text
ARCH(1)     h_t = omega + alpha * r_{t-1}^2
GARCH(1,1)  h_t = omega + alpha * r_{t-1}^2 + beta * h_{t-1}
```

where `h_t` is the conditional variance for period `t` forecast from information up to `t-1`, `r_{t-1}` is the previous period's return (assumed zero-mean, or de-meaned first), `omega` is a positive constant anchoring the long-run level, `alpha` weights new information — the reaction to the last shock — and `beta` weights the previous variance estimate, the persistence.

Constraints for a well-defined model: `omega` above 0, `alpha` and `beta` at or above 0, and `alpha + beta` below 1. The quantity `alpha + beta` is the **persistence**, governing how slowly variance reverts, and from the one-step forecast `h_{t+1}` longer horizons decay geometrically toward the long-run level:

```text
long-run variance    = omega / (1 - alpha - beta)
half-life in periods = ln(0.5) / ln(alpha + beta)

E[h_{t+k}] = long_run_var + (alpha + beta)^(k-1) * (h_{t+1} - long_run_var)
```

The one-step-ahead value uses the actual last return; every step after that replaces the unknown squared return with its expectation, which is the variance itself.

---

#### Worked Example

A GARCH(1,1) fitted to daily equity index returns gives `omega = 0.000002`, `alpha = 0.08`, `beta = 0.90`. Yesterday's conditional variance was `h_t = 0.000400` (a daily volatility of 2.00%) and yesterday's return was `-3.00%`.

1. **Persistence**: `alpha + beta = 0.08 + 0.90 = 0.98`
2. **Long-run variance**: `0.000002 / (1 - 0.98) = 0.000002 / 0.02 = 0.000100`, a **long-run daily volatility** of `sqrt(0.000100) = 1.00%`, annualising to `1.00% * sqrt(252) = 15.87%`
3. **Half-life**: `ln(0.5) / ln(0.98) = -0.693 / -0.0202 = 34.3` trading days
4. **One-step update**, using `r_t^2 = (-0.03)^2 = 0.0009`: `h_{t+1} = 0.000002 + 0.08 * 0.0009 + 0.90 * 0.000400 = 0.000002 + 0.000072 + 0.000360 = 0.000434`
5. **Tomorrow's volatility**: `sqrt(0.000434) = 0.02083 = 2.083%` daily, `33.1%` annualised

The 3% down day raised the variance forecast from 0.000400 to 0.000434, a rise in volatility from 2.00% to 2.08%. The reaction is deliberately modest — `alpha = 0.08` means a single observation moves the estimate by only 8% of the distance to its own squared value. The full forecast path, applying the decay formula:

<table>
  <tbody>
    <tr><td><strong>Horizon (days)</strong></td><td><strong>Variance forecast</strong></td><td><strong>Daily vol</strong></td><td><strong>Annualised vol</strong></td></tr>
    <tr><td>1</td><td>0.000434</td><td>2.083%</td><td>33.1%</td></tr>
    <tr><td>2</td><td>0.000427</td><td>2.067%</td><td>32.8%</td></tr>
    <tr><td>5</td><td>0.000408</td><td>2.020%</td><td>32.1%</td></tr>
    <tr><td>20</td><td>0.000328</td><td>1.810%</td><td>28.7%</td></tr>
    <tr><td>60</td><td>0.000201</td><td>1.419%</td><td>22.5%</td></tr>
    <tr><td>infinity</td><td>0.000100</td><td>1.000%</td><td>15.9%</td></tr>
  </tbody>
</table>

Checking the day-2 step by hand: `0.000002 + 0.98 * 0.000434 = 0.000427`. For pricing an option expiring in 20 days, the relevant input is the *average* variance over the whole path, not the value at day 20. Averaging the first twenty daily forecasts gives `0.000378`, an annualised volatility of `30.8%` — meaningfully above the 28.7% spot forecast for day 20 alone, and the mechanical origin of a downward-sloping [volatility term structure](/derivatives/vol-term-structure) after a shock.

---

#### GARCH, EWMA, and Realised Volatility

Three estimators of the same quantity, differing in what they assume. **Rolling (realised) volatility** is the standard deviation of the last `n` returns, weighting each equally: simple and transparent, but it reacts slowly to a shock and drops abruptly when a large observation falls out of the back of the window — an "echo" effect with no economic content ([Rolling Windows](/quant-math/rolling-windows)). **Exponentially weighted moving average (EWMA)** applies geometrically decaying weights, `h_t = lambda * h_{t-1} + (1 - lambda) * r_{t-1}^2`. This is exactly GARCH(1,1) with `omega = 0`, `beta = lambda`, `alpha = 1 - lambda`, so `alpha + beta = 1` by construction. With the widely used `lambda = 0.94` on daily data, the example above gives `0.94 * 0.000400 + 0.06 * 0.0009 = 0.000376 + 0.000054 = 0.000430`, a daily volatility of 2.074% — almost identical to GARCH's 2.083% at one step.

The models diverge entirely at longer horizons. Because EWMA has unit persistence its multi-step forecast is flat — whatever today's variance is, that is the forecast forever — while GARCH mean-reverts. At the 60-day horizon above, GARCH forecasts 22.5% annualised while EWMA would still say 32.9%.

<table>
  <tbody>
    <tr><td><strong>Method</strong></td><td><strong>Weighting</strong></td><td><strong>Mean reversion</strong></td><td><strong>Best used for</strong></td></tr>
    <tr><td>Rolling std dev</td><td>Equal over n periods</td><td>None; window echo artifacts</td><td>Reporting, simple risk limits</td></tr>
    <tr><td>EWMA</td><td>Geometric, one parameter</td><td>None (persistence exactly 1)</td><td>Short-horizon risk, no fitting</td></tr>
    <tr><td>GARCH(1,1)</td><td>Geometric plus a constant anchor</td><td>Toward a long-run level</td><td>Multi-horizon and option work</td></tr>
  </tbody>
</table>

> info **Typical estimated persistence** Fitted daily equity GARCH models routinely produce `alpha + beta` close to but below 1, with `beta` far larger than `alpha`: variance is highly persistent and each individual return is weak evidence about it. A fitted `alpha + beta` at or above 1 indicates a misspecified model, often an unmodelled structural break in the sample.

---

#### Extensions Worth Knowing

- **GJR-GARCH and EGARCH** add a leverage term so negative returns raise variance more than positive ones of the same size. This asymmetry is a robust feature of equity index data and matters for any downside risk measure. See [VaR & CVaR](/quant-math/var-cvar).
- **Student-t innovations and GARCH-in-mean.** Standard GARCH assumes normal shocks, but residuals from a fitted model remain heavy-tailed, so a t-distribution gives better tail quantiles without changing the variance dynamics. GARCH-in-mean instead puts the conditional variance into the return equation, modelling a time-varying risk premium.
- **Multivariate GARCH (DCC).** Extends the idea to a time-varying correlation matrix. Parameter counts explode with dimension, so restricted forms dominate. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).

---

#### In Practice Across Asset Classes

**Equities and futures.** Index returns show strong clustering and clear asymmetry, so an asymmetric variant is usually preferred; overnight gaps are a decision point, since including them raises measured variance and changes the fit. On futures the model is fitted to a continuous series stitched across rolls, and roll dates create artificial return spikes that GARCH reads as genuine volatility shocks unless the stitching is careful.

**Fixed income, FX and credit.** Yield volatility is regime-dependent and driven by policy meetings, so a single GARCH across a policy transition averages two distinct regimes and scheduled-event dummies help materially. In FX the clustering is present and the leverage asymmetry generally is not, since "down" is not well-defined for a pair without choosing a side; pegged regimes produce near-zero variance followed by a jump, which no GARCH specification handles. Credit spread volatility clusters strongly, but stale marks on illiquid names create artificial serial correlation that contaminates the estimate, so de-smoothing before fitting is common.

**On-chain.** Crypto returns show the clustering pattern clearly, typically with very high persistence and much fatter tails than equities, so heavy-tailed innovations are close to essential. Perpetual funding rates and liquidation cascades introduce feedback that a linear variance recursion cannot capture. See [Leverage & Liquidation](/risk/leverage-liquidation).

---

#### Assumptions and Failure Modes

- **Symmetric response in plain GARCH.** The basic model treats a `-3%` day identically to a `+3%` day; for equities this is materially wrong, so use an asymmetric variant.
- **Constant parameters.** `omega`, `alpha`, and `beta` are assumed fixed across the sample. A structural break makes the estimated persistence approach 1 spuriously, and the implied long-run variance becomes meaningless.
- **Normal innovations understate tails.** Even after conditioning on GARCH variance, standardised residuals remain heavy-tailed, so VaR from a normal GARCH is breached more often than its nominal level.
- **Jumps are not volatility.** A single discontinuous repricing is absorbed as a variance shock and then decays over the half-life, forecasting elevated volatility that may never materialise. See [Jumps](/quant-math/jumps).
- **The mean equation is assumed trivial.** If the mean is misspecified, its error enters the squared residuals and distorts the variance parameters. Estimation also needs long samples — on the order of a thousand observations — so on six months of daily data the parameters are barely identified.
- **Forecasts are of variance, not of returns.** A high variance forecast says nothing about direction; using it as a signal rather than as a sizing input confuses the two.

---

#### Code

```python
import numpy as np
from arch import arch_model


def fit_garch(returns_pct, asymmetric=False, dist="t"):
    """Fit GARCH(1,1), or GJR-GARCH when asymmetric.
    The `arch` package expects returns in percent, not decimals —
    scaling matters because omega is not scale-free.
    """
    return arch_model(
        returns_pct.dropna(), vol="GARCH", p=1, o=int(asymmetric), q=1, dist=dist
    ).fit(disp="off")


def variance_term_structure(omega, alpha, beta, current_variance, horizons):
    """Multi-step variance forecasts plus the average variance to each
    horizon. The average, not the endpoint, is what an option over
    that horizon is exposed to.
    """
    persistence = alpha + beta
    long_run = omega / (1 - persistence)
    decay = persistence ** np.arange(max(horizons))
    path = long_run + decay * (current_variance - long_run)
    return {h: {"spot": path[h - 1], "average": path[:h].mean()} for h in horizons}


def ewma_variance(returns, lam=0.94):
    """RiskMetrics EWMA: GARCH(1,1) with persistence pinned at 1."""
    squared = np.asarray(returns, float) ** 2
    out = np.empty_like(squared)
    out[0] = squared[:20].mean()
    for t in range(1, squared.size):
        out[t] = lam * out[t - 1] + (1 - lam) * squared[t - 1]
    return out
```

---

#### See Also

* [ARIMA Models](/stat-methods/arima)
* [Bootstrap](/stat-methods/bootstrap)
* [Volatility](/quant-math/volatility)
* [VaR & CVaR](/quant-math/var-cvar)

---

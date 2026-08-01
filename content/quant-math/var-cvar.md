### VaR & CVaR

> info **Metadata** Level: Advanced | Prerequisites: Expectation & Variance, Sampling, Drawdown | Tags: risk, tails, var, cvar, loss-distribution

**Value at Risk (VaR)** is a quantile of the loss distribution: the loss that will not be exceeded with a stated probability over a stated horizon. **Conditional Value at Risk (CVaR)**, also called expected shortfall, is the average loss in the cases where that threshold *is* exceeded. VaR marks where the tail begins; CVaR describes what is in it.

The pair are the standard language of regulatory capital, margin models, and internal risk limits, and both are estimated from exactly the part of the data that is scarcest. A 99% one-day VaR is a statement about roughly two or three days per year. Every serious criticism of these measures traces back to that: they are precise statements about a region where the data is thin, the model matters most, and independence has usually broken down.

---

#### Formal Definition

Let `L` be the loss over the horizon, defined as a positive number. At confidence level `alpha`:

```text
VaR_alpha  = the smallest value x such that P(L <= x) >= alpha
CVaR_alpha = E[ L | L >= VaR_alpha ]
```

where:

- `alpha` is the confidence level, typically 0.95 or 0.99
- `1 - alpha` is the exceedance probability
- `CVaR_alpha` is always at least `VaR_alpha`

Under a normal loss distribution with mean zero and standard deviation `sigma`:

```text
VaR_alpha  = z_alpha * sigma
CVaR_alpha = (phi(z_alpha) / (1 - alpha)) * sigma
```

where `z_alpha` is the standard normal quantile and `phi` its density. For `alpha = 0.95`, `z = 1.645` and `phi(z) = 0.1031`; for `alpha = 0.99`, `z = 2.326` and `phi(z) = 0.0267`.

**Horizon scaling**, valid only under serial independence:

```text
VaR(h days) = VaR(1 day) * sqrt(h)
```

**Coherence.** CVaR is a coherent risk measure: it is monotone, positively homogeneous, translation-invariant, and — crucially — **subadditive**, so combining two portfolios can never increase it. VaR is not subadditive in general. There exist portfolios whose combined VaR exceeds the sum of their individual VaRs, which means a VaR-based limit can penalise diversification. This is the strongest theoretical argument for reporting CVaR alongside it.

---

#### Worked Example

**Parametric.** A portfolio worth £1,000,000 has an estimated daily return standard deviation of `1.2%`. Assume a zero mean over one day.

1. **95% VaR**: `1.645 * 1.2% = 1.974%`, or `£19,738`
2. **95% CVaR**: `(0.1031 / 0.05) * 1.2% = 2.063 * 1.2% = 2.475%`, or `£24,753`
3. **99% VaR**: `2.326 * 1.2% = 2.792%`, or `£27,916`
4. **99% CVaR**: `(0.0267 / 0.01) * 1.2% = 2.665 * 1.2% = 3.198%`, or `£31,983`
5. **10-day 99% VaR**: `£27,916 * sqrt(10) = £88,279`

Note the ratio of CVaR to VaR: `1.25` at 95% and `1.15` at 99%. Under a normal distribution, expected shortfall is only slightly worse than the quantile. Under a realistic fat-tailed distribution the ratio is considerably higher, and the gap between the two is a rough measure of how badly the normal assumption is failing.

**Historical.** The same portfolio's last 20 daily returns, in per cent, sorted from worst to best:

<table>
  <tbody>
    <tr>
      <td><strong>Rank</strong></td>
      <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td>
    </tr>
    <tr>
      <td><strong>Return (%)</strong></td>
      <td>-5.8</td><td>-4.6</td><td>-3.1</td><td>-2.7</td><td>-2.2</td><td>-1.9</td><td>-1.4</td><td>-0.8</td><td>-0.6</td><td>-0.2</td>
    </tr>
    <tr>
      <td><strong>Rank</strong></td>
      <td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td>
    </tr>
    <tr>
      <td><strong>Return (%)</strong></td>
      <td>0.1</td><td>0.4</td><td>0.9</td><td>1.1</td><td>1.3</td><td>1.7</td><td>2.0</td><td>2.3</td><td>2.8</td><td>3.2</td>
    </tr>
  </tbody>
</table>

At 90% confidence, the worst 10% of 20 observations is the worst 2.

1. **Historical 90% VaR**: the second-worst return, `-4.6%`, so a loss of `£46,000`
2. **Historical 90% CVaR**: the mean of the worst two, `(-5.8 - 4.6)/2 = -5.2%`, so `£52,000`
3. **Parametric comparison**: this sample's standard deviation is `2.455%`, and `z_0.90 = 1.282`, giving a parametric 90% VaR of `3.15%` — about a third smaller than the historical figure

The historical estimate is larger because the sample contains two losses far outside what a normal distribution of this width would produce. That is the fat tail, visible in twenty observations.

> warning **Two observations are not a tail estimate** The historical 90% VaR above is determined entirely by the second-worst of twenty days. Shift one observation and the number moves substantially. Tail estimates need either far more data or an explicit parametric tail model.

---

#### Three Ways to Estimate It

<table>
  <tbody>
    <tr>
      <td><strong>Method</strong></td>
      <td><strong>How</strong></td>
      <td><strong>Fails when</strong></td>
    </tr>
    <tr><td>Historical simulation</td><td>Re-price today's portfolio over past scenarios, take the quantile</td><td>The sample holds no episode like the one coming; the tail rests on a handful of days</td></tr>
    <tr><td>Parametric</td><td>Assume a distribution, estimate its parameters, read off the quantile</td><td>Returns are fat-tailed or the book holds options; normality understates the tail</td></tr>
    <tr><td>Monte Carlo</td><td>Simulate paths from a model, re-price fully, take the quantile</td><td>The model is wrong; tail simulation error falls only as one over root paths</td></tr>
  </tbody>
</table>

**Backtesting the model.** A 99% one-day VaR should be breached on about 1% of days — roughly 2.5 days in a 250-day year. Counting exceptions is the standard validation: far more than expected means the model understates risk; far fewer means it is wasting capital. Exceptions should also be *independent* over time. Clustered breaches indicate the model fails to track changing volatility, which is a more serious defect than the count being slightly off.

---

#### In Practice Across Asset Classes

- **Equities.** Historical simulation on a factor-mapped portfolio is standard. The main difficulty is that correlations rise in the scenarios that generate the tail, so a VaR calibrated on normal conditions understates a market-wide selloff. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Futures.** Exchange margin is effectively a VaR model with a defined horizon and confidence, so the risk measure is not just a report — it is a cash obligation. Margin models are procyclical: they demand more collateral after volatility rises, forcing deleveraging into a falling market. See [Leverage & Liquidation](/risk/leverage-liquidation).
- **Fixed income.** VaR is computed on yield-curve factor shocks and mapped to price through duration and convexity. A duration-only mapping is linear and misses convexity, which matters for large shocks and for anything with embedded optionality. See [Duration & Convexity](/markets/duration-convexity).
- **FX.** Carry portfolios have low VaR most of the time and a severely negatively skewed loss distribution, so the gap between CVaR and VaR is the informative statistic. Pegged currencies are the hardest case: measured volatility is near zero right up to a discontinuous repricing.
- **Credit.** The loss distribution is highly asymmetric and driven by default correlation rather than by spread volatility. VaR from spread moves alone misses jump-to-default entirely, which is the dominant risk for a concentrated book. See [Default Probability](/credit/default-probability).
- **Options.** Delta-based VaR is invalid for any material gamma. Full revaluation across scenarios is required, and the loss surface is not monotone in the underlying — the worst case may be a moderate move, not an extreme one. See [Greeks](/derivatives/greeks).
- **On-chain.** Losses are not confined to price. Liquidation cascades, oracle deviations, and contract failures produce loss modes with no historical analogue in the price series, so scenario analysis carries more weight than any quantile estimated from returns. See [Oracle Manipulation](/risk/oracle-manipulation).

---

#### Assumptions and Failure Modes

- **VaR says nothing about the size of the loss beyond it.** Two portfolios can share a VaR while one has a bounded tail and the other unbounded. This is what CVaR exists to fix, and the reason it is preferred in modern frameworks.
- **VaR is not subadditive.** A limit framework built on VaR alone can penalise a genuinely diversifying trade and reward a concentrating one.
- **Normality understates tails.** Financial returns have far more mass in the extremes than a normal distribution allows. The error grows with the confidence level, so parametric VaR is least reliable exactly where it is most used.
- **Historical simulation cannot see beyond its sample.** It assigns zero probability to anything that has not happened in the window, and the events that matter are precisely those.
- **The `sqrt(h)` scaling assumes independence.** Losses cluster. Ten-day risk scaled from one-day risk understates a sustained decline.
- **Estimated on liquidatable positions.** VaR implicitly assumes the portfolio can be exited at marked prices. In stress, liquidity vanishes and the realised loss includes market impact the model never held. See [Market Impact](/execution/market-impact).
- **Static portfolio assumption.** The measure holds the position fixed over the horizon, while in reality forced deleveraging, hedging, and margin calls all change it — usually in the direction that increases the loss.
- **Optimising against a VaR limit shifts risk into the tail.** A portfolio built to minimise VaR can be constructed to hold losses just inside the quantile while making the region beyond it far worse. The measure is then being gamed rather than used.

> warning **A risk number is a model output, not a measurement** VaR and CVaR are conditional on a distribution, a horizon, a window, and an assumption of tradability. Report those alongside the number, or it cannot be interpreted.

---

#### Code

```python
import numpy as np
from scipy import stats

def historical_var_cvar(returns, confidence=0.95):
    """Empirical VaR and CVaR from a return sample. Both returned as positive losses."""
    losses = -np.asarray(returns, dtype=float)
    var = np.quantile(losses, confidence)
    tail = losses[losses >= var]
    # An empty tail means the sample is too short for this confidence level.
    cvar = tail.mean() if tail.size else var
    return var, cvar


def parametric_var_cvar(sigma, confidence=0.95, mu=0.0):
    """Normal-assumption VaR and CVaR. Understates fat-tailed losses; use as a floor."""
    z = stats.norm.ppf(confidence)
    var = -mu + z * sigma
    cvar = -mu + sigma * stats.norm.pdf(z) / (1 - confidence)
    return var, cvar


def count_exceptions(returns, var_series):
    """VaR backtest: breaches should match 1 - confidence AND not cluster in time."""
    losses = -np.asarray(returns, dtype=float)
    return int((losses > np.asarray(var_series, dtype=float)).sum())
```

---

#### See Also

* [Drawdown](/quant-math/drawdown)
* [Volatility](/quant-math/volatility)
* [Sortino Ratio](/quant-math/sortino)
* [Jump Processes](/quant-math/jumps)
* [Scenarios](/simulation/scenarios)
* [Risk Types](/risk/types)
* [GARCH](/stat-methods/garch)

---

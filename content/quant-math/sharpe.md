### Sharpe Ratio

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility | Tags: performance, sharpe, risk-adjusted-return, benchmarking

The Sharpe ratio measures excess return per unit of volatility. It asks a single question: for every unit of risk this strategy took, how much return above a risk-free alternative did it deliver? A strategy returning 30% with wild swings may be worse, by this measure, than one returning 12% steadily.

It is the closest thing markets have to a universal comparator. An equity long/short book, a managed futures programme, an FX carry basket, and a liquidity position on a decentralised exchange all report Sharpe ratios — which is precisely why it is so often quoted without the caveats that make it meaningful.

---

#### Formal Definition

The Sharpe ratio of a strategy with returns `R` is:

```text
S = (E[R] - Rf) / sigma(R)
```

where:

- `E[R]` is the expected (mean) return of the strategy
- `Rf` is the risk-free rate over the same period
- `sigma(R)` is the standard deviation of the strategy's returns

The numerator `E[R] - Rf` is the **excess return**: what you earned for taking risk, over what you could have earned taking none. The denominator is the volatility of those returns.

In practice you estimate this from a sample of `n` historical returns:

```text
S_hat = (mean(R) - Rf) / stdev(R)
```

**Annualisation.** Sharpe ratios are conventionally quoted per annum, so a ratio computed from higher-frequency returns is scaled up:

```text
S_annual = S_period * sqrt(periods_per_year)
```

With 252 trading days in a year, a daily Sharpe of 0.1 annualises to `0.1 * sqrt(252) = 1.59`.

> warning **The square-root rule is an assumption, not an identity** Scaling by `sqrt(T)` is valid only when returns are serially uncorrelated. Positive autocorrelation makes true annualised volatility larger than the scaled estimate, which inflates the reported Sharpe.

---

#### Worked Example

A strategy produces these monthly returns over one year, against a risk-free rate of 4% annually (about 0.33% per month):

<table>
  <tbody>
    <tr>
      <td><strong>Month</strong></td>
      <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>
      <td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td>
    </tr>
    <tr>
      <td><strong>Return (%)</strong></td>
      <td>2.1</td><td>-1.4</td><td>3.0</td><td>0.8</td><td>-0.6</td><td>1.9</td>
      <td>2.4</td><td>-2.2</td><td>1.1</td><td>0.4</td><td>1.7</td><td>-0.9</td>
    </tr>
  </tbody>
</table>

Step by step:

1. **Mean monthly return**: the twelve values sum to 8.3%, so `mean(R) = 8.3 / 12 = 0.69%`
2. **Monthly excess return**: `0.69% - 0.33% = 0.36%`
3. **Monthly standard deviation** (sample, `ddof=1`): `stdev(R) = 1.65%`
4. **Monthly Sharpe**: `0.36 / 1.65 = 0.219`
5. **Annualised**: `0.219 * sqrt(12) = 0.76`

A Sharpe of 0.76 is respectable but unremarkable — the strategy earned about three-quarters of a unit of excess return per unit of volatility.

Now note how little twelve data points actually establish. Using the standard error below, the monthly estimate carries a standard error of about 0.29, which annualises to roughly 1.0. A one-standard-error band around 0.76 therefore comfortably contains zero. On this sample you cannot distinguish this strategy from one with no edge at all — which is the single most important lesson on this page.

---

#### Reading the Number

Rough conventions, which vary by asset class and horizon:

<table>
  <tbody>
    <tr>
      <td><strong>Sharpe</strong></td>
      <td><strong>Interpretation</strong></td>
    </tr>
    <tr>
      <td>Below 0</td>
      <td>Underperformed the risk-free rate. Risk was not compensated.</td>
    </tr>
    <tr>
      <td>0 to 0.5</td>
      <td>Weak. Common for long-only equity exposure over many periods.</td>
    </tr>
    <tr>
      <td>0.5 to 1.0</td>
      <td>Reasonable. Typical of a decent diversified portfolio.</td>
    </tr>
    <tr>
      <td>1.0 to 2.0</td>
      <td>Good. A common target for a systematic strategy.</td>
    </tr>
    <tr>
      <td>Above 2.0</td>
      <td>Excellent — and worth auditing hard for overfitting, short samples, or hidden tail risk.</td>
    </tr>
  </tbody>
</table>

---

#### In Practice Across Asset Classes

The formula is constant; the conventions around it are not.

**Equities.** Usually computed from daily returns and annualised with `sqrt(252)`. The benchmark question matters: a long-only equity strategy's Sharpe largely reflects market beta, so practitioners often examine the Sharpe of returns *in excess of a benchmark* (the information ratio) rather than of the risk-free rate.

**Futures and managed futures.** Computed on a continuous series stitched across contract rolls. The roll methodology directly affects the return series and therefore the Sharpe — back-adjusted and ratio-adjusted series can produce visibly different numbers for the same strategy.

**Fixed income.** Returns are strongly driven by duration, and volatility is regime-dependent. Sharpe ratios computed across a rate-cutting cycle can look excellent for reasons that will not repeat.

**FX.** Carry strategies show attractive Sharpe ratios most of the time and severe negative skew during unwinds. Sharpe rewards the calm periods and says nothing about the shape of the loss.

**Credit.** Returns are smoothed by infrequent marks on illiquid instruments, which suppresses measured volatility and inflates Sharpe. This is a measurement artifact, not an edge.

**On-chain strategies.** Liquidity provision, funding capture, and basis trades are typically evaluated over short samples in a market with few complete cycles, so the estimation-error problem above is at its most severe.

---

#### Assumptions and Failure Modes

Sharpe is a two-moment statistic. Everything it cannot see is a way it can mislead you.

- **Volatility as a proxy for risk.** Sharpe treats upside and downside deviation identically. A strategy with large positive surprises is penalised exactly as one with large losses. [Sortino Ratio](/quant-math/sortino) addresses this asymmetry.
- **Ignores skew and kurtosis.** Selling options or insurance produces small steady gains and rare severe losses — a profile Sharpe flatters right up until the loss arrives.
- **Assumes serial independence.** Autocorrelated returns break the `sqrt(T)` annualisation. Smoothed or stale marks are the usual culprit.
- **Sensitive to sample length.** Sharpe estimated over a short window is a noisy statistic, and its standard error falls only as `1/sqrt(n)`.
- **Vulnerable to selection bias.** Testing many strategies and reporting the best Sharpe guarantees an inflated number, whether or not any edge exists. See [Backtest vs Live](/risk/backtest-vs-live).
- **Depends on the risk-free rate chosen.** In a high-rate environment the choice of `Rf` materially changes the result, and comparisons across eras become unreliable.

> warning **A high Sharpe on a short sample is a hypothesis, not a result** The shorter the sample and the more variants tested, the more a strong Sharpe reflects search effort rather than edge.

---

#### Code

```python
import numpy as np

def sharpe_ratio(returns, risk_free_rate=0.0, periods_per_year=252):
    """Annualised Sharpe ratio from a series of periodic returns.

    risk_free_rate is expressed per period, matching `returns`.
    """
    excess = np.asarray(returns) - risk_free_rate
    if excess.std(ddof=1) == 0:
        return np.nan
    return excess.mean() / excess.std(ddof=1) * np.sqrt(periods_per_year)


# Report this alongside the ratio. Valid for IID returns;
# treat as a lower bound when returns autocorrelate.
def sharpe_standard_error(sharpe, n_periods):
    return np.sqrt((1 + 0.5 * sharpe**2) / n_periods)
```

```typescript
const sharpeRatio = (
  returns: number[],
  riskFreeRate = 0,
  periodsPerYear = 252,
): number => {
  const excess = returns.map((r) => r - riskFreeRate);
  const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
  const variance =
    excess.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (excess.length - 1);
  return (mean / Math.sqrt(variance)) * Math.sqrt(periodsPerYear);
};
```

> info **Report the uncertainty** Quoting a Sharpe ratio without its sample length is like quoting a poll without its margin of error.

---

#### See Also

* [Sortino Ratio](/quant-math/sortino)
* [Drawdown](/quant-math/drawdown)
* [VaR & CVaR](/quant-math/var-cvar)
* [Volatility](/quant-math/volatility)
* [Backtest vs Live](/risk/backtest-vs-live)

---

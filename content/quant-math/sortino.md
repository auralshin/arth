### Sortino Ratio

> info **Metadata** Level: Intermediate | Prerequisites: Sharpe Ratio, Returns | Tags: performance, downside-risk, sortino, risk-adjusted-return

The Sortino ratio divides excess return by **downside deviation** rather than by total volatility. The argument for it is straightforward: the Sharpe ratio penalises a `+8%` month exactly as heavily as a `-8%` month, and no investor experiences those identically. Sortino counts only the deviations that hurt.

It is a genuine improvement over Sharpe for asymmetric return profiles, and it is also more fragile. It requires a target return to be chosen, it admits at least two defensible denominators that give materially different answers, and it discards most of the sample — so the same amount of data produces a much noisier estimate. A Sortino ratio quoted without its conventions attached is not comparable to anything.

---

#### Formal Definition

```text
Sortino = (E[R] - MAR) / DD
```

where:

- `E[R]` is the mean return over the period
- `MAR` is the **minimum acceptable return**, the threshold below which returns count as bad
- `DD` is the **downside deviation**

Downside deviation is the root mean square of shortfalls below the target:

```text
DD = sqrt( sum over t of  min(R_t - MAR, 0)^2  /  n )
```

The choice of `n` in that denominator is the contested part. Two conventions are in use:

- **Divide by the full sample size `n`.** Returns above the target contribute zero. This is the more common convention and the one originally proposed.
- **Divide by the count of downside observations only.** This measures the average severity of a bad period, conditional on it being bad, and produces a much larger denominator and a much smaller ratio.

Annualisation follows the same square-root convention as Sharpe, with the same caveat:

```text
Sortino_annual = Sortino_period * sqrt(periods_per_year)
```

> warning **Two conventions, two very different numbers** On the example below, dividing by the full sample gives an annualised Sortino of 1.26; dividing by the count of losing months gives 0.73 on identical data. Always state which was used.

---

#### Worked Example

Twelve monthly returns, in per cent, with `MAR = 0`:

<table>
  <tbody>
    <tr>
      <td><strong>Month</strong></td>
      <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>
      <td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td>
    </tr>
    <tr>
      <td><strong>Return (%)</strong></td>
      <td>3.2</td><td>-1.8</td><td>0.9</td><td>2.6</td><td>-4.1</td><td>1.4</td>
      <td>0.7</td><td>2.9</td><td>-2.3</td><td>1.1</td><td>3.5</td><td>-1.5</td>
    </tr>
  </tbody>
</table>

1. **Mean**: the twelve values sum to `6.6`, so `E[R] = 0.55%` per month
2. **Shortfalls** below zero: `-1.8, -4.1, -2.3, -1.5`. All other months contribute zero.
3. **Squared shortfalls**: `3.24 + 16.81 + 5.29 + 2.25 = 27.59`
4. **Downside deviation**: `sqrt(27.59 / 12) = sqrt(2.2992) = 1.516%`
5. **Monthly Sortino**: `0.55 / 1.516 = 0.363`
6. **Annualised**: `0.363 * sqrt(12) = 1.26`

For comparison, the total sample standard deviation is `2.451%`, so the monthly Sharpe against the same zero threshold is `0.55 / 2.451 = 0.224`, annualising to `0.78`.

Sortino is 1.6 times the Sharpe here, and the reason is visible in the data: the three largest absolute moves in the series are `+3.5`, `+3.2` and `-4.1`. Two of the three are gains, and they inflate the Sharpe denominator while contributing nothing to the Sortino one.

**Changing the target changes the answer twice over.** Set `MAR = 0.33%` per month, the monthly equivalent of a 4% annual risk-free rate. The numerator falls to `0.22%`, four shortfalls grow to `-2.13, -4.43, -2.63, -1.83`, their squares sum to `34.43`, and the downside deviation rises to `1.694%`. The monthly Sortino becomes `0.22 / 1.694 = 0.130`, annualising to `0.45`.

<table>
  <tbody>
    <tr>
      <td><strong>Convention</strong></td>
      <td><strong>Annualised Sortino</strong></td>
    </tr>
    <tr><td>MAR = 0, divide by n = 12</td><td>1.26</td></tr>
    <tr><td>MAR = 0, divide by 4 losing months</td><td>0.73</td></tr>
    <tr><td>MAR = 0.33%, divide by n = 12</td><td>0.45</td></tr>
    <tr><td>MAR = 0.33%, divide by 4 losing months</td><td>0.26</td></tr>
  </tbody>
</table>

Four defensible sets of conventions produce numbers spanning a factor of nearly five, from identical returns. This is the central practical fact about the Sortino ratio.

---

#### When Sortino and Sharpe Disagree

The two ratios rank strategies differently only when returns are asymmetric. What that asymmetry means depends on its source:

- **Genuine positive skew.** Trend-following and long-option profiles produce many small losses and occasional large gains. Sharpe penalises the large gains; Sortino does not. Here Sortino is the more informative measure.
- **Genuine negative skew.** Option selling, carry, and levered credit produce steady small gains and rare large losses. Both ratios flatter these strategies while the tail has not yet arrived, and Sortino flatters them *more* than Sharpe during the calm phase, because there are so few downside observations to populate the denominator.
- **Artificial smoothness.** Illiquid or model-marked positions produce a return series with suppressed downside deviation. Sortino is more sensitive to this distortion than Sharpe, because a handful of suppressed losses can shrink the denominator sharply.

The second and third cases are exactly where a high Sortino ratio should increase your suspicion rather than your confidence.

---

#### In Practice Across Asset Classes

- **Equities.** Long-only equity returns are mildly negatively skewed, so Sortino is usually modestly below Sharpe. The comparison is more informative for hedged or option-overlay strategies where the asymmetry is deliberate.
- **Futures and managed futures.** Trend-following is the clearest case for Sortino. Its return profile has positive skew by construction, and Sharpe systematically understates it by charging for upside dispersion.
- **FX.** Carry has strong negative skew, so Sortino overstates it during calm periods more than Sharpe does. For carry strategies a tail measure is more informative than either. See [FX Carry & Parity](/markets/fx-carry-parity).
- **Fixed income.** The natural `MAR` is the risk-free rate or a duration-matched benchmark rather than zero, since a zero threshold treats the entire term premium as excess return.
- **Credit.** The return profile is close to that of a short put — small positive carry, occasional severe loss. Sortino computed over a period without defaults is close to meaningless, because the downside observations that define the ratio are absent from the sample. See [Credit 101](/credit/credit-101).
- **Derivatives.** For an option-selling book the downside sample is precisely the part that is missing until it is not. Sortino is at its least reliable exactly where the payoff is most asymmetric. See [Options 101](/derivatives/options-101).
- **On-chain.** Liquidity-provision returns are structurally asymmetric: fee income is small and steady, inventory loss is convex in price moves. Sortino captures that shape better than Sharpe, but the samples are usually too short for either denominator to be well estimated.

---

#### Assumptions and Failure Modes

- **The target is a free parameter.** Zero, the risk-free rate, and a benchmark return all give different answers, and none is canonically correct. Report the target.
- **The denominator convention is a free parameter.** As the worked example shows, this alone can change the ratio by a factor of nearly two.
- **The estimate is noisier than Sharpe.** Only observations below the target inform the denominator. Twelve months with four losing months gives four numbers to estimate downside risk from.
- **Sensitive to a single bad period.** Squaring shortfalls means one severe loss can dominate the denominator. Remove it and the ratio changes dramatically — which is a reason to report the sensitivity, not to remove the observation.
- **Still blind to path.** Like Sharpe, Sortino is a two-moment summary of a distribution. It cannot distinguish four scattered small losses from one continuous decline of the same total size. See [Drawdown](/quant-math/drawdown).
- **Annualisation assumes serial independence.** The `sqrt(T)` scaling breaks under autocorrelation, and smoothed returns are the usual cause.
- **Selection bias still applies.** Choosing Sortino over Sharpe after seeing which one looks better is the same overfitting problem in a different guise. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### Code

```python
import numpy as np

def downside_deviation(returns, target=0.0, full_sample=True):
    """Root mean square shortfall below a target return.

    full_sample=True divides by n (the standard convention);
    False divides by the count of downside observations only.
    """
    r = np.asarray(returns, dtype=float)
    shortfall = np.minimum(r - target, 0.0)
    n = len(r) if full_sample else max((shortfall < 0).sum(), 1)
    return np.sqrt((shortfall**2).sum() / n)


def sortino_ratio(returns, target=0.0, periods_per_year=12, full_sample=True):
    """Annualised Sortino ratio. Target is expressed per period."""
    r = np.asarray(returns, dtype=float)
    dd = downside_deviation(r, target, full_sample)
    if dd == 0:
        return np.nan  # no downside in sample: the ratio is undefined, not infinite
    return (r.mean() - target) / dd * np.sqrt(periods_per_year)
```

---

#### See Also

* [Sharpe Ratio](/quant-math/sharpe)
* [Drawdown](/quant-math/drawdown)
* [VaR & CVaR](/quant-math/var-cvar)
* [Returns](/quant-math/returns)
* [Volatility](/quant-math/volatility)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Simulation Metrics](/simulation/metrics)

---

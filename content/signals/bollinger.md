### Bollinger Bands

> info **Metadata** Level: Intermediate | Prerequisites: Moving Averages, Volatility | Tags: signals, bollinger, volatility, bands, z-score, mean-reversion

**Bollinger Bands** wrap a moving average in an envelope whose width is proportional to recent volatility. When price has been calm the bands sit close to the average; when it has been turbulent they widen. Developed by John Bollinger in the 1980s, the construction turns a single price into a *relative* location: not "the price is 115" but "the price is near the top of its recent range, given how much it has been moving".

That normalisation is the reason the indicator has outlived most of its contemporaries. Underneath the chart-package presentation, a Bollinger Band is a rolling z-score of price — the same standardisation used throughout quantitative research, drawn as two lines. Whether touching a band predicts anything is a separate matter, and the honest answer is that it depends entirely on whether the instrument is trending, which the bands themselves do not tell you.

---

#### Formal Definition

Given a lookback of `n` periods and a width multiplier `k`:

```text
Middle_t = SMA_n(t) = (1/n) * sum_{i=0}^{n-1} P_{t-i}
sigma_t  = sqrt( (1/n) * sum_{i=0}^{n-1} (P_{t-i} - Middle_t)^2 )
Upper_t  = Middle_t + k * sigma_t
Lower_t  = Middle_t - k * sigma_t
```

where:

- `P_t` is the price at time `t`, conventionally the close
- `n` is the lookback window, conventionally 20
- `sigma_t` is the standard deviation of price *levels* over that window
- `k` is the band multiplier, conventionally 2

Two derived quantities are more useful than the bands themselves for systematic work.

**Percent B** locates price within the envelope:

```text
%b_t = (P_t - Lower_t) / (Upper_t - Lower_t)
```

`%b` is 0 at the lower band, 0.5 at the middle, 1 at the upper band, and unbounded outside. It is simply the rolling z-score rescaled: `%b = 0.5 + z / (2k)` where `z = (P - Middle) / sigma`.

**Bandwidth** measures how wide the envelope is relative to price:

```text
Bandwidth_t = (Upper_t - Lower_t) / Middle_t = 2 * k * sigma_t / Middle_t
```

Bandwidth is a normalised volatility estimate, comparable across instruments and price levels in a way that the bands themselves are not.

> warning **Population or sample standard deviation?** Bollinger's original definition divides the sum of squared deviations by `n`, not by `n - 1`. Many libraries — including pandas `rolling().std()`, which defaults to `ddof=1` — use the sample version. At `n = 20` the two differ by a factor of about 2.6%, which shifts each band by roughly the same fraction. Small, but enough to change whether a touch registers. Check which your implementation uses before comparing against a chart.

Note also that `sigma` here is the standard deviation of *prices*, not of *returns*. It has price units and scales with the price level, which is why the raw band width is not comparable across assets. The [Volatility](/quant-math/volatility) page covers the return-based measure that is.

---

#### Worked Example

Using `n = 5` and `k = 2` for legibility; the standard is `n = 20`. Ten daily closes, evaluated at day 10:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
    <tr><td><strong>Close</strong></td><td>100</td><td>102</td><td>101</td><td>105</td><td>107</td><td>106</td><td>110</td><td>112</td><td>111</td><td>115</td></tr>
  </tbody>
</table>

The five-day window at day 10 is `[106, 110, 112, 111, 115]`.

1. **Middle band**: `(106 + 110 + 112 + 111 + 115) / 5 = 554 / 5 = 110.8`
2. **Deviations from the mean**: `-4.8, -0.8, +1.2, +0.2, +4.2`
3. **Squared deviations**: `23.04, 0.64, 1.44, 0.04, 17.64`, summing to `42.8`
4. **Population standard deviation**: `sqrt(42.8 / 5) = sqrt(8.56) = 2.9257`
5. **Upper band**: `110.8 + 2 * 2.9257 = 116.65`
6. **Lower band**: `110.8 - 2 * 2.9257 = 104.95`

**Percent B** at the day-10 close of 115:

```text
%b = (115 - 104.95) / (116.65 - 104.95) = 10.05 / 11.70 = 0.859
```

**Bandwidth**:

```text
Bandwidth = 11.70 / 110.8 = 0.1056 = 10.56%
```

**Now the convention check.** Using the sample standard deviation instead, `sqrt(42.8 / 4) = 3.2711`, and the bands become `104.26` and `117.34`. The envelope is about 12% wider. Price at 115 gives `%b = 0.821` under this convention against `0.859` under the other. A rule triggering at `%b = 0.85` fires on one and not the other, from the same data on the same bar. Neither is a mistake; they are different definitions, and any threshold rule needs to know which it was calibrated on.

The reading itself is worth pausing on. At `%b = 0.859` price sits high in its band without having touched it, during a clean uptrend. A rule that shorts near the upper band would be shorting an advancing market — the standard way Bollinger mean-reversion rules fail.

---

#### Interpretation

Bollinger himself was explicit that the bands are a *relative framework*, not a signal generator. Three uses appear most often:

- **Relative position.** `%b` near 1 means price is high relative to its own recent range; near 0, low. This is a description, not a forecast. In a trend, price can ride the upper band for many bars — Bollinger called this "walking the band".
- **Squeeze.** A bandwidth reading at a multi-month low indicates unusually compressed volatility. Because volatility clusters, low-volatility periods do tend to be followed by higher-volatility periods. Crucially, this says nothing about *direction* — a squeeze is a volatility forecast, not a price forecast. See [GARCH](/stat-methods/garch).
- **Band-touch mean reversion.** Buying at the lower band and selling at the upper is the classic rule. It profits in range-bound conditions and loses steadily in trending ones, because the band moves with price and a trending market simply drags the whole envelope along.

<table>
  <tbody>
    <tr><td><strong>Reading</strong></td><td><strong>Describes</strong></td><td><strong>Common misreading</strong></td></tr>
    <tr><td>%b above 1</td><td>Close outside the upper band</td><td>"Overbought." In a trend it means the trend is strong.</td></tr>
    <tr><td>%b below 0</td><td>Close outside the lower band</td><td>"Oversold." Falling assets can keep falling.</td></tr>
    <tr><td>Bandwidth at a low</td><td>Compressed recent volatility</td><td>An imminent breakout in a knowable direction. It is not directional.</td></tr>
    <tr><td>Bandwidth at a high</td><td>Elevated recent volatility</td><td>That the move is over. Volatility clusters; it usually persists.</td></tr>
  </tbody>
</table>

The `k = 2` default is often justified by the claim that two standard deviations should contain about 95% of observations. That reasoning does not hold here. It assumes normally distributed, independent observations; price levels within a rolling window are strongly serially dependent, and financial returns have fat tails. The realised fraction of closes inside the bands is typically well below 95%, and varies by instrument.

---

#### In Practice Across Asset Classes

**Equities.** Overnight gaps enter the standard deviation as a single large deviation, which widens the bands abruptly and can push `%b` past 1 on the opening print alone. A meaningful share of daily variance in single names accrues outside trading hours, so bands on daily closes are partly measuring a risk you cannot trade through. Split and dividend adjustments must be applied, or the deviation series contains artificial jumps.

**Futures.** Bands on a continuous series inherit the [roll convention](/markets/roll-and-carry): back-adjustment shifts historical levels, changing both the mean and the deviations around it. Since the standard deviation is computed on levels, a ratio-adjusted series and a difference-adjusted series give different bandwidths for the same market.

**FX.** Bandwidth is the natural form because pairs trade at wildly different levels. Managed or pegged currencies produce long stretches of extremely low bandwidth, followed by a jump the bands cannot contain — the squeeze logic works, but the payoff arrives as a gap rather than a tradeable expansion.

**Fixed income.** Applied to yields more often than prices. Yield volatility is strongly regime-dependent around policy decisions, so bandwidth is dominated by the meeting calendar rather than by market dynamics.

**Crypto.** Continuous trading means every observation in the window reflects real trading with no gap contamination, which makes the rolling standard deviation a cleaner estimate than its equity equivalent. Two offsetting facts: baseline volatility is high enough that bandwidth readings from equities do not transfer, and thin weekend liquidity produces deviation spikes driven by book depth rather than information. See [Liquidity and Depth as Features](/signals/liquidity).

---

#### Assumptions and Failure Modes

- **Assumes price reverts to the average.** Nothing enforces this. In a trend the middle band follows price upward and the envelope travels with it, so "extreme" readings persist indefinitely.
- **The normal-distribution justification is wrong.** Fat tails and serial dependence mean `k = 2` does not correspond to any particular coverage probability. Treat `k` as a fitted parameter, not a statistical constant.
- **Standard deviation of levels, not returns.** The estimate scales with price and is not comparable across instruments. Use bandwidth or `%b` for anything cross-sectional.
- **Volatility estimated from the same window as the mean.** A single large move inflates `sigma` and simultaneously shifts the mean, widening the bands just when a signal would fire. The indicator partially disarms itself at extremes.
- **Population versus sample convention.** As computed above, the two produce different bands. Published rules rarely specify which they assume.
- **Two fitted parameters.** `n` and `k` interact — a longer window and a smaller multiplier can produce similar bands — so a parameter sweep has a broad plateau of near-equivalent settings and picking the peak is fitting. See [Parameter Sweeps](/simulation/param-sweeps).
- **Squeeze is not directional.** A compressed band predicts, at best, that volatility will rise. Any directional claim comes from a different model entirely.

---

#### Code

```python
import pandas as pd

def bollinger_bands(close: pd.Series, window: int = 20, num_std: float = 2.0,
                    population: bool = True) -> pd.DataFrame:
    """Bollinger Bands with %b and bandwidth.

    population=True matches Bollinger's original definition (divide by n).
    pandas defaults to ddof=1, which produces a wider envelope; at n=20
    the difference is about 2.6% of the band width. Enough to move a
    threshold rule, so make the choice explicit.
    """
    middle = close.rolling(window).mean()
    sigma = close.rolling(window).std(ddof=0 if population else 1)

    upper = middle + num_std * sigma
    lower = middle - num_std * sigma

    return pd.DataFrame(
        {
            "middle": middle,
            "upper": upper,
            "lower": lower,
            # %b: 0 at the lower band, 1 at the upper, unbounded outside.
            "percent_b": (close - lower) / (upper - lower),
            # Bandwidth is normalised by price, so it is comparable
            # across instruments in a way the raw bands are not.
            "bandwidth": (upper - lower) / middle,
        }
    )
```

---

#### See Also

* [Moving Averages](/signals/moving-averages)
* [ATR](/signals/atr)
* [Volatility](/quant-math/volatility)
* [GARCH](/stat-methods/garch)
* [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion)
* [Rolling Windows](/quant-math/rolling-windows)

---

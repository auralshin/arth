### Moving Average Convergence Divergence (MACD)

> info **Metadata** Level: Intermediate | Prerequisites: Moving Averages, MA Crossovers | Tags: signals, macd, ema, oscillator, trend, momentum

**Moving Average Convergence Divergence (MACD)** takes the difference between a fast and a slow exponential moving average, then smooths that difference again to produce a comparison line. The result is three related series — the MACD line, the signal line, and the histogram between them — that together describe whether a trend is strengthening or fading. Gerald Appel developed it in the late 1970s, and the default parameters 12, 26 and 9 have been copied unchanged into every charting platform since.

Structurally, MACD is a [crossover rule](/signals/ma-crossovers) with an extra smoothing stage. That extra stage is the point: comparing the raw spread against its own moving average filters out small oscillations that would otherwise generate signals. The cost is more lag, and MACD is best understood as sitting one step further along the smoothness-versus-timeliness trade-off than a plain crossover.

---

#### Formal Definition

MACD is built from three exponential moving averages. With fast period `n_f`, slow period `n_s`, and signal period `n_g`:

```text
MACD_t   = EMA(P, n_f)_t - EMA(P, n_s)_t
Signal_t = EMA(MACD, n_g)_t
Hist_t   = MACD_t - Signal_t
```

where:

- `P` is the price series, conventionally the close
- `EMA(x, n)` is the exponential moving average of `x` with `alpha = 2 / (n + 1)`
- `MACD_t` is the MACD line, the spread between the two price EMAs
- `Signal_t` is the signal line, an EMA *of the MACD line*, not of price
- `Hist_t` is the histogram, the gap between the two

Defaults are `n_f = 12`, `n_s = 26`, `n_g = 9`. These come from a pre-computer era of six-day trading weeks and carry no analytical justification.

Three properties follow directly from the definition:

- **MACD has the units of price.** A MACD of 2.5 on a €40 stock and on a €4,000 index are not comparable. Dividing by price or by the slow EMA gives a **percentage MACD**, which is comparable across instruments and across time.
- **The MACD line is a band-pass filter.** Subtracting a slow average removes low-frequency drift; the fast average has already removed high-frequency noise. What remains is intermediate-frequency movement.
- **The histogram is a second difference.** It approximates the rate of change of the MACD line, so a histogram crossing zero corresponds to a MACD/signal crossover, and a histogram peaking corresponds to the MACD line's slope beginning to flatten.

> warning **The signal line uses the standard EMA, not Wilder's** MACD uses `alpha = 2 / (n + 1)` throughout. This differs from the `alpha = 1 / n` used by [RSI](/signals/rsi) and [ATR](/signals/atr). Mixing the two conventions inside one indicator library is a common and silent bug. Seeding also varies: some implementations start each EMA from the first price, others from an SMA of the first `n` values, and pandas defaults to a renormalised weighting with no explicit seed. Early values differ accordingly.

---

#### Worked Example

Using MACD(3, 6, 3) so every number can be checked by hand; the mechanics are identical at 12/26/9. Ten daily closes:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
    <tr><td><strong>Close</strong></td><td>100</td><td>102</td><td>101</td><td>105</td><td>107</td><td>106</td><td>110</td><td>112</td><td>111</td><td>115</td></tr>
  </tbody>
</table>

**Step 1 — the fast EMA**, `n_f = 3`, so `alpha = 2/4 = 0.5`. Seed with the SMA of the first three closes, `(100 + 102 + 101) / 3 = 101.0`:

```text
Day 4:  101.000 + 0.5 * (105 - 101.000) = 103.000
Day 5:  103.000 + 0.5 * (107 - 103.000) = 105.000
Day 6:  105.000 + 0.5 * (106 - 105.000) = 105.500
Day 7:  105.500 + 0.5 * (110 - 105.500) = 107.750
Day 8:  107.750 + 0.5 * (112 - 107.750) = 109.875
Day 9:  109.875 + 0.5 * (111 - 109.875) = 110.438
Day 10: 110.438 + 0.5 * (115 - 110.438) = 112.719
```

**Step 2 — the slow EMA**, `n_s = 6`, so `alpha = 2/7 = 0.2857`. Seed with the SMA of the first six closes, `621 / 6 = 103.5`:

```text
Day 7:  103.500 + 0.2857 * (110 - 103.500) = 105.357
Day 8:  105.357 + 0.2857 * (112 - 105.357) = 107.255
Day 9:  107.255 + 0.2857 * (111 - 107.255) = 108.325
Day 10: 108.325 + 0.2857 * (115 - 108.325) = 110.232
```

**Step 3 — MACD line, signal line, histogram.** The signal is an EMA(3) of the MACD line, seeded with the SMA of its first three values: `(2.000 + 2.393 + 2.620) / 3 = 2.338`.

<table>
  <tbody>
    <tr>
      <td><strong>Day</strong></td>
      <td><strong>EMA(3)</strong></td>
      <td><strong>EMA(6)</strong></td>
      <td><strong>MACD</strong></td>
      <td><strong>Signal</strong></td>
      <td><strong>Histogram</strong></td>
    </tr>
    <tr><td>6</td><td>105.500</td><td>103.500</td><td>2.000</td><td>—</td><td>—</td></tr>
    <tr><td>7</td><td>107.750</td><td>105.357</td><td>2.393</td><td>—</td><td>—</td></tr>
    <tr><td>8</td><td>109.875</td><td>107.255</td><td>2.620</td><td>2.338</td><td>+0.282</td></tr>
    <tr><td>9</td><td>110.438</td><td>108.325</td><td>2.112</td><td>2.225</td><td>-0.113</td></tr>
    <tr><td>10</td><td>112.719</td><td>110.232</td><td>2.487</td><td>2.356</td><td>+0.131</td></tr>
  </tbody>
</table>

Checking day 9's signal line: `2.338 + 0.5 * (2.112 - 2.338) = 2.338 - 0.113 = 2.225`, and the histogram is `2.112 - 2.225 = -0.113`.

**What the numbers say.** The MACD line stayed positive throughout, so the fast EMA never fell below the slow one and the underlying trend never turned. But the histogram flipped negative on day 9 and positive again on day 10, on the back of a single down close of `-1` followed by a `+4`. Two signal-line crossovers in two bars, from one small pullback in an otherwise intact uptrend.

That is the characteristic MACD failure in miniature. The MACD line answers "is there a trend"; the histogram answers "is it accelerating", and acceleration is a noisy quantity. Traded literally, this sequence pays two round trips for nothing.

---

#### The Three Signals

<table>
  <tbody>
    <tr><td><strong>Event</strong></td><td><strong>Definition</strong></td><td><strong>Character</strong></td></tr>
    <tr><td>Zero-line cross</td><td>MACD line crosses zero</td><td>The slowest and most conservative: identical to an EMA(12)/EMA(26) crossover</td></tr>
    <tr>
      <td>Signal-line cross</td>
      <td>MACD crosses its own EMA, equivalently the histogram crosses zero</td>
      <td>Earlier and much noisier; the source of most MACD trades and most MACD whipsaws</td>
    </tr>
    <tr><td>Histogram divergence</td><td>Price makes a new extreme, the histogram does not</td><td>Suggestive but not well defined; identified with hindsight and hard to test honestly</td></tr>
  </tbody>
</table>

For research use, the **percentage MACD** — `(MACD / EMA_slow) * 100` — is generally preferable to the raw line. It is comparable across instruments, comparable across price regimes for the same instrument, and can be pooled into a cross-sectional ranking. The raw MACD line can be used only for its sign and its shape.

---

#### In Practice Across Asset Classes

**Equities.** Because MACD is denominated in price units, cross-sectional comparisons require the percentage form. Overnight gaps enter the fast EMA immediately and the slow EMA gradually, so a gap opening can produce a signal-line crossover before any intraday trading occurs. Dividend adjustments matter for the same reason they matter for any price-based indicator.

**Futures.** MACD runs on continuous series, so the [roll](/markets/roll-and-carry) affects both EMAs — and affects the fast one more, because it weights recent data more heavily. A roll can therefore create a MACD crossover that reflects the stitching method rather than the market. Because a futures contract is a spread against spot, MACD on futures partly measures carry rather than direction. See [Basis and Term Structure](/signals/basis).

**FX.** Pairs are ratios, so percentage MACD is the natural form. The 17:00 New York close convention determines what a "daily bar" is, and MACD values differ under other conventions. The weekend produces a gap in every daily series.

**Fixed income.** MACD on prices mixes the trend in yields with carry and pull-to-par. On yields it is more interpretable, though the sign convention inverts relative to price.

**Crypto.** Continuous trading is the one setting where the EMA's assumption of evenly spaced, contiguous observations actually holds — there are no gaps or session boundaries for either EMA to absorb. But daily bars still require an arbitrary cut, and the choice of 00:00 UTC versus a local convention shifts crossover dates. High volatility makes the histogram flip frequently, so signal-line crossovers are more numerous and individually less informative than on equity indices.

---

#### Assumptions and Failure Modes

- **Assumes trends persist.** Like any crossover construction, MACD is a bet on positive return autocorrelation. In range-bound markets it produces continuous whipsaw. See [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion).
- **Price units are not comparable.** A raw MACD value has no meaning without knowing the price level. Use the percentage form for anything cross-sectional.
- **The histogram is a noisy derivative.** Differencing amplifies noise, and the histogram differences an already-smoothed series. Small price moves produce histogram sign changes.
- **Three parameters, not one.** Fast, slow and signal periods are all fitted quantities. Sweeping them is a three-dimensional search; the best triple in a sample is rarely the best in the next. See [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **The defaults are not optimal, and are not neutral either.** 12/26/9 was chosen for a market structure that no longer exists. It persists because it is a default, and its wide use makes it a focal point rather than an edge.
- **Seeding and convention differences.** EMA initialisation varies between libraries, so two implementations disagree at the start of a series and can time crossovers a bar apart even after convergence.
- **No volatility awareness.** MACD says nothing about whether a given spread is large relative to normal movement. Scaling by [ATR](/signals/atr) recovers that dimension.

---

#### Code

```python
import pandas as pd

def macd(close: pd.Series, fast: int = 12, slow: int = 26,
         signal: int = 9, as_percent: bool = False) -> pd.DataFrame:
    """MACD line, signal line and histogram.

    adjust=False gives the textbook recursive EMA; pandas defaults to
    adjust=True, which renormalises early weights and changes the first
    few dozen values.

    as_percent divides by the slow EMA so the output is comparable across
    instruments and across price levels. Prefer it for anything that
    ranks assets against each other.
    """
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow

    if as_percent:
        macd_line = 100.0 * macd_line / ema_slow

    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    return pd.DataFrame(
        {
            "macd": macd_line,
            "signal": signal_line,
            "histogram": macd_line - signal_line,
        }
    )
```

---

#### See Also

* [Moving Averages](/signals/moving-averages)
* [MA Crossovers](/signals/ma-crossovers)
* [RSI](/signals/rsi)
* [Bollinger Bands](/signals/bollinger)
* [MACD Strategy](/strategies/macd-strategy)
* [Multiple Testing](/stat-methods/multiple-testing)

---

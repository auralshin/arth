### Stochastic Oscillator

> info **Metadata** Level: Intermediate | Prerequisites: Moving Averages, RSI | Tags: signals, stochastic, oscillator, momentum, range-position

The **stochastic oscillator** asks one narrow question: where did this bar close within the high-low range of the last `n` bars? A close at the very top of the range scores 100, at the very bottom 0, and in the middle 50. George Lane popularised the construction in the 1950s, and despite the name it has nothing to do with stochastic processes — it predates that usage of the word in finance.

The idea behind it is a genuine observation about price behaviour: in an advance, closes tend to cluster near the session highs, because buyers remain willing to pay up into the finish. In a decline, closes cluster near the lows. The oscillator turns that observation into a number. Like [RSI](/signals/rsi), it is bounded, which invites "overbought" and "oversold" readings at 80 and 20 — and, like RSI, it will sit pinned at an extreme throughout a strong trend, which is exactly when those readings do the most damage.

---

#### Formal Definition

Over a lookback of `n` bars, let `H_n` be the highest high and `L_n` the lowest low in the window. The raw oscillator is:

```text
%K_raw(t) = 100 * (C_t - L_n) / (H_n - L_n)
```

where:

- `C_t` is the current bar's close
- `H_n` is the highest high over the last `n` bars, including the current one
- `L_n` is the lowest low over the same window
- `n` is the lookback, conventionally 14

The result is bounded between 0 and 100 by construction, because `C_t` lies inside `[L_n, H_n]` whenever the current bar is part of the window. If `H_n` equals `L_n` the expression is undefined; implementations conventionally return 50 or carry forward the previous value, and they disagree.

A second line smooths the first:

```text
%D(t) = SMA_d( %K )
```

with `d = 3` conventionally. The two lines are then compared, and their crossings are treated as signals.

**Three variants circulate under the same name**, and they differ in how much smoothing is applied before the lines are compared:

<table>
  <tbody>
    <tr><td><strong>Variant</strong></td><td><strong>%K</strong></td><td><strong>%D</strong></td></tr>
    <tr><td>Fast stochastic</td><td><code>%K_raw</code></td><td><code>SMA_3(%K_raw)</code></td></tr>
    <tr><td>Slow stochastic</td><td><code>SMA_3(%K_raw)</code></td><td><code>SMA_3</code> of that again</td></tr>
    <tr><td>Full stochastic (n, s, d)</td><td><code>SMA_s(%K_raw)</code></td><td><code>SMA_d(%K)</code></td></tr>
  </tbody>
</table>

The slow variant's `%K` is precisely the fast variant's `%D`. Fast stochastic is very noisy and rarely used directly; slow stochastic is the default in most charting packages. **Williams %R** is the same quantity measured from the top of the range instead of the bottom: `%R = %K - 100`, giving a scale from `-100` to `0`. It is the identical indicator with a shifted axis.

> warning **Check which variant a rule was calibrated on** A crossover rule tuned on fast stochastic fires several bars earlier and far more often than the same rule on slow stochastic. The label "stochastic (14, 3)" is ambiguous without knowing whether the 3 is the `%K` smoothing, the `%D` smoothing, or both.

---

#### Worked Example

Seven daily bars, with `n = 5` and `d = 3`:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
    <tr><td><strong>High</strong></td><td>103</td><td>104</td><td>106</td><td>108</td><td>107</td><td>113</td><td>113</td></tr>
    <tr><td><strong>Low</strong></td><td>99</td><td>100</td><td>101</td><td>104</td><td>104</td><td>109</td><td>110</td></tr>
    <tr><td><strong>Close</strong></td><td>102</td><td>101</td><td>105</td><td>107</td><td>106</td><td>112</td><td>111</td></tr>
  </tbody>
</table>

**Day 5.** The window covers days 1 to 5. The highest high is 108 (day 4) and the lowest low is 99 (day 1):

```text
%K = 100 * (106 - 99) / (108 - 99) = 100 * 7 / 9 = 77.78
```

**Day 6.** The window covers days 2 to 6. Day 6's own high of 113 becomes `H_5`; the lowest low is 100 (day 2):

```text
%K = 100 * (112 - 100) / (113 - 100) = 100 * 12 / 13 = 92.31
```

**Day 7.** The window covers days 3 to 7. `H_5 = 113`, `L_5 = 101` (day 3):

```text
%K = 100 * (111 - 101) / (113 - 101) = 100 * 10 / 12 = 83.33
```

**The %D line** is the 3-period average of those values:

```text
%D(day 7) = (77.78 + 92.31 + 83.33) / 3 = 253.42 / 3 = 84.47
```

Two things are worth noticing. First, `%K` fell from 92.31 to 83.33 between days 6 and 7 even though the close only dropped one point, from 112 to 111 — because the *denominator* also changed as day 2's low of 100 left the window and day 3's low of 101 became the floor. The oscillator moves when the window's extremes roll off, not only when price moves. This is the same drop-off effect that afflicts a [simple moving average](/signals/moving-averages), amplified because it acts on the range rather than the mean.

Second, every reading here is above 77, and the three average 84.47 — at or above the conventional "overbought" threshold of 80 across the whole window, while the close rose from 106 to 111. The first reading above 80 came on day 6, at a close of 112 that had just gapped six points higher. Nothing in the oscillator distinguishes a 92.31 that precedes a reversal from one that precedes another six-point advance. It was not wrong: it correctly reported that closes were landing near the top of the range, which is exactly what a strong uptrend looks like. Reading that report as a sell instruction is the error.

---

#### Interpretation

<table>
  <tbody>
    <tr><td><strong>Reading</strong></td><td><strong>What it describes</strong></td><td><strong>What it does not establish</strong></td></tr>
    <tr><td>Above 80</td><td>Closes are landing near the top of the recent range</td><td>That a reversal is due. Uptrends pin the oscillator here for long stretches.</td></tr>
    <tr><td>Below 20</td><td>Closes are landing near the bottom of the range</td><td>That the decline is exhausted. Downtrends pin it here just as persistently.</td></tr>
    <tr><td>Near 50</td><td>Closes are mid-range</td><td>Anything about volatility — the measure is scale-free.</td></tr>
    <tr><td>%K crosses %D</td><td>The short-run range position is turning relative to its own average</td><td>A change in trend. Most crossings are noise within a range.</td></tr>
  </tbody>
</table>

The comparison with RSI is instructive because the two are constructed from entirely different inputs. RSI uses the *sequence* of closes and asks what fraction of movement was upward. Stochastic uses the *extremes* of the window and asks where the latest close sits between them. A series can rise steadily with each close near its bar high — high on both. But a series can also make one enormous up bar and then drift sideways near the top: stochastic stays elevated (the closes remain near `H_n`), while RSI falls back toward 50 as the drift produces small changes of both signs. The two disagree precisely where the distinction between range position and movement composition matters.

Common practice pairs the oscillator with a trend filter, applying the oversold reading only when a longer-term measure says the market is not in a downtrend. That is a sensible response to the failure mode above, and it also doubles the number of fitted parameters.

---

#### In Practice Across Asset Classes

**Equities.** The oscillator depends on highs and lows, which makes it sensitive to data quality in a way close-only indicators are not. Opening gaps set a new `H_n` or `L_n` instantly, which can move `%K` from one extreme to the other on a single print with no intraday trading. Auction opens and closes produce prints that may lie outside the continuous session's range on some venues. Splits and dividends must be adjusted across highs, lows and closes consistently, or the range and the close come from different scales.

**Futures.** Session definition drives the result: a contract trading nearly around the clock has a very different daily high-low range from the same contract measured over a pit or primary session only. Many data providers publish both, and `%K` computed on one is not comparable with `%K` computed on the other. Rolls contaminate the range on a raw stitched series.

**FX.** There is no consolidated tape, so the high and low of a "daily bar" are whatever the chosen venue or aggregator saw. Different providers report visibly different extremes for the same day, and because the oscillator's denominator *is* that range, disagreement propagates directly into the indicator.

**Fixed income.** Applied to futures rather than cash bonds, since cash bond high-low data is sparse and dealer-quoted. Around policy meetings, the range expands sharply and `%K` compresses toward the middle, which reads as neutrality when the market is in fact at its most active.

**Crypto.** Continuous trading means the daily range is a genuine 24-hour range rather than a session range, and there are no opening gaps to jump the oscillator. Set against that, thin books produce long wicks: a brief liquidation cascade can print a low far from where any meaningful volume traded, and that low then sets `L_n` for the next `n` bars. The denominator inherits an artefact and `%K` is depressed for the whole window. Venue-specific wicks also mean the oscillator differs materially between exchanges for the same asset. See [Liquidity and Depth as Features](/signals/liquidity).

---

#### Assumptions and Failure Modes

- **Assumes range position mean-reverts.** Nothing enforces it. In a trend the oscillator saturates at an extreme and stays there, and the rule that reads saturation as a reversal signal trades against the trend repeatedly.
- **Highly sensitive to single extreme prints.** One bad tick or one thin-book wick sets `H_n` or `L_n` and distorts every reading for `n` bars. Unlike a mean-based indicator, there is no averaging to dilute it.
- **Window roll-off moves the indicator without price moving.** As the worked example shows, `%K` changes when old extremes leave the window. Signals can fire on days when nothing happened.
- **Undefined in a flat range.** If `H_n` equals `L_n`, the denominator is zero. Implementations differ on what to return, and they differ exactly in the low-volatility conditions where a squeeze signal might matter.
- **Scale-free, so no volatility information.** A `%K` of 90 in a 0.5% range and in a 15% range look identical. Pair it with [ATR](/signals/atr) to recover magnitude.
- **Variant ambiguity.** Fast, slow and full stochastic behave differently enough that a threshold or crossover rule is not portable between them.
- **Multiple fitted parameters.** Lookback, two smoothing periods, and two thresholds is a five-dimensional search on a single price series. An attractive backtest is the expected outcome of that search regardless of edge. See [Multiple Testing](/stat-methods/multiple-testing) and [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Code

```python
import pandas as pd

def stochastic(high: pd.Series, low: pd.Series, close: pd.Series,
               period: int = 14, k_smooth: int = 3, d_smooth: int = 3
               ) -> pd.DataFrame:
    """Full stochastic oscillator.

    k_smooth=1 gives the fast variant; k_smooth=3 with d_smooth=3 gives
    the slow variant that most charting packages plot by default. The
    two are different enough that a rule tuned on one misfires on the other.
    """
    highest = high.rolling(period).max()
    lowest = low.rolling(period).min()
    span = highest - lowest

    # A zero-width window has no defined range position. 50 (mid-range)
    # is the usual convention; carrying the previous value is also seen.
    raw_k = 100.0 * (close - lowest) / span.replace(0.0, pd.NA)
    raw_k = raw_k.fillna(50.0)

    percent_k = raw_k.rolling(k_smooth).mean()
    percent_d = percent_k.rolling(d_smooth).mean()

    return pd.DataFrame(
        {
            "raw_k": raw_k,
            "percent_k": percent_k,
            "percent_d": percent_d,
            # Williams %R is the same measure from the top of the range.
            "williams_r": raw_k - 100.0,
        }
    )
```

---

#### See Also

* [RSI](/signals/rsi)
* [Bollinger Bands](/signals/bollinger)
* [ATR](/signals/atr)
* [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion)
* [Cleaning Data](/data-tooling/cleaning)
* [Multiple Testing](/stat-methods/multiple-testing)

---

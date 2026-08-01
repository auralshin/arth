### Relative Strength Index (RSI)

> info **Metadata** Level: Intermediate | Prerequisites: Moving Averages, Returns | Tags: signals, rsi, oscillator, momentum, wilder-smoothing

The **Relative Strength Index (RSI)** compresses recent price behaviour into a single bounded number between 0 and 100. It asks what proportion of recent movement has been upward, smooths that proportion, and rescales it. Published by J. Welles Wilder in 1978 for commodity futures, it is now computed on essentially every traded instrument and shipped in every charting package.

Its popularity has an unfortunate side effect: RSI is usually described in terms of "overbought" above 70 and "oversold" below 30, thresholds Wilder proposed as rules of thumb and which are routinely repeated as though they were established results. They are not. RSI stays above 70 for extended stretches in strong uptrends, and a rule that sells there sells into strength repeatedly. The indicator measures the *composition* of recent moves; whether that composition predicts anything is a separate empirical question that must be tested per instrument and horizon.

---

#### Formal Definition

Let `d_t = P_t - P_{t-1}` be the price change. Split it into gains and losses:

```text
U_t = d_t   if d_t is positive, else 0
D_t = -d_t  if d_t is negative, else 0
```

Both `U_t` and `D_t` are non-negative, and at most one is non-zero on any bar. Averaging each over `n` periods gives the **relative strength**, and the RSI is that ratio mapped onto a 0-100 scale:

```text
RS_t  = AvgGain_t / AvgLoss_t
RSI_t = 100 - 100 / (1 + RS_t)
```

which can be written equivalently, and more revealingly, as:

```text
RSI_t = 100 * AvgGain_t / (AvgGain_t + AvgLoss_t)
```

where:

- `AvgGain_t` is the smoothed average of `U` over `n` periods
- `AvgLoss_t` is the smoothed average of `D` over `n` periods
- `n` is the lookback, conventionally 14

In this second form the indicator is plainly the share of total absolute movement that was upward, times 100. RSI is 50 when gains and losses balance, approaches 100 when there have been no down bars, and approaches 0 when there have been no up bars. If `AvgLoss` is zero the ratio is undefined and RSI is defined as 100 by convention.

**The smoothing convention is where implementations diverge.** Wilder's original uses a recursive average with `alpha = 1 / n`:

```text
AvgGain_t = ((n - 1) * AvgGain_{t-1} + U_t) / n
AvgLoss_t = ((n - 1) * AvgLoss_{t-1} + D_t) / n
```

seeded with the simple mean of the first `n` values of `U` and `D`. This is **Wilder's smoothing**, and it is *not* the same as an EMA of span `n`. An EMA of span `n` uses `alpha = 2 / (n + 1)`; Wilder's `alpha = 1 / n` corresponds to an EMA of span `2n - 1`. Wilder's 14-period RSI therefore smooths like a 27-period EMA.

Some packages instead use simple moving averages of `U` and `D`, which is sometimes called **Cutler's RSI**. It is a different indicator with the same name.

> warning **Three RSIs, one label** Wilder's smoothing, an EMA of span `n`, and an SMA all appear in production code under the name "RSI(14)". They produce visibly different values and different signal timings on the same data. Before comparing an RSI against any published threshold or backtest, confirm which one you are computing.

---

#### Worked Example

Using `n = 5` to keep the arithmetic legible; the standard is 14, but the mechanics are identical. Ten daily closes:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
    <tr><td><strong>Close</strong></td><td>100</td><td>102</td><td>101</td><td>105</td><td>107</td><td>106</td><td>110</td><td>112</td><td>111</td><td>115</td></tr>
    <tr><td><strong>Change</strong></td><td>—</td><td>+2</td><td>-1</td><td>+4</td><td>+2</td><td>-1</td><td>+4</td><td>+2</td><td>-1</td><td>+4</td></tr>
  </tbody>
</table>

**Step 1 — seed the averages** from the first five changes (`+2, -1, +4, +2, -1`):

```text
AvgGain = (2 + 0 + 4 + 2 + 0) / 5 = 8 / 5 = 1.60
AvgLoss = (0 + 1 + 0 + 0 + 1) / 5 = 2 / 5 = 0.40
```

**Step 2 — first RSI**, at day 6:

```text
RS  = 1.60 / 0.40 = 4.00
RSI = 100 - 100 / (1 + 4.00) = 100 - 20 = 80.00
```

**Step 3 — roll forward with Wilder's smoothing.** Day 7's change is `+4`:

```text
AvgGain = (1.60 * 4 + 4) / 5 = 10.40 / 5 = 2.080
AvgLoss = (0.40 * 4 + 0) / 5 =  1.60 / 5 = 0.320
RS      = 2.080 / 0.320 = 6.500
RSI     = 100 - 100 / 7.500 = 86.67
```

Continuing to the end of the series:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td><strong>Close</strong></td><td><strong>AvgGain</strong></td><td><strong>AvgLoss</strong></td><td><strong>RS</strong></td><td><strong>RSI</strong></td></tr>
    <tr><td>6</td><td>106</td><td>1.6000</td><td>0.4000</td><td>4.000</td><td>80.00</td></tr>
    <tr><td>7</td><td>110</td><td>2.0800</td><td>0.3200</td><td>6.500</td><td>86.67</td></tr>
    <tr><td>8</td><td>112</td><td>2.0640</td><td>0.2560</td><td>8.063</td><td>88.97</td></tr>
    <tr><td>9</td><td>111</td><td>1.6512</td><td>0.4048</td><td>4.079</td><td>80.31</td></tr>
    <tr><td>10</td><td>115</td><td>2.1210</td><td>0.3238</td><td>6.549</td><td>86.75</td></tr>
  </tbody>
</table>

**Step 4 — compare against the SMA variant.** Over the last five changes (`-1, +4, +2, -1, +4`), simple averages give `AvgGain = 10 / 5 = 2.00` and `AvgLoss = 2 / 5 = 0.40`, so `RS = 5.00` and `RSI = 100 - 100/6 = 83.33`.

On the same data, on the same day, with the same nominal period: **86.75 under Wilder's smoothing, 83.33 under simple averaging.** Neither is wrong. They are different indicators, and a threshold rule at 85 would fire on one and not the other.

Note also what the number is saying. RSI sat above 80 for the entire window while the price advanced from 106 to 115. Read as "overbought", the day-6 reading would have called for selling four bars before a further 8.5% rise.

---

#### Interpretation

RSI is best understood as a *description* of recent price composition, and only secondarily as a signal.

<table>
  <tbody>
    <tr><td><strong>Reading</strong></td><td><strong>What it describes</strong></td><td><strong>What it does not mean</strong></td></tr>
    <tr><td>Above 70</td><td>Gains have dominated recent bars</td><td>That a reversal is due; strong trends persist here for weeks</td></tr>
    <tr><td>Below 30</td><td>Losses have dominated recent bars</td><td>That the asset is cheap; falling assets can keep falling</td></tr>
    <tr><td>Near 50</td><td>Gains and losses roughly balanced</td><td>Low volatility — RSI is scale-free and says nothing about size</td></tr>
  </tbody>
</table>

Three usages appear more often than the raw thresholds:

- **Centreline behaviour.** Sustained readings above 50 indicate that up bars dominate; some trend systems use the 50 line as a regime filter rather than 70 and 30 as entry triggers.
- **Divergence.** Price makes a higher high while RSI makes a lower high. This is a real arithmetic fact about the series — the new high was reached with a weaker mix of up bars — but as a signal it is defined loosely, identified with hindsight, and very hard to test without leaking future information.
- **Range shifting.** In a persistent uptrend RSI tends to oscillate roughly between 40 and 90; in a downtrend, roughly between 10 and 60. The shift itself carries more information than any fixed threshold.

Because RSI is bounded, it is a convenient input to a model — a feature that never needs winsorising. That property, not the 70/30 folklore, is why it survives in systematic work. See [Feature Engineering](/ml-finance/feature-engineering).

---

#### In Practice Across Asset Classes

**Equities.** Overnight gaps are recorded as a single large `U` or `D` on the following bar, so a gap opening can move a daily RSI by several points with no intraday trading. RSI on unadjusted prices treats an ex-dividend drop as a genuine loss; always compute on total-return adjusted series. See [Corporate Actions](/markets/corporate-actions).

**Futures.** Computed on continuous series, so contract rolls inject an artificial change into the gain/loss stream unless the series is properly adjusted. On a back-adjusted series the roll is absorbed; on a raw stitched series it appears as a phantom bar of pure gain or loss. See [Futures 101](/markets/futures-101).

**FX.** Weekday trading is nearly continuous, but the daily bar boundary is a venue convention, so the same pair yields different RSI values under different close conventions. The Monday bar absorbs the weekend gap.

**Fixed income.** RSI on bond prices conflates rate moves with duration and carry. On yields it is more interpretable, but the sign flips: falling yields mean rising prices, so a "low RSI" on yields corresponds to strength in the bond.

**Crypto.** The purest case for the indicator's assumptions. There are no gaps, no session boundaries, and every bar reflects actual trading, so an RSI(14) on daily bars really does summarise fourteen contiguous days rather than fourteen sessions separated by closed markets. Against that, volatility is high enough that RSI reaches extreme readings routinely, which makes fixed thresholds far less discriminating than on equities. Values also differ across venues because prices do.

---

#### Assumptions and Failure Modes

- **Assumes bounded means mean-reverting.** Nothing forces a bounded indicator to revert. RSI can sit above 70 through an entire trend, and the "overbought" reading is then a description of strength being read as a sell signal.
- **Ignores magnitude relative to volatility.** RSI is scale-free: five bars of `+0.1%` and five bars of `+5%` can give the same reading. Pair it with [ATR](/signals/atr) or a volatility estimate to recover the size dimension.
- **Undefined at the extremes.** With no losses in the window, `AvgLoss = 0` and `RS` is undefined. Implementations paper over this differently, which creates disagreement precisely at the most extreme readings.
- **Sensitive to the seed.** Wilder's recursion is seeded from the first `n` values, and different seeds propagate for many bars. Two implementations disagree at the start of a series and converge only slowly.
- **Smoothing convention.** As shown above, Wilder, EMA and SMA variants give materially different values. Published thresholds implicitly assume Wilder's.
- **Threshold and period fitting.** Sweeping the period and the two thresholds is a three-parameter search on a single series. Attractive results are the expected outcome of that search whether or not any edge exists. See [Multiple Testing](/stat-methods/multiple-testing).
- **Divergence is not well defined.** There is no canonical rule for which highs to compare, and visual identification after the fact is not a testable procedure.

---

#### Code

```python
import pandas as pd

def rsi(close: pd.Series, period: int = 14, method: str = "wilder") -> pd.Series:
    """RSI with an explicit smoothing choice.

    'wilder'  — the original: alpha = 1/n, equivalent to an EMA of span 2n-1
    'ema'     — alpha = 2/(n+1), what you get by passing n to ewm(span=n)
    'sma'     — simple averages of gains and losses (Cutler's RSI)

    These are three different indicators. Naming the convention explicitly
    is cheaper than debugging a threshold rule that fires a bar early.
    """
    delta = close.diff()
    gain = delta.clip(lower=0.0)
    loss = (-delta).clip(lower=0.0)

    if method == "wilder":
        avg_gain = gain.ewm(alpha=1 / period, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1 / period, adjust=False).mean()
    elif method == "ema":
        avg_gain = gain.ewm(span=period, adjust=False).mean()
        avg_loss = loss.ewm(span=period, adjust=False).mean()
    else:
        avg_gain = gain.rolling(period).mean()
        avg_loss = loss.rolling(period).mean()

    # Zero average loss means no down bars in the window: RSI is 100 by
    # convention rather than an infinity propagating through the series.
    rs = avg_gain / avg_loss.replace(0.0, pd.NA)
    return (100 - 100 / (1 + rs)).fillna(100.0)
```

---

#### See Also

* [Stochastic Oscillator](/signals/stochastic)
* [MACD](/signals/macd)
* [Moving Averages](/signals/moving-averages)
* [ATR](/signals/atr)
* [RSI Strategy](/strategies/rsi-strategy)
* [RSI Walkthrough](/case-studies/rsi-walkthrough)

---

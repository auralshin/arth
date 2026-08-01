### Moving Averages (SMA, EMA)

> info **Metadata** Level: Beginner | Prerequisites: Returns, Rolling Windows | Tags: signals, moving-average, sma, ema, smoothing, trend

A moving average replaces each price with an average of the recent past. That single operation — the oldest idea in technical analysis, in continuous use since chartists computed averages by hand — is also the building block underneath most other indicators. [MACD](/signals/macd) is the difference of two of them, [Bollinger Bands](/signals/bollinger) are one plus a volatility envelope, and [Wilder's smoothing](/signals/rsi) is a moving average with an unusual decay constant.

The purpose is noise reduction. A price series contains both a slow component you might be able to forecast and a fast component that is mostly unforecastable. Averaging suppresses the fast component. It also, unavoidably, delays the slow one: every moving average is a low-pass filter, and every low-pass filter introduces lag. The entire craft of using moving averages consists of choosing where to sit on that trade-off, because there is no window length that gives smoothing without delay.

---

#### Formal Definition

The **simple moving average (SMA)** over `n` periods is the unweighted mean of the last `n` closes:

```text
SMA_n(t) = (1/n) * sum_{i=0}^{n-1} P_{t-i}
```

where:

- `P_t` is the price at time `t` (conventionally the close)
- `n` is the lookback window in periods

Every observation inside the window gets weight `1/n`; everything outside gets zero. The average therefore changes both when a new price enters and when an old one drops out — the "drop-off effect", which can move an SMA on a day when the current price barely moved.

The **exponential moving average (EMA)** weights recent prices more heavily and never fully discards old ones:

```text
EMA_n(t) = alpha * P_t + (1 - alpha) * EMA_n(t-1)
alpha    = 2 / (n + 1)
```

where:

- `alpha` is the smoothing factor, between 0 and 1
- `n` is the nominal period, mapped to `alpha` by the conventional formula above

The `2 / (n + 1)` mapping exists so that an EMA and an SMA of the same `n` have the same **centre of mass** — the average age of the data in each is `(n - 1) / 2`. That is a convention, not a derivation. Other definitions exist, and the RSI page discusses **Wilder's smoothing**, which uses `alpha = 1 / n` and so behaves like an EMA of roughly `2n - 1` periods.

> warning **The EMA seed changes early values** An EMA is recursive and needs a starting value. Some libraries seed with the first price, some with the SMA of the first `n` prices, and some (pandas `ewm` with `adjust=True` by default) use a renormalised weighted average that has no explicit seed. The three agree after enough periods but differ visibly at the start of a series, which matters in short backtests.

A **weighted moving average (WMA)** applies linearly declining weights `n, n-1, ..., 1` normalised to sum to 1. It sits between the SMA and EMA in responsiveness and is far less common.

---

#### Worked Example

Ten daily closes:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
    <tr><td><strong>Close</strong></td><td>100</td><td>102</td><td>101</td><td>105</td><td>107</td><td>106</td><td>110</td><td>112</td><td>111</td><td>115</td></tr>
  </tbody>
</table>

**Simple moving average, n = 5.** The first value is available on day 5:

1. Day 5: `(100 + 102 + 101 + 105 + 107) / 5 = 515 / 5 = 103.0`
2. Day 6: `(102 + 101 + 105 + 107 + 106) / 5 = 521 / 5 = 104.2`
3. Day 7: `529 / 5 = 105.8`
4. Day 8: `540 / 5 = 108.0`
5. Day 9: `546 / 5 = 109.2`
6. Day 10: `554 / 5 = 110.8`

**Exponential moving average, n = 5.** Here `alpha = 2 / 6 = 1/3`. Seeding with the day-5 SMA of `103.0`:

1. Day 6: `103.0 + (1/3) * (106 - 103.0) = 103.0 + 1.0 = 104.0`
2. Day 7: `104.0 + (1/3) * (110 - 104.0) = 104.0 + 2.0 = 106.0`
3. Day 8: `106.0 + (1/3) * (112 - 106.0) = 106.0 + 2.0 = 108.0`
4. Day 9: `108.0 + (1/3) * (111 - 108.0) = 108.0 + 1.0 = 109.0`
5. Day 10: `109.0 + (1/3) * (115 - 109.0) = 109.0 + 2.0 = 111.0`

On day 10 the SMA reads 110.8 and the EMA 111.0. The gap is small here because the series trends smoothly, but the mechanism is visible: the EMA gives day 10's close a weight of `1/3` while the SMA gives it `1/5`.

The lag is easier to see in the levels. The price rose from 100 to 115, a gain of 15. Over the same span the 5-period SMA rose from 103.0 to 110.8, a gain of 7.8 — roughly half the move, because the average sits about two periods behind. That delay is not a defect to be tuned away; it is the arithmetic consequence of averaging.

---

#### Choosing a Window

<table>
  <tbody>
    <tr><td><strong>Window</strong></td><td><strong>Behaviour</strong></td><td><strong>Cost</strong></td></tr>
    <tr><td>Short (5-20)</td><td>Tracks price closely, turns quickly</td><td>Reacts to noise; high turnover and high cost drag</td></tr>
    <tr><td>Medium (20-60)</td><td>Filters most short-term noise</td><td>Several periods of lag at every turning point</td></tr>
    <tr><td>Long (100-200)</td><td>Identifies only major regime shifts</td><td>Very late; a full trend can complete before it turns</td></tr>
  </tbody>
</table>

The round numbers 20, 50, 100, and 200 are conventions inherited from the era of hand-drawn charts, not optimisation results. Their persistence has one genuine consequence: enough participants watch the same levels that behaviour can cluster around them. That is a coordination effect, not a property of the mathematics, and it is not reliable.

---

#### In Practice Across Asset Classes

**Equities.** Daily moving averages are computed on closes and must be adjusted for splits and dividends, or a corporate action creates a phantom crossover. See [Corporate Actions](/markets/corporate-actions). Overnight gaps mean a daily average can jump without any intraday trading having taken place.

**Futures.** Averages run on a continuous stitched series, so the [roll convention](/markets/roll-and-carry) directly changes the values. A back-adjusted series shifts historical prices at each roll and therefore rewrites the historical average, while a ratio-adjusted series preserves percentage changes but not levels. Two desks can compute "the 50-day" on the same contract and disagree.

**FX.** Trades nearly continuously on weekdays but has no single closing print, so the "daily close" is a venue convention — 17:00 New York is common. Different conventions produce measurably different daily averages on the same pair. The weekend gap remains.

**Fixed income.** Averaging yields is more meaningful than averaging prices, since price levels move with coupon and maturity. Averages of clean prices across a roll to a new benchmark issue are close to meaningless.

**Crypto.** Continuous trading means no gaps and no session boundaries, so an `n`-period average genuinely covers `n` contiguous periods of trading — unlike a daily equity average, where each observation summarises a session separated by a closed market. Daily bars still need an arbitrary cut, usually 00:00 UTC, and averages computed on different venues differ because prices differ. On-chain time-weighted average prices are the same construction implemented in a smart contract; see [Oracles](/building-blocks/oracles).

---

#### Assumptions and Failure Modes

- **Assumes a trend exists.** In a range-bound market the average sits in the middle of the range and price crosses it constantly. Every crossing is a false turning point. See [MA Crossovers](/signals/ma-crossovers).
- **Lag is unavoidable.** A moving average cannot signal a turn before it happens. Reducing the window reduces lag and increases false signals in strict proportion.
- **Look-ahead through bar alignment.** Computing an average that includes today's close and acting at today's close is not implementable. Signals must be lagged by at least one bar.
- **Sensitive to the price definition.** Close, midpoint, typical price, and VWAP produce different averages. In illiquid instruments the last trade can be stale by hours.
- **Corporate actions and contract rolls.** Unadjusted series produce spurious jumps that look identical to genuine trend changes.
- **The window is a fitted parameter.** Selecting the best-performing `n` from a sweep is fitting. See [Backtest Overfitting](/stat-methods/backtest-overfitting) and [Parameter Sweeps](/simulation/param-sweeps).
- **Not a forecast.** A moving average summarises what has already happened. Any predictive claim comes from an added assumption about persistence, which is exactly what [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion) tests.

---

#### Code

```python
import pandas as pd

def moving_averages(close: pd.Series, window: int = 20) -> pd.DataFrame:
    """SMA and EMA on the same window, with signals lagged one bar.

    adjust=False gives the textbook recursive EMA. pandas defaults to
    adjust=True, which renormalises early weights and produces different
    values at the start of the series.
    """
    sma = close.rolling(window).mean()
    ema = close.ewm(span=window, adjust=False).mean()
    return pd.DataFrame(
        {
            "sma": sma,
            "ema": ema,
            # Shift so a signal formed on bar t is only actable on bar t+1.
            "sma_signal": (close - sma).shift(1),
            "ema_signal": (close - ema).shift(1),
        }
    )


def wilder_smoothing(series: pd.Series, period: int) -> pd.Series:
    """Wilder's average: alpha = 1/n, equivalent to an EMA of span 2n-1.

    Used by RSI, ATR and ADX. Passing n straight to ewm(span=n) is the
    single most common indicator implementation bug.
    """
    return series.ewm(alpha=1 / period, adjust=False).mean()
```

---

#### See Also

* [MA Crossovers](/signals/ma-crossovers)
* [MACD](/signals/macd)
* [Bollinger Bands](/signals/bollinger)
* [Rolling Windows](/quant-math/rolling-windows)
* [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion)
* [Momentum Strategy](/strategies/momentum)

---

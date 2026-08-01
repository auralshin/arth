### MACD Crossover Strategy

> info **Metadata** Level: Intermediate | Prerequisites: Moving Averages, Returns, Volatility | Tags: macd, trend-following, moving-averages, crossover, filters

**Moving Average Convergence Divergence (MACD)** is the difference between a fast and a slow exponential moving average of price, together with a smoothed version of that difference called the signal line. A crossover strategy takes a long position when the fast average pulls ahead of the slow one and reverses or flattens when it falls behind.

Read as a piece of engineering rather than as a chart pattern, MACD is a **band-pass filter**: subtracting a slow average from a fast one removes the very low-frequency component (the level and long-run drift) and the very high-frequency component (bar-to-bar noise), leaving oscillations at an intermediate timescale set by the two spans. That framing is more useful than the usual one, because it makes the strategy's assumption explicit — there is exploitable persistence at the frequency band the filter passes.

> warning **Not Financial Advice** This page describes the construction and behaviour of MACD rules. It is not a recommendation to trade any indicator or parameter set.

---

#### Why It Might Work: The Economic Rationale

MACD contains no information that is not already in the price series. Any expected return must therefore come from the same sources as [momentum](/strategies/momentum) — slow information diffusion, behavioural underreaction, flow from constrained participants, or compensation for reversal risk — not from the indicator itself.

What the indicator *does* contribute is a specific trade-off between responsiveness and turnover:

- **Noise suppression.** Raw price crossings of a threshold flip constantly. Exponential smoothing attenuates high-frequency variation, so the signal changes sign far less often, which directly reduces the cost drag that kills fast rules.
- **Lag.** The same smoothing means the signal turns after the trend does. An EMA with span `n` has an average lag of roughly `(n - 1) / 2` bars. A 12/26 crossover therefore acts on information that is, on average, about a week old on daily bars. This is not a defect to be engineered away; it is the price of the noise suppression.
- **A second derivative in disguise.** The MACD line is a difference of averages, so it is approximately proportional to a smoothed rate of change of price. The histogram — MACD minus its own signal line — is one derivative further out, closer to a smoothed acceleration. Trading the histogram cross is therefore a faster, noisier bet than trading the MACD zero-cross.

**What would have to be true.** For a MACD rule to have positive expected return net of costs, price changes must exhibit positive serial dependence at the timescale the filter isolates — roughly the band between the two EMA spans — and that dependence must be large enough to survive the round-trip cost incurred on every crossover. If it does not, the rule reliably buys after rallies and sells after declines, which in a mean-reverting or range-bound market is a mechanism for losing money at a steady rate.

> info **The parameters are historical accident** 12, 26 and 9 date from an era of weekly hand computation on a six-day trading week. They encode no theory. Their persistence is a convention, and a result that depends on those exact values rather than on the neighbourhood around them is a fitting artefact.

---

#### Formal Definition

An exponential moving average with span `n` uses a smoothing factor `alpha`:

```text
alpha_n     = 2 / (n + 1)
EMA_n(t)    = alpha_n * P_t + (1 - alpha_n) * EMA_n(t-1)
```

The three MACD series:

```text
MACD_t   = EMA_fast(P)_t - EMA_slow(P)_t
Signal_t = EMA_sig(MACD)_t
Hist_t   = MACD_t - Signal_t
```

where:

- `fast` is conventionally 12, so `alpha = 2/13 = 0.153846`
- `slow` is conventionally 26, so `alpha = 2/27 = 0.074074`
- `sig` is conventionally 9, so `alpha = 2/10 = 0.200000`
- `Hist_t` is positive exactly when `MACD_t` sits above its own smoothed value

Two distinct rule families are both called "MACD crossover":

```text
signal-line cross:  long when Hist_t > 0, short or flat when Hist_t < 0
zero-line cross:    long when MACD_t > 0, short or flat when MACD_t < 0
```

The zero-line cross is simply a 12/26 EMA crossover on price and is the slower, lower-turnover version. The signal-line cross fires earlier and far more often.

**Normalisation.** `MACD_t` is measured in price units, so its scale depends on the asset's price level and volatility. A reading of 1.64 means something quite different on an instrument at 105 than on one at 10,500, and the same instrument's readings are not comparable across a decade of price growth. Any use of MACD *magnitude* — thresholds, cross-asset ranking, position sizing — requires normalising first:

```text
MACD_norm_t = MACD_t / P_t          (percentage form)
MACD_norm_t = MACD_t / ATR_n(t)     (volatility-adjusted form)
```

Only the *sign* of the raw series is scale-free.

---

#### Worked Example: Two Bars Through a Crossover

Standard 12/26/9 parameters. The state carried into the example, at bar `t-1`, is illustrative arithmetic constructed for this page.

<table>
  <tbody>
    <tr><td><strong>Series</strong></td><td><strong>Bar t-1</strong></td><td><strong>Bar t (P = 105.00)</strong></td><td><strong>Bar t+1 (P = 107.00)</strong></td></tr>
    <tr><td>EMA_12</td><td>102.4000</td><td>102.8000</td><td>103.4462</td></tr>
    <tr><td>EMA_26</td><td>101.1000</td><td>101.3889</td><td>101.8045</td></tr>
    <tr><td>MACD</td><td>1.3000</td><td>1.4111</td><td>1.6416</td></tr>
    <tr><td>Signal</td><td>1.4500</td><td>1.4422</td><td>1.4821</td></tr>
    <tr><td>Histogram</td><td>-0.1500</td><td>-0.0311</td><td>+0.1595</td></tr>
  </tbody>
</table>

1. **Bar t, fast EMA**: `(2/13) * 105.00 + (11/13) * 102.4000 = 16.1538 + 86.6462 = 102.8000`
2. **Bar t, slow EMA**: `(2/27) * 105.00 + (25/27) * 101.1000 = 7.7778 + 93.6111 = 101.3889`
3. **Bar t, MACD and signal**: `102.8000 - 101.3889 = 1.4111`, and `0.2 * 1.4111 + 0.8 * 1.4500 = 1.4422`. Histogram is `-0.0311` — still negative, so no trade.
4. **Bar t+1, fast EMA**: `(2/13) * 107.00 + (11/13) * 102.8000 = 16.4615 + 86.9846 = 103.4462`
5. **Bar t+1, slow EMA**: `(2/27) * 107.00 + (25/27) * 101.3889 = 7.9259 + 93.8786 = 101.8045`
6. **Bar t+1, MACD and signal**: `103.4462 - 101.8045 = 1.6416`, and `0.2 * 1.6416 + 0.8 * 1.4422 = 1.4821`. Histogram is `+0.1595` — it has crossed zero, and the long is entered at the bar t+2 open.

Two observations from the arithmetic. First, price rose from an implied level below 102.40 to 107.00 before the signal fired: the rule captured none of that move and is entering after it. Second, the MACD value of 1.6416 at a price of 107.00 is 1.53% of price — the number that would be comparable across assets. The raw figure is not.

---

#### Implementation Considerations

**Long-flat versus long-short.** A long-flat implementation sits in cash on a negative signal; a long-short reverses. These are materially different strategies: the long-flat version retains a positive average exposure and therefore inherits part of the asset's drift, so it will beat a long-short version in a rising market for reasons that have nothing to do with the signal. Benchmark accordingly. See [Buy and Hold](/strategies/buy-hold).

**Confirmation delays and buffers.** Requiring the histogram to hold its sign for two or three bars, or to exceed a small band around zero, cuts turnover sharply at the cost of later entries. This is the same trade-off as the EMA spans, applied at a second layer.

**Redundancy.** The MACD zero-cross *is* the 12/26 EMA crossover. Running both as "two confirming signals" is double-counting a single piece of information. See [Moving Average Crossovers](/signals/ma-crossovers).

**Divergence is not a systematic rule.** "Price makes a higher high while MACD makes a lower high" requires choosing which highs count, and that choice is made with hindsight. There is no unambiguous specification, so there is no honest backtest.

**Sizing.** The sign of the histogram carries no magnitude information about conviction or risk. Scaling position size by the histogram value without normalising means taking larger positions simply because the asset is more expensive or more volatile.

---

#### In Practice Across Asset Classes

**Futures and managed futures.** The natural home for trend filters. Professional trend programmes use broadly similar constructions — differences of moving averages, normalised by volatility, aggregated across horizons and across dozens of markets — sized to a common risk target. The single-asset, single-parameter MACD rule is the same idea stripped of the diversification that makes it work.

**Equities.** Individual stocks are noisier and more jump-prone than diversified futures, and gap moves through the signal level are common around earnings. Applied to an index rather than a single name, the signal is smoother but the trend premium is weaker.

**FX.** Trends in major pairs are typically driven by rate-differential regimes that persist for quarters, which is a reasonable match for the 12/26 daily band. Intervention and pegs create discontinuities that no smoothing handles well.

**Fixed income.** Trends exist but are duration trends. Position sizing must be in DV01 rather than notional, or a long-dated contract dominates the risk. See [Duration and Convexity](/markets/duration-convexity).

**Commodities.** Trend and term structure interact: the same supply conditions that produce a price trend often produce a favourable roll, so a naive backtest on a rolled series conflates the two. See [Roll and Carry](/markets/roll-and-carry).

**On-chain markets.** Continuous 24/7 trading means "daily bars" are an arbitrary partition, and the choice of daily boundary changes the EMA values and therefore the crossings. Costs are lumpy, and the crossovers cluster in exactly the volatile periods where slippage is worst.

---

#### Assumptions and Failure Modes

- **Assumes trend persistence at the filter's timescale.** In a range-bound market the histogram oscillates around zero and the rule flips repeatedly, paying costs on each flip while capturing nothing. Whipsaw is the defining failure of every crossover system.
- **Assumes lag is acceptable.** The strategy structurally enters after a move has begun and exits after it has ended. In a market whose trends are shorter than the filter's response time, it will be systematically late at both ends.
- **Assumes the parameters transfer.** 12/26/9 was designed for daily equity bars in the 1970s. Applying it unchanged to 5-minute crypto bars or to a rates future is an assumption, not an inheritance.
- **Assumes stationary scale.** Raw MACD values are in price units. Any threshold, comparison, or sizing rule based on the magnitude silently changes meaning as price and volatility drift. See [Stationarity](/quant-math/stationarity).
- **Vulnerable to gap risk.** Crossovers are detected on closes and executed on the next open. Overnight gaps, limit moves, and weekend moves all execute far from the level that triggered the signal.
- **The parameter grid is an overfitting engine.** Fast span, slow span, signal span, confirmation bars, buffer width, long-flat versus long-short, and bar frequency give at least seven degrees of freedom. Reporting the best combination from a grid search says almost nothing about out-of-sample expectation. See [Backtest Overfitting](/stat-methods/backtest-overfitting) and [Multiple Testing](/stat-methods/multiple-testing).
- **Return distribution is negatively skewed at the trade level and positively skewed at the strategy level.** Most trades are small losses; a few are large gains. Truncating the winners with a take-profit removes the part of the distribution the strategy depends on. See [Stop-Loss and Take-Profit Frameworks](/strategies/stop-loss).

---

#### Code

```python
import numpy as np
import pandas as pd


def macd(close, fast=12, slow=26, signal=9):
    """Standard MACD triple. adjust=False gives the recursive form,
    which is what a live streaming implementation computes; adjust=True
    would produce different early values and a backtest/live mismatch.
    """
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    return macd_line, signal_line, macd_line - signal_line


def macd_positions(close, fast=12, slow=26, signal=9,
                   long_short=False, confirm_bars=1, buffer=0.0):
    """Position held from t to t+1 based on the histogram's sign.

    `buffer` is expressed as a fraction of price, not in price units,
    so the deadband means the same thing across assets and across time.
    """
    _, _, histogram = macd(close, fast, slow, signal)
    threshold = buffer * close

    raw = pd.Series(0.0, index=close.index)
    raw[histogram > threshold] = 1.0
    raw[histogram < -threshold] = -1.0 if long_short else 0.0

    # Require the sign to persist before acting, to damp whipsaw.
    confirmed = raw.rolling(confirm_bars).apply(
        lambda w: w[0] if np.all(w == w[0]) else np.nan, raw=True
    )
    return confirmed.ffill().fillna(0.0)
```

---

#### See Also

* [MACD](/signals/macd)
* [Moving Average Crossovers](/signals/ma-crossovers)
* [Simple Momentum on Price](/strategies/momentum)
* [Moving Averages](/signals/moving-averages)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Param Sweeps](/simulation/param-sweeps)

---

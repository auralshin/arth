### Moving Average Crossovers

> info **Metadata** Level: Beginner | Prerequisites: Moving Averages, Momentum vs Mean Reversion | Tags: signals, crossover, trend-following, whipsaw, golden-cross

A crossover rule compares a fast moving average with a slow one and treats the moment they swap places as a change of trend. It is the simplest complete trading signal that exists: two parameters, one comparison, an unambiguous state at every bar. Its simplicity is why it appears in every introductory text, and why it is the standard baseline against which more elaborate trend systems are measured.

It is also the clearest demonstration of the central trade-off in signal design. A crossover cannot fire until the fast average has already moved decisively past the slow one, which means it is always late. Making it earlier means making it noisier. The measured performance of any crossover system is almost entirely determined by whether the instrument trends persistently enough to pay for the false signals, and that property varies enormously across markets and across time.

---

#### Formal Definition

Given a fast window `n_f` and a slow window `n_s` with `n_f` smaller than `n_s`, define the spread:

```text
D(t) = MA_fast(t) - MA_slow(t)
```

where:

- `MA_fast(t)` is the moving average over `n_f` periods
- `MA_slow(t)` is the moving average over `n_s` periods
- `D(t)` is the crossover spread, positive when the fast average is above

The signal is the sign of the spread:

```text
S(t) = +1  if D(t) is positive
S(t) = -1  if D(t) is negative
```

A **crossover event** is a change in `sign(D)` between consecutive bars. A crossover from negative to positive is a *bullish* or *golden* cross; the reverse is a *bearish* or *death* cross. Those names carry no analytical content.

The implementable version must lag the signal:

```text
Position(t) = S(t-1)
```

because `D(t)` uses the close of bar `t`, which is not known until the bar has finished. Backtests that hold `S(t)` over bar `t` earn a return that was never available.

Because a moving average is a linear filter, the spread has a useful interpretation: `D(t)` is the output of a **band-pass filter** on price. It suppresses both very fast fluctuations (removed by the fast average) and very slow drift (removed by subtracting the slow average), leaving movement at intermediate frequencies. The MACD line on [the MACD page](/signals/macd) is exactly this construction with exponential averages.

---

#### Worked Example

Twelve daily closes falling and then recovering, with a 3-period and a 6-period SMA:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td></tr>
    <tr><td><strong>Close</strong></td><td>110</td><td>108</td><td>105</td><td>103</td><td>100</td><td>99</td><td>101</td><td>104</td><td>107</td><td>106</td><td>110</td><td>113</td></tr>
  </tbody>
</table>

Computing both averages from day 6, where the slower one first exists:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td><strong>Close</strong></td><td><strong>SMA(3)</strong></td><td><strong>SMA(6)</strong></td><td><strong>Spread D</strong></td></tr>
    <tr><td>6</td><td>99</td><td>100.67</td><td>104.17</td><td>-3.50</td></tr>
    <tr><td>7</td><td>101</td><td>100.00</td><td>102.67</td><td>-2.67</td></tr>
    <tr><td>8</td><td>104</td><td>101.33</td><td>102.00</td><td>-0.67</td></tr>
    <tr><td>9</td><td>107</td><td>104.00</td><td>102.33</td><td>+1.67</td></tr>
    <tr><td>10</td><td>106</td><td>105.67</td><td>102.83</td><td>+2.83</td></tr>
    <tr><td>11</td><td>110</td><td>107.67</td><td>104.50</td><td>+3.17</td></tr>
    <tr><td>12</td><td>113</td><td>109.67</td><td>106.83</td><td>+2.83</td></tr>
  </tbody>
</table>

Checking day 9 by hand: `SMA(3) = (101 + 104 + 107) / 3 = 312 / 3 = 104.00` and `SMA(6) = (103 + 100 + 99 + 101 + 104 + 107) / 6 = 614 / 6 = 102.33`, so `D = +1.67`.

The spread changes sign between day 8 and day 9. The signal is formed at the day-9 close and the position is taken from day 10.

**Now count the cost of the lag.** The low was 99 on day 6. Entry at the day-9 close of 107 is eight points above it. The series ends at 113, so the rule captured `113 - 107 = 6` points of the `113 - 99 = 14`-point recovery — about 43%. Nothing went wrong here. The rule worked exactly as designed on a series that trended cleanly, and it still surrendered more than half the move to confirmation lag.

> warning **This example contains no whipsaw** A single clean reversal flatters any crossover rule. Insert two or three false starts of one or two bars each — entirely normal in real data — and the same rule pays entry and exit costs on each one while capturing nothing.

---

#### Whipsaw and the Cost of Being Wrong

The failure mode has a name. **Whipsaw** is a rapid sequence of crossovers in a range-bound market, each generating a trade that loses the spread plus a little price. It is not a rare event; it is the default behaviour of a crossover rule whenever price is not trending.

The economics are asymmetric in an instructive way. A crossover system typically has a *low* hit rate — many small losses from whipsaws — offset by a small number of large gains from the trends it does catch. The distribution of outcomes is therefore heavily right-skewed, which means the average trade is a poor summary and the equity curve spends most of its time in drawdown. See [Drawdown](/quant-math/drawdown).

Common attempts to reduce whipsaw, each with a cost:

- **Widen the gap between windows.** Fewer crossovers, later entries.
- **Require a confirmation band.** Act only when the spread exceeds some fraction of [ATR](/signals/atr), so tiny crossings are ignored. This adds a threshold parameter to fit.
- **Require the crossover to persist.** Wait `k` bars before acting. More lag.
- **Add a regime filter.** Trade the crossover only when a trend-strength measure is elevated. This adds a second model that also has to be right.

Every one of these adds parameters. Each parameter is another dimension in which the rule can be overfitted to the sample. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### In Practice Across Asset Classes

**Equities.** The 50-day and 200-day pair is widely watched and widely reported, which makes it a focal point rather than an edge. On single names, crossovers on unadjusted prices break at every split; on indices, they behave more stably because index-level trends are more persistent than single-name trends.

**Futures.** The natural application. Diversified trend-following programmes run crossover-style rules across dozens of contracts precisely because a low hit rate is survivable when spread over many uncorrelated markets. The [roll method](/markets/roll-and-carry) changes the historical averages and can move a crossover date by several sessions.

**FX.** Crossover rules struggle in managed or pegged regimes, where a currency can sit in a narrow band for months, then jump. That is the worst possible shape for a trend rule: sustained whipsaw punctuated by a gap the rule cannot participate in.

**Fixed income.** Applied to yields or futures rather than cash bond prices. Rate trends can be long and policy-driven, which suits crossovers, but the trend and its reversal are both dominated by central bank decisions rather than by price dynamics.

**Crypto.** The absence of session boundaries removes the overnight-gap problem entirely: a 50-period average on 4-hour bars covers a genuinely contiguous stretch of trading. Against that, high volatility means the same percentage confirmation threshold corresponds to a much larger absolute move, and thin weekend books make crossovers on those bars less reliable. Perpetual funding is a running cost of holding the position; see [Funding Rate as a Signal](/signals/funding-rate).

---

#### Assumptions and Failure Modes

- **Assumes trends persist.** The entire rule is a bet on positive return autocorrelation at the horizon implied by `n_s`. If that autocorrelation is absent, the rule is a cost-generating machine. See [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion).
- **Ignores position sizing.** The raw signal is `+1` or `-1` regardless of volatility, so risk per trade varies wildly across regimes. See [Position Sizing](/quant-math/position-sizing).
- **Always in the market.** A two-state rule holds a position permanently, paying financing and funding costs and carrying overnight risk even when the signal is barely distinguishable from zero.
- **Costs scale with signal frequency.** Faster windows mean more trades, and beyond a point the spread paid exceeds any trend captured. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Parameter instability.** The windows that performed best in one sample rarely perform best in the next. A performance surface that is sharply peaked at one parameter pair is evidence of fitting, not of edge.
- **Gap risk.** In markets that close, a crossover formed at the close may only be executable at an open several per cent away. The backtest usually assumes otherwise.
- **Survivorship in the universe.** Crossover systems tested only on instruments that still trade today inherit an upward bias. See [Backtest vs Live](/risk/backtest-vs-live).

---

#### Code

```python
import pandas as pd

def crossover_signal(close: pd.Series, fast: int = 20, slow: int = 50,
                     buffer_frac: float = 0.0) -> pd.DataFrame:
    """Fast/slow crossover with an optional neutral band to damp whipsaw.

    buffer_frac is expressed as a fraction of the slow average, so the
    threshold scales with price level rather than being a fixed number
    that means something different at 10 and at 10,000.
    """
    ma_fast = close.rolling(fast).mean()
    ma_slow = close.rolling(slow).mean()
    spread = ma_fast - ma_slow
    band = buffer_frac * ma_slow

    raw = pd.Series(0, index=close.index, dtype=float)
    raw[spread > band] = 1.0
    raw[spread < -band] = -1.0
    # Inside the band, hold the previous state instead of flattening.
    state = raw.replace(0.0, pd.NA).ffill().fillna(0.0).astype(float)

    return pd.DataFrame(
        {
            "spread": spread,
            # Lag by one bar: the spread uses bar t's close, so the
            # earliest actable bar is t+1.
            "position": state.shift(1).fillna(0.0),
            "crossovers": state.diff().abs().gt(0).astype(int),
        }
    )
```

---

#### See Also

* [Moving Averages](/signals/moving-averages)
* [MACD](/signals/macd)
* [ATR](/signals/atr)
* [Momentum Strategy](/strategies/momentum)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)

---

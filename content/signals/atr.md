### Average True Range (ATR)

> info **Metadata** Level: Intermediate | Prerequisites: Volatility, Moving Averages | Tags: signals, atr, volatility, true-range, position-sizing, wilder-smoothing

**Average True Range (ATR)** measures how far an instrument typically moves in a bar, in the instrument's own price units. It is not a directional signal and was never intended as one. J. Welles Wilder introduced it in 1978 alongside RSI, specifically to handle a problem that plain high-minus-low ignores: in markets that close, price can move a long way between one bar's close and the next bar's open, and that movement is real risk that never appears inside any single bar's range.

ATR is the workhorse volatility measure of practical trading systems — used to set stop distances, to size positions so each carries similar risk, and to normalise other indicators so a threshold means the same thing on a €40 stock and a €4,000 index. Its usefulness comes from being denominated in price rather than in return space: a stop placed two ATR below entry is directly implementable, whereas a stop placed at "two standard deviations of log returns" requires a conversion at every step.

---

#### Formal Definition

The **true range** of bar `t` is the largest of three candidate distances:

```text
TR_t = max( H_t - L_t,  |H_t - C_{t-1}|,  |L_t - C_{t-1}| )
```

where:

- `H_t` is the bar's high
- `L_t` is the bar's low
- `C_{t-1}` is the previous bar's close

The first term is the bar's own range. The second and third measure the distance from the previous close to this bar's extremes, and one of them dominates whenever the bar opened away from where the last one finished. True range is therefore always at least the bar range and strictly greater when there is a gap. It is non-negative by construction.

The **average true range** smooths `TR` over `n` periods using Wilder's recursion:

```text
ATR_n(t) = ((n - 1) * ATR_n(t-1) + TR_t) / n
```

seeded with the simple average of the first `n` true ranges. The conventional period is 14.

> warning **Wilder's smoothing is not an EMA of span n** Wilder's recursion is equivalent to an exponential average with `alpha = 1 / n`, whereas the standard EMA convention uses `alpha = 2 / (n + 1)`. A Wilder ATR(14) therefore behaves like an EMA of span 27, roughly twice as smooth as `ewm(span=14)`. Some libraries use an SMA of true ranges instead, giving a third variant. All three ship under the name "ATR(14)". Passing the period straight into an EMA function is the most common indicator bug in circulation.

Because ATR carries price units, comparisons across instruments need the normalised form:

```text
ATRP_t = 100 * ATR_t / C_t
```

which expresses typical bar movement as a percentage of price. This is the form to use in any cross-sectional ranking.

---

#### Worked Example

Seven daily bars, with `n = 5`. The close before day 1 was 100.

<table>
  <tbody>
    <tr>
      <td><strong>Day</strong></td>
      <td><strong>High</strong></td>
      <td><strong>Low</strong></td>
      <td><strong>Close</strong></td>
      <td><strong>Prev close</strong></td>
      <td><strong>H − L</strong></td>
      <td><strong>|H − Cp|</strong></td>
      <td><strong>|L − Cp|</strong></td>
      <td><strong>TR</strong></td>
    </tr>
    <tr><td>1</td><td>103</td><td>99</td><td>102</td><td>100</td><td>4</td><td>3</td><td>1</td><td><strong>4</strong></td></tr>
    <tr><td>2</td><td>104</td><td>100</td><td>101</td><td>102</td><td>4</td><td>2</td><td>2</td><td><strong>4</strong></td></tr>
    <tr><td>3</td><td>106</td><td>101</td><td>105</td><td>101</td><td>5</td><td>5</td><td>0</td><td><strong>5</strong></td></tr>
    <tr><td>4</td><td>108</td><td>104</td><td>107</td><td>105</td><td>4</td><td>3</td><td>1</td><td><strong>4</strong></td></tr>
    <tr><td>5</td><td>107</td><td>104</td><td>106</td><td>107</td><td>3</td><td>0</td><td>3</td><td><strong>3</strong></td></tr>
    <tr><td>6</td><td>113</td><td>109</td><td>112</td><td>106</td><td>4</td><td>7</td><td>3</td><td><strong>7</strong></td></tr>
    <tr><td>7</td><td>113</td><td>110</td><td>111</td><td>112</td><td>3</td><td>1</td><td>2</td><td><strong>3</strong></td></tr>
  </tbody>
</table>

**Step 1 — seed the ATR** from the first five true ranges:

```text
ATR(day 5) = (4 + 4 + 5 + 4 + 3) / 5 = 20 / 5 = 4.00
```

**Step 2 — day 6 is the interesting one.** The bar opened above the previous close and its own high-to-low range was only 4 — no larger than several quiet days before it. But the gap from the previous close of 106 to the high of 113 was 7, and true range picks that up:

```text
TR(day 6)  = max(4, 7, 3) = 7
ATR(day 6) = (4.00 * 4 + 7) / 5 = 23 / 5 = 4.60
```

**Step 3 — day 7**, an ordinary bar:

```text
TR(day 7)  = max(3, 1, 2) = 3
ATR(day 7) = (4.60 * 4 + 3) / 5 = 21.4 / 5 = 4.28
```

**Step 4 — normalise**: at a close of 111, `ATRP = 100 * 4.28 / 111 = 3.86%`.

The lesson sits in day 6. Bar range alone would have recorded a completely unremarkable session and left ATR at 4.00. True range recorded a 7-point move, because a trader holding overnight was genuinely exposed to that 7 points. Any risk measure built on intraday range alone systematically understates the risk of holding through a close.

---

#### What ATR Is For

ATR earns its place in three roles, none of them directional.

**Stop placement.** A stop set at a fixed number of points is tight in a volatile regime and loose in a calm one. A stop at `entry - m * ATR` adapts automatically, keeping the probability of being stopped out by ordinary noise roughly stable as volatility changes. The multiplier `m` is a fitted parameter and typically sits between 1.5 and 4 in published systems. See [Stop Losses](/strategies/stop-loss).

**Position sizing.** The standard volatility-targeting construction sizes each position so that an adverse move of one ATR costs a fixed fraction of capital:

```text
Units = (Capital * RiskFraction) / (m * ATR)
```

Two instruments with very different price levels and volatilities then contribute comparable risk. This is the single most valuable application of ATR, and it is why trend-following programmes running dozens of futures markets can hold them all at once without one contract dominating. See [Position Sizing](/quant-math/position-sizing) and [Dynamic Sizing](/strategies/dynamic-sizing).

**Normalising other signals.** Expressing a [MACD](/signals/macd) spread or a [crossover](/signals/ma-crossovers) buffer in ATR units makes a threshold portable across instruments. "The fast average is 0.5 ATR above the slow one" means something comparable everywhere; "the fast average is 2.5 points above" does not.

ATR is often compared with the standard deviation of returns. They measure related things differently: ATR uses intraday extremes and gaps, is denominated in price, and responds quickly to a single wide bar; return standard deviation uses close-to-close changes only, is denominated in per cent, and ignores what happened inside the bar. Range-based estimators are generally more efficient per observation than close-to-close ones, because a high and a low carry more information about the path than a single close. See [Volatility](/quant-math/volatility).

---

#### In Practice Across Asset Classes

**Equities.** This is the setting ATR's gap handling was designed for. Earnings releases, guidance updates and index changes land outside the session, so a large share of a single name's meaningful moves arrive as opening gaps. On a daily bar those moves are invisible to high-minus-low and fully visible to true range. Unadjusted prices must be avoided: an ex-dividend drop or a split registers as an enormous true range that inflates ATR for weeks. See [Corporate Actions](/markets/corporate-actions).

**Futures.** Most liquid contracts trade nearly around the clock, so the daily settlement-to-open gap is smaller than in cash equities, but it is not zero — a weekend or holiday break still concentrates news into one reopening print. Rolls matter a great deal: on a raw stitched series the roll date shows a true range equal to the calendar spread, which is a data artefact rather than risk. Back-adjustment removes it. See [Futures 101](/markets/futures-101) and [Roll and Carry](/markets/roll-and-carry).

**FX.** Weekday trading is essentially continuous, so within-week gaps are small and ATR converges toward the simple bar range. The weekend gap is the exception, and it is the one that matters, since it is unhedgeable for anyone holding through Friday's close.

**Fixed income.** ATR on bond prices is dominated by duration, so the same yield move produces a much larger ATR on a long bond than a short one. Comparing ATR across maturities without a duration adjustment compares the instruments' sensitivities rather than the market's movement.

**Crypto.** Continuous trading means `C_{t-1}` equals the price at which bar `t` opens, so the gap terms almost never bind and true range collapses to high minus low. **ATR is therefore near-equivalent to average bar range in crypto, and its distinguishing feature adds nothing.** That is not a criticism of the indicator — it correctly reports that there is no overnight gap risk to capture — but it does mean the reason to prefer ATR over a simpler range average is absent. The exception is exchange downtime or a venue halt, where a genuine gap reappears. Normalised `ATRP` is essential here, since crypto instruments span many orders of magnitude in price.

---

#### Assumptions and Failure Modes

- **Requires trustworthy highs and lows.** A single erroneous print, a wick from a thin book, or a stop-hunt spike sets the bar's extreme and enters true range at full weight. Data cleaning is not optional. See [Cleaning Data](/data-tooling/cleaning).
- **Not directional and not predictive of direction.** Rising ATR says movement is getting larger, not which way. Reading expanding ATR as a trend signal is a category error.
- **Backward-looking.** ATR reports realised movement. Volatility clusters, so it has some persistence, but it responds to a regime change only after that change has produced wide bars. See [GARCH](/stat-methods/garch).
- **Asymmetric response.** Wilder's recursion rises quickly on one wide bar and decays slowly. After a shock, ATR stays elevated for many periods, which widens stops and shrinks position sizes for longer than the market may warrant.
- **Price units, not comparable.** Raw ATR cannot be compared across instruments or across time for the same instrument if the price level has changed materially. Use `ATRP`.
- **Smoothing convention.** Wilder, EMA(span=n) and SMA variants all circulate as "ATR". Any multiplier calibrated on one is wrong for the others by a meaningful factor.
- **Contract and corporate-action artefacts.** Rolls, splits and dividends create true ranges that reflect bookkeeping rather than market risk.
- **Circularity in sizing.** Volatility-targeted sizing shrinks exposure after volatility rises, which can mean cutting risk at the point of maximum dislocation and rebuilding it into calm that precedes the next shock.

---

#### Code

```python
import pandas as pd

def true_range(high: pd.Series, low: pd.Series, close: pd.Series) -> pd.Series:
    """True range: bar range, extended to cover any gap from the prior close."""
    prev_close = close.shift(1)
    return pd.concat(
        [high - low, (high - prev_close).abs(), (low - prev_close).abs()],
        axis=1,
    ).max(axis=1)


def atr(high: pd.Series, low: pd.Series, close: pd.Series,
        period: int = 14, method: str = "wilder") -> pd.Series:
    """Average true range.

    'wilder' is the original: alpha = 1/n, equivalent to an EMA of span
    2n-1. Passing period straight to ewm(span=period) gives something
    roughly twice as responsive, so any stop multiplier calibrated on one
    convention is miscalibrated on the other.
    """
    tr = true_range(high, low, close)
    if method == "wilder":
        return tr.ewm(alpha=1 / period, adjust=False).mean()
    if method == "ema":
        return tr.ewm(span=period, adjust=False).mean()
    return tr.rolling(period).mean()


def atr_position_size(capital: float, risk_fraction: float,
                      atr_value: float, stop_multiple: float = 2.0) -> float:
    """Units such that an adverse move of stop_multiple ATR costs
    risk_fraction of capital. Assumes one unit of price move equals one
    currency unit of P&L; scale by the contract multiplier otherwise."""
    return (capital * risk_fraction) / (stop_multiple * atr_value)
```

---

#### See Also

* [Bollinger Bands](/signals/bollinger)
* [Volatility](/quant-math/volatility)
* [Position Sizing](/quant-math/position-sizing)
* [Stop Losses](/strategies/stop-loss)
* [GARCH](/stat-methods/garch)
* [Leverage and Liquidation](/risk/leverage-liquidation)

---

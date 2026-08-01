### On-Balance Volume (OBV)

> info **Metadata** Level: Beginner | Prerequisites: Volume, Moving Averages | Tags: signals, obv, volume, flow, divergence, accumulation

**On-Balance Volume (OBV)** is a running total of volume, added when the close is higher than the previous close and subtracted when it is lower. Joseph Granville popularised it in the 1960s under a simple thesis: volume precedes price, so a market being quietly accumulated will show rising cumulative volume before the price itself breaks out.

The construction is crude by design. It ignores how far the price moved, treating a 0.01% gain and a 5% gain identically — a full unit of volume is credited to whichever side the close happened to fall on. That crudeness is both its weakness and the reason it is easy to reason about: OBV is a cumulative sign-weighted volume series, nothing more. Understanding what that quantity can and cannot represent is most of the work of using it responsibly.

---

#### Formal Definition

OBV is defined recursively:

```text
OBV_t = OBV_{t-1} + V_t   if C_t is above C_{t-1}
OBV_t = OBV_{t-1} - V_t   if C_t is below C_{t-1}
OBV_t = OBV_{t-1}         if C_t equals C_{t-1}
```

where:

- `C_t` is the close of bar `t`
- `V_t` is the volume traded during bar `t`
- `OBV_0` is an arbitrary starting value, conventionally 0

Equivalently, in one line:

```text
OBV_t = sum_{i=1}^{t} sign(C_i - C_{i-1}) * V_i
```

Two structural properties follow immediately.

**The level is meaningless; only changes are informative.** Because `OBV_0` is arbitrary and the series is a cumulative sum, the absolute value of OBV depends entirely on where the calculation started. Comparing OBV levels across instruments, or against any fixed number, is meaningless. Only its slope and its shape carry information.

**It is non-stationary by construction.** A cumulative sum of a series with any persistent drift is a random-walk-like process. That matters for anyone feeding OBV into a regression or a machine-learning model: raw OBV violates the stationarity assumptions those methods rely on. The usual fix is to difference it, or to use the deviation of OBV from its own moving average, both of which are stationary in a way the raw level is not. See [Stationarity](/quant-math/stationarity) and [Unit Roots](/stat-methods/unit-roots).

Several relatives soften the all-or-nothing weighting:

<table>
  <tbody>
    <tr><td><strong>Indicator</strong></td><td><strong>Volume weight per bar</strong></td><td><strong>Difference from OBV</strong></td></tr>
    <tr><td>On-Balance Volume</td><td><code>+V</code> or <code>-V</code> by the sign of the close change</td><td>Baseline; ignores magnitude entirely</td></tr>
    <tr><td>Price-Volume Trend</td><td><code>V * (C_t - C_prev) / C_prev</code></td><td>Scales by the percentage move, so small changes count less</td></tr>
    <tr><td>Accumulation/Distribution</td><td><code>V * ((C - L) - (H - C)) / (H - L)</code></td><td>Uses the close's position within the bar rather than bar-to-bar change</td></tr>
    <tr><td>Chaikin Money Flow</td><td>Accumulation/Distribution summed over <code>n</code> bars, divided by volume over <code>n</code> bars</td><td>Bounded and stationary, unlike the cumulative forms</td></tr>
  </tbody>
</table>

---

#### Worked Example

Ten daily bars with closes and volumes in thousands of shares:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
    <tr><td><strong>Close</strong></td><td>100</td><td>102</td><td>101</td><td>105</td><td>107</td><td>106</td><td>110</td><td>112</td><td>111</td><td>115</td></tr>
    <tr><td><strong>Volume (000s)</strong></td><td>500</td><td>620</td><td>480</td><td>900</td><td>540</td><td>610</td><td>1100</td><td>700</td><td>450</td><td>1250</td></tr>
  </tbody>
</table>

Starting from `OBV_1 = 0` and applying the rule bar by bar:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td><strong>Close change</strong></td><td><strong>Volume</strong></td><td><strong>Contribution</strong></td><td><strong>OBV</strong></td></tr>
    <tr><td>1</td><td>—</td><td>500</td><td>—</td><td>0</td></tr>
    <tr><td>2</td><td>+2</td><td>620</td><td>+620</td><td>620</td></tr>
    <tr><td>3</td><td>-1</td><td>480</td><td>-480</td><td>140</td></tr>
    <tr><td>4</td><td>+4</td><td>900</td><td>+900</td><td>1,040</td></tr>
    <tr><td>5</td><td>+2</td><td>540</td><td>+540</td><td>1,580</td></tr>
    <tr><td>6</td><td>-1</td><td>610</td><td>-610</td><td>970</td></tr>
    <tr><td>7</td><td>+4</td><td>1100</td><td>+1,100</td><td>2,070</td></tr>
    <tr><td>8</td><td>+2</td><td>700</td><td>+700</td><td>2,770</td></tr>
    <tr><td>9</td><td>-1</td><td>450</td><td>-450</td><td>2,320</td></tr>
    <tr><td>10</td><td>+4</td><td>1250</td><td>+1,250</td><td>3,570</td></tr>
  </tbody>
</table>

Over the ten days price rose from 100 to 115 and OBV rose from 0 to 3,570. Both trend upward, which is the unremarkable case: OBV confirms what price already said.

**Now look at what drove it.** Days 3, 6 and 9 were each down closes of exactly one point, and they subtracted 480, 610 and 450 respectively — a total of 1,540 removed for cumulative price movement of `-3`. Days 4, 7 and 10 were up closes of four points and added 3,250. The advance is 15 points on 3,570 net volume units, but had day 9's volume been 1,600 instead of 450 for the very same one-point decline, OBV would have finished at 2,420 and drawn a visibly weaker picture of the identical price path.

That is the mechanism to keep in mind: **OBV's shape is determined by which bars happened to be high-volume, not by how much price moved on them.** A single heavy day on a one-tick change can dominate the series.

---

#### Divergence, and Why It Is Hard to Test

The primary claimed use of OBV is **divergence**: price makes a new high while OBV does not, which is read as an advance occurring on diminishing participation.

The underlying intuition is not empty. If a rally is driven by a shrinking pool of buyers, it is more fragile than one with broad participation. But turning this into a testable signal runs into three problems at once.

- **It has no canonical definition.** Which highs are compared? Over what lookback? How much lower must OBV be to count? Every answer is a parameter, and the literature specifies none of them.
- **It is identified with hindsight.** A "divergence" is visible only once the subsequent move has confirmed which peak mattered. Marking divergences on a chart after the fact is not a procedure that could have been run in real time.
- **It is confounded with volume seasonality.** Volume follows strong intraday, weekly and calendar patterns. An apparent divergence into a holiday period or a summer lull often reflects the calendar rather than participation.

A more testable formulation compares the slope of OBV over `k` bars with the slope of price over the same window, both standardised. That produces a continuous, stationary feature that can be evaluated with an [information coefficient](/signals/what-is-signal) rather than judged by eye. It is a weaker claim than the divergence folklore, but it is one that can actually be measured.

> warning **Volume-based indicators are widely used and thinly evidenced** OBV is one of the most-cited technical indicators, and the published evidence for its predictive value is far weaker than its prominence suggests. Treat it as a descriptive feature worth testing, not as an established effect.

---

#### In Practice Across Asset Classes

**Equities.** The natural setting. Consolidated tape volume is well defined for listed names, though a substantial fraction of activity executes off primary exchanges, so what a data vendor reports as "volume" depends on which venues and trade conditions it includes. Off-exchange and auction prints can arrive in large blocks that dominate a bar. Volume must also be adjusted for splits alongside price, or the historical series is inconsistent.

**Futures.** Volume is exchange-reported and reliable, but it is split across expiries. OBV on the front month alone breaks at each [roll](/markets/roll-and-carry) when liquidity migrates to the next contract; aggregate volume across all expiries is more stable but mixes instruments with different exposures. Futures volume also includes hedging and spread flow that carries no directional view at all, which weakens the accumulation interpretation considerably.

**FX.** Spot FX has no central exchange and therefore **no reliable volume figure**. What platforms display is volume on one venue or one aggregator, a small and non-random slice of a fragmented market. OBV on spot FX is computed on a sample of unknown representativeness. Currency futures do have real volume and are the sounder alternative.

**Fixed income.** Cash bond trading is largely bilateral and reported with delays and size caps in most jurisdictions, so volume is incomplete by regulatory design. Futures again provide the usable series.

**Crypto.** Volume is reported per venue and is not consolidated, so OBV differs across exchanges for the same asset. Reported volumes have historically included wash trading on some venues, which corrupts the input directly rather than merely adding noise — and OBV, being a cumulative sum, never forgets a corrupted bar. Continuous trading does remove the session-boundary problem: an `n`-bar volume comparison covers contiguous trading rather than sessions separated by closed markets. On-chain venues have the opposite property from spot FX: every swap is publicly recorded, so volume is verifiable, though it is fragmented across pools and chains. See [Volume and Liquidity-Aware Indicators](/signals/volume).

---

#### Assumptions and Failure Modes

- **Assumes the sign of the close change identifies buying pressure.** It does not. Every trade has a buyer and a seller; a rising close means demand was more aggressive, not that "more volume was bought". True order-flow imbalance requires trade-level signing, which bar data cannot provide. See [Adverse Selection](/execution/adverse-selection).
- **Ignores magnitude.** A one-tick move and a limit move receive the same treatment. Price-Volume Trend and Accumulation/Distribution address this; OBV does not.
- **Non-stationary and path-dependent.** The level depends on the arbitrary start point and never resets. Any model consuming raw OBV inherits a unit root.
- **Permanently sensitive to bad data.** One erroneous volume print is absorbed into the running total and shifts every subsequent value forever. Mean-based indicators eventually forget errors; OBV cannot.
- **Volume seasonality is unmodelled.** Holidays, index rebalances, expiries and month-ends all move volume for reasons unrelated to conviction.
- **Gaps have no volume interpretation.** A large overnight gap in equities registers as a big directional bar, but the move happened when almost nothing traded.
- **Divergence is not a testable rule as usually stated.** Without a fixed definition of which peaks to compare, backtests of divergence are exercises in hindsight.

---

#### Code

```python
import numpy as np
import pandas as pd

def on_balance_volume(close: pd.Series, volume: pd.Series) -> pd.Series:
    """Cumulative sign-weighted volume. The level is arbitrary — only the
    slope and shape carry information."""
    direction = np.sign(close.diff()).fillna(0.0)
    return (direction * volume).cumsum()


def obv_features(close: pd.Series, volume: pd.Series, window: int = 20
                 ) -> pd.DataFrame:
    """Stationary features derived from OBV.

    Raw OBV has a unit root, so feeding it to a regression or a tree model
    violates the assumptions those methods rest on. Both features below
    are differences or ratios, which removes the accumulated level.
    """
    obv = on_balance_volume(close, volume)
    obv_slope = obv.diff(window) / volume.rolling(window).sum()
    price_slope = close.pct_change(window)

    return pd.DataFrame(
        {
            "obv": obv,
            # OBV change over the window, normalised by volume traded in it,
            # so the feature is comparable across instruments and regimes.
            "obv_slope": obv_slope,
            "price_slope": price_slope,
            # Positive when OBV is rising faster than price: the testable
            # form of the divergence idea.
            "flow_minus_price": obv_slope - price_slope,
        }
    )
```

---

#### See Also

* [Volume and Liquidity-Aware Indicators](/signals/volume)
* [Liquidity and Depth as Features](/signals/liquidity)
* [What Is a Trading Signal?](/signals/what-is-signal)
* [Stationarity](/quant-math/stationarity)
* [Adverse Selection](/execution/adverse-selection)
* [Cleaning Data](/data-tooling/cleaning)

---

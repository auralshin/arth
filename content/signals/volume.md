### Volume and Liquidity-Aware Indicators

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Rolling Windows | Tags: signals, volume, vwap, participation, execution, dollar-volume

Volume is the quantity traded in a period. It is the second dimension of every price series and, unlike price, it is a direct measurement of activity rather than of a negotiated level. A price of 100 tells you where the last transaction cleared; a volume of 6 million tells you how much conviction stood behind that clearing, and how much size the market could absorb.

Volume enters quantitative work in two distinct roles that are worth keeping separate. As a **feature**, volume and its transformations are inputs to a return forecast — the claim being that unusual activity says something about what happens next. As an **execution input**, volume determines how much you can trade and what it will cost, which is a claim about implementation rather than about direction. The second role is far better established than the first. Volume is a reliable measure of capacity and a much less reliable predictor of returns, and conflating the two is the standard mistake.

---

#### Formal Definition

**Volume-weighted average price (VWAP)** is the average transaction price over a window, weighted by size:

```text
VWAP = sum(P_i * V_i) / sum(V_i)
```

where:

- `P_i` is the price of trade or bar `i`
- `V_i` is the quantity traded at that price
- the sum runs over the window, conventionally from the session open

When computed from bars rather than trades, `P_i` is usually the **typical price** `(H_i + L_i + C_i) / 3`. This is an approximation to the true trade-weighted average, and the approximation error grows with bar length.

**Dollar volume** (or notional volume) is the currency value traded:

```text
DV_t = P_t * V_t
```

Share or contract counts are not comparable across instruments; dollar volume is. Any cross-sectional work on liquidity should use it.

**Relative volume (RVOL)** compares current activity with a baseline:

```text
RVOL_t = V_t / median(V_{t-n} ... V_{t-1})
```

The median is preferred to the mean because volume distributions are heavily right-skewed — a handful of expiry or index-rebalance days would otherwise dominate the baseline.

**Volume z-score** measures the same thing on a standardised scale:

```text
z_t = (V_t - mean_n(V)) / sd_n(V)
```

Because raw volume is right-skewed and non-stationary — it trends with market growth and cycles with volatility — most practitioners standardise `log(V)` rather than `V` itself, which is closer to symmetric and better behaved.

> info **Volume is not order flow** Volume counts what traded. It says nothing about who initiated. Every transaction has a buyer and a seller, so "buying volume" is only definable once trades are signed against the prevailing quote — which requires trade-level data, not bars. See [Liquidity and Depth as Features](/signals/liquidity).

---

#### Worked Example

Five intraday bars for a single instrument. Typical price is `(H + L + C) / 3`, precomputed here.

<table>
  <tbody>
    <tr><td><strong>Bar</strong></td><td><strong>Typical price</strong></td><td><strong>Volume</strong></td><td><strong>Price × Volume</strong></td></tr>
    <tr><td>1</td><td>100.5</td><td>1,200</td><td>120,600</td></tr>
    <tr><td>2</td><td>101.0</td><td>800</td><td>80,800</td></tr>
    <tr><td>3</td><td>100.0</td><td>2,000</td><td>200,000</td></tr>
    <tr><td>4</td><td>99.5</td><td>1,500</td><td>149,250</td></tr>
    <tr><td>5</td><td>100.8</td><td>500</td><td>50,400</td></tr>
    <tr><td><strong>Total</strong></td><td>—</td><td><strong>6,000</strong></td><td><strong>601,050</strong></td></tr>
  </tbody>
</table>

**Step 1 — VWAP**:

```text
VWAP = 601,050 / 6,000 = 100.175
```

**Step 2 — compare with the unweighted average**:

```text
Simple mean = (100.5 + 101.0 + 100.0 + 99.5 + 100.8) / 5 = 501.8 / 5 = 100.36
```

VWAP is 0.185 lower. The two highest-volume bars (3 and 4, together 58% of the day's turnover) traded at 100.0 and 99.5, while the highest price of 101.0 occurred on a bar of just 800 units. The unweighted average gives that thin bar the same standing as the heavy ones; VWAP does not. A buyer who filled at the simple mean paid 18.5 basis points above the volume-weighted level — the difference between an execution benchmark that reflects where trading actually happened and one that does not.

**Step 3 — relative volume.** Suppose the trailing 20 sessions had a median volume of 4,000, a mean of 4,200, and a standard deviation of 900:

```text
RVOL   = 6,000 / 4,000 = 1.50
z      = (6,000 - 4,200) / 900 = 2.00
```

The day traded 50% above its typical level, two standard deviations above the mean. Note that the median and mean differ by 5% here, which is the skew showing: over a longer sample, with expiries and rebalances included, the gap is usually wider and the choice of baseline matters more than it appears.

**Step 4 — dollar volume**: `6,000 * 100.175 = €601,050`. This is the figure to compare against another instrument, never the 6,000.

---

#### What Volume Is Actually Good For

**Execution benchmarking.** VWAP is the most widely used execution benchmark in equities. An order filled below the day's VWAP on a buy is, by that measure, well executed. The benchmark has a well-known weakness: it is gameable, because a trader who simply follows the volume curve will match VWAP almost by construction while taking no view on whether the timing was any good. See [TWAP and VWAP](/execution/twap-vwap) and [Execution Benchmarks](/execution/execution-benchmarks).

**Participation limits.** Sizing an order as a percentage of expected volume — a participation-of-volume schedule — is the standard way to control [market impact](/execution/market-impact). This requires a volume *forecast*, which is a separate and quite tractable modelling problem: volume has strong, stable intraday and day-of-week patterns.

**Alternative bar construction.** Sampling by clock time gives bars with wildly varying information content — a bar during a quiet lunch hour and a bar during the close contain very different amounts of trading. Sampling by volume or by dollar volume instead produces bars with more uniform statistical properties, closer to identically distributed returns. This is a meaningful improvement for any model that assumes it. See [Feature Engineering](/ml-finance/feature-engineering) and [Time Series Data](/data-tooling/time-series).

**Confirmation, weakly.** A move on unusually high volume is more likely to reflect information arrival than a move on thin volume, which is more likely to reflect a liquidity event. This is the honest core of "volume confirms price". It is a statement about the *interpretation* of a move, not a forecast of the next one, and the evidence for it as a standalone return predictor is thin.

<table>
  <tbody>
    <tr><td><strong>Use</strong></td><td><strong>Evidential standing</strong></td></tr>
    <tr><td>Estimating tradeable capacity</td><td>Strong — volume directly bounds what can be traded without moving price</td></tr>
    <tr><td>Forecasting future volume</td><td>Strong — intraday and weekly patterns are stable and well documented</td></tr>
    <tr><td>Benchmarking execution quality</td><td>Strong, with the gaming caveat above</td></tr>
    <tr><td>Predicting return direction</td><td>Weak — widely claimed, poorly supported, and heavily overfitted in practice</td></tr>
  </tbody>
</table>

---

#### In Practice Across Asset Classes

**Equities.** Volume is well defined on the consolidated tape, but a large share of activity executes away from primary exchanges, so vendor figures differ depending on which venues and trade conditions are included. The intraday shape is a pronounced U — heavy at the open and close, thin at midday — and the closing auction alone can account for a large fraction of the day. Volume must be split-adjusted alongside price. Index rebalance days and expiry days produce volume that is mechanical rather than informational.

**Futures.** Exchange-reported and clean, but fragmented across expiries. Front-month volume collapses through the [roll](/markets/roll-and-carry) and appears in the next contract, which produces a spurious volume signal in any series that follows the front month naively. A material share of futures volume is hedging and spread trading with no directional view.

**FX.** Spot FX has **no consolidated volume**, because it trades bilaterally across many venues with no central reporting. What a platform displays is its own flow. Any volume indicator on spot FX is computed on a non-random slice of unknown size. Currency futures and options do have exchange-reported volume, which is why positioning analysis in FX tends to route through them.

**Fixed income.** Cash bond volume is reported with delays and size caps under most reporting regimes, so the published series is incomplete by design and least complete precisely for the large trades that matter most. Futures volume is reliable.

**Crypto.** Volume is per-venue and unconsolidated, and reported figures have historically included wash trading on some exchanges — a data-integrity problem rather than a noise problem, since the fabricated volume is designed to look real. Continuous trading removes the U-shaped intraday pattern that dominates equity volume forecasting, though weekly seasonality persists and weekends are consistently thinner. On-chain venues invert the reliability picture entirely: every swap is publicly recorded and independently verifiable, so volume is auditable, at the cost of being fragmented across pools, chains and routers. See [On-Chain Activity Signals](/signals/onchain-activity).

---

#### Assumptions and Failure Modes

- **Assumes reported volume is complete and honest.** It is complete on futures exchanges, partial in equities and cash bonds, absent in spot FX, and of uneven integrity in crypto. The indicator is only as sound as this.
- **Volume is non-stationary.** It trends with market growth and cycles with volatility. Raw levels are not comparable across years; normalise against a trailing baseline.
- **Heavy right skew.** A few days dominate any mean. Use medians for baselines and log transforms before standardising.
- **Strong seasonality.** Intraday shape, day of week, holidays, expiries, month-ends and rebalance dates all move volume for structural reasons. Failing to deseasonalise turns the calendar into a signal.
- **Volume is not direction.** Signing requires trade-level data and a classification rule, and every such rule has an error rate that rises in fast markets.
- **Bar-level VWAP is an approximation.** Using typical price times bar volume is not the true trade-weighted average, and the error grows with bar length and with intra-bar volatility.
- **Look-ahead in session-anchored measures.** Full-session VWAP is only known at the close. Using it to make decisions earlier in that same session is a look-ahead bug, and a common one.
- **Volume-based predictive claims are heavily overfitted.** The space of volume transformations is large and the underlying signal is weak, which is an ideal environment for false discoveries. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### Code

```python
import numpy as np
import pandas as pd

def vwap(high, low, close, volume, anchor=None) -> pd.Series:
    """Volume-weighted average price from OHLCV bars.

    anchor: a grouping key (e.g. session date) to reset the accumulation.
    Leave it None for a running VWAP over the whole series. Note that a
    session VWAP is only complete at the session close — using it earlier
    in that same session is look-ahead.
    """
    typical = (high + low + close) / 3.0
    notional = typical * volume
    if anchor is None:
        return notional.cumsum() / volume.cumsum()
    return notional.groupby(anchor).cumsum() / volume.groupby(anchor).cumsum()


def volume_features(close: pd.Series, volume: pd.Series, window: int = 20
                    ) -> pd.DataFrame:
    """Normalised volume features suitable as model inputs.

    Baselines are shifted by one bar so the current observation is not
    part of its own reference distribution. log volume is standardised
    rather than raw volume, because the raw distribution is strongly
    right-skewed and a z-score on it is dominated by a few outliers.
    """
    baseline = volume.shift(1).rolling(window)
    log_volume = np.log(volume.replace(0, np.nan))
    log_baseline = log_volume.shift(1).rolling(window)

    return pd.DataFrame(
        {
            "dollar_volume": close * volume,
            "rvol": volume / baseline.median(),
            "log_volume_z": (log_volume - log_baseline.mean()) / log_baseline.std(ddof=1),
        }
    )
```

---

#### See Also

* [On-Balance Volume](/signals/obv)
* [Liquidity and Depth as Features](/signals/liquidity)
* [TWAP and VWAP](/execution/twap-vwap)
* [Market Impact](/execution/market-impact)
* [Feature Engineering](/ml-finance/feature-engineering)
* [Slippage](/microstructure/slippage)

---

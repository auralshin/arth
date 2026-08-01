### Getting Historical Time Series

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Market Data Sources | Tags: time-series, bars, ticks, resampling, timezones, sessions

A price time series looks like the most primitive object in quantitative finance, which is exactly why it goes unexamined. Before any of it is true, someone chose what counts as an observation: which prints were included, what a timestamp refers to, when a bar starts and ends, and what happens on days the market only half opened. Those choices are baked into the file and are rarely documented alongside it.

The consequences are not cosmetic. Sampling by clock time gives more weight to quiet periods than to active ones, so a volatility estimate computed from time bars describes the calendar as much as the market. Aligning two instruments on a naive timestamp join can shift one of them by a session. Both errors survive every statistical test you might run afterwards, because the data is internally consistent — it is just not measuring what you think.

---

#### Ticks, Quotes, and Bars

Three distinct records are commonly conflated:

- **Trades (the tape).** Executions: timestamp, price, size, and usually a condition code marking auctions, late reports, and off-book prints. Trades tell you where business was actually done.
- **Quotes.** The best bid and offer, with sizes, updating far more frequently than trades. Quotes tell you where you could have transacted, and their midpoint is often a better price estimate than the last trade — especially in wide markets, where the last trade sits on one side of a spread and jitters between them.
- **Bars.** Aggregations over an interval: open, high, low, close, volume, and sometimes trade count and volume-weighted average price. A bar is lossy by construction. High and low tell you the range but not the path, and the close is a single print that may be unrepresentative.

Which you need follows from the question. Anything about execution cost, spread, or adverse selection requires quotes; bars cannot answer it. See [Transaction Cost Analysis](/execution/transaction-cost-analysis) and [Slippage](/microstructure/slippage). Anything about daily or weekly return behaviour is well served by bars, and pulling ticks for it is an expensive way to get the same answer.

> warning **Last trade is not the price** In an illiquid instrument the last trade can be hours old and on the wrong side of a spread that has since moved. Mid-quote, where available, is the more honest mark — and the gap between the two is itself information about liquidity.

---

#### Sampling Schemes

A bar closes when some accumulator crosses a threshold. The choice of accumulator is the sampling scheme.

<table>
  <tbody>
    <tr>
      <td><strong>Scheme</strong></td>
      <td><strong>Bar closes when</strong></td>
      <td><strong>Property</strong></td>
    </tr>
    <tr>
      <td>Time bars</td>
      <td>A fixed clock interval elapses</td>
      <td>Universal and joinable, but information per bar varies enormously</td>
    </tr>
    <tr>
      <td>Tick bars</td>
      <td>A fixed number of trades occurs</td>
      <td>Samples with activity, but a trade is not a fixed unit of information</td>
    </tr>
    <tr>
      <td>Volume bars</td>
      <td>Cumulative size reaches a threshold</td>
      <td>Closer to constant information; distorted by price level changes over long histories</td>
    </tr>
    <tr>
      <td>Dollar bars</td>
      <td>Cumulative price times size reaches a threshold</td>
      <td>Robust to price level and to splits; usually the best-behaved returns</td>
    </tr>
    <tr>
      <td>Imbalance bars</td>
      <td>Signed order flow imbalance reaches a threshold</td>
      <td>Samples on informed activity; requires trade-side classification</td>
    </tr>
  </tbody>
</table>

The practical argument for activity-based sampling is statistical. Returns computed from time bars are strongly heteroskedastic, because a bar spanning the open and a bar spanning lunchtime contain wildly different amounts of trading. Returns from dollar bars are closer to independent and identically distributed, which is the assumption most downstream statistics quietly rely on. See [Stationarity](/quant-math/stationarity).

The practical argument against is that non-time bars are not directly comparable across instruments, so cross-sectional work — correlations, factor exposures, portfolio construction — generally reverts to time bars.

---

#### Worked Example: Dollar Bars

Five trades in one instrument, with a dollar-bar threshold of `100,000`.

<table>
  <tbody>
    <tr>
      <td><strong>Time</strong></td><td><strong>Price</strong></td><td><strong>Size</strong></td>
      <td><strong>Value</strong></td><td><strong>Cumulative</strong></td>
    </tr>
    <tr><td>09:30:01</td><td>100.00</td><td>200</td><td>20,000</td><td>20,000</td></tr>
    <tr><td>09:30:03</td><td>100.05</td><td>500</td><td>50,025</td><td>70,025</td></tr>
    <tr><td>09:30:07</td><td>100.02</td><td>300</td><td>30,006</td><td>100,031</td></tr>
    <tr><td>09:30:11</td><td>100.10</td><td>1,000</td><td>100,100</td><td>100,100</td></tr>
    <tr><td>09:30:15</td><td>100.08</td><td>400</td><td>40,032</td><td>40,032</td></tr>
  </tbody>
</table>

1. **Bar 1** closes at 09:30:07, when the accumulator reaches `100,031` and crosses the threshold. Open `100.00`, high `100.05`, low `100.00`, close `100.02`, volume `1,000`.
2. **The accumulator resets to zero**, not to the overshoot. Bars therefore slightly exceed the threshold rather than hitting it exactly.
3. **Bar 2** closes on the single trade at 09:30:11, whose value `100,100` crosses the threshold alone. Open, high, low and close are all `100.10`, volume `1,000`.
4. **Bar 3** is still open at 09:30:15 with `40,032` accumulated, and must be discarded or flagged as incomplete rather than emitted.

Compare five-second time bars over the same window: the interval 09:30:00 to 09:30:05 contains two trades and 700 shares, while 09:30:05 to 09:30:10 contains one trade and 300 shares. Same clock duration, very different information content — and the returns computed from them inherit that imbalance.

> info **Never emit the trailing partial bar** An incomplete final bar has a smaller accumulator than every other bar in the series, so its return is drawn from a different distribution. In a live system it is also the bar that has not finished happening yet.

---

#### Timestamps, Timezones, and Sessions

Store every timestamp in UTC with explicit timezone information, and convert to a local session calendar only at the point of interpretation. Naive local timestamps break twice a year at daylight-saving transitions: one hour appears twice and one hour does not exist, so a naive index will contain duplicates and a resample will produce a spurious empty bar.

The harder problem is that the *market* does not run on UTC. Session boundaries, the definition of a trading day, and the meaning of "close" are local and instrument-specific:

- Sessions that cross midnight — common in futures — mean the trading date is not the calendar date of the timestamp.
- Half-days and early closes make a fixed bar count per day wrong.
- Auctions at the open and close are separate events that a naive resample folds into the adjacent continuous bar.
- Markets in different regions overlap only partially, so a "daily close" join across Tokyo, London, and New York compares prices up to most of a day apart.

That last point causes a specific, well-known distortion: correlations estimated from non-synchronous daily closes are biased toward zero, because part of each market's move happens while the other is shut. It is a data alignment artefact, not a diversification benefit. See [Covariance](/quant-math/covariance).

Finally, decide and document the **bar labelling convention**. A bar labelled `09:30` may cover 09:30 to 09:31 (left-labelled) or 09:29 to 09:30 (right-labelled). Both exist in production data. Getting it backwards shifts your whole series by one period, which converts a lagged relationship into a contemporaneous one and manufactures predictive power out of nothing.

---

#### Resampling and Alignment

Downsampling — say one-minute bars to hourly — is aggregation and is safe if each field uses the right function: first for open, max for high, min for low, last for close, sum for volume, and size-weighted mean for volume-weighted average price. Averaging highs, or taking the last volume, are the common mistakes.

Upsampling to a finer grid is not aggregation and cannot create information. Forward-filling levels is acceptable when flagged; interpolating between them is not, because a linear interpolation between two closes uses the later value to construct the earlier one. That is look-ahead bias with a friendly name. See [Reproducible Experiments](/data-tooling/reproducible).

For aligning two instruments observed at different moments, an as-of join is almost always correct and an exact-timestamp join almost always is not. An as-of join with backward direction matches each observation to the most recent available value from the other series, which is precisely what a live system would have seen. Add a tolerance so that a stale match becomes missing rather than silently ancient.

---

#### In Practice Across Asset Classes

**Equities.** Fragmented across venues, so a consolidated tape carries condition codes that determine which prints belong in a bar. Opening and closing auctions are large, discrete, and often need separate handling. Bars must be built from adjusted or raw prices consistently — see [Cleaning](/data-tooling/cleaning).

**Futures.** Contracts expire, so a long history is a stitched continuous series and the roll date is part of the data. Sessions frequently span midnight and the trading date differs from the timestamp date. Volume migrates between contracts around the roll, which distorts volume and dollar bars precisely when they matter. See [Roll and Carry](/markets/roll-and-carry).

**FX.** Effectively continuous from Sunday evening to Friday evening, with no daily close and no consolidated tape. The "daily close" is a convention chosen by a vendor, typically at a fixed cut in one timezone, and different vendors choose differently. Liquidity varies enormously across the day, which makes time bars particularly misleading. See [FX 101](/markets/fx-101).

**Fixed income.** Most instruments trade sparsely, so tick data is thin and daily bars are frequently built from indicative quotes rather than trades. Bar construction quietly becomes a modelling exercise. See [Fixed Income 101](/markets/fixed-income-101).

**On-chain.** The natural clock is the block, not the second. Blocks give a total order and an exact as-of key, but block times are irregular and, on some chains, several transactions in one block share a timestamp — so intra-block ordering matters and cannot be recovered from timestamps alone. Bars must be reconstructed from swap events, and thin-pool prints need filtering by depth. See [Event Logs](/data-tooling/event-logs) and [On-Chain Data](/simulation/onchain-data).

---

#### Assumptions and Failure Modes

- **Assumes bars are comparable.** Time bars from an active and a quiet period contain different amounts of information, which breaks the independent-and-identically-distributed assumption behind most estimators.
- **Assumes the timestamp is the event time.** Vendor receive time, gateway time, and matching-engine time can differ by enough to invert a causal ordering.
- **Assumes label convention.** A one-period shift from left versus right labelling turns a lag into a contemporaneous relationship and fabricates signal.
- **Assumes a calendar.** Reindexing onto every calendar day inserts holidays as gaps or, worse, as zero returns.
- **Assumes synchronous observation.** Cross-market correlations from non-overlapping sessions are biased toward zero regardless of sample size.
- **Assumes resampling is reversible.** It is not. Aggregation loses the path, and no upsampling restores it.
- **Assumes the last bar is complete.** In live systems it never is, and including it makes backtest and production behave differently.

---

#### Code

```python
import numpy as np
import pandas as pd


def dollar_bars(trades: pd.DataFrame, threshold: float) -> pd.DataFrame:
    """Aggregate a trade tape into bars of roughly equal traded value.

    `trades` is indexed by UTC timestamp with columns price and size.
    The accumulator resets to zero on close rather than carrying the
    overshoot, so every bar is an independent sample of the same target.
    That reset makes the scan genuinely sequential.
    """
    value = (trades["price"] * trades["size"]).to_numpy()
    bar_id = np.empty(len(trades), dtype=np.int64)
    running, current = 0.0, 0
    for i, v in enumerate(value):
        bar_id[i] = current
        running += v
        if running >= threshold:
            current += 1
            running = 0.0

    tagged = trades.assign(_bar=bar_id, _value=value)
    # bar_id == current means the final bar never crossed the threshold.
    grouped = tagged[tagged["_bar"] < current].groupby("_bar")

    bars = pd.DataFrame({
        "open": grouped["price"].first(),
        "high": grouped["price"].max(),
        "low": grouped["price"].min(),
        "close": grouped["price"].last(),
        "volume": grouped["size"].sum(),
        "value": grouped["_value"].sum(),
    })
    bars.index = pd.DatetimeIndex(grouped.apply(lambda g: g.index[-1]), name="closed_at")
    return bars


def resample_ohlcv(bars: pd.DataFrame, rule: str) -> pd.DataFrame:
    """Downsample OHLCV. Each column needs its own aggregation function."""
    return bars.resample(rule, label="left", closed="left").agg({
        "open": "first", "high": "max", "low": "min",
        "close": "last", "volume": "sum",
    }).dropna(subset=["close"])


def align_to_reference(target: pd.DataFrame, reference: pd.DataFrame,
                       tolerance: str = "5min") -> pd.DataFrame:
    """As-of join: each reference row sees the latest target value that
    already existed. The tolerance turns a stale match into NaN instead of
    silently pairing a quote with one from hours earlier.
    """
    return pd.merge_asof(
        reference.sort_index(), target.sort_index(),
        left_index=True, right_index=True,
        direction="backward", tolerance=pd.Timedelta(tolerance),
    )
```

---

#### See Also

* [Market Data Sources](/data-tooling/data-sources)
* [Cleaning and Resampling Market Data](/data-tooling/cleaning)
* [Rolling Windows](/quant-math/rolling-windows)
* [Stationarity](/quant-math/stationarity)
* [Volatility](/quant-math/volatility)
* [Data Preparation](/simulation/data-prep)

---

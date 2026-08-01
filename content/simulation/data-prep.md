### Data Preparation for Backtests

> info **Metadata** Level: Intermediate | Prerequisites: Time series basics, Why Backtest | Tags: data, point-in-time, survivorship-bias, lookahead, backtesting

Almost every backtest that turns out to be wrong was wrong before the strategy code ran. The dataset had already decided the answer: it contained only the companies that still exist, it carried a timestamp describing when a vendor loaded the row rather than when the world produced it, or it had been adjusted for events that had not yet happened. The strategy then dutifully harvested an edge that consisted entirely of knowing the future.

A backtest simulates a counterfactual, and the data layer is where the counterfactual is *defined*. Every cleaning decision — how to fill a gap, which price to treat as the close, whether to carry a stale quote forward — is an assumption about what you would have seen. The default choices in every data library are the convenient ones, and convenient choices in this domain are systematically the flattering ones.

---

#### Formal Definition

A dataset is **point-in-time** if, for every record, you can retrieve the value as it stood at any past moment. Formally, each record carries two timestamps:

```text
record = (event_time, knowledge_time, value)
```

where:

- `event_time` is when the quantity refers to — the quarter a figure describes, the session a bar summarises
- `knowledge_time` is the first moment the value was observable to you, including publication lag and vendor delivery
- `value` may be superseded later by another record with the same `event_time` and a later `knowledge_time`

The point-in-time query is then:

```text
as_of(event_time, clock)  =  the value with the latest knowledge_time
                             not exceeding clock
```

A dataset with only one timestamp column cannot answer this query. It answers a different one — "what do we believe now about that date" — and substituting the second for the first is the mechanism behind most restatement-driven lookahead.

> warning **A single timestamp is a silent lookahead switch** If your table has one date column, you have already assumed publication was instantaneous and revisions never happened. For prices that is nearly true. For fundamentals, macro releases, index membership, ratings and analyst estimates it is emphatically false.

---

#### Worked Example

Survivorship bias is the easiest data error to quantify, so it makes a good demonstration of scale. Consider an equal-weighted universe of 100 instruments over one year. The arithmetic below is illustrative, not an empirical claim about any market.

<table>
  <tbody>
    <tr><td><strong>Group</strong></td><td><strong>Count</strong></td><td><strong>Annual return</strong></td><td><strong>In vendor's current-membership file?</strong></td></tr>
    <tr><td>Continuing instruments</td><td>95</td><td>+10.0%</td><td>Yes</td></tr>
    <tr><td>Delisted during the year</td><td>5</td><td>-100.0%</td><td>No</td></tr>
  </tbody>
</table>

Step by step:

1. **True equal-weighted return**: `(95 * 10.0% + 5 * -100.0%) / 100 = (950% - 500%) / 100 = 4.5%`
2. **Return measured on survivors only**: `950% / 95 = 10.0%`
3. **Bias**: `10.0% - 4.5% = 5.5` percentage points of pure fiction

Two things about this number matter. First, it is large relative to the edge most strategies claim. Second, it is not noise — it is a one-directional bias that no amount of extra data will average away, because the extra data comes from the same filtered source.

The bias is also worse than it looks for anything that selects on distress. A value screen, a mean-reversion rule, or a low-price filter will preferentially select instruments near failure. In the survivor-only universe those are exactly the names that were removed, so the strategy appears to buy cheap assets that always recover.

---

#### The Preparation Pipeline

**Ingest with provenance.** Record the source, the retrieval time, and a hash of the raw payload. Without this you cannot later distinguish a data change from a code change. See [Data Sources](/data-tooling/data-sources).

**Assign both timestamps.** For each field, decide `knowledge_time` explicitly. If a vendor cannot tell you when a value became available, add a conservative publication lag and document it. An assumed lag you wrote down is far better than an implicit lag of zero.

**Reconstruct the universe as of each date.** Build membership from add and remove events, not from a current list. The universe on 3 March must contain everything selectable on 3 March, including instruments that later delisted, merged or were acquired.

**Apply adjustments causally.** A split adjustment applied to the whole history is fine for computing returns and disastrous for anything price-level dependent — a rule keyed to a price threshold, a lot size, or a tick size sees prices that never printed. Keep raw and adjusted series side by side.

**Align timestamps, do not resample away the problem.** Fields from different sources arrive on different clocks. An as-of join that carries the last known value forward is correct; a plain merge on a rounded timestamp is a coin flip on whether you leak.

**Handle gaps deliberately.** Forward-filling a stale quote fabricates liquidity and suppresses measured volatility. Dropping the row silently changes the universe. Interpolating is the worst of the three because it uses a later value to reconstruct an earlier one. Whichever you choose, choose it per field and say so.

---

#### Common Contaminations

<table>
  <tbody>
    <tr><td><strong>Contamination</strong></td><td><strong>Mechanism</strong></td><td><strong>Direction of the error</strong></td></tr>
    <tr><td>Survivorship bias</td><td>Universe built from current membership</td><td>Inflates returns; suppresses tail risk</td></tr>
    <tr><td>Lookahead bias</td><td>Value stamped with its event date, not its release date</td><td>Inflates, often dramatically</td></tr>
    <tr><td>Restatement bias</td><td>Revised figures overwrite the originally published ones</td><td>Inflates for anything fundamentals-driven</td></tr>
    <tr><td>Backfill bias</td><td>History added when an entity enters a database, after it succeeded</td><td>Inflates; acute in fund and token datasets</td></tr>
    <tr><td>Stale quotes</td><td>Last price carried forward through a non-trading period</td><td>Understates volatility, overstates tradeability</td></tr>
    <tr><td>Adjustment leakage</td><td>Whole-history split or dividend adjustment</td><td>Breaks any price-level or threshold rule</td></tr>
    <tr><td>Timestamp convention drift</td><td>Bars stamped at interval start on one feed, close on another</td><td>Half a bar of lookahead, invisible in the output</td></tr>
  </tbody>
</table>

---

#### In Practice Across Asset Classes

**Daily equities.** The full catalogue applies: point-in-time fundamentals, historical index membership, splits, dividends, spin-offs, ticker reuse and identifier changes. Ticker reuse deserves particular care — a symbol released after a delisting and reassigned to an unrelated company will stitch two firms into one series unless you key on a permanent identifier. See [Corporate Actions](/markets/corporate-actions).

**Futures.** No survivorship issue, but a construction issue: contracts expire, so a continuous series is synthetic. Back-adjusted series can go negative and destroy percentage returns; ratio-adjusted series preserve returns but distort levels. Record the roll rule alongside the data. See [Roll and Carry](/markets/roll-and-carry).

**FX.** No central tape means no canonical price. Rates are venue-specific and quote conventions vary in direction and in the number of decimals. Weekend and holiday coverage differs by source, so a naive union of two feeds creates phantom bars.

**Fixed income and credit.** Sparse trading means many marks are evaluated rather than traded. Prices smooth, and measured volatility falls with them. Identifiers change on restructuring, and reference data drifts. See [Credit Spreads](/credit/credit-spreads).

**On-chain markets.** The best-case scenario for provenance: the ledger is the source, and state can be reconstructed at any block. The complications are different in kind — chain reorganisations rewrite recent history, indexers and subgraphs lag or backfill, and decimals differ per token. See [On-Chain Data in Backtests](/simulation/onchain-data) and [Event Logs](/data-tooling/event-logs).

---

#### Assumptions and Failure Modes

- **Timestamps mean what you think.** Assumes a consistent convention for interval labelling and time zone. Broken by a feed that stamps bars at interval start while another stamps at close — worth half a bar of free lookahead.
- **The universe is complete.** Assumes nothing was dropped. Broken by delistings, halts, mergers and any filter applied upstream by the vendor.
- **Values were never revised.** Assumes today's number is the number you saw. Broken by every restated financial, every revised macro print, and every re-indexed on-chain aggregate.
- **Missing means absent.** Assumes a gap is a non-event. It might instead mean a halt, an outage, a delisting, or a failed ingest — and each implies a different correct handling.
- **Cleaning is neutral.** Assumes outlier removal does not touch the signal. A filter that deletes extreme returns removes exactly the days that dominate tail risk. See [Data Cleaning](/data-tooling/cleaning).
- **One source is enough.** Assumes the vendor is right. Cross-checking two independent sources on a sample of dates is cheap and finds errors that no internal consistency check can.

---

#### Code

An as-of join that respects knowledge time — the workhorse of point-in-time preparation.

```python
import pandas as pd


def point_in_time_join(prices, facts, lag=pd.Timedelta("0D")):
    """Attach the most recent *knowable* fact to each price row.

    `facts` must carry knowledge_time. Where a vendor supplies only an
    event date, pass a conservative `lag`: an assumed publication delay
    you wrote down beats an implicit delay of zero.
    """
    facts = facts.copy()
    facts["knowledge_time"] = facts["knowledge_time"] + lag

    return pd.merge_asof(
        prices.sort_values("timestamp"),
        facts.sort_values("knowledge_time"),
        left_on="timestamp",
        right_on="knowledge_time",
        by="symbol",
        direction="backward",      # never reaches forward in time
        allow_exact_matches=False, # same-instant arrival is not observable
    )


def assert_no_future_reference(frame, clock_column, knowledge_column):
    """Cheap invariant to run after every join.

    A leak that raises during preparation costs an hour. The same leak
    discovered after allocation costs considerably more.
    """
    offending = frame[frame[knowledge_column] > frame[clock_column]]
    if not offending.empty:
        raise ValueError(f"{len(offending)} rows reference future knowledge")
```

---

#### See Also

* [Why Backtest and Simulate?](/simulation/why-backtest)
* [Event-Driven Backtesting Basics](/simulation/event-driven)
* [Data Cleaning](/data-tooling/cleaning)
* [Data Pipeline and Replay](/building-simulations/data-pipeline-replay)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [ML Pitfalls in Finance](/ml-finance/ml-pitfalls)

---

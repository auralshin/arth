### Market Data Sources

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: data, market-data, reference-data, vendors, survivorship-bias, point-in-time

Every quantitative result is downstream of a data source. The model can be correct, the code can be correct, and the conclusion can still be wrong because prices were adjusted differently from what the researcher assumed, or because the list of instruments was drawn from today rather than from the date being studied. Choosing and validating data is not preparatory work that happens before the research — it is the first and usually the largest source of error in it.

The market data landscape is a supply chain. At the bottom sit venues, which generate data as a by-product of matching orders. Above them sit consolidators and vendors who normalise, enrich, and redistribute it. Above them sit convenience APIs and free datasets, which are typically a vendor feed with its provenance stripped out. Knowing which layer you are drinking from tells you which class of errors to expect.

---

#### The Supply Chain

<table>
  <tbody>
    <tr>
      <td><strong>Layer</strong></td>
      <td><strong>What it produces</strong></td>
      <td><strong>Characteristic weakness</strong></td>
    </tr>
    <tr>
      <td>Venue direct feeds</td>
      <td>Every order book message from a single exchange, timestamped at the matching engine</td>
      <td>Only that venue. Says nothing about where the instrument traded elsewhere.</td>
    </tr>
    <tr>
      <td>Consolidated tapes</td>
      <td>A merged record across venues for a regulated market, with an official reference price</td>
      <td>Consolidation adds latency and applies rules about which prints qualify.</td>
    </tr>
    <tr>
      <td>Commercial vendors</td>
      <td>Normalised history across markets, plus corporate actions, identifiers, fundamentals</td>
      <td>Vendor conventions are opinions. Two vendors disagree on the same day's close.</td>
    </tr>
    <tr>
      <td>Broker and platform APIs</td>
      <td>Bars and recent history tied to an execution relationship</td>
      <td>History is usually shallow, silently restated, and unversioned.</td>
    </tr>
    <tr>
      <td>Free and public datasets</td>
      <td>Daily bars, macro series, filings, index constituents</td>
      <td>Provenance is often unrecoverable, and coverage skews to what survived.</td>
    </tr>
    <tr>
      <td>On-chain sources</td>
      <td>Blocks, transactions, and event logs from a public ledger</td>
      <td>Complete and auditable, but semantically raw — see Event Logs.</td>
    </tr>
  </tbody>
</table>

---

#### Market Data Versus Reference Data

**Market data** is what prices did: trades, quotes, bars, volumes, open interest. It is high-volume, timestamped, and append-only in principle.

**Reference data** is what an instrument *is*: identifiers, listing venue, currency, contract size, tick size, sector, index membership, first and last trading dates, and the corporate-action history that connects one identifier to another over time. Reference data is low-volume and slow-moving, which is exactly why it is neglected — and it is where most silent backtest corruption originates.

The distinction matters because reference data is *restated*. When a company changes its ticker, a vendor may rewrite history so the new ticker appears to have existed all along. When an index rebalances, the constituent list you download today describes today's membership, not the membership on the date you are testing.

> warning **Symbols are not identities** A ticker is a lease, not a name. Reused tickers silently splice two unrelated companies into one price series. Prefer a stable vendor identifier and keep a ticker-to-identifier mapping with valid-from and valid-to dates.

---

#### Survivorship Bias

**Survivorship bias** is the error introduced when the universe of instruments you study is the set that still exists at the time you build the dataset. Failed, delisted, acquired, merged, and defaulted names have been quietly removed, so the sample consists disproportionately of things that worked.

Construct a deliberately simple illustration. Ten equities are held for one year. Eight of them still trade at year end; two are delisted after severe declines.

<table>
  <tbody>
    <tr>
      <td><strong>Survivors (%)</strong></td>
      <td>+12</td><td>+5</td><td>-3</td><td>+20</td>
      <td>+8</td><td>-7</td><td>+15</td><td>+2</td>
    </tr>
    <tr>
      <td><strong>Delisted (%)</strong></td>
      <td>-100</td><td>-60</td>
      <td colspan="6"></td>
    </tr>
  </tbody>
</table>

1. **Survivor total**: the eight survivors sum to `12 + 5 - 3 + 20 + 8 - 7 + 15 + 2 = 52`
2. **Survivor mean**: `52 / 8 = 6.5%`
3. **Full-universe total**: `52 - 100 - 60 = -108`
4. **Full-universe mean**: `-108 / 10 = -10.8%`
5. **Bias**: `6.5 - (-10.8) = 17.3` percentage points, in a single year, from omitting two names out of ten

Nothing about the surviving eight is wrong. The error is entirely in the *membership list*. No amount of statistical care applied to the survivor sample recovers the true number, because the missing observations are not missing at random — they are missing precisely because they were the worst.

The same defect wears different clothes across datasets. A hedge fund index drops funds that stop reporting, and funds usually stop reporting after bad results. A bond dataset covers issuers with outstanding debt today, excluding those that defaulted. A token dataset covers projects with live liquidity, excluding those that went to zero. In every case the survivorship filter correlates with the outcome being measured.

> warning **The fix is a universe file, not a filter** You cannot repair survivorship bias by cleaning the price data. You need a point-in-time universe: for each date, the set of instruments that were actually investable on that date, including ones that later ceased to exist.

---

#### Point-in-Time Correctness

A dataset is **point-in-time** if, for any historical date `t`, it can reproduce what was knowable at `t` — not what is known now about `t`.

Three distinct things get confused here:

- **Event date** — when the thing happened (a quarter ended, a dividend went ex).
- **Publication date** — when the information first became public.
- **Restatement date** — when the value was later revised.

Most convenient datasets store only the event date and the latest value. That is enough to build a backtest that trades on earnings before they were announced, or on macro figures at their final revised level months before the first estimate existed. Both look like exceptional alpha.

```text
Naive fundamentals table                Point-in-time table
--------------------------------        -----------------------------------------
instrument_id                           instrument_id
period_end        2024-03-31            period_end          2024-03-31
eps               1.42   <- restated    published_at        2024-05-08 21:00:00Z
                                        knowledge_valid_to  2024-08-14 20:30:00Z
                                        eps                 1.31   <- as first reported
```

The point-in-time table stores a row per *version* of the fact. Querying it requires an as-of predicate: select the row whose `published_at` is at or before the decision timestamp and whose `knowledge_valid_to` is after it. This is bitemporal modelling, and it is the difference between a research result and a coincidence. See [Reproducible Experiments](/data-tooling/reproducible) for how this interacts with dataset versioning.

---

#### What to Check Before Trusting a Source

- **Adjustment policy.** Are prices raw, split-adjusted, or total-return adjusted? Adjusted how far back, and re-adjusted when a new action occurs? See [Corporate Actions](/markets/corporate-actions).
- **Timestamp semantics.** Is the timestamp the exchange matching time, the vendor receive time, or the bar close? In which timezone, and with what clock precision?
- **Bar convention.** Does a bar labelled `09:30` cover the interval starting or ending at that moment? Both conventions exist in production data.
- **Universe construction.** How were instruments selected, and were dead ones retained? Ask for the delisting records explicitly.
- **Restatement behaviour.** If you re-download yesterday's file next month, do you get identical bytes? Test this rather than asking.
- **Session and holiday handling.** Are auction prints, pre-market trades, and half-days included?
- **Gap semantics.** Does a missing row mean no trading, no data, or a failed collection job? These require different treatment in [Cleaning](/data-tooling/cleaning).
- **Coverage start.** A history that begins in 2010 may reflect when the vendor started collecting, not when the instrument started trading.

> info **Two sources beat one** The cheapest data quality control available is holding a second, independent source and reconciling. Disagreements will not tell you which is right, but they will tell you where to look.

---

#### In Practice Across Asset Classes

**Equities.** The hardest problems are reference data, not prices. Corporate actions, identifier changes, multiple listings of the same economic entity, and index membership all mutate history. Free equity datasets are the most survivorship-contaminated data commonly used in retail research. See [Equities 101](/markets/equities-101) and [Equity Indices](/markets/equity-indices).

**Futures.** Individual contracts have finite lives, so a usable history is a **continuous series** stitched across rolls. The stitching method is a modelling choice made by whoever built the file, and different methods produce visibly different return series for the same underlying. Always keep the individual contract data alongside the stitched series. See [Roll and Carry](/markets/roll-and-carry).

**FX.** There is no consolidated tape. Spot FX trades across dealer platforms, electronic venues, and bilateral relationships, and no single record covers all of it. Any "the" FX price is a particular vendor's composite built from a particular subset of contributors, with its own filtering rules. Two providers will disagree on the high of the day. See [FX 101](/markets/fx-101).

**Fixed income.** Most bonds do not trade on most days. Prices are frequently **indicative** — a dealer's estimate of where a trade would occur — or model-derived from a curve rather than observed. A daily price series for a corporate bond may contain very few actual transactions, which makes measured volatility an artefact of the pricing model. See [Fixed Income 101](/markets/fixed-income-101) and [Curve Construction](/markets/curve-construction).

**On-chain.** The ledger is complete, auditable, and free of survivorship bias at the transaction level: failed protocols leave their entire history in place. The cost is that nothing arrives pre-interpreted. Prices must be reconstructed from swap events, positions from state changes, and identity from addresses. The work moves from trusting a vendor to writing a correct decoder. See [Event Logs](/data-tooling/event-logs), [RPC Nodes](/data-tooling/rpc-nodes), and [The Graph](/data-tooling/the-graph).

---

#### Assumptions and Failure Modes

- **Assumes the universe is complete.** If dead instruments were dropped, every cross-sectional statistic is biased upward and no downstream fix exists.
- **Assumes values are as-reported.** Restated fundamentals and revised macro series leak future information into past dates.
- **Assumes one price exists.** For FX, fixed income, and fragmented markets, the price is a composite whose construction rules you inherit without seeing.
- **Assumes timestamps mean the same thing across sources.** Joining a venue feed on matching time to a vendor feed on receive time silently misaligns everything.
- **Assumes stable identifiers.** Ticker reuse and post-merger identifier mapping splice unrelated series together.
- **Assumes adjustment is idempotent.** Re-downloading an adjusted history after a new corporate action changes every earlier value, so a cached file and a fresh pull disagree.
- **Assumes free means equivalent.** Free datasets are usually adequate for learning mechanics and inadequate for measuring edge, because the defects correlate with the thing being measured.

---

#### Code

```python
import pandas as pd

def point_in_time_universe(memberships: pd.DataFrame, as_of: pd.Timestamp) -> pd.Index:
    """Instruments investable on `as_of`, including those since delisted.

    `memberships` has columns instrument_id, start_date, end_date.
    end_date is NaT for instruments still active — never drop those rows,
    and never filter on "currently active", which is the survivorship trap.
    """
    live = (memberships["start_date"] <= as_of) & (
        memberships["end_date"].isna() | (memberships["end_date"] > as_of)
    )
    return pd.Index(memberships.loc[live, "instrument_id"].unique())


def as_of_fundamentals(facts: pd.DataFrame, decisions: pd.DataFrame) -> pd.DataFrame:
    """Join each decision timestamp to the fact version public at that moment.

    merge_asof with direction="backward" is the whole point: it can only
    match a publication that already happened.
    """
    facts = facts.sort_values("published_at")
    decisions = decisions.sort_values("decision_time")
    return pd.merge_asof(
        decisions,
        facts,
        left_on="decision_time",
        right_on="published_at",
        by="instrument_id",
        direction="backward",
    )
```

---

#### See Also

* [Cleaning and Resampling Market Data](/data-tooling/cleaning)
* [Reproducible Experiments](/data-tooling/reproducible)
* [Corporate Actions](/markets/corporate-actions)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Event Logs](/data-tooling/event-logs)

---

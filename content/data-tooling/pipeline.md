### Building a Simple Data Pipeline

> info **Metadata** Level: Intermediate | Prerequisites: Market Data Sources, Cleaning | Tags: pipeline, ingestion, validation, storage, idempotence, schema-evolution

A research data pipeline has one job: given a source and a date range, produce a dataset whose contents are a deterministic function of the inputs. Everything else — orchestration, scheduling, retries, dashboards — exists to protect that property. Most pipelines that go wrong do not crash; they succeed while producing something subtly different from what they produced last time, and nobody notices until a backtest stops matching.

The design pressure specific to market data is that inputs are not static. Vendors publish corrections days later, exchanges cancel erroneous prints, fundamentals get restated, and chains reorganise. A pipeline that assumes each day is written once and never revisited will be wrong within a month. A pipeline built around *reprocessing* as the normal case, rather than the exception, stays correct.

---

#### The Shape of a Pipeline

```text
  source           raw zone            curated zone         feature zone
 ┌────────┐      ┌──────────────┐    ┌───────────────┐    ┌──────────────┐
 │ vendor │ ───► │ bytes as     │──► │ typed, clean, │──► │ bars, joins, │
 │ venue  │      │ received,    │    │ adjusted,     │    │ point-in-time│
 │ node   │      │ immutable    │    │ deduplicated  │    │ features     │
 └────────┘      └──────────────┘    └───────────────┘    └──────────────┘
                   never edited        rebuildable          rebuildable
                   hashed on write     from raw             from curated
```

Three properties make this work.

**The raw zone is immutable and never parsed on write.** Store the bytes exactly as received, including headers, footers, and fields you do not currently use. A parser bug found in six months is recoverable only if the original bytes still exist. Record the fetch time, the request parameters, and a content hash alongside.

**Everything downstream is derived and therefore disposable.** If deleting the curated zone and rebuilding it from raw plus code does not reproduce it byte-for-byte, some state lives only in the curated zone, and that state is unversioned.

**Each stage is a pure function of the stage before.** No stage reads its own previous output, queries wall-clock time, or depends on the order in which partitions happened to be processed.

---

#### Idempotence and Reprocessing

An operation is **idempotent** if running it twice has the same effect as running it once. For a pipeline this means: reprocessing any date range must produce the same result as processing it the first time, regardless of what already exists.

The mechanism is partition replacement. Write at the granularity of a partition — typically source, dataset, and trading date — and make the write an atomic *replace*, never an append. Appending is the single most common source of pipeline corruption, because a retry after a partial failure duplicates rows, and duplicated trades inflate volume while duplicated bars corrupt every rolling statistic.

**Worked example.** A vendor publishes the file for trade date 2024-06-11 on the evening of the 11th. On the 14th they republish it with one erroneous print removed.

<table>
  <tbody>
    <tr>
      <td><strong>Event</strong></td>
      <td><strong>Append-based pipeline</strong></td>
      <td><strong>Partition-replace pipeline</strong></td>
    </tr>
    <tr>
      <td>Initial load, 11 June</td>
      <td>18,402 rows written</td>
      <td>Partition <code>2024-06-11</code> created, 18,402 rows</td>
    </tr>
    <tr>
      <td>Job retried after a timeout</td>
      <td>36,804 rows — silently doubled</td>
      <td>Partition replaced, still 18,402 rows</td>
    </tr>
    <tr>
      <td>Corrected file, 14 June</td>
      <td>55,205 rows across three vintages</td>
      <td>Partition replaced, 18,401 rows</td>
    </tr>
    <tr>
      <td>Volume for 11 June</td>
      <td>Three times the true figure</td>
      <td>Correct, and one row lighter than before</td>
    </tr>
  </tbody>
</table>

The corrected partition raises a second question: does anything downstream still hold the old numbers? A daily volatility estimate computed on the 12th used the erroneous print. Either mark every derived partition that consumed a replaced input as stale and rebuild it, or accept that history quietly disagrees with itself. Recording input hashes per output partition makes this a query rather than an archaeology project — see [Reproducible Experiments](/data-tooling/reproducible).

> warning **Retries make appends dangerous** Any orchestrator will retry a task that timed out, including one that had already written most of its rows. If the write is an append, the retry duplicates. Design the write so a retry is harmless and the retry logic stops mattering.

---

#### Validation as a Gate

Validation belongs at the boundary between raw and curated, where bad data can still be rejected cheaply. Split checks by severity, because treating everything as fatal means the pipeline stops nightly and everyone learns to ignore it.

<table>
  <tbody>
    <tr>
      <td><strong>Check</strong></td>
      <td><strong>Example</strong></td>
      <td><strong>Action</strong></td>
    </tr>
    <tr>
      <td>Structural</td>
      <td>Expected columns present, types parse, timestamps timezone-aware</td>
      <td>Fatal — reject the partition</td>
    </tr>
    <tr>
      <td>Invariant</td>
      <td>high at or above low, close within the day's range, size positive</td>
      <td>Fatal — the file is not what it claims to be</td>
    </tr>
    <tr>
      <td>Uniqueness</td>
      <td>One row per instrument per timestamp</td>
      <td>Fatal — duplicates break every join downstream</td>
    </tr>
    <tr>
      <td>Completeness</td>
      <td>Row count within expectation for a session of this type</td>
      <td>Warn, quarantine, and alert — half-days are legitimate</td>
    </tr>
    <tr>
      <td>Continuity</td>
      <td>No unexplained jump versus the previous session</td>
      <td>Warn — usually an unapplied corporate action</td>
    </tr>
    <tr>
      <td>Cross-source</td>
      <td>Second vendor's close agrees within tolerance</td>
      <td>Warn — disagreement locates the problem, not the culprit</td>
    </tr>
  </tbody>
</table>

Quarantine rather than delete. A rejected partition written to a quarantine location with its failure reason is debuggable; a rejected partition that was dropped is a gap someone will later fill by guessing.

---

#### Storage and Schema Evolution

Columnar formats such as Parquet are the default for research data: they compress well, store types and timezone metadata faithfully, and let a query read three columns out of forty without touching the rest. Partition by the fields you filter on — typically dataset and date — because partition pruning is the difference between reading a day and reading a decade.

Schemas change, and the change is usually additive: a vendor adds a field, or you start capturing a condition code you previously discarded. Rules that keep this survivable:

- **Add, never repurpose.** Changing the meaning of an existing column silently invalidates every historical row and every cached result derived from it.
- **New columns are nullable.** Old partitions genuinely lack the data; nullable is the truthful representation, and backfilling a default is a fabrication.
- **Version the schema explicitly** and store the version in the partition metadata, so a reader can branch on it rather than infer it.
- **Breaking changes get a new dataset name**, with the old one retained until nothing reads it. Renaming in place breaks reproduction of past results.

> info **Prefer wide and sparse to many tables** Research queries join constantly, and joins are where alignment bugs live. A wider table with nulls is usually cheaper to reason about than a correct join you have to rewrite in every notebook.

---

#### In Practice Across Asset Classes

**Equities.** The pipeline must hold prices and a separate corporate-action table, applying adjustment on read rather than on write. Adjustment is retroactive, so an adjusted table written to disk is stale the moment the next dividend goes ex. See [Corporate Actions](/markets/corporate-actions).

**Futures.** Store individual contracts as the raw truth and generate continuous series as a derived dataset parameterised by roll rule. Treating the stitched series as raw makes the roll convention unrecoverable. See [Roll and Carry](/markets/roll-and-carry).

**FX.** With no consolidated tape, treat each contributor or venue as a separate source with its own partition, and build any composite as a derived dataset. Merging on ingestion destroys the ability to ask which contributor caused a spike.

**Fixed income.** Instrument reference data is large, changes often, and drives everything: maturity, coupon schedule, day-count convention, callability. The reference table needs the same point-in-time treatment as prices, because a bond's terms as recorded today may reflect a later amendment.

**On-chain.** Ingestion is a chain scan rather than a file fetch, and the specific hazard is the reorganisation: recent blocks can be replaced. Write only blocks past a confirmation depth into the curated zone, keep the block height as the partition key, and store the block hash so a reorganisation is detectable rather than silent. See [RPC Nodes](/data-tooling/rpc-nodes) and [Event Logs](/data-tooling/event-logs).

---

#### Assumptions and Failure Modes

- **Assumes sources are append-only.** They are not. Corrections, restatements, and reorganisations rewrite the past, and a pipeline without replacement semantics cannot represent that.
- **Assumes success means correct.** A job that ran green on an empty file produced an empty partition. Row-count expectations are the cheapest defence.
- **Assumes retries are safe.** Only if writes are idempotent. Otherwise the orchestrator is a duplication engine.
- **Assumes timestamps are consistent across sources.** Joining a venue feed on matching time to a vendor feed on receive time misaligns everything downstream. See [Getting Historical Time Series](/data-tooling/time-series).
- **Assumes derived data can be rebuilt.** Only if no manual fix was ever applied directly to the curated zone. One hand-edited file makes the whole tree unreproducible.
- **Assumes validation thresholds are stable.** Thresholds tuned on calm data fire constantly in a crisis, precisely when the data matters most, and get muted.
- **Assumes schema changes are announced.** Vendors add and reorder columns without notice. Validate structure on every load, not on integration day.

---

#### Code

```python
import hashlib
from pathlib import Path
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq


class ValidationError(Exception):
    pass


def validate_bars(df: pd.DataFrame, trade_date: str) -> None:
    """Fatal checks only. Anything that passes here is safe to store."""
    required = {"instrument_id", "ts", "open", "high", "low", "close", "volume"}
    missing = required - set(df.columns)
    if missing:
        raise ValidationError(f"{trade_date}: missing columns {sorted(missing)}")
    if df["ts"].dt.tz is None:
        raise ValidationError(f"{trade_date}: timestamps are timezone-naive")
    if df.duplicated(["instrument_id", "ts"]).any():
        raise ValidationError(f"{trade_date}: duplicate instrument/timestamp rows")
    bad = (df["high"] < df["low"]) | (df["close"] > df["high"]) | (df["close"] < df["low"])
    if bad.any():
        raise ValidationError(f"{trade_date}: {int(bad.sum())} rows violate OHLC bounds")


def write_partition(df: pd.DataFrame, root: Path, dataset: str, trade_date: str) -> str:
    """Atomic replace of one day. Re-running this is a no-op, not a duplicate.

    Write to a temporary path and rename, so a crash mid-write leaves the
    previous partition intact rather than a half-file that parses.
    """
    validate_bars(df, trade_date)
    part = root / dataset / f"trade_date={trade_date}"
    tmp = part.with_suffix(".tmp")
    tmp.mkdir(parents=True, exist_ok=True)

    table = pa.Table.from_pandas(df.sort_values(["instrument_id", "ts"]), preserve_index=False)
    pq.write_table(table, tmp / "data.parquet", compression="zstd")

    digest = hashlib.sha256((tmp / "data.parquet").read_bytes()).hexdigest()
    if part.exists():
        for f in part.iterdir():
            f.unlink()
        part.rmdir()
    tmp.rename(part)
    return digest  # store against the partition; downstream staleness keys off it
```

---

#### See Also

* [Market Data Sources](/data-tooling/data-sources)
* [Cleaning and Resampling Market Data](/data-tooling/cleaning)
* [Reproducible Experiments](/data-tooling/reproducible)
* [Dashboards](/data-tooling/dashboards)
* [Data Pipeline & Replay](/building-simulations/data-pipeline-replay)
* [Operational Risk](/risk/operational)

---

### Tooling & Simulation Ecosystem

> info **Metadata** Level: Intermediate | Prerequisites: Building a Simple Data Pipeline, Why Backtest | Tags: tooling, simulation, architecture, determinism, replay, infrastructure

A research stack is a chain of components between a raw market observation and a number someone acts on. Each link can be built, bought, or borrowed, and the choice at each link is mostly about which failures you are willing to own. This page maps the layers, the languages that suit each, and the property that ties them together: **determinism**, meaning the same inputs produce the same outputs, every time, on any machine.

Determinism sounds like an engineering nicety and is actually the thing that makes the results usable. A simulation you cannot re-run is a simulation whose result you cannot check, and in a domain where the signal-to-noise ratio is low and the temptation to keep searching is high, unchecked results are how a research programme convinces itself of something false. Every architectural recommendation below follows from that constraint rather than from taste. See [Reproducible Experiments](/data-tooling/reproducible).

---

#### The Layers

<table>
  <tbody>
    <tr>
      <td><strong>Layer</strong></td>
      <td><strong>Responsibility</strong></td>
      <td><strong>Usual choice</strong></td>
    </tr>
    <tr>
      <td>Ingestion</td>
      <td>Connect to venues, vendors, and nodes; persist raw bytes; detect gaps</td>
      <td>Long-lived services; TypeScript or Go suit many concurrent sockets</td>
    </tr>
    <tr>
      <td>Storage</td>
      <td>Immutable raw zone, curated zone, point-in-time views</td>
      <td>Columnar files (Parquet) plus a query engine; object storage underneath</td>
    </tr>
    <tr>
      <td>Transformation</td>
      <td>Cleaning, adjustment, bar construction, feature generation</td>
      <td>Python with vectorised libraries; Polars or DuckDB past memory limits</td>
    </tr>
    <tr>
      <td>Simulation core</td>
      <td>Event loop, matching or fill model, accounting, cost model</td>
      <td>Python first; a compiled core only once profiling justifies it</td>
    </tr>
    <tr>
      <td>Orchestration</td>
      <td>Scheduling, dependencies, retries, backfills, idempotent reruns</td>
      <td>A workflow engine, or plain scheduled scripts for small stacks</td>
    </tr>
    <tr>
      <td>Service and interface</td>
      <td>APIs over results, dashboards, monitoring, alerting</td>
      <td>TypeScript, because it runs where the reader is</td>
    </tr>
  </tbody>
</table>

The most common mistake in building this stack is starting at the simulation core, because it is the interesting layer. The layers that determine whether the results mean anything are ingestion and storage, and they are the ones that get retrofitted after an incident.

---

#### A Reference Architecture

```text
   venues, vendors, nodes
            │  raw bytes, hashed, never edited
            ▼
   ┌──────────────────┐      ┌─────────────────────┐
   │  raw zone        │─────►│  curated zone       │  validation gate
   │  partitioned by  │      │  typed, adjusted,   │  rejects go to
   │  source and date │      │  deduplicated       │  quarantine
   └──────────────────┘      └─────────┬───────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
   ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
   │ research           │   │ simulation core    │   │ monitoring         │
   │ notebooks, feature │   │ deterministic      │   │ freshness,         │
   │ construction       │   │ replay + seeds     │   │ completeness       │
   └────────────────────┘   └─────────┬──────────┘   └────────────────────┘
                                      │  results + run manifest
                                      ▼
                            ┌────────────────────┐
                            │ API and dashboards │
                            └────────────────────┘
```

Every arrow crossing a box boundary carries a version identifier as well as data. A result without its manifest — code commit, environment lock, input hashes, parameters, as-of date — is an orphan the moment anything upstream changes.

---

#### Determinism as the Design Constraint

Three properties make a simulation reproducible, and all three are architectural rather than incidental.

**A total order over events.** Every event carries a timestamp and a tie-breaking sequence number, because timestamps collide — several trades share a millisecond, several transactions share a block. Ordering by timestamp alone means the order depends on the sort algorithm's stability, which means it can differ between library versions. See [Event-Driven Backtesting](/simulation/event-driven).

**Explicit randomness.** Random number generators are passed in, seeded per run, and recorded in the manifest. A global seed is process-wide state that any imported module can overwrite. And a fixed seed makes a result repeatable, not robust: the finding is the dispersion across many seeds, not the value at one. See [Parameter Sweeps](/simulation/param-sweeps).

**No wall clock inside the simulation.** Anything reading the current time, a "last five years" window, or a live endpoint makes today's run differ from tomorrow's for reasons unrelated to the model.

Replay is what these buy you. If the simulator consumes an ordered event log rather than a table, the same engine can be driven by historical data, by synthetic paths, and by a live feed — and a live-versus-backtest divergence becomes a diff between two event logs rather than an argument. See [Backtest vs Live](/risk/backtest-vs-live).

> warning **A faster backtest that is wrong is worse than a slow one** Performance work tends to introduce parallelism, and parallel reductions change floating-point summation order. Fix the ordering, or accept and document the tolerance, before optimising. See [Performance Optimization](/building-simulations/performance-optimization).

---

#### Where a Compiled Core Pays For Itself

Rewriting the simulation core in a compiled language — Rust, C++, or a Numba-compiled kernel — is worthwhile in narrow circumstances and expensive otherwise.

<table>
  <tbody>
    <tr>
      <td><strong>Worth compiling</strong></td>
      <td><strong>Not worth compiling</strong></td>
    </tr>
    <tr>
      <td>Order-book reconstruction over billions of messages</td>
      <td>Daily-bar backtests on a few thousand instruments</td>
    </tr>
    <tr>
      <td>Agent-based models with many interacting agents per step</td>
      <td>Parameter sweeps, which parallelise across processes instead</td>
    </tr>
    <tr>
      <td>Genuinely sequential state machines that cannot vectorise</td>
      <td>Anything already spending its time in vectorised library calls</td>
    </tr>
    <tr>
      <td>Latency-sensitive components shared with production</td>
      <td>Research iterations, where developer time dominates run time</td>
    </tr>
  </tbody>
</table>

The honest sequence is: write it in Python, profile it, and compile the one function that dominates. Most research code is bounded by data loading and by a single badly-written loop, and neither is fixed by changing language. See [Working with Market Data in Python](/data-tooling/python).

---

#### Integration Surfaces

The stack meets the outside world at a small number of adapters, and each is a category rather than a single vendor:

- **Venue and vendor feeds** for trades, quotes, and reference data, with the specific conventions and identifiers each imposes.
- **Reference and corporate-action services**, which are separate systems from price feeds and change history retroactively. See [Corporate Actions](/markets/corporate-actions).
- **Execution connectivity** for order entry and fills, and the accounting that reconciles them.
- **Chain nodes and indexers** for on-chain state, where the adapter reconstructs prices and positions from events rather than receiving them. See [RPC Nodes](/data-tooling/rpc-nodes) and [Event Logs](/data-tooling/event-logs).
- **Protocol simulators** that reimplement an automated market maker's or lending pool's arithmetic so a strategy can be tested against the mechanism rather than against a price series. See [AMMs in Depth](/protocols/amms-depth).

Keep adapters thin and the core neutral. The core should consume typed events with a total order, not know which venue produced them, so the same simulation logic serves an equity backtest, a futures roll study, and an on-chain liquidity experiment.

---

#### In Practice Across Asset Classes

**Equities.** The stack is dominated by reference data and calendars. Adjustment must be applied on read from a raw price table plus an action table, and the universe must be a point-in-time snapshot rather than a query against today.

**Futures.** Individual contracts are the raw truth; the continuous series is a derived dataset parameterised by roll rule, and that parameter belongs in the manifest. Simulating the roll explicitly is usually more informative than simulating the stitched series. See [Roll and Carry](/markets/roll-and-carry).

**FX.** No consolidated tape, so each contributor is its own source and any composite is derived. Near-continuous trading means the "day" is a convention the stack has to choose and record.

**Fixed income.** The pricing model is part of the data layer, not the research layer: curves and spreads are outputs of a construction process that must be versioned like code. See [Curve Construction](/markets/curve-construction).

**On-chain.** The strongest reproducibility substrate available, because block height is an exact and immutable as-of key and an archival node can reconstruct state at any height. The costs are reconstruction work and the indexers between you and the chain, whose decoding logic changes and must be pinned. See [The Graph](/data-tooling/the-graph) and [On-Chain Data](/simulation/onchain-data).

---

#### Assumptions and Failure Modes

- **Assumes the stack is the hard part.** It is not — data quality is. A sophisticated engine over a survivorship-biased universe produces confident nonsense. See [Market Data Sources](/data-tooling/data-sources).
- **Assumes replay equals live.** It equals live only for the state the log captured. Anything the simulator models rather than records — queue position, partial fills, rejections — is an assumption in disguise.
- **Assumes determinism survives optimisation.** Parallelism, unordered aggregation, and hash-order iteration all break it silently.
- **Assumes adapters are interchangeable.** Two vendors' "close" differ, so swapping a source changes results even with identical code.
- **Assumes the simulator's cost model is right.** It is the largest single source of backtest-to-live divergence, and it is the part least constrained by data. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Assumes building beats buying.** Every custom layer is a layer you maintain, and maintenance competes directly with research time.
- **Assumes more speed means more research.** Faster iteration over the same data raises the number of hypotheses tested, which raises the multiple-testing burden rather than lowering it. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### See Also

* [Building a Simple Data Pipeline](/data-tooling/pipeline)
* [Reproducible Experiments](/data-tooling/reproducible)
* [Event-Driven Backtesting](/simulation/event-driven)
* [Building a Backtester](/simulation/building-backtester)
* [Data Pipeline & Replay](/building-simulations/data-pipeline-replay)
* [Dashboards](/data-tooling/dashboards)

---

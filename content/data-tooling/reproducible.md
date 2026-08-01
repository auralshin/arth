### Reproducible Experiments

> info **Metadata** Level: Intermediate | Prerequisites: Market Data Sources, Backtest vs Live | Tags: reproducibility, point-in-time, data-versioning, determinism, research-process

Reproducibility is usually filed under hygiene, alongside tidy imports and good variable names. That is the wrong category. In quantitative research, an experiment you cannot re-run is an experiment whose result you cannot check, and a result you cannot check is indistinguishable from a result you got by accident. Reproducibility is a **correctness requirement**, because the specific way irreproducible research fails is by silently smuggling future information into the past.

Consider the asymmetry. If a bug makes a strategy look bad, you investigate and find it, because a disappointing result invites scrutiny. If a bug makes a strategy look good, it agrees with what you hoped, and the investigation never starts. Reproducibility is the mechanism that removes the researcher's judgement from that loop: the same inputs must give the same outputs, and the inputs must be exactly what was knowable at the time.

---

#### Three Levels of Reproducible

<table>
  <tbody>
    <tr>
      <td><strong>Level</strong></td>
      <td><strong>Claim</strong></td>
      <td><strong>What it requires</strong></td>
    </tr>
    <tr>
      <td>Re-runnable</td>
      <td>Running the same script now gives the same number</td>
      <td>Fixed seeds, ordered operations, no wall-clock dependence</td>
    </tr>
    <tr>
      <td>Rebuildable</td>
      <td>Someone else, on another machine, gets the same number</td>
      <td>Pinned environment, pinned data version, no local paths or secrets in logic</td>
    </tr>
    <tr>
      <td>Reconstructable</td>
      <td>The result can be regenerated a year from now</td>
      <td>Immutable data snapshots, point-in-time semantics, archived code and config together</td>
    </tr>
  </tbody>
</table>

Most research reaches level one, believes it is at level three, and is actually below level two. The usual gap is data: the code is in version control and the dataset is a file on a laptop that a vendor has since restated.

---

#### Point-in-Time Correctness

A result is **point-in-time correct** if every input used to make a decision at time `t` was publicly available at `t`. This is stricter than "no future prices". Most datasets store a single current value per historical date, which quietly encodes later knowledge.

Three timestamps must be distinguished, and most tables carry only the first:

```text
event_time     when the thing happened          e.g. quarter ended 2024-03-31
publish_time   when it first became public      e.g. 2024-04-25 12:00Z
valid_to       when it was superseded           e.g. 2024-05-30 12:00Z (NULL if current)
```

**Worked example.** A macro indicator for the quarter ending 2024-03-31 has three vintages, and a rule takes a position when the indicator reads above `2.0`.

<table>
  <tbody>
    <tr>
      <td><strong>Vintage</strong></td>
      <td><strong>Published</strong></td>
      <td><strong>Value</strong></td>
      <td><strong>Signal on 2024-04-26</strong></td>
    </tr>
    <tr>
      <td>First print</td>
      <td>2024-04-25</td>
      <td>2.1</td>
      <td>Long — 2.1 is above 2.0</td>
    </tr>
    <tr>
      <td>First revision</td>
      <td>2024-05-30</td>
      <td>1.4</td>
      <td>Did not exist yet</td>
    </tr>
    <tr>
      <td>Final</td>
      <td>2024-09-15</td>
      <td>1.6</td>
      <td>Did not exist yet</td>
    </tr>
  </tbody>
</table>

A naive table storing `event_time = 2024-03-31, value = 1.6` produces **no trade** on 2024-04-26. The live system, seeing `2.1`, would have gone long. The backtest is not optimistic or pessimistic here — it is simulating a strategy that nobody could have run. Whether that flatters or damages the result is luck, and either way the number does not describe the rule you intend to deploy.

The same structure applies well beyond macro data: restated fundamentals, revised index constituents, corrected exchange prints, retroactively adjusted prices after a corporate action, and analyst estimates that get rewritten. See [Market Data Sources](/data-tooling/data-sources).

> warning **The most expensive backtest bug is invisible** Look-ahead through restatement produces no error, no warning, and no anomaly in the output. It produces a slightly better Sharpe ratio, which is exactly what the researcher was hoping to see.

---

#### The Frozen Universe

Survivorship bias and reproducibility are the same problem viewed from two angles. Both are caused by asking today's dataset a question about the past.

If your universe query is "instruments in the index" and you run it in January and again in July, you get two different universes, so the January and July backtests are not comparable — and neither is correct, because both use membership that postdates the trades. The fix is a **frozen, point-in-time universe file**: for every rebalance date, the exact instrument set that was investable then, retaining names that have since been delisted, acquired, or defaulted.

```text
universe_snapshot
-----------------
as_of_date        2024-03-31
instrument_id     stable vendor identifier, not a ticker
first_trade_date  when it became investable
last_trade_date   when it stopped (NULL if still active)
delisting_return  the terminal return, where one applies
snapshot_hash     content hash of the whole snapshot
```

Storing `delisting_return` matters. Deleting a defaulted instrument treats it as if the position vanished at par; recording its terminal return treats it as the loss it was.

---

#### Sources of Nondeterminism

- **Unseeded generators.** Pass an explicit generator through; never rely on a global default seed, which any imported module can overwrite.
- **Wall-clock dependence.** `today()` and "the last five years" make today's run differ from tomorrow's. Take the as-of date as a parameter, defaulted only at the entry point.
- **Unordered iteration and parallel reductions.** Set and dict order, unordered joins, and threaded floating-point summation all vary run to run. Sort explicitly before any order-sensitive aggregation.
- **Unpinned dependencies.** A lockfile plus a recorded interpreter version — see [Python Setup](/data-tooling/python-setup).
- **Live queries against a mutable source.** Snapshot to immutable storage and reference by version or content hash.
- **Notebook hidden state.** Restart-and-run-all as the only accepted result — see [Notebooks](/data-tooling/notebooks).

Seeds deserve one caution. Fixing a seed makes a stochastic result repeatable; it does not make it *robust*. A backtest that only works on seed 42 is not reproducible research, it is a reproducible coincidence. Report results across many seeds and show the dispersion. See [Bootstrap](/stat-methods/bootstrap) and [Parameter Sweeps](/simulation/param-sweeps).

---

#### Data Versioning

Code versioning is solved; data versioning generally is not, and the two must move together. The minimum viable discipline:

- **Immutable snapshots.** Write raw data once, partitioned by ingestion date, and never edit in place. Corrections arrive as new versions, not overwrites.
- **Content hashing.** Hash the bytes of every input. The hash is the version identifier, and it detects silent vendor restatements for free.
- **A manifest per run.** Record code commit, environment lock hash, input hashes, parameters, as-of date, and output hash together in one artefact stored beside the results.
- **Derived data is disposable.** Anything cleaned or resampled should be rebuildable from raw plus code. If it is not, it is raw data wearing a disguise and must be snapshotted too.

> info **The reproduction test** Take a result from six months ago, rebuild it from its manifest, and compare hashes. Teams that have never run this test almost always discover they cannot. Running it once a quarter is cheaper than discovering it during an incident.

---

#### In Practice Across Asset Classes

**Equities.** The worst offenders are restated fundamentals and index membership. Both are routinely distributed in current-value-only form, and both are inputs to the most commonly researched signals. See [Equity Indices](/markets/equity-indices).

**Futures.** The reproducibility unit is the roll schedule. A continuous series rebuilt with a different roll rule is a different dataset, so the roll convention belongs in the manifest alongside the data hash. See [Roll and Carry](/markets/roll-and-carry).

**FX.** With no consolidated tape, the composite you snapshot is the composite you must keep. Re-querying a vendor for the same historical window can return different values as contributor sets change.

**Fixed income.** Curves and spreads are model outputs, so the curve-construction code is part of the dataset. Two researchers with the same bond prices and different bootstrapping choices will not reproduce each other. See [Curve Construction](/markets/curve-construction).

**On-chain.** The ledger is the strongest reproducibility substrate available: a block height is a perfect, immutable as-of key, and any archival node can reconstruct state at that height. The catch is that indexers and subgraphs sit between you and the chain, and their decoding logic changes. Pin the block height *and* the indexer version. See [RPC Nodes](/data-tooling/rpc-nodes) and [The Graph](/data-tooling/the-graph).

---

#### Assumptions and Failure Modes

- **Assumes stored history is immutable.** Vendors restate, exchanges publish corrections, and chains reorganise. Anything queried live is a moving input.
- **Assumes one value per date is enough.** It is not, for any quantity that gets revised. One row per date silently means "latest known".
- **Assumes the environment is stable.** A library upgrade can change a default, a rounding rule, or a sort stability guarantee, and thus change a result without changing a line of your code.
- **Assumes a fixed seed equals a robust result.** It equals a repeatable one. Dispersion across seeds is the actual finding.
- **Assumes reproducibility can be added later.** Retrofitting point-in-time semantics onto a dataset built without them is usually impossible: the historical vintages were never stored, and they cannot be recovered.
- **Assumes the researcher will notice.** Look-ahead bias has no symptom other than a better result, which is the one symptom nobody investigates. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Code

```python
import hashlib
import json
import subprocess
from pathlib import Path
import numpy as np
import pandas as pd


def as_of_view(facts: pd.DataFrame, as_of: pd.Timestamp) -> pd.DataFrame:
    """The dataset as it was known at `as_of` — one row per entity.

    Requires a bitemporal table with publish_time and valid_to. Selecting
    on event_time alone is the bug this function exists to prevent.
    """
    visible = facts[(facts["publish_time"] <= as_of) &
                    (facts["valid_to"].isna() | (facts["valid_to"] > as_of))]
    return visible.sort_values("publish_time").groupby(
        ["instrument_id", "event_time"], as_index=False
    ).last()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run_manifest(inputs: dict[str, Path], params: dict, as_of: str) -> dict:
    """Everything needed to rebuild this result. Write it beside the output."""
    return {
        "code_commit": subprocess.check_output(
            ["git", "rev-parse", "HEAD"], text=True).strip(),
        "lockfile_sha256": sha256(Path("uv.lock")),
        "input_sha256": {name: sha256(p) for name, p in inputs.items()},
        "params": params,
        "as_of": as_of,  # explicit: never today()
    }


# Pass generators, do not seed globals. np.random.seed() is process-wide
# state that another module can silently overwrite.
def simulate(returns: np.ndarray, n_paths: int, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    idx = rng.integers(0, len(returns), size=(n_paths, len(returns)))
    return returns[idx].cumsum(axis=1)
```

---

#### See Also

* [Market Data Sources](/data-tooling/data-sources)
* [Building a Simple Data Pipeline](/data-tooling/pipeline)
* [Notebooks](/data-tooling/notebooks)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)

---

### Notebooks

> info **Metadata** Level: Beginner | Prerequisites: Basic Python | Tags: notebooks, jupyter, hidden-state, reproducibility, research-process

A notebook is the right tool for the first hour of any research question. You do not yet know what the data looks like, the question is still forming, and the cost of an intermediate plot is one line. Nothing else in the Python ecosystem makes the loop between hypothesis and evidence that short, and shortening that loop is most of what makes research productive.

The problem is that a notebook document and the kernel that produced it are two different things, and only one of them is saved. The `.ipynb` file records cells and their outputs; the kernel holds the actual variables. Once you have edited a cell without re-running everything below it, those two objects describe different worlds — and the file, which is what a colleague reads, shows code next to a result that code did not produce.

---

#### The Kernel Is the Program, Not the File

```text
  what you read                       what actually ran
  ─────────────                       ─────────────────
  cell 1  load 2020–2024              In[1]  load 2015–2024
  cell 2  returns = ...               In[2]  returns = ...   (from 2015 data)
  cell 3  sharpe = 0.42               In[5]  sharpe = 0.42   (from In[2])
                                      In[4]  cell 1, edited and re-run

  The file is internally consistent. The claim it makes is false.
```

Reading a notebook top to bottom implies its cells ran top to bottom. Nothing enforces that. The execution counts in the margin are the only surviving evidence of the real order, and they are the first thing to check and the last thing anyone checks.

---

#### Worked Example: Hidden State

A researcher measures a strategy's risk-adjusted return, then narrows the sample. Take the arithmetic as illustrative rather than empirical.

<table>
  <tbody>
    <tr>
      <td><strong>Step</strong></td>
      <td><strong>Cell</strong></td>
      <td><strong>Code</strong></td>
      <td><strong>Effect on kernel</strong></td>
    </tr>
    <tr>
      <td>In[1]</td><td>1</td>
      <td><code>prices = load("2015-01-01", "2024-12-31")</code></td>
      <td><code>prices</code> holds ten years</td>
    </tr>
    <tr>
      <td>In[2]</td><td>2</td>
      <td><code>returns = prices.pct_change().dropna()</code></td>
      <td><code>returns</code> derived from ten years</td>
    </tr>
    <tr>
      <td>In[3]</td><td>3</td>
      <td><code>sharpe(returns)</code> displays <code>0.42</code></td>
      <td>Correct for ten years</td>
    </tr>
    <tr>
      <td>In[4]</td><td>1</td>
      <td>Start date edited to <code>2020-01-01</code>, cell re-run</td>
      <td><code>prices</code> now holds five years; <code>returns</code> unchanged</td>
    </tr>
    <tr>
      <td>In[5]</td><td>3</td>
      <td><code>sharpe(returns)</code> displays <code>0.42</code></td>
      <td>Still the ten-year figure</td>
    </tr>
  </tbody>
</table>

The saved file now shows a five-year load at the top and `0.42` at the bottom. Every cell is correct in isolation. The result is attributed to a sample it was not computed from, and there is no error, no warning, and no visual anomaly — only execution counts that read `1, 2, 3, 4, 5` against cells `1, 2, 3, 1, 3`.

Restarting the kernel and running all cells would produce whatever the five-year figure actually is, and the researcher would have learned something real. The gap between those two workflows is the entire discipline.

> warning **A result that has not survived restart-and-run-all is not a result** It is a plausible number that came out of an unknown program. Treat the restart as the moment a finding becomes reportable, not as a tidying-up step before sharing.

---

#### The Recurring Failure Modes

<table>
  <tbody>
    <tr>
      <td><strong>Failure</strong></td>
      <td><strong>How it appears</strong></td>
      <td><strong>Defence</strong></td>
    </tr>
    <tr>
      <td>Hidden state</td>
      <td>A variable exists only because a deleted cell once created it</td>
      <td>Restart and run all before believing anything</td>
    </tr>
    <tr>
      <td>Out-of-order execution</td>
      <td>Displayed output predates the code above it</td>
      <td>Check execution counts; enforce them in review</td>
    </tr>
    <tr>
      <td>Mutation in place</td>
      <td>Re-running a cell applies an adjustment twice</td>
      <td>Cells return new objects rather than modifying inputs</td>
    </tr>
    <tr>
      <td>Copy-paste divergence</td>
      <td>Two notebooks compute the same signal slightly differently</td>
      <td>Promote shared logic to a module and import it</td>
    </tr>
    <tr>
      <td>Silent look-ahead</td>
      <td>A scaler fitted on the full sample, then applied to history</td>
      <td>Look-ahead tests in the module, not in the notebook</td>
    </tr>
    <tr>
      <td>Untracked parameters</td>
      <td>The good result used a threshold nobody wrote down</td>
      <td>Parameters in one cell at the top, printed into the output</td>
    </tr>
    <tr>
      <td>Diff noise</td>
      <td>Every commit rewrites outputs and execution counts</td>
      <td>Strip outputs on commit; pair with a text representation</td>
    </tr>
  </tbody>
</table>

Mutation in place deserves emphasis because it is specific to market data. A cell that applies a corporate-action adjustment to a DataFrame and reassigns it looks idempotent and is not: run it twice and every price is adjusted twice. The same applies to currency conversion, unit scaling, and any cumulative operation. Writing cells as pure transformations — new name out, input untouched — makes re-running a cell harmless, which is what everyone assumes it already is.

---

#### Keeping Notebooks Honest

- **Restart and run all before sharing, always.** If it does not survive, the finding does not exist yet.
- **Parameters at the top, in one cell.** Dates, universe, thresholds, and data version in a single dictionary that is printed into the output, so the notebook records its own inputs.
- **Import, do not define.** Anything used twice belongs in `src/` with a test. The notebook then shows the analysis rather than the implementation. See [Python Setup](/data-tooling/python-setup).
- **Pin the data version, not the data path.** Record the content hash or snapshot identifier of every input in the output. A path is a moving target. See [Reproducible Experiments](/data-tooling/reproducible).
- **Strip outputs on commit, and keep a paired text file.** Tools such as `nbstripout` remove outputs from the committed JSON, and `jupytext` maintains a `.py` twin that reviews and diffs like ordinary code.
- **Automate the reruns.** `papermill` executes a notebook with injected parameters and writes an executed copy, which turns a notebook into something a scheduler can run and archive.
- **State the conclusion in the first cell.** A notebook whose top cell says what it concluded and on which data is a document; one that requires reading forty cells to find out is a transcript.

> info **Notebooks are lab notes, not software** They record what was tried, including what failed. That is valuable and worth keeping. The mistake is letting them become load-bearing — the moment a trading decision depends on a notebook cell, that logic needs to be a tested module.

---

#### In Practice Across Asset Classes

**Equities.** The universe definition is the parameter most often left implicit, and it is the one that determines whether the result suffers from survivorship bias. Print the universe snapshot identifier and its instrument count into the output. See [Market Data Sources](/data-tooling/data-sources).

**Futures.** The roll convention behaves like hidden state across notebooks: two analyses of the same market that stitch contracts differently are not comparable, and neither usually says which rule it used. Record it as a parameter. See [Roll and Carry](/markets/roll-and-carry).

**FX.** Quote-convention inversion is the classic notebook bug, because it produces a plausible-looking series with the sign of every move flipped. A cell asserting that a computed cross agrees with the directly quoted pair catches it immediately.

**Fixed income.** Curve construction happens upstream, so the notebook is consuming a model output. Record which curve build produced the inputs, because a notebook rerun after a curve methodology change will silently disagree with its earlier self. See [Curve Construction](/markets/curve-construction).

**On-chain.** Block height is an ideal parameter: it is an exact, immutable as-of key, and pinning it makes a query reproducible in a way a wall-clock timestamp never is. Pin the indexer or subgraph version alongside it, since decoding logic changes. See [The Graph](/data-tooling/the-graph) and [Dune Analytics](/data-tooling/dune-analytics).

---

#### Assumptions and Failure Modes

- **Assumes reading order equals execution order.** It does not, and the file preserves no evidence beyond the execution counts.
- **Assumes displayed output matches current code.** Only immediately after a full rerun; every edit afterwards breaks the correspondence.
- **Assumes re-running a cell is idempotent.** It is only if the cell does not mutate its inputs, which adjustment and conversion cells routinely do.
- **Assumes the kernel is the expected environment.** Kernels bind to an interpreter independently of the activated shell environment.
- **Assumes a saved notebook is reproducible.** Without a pinned environment and pinned data version it is a screenshot of a computation, not a description of one.
- **Assumes exploratory code stays exploratory.** It gets copied into production more often than it gets rewritten, carrying its untested assumptions with it.
- **Assumes stripping outputs is enough for review.** It removes the noise; it does not remove the need for someone to check the execution counts and the parameter cell.

---

#### Code

```python
# --- Cell 1: parameters and provenance. Everything the notebook depends on,
# in one place, printed into the output so the saved file records its inputs.
import hashlib, json, subprocess
from pathlib import Path
import pandas as pd

PARAMS = {
    "start": "2020-01-01",
    "end": "2024-12-31",
    "universe_snapshot": "universe/2024-12-31",
    "lookback_days": 60,
    "cost_bps": 5.0,
}

def data_fingerprint(path: str) -> str:
    """Content hash of the input. A path can change underneath you; a hash
    cannot, so this is what makes the notebook's claim checkable later."""
    h = hashlib.sha256()
    for f in sorted(Path(path).rglob("*.parquet")):
        h.update(f.read_bytes())
    return h.hexdigest()[:16]

PROVENANCE = {
    "params": PARAMS,
    "data_sha256": data_fingerprint(PARAMS["universe_snapshot"]),
    "code_commit": subprocess.check_output(
        ["git", "rev-parse", "--short", "HEAD"], text=True).strip(),
    "run_at": pd.Timestamp.utcnow().isoformat(),
}
print(json.dumps(PROVENANCE, indent=2))
```

```python
# --- Cell 2: pure transformation. Returns a new frame, never mutates the
# input, so re-running this cell out of order cannot double-adjust prices.
from research.data import apply_corporate_actions   # tested, imported, not defined here

def prepare(raw_prices: pd.DataFrame, actions: pd.DataFrame) -> pd.DataFrame:
    adjusted = apply_corporate_actions(raw_prices, actions)   # new object
    return adjusted.assign(ret=adjusted["adj_close"].pct_change(fill_method=None))
```

```text
# Making the discipline mechanical rather than remembered.
jupytext --set-formats ipynb,py:percent notebooks/*.ipynb   # reviewable text twin
nbstripout --install                                        # strip outputs on commit
papermill in.ipynb out.ipynb -p start 2020-01-01            # parameterised rerun
pytest --nbval notebooks/carry.ipynb                        # outputs still reproduce
```

---

#### See Also

* [Python Setup](/data-tooling/python-setup)
* [Reproducible Experiments](/data-tooling/reproducible)
* [Working with Market Data in Python](/data-tooling/python)
* [Notebook Standards](/contributing/notebook-standards)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Backtest vs Live](/risk/backtest-vs-live)

---

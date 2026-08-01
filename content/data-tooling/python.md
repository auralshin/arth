### Working with Market Data in Python

> info **Metadata** Level: Intermediate | Prerequisites: Basic Python, Returns | Tags: python, pandas, numpy, pyarrow, performance, idioms

Python is the default language of quantitative research not because it is fast — it is not — but because the array libraries underneath it are, and because the distance between an idea and a plotted result is short. The skill is knowing where the boundary lies: which operations dispatch into compiled code over a contiguous buffer, and which quietly fall back to interpreting one Python object per row.

The second skill is subtler and matters more. Several of pandas' most convenient defaults are wrong for time series research. Arithmetic between two Series aligns on the index rather than by position; `pct_change` has historically forward-filled gaps before computing; a centred rolling window peeks at the future. None of these raise an error. They produce a number, and the number is plausible.

---

#### The Stack

<table>
  <tbody>
    <tr>
      <td><strong>Library</strong></td>
      <td><strong>Role</strong></td>
      <td><strong>When it is the wrong tool</strong></td>
    </tr>
    <tr>
      <td>NumPy</td>
      <td>Contiguous typed arrays and vectorised arithmetic. Everything else sits on it.</td>
      <td>No index, no labels, no missing-value semantics beyond NaN</td>
    </tr>
    <tr>
      <td>pandas</td>
      <td>Labelled, indexed tabular data; time-aware resampling, joins, group operations</td>
      <td>Memory-hungry; single-threaded for most operations</td>
    </tr>
    <tr>
      <td>PyArrow</td>
      <td>Columnar memory and the Parquet reader/writer; zero-copy interchange</td>
      <td>Not an analysis library — it moves and stores, it does not compute much</td>
    </tr>
    <tr>
      <td>SciPy</td>
      <td>Optimisation, interpolation, distributions, linear algebra</td>
      <td>Statistical models with inference belong in statsmodels</td>
    </tr>
    <tr>
      <td>statsmodels</td>
      <td>Regression with standard errors, time series models, diagnostics</td>
      <td>Slow on very wide panels; no regularisation to speak of</td>
    </tr>
    <tr>
      <td>Polars / DuckDB</td>
      <td>Larger-than-memory work, lazy query planning, fast joins and aggregations</td>
      <td>Smaller ecosystem for finance-specific time series operations</td>
    </tr>
    <tr>
      <td>Numba</td>
      <td>Compiling genuinely sequential loops that cannot be vectorised</td>
      <td>Compilation cost and typing friction for anything already vectorised</td>
    </tr>
  </tbody>
</table>

A reasonable default: PyArrow for storage, pandas for research, NumPy for the numerical core, and Polars or DuckDB when a dataset stops fitting comfortably in memory.

---

#### Idioms That Matter

**Index alignment is the feature and the trap.** `a - b` on two Series aligns on the index first. If one has an extra timestamp, the result contains NaN where you expected a number, and the series is longer than either input. This is correct behaviour and it is why silent NaN propagation is so common. When you mean positional arithmetic, say so with `.to_numpy()`.

**Lag with `shift`, never by hand.** A signal computed from data through time `t` can only be traded at `t+1`. Writing `signal.shift(1)` makes that explicit and survives resampling and reindexing. Slicing arrays by offset does not.

**Rolling windows are trailing by default, and that is the correct default.** `series.rolling(20).mean()` at time `t` uses observations `t-19` through `t`. Passing `center=True` centres the window on `t`, which means half of it lies in the future. Centred windows are legitimate for describing history and never legitimate for constructing a signal. See [Rolling Windows](/quant-math/rolling-windows).

**Use `expanding` for anything that must not use future data at all** — standardising a feature, estimating a threshold, fitting a scaler. A `StandardScaler` fitted on the full sample and applied to the whole history leaks the sample mean and standard deviation backwards into every early observation.

**`merge_asof` for alignment, `merge` for identity.** Joining two instruments on exact timestamps drops nearly everything; joining as-of backward gives each row the most recent value that already existed. Both frames must be sorted on the join key, and pandas will raise rather than guess.

**`groupby(...).transform(...)` returns a frame shaped like the input**, which is what you want for cross-sectional operations such as demeaning returns within a sector on each date. `groupby(...).apply(...)` with a Python function is the slow fallback.

> warning **`pct_change` on a gapped series** Historically `pct_change` forward-filled missing values before differencing, so a gap produced a zero return instead of a NaN. Pass `fill_method=None` explicitly, or compute returns from prices you have already decided how to fill. See [Cleaning](/data-tooling/cleaning).

---

#### Performance Traps

<table>
  <tbody>
    <tr>
      <td><strong>Pattern</strong></td>
      <td><strong>Why it hurts</strong></td>
      <td><strong>Instead</strong></td>
    </tr>
    <tr>
      <td><code>for _, row in df.iterrows()</code></td>
      <td>Builds a Python object per row and upcasts mixed types to object</td>
      <td>Vectorise, or <code>itertuples()</code> if a loop is unavoidable</td>
    </tr>
    <tr>
      <td>Growing a frame by concatenating in a loop</td>
      <td>Each concat copies everything so far — quadratic in row count</td>
      <td>Collect pieces in a list, concat once at the end</td>
    </tr>
    <tr>
      <td>Repeated <code>.loc</code> assignment inside a loop</td>
      <td>Index lookup and possible reallocation on every write</td>
      <td>Build a NumPy array, assign the column once</td>
    </tr>
    <tr>
      <td><code>object</code> dtype for symbols</td>
      <td>One Python string object per cell; group operations hash them all</td>
      <td><code>category</code>, or PyArrow-backed string dtype</td>
    </tr>
    <tr>
      <td>Reading a whole Parquet file</td>
      <td>Decompresses columns and partitions you never touch</td>
      <td>Pass <code>columns=</code> and partition filters — pushdown is the point</td>
    </tr>
    <tr>
      <td>Chained indexing (<code>df[a][b] = x</code>)</td>
      <td>May write to a temporary copy; behaviour differs across versions</td>
      <td>Single <code>.loc[rows, cols] = x</code></td>
    </tr>
    <tr>
      <td>Unsorted index with slicing or as-of joins</td>
      <td>Falls back to slow paths or raises outright</td>
      <td><code>sort_index()</code> once at load, then keep it sorted</td>
    </tr>
  </tbody>
</table>

Two structural points sit behind the table. First, a wide DataFrame with mixed dtypes is stored as several blocks, so operations spanning columns of different types copy; keeping numeric research data homogeneously `float64` avoids a whole class of surprise. Second, `float32` halves memory and is usually adequate for price levels and returns, but is not adequate for cumulative sums over long histories, where the error accumulates.

> info **Measure before optimising** Research code is overwhelmingly bounded by data loading and by one badly-written loop. Profile first; the intuition about which line is slow is wrong more often than not.

---

#### In Practice Across Asset Classes

**Equities.** The natural shape is a panel: dates by instruments. Cross-sectional operations — ranking, demeaning, neutralising by sector — are `groupby` on the date level with `transform`. The panel is unbalanced, because instruments list and delist, and dropping rows with NaN to make it balanced reintroduces survivorship bias. See [Market Data Sources](/data-tooling/data-sources).

**Futures.** Two frames are needed, not one: individual contracts and the derived continuous series. Keep the roll dates as a column so any statistic can exclude roll-day returns rather than treating a contract change as a price move. See [Roll and Carry](/markets/roll-and-carry).

**FX.** Quote conventions are per-pair and inversion is a constant source of sign errors. Store an explicit base and quote currency column rather than relying on the string ordering of the pair name, and derive crosses through a single reference currency so the triangular relationship holds by construction.

**Fixed income.** Instruments have terms, not just prices: coupon schedules, day-count conventions, maturity dates. The pandas-shaped part is the price panel; the rest is reference data that belongs in a separate table keyed by instrument and effective date. See [Fixed Income 101](/markets/fixed-income-101).

**On-chain.** Two problems dominate. Token amounts are integers with a per-token decimals field and routinely exceed 64-bit range, so reading them as `float64` loses precision silently — read as string or Python integer and scale explicitly. And the natural join key is block height rather than timestamp, since several transactions in one block share a timestamp but have a definite order. See [Event Logs](/data-tooling/event-logs).

---

#### Assumptions and Failure Modes

- **Assumes alignment is positional.** It is label-based, so an index mismatch produces NaN rather than an error, and the NaN propagates silently through the rest of the calculation.
- **Assumes NaN means missing.** It can also mean a failed join, a zero denominator, or an unaligned index. The three need different responses and look identical.
- **Assumes rolling defaults are safe.** They are, until someone sets `center=True` or fits a scaler on the whole sample, at which point the backtest sees the future.
- **Assumes dtypes survive round trips.** CSV loses timezone awareness and integer types; Parquet preserves them. Any pipeline with a CSV in the middle re-infers types on every read.
- **Assumes float64 is exact.** It is not for large integers, which matters for on-chain amounts and for share counts on very large positions.
- **Assumes in-memory is enough.** Tick data for a broad universe is not, and the first symptom is a machine that swaps rather than an exception.
- **Assumes a fast library makes correct code.** Vectorising a look-ahead bug produces the wrong answer more quickly.

---

#### Code

```python
import numpy as np
import pandas as pd

# --- Load only what is needed. Predicate and column pushdown happen in the
# Parquet reader, so unread columns are never decompressed.
prices = pd.read_parquet(
    "curated/bars",
    columns=["ts", "instrument_id", "close", "volume"],
    filters=[("trade_date", ">=", "2020-01-01")],
).astype({"instrument_id": "category"})

panel = prices.pivot(index="ts", columns="instrument_id", values="close").sort_index()

# --- Returns. fill_method=None so a gap stays NaN instead of becoming a
# zero return, which would understate volatility.
returns = panel.pct_change(fill_method=None)


def cross_sectional_zscore(returns: pd.DataFrame) -> pd.DataFrame:
    """Standardise each date across instruments.

    Row-wise operations use only same-date information, so there is no
    look-ahead here regardless of how much history is loaded.
    """
    return returns.sub(returns.mean(axis=1), axis=0).div(returns.std(axis=1), axis=0)


def expanding_zscore(series: pd.Series, min_obs: int = 252) -> pd.Series:
    """Standardise through time using only the past.

    The equivalent with series.mean() and series.std() computed once over
    the full sample is the most common look-ahead bug in research code.
    """
    mean = series.expanding(min_obs).mean()
    std = series.expanding(min_obs).std()
    return (series - mean) / std


def tradeable_signal(raw_signal: pd.DataFrame, lag: int = 1) -> pd.DataFrame:
    """A signal computed on bar t can only be acted on from bar t+1."""
    return raw_signal.shift(lag)


# --- Sequential logic that genuinely cannot be vectorised: a stateful
# trailing stop. Drop to NumPy so the loop is over floats, not Series.
def trailing_stop_exit(close: np.ndarray, stop_fraction: float) -> np.ndarray:
    peak = -np.inf
    stopped = np.zeros(len(close), dtype=bool)
    for i, price in enumerate(close):
        peak = max(peak, price)
        stopped[i] = price < peak * (1.0 - stop_fraction)
    return stopped
```

---

#### See Also

* [Python Setup](/data-tooling/python-setup)
* [Notebooks](/data-tooling/notebooks)
* [Working with Market Data in TypeScript/JavaScript](/data-tooling/typescript)
* [Cleaning and Resampling Market Data](/data-tooling/cleaning)
* [Rolling Windows](/quant-math/rolling-windows)
* [Simulation in Python](/simulation/python)

---

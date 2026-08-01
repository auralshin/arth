### Backtesting in Python

> info **Metadata** Level: Intermediate | Prerequisites: Python basics, Event-Driven Backtesting | Tags: python, pandas, numpy, tooling, backtesting

Python dominates backtesting because pandas and NumPy make it trivial to express a strategy over an entire history in a few lines. That same convenience is why so many Python backtests are wrong. Array operations act on the whole series at once, and the whole series includes the future. `rolling(20).mean()` at row `t` uses row `t`. `resample("1D").last()` labels a bar with the start of its interval. `dropna()` silently changes the sample. Each of these is a correct, documented behaviour of a well-designed library, and each of them will hand you the future if you are not paying attention.

There are two viable idioms, and the choice between them is a trade-off between speed and safety. The **vectorised** idiom computes everything as arrays and is fast enough to sweep thousands of configurations. The **event-driven** idiom loops over events and makes lookahead structurally impossible. Mature research workflows use both: vectorised for screening, event-driven for anything that survives. The critical discipline is treating the vectorised number as an upper bound rather than a result.

---

#### The Two Idioms

<table>
  <tbody>
    <tr><td><strong>Dimension</strong></td><td><strong>Vectorised (pandas / NumPy)</strong></td><td><strong>Event-driven (explicit loop)</strong></td></tr>
    <tr><td>Throughput</td><td>Whole history in milliseconds</td><td>Orders of magnitude slower in pure Python</td></tr>
    <tr><td>Lookahead</td><td>Prevented only by convention — a missing shift leaks silently</td><td>Prevented by construction</td></tr>
    <tr><td>Path dependence</td><td>Awkward: stops, trailing exits, partial fills, margin</td><td>Natural</td></tr>
    <tr><td>Costs and fills</td><td>A per-trade constant, applied after the fact</td><td>A model invoked at the moment of trading</td></tr>
    <tr><td>Live parity</td><td>None — production is a rewrite</td><td>The same handler can be driven by a live feed</td></tr>
  </tbody>
</table>

---

#### Worked Example

The cost of a single missing `shift`. A three-day moving average rule on five prices: go long when the close exceeds the three-day average.

<table>
  <tbody>
    <tr><td><strong>Index</strong></td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td></tr>
    <tr><td><strong>Close</strong></td><td>100</td><td>102</td><td>101</td><td>105</td><td>103</td></tr>
    <tr><td><strong>3-day mean</strong></td><td>—</td><td>—</td><td>101.000</td><td>102.667</td><td>103.000</td></tr>
    <tr><td><strong>Signal (close above mean)</strong></td><td>—</td><td>—</td><td>0</td><td>1</td><td>0</td></tr>
    <tr><td><strong>Return (%)</strong></td><td>—</td><td>2.000</td><td>-0.980</td><td>3.960</td><td>-1.905</td></tr>
  </tbody>
</table>

Step by step:

1. **Mean at index 3**: `(102 + 101 + 105) / 3 = 102.667`, and `105` exceeds it, so the signal is 1
2. **The wrong calculation**, multiplying signal at `t` by return at `t`: only index 3 contributes, giving `1 * 3.960% = +3.960%`
3. **The correct calculation**, multiplying signal at `t-1` by return at `t`: index 3 uses the index-2 signal of 0, contributing nothing; index 4 uses the index-3 signal of 1, contributing `-1.905%`
4. **Total**: `+3.96%` versus `-1.90%`

The signal at index 3 is computed from the index-3 close. Multiplying it by the index-3 return means the rule used that day's closing price to decide it should have been long that day. It is one character of difference in the code, and it inverts the sign of the result. On a real history this error does not produce an implausible curve; it produces a plausible one, which is what makes it dangerous.

> warning **The unit test that catches this** Feed the backtester a pure random walk with no drift. Any strategy should return approximately zero before costs and clearly negative after them. A positive result on random data means the engine, not the strategy, is generating the profit.

---

#### Library Landscape

Rather than naming packages, which change, it is more useful to recognise the categories and what each one assumes on your behalf.

**Array libraries.** NumPy and pandas provide the primitives. They assume nothing about finance, which means they will not stop you doing anything, including looking ahead.

**Vectorised backtest frameworks.** Take a signal array and a price array and return a performance report. Fast and convenient. Almost all apply costs as a flat rate on turnover and fill at the bar price, which is exactly the naive fill assumption discussed in [Orderbook Simulation](/simulation/orderbook).

**Event-driven frameworks.** Provide an engine, a data handler, an execution model and a portfolio. Slower, more ceremony, far harder to cheat with. Worth the cost once an idea has survived screening.

**Market replay and simulation engines.** Reconstruct a limit order book from message data and simulate order lifecycle. Necessary for anything passive or short-horizon; substantial data and compute requirements.

When evaluating any framework, three questions settle most of it: where does it get the fill price, when does it apply costs, and can the strategy reach data it should not have?

---

#### Performance Without Losing Safety

The usual objection to event-driven backtesting in Python is speed. Three techniques recover most of it without reintroducing lookahead.

**Vectorise the data, loop the decisions.** Precompute features as arrays before the loop starts — with the correct shift — and let the loop read scalars. The expensive part is feature computation, not the loop.

**Use NumPy arrays inside the loop, not DataFrames.** Row-wise DataFrame access is dramatically slower than indexing a NumPy array. Convert once, before the loop.

**Compile the hot loop.** A numerical loop annotated for just-in-time compilation typically runs within an order of magnitude of compiled code. The constraint is that the loop body must be numeric, which is usually achievable if the strategy state is a small set of floats.

**Parallelise across configurations, not within a run.** A sweep is embarrassingly parallel across cells. Keep each run single-threaded and deterministic; parallelism inside a run destroys reproducibility for very little gain. See [Performance Optimisation](/building-simulations/performance-optimization).

Speed has a hazard attached. Making a sweep cheap makes it larger, and a larger sweep is a bigger multiple-comparisons problem. Count and log every configuration you run — see [Multiple Testing](/stat-methods/multiple-testing) and, for splitting samples correctly under serial correlation, [Purged Cross-Validation](/ml-finance/purged-cross-validation).

---

#### In Practice Across Asset Classes

**Daily equities.** Panel data across many instruments and dates. The idiomatic representation is a multi-indexed frame or an instrument-by-date matrix. The pitfall is that a cross-sectional operation — ranking, demeaning, normalising — must be applied within a date and never across the whole panel, or the ranking uses future dates.

**Intraday futures.** Row counts reach the hundreds of millions, so memory layout matters. Columnar formats and chunked processing become necessary, and reading a whole history into a DataFrame stops being an option.

**FX.** Multiple venue feeds with different conventions must be aligned. `merge_asof` with an explicit tolerance is the right tool; a plain merge on rounded timestamps is the wrong one.

**Fixed income and credit.** Sparse, irregular observations. Resampling to a regular grid forward-fills stale marks, which suppresses volatility. Keep the irregular series and handle gaps explicitly.

**On-chain markets.** Data arrives as event logs from a node or an indexer, with integer amounts and per-token decimals. Convert to floats only at the final reporting step; intermediate arithmetic in floats loses precision on 18-decimal quantities. See [Event Logs](/data-tooling/event-logs).

---

#### Assumptions and Failure Modes

- **Rolling windows exclude the current bar.** They do not. `rolling(n)` at row `t` includes `t`, so anything used for a decision at `t` must be shifted.
- **Resampling labels are unambiguous.** They are not. A daily bar from intraday data may be labelled at the interval start, meaning the bar carries a timestamp before the data that produced it existed.
- **`dropna` is harmless.** It changes the sample, usually by removing early rows where indicators have not warmed up — and sometimes by removing rows where a later-arriving field was absent, which is selection on the future.
- **In-place mutation is contained.** A cached feature frame mutated during one sweep cell contaminates the next. Copy or recompute.
- **Floating-point sums are exact.** They are not. Accumulating millions of small P&L increments drifts; use compensated summation or integer minor units for cash.
- **Reruns reproduce.** Only with a seeded generator, a pinned environment and no reliance on dictionary or set ordering. See [Reproducible Research](/data-tooling/reproducible).
- **A framework is safe because it is popular.** Check where it takes its fill price before trusting a number from it.

---

#### Code

A vectorised backtest with the shift made explicit and unavoidable, plus the random-walk sanity check that catches lookahead.

```python
import numpy as np
import pandas as pd


def vectorised_backtest(prices, signal, cost_per_turn_bps=5.0):
    """Signal-to-return backtest with the lookahead guard made explicit.

    `signal` is the target position computed FROM data up to and including
    each row. Shifting here, once, is what makes it tradeable: the position
    held into row t was decided at row t-1.
    """
    returns = prices.pct_change()
    position = signal.shift(1).fillna(0.0)

    # Turnover is charged where the position changes, at the moment it changes.
    turnover = position.diff().abs().fillna(position.abs())
    cost = turnover * cost_per_turn_bps / 10_000

    return position * returns - cost


def lookahead_smoke_test(strategy_fn, n=20_000, seed=0):
    """Run the strategy on a driftless random walk.

    Expected result is approximately zero before costs. A reliably
    positive result means the engine is the source of the edge.
    """
    rng = np.random.default_rng(seed)
    steps = rng.normal(0.0, 0.01, n)
    prices = pd.Series(100.0 * np.exp(np.cumsum(steps)))

    net = vectorised_backtest(prices, strategy_fn(prices), cost_per_turn_bps=0.0)
    return net.sum(), net.mean() / net.std() * np.sqrt(252)


def moving_average_signal(prices, window=3):
    # rolling(window) at row t INCLUDES row t. That is correct here only
    # because vectorised_backtest shifts before applying the position.
    return (prices > prices.rolling(window).mean()).astype(float)


total, sharpe = lookahead_smoke_test(moving_average_signal)
print(f"random-walk total {total:.4f}, sharpe {sharpe:.2f}")
```

---

#### See Also

* [Backtesting in TypeScript/JavaScript](/simulation/typescript)
* [Event-Driven Backtesting Basics](/simulation/event-driven)
* [Building a Simple Backtester](/simulation/building-backtester)
* [Python for Quants](/data-tooling/python)
* [Reproducible Research](/data-tooling/reproducible)
* [Performance Optimisation](/building-simulations/performance-optimization)

---

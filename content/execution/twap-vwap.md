### TWAP & VWAP

> info **Metadata** Level: Intermediate | Prerequisites: Execution Overview, Market Impact, Volume | Tags: execution, twap, vwap, scheduling, algorithms

TWAP and VWAP are the two workhorse execution schedules. Both slice a parent order into children spread over a window; they differ only in the weights. **Time-weighted average price (TWAP)** trades an equal quantity in each equal slice of time. **Volume-weighted average price (VWAP)** trades in proportion to the market's expected volume in each slice.

They dominate agency execution not because they are optimal — they are not — but because they are transparent, easy to specify, and easy to grade against a benchmark of the same name. That last property is also their central weakness: an algorithm designed to match a benchmark will match it in circumstances where matching is the wrong thing to do.

---

#### Formal Definition

For a window split into `n` intervals with market volume `v_i` and average traded price `p_i` in interval `i`:

```text
VWAP  =  sum(v_i * p_i) / sum(v_i)
TWAP  =  sum(p_i) / n
```

A schedule allocates the parent quantity `Q` across intervals with weights `w_i` summing to one, and its tracking error against the VWAP benchmark is the difference between its achieved average and the benchmark:

```text
TWAP schedule:  w_i = 1 / n
VWAP schedule:  w_i = v_hat_i / sum(v_hat)      (v_hat = forecast volume)
POV schedule:   q_i = rho * v_i                 (rho = target participation)

slippage     =  sum(w_i * p_i)  -  VWAP
```

Slippage is zero if and only if `w_i` matches the realised volume share exactly, so everything a VWAP algorithm does is an attempt to forecast `v_i`. Note also the difference in kind between the schedules: TWAP and VWAP are **fixed quantity, uncertain duration in volume terms**, whereas a percentage-of-volume (POV) schedule is **fixed participation, uncertain duration in time** — it finishes when the market has traded enough, which may be never. See [Implementation Shortfall](/execution/implementation-shortfall).

---

#### Worked Example

A five-interval session with these market volumes and interval average prices:

<table>
  <tbody>
    <tr><td><strong>Interval</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td><strong>Total</strong></td></tr>
    <tr><td><strong>Market volume</strong></td><td>300,000</td><td>200,000</td><td>150,000</td><td>150,000</td><td>200,000</td><td>1,000,000</td></tr>
    <tr><td><strong>Average price</strong></td><td>20.10</td><td>20.20</td><td>20.30</td><td>20.25</td><td>20.15</td><td>&mdash;</td></tr>
  </tbody>
</table>

**Benchmarks.**

1. Volume-weighted numerator: `300,000*20.10 + 200,000*20.20 + 150,000*20.30 + 150,000*20.25 + 200,000*20.15`
2. `= 6,030,000 + 4,040,000 + 3,045,000 + 3,037,500 + 4,030,000 = 20,182,500`
3. **VWAP** `= 20,182,500 / 1,000,000 = 20.1825`
4. **TWAP** `= (20.10 + 20.20 + 20.30 + 20.25 + 20.15) / 5 = 101.00 / 5 = 20.20`

The two differ by 1.75 cents because the cheap intervals happen to be the heavy-volume ones. That is not a coincidence in real markets — the open and close are both high-volume and price-distinctive, which is why the two benchmarks routinely diverge.

**A buyer of 50,000 shares, three schedules.**

*TWAP schedule*: 10,000 per interval. Average price is the simple mean, **20.20**. Against the VWAP benchmark: `(20.20 - 20.1825) / 20.1825 = 8.67 bps` of underperformance. In cash, `50,000 * 0.0175 = 875`.

*Perfect VWAP schedule*: weights matching realised volume — 15,000 / 10,000 / 7,500 / 7,500 / 10,000. By construction the average price is exactly **20.1825** and slippage to the VWAP benchmark is **zero**. This is a tautology, not an achievement: a perfect volume forecast produces perfect tracking, and forecasts are never perfect.

*Mis-forecast VWAP schedule*: the model predicted a heavier open than occurred — weights 35% / 20% / 15% / 15% / 15%, so 17,500 / 10,000 / 7,500 / 7,500 / 7,500.

1. `17,500*20.10 = 351,750`
2. `10,000*20.20 = 202,000`
3. `7,500*20.30 = 152,250`
4. `7,500*20.25 = 151,875`
5. `7,500*20.15 = 151,125`
6. Total `1,009,000`, average `1,009,000 / 50,000 = 20.18`

That *beats* the VWAP benchmark by `(20.1825 - 20.18) / 20.1825 = 1.24 bps` — because over-weighting interval 1 happened to over-weight the cheapest interval. The forecast was wrong and the outcome was favourable.

> info **VWAP tracking error is a bet on the volume profile, not on skill** The mis-forecast schedule outperformed for a reason unrelated to execution quality. Reverse the price path and the same forecast error becomes a loss. Judging a desk on single-order VWAP slippage rewards luck.

---

#### When Each Is Appropriate

**TWAP** suits situations where the volume profile is unreliable or where you specifically do not want your size linked to market activity: illiquid names with lumpy volume, instruments with no meaningful historical profile, and orders small enough that participation is not a concern. It is also the right default when you want a schedule that cannot be steered by others manipulating volume. **VWAP** suits large orders in liquid names with a stable intraday profile, where trading in proportion to volume keeps participation — and therefore [impact](/execution/market-impact) — roughly constant through the day. Constant participation is the real justification; matching the benchmark is a by-product.

**Neither** suits an order carrying a fast-decaying signal. Both spread execution across the full window regardless of whether the alpha survives that long. If the reason for trading will be public in twenty minutes, a schedule that finishes at the close guarantees you trade after the edge is gone.

---

#### How They Are Gamed

A predictable schedule is a predictable counterparty. Three mechanisms recur.

**Pattern detection.** A TWAP that sends a child order of the same size at the same cadence is trivially identifiable from public data, after which others can buy ahead of each expected child and sell it back. Randomising slice sizes and timing raises the cost of detection but does not eliminate it, and randomisation itself increases tracking error.

**Benchmark manipulation.** Because VWAP is computed from public prints, the benchmark can be influenced: trading aggressively early to raise the VWAP, then buying the bulk of the order against the inflated benchmark, produces good measured slippage and bad actual cost. The vulnerability is structural. Worse, if your order is a material share of session volume, your own prints are inside the VWAP you are measured against — measured slippage compresses toward zero by exactly the factor `(1 - w)` for a volume share `w`, with the algebra worked through in [Execution Benchmarks](/execution/execution-benchmarks).

**Closing-auction pull.** Volume profiles concentrate at the close in most equity markets, so a VWAP schedule leaves a large tail for the auction. Everyone else's VWAP schedule does too, which makes the close the most crowded and least forgiving part of the day.

> warning **Beating VWAP and losing money are compatible** In a trending market, a VWAP algorithm mechanically buys more as the price rises, tracks the benchmark closely, and delivers a terrible price relative to the decision. Measured on VWAP it succeeded. Measured on [implementation shortfall](/execution/implementation-shortfall) it failed.

---

#### In Practice Across Asset Classes

**Equities.** The native setting. Volume profiles are strongly U-shaped, and market-on-close volume dominates in many markets. Profiles are usually estimated from a trailing window of similar days, with adjustments for earnings dates, index events, and expiries.

**Futures.** VWAP works well on the front month, where volume is deep and the profile is stable around cash-market hours and macro releases; deferred months are too thin for a volume-proportional schedule to be meaningful. **Fixed income.** Neither schedule applies to request-for-quote trading. The nearest analogue is spreading enquiries across the day and across dealers to limit information leakage.

**FX.** No consolidated volume figure exists, so a true VWAP benchmark is impossible; venue-specific or dealer-specific VWAPs are used instead and are not comparable across counterparties. TWAP is correspondingly more common, and fixing benchmarks such as a published daily fix play the role VWAP plays in equities.

**On-chain.** TWAP-style splitting across blocks is the standard way to reduce curve slippage, and several protocols implement it natively. Two constraints bite: each slice pays a fixed gas cost, so beyond a point extra slices cost more than they save, and a schedule visible in the mempool can be sandwiched slice by slice. Note also that "TWAP oracle" on-chain means something different — a time-averaged *price feed* used to resist manipulation, not an execution schedule. See [Gas & Mempool](/microstructure/gas-mempool), [Oracles](/building-blocks/oracles), and [Slippage & Frontrunning](/risk/slippage-frontrunning).

---

#### Assumptions and Failure Modes

- **The historical volume profile predicts today's.** It fails on exactly the days that matter — index rebalances, earnings, macro surprises — where the profile shifts and the schedule is badly misallocated.
- **The window is the right window.** Both schedules take the start and end times as given. If the window is chosen for convenience rather than from signal decay, the schedule optimises inside a badly chosen box.
- **Your trading does not change the profile, and the benchmark is exogenous.** Neither holds for a large participant: you attract counterparties who trade when you do, and your own prints enter the benchmark and flatter it.
- **Equal time slices are equal risk slices.** They are not: volatility is far higher at the open and close, so a TWAP takes more price risk per share in some intervals than others.
- **Tracking error is a quality measure.** Low tracking error means the schedule matched the profile. It says nothing about whether trading over that window was the right decision.

---

#### Code

```python
import numpy as np


def schedule(total_qty, volume_forecast=None, n_intervals=None):
    """Child order sizes for a VWAP (with forecast) or TWAP (without) schedule."""
    if volume_forecast is None:
        return np.full(n_intervals, total_qty / n_intervals)
    v = np.asarray(volume_forecast, dtype=float)
    return total_qty * v / v.sum()


def slippage_bps(child_qty, prices, benchmark):
    """Positive = paid more than the benchmark, for a buy order."""
    q, p = np.asarray(child_qty, float), np.asarray(prices, float)
    return ((q * p).sum() / q.sum() - benchmark) / benchmark * 1e4


volumes = [300_000, 200_000, 150_000, 150_000, 200_000]
prices = [20.10, 20.20, 20.30, 20.25, 20.15]
vwap = float(np.dot(volumes, prices) / np.sum(volumes))     # 20.1825

slippage_bps(schedule(50_000, n_intervals=5), prices, vwap)       # 8.67
slippage_bps(schedule(50_000, volumes), prices, vwap)             # 0.00
slippage_bps([17_500, 10_000, 7_500, 7_500, 7_500], prices, vwap) # -1.24
```

---

#### See Also

* [Implementation Shortfall](/execution/implementation-shortfall)
* [Execution Benchmarks](/execution/execution-benchmarks)
* [Almgren–Chriss](/execution/almgren-chriss)
* [Market Impact](/execution/market-impact)
* [Volume](/signals/volume)
* [Fees & Routing](/microstructure/fees-routing)

---

### Execution Benchmarks

> info **Metadata** Level: Intermediate | Prerequisites: TWAP & VWAP, Implementation Shortfall, Transaction Cost Analysis | Tags: execution, benchmarks, incentives, measurement, governance

A benchmark is the price your fills are compared against. It looks like a measurement choice and is actually a governance choice, because whichever benchmark a trader is graded on becomes the objective they optimise. Change the benchmark and you change the trading, before anyone has issued a single instruction about strategy.

This makes benchmark selection one of the highest-leverage decisions in an execution process and one of the least examined. Firms spend months negotiating commission rates worth two basis points while adopting a benchmark that quietly redirects tens of basis points of behaviour. The question is never "which benchmark is most accurate" — they are all accurate answers to different questions — but "which behaviour do I want, and which benchmark rewards it".

---

#### The Candidates and What Each Rewards

<table>
  <tbody>
    <tr><td><strong>Benchmark</strong></td><td><strong>Rewards</strong></td><td><strong>Distorts toward</strong></td></tr>
    <tr><td>Decision price</td><td>Getting the position on quickly and completely.</td><td>Excessive urgency; taking impact to avoid delay risk.</td></tr>
    <tr><td>Arrival price</td><td>Trading fast once the order is received.</td><td>Same, plus an incentive to time-stamp the arrival late.</td></tr>
    <tr><td>Interval VWAP</td><td>Tracking the market's own volume profile.</td><td>Passivity; never accelerating even when the price runs away.</td></tr>
    <tr><td>Full-day VWAP</td><td>Spreading trading across the whole session.</td><td>Trading longer than the signal justifies.</td></tr>
    <tr><td>Closing price</td><td>Matching the mark the book is valued at.</td><td>Concentrating in the close, and influencing it.</td></tr>
    <tr><td>Participation-adjusted</td><td>Cost relative to expected difficulty.</td><td>Gaming the difficulty forecast rather than the execution.</td></tr>
  </tbody>
</table>

Two structural properties separate good benchmarks from bad ones. **Exogeneity**: a benchmark fixed before trading begins — the decision or arrival price — cannot be moved by the trader, whereas one computed from prices during the trading window can be, and the more of the window's volume you are the more you move it. **Completeness**: a benchmark applied only to filled shares ignores the order you failed to complete. Only decision-price shortfall charges for the miss; every average-price benchmark is silent about it, and silence is an incentive.

---

#### Worked Example

A session with a steadily rising price. Arrival price 40.00, close 40.40.

<table>
  <tbody>
    <tr><td><strong>Interval</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td><strong>Market volume</strong></td><td>300,000</td><td>200,000</td><td>150,000</td><td>150,000</td><td>200,000</td></tr>
    <tr><td><strong>Average price</strong></td><td>40.00</td><td>40.10</td><td>40.20</td><td>40.30</td><td>40.40</td></tr>
  </tbody>
</table>

Market VWAP: `(300,000*40.00 + 200,000*40.10 + 150,000*40.20 + 150,000*40.30 + 200,000*40.40) / 1,000,000 = 40,175,000 / 1,000,000 = 40.175`.

Three traders each buy 100,000 shares, each optimising a different benchmark. **A** front-loads everything into interval 1 and, because 100,000 shares is a third of that interval's volume, pays impact — average fill **40.06**. **B** matches the volume profile and pays little impact — average fill **40.185**. **C** waits for the closing auction — average fill **40.45**.

<table>
  <tbody>
    <tr><td><strong>Trader</strong></td><td><strong>Avg fill</strong></td><td><strong>vs arrival (40.00)</strong></td><td><strong>vs VWAP (40.175)</strong></td><td><strong>vs close (40.40)</strong></td></tr>
    <tr><td>A (front-loaded)</td><td>40.06</td><td>+15.0 bps</td><td>&minus;28.6 bps</td><td>&minus;84.2 bps</td></tr>
    <tr><td>B (VWAP-matched)</td><td>40.185</td><td>+46.3 bps</td><td>+2.5 bps</td><td>&minus;53.2 bps</td></tr>
    <tr><td>C (closing auction)</td><td>40.45</td><td>+112.5 bps</td><td>+68.5 bps</td><td>+12.4 bps</td></tr>
  </tbody>
</table>

Check one cell: B against arrival is `(40.185 - 40.00) / 40.00 = 0.004625 = 46.25 bps`. B looks competent on VWAP (2.5 bps) and terrible against arrival (46.3 bps). B did nothing wrong by its own objective; the objective was wrong for a rising market.

**The self-referential trap, made concrete.** Suppose C's trading in the closing auction is itself large enough to set the closing price at 40.45, and C fills there.

- Measured cost against the close: `(40.45 - 40.45) / 40.45 = 0.0 bps`
- True cost against arrival: `(40.45 - 40.00) / 40.00 = 112.5 bps`

C reports a perfect execution while paying 112.5 basis points. There is no arithmetic error and no dishonesty in the report. The benchmark is simply a function of the trader's own trading, and it always will be.

**The same leak, in VWAP.** If you are a fraction `w` of session volume, the VWAP includes your prints:

```text
VWAP = (1 - w) * P_others + w * P_you

measured_slip = P_you - VWAP = (1 - w) * (P_you - P_others)
```

Your measured slippage is compressed by exactly the factor `(1 - w)`. With `w = 10%`, `P_you = 40.30`, and everyone else averaging `P_others = 40.15`:

1. `VWAP = 0.9 * 40.15 + 0.1 * 40.30 = 36.135 + 4.030 = 40.165`
2. Measured slippage: `40.30 - 40.165 = 0.135`, or `0.135 / 40.165 = 33.6 bps`
3. True underperformance against everyone else: `40.30 - 40.15 = 0.150`, or `0.150 / 40.15 = 37.4 bps`. Check: `(1 - 0.10) * 0.150 = 0.135`

At 10% participation the flattery is modest. At 30% it removes nearly a third of your measured cost, and it removes most of it precisely for the largest, most expensive orders.

> warning **Any benchmark computed from the trading window is partly self-scored** VWAP, closing price, and interval averages all include your own prints. The distortion grows with participation, which means the benchmark is least reliable exactly where accurate measurement matters most.

---

#### Choosing One

Three questions settle the choice in most cases.

**Whose performance is being measured?** The fund's total implementation cost requires the decision price. A broker's execution quality, given an order whose timing they did not choose, is better measured against arrival. Grading a broker on decision-price shortfall charges them for delay they did not cause; grading a fund on arrival price exonerates the delay it did.

**What is the alpha horizon?** A fast signal makes urgency correct, so an arrival or decision benchmark aligns incentive with economics; a slow signal makes patience correct, and VWAP-style benchmarks do less damage. Using a full-day VWAP for a signal that decays in twenty minutes rewards the trader for destroying the strategy. **How large is the order relative to volume?** Above a few per cent of session volume, average-price benchmarks are materially self-referential.

A common resolution is to use a **primary benchmark for accountability and secondary benchmarks for diagnosis**: grade on decision-price shortfall, but report VWAP tracking and markouts alongside to understand *why* the shortfall was what it was. The reporting set can be wide; the incentive set should be narrow and exogenous.

---

#### In Practice Across Asset Classes

**Equities.** All benchmarks above are available and independently verifiable from the consolidated tape. Closing-auction benchmarks carry particular weight because index funds must trade at the close, which concentrates enormous volume into a window where the benchmark is most influenceable.

**Futures.** Arrival and interval VWAP are clean on the front month. Settlement price is used for positions marked to settlement, and it inherits the same self-reference problem as an equity close. **Fixed income.** Benchmarks are evaluated or composite prices rather than traded prices, and grading a desk against a model-derived price gives it a stake in the model — a governance problem before it is a measurement one.

**FX.** Published fixing rates serve as the reference for a large body of flow. Because so many participants must trade at the fix, the fixing window has its own dynamics, and using the fix as a benchmark both creates and rewards concentration in that window.

**On-chain.** The natural exogenous benchmark is the pool mid price implied by reserves at the block before submission — fully observable and impossible for the trader to influence after the fact. A benchmark taken from the block *containing* the trade is contaminated by the trade itself and by any sandwich around it. Reverted transactions must be counted in the denominator; excluding them turns a failure into a non-event. See [Gas & Mempool](/microstructure/gas-mempool), [Slippage](/microstructure/slippage), and [Slippage & Frontrunning](/risk/slippage-frontrunning).

---

#### Assumptions and Failure Modes

- **The benchmark is independent of the trader.** False for every average-price and closing benchmark once participation is material. The reference timestamp is not always trustworthy either: arrival-price benchmarks depend on when the order was recorded as arriving, and that field is often controlled by the party being measured.
- **The benchmark covers the whole order.** Average-price benchmarks apply only to fills. Unfilled quantity is free under VWAP and expensive under decision-price shortfall — a difference that changes cancellation behaviour immediately.
- **One benchmark suffices.** A single number cannot separate delay, impact, timing, and opportunity. Reporting only one guarantees at least one of them is unmanaged.
- **Beating the benchmark means adding value.** In a trending market, a VWAP algorithm can beat VWAP while losing money against the decision, and a shortfall algorithm can lose against VWAP while making money. The benchmark measures conformity, not profit.
- **Traders do not respond to the measure.** They do, immediately and rationally. Assume any benchmark you adopt will be optimised, including through channels you did not anticipate — the standard failure mode of any target that becomes a measure.

---

#### Code

```python
import numpy as np


def benchmark_table(avg_fill_px, refs, side="buy"):
    """Cost in bps against every reference price, for one order."""
    sign = 1.0 if side == "buy" else -1.0
    return {k: sign * (avg_fill_px - px) / px * 1e4 for k, px in refs.items()}


benchmark_table(40.185, {"arrival": 40.00, "vwap": 40.175, "close": 40.40})
# {'arrival': 46.25, 'vwap': 2.49, 'close': -53.22}


def vwap_self_reference(price_you, price_others, w):
    """How much your own prints flatter your measured VWAP slippage.

    measured = (1 - w) * true, so the bias grows with participation w.
    """
    vwap = (1 - w) * price_others + w * price_you
    return {"vwap": vwap,
            "measured_slip_bps": (price_you - vwap) / vwap * 1e4,
            "true_slip_bps": (price_you - price_others) / price_others * 1e4}


vwap_self_reference(40.30, 40.15, 0.10)
# {'vwap': 40.165, 'measured_slip_bps': 33.6, 'true_slip_bps': 37.4}
```

---

#### See Also

* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Implementation Shortfall](/execution/implementation-shortfall)
* [TWAP & VWAP](/execution/twap-vwap)
* [Execution Overview](/execution/execution-overview)
* [Adverse Selection](/execution/adverse-selection)
* [Backtest vs Live](/risk/backtest-vs-live)

---

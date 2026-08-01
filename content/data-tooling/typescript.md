### Working with Market Data in TypeScript/JavaScript

> info **Metadata** Level: Intermediate | Prerequisites: Basic TypeScript, Market Data Sources | Tags: typescript, javascript, tooling, precision, streaming, services

TypeScript is not a numerical computing language and trying to make it one is a bad trade. There is no ndarray, no broadcasting, no linear algebra to speak of, and the statistical ecosystem is thin. Research that involves fitting, optimising, or estimating belongs in Python. Pretending otherwise means reimplementing well-tested numerics badly.

What TypeScript is unusually good at is everything around the research: ingesting live feeds over WebSocket connections, enforcing a data contract at a service boundary, exposing results as an API, and building interactive interfaces on top of them. Its type system is genuinely useful for market data, where the recurring bugs are confusions of kind — a quantity used as a notional, a base currency used as a quote, a millisecond timestamp compared against a second one. Those are exactly the errors a nominal type system catches at compile time and a Python type hint does not.

---

#### Where Each Language Fits

<table>
  <tbody>
    <tr>
      <td><strong>Task</strong></td>
      <td><strong>Better in</strong></td>
      <td><strong>Why</strong></td>
    </tr>
    <tr>
      <td>Statistical estimation, model fitting, backtesting</td>
      <td>Python</td>
      <td>Vectorised arrays and mature libraries; no equivalent exists</td>
    </tr>
    <tr>
      <td>Live feed ingestion and reconnection logic</td>
      <td>TypeScript</td>
      <td>The event loop suits many concurrent long-lived sockets</td>
    </tr>
    <tr>
      <td>Schema and contract enforcement between services</td>
      <td>TypeScript</td>
      <td>Types plus runtime validators generated from one definition</td>
    </tr>
    <tr>
      <td>Dashboards and interactive visualisation</td>
      <td>TypeScript</td>
      <td>It runs where the user is, without a Python process behind it</td>
    </tr>
    <tr>
      <td>Batch transformation of large historical datasets</td>
      <td>Python</td>
      <td>Columnar tooling and memory control; the loop is in compiled code</td>
    </tr>
    <tr>
      <td>Order management and venue connectivity</td>
      <td>Either</td>
      <td>Dominated by protocol and latency requirements, not by language</td>
    </tr>
    <tr>
      <td>On-chain reading and decoding</td>
      <td>TypeScript</td>
      <td>The client library ecosystem is JavaScript-first</td>
    </tr>
  </tbody>
</table>

The productive arrangement is a boundary, not a winner: TypeScript owns ingestion, service, and interface; Python owns research and modelling; and the two exchange columnar data rather than JSON.

---

#### The Numeric Problem

Every JavaScript `number` is an IEEE 754 double. There is no integer type, no decimal type, and no way to opt out. Two consequences matter for market data.

**Decimal arithmetic is inexact.** `0.1 + 0.2` evaluates to `0.30000000000000004`. In research this is noise; in anything that reconciles against a venue's own accounting, repeated inexact arithmetic accumulates until positions disagree. Prices and quantities that must reconcile should be held as scaled integers or a decimal type, not as floats.

**Integers are exact only to `2^53 - 1`.** That constant is `9007199254740991`, roughly `9.007e15`. Anything larger silently rounds.

<table>
  <tbody>
    <tr>
      <td><strong>Value</strong></td>
      <td><strong>As a JavaScript number</strong></td>
      <td><strong>Exact?</strong></td>
    </tr>
    <tr>
      <td>9007199254740991</td>
      <td>9007199254740991</td>
      <td>Yes — this is the maximum safe integer</td>
    </tr>
    <tr>
      <td>1000000000000000000</td>
      <td>1000000000000000000</td>
      <td>Yes, by luck: it is a power of two times a power of five</td>
    </tr>
    <tr>
      <td>1000000000000000001</td>
      <td>1000000000000000000</td>
      <td>No — near this magnitude, doubles are spaced 128 apart</td>
    </tr>
  </tbody>
</table>

The third row is not a curiosity. A token balance denominated in base units of `10^18` sits about a hundred times beyond the safe integer range, so `JSON.parse` on a balance field destroys the low digits without warning. Nanosecond epoch timestamps have the same problem: they passed the safe integer boundary decades ago in nanoseconds and will not fit. Use `BigInt` for both, and never let such a field become a `number` even briefly.

> warning **`JSON.parse` is the leak** By the time you inspect the value it has already been converted to a double, so a later cast to `BigInt` preserves the corruption. The integer must be kept as a string from the wire and converted directly.

Timestamps have a second, quieter issue: the built-in `Date` has millisecond resolution. Market data frequently arrives with microsecond or nanosecond precision, and rounding it to milliseconds collapses the ordering of events within the same millisecond — which is precisely the ordering you needed. Carry the raw precision as `BigInt` and use `Date` only for display.

---

#### Types Are Erased, So Validate at the Boundary

TypeScript types vanish at compile time. An interface describing a vendor payload is an assertion about data you do not control, and when the vendor adds a field or changes a type, the compiler is silent and the crash happens somewhere unrelated. Every external boundary — vendor feed, database read, another service, a chain node — needs a **runtime schema** that parses the payload and returns a typed value or an error.

Branded types are the second half. Nothing in the ordinary type system stops a millisecond timestamp being passed where a nanosecond one is expected, or a base quantity where a quote notional belongs, because both are `number`. Branding makes those distinct types with no runtime cost:

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

type EpochNanos = Brand<bigint, "EpochNanos">;
type PriceTicks = Brand<bigint, "PriceTicks">;   // integer ticks, not a float
type BaseQty    = Brand<bigint, "BaseQty">;      // in the instrument's base units

// Constructors are the only way in, so validation happens exactly once.
const epochNanos = (raw: string): EpochNanos => BigInt(raw) as EpochNanos;
```

---

#### Streaming and Backpressure

A live market data client is a stream problem, and the failure mode is unbounded buffering. If messages arrive faster than they are processed, an unbounded queue grows until the process dies — typically during the volatile session you most wanted to record.

The properties a client needs:

- **Bounded buffers with an explicit drop or block policy.** Decide in advance whether a slow consumer blocks ingestion or loses messages, and record which happened.
- **Sequence-number gap detection.** Most feeds number their messages. A gap means a lost message, which means the reconstructed book is wrong from that point until a fresh snapshot.
- **Snapshot plus delta recovery.** Reconnect logic must resynchronise from a snapshot, not resume mid-stream, and must discard deltas older than the snapshot.
- **Timestamp both ends.** Record the exchange timestamp and the local receive timestamp separately. Their difference is your latency measurement and your first clock-skew alarm. See [Latency Risk](/microstructure/latency-risk).
- **Write raw before parsing.** Persist the bytes as received, then decode. A decoder bug found later is only recoverable if the original messages survive. See [Building a Simple Data Pipeline](/data-tooling/pipeline).

CPU-bound work belongs on a worker thread. The event loop is single-threaded, so a synchronous computation on the main thread stops the socket from being drained, which turns a compute spike into dropped market data.

---

#### In Practice Across Asset Classes

**Equities.** Mostly a service and interface concern: symbology mapping, universe endpoints, and dashboards over research output. Branded identifier types are worth the ceremony, because the recurring bug is a ticker used where a stable instrument identifier belongs. See [Equities 101](/markets/equities-101).

**Futures.** Contract codes encode expiry, and parsing them by string manipulation is a classic source of silent error around year rollovers. Parse once at the boundary into a structured type carrying expiry, root, and exchange. See [Futures 101](/markets/futures-101).

**FX.** Quote convention is per-pair and inversion errors are the dominant bug. Branding base and quote currency separately makes an inverted rate a compile error rather than a position that is wrong by a factor of the rate squared. See [FX 101](/markets/fx-101).

**Fixed income.** Day-count conventions, coupon schedules, and settlement rules are branching logic over reference data rather than numerics, which is work TypeScript handles well — provided the money arithmetic uses a decimal type rather than doubles.

**On-chain.** This is where TypeScript is the primary language rather than the supporting one. Client libraries, ABI decoding, and typed contract bindings are JavaScript-first, and `BigInt` handles the 256-bit integers natively. The discipline is to scale by the token's `decimals` only at the display or analysis boundary, keeping base units everywhere else. See [Event Logs](/data-tooling/event-logs) and [RPC Nodes](/data-tooling/rpc-nodes).

---

#### Assumptions and Failure Modes

- **Assumes `number` is enough.** It is not for token base units, nanosecond timestamps, or any quantity that must reconcile exactly.
- **Assumes the interface describes reality.** It describes an expectation. Without runtime validation, a changed vendor field surfaces as an unrelated crash hours later.
- **Assumes `Date` is precise enough.** Millisecond resolution destroys intra-millisecond event ordering.
- **Assumes JSON is a reasonable interchange format.** For millions of rows it is slow to parse and lossy for large integers. Use a columnar binary format between services.
- **Assumes reconnection resumes cleanly.** Without sequence checking and snapshot resynchronisation, a reconnect produces a book that is quietly wrong.
- **Assumes the event loop keeps up.** One synchronous computation on the main thread drops market data during exactly the periods that matter.
- **Assumes rewriting research in TypeScript is progress.** Reimplementing a statistical routine without the reference implementation to check against usually adds a bug and removes a library.

---

#### Code

```typescript
// Parse a trade message without ever letting a large integer become a number.
// The raw payload is kept as strings; conversion is explicit and one-way.
interface RawTrade {
  readonly ts_nanos: string;   // string on the wire, deliberately
  readonly qty_base: string;
  readonly px_ticks: string;
  readonly seq: number;
}

interface Trade {
  readonly tsNanos: bigint;
  readonly qtyBase: bigint;
  readonly pxTicks: bigint;
  readonly seq: number;
  readonly receivedNanos: bigint;  // local clock, for latency and skew
}

const parseTrade = (raw: RawTrade, receivedNanos: bigint): Trade => ({
  tsNanos: BigInt(raw.ts_nanos),
  qtyBase: BigInt(raw.qty_base),
  pxTicks: BigInt(raw.px_ticks),
  seq: raw.seq,
  receivedNanos,
});

// Gap detection: a missing sequence number means the reconstructed state is
// unreliable from here until a fresh snapshot arrives.
class SequenceTracker {
  private expected: number | null = null;

  check(seq: number): "ok" | "gap" | "duplicate" {
    if (this.expected === null || seq === this.expected) {
      this.expected = seq + 1;
      return "ok";
    }
    if (seq < this.expected) return "duplicate";
    this.expected = seq + 1;
    return "gap";  // caller must resnapshot, not carry on
  }
}
```

The handoff to research is columnar, not JSON. Writing Parquet or Arrow from the ingestion service means the Python side reads typed columns with timezone metadata intact:

```python
import pandas as pd

trades = pd.read_parquet("raw/trades/trade_date=2024-06-11")
# Base-unit integers arrive as int64 or string; scale only for analysis,
# and keep the unscaled column so reconciliation stays exact.
trades["qty"] = trades["qty_base"].astype("float64") / 10 ** trades["decimals"]
trades["ts"] = pd.to_datetime(trades["ts_nanos"], unit="ns", utc=True)
latency_ms = (trades["received_nanos"] - trades["ts_nanos"]) / 1e6
```

---

#### See Also

* [Working with Market Data in Python](/data-tooling/python)
* [Building a Simple Data Pipeline](/data-tooling/pipeline)
* [Dashboards](/data-tooling/dashboards)
* [Latency Risk](/microstructure/latency-risk)
* [Simulation in TypeScript](/simulation/typescript)
* [RPC Nodes](/data-tooling/rpc-nodes)

---

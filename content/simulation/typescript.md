### Backtesting in TypeScript/JavaScript

> info **Metadata** Level: Intermediate | Prerequisites: TypeScript basics, Event-Driven Backtesting | Tags: typescript, javascript, tooling, backtesting, numerics

Python owns quantitative research, and nothing here disputes that. But there is a specific and defensible case for backtesting in TypeScript: when the execution system is already written in it. A backtest is only as trustworthy as its correspondence to the live path, and the most reliable way to guarantee correspondence is for the research engine and the production engine to be the *same code*, driven by different event sources. If your order router, position tracker and risk checks are TypeScript, reimplementing them in Python for research introduces a second implementation, and every divergence between the two becomes a source of results you cannot reproduce live.

The type system earns its place here too. A backtest is a state machine over a heterogeneous event stream, and a discriminated union with exhaustiveness checking turns "we forgot to handle funding payments" from a silent omission into a compile error. What you give up is the numerical ecosystem, and — more sharply — a numeric type that is unsuitable for money without care.

---

#### Formal Definition

The engine is the same event loop described in [Event-Driven Backtesting Basics](/simulation/event-driven), expressed as a total function over a closed event union:

```text
type Event    = MarketData | Fill | Funding | CorporateAction | Timer
step(state, event) -> (newState, intents)
run(state0, events) = fold(step, state0, sortByKnowledgeTime(events))
```

where:

- `step` is pure: the same state and event always produce the same output
- `intents` are order requests, never fills — fills return later as `Fill` events
- the union is closed, so a `switch` over `event.kind` can be checked for exhaustiveness at compile time

Purity is what makes the loop replayable. If `step` never reads the wall clock, never mutates shared state and never performs input or output, then a recorded event log fully determines the result — and the same log can be replayed against a new version of the strategy to see exactly what changed.

> info **One engine, two drivers** In research the driver reads a historical file; in production it reads a socket. Because `step` cannot tell the difference, any behavioural gap between backtest and live comes from the world rather than from two implementations of your idea.

---

#### Worked Example

The numeric trap, in the form it actually appears. JavaScript numbers are IEEE-754 doubles: binary fractions that cannot represent decimal tenths exactly.

<table>
  <tbody>
    <tr><td><strong>Operation</strong></td><td><strong>Result</strong></td><td><strong>Consequence</strong></td></tr>
    <tr><td>0.1 + 0.2</td><td>0.30000000000000004</td><td>Equality against 0.3 fails</td></tr>
    <tr><td>Buy 0.1 three times</td><td>position = 0.30000000000000004</td><td>Position is not the sum you intended</td></tr>
    <tr><td>Then sell 0.3</td><td>position = 5.55e-17</td><td>A "flat" book that is not flat</td></tr>
    <tr><td>Check <code>position !== 0</code></td><td>true</td><td>Dust position persists for the rest of the run</td></tr>
  </tbody>
</table>

Step by step:

1. Three buys of 0.1 accumulate to `0.30000000000000004` rather than `0.3`
2. Selling `0.3` leaves `5.551115123125783e-17` rather than zero
3. A flat check written as a strict comparison against zero returns `false`, so the engine believes a position is open
4. Every subsequent bar marks that dust, computes a return on it, and — worse — any rule conditioned on "am I flat" now takes the wrong branch for the remainder of the simulation

The fix is to hold quantities in **integer minor units**. Tracking the same trades in units of 1e-8 gives `10000000 + 10000000 + 10000000 - 30000000 = 0` exactly, and the flat check is unambiguous.

> warning **On-chain amounts exceed the safe integer range** The largest exactly representable integer in a JavaScript number is `2^53 - 1`, just over `9.0 * 10^15`. One unit of an 18-decimal token is `1 * 10^18`, which is larger. Any arithmetic on raw token amounts must use `BigInt` or a fixed-point library; a `Number` conversion silently rounds.

---

#### Where TypeScript Helps

**Exhaustive event handling.** A discriminated union plus a `never`-typed default branch means adding a new event type produces a compile error at every site that must handle it. In a Python backtester the same omission is a runtime path nobody exercises.

**Units in the type system.** Branded types distinguish `Price`, `Quantity`, `Notional` and `Bps` even though all are numbers underneath. Multiplying a price by a price stops compiling, which removes a whole family of silent errors.

**Determinism guarantees.** `Array.prototype.sort` is required to be stable, so ties in an event queue resolve predictably. Combined with a seeded generator instead of `Math.random`, a run is exactly reproducible.

**Shared contracts.** The same interfaces describe the backtest fill model and the live order router. If the live router gains a rejection reason or a new order type, the simulator will not compile until it models one. This closes the most common research-to-production gap, in which the backtest silently assumes an order behaviour the venue does not offer. See [Order Types](/execution/order-types) and [Backtest vs Live](/risk/backtest-vs-live).

---

#### Where It Hurts

**Numerical libraries.** There is no equivalent of the NumPy and pandas ecosystem. Rolling statistics, regressions, matrix decompositions and distribution functions are either hand-written or pulled from smaller, less battle-tested packages. Anything statistical is more work and carries more risk of a subtly wrong implementation.

**Analysis workflow.** The notebook loop — run, plot, adjust, rerun — has no comfortable equivalent. A common compromise is to run the engine in TypeScript, emit results as a columnar file, and analyse them in Python. See [Notebooks](/data-tooling/notebooks).

**Single-threaded by default.** Parameter sweeps need worker threads or separate processes, and shared-memory tricks are awkward. Since a sweep is embarrassingly parallel across cells, process-level parallelism is usually sufficient.

**Memory.** Object-per-bar representations are heavy. Large histories need typed arrays with a struct-of-arrays layout rather than an array of objects.

---

#### In Practice Across Asset Classes

**Daily equities.** Universe sizes make a struct-of-arrays layout — one `Float64Array` per field, indexed by instrument and date — noticeably faster and lighter than an array of bar objects.

**Intraday futures.** Message volumes push against single-threaded throughput. This is where the "engine in TypeScript, analysis in Python" split usually settles, with the hot replay loop kept allocation-free.

**FX.** Multiple venue streams with different conventions map well onto a tagged union of venue-specific event types, letting the compiler enforce that each is normalised before it reaches the strategy.

**On-chain markets.** The strongest case for TypeScript, because the client libraries, ABIs and node interfaces are already there. Token amounts arrive as `BigInt` from the chain and should stay that way through the whole calculation; conversion to `Number` belongs only at the reporting boundary. See [RPC Nodes](/data-tooling/rpc-nodes) and [On-Chain Data in Backtests](/simulation/onchain-data).

---

#### Assumptions and Failure Modes

- **Number is adequate for money.** It is not. Use integer minor units for cash and quantities, and `BigInt` for anything with more than about fifteen significant digits.
- **Equality comparisons on floats work.** They do not. Compare against a tolerance, or compare integers.
- **`Math.random` is fine for a simulation.** It is unseedable, so results cannot be reproduced. Use an explicit seeded generator.
- **Sort order is deterministic.** Stable sorting is guaranteed, but only relative to the comparator. Ties on the comparison key resolve by input order, so the input order must itself be deterministic.
- **`Date` handles time zones correctly.** It handles them, but with enough surprises around daylight saving and parsing that market session boundaries deserve explicit, tested handling.
- **Async is harmless.** Introducing `await` into the event loop reorders execution and destroys replayability. The loop must be synchronous; only the data source may be asynchronous.
- **Types prove correctness.** They prove consistency. A fully typed backtester with a naive fill model is a well-typed source of fake alpha — see [Orderbook Simulation](/simulation/orderbook).

---

#### Code

A typed event loop where the compiler enforces exhaustive handling, and cash is tracked in integer minor units.

```typescript
type Minor = number & { readonly __brand: "minor units" };

type Event =
  | { kind: "bar"; time: number; symbol: string; close: Minor }
  | { kind: "fill"; time: number; symbol: string; qty: number; price: Minor }
  | { kind: "funding"; time: number; symbol: string; amount: Minor };

interface Intent {
  symbol: string;
  qty: number;
}

interface State {
  cash: Minor;
  positions: Map<string, number>;
  marks: Map<string, Minor>;
}

// Pure: same state and event always give the same result, which is what
// makes a recorded event log a complete description of a run.
const step = (state: State, event: Event): [State, Intent[]] => {
  switch (event.kind) {
    case "bar":
      state.marks.set(event.symbol, event.close);
      return [state, decide(state, event)];

    case "fill": {
      // Integer arithmetic throughout: no dust, no failed flat checks.
      const notional = (event.qty * event.price) as Minor;
      state.cash = (state.cash - notional) as Minor;
      const held = state.positions.get(event.symbol) ?? 0;
      state.positions.set(event.symbol, held + event.qty);
      return [state, []];
    }

    case "funding":
      state.cash = (state.cash - event.amount) as Minor;
      return [state, []];

    default: {
      // Adding a new event variant breaks this line at compile time,
      // which is the entire point of the union.
      const unhandled: never = event;
      throw new Error(`unhandled event: ${JSON.stringify(unhandled)}`);
    }
  }
};

const equity = (state: State): Minor => {
  let total = state.cash as number;
  for (const [symbol, qty] of state.positions) {
    total += qty * ((state.marks.get(symbol) ?? 0) as number);
  }
  return total as Minor;
};

declare const decide: (state: State, bar: Extract<Event, { kind: "bar" }>) => Intent[];
```

---

#### See Also

* [Backtesting in Python](/simulation/python)
* [Event-Driven Backtesting Basics](/simulation/event-driven)
* [Building a Simple Backtester](/simulation/building-backtester)
* [TypeScript for Quants](/data-tooling/typescript)
* [Reproducible Research](/data-tooling/reproducible)
* [Event-Driven Architecture](/building-simulations/event-driven-architecture)

---

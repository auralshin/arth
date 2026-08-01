### Event-Driven Backtesting Basics

> info **Metadata** Level: Intermediate | Prerequisites: Why Backtest, Basic programming | Tags: backtesting, architecture, event-loop, lookahead-bias, simulation

A vectorised backtest computes signals for the whole history at once, shifts them by one bar, multiplies by returns and sums. It is fast, it is three lines of pandas, and it is trivially easy to make it cheat. An **event-driven backtest** instead replays history one event at a time through a simulated clock, and lets the strategy see only what has already arrived. The difference is not performance. It is that the second design makes lookahead a *structural impossibility* rather than a discipline you have to remember.

This matters because lookahead is not usually a dramatic error. Nobody writes `signal = tomorrow_return`. Lookahead arrives as a rolling window that includes the current bar, a resampled series stamped at the interval start, a fundamentals field that was restated three months after the date it carries, or a stop-loss checked against a bar's low when the bar had not finished. Each is a small leak into the counterfactual, and each one moves the result in your favour. Architecture is how you stop auditing for them individually.

---

#### Formal Definition

Let `F_t` be the **information set** available at time `t` — everything that had actually been published, printed or observed by then. A backtest is valid only if, for every `t`:

```text
w_t  is measurable with respect to  F_t
```

That is: the position taken at `t` is a function of `F_t` and nothing else. An event-driven engine enforces this by making `F_t` the only thing the strategy can physically reach.

The engine is a loop over a time-ordered queue:

```text
while queue is not empty:
    event = queue.pop_earliest()
    clock  = event.timestamp
    state.apply(event)                 # world updates first
    actions = strategy.on_event(event, state.view_as_of(clock))
    queue.push(execution.simulate(actions, latency))
```

where:

- `event` is a market data tick, bar close, fill confirmation, funding payment, corporate action or timer
- `clock` advances monotonically and is never read from the wall clock
- `state.view_as_of(clock)` is a read-only projection that physically cannot return data stamped later than `clock`
- `execution.simulate` returns *future* events (fills, rejects) placed back on the queue at `clock + latency`

The last line is where honesty lives. An order submitted at `clock` does not become a fill at `clock`. It becomes a fill event scheduled at `clock + latency`, priced by the fill model against data the strategy has not yet seen.

---

#### Vectorised versus Event-Driven

<table>
  <tbody>
    <tr><td><strong>Dimension</strong></td><td><strong>Vectorised</strong></td><td><strong>Event-driven</strong></td></tr>
    <tr><td>Speed</td><td>Very fast; whole-array operations</td><td>Slower; per-event Python-level work</td></tr>
    <tr><td>Lookahead safety</td><td>By convention — one wrong shift and it leaks</td><td>By construction — the data is not reachable</td></tr>
    <tr><td>Path-dependent logic</td><td>Awkward: stops, trailing exits, partial fills</td><td>Natural: the loop already has state</td></tr>
    <tr><td>Latency and queueing</td><td>Not representable</td><td>First-class, as scheduled events</td></tr>
    <tr><td>Live-trading parity</td><td>None; a rewrite is needed</td><td>High; the same handler can run live</td></tr>
    <tr><td>Best used for</td><td>Screening ideas, sweeping parameters</td><td>Validating an idea that already survived screening</td></tr>
  </tbody>
</table>

Most research groups use both: a vectorised pass to reject the hopeless cheaply, then an event-driven pass on the small number of survivors. The vectorised number should always be treated as an upper bound.

---

#### Worked Example

A daily strategy decides at the 16:00 close and trades on the next session's open. Four candidate timing conventions, applied to the same two prices, produce four different answers. Closing price on day 1 is 100.00; opening price on day 2 is 100.80; closing price on day 2 is 101.50.

<table>
  <tbody>
    <tr><td><strong>Convention</strong></td><td><strong>Assumed entry</strong></td><td><strong>Day-2 return booked</strong></td><td><strong>Verdict</strong></td></tr>
    <tr><td>Signal and fill both at day-1 close</td><td>100.00</td><td>1.50%</td><td>Defensible only if the close is genuinely tradeable</td></tr>
    <tr><td>Signal at day-1 close, fill at day-2 open</td><td>100.80</td><td>0.69%</td><td>The realistic convention for a daily system</td></tr>
    <tr><td>Signal at day-2 close, fill at day-2 open</td><td>100.80</td><td>0.69%</td><td>Invalid: uses a price from after the decision</td></tr>
    <tr><td>Signal at day-1 close, fill at day-2 close</td><td>101.50</td><td>0.00%; exposure starts on day 3</td><td>Valid but conservative; forfeits a full session</td></tr>
  </tbody>
</table>

Arithmetic for row two: entry at 100.80, mark at 101.50, so `101.50 / 100.80 - 1 = 0.694%`. Row one books `101.50 / 100.00 - 1 = 1.50%`. The 0.81-percentage-point gap between them is the overnight move — and a strategy that trades 250 times a year while spuriously capturing it would report a figure that is a multiple of its true return.

Row three is not a convention at all; it is the leak. It looks innocuous in a spreadsheet and produces the same number as the legitimate row two, which is exactly what makes it dangerous: the error is invisible in the output and visible only in the timing of the inputs. An event-driven engine cannot express row three, because at the moment the day-1 close event is handled, no day-2 event has been popped from the queue and no day-2 price exists in any reachable object.

> warning **The bar is not an instant** A daily bar labelled `2024-03-05` summarises a whole session. Its high, low and close are all known only at the end of it. Any rule that uses a bar's low to trigger an exit and its close to mark the position has used the future to time the past.

---

#### Avoiding Lookahead by Construction

Four design rules do most of the work.

**One clock, and the engine owns it.** Strategy code never calls the wall clock, never indexes a full DataFrame, and never holds a reference to the raw dataset. It receives events and a bounded view.

**Data access is a function of the clock.** Expose `get(series, as_of)` rather than a table. A lookup that would return a row stamped later raises, rather than quietly improving the result.

**Decisions and executions are separate events.** The strategy emits an *intent*; the execution model turns intents into fills at a later timestamp under its own rules. This single separation removes the whole class of instant-fill-at-signal-price errors, and it is where slippage, spread, latency and rejection live. See [Order Types](/execution/order-types).

**Two timestamps per record, always.** Every datum carries `event_time` (when the thing happened) and `knowledge_time` (when you could have known it), and replay is ordered by the second. For market data they usually coincide; for fundamentals, index reconstitutions, macro releases and anything revised, they do not. See [Data Preparation for Backtests](/simulation/data-prep).

---

#### In Practice Across Asset Classes

**Daily equities.** Events are bar closes plus a separate stream for corporate actions and index changes. The hard part is not the loop but sequencing an ex-dividend date, a split and a rebalance that all land on the same morning.

**Intraday futures.** Events arrive as trades and book updates at microsecond resolution. Here latency modelling stops being cosmetic: the delay between your decision and the exchange's acknowledgement is comparable to the horizon of the signal. See [Latency Risk](/microstructure/latency-risk).

**FX.** With no central tape, the event stream is venue-specific. A conscientious engine replays each venue separately and lets the strategy aggregate, rather than pre-blending into a single synthetic mid it could never have traded on.

**On-chain markets.** The event stream is naturally discrete: blocks, then transactions within a block, then logs within a transaction. Replay fidelity can be very high, but ordering within a block is set by the builder, not by your timestamp, so intra-block sequencing is an assumption you must state. See [On-Chain Data in Backtests](/simulation/onchain-data) and [How Blocks Form](/transaction-ordering-mev/how-blocks-form).

---

#### Assumptions and Failure Modes

- **Events are correctly ordered.** Assumes your merge across sources is right. Broken by clock skew between feeds, by exchange timestamps versus capture timestamps, and by ties. Define a deterministic tie-break and record it.
- **Latency is a constant.** Assumes a fixed delay between intent and fill. Real latency has a fat right tail and correlates with market activity — it is worst precisely when your order matters most.
- **Handlers are pure.** Assumes `on_event` does not mutate shared state that later events read in a different order. Broken by caching, by shared mutable defaults, and by any use of the wall clock. Non-determinism here makes results unreproducible.
- **The queue contains everything.** Assumes you have modelled all event types. Missing funding payments, borrow recalls, margin calls, auctions and halts all silently make the world friendlier than it was.
- **Fills are independent of you.** Assumes your presence did not change the book. False for passive orders and for anything large. See [Orderbook Simulation](/simulation/orderbook).
- **No survivorship in the stream.** Assumes delisted, halted and expired instruments still generate events. If they simply vanish from the feed, losses vanish with them.

---

#### Code

A minimal loop in which lookahead is structurally unavailable: the strategy is handed a bounded view and can only emit intents.

```python
import heapq
from dataclasses import dataclass, field


@dataclass(order=True)
class Event:
    timestamp: float
    sequence: int                      # deterministic tie-break; heap order alone is not
    kind: str = field(compare=False)
    payload: dict = field(compare=False, default_factory=dict)


class PointInTimeView:
    """The only handle a strategy gets on the data.

    Rows stamped after the clock are unreachable, so a leak becomes a
    missing value rather than a better Sharpe.
    """

    def __init__(self, history):          # history: sorted [(timestamp, record)]
        self._history, self._clock = history, float("-inf")

    def advance_to(self, timestamp):
        self._clock = timestamp

    def last(self, n=1):
        return [rec for ts, rec in self._history if ts <= self._clock][-n:]


def run(events, strategy, execution, view, latency=1.0):
    queue, sequence, fills = list(events), len(events), []
    heapq.heapify(queue)

    while queue:
        event = heapq.heappop(queue)
        view.advance_to(event.timestamp)     # world moves before the strategy thinks

        if event.kind == "fill":
            strategy.on_fill(event.payload)
            fills.append(event.payload)
            continue

        for intent in strategy.on_market(event, view):
            # An intent is not a fill. It becomes one later, priced against
            # data the strategy has not yet been allowed to see.
            sequence += 1
            arrival = event.timestamp + latency
            heapq.heappush(queue, Event(
                timestamp=arrival,
                sequence=sequence,
                kind="fill",
                payload=execution.price_intent(intent, at=arrival),
            ))

    return fills
```

> info **Reuse the handler live** If `on_market` reads only its arguments, the identical function can be driven by a live feed. Any divergence between research and production then comes from the world, not from two implementations of your idea.

---

#### See Also

* [Building a Simple Backtester](/simulation/building-backtester)
* [Data Preparation for Backtests](/simulation/data-prep)
* [Orderbook Simulation](/simulation/orderbook)
* [Event-Driven Architecture](/building-simulations/event-driven-architecture)
* [Latency Risk](/microstructure/latency-risk)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)

---

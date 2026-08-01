### Orderbook Simulation

> info **Metadata** Level: Advanced | Prerequisites: Order Types, Microstructure basics | Tags: orderbook, queue-position, fill-model, adverse-selection, simulation

Naive fill assumptions are the single most productive source of fake alpha in backtesting. The offending line is usually innocuous: *if the price touched my limit, I was filled*. It is wrong in a specific and systematically favourable direction. A limit order at the bid does not execute because the price reached the bid; it executes because enough volume traded there to clear everyone ahead of you in the queue. If the price merely touched and bounced, you were not filled — and those are precisely the cases in which the subsequent move was favourable.

The consequence is that a naive simulator awards you the good fills and spares you the bad ones. It fills you at the top of a bounce and books the recovery; it also fills you when a large seller sweeps through, but marks that fill against a price that has already moved. Correcting this requires simulating the thing that actually determines execution: **queue position**. This page covers how a limit order book is simulated, how fill probability is modelled at several fidelity levels, and why the errors here dominate every other modelling choice for a passive strategy.

---

#### Formal Definition

A limit order book is a pair of sorted price levels with a queue at each. Under **price-time priority**, the standard rule at most equity, futures and crypto venues, an incoming aggressive order consumes resting orders best-price-first and, within a price, oldest-first.

Your order's position in that queue evolves as:

```text
Q_(t+1)  =  max(0, Q_t - traded_t - cancels_ahead_t)
```

where:

- `Q_t` is the volume resting ahead of you at your price level at time `t`
- `traded_t` is the volume executed at that level during the interval
- `cancels_ahead_t` is the volume cancelled by orders ahead of you — orders behind you cancelling does not help

You are filled for size `q` once cumulative consumption exceeds `Q_0 + q`. The fill probability over the order's lifetime is therefore:

```text
P(fill)  =  P( V  reaches or exceeds  Q_0 + q  before the level is abandoned )
```

where `V` is the cumulative volume traded at that price level while your order rests, and "abandoned" means the book moves away and never returns.

Two things make this hard. First, `cancels_ahead_t` is **not observable** from standard Level 2 data: you see total depth fall but cannot tell whether the reduction came from ahead of you or behind. Second, `V` and the price path are dependent — the same order flow that fills you is the flow that moves the price against you.

> warning **Getting filled is information** A passive buy order fills when sellers are aggressive. Conditional on being filled, the short-horizon price drift is adverse on average. This is adverse selection, and it is invisible to any fill model that treats execution as a coin flip on price touching. See [Adverse Selection](/execution/adverse-selection).

---

#### Worked Example

Two calculations, both illustrative arithmetic rather than measurements.

**Queue arithmetic.** You post 100 lots at the bid. The displayed depth at that level is 1,200 lots, all of which arrived before you.

<table>
  <tbody>
    <tr><td><strong>Event over the next minute</strong></td><td><strong>Volume</strong></td><td><strong>Queue ahead after</strong></td></tr>
    <tr><td>Starting queue ahead of your order</td><td>1,200</td><td>1,200</td></tr>
    <tr><td>Aggressive sells executed at this level</td><td>800</td><td>400</td></tr>
    <tr><td>Cancellations by orders ahead of you</td><td>250</td><td>150</td></tr>
    <tr><td>Book ticks up; level abandoned</td><td>—</td><td>Never filled</td></tr>
  </tbody>
</table>

`1,200 - 800 - 250 = 150` lots still ahead. You were not filled, and the price then rose. A naive simulator would have filled you at the bid and booked the entire subsequent uptick as profit. Note also the sensitivity: had the starting queue been 1,000 rather than 1,200, you would have been filled and the two simulations would agree. The result depends on a quantity — your position within the displayed depth — that most datasets do not record.

**Adverse selection arithmetic.** A passive strategy posts 1,000 shares at a fixed limit, on an instrument with a 0.01 tick.

1. The limit price is touched **200 times** in the sample. A naive model fills all 200
2. Under a queue model with realistic priority, you reach the front in **40** of them
3. The naive model assumes a favourable mark-out of `+0.5` ticks per fill: `200 * 1,000 * 0.005 = +1,000`
4. The realistic model, conditioning on the flow that actually cleared the queue, assumes a mark-out of `-1.5` ticks: `40 * 1,000 * -0.015 = -600`

The sign has flipped, and neither the signal nor the price data changed. Two assumptions did all the work: how often you were filled, and what happened next given that you were.

---

#### Three Fidelity Levels

<table>
  <tbody>
    <tr><td><strong>Level</strong></td><td><strong>Data required</strong></td><td><strong>Fill rule</strong></td><td><strong>Honest use</strong></td></tr>
    <tr><td>Bar-level</td><td>OHLCV bars</td><td>Fill at open, close, or VWAP with a fixed slippage charge</td><td>Aggressive orders only, at small size, for screening</td></tr>
    <tr><td>Top-of-book with queue proxy</td><td>Level 1 quotes and trades</td><td>Fill only after observed volume at the level exceeds an assumed queue</td><td>Passive strategies at daily-to-minute horizons</td></tr>
    <tr><td>Full book replay</td><td>Level 3 or message-by-message Level 2</td><td>Reconstruct the book, track exact queue position, model latency</td><td>Market making and short-horizon passive strategies</td></tr>
  </tbody>
</table>

The discipline is to match fidelity to the claim. A bar-level simulator can support "this daily signal has directional information". It cannot support "this strategy earns the spread", because earning the spread is entirely a statement about queue position, and a bar-level simulator has no concept of one.

---

#### What Even a Full Replay Cannot Do

Replaying a historical book with your order inserted is the highest-fidelity approach available, and it still contains an unavoidable fiction: **the rest of the book does not react to you**.

- Your passive order sits ahead of orders that arrived after it, delaying *their* fills. In reality those participants would have priced or sized differently.
- Your aggressive order consumes depth that, in the recorded history, was consumed by someone else — or was never consumed at all. Everything after that point is a different world.
- Other participants' quoting logic responds to book imbalance. Adding your size changes the imbalance and therefore changes their behaviour.

Practically, this means fidelity has a size limit. For orders that are small relative to the level, replay is a reasonable approximation. As your size approaches the depth at a level, the counterfactual degrades, and an impact model becomes mandatory. See [Market Impact](/execution/market-impact) and [Almgren-Chriss](/execution/almgren-chriss).

The alternative, when the interaction matters, is to abandon replay and simulate the other participants too — see [Agent-Based Simulation](/simulation/agent-based).

---

#### In Practice Across Asset Classes

**Daily equities.** Most backtests trade at the close or on a scheduled schedule such as VWAP, so the relevant model is a benchmark-relative slippage assumption rather than a queue model. The closing auction is a separate mechanism with its own rules, and simulating it as a continuous book is simply wrong. See [TWAP and VWAP](/execution/twap-vwap).

**Intraday futures.** Central limit order books with strict price-time priority and excellent message-level data — the best case for high-fidelity replay. Latency modelling becomes essential, since the queue moves in the time it takes your message to arrive. See [Latency Risk](/microstructure/latency-risk).

**FX.** No central book. Liquidity is fragmented across venues with different priority rules, and some streams are quoted rather than firm, with last look. A simulation that assumes a firm, single, price-time-priority book overstates fill certainty substantially.

**Fixed income and credit.** Much trading is request-for-quote rather than order book. Simulating it means modelling dealer response, not queue position — a different problem, closer to an auction than a book.

**On-chain markets.** Two mechanisms coexist. Automated market makers price deterministically from pool state, so given the state your fill is exactly computable — the uncertainty moves entirely to transaction ordering and whether your transaction lands in the block you expected. On-chain limit order books restore queue mechanics but add block-level discreteness. See [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms) and [On-Chain Data in Backtests](/simulation/onchain-data).

---

#### Assumptions and Failure Modes

- **Touch implies fill.** Assumes reaching a price executes an order there. The most common and most expensive error in passive backtesting; it awards fills exactly when they would not have happened.
- **Queue position is known.** Assumes you can determine your place in the queue. Level 2 data shows aggregate depth, not composition, so any queue model rests on an assumption about cancellation behaviour ahead of you.
- **Fills are unconditionally informative.** Assumes the post-fill price path is the unconditional one. It is not: conditioning on the fill selects the adverse cases. Measure mark-outs conditional on fill, not on submission.
- **You do not affect the book.** Assumes replay validity. Degrades continuously with size and fails entirely when your order is a meaningful fraction of the level.
- **Latency is zero or constant.** Assumes your message arrives instantly and reliably. Real latency is variable, correlated with activity, and the source of most cancel-too-late losses.
- **Orders always rest.** Assumes no rejection, no self-trade prevention, no order-to-trade throttling, no exchange halt. Each of these removes fills that the simulator granted.
- **Tick and lot sizes are ignorable.** Assumes continuous prices and sizes. A strategy whose edge is smaller than one tick does not exist at all once discreteness is imposed.

> warning **Educational content, not advice** This page describes simulation methodology. It does not describe a tradeable strategy, and nothing here should be read as a recommendation to post or take liquidity anywhere.

---

#### Code

A queue-position tracker: the minimum honest fill model for a passive order.

```python
class QueuedLimitOrder:
    """Tracks a resting limit order through queue depletion.

    `cancel_share_ahead` encodes the unobservable part: what fraction of
    observed depth reduction came from orders ahead of you rather than
    behind. Setting it to 1.0 is optimistic and setting it to 0.0 is
    pessimistic; report which you used, and sweep it.
    """

    def __init__(self, price, size, queue_ahead, cancel_share_ahead=0.5):
        self.price = price
        self.size = size
        self.queue_ahead = queue_ahead
        self.cancel_share_ahead = cancel_share_ahead
        self.filled = 0

    def on_trade(self, trade_price, trade_size):
        """Aggressive volume at our level consumes the queue, then us."""
        if trade_price != self.price or self.is_complete:
            return 0
        consumed_from_queue = min(self.queue_ahead, trade_size)
        self.queue_ahead -= consumed_from_queue
        newly_filled = min(self.size - self.filled, trade_size - consumed_from_queue)
        self.filled += newly_filled
        return newly_filled

    def on_depth_reduction(self, reduction):
        """Depth fell without a trade, so orders cancelled. We cannot see whose."""
        self.queue_ahead = max(0, self.queue_ahead - reduction * self.cancel_share_ahead)

    def on_level_abandoned(self):
        """Book moved away. Whatever is unfilled stays unfilled."""
        return self.filled

    @property
    def is_complete(self):
        return self.filled >= self.size


# Report mark-outs conditional on fill. Unconditional mark-outs
# hide adverse selection completely.
def markout(fill_price, mid_after, side):
    return (mid_after - fill_price) * (1 if side == "buy" else -1)
```

---

#### See Also

* [Execution Overview](/execution/execution-overview)
* [Adverse Selection](/execution/adverse-selection)
* [Market Impact](/execution/market-impact)
* [Implementation Shortfall](/execution/implementation-shortfall)
* [Event-Driven Backtesting Basics](/simulation/event-driven)
* [Slippage](/microstructure/slippage)

---

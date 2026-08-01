### Latency Risk

> info **Metadata** Level: Advanced | Prerequisites: Orderbooks vs AMMs, Slippage, Fees & Routing | Tags: latency, microstructure, adverse-selection, queue-position, risk, execution

Latency is the delay between an event happening and your system acting on it. It becomes a risk, rather than an engineering annoyance, because the market does not wait: prices move during the delay, and the trades you get during that window are systematically the ones you would have declined had you known. Latency does not merely reduce your opportunity set. It selects against you.

What matters is almost never absolute speed. A strategy holding positions for weeks is indifferent to whether its orders take one millisecond or fifty. What matters is **relative** latency — your delay compared with that of whoever is on the other side of your quote, or competing for the same fill. A participant who is consistently second in a two-way race captures none of the opportunity and all of the adverse selection, which is a worse outcome than not competing at all.

---

#### Formal Definition

Total reaction time, conventionally called tick-to-trade, decomposes as:

```text
tick_to_trade = market_data_latency
              + decision_time
              + order_entry_latency
              + venue_matching_time
```

Relative latency is the quantity that determines outcomes:

```text
delta = your_tick_to_trade - fastest_participant_tick_to_trade
```

For a liquidity provider, `delta` translates directly into money through the fraction of fills that occur while the quote is stale. Let `s` be the half-spread earned on every fill, `phi` the fraction of fills that arrive inside the staleness window, and `d` the average adverse price move on those fills:

```text
net_bps = s - phi * d
```

where:

- `s` is the half-spread captured, in basis points, on every fill
- `phi` is the share of fills that are picked off, which rises with `delta`
- `d` is the average move against the quote on a picked-off fill

The break-even condition is `phi * d = s`. Since `s` is set by competition and `d` by the size of information events, `phi` is the only term a maker controls — and it is controlled almost entirely by infrastructure.

For a liquidity taker racing others to an opportunity worth `V`, appearing `R` times per period against `N` equally fast competitors:

```text
E[value] = R * V / N              if the race is fair
E[value] = R * V                  if you are reliably first
max_rational_spend = R * V * (1 - 1/N)
```

The last line is the honest budget for a latency programme, and it is finite. Speed is a cost centre justified by a specific, measurable revenue line.

---

#### Worked Example: The Cost of Being Slightly Slow

A market-making operation fills 20,000 times a day at an average size of 10,000 notional, so 200,000,000 of notional trades against its quotes daily. It captures a 1.5 bps half-spread on every fill. Measurement of the mid one second after each fill shows that 12% of fills are followed by an adverse move averaging 6 bps.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Daily filled notional</td><td>200,000,000</td></tr>
    <tr><td>Half-spread captured (s)</td><td>1.5 bps</td></tr>
    <tr><td>Picked-off share (phi)</td><td>12%</td></tr>
    <tr><td>Adverse move on picked-off fills (d)</td><td>6 bps</td></tr>
  </tbody>
</table>

1. **Gross spread income**: `200,000,000 * 0.00015 = 30,000`
2. **Adverse selection cost**: `0.12 * 200,000,000 * 0.0006 = 14,400`
3. **Net**: `30,000 - 14,400 = 15,600` per day
4. **In basis points**: `1.5 - 0.12 * 6 = 0.78 bps`

Now suppose a competitor upgrades its infrastructure, or a venue changes its matching engine, and the picked-off share rises from 12% to 20% with everything else unchanged:

5. **New adverse selection cost**: `0.20 * 200,000,000 * 0.0006 = 24,000`
6. **New net**: `30,000 - 24,000 = 6,000`, or `1.5 - 1.2 = 0.3 bps`
7. **Change**: `(15,600 - 6,000) / 15,600 = 61.5%` of profit gone

Volume did not fall. Spreads did not change. Nothing appeared in the fill data except a shift in what happened after the fills. This is why latency degradation is so often diagnosed late: it looks like a run of bad luck for weeks before it looks like a systematic problem.

> warning **Post-fill mark-out is the diagnostic** Measure the mid price at fixed intervals after every fill — one second, ten seconds, one minute — and average by side. A persistently negative mark-out means you are being selected against, and no amount of spread widening fixes a latency problem that is structural.

---

#### Worked Example: What Speed Is Worth

An arbitrage opportunity worth 40 in expectation appears 500 times a day. Five participants can act on it, and without a speed advantage the winner is effectively random.

1. **Expected daily value in a fair race**: `500 * 40 / 5 = 4,000`
2. **Expected daily value if reliably first**: `500 * 40 = 20,000`
3. **Value of the advantage**: `20,000 - 4,000 = 16,000` per day

Sixteen thousand a day is the maximum rational spend on being fastest, before any consideration of whether the advantage is sustainable. It is not, in general: competitors respond, `V` falls as more participants can act, and the same expenditure buys a smaller edge each year. Latency arbitrage revenue tends to be competed down towards the cost of the infrastructure required to capture it, which is exactly what an economist would predict of a contest over a fixed prize.

---

#### Queue Position

Under price-time priority, latency buys something more durable than reaction speed: it buys a place near the front of every newly created queue. When a price level is created, the orders that arrive first trade first, and that ordering persists for the life of the level.

This matters because queue position and adverse selection are linked. A level is fully consumed mainly when there is sustained one-directional pressure, so orders at the back fill disproportionately in the states where the price is about to move against them. Front-of-queue fills are a mixture of noise and information; back-of-queue fills skew towards information. Two makers quoting the same price on the same venue can therefore have materially different economics, and the difference is not visible in either one's average fill price.

The consequences ripple outwards. Slow makers must quote wider or smaller to survive, which reduces displayed depth. Cancel latency matters as much as entry latency, because a quote you cannot withdraw is an option you have written for free. And on pro-rata venues the calculus changes completely: allocation is by size rather than time, so capital substitutes for speed.

---

#### Race Conditions and State Divergence

Latency also produces failures that are not about price at all. They arise because your view of the world and the venue's view of the world diverge for a period, and both sides act during it.

- **Cancel in flight.** You send a cancel; a fill for the same order is already travelling the other way. Until the acknowledgement arrives, your position is uncertain. Systems that assume a sent cancel is an effective cancel will double up.
- **Duplicate submission.** A timeout is not a rejection. Resending on timeout without an idempotency key is a reliable way to acquire twice the intended position.
- **Feed asymmetry.** Market data and order acknowledgements travel different paths with different delays. A fill can be known before the trade appears on the public feed, or after, and inventory logic that assumes one ordering breaks under the other.
- **Sequence gaps.** A dropped multicast packet leaves the local book wrong until recovery completes. Trading on a book known to be incomplete is worse than not trading.
- **Reconnection state.** After a disconnect, the venue's record of open orders is authoritative and yours is a guess. Query before acting.

The defensive pattern is the same in every case: treat the venue as the source of truth, make every action idempotent, and reconcile continuously rather than at end of day. See [Operational Risk](/risk/operational).

---

#### Latency On-Chain

On-chain execution has a latency floor set by block production rather than by physics. Between blocks nothing settles, so a quote embedded in pool state is stale for the whole interval by construction. Liquidity providers cannot cancel; the pool quotes the same curve until someone trades against it. This is the structural reason arbitrageurs realign pools at the start of blocks, and the loss is borne by providers.

Two further differences matter. First, the contest is resolved by an auction rather than by arrival order: inclusion and position within a block are bought, so the race is to reach a builder with an attractive bid rather than to reach a matching engine first. Latency still matters, but it is a qualifying condition rather than the deciding one. See [Gas & Mempool](/microstructure/gas-mempool) and [Transaction Ordering & MEV](/transaction-ordering-mev).

Second, the failure modes are different. A transaction may be included but revert, costing fees and achieving nothing. A chain reorganisation can undo a state you had already acted on. A sequencer outage can make the venue unreachable while positions remain open. And oracle updates arrive on their own schedule, so a liquidation may be triggered by a price that was true some blocks ago. See [Oracle Manipulation](/risk/oracle-manipulation).

Mitigations trade responsiveness for fairness: batch auctions that clear at a uniform price remove the within-batch race, encrypted mempools hide contents until ordering is fixed, and frequent-batch designs deliberately coarsen time. Each reduces the value of speed and adds delay for everyone. See [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses).

---

#### In Practice Across Venue Types

**Equities.** Co-location, direct feeds and hardware acceleration are standard for participants who need them. Fragmentation adds a specific hazard: a composite best quote assembled from feeds of different latencies can describe a state that never existed on any venue.

**Futures.** A single matching engine per contract makes the race unusually clean, and distance to the engine is the dominant variable. Cross-venue strategies between futures and their underlying are constrained by the speed of light between data centres.

**Foreign exchange.** Last look lets a provider hold a trade briefly before accepting, which is a deliberate latency asymmetry. The rejected trades are disproportionately the profitable ones, so measured fill rates conditional on subsequent price moves are the meaningful diagnostic.

**Options.** Quotes are derived from a model, so a change in the underlying invalidates thousands of quotes at once. Mass-quote and mass-cancel throughput is the binding constraint rather than single-order latency. See [Greeks](/derivatives/greeks).

**On-chain.** Block time is the floor, ordering is auctioned, and the relevant latency is time to reach a builder or sequencer. Failed transactions and reorganisations have no analogue in traditional venues.

---

#### Assumptions and Failure Modes

- **Latency is assumed constant.** It is a distribution with a long tail, and the tail is correlated with market activity: your slowest moments coincide with the market's busiest. Median latency is nearly useless; the 99th percentile is the number that matters.
- **Speed is assumed to be the edge.** Beyond the point where you are competitive, further investment buys little. Being second by a microsecond and second by a millisecond pay the same.
- **Fill data is assumed sufficient to detect the problem.** It is not. Adverse selection is only visible in post-fill mark-outs and in the fills you failed to get.
- **Cancellation is assumed effective.** Every resting order is a written option until the cancel is acknowledged, and its value to the taker rises with your cancel latency.
- **The advantage is assumed durable.** Competitors upgrade, venues change matching engines, and the opportunity set shrinks as more participants can act. Latency edges depreciate.
- **Clocks are assumed synchronised.** Cross-venue and cross-system analysis is meaningless without disciplined time synchronisation, and unsynchronised clocks produce confident conclusions about causality that are simply wrong.
- **Testing is assumed representative.** Latency measured in a quiet test environment tells you nothing about behaviour under the message rates that accompany a market event.

> warning **Educational content only** This page explains how latency creates risk in trading systems. It is not advice to build or operate any particular infrastructure, and all figures are illustrative.

---

#### Code

```python
def maker_net_bps(half_spread_bps, picked_off_share, adverse_move_bps):
    """Net basis points per fill after latency-driven adverse selection.

    Break-even is picked_off_share * adverse_move_bps == half_spread_bps.
    Only the first term responds to infrastructure.
    """
    return half_spread_bps - picked_off_share * adverse_move_bps


def latency_budget(opportunity_value, races_per_day, competitors):
    """Maximum rational daily spend on being reliably first.

    Assumes a fair race otherwise. Treat as an upper bound: competitors
    respond, so the advantage depreciates.
    """
    fair_share = opportunity_value * races_per_day / competitors
    winning_all = opportunity_value * races_per_day
    return winning_all - fair_share


def mark_out_bps(fills, mid_after, horizon_seconds):
    """Average signed mid-price move after each fill, in basis points.

    Persistently negative means you are being selected against. This is
    the measurement latency problems show up in first.
    """
    total = 0.0
    for fill in fills:
        future_mid = mid_after(fill["timestamp"], horizon_seconds)
        total += fill["side"] * (future_mid - fill["price"]) / fill["price"]
    return 10_000 * total / len(fills)
```

---

#### See Also

* [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms)
* [Fees & Routing](/microstructure/fees-routing)
* [Slippage](/microstructure/slippage)
* [Adverse Selection](/execution/adverse-selection)
* [Gas & Mempool](/microstructure/gas-mempool)
* [Operational Risk](/risk/operational)

---

### Order Types

> info **Metadata** Level: Beginner | Prerequisites: Orderbooks vs AMMs, Execution Overview | Tags: execution, order-types, limit-orders, liquidity

An order type is a contract with the venue: it specifies what you will accept and what you will not. Every order type is a different position on one axis — **certainty of execution versus certainty of price**. A market order guarantees the trade and surrenders the price. A limit order fixes the price and surrenders the guarantee. Everything else is a refinement of that trade.

Choosing badly is expensive in a way that does not show up on a fill report. A market order that walks four price levels reports a fill; the cost is buried in the average. A limit order that never fills reports nothing at all, and its cost — the move you missed — is invisible unless you deliberately measure it. The second failure is the more common and the more damaging.

---

#### The Core Set

<table>
  <tbody>
    <tr><td><strong>Type</strong></td><td><strong>Instruction</strong></td><td><strong>You give up</strong></td></tr>
    <tr><td>Market</td><td>Fill immediately at whatever prices are available.</td><td>All price control. Exposed to a thin book.</td></tr>
    <tr><td>Limit</td><td>Fill only at my price or better; otherwise rest in the book.</td><td>Certainty of execution.</td></tr>
    <tr><td>Stop (stop-market)</td><td>Become a market order once the price touches my trigger.</td><td>Price control, precisely when the book is likely to be thin.</td></tr>
    <tr><td>Stop-limit</td><td>Become a limit order once the trigger is touched.</td><td>Certainty of execution in a gap — the case you set it for.</td></tr>
    <tr><td>Immediate-or-cancel (IOC)</td><td>Fill what you can now at my limit; cancel the rest.</td><td>The unfilled remainder, deliberately.</td></tr>
    <tr><td>Fill-or-kill (FOK)</td><td>Fill the entire size now or nothing.</td><td>Partial fills. Usually a lower fill rate.</td></tr>
    <tr><td>Pegged</td><td>Track a reference (mid, bid, offer) with an optional offset.</td><td>Control of the absolute price; you inherit the reference's noise.</td></tr>
    <tr><td>Iceberg / reserve</td><td>Display a small slice; refresh from a hidden reserve as it fills.</td><td>Queue priority on the hidden portion at most venues.</td></tr>
    <tr><td>Fully hidden</td><td>Rest without displaying at all.</td><td>Priority behind all displayed orders at the same price.</td></tr>
  </tbody>
</table>

Two qualifiers matter as much as the type. **Time in force** (day, good-till-cancel, good-till-time) governs how long a resting order survives. **Post-only** rejects an order that would cross and take liquidity, guaranteeing maker treatment — relevant wherever [maker rebates and taker fees](/microstructure/fees-routing) differ.

> warning **A stop is not a protection guarantee** A stop-market order triggers into whatever book exists at that moment. In a gap, the trigger and the fill can be far apart, and the trigger price is frequently the worst price of the session. A stop-limit avoids the bad fill by risking no fill at all. See [Stop Loss](/strategies/stop-loss).

---

#### Worked Example

The book for a stock, with the best bid at 20.02:

<table>
  <tbody>
    <tr><td><strong>Side</strong></td><td><strong>Price</strong></td><td><strong>Size</strong></td></tr>
    <tr><td>Ask</td><td>20.05</td><td>800</td></tr>
    <tr><td>Ask</td><td>20.04</td><td>1,200</td></tr>
    <tr><td>Ask</td><td>20.03</td><td>500</td></tr>
    <tr><td>Bid</td><td>20.02</td><td>900</td></tr>
    <tr><td>Bid</td><td>20.01</td><td>1,500</td></tr>
  </tbody>
</table>

The mid is `(20.02 + 20.03) / 2 = 20.025`. You want 2,000 shares.

**Route A — market order.** It walks the book:

1. `500 at 20.03 = 10,015`
2. `1,200 at 20.04 = 24,048`
3. `300 at 20.05 = 6,015`
4. Total `40,078` for 2,000 shares, average **20.039**

Cost against the mid: `20.039 - 20.025 = 0.014` per share, which is `0.014 / 20.025 = 6.99 bps`. Total cost `2,000 * 0.014 = 28.00`.

**Route B — limit order at 20.03.** It takes the 500 resting at 20.03 immediately and rests 1,500 at that price. Suppose over the next few minutes another 300 sellers hit it, then the market runs away to a mid of 20.08. You filled 800 shares and cancelled 1,200.

1. Filled portion: `800 * (20.03 - 20.025) = 4.00`
2. Unfilled portion, marked to the new mid: `1,200 * (20.08 - 20.025) = 66.00`
3. Total `70.00`, which on the 2,000-share paper notional of `2,000 * 20.025 = 40,050` is `70 / 40,050 = 17.5 bps`

The limit order achieved a better price on every share it filled — 2.5 bps of cost against 7.0 — and cost **two and a half times as much overall**. This is the entire lesson of order-type selection, and it is invisible to any report that only looks at fills.

> info **The comparison flips with the price path** Had the market drifted down to 20.00, the limit order would have filled the rest cheaply and beaten the market order comfortably. The limit order is a short position in short-term momentum; it wins in mean-reverting conditions and loses in trending ones.

---

#### Hidden and Displayed Size

Showing size attracts fills and reveals intent. Hiding size protects intent and forfeits queue position: almost all venues give displayed orders priority over hidden orders at the same price, so a hidden order fills only after the displayed queue at that level is exhausted.

An iceberg splits the difference — a visible tip with a hidden reserve — but the refresh is itself a signal. A tip that reappears at the same price after every fill is a recognisable pattern, and participants who detect it can trade ahead of the reserve. The protection an iceberg offers is real but weaker than it appears, and weakens further the longer the order works.

---

#### In Practice Across Asset Classes

**Equities.** The richest set, because fragmentation demands it. Midpoint pegs and conditional orders exist mainly to interact with dark venues. Post-only and inverted-venue routing exist because fee schedules differ between exchanges.

**Futures.** A lean set on a single book: limit, market, stop, and time-in-force qualifiers. Iceberg orders exist but hidden liquidity is a smaller share of the book than in equities.

**FX.** The dealer model changes the vocabulary. On request-for-quote channels the equivalent of a limit order is simply declining the quote. Some venues apply *last look*, a brief window in which the maker may reject a trade after you accept the quote — meaning a fill is not final until it is confirmed.

**Fixed income.** Most non-government issues trade by request-for-quote. There is no resting limit order to speak of; the choices are how many dealers to ask and whether to reveal direction and size.

**On-chain.** An automated market maker swap is closest to a market order with an attached limit: the `minAmountOut` parameter is a slippage tolerance that reverts the transaction if breached. Setting it loose invites sandwich attacks; setting it tight causes reverts that still cost gas. Limit orders exist as off-chain signed intents filled by third parties, and on-chain order books exist on some chains. See [Swaps & DEXs](/building-blocks/swaps-dexs), [Gas & Mempool](/microstructure/gas-mempool), and [Slippage & Frontrunning](/risk/slippage-frontrunning).

---

#### Assumptions and Failure Modes

- **The book you see is the book you get.** Displayed depth can be withdrawn faster than your order arrives. Quoted size is an option the maker holds, not a commitment. See [Latency Risk](/microstructure/latency-risk).
- **Resting orders are free.** They are not: a resting limit order is a free option granted to everyone else, exercised precisely when the market is about to move against you. That is [adverse selection](/execution/adverse-selection).
- **Hidden means invisible.** Hidden liquidity is routinely inferred from fill patterns, quote flicker, and probe orders. Assume a determined counterparty can detect a persistent iceberg.
- **Stops are private.** On a lit venue the trigger is held by the broker or exchange, but clustered stop levels are predictable from chart structure alone, and price paths do sometimes run to where the stops are.
- **A fill is final.** Under last look, self-match prevention, or an on-chain revert, it may not be. Reconcile fills rather than assuming them.
- **Order type is independent of size.** It is not. The right type for 1% of average daily volume is often wrong for 20%, where the question becomes a schedule rather than a single order — see [TWAP & VWAP](/execution/twap-vwap).

---

#### Code

```python
def walk_book(levels, quantity):
    """Average fill price for a marketable order against sorted book levels.

    levels: list of (price, size), best price first. Returns (avg_px, filled).
    """
    cash, filled = 0.0, 0
    for price, size in levels:
        take = min(size, quantity - filled)
        if take <= 0:
            break
        cash += take * price
        filled += take
    return (cash / filled if filled else None), filled


asks = [(20.03, 500), (20.04, 1200), (20.05, 800)]
avg, filled = walk_book(asks, 2000)      # (20.039, 2000)
mid = (20.02 + 20.03) / 2
cost_bps = (avg - mid) / mid * 1e4        # 6.99


def limit_order_cost_bps(limit_px, filled_qty, order_qty, mid_at_send, mid_after):
    """Total cost of a limit order including the unfilled tail.

    The tail is the term most fill reports omit entirely.
    """
    unfilled = order_qty - filled_qty
    fill_cost = filled_qty * (limit_px - mid_at_send)
    miss_cost = unfilled * (mid_after - mid_at_send)
    return (fill_cost + miss_cost) / (order_qty * mid_at_send) * 1e4


limit_order_cost_bps(20.03, 800, 2000, 20.025, 20.08)   # 17.48
```

---

#### See Also

* [Execution Overview](/execution/execution-overview)
* [Adverse Selection](/execution/adverse-selection)
* [Smart Order Routing](/execution/smart-order-routing)
* [TWAP & VWAP](/execution/twap-vwap)
* [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms)
* [Stop Loss](/strategies/stop-loss)

---

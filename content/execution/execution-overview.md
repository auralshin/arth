### Execution Overview

> info **Metadata** Level: Intermediate | Prerequisites: Slippage, Orderbooks vs AMMs | Tags: execution, transaction-costs, implementation-shortfall, market-impact

A backtest buys at a price. A live strategy buys at a sequence of prices, some of which do not exist until the order goes to market. The gap between the two is execution cost, and for any strategy that turns over faster than a few times a year it is not a rounding error — it is one of the largest single terms in the profit and loss statement.

The uncomfortable arithmetic is this: a signal with an expected edge of 20 basis points per trade that costs 25 basis points to implement is a losing strategy, no matter how impressive its research Sharpe ratio. Execution is therefore not a back-office concern bolted on after the alpha is found. It sets a floor on which strategies are viable at what size, and it is the reason a strategy that works at 10 million in capital can be worthless at 500 million.

---

#### The Cost Taxonomy

Execution cost is conventionally split into four buckets. They are additive by construction, which is what makes the decomposition useful.

<table>
  <tbody>
    <tr><td><strong>Component</strong></td><td><strong>Origin</strong></td><td><strong>Controllable?</strong></td></tr>
    <tr><td>Spread</td><td>Paying the offer instead of the mid when buying. The market maker's compensation.</td><td>Partly — by posting passively instead of taking.</td></tr>
    <tr><td>Market impact</td><td>Your own order moving the price against you as it consumes liquidity.</td><td>Yes — by trading slower or smaller.</td></tr>
    <tr><td>Delay (slippage)</td><td>The price drifting between the decision and the first fill.</td><td>Partly — by shortening the decision-to-market latency.</td></tr>
    <tr><td>Opportunity cost</td><td>The part of the order that never filled, valued at the price it would have needed.</td><td>Yes — but only by accepting more of the other three.</td></tr>
  </tbody>
</table>

Explicit costs — commissions, exchange fees, taxes, network gas — sit alongside these and are usually the smallest and best-understood term. See [Fees & Routing](/microstructure/fees-routing).

The central tension: every action that reduces one component increases another. Trading faster cuts delay and opportunity cost but raises impact. Posting passively cuts spread but raises opportunity cost and exposes you to [adverse selection](/execution/adverse-selection). There is no free configuration, only a frontier of trade-offs. That frontier is what [Almgren–Chriss](/execution/almgren-chriss) makes explicit.

---

#### Worked Example

A portfolio manager decides to buy 200,000 shares when the screen shows 50.00. The order reaches the trading desk a few minutes later, by which time the market is at 50.04. The desk works the order through the day, filling 180,000 shares at an average of 50.13. The remaining 20,000 are cancelled at the close, when the stock is 50.30. Commission is 1 cent per share.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Order size</td><td>200,000 shares</td></tr>
    <tr><td>Decision price</td><td>50.00</td></tr>
    <tr><td>Arrival price (order release)</td><td>50.04</td></tr>
    <tr><td>Shares filled / average price</td><td>180,000 at 50.13</td></tr>
    <tr><td>Shares unfilled / closing price</td><td>20,000, close 50.30</td></tr>
    <tr><td>Paper notional (200,000 x 50.00)</td><td>10,000,000</td></tr>
  </tbody>
</table>

All costs are expressed in basis points of the 10,000,000 paper notional.

1. **Delay cost.** The price moved 0.04 before the desk could act, on the 180,000 shares eventually filled: `180,000 * 0.04 = 7,200`, or `7,200 / 10,000,000 = 7.2 bps`.
2. **Trading cost (spread plus impact).** From arrival to the average fill: `180,000 * (50.13 - 50.04) = 16,200`, or **16.2 bps**.
3. **Opportunity cost.** The unfilled tail, marked against the decision price: `20,000 * (50.30 - 50.00) = 6,000`, or **6.0 bps**.
4. **Commission.** `180,000 * 0.01 = 1,800`, or **1.8 bps**.

Total: `7,200 + 16,200 + 6,000 + 1,800 = 31,200`, which is **31.2 bps**.

The manager's model may have forecast a 40 basis point move. Four-fifths of it went to the mechanics of getting into the position. Note also which term is largest: the trading cost, not the commission the desk is usually asked about.

> info **Why the decision price and not the arrival price** Benchmarking against arrival hides the delay term entirely, which is convenient for the desk and misleading for the fund. The full decision-to-close accounting is [implementation shortfall](/execution/implementation-shortfall).

---

#### Why Execution Is Part of the Strategy

Two consequences follow from treating cost as endogenous rather than as a fixed subtraction.

**Capacity is a cost curve, not a number.** Because impact grows with participation, the marginal cost of the last unit of size exceeds the average. A strategy's capacity is the size at which marginal cost equals marginal gross edge — not the size at which the fund runs out of capital. [Market Impact](/execution/market-impact) develops the scaling.

**Signal decay and cost interact.** A fast-decaying signal must be executed quickly, which is expensive; a slow signal can be worked patiently, which is cheap. Two strategies with identical gross Sharpe ratios can have opposite net outcomes purely because of how long their edge survives. This is why a research backtest with a fixed cost assumption of "5 bps per side" is usually the weakest line in the whole exercise. See [Backtest vs Live](/risk/backtest-vs-live).

---

#### In Practice Across Asset Classes

**Equities.** The most fragmented case. Liquidity is spread across lit exchanges, dark pools, and internalisers, so cost depends heavily on [routing](/execution/smart-order-routing). Tick size and lot conventions bound how tightly a spread can be quoted.

**Futures.** A single central limit order book per contract, so no routing problem and a very visible spread. Cost is dominated by impact and by the roll: rolling a large position between contract months is itself a two-legged execution problem.

**FX.** No consolidated tape. Costs are quoted as a spread that varies by counterparty, size, and time of day; the same trade can have several defensible "market prices" simultaneously. Last look on some venues means a quote is not a firm commitment.

**Fixed income.** Much of the market trades by request-for-quote rather than a continuous book. The act of asking for a price is itself information, so the cost of enquiring widely is that dealers widen. Impact is realised as spread deterioration rather than as ticks walked up a book.

**On-chain.** Cost decomposes differently: pool fee plus curve slippage plus gas plus the value extractable by transaction orderers. The last term has no traditional-market analogue with the same mechanics — see [Gas & Mempool](/microstructure/gas-mempool) and [Slippage & Frontrunning](/risk/slippage-frontrunning). Settlement is atomic, which removes some risks and creates others.

---

#### Assumptions and Failure Modes

- **A single decision price exists.** For discretionary orders it often does not — the "decision" is a conversation. Any shortfall number then inherits an arbitrary starting point, and desks have an incentive to place it late.
- **Costs decompose additively.** They do in accounting, not in causation. Delay and impact interact: a slow order is exposed to more drift, and drift caused by others front-running your pattern is indistinguishable from bad luck.
- **Unfilled quantity is priced at the close.** This is a convention. If the strategy would have kept working the order the next day, closing-price opportunity cost understates the true miss.
- **The counterfactual is unobservable.** You cannot know what the price would have done had you not traded. Every impact estimate is a model, not a measurement.
- **Costs measured on realised trades are selected.** Orders that were easy to fill are over-represented in the sample. This biases average measured cost downward in exactly the situations where cost matters most. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).

> warning **A flat cost assumption in a backtest is a hidden size bet** Assuming a constant basis-point cost per trade makes the strategy appear to scale linearly. Real cost grows with size, so the backtest is implicitly promising capacity it does not have.

---

#### Code

```python
def decompose_cost(decision_px, arrival_px, filled_qty, avg_fill_px,
                   unfilled_qty, end_px, commission_per_share, side="buy"):
    """Split execution cost into delay, trading, opportunity and commission.

    Signed so that a positive number is always a cost, for either side.
    """
    sign = 1.0 if side == "buy" else -1.0
    total_qty = filled_qty + unfilled_qty
    paper_notional = total_qty * decision_px

    delay = sign * filled_qty * (arrival_px - decision_px)
    trading = sign * filled_qty * (avg_fill_px - arrival_px)
    opportunity = sign * unfilled_qty * (end_px - decision_px)
    commission = filled_qty * commission_per_share  # always a cost

    parts = {"delay": delay, "trading": trading,
             "opportunity": opportunity, "commission": commission}
    return {k: v / paper_notional * 1e4 for k, v in parts.items()}


decompose_cost(50.00, 50.04, 180_000, 50.13, 20_000, 50.30, 0.01)
# {'delay': 7.2, 'trading': 16.2, 'opportunity': 6.0, 'commission': 1.8}
```

---

#### See Also

* [Implementation Shortfall](/execution/implementation-shortfall)
* [Market Impact](/execution/market-impact)
* [Order Types](/execution/order-types)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Slippage](/microstructure/slippage)
* [Fees & Routing](/microstructure/fees-routing)

---

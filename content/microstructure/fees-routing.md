### Fees & Routing

> info **Metadata** Level: Intermediate | Prerequisites: Slippage, Orderbooks vs AMMs | Tags: fees, routing, maker-taker, execution, fragmentation, transaction-costs

Fees are the part of trading cost that appears on a statement. Slippage is the part that does not. Most participants manage the first carefully and the second casually, which is the wrong way round: for anything but the smallest orders, the implicit costs are the larger number. A venue advertising zero commission has not made trading free — it has moved the charge into the spread, into the rebate structure, or into what it sells to someone else.

Routing is the decision of where to send an order once fragmentation makes "the market" a collection of venues rather than a place. That decision is not a search for the best displayed price. It is a joint optimisation over price, fee, fill probability, information leakage and fixed cost, in which the venue showing the best quote is frequently the wrong choice.

---

#### Formal Definition

The all-in cost of an execution, in basis points of notional:

```text
all_in_bps = half_spread_bps
           + impact_bps
           + explicit_fee_bps
           + 10000 * fixed_cost / notional
           + financing_bps
```

where:

- `half_spread_bps` is the cost of crossing, paid by liquidity takers
- `impact_bps` is the size-dependent price concession, from the square-root model or a fitted equivalent
- `explicit_fee_bps` is commission, exchange fee, tax and any proportional levy
- `fixed_cost` is per-transaction cost independent of size: ticket charges, network fees, minimum commissions
- `financing_bps` is carry, borrow or funding cost over the holding period

For a liquidity provider the sign structure inverts, and the interesting term is the one that is not a fee at all:

```text
maker_net_bps = half_spread_bps + rebate_bps - adverse_selection_bps
```

A maker earns the half-spread and any rebate on every fill, and loses to informed flow on some of them. Rebate income is certain and visible; adverse selection is uncertain and must be measured. A market-making business that tracks only the first is measuring its revenue and not its profit. See [Adverse Selection](/execution/adverse-selection).

---

#### Worked Example: Zero Fee Is Not Zero Cost

Two venues quote the same instrument. An order of 200,000 notional is small enough that impact is negligible on both.

<table>
  <tbody>
    <tr><td><strong>Venue</strong></td><td><strong>Quoted spread</strong></td><td><strong>Taker fee</strong></td><td><strong>All-in cost</strong></td><td><strong>Cost on 200,000</strong></td></tr>
    <tr><td>A</td><td>4 bps</td><td>2.5 bps</td><td>4.5 bps</td><td>90</td></tr>
    <tr><td>B</td><td>9 bps</td><td>0 bps</td><td>4.5 bps</td><td>90</td></tr>
  </tbody>
</table>

1. **Venue A**: half-spread `4 / 2 = 2.0 bps`, plus `2.5 bps` fee, gives `4.5 bps`. On 200,000 that is `200,000 * 0.00045 = 90`.
2. **Venue B**: half-spread `9 / 2 = 4.5 bps`, plus nothing, gives `4.5 bps`, also `90`.

Identical. The fee schedule tells you how the cost is labelled, not how large it is. In practice the two venues will differ on the dimensions the table omits — depth beyond the touch, fill probability, and how much your order reveals — and those differences are usually worth more than the headline fee.

**Maker economics on Venue A.** A maker quoting the 4 bps spread earns the `2.0 bps` half-spread plus a `1.5 bps` rebate, for `3.5 bps` gross per fill. Suppose the mid moves `2.4 bps` against the maker in the second after an average fill — a directly measurable quantity. Net is `3.5 - 2.4 = 1.1 bps`. On 50,000,000 of daily filled notional that is `50,000,000 * 0.00011 = 5,500` per day.

The sensitivity is the point. If adverse selection rises to 3.5 bps — a small deterioration, easily caused by being slightly slower than competitors — the business earns nothing while its rebate income is unchanged. See [Latency Risk](/microstructure/latency-risk).

> info **The exchange keeps the difference** With a 2.5 bps taker fee and a 1.5 bps maker rebate, the venue retains 1.0 bps per matched trade. This spread between the two sides is what the fee schedule is actually for.

---

#### Fee Models

**Maker-taker.** Takers pay, makers are rebated. Designed to attract displayed liquidity, and it works: it narrows quoted spreads. It also creates a conflict, because a broker routing on best net cost to itself will prefer the venue paying the largest rebate rather than the one offering the best fill.

**Taker-maker (inverted).** The signs are reversed: takers are rebated and makers pay. Attracts flow that wants to cross immediately, and inverted venues tend to have shorter queues, which can make them attractive to makers despite the fee.

**Flat and tiered.** A single rate for both sides, usually with volume tiers. Simpler to reason about, and it removes the routing conflict, at the cost of weaker incentives to display liquidity.

**Payment for order flow.** A wholesaler pays a broker for the right to execute its retail orders, and profits from the difference between the price it gives and the price it can obtain. The retail client sees zero commission and typically some price improvement over the public quote; the cost is embedded and the routing decision is not made on the client's behalf.

**Request for quote.** Dealers quote a price that already includes their margin; there is no separate fee. Cost is the difference between the dealt level and the fair mid, which is unobservable unless you can see several dealers at once — and asking several is itself information.

**On-chain fee tiers.** Pools charge a fixed proportion of the input, usually chosen per pair: low tiers for correlated assets, higher tiers for volatile ones. The fee accrues to liquidity providers rather than to a venue, and the choice of tier is a trade-off between attracting volume and compensating providers for adverse selection. See [Concentrated Liquidity](/protocols/concentrated-liquidity).

---

#### Routing Across Fragmented Venues

When the same instrument trades in several places, routing becomes a constrained optimisation:

```text
minimise  sum over venues v of  q_v * cost_v(q_v)  +  fixed_cost * (number of venues used)
subject to  sum over venues v of q_v = Q
```

Because `cost_v` is convex in `q_v` — impact grows with size — the unconstrained solution splits the order across venues until marginal cost is equalised. The fixed-cost term pulls the other way, penalising fragmentation of small orders.

Five considerations dominate real routing decisions:

- **Displayed price is not expected price.** A venue showing the best quote for 100 units is irrelevant to an order of 100,000. Route on the cost curve, not the touch.
- **Fill probability matters as much as price.** A passive order at a better price that never fills has an opportunity cost, which the fill data will not show you. See [Implementation Shortfall](/execution/implementation-shortfall).
- **Information leaks.** Posting on multiple venues signals size. Cancelling and reposting signals urgency. Sophisticated counterparties infer both.
- **Latency ordering matters.** Sending simultaneous child orders to venues with different latencies means they arrive in sequence, and the fastest recipients can react before the rest land.
- **Sequencing changes the price.** Routing through several pools or books in sequence means each leg executes against a state the previous leg altered. Simulating each independently understates total cost.

See [Smart Order Routing](/execution/smart-order-routing) for the algorithmic treatment.

---

#### Fixed Costs and Minimum Economic Size

Any per-transaction charge — a ticket fee, a minimum commission, a network fee — creates a size below which trading is uneconomic. The breakeven is where the fixed cost equals the proportional saving that justified it:

```text
breakeven_notional = fixed_cost / (saving_bps / 10000)
```

If splitting an order to a second venue saves 3 bps but costs 15 in fixed charges, the split is only worthwhile above `15 / 0.0003 = 50,000` of notional. Below that, the simpler route is the cheaper one.

This is the mechanism that makes small on-chain trades expensive: a network fee that is constant in currency terms is enormous in basis points on a small trade and negligible on a large one. It is also why multi-hop routes that look optimal on price alone are frequently worse once the additional calls are priced in. See [Gas & Mempool](/microstructure/gas-mempool).

---

#### In Practice Across Venue Types

**Equities.** Fees are small relative to the spread and vary by venue and tier. Regulatory best-execution obligations constrain routing, and taxes such as stamp duty or financial transaction taxes can dwarf every other explicit cost in some jurisdictions.

**Futures.** Exchange and clearing fees are charged per contract rather than proportionally, so cost in basis points falls as the contract's notional value rises. A single dominant venue per contract removes most routing choice.

**Foreign exchange.** Typically no explicit commission at the point of trade; the cost is entirely in the spread, differentiated by client tier. Cost measurement requires an independent mid, which is not straightforward without a central book.

**Fixed income and credit.** Dealer margin embedded in the quote, with no separate fee. Cost varies enormously with issue liquidity and with how many dealers were asked. See [Credit 101](/credit/credit-101).

**Options.** Per-contract fees are material relative to the premium of cheap options, and the spread is wide. Complex orders executed as a package usually cost less than legging in, because the package removes the leg risk the maker would otherwise price.

**On-chain.** Three distinct charges: the pool fee to liquidity providers, the network fee to validators, and any priority payment for ordering. Aggregators split across pools to reduce curve slippage, paying additional network fees for each hop. See [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms).

---

#### Assumptions and Failure Modes

- **Fee schedules are assumed static.** Volume tiers mean your marginal fee depends on cumulative activity, so the cost of a trade depends on trades you have not made yet.
- **Rebates are assumed to be profit.** Rebate income net of adverse selection is the only meaningful figure, and adverse selection is the harder half to measure.
- **Routing is assumed conflict-free.** Where the router's own cost differs from the client's cost, incentives diverge. Best execution is a policy question before it is an algorithmic one.
- **Venue quotes are assumed simultaneous.** They are not; feed latencies differ, so a composite best quote may describe a state that never existed anywhere.
- **Splitting is assumed to reduce cost.** It reduces impact per venue and increases fixed cost, leakage and the chance of overfilling. Beyond a point, more venues is worse.
- **The cost curve is assumed known.** It is estimated from your own fills, which are a biased sample: you traded when you chose to, on venues you chose. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Fees are assumed independent of market conditions.** On-chain network fees spike exactly when volatility does, so cost is highest when the need to trade is greatest.

> warning **Educational content only** This page explains fee structures and routing trade-offs. It is not a recommendation of any venue, broker or routing arrangement, and the rates used are illustrative.

---

#### Code

```python
def all_in_cost_bps(notional, half_spread_bps, impact_bps, fee_bps, fixed_cost=0.0):
    """Total cost of an execution in basis points of notional.

    The fixed-cost term is what makes small orders and multi-hop routes
    expensive; it is invisible in a purely proportional cost model.
    """
    fixed_bps = 10_000 * fixed_cost / notional if notional else float("inf")
    return half_spread_bps + impact_bps + fee_bps + fixed_bps


def maker_net_bps(half_spread_bps, rebate_bps, adverse_selection_bps):
    """Net revenue per fill for a liquidity provider.

    Rebates are certain and adverse selection is not, which is why the
    first is reported and the second decides whether the business works.
    """
    return half_spread_bps + rebate_bps - adverse_selection_bps


def breakeven_notional(fixed_cost, saving_bps):
    """Smallest order for which paying a fixed cost to save `saving_bps` pays."""
    return fixed_cost / (saving_bps / 10_000)
```

---

#### See Also

* [Slippage](/microstructure/slippage)
* [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms)
* [Latency Risk](/microstructure/latency-risk)
* [Smart Order Routing](/execution/smart-order-routing)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Gas & Mempool](/microstructure/gas-mempool)

---

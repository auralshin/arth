### Trading Foundations

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility | Tags: microstructure, order-books, execution, derivatives, market-making, liquidity

Before any strategy can be evaluated, three mechanical questions have to be answered: how does an order become a trade, what does that conversion cost, and who is on the other side. This page covers those mechanics — venues and matching, the anatomy of execution cost, the instruments through which exposure is actually taken, and the economics of providing liquidity rather than consuming it.

The material is deliberately venue-agnostic. A central limit order book, a dealer market, a request-for-quote platform, and an automated market maker are four answers to the same problem: aggregating willingness to trade at a price. They differ in who bears inventory risk, how quotes are updated, and what a large order does to the price — and those differences show up directly in a strategy's net returns.

> warning **Not Financial Advice** This page explains market mechanics. It is not a recommendation to trade on any venue or in any instrument.

---

#### How Trades Get Matched

Almost every venue is a variation on one of four designs.

<table>
  <tbody>
    <tr><td><strong>Design</strong></td><td><strong>Who provides the price</strong></td><td><strong>Typical use</strong></td></tr>
    <tr><td>Central limit order book</td><td>Anyone, by posting resting limit orders; matched by price then time priority</td><td>Listed equities, futures, most crypto exchanges</td></tr>
    <tr><td>Dealer / principal market</td><td>A dealer quotes a two-sided price and takes the other side onto its own book</td><td>Corporate bonds, FX, structured products</td></tr>
    <tr><td>Request for quote</td><td>The taker asks several dealers; the best response wins</td><td>Fixed income, swaps, large blocks</td></tr>
    <tr><td>Automated market maker</td><td>A deterministic pricing function over pooled reserves; no discretion, no updates between blocks</td><td>On-chain spot markets</td></tr>
  </tbody>
</table>

Two properties of the design determine most of what a trader experiences. **Quote update latency** decides how stale a posted price can become before it is traded against — near-instant on an exchange with co-located makers, one block on an automated market maker, and a human decision cycle in an RFQ market. **Priority rules** decide who gets filled when several participants want the same trade; price-time priority makes queue position an asset in itself.

See [Order Books vs AMMs](/microstructure/orderbooks-vs-amms) and [Order Types](/execution/order-types).

---

#### Formal Definition: What Execution Costs

The cost of a trade is the difference between the price you got and a reference price, and the choice of reference is what distinguishes the standard measures.

```text
effective_half_spread = side * (P_exec - M_decision)

implementation_shortfall = side * (P_exec - P_decision) * Q + fees + delay_cost

realised_half_spread   = side * (P_exec - M_after)
price_impact           = side * (M_after - M_decision)
```

where:

- `side` is `+1` for a buy and `-1` for a sell
- `P_exec` is the volume-weighted price actually achieved
- `M_decision` is the mid price at the moment the decision was made
- `M_after` is the mid some interval after the fill
- `Q` is the quantity traded
- `delay_cost` is the movement between the decision and the first fill

The decomposition `effective = realised + impact` is the useful identity: it splits the cost into the part the liquidity provider keeps and the part that reflects the market moving because you traded. A strategy whose backtest assumes fills at the mid has set all four of these to zero. See [Implementation Shortfall](/execution/implementation-shortfall) and [Transaction Cost Analysis](/execution/transaction-cost-analysis).

Impact is not linear in size. Across markets and eras a **square-root** relationship is the standard working model:

```text
impact ~= Y * sigma * sqrt(Q / V)
```

where `sigma` is volatility, `V` is the period's traded volume, and `Y` is a fitted constant of order one. The practical consequence is that the cost per unit *rises* with participation rate, though more slowly than proportionally, which is why large orders are worked over time rather than sent at once. See [Market Impact](/execution/market-impact) and [Almgren–Chriss](/execution/almgren-chriss).

---

#### Worked Example: Walking a Book vs Traversing a Curve

Buying 1,000 units, on two venue designs. All figures are illustrative arithmetic constructed for this page.

**Order book.** The mid is 100.00, with the ask side stacked as follows:

<table>
  <tbody>
    <tr><td><strong>Level</strong></td><td><strong>Price</strong></td><td><strong>Size</strong></td><td><strong>Cumulative cost</strong></td></tr>
    <tr><td>1</td><td>100.02</td><td>400</td><td>40,008</td></tr>
    <tr><td>2</td><td>100.05</td><td>300</td><td>70,023</td></tr>
    <tr><td>3</td><td>100.09</td><td>500</td><td>&mdash;</td></tr>
  </tbody>
</table>

1. Fill 400 at 100.02 for 40,008, then 300 at 100.05 for 30,015, then the remaining 300 at 100.09 for 30,027.
2. **Total cost**: `40,008 + 30,015 + 30,027 = 100,050`.
3. **Execution price**: `100,050 / 1,000 = 100.05`.
4. **Cost against the mid**: `0.05 / 100.00 = 5.0` basis points, plus whatever the venue charges a taker.

**Constant-product automated market maker.** Reserves of 1,000,000 units of the asset and 100,000,000 units of the numéraire, so the spot price is 100.00 and the invariant is `k = 1e14`. The fee is 30 basis points on the input.

1. **Reserves after the trade**: the asset reserve falls to `1,000,000 - 1,000 = 999,000`.
2. **Numéraire required by the invariant**: `1e14 / 999,000 = 100,100,100.10`, so the net input is `100,100,100.10 - 100,000,000 = 100,100.10`.
3. **Gross input including the fee**: `100,100.10 / 0.997 = 100,401.30`.
4. **Execution price**: `100,401.30 / 1,000 = 100.4013`.
5. **Cost against spot**: `0.4013 / 100.00 = 40.1` basis points, of which about 10.0 is price impact from moving along the curve and about 30.1 is the fee.

The comparison is not a verdict on either design — it is entirely determined by the depth chosen for each. Its purpose is to show that the *shape* of the cost differs: the order book's cost is a step function determined by resting size, while the curve's cost is smooth, deterministic, and computable in advance from the reserves. That determinism is exactly what makes an automated market maker's quote exploitable by anyone who sees a price move elsewhere first. See [Slippage](/microstructure/slippage) and [Adverse Selection](/execution/adverse-selection).

---

#### Instruments: Forwards, Futures, and Perpetuals

Exposure is rarely taken in the cash instrument alone. Three related contracts cover most of the ground.

A **forward** is a bilateral agreement to transact at a fixed price on a future date. Its fair price is set by no-arbitrage against buying the asset today and financing it — the cost-of-carry relationship covered in [Cash-and-Carry](/strategies/cash-carry).

A **future** is a standardised, exchange-traded forward with daily variation margin. Daily settlement is the substantive difference: it removes most counterparty risk and it turns the position into a source of daily cash flows, so financing and margin are part of the strategy rather than an afterthought. Because contracts expire, maintaining exposure requires rolling, and the roll's cost or benefit is a first-order component of returns. See [Futures 101](/markets/futures-101) and [Roll and Carry](/markets/roll-and-carry).

A **perpetual future** removes the expiry and replaces convergence-by-delivery with a recurring **funding payment** between longs and shorts, sized to pull the contract price toward an index. This makes the carry a floating rate rather than a locked-in one, and makes positioning directly observable in the funding rate. See [Perpetual Futures](/building-blocks/perpetual-futures) and [Funding Rate](/signals/funding-rate).

Three prices coexist on a margined venue and are routinely confused:

- **Index price** — a reference computed from external markets, usually a weighted or time-averaged composite
- **Mark price** — the price used for margin and liquidation, deliberately smoothed and bounded so that a brief dislocation does not trigger mass liquidations
- **Last traded price** — what actually printed on this venue

The gap between mark and last is where liquidation timing, and much of the incentive to manipulate, lives. See [Oracles](/building-blocks/oracles) and [Leverage and Liquidation](/risk/leverage-liquidation).

---

#### Providing Liquidity Instead of Consuming It

Everything above is written from the taker's side. The maker's side is the mirror image: the spread the taker pays is the maker's revenue, and the maker's problem is that this revenue must cover two costs.

**Inventory risk.** Each fill leaves a position the maker did not want, carried until an offsetting trade arrives. Its cost scales with volatility and holding time, and the standard response is to skew quotes — shading both sides in the direction that unwinds the position.

**Adverse selection.** Some counterparties trade because they know something. Against them, a resting quote is a free option: it is lifted precisely when it is mispriced. The maker's break-even half-spread must cover `alpha * m`, where `alpha` is the informed share of flow and `m` the expected adverse move on those fills.

An automated market maker is the extreme case of both. Its quote schedule is published, deterministic, and cannot be revised between blocks, so an arbitrageur observing a price change on a faster venue trades against a stale curve with near-certainty. The resulting systematic cost — the gap between the pool's outcome and simply holding the rebalanced portfolio — is the on-chain form of adverse selection, and it is closely related to [Impermanent Loss](/building-blocks/impermanent-loss). Concentrated liquidity concentrates fee income and this cost together.

See [Market Making Lite](/strategies/mm-lite) for the quoting model and [LP Business](/strategies/lp-business) for the on-chain version.

---

#### In Practice Across Asset Classes

**Equities.** Fragmented across many venues, with maker-taker fee schedules and a minimum tick that frequently binds on liquid names. Routing decisions are a material part of realised cost. See [Smart Order Routing](/execution/smart-order-routing).

**Futures.** One venue per contract, a central book, strict price-time priority. Competition is over speed and queue position. Daily price limits mean that in extreme moves there may be no tradeable price at all.

**FX.** No central exchange; liquidity is distributed across bank and non-bank platforms. "Last look" — a brief window in which a quote can be rejected — changes the economics on both sides and has no analogue in exchange-traded markets.

**Fixed income and credit.** Largely RFQ and dealer-intermediated. Many instruments do not trade for days, so "the price" is a model output rather than an observation, which distorts every volatility and correlation estimate built from it.

**On-chain markets.** Execution is a state transition in a public queue: the intent is visible before it settles, ordering within a block is determined by an economic auction rather than by arrival time, and costs include a gas component that is independent of trade size. This makes small trades disproportionately expensive and makes any latency-sensitive strategy a bidding contest. See [Gas and Mempool](/microstructure/gas-mempool) and [MEV Overview](/building-blocks/mev-overview).

---

#### Assumptions and Failure Modes

- **Assumes the observed price was available to you.** Displayed quotes are firm only until they are cancelled, and the fastest participants cancel first. Backtests filling at the touch assume a queue position they never held. See [Backtest vs Live](/risk/backtest-vs-live).
- **Assumes size does not move the market.** It does, and the relationship is concave, so a strategy that works at small size can be uneconomic at ten times the size without any change to the signal.
- **Assumes liquidity persists.** Depth is thinnest exactly when volatility is highest, so the cost model fitted in normal conditions understates the cost in the conditions that determine a strategy's tail.
- **Assumes the mid is meaningful.** In a wide, one-sided, or stale book the midpoint is not a price anyone would trade at, and every cost measure referenced to it becomes fiction.
- **Assumes fees are constant.** Exchange schedules are tiered by volume, rebates change, and gas costs vary by orders of magnitude. A strategy whose margin depends on a fee tier has a business risk, not a market risk.
- **Assumes both legs of a hedge execute.** They do not always. Partial fills, venue outages, and cross-venue latency leave a position that was meant to be neutral temporarily directional.
- **Assumes the mark price tracks the index.** During a dislocation it may not, and margin is computed on the mark. This is how a position can be liquidated at a price that never traded anywhere else.

---

#### Code

```python
def walk_the_book(levels, quantity):
    """Volume-weighted execution price for a market order.

    `levels` is an ordered list of (price, size) from best to worst.
    Returns None if the book cannot fill the order, which is the case
    a backtest silently ignores when it fills everything at the touch.
    """
    remaining, cost = quantity, 0.0
    for price, size in levels:
        take = min(remaining, size)
        cost += take * price
        remaining -= take
        if remaining == 0:
            return cost / quantity
    return None


def constant_product_quote(reserve_asset, reserve_numeraire,
                           quantity_out, fee_rate=0.003):
    """Numeraire required to remove `quantity_out` of the asset from a
    constant-product pool, including the input fee.

    The whole quote is deterministic and computable by anyone, which is
    exactly why a stale pool is arbitraged with certainty rather than
    with probability.
    """
    invariant = reserve_asset * reserve_numeraire
    numeraire_after = invariant / (reserve_asset - quantity_out)
    net_input = numeraire_after - reserve_numeraire
    return net_input / (1.0 - fee_rate)


def square_root_impact(volatility, quantity, period_volume, constant=1.0):
    """Standard working model for market impact. Concave in size: the
    marginal cost of the next unit falls, but total cost still grows."""
    return constant * volatility * (quantity / period_volume) ** 0.5
```

---

#### See Also

* [Order Books vs AMMs](/microstructure/orderbooks-vs-amms)
* [Slippage](/microstructure/slippage)
* [Market Impact](/execution/market-impact)
* [Perpetual Futures](/building-blocks/perpetual-futures)
* [Market Making Lite](/strategies/mm-lite)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)

---

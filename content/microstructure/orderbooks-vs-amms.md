### Orderbooks vs AMMs

> info **Metadata** Level: Intermediate | Prerequisites: Trading Foundations, Returns, Volatility | Tags: microstructure, orderbook, amm, liquidity, queue-position, adverse-selection

Nearly every market in the world clears through a limit order book. Equities, futures, listed options, most spot foreign exchange and every major centralised crypto venue match buyers to sellers using a queue of standing orders and a deterministic priority rule. The automated market maker is a much newer and much narrower construction: a smart contract that quotes continuously from a formula applied to its own inventory. Setting the two side by side is genuinely instructive, but only if the order book is understood first on its own terms rather than as a foil.

Both mechanisms answer the same two questions — at what price does a given size clear, and what does the market look like afterwards — and both extract a payment from the taker of liquidity to compensate the provider for the risk of trading with someone better informed. Where they differ is in who decides the quote, how quickly it can change, and what happens to a provider who is slow.

---

#### The Limit Order Book

A **limit order book** is the set of all resting orders for an instrument, organised by price. Each order specifies a side, a limit price and a quantity. Bids sit below the asks; the highest bid and the lowest ask are the **best bid and offer**, and the difference between them is the **quoted spread**. The **mid price** is their average, and it is a convention rather than a tradeable price — nobody transacts at the mid.

Three structural parameters shape everything else. The **tick size** is the minimum price increment, which sets a floor on how tight the spread can be. The **lot size** is the minimum quantity increment. The **matching rule** determines which resting order trades first.

**Price-time priority** is the dominant rule: among orders at the same price, the one that arrived earliest trades first. This makes the book a set of queues rather than a set of pools, and it turns the arrival time of an order into an asset. Some venues use pro-rata allocation instead, splitting incoming volume across resting orders in proportion to size, which changes maker behaviour completely — under pro-rata, quoting large is how you get filled, so displayed size inflates.

**Queue position** is the practical consequence. If 900 units rest at the best bid and you join behind them, you trade only after those 900 are consumed at that price. This matters for a reason beyond patience: a level is fully exhausted mainly when there is genuine one-directional pressure, so orders at the back of the queue are filled disproportionately often in exactly the states where the price is about to move against them. Front-of-queue fills are a mixture of noise and information; back-of-queue fills are skewed towards information. Improving latency is therefore not only about speed of reaction — it buys a better place in the queue at every newly created price level.

The book also displays less than it contains. Iceberg and reserve orders show a fraction of their true size, and liquidity that is not displayed at all will often appear when a large order starts to execute. Displayed depth is a lower bound on real depth, and its reliability varies enormously by instrument. See [Order Types](/execution/order-types).

---

#### Formal Definition

A market order **walks the book**, matching against successive price levels until filled. The realised price is the size-weighted average of the levels consumed:

```text
VWAP_exec    = sum(q_i * p_i) / sum(q_i)
slippage_bps = 10000 * (VWAP_exec - P_mid) / P_mid        for a buy
```

where `q_i` is the quantity taken from level `i` and `p_i` is that level's price.

The spread itself has an economic explanation. Suppose a fraction `alpha` of incoming orders come from traders who know something the maker does not, and that after such a trade the efficient price moves by `delta` against the maker. A maker quoting a half-spread `s` earns `s` from uninformed flow and loses `delta - s` to informed flow:

```text
E[profit per fill] = (1 - alpha) * s + alpha * (s - delta)
                   = s - alpha * delta
```

Setting expected profit to zero gives the break-even half-spread:

```text
s = alpha * delta
```

The spread is not a fee. It is the price of adverse selection, and it widens when either the proportion of informed flow rises or the size of the information moves rises — which is why spreads widen before announcements and during volatility, without any maker deciding to be greedy. See [Adverse Selection](/execution/adverse-selection).

With `alpha = 0.15` and `delta = 12 bps`, the break-even half-spread is `0.15 * 12 = 1.8 bps`, implying a quoted spread of 3.6 bps. In heavily traded instruments the realised spread is often much tighter, pinned at one tick, which tells you the tick is binding and makers are competing on queue position instead of on price.

---

#### Worked Example: Walking a Book

<table>
  <tbody>
    <tr><td><strong>Side</strong></td><td><strong>Price</strong></td><td><strong>Size</strong></td><td><strong>Cumulative</strong></td></tr>
    <tr><td>Ask</td><td>100.09</td><td>3,000</td><td>5,800</td></tr>
    <tr><td>Ask</td><td>100.05</td><td>1,500</td><td>2,800</td></tr>
    <tr><td>Ask</td><td>100.03</td><td>800</td><td>1,300</td></tr>
    <tr><td>Ask</td><td>100.02</td><td>500</td><td>500</td></tr>
    <tr><td>Bid</td><td>100.01</td><td>900</td><td>900</td></tr>
    <tr><td>Bid</td><td>100.00</td><td>2,200</td><td>3,100</td></tr>
    <tr><td>Bid</td><td>99.98</td><td>1,400</td><td>4,500</td></tr>
  </tbody>
</table>

The quoted spread is one tick, `100.02 - 100.01 = 0.01`, and the mid is `100.015`. A market buy for 2,000 units executes as follows:

1. **500 at 100.02** costs `50,010`
2. **800 at 100.03** costs `80,024`
3. **700 at 100.05** costs `70,035`
4. **Total**: `200,069` for 2,000 units, so `VWAP_exec = 100.0345`
5. **Slippage versus mid**: `10000 * (100.0345 - 100.015) / 100.015 = 1.95 bps`

About a quarter of that 1.95 bps is the half-spread of 0.50 bps that you always pay to cross; the rest is the price impact of consuming three levels. Taking the whole displayed ask side — all 5,800 units — would cost `580,379`, a VWAP of `100.0653` and slippage of `5.03 bps`.

---

#### The Constant-Function Model

An automated market maker replaces the queue with an invariant. In the **constant product** design, a pool holding `x` units of the base asset and `y` of the quote asset maintains:

```text
x * y = k
```

The marginal (spot) price is `y / x`. To buy `dx` units of the base asset, the trader must supply enough quote to restore the invariant:

```text
dy        = y * dx / (x - dx)
avg_price = dy / dx = P_0 * x / (x - dx)
slippage  = u / (1 - u)          where u = dx / x
```

and inverting the last expression gives the size tradeable within a slippage budget `s`:

```text
dx = x * s / (1 + s)
```

Three things follow immediately. The pool quotes at every price from zero to infinity, so it never runs out of quotes, only out of sensible ones. Slippage depends only on the fraction of the reserve consumed, not on the absolute size of the trade. And there is no spread in the order-book sense: the fee is a separate, explicit charge added on top, and it is the only compensation liquidity providers receive for adverse selection. See [AMMs 101](/building-blocks/amms-101).

---

#### Worked Example: The Same Trade Through a Pool

Take a pool with `x = 400,000` base units and `y = 40,000,000` quote units, so the spot price is `40,000,000 / 400,000 = 100` — the same as the book above. The fee is 30 bps on the input.

1. **Quote required, ignoring fees**: `dy = 40,000,000 * 2,000 / 398,000 = 201,005.03`
2. **Average price before fees**: `201,005.03 / 2,000 = 100.5025`, so slippage is `50.25 bps`
3. **Cross-check with the formula**: `u = 2,000 / 400,000 = 0.005`, and `0.005 / 0.995 = 0.005025` — the same 50.25 bps
4. **With the 30 bps fee**: the trader pays `201,005.03 / 0.997 = 201,609.86`, an average price of `100.8049`
5. **All-in cost versus spot**: `80.49 bps`

Comparing 80 bps against the book's 1.95 bps looks damning, but the comparison is about depth, not mechanism. A like-for-like measurement makes that explicit:

<table>
  <tbody>
    <tr><td><strong>Slippage budget</strong></td><td><strong>Book capacity</strong></td><td><strong>Pool capacity</strong></td></tr>
    <tr><td>1.5 bps</td><td>1,300 units (130,000)</td><td>60 units (6,000)</td></tr>
    <tr><td>10 bps</td><td>&mdash;</td><td>400 units (40,000)</td></tr>
    <tr><td>5.03 bps</td><td>5,800 units (580,000)</td><td>&mdash;</td></tr>
  </tbody>
</table>

The book in this example is simply deeper near the mid. A deep stablecoin pool with a flattened invariant will beat a thin order book on the same measure, and frequently does. The mechanism sets the *shape* of the cost curve; the capital sets its *level*.

> info **Compare depth, not architecture** The only honest comparison between venues is cost in basis points for the size you actually intend to trade, at the time you intend to trade it. Everything else is a description of plumbing.

---

#### Where They Genuinely Differ

<table>
  <tbody>
    <tr><td><strong>Dimension</strong></td><td><strong>Limit order book</strong></td><td><strong>Constant-function AMM</strong></td></tr>
    <tr><td>Quote origin</td><td>Discretionary, per order</td><td>Deterministic, from reserves</td></tr>
    <tr><td>Priority</td><td>Price-time or pro-rata queue</td><td>None; transaction ordering decides</td></tr>
    <tr><td>Reaction to news</td><td>Makers cancel and requote</td><td>Curve cannot move; arbitrage moves it</td></tr>
    <tr><td>Provider compensation</td><td>Spread, plus any maker rebate</td><td>Explicit swap fee only</td></tr>
    <tr><td>Provider loss channel</td><td>Picked off before requoting</td><td>Arbitraged along the curve</td></tr>
    <tr><td>Depth in stress</td><td>Can vanish entirely</td><td>Persists, at worsening prices</td></tr>
    <tr><td>Capital efficiency</td><td>High; quotes need not be prefunded</td><td>Low unless liquidity is concentrated</td></tr>
  </tbody>
</table>

The deepest difference is the right to cancel. An order-book maker who sees news can pull quotes in microseconds; a pool cannot, so its inventory is realigned by arbitrageurs, and the profit they take is the pool's loss. That loss is structural rather than accidental — providers systematically sell into rallies and buy into declines. See [Impermanent Loss](/building-blocks/impermanent-loss) and [Concentrated Liquidity](/protocols/concentrated-liquidity), which recovers much of the capital efficiency by confining liquidity to a price range at the cost of requiring active management.

---

#### In Practice Across Venue Types

**Equities.** Fragmented across many order books plus off-exchange venues, tied together by a consolidated best quote and a routing obligation. Tick sizes bind in liquid names, so competition happens in the queue.

**Futures.** A single dominant book per contract, often with pro-rata or a mixed allocation rule in short-dated interest rate contracts. Depth is concentrated at the front month; calendar spreads trade as their own instruments. See [Futures 101](/markets/futures-101).

**Foreign exchange.** No central book. Liquidity is distributed across bank platforms and electronic communication networks, with "last look" allowing a provider to reject a trade after seeing it — an explicit optionality that does not exist in a firm book.

**Listed options.** Thousands of strike-expiry combinations, most quoted by a handful of makers with wide spreads. Displayed depth is thin and quotes are largely derived from a model rather than from order flow. See [Vol Surface](/derivatives/vol-surface).

**On-chain.** Constant-function pools dominate spot, with order books more common in perpetual futures venues. Ordering within a block is contested rather than time-prioritised, which replaces the latency race with a fee auction. See [Gas & Mempool](/microstructure/gas-mempool) and [On-Chain vs Off-Chain](/microstructure/onchain-offchain).

---

#### Assumptions and Failure Modes

- **Displayed depth is assumed real.** Iceberg orders understate it; orders that will be cancelled the moment you take them overstate it. Depth measured from a snapshot is not depth available to your order.
- **The book is assumed static during execution.** It is not. Consuming levels signals your intent, and remaining liquidity moves away. Impact estimated from a snapshot understates realised cost for anything but small orders. See [Market Impact](/execution/market-impact).
- **Adverse selection is assumed symmetric across the queue.** It is not: back-of-queue fills are more informed than front-of-queue fills, so a naive spread-capture estimate flatters slow makers.
- **The AMM invariant is assumed to hold across the trade.** It does within a single swap, but reserves change between blocks, and the price you simulated is not the price you will get if another trade lands first.
- **Pool depth is assumed stable.** Liquidity providers can withdraw, and concentrated positions can fall out of range entirely, so a pool that quoted tightly yesterday may not today.
- **Fees are assumed to compensate providers.** Whether fee income exceeds arbitrage losses is an empirical question that varies by pair, fee tier and volatility regime, and it is frequently answered in the negative.
- **The two models are assumed to be alternatives.** Hybrids are now common: off-chain books with on-chain settlement, pools with limit-order-like ticks, and batch auctions layered above pools. Reasoning about the pure forms is a starting point, not a classification of real venues.

> warning **Educational content only** This page explains market mechanics. It is not advice about where or how to trade, and no venue type is presented as superior.

---

#### Code

```python
def walk_book(levels, quantity):
    """Execute a market order against (price, size) levels, best first.

    Returns the size-weighted average price and any unfilled remainder.
    """
    remaining, cost, filled = quantity, 0.0, 0.0
    for price, size in levels:
        take = min(remaining, size)
        cost += take * price
        filled += take
        remaining -= take
        if remaining == 0:
            break
    return {"vwap": cost / filled if filled else None, "unfilled": remaining}


def cpmm_quote(base_reserve, quote_reserve, base_out, fee_rate=0.003):
    """Quote required to remove `base_out` from a constant-product pool.

    The fee is charged on the input, so it is divided out, not added.
    """
    quote_in = quote_reserve * base_out / (base_reserve - base_out) / (1 - fee_rate)
    spot = quote_reserve / base_reserve
    avg_price = quote_in / base_out
    return {"quote_in": quote_in, "slippage_bps": 10_000 * (avg_price - spot) / spot}
```

---

#### See Also

* [Slippage](/microstructure/slippage)
* [Fees & Routing](/microstructure/fees-routing)
* [Latency Risk](/microstructure/latency-risk)
* [Adverse Selection](/execution/adverse-selection)
* [Order Types](/execution/order-types)
* [Liquidity Pools](/building-blocks/liquidity-pools)

---

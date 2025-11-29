### Orderbooks vs AMMs

> info **Metadata** Level: Intermediate | Prerequisites: Liquidity Pools, AMMs 101, Returns | Tags: microstructure, orderbook, amm, liquidity, execution, routing

Orderbooks and automated market makers are two different ways to organise trading and liquidity. Orderbooks arrange standing buy and sell orders at various prices, forming a visible ladder of demand and supply. AMMs pool liquidity in smart contracts governed by pricing curves, where price emerges from an invariant and current reserves rather than from explicit quotes.

Both structures answer the same question: at what price can a given size of trade clear, and what happens to liquidity after that trade? They differ in how they represent liquidity, how prices adjust, who chooses quotes, and where risk and edge accumulate. These differences shape slippage, MEV surfaces, and the way DeFi protocols plug into broader markets.

---

#### Two models of liquidity

An orderbook shows liquidity as a set of discrete orders. On one side sit bids, each with a limit price and size. On the other side sit asks. The best bid and best ask define the tightest spread, and the depth at each price level builds a staircase of liquidity outwards from the mid. Liquidity is granular: each order has an owner, a size, and a specific price.

An AMM shows liquidity through reserves of two or more assets locked in a pool. The pool obeys a pricing rule. In a constant product design, the product of reserves stays roughly constant as trades move the price. Stableswap and other hybrid curves bend that relationship to produce flatter regions around a target price. Instead of a ladder of discrete orders, the pool behaves like a smooth curve of marginal prices as reserves change.

Both systems can support similar notional depth, but they expose it differently. In an orderbook, depth depends on how many traders are willing to quote at each price. In an AMM, depth depends on how much capital LPs stake and on the curvature of the pricing rule.

---

#### How trades consume liquidity

In an orderbook, a market order walks the book. A market buy matches against the best ask until its size is filled, possibly consuming multiple price levels. The realised execution price is the size weighted average of all matched orders. After the trade, the top of book moves to the next remaining orders, and the spread may widen or narrow depending on refill behaviour.

In an AMM, a trade pushes the pool along its curve. A swap reduces reserves of the asset being bought and increases reserves of the asset being sold. The pricing rule translates this new reserve point into a new marginal price. Execution price is not taken from a list of discrete orders but from the integral along the curve segment traversed by the trade.

Slippage looks different in each picture but reflects the same underlying idea. In an orderbook, slippage appears when a trade size is large relative to depth near the mid. In an AMM, slippage appears when a trade moves reserves far enough along the curve that marginal price changes significantly. Depth, curvature, and trade size jointly determine the gap between reference price and realised average price.

---

#### Who sets prices and carries inventory

Orderbooks concentrate control with active makers. Each price level exists because some participant chose to post an order there. Makers decide spreads, sizes, and how quickly to update quotes when conditions change. Their PnL comes from capturing spread and, if they manage inventory well, from favourable positioning relative to price moves.

AMMs spread control across LPs. LPs decide how much capital to supply and, in concentrated designs, over which price ranges to allocate it. The actual quoting behaviour is encoded in the AMM formula and fee parameters, not in per order decisions. Inventory risk is shared across LPs and driven mechanically by the curve’s rebalancing effect when trades flow through the pool.

This difference shows up in response to volatility. In an orderbook, makers may widen spreads, pull quotes, or reduce size, making the book thin and fragile. In an AMM, the curve continues to quote everywhere along its domain as long as reserves remain positive. Depth may become economically thin as prices move into poorly funded ranges, but quotes do not disappear entirely without explicit LP withdrawals.

---

#### Information, latency, and adverse selection

In orderbooks, information and latency matter at the level of individual orders. Makers with fast market data and low latency infrastructure can adjust quotes quickly in response to news or large orders. Slower makers are more likely to be picked off when the market is about to move; their stale quotes become cheap optionality for informed takers.

AMMs encode quotes in a deterministic function of reserves. There is no concept of a “stale” quote in the same sense. Adverse selection appears through flows rather than through explicit quote updates. When prices move elsewhere, arbitrageurs trade against the pool to realign it, and the pool’s inventory shifts. LPs effectively sell into up moves and buy into down moves, accumulating impermanent loss unless fees and other rewards compensate.

Latency still matters around AMMs, but in a different way. Arbitrageurs race to be first to realign pools, and liquidators race to be first to trigger liquidations based on off chain moves or oracle updates. The pool itself does not update quotes in response to information; the rest of the system pushes it back toward fair values through order flow.

---

#### Fragmentation, routing, and composability

Orderbooks fragment across venues. The same asset can trade on multiple centralised and decentralised orderbooks, each with its own depth, fees, and latency characteristics. Cross venue routing engines and smart order routers attempt to recombine this fragmentation by splitting orders and arbitraging price differences, but inventory and information can remain unevenly distributed.

AMMs fragment liquidity across pools and fee tiers rather than across discrete books. Different pools may quote the same pair with different invariants or different fee levels. Routing logic in DEX aggregators must decide how to split a trade across many pools and intermediates. Because AMMs are smart contracts, routing paths can be composed with other DeFi primitives inside a single transaction, but at the cost of additional gas and exposure to MEV.

Protocol level composability is generally easier with AMMs than with orderbooks. A contract can interact with a pool as if it were a single counterparty: call a swap function, receive tokens, and proceed. Integrating deeply with an orderbook often requires more complex logic for posting and cancelling orders, managing queue position, and handling partial fills.

---

#### Price discovery and reference prices

Orderbooks often act as primary venues for price discovery, especially when they are deep and active. The top of book and recent trades reflect the current balance of supply and demand among informed and uninformed participants. Other venues, including AMMs, frequently track these prices via arbitrage.

AMMs can participate in price discovery, particularly in markets where orderbooks are thin or absent, but they are more often shaped by external prices. Arbitrageurs use discrepancies between AMM prices and off chain or other on chain venues as a source of profit and as a mechanism to transmit information into the pool. The AMM’s curve affects how quickly and smoothly that information is incorporated.

For protocols that rely on prices, the distinction matters. Oracles that draw from AMMs inherit their curve shaped microstructure and susceptibility to targeted trades. Oracles that draw from orderbooks inherit sensitivities to spoofing, thin depth, and off chain matching behaviour.

---

#### Consequences for design and risk

Choosing an orderbook or AMM structure is not just about user interface. It determines where inventory sits, who bears which risks, and how MEV surfaces appear. Orderbooks expose classic microstructure phenomena: queue position, maker taker fee dynamics, and fine grained latency games. AMMs expose curve geometry, impermanent loss, and arbitrage races.

Many modern designs mix elements from both worlds. Hybrid venues have off chain orderbooks with on chain settlement, AMMs that incorporate limit order style orders at specific ticks, or batch auction layers that sit on top of pools. Understanding the pure forms of orderbooks and AMMs makes it easier to reason about these hybrids and to trace how changes in structure will affect traders, LPs, and protocol level risk.

---

#### See Also

* [Slippage](/microstructure/slippage)
* [Fees & Routing](/microstructure/fees-routing)
* [Liquidity Pools](/building-blocks/liquidity-pools)
* [MEV Overview](/building-blocks/mev-overview)

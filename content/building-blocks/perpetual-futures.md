### Perpetual Futures

> info **Metadata** Level: Intermediate | Prerequisites: Trading Foundations, Returns, Volatility | Tags: derivatives, perps, funding, margin, leverage, liquidation

Perpetual futures are derivative contracts that provide leveraged exposure to an underlying asset without expiry. They settle in stablecoins or other reference assets and maintain a loose tether to spot prices through a funding mechanism. In crypto markets, perps are a primary vehicle for directional bets, hedging, and basis trades.

Perps are defined by three main elements: the payoff structure, margin and liquidation rules, and funding rate dynamics. Together, these determine how risk and returns are distributed among participants.

---

#### Contract Structure and Payoff

A perp position is specified by a notional size and direction. Gains and losses track changes in an index price for the underlying. Unlike traditional futures, there is no fixed delivery date; positions can be held indefinitely as long as margin requirements are met.

Marking to market occurs continuously or at discrete intervals. Unrealised PnL is credited or debited against margin, which can be withdrawn or added subject to constraints. This mechanism concentrates risk in the margin account and makes leverage highly path-dependent.

---

#### Margin, Leverage, and Liquidation

Perps allow positions with leverage far above spot holdings. Margin requirements specify minimum equity relative to notional exposure. Initial margin is required to open a position; maintenance margin defines the boundary for liquidation.

As prices move, the margin ratio evolves. When it falls below the maintenance threshold, the system initiates liquidation, closing part or all of the position. The details depend on the exchange design: some use partial liquidations with increasing penalties, others rely on full closures and socialised losses if markets move too fast.

---

#### Funding Rates and Basis

Funding is a periodic payment between longs and shorts that depends on the difference between perp price and an index price. When the perp trades at a premium, longs typically pay shorts; when it trades at a discount, shorts pay longs. Over time, funding encourages the perp price to remain near the index.

The interaction between funding rates and basis creates a space for basis trades and carry strategies. For example, a market participant might hold a long spot position and a short perp to capture positive funding. Conversely, speculative demand can drive perp prices away from spot, leading to periods of elevated funding and potential instability.

---

#### Use Cases and Risks

Perps serve several functions:

- Leveraged directional exposure without dealing with spot custody.  
- Hedging for miners, treasuries, and LPs who hold spot risk elsewhere.  
- Relative value trades across venues or between perps and spot.  

Risks include liquidation risk under volatile conditions, funding cost risk when basis remains elevated for long periods, and venue risk related to oracle design, order-book quality, and governance.

---

#### See Also

* [Perp DEX](/protocols/perp-dex) – Architecture of decentralised perp exchanges  
* [Trading Foundations](/advanced-topics/trading-foundations) – Broader context for perps in trading systems  
* [Liquidations](/building-blocks/liquidations) – How distressed perp positions are closed  
* [Derivatives](/building-blocks/derivatives) – Other derivative instruments in DeFi

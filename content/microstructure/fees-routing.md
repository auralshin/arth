### Fees & Routing

> info **Metadata** Level: Intermediate | Prerequisites: AMMs 101, Slippage | Tags: fees, routing, aggregators, execution, liquidity

Fees and routing determine how much a trade costs beyond pure price impact. Protocols charge explicit fees on swaps or trades, which are often split between LPs, protocol treasuries, and affiliates. Networks also charge gas fees for transaction execution. Routing refers to the path an order takes across pools and venues to obtain an outcome.

In AMMs, each swap applies a fixed or tiered fee on the input or output amount. These fees accumulate in the pool and are paid to LPs in proportion to their share, sometimes with a fraction diverted to protocol governance. Variable fee models adjust fee levels in response to volatility or imbalances, aiming to better compensate LPs and absorb shocks.

On orderbook based DEXs, explicit trading fees are charged per execution and may differ by maker and taker. Maker rebates and taker fees shape incentives to provide or consume liquidity, and they influence where tight spreads emerge.

Routing engines and aggregators observe prices and liquidity across multiple pools and books and construct multi hop paths for trades. A route might split a large swap into smaller pieces across several pools to reduce slippage, or it might use intermediate tokens to pass through deeper liquidity. The trade off is additional gas cost from extra calls and approvals.

For users and strategies, effective cost is a combination of explicit fees, implicit slippage, gas, and possible MEV effects such as sandwiching. Protocol and product design often focuses on shifting some of this cost structure: internalising arbitrage to benefit LPs, rebating gas, or co locating routing logic with LP incentives.

---

#### See Also

* [Slippage](/microstructure/slippage)
* [Gas & Mempool](/microstructure/gas-mempool)
* [MEV Overview](/building-blocks/mev-overview)

---

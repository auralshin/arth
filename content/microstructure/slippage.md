### Slippage

> info **Metadata** Level: All | Prerequisites: AMMs 101, Orderbooks vs AMMs | Tags: slippage, execution, price-impact, liquidity

Slippage is the difference between the expected price of a trade and the actual average price obtained after execution. It reflects the fact that orders consume liquidity along a curve or across orderbook levels, changing the price as they execute. Even in the absence of explicit fees, slippage is an implicit cost of trading.

In AMMs, slippage arises directly from the pricing curve and the size of the trade relative to pool depth. A small swap in a deep pool produces minimal movement; a large swap in a shallow pool pushes the state far along the curve, causing a large difference between pre trade and post trade prices. The curve geometry encodes how quickly marginal price changes as reserves move.

In orderbooks, slippage depends on the distribution of limit orders across price levels. A market order first fills against the best price and then continues to worse prices until its size is fully matched. The weighted average execution price depends on how deep the book is at each level. Thin books produce substantial slippage even for moderate orders.

Slippage is path dependent and time dependent. The same notional size can incur different slippage at different times depending on liquidity conditions, competing flow, and MEV activity. Aggregators that split orders across venues attempt to minimise slippage by searching for the cheapest mix across pools and books, but the underlying liquidity still sets a hard limit.

From a portfolio perspective, slippage reduces effective returns and can cumulatively outweigh visible protocol fees, especially for high turnover strategies.

---

#### See Also

* [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms)
* [Fees & Routing](/microstructure/fees-routing)
* [MEV Overview](/building-blocks/mev-overview)

---

### Swaps & DEXs

> info **Metadata** Level: All | Prerequisites: AMMs 101 | Tags: dex, routing, aggregation, execution, slippage

Decentralised exchanges (DEXs) enable on-chain trading without centralised custody or order matching. Most DEXs are built around AMM pools or hybrid models that combine pool-based pricing with limit orders. A swap is the atomic exchange of one asset for another, executed by interacting with one or more pools. From a user's perspective, a swap should deliver the desired asset at the best available price with minimal slippage and gas cost; from the protocol's perspective, a swap is a state transition that moves reserves and collects fees.

This page covers swap mechanics, routing strategies, aggregation layers, and how execution quality is measured and optimised.

---

#### Atomic Swaps and Execution Flow

An on-chain swap is a transaction that transfers assets into a pool (or set of pools) and receives assets out, subject to the invariant constraints. The user specifies either an exact input amount (how much to sell) or an exact output amount (how much to buy), and the protocol calculates the corresponding output or input required.

Under exact-input swaps, slippage manifests as receiving less of the output asset than the quoted price suggested. Under exact-output swaps, slippage means paying more of the input asset. Most interfaces allow users to set a slippage tolerance: the transaction reverts if the execution price deviates beyond this threshold.

Execution is atomic: either the entire swap succeeds or it reverts, leaving no partial state. This atomicity is essential for composability; a swap can be one step in a larger transaction that also deposits into a vault, repays a loan, or mints a derivative.

---

#### Routing: Single-Hop vs Multi-Hop

Not all token pairs have direct pools. Routing refers to the process of finding a path through multiple pools to complete a swap. For instance, swapping token A for token C might route through an intermediate token B if no A–C pool exists or if the A–B and B–C pools offer better combined execution than a direct A–C pool.

Single-hop routing is straightforward: the swap uses one pool. Multi-hop routing requires splitting the input, executing swaps in sequence, and aggregating the output. Each hop incurs gas costs and slippage, so the optimal path balances directness against depth and fees.

Graph-search algorithms (Dijkstra, Bellman–Ford) adapted for weighted edges (where weights represent price impact and fees) are used to find optimal routes. In practice, routers pre-compute common paths and use heuristics to avoid expensive searches on every transaction.

---

#### Aggregation and Split Routes

DEX aggregators query multiple protocols (Uniswap, SushiSwap, Curve, Balancer, etc.) and compute the best route across all available liquidity. They may split a large trade into smaller pieces routed through different pools to minimise total slippage.

For example, swapping 1000 ETH for DAI might be split: 400 ETH through Uniswap v3, 300 through Curve, and 300 through Balancer, each chosen to minimise the price impact on that portion. The aggregator computes these splits by solving an optimisation problem that accounts for slippage curves, gas costs, and pool depths.

Aggregation layers add a transaction overhead (calling multiple pools in one transaction increases gas usage) but can significantly improve execution quality for large trades. The trade-off depends on trade size, gas price, and the fragmentation of liquidity across venues.

---

#### Slippage, Price Impact, and MEV

Slippage is the deviation between the expected price (based on current pool state) and the realised execution price (after the trade). Price impact is the component of slippage caused by the trade itself moving the pool's reserves. Additional slippage can arise from other transactions executing before yours (front-running) or from stale price quotes.

MEV (maximal extractable value) enters through transaction ordering. A sandwich attack involves a searcher placing a buy order before your trade (pushing the price up) and a sell order after (profiting from the temporary price spike you caused). This extracts value from the user and redistributs it to the searcher and block proposer.

Mitigation strategies include:
- Using private mempools or MEV-protection services that prevent front-running
- Setting tight slippage tolerances (though this increases revert risk)
- Batching trades with others to reduce per-trade impact
- Using protocols designed to resist MEV, such as batch auctions or encrypted mempools

From a research perspective, understanding MEV dynamics informs protocol design (fee structures, order types, settlement mechanisms) and user behaviour (when and how to trade, what slippage bounds to set).

---

#### Limit Orders, Hooks, and Hybrid Models

Pure AMM pools offer continuous liquidity but no ability to specify exact prices. Hybrid DEXs add limit-order functionality: users can place orders that execute only when the price reaches a specified level. These orders sit off-curve until triggered, at which point they inject or withdraw liquidity.

Uniswap v4 introduces hooks: customisable logic that runs before or after swaps, allowing for dynamic fees, custom order types, or integration with external systems. This blurs the line between AMMs and order-book exchanges, enabling more sophisticated execution strategies while retaining the composability and transparency of on-chain settlement.

From a user perspective, hybrid models offer better execution for certain strategies (e.g., buying the dip, selling a rally) without requiring continuous liquidity provision. From an LP perspective, they introduce new risk and return dynamics that depend on how limit orders interact with pool reserves.

---

#### See Also

* [AMMs 101](/building-blocks/amms-101) – Invariant-based pricing and slippage
* [Liquidity Pools](/building-blocks/liquidity-pools) – Reserve dynamics and LP exposure
* [Orderbooks vs AMMs](/building-blocks/orderbooks-vs-amms) – Comparing exchange architectures
* [Gas & Mempool](/building-blocks/gas-mempool) – Transaction costs and ordering
* [Transaction Ordering & MEV](/building-blocks/transaction-ordering-mev) – Front-running, sandwiching, and mitigation

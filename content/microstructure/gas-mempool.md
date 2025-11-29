### Gas & Mempool

> info **Metadata** Level: Intermediate | Prerequisites: What Is DeFi, Execution Environments | Tags: gas, mempool, fees, ordering, microstructure

Gas is the metering system for computation and storage on a chain. Every transaction specifies an upper bound on gas consumption and a fee rate that it is willing to pay. Block producers select transactions and pack them into blocks, aiming to maximise fee revenue subject to gas limits and protocol rules.

The mempool is the staging area for pending transactions. When a user broadcasts a transaction, it enters the mempool of nodes, where it competes with other transactions. The state of the mempool at a given moment is a snapshot of intent: swaps waiting to execute, liquidations queued up, arbitrage bundles, and position adjustments.

Gas fees and mempool structure determine who gets executed first, which trades are dropped during congestion, and how MEV searchers respond to opportunities. Transactions with higher effective fees are more likely to be included earlier, but sophisticated arrangements between searchers, builders, and validators can override simple bidding rules.

During quiet periods, the mempool may be thin and gas fees low, giving most transactions similar inclusion times. During volatile episodes, the mempool can become congested, with surging gas prices, long delays for low fee transactions, and intense competition among arbitrage and liquidation flows. The resulting execution uncertainty and cost materially affect strategy performance.

From a microstructure viewpoint, gas and the mempool are part of the market. They shape what is feasible in real time, which strategies remain viable, and how value is split between end users and block level actors.

---

#### See Also

* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [MEV Overview](/building-blocks/mev-overview)
* [Latency Risk](/microstructure/latency-risk)

---

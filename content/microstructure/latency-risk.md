### Latency Risk

> info **Metadata** Level: Advanced | Prerequisites: Gas & Mempool, On-Chain vs Off-Chain | Tags: latency, microstructure, risk, execution

Latency risk arises from delays between decision, transmission, and execution. In trading systems, prices and orderbooks evolve continuously, while information and orders travel with finite speed. A strategy may decide based on outdated information by the time a transaction reaches the execution engine.

On chain, latency includes wallet signing time, network propagation, mempool queuing, and the time to inclusion in a block. Off chain, it includes infrastructure, routing between data centres, and internal matching delays. Relative latency matters as much as absolute latency: advantage lies with participants who can react and adjust faster.

Latency risk manifests as adverse selection. Quotes and liquidity provided by slower participants are more likely to be hit when prices are about to move against them. Market orders submitted with stale information are more likely to fill at unfavourable prices or be sandwiched by faster agents.

In DeFi, latency risk is tightly coupled with MEV. Searchers and builders with low latency access to mempools, private order flow, or oracle feeds can position themselves ahead of slower actors. Protocol designs that rely on precise timing, such as narrowly defined liquidation windows or single block arbitrage assumptions, are particularly sensitive to these dynamics.

Mitigation can involve batching, randomisation of ordering within windows, or cryptographic techniques that hide transaction contents until ordering is fixed. Each approach trades off expressiveness and responsiveness against fairness and robustness.

---

#### See Also

* [Gas & Mempool](/microstructure/gas-mempool)
* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms)

---

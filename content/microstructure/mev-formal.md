### MEV Formally

> info **Metadata** Level: Advanced | Prerequisites: Gas & Mempool, Orderbooks vs AMMs | Tags: mev, optimisation, microstructure, auctions

MEV Formally looks at maximal extractable value as an optimisation problem. Given a set of pending and potential transactions and control over ordering, inclusion, and censorship, a block builder faces a choice of which sequence yields the greatest value according to some objective, often fee revenue plus direct trading profits.

This perspective treats a block as a combinatorial object. Each transaction changes state and affects the profitability of including others. Some combinations unlock arbitrage or liquidations; others conflict or fail. The builder searches over bundles and permutations to identify sequences that extract value from price discrepancies, liquidity conditions, and protocol rules.

Formulating MEV in this way clarifies what counts as MEV. The key element is privileged influence over ordering or inclusion. Arbitrage performed by ordinary users without special ordering control is simply trading. The same arbitrage performed by a block builder who can reorder competing trades to capture profit becomes MEV.

The optimisation lens also highlights trade offs between private and social value. Some forms of MEV align incentives and support healthy markets, such as closing mispricings and executing liquidations that keep protocols solvent. Others primarily transfer value from ordinary users to sophisticated actors, as in aggressive sandwiches or latency games around oracle updates.

---

#### See Also

* [MEV Overview](/building-blocks/mev-overview)
* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [Statistical Modeling](/transaction-ordering-mev/statistical-modeling)

---

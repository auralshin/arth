### MEV Overview

> info **Metadata** Level: Advanced | Prerequisites: Gas & Mempool, Orderbooks vs AMMs, Trading Foundations | Tags: mev, microstructure, ordering, blockchain, auctions, risk

Miner/Maximal Extractable Value (MEV) refers to the additional value that block producers or those who can influence block contents can capture by reordering, inserting, or censoring transactions. In modern proof-of-stake systems this role is often split across searchers, builders, and validators, but the underlying concept is the same: control over ordering has economic value.

MEV arises from the interaction between user transactions and protocol rules. Arbitrage, liquidations, sandwiching, and back-running are familiar examples. These behaviours affect traders, LPs, and protocols, and they shape how DEXs and lending markets behave at the microstructural level.

---

#### Sources of MEV

Common MEV sources include:

* Arbitrage between pools and exchanges when prices diverge.
* Liquidations in lending and derivatives protocols when positions cross thresholds.
* Sandwich attacks on large or predictable trades in AMMs.
* Priority access to oracle updates or price-dependent state changes.

Some forms of MEV are socially beneficial, such as arbitrage that keeps prices aligned. Others degrade user outcomes, such as sandwiches that worsen execution prices.

---

#### Searchers, Builders, and Validators

MEV extraction is usually a multi-actor process. Searchers scan the mempool and state for opportunities and bundle transactions that realise them. Builders assemble these bundles into candidate blocks, sometimes running auctions where searchers bid for inclusion. Validators or proposers then select blocks based on bids and protocol rules.

This pipeline formalises MEV into a market. Revenue from MEV flows upstream to validators and, indirectly, to stakers. The structure of this market influences who captures value and how much of it is observable.

---

#### Impact on DeFi Protocols

For DeFi protocols, MEV is both a constraint and a design parameter. AMMs that ignore MEV can see a significant fraction of value extracted by external actors. Lending protocols rely on liquidations that often involve MEV competition. Oracle and price-feed designs must account for the possibility that on-chain prices and updates are influenced by MEV-aware behaviour.

Protocol designers sometimes internalise MEV by routing arbitrage or liquidation flows through mechanisms that share value with LPs or the protocol treasury. Others focus on protection: batch auctions, off-chain matching with fair ordering, or techniques that hide transaction details until after ordering is fixed.

---

#### See Also

* [Transaction Ordering & MEV](/transaction-ordering-mev) – Detailed taxonomy and mitigation ideas
* [Gas & Mempool](/microstructure/gas-mempool) – Where MEV opportunities originate technically
* [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms) – Structural differences in MEV exposure
* [Lending Architecture](/protocols/lending-architecture) – Liquidation flows as MEV

### Bridges & Cross-Chain

> info **Metadata** Level: Advanced | Prerequisites: Bridges (Primitives), Oracles, Stablecoins | Tags: bridges, cross-chain, fragmentation, liquidity, systemic-risk

Bridges & Cross-Chain looks at how bridge primitives combine into larger cross-chain systems. Rather than focusing only on mechanism, it treats bridges as part of a network of chains, applications, and assets that share risk and liquidity.

A cross-chain application might live on several chains, each with its own execution environment and state. Bridges coordinate action across these domains: moving collateral, synchronising governance decisions, or forwarding user intents. This coordination introduces additional complexity and forms new channels for contagion.

---

#### Fragmentation and Liquidity

When assets are bridged to many chains, liquidity fragments. Multiple representations of the same underlying asset can exist in parallel, each with its own bridge risk and liquidity profile. Pricing across these representations reflects both underlying value and trust in the bridges that created them.

Swap and aggregation protocols attempt to smooth over this fragmentation, but in stress conditions premiums and discounts can widen sharply between representations. Cross-chain arbitrage then depends on both trading venues and bridge capacity, including withdrawal queues and safety limits.

---

#### Dependency Graphs and Contagion

Cross-chain architectures create dependency graphs. A stablecoin might hold collateral on several chains, some of which are bridged assets; a lending protocol on one chain might accept bridged collateral from another; a perp exchange might support contracts margined in multiple representations of the same token.

When a bridge is compromised or fails, all dependent systems inherit some of that failure. Loss of trust in a bridge can render its wrapped assets effectively illiquid, even if underlying reserves still exist. Analysing these graphs involves tracing which protocols accept which assets and how they mark them to market.

---

#### Cross-Chain Governance and Control

Governance decisions can be made on one chain and executed on others through messaging bridges. This allows a DAO to manage multi-chain deployments centrally, but it also introduces cross-domain attack surfaces. If either the governance mechanism or the bridge is compromised, parameters across many chains can be altered.

Designs may use multiple bridges, quorum rules, or layered approvals to reduce this risk, at the cost of additional complexity and latency.

---

#### See Also

* [Bridges (Primitives)](/building-blocks/bridges) – Underlying mechanisms
* [Stablecoin Designs](/protocols/stablecoin-designs) – Multi-chain collateral and peg considerations
* [Lending Architecture](/protocols/lending-architecture) – Acceptance of bridged collateral
* [Risk Types](/risk/types) – Systemic and contagion risk

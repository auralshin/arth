### MEV Beyond EVMs

> info **Metadata** Level: Advanced | Prerequisites: MEV Overview, Execution Environments | Tags: mev, execution-environments, solana, move, appchains

MEV is not specific to EVM based chains. Any system where an entity controls transaction ordering or inclusion faces similar extraction possibilities. Differences in execution environment, consensus, and runtime architecture change the details but not the basic principle.

High throughput chains with parallel execution, such as Solana style runtimes, change how contention appears. Transactions may touch disjoint accounts and be processed concurrently, but conflicts still exist on popular markets and shared state. Scheduling and account level locking become part of the MEV surface.

Move based systems, app chains, and rollups with customised sequencers all present distinct patterns. In some cases, app specific chains allow protocol designers to integrate MEV aware logic directly into their execution and fee systems. In others, centralised sequencers take on builder like roles, concentrating ordering power and associated risks.

Cross domain MEV appears when opportunities span multiple chains or layers. Arbitrage, liquidations, or oracle updates that depend on relative prices across environments give rise to strategies that combine bridging, messaging, and transaction ordering in multiple places at once.

Studying MEV beyond EVMs emphasises that MEV is a structural phenomenon tied to control over state transitions, not a quirk of any particular virtual machine.

---

#### See Also

* [Execution Environments](/blockchain-execution-environments)
* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [Mitigation & Defenses](/transaction-ordering-mev/mitigation-and-defenses)

---

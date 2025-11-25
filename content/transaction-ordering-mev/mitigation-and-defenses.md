## Mitigation & Protocol Defenses

MEV is a structural feature of public blockchains, but protocol design can redirect value flows or soften
harmful externalities. This section surveys popular mitigation strategies and their trade-offs.

### PBS and private relays

Proposer-Builder Separation (PBS) and MEV-Boost introduce competition among block builders while letting
validators outsource ordering. Private relays reduce mempool leakage yet centralize power and introduce
censorship risks.

### Intent systems and privacy

Intent-centric protocols (CowSwap, Anoma, SUAVE) let users specify desired outcomes instead of raw transactions.
Matchmakers or solvers fulfill intents, aiming to keep bids private until settlement to prevent frontrunning.

### Fair ordering and latency bands

Ideas like Frequent Batch Auctions, time-band approaches, and randomized ordering attempt to reduce harmful MEV
by batching or partially obfuscating arrival times. Implementations must balance fairness with throughput and
user expectations about inclusion latency.

### Redistribution vs elimination

Many mitigations redistribute value rather than remove it. Understanding who captures residual MEV—users,
builders, validators, or governance token holders—helps evaluate whether a mechanism aligns incentives while
preserving security budgets.

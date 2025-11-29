### Oracle Designs

> info **Metadata** Level: Advanced | Prerequisites: Oracles, Lending & Borrowing, Perpetual Futures | Tags: oracles, design, data, aggregation, security, infrastructure

Oracle Designs looks at how oracle systems are constructed. The focus is on patterns for sourcing data, aggregating it, and delivering it on-chain, and on how those choices affect security, latency, and robustness.

At a high level, each design answers a similar set of questions: who can submit data, how submissions are combined, how incorrect data is detected or penalised, and how on-chain consumers interact with the resulting feed.

---

#### Reporter-Based Feeds

In reporter-based designs, a set of whitelisted or permissionless reporters push prices to on-chain contracts. Off-chain agents sign or broadcast values; on-chain logic aggregates them, often by taking a median or similar statistic. Reporters may be incentivised by rewards or fees and can be slashed or removed for malicious behaviour.

Important variables include reporter diversity (geography, infrastructure, incentives), update frequency, and the economic stakes that back honest behaviour. Concentrated or correlated reporters increase systemic risk.

---

#### DEX and TWAP Oracles

Some designs derive prices directly from on-chain markets, such as AMMs or order books. A common pattern is to compute time-weighted or block-weighted average prices over a window. This removes transient spikes and discourages simple one-block manipulation, at the cost of some lag.

The security of these oracles depends on the depth and health of the underlying markets. If a pool is thin or dominated by a few LPs, an attacker can move prices significantly with limited capital, especially if they can recover costs through MEV or other strategies.

---

#### Cross-Chain and Bridge-Based Oracles

When prices or other data must cross chains, bridges or specialised oracle networks relay information. Designs may use light clients that verify consensus from the source chain, or they may rely on threshold signatures from a set of validators.

These systems inherit both oracle and bridge risk. Compromise of the relaying mechanism or the source data can lead to incorrect values on the destination chain. Latency and finality assumptions across chains complicate guarantees.

---

#### Robustness Techniques

Several techniques aim to improve robustness:

* Median-of-medians structures that combine feeds from different oracle providers.
* Bounds and sanity checks that clip or ignore extreme updates.
* Circuit breakers that pause or restrict behaviour when prices move too far, too fast.
* Redundancy through multiple feeds and fallback mechanisms.

These techniques cannot eliminate risk, but they can reduce the probability that a single point of failure causes catastrophic outcomes.

---

#### See Also

* [Oracles](/building-blocks/oracles) – High-level role and context
* [Bridges (Primitives)](/building-blocks/bridges) – Messaging layers used by cross-chain oracles
* [Lending Architecture](/protocols/lending-architecture) – Integration of oracles into risk engines
* [Transaction Ordering & MEV](/transaction-ordering-mev) – How MEV interacts with on-chain price sources

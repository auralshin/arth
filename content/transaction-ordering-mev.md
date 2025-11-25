### Transaction Ordering, MEV & State Layers

This module explains how transactions are ordered and included into blocks, why that ordering creates extractable
value (MEV), and how different execution environments and mitigations change the economics and technical surface.

1. [**How blocks form**](./transaction-ordering-mev/how-blocks-form.md) — Mempool topology, builder/proposer separation, inclusion lists, and latency implications.
2. [**MEV taxonomy & examples**](./transaction-ordering-mev/mev-taxonomy.md) — Arbitrage, sandwiches, liquidations, and advanced frontrunning strategies.
3. [**Mitigation & protocol defenses**](./transaction-ordering-mev/mitigation-and-defenses.md) — PBS, private relays, intent systems, and fairness experiments.
4. [**Quantitative impacts & modeling**](./transaction-ordering-mev/quantitative-impacts.md) — Gas auctions, latency games, slippage math, and welfare analysis.
5. [**MEV beyond EVMs**](./transaction-ordering-mev/mev-beyond-evms.md) — SVM parallelism, Move VM scheduling, and cross-chain extraction.
6. [**Statistical modeling of opportunities**](./transaction-ordering-mev/statistical-modeling.md) — Opportunity frequency, payout distributions, and backtesting pipelines.

**Practical exercises**

- Reconstruct a mempool trace and identify simple arbitrage opportunities.
- Build a simulator that estimates sandwich profitability given a target swap size, AMM parameters, and gas price distribution.
- Measure how much MEV is captured by proposers vs searchers over a sample period and visualize the distribution.

**References and further reading**

- Flashbots documentation and bundles
- MEV-Boost and PBS specification
- Research papers on fairness, MEV quantification, and mitigation strategies

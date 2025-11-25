## MEV Beyond EVMs

Non-EVM chains alter the MEV landscape with different scheduling rules, concurrency models, and fee markets.
Understanding these differences is key when porting strategies across ecosystems.

### Solana's SVM

Solana executes transactions in parallel using account locks. MEV involves designing bundles that minimize
account contention and exploit priority fees. Local fee markets and QUIC networking influence propagation and
ordering.

### Move VM systems

Move-based chains (Aptos, Sui) enforce resource-oriented programming. Deterministic scheduling and explicit
capability proofs limit some MEV vectors but introduce new ones, such as object-centric frontrunning.

### Cross-chain MEV

Bridges and shared sequencers enable atomic arbitrage across layers. Latency, bridge risk, and validator
coordination become critical. Research explores shared mempools, SUAVE-like orchestration, and latency hedging
to capture value safely.

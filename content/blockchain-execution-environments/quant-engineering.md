## Quant Engineering Considerations

Quantitative research pipelines need deterministic execution, reproducible randomness, and reliable data access.
VM design influences how easily teams can simulate strategies and replay historical scenarios.

### Deterministic RNG

On-chain randomness is scarce. Ethereum relies on oracles or VRFs; Solana exposes sysvars like recent block hashes;
Move promotes explicit RNG modules. Backtesting engines must replicate these sources to mirror live behavior.

### State replay and indexing

High-quality datasets underpin quant research. Rollups and Solana require specialized indexers (e.g., Geyser,
Archive nodes). Move chains provide structured event streams that simplify ingestion. Decisions about full nodes
vs third-party APIs affect latency and trust.

### Latency modeling

Execution time, gossip propagation, and block intervals differ widely. Simulation frameworks must encode VM
scheduling rules and networking assumptions to evaluate arbitrage, liquidation, or market-making strategies with
fidelity.

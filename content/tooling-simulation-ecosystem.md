## 🧩 Tooling & Simulation Ecosystem

This module documents the recommended tooling for building deterministic simulations, telemetry, and developer SDKs.

- Rust simulation core (ANK Core): deterministic event buses, tick schedulers, and reproducible random seeds.
- TypeScript SDK & REST API: bindings for running simulations, exposing endpoints for strategy backtests and visualization.
- Data pipelines: streaming price ingestion, funding rate fetchers, on-chain indexers, and CSV backfills for historical runs.
- Visualization and dashboards: time-series charts, P&L waterfalls, and ABM visualizers for agent interactions.
- Integration points: Uniswap-like hooks, Aave-like pool simulators, and adapters for common DeFi primitives.

Practical

- Example architecture: ANK core (Rust) runs simulation workers, a TS API wraps results and serves dashboards; a scheduler replays new data.

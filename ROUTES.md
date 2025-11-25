# Project routes (generated from src/app/app-routing.module.ts and menu)

This file lists the application's route paths as configured in `src/app/app-routing.module.ts`
and the menu shortcuts in `src/app/homepage/menu/menu.component.ts`.

How to use
- Edit this file to propose route changes.
- When you change routes in `app-routing.module.ts`, update this file to keep it in sync.

## Top-level / root
- /
- ** (wildcard) → redirects to /

## Welcome (unchanged)
- /welcome/how-to-navigate
- /welcome/reading-paths
- /welcome/notation-conventions
- /welcome/risk-reality-check
- /welcome/prerequisites
- /welcome/what-is-defi
- /welcome/why-this-matters

---

## Orientation & Start Here
_Onboarding, mental models, and practical setup before you start “doing research”._

- /start-here/day-in-life
- /start-here/tradfi-to-defi
- /start-here/on-chain-meaning
- /start-here/tokens-addresses
- /start-here/use-cases
- /start-here/losing-money
- /start-here/how-to-read
- /start-here/first-tx
- /start-here/safety-checklist
- /start-here/set-up-analytics
- /start-here/set-up-wallet
- /start-here/web3-glossary
- /trading-foundations

---

## DeFi & Protocol Foundations

_Economic and protocol primitives you need before touching math or data._

### 1. Tokens & Representations

- /building-blocks/tokens-101
- /building-blocks/token-standards
- /building-blocks/erc20
- /building-blocks/tokenomics

### 2. Liquidity & Trading

- /building-blocks/liquidity-pools
- /building-blocks/amms-101
- /protocols/amms-depth
- /protocols/concentrated-liquidity
- /building-blocks/swaps-dexs
- /building-blocks/yield-farming

### 3. Money, Credit & Derivatives

- /building-blocks/stablecoins
- /protocols/stablecoin-designs
- /building-blocks/lending-borrowing
- /protocols/lending-architecture
- /building-blocks/liquidations
- /building-blocks/perpetual-futures
- /protocols/perp-dex
- /building-blocks/derivatives

### 4. Infrastructure & Control

- /building-blocks/oracles
- /protocols/oracle-designs
- /building-blocks/bridges
- /protocols/bridges
- /building-blocks/mev-overview
- /building-blocks/governance
- /protocols/staking-restaking

### Removed from this section

- /building-blocks/impermanent-loss (now covered in Liquidity & Trading context)

---

## Quant Math & Portfolio

_All the probability, statistics, and portfolio math you need for DeFi research._

- /quant-math/random-variables
- /quant-math/expectation-variance
- /quant-math/covariance
- /quant-math/lln-clt
- /quant-math/sampling
- /quant-math/returns
- /quant-math/volatility
- /quant-math/autocorrelation
- /quant-math/stationarity
- /quant-math/rolling-windows
- /quant-math/sharpe
- /quant-math/sortino
- /quant-math/drawdown
- /quant-math/var-cvar
- /quant-math/kelly
- /quant-math/optimization
- /quant-math/mean-variance
- /quant-math/position-sizing
- /quant-math/rebalancing
- /quant-math/random-walks
- /quant-math/gbm
- /quant-math/mean-reversion
- /quant-math/jumps

---

## Market Microstructure & MEV

_How on-chain markets actually clear orders, plus MEV and ordering._

- /microstructure/orderbooks-vs-amms
- /microstructure/slippage
- /microstructure/fees-routing
- /microstructure/gas-mempool
- /microstructure/mev-formal
- /microstructure/onchain-offchain
- /microstructure/latency-risk

- /transaction-ordering-mev
- /transaction-ordering-mev/how-blocks-form
- /transaction-ordering-mev/mev-beyond-evms
- /transaction-ordering-mev/mev-taxonomy
- /transaction-ordering-mev/mitigation-and-defenses
- /transaction-ordering-mev/quantitative-impacts
- /transaction-ordering-mev/statistical-modeling

---

## Data & Tooling

_Getting data, cleaning it, and building an analysis environment._

- /data-tooling/data-sources
- /data-tooling/time-series
- /data-tooling/cleaning
- /data-tooling/event-logs
- /data-tooling/pipeline
- /data-tooling/python
- /data-tooling/typescript
- /data-tooling/reproducible
- /data-tooling/dashboards
- /data-tooling/dune-analytics
- /data-tooling/notebooks
- /data-tooling/python-setup
- /data-tooling/rpc-nodes
- /data-tooling/the-graph
- /data-tooling/wallet-analytics
- /tooling-simulation-ecosystem

---

## Simulation & Backtesting

_Translating ideas into code, backtests, and simulation experiments._

- /simulation/why-backtest
- /simulation/event-driven
- /simulation/building-backtester
- /simulation/data-prep
- /simulation/metrics
- /simulation/scenarios
- /simulation/agent-based
- /simulation/orderbook
- /simulation/lp-returns
- /simulation/liquidations
- /simulation/param-sweeps
- /simulation/python
- /simulation/typescript
- /simulation/onchain-data

- /building-simulations
- /building-simulations/agent-based-simulation
- /building-simulations/backtesting-framework
- /building-simulations/data-pipeline-replay
- /building-simulations/event-driven-architecture
- /building-simulations/performance-optimization

---

## Signals

_Indicator-level research: features you might feed into strategies._

- /signals/what-is-signal
- /signals/momentum-vs-mean-reversion
- /signals/moving-averages
- /signals/ma-crossovers
- /signals/rsi
- /signals/macd
- /signals/bollinger
- /signals/atr
- /signals/obv
- /signals/stochastic
- /signals/volume
- /signals/funding-rate
- /signals/open-interest
- /signals/liquidity
- /signals/basis
- /signals/onchain-activity

---

## Strategies

_Systematic strategy design, from simple to structured portfolios._

- /strategies/how-to-read
- /strategies/buy-hold
- /strategies/lp-business
- /strategies/yield-farming
- /strategies/concentrated-lp
- /strategies/delta-hedged-lp
- /strategies/momentum
- /strategies/rsi-strategy
- /strategies/macd-strategy
- /strategies/funding-trends
- /strategies/cash-carry
- /strategies/delta-neutral
- /strategies/pairs
- /strategies/mm-lite
- /strategies/stop-loss
- /strategies/dynamic-sizing
- /strategies/hedging-lp

---

## Risk

_Risk taxonomies and practical risk management around DeFi strategies._

- /risk/types
- /risk/smart-contract
- /risk/oracle-manipulation
- /risk/leverage-liquidation
- /risk/slippage-frontrunning
- /risk/backtest-vs-live
- /risk/operational
- /risk/checklists

---

## Case Studies & Research

_Real incidents and worked examples of strategies and failures._

- /case-studies/rsi-walkthrough
- /case-studies/lp-volatility
- /case-studies/failed-strategy
- /case-studies/oracle-incident
- /case-studies/basis-unwind
- /case-studies/curve-arb
- /case-studies/flash-loan
- /case-studies/funding-rate
- /case-studies/post-mortem
- /case-studies/uniswap-v3-lp

---

## Infrastructure & Execution

_What's under the hood of the chains you're trading on._

- /blockchain-execution-environments
- /blockchain-execution-environments/comparative-benchmarks
- /blockchain-execution-environments/evm
- /blockchain-execution-environments/move-vm
- /blockchain-execution-environments/quant-engineering
- /blockchain-execution-environments/solana-svm
- /advanced-topics

---

## Reference & Indexes

_Cheat-sheets, indices, and quick lookup material._

- /reference/glossary
- /reference/indicators
- /reference/formulas
- /reference/protocols
- /reference/notation
- /reference/code-snippets
- /reference/formula-cheatsheet
- /reference/metric-index
- /reference/protocol-index
- /reference/resources

---

## Contributing & Meta

_How ARTH is maintained and how to extend the library._

- /contributing/style
- /contributing/pipeline
- /contributing/new-page
- /contributing/checklist
- /contributing/roadmap
- /contributing/code-examples
- /contributing/community
- /contributing/content-guidelines
- /contributing/how-to-contribute
- /contributing/notebook-standards
- /contributing/review-process

---

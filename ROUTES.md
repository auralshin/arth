# Project routes (generated from src/app/app-routing.module.ts and menu)

This file lists the application's route paths as configured in `src/app/app-routing.module.ts`
and the sidebar structure in `src/app/homepage/menu/menu.component.ts`.

How to use
- Edit this file to propose route changes.
- When you change routes in `app-routing.module.ts`, update this file to keep it in sync.

## Information architecture

Arth is organised **quant-first**. The general sections (foundations, markets, derivatives, credit,
execution, signals, strategy, portfolio, risk, regimes, data, simulation, ML) are
asset-class-neutral. Everything chain-specific lives in a single **DeFi & On-Chain Markets**
branch, so DeFi reads as one domain within the encyclopedia rather than as its subject.

URLs are intentionally left unchanged from the previous DeFi-first structure — paths like
`/building-blocks/*` and `/quant-math/*` no longer mirror the sidebar. Nav position is the source
of truth for structure; URLs are stable identifiers. Do not "fix" a path to match its section.

Because several sections now share a URL prefix (five different sidebar groups draw from
`/quant-math/*`), `toggleCategory()` in `menu.component.ts` matches paths **exactly**, not by
prefix. Do not change it to prefix matching.

## Top-level / root
- /
- ** (wildcard) → redirects to /

---

## Start Here
_Orientation and reading guidance, before any topic-specific material._

- /welcome/how-to-navigate
- /welcome/reading-paths
- /welcome/prerequisites
- /welcome/notation-conventions
- /start-here/how-to-read
- /welcome/why-this-matters
- /welcome/risk-reality-check

---

## Foundations
_Everything the rest of the encyclopedia assumes: probability, statistics, inference, and the
continuous-time machinery used for pricing._

### Math & Probability

- /quant-math/random-variables
- /quant-math/expectation-variance
- /quant-math/covariance
- /quant-math/lln-clt
- /quant-math/sampling

### Statistics & Time Series

- /quant-math/returns
- /quant-math/volatility
- /quant-math/autocorrelation
- /quant-math/stationarity
- /quant-math/rolling-windows

### Statistical Methods

- /stat-methods/hypothesis-testing
- /stat-methods/confidence-intervals
- /stat-methods/linear-regression
- /stat-methods/regression-diagnostics
- /stat-methods/factor-models
- /stat-methods/pca
- /stat-methods/arima
- /stat-methods/garch
- /stat-methods/unit-roots
- /stat-methods/cointegration
- /stat-methods/multiple-testing
- /stat-methods/backtest-overfitting
- /stat-methods/bootstrap

### Stochastic Processes

- /quant-math/random-walks
- /quant-math/gbm
- /quant-math/mean-reversion
- /quant-math/jumps

### Stochastic Calculus

- /stochastic-calculus/brownian-motion
- /stochastic-calculus/martingales-filtrations
- /stochastic-calculus/ito-lemma
- /stochastic-calculus/sdes
- /stochastic-calculus/numerical-schemes
- /stochastic-calculus/change-of-measure
- /stochastic-calculus/risk-neutral-pricing
- /stochastic-calculus/feynman-kac
- /stochastic-calculus/ornstein-uhlenbeck

---

## Markets & Instruments
_What actually trades: the instruments, their conventions, and who is on the other side._

### Orientation

- /markets/market-participants
- /markets/instrument-map

### Equities

- /markets/equities-101
- /markets/corporate-actions
- /markets/short-selling
- /markets/equity-indices

### Futures & Commodities

- /markets/futures-101
- /markets/roll-and-carry
- /markets/calendar-spreads
- /markets/commodities

### FX

- /markets/fx-101
- /markets/fx-carry-parity

### Fixed Income

- /markets/fixed-income-101
- /markets/yield-curves
- /markets/duration-convexity
- /markets/curve-construction

---

## Derivatives & Options
_Contingent claims: payoffs, replication, pricing models, and the volatility surface._

- /derivatives/options-101
- /derivatives/payoffs-parity
- /derivatives/no-arbitrage-replication
- /derivatives/binomial-trees
- /derivatives/black-scholes
- /derivatives/greeks
- /derivatives/delta-hedging
- /derivatives/implied-volatility
- /derivatives/vol-surface
- /derivatives/vol-term-structure
- /derivatives/exotics
- /derivatives/variance-swaps

---

## Credit
_Default risk as a priced quantity: spreads, structural and reduced-form models, CDS._

- /credit/credit-101
- /credit/credit-spreads
- /credit/default-probability
- /credit/merton-model
- /credit/reduced-form-models
- /credit/cds
- /credit/recovery-rates
- /credit/credit-curves

---

## Microstructure & Execution
_How venues clear orders, what that costs, and how to trade a decision into a position._

### Market Microstructure

- /trading-foundations
- /microstructure/orderbooks-vs-amms
- /microstructure/slippage
- /microstructure/fees-routing
- /microstructure/latency-risk

### Execution & Trading Systems

- /execution/execution-overview
- /execution/order-types
- /execution/market-impact
- /execution/almgren-chriss
- /execution/twap-vwap
- /execution/implementation-shortfall
- /execution/smart-order-routing
- /execution/transaction-cost-analysis
- /execution/adverse-selection
- /execution/execution-benchmarks

---

## Signals & Features
_Indicator-level research: features you might feed into a strategy._

- /signals/what-is-signal
- /signals/momentum-vs-mean-reversion

### Trend & Oscillators

- /signals/moving-averages
- /signals/ma-crossovers
- /signals/rsi
- /signals/macd
- /signals/bollinger
- /signals/atr
- /signals/stochastic

### Volume & Flow

- /signals/volume
- /signals/obv
- /signals/liquidity

### Derivatives & Positioning

- /signals/funding-rate
- /signals/open-interest
- /signals/basis

---

## Strategy Design
_Systematic strategy construction, from a rule to a tested system._

- /strategies/how-to-read
- /strategies/buy-hold
- /strategies/momentum
- /strategies/rsi-strategy
- /strategies/macd-strategy
- /strategies/pairs
- /strategies/cash-carry
- /strategies/delta-neutral
- /strategies/mm-lite
- /strategies/stop-loss
- /strategies/dynamic-sizing

---

## Portfolio & Risk
_Evaluating, sizing, and surviving a strategy._

### Performance Metrics

- /quant-math/sharpe
- /quant-math/sortino
- /quant-math/drawdown
- /quant-math/var-cvar

### Sizing & Allocation

- /quant-math/kelly
- /quant-math/optimization
- /quant-math/mean-variance
- /quant-math/position-sizing
- /quant-math/rebalancing

### Risk Management

- /risk/types
- /risk/leverage-liquidation
- /risk/backtest-vs-live
- /risk/operational
- /risk/checklists

---

## Market Regimes & Macro
_Why a stable-looking edge stops working: regime shifts and the macro backdrop._

- /regimes-macro/regimes-overview
- /regimes-macro/markov-switching
- /regimes-macro/hidden-markov-models
- /regimes-macro/changepoint-detection
- /regimes-macro/correlation-breakdown
- /regimes-macro/rates-and-inflation
- /regimes-macro/liquidity-cycles
- /regimes-macro/macro-factors

---

## Data & Tooling
_Getting data, cleaning it, and building an analysis environment._

- /data-tooling/data-sources
- /data-tooling/time-series
- /data-tooling/cleaning
- /data-tooling/pipeline
- /data-tooling/python
- /data-tooling/typescript
- /data-tooling/python-setup
- /data-tooling/notebooks
- /data-tooling/reproducible
- /data-tooling/dashboards
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
- /simulation/param-sweeps
- /simulation/agent-based
- /simulation/orderbook
- /simulation/python
- /simulation/typescript

### Simulation Engineering

- /building-simulations
- /building-simulations/agent-based-simulation
- /building-simulations/backtesting-framework
- /building-simulations/data-pipeline-replay
- /building-simulations/event-driven-architecture
- /building-simulations/performance-optimization

---

## Machine Learning for Finance
_Supervised learning on low signal-to-noise, serially correlated financial data._

- /ml-finance/ml-overview
- /ml-finance/feature-engineering
- /ml-finance/labelling
- /ml-finance/meta-labelling
- /ml-finance/purged-cross-validation
- /ml-finance/regularisation
- /ml-finance/ensembles
- /ml-finance/interpretability
- /ml-finance/ml-pitfalls

---

## DeFi & On-Chain Markets
_The on-chain domain: primitives, protocols, ordering, execution, and on-chain data._

### Orientation

- /welcome/what-is-defi
- /start-here/tradfi-to-defi
- /start-here/on-chain-meaning
- /start-here/tokens-addresses
- /start-here/use-cases
- /start-here/day-in-life
- /start-here/losing-money

### Primitives

- /building-blocks/tokens-101
- /building-blocks/token-standards
- /building-blocks/erc20
- /building-blocks/tokenomics
- /building-blocks/liquidity-pools
- /building-blocks/amms-101
- /building-blocks/swaps-dexs
- /building-blocks/impermanent-loss
- /building-blocks/yield-farming
- /building-blocks/stablecoins
- /building-blocks/lending-borrowing
- /building-blocks/liquidations
- /building-blocks/perpetual-futures
- /building-blocks/derivatives
- /building-blocks/oracles
- /building-blocks/bridges
- /building-blocks/governance
- /building-blocks/mev-overview

### Protocol Deep Dives

- /protocols/amms-depth
- /protocols/concentrated-liquidity
- /protocols/stablecoin-designs
- /protocols/lending-architecture
- /protocols/perp-dex
- /protocols/oracle-designs
- /protocols/bridges
- /protocols/staking-restaking

### On-Chain Microstructure

- /microstructure/gas-mempool
- /microstructure/onchain-offchain
- /microstructure/mev-formal

### MEV & Transaction Ordering

- /transaction-ordering-mev
- /transaction-ordering-mev/how-blocks-form
- /transaction-ordering-mev/mev-taxonomy
- /transaction-ordering-mev/quantitative-impacts
- /transaction-ordering-mev/statistical-modeling
- /transaction-ordering-mev/mitigation-and-defenses
- /transaction-ordering-mev/mev-beyond-evms

### Execution Environments

- /blockchain-execution-environments
- /blockchain-execution-environments/evm
- /blockchain-execution-environments/solana-svm
- /blockchain-execution-environments/move-vm
- /blockchain-execution-environments/comparative-benchmarks
- /blockchain-execution-environments/quant-engineering
- /advanced-topics

### On-Chain Data

- /data-tooling/event-logs
- /data-tooling/rpc-nodes
- /data-tooling/the-graph
- /data-tooling/dune-analytics
- /data-tooling/wallet-analytics
- /simulation/onchain-data

### On-Chain Signals & Strategies

- /signals/onchain-activity
- /strategies/lp-business
- /strategies/yield-farming
- /strategies/concentrated-lp
- /strategies/delta-hedged-lp
- /strategies/hedging-lp
- /strategies/funding-trends

### On-Chain Risk & Simulation

- /risk/smart-contract
- /risk/oracle-manipulation
- /risk/slippage-frontrunning
- /simulation/lp-returns
- /simulation/liquidations

---

## Case Studies & Research
_Real incidents and worked examples of strategies and failures._

- /case-studies/rsi-walkthrough
- /case-studies/failed-strategy
- /case-studies/post-mortem
- /case-studies/lp-volatility
- /case-studies/uniswap-v3-lp
- /case-studies/curve-arb
- /case-studies/flash-loan
- /case-studies/oracle-incident
- /case-studies/basis-unwind
- /case-studies/funding-rate

---

## Reference & Indexes
_Cheat-sheets, indices, and quick lookup material._

- /reference/glossary
- /reference/notation
- /reference/formulas
- /reference/formula-cheatsheet
- /reference/metric-index
- /reference/indicators
- /reference/code-snippets
- /reference/protocols
- /reference/protocol-index
- /reference/resources

---

## Contributing & Meta
_How Arth is maintained and how to extend the library._

- /contributing/how-to-contribute
- /contributing/content-guidelines
- /contributing/style
- /contributing/new-page
- /contributing/checklist
- /contributing/code-examples
- /contributing/notebook-standards
- /contributing/pipeline
- /contributing/review-process
- /contributing/roadmap
- /contributing/community

---

## Known gaps

Routed but with no menu entry:

- (none)

Menu entry with no route:

- /search — the menu links to `/search`, but no route is registered in `app-routing.module.ts`.
  `content/search.md` exists. Either register the route or drop the menu item.

## Content roadmap

The previous roadmap listed eight missing areas. All eight now exist as sections:
Markets & Instruments, Derivatives & Options, Credit, Stochastic Calculus, Statistical Methods,
Execution & Trading Systems, Machine Learning for Finance, and Market Regimes & Macro.

What is still missing:

- **Options P&L attribution.** `/derivatives/greeks` and `/derivatives/delta-hedging` cover the
  sensitivities and the hedge, but not decomposing a realised options P&L into delta, gamma,
  vega, and theta contributions.
- **Participation-based execution algorithms.** `/execution/twap-vwap` covers schedule-based
  algorithms; POV / participation-rate algorithms have no page.
- **Rates derivatives.** Fixed income stops at the curve — swaps, swaptions, and cap/floor
  pricing are not covered.
- **Portfolio construction beyond mean-variance.** `/quant-math/mean-variance` and
  `/quant-math/optimization` are the extent of it; risk parity, Black-Litterman, and factor-based
  risk models have no pages.

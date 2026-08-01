### Reading Paths

> info **Metadata** Level: All | Prerequisites: None | Tags: [overview, reading-paths, learning-paths]

Different people arrive at Arth with very different backgrounds. Some are trying to understand what volatility actually measures; others are already running strategies, building research infrastructure, or reviewing protocol risk.

This page helps you choose a path through the docs that matches where you are now. You can follow one path end-to-end or jump between them as your needs change.

#### How to Use These Paths

Each path is:

* A **sequence of sections** (for example, “Start Here → Statistics & Time Series → Signals & Features”), and
* A **reading style** (for example, “skim the math” or “focus on case studies”).

If a page feels too easy, skim it and move on. If a page feels too dense, bookmark it and come back when you've seen more examples.

You do not “unlock” anything by reading in a strict order. These paths are signposts, not rules.

---

#### Path 1: New to Markets

Choose this if:

* You're curious about how markets and quantitative research work, but the vocabulary still feels slippery.
* You want intuition and examples before formulas.

**Suggested route**

1. **Start Here**
   * How to Navigate
   * This page (Reading Paths)
   * Risk Reality Check
2. **Statistics & Time Series**
   * Returns
   * Volatility
   * Rolling windows
3. **Markets & Microstructure**
   * Trading Foundations
   * Slippage, fees, and routing
4. **Portfolio & Risk (selected)**
   * Sharpe ratio
   * Drawdown
   * Types of risk

After this, you can:

* Visit **Signals & Features** to see tools like RSI, moving averages, and volume in action.
* Dip into **Strategy Design** for simple, story-driven write-ups.

Focus on feeling comfortable with the words, diagrams, and examples. You can always come back for the math later.

---

#### Path 2: New to DeFi

Choose this if:

* You know what a cryptocurrency is but DeFi terms still feel slippery.
* You want to understand on-chain markets specifically.

**Suggested route**

1. **DeFi & On-Chain Markets → Orientation**
   * What is DeFi
   * TradFi → DeFi mental models
   * What “on-chain” means; tokens and addresses
   * Common use cases (swap, lend, borrow, LP)
   * Where people lose money
2. **DeFi & On-Chain Markets → Primitives**
   * Tokens 101
   * AMMs and impermanent loss
   * Lending and borrowing
   * Stablecoins and oracles
   * Perpetual futures and liquidations
3. **DeFi & On-Chain Markets → On-Chain Risk & Simulation**
   * Smart-contract and oracle risk
   * Slippage and frontrunning
4. **Portfolio & Risk (selected)**
   * Types of risk
   * Leverage and liquidation

Then work backwards into the quant core whenever a concept needs its general form.

---

#### Path 3: Active Trader

Choose this if:

* You already trade but want more structure and better reasoning.
* You care about how to design, test, and manage strategies.

**Suggested route**

1. **Signals & Features** – moving averages, RSI, MACD, volume, funding, basis.
2. **Strategy Design** – momentum, mean reversion, pairs, delta-neutral setups.
3. **Portfolio & Risk** – performance metrics, position sizing, risk management.
4. **Simulation & Backtesting** – honest backtests, metrics, scenario testing.
5. **Markets & Microstructure** – the execution costs that separate a backtest from a fill.

As you go, treat each strategy page as a template: copy the structure (assumptions, rules, metrics, risks), not the exact numbers.

---

#### Path 4: Quant / Researcher

Choose this if:

* You are comfortable with probability, statistics, or data analysis.
* You want clean definitions, formulas, and the assumptions behind them.

**Suggested route**

1. **Math & Probability** – random variables, expectation, variance, limit theorems.
2. **Stochastic Processes** – random walks, GBM, mean reversion, jumps.
3. **Portfolio & Risk** – Sharpe/Sortino, drawdown, VaR, Kelly, mean-variance, optimization.
4. **Signals & Features** – formulas, flow signals, derivatives positioning features.
5. **Simulation & Backtesting** – event-driven engines, agent-based sims, parameter sweeps.
6. **Case Studies** – postmortems to see how models succeed and fail in the wild.

Use this path as a scaffold for a research notebook or internal playbook.

---

#### Path 5: Data, Tooling, and Engineering

Choose this if:

* You work on data pipelines, dashboards, or research infrastructure.
* You want to turn strategy ideas into reliable systems.

**Suggested route**

1. **Data & Tooling** – data sources, cleaning/resampling, pipelines, reproducible environments.
2. **Simulation & Backtesting** – architecture, metrics, reporting, performance.
3. **Statistics & Time Series (selected)** – returns, volatility, rolling windows.
4. **Strategy Design** – read with an eye for data requirements and infra gaps.
5. **DeFi & On-Chain Markets → On-Chain Data** – if your data comes from chains: RPC nodes, event logs, The Graph, Dune.
6. **Contributing** – add your notebooks, tooling notes, or automation tips to the docs.

---

#### Path 6: Protocol Designer, Auditor, or Risk Reviewer

Choose this if:

* You think in terms of mechanisms, incentives, and failure modes.
* You care about how changes in design ripple through markets and users.

**Suggested route**

1. **DeFi & On-Chain Markets → Primitives** – AMMs, lending, stablecoins, liquidations, oracles.
2. **Protocol Deep Dives** – AMM flavors, lending architectures, perps, bridges.
3. **MEV & Transaction Ordering** – how ordering creates and extracts value.
4. **On-Chain Risk & Simulation** – smart-contract, oracle, and frontrunning risk.
5. **Case Studies** – incidents involving oracles, liquidity crises, design bugs.
6. **Portfolio & Risk (selected)** – risk measures and stress testing.

This path helps you connect protocol choices to market behavior and user outcomes.

---

#### Mixing and Switching Paths

You are not locked into one path:

* Start in **New to Markets** and gradually adopt **Active Trader** or **Quant**.
* Be a **Quant** but follow **Protocol Designer** when thinking about new mechanisms.
* Be on the **Data & Tooling** path while using **Strategy Design** as test cases.
* Enter through **New to DeFi** and pick up the general theory as you need it.

When in doubt:

* Start with the path that feels least intimidating.
* Use search or the Reference section when you stumble on a term.
* Return to this page whenever your goals change.

---

#### See Also

* [How to Navigate](/welcome/how-to-navigate) – The map these paths move across
* [Prerequisites](/welcome/prerequisites) – The background each path assumes
* [How to Read an Arth Article](/start-here/how-to-read) – Reading style within a single page
* [Risk & Reality Check](/welcome/risk-reality-check) – Worth reading early on every path
* [What Is DeFi](/welcome/what-is-defi) – First stop on the New to DeFi path
* [Trading Foundations](/trading-foundations) – First stop on the New to Markets path
* [Glossary](/reference/glossary) – For terms you meet before their own page

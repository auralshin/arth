### Why This Matters

> info **Metadata** Level: All | Prerequisites: What Is DeFi | Tags: overview, defi, risk, context

This page explains **why Arth exists at all**: why DeFi deserves a serious research library, and why the details — math, mechanics, and data — actually matter.

If DeFi is going to be more than short-lived speculation, people building, trading, and analyzing on-chain markets need clear mental models, not memes.

---

#### From Hype to Infrastructure

Early DeFi cycles were dominated by:

* Eye-catching yields with fragile assumptions
* Short-lived protocols with untested mechanics
* Complex systems marketed with simple slogans

Underneath the hype, something more durable has been forming:

* **Stablecoins** that move trillions in value
* **DEXs and lending markets** that run 24/7 with open access
* **On-chain derivatives** that behave like full-blown markets, not toys

Why this matters:

* If DeFi becomes part of financial infrastructure, its **failure modes** matter to everyone — not just crypto-native users.
* If you’re building or trading on top of these systems, misunderstanding them can be extremely expensive.

Arth is designed to help you look past marketing and see **mechanics, math, and data** clearly.

---

#### Why It Matters For You

Different readers care for different reasons. A few archetypes:

**If you’re a builder or engineer**

* You need to understand:
  * How AMMs, lending, and liquidation engines actually function
  * What data your contracts and UIs should surface
  * Where MEV and microstructure can break naive designs
* Arth helps you:
  * Reason about failure modes before they happen
  * Communicate with quants and risk teams using shared language

---

**If you’re a trader or LP**

* You need more than “number go up”:
  * How impermanent loss and volatility interact
  * What leverage and liquidation truly imply in volatile markets
  * How funding, basis, and liquidity regimes change over time
* Arth focuses on:
  * Transparent formulas and assumptions
  * Example strategies with clear caveats
  * Tools to analyze your own data and backtests

> warning **Not Financial Advice** Arth explains concepts and tools for educational purposes. It is not investment, trading, or financial advice. Any decisions based on these ideas are your own responsibility.

---

**If you’re a researcher or risk analyst**

* You care about:
  * Clean definitions and consistent notation
  * Reproducible data pipelines and simulations
  * Interpretable metrics for risk and performance
* Arth provides:
  * A common notation system across `/quant-math`, `/signals`, `/strategies`
  * Guidance on data tooling and backtesting in `/data-tooling` and `/simulation`
  * Case studies of real failures and edge cases in `/case-studies`

---

#### What Goes Wrong Without Fundamentals

Ignoring basics doesn’t just make you “a bit confused” — it meaningfully increases the odds of painful mistakes.

Common patterns when people skip fundamentals:

* Misunderstanding collateral and leverage:
  * Borrowing too aggressively without modeling liquidation thresholds
* Misinterpreting yields:
  * Chasing APR/APY screenshots without considering duration, risk, or token emissions
* Trusting black-box dashboards:
  * Relying on charts and metrics you don’t understand
  * Overfitting to backtests built on fragile data or assumptions
* Underestimating protocol and systemic risk:
  * Ignoring oracle dependencies, governance powers, or MEV impacts

> warning **Backtest Limitations** Historical charts, simulated PnL, and “paper” strategies on Arth are for illustration. Real markets include gas costs, failed transactions, MEV, liquidity constraints, and changing regimes.

Arth is built to make these assumptions visible, not hidden.

---

#### How Arth Helps You Learn Safely

The structure of the library is intentional:

* `/welcome` helps you understand the **map** before wandering around
* `/building-blocks` clarifies **what systems exist and how they function**
* `/quant-math`, `/signals`, `/strategies`, and `/simulation` give you a **toolkit** to reason about risk and performance
* `/case-studies` shows how things break in the real world
* `/risk` makes sure risk is treated as a first-class topic, not a footnote

The goal is not to make you bullish or bearish on DeFi.  
The goal is to make you **able to think clearly** about it.

---

#### See Also

* [What Is DeFi](/welcome/what-is-defi) – Core definition and mental model
* [Risk & Reality Check](/welcome/risk-reality-check) – How to think about risk before touching real money
* [Day in the Life](/start-here/day-in-life) – What on-chain work looks like in practice
* [Where People Lose Money](/start-here/losing-money) – Common failure modes and traps
* [Reading Paths](/welcome/reading-paths) – Suggested routes through the library based on your goals

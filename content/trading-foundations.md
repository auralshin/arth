### Trading Foundations

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility, Impermanent Loss, AMMs 101, Perpetual Futures | Tags: trading, amm, orderbook, derivatives, market-making

This module introduces the **core trading primitives used in DeFi**: spot trading on AMMs and order books, perpetual futures, and basic market-making ideas.

The goal here is to build **trader-level intuition**:

- How trades actually move prices and consume liquidity
- How perps stay tethered (more or less) to an index
- What it means to “make” a market instead of just taking liquidity

> info **Math lives elsewhere**  
> This module is deliberately light on derivations. It will tell you **which equations matter and why**, and then point you to the dedicated math/curve pages for full details.

---

#### 4.1 Spot Trading (AMMs & Order Books)

Spot trading is the baseline action in DeFi: swapping one asset for another. In this module we look at how this works in two main settings:

- **Automated Market Makers (AMMs)** – liquidity pools governed by invariant functions
- **Order Books** – traditional bid/ask ladders with discrete quotes

The emphasis is on **how execution, price impact, and LP PnL arise from mechanics**, not on edge cases of specific protocols.

---

**AMM invariants and pricing**

You’ll see the main AMM “families”:

- **Constant product** AMMs (e.g. \(x * y = k\))  
- **Constant sum** and **hybrid stableswap** style curves  
- Other variants that tweak curvature to change price impact

For each, we focus on:

- What the **invariant** represents conceptually (a surface of feasible reserves)
- How you read **spot price** from the curve
- How to think about **marginal price** and **slippage** as you walk along the curve

The heavy algebra, proofs, and generalizations live in the dedicated AMM math pages (e.g. `/building-blocks/amms-101`, `/protocols/amms-depth`).

---

**Liquidity as a curve & slippage**

We treat **liquidity as a geometric object**:

- Reserves trace out a curve/surface defined by the invariant
- A trade of size \(\Delta\) moves you along that curve
- The **executed price** is effectively an average price over that segment

You’ll learn to:

- Interpret “steep” vs “flat” regions of the curve
- Explain why large trades punch deeper into the curve and face more slippage
- Connect **pool depth** and **trade size** to realized execution prices

---

**Price impact & impermanent loss (IL)**

For LPs, spot trading is not just about fees; it’s about **path-dependent PnL**.

We’ll:

- Show how **price impact** arises mechanically from the curve
- Connect **trade flows** and **price paths** to LP portfolio changes
- Discuss **impermanent loss** qualitatively:
  - Why LPs effectively hold a rebalanced portfolio
  - When fee income can dominate IL
  - How volatility and correlation shape outcomes

Detailed IL formulas, approximations, and simulations are handled in the IL-focused pages.

---

**Order books and execution**

To compare AMMs with centralized/perp-style venues, we introduce key order book concepts:

- **Bid/ask and depth curves**  
- **Limit vs market orders**  
- **Visible vs hidden liquidity** (icebergs, internalization, etc.)  
- Basic execution cost components:
  - Spread + slippage + fees

We won’t build a full matching engine here. Instead, we’ll show:

- How to think of an order book as another form of **liquidity surface**
- How to compare execution quality:
  - AMM path on a curve vs walking the book
- Where **MEV, latency, and adverse selection** sneak into execution

---

**Practical: AMM slippage explorer**

You’ll build a small, self-contained exercise:

- Implement a **constant-product AMM swap function**
- For a range of trade sizes:
  - Compute pre- and post-trade reserves
  - Compute effective execution price
  - Calculate slippage vs mid-price

The point is to **feel** how liquidity and trade size translate into price impact, not to build production code.

---

#### 4.2 Perpetual Futures

Perpetual futures (“perps”) are a core DeFi primitive for **leveraged, directional, and hedged positions** without expiry.

This module focuses on:

- How perps stay loosely aligned with spot markets
- The risk mechanics: margin, liquidations, and funding
- How to think about leveraged positions as **path-dependent bets** on underlying price processes

---

**Funding rates and tethering to index**

We treat funding as a **feedback mechanism**:

- When perp price trades above index, longs pay shorts
- When perp price trades below index, shorts pay longs

You’ll:

- Understand how funding:
  - Nudges perp prices back toward an index
  - Creates an economic cost/benefit to holding positions
- See a **continuous-time style view**:
  - Funding as a drift adjustment term
  - How persistent basis → persistent funding

The exact funding formulas, stochastic models, and derivations appear in the more advanced derivatives/math pages.

---

**Mark price, index price, and oracles**

We distinguish:

- **Index price** – a reference price from external markets (oracle/TWAP)
- **Mark price** – the “risk” price used to calculate PnL and margin
- **Last traded price** – the actual transaction price on the exchange

We discuss:

- Why mark price is often smoothed (TWAP, bounded by oracles)  
- How different choices affect:
  - Liquidation timing
  - Manipulation incentives
- The **exposure** traders have if mark and index diverge

This ties back into `/building-blocks/oracles` and `/microstructure/*` when you look at oracle manipulation and MEV.

---

**Risk, margin, and liquidation mechanics**

Perps are defined as much by their **risk engine** as by their price.

We’ll cover:

- Initial vs maintenance margin
- Leverage as **position size relative to collateral**
- How liquidation thresholds are computed at a high level
- Why deleveraging cascades can occur:
  - Correlated liquidations
  - Thin liquidity + aggressive liquidation engines

You’ll see how, under a simple stochastic price process (e.g. GBM), you can reason about **probability of liquidation** as a function of leverage, volatility, and time horizon — conceptually, not yet with full closed-form math.

---

**Practical: toy perp market simulation**

You’ll sketch and/or implement:

- A simple perp venue with:
  - Index price path (simulated)
  - A small set of traders with different leverage levels
  - A basic funding rule and liquidation condition
- Then measure:
  - How often different leverage levels get liquidated
  - How funding transfers wealth between participants

This gives you an intuitive feel for **how fragile high leverage is** under realistic volatility, and sets up later, more formal simulation work.

---

#### 4.3 Market Making

Market making is the flip side of trading: instead of just **consuming** liquidity, you **provide** it and manage inventory, spread, and risk.

This module gives a **conceptual introduction** to continuous-time market-making models, without diving fully into stochastic control proofs.

---

**Inventory, spread, and risk–reward trade-offs**

We frame market making as a balancing act between:

- **Spread** – how far from mid you quote (revenue potential)
- **Inventory** – how much directional risk you accumulate
- **Order arrival** – how often you get hit/lifted

You’ll see the basic ingredients of models like:

- **Avellaneda–Stoikov** – where:
  - Mid-price follows a stochastic process
  - Order arrivals depend on how far your quotes are from mid
  - You choose spreads to optimize expected utility of final wealth

- **Cartea–Jaimungal / Guéant**-style frameworks:
  - Stochastic control approaches to dynamic inventory and skew
  - Penalizing inventory risk while maximizing trading revenue

We keep the math light here and use diagrams, state variables, and narrative to convey the structure.

---

**From theory to practice: discrete quoting**

Real DeFi / CeFi making is:

- Discrete in time (you update quotes in ticks)
- Subject to latency, gas, and MEV
- Constrained by:
  - Position limits
  - Risk limits (per asset, per book)
  - Venue-specific quirks (AMM vs order book)

We discuss:

- How continuous-time “optimal spreads” translate into:
  - **Quote bands** around mid
  - **Inventory-based skew** (tight on the side you want to offload)
- How things change on AMMs:
  - Providing liquidity as “passive” market making
  - Concentrated liquidity as **range-based quoting**

This connects back to:

- `/microstructure/*` (latency, adverse selection, MEV)
- `/strategies/mm-lite` and `/strategies/lp-business` for concrete strategy templates

---

**Practical: toy market-making agent**

You’ll outline and/or implement a simple **discrete-time MM agent**:

- Environment:
  - Simulated mid-price process
  - Poisson/Bernoulli order arrivals that hit the best bid/ask with some probability
- Agent:
  - Sets bid/ask around mid with spreads that depend on inventory
  - Tracks P&L and inventory over time

You’ll then:

- Plot P&L and inventory distributions
- See how:
  - Wider spreads reduce fill rate but improve per-trade edge
  - Stronger inventory aversion (more aggressive skew) changes risk profile

Again, the point is to **touch the concepts** (spread vs inventory vs order flow), not to reproduce full academic models.

---

#### How This Module Fits in the Library

Trading Foundations acts as a **bridge** between:

- The math in `/quant-math/*` (returns, volatility, drawdown, GBM, etc.)
- The structural pages in `/building-blocks/*` and `/microstructure/*`
- The more concrete strategy pages in `/strategies/*` and simulations in `/simulation/*`

After this module, you should be able to:

- Read DeFi trading and LP strategies as **risk/return objects**, not just stories
- Ask sharper questions about:
  - Where edge would realistically come from
  - How microstructure and leverage affect outcomes
- Navigate into the detailed math pages with a clear sense of **why** you’re learning each formula.

> warning **Not Financial Advice**  
> This module is for educational purposes only. It explains how trading primitives and models work; it is not a recommendation to trade, use leverage, or deploy capital with any specific strategy or protocol.

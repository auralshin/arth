### What Is DeFi

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: defi, overview, introduction

This page gives you a grounded, hype-free definition of **Decentralized Finance (DeFi)**.  
You’ll see what DeFi is, what it tries to do, how it roughly works, and how it differs from the systems you might already know.

If you only remember one thing: DeFi is a **set of financial services run by code on public blockchains**, instead of by traditional institutions.

---

#### A Short Definition

**Decentralized Finance (DeFi)** is an open financial system built on public blockchains, where:

* Financial rules are enforced by **smart contracts**, not by human admins
* Assets are typically **tokens** living on-chain
* Anyone can interact using a wallet — no account application or approval needed
* Most components are **transparent** (you can inspect code and transactions)
* Protocols are often **composable** (they can plug into each other like LEGO)

Some common things people do in DeFi:

* Swap one token for another via a decentralized exchange (DEX)
* Lend assets to earn interest, or borrow against collateral
* Provide liquidity to pools and earn fees
* Take leveraged positions using on-chain derivatives
* Use stablecoins as a quasi-bank-account replacement

> info **Why “decentralized” is relative** No system is perfectly decentralized. DeFi protocols sit on a spectrum of decentralization (governance, infrastructure, admin keys). Arth pages will usually call this out when it matters.

---

#### How DeFi Actually Works (10,000 ft View)

Under the hood, most DeFi activity flows through a few core building blocks.

**1. Smart contracts**

Smart contracts are programs deployed on a blockchain (like Ethereum). They:

* Store rules (how swaps, loans, liquidations work)
* Track balances and positions
* Enforce constraints (collateral ratios, fees, etc.)
* Emit events you can analyze in `/data-tooling/*`

If a contract says “liquidate this position at 75% LTV,” anyone can trigger that logic — not just a special entity.

---

**2. Tokens**

Instead of bank balances, you deal with **tokens**:

* Fungible tokens (ERC-20 and friends) for currencies and assets
* Non-fungible tokens (NFTs) for unique positions or rights
* Derivative tokens that represent LP positions, staked assets, or leveraged exposure

See [Tokens 101](/building-blocks/tokens-101) and [Token Standards](/building-blocks/token-standards) for deeper details.

---

**3. Liquidity pools & DEXs**

Rather than matching buyers and sellers directly, many DeFi exchanges use **automated market makers (AMMs)**:

* Users deposit token pairs into a **liquidity pool**
* A pricing formula (e.g., constant product `x * y = k`) sets swap prices
* Traders swap against the pool, paying fees to LPs

See:

* [AMMs 101](/building-blocks/amms-101)
* [Swaps & DEXs](/building-blocks/swaps-dexs)
* [Impermanent Loss](/building-blocks/impermanent-loss)

---

**4. Lending, borrowing, and collateral**

DeFi lending protocols:

* Let you deposit collateral (e.g., ETH)
* Mint borrowable assets (e.g., stablecoins) against that collateral
* Use on-chain **oracles** for price feeds
* Enforce liquidations via smart contracts when collateral is insufficient

Relevant pages:

* [Lending & Borrowing](/building-blocks/lending-borrowing)
* [Stablecoins](/building-blocks/stablecoins)
* [Oracles & Price Feeds](/building-blocks/oracles)

---

#### What DeFi Is *Not*

It’s useful to be explicit about what DeFi is *not*.

DeFi is **not**:

* A guaranteed way to earn high yields
* A magical system without human decisions or politics
* Immune to bugs, hacks, or governance failures
* A replacement for basic risk management and skepticism

DeFi is also **not the same** as:

* **CeFi (centralized finance in crypto)** — e.g., exchanges or lenders that hold customer funds off-chain and use a traditional company structure
* **TradFi (traditional finance)** — banks, brokers, custodians, legacy payment systems

> warning **Reality check** Many DeFi losses come from people treating “on-chain” as “safe” or “trustless” without understanding smart contract risk, oracle manipulation, governance power, or basic leverage.

---

#### Why Definitions Matter in Arth

Arth focuses on **quantitative** and **protocol-level** understanding of DeFi:

* To model risk, you need a crisp mental model of what DeFi actually is
* To simulate strategies, you need to know how protocols are expected to behave
* To interpret data, you need context around events and mechanisms

When a page says “DeFi protocol” or “on-chain data,” it’s referring to the systems outlined above — not generic crypto prices or centralized exchanges.

---

#### See Also

* [Why This Matters](/welcome/why-this-matters) – Big-picture motivation for caring about DeFi mechanics
* [Risk & Reality Check](/welcome/risk-reality-check) – Honest view of risks and failure modes
* [TradFi to DeFi](/start-here/tradfi-to-defi) – Mental bridge from legacy finance to DeFi
* [Tokens 101](/building-blocks/tokens-101) – Deeper dive into token basics
* [AMMs 101](/building-blocks/amms-101) – How decentralized exchanges actually work

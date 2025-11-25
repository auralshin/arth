### What "On-Chain" Means

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: [blockchain, transactions, state, gas]

People in crypto say "on-chain" all the time:

* On-chain data
* On-chain trades
* On-chain governance

This page explains what that actually means at a practical level.

---

#### A Shared Notebook Everyone Can See

Imagine a large, append-only notebook shared by many participants. Every few seconds, a new page is added containing:

* A list of transactions
* The updated balances and contract state that result from them

That notebook is the blockchain.

Being "on-chain" means:

* The action is recorded in that notebook.
* Anyone can verify what happened by reading the pages.
* The outcome is defined by rules in code, not by a private database.

---

#### Blocks and Transactions

Two core pieces:

1. **Transactions**

   * Instructions you send: transfer tokens, interact with a contract, update a position.
   * Signed with your private key to prove they came from you.

2. **Blocks**

   * Batches of transactions agreed upon by validators or miners.
   * Each block references the previous one, forming a chain.

When your transaction is "in a block", it is now part of the shared history.

---

#### State: Where Your Stuff Lives

The blockchain doesn't just store a list of transactions. It also maintains **state**:

* Account balances
* Contract storage (vaults, positions, pool reserves, configuration)

When you:

* Deposit into a lending protocol
* Add liquidity to a pool
* Vote in governance

you're changing the state of one or more smart contracts on-chain.

**Key idea:**

Your DeFi positions are not inside your wallet app. They are part of contract state recorded on the chain. Your wallet simply proves you have the right to interact with them.

---

#### Gas and Fees

Every transaction competes for space in a block. To keep the system from being overloaded:

* Each operation costs **gas**—a measure of computational work.
* You pay for that gas using the chain's native token (for example, ETH).
* Validators/miners choose which transactions to include based (partly) on fees offered.

Practical impacts:

* Complex operations (like swaps across multiple pools) cost more gas.
* When the network is busy, you pay higher fees or wait longer.
* A strategy that looks profitable in a spreadsheet can be unprofitable once gas is included.

---

#### Finality and Irreversibility

In traditional systems, settlement often happens later; trades can be reversed or adjusted.

On-chain:

* Once blocks are finalized, reversing them is extremely difficult or practically impossible.
* If you send tokens to the wrong address, there is usually no way back.
* Protocol upgrades use new code; they do not rewrite past history.

This is what gives DeFi its **credibility** (everyone shares the same history) and its **danger** (mistakes are hard to undo).

---

#### Mempools and Transaction Ordering

Before your transaction ends up in a block, it sits in a **mempool**: a kind of public waiting room.

Important things to know:

* Other participants can see pending transactions.
* Some strategies (like arbitrage and sandwich attacks) rely on reordering around them.
* Paying higher fees can move your transaction up in the queue.

We'll explore these topics more in Market Microstructure and MEV sections. For now, remember:

**"On-chain" includes not just what is recorded, but also how it gets there.**

---

#### What Is Off-Chain?

Examples of things that are **not** on-chain:

* Data stored only in centralized databases (like CEX orderbooks).
* Off-chain analytics and models in your notebooks.
* Signed messages that are never submitted as transactions.

Many real systems are hybrids: signals and calculations off-chain, settlement on-chain.

---

#### Why This Matters for DeFi

Understanding "on-chain" helps you reason about:

* What can be verified by anyone vs what requires trust.
* Where delays, fees, and risks really sit.
* Why strategies that ignore gas, slippage, and ordering often fail in practice.

As you read later sections, try to ask:

* Is this happening on-chain, off-chain, or both?
* What part of this could other people see and react to?

Those answers will shape both opportunities and risks.

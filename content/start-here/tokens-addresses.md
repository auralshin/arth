### Tokens & Addresses

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: [tokens, wallets, addresses, approvals]

If blockchains are shared notebooks, **addresses** are the lines with your name on them, and **tokens** are the numbers written next to those lines.

This page explains what both really are, and how they behave when you use DeFi.

---

#### Addresses: Identities on the Ledger

An address is:

* A long string derived from a public key.
* The "who" in a transaction: who is sending, who is receiving.
* The label under which balances and contract interactions are recorded.

Two broad types of addresses exist:

1. **Externally Owned Accounts (EOAs)**

   * Controlled by a human (or organization) via a private key.
   * Typical wallet addresses.

2. **Contract Addresses**

   * Controlled by code (smart contracts).
   * Protocols, token contracts, pools, vaults.

Your wallet app manages EOAs. When you interact with a protocol, you are usually sending transactions from your EOA to a contract address.

---

#### Private Keys: Control, Not Storage

One subtle but important point:

* Your tokens do not "live" in your wallet.
* They live in the shared ledger and are associated with your address.
* The private key is what lets you prove "I control this address."

Losing a private key means:

* You can never sign transactions from that address again.
* The tokens associated with it remain on-chain but effectively frozen.

There is no password reset. Backup and key management are part of risk management.

---

#### Tokens: Balances in Smart Contracts

A token like USDC or a governance token is usually:

* A smart contract that keeps track of balances.
* Functions like `transfer`, `approve`, `transferFrom`, `balanceOf`.
* Rules about who can mint or burn tokens.

When you "hold a token", you are:

* Listed in that contract's internal storage as having a certain balance.
* Able to ask that contract to transfer some of your balance to another address.

Tokens can represent many things:

* Purely digital assets (stablecoins, governance tokens).
* Claims on underlying assets (tokenized deposits).
* LP positions, debt, or other derived states.

---

#### Approvals and Allowances

In DeFi, you rarely want to transfer tokens directly to a protocol contract. Instead, you:

1. **Approve** the contract to spend a certain amount of your token.
2. Call a function on the contract (for example, "deposit") that uses `transferFrom` to move tokens on your behalf.

This pattern matters:

* Approvals are **permissions** you grant.
* You can often revoke or reduce allowances later.
* Unlimited approvals are convenient but enlarge your risk surface if a contract is compromised.

Practical habit:

* Periodically check which contracts have spending approvals for your tokens.
* Reduce them if you no longer use a protocol.

---

#### Token Standards (High-Level)

On many chains, tokens follow common patterns ("standards"). You don't need to know the code, but the idea helps:

* **Fungible tokens** (like ERC-20):

  * Balances are interchangeable.
  * One unit is like another, similar to cash.

* **Non-fungible tokens (NFTs)**:

  * Each token ID is unique.
  * Useful for individual positions, receipts, or rights.

Some DeFi positions (like certain LP shares) are NFTs under the hood, because each position can have its own parameters.

---

#### Addresses in Everyday DeFi Actions

When you:

* **Swap tokens** on a DEX:

  * Your address sends tokens to the pool contract.
  * The pool contract sends back the other token type.

* **Deposit to a lending protocol**:

  * Your address transfers tokens to the protocol contract.
  * The protocol contract updates its internal accounting and may mint a receipt token.

* **Vote in governance**:

  * Your address signs a message or transaction.
  * The governance contract counts votes tied to token balances or staked positions.

In all cases, the ledger records:

* Which addresses interacted
* Which contracts they touched
* How balances and state changed

---

#### "My Tokens Are Stuck in a Contract"

Sometimes you'll hear this phrase. What does it mean?

* Once tokens are deposited into a contract, only that contract's logic can move them.
* If that logic has no withdrawal function, or if it is misconfigured, tokens can become effectively trapped.
* Upgrades or governance-controlled changes may be required to recover them (if possible at all).

This is one reason why contract design and audits matter. You are not just trusting code to do math; you are trusting it with the ability to move or lock your tokens.

---

#### Practical Mental Model

When thinking about tokens and addresses in DeFi, keep this model:

* **Address** = identity on the ledger
* **Private key** = ability to act as that identity
* **Token** = entry in a contract's internal table saying how much you can move
* **Protocol** = another contract that can move certain tokens according to rules

Everything else—APYs, dashboards, charts—is built on top of those simple ingredients.

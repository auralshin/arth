### TradFi to DeFi Mental Models

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: [tradfi, mental-models, comparison]

If you come from traditional finance, DeFi can feel both familiar and strange. The words sound similar—loans, swaps, leverage, yield—but the mechanisms are different.

This page builds bridges: for each familiar object in TradFi, we point to its closest relatives in DeFi, and then highlight the differences that matter.

---

#### Bank Account vs Wallet

**TradFi mental model:**
A bank account is a record at a centralized institution that says how much money you have. You log in with a password; the bank moves numbers between accounts when instructed.

**DeFi version:**
A **wallet** is more like a key to an address on a public ledger:

* Your assets live on the blockchain, not inside the wallet app.
* The wallet lets you prove "I control this address" by signing messages.
* There is no support line you can call to reverse a transfer.

Key differences:

* Control is **cryptographic**, not social or legal.
* There is no concept of "freezing" an address unless a specific smart contract has that power.
* Losing your keys is closer to losing the safe, not just the key.

---

#### Brokerage Account vs Exchange vs AMM

**TradFi mental model:**
You place an order (buy or sell) on an exchange via a broker. An orderbook matches your orders with others at different prices.

**DeFi versions:**

1. **Centralized Exchange (CEX)**
   Very similar to a traditional brokerage model, but with crypto. The orderbook is off-chain, the matching engine is controlled by a company.

2. **Decentralized Exchange (DEX) with AMMs**
   Here, there is often no orderbook. Instead:

   * Liquidity providers deposit two tokens into a pool.
   * A formula (for example, x · y = k) sets the price.
   * Traders interact with the pool directly, swapping tokens against that curve.

Key differences:

* Pricing is algorithmic instead of purely order-driven.
* Liquidity providers, not market makers at banks, bear inventory risk.
* Everyone sees the same pool; there is no private "Level 2" feed.

---

#### Margin Account vs Lending Protocol

**TradFi mental model:**
You post collateral in a margin account and borrow cash or securities to increase exposure. The broker can liquidate your positions if margin falls below a threshold.

**DeFi version:**
A **lending protocol** acts like a global margin system:

* Users supply assets to earn interest.
* Other users borrow those assets against posted collateral.
* If a borrower's collateral value falls too low, liquidators can repay the loan and seize collateral.

Similarities:

* Over-collateralization
* Margin calls and forced liquidations
* Interest rates on borrowed funds

Differences:

* Rates and limits are encoded in smart contracts, not negotiated.
* Liquidations often rely on on-chain auctions or third-party liquidators.
* Everything is transparent: positions, collateral, borrow rates.

---

#### Savings Account vs Yield Farming

**TradFi mental model:**
You place money in a savings account, receive a low but predictable interest rate set by the bank.

**DeFi version:**

* **Supplying to a lending pool** is the closest analogue to a savings account.
* **Yield farming** adds extra incentive tokens on top of base yield.

Key differences:

* Rates are market-driven and often volatile.
* Rewards may be paid in volatile tokens rather than stable currency.
* There can be smart-contract and protocol design risks.

---

#### Central Bank vs Protocol Governance

**TradFi mental model:**
Central banks and regulators shape monetary policy, set interest rates, and influence liquidity.

**DeFi version:**

* Many protocols have **governance tokens** whose holders vote on parameters:

  * Interest rate curves
  * Collateral factors
  * Fee splits
  * Emission schedules for rewards

* Some protocols control their own treasuries and can direct incentives.

Key differences:

* Voting power is typically proportional to tokens, not one-person-one-vote.
* Governance processes are often open but can be dominated by large holders.
* Changes are implemented through upgrades to smart contracts, not law.

---

#### Settlement Systems vs Blockchains

**TradFi mental model:**
Behind the scenes, trades settle through clearing houses and settlement systems, often on T+2 or similar timelines.

**DeFi version:**

* A blockchain acts as a **shared settlement layer**:

  * Transactions are grouped into blocks.
  * Once a block is finalized, that state becomes part of the canonical ledger.

* Most DeFi protocols live directly on this layer: their "books and records" are the same as settlement.

Key differences:

* Settlement is often much faster, but block times and finality still matter.
* Everyone sees the same ledger, not separate internal books per institution.
* There is less room for post-trade "adjustments".

---

#### Why These Mental Models Matter

Translating from TradFi to DeFi is not about finding perfect analogues. It's about:

* Recognizing where your intuition carries over, and
* Spotting where it breaks, so you do not rely on wrong assumptions.

As you read later sections:

* Ask yourself, "What is the nearest TradFi thing this resembles?"
* Then ask, "What is fundamentally different here?"

That gap is where most surprises—and most risks—live.

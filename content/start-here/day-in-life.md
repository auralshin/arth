### A Day in the Life of a DeFi User

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: [overview, story, use-cases, building-blocks]

Instead of starting with definitions, let's follow a fictional person for one day.

Meet **John**. She is comfortable with centralized exchanges and has used a hardware wallet before, but she still feels that DeFi is a vague blur of "yield" and "APYs". Today, she decides to spend an hour actually doing things on-chain.

We'll watch what she does and, underneath each step, unpack the building blocks she's touching.

---

#### Morning: Turning Cash Into Stablecoins

John wakes up, opens her exchange app, and buys some stablecoins with fiat. She sends them to her self-custodial wallet.

Under the hood:

* She is moving from **bank rails** (her checking account) to **crypto rails**.
* Her stablecoins are ERC-20 tokens, balances tracked by a smart contract.
* When she withdraws to her own address, the exchange is sending a token transfer on-chain.

Key concepts appearing:

* Tokens
* Wallets and addresses
* Custodial vs self-custodial control

---

#### Step 1: Depositing Into a Lending Protocol

John connects her wallet to a lending protocol. She deposits her stablecoins to "earn yield".

From her perspective:

* She signs a transaction.
* Her stablecoin balance in her wallet goes down.
* Her "supplied" balance on the protocol UI goes up.
* She sees an APY number and a growing claim on the pool.

Under the hood:

* Her deposit is added to a shared **liquidity pool**.
* She receives a **claim token** (often called an aToken, cToken, etc.) that tracks her share of the pool.
* The interest rate is determined algorithmically by a **utilization curve**: as more people borrow, rates adjust.

Building blocks involved:

* Lending markets
* Interest rate models
* Collateral and pool shares

---

#### Step 2: Borrowing Against Collateral

Later in the day, John decides she wants price exposure to ETH without selling her stablecoins.

She flips a switch: "Use deposit as collateral" and borrows ETH against it.

From her perspective:

* Her "health factor" appears on-screen.
* She now has an ETH balance in her wallet.
* The UI warns that if ETH falls or if her collateral falls in value, she can be liquidated.

Under the hood:

* Her stablecoin deposit is now marked as **collateral**.
* She has created a **leveraged long** on ETH (borrow ETH, keep stablecoins).
* The protocol tracks a **loan-to-value (LTV)** ratio and a liquidation threshold.

New concepts:

* Over-collateralization
* Liquidation mechanics
* Leverage inside a lending protocol

---

#### Step 3: Swapping on an AMM

John swaps some of her borrowed ETH for a governance token of a protocol she likes.

From her perspective:

* She chooses a pool (ETH/token).
* She sees a price quote, a "price impact" number, and a fee.
* She signs a transaction; soon after, her ETH balance goes down and her token balance goes up.

Under the hood:

* The swap occurs in an **automated market maker** (AMM), not an orderbook.
* Liquidity providers have deposited both assets into a pool; a pricing formula (like x · y = k) sets the price.
* Her trade shifts the pool's balance, which changes the price for the next person.

Concepts emerging:

* Constant-product AMMs
* Liquidity provision
* Slippage and price impact
* Trading fees

---

#### Step 4: Becoming a Liquidity Provider

Curious, John decides to "be the market" instead of trading against it. She adds liquidity to an ETH–stablecoin pool.

From her perspective:

* She deposits equal values of ETH and stablecoins into the pool.
* She receives LP tokens representing her share.
* The UI shows projected fee income and an "impermanent loss" warning.

Under the hood:

* She is now a **liquidity provider (LP)**.
* Every trade contributes fees to the pool; she earns a share proportional to her LP tokens.
* If the price of ETH moves, the pool automatically rebalances, changing how much ETH and how much stablecoin she effectively owns.

Concepts:

* Impermanent loss
* Fee revenue vs inventory risk
* LP tokens as receipts

---

#### Step 5: Checking Positions and Risk

In the evening, John opens her dashboard:

* Her lending position shows interest earned on her stablecoins.
* Her borrowed ETH value has changed with price moves.
* Her LP position shows earned fees but also a different mix of ETH and stablecoins.

She notices:

* If ETH drops enough, her health factor shrinks.
* If ETH rallies hard, her LP position might underperform simply holding ETH.
* Gas fees made small experiments more expensive than she expected.

This is where DeFi shifts from "buttons and APYs" to **risk management**:

* How much leverage is she comfortable with?
* How much impermanent loss is she willing to accept for fee income?
* Which protocols does she trust with smart-contract risk?

---

#### What This Day Teaches

By following one person's day, you've already seen:

* Stablecoins and wallets
* Lending protocols and over-collateralized borrowing
* AMMs, LPing, slippage, impermanent loss
* Governance tokens and protocol exposure
* Liquidation risk and fee vs risk trade-offs

The rest of the **Start Here** section zooms in on each of these building blocks:

* How they work
* Why they exist
* How they can fail

As you read, try to imagine where John's story would diverge from your own. That's where the learning starts.

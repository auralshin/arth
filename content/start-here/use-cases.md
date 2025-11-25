### Common DeFi Use Cases

> info **Metadata** Level: Beginner | Prerequisites: Tokens & Addresses, What "On-Chain" Means | Tags: [use-cases, swaps, lending, lp, leverage]

DeFi is not one thing. It is a bundle of use cases built on shared infrastructure.

This page surveys the most common ways people actually use DeFi, without endorsing any of them. The goal is to help you recognise patterns when you see them in the wild.

---

#### Swapping One Asset for Another

The simplest and most frequent action: **"I have token A and I want token B."**

Examples:

* Swapping stablecoins (USDC ↔ DAI).
* Swapping into ETH to gain price exposure.
* Swapping governance tokens.

Where it happens:

* On decentralized exchanges (DEXes) using AMMs.
* Sometimes via aggregators that route across multiple pools.

What to pay attention to:

* **Slippage** – how much the price moves because of your trade.
* **Fees** – pool fees and additional aggregator or protocol fees.
* **Price source** – which pool or route is providing the price.

---

#### Earning Yield on Idle Assets

Many users start by trying to earn yield on assets they already hold.

Forms this can take:

* Supplying stablecoins or blue-chip assets to a **lending protocol**.
* Depositing into a **yield-bearing token** (for example, a token that auto-compounds rewards).
* Joining a **liquidity pool** that earns trading fees.

Questions to ask:

* Where does the yield come from? Borrowers, traders, emissions?
* Is it sustainable or purely incentive-driven?
* What risks am I taking (smart-contract risk, depeg risk, protocol design risk)?

---

#### Providing Liquidity to Earn Fees

Instead of trading against a pool, you can become part of the pool.

Use case: **"I want to earn trading fees and am comfortable holding a mix of two assets."**

Characteristics:

* You deposit token A and token B into an AMM.
* You earn a share of the fees from swaps in that pool.
* Your position's value changes with prices and with trading volume.

Key trade-off:

* **Fee income** vs **impermanent loss** (the difference between being an LP and just holding the assets).

This is often framed as "passive income", but outcomes depend heavily on market conditions.

---

#### Borrowing Against Collateral

Instead of selling an asset, some people borrow against it: **"I want liquidity now, but I don't want to sell my ETH."**

They:

* Deposit ETH or another asset as collateral in a lending protocol.
* Borrow stablecoins or another token against it.
* Use the borrowed funds for trading, yield, or real-world expenses.

Risks:

* If collateral value falls, the position can be liquidated.
* Borrowing rates can change over time.
* Using borrowed funds for risky strategies amplifies losses.

---

#### Leveraged Long and Short Positions

Many DeFi protocols allow you to increase your exposure.

Examples:

* **Leveraged long:** borrow stablecoins, buy more ETH, using ETH as collateral.
* **Leveraged short:** borrow ETH, sell it for stablecoins, hoping to buy back cheaper later.

Mechanisms:

* Margin-like lending protocols.
* Perpetual futures (perps) on DEXes with funding rates.

Questions to ask:

* What is the liquidation price of the position?
* How volatile is the funding or borrowing cost?
* How quickly can I reduce or exit the position if conditions change?

---

#### Stablecoin Savings and Payments

Another group of users treat DeFi primarily as a way to hold and move stable value.

Use cases:

* Holding savings in stablecoins.
* Moving value across borders faster than traditional rails.
* Paying teammates or contributors in crypto.

Considerations:

* Stability of the underlying stablecoin design.
* Regulatory and banking interfaces (on-ramps and off-ramps).
* Smart-contract and custody risks.

---

#### Governance and Participation

Some users want influence, not just yield.

Use cases:

* Staking governance tokens to vote on protocol changes.
* Participating in incentive programs or grants.
* Delegating voting power to representatives.

Things to know:

* Voting power is often proportional to token holdings or lockups.
* Proposal processes vary in quality and transparency.
* Governance can control important parameters that affect risk.

---

#### Composing Strategies

Many active users combine these elements:

* Swap to get the asset they want.
* Deposit it as collateral.
* Borrow against it to fund another position.
* Provide liquidity or enter a perp trade with the borrowed funds.
* Stake or lock governance tokens to direct emissions toward the pools they care about.

Each step adds layers of dependencies:

* More smart contracts.
* More assumptions about prices, volumes, and protocols.
* More places where something can break.

Understanding the simple use cases first makes it easier to reason about complex ones.

---

#### Recognising Patterns

As you explore DeFi:

* Try to identify which of the above use cases is actually happening behind a flashy interface.
* Map actions back to building blocks: lending, swapping, LPing, staking.
* Ask, "If this goes wrong, what could fail and why?"

The rest of the docs unpack each use case in more depth, with examples, math, and simulations where needed.

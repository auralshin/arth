### Tokens 101

> info **Metadata**  
> Level: Beginner–Intermediate • Prerequisites: What “On-Chain” Means, Tokens & Addresses • Tags: [tokens, fungible, nft, stablecoins, markets, primary, secondary]

Tokens are the basic “objects” you touch in DeFi.

- When your wallet shows **USDC**, **ETH**, or a governance coin – that’s a **fungible token**.
- When you own a **PFP**, an **ENS name**, or a **concentrated LP position** – that’s usually a **non-fungible token (NFT)**.
- When you deposit into a protocol and receive a **receipt token** back – that’s often a **derivative token** representing your position.

This page gives you a mental model of tokens that you can reuse everywhere:

1. What a token really is.
2. Fungible vs non-fungible vs semi-fungible.
3. Stablecoins and yield-bearing stablecoins (including Ethena’s delta-neutral design).
4. Primary vs secondary markets.
5. A checklist for reading any new token.

---

#### 1. Mental Model: A Token as a Rulebook

At the lowest level:

**A token is a rulebook that says which addresses have what balances, and how those balances can change.**

That rulebook usually lives inside a **smart contract** and defines:

- **State**

  - Balances per address
  - Optional metadata (names, images, parameters)

- **Actions**

  - Functions like `transfer`, `approve`, `mint`, `burn`, or custom operations

- **Permissions**
  - Who may mint, burn, pause, or upgrade (owner, multisig, governance, nobody)

What a token _represents_ can vary a lot:

- **Currency / unit of account** – e.g. USDC, DAI, USDT
- **Protocol rights** – governance tokens, staking tokens
- **Positions** – LP shares, vault shares, debt positions
- **Unique objects** – art, tickets, domain names
- **Real-world claims** – tokenized Treasuries, real estate, invoices

When you look at a token in your wallet, ask:

1. What does this _entitle_ me to?
2. Who can change the rules of this contract?
3. Where can I use it (which chains, which apps)?

---

#### 2. Token Flavours: Fungible, Non-Fungible, Semi-Fungible

**2.1 Fungible Tokens**

**Fungible** = one unit is as good as any other unit.

Real-world analogies:

- Cash bills of the same denomination
- Shares of the same stock ticker

On-chain examples:

- Stablecoins: USDC, USDT, DAI
- Governance: UNI, AAVE, COMP
- Wrapped assets: wETH, wBTC
- “Classic” LP tokens from Uniswap v2, Curve, Balancer

Properties:

- Balances are just numbers.
- You don’t care _which_ units you own, only how many.
- Perfect for money, points, voting weight, or pool shares.

---

**2.2 Non-Fungible Tokens (NFTs)**

**Non-fungible** = each unit is distinct and trackable.

Real-world analogies:

- A specific house or car
- A concert ticket with row and seat

On-chain examples:

- Art and collectibles
- ENS names
- Some LP positions in concentrated-liquidity AMMs (each range is unique)
- Individual debt positions and options in newer protocols

Properties:

- Each token has its own `tokenId`.
- Metadata (image, attributes, position details) hangs off that ID.
- Useful when each item or position has its own story.

---

**2.3 Semi-Fungible Tokens**

**Semi-fungible** = fungible _within a class_, but classes differ.

Example:

- Event tickets: all Saturday-GA tickets are interchangeable with each other, but differ from Sunday-VIP tickets.

On-chain, this pattern shows up as:

- Game items (same sword type, many copies)
- Tickets, coupons, “lot” tokens in auctions

Standards like **ERC-1155** and multi-asset token modules in other ecosystems are built for this.

---

#### 3. Stablecoins: Tokens That Try _Not_ to Move

A **stablecoin** is a token that _aims_ to stay near a target price, usually 1 USD.

Why they matter:

- Give traders and LPs a stable numéraire.
- Provide a crypto-native “cash” layer for saving, collateral, and settling trades.
- Serve as the base asset in many strategies.

**3.1 Design Families**

At a high level:

1. **Fiat-backed / custodial**

   - Backed by bank deposits and short-dated Treasuries.
   - Examples: USDC, USDT.
   - You rely on an issuer’s reserves, reporting, and banking relationships.

2. **Crypto-collateralized**

   - Backed by on-chain collateral (e.g. ETH, staked ETH, other tokens) locked in vaults.
   - Examples: DAI, LUSD.
   - Over-collateralized, with on-chain liquidations.

3. **Algorithmic / hybrid**

   - Use a mix of collateral, governance tokens, and incentive mechanisms.
   - Examples: FRAX-style hybrids, past fully algorithmic experiments.
   - Often more complex and fragile.

4. **Yield-bearing stablecoins**
   - Try to stay around $1 _and_ pass yield from collateral or strategies to holders.
   - Examples: sDAI, RWA-backed stables, Ethena’s USDe/sUSDe.

The differences are in **what backs them**, **who can mint/redeem**, and **how they behave in stress**.

---

**3.2 Mint & Redeem: How Pegs Breathe**

Most stablecoins support some version of **mint / redeem**:

- **Mint**

  - You send collateral (cash, crypto, RWAs) to the issuer/protocol.
  - The system mints new stablecoins and sends them back.

- **Redeem**
  - You send the stablecoins to the issuer/protocol.
  - The system burns them and releases collateral.

This creates a simple arbitrage loop:

- If the stablecoin trades at **$1.03**, large players can mint at $1 and sell at $1.03 → price pushed down.
- If it trades at **$0.97**, they can buy at $0.97 and redeem for $1 of collateral → price pushed up.

Mint/redeem is the spring that pulls price back toward the peg.

Retail users usually experience this indirectly via CEX/DEX pricing; the actual mint/redeem path is often limited to KYC’d or technically sophisticated players.

---

**3.3 Two Classic Designs**

**Fiat-backed example: USDC**

Think of USDC as tokenized bank deposits:

- Circle receives dollars and short-term Treasuries as reserves.
- It mints USDC 1:1 for institutional clients.
- Regulated partners can redeem USDC back to dollars.

On-chain users mostly move USDC between themselves, trusting that “somebody out there” can always redeem for $1.

- **Pros:** simple, usually very close to $1, easy mental model.
- **Cons:** centralized, exposed to bank/regulator risk, yields go to issuer first.

**Crypto-collateralized example: DAI**

MakerDAO's DAI is minted when users open **vaults**:

- Alice locks $150 of ETH and mints, say, 100 DAI as debt.
- If ETH price falls and her collateral ratio drops too low, her vault can be liquidated.
- To close, she repays 100 DAI + fee and withdraws her ETH.

Arbitrage:

- When DAI trades above $1, users can mint more (by opening vaults) and sell.
- When it trades below $1, they can buy cheap DAI to repay debt.

Here, stability comes from over-collateralization, liquidations, and user incentives.

---

**3.4 Yield-Bearing Stablecoins & Ethena’s Delta-Neutral USDe**

Most classic stablecoins are essentially **“dumb cash”**: they aim to stay at $1, but they don’t natively pass through yield. Any yield is usually earned elsewhere (e.g. lending the stable on a money market).

**Yield-bearing stablecoins** try to do two things at once:

1. Stay close to $1, and
2. Pass on the yield earned by their underlying reserves or strategies.

Common approaches include:

- **Vault wrappers:** Deposit a stable into an interest-bearing vault and issue a wrapper token (e.g. DAI → sDAI).
- **Off-chain yield:** Hold reserves in Treasuries or money-market funds and share some of that yield with holders.
- **Trading strategies:** Run a (supposedly) hedged trading strategy and distribute profits.

Ethena’s design sits in the third bucket.

**Ethena’s USDe / sUSDe: Long Crypto, Short Derivatives**

Ethena issues **USDe**, a synthetic dollar backed by crypto collateral (primarily ETH, staked ETH, BTC and liquid stables) whose price risk is hedged using derivatives.

High-level mechanics:

- On the **long side**, the protocol holds spot or staked crypto collateral – e.g. 1 ETH at $2,000, or stETH, etc.
- On the **short side**, it opens a roughly equal notional **short position in perps and/or dated futures** on centralized derivatives exchanges.

Combined, this creates a **delta-neutral** book:

- If price goes **up**:

  - Long collateral gains value.
  - Short derivatives lose value.
  - Gains and losses largely offset.

- If price goes **down**:

  - Long collateral loses value.
  - Short derivatives gain value.
  - Again, they mostly cancel.

Because the hedge size is kept close to the backing notional, the **synthetic USD value of the backing** stays relatively stable, which is what supports USDe’s $1 target.

**Where the Yield Comes From**

While the **net price exposure ≈ 0**, the position can still earn yield. In practice, Ethena’s revenue comes from three main sources:

1. **Derivatives funding & basis**

   - Positive perpetual funding rates and futures basis typically pay the **short** side over time (longs pay shorts when funding is positive).

2. **Staking rewards on collateral**

   - When backing assets include staked ETH (e.g. stETH), the protocol earns the underlying staking yield.

3. **Yield on liquid stable reserves**

   - A portion of backing can sit in yield-bearing “cash-like” assets (e.g. tokenized T-bill style products or similar stable yield), especially when funding is low or negative.

USDe itself is just the **non-yielding synthetic dollar**. To access the yield, users **stake USDe and receive sUSDe**:

- You deposit USDe into the staking contract.
- You receive **sUSDe**, whose **value in USDe terms increases over time** as protocol revenue is deposited into the contract.
- Importantly, staking rewards can be **positive or zero, but not negative**: if protocol revenue is negative in a period (e.g. funding turns strongly negative), the **Ethena Reserve Fund** is intended to absorb the loss rather than passing it through to sUSDe holders.

**Tiny Numeric Example**

Ignore fees and haircuts for intuition:

- Start:

  - Long 1 ETH spot at $2,000
  - Short 1 ETH perp at $2,000

- ETH jumps to $2,200:

  - Spot: **+$200**
  - Short perp: **–$200**
  - Net: still ≈ $2,000 in value → ≈ $1 per USDe.

During this time, if funding is positive (longs pay shorts), the **short perp position earns extra dollars**. Those dollars are part of the protocol revenue that can be routed to sUSDe stakers.

**Key Risks & Trade-offs**

Ethena’s pitch is: **“more capital-efficient and yield-rich than pure over-collateralization, at the cost of derivatives complexity and new risk vectors.”** Some of the main risks:

- **Funding risk:** Funding can flip negative, meaning shorts pay longs. Ethena mitigates this via dynamic asset allocation into yield-bearing stables and a dedicated Reserve Fund, but it still introduces regime risk.
- **Derivatives & exchange risk:** The hedge depends on deep, liquid derivatives markets on centralized exchanges and safe custody / settlement arrangements. Exchange failures or dislocations can impair the hedge.
- **Collateral risk:** Use of LSTs (like stETH) adds smart contract and de-peg risk on top of ETH price risk.

In short: USDe/sUSDe offer a **crypto-native, yield-bearing “synthetic dollar”** backed by a delta-neutral derivatives strategy, rather than by bank deposits or Treasuries, with all the upside and complexity that implies.

---

**3.5 Stablecoin Price Dynamics: Big Picture**

Across designs, you can think of stablecoin price dynamics like this:

1. **Target** – usually $1.
2. **Backing** – what actually anchors that target (cash, Treasuries, ETH, derivatives, RWAs).
3. **Mechanism** – how you move between backing and token (mint/redeem, vaults, hedging).
4. **Arbitrage & demand** – traders exploiting deviations, plus users who want the asset for payments, trading, or yield.

When a stablecoin trades slightly off-peg:

- Strong backing + clear mint/redeem paths + liquid markets → deviations are usually arbitraged away quickly.
- Weak or opaque backing + fuzzy redemption rights → deviations can persist or spiral.

Ethena’s twist is to use **derivatives + collateral** instead of pure bank deposits or pure over-collateralized vaults, and to share yield from that structure via sUSDe.

As a reader, the key questions are:

- What is backing this stablecoin, specifically?
- Who can mint and redeem, under what conditions?
- What keeps price near $1 when things get messy, not just when things are calm?

Once you can answer those for USDC, DAI, LUSD, USDe, or any new design, you’re no longer just trusting the label “stablecoin” — you’re understanding the mechanism behind it.

---

#### 4. Primary vs Secondary Markets

Tokens don't just appear fully formed in your wallet. They move through a simple lifecycle.

**4.1 Primary Market: Birth and First Distribution**

The **primary market** is where tokens are first created and handed out.

Common paths:

- **Token Generation Event (TGE)** – contract deployment and initial mint.
- **Sales** – ICOs, IDOs, launchpad sales, auctions.
- **Airdrops** – to early users, LPs, or other target groups.
- **Team / investor allocations** – often with locks and vesting.
- **Ongoing emissions** – liquidity mining, staking rewards, protocol incentives.

A simple story:

**A new protocol launches a token. 10% goes to public sale, 20% to team (vesting over 4 years), 20% to investors, 50% reserved for future incentives. The sale, investor agreements, and initial minting are all primary-market events.**

Primary market design shapes long-term supply overhang, governance concentration, and incentive alignment.

---

**4.2 Secondary Market: Trading After Launch**

Once tokens exist, they trade in **secondary markets**:

- On **CEXs** with orderbooks (bids/asks, limit/market orders).
- On **DEXs** via AMMs or on-chain orderbooks.
- Over-the-counter (OTC) via RFQ desks or direct deals.

Secondary markets handle:

- **Price discovery** – what is 1 token worth right now?
- **Liquidity** – how big a trade can you do without moving price a lot?
- **Access** – who can buy/sell (KYC’d users vs anyone with a wallet).

On top of that, you get:

- Derivatives markets (perps, options, structured products).
- Lending markets where tokens are collateral or borrowable.

---

#### 5. A Simple Checklist for Any Token

When you meet a new token, run through this quick checklist:

1. **What category is it?**  
   Fungible, NFT, semi-fungible, or a position token?

2. **What does it represent?**  
   Cash, protocol rights, collateral claim, unique position, or real-world asset?

3. **What standard does it follow?**  
   ERC-20, ERC-721, ERC-1155, SPL, CW20, TRC-20, something custom?

4. **How is it created and destroyed?**  
   Who can mint/burn? Are there caps, vesting, emissions?

5. **Where does it trade?**  
   Which DEXs/CEXs? Is liquidity deep or thin?

6. **What are the hidden risks?**  
   Centralized issuer? Smart-contract risk? Oracle risk? Bridge risk?  
   For stablecoins: what backs it and who can redeem?

Once you can answer these, that icon in your wallet is no longer a mystery number – it’s a specific rulebook in a specific market with specific risks.

---

#### Further Reading

- Ethereum.org – [Token Standards Overview](https://ethereum.org/en/developers/docs/standards/tokens/)
- Circle – [USDC Overview](https://www.circle.com/usdc)
- MakerDAO – [DAI and the Maker Protocol](https://docs.makerdao.com/)
- Ethena – [How USDe Works](https://docs.ethena.fi/how-usde-works)

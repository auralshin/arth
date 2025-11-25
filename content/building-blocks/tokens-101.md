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

What a token *represents* can vary a lot:

- **Currency / unit of account** – e.g. USDC, DAI, USDT  
- **Protocol rights** – governance tokens, staking tokens  
- **Positions** – LP shares, vault shares, debt positions  
- **Unique objects** – art, tickets, domain names  
- **Real-world claims** – tokenized Treasuries, real estate, invoices

When you look at a token in your wallet, ask:

1. What does this *entitle* me to?  
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
- You don’t care *which* units you own, only how many.  
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

**Semi-fungible** = fungible *within a class*, but classes differ.

Example:

- Event tickets: all Saturday-GA tickets are interchangeable with each other, but differ from Sunday-VIP tickets.

On-chain, this pattern shows up as:

- Game items (same sword type, many copies)  
- Tickets, coupons, “lot” tokens in auctions  

Standards like **ERC-1155** and multi-asset token modules in other ecosystems are built for this.

---

#### 3. Stablecoins: Tokens That Try *Not* to Move

A **stablecoin** is a token that *aims* to stay near a target price, usually 1 USD.

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
   - Try to stay around $1 *and* pass yield from collateral or strategies to holders.  
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

**3.4 Yield-Bearing Stablecoins & Ethena's Delta-Neutral USDe**

Classic stables are **"dumb cash"**: they try to be stable, but do not pay you yield directly.

**Yield-bearing** stablecoins try to:

- Stay near $1, and  
- Pass on yield earned by underlying assets or strategies.

Common approaches:

- Deposit the stable into an interest-bearing vault and give you a **wrapper token** (e.g. DAI → sDAI).  
- Park reserves in Treasuries or money-market funds and share some of that yield.  
- Run a **hedged trading strategy** and distribute profits.

**Ethena's USDe / sUSDe: Long Spot, Short Perps**

Ethena takes the third route: a **delta-neutral synthetic dollar**.

High-level picture:

1. The protocol holds **crypto collateral** – e.g. 1 ETH at $2,000.  
2. It opens a **short perpetual future** for 1 ETH at $2,000 on an exchange.  
3. Combined, the position is roughly **delta-neutral**:

   - If price goes up:  
     - Collateral (long spot) gains value.  
     - Short perp loses, but the gains and losses roughly cancel.  

   - If price goes down:  
     - Collateral loses.  
     - Short perp gains, again roughly canceling.

4. Meanwhile, Ethena may earn:  
   - **Funding payments** from perps (if shorts are paid by longs).  
   - **Staking yield** on staked collateral (e.g. stETH yield).  
   - Yield on any cash-like reserves.

That relatively stable dollar value backs **USDe**.  
If you stake USDe, you receive **sUSDe**, which tracks a claim on the yield generated by this hedged book.

A tiny numeric example (ignoring fees):

- Start: 1 ETH spot at $2,000 and short 1 ETH perp at $2,000.  
- ETH jumps to $2,200:  
  - Spot: +$200,  
  - Short: –$200,  
  - Net: roughly $2,000 in value → still ≈ $1 per USDe.  
- During this time, if shorts are *paid* funding, the strategy earns extra dollars which can go to sUSDe holders.

**Risks:**

- Funding can flip negative (shorts pay longs).  
- Derivatives liquidity depends on centralized exchanges.  
- Extreme moves or exchange failures can disturb the hedge.

Ethena’s pitch is: **more capital-efficient and yield-rich** than pure over-collateralization, at the cost of derivatives complexity.

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

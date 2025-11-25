### Token Standards

> info **Metadata**
> Level: Beginner–Intermediate • Prerequisites: Tokens 101, What “On-Chain” Means • Tags: [token-standards, erc-20, erc-721, erc-1155, spl, cw20, move, aptos, sui, cross-chain]

Token standards are the **interfaces** that make tokens predictable.

Without them:

* Every token would have its own custom functions.
* Wallets and DEXs would need bespoke code for each asset.
* Composability (plugging protocols together) would barely exist.

With standards:

* A DEX can list any ERC-20 without changing its core code.
* A lending protocol can accept new CW20, SPL, or Move-based tokens using the same logic.
* NFT marketplaces can handle arbitrary collections via ERC-721 or Metaplex (Solana) or Move NFT standards.

This page is a modular map of major standards across ecosystems and how to work with them safely.

---

#### 1. Why Standards Exist

A token standard usually answers four questions:

1. **How do I query balances?**
2. **How do I move tokens?**
3. **How do I grant/revoke spending permission?**
4. **How do I handle metadata?** (especially for NFTs)

Once these are fixed, every wallet, DEX, or protocol can integrate tokens with much less effort.

From your perspective, standards are what make DeFi feel consistent: balances, swaps, approvals, NFTs – all follow familiar patterns.

---

#### 2. Ethereum & EVM Standards

Ethereum’s **ERC** (Ethereum Request for Comment) standards are still the reference point for most of DeFi. Most EVM chains (Polygon, BNB Chain, Arbitrum, Optimism, Avalanche C-Chain, Base, etc.) reuse them with little or no change.

##### 2.1 ERC-20 – Fungible Tokens

**What it is:** the default standard for fungible tokens.

Fungible = one unit is indistinguishable from another (like cash or a share of stock).

Core interface (conceptually):

* `totalSupply()` – total number of tokens
* `balanceOf(address)` – balance of an address
* `transfer(to, amount)` – send tokens
* `approve(spender, amount)` – grant spending permission
* `allowance(owner, spender)` – check remaining permission
* `transferFrom(from, to, amount)` – move tokens using that permission

Events:

* `Transfer(from, to, value)`
* `Approval(owner, spender, value)`

**Typical user flow (swap on a DEX):**

1. You call `approve(router, amount)` on the token contract.
2. You call `swap(...)` on the DEX router.
3. The router calls `transferFrom(you, pool, amount)` and sends you output tokens via `transfer(...)`.

This **approve → transferFrom** pattern is the backbone of DeFi.

Examples of ERC-20-style tokens:

* Stablecoins: USDC, USDT, DAI
* Governance: UNI, AAVE, MKR
* Wrapped assets: wETH, wBTC
* LP/vault shares in many protocols

For reference implementations, see the [Ethereum token docs](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/) and [OpenZeppelin’s ERC-20 contracts](https://docs.openzeppelin.com/contracts/4.x/erc20).

###### Useful ERC-20 Extensions

You’ll often see these mentioned in docs:

* **ERC-2612 (Permit)** – approve via an off-chain signature instead of an on-chain `approve`. Lets a protocol do “permit + action” in one transaction, improving UX and gas.
* **ERC-4626 (Tokenized Vault)** – standard interface for yield-bearing vaults: deposit/withdraw/mint/redeem plus “preview” functions. Makes vaults easier to integrate into aggregators and lending protocols.
* **ERC-777 / ERC-1363** – add “hooks” or “transfer & call” semantics so receiving contracts can react to tokens. More expressive, but less widely used than plain ERC-20 + 2612 + 4626.

---

##### 2.2 ERC-721 – Non-Fungible Tokens (NFTs)

**What it is:** the main standard for NFTs.

Each token has a unique `tokenId` with its own owner and metadata.

Key pieces:

* `balanceOf(owner)` – how many NFTs a wallet owns
* `ownerOf(tokenId)` – who owns this NFT
* `transferFrom` / `safeTransferFrom` – move an NFT
* `approve` / `setApprovalForAll` – grant transfer permission
* `tokenURI(tokenId)` – link to JSON metadata (image, attributes, etc.)

Extensions you’ll see:

* **ERC-2981** – standard royalty info for NFTs (so marketplaces can read royalties consistently).
* **ERC-4907** – rentable NFTs with separate “owner” and time-limited “user” roles.

Anything that follows ERC-721 can be listed by generic NFT marketplaces and displayed by standard wallets.

---

##### 2.3 ERC-1155 – Multi-Token / Semi-Fungible

**What it is:** a single contract that can manage many token types, fungible or not.

Each `id` represents a token type:

* `id = 1` → “Gold Coins” (fungible)
* `id = 2` → “Sword of Fire” (NFT)
* `id = 3` → “Saturday Ticket” (semi-fungible)

Benefits:

* Batch transfers and mints are cheaper
* Great for games, lootboxes, and collections with many item types
* Useful when you need both fungible and non-fungible items in the same system

---

##### 2.4 EVM Sidechains and L2s

Most EVM environments reuse these standards directly:

* **BNB Chain** – **BEP-20**, effectively ERC-20-compatible.
* **Polygon, Arbitrum, Optimism, Base, Avalanche C-Chain** – ERC-20/721/1155 directly.
* **zkEVMs (Scroll, Linea, etc.)** – same story.

Bridges typically **lock** a token on the origin chain and **mint a representation** on the destination chain using the same interface (ERC-20, ERC-721, etc.).

---

#### 3. Solana: SPL & Metaplex

Solana uses a very different account-based architecture, but still standardizes token behavior.

##### 3.1 SPL Tokens (Fungible)

The **SPL token program** is the main standard for fungible tokens on Solana.

Core ideas:

* A **Mint account** defines the token (decimals, authorities).
* Each user holds tokens in an **associated token account** (one per mint per owner).
* Transfers move balances between these token accounts under the rules of the token program.

Examples:

* USDC on Solana
* Many DeFi and game tokens traded on Raydium, Orca, and other DEXs.

Docs: [Solana SPL Token Program](https://spl.solana.com/token).

##### 3.2 NFTs via Metaplex

NFTs on Solana:

* Are usually SPL tokens with **supply = 1**, and
* Use the **Metaplex Token Metadata** program for NFT metadata (name, image, attributes, royalties, creators).

Metaplex adds:

* Verified collections,
* Royalties rules,
* Creator attribution and collection verification.

If you stick to SPL + Metaplex patterns, wallets and marketplaces “just work” with your NFTs.

---

#### 4. Cosmos & IBC: CW20, CW721, ICS-20

Cosmos is a network of app-chains linked by **IBC** (Inter-Blockchain Communication).

##### 4.1 Native Assets

Each Cosmos SDK chain has one or more **native tokens** (e.g., ATOM, OSMO) tracked directly in its state.

##### 4.2 CosmWasm Tokens: CW20 & CW721

For smart-contract tokens:

* **CW20** – fungible tokens, similar to ERC-20 (balances, transfers, allowances).
* **CW721** – NFTs, similar to ERC-721.

These are used heavily on CosmWasm-enabled chains for DeFi and NFTs.

##### 4.3 IBC & ICS-20 (Interchain Tokens)

IBC allows tokens to move between chains. **ICS-20** is the standard application for **fungible token transfers** over IBC.

Rough process:

* A token is locked or escrowed on the source chain.
* An IBC channel sends a proof to the destination chain.
* The destination chain mints an IBC “voucher” token.

ICS-20 defines how denominations are tracked so any IBC-aware chain can understand where a token came from (via `DenomTrace` and path information).

There is also work on **ICS-721** for NFT transfers across chains.

Good starting points:

* [CosmWasm ICS-20 docs](https://cosmwasm.cosmos.network/ibc/ics20)
* [Interchain Developer Academy – ICS-20](https://ida.interchain.io/tutorials/6-ibc-dev/)

---

#### 5. Aptos & Move Standards

Aptos is a Move-based L1 that has been actively evolving its token standards.

There are two generations to know:

1. **Legacy Coin & Token standards**
2. The new **Fungible Asset (FA)** and **Digital Asset** standards

##### 5.1 Legacy: Coin & Token

Originally, Aptos had:

* A **Coin** standard for fungible assets (including the APT gas token).
* An **Aptos Token** standard for NFTs, SFTs, and flexible assets.

The Token standard could represent:

* Fungible tokens,
* Semi-fungible tokens,
* NFTs,

but required a separate resource account per asset, which added complexity for wallets and DeFi.

##### 5.2 New: Fungible Asset (FA)

In 2023–2025 Aptos introduced the **Fungible Asset (FA)** standard to replace the old Coin model.

Key ideas:

* Fungible tokens are now **Move objects**, not just account-bound resources.
* FA aims to be a **single unified standard** for fungible assets, including gas (APT) itself.
* It improves metadata handling, composability, and security compared to the legacy Coin module.

Aptos is in the process of migrating APT and other major assets to FA, making it the default going forward. See:

* [Aptos Fungible Asset Standard docs](https://aptos.dev/build/smart-contracts/fungible-asset)
* [Aptos Standards overview](https://aptos.dev/build/smart-contracts/aptos-standards)
* [“Fungible Assets 101” blog](https://medium.com/aptoslabs/fungible-assets-101-introducing-aptos-fa-token-standard-f9ff01bc4c17)

##### 5.3 Digital Asset / NFT Side

Aptos also introduced a **Digital Asset** standard to replace the older Token standard for NFTs and richer assets.

This provides:

* Object-based NFTs and SFTs,
* Better metadata and collection management,
* Cleaner integration with wallets and marketplaces.

For you as a user: anything following FA + Digital Asset standards should feel consistent across Aptos DeFi and NFT apps.

---

#### 6. Sui: Coin & Currency Standard

Sui is another Move-based L1, famous for its **object-centric** design and parallel execution.

##### 6.1 Coin Objects

Sui exposes a standard implementation for fungible assets via the `sui::coin` module.

Developers:

* Import `sui::coin`,
* Define a new coin type,
* Use Sui’s standard functions for minting, burning, splitting, and merging coin objects.

Because coins are first-class objects:

* Each coin is an object with an owner and unique ID,
* Transactions can parallelize when they touch disjoint objects,
* UIs can display coins using Sui’s object-display metadata.

##### 6.2 Currency Standard

The **Sui Currency Standard** builds on this to unify fungible token behavior, metadata, and regulatory features.

Highlights:

* Standardized metadata and supply tracking for coins.
* Support for regulated coins (e.g., adding deny-lists for addresses).
* A registry so wallets and CEX/DeFi protocols can handle new coins like SUI itself, with minimal extra logic.

Docs:

* [Sui Currency Standard](https://docs.sui.io/standards/currency)
* [Sui Standards overview](https://docs.sui.io/standards)

For a more narrative explanation, see 20Lab’s write-up on [Sui’s token standard](https://20lab.app/blog/sui/).

---

#### 7. Supra

**Supra** is a vertically integrated L1 that aims to support multiple VMs (EVM, MoveVM, and eventually others) in one chain.

What this means in practice:

* On the **EVM side**, token contracts can follow familiar ERC-20 / ERC-721 patterns.
* On the **Move side**, Supra can adopt Move-style token modules similar to Aptos/Sui (details are still evolving as Supra’s dev docs roll out).
* The native **SUPRA** token acts as the unified utility token for the Supra ecosystem (gas, staking, and protocol usage).

Because Supra runs multiple VMs, you’ll likely encounter both ERC-style and Move-style standards depending on which environment a protocol chooses.

Official site: [supra.com](https://supra.com/).

Research / token info: KuCoin and similar exchanges publish background on SUPRA’s role as native token.

---

#### 8. Polkadot / Substrate

##### 8.1 Native Assets & Pallets

Substrate-based chains define assets inside their runtime:

* A **Balances** pallet manages the primary native token.
* Additional pallets (like ORML multi-asset) can manage multiple fungible assets.

These are closer to “native” L1 tokens than smart-contract tokens.

##### 8.2 Smart-Contract Standards (ink!)

On chains that expose ink! smart contracts:

* **PSP22** – fungible, ERC-20-like.
* **PSP34** – NFT, ERC-721-like.

The pattern is the same: once you implement these interfaces, wallets and DeFi apps can integrate you generically.

---

#### 9. Tron & Cardano (Quick Notes)

##### Tron

* **TRC-10** – simple protocol-level tokens.
* **TRC-20** – smart-contract fungible tokens, ERC-20-style.
* USDT-Tron (USDT on Tron) is a TRC-20 token, widely used for low-fee stablecoin transfers.

##### Cardano

* Supports **native multi-asset tokens** directly in the ledger.
* Scripts and CIPs (Cardano Improvement Proposals) define metadata standards for fungible tokens and NFTs.
* Marketplaces and wallets implement these CIPs to ensure consistent behavior for Cardano NFTs and tokens.

---

#### 10. Integration Risks & Best Practices

Standards make life easier, but there are sharp edges.

##### 10.1 Non-Standard ERC-20s

Some tokens deviate from the vanilla ERC-20 spec:

* Don’t return a boolean from `transfer` / `transferFrom`.
* Charge fees on transfer (you send 100, recipient gets 98).
* Rebase (balances change automatically over time).

Mitigations:

* Use libraries like OpenZeppelin’s `SafeERC20` that handle missing return values.
* For unknown tokens, check balances before and after transfers.
* Be careful using rebase tokens in lending/vault protocols (they can break accounting assumptions).

##### 10.2 Approvals & Security

Risks:

* **Front-running**: changing approvals from non-zero to non-zero can be front-run.
* **Unlimited approvals**: if a contract you approved is exploited, your entire balance can be drained.

Mitigations:

* Use `increaseAllowance` / `decreaseAllowance` or Permit (ERC-2612) where possible.
* Periodically revoke approvals you no longer need.
* UIs should clearly show what the user is approving.

##### 10.3 Decimals & Units

Not all tokens have 18 decimals:

* Many stablecoins use 6 decimals.
* Some Bitcoin-wrapped assets use 8.

Always query `decimals()` (or equivalent metadata) and normalize values before computing prices, APYs, or slippage.

##### 10.4 Bridge & Representation Risk

Bridged tokens add another layer of risk:

* Smart-contract risk of the bridge itself.
* Operational risk if the bridge is custodied/centralized.
* Multiple representations of “the same” asset on a chain (e.g., several different bridged USDCs).

Mitigations:

* Verify token addresses from official docs.
* Prefer canonical or “official” bridge routes when they exist.
* Treat bridged assets as having additional risk compared to native ones.

---

#### 11. Cheat Sheet: “What Standard Am I Looking At?”

* **Ethereum / EVM** – ERC-20 (fungible), ERC-721 (NFT), ERC-1155 (multi-token)
* **Solana** – SPL (fungible), SPL + Metaplex (NFT)
* **Cosmos** – CW20 (fungible), CW721 (NFT), ICS-20 (IBC fungible transfers)
* **Aptos** – Fungible Asset (FA) for fungible tokens, Digital Asset for NFTs/SFTs
* **Sui** – `sui::coin` + Currency Standard for fungible tokens, Move-based object NFTs
* **Supra** – ERC-style tokens on EVM, Move-style tokens on MoveVM; SUPRA as native L1 token
* **Polkadot / Substrate** – PSP22 (fungible), PSP34 (NFT), plus native runtime assets
* **Tron** – TRC-20 (fungible)
* **Cardano** – native multi-asset tokens with CIP-defined metadata for fungible tokens and NFTs

If you know which family a token belongs to, you already understand most of how it behaves: how to move it, approve it, and plug it into DeFi.

---

#### Further Reading

* Ethereum – [Token Standards Overview](https://ethereum.org/en/developers/docs/standards/tokens/)
* Solana – [SPL Token Program](https://spl.solana.com/token)
* Cosmos – [CosmWasm ICS-20 docs](https://cosmwasm.cosmos.network/ibc/ics20) and [Interchain Academy – ICS-20](https://ida.interchain.io/tutorials/6-ibc-dev/)
* Aptos – [Aptos Standards](https://aptos.dev/build/smart-contracts/aptos-standards) & [Fungible Asset Standard](https://aptos.dev/build/smart-contracts/fungible-asset)
* Sui – [Currency Standard](https://docs.sui.io/standards/currency) & [Standards Overview](https://docs.sui.io/standards)
* Supra – [Supra official site](https://supra.com/) and exchange research pages for SUPRA

You don’t need to memorize all of this. The goal is to recognize the *shape* of a token’s standard so you can quickly answer: “How does this thing behave, and what risks come with it?”

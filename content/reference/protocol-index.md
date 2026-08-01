### Protocol Index

> info **Metadata** Level: Beginner | Prerequisites: What Is DeFi | Tags: reference, defi, protocols, index, lookup

An A–Z of the named on-chain protocols referred to across Arth. Each entry says what the protocol is in one line and which design archetype it belongs to, so you can go from a name you have seen in a chart or a post to the mechanism that explains it.

The entries describe *designs*, not investments. Nothing here is a recommendation, a security assessment, or a claim about size, and no figures are quoted because they would be stale by the time you read them.

> info **Want the mechanism rather than the name?** [Protocol Archetypes](/reference/protocols) sets out each design category — AMMs, lending markets, stablecoin mechanisms, perpetual venues, oracles, bridges, staking — with its key mechanism and its main risk.

> warning **Protocols change; this index does not track versions** Designs are revised, governance reparameterises them, and successor versions can differ fundamentally from their predecessors. Treat every line below as an orientation, and read the protocol's own current documentation before relying on any detail.

---

#### A

- **Aave** — Pooled lending market where suppliers and borrowers meet in shared asset pools with utilisation-driven rates. Archetype: pooled lending market. See [Lending Architecture](/protocols/lending-architecture).
- **Across** — Cross-chain bridge in which relayers front funds on the destination chain and are reimbursed once the source deposit is verified. Archetype: liquidity network bridge. See [Bridges & Cross-Chain](/protocols/bridges).
- **Aerodrome** — Vote-escrow automated market maker on Base, in the design lineage of Velodrome, directing emissions by locked-token vote. Archetype: AMM with vote-escrow governance. See [Governance](/building-blocks/governance).
- **API3** — Oracle network in which the data providers themselves operate the feeds rather than delegating to third-party node operators. Archetype: first-party oracle. See [Oracle Designs](/protocols/oracle-designs).
- **Aura Finance** — Aggregator built on top of Balancer's vote-escrow system, pooling governance power and passing boosted rewards to depositors. Archetype: yield aggregator. See [Yield Farming](/building-blocks/yield-farming).
- **Axelar** — Cross-chain messaging network secured by its own proof-of-stake validator set. Archetype: generic messaging layer. See [Bridges & Cross-Chain](/protocols/bridges).

---

#### B

- **Balancer** — Automated market maker whose pools hold assets at configurable weights, using a weighted geometric mean invariant. Archetype: weighted-pool AMM. See [AMMs In Depth](/protocols/amms-depth).
- **Bancor** — One of the earliest automated market maker designs; later versions offered single-sided deposits and impermanent-loss protection. Archetype: constant-function AMM. See [AMMs 101](/building-blocks/amms-101).
- **Benqi** — Lending market on Avalanche, alongside a liquid staking product for the chain's native asset. Archetype: pooled lending market. See [Lending Architecture](/protocols/lending-architecture).

---

#### C

- **Chainlink** — Decentralised oracle network whose node operators publish aggregated price feeds on-chain. Archetype: reporter network, push model. See [Oracle Designs](/protocols/oracle-designs).
- **Circle (USDC)** — Issuer of USDC, a fiat-backed stablecoin redeemable at par by authorised participants. Archetype: fiat-backed stablecoin. See [Stablecoins](/building-blocks/stablecoins).
- **Compound** — Pooled lending market and one of the earliest implementations of algorithmic, utilisation-based interest rates. Archetype: pooled lending market. See [Lending Architecture](/protocols/lending-architecture).
- **Convex Finance** — Aggregator that concentrates Curve vote-escrow power and passes the resulting reward boost to depositors. Archetype: yield and governance aggregator. See [Yield Farming](/building-blocks/yield-farming).
- **CoW Protocol** — Batch-auction trading protocol in which solvers compete to settle a batch, including by matching orders directly against one another. Archetype: batch auction and intent venue. See [Swaps & DEXs](/building-blocks/swaps-dexs).
- **Curve** — Automated market maker specialised in assets expected to trade near parity, using an invariant that is nearly flat around the peg. Archetype: stable-asset AMM. See [AMMs In Depth](/protocols/amms-depth).
- **crvUSD** — Curve's overcollateralised stablecoin, which converts collateral gradually across a price range rather than at a single liquidation threshold. Archetype: overcollateralised CDP stablecoin. See [Stablecoin Designs](/protocols/stablecoin-designs).

---

#### D

- **DAI** — Overcollateralised stablecoin minted against collateral locked in MakerDAO vaults. Archetype: overcollateralised CDP stablecoin. See [Stablecoin Designs](/protocols/stablecoin-designs).
- **Dune Analytics** — Platform for querying decoded blockchain data with SQL and publishing dashboards. Not a protocol; an analytics tool. See [Dune Analytics](/data-tooling/dune-analytics).
- **dYdX** — Perpetual futures venue built around a central limit order book; later versions run on a dedicated application chain. Archetype: order-book perpetual venue. See [Perp DEX](/protocols/perp-dex).

---

#### E

- **EigenLayer** — Restaking protocol that allows staked ETH to secure additional services under opt-in slashing conditions. Archetype: restaking and shared security. See [Staking & Restaking](/protocols/staking-restaking).
- **Ethena** — Issues USDe, a synthetic dollar backed by crypto collateral whose price risk is hedged with short perpetual positions. Archetype: delta-neutral synthetic stablecoin. See [Stablecoin Designs](/protocols/stablecoin-designs).
- **Euler** — Lending protocol built around modular, permissionless market creation. Archetype: isolated lending market. See [Lending Architecture](/protocols/lending-architecture).

---

#### F

- **Flashbots** — Research and infrastructure effort behind transaction bundles, private submission channels, and MEV-Boost. Archetype: ordering infrastructure. See [Mitigation & Defenses](/transaction-ordering-mev/mitigation-and-defenses).
- **Frax** — Stablecoin protocol issuing the FRAX unit, alongside a liquid staking token and related products. Archetype: stablecoin protocol. See [Stablecoin Designs](/protocols/stablecoin-designs).

---

#### G

- **GHO** — Aave's native overcollateralised stablecoin, minted against collateral supplied to the Aave protocol. Archetype: overcollateralised CDP stablecoin. See [Stablecoin Designs](/protocols/stablecoin-designs).
- **GMX** — Perpetual venue where traders take positions against a shared liquidity pool, with prices supplied by an oracle rather than a book. Archetype: pool-backed perpetual venue. See [Perp DEX](/protocols/perp-dex).

---

#### H

- **Hop Protocol** — Bridge using bonders and destination-side pools to provide fast transfers between rollups. Archetype: liquidity network bridge. See [Bridges & Cross-Chain](/protocols/bridges).
- **Hyperliquid** — Perpetual futures venue running an on-chain central limit order book on its own chain. Archetype: order-book perpetual venue. See [Perp DEX](/protocols/perp-dex).

---

#### J

- **Jito** — Solana liquid staking token, together with MEV-related infrastructure for Solana validators. Archetype: liquid staking plus ordering infrastructure. See [Staking & Restaking](/protocols/staking-restaking).
- **Jupiter** — Aggregator and router on Solana, which also operates a perpetual trading product. Archetype: aggregator and router. See [Swaps & DEXs](/building-blocks/swaps-dexs).

---

#### K

- **Kyber Network** — Trading protocol and aggregator whose pools support programmable, dynamic market-making curves. Archetype: AMM and aggregator. See [Swaps & DEXs](/building-blocks/swaps-dexs).

---

#### L

- **LayerZero** — Omnichain messaging protocol in which each application configures its own verification stack. Archetype: generic messaging layer. See [Bridges & Cross-Chain](/protocols/bridges).
- **Lido** — Liquid staking protocol issuing stETH, a transferable token representing staked ETH and its accrued rewards. Archetype: liquid staking. See [Staking & Restaking](/protocols/staking-restaking).
- **Liquity** — Immutable overcollateralised stablecoin protocol; LUSD is backed by ETH, with a stability pool absorbing liquidations. Archetype: overcollateralised CDP stablecoin. See [Stablecoin Designs](/protocols/stablecoin-designs).

---

#### M

- **MakerDAO** — Issuer of DAI and the canonical overcollateralised vault design, with governance setting collateral types and risk parameters. Archetype: overcollateralised CDP stablecoin. See [Stablecoin Designs](/protocols/stablecoin-designs).
- **Maverick Protocol** — Automated market maker whose liquidity can be configured to move automatically as price moves. Archetype: concentrated-liquidity AMM. See [Concentrated Liquidity](/protocols/concentrated-liquidity).
- **MEV-Boost** — Middleware that lets Ethereum validators outsource block construction to a competitive builder market via relays. Archetype: block-building marketplace. See [How Blocks Form](/transaction-ordering-mev/how-blocks-form).
- **Morpho** — Lending protocol; originally an efficiency layer over existing pools, later a base layer of isolated markets with configurable parameters. Archetype: isolated lending market. See [Lending Architecture](/protocols/lending-architecture).

---

#### N

- **Notional Finance** — Fixed-rate, fixed-term lending and borrowing built on tokenised claims to future cash. Archetype: fixed-rate lending. See [Lending Architecture](/protocols/lending-architecture).

---

#### O

- **Orca** — Automated market maker on Solana offering concentrated-liquidity pools. Archetype: concentrated-liquidity AMM. See [Concentrated Liquidity](/protocols/concentrated-liquidity).

---

#### P

- **PancakeSwap** — Automated market maker and exchange that began on BNB Chain and later deployed across several chains. Archetype: constant-product AMM. See [AMMs 101](/building-blocks/amms-101).
- **Pendle** — Splits yield-bearing assets into separately tradable principal and yield tokens. Archetype: yield tokenisation. See [Yield Farming](/building-blocks/yield-farming).
- **Pyth** — Oracle network in which trading firms and exchanges publish prices directly, consumed by applications on a pull basis. Archetype: first-party feed, pull model. See [Oracle Designs](/protocols/oracle-designs).

---

#### R

- **Raydium** — Automated market maker and exchange on Solana. Archetype: constant-product AMM. See [AMMs 101](/building-blocks/amms-101).
- **Rocket Pool** — Decentralised liquid staking protocol in which independent node operators post collateral and rETH is issued to depositors. Archetype: liquid staking. See [Staking & Restaking](/protocols/staking-restaking).

---

#### S

- **Spark** — Lending market associated with the MakerDAO ecosystem, offering borrowing against collateral and a savings rate on DAI. Archetype: pooled lending market. See [Lending Architecture](/protocols/lending-architecture).
- **Stargate** — Bridge built on LayerZero messaging that transfers assets out of unified liquidity pools. Archetype: liquidity network bridge. See [Bridges & Cross-Chain](/protocols/bridges).
- **SushiSwap** — Automated market maker and exchange that began as a fork of the constant-product design and added further products around it. Archetype: constant-product AMM. See [AMMs 101](/building-blocks/amms-101).
- **Synthetix** — Synthetic asset protocol in which stakers collectively back the outstanding synthetic positions through a shared debt pool. Archetype: pooled-collateral synthetics. See [Perp DEX](/protocols/perp-dex).

---

#### T

- **Tellor** — Oracle in which staked reporters submit values that can be challenged through a dispute process. Archetype: reporter network with disputes. See [Oracle Designs](/protocols/oracle-designs).
- **Tether (USDT)** — Issuer of USDT, a fiat-backed stablecoin. Archetype: fiat-backed stablecoin. See [Stablecoins](/building-blocks/stablecoins).
- **The Graph** — Indexing protocol that serves queryable subgraphs of on-chain data to applications. Not a financial protocol; data infrastructure. See [The Graph](/data-tooling/the-graph).

---

#### U

- **UMA** — Optimistic oracle that resolves arbitrary data requests through proposal, challenge, and escalation rather than continuous reporting. Archetype: optimistic oracle. See [Oracle Designs](/protocols/oracle-designs).
- **Uniswap** — The reference automated market maker: v2 uses the constant-product invariant, v3 introduced concentrated liquidity, and v4 adds hooks that run custom logic around swaps. Archetype: constant-product and concentrated-liquidity AMM. See [Concentrated Liquidity](/protocols/concentrated-liquidity).

---

#### V

- **Velodrome** — Vote-escrow automated market maker on Optimism, designed to direct emissions towards the pools that generate fees. Archetype: AMM with vote-escrow governance. See [Governance](/building-blocks/governance).
- **Venus** — Pooled lending market on BNB Chain. Archetype: pooled lending market. See [Lending Architecture](/protocols/lending-architecture).

---

#### W

- **Wormhole** — Cross-chain messaging protocol secured by a guardian set that attests to source-chain events. Archetype: generic messaging layer. See [Bridges & Cross-Chain](/protocols/bridges).

---

#### Y

- **Yearn** — Yield aggregator whose vaults automate strategies on behalf of depositors and issue share tokens against them. Archetype: yield aggregator or vault. See [Yield Farming](/building-blocks/yield-farming).

---

#### Numerals

- **0x** — Trading infrastructure providing order formats, settlement contracts, and aggregation interfaces used by other applications. Archetype: aggregator and settlement layer. See [Swaps & DEXs](/building-blocks/swaps-dexs).
- **1inch** — Aggregator that splits an order across venues to reduce total execution cost. Archetype: aggregator and router. See [Swaps & DEXs](/building-blocks/swaps-dexs).

---

#### What Is Deliberately Not Here

This index errs towards omission. A wrong description of a real protocol is worse than no entry at all, so several categories are absent on purpose.

- **Protocols whose current design could not be stated confidently.** Several restaking networks and liquid restaking tokens are widely referenced but have revised their mechanisms; the archetype is covered under restaking in [Protocol Archetypes](/reference/protocols) without naming individual issuers.
- **Anything requiring a figure to be meaningful.** Total value locked, fee revenue, market share, and yields are all omitted. They change faster than a reference page can, and a stale number reads as a current claim.
- **Version-specific behaviour.** Where a protocol has materially redesigned itself between versions, the entry describes the lineage rather than asserting which version you are looking at.
- **Security judgements.** Whether a protocol has been audited, exploited, or hardened is not recorded here. See [Smart Contract and Protocol Risk Overview](/risk/smart-contract) for how to think about that question instead.

---

#### See Also

* [Protocol Archetypes](/reference/protocols)
* [What Is DeFi](/welcome/what-is-defi)
* [AMMs 101](/building-blocks/amms-101)
* [Lending & Borrowing](/building-blocks/lending-borrowing)
* [Stablecoins](/building-blocks/stablecoins)
* [Glossary](/reference/glossary)

---

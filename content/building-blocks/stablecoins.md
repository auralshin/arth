### Stablecoins

> info **Metadata** Level: All | Prerequisites: Tokens 101, What Is DeFi | Tags: stablecoins, peg, collateral, money, risk

Stablecoins aim to maintain a relatively stable value, typically against a fiat currency such as the US dollar. They act as the primary settlement asset, unit of account, and collateral in much of DeFi. Design choices for stablecoins influence user trust, liquidity across markets, and the behaviour of protocols that rely on them.

Different designs use different sources of stability: external reserves held by custodians, on-chain collateral subject to liquidation, algorithmic mechanisms that adjust supply and incentives, or hybrids of these approaches. Each choice creates a distinct pattern of risk: custody risk, collateral risk, market risk, or reflexive dynamics.

---

#### Roles in the DeFi Stack

Stablecoins appear in several roles simultaneously. Traders use them as quote currency on DEXs and as collateral for perps. Lending protocols accept them as both borrowable assets and repayment units. Structured products reference them as numeraire for returns. In many systems, stablecoin balances also represent user savings and emergency dry powder.

Because of this centrality, disruptions in a major stablecoin propagate widely. Depegs, freezes, or redemptions can create sudden shifts in liquidity, prompt liquidations across protocols, and alter relative pricing between assets.

---

#### Design Axes

Several key dimensions define a stablecoin design:

- Collateral backing: fiat reserves, crypto collateral, real-world assets, or combinations.  
- Collateralisation level: fully-backed, overcollateralised, fractionally reserved.  
- Peg mechanism: direct redemption, arbitrage bands, algorithmic rebalancing of supply.  
- Governance and control: centralised issuer, DAO-controlled system, or mixed.  

Fiat-backed coins rely on off-chain reserves and legal structures. Overcollateralised on-chain coins enforce collateral constraints through smart contracts and liquidations. Algorithmic designs adjust supply or incentives dynamically in response to market prices, often with strong reflexivity.

---

#### Peg Behaviour and Market Dynamics

Peg stability is not simply a function of design intent; it emerges from incentives and market structure. A stablecoin with credible, accessible redemption tends to trade near its target as arbitrageurs exploit deviations. If redemption is slow, restricted, or uncertain, the market price can wander away from the target and stay there for extended periods.

On-chain stablecoins that rely on collateral and liquidations maintain their peg by making it profitable to mint new units when prices are high and to redeem or burn when prices are low. Stress scenarios test whether the collateral can be liquidated at prices assumed by the protocol and whether market depth is sufficient to absorb flows without causing further instability.

---

#### Risk Categories

Stablecoins bundle several types of risk:

- Collateral risk: deterioration in the value, liquidity, or legal enforceability of backing assets.  
- Governance and legal risk: changes in policy, freezes, blacklists, or regulatory intervention.  
- Market and liquidity risk: shallow markets that amplify depegs and make redemptions costly.  
- Design risk: fragile peg mechanisms that fail under stress or create perverse incentives.  

Risk analysis often looks at collateral composition, redemption rules, historical depeg events, and correlations with other assets used elsewhere in the DeFi stack.

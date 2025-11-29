### Staking & Restaking

> info **Metadata** Level: Advanced | Prerequisites: Execution Environments, Tokenomics, Risk Types | Tags: staking, restaking, pos, security, yield, systemic-risk

Staking is the mechanism by which proof-of-stake (PoS) networks secure consensus. Validators lock stake, participate in block production or validation, and earn rewards while risking penalties or slashing for misbehaviour. Restaking extends this concept by allowing staked or staking-derived assets to secure additional protocols or services.

From a systemic point of view, staking ties token economics to network security, and restaking overlays further obligations on the same collateral. This stacking can improve capital efficiency but also creates new correlated risks.

---

#### Validator Economics

In PoS systems, validators or their delegators lock tokens as stake. Rewards come from block issuance, transaction fees, and sometimes MEV flows. Costs include infrastructure, operational risk, and the opportunity cost of capital.

Slashing rules define how much stake is lost for faults such as double-signing, downtime, or censorship. The magnitude and likelihood of slashing events affect required yields and validator behaviour. Concentration of stake in large operators influences both economic and governance outcomes.

---

#### Liquid Staking Tokens

Liquid staking protocols issue tokens that represent claims on staked positions. These tokens trade freely and can serve as collateral in other protocols. This decouples staking participation from the need to lock capital completely, improving liquidity but making risk propagation more complex.

The value of a liquid staking token depends on underlying stake, accrued rewards, protocol fees, and any slashing losses. If the token is widely used as collateral, a slashing event or loss of confidence can have effects beyond the base chain, affecting lending markets, DEXs, and derivatives that reference the token.

---

#### Restaking and Shared Security

Restaking frameworks allow already staked assets or their liquid representations to be pledged as security for additional services: oracle networks, data availability layers, or other application-specific protocols. In these systems, misbehaviour in the secondary protocol can lead to penalties on stake that also secures the base chain.

This creates shared security and shared risk. A single stake position becomes subject to multiple sets of rules and failure conditions. Designing slashing conditions, correlation limits, and segregation between different restaking commitments becomes essential to avoid cascading failures.

---

#### Systemic Considerations

Stacked staking and restaking structures form networks of obligations. The same unit of stake might back chain consensus, validate data feeds, and secure cross-chain messaging. A fault or attack in one layer can trigger slashing or loss in others, affecting both token holders and protocols that treat staking tokens as safe collateral.

Analysing these systems involves tracing which protocols depend on which staking tokens, how slashing events would propagate, and how liquidity and pricing of staking derivatives would behave under stress. Simple yield comparisons between different staking options are incomplete without this risk picture.

---

#### See Also

* [Execution Environments](/blockchain-execution-environments) – Base PoS chain designs
* [Tokenomics](/building-blocks/tokenomics) – Emission schedules and staking rewards
* [Oracles](/building-blocks/oracles) – Example of services that might use restaked security
* [Risk Types](/risk/types) – Slashing, correlation, and systemic risk in staking ecosystems

### Stablecoin Designs

> info **Metadata** Level: Advanced | Prerequisites: Stablecoins, Tokenomics, Risk Types | Tags: stablecoins, design, collateral, algorithmic, peg, systemic-risk

Stablecoin Designs examines structural patterns used to hold a peg and the trade-offs they impose. While many stablecoins target the same reference asset, they differ significantly in how collateral is handled, how redemptions work, and how supply responds to price deviations.

Conceptually, each design can be viewed as a control system that monitors market price relative to target and adjusts balances, incentives, or access in response. The quality of this control depends on collateral quality, liquidity, and behavioural reactions of participants.

---

#### Fiat-Backed and Custodial Models

Fiat-backed stablecoins hold reserves in bank accounts, money-market instruments, or similar assets. Users deposit fiat with the issuer and receive tokens in return, and can redeem tokens for fiat subject to the issuer's rules. On-chain price stability relies on off-chain redemption plus arbitrage.

Design questions include reserve composition, transparency (frequency and detail of attestations), legal structure, and redemption policies. Liquidity management in reserve portfolios introduces interest-rate and credit risk that may or may not be borne by token holders. Centralised control over blacklisting and freezes creates additional dimensions of risk and utility.

---

#### Overcollateralised Crypto Models

Overcollateralised stablecoins are backed by on-chain assets locked in vaults. Users lock collateral, mint stablecoins up to a limit determined by collateral values and risk parameters, and must manage positions to avoid liquidation. Peg stability comes from arbitrage between minting and repaying stablecoins versus the market price.

Key elements include collateral types and their risk profiles, collateral ratios, liquidation penalties, and oracle design. Under benign conditions, the system behaves predictably: profitable to mint when stablecoin trades above target, profitable to repay when it trades below. Under stress, collateral correlations, liquidity dry-ups, and oracle issues can break these relationships.

---

#### Algorithmic and Reflexive Designs

Algorithmic designs adjust supply, interest terms, or other parameters dynamically with limited or no hard collateral backing. Some models use secondary tokens whose value absorbs volatility in the stablecoin. Others rely on changing redemption rates or on-chain open market operations.

These designs tend to be highly reflexive. Confidence in the peg supports demand for both the stablecoin and associated tokens; loss of confidence can trigger rapid downward spirals where falling token prices undermine the mechanisms that supposedly back the stablecoin. Detailed analysis focuses on incentive compatibility in stress regimes, not just on nominal behaviour in normal times.

---

#### Hybrid and Real-World-Asset Designs

Hybrid designs combine elements from the above categories. For example, a stablecoin may use crypto collateral for a base level of backing while also holding treasury assets via an off-chain entity. Tokenised real-world assets, such as short-term credit instruments, can serve as collateral but introduce additional legal and operational risk.

These models raise questions about transparency, jurisdiction, and reliance on traditional finance infrastructure. They also expand the space for yield generation on reserves, which feeds back into tokenomics and governance incentives.

---

#### Stress Testing and Scenario Analysis

Evaluating stablecoin designs benefits from explicit scenarios: large market moves in collateral, sharp changes in interest rates, regulatory shocks, or concentrated redemptions. For each scenario, one can trace:

- Collateral values and liquidation mechanics.  
- Redemption behaviour and arbitrage incentives.  
- Impact on markets where the stablecoin is widely used as collateral or quote currency.  

This perspective highlights failure modes such as collateral cascades, feedback between depegs and lending liquidations, and contagion across protocols.

---

#### See Also

* [Stablecoins](/building-blocks/stablecoins) – High-level roles and risk categories  
* [Lending Architecture](/protocols/lending-architecture) – Integration of stablecoins into credit systems  
* [Oracles](/building-blocks/oracles) – Pricing inputs that drive collateral and peg logic  
* [Risk Types](/risk/types) – Framework for evaluating design trade-offs

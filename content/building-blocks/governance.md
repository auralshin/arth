### Governance

> info **Metadata** Level: Intermediate | Prerequisites: Tokenomics, Risk Types | Tags: governance, dao, voting, control, parameters, risk

Governance defines how protocols change over time. Parameters such as fees, collateral lists, oracle configurations, and upgrade schedules are not fixed forever; they are controlled by some combination of token holders, councils, teams, and external regulators. Governance is the mechanism that decides these changes.

In DeFi, governance is often encoded as smart contracts and off-chain processes that coordinate among token holders and contributors. It is both a technical system and a social one. Governance design determines who has effective control, how quickly adjustments can be made, and how robust the system is to capture or apathy.

---

#### Governance Structures

Common structures include:

* Token-weighted voting, where voting power is proportional to token holdings or locked balances.
* Councils or multisig committees that execute decisions under mandates.
* Hybrid systems where token votes select delegates or councils rather than configuring parameters directly.

Each structure trades off speed, decentralisation, and accountability. Highly centralised councils can act quickly but concentrate risk; widely distributed token voting can be slow and vulnerable to low participation.

---

#### Parameters and Scope

Governance often controls:

* Risk parameters such as collateral ratios, fee rates, and liquidation bonuses.
* Asset listings and delistings for lending, DEXs, and collaterals.
* Oracle configurations and bridge integrations.
* Emission schedules and treasury spending.
* Code upgrades and deployment of new modules.

The scope of what governance can change defines the attack surface. If governance can upgrade core contracts without constraints, compromising governance can compromise the entire protocol.

---

#### Process, Timelocks, and Safeguards

Governance processes typically define stages: proposal, discussion, on-chain vote, and execution. Timelocks between vote success and execution give users time to react to changes, especially those that might affect collateral, liquidity, or security.

Safeguards include quorum requirements, super-majority thresholds for sensitive actions, and veto powers held by councils or emergency guardians. These safeguards mitigate some risks but also create points where power is concentrated.

---

#### See Also

* [Tokenomics](/building-blocks/tokenomics) – Distribution of governance tokens and incentives
* [Risk Types](/risk/types) – Governance and control risk
* [Contributing & Meta](/contributing/how-to-contribute) – Community involvement processes
* [Bridges & Cross-Chain](/protocols/bridges) – Governance spanning multiple chains

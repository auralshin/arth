### MEV Taxonomy

> info **Metadata** Level: Advanced | Prerequisites: MEV Overview, Orderbooks vs AMMs | Tags: mev, taxonomy, arbitrage, liquidations, sandwiches

MEV Taxonomy organises different MEV strategies into categories based on where value originates and how it is extracted. A structured view clarifies which forms provide useful services to markets and protocols and which primarily degrade user outcomes.

Price alignment strategies include arbitrage between pools, exchanges, and chains. These trades close price gaps, synchronise markets, and often reduce long run inefficiencies, even though they direct profits to specialised actors. Liquidation strategies monitor lending and derivatives protocols for under collateralised positions, executing liquidations that protect depositors and counterparties.

Adversarial strategies target ordinary users. Sandwich attacks surround a victim swap with front and back trades that worsen execution for the victim and capture surplus for the attacker. Back running of large trades exploits predictable state changes, such as follow up price moves or oracle adjustments. Censorship or delay of competing transactions can be used to secure exclusive access to profitable flows.

Governance related MEV includes manipulations of voting, proposal timing, or on chain auctions. Cross domain MEV spans chains, rollups, or layers, combining messaging, bridges, and ordering to extract value not visible from a single domain.

A taxonomy is not static. New protocol designs open novel MEV surfaces, and mitigations in one category can shift activity into others. Keeping the classification updated helps track where attention and research effort should focus.

---

#### See Also

* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [Mitigation & Defenses](/transaction-ordering-mev/mitigation-and-defenses)
* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts)

---

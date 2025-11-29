### Oracles

> info **Metadata** Level: Intermediate | Prerequisites: Tokens 101, Stablecoins, AMMs 101 | Tags: oracles, data, pricing, infrastructure, risk

Oracles connect on-chain systems to off-chain data. In DeFi, the most important use is delivering asset prices for lending, derivatives, stablecoins, and risk engines. Whenever a protocol needs to know "what is the value of this asset right now" in some unit, an oracle or oracle-like mechanism is involved.

An oracle is not a single contract or API. It is a pipeline: sources of raw data, an aggregation process, a delivery mechanism, and on-chain consumers. Each stage has its own assumptions and failure modes. Understanding oracles means tracking how data flows from external markets into the state machines that control collateral, liquidations, and pegged assets.

---

#### Roles of Oracles in DeFi

Oracles appear in several critical places:

* Lending protocols mark collateral and debt in a reference unit.
* Perpetual futures and options compute margin, PnL, and funding from index prices.
* Stablecoins use price feeds to track collateral value and sometimes to manage peg mechanisms.
* Structured products reference volatility, rates, or index levels that depend on off-chain markets.

In many systems, a single oracle feed influences multiple protocols. A glitch or attack can therefore propagate widely, triggering liquidations, depegs, or mispriced trades far beyond the protocol that "owns" the feed.

---

#### Data Sources and Aggregation

Price oracles typically aggregate multiple external data sources. These can include centralised exchanges, DEXs, OTC venues, or other on-chain markets. Aggregation rules may take medians, volume-weighted averages, or time-weighted windows to smooth noise and reduce sensitivity to single-venue outliers.

Each choice carries trade-offs. Tight windows and aggressive responsiveness follow markets closely but increase sensitivity to manipulation and short-term spikes. Long windows and coarse updates reduce noise and attack surfaces but react slowly to genuine moves, creating lag and potential arbitrage windows.

---

#### Latency, Granularity, and Update Policies

Latency describes how long it takes for a real-world price change to show up on-chain. Granularity describes how often prices can change. Some oracles push updates whenever prices move beyond a threshold; others rely on periodic pulls or user-triggered updates.

These details shape risk. Slow or rare updates create opportunities for traders and liquidators to exploit stale prices. Extremely frequent updates increase gas usage and can overload systems during volatile periods. Protocols often introduce buffers, guards, or bounds that limit how much a single update can change effective prices.

---

#### Failure Modes

Oracle failures take several forms:

* Incorrect values due to data source outages or bugs.
* Manipulated values due to thin markets being targeted by attackers.
* Delayed or frozen updates, leaving prices stale during fast moves.
* Governance or operator errors, such as misconfiguration of feeds or assets.

Downstream effects include wrongful liquidations, under-collateralised loans, mispriced derivative settlements, and broken pegs. Systems that assume oracles are always correct tend to fail badly when these events occur.

---

#### See Also

* [Oracle Designs](/protocols/oracle-designs) – Specific architectures and design patterns
* [Stablecoins](/building-blocks/stablecoins) – Price references for pegs and collateral
* [Lending Architecture](/protocols/lending-architecture) – Use of oracles in risk engines
* [Perpetual Futures](/building-blocks/perpetual-futures) – Index and mark pricing
* [Risk Types](/risk/types) – Oracle, governance, and market risk categories

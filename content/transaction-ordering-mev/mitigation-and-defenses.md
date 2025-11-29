### Mitigation & Defenses

> info **Metadata** Level: Advanced | Prerequisites: MEV Taxonomy, Transaction Ordering & MEV | Tags: mev, mitigation, defenses, auctions, privacy

Mitigation and defenses address MEV not by pretending it does not exist, but by reshaping how and by whom it is captured. The aim is to reduce harmful forms of MEV, align extraction with useful services, and protect ordinary users from worst case outcomes.

Design space includes user level tools, protocol level mechanisms, and base layer changes. User level tools route sensitive orders through private channels that bypass public mempools, reducing exposure to sandwiches and some forms of front running. Protocol level mechanisms internalise arbitrage and liquidation flows, routing them through contracts that share value with LPs or treasuries instead of external searchers.

Batch auctions and frequent call markets execute orders in discrete intervals, with uniform clearing prices. This breaks many single transaction ordering games by removing a strict timeline within a batch. Commit and reveal schemes and encrypted mempools hide transaction contents until ordering is fixed, blocking strategies that rely on inspecting real time intent.

At the base layer, proposer builder separation and specialised block auctions attempt to compartmentalise MEV while making its markets more transparent. Restaking and shared security frameworks can also be used to build MEV aware infrastructure, although they introduce their own risks.

No single mitigation eliminates MEV. Each approach shifts incentives, sometimes reducing certain strategies while encouraging others. Analysis focuses on how a combination of techniques changes the distribution of costs and benefits across users, protocols, and block level actors.

---

#### See Also

* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts)

---

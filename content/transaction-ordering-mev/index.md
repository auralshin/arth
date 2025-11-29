### Transaction Ordering & MEV

> info **Metadata** Level: Advanced | Prerequisites: MEV Overview, Gas & Mempool | Tags: mev, ordering, blocks, auctions, microstructure

Transaction ordering is the mechanism by which a chain decides the sequence in which transactions are applied to state. MEV arises from the flexibilities and controls embedded in this mechanism. Who can reorder, under what rules, and subject to which incentives determines the shape of MEV and its distribution across actors.

Traditional models assume a simple first in, first out ordering based on arrival time and fee. In practice, systems often implement complex pipelines, such as proposer builder separation, bundle auctions, or private relay channels. Searchers construct bundles that embed profitable sequences, builders assemble them into blocks, and proposers select among blocks based on bids and protocol rewards.

This layered structure turns ordering into an economic mechanism. Searchers compete to identify MEV opportunities, builders compete to aggregate them, and proposers benefit from the resulting bids. Users sending ordinary transactions must navigate this environment, often without visibility into how their orders interact with MEV extraction.

Design choices around ordering affect fairness, censorship resistance, and efficiency. Restricting arbitrary reordering may reduce some forms of harmful MEV but also constrains beneficial arbitrage and liquidation activity. Allowing full flexibility maximises theoretical extractable value but may worsen average user outcomes.

---

#### See Also

* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [Mitigation & Defenses](/transaction-ordering-mev/mitigation-and-defenses)

---

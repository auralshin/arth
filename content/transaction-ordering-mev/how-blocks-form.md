### How Blocks Form

> info **Metadata** Level: Intermediate | Prerequisites: Gas & Mempool, Transaction Ordering & MEV | Tags: blocks, builders, proposers, pipeline, mev

Block formation is the process of collecting transactions, deciding an order, and finalising them into a block. Modern designs often separate roles: searchers assemble opportunity bundles, builders construct candidate blocks, and proposers or validators choose which block becomes canonical.

The pipeline begins in the mempool and in private order flow channels. Searchers monitor for arbitrage, liquidations, and other MEV opportunities, constructing bundles that specify ordered sets of transactions. Builders receive bundles and additional public transactions, then solve an internal optimisation problem: which combination of elements yields the highest value while respecting protocol rules and gas limits.

Proposers receive bids and block headers from builders and select the most attractive option, often based on promised payment or fee share. Once a block is chosen and included, its ordering becomes part of chain history, and all included transactions are applied in the specified sequence.

This structure decentralises search but centralises final assembly. It changes who can directly reorder transactions and how information about intended ordering flows through the ecosystem. It also introduces new attack surfaces, such as builder censorship, relay failures, or proposer misbehaviour.

Understanding block formation clarifies where in the pipeline different mitigations and design choices apply, from user level tactics like using private order flow to protocol level changes such as encrypted mempools or batch auctions.

---

#### See Also

* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms)

---

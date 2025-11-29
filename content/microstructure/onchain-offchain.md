### On-Chain vs Off-Chain

> info **Metadata** Level: Intermediate | Prerequisites: Orderbooks vs AMMs, Gas & Mempool | Tags: on-chain, off-chain, hybrid, settlement, microstructure

On chain and off chain trading environments differ in how they record state, enforce rules, and expose information. On chain venues execute trades through smart contracts, with transactions and state changes visible and finalised on the base or rollup chain. Off chain venues execute trades in private or semi private systems, recording only certain aggregates or settlements on chain.

Fully on chain AMMs publish pool states and swap events directly in blocks. Orderbook based DEXs on chain maintain orderbooks in contracts, though capacity and gas costs limit order frequency and depth. These designs benefit from transparency and composability but must cope with gas costs, mempool exposure, and transaction ordering constraints.

Off chain orderbooks with on chain settlement, as used by some perps and spot venues, allow frequent updates and fine grained microstructure off chain while settling balances and enforcing finality on chain. This reduces gas usage and latency constraints for makers but introduces additional trust and failure modes in the off chain components.

Hybrid architectures blur the boundary further. Intents and quotes may be negotiated off chain and then rolled into batches on chain through auctions. Layered systems such as rollups shift execution and ordering off the main chain while anchoring correctness through proofs.

The choice between on chain and off chain components affects MEV surfaces, latency risk, censorship possibilities, and how well trading activity composes with other DeFi protocols.

---

#### See Also

* [Latency Risk](/microstructure/latency-risk)
* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [Perp DEX](/protocols/perp-dex)

---

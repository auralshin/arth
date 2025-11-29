### Bridges (Primitives)

> info **Metadata** Level: Intermediate | Prerequisites: What Is DeFi, Tokens 101, Oracles | Tags: bridges, cross-chain, messaging, security, infrastructure

Bridge primitives move value or messages between chains. They underpin cross-chain token transfers, cross-domain governance, and multi-chain applications. In practice, many bridge designs do not move assets directly but simulate movement by locking assets on one chain and creating claims on another.

A bridge combines a locking mechanism, a message or proof system, and a mint or release mechanism. The security of the bridge depends on how trustworthy each component is and on how hard it is for attackers to spoof or override them.

---

#### Lock-and-Mint and Burn-and-Mint

The simplest mental model is lock-and-mint. Assets are locked in a contract on the source chain. A representation token is minted on the destination chain to mirror the locked amount. When holders want to exit, the representation is burned and a release message triggers unlocking on the source chain.

Variations use burn-and-mint patterns where tokens are burned on one chain and minted on another without a central locking contract. In all cases, bookkeeping must ensure that total representations across chains match underlying assets, otherwise the system drifts into under- or over-collateralisation.

---

#### Light Clients and Validator Sets

Bridge security often hinges on how the destination chain verifies events from the source chain. Designs based on light clients embed a simplified version of the source chain's consensus into the destination chain. This allows direct verification of finality and inclusion of events, but can be complex and costly.

Other designs rely on a validator set that observes both chains and signs off on messages. Multisig bridges, threshold signature schemes, and specialised committees fall into this category. These approaches are simpler to deploy but shift trust to the committee and its key management practices.

---

#### Messaging vs Asset Bridges

It is useful to distinguish bridges that move messages from those that focus on assets. Messaging bridges transport arbitrary data, such as governance votes or instructions, while asset bridges specialise in token representations.

In practice, asset bridges often include a messaging layer to coordinate mint and burn events, and messaging bridges can be used to build asset transfers. The distinction matters for risk analysis: compromise of a messaging channel may allow protocol parameter changes, while compromise of an asset bridge directly affects balances.

---

#### See Also

* [Bridges & Cross-Chain](/protocols/bridges) – System-level view of cross-chain applications
* [Oracles](/building-blocks/oracles) – Related data transport problems
* [Infrastructure & Execution](/blockchain-execution-environments) – Underlying chain properties
* [Risk Types](/risk/types) – Bridge and cross-chain risk categories

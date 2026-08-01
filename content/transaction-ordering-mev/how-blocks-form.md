### How Blocks Form

> info **Metadata** Level: Intermediate | Prerequisites: Gas & Mempool, Transaction Ordering & MEV | Tags: blocks, builders, proposers, bundles, pbs, mev

A user signs a transaction and it appears on a block explorer some seconds later. Between those two events sits a pipeline with several independent parties, at least two auctions, and a set of protocol rules that constrain the outcome without determining it. Understanding which stage holds discretion is the prerequisite for understanding anything else about ordering — every defence discussed later in this section is an intervention at one specific stage.

The short version: a transaction is broadcast, propagates to whoever is listening, is picked up by parties who construct candidate blocks, and one of those candidates is published by the party holding the right to propose for that slot. The protocol checks that the published block is valid. It does not check, and has no way to check, that the ordering inside it was chosen for any particular reason.

---

#### The Path a Transaction Takes

1. **Signing.** The wallet builds a transaction: a destination, calldata, a nonce, a gas limit, and fee parameters. For a swap, the calldata usually encodes a minimum acceptable output — the slippage limit — computed against a simulation of *current* state.
2. **Submission.** The transaction goes to an endpoint. If that endpoint is a public node, it enters the public mempool and propagates. If it is a private endpoint, it goes directly to one or more block builders and never becomes publicly visible before inclusion. Which of these happens is the single largest determinant of the transaction's exposure to extraction.
3. **Propagation.** Public transactions gossip peer-to-peer. Propagation is not instantaneous and not uniform: different observers see different mempools at the same instant, which is why "the mempool" is a convenient fiction rather than an object.
4. **Assembly.** Builders construct candidate blocks from everything they can see: public mempool transactions, private orderflow, and bundles submitted by searchers.
5. **Selection.** The proposer for the slot chooses which candidate block to publish, ordinarily the one paying it the most.
6. **Inclusion and finality.** The block is published and propagates. Its ordering is now part of history, subject to whatever finality guarantees the consensus protocol provides.

> info **Simulation happens against a state that will not exist** The quote your wallet shows you is computed against the current state. Your transaction executes against the state after every transaction the assembler chose to put before it. The gap between those two states is the whole subject.

---

#### The Fee Mechanism

On Ethereum and the chains that adopted its fee market design, a transaction's fee splits into two parts with different destinations:

```text
total_fee      = gas_used * (base_fee + priority_fee)
burned         = gas_used * base_fee
paid_to_block  = gas_used * priority_fee
```

where:

- `base_fee` is a protocol-computed floor that every transaction in the block pays, and which is destroyed rather than paid to anyone
- `priority_fee` is the sender's bid to the block producer, sometimes called the tip
- `gas_used` is the metered computation the transaction actually consumed

The base fee is not set by an auction; it is adjusted mechanically so that blocks tend toward a target size. With a maximum change of one eighth per block:

```text
base_fee_next = base_fee * (1 + (gas_used - gas_target) / gas_target / 8)
```

For a constructed example: with `base_fee = 20` gwei, a target of 15,000,000 gas, and a full block using 22,500,000 gas, the fractional change is `(22,500,000 - 15,000,000) / 15,000,000 / 8 = 0.0625`, so the next base fee is `20 * 1.0625 = 21.25` gwei.

The design matters for ordering because it separates *congestion pricing* from *position pricing*. The base fee rations block space; the priority fee bids for position within the block. Only the second is an auction, and it is the second that extraction competes in. See [Gas & Mempool](/microstructure/gas-mempool) for the fee mechanism in more depth.

---

#### Bundles: Buying a Sequence Rather Than a Slot

A **bundle** is an ordered list of transactions submitted to a builder as an atomic unit, with three properties that a plain transaction does not have:

- **Atomicity.** Either all of the bundle executes in the given order, or none of it does. A partially-executed extraction is usually a loss, so this is not a convenience feature.
- **Ordering.** The relative order of the bundle's transactions is fixed by the submitter, not chosen by the builder. The builder still chooses where the bundle sits relative to everything else.
- **Privacy before inclusion.** The bundle is not gossiped, so rivals cannot copy it out of the mempool and outbid its author with its own strategy.

A bundle may include transactions the searcher did not author — typically a victim or target transaction lifted from the public mempool — which is precisely how a sandwich is expressed as a single submission. Payment to the builder is made inside the bundle, conditional on the bundle succeeding, so a searcher pays nothing for an attempt that fails.

---

#### Proposer-Builder Separation

**Proposer-builder separation (PBS)** splits two things that were historically the same job: deciding a block's contents and holding the protocol right to publish it.

<table>
  <tbody>
    <tr><td><strong>Role</strong></td><td><strong>Holds</strong></td><td><strong>Does not hold</strong></td></tr>
    <tr><td>Searcher</td><td>The strategy and the bundle.</td><td>Any ability to place it in a block.</td></tr>
    <tr><td>Builder</td><td>Full discretion over ordering within its own candidate block.</td><td>Any right to have that block accepted.</td></tr>
    <tr><td>Relay</td><td>Custody of the block body until the proposer commits to the header.</td><td>Ability to alter the body without invalidating it.</td></tr>
    <tr><td>Proposer</td><td>The protocol right to publish one block this slot.</td><td>Visibility of the block contents at the moment of choosing.</td></tr>
  </tbody>
</table>

The commitment step is what makes the arrangement work: the proposer signs a block *header* along with the promised payment before seeing the body, so it cannot take the builder's ordering and republish it without paying. The cost is a new dependency — a party holding the body between commitment and publication — whose failure mode is a missed slot rather than a stolen block.

PBS is often described as a fix for MEV. It is better read as a fix for *centralisation pressure from* MEV: it lets a small proposer capture competitive block value without having to run extraction infrastructure. It does not reduce the amount extracted from users, and it concentrates ordering discretion in whichever builders win most often.

---

#### Worked Example: A Builder's Packing Decision

All figures are constructed to make the mechanism visible.

A builder has 30,000,000 gas of block space. Four searchers submit bundles that all target the same arbitrage opportunity created by a large pending swap, so at most one can succeed — whichever runs first moves the price and the others revert.

<table>
  <tbody>
    <tr><td><strong>Bundle</strong></td><td><strong>Gas</strong></td><td><strong>Payment (ETH)</strong></td><td><strong>ETH per million gas</strong></td></tr>
    <tr><td>A</td><td>210,000</td><td>0.180</td><td>0.857</td></tr>
    <tr><td>B</td><td>340,000</td><td>0.240</td><td>0.706</td></tr>
    <tr><td>C</td><td>190,000</td><td>0.155</td><td>0.816</td></tr>
    <tr><td>D</td><td>260,000</td><td>0.205</td><td>0.788</td></tr>
  </tbody>
</table>

1. **The bundles are mutually exclusive, and space is not scarce.** With 30,000,000 gas available and the largest bundle needing 340,000, the binding constraint is exclusivity, not capacity. The builder maximises absolute payment and takes **B at 0.240 ETH**.
2. **Note that density gives the opposite answer.** Ranked by payment per unit of gas the order is A, C, D, B: bundle B is the *least* efficient use of space and still wins, because the space it wastes has almost no alternative use. Density decides only when space binds.
3. **Fill the remainder.** After B, there are `30,000,000 - 340,000 = 29,660,000` gas of space. Suppose ordinary transactions are available at an average priority fee of 2 gwei. That is `29,660,000 * 2 = 59,320,000` gwei, or **0.05932 ETH**.
4. **Total block value.** `0.240 + 0.05932 = 0.29932 ETH`, of which the single winning bundle is `0.240 / 0.29932 = 80.2%`.
5. **What the builder keeps.** To win the slot the builder must outbid rivals holding similar bundles. If it bids 0.297 ETH to the proposer, it retains `0.29932 - 0.297 = 0.00232 ETH` — about 0.8% of the block's value.

Two things follow. First, one opportunity can produce four-fifths of a block's value while occupying barely 1% of its space, which is why block *value* is far more volatile than block *fees*. Second, competitive builders keep very little; the rent settles on the proposer, who faces no rival for its own slot.

---

#### Rules That Constrain the Assembler

The admissible set is not everything. An assembler must respect:

- **Per-account nonce ordering.** Transactions from one sender must appear in nonce order. This is the only ordering guarantee the protocol gives a user, and it constrains only that user's own transactions.
- **The gas limit.** Total gas across the block cannot exceed it.
- **The base fee floor.** A transaction whose fee cap is under the block's base fee cannot be included at all.
- **Validity at execution time.** A transaction that reverts still consumes gas and still pays; a transaction invalid at its position (bad nonce, insufficient balance) cannot be included at all.

Nothing in that list constrains the *relative* order of transactions from different senders. That absence is the discretion being sold.

---

#### Assumptions and Failure Modes

- **The pipeline assumes honest relaying.** A party holding the block body between commitment and publication can, if it misbehaves or fails, cost the proposer its slot. The mitigation is reputational and redundant rather than cryptographic.
- **Private orderflow is private to the user, not to the builder.** Routing around the public mempool removes exposure to everyone except the builders you send to. It substitutes a trust assumption for a public one; it does not remove the assumption.
- **Builder competition is assumed.** Where one builder wins most blocks, ordering discretion is concentrated in a single commercial entity, and the censorship question becomes a question about that entity's compliance posture rather than about the protocol.
- **Latency is a qualifying condition, not the contest.** Being fast enough to reach a builder before its deadline is necessary; being fastest is not sufficient, because the contest is resolved by bid. This inverts the traditional-venue picture — see [Latency Risk](/microstructure/latency-risk).
- **Timing games exist at the deadline.** Any party allowed to submit later has strictly more information. Deadlines therefore create an incentive to submit as late as safely possible, and the safety margin is itself a strategic variable.
- **Reorganisation risk is not zero.** Where finality is probabilistic rather than immediate, an ordering is a strong convention rather than a settled fact, and the possibility of re-proposing a past block is a structural extraction surface even where it is rarely exercised.

---

#### Code

```python
def pack_block(bundles, gas_limit, conflict_groups):
    """Greedy block packing with mutually exclusive bundle groups.

    bundles: list of dicts with keys 'id', 'gas', 'payment', 'group'
    conflict_groups: at most one bundle may be taken from each group.

    Greedy by payment density is optimal only when gas is the sole
    binding constraint; with exclusivity, absolute payment can win.
    """
    best_per_group = {}
    for b in bundles:
        current = best_per_group.get(b["group"])
        if current is None or b["payment"] > current["payment"]:
            best_per_group[b["group"]] = b

    # Density ordering is the right tie-break once exclusivity is resolved.
    candidates = sorted(best_per_group.values(),
                        key=lambda b: b["payment"] / b["gas"], reverse=True)

    chosen, gas_used, value = [], 0, 0.0
    for b in candidates:
        if gas_used + b["gas"] <= gas_limit:
            chosen.append(b["id"])
            gas_used += b["gas"]
            value += b["payment"]
    return chosen, gas_used, value
```

---

#### See Also

* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses)
* [Gas & Mempool](/microstructure/gas-mempool)
* [Latency Risk](/microstructure/latency-risk)
* [On-Chain vs Off-Chain](/microstructure/onchain-offchain)

---

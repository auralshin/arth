### MEV Beyond EVMs

> info **Metadata** Level: Advanced | Prerequisites: How Blocks Form, Blockchain Execution Environments, MEV Taxonomy | Tags: mev, execution-environments, parallel-execution, sequencers, cross-domain

Much of the vocabulary in this section — mempool, bundle, builder, relay — describes one chain's infrastructure at one point in its history. It is easy to conclude that ordering-based extraction is an Ethereum problem, and that a chain built differently would not have it.

It would. Extraction requires an ordered state machine, discretion over the order, and enough information to exploit it. Every general-purpose chain has the first, and every chain that produces blocks has someone exercising the second. What differs across execution models is *where* contention concentrates, *who* holds the discretion, and *how* the discretion is priced — three important differences that do not add up to an exemption.

---

#### The General Condition

Ordering has value when pending transactions fail to commute. Two transactions commute if applying them in either order leaves the same state:

```text
apply(apply(s, t1), t2) == apply(apply(s, t2), t1)
```

This is a statement about the state machine, not about the virtual machine implementing it. Two swaps against the same pool do not commute under any execution model, because the first moves the price the second receives. Two transfers between disjoint accounts commute under all of them.

**A constructed illustration, chain-agnostic.** A constant-product pool holds 10,000,000 units of a quote asset and 5,000 of a base asset, charging 30 basis points. Two identical swaps of 100,000 quote units arrive. Whichever executes first receives `49.3579` base units; the second receives `48.3915`. The difference of `0.9664` units — nearly 2% of the trade — is allocated purely by sequence.

Nothing in that calculation refers to a virtual machine, a mempool, a gas model, or a consensus algorithm. It refers only to a shared piece of state, a curve, and an order. Any system reproducing those three reproduces the value of ordering.

> info **Parallel execution does not make trades commute** It identifies which transactions already commute, so they can run concurrently. Transactions touching the same pool never qualify, which is precisely where the contested value is.

---

#### Local Fee Markets

Under a **global fee market**, one congestion price applies to the whole block. A frenzied mint on one contract raises the cost of every unrelated transaction, because they all bid into the same auction for the same block space.

Under **local fee markets**, priority is priced per unit of contended state — typically per account or per writable resource. Congestion on one hot market leaves unrelated activity cheap.

This is a real improvement, and it improves the wrong thing for our purposes. It changes *who pays for congestion*: bystanders stop subsidising the contest. It does not change *who wins the contest*, which is still whoever bids most for position on the contended state. The ordering auction is not removed, only narrowed to the participants who care about that particular state. From the perspective of a user swapping in the hot pool, nothing has changed at all.

---

#### Parallel Execution and Account Locking

Runtimes that execute transactions concurrently need to know in advance, or discover at runtime, which transactions conflict.

- **Declared access lists.** Transactions state which accounts they read and write. The scheduler runs non-overlapping transactions in parallel and serialises the rest. Contention is explicit and visible before execution.
- **Optimistic execution with conflict detection.** Transactions run speculatively against a declared sequence; conflicts are detected and the affected transactions are re-executed in sequence order. The declared sequence is still chosen by the leader, and re-execution preserves it exactly.

Both approaches localise contention rather than removing it. Consider a block of 1,000 transactions in which 60 touch one popular pool. The other 940 can be scheduled freely across cores because they commute. The 60 must serialise, and every one of the ordering questions in this section applies to them, undiminished. Parallelism raised throughput and shrank the contested set; the contested set is where all the value was.

An additional consequence: under declared access lists, the access list is itself information. A transaction that must announce which pool it touches has revealed something before it executes, even where the amounts are not visible.

---

#### Leader Schedules and Continuous Production

Where the block producer for each slot is known in advance, participants can send transactions directly to the upcoming leader instead of gossiping them. A public mempool becomes optional, and in some designs is not part of the protocol at all.

The consequences run in both directions. Transactions never sit in a public pool where anyone can inspect them, which removes an information channel that sandwiching depends on. But the leader now receives orderflow directly, holds full discretion over it, and — with the schedule published — can be located and reached ahead of time by anyone who wants privileged treatment. Discretion did not diminish; it moved from an open builder market to a rotating set of known parties, with correspondingly less contestability.

Short slots compound this. Where blocks are produced continuously and the window between learning something and acting on it is very small, the contest resolves partly on latency rather than purely on bid. That reproduces the traditional-venue speed race, with its familiar centralising pressure toward co-location and specialised infrastructure — see [Latency Risk](/microstructure/latency-risk).

---

#### Ownership Models and Consensus Bypass

Resource-oriented and object-oriented execution models can distinguish state that is owned by exactly one party from state that is shared. A transaction touching only single-owner state has no possible conflict with anyone else's transaction, so some designs let it bypass full consensus ordering entirely and settle on a faster path.

That is a genuine structural elimination, and it applies to exactly the transactions that never had extractable ordering value: payments, transfers, and personal state updates. Anything involving a shared object — a pool, a book, a lending market — takes the consensus path, is ordered by the same mechanisms as everything else, and is contested in the same way. The model separates the two cleanly, which is valuable for throughput and latency, and leaves the ordering economics of shared state untouched. See [Move VM](/blockchain-execution-environments/move-vm).

---

#### Single Sequencers and Application Chains

A rollup with one sequencer collapses the whole pipeline into one party. That party sees the orderflow, decides the order, and publishes — it is builder, relay, and proposer simultaneously, without the commitment structure that makes proposer-builder separation meaningful.

What follows:

- **The ordering policy is a business commitment.** First-come-first-served, a priority auction, or a bounded head start sold at auction are all choices the operator publishes and could change. Users have no protocol-level recourse if it changes.
- **Forced inclusion bounds censorship, not reordering.** Most designs let a user submit through the base layer if the sequencer refuses them. That guarantees eventual inclusion; it says nothing about position.
- **Extraction is legible.** With a single operator, the total value of ordering can in principle be measured and redistributed — several designs route sequencer revenue back to the application or its users. Centralisation makes the accounting easy and the trust assumption large.

An **application-specific chain** goes further: the application defines the ordering rules itself, and can batch, randomise, or auction position as it prefers. The constraint from [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses) applies unchanged — whatever the rule takes as input becomes the new target.

---

#### Cross-Domain Extraction

An opportunity spanning two chains cannot settle atomically, because no single transaction can commit state on both. The extractor must act on one domain and bear the risk until the other settles. This changes the character of the activity completely: it needs inventory on both sides, it carries genuine price risk over the bridging or messaging delay, and it cannot be capitalised with a flash loan. It resembles inventory-based market making far more than it resembles arbitrage.

Shared sequencing — one party ordering blocks for several domains and promising cross-domain atomicity — is proposed to fix the user-facing awkwardness of this. It would also restore atomic cross-domain extraction, converting a risky inventory business back into a risk-free ordering contest. That is not an argument against the design; it is a reminder that atomicity is the property doing the work in both directions. See [Bridges](/protocols/bridges).

---

#### What Changes and What Does Not

<table>
  <tbody>
    <tr><td><strong>Execution model</strong></td><td><strong>Where contention concentrates</strong></td><td><strong>What is unchanged</strong></td></tr>
    <tr><td>Global fee market, sequential execution</td><td>The whole block; hot state prices out unrelated activity</td><td>Ordering value flows to whoever assembles</td></tr>
    <tr><td>Local fee markets</td><td>Per contended account; bystanders insulated</td><td>The contest for the hot account, and its price</td></tr>
    <tr><td>Parallel execution</td><td>The conflicting subset only</td><td>Everything about ordering that subset</td></tr>
    <tr><td>Known leader schedule</td><td>Direct submission to the upcoming leader</td><td>Full discretion, now held by fewer parties</td></tr>
    <tr><td>Owned-object fast path</td><td>Shared objects; owned state is genuinely exempt</td><td>Ordering of every shared-state interaction</td></tr>
    <tr><td>Single sequencer</td><td>One operator, one policy</td><td>Discretion, minus the commitment structure of PBS</td></tr>
    <tr><td>Cross-domain</td><td>Inventory and settlement risk between legs</td><td>The opportunity, at higher cost and risk</td></tr>
  </tbody>
</table>

---

#### Assumptions and Failure Modes

- **Conflict detection is assumed sound.** Declared access lists can be wrong or deliberately over-broad; a transaction that over-declares can force serialisation it does not need, which is a griefing vector and a denial-of-parallelism attack.
- **"No mempool" is read as "no exposure".** Removing the public pool removes one observer, not all of them. Whoever receives the orderflow sees it in full, and where that is a known rotating party the exposure may be more concentrated rather than less.
- **Throughput is treated as a defence.** Faster blocks shorten the window in which a transaction is visible and pending. They do not change what a sequencer with the transaction in hand can do with it, and they shift the contest toward latency.
- **Single-operator accountability is assumed stable.** A sequencer's published ordering policy is enforced by reputation and contract, not by consensus. The guarantee is only as durable as the operator's incentives.
- **Cross-domain risk is assumed priced.** Non-atomic extraction carries settlement and bridge risk that is difficult to quantify and correlated with exactly the volatile conditions that create the opportunity. See [Bridges](/building-blocks/bridges).
- **Comparisons across chains rarely compare like with like.** Different chains have different fee denominations, different mempool visibility, and different data availability. A cross-chain extraction comparison is a measurement exercise with all the identification problems in [Statistical Modeling](/transaction-ordering-mev/statistical-modeling), plus incompatible instrumentation.

---

#### Code

```python
def contested_keys(transactions):
    """State keys written by more than one transaction in a block.

    These are the only places sequence can matter: everything else
    commutes and can be scheduled freely. The economic value of
    ordering lives entirely in the keys this returns.

    transactions: list of dicts with 'id' and 'writes' (a set of keys)
    """
    write_counts = {}
    for tx in transactions:
        for key in tx["writes"]:
            write_counts[key] = write_counts.get(key, 0) + 1
    return sorted(key for key, n in write_counts.items() if n > 1)


def parallel_fraction(transactions):
    """Share of a block that is free of write conflicts.

    High values mean good throughput scaling and say nothing about
    how much value sits in the contested remainder.
    """
    contested = set(contested_keys(transactions))
    clean = [tx for tx in transactions if not (tx["writes"] & contested)]
    return len(clean) / len(transactions)
```

---

#### See Also

* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses)
* [Blockchain Execution Environments](/blockchain-execution-environments)
* [Solana / SVM](/blockchain-execution-environments/solana-svm)
* [Comparative Benchmarks](/blockchain-execution-environments/comparative-benchmarks)

---

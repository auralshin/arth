### Transaction Ordering & MEV

> info **Metadata** Level: Intermediate | Prerequisites: Gas & Mempool, MEV Overview, Orderbooks vs AMMs | Tags: mev, ordering, block-building, auctions, defi, microstructure

On a centralised exchange the matching engine decides sequence, and its rule — price-time priority, pro-rata, or some published variant — is written down. On a public blockchain no such rule is imposed by the protocol. The protocol validates that a block is well-formed; it does not validate that the transactions inside it are in any particular order. Whoever assembles the block chooses the sequence, and because on-chain state transitions are order-dependent, that choice has a price.

This section is about the price of that choice: where it comes from, who pays it, who collects it, how to measure it without fooling yourself, and what happens when you try to design it away. The shorthand for the whole phenomenon is **Maximal Extractable Value (MEV)** — the value a party with discretion over inclusion and ordering can obtain beyond the fees they would earn anyway. The acronym originally stood for *miner* extractable value; the mechanism outlived the role that named it, which is a useful reminder that MEV is a property of the mechanism rather than of a particular actor.

---

#### Why Sequence Has a Price

State transitions on a chain are functions applied to a shared state. Two pending transactions `t1` and `t2` **commute** if applying them in either order leaves the same final state:

```text
apply(apply(s, t1), t2) == apply(apply(s, t2), t1)
```

If every pending pair commutes, ordering is worthless — the sequencer has nothing to sell. Transfers between disjoint accounts commute. Trades against the same liquidity pool do not, because each trade moves the price the next one gets. Non-commutativity is the raw material, discretion over sequence is the tool, and an external reference price is what converts the difference into money.

**A constructed illustration.** Take a constant-product pool holding 10,000,000 USDC and 5,000 ETH — a mid-price of 2,000 USDC per ETH — charging a 30 basis point fee. Two users each submit a swap of 100,000 USDC for ETH, and both land in the same block. Applying the standard constant-product output formula:

<table>
  <tbody>
    <tr><td><strong>Position in block</strong></td><td><strong>ETH received</strong></td><td><strong>Effective price (USDC per ETH)</strong></td></tr>
    <tr><td>First</td><td>49.3579</td><td>2,026.02</td></tr>
    <tr><td>Second</td><td>48.3915</td><td>2,066.48</td></tr>
  </tbody>
</table>

The two transactions are identical in every respect. The gap of `0.9664` ETH — about 1,933 USDC valued at the pre-trade mid — exists only because one of them had to go first. Nobody created that value; the sequencer allocated it. Everything in this section is an elaboration of that single observation.

> info **A block is an auction over sequence** The lot is a position in an ordering. The bid is what someone will pay to occupy that position relative to particular other transactions. The seller is whoever controls assembly.

---

#### Vocabulary You Will Need

The pipeline has acquired a specific set of terms. They are used consistently across the section and are worth fixing before you start.

<table>
  <tbody>
    <tr><td><strong>Term</strong></td><td><strong>Meaning</strong></td></tr>
    <tr><td>Mempool</td><td>The set of broadcast-but-not-yet-included transactions a node is holding. Every node sees a slightly different one, so "the mempool" is a convenient fiction.</td></tr>
    <tr><td>Searcher</td><td>A party that identifies an ordering opportunity and writes the transactions that realise it.</td></tr>
    <tr><td>Bundle</td><td>An ordered group of transactions submitted as an atomic unit: all of it executes in the given order, or none of it does.</td></tr>
    <tr><td>Builder</td><td>A party that assembles a complete candidate block from bundles and ordinary transactions, choosing the order.</td></tr>
    <tr><td>Relay</td><td>An intermediary holding a candidate block body until the proposer has committed to publishing its header.</td></tr>
    <tr><td>Proposer</td><td>The party holding the protocol right to publish a block for a given slot.</td></tr>
    <tr><td>Private orderflow</td><td>Transactions sent directly to builders rather than broadcast, and so invisible to the public before inclusion.</td></tr>
    <tr><td>Back-running</td><td>Trading immediately after a transaction to profit from the state change it caused. It takes nothing from that transaction.</td></tr>
    <tr><td>Front-running</td><td>Executing ahead of a known pending transaction to profit from its expected effect.</td></tr>
    <tr><td>Sandwiching</td><td>Front-running and back-running the same transaction, so the target trades at a price the extractor set.</td></tr>
  </tbody>
</table>

Roles are functions, not necessarily separate companies. A single operation can search, build, and hold proposal rights simultaneously, and where it does the payments between those roles stop being observable.

---

#### Map of the Section

<table>
  <tbody>
    <tr><td><strong>Page</strong></td><td><strong>Question it answers</strong></td></tr>
    <tr><td>How Blocks Form</td><td>What happens between pressing send and being included, and where in that pipeline discretion actually sits.</td></tr>
    <tr><td>MEV Taxonomy</td><td>Which extraction strategies exist, what each one requires, and who is equipped to run it.</td></tr>
    <tr><td>Quantitative Impacts</td><td>How ordering shows up in an ordinary user's fill price, in basis points, with the arithmetic done.</td></tr>
    <tr><td>Statistical Modeling</td><td>How to define and measure extraction empirically, and why naive measurement overstates it.</td></tr>
    <tr><td>Mitigation and Defenses</td><td>What each defence removes, and what it costs to remove it.</td></tr>
    <tr><td>MEV Beyond EVMs</td><td>Why the phenomenon reappears under parallel execution, local fee markets, and single sequencers.</td></tr>
  </tbody>
</table>

The pages, in the order they build on each other:

* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts)
* [Statistical Modeling](/transaction-ordering-mev/statistical-modeling)
* [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses)
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms)

---

#### Reading Order

**If you are new to on-chain execution.** Read [Gas & Mempool](/microstructure/gas-mempool) first, then [How Blocks Form](/transaction-ordering-mev/how-blocks-form), then [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy). Those three give you the pipeline and the vocabulary.

**If you care about what execution costs.** Go straight to [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts), then [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses). The first tells you what you are paying; the second tells you what each remedy costs.

**If you are doing empirical research.** [Statistical Modeling](/transaction-ordering-mev/statistical-modeling) is the page that stops you publishing a figure that is mostly false positives. Pair it with [Multiple Testing](/stat-methods/multiple-testing) and [Backtest vs Live](/risk/backtest-vs-live).

**If you are designing a protocol or a chain.** [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses) and [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms) are the two that matter, alongside [MEV Formally](/microstructure/mev-formal) for the optimisation framing.

---

#### Where the Numbers Come From

Several pages in this section share one constructed example so that the arithmetic can be followed across them rather than restarted on each page. It is a constant-product pool holding **10,000,000 USDC and 5,000 ETH** — a mid-price of 2,000 USDC per ETH — charging a **30 basis point** fee, against which a user swaps **100,000 USDC**. That single setup produces the sequencing gap shown above, the sandwich decomposition in [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts), the slippage-tolerance schedule in [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses), and the chain-agnostic illustration in [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms).

The reserves, the fee, and the trade size were chosen to make the mechanism legible: a swap of 1% of the pool's quote reserves is large enough for the effects to be visible without being implausible. They are not drawn from any observed pool, and no conclusion in this section depends on the specific figures.

---

#### How This Section Fits the Rest of Arth

This is the ordering-specific corner of a larger execution story. Elsewhere in the encyclopedia:

* [MEV Overview](/building-blocks/mev-overview) is the one-page orientation. Start there if this page already feels dense.
* [MEV Formally](/microstructure/mev-formal) treats block construction as a combinatorial optimisation and draws the line between MEV and ordinary trading — namely privileged influence over sequence.
* [Gas & Mempool](/microstructure/gas-mempool) covers the fee mechanism and the pending-transaction pool that most extraction reads from.
* [Slippage](/microstructure/slippage) and [Slippage & Frontrunning](/risk/slippage-frontrunning) cover the user-facing cost, of which ordering is one component among several.
* [Execution Overview](/execution/execution-overview) gives the traditional-markets decomposition of execution cost. Ordering cost is the on-chain term with no clean off-chain equivalent, and reading both makes the difference legible.
* [Latency Risk](/microstructure/latency-risk) explains why speed is a qualifying condition on-chain rather than the deciding one.

---

#### Four Claims Worth Discarding Early

Each of these is common, plausible, and wrong in a way that makes the rest of the section harder to read.

**"MEV is a bug."** Nothing in the mechanism is malfunctioning. A public mempool, user-set slippage limits, and atomic multi-transaction submission are all deliberate features that exist for good reasons. Extraction is what those features produce when combined, which is why every remedy in [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses) is a trade-off rather than a patch.

**"MEV is a speed race."** On a traditional venue, arriving first wins. On-chain, arriving in time to be considered is necessary and rarely sufficient — the contest is settled by what you bid for position, not by when you arrived. Latency is a qualifying condition. [Latency Risk](/microstructure/latency-risk) draws out the distinction.

**"What extractors earn is what users lose."** It is not, in either direction. Part of what a sandwiched user loses is absorbed as venue fees rather than reaching the extractor, and competition transfers most of the extractor's take onward to whoever assembles the block. [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts) works through a case where the two figures differ by roughly 30%.

**"A different chain design avoids it."** Parallel execution, local fee markets, and single sequencers all change where contention concentrates and who holds discretion. None removes the condition that produces extraction, which is order-dependent shared state plus someone choosing the order. [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms) takes each design in turn.

---

#### Scope and Honesty About Evidence

Three limits are worth stating before you read further.

- **This section describes mechanisms, not magnitudes.** It contains no claim about how much value has been extracted in aggregate, on any chain, over any period. Such figures exist, they are contested, and they depend heavily on definitional choices that [Statistical Modeling](/transaction-ordering-mev/statistical-modeling) sets out. Every number in these pages is one chosen to make a mechanism legible, and is labelled as constructed where it appears.
- **Infrastructure changes faster than the concepts.** Particular relays, builders, auction formats, and encryption schemes come and go. These pages name design *categories* — proposer-builder separation, private orderflow, batch auctions, encrypted mempools — because those categories have outlived several generations of the software implementing them.
- **Not every form of extraction is harmful, and not every mitigation is an improvement.** Arbitrage that aligns a pool with the wider market is a service someone has to perform, and liquidations that clear insolvent positions protect depositors. A defence that suppresses those alongside sandwiching has made the system worse in one dimension while improving it in another. These pages try to keep the two ledgers separate.

> warning **Educational only** Nothing here is advice about how to trade, how to configure a wallet, or how to build extraction infrastructure. It describes how a mechanism works and how to reason about it.

---

#### See Also

* [MEV Overview](/building-blocks/mev-overview)
* [MEV Formally](/microstructure/mev-formal)
* [Gas & Mempool](/microstructure/gas-mempool)
* [Slippage](/microstructure/slippage)
* [Execution Overview](/execution/execution-overview)
* [Blockchain Execution Environments](/blockchain-execution-environments)

---

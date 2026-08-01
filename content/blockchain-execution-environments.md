### Blockchain Execution Environments

> info **Metadata** Level: Intermediate | Prerequisites: What Is DeFi, Gas & Mempool | Tags: execution-environments, evm, solana, move, parallelism, fee-markets, defi

On a centralised exchange, the venue is a matching engine with a published order-priority rule, a fee schedule, and an API. Those three things determine what a strategy costs to run, what its fills look like, and which failure modes you have to engineer around. On-chain, the venue is the **execution environment**: the virtual machine that decides how transactions are scheduled, how state is addressed, what an attempt costs, and what happens when an attempt does not work.

The consequence is that the execution environment is not infrastructure sitting beneath the market. It is part of the market's microstructure, and it is the part with the widest variation. Two chains can host economically identical protocols and present completely different cost functions, fill distributions, latency structures, and failure semantics to a strategy trading them — because one runs transactions strictly one at a time under a chain-wide fee market, and the other runs them concurrently under a fee market that only prices the specific state you touch.

This section covers the three execution-environment families that host most on-chain trading activity, compares them on properties that do not expire, and sets out what a quant actually has to rebuild when moving a strategy from one to another.

---

#### The Three Questions

Every execution environment answers the same three questions differently, and almost everything a quant cares about follows from the answers.

1. **Who decides the order, and what can they see?** Ordering within a block is not fixed by the protocol. Whoever assembles the block chooses, and because on-chain state transitions are order-dependent, that discretion has a price. What differs across environments is whether pending intent is publicly visible, whether ordering rights are auctioned, and how far in advance the ordering party is known.
2. **What does an attempt cost, and who else bids against you?** Some environments price blockspace globally, so unrelated congestion raises your cost. Others price contention locally, so you only compete with participants writing the same state you do. The two produce different cost models, and a model calibrated under one is not transferable to the other.
3. **What determines whether two transactions can run at the same time?** Sequential environments answer "nothing — they cannot". Parallel environments answer with a conflict rule over declared or discovered state access. Either way, the state your strategy must *write* is the bottleneck, and how contested it is matters more than any headline capacity figure.

> info **The answers compose into a cost function** Cost per attempt, probability an attempt lands, cost of an attempt that fails, and time spent unfilled. Every page in this section is ultimately about one of those four terms.

---

#### The Cost Function These Choices Produce

The four terms assemble into a single quantity, and it is the one a strategy actually pays:

```text
realised cost per fill = C_success + (1/p - 1) * C_fail + delay_cost
```

where:

- `C_success` is the fee charged by a transaction that lands and does what you wanted
- `p` is the probability an individual attempt lands, so `1/p - 1` is the expected number of failures per fill
- `C_fail` is what a failed attempt costs, which is a full fee in some environments and near zero in others
- `delay_cost` is the price movement over the time spent unfilled, which no fee schedule reports

Three features of this expression matter more than its algebra. First, `p` is the term most often assumed and least often measured, and it is usually the one that dominates. Second, `p` is not a constant — it falls exactly when the state you contend for is busy, which is exactly when the opportunity is largest. Third, the environment sets `C_fail` structurally: where failures are charged, retrying is expensive and attempt rates stay low; where failures are dropped, retrying is cheap and everyone spams, which is what makes the contested state contested.

An environment with cheap fees and a poor landing rate can be more expensive to trade than one with expensive fees and a good landing rate. Comparing chains on fee level alone answers a question nobody was asking.

---

#### Map of the Section

<table>
  <tbody>
    <tr>
      <td><strong>Page</strong></td>
      <td><strong>Question it answers</strong></td>
    </tr>
    <tr>
      <td>EVM</td>
      <td>What follows from executing transactions strictly one at a time under a single global fee market, and why atomic composability is a consequence of that choice rather than a separate feature.</td>
    </tr>
    <tr>
      <td>Solana / SVM</td>
      <td>What changes when transactions must declare their state access up front, and why contention becomes a property of a specific account rather than of the chain.</td>
    </tr>
    <tr>
      <td>Move VM</td>
      <td>How linear types turn conservation of value into a compile-time property, and where parallelism comes from under two different storage models.</td>
    </tr>
    <tr>
      <td>Comparing Execution Environments</td>
      <td>Which differences are architectural and durable, which reported figures are perishable, and how to benchmark an environment yourself instead of quoting one.</td>
    </tr>
    <tr>
      <td>Quant Engineering</td>
      <td>What a live system has to rebuild when a strategy moves between environments, and why landing rate usually dominates fee level in realised cost.</td>
    </tr>
  </tbody>
</table>

The pages, in the order they build on each other:

* [EVM (Ethereum Virtual Machine)](/blockchain-execution-environments/evm)
* [Solana / SVM](/blockchain-execution-environments/solana-svm)
* [Move VM (Aptos, Sui)](/blockchain-execution-environments/move-vm)
* [Comparing Execution Environments](/blockchain-execution-environments/comparative-benchmarks)
* [Quant Engineering Across Environments](/blockchain-execution-environments/quant-engineering)

---

#### Vocabulary Used Across This Section

These terms recur, and several are used differently elsewhere in the industry. This is what they mean here.

<table>
  <tbody>
    <tr>
      <td><strong>Term</strong></td>
      <td><strong>Meaning in this section</strong></td>
    </tr>
    <tr>
      <td>Execution environment</td>
      <td>The virtual machine and its scheduler: how transactions are metered, ordered, and applied to state. Not the consensus protocol, though the two interact at finality.</td>
    </tr>
    <tr>
      <td>State access set</td>
      <td>The accounts, resources, or objects a transaction reads and writes. Declared in advance in some environments, discovered at runtime in others.</td>
    </tr>
    <tr>
      <td>Contention</td>
      <td>Competition to write a specific piece of state. Distinct from chain-wide congestion, and the two are only loosely related on some environments.</td>
    </tr>
    <tr>
      <td>Fee market scope</td>
      <td>Whether the price you pay responds to total demand for blockspace (global) or to demand for the state you touch (local).</td>
    </tr>
    <tr>
      <td>Landing rate</td>
      <td>The fraction of submitted transactions that are included and achieve their intent. Measured over submissions, not over confirmations.</td>
    </tr>
    <tr>
      <td>Finality level</td>
      <td>What a given confirmation asserts, and under what assumptions it can still be revoked. Several distinct claims share the word confirmed.</td>
    </tr>
  </tbody>
</table>

---

#### Reading Order

**If you are new to on-chain execution.** Read [Gas & Mempool](/microstructure/gas-mempool) first for the fee mechanism and the pending-transaction pool, then [EVM](/blockchain-execution-environments/evm) as the reference design. Every other environment is most easily understood as a deliberate departure from it.

**If you already know the EVM and want the contrast.** Go to [Solana / SVM](/blockchain-execution-environments/solana-svm) for explicit state declaration and local fee markets, then [Move VM](/blockchain-execution-environments/move-vm) for linear types and two further approaches to parallelism. Read [Comparing Execution Environments](/blockchain-execution-environments/comparative-benchmarks) last, once the individual designs are familiar enough that a comparison table means something.

**If you are porting a live strategy.** [Quant Engineering Across Environments](/blockchain-execution-environments/quant-engineering) is the page written for you. Pair it with [Transaction Cost Analysis](/execution/transaction-cost-analysis) for the general cost decomposition and [Backtest vs Live](/risk/backtest-vs-live) for the ways a simulated fill rate flatters a strategy.

**If you are evaluating a chain rather than a strategy.** [Comparing Execution Environments](/blockchain-execution-environments/comparative-benchmarks) sets out which dimensions are stable enough to reason about and which published figures should be treated as perishable.

---

#### How This Section Fits the Rest of Arth

Execution environments are one corner of the on-chain execution story. Elsewhere in the encyclopedia:

* [Transaction Ordering & MEV](/transaction-ordering-mev) covers the economics of ordering discretion. This section covers the machine that makes ordering matter; that section covers what it is worth.
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms) is the direct bridge, showing why extraction reappears under parallel execution and single sequencers.
* [Gas & Mempool](/microstructure/gas-mempool) and [Latency Risk](/microstructure/latency-risk) cover the fee and timing surface that these environments each implement differently.
* [On-Chain vs Off-Chain](/microstructure/onchain-offchain) frames the wider architectural choice about which parts of a venue live on a chain at all.
* [RPC & Nodes](/data-tooling/rpc-nodes) and [Event Logs](/data-tooling/event-logs) cover the data plumbing that every environment-specific ingestion pipeline ends up rebuilding.
* [Execution Overview](/execution/execution-overview) gives the traditional-markets decomposition of execution cost, which is the vocabulary these pages borrow and adapt.

---

#### Scope and Honesty About Evidence

Three limits are worth stating before you read on.

- **These pages describe architecture, not performance.** They contain no throughput figures, no block-time constants, and no confirmation-latency measurements. Such numbers move with client releases, validator hardware, load, and your network position, and a published figure is usually a best case measured under conditions you will not reproduce. Where magnitude genuinely matters, the text says so qualitatively and tells you to measure it.
- **Numbers that do appear are constructed.** Gas amounts, fee levels, and landing probabilities in worked examples are inputs chosen to make arithmetic legible. They are labelled as illustrative where they appear, and none of them is a measurement of any live network.
- **Implementations change faster than designs.** Specific clients, schedulers, and fee-market parameters are revised regularly. These pages name design *categories* — sequential versus parallel execution, global versus local fee markets, declared versus discovered state access, probabilistic versus consensus finality — because those categories have outlived several generations of the software implementing them.

> warning **Benchmark before you build a cost model** Nothing on these pages substitutes for measuring, from your own infrastructure and at the priority level you intend to pay, how long inclusion takes and what fraction of your submissions land. Both terms move, both are strategy-specific, and both usually matter more than the fee.

---

#### See Also

* [EVM (Ethereum Virtual Machine)](/blockchain-execution-environments/evm)
* [Solana / SVM](/blockchain-execution-environments/solana-svm)
* [Move VM (Aptos, Sui)](/blockchain-execution-environments/move-vm)
* [Comparing Execution Environments](/blockchain-execution-environments/comparative-benchmarks)
* [Quant Engineering Across Environments](/blockchain-execution-environments/quant-engineering)
* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [Advanced Topics](/advanced-topics)

---

### Comparing Execution Environments

> info **Metadata** Level: Advanced | Prerequisites: EVM, Solana / SVM, Move VM | Tags: execution-environments, comparison, fee-markets, finality, parallelism, defi

Comparisons between blockchain execution environments are usually conducted with numbers that expire. Throughput headlines, block-time constants, and confirmation latencies all move with client releases, validator hardware, network load, and the region you happen to be measuring from. A comparison built on them is out of date before it is finished, and worse, it tends to be *wrong in a direction* — the published figure is nearly always a best case measured under conditions you will not reproduce.

This page compares the things that do not move: how transactions are scheduled, how state is addressed, what determines whether two transactions can run at the same time, whose demand sets the price you pay, what happens to a transaction that does not work, and what "confirmed" is asserting. These are architectural commitments. They change through deliberate protocol redesign, not between Tuesday and Thursday, and they are what actually determine the shape of a strategy's cost function.

> warning **This page quotes no throughput or latency figures, deliberately** Transactions per second, block times, confirmation latencies, and fee levels date quickly and depend on load, hardware, client version, and your network position. Any number you read here would be stale and misleading. Benchmark the environment yourself, against your own infrastructure, at the priority you actually intend to pay — the methodology section below describes how.

---

#### The Comparison

Read this as three design philosophies rather than three products. Move is split where Aptos and Sui genuinely differ.

<table>
  <tbody>
    <tr>
      <td><strong>Dimension</strong></td>
      <td><strong>EVM chains</strong></td>
      <td><strong>Solana / SVM</strong></td>
      <td><strong>Move chains (Aptos, Sui)</strong></td>
    </tr>
    <tr>
      <td>Execution model</td>
      <td>Strictly sequential within a block</td>
      <td>Parallel, scheduled from declared account access</td>
      <td>Aptos: optimistic parallel over a fixed order. Sui: parallel by object ownership</td>
    </tr>
    <tr>
      <td>State model</td>
      <td>Per-contract key-value storage, code and state co-located</td>
      <td>Flat account buffers, programs stateless and separate from state</td>
      <td>Typed resources under an address (Aptos) or owned objects (Sui)</td>
    </tr>
    <tr>
      <td>Access set known before execution</td>
      <td>No — discovered as execution proceeds</td>
      <td>Yes — the transaction must declare every account it touches</td>
      <td>Sui: yes, inputs are named objects. Aptos: no, discovered at runtime</td>
    </tr>
    <tr>
      <td>What makes two transactions concurrent</td>
      <td>Nothing; there is no concurrency</td>
      <td>Disjoint writable account sets</td>
      <td>Aptos: non-overlapping read and write sets, verified after the fact. Sui: no shared object in common</td>
    </tr>
    <tr>
      <td>Fee market scope</td>
      <td>Global — one base fee for all blockspace, plus a competitive tip</td>
      <td>Local — prioritisation is contested per write-locked account</td>
      <td>Global base with per-transaction prioritisation</td>
    </tr>
    <tr>
      <td>Metering unit</td>
      <td>Gas, priced per opcode with cold and warm access tiers</td>
      <td>Compute units against a declared budget</td>
      <td>Gas units, with storage effects charged separately</td>
    </tr>
    <tr>
      <td>Pre-execution visibility of intent</td>
      <td>High where a public mempool exists; low behind private order flow</td>
      <td>Low — transactions are forwarded to the scheduled leader, not gossiped into a shared queue</td>
      <td>Varies by chain and client; no equivalent of a canonical public mempool</td>
    </tr>
    <tr>
      <td>Failed transaction</td>
      <td>Included in the block, reverted, gas consumed and charged</td>
      <td>Included and charged, or dropped entirely if not scheduled</td>
      <td>Included and charged for the work performed</td>
    </tr>
    <tr>
      <td>Retry mechanism</td>
      <td>Replace-by-fee against the same nonce</td>
      <td>Rebuild and re-sign; transactions expire with their reference blockhash</td>
      <td>Resubmit against the account sequence number</td>
    </tr>
    <tr>
      <td>Finality approach</td>
      <td>Reorganisable head plus a slower finality mechanism; rollups add a sequencer acknowledgement distinct from settlement</td>
      <td>Graded commitment levels, from processed through to a deeply confirmed root</td>
      <td>Byzantine-fault-tolerant consensus: committed is final, with Sui finalising owned-object transactions off the consensus path</td>
    </tr>
    <tr>
      <td>Composability</td>
      <td>Synchronous, atomic, permissionless across contracts</td>
      <td>Synchronous within a transaction, bounded by the declared account list</td>
      <td>Synchronous within a transaction, bounded by module and object typing</td>
    </tr>
  </tbody>
</table>

---

#### Fee Market Structure Is the Deepest Difference

The distinction between a global and a local fee market changes how you model cost, and it is easy to miss because both appear as "a fee you bid".

```text
global fee market:  price_you_pay = f(total demand for blockspace)
local fee market:   price_you_pay = f(demand for the specific state you write)
```

Under a global market, congestion anywhere raises your cost. A popular unrelated event prices your strategy out of a market it has nothing to do with. Under a local market, your cost tracks demand for the accounts you write. If your strategy touches an uncontested account, you are largely insulated; if it touches the single most contested account on the chain, you get no insulation at all and the local market is simply a smaller room containing exactly your competitors.

Neither is uniformly better. Global markets make cost easier to forecast from one chain-wide observable. Local markets make cost strategy-specific, which means a cost model calibrated on one venue does not transfer to another venue on the same chain. That is a modelling burden, not a feature.

---

#### Failure Semantics Determine Your Attempt Model

How an environment treats a transaction that does not achieve its goal drives the economics of retrying.

- **Charged and included.** The attempt appears on-chain and costs money. Retry economics are governed by cost per attempt times expected attempts.
- **Dropped without inclusion.** The attempt costs nothing on-chain but leaves you uncertain whether it landed. Retry economics are governed by idempotency risk rather than fee spend.
- **Expired.** The transaction becomes permanently unusable after a validity window and must be rebuilt. Retry is not "resend the same bytes".

An environment where failures are cheap encourages spamming attempts, which concentrates load on exactly the contested state everyone wants. An environment where failures are expensive suppresses attempt rates but makes each miss hurt. Both effects are structural, and both should appear in a cost model as an explicit attempt-rate and landing-probability term rather than being folded into an average fee. See [Quant Engineering Across Environments](/blockchain-execution-environments/quant-engineering).

---

#### What "Confirmed" Is Asserting

Three genuinely different claims travel under the same word.

1. **Probabilistic inclusion at the head.** The transaction is in the current best chain, which could be replaced. The probability of replacement falls with depth. Any strategy that acts on a confirmation at this level is exposed to reorganisation risk.
2. **Consensus-committed.** A quorum has agreed the block is part of history. Under the protocol's fault assumptions, it will not be reverted. This is a categorically stronger statement than depth-based probability.
3. **Settled on another layer.** A rollup's sequencer has acknowledged the transaction, but the settlement layer has not yet accepted the corresponding state. Two confirmations exist with different trust assumptions and different timings, and conflating them is a common source of mispriced risk.

The practical question is never "is it confirmed" but "what am I willing to act on". A market maker quoting against a position may accept the weakest level; a system releasing funds to a counterparty should not.

---

#### How to Benchmark It Yourself

Any figure worth having is one you measured under your own conditions. A defensible methodology:

- **Measure end to end, from your own infrastructure.** The quantity that matters is `t_confirmed - t_submitted` from the machine that will run the strategy, on the connection it will use, in the region it will sit. Node-provider dashboards measure something else.
- **Report distributions, never means.** Latency and landing behaviour are heavily right-skewed. Median plus the upper tail is informative; the average is not.
- **Hold the priority level fixed and stated.** A latency measurement without the fee bid attached is meaningless, because you can buy a better one. Sweep the bid and report a curve.
- **Measure the landing rate, not just the latency of the ones that landed.** `landing_rate = landed / submitted` is the term that most often dominates realised cost, and it is invisible if you only time successes.
- **Benchmark against the state you will actually touch.** A transfer between fresh accounts is the least contested operation available and tells you nothing about writing the busiest pool on the chain.
- **Re-measure.** Client releases, validator hardware, and load all move. Treat a benchmark as a perishable input with a timestamp, not a constant.

> info **The right comparison is per-strategy, not per-chain** Two strategies on the same chain can face completely different latency, cost, and landing behaviour depending on which state they contend for. Benchmark the strategy, not the environment.

---

#### Assumptions and Failure Modes

- **"Parallel execution beats sequential execution."** Only for workloads that parallelise. Trading concentrates demand on a small number of hot accounts, which is precisely the workload that serialises everywhere.
- **"Faster finality is strictly better."** Faster confirmation is bought with different fault assumptions and, usually, higher validator resource requirements. It is a trade, and which side you want depends on what you are settling.
- **"Architecture determines performance."** Architecture determines the *shape* of performance — where the bottleneck appears and what relieves it. Realised numbers depend on implementation, hardware, and load.
- **"Cheaper fees mean cheaper trading."** Fee per transaction is one term. Landing rate, failed-attempt cost, adverse selection, and the capital cost of a slower settlement cycle can each dominate it. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **"Comparing base layers compares what I trade on."** Most EVM activity settles on rollups whose sequencing, fee, and confirmation properties differ from the settlement layer. Comparing the base layer answers a question you probably were not asking.
- **"This table is complete."** It covers execution, state, fees, failure, and finality. It says nothing about security budget, validator decentralisation, client diversity, tooling maturity, or the liquidity that determines whether a strategy is viable at all.

---

#### See Also

* [EVM (Ethereum Virtual Machine)](/blockchain-execution-environments/evm)
* [Solana / SVM](/blockchain-execution-environments/solana-svm)
* [Move VM (Aptos, Sui)](/blockchain-execution-environments/move-vm)
* [Quant Engineering Across Environments](/blockchain-execution-environments/quant-engineering)
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms)
* [Latency Risk](/microstructure/latency-risk)

---

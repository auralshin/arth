### Quant Engineering Across Environments

> info **Metadata** Level: Advanced | Prerequisites: EVM, Solana / SVM, Move VM | Tags: execution-environments, engineering, cost-model, retries, latency, defi, backtesting

A strategy that works on one chain is not a strategy that works on another chain with a different endpoint configured. The alpha may port cleanly — a basis relationship, a funding-rate signal, a liquidity-provision edge — while almost everything between the signal and a settled position has to be rebuilt. The parts that break are rarely the interesting parts, which is exactly why they get underestimated.

This page walks the pipeline in the order a live system executes it: reading state, building a transaction, getting it included, knowing whether it landed, and pricing the whole thing. At each stage it names what is environment-specific and what is not, because the difference between the two determines how much of a system is worth abstracting and how much should stay explicitly per-chain.

---

#### What Ports and What Does Not

<table>
  <tbody>
    <tr>
      <td><strong>Layer</strong></td>
      <td><strong>Ports unchanged</strong></td>
      <td><strong>Must be rebuilt per environment</strong></td>
    </tr>
    <tr>
      <td>Signal and research</td>
      <td>The economic relationship, the feature set, the sizing rule</td>
      <td>Nothing, provided the input data is normalised first</td>
    </tr>
    <tr>
      <td>Data ingestion</td>
      <td>The schema you normalise into, and everything downstream of it</td>
      <td>Source protocol, event or log format, time index, reorganisation handling</td>
    </tr>
    <tr>
      <td>Transaction construction</td>
      <td>The decision of what to trade and how large</td>
      <td>Encoding, account or object declaration, signing, replay protection</td>
    </tr>
    <tr>
      <td>Submission and retry</td>
      <td>The policy of how long to persist and when to give up</td>
      <td>Bid mechanics, expiry rules, replacement semantics, idempotency guard</td>
    </tr>
    <tr>
      <td>Confirmation</td>
      <td>The risk appetite that sets which level you act on</td>
      <td>What each confirmation level asserts and how it can be revoked</td>
    </tr>
    <tr>
      <td>Cost model</td>
      <td>The structure: cost per attempt, landing rate, cost per fill</td>
      <td>Every parameter in it</td>
    </tr>
  </tbody>
</table>

---

#### Data Access

The first thing to fix is the **time index**. EVM chains count blocks; Solana counts slots, and a slot may be skipped, so slot number is not a dense counter. Move chains index by version or checkpoint. None of these are wall-clock time, and a research pipeline that silently treats a block or slot height as a uniform time step will produce autocorrelation artefacts that look like signal. Normalise to timestamps early and keep the native height alongside for joins.

The second is **what a historical read even means**. Log-based environments give you an append-only event stream from which state must be reconstructed; the reconstruction is your responsibility and its bugs are silent. Environments that expose typed resources or objects let you read a position directly, but historical reads then depend on the node retaining old versions, which most pruned nodes do not.

The third is **reorganisation handling**. Where the head is reorganisable, ingestion must be able to unwind and reapply. Where consensus commits deterministically, it need not. Building the unwind path is substantial work, and omitting it on a chain that needs it produces a dataset that is quietly wrong at exactly the volatile moments you care about. See [Event Logs](/data-tooling/event-logs) and [RPC & Nodes](/data-tooling/rpc-nodes).

---

#### Transaction Construction

The question that separates environments is **how much you must know before you sign**.

- On the EVM, you encode a call and a gas ceiling. The execution path discovers what state it needs as it runs, so a router can find its own way through pools.
- On Solana, you must declare every account the transaction will read or write. Route discovery therefore has to happen client-side, *before* signing, and a route that would have been optimal but was not declared is unavailable. Over-declaring widens your write-lock set and worsens contention for everyone.
- On Sui, inputs are named objects with versions, so a reference that has advanced since you built the transaction fails. On Aptos, no access declaration is required and construction resembles the EVM.

Replay protection differs correspondingly: a strictly increasing nonce, a recent blockhash with a validity window, or an account sequence number. These are not interchangeable, and each implies a different retry design.

> warning **A strict nonce is a serial channel** Where transaction ordering from one address is enforced by an incrementing counter, one stuck transaction blocks every later one from that address. Concurrency requires multiple signing keys and a scheduler that assigns work to free ones.

---

#### Retry, Confirmation, and Idempotency

Every live on-chain system converges on the same hard question: *the confirmation did not arrive — did it land?*

There are three answers, and the environment picks which one you get:

1. **Replaceable.** A pending transaction can be superseded by a higher bid at the same nonce. Retry is an upgrade, and at most one version can ever execute. This is the friendliest case.
2. **Expiring.** The transaction becomes invalid after a validity window. Once expired it definitively cannot execute, which gives you a clean deadline — but before expiry, an unconfirmed transaction is genuinely ambiguous and a naive resend can double-execute.
3. **Sequenced.** Replay protection is a per-account counter, so a resend at the same counter cannot double-execute, but a resend at the *next* counter can.

The only robust defence is an **on-chain idempotency key**: a per-intent identifier the contract records and rejects on repeat, so a duplicate submission fails at the protocol level rather than relying on your client being right about ambiguous state. Off-chain deduplication is necessary and not sufficient, because the failure you are guarding against is your own uncertainty about what the chain did.

---

#### Latency Structure

Porting a latency model is the mistake that looks most like competence. The relevant question is not "how fast is the network" but **where the queue is**.

- Where a public mempool and a block-building auction exist, most of the wait is auction dynamics and block cadence. The lever is what and where you bid, not how fast you sign.
- Where transactions are forwarded to a scheduled leader, the lever is connectivity to that leader and submission timing relative to its slot. There is no auction to observe, and less public information about competing intent.
- Where a single sequencer orders transactions, the lever is your position in that sequencer's queue, and the governing policy may be first-come-first-served, an auction, or something undocumented.

In all three, end-to-end latency is dominated by protocol-level queueing rather than by wire time. Microsecond engineering on the signing path is usually the wrong optimisation on-chain, which is a genuine inversion of the priorities that hold in colocated electronic markets. See [Latency Risk](/microstructure/latency-risk).

---

#### Cost Modelling: A Worked Example

The single most common error is to model cost as the fee of a successful transaction. The correct unit is **cost per fill**, which includes everything you paid for attempts that did not fill.

For independent attempts with landing probability `p`, the expected number of attempts to the first success is `1/p`, of which `1/p - 1` fail:

```text
E[cost per fill] = C_success + (1/p - 1) * C_fail
```

where:

- `p` is the probability an individual attempt lands and fills
- `C_success` is the fee paid on a successful attempt
- `C_fail` is the fee paid on a failed attempt, which may be zero if failures are dropped

Illustrative figures, not measurements:

<table>
  <tbody>
    <tr>
      <td><strong>Parameter</strong></td>
      <td><strong>Value</strong></td>
    </tr>
    <tr>
      <td>Landing probability, p</td>
      <td>0.40</td>
    </tr>
    <tr>
      <td>Cost of a successful attempt</td>
      <td>0.00300 ETH</td>
    </tr>
    <tr>
      <td>Cost of a failed attempt</td>
      <td>0.00090 ETH</td>
    </tr>
  </tbody>
</table>

1. **Expected attempts to a fill**: `1 / 0.40 = 2.5`
2. **Expected failures per fill**: `2.5 - 1 = 1.5`
3. **Cost per fill**: `0.00300 + 1.5 * 0.00090 = 0.00300 + 0.00135 = 0.00435 ETH`
4. **Overstatement from ignoring failures**: quoting `0.00300` understates true cost by about 31%

Now halve the landing rate to `p = 0.20`. Expected failures per fill become `5 - 1 = 4`, and cost per fill becomes `0.00300 + 4 * 0.00090 = 0.00660 ETH` — about half again as expensive, with no change to any fee. **Landing rate, not fee level, is usually the dominant term.** This is why an environment with cheap fees and a low landing rate can be more expensive to trade than one with expensive fees and a high landing rate.

Where failures are dropped rather than charged, `C_fail` is near zero and cost per fill collapses to `C_success`. That does not make retrying free: each failed attempt costs you time, and time spent unfilled while the price moves is adverse selection, which does not appear in the fee at all. See [Adverse Selection](/execution/adverse-selection).

---

#### Assumptions and Failure Modes

- **"Attempts are independent."** They are not. Failures cluster when the state you contend for is busy, so `p` is state-dependent and lowest exactly when the opportunity is largest. A constant `p` flatters the model.
- **"Backtested fills would have happened."** A backtest that assumes every signalled trade filled is assuming `p = 1`. Simulate the landing process explicitly or the result is not a strategy result. See [Backtest vs Live](/risk/backtest-vs-live).
- **"Simulation is execution."** Simulation runs against a state that will have moved. The discrepancy is not noise; it is systematically adverse, because the trades that fail are disproportionately the ones where the price moved against you.
- **"One abstraction covers all chains."** A common interface across environments with different failure semantics tends to paper over precisely the differences that matter, and the leak surfaces during the incident rather than during testing.
- **"Third-party endpoints are the chain."** A hosted node is a cache with a service-level agreement. Under load it may lag, rate-limit, or serve a stale head — and load correlates with opportunity.
- **"Confirmed is confirmed."** Acting on the weakest confirmation level a chain offers is a deliberate risk decision. Make it explicitly, per action, rather than inheriting whatever the client library defaults to.
- **"Costs are denominated in one asset."** Fees are paid in a native token whose price moves. A strategy earning in one asset and paying fees in another carries an unhedged exposure that grows with attempt rate.

---

#### Code

```python
def cost_per_fill(cost_success, cost_fail, landing_probability):
    """Expected cost of achieving one fill, including paid-for failures.

    Assumes independent attempts. Real landing rates fall when contention rises,
    so treat this as a lower bound on cost during volatile periods.
    """
    if not 0 < landing_probability <= 1:
        raise ValueError("landing_probability must be in (0, 1]")
    expected_failures = 1 / landing_probability - 1
    return cost_success + expected_failures * cost_fail


def minimum_viable_edge(cost_success, cost_fail, landing_probability, notional):
    """Gross edge, in basis points of notional, needed to break even per fill."""
    return 10_000 * cost_per_fill(cost_success, cost_fail, landing_probability) / notional


# 0.00435 ETH per fill on 5 ETH of notional needs roughly 8.7 bps of gross edge.
minimum_viable_edge(0.003, 0.0009, 0.40, 5.0)
```

> info **Instrument the landing rate first** Of every parameter in an on-chain cost model, the landing rate is the one most often assumed and least often measured. Log every submission, not only the ones that confirmed.

---

#### See Also

* [EVM (Ethereum Virtual Machine)](/blockchain-execution-environments/evm)
* [Solana / SVM](/blockchain-execution-environments/solana-svm)
* [Move VM (Aptos, Sui)](/blockchain-execution-environments/move-vm)
* [Comparing Execution Environments](/blockchain-execution-environments/comparative-benchmarks)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Backtest vs Live](/risk/backtest-vs-live)

---

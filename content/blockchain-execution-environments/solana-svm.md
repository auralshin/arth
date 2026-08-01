### Solana / SVM

> info **Metadata** Level: Intermediate | Prerequisites: EVM, Gas & Mempool | Tags: solana, svm, parallel-execution, fee-markets, contention, defi

The **Solana Virtual Machine (SVM)** takes the opposite design decision from the EVM on the question that matters most: whether transactions must execute one at a time. Solana requires every transaction to declare, up front, the full list of accounts it will read and write. Because the runtime knows the access set before execution, it can run transactions whose write sets do not overlap at the same time.

That one requirement — explicit state declaration — cascades into everything else. It is why execution can be parallel, why fee markets can be local rather than global, and why "contention" on Solana is a property of a *specific account* rather than of the chain as a whole. For a quant, it changes the unit of analysis: you stop asking "is the chain busy?" and start asking "is the account I need to write busy?".

---

#### The Account Model

Everything on Solana is an account: user balances, program state, and the programs themselves. An account is a flat buffer of bytes plus metadata.

```text
account = (lamports, data, owner, executable, rent_epoch)
```

where:

- `lamports` is the native-token balance in the smallest denomination
- `data` is an opaque byte array whose layout the owning program defines
- `owner` is the program permitted to modify `data` and debit `lamports`
- `executable` marks the account as a deployed program rather than state

**Programs are stateless.** A deployed program holds code and nothing else; all mutable state lives in separate accounts that the program owns. This is the structural inversion versus the EVM, where code and its storage share one address. It is also why a Solana instruction cannot discover state at runtime: the caller must pass every account the program will touch, which means the client has to know the full read-write set before it signs.

A transaction is a signed message containing an ordered account list — each entry flagged writable or read-only, signer or not — plus one or more instructions naming a program and the subset of accounts it uses.

---

#### Parallel Execution and the Conflict Rule

The scheduler applies one rule:

```text
two transactions may execute concurrently
    iff  writable(T1) INTERSECT (writable(T2) UNION readable(T2)) = empty
   and   writable(T2) INTERSECT (writable(T1) UNION readable(T1)) = empty
```

Read-only overlap is free: any number of transactions can read the same account at once. Write overlap serialises. A write lock on an account excludes every other transaction that touches it, reader or writer.

**Worked example.** Four transactions arrive with these access sets:

<table>
  <tbody>
    <tr>
      <td><strong>Transaction</strong></td>
      <td><strong>Writable</strong></td>
      <td><strong>Read-only</strong></td>
    </tr>
    <tr>
      <td>T1</td>
      <td>A, X</td>
      <td>P</td>
    </tr>
    <tr>
      <td>T2</td>
      <td>B, X</td>
      <td>P</td>
    </tr>
    <tr>
      <td>T3</td>
      <td>C, Y</td>
      <td>P</td>
    </tr>
    <tr>
      <td>T4</td>
      <td>D, Y</td>
      <td>P</td>
    </tr>
  </tbody>
</table>

1. All four read `P`, which creates no conflict at all — read locks are shared.
2. T1 and T2 both write `X`, so they conflict and must be ordered.
3. T3 and T4 both write `Y`, so they conflict and must be ordered.
4. No other pair shares a writable account.

The scheduler can therefore run T1 and T3 together, then T2 and T4 together: two rounds rather than four. Add a fifth transaction T5 that writes `X` and `Y` and the picture collapses — T5 conflicts with all four and must run alone.

That last case is the one that matters. **A single popular writable account is a serial bottleneck no matter how much capacity the rest of the chain has.** An automated market maker pool, a central limit order book's market state, or a shared oracle price account all have this shape.

---

#### Compute Units and Local Fee Markets

Solana meters work in **compute units (CU)** rather than per-opcode gas. A transaction declares a compute budget and a price it will pay per unit:

```text
priority_fee = compute_unit_limit * compute_unit_price
total_fee    = base_signature_fee + priority_fee
```

where:

- `compute_unit_limit` is the ceiling the transaction requests; exceeding it aborts execution
- `compute_unit_price` is the bid, denominated in micro-lamports per compute unit
- `base_signature_fee` is a small flat charge per signature

The important structural feature is that prioritisation is evaluated **against the accounts a transaction write-locks**, not against the chain as a whole. Demand to write one heavily contested account raises the price of getting write access to *that account*, while transactions touching unrelated accounts are largely unaffected. This is a genuinely different market structure from a single global base fee, where congestion anywhere raises the price everywhere.

> info **Fee competition is per-account** On a global fee market you compete with everyone. On a local fee market you compete with everyone who wants to write the same account you do — which, for a popular trading venue, may be exactly the same set of people.

---

#### Consequences for Contention and Ordering

**Ordering is decided by the current leader.** Transactions are forwarded to the validator scheduled to produce the next blocks rather than gossiped into a shared public mempool. There is no canonical, chain-wide pending queue to observe. This changes the information structure of the ordering game: less public pre-trade visibility than an EVM mempool, and correspondingly more weight on direct connectivity to the leader and on relative submission timing.

**Failure is cheap and common.** A transaction that runs out of compute, hits a stale state, or trips a slippage check aborts, and the fee is small relative to an EVM revert. The economically rational response — sending many attempts — is exactly what makes contested accounts congested. Your model needs an attempt rate and a landing probability, not just a per-fill cost.

**Transactions expire.** Every transaction references a recent blockhash and is only valid while that hash remains inside the node's recent-blockhash window. Past it, the transaction is not rejected as failed — it simply becomes unusable and must be rebuilt and re-signed. Unlike the EVM's replace-by-fee, there is no "same transaction, higher bid" upgrade path with a nonce anchoring identity, so idempotency has to be enforced at the application level.

**Design decisions become contention decisions.** Whether a protocol keeps one shared state account or shards state across many accounts determines the parallelism available to everyone trading it. Two venues with identical economics can have completely different congestion behaviour because of this choice alone.

---

#### Assumptions and Failure Modes

- **"Parallel execution means my transaction is fast."** It means transactions on *disjoint* accounts do not block each other. If your strategy targets the busiest account on the chain, you are in the serial case and get none of the benefit.
- **"I know my access set."** You must declare it before signing, but the optimal route may depend on state that changes between construction and execution. Over-declaring accounts widens your lock set and worsens contention; under-declaring fails the transaction.
- **"No mempool means no front-running."** Ordering power still sits with whoever sequences the block. Removing a public mempool changes who has the information advantage, not whether one exists. See [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms).
- **"Not confirmed means not executed."** A transaction whose confirmation you never observed may still have landed. Treating unconfirmed as failed and retrying without an on-chain idempotency guard is how strategies double-execute.
- **"Simulation reflects execution."** Simulation runs against current state with your declared accounts. Under parallel scheduling, another transaction may commit to one of your accounts between simulation and execution, and your read set becomes stale.
- **"Compute budgets are static."** Requesting far more compute than needed wastes budget and raises cost; requesting too little aborts mid-execution. The right limit depends on the branch taken, which depends on state.

---

#### Code

```python
def can_run_concurrently(tx_a, tx_b):
    """Solana's scheduling rule: writes exclude everything, reads share freely.

    Each transaction is a dict with 'writable' and 'readonly' sets of account keys.
    """
    a_touches = tx_a["writable"] | tx_a["readonly"]
    b_touches = tx_b["writable"] | tx_b["readonly"]
    return not (tx_a["writable"] & b_touches) and not (tx_b["writable"] & a_touches)


def greedy_batches(transactions):
    """Group transactions into conflict-free batches, in arrival order."""
    batches = []
    for tx in transactions:
        placed = False
        for batch in batches:
            if all(can_run_concurrently(tx, other) for other in batch):
                batch.append(tx)
                placed = True
                break
        if not placed:
            batches.append([tx])
    return batches


# The number of batches, not the transaction count, is what bounds latency
# for a strategy competing on one contested account.
```

---

#### See Also

* [EVM (Ethereum Virtual Machine)](/blockchain-execution-environments/evm)
* [Move VM (Aptos, Sui)](/blockchain-execution-environments/move-vm)
* [Comparing Execution Environments](/blockchain-execution-environments/comparative-benchmarks)
* [Quant Engineering Across Environments](/blockchain-execution-environments/quant-engineering)
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms)
* [Perp DEX Architecture](/protocols/perp-dex)

---

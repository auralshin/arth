### Move VM (Aptos, Sui)

> info **Metadata** Level: Advanced | Prerequisites: EVM, Solana / SVM | Tags: move, aptos, sui, linear-types, parallel-execution, asset-safety, defi

**Move** is a smart-contract language and virtual machine built around a single idea: an asset should be a value the type system knows how to protect, not a number in a mapping that the programmer promises to keep consistent. In the EVM, a token balance is an integer in a contract's storage, and every guarantee about conservation of value is a property of the code the author happened to write. In Move, a token is a value of a type that *cannot be copied and cannot be silently discarded*, and conservation is enforced by the compiler and the bytecode verifier before anything executes.

Two production chains use Move with materially different storage models: **Aptos**, which keeps Move's global storage under account addresses, and **Sui**, which replaces global storage with a first-class object model. They also derive parallelism from different places — Aptos from optimistic concurrency over a pre-ordered block, Sui from the observation that many transactions touch only objects nobody else can see. Both matter to a quant, because both determine where contention appears.

---

#### Linear Types and the Abilities System

A Move struct declares which of four **abilities** it has. The abilities are the whole safety story.

<table>
  <tbody>
    <tr>
      <td><strong>Ability</strong></td>
      <td><strong>Permits</strong></td>
      <td><strong>Omitting it means</strong></td>
    </tr>
    <tr>
      <td><code>copy</code></td>
      <td>Duplicating the value</td>
      <td>The value cannot be cloned; there is only ever one of it</td>
    </tr>
    <tr>
      <td><code>drop</code></td>
      <td>Discarding the value</td>
      <td>The value must be explicitly consumed; it cannot go out of scope</td>
    </tr>
    <tr>
      <td><code>store</code></td>
      <td>Persisting inside another structure</td>
      <td>The value cannot be held in storage or nested in another struct</td>
    </tr>
    <tr>
      <td><code>key</code></td>
      <td>Acting as a top-level entry in storage</td>
      <td>The value cannot be stored directly under an address</td>
    </tr>
  </tbody>
</table>

A type declared with `store` but neither `copy` nor `drop` is a **linear** type: each value must be used exactly once. That is the shape every asset type takes.

```text
struct Coin has store        // deliberately no `copy`, no `drop`

split(c: Coin, amount: u64): (Coin, Coin)
merge(a: Coin, b: Coin): Coin
```

Because `Coin` lacks `copy`, no code path can duplicate one. Because it lacks `drop`, no code path can let one fall out of scope. Every `Coin` that comes into a function must leave it — returned, stored, merged into another, or explicitly burned by a function the defining module authorises. There is no way to write the "forgot to update the sender's balance" bug, because there is no separate balance to forget: the value *is* the object.

---

#### Worked Example: Conservation as a Compile Error

A function receives a `Coin` of 100 units, is supposed to take a 30-unit fee, and return the rest.

1. `split(c, 30)` consumes the input and yields two values: a `Coin` of 30 and a `Coin` of 70. The original binding is gone — it was moved, not read.
2. The fee `Coin` of 30 is deposited into the protocol's treasury. It has been consumed.
3. The remaining `Coin` of 70 must now be returned to the caller, stored somewhere, or merged into another `Coin`.
4. If the author forgets step 3, the function does not compile. The 70 units have no exit path, and a linear value without an exit is a type error.

The arithmetic is unremarkable: `30 + 70 = 100`. What matters is that the invariant is checked statically rather than by an auditor reading the code, and that it holds across module boundaries — a third-party protocol handling your `Coin` is bound by the same rule.

> warning **Linear types protect representation, not economics** The verifier guarantees no `Coin` is duplicated or lost. It says nothing about whether the module's mint function is guarded correctly, whether the oracle is honest, or whether the fee is fair. Access-control bugs, oracle manipulation, and bad parameterisation all remain fully available.

---

#### Two Storage Models

**Aptos** keeps Move's global storage: resources with the `key` ability are stored *under an account address*, and a module reads or moves them with explicit operations. State is addressed by the pair of owning address and resource type, which makes the location of any piece of state statically predictable from the code.

**Sui** removes global storage in favour of objects. Every value with `key` is an object carrying a unique ID, and each object has an ownership status:

- **Address-owned** — one account controls it, and only transactions signed by that account can use it as an input.
- **Shared** — any transaction may name it as an input; multiple parties can touch it.
- **Immutable** — frozen and readable by anyone, never mutable again.

That ownership distinction is not a permissions convenience. It is the pivot on which Sui's execution model turns, because it determines whether a transaction needs to be ordered against anyone else's.

---

#### Where Parallelism Comes From

**Aptos: optimistic concurrency over a fixed order.** Aptos uses **Block-STM**, a software-transactional-memory scheduler. Transactions in a block have a predetermined order. The scheduler executes them speculatively and in parallel over a multi-version view of state, recording each transaction's read set. It then validates: if a transaction read a value that an earlier-ordered transaction subsequently wrote, its result is invalid and it is re-executed. The committed outcome is always identical to serial execution in the block's order.

The engineering consequence is that **you do not declare your access set** — unlike Solana, the client says nothing about which state it will touch. Parallelism is discovered at runtime. The cost is re-execution: when many transactions in a block write the same hot state, the scheduler's optimism is wrong repeatedly and the effective parallelism collapses toward serial.

**Sui: consensus avoidance for owned objects.** A transaction whose inputs are all address-owned objects has, by construction, no other party who could concurrently touch them. Such transactions can be processed through a fast path that does not require full consensus sequencing. Transactions naming a shared object do need consensus to fix their relative order, because several parties may be contending for the same object.

```text
inputs all address-owned  ->  no ordering conflict possible  ->  fast path
any input shared          ->  order must be agreed           ->  consensus path
```

For a trading system this maps directly onto strategy shape. Transfers, settlement of already-matched positions, and anything operating on objects you exclusively own sit on the cheap path. Anything that trades against a shared pool or a shared order book names a shared object and rejoins the queue with everyone else.

---

#### What This Means for Trading Systems

**Contention is still the binding constraint.** Both models parallelise the easy case and serialise the contested one. The identity of the contested object differs — a hot resource under Block-STM, a shared object on Sui — but the analysis is the same as on Solana: find the state your strategy must write, and ask how many other participants must write it too.

**Portfolio state is enumerable.** Because assets are typed values held under an address or as owned objects, "what does this account hold" is a direct lookup rather than a reconstruction from event history. Position and inventory reconciliation is materially simpler than log-replay on an EVM chain.

**Transaction construction differs sharply between the two.** Sui requires you to name object IDs as inputs, and an object's version changes when it is used, so a stale reference fails. Aptos requires no access declaration at all, so transaction building is closer to the EVM. Porting between them is not a configuration change.

**Determinism holds.** Both models commit a result equal to some fixed serial order, so replaying history reproduces the chain's state exactly. Speculative execution and re-execution are scheduling details, not sources of non-determinism in the committed result.

---

#### Assumptions and Failure Modes

- **"Move is safe, so the protocol is safe."** The verifier eliminates asset duplication and accidental destruction. It does not check economic logic, capability distribution, oracle integrity, or liquidation parameters. See [Smart Contract Risk](/risk/smart-contract).
- **"Parallel execution guarantees throughput."** Block-STM degrades toward serial as write conflicts rise; Sui's fast path disappears the moment a shared object is named. Both give you concurrency exactly where you did not need it and serialise where you did.
- **"Capabilities are simply access control."** A capability is itself a value. Whoever holds it holds the privilege, and a capability handed to the wrong module is a permanent grant unless the design provides revocation.
- **"Object references are stable."** On Sui an object's version advances when used. A transaction built against a stale version fails, which makes reference freshness an operational concern for any strategy with in-flight transactions.
- **"Simulation predicts the fee."** Execution cost depends on the path taken and on storage effects, and re-execution under contention is not something a single-transaction simulation reveals. Measure under load, not in isolation.
- **"Tooling parity with the EVM."** The indexing, node, and analytics ecosystem is smaller. Budget engineering time for data infrastructure you would take for granted elsewhere. See [RPC & Nodes](/data-tooling/rpc-nodes).

---

#### Code

The scheduling behaviour, not the language, is what a cost model needs. This sketch shows why write contention degrades optimistic parallelism.

```python
def block_stm_rounds(read_sets, write_sets):
    """Rounds needed to commit a block under optimistic execution.

    Transactions are indexed in their fixed block order. A transaction must be
    re-executed if any earlier-ordered transaction wrote something it read.
    """
    committed = set()
    rounds = 0
    pending = list(range(len(read_sets)))

    while pending:
        rounds += 1
        # Speculative execution: everything pending runs this round.
        valid = []
        for i in pending:
            conflicts = any(
                j < i and j not in committed and (read_sets[i] & write_sets[j])
                for j in range(len(read_sets))
            )
            if not conflicts:
                valid.append(i)
        committed.update(valid)
        pending = [i for i in pending if i not in committed]

    return rounds


# With disjoint access sets this returns 1. With every transaction writing the
# same account it returns n: optimism buys nothing on contested state.
```

---

#### See Also

* [EVM (Ethereum Virtual Machine)](/blockchain-execution-environments/evm)
* [Solana / SVM](/blockchain-execution-environments/solana-svm)
* [Comparing Execution Environments](/blockchain-execution-environments/comparative-benchmarks)
* [Quant Engineering Across Environments](/blockchain-execution-environments/quant-engineering)
* [Smart Contract Risk](/risk/smart-contract)
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms)

---

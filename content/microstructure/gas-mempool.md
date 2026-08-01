### Gas and the Mempool

> info **Metadata** Level: Intermediate | Prerequisites: How Blocks Form, Fees & Routing, Slippage | Tags: gas, mempool, fee-market, eip-1559, inclusion, execution, defi

**Gas** is a unit of metered work. Every opcode a transaction executes, every storage slot it touches, and every byte of calldata it carries has a fixed gas price in that unit, and the sum is what the sender pays for. It exists because a public execution environment cannot let anyone run an unbounded computation for free, and the metering is deliberately crude: it prices worst-case resource consumption, not the economic value of what you were trying to do.

The **mempool** is where a signed transaction waits between broadcast and inclusion. It is the closest thing an on-chain venue has to a pre-trade order queue, with one difference that dominates everything else on this page: the queue is public, the entries are fully specified, and anyone may read them and act first. For someone sizing and timing a trade, gas is a cost that behaves like a fixed fee, and the mempool is an information leak that behaves like a tax proportional to how much you revealed. This page treats both as microstructure rather than as plumbing. The block-assembly pipeline itself is covered in [How Blocks Form](/transaction-ordering-mev/how-blocks-form).

---

#### Formal Definition

Under the fee market introduced by EIP-1559 and adopted by most EVM chains, a sender specifies three quantities: a `gas_limit`, a `max_fee_per_gas` (the ceiling it will pay per unit), and a `max_priority_fee_per_gas` (its bid to the block producer). The chain computes a `base_fee` per block that no sender controls. The price actually charged is:

```text
effective_gas_price = min(max_fee_per_gas, base_fee + max_priority_fee_per_gas)
total_fee           = gas_used * effective_gas_price
burned              = gas_used * base_fee
paid_to_producer    = gas_used * (effective_gas_price - base_fee)
```

where:

- `gas_used` is the work the transaction actually consumed, which is at most `gas_limit`
- `base_fee` is a protocol-computed floor destroyed rather than paid to anyone
- the transaction is ineligible for inclusion in any block whose `base_fee` exceeds `max_fee_per_gas`

Three consequences follow immediately and each one matters for sizing.

**Unused gas is refunded, but not free.** The sender's balance must cover `gas_limit * max_fee_per_gas` before execution begins, even though only `gas_used * effective_gas_price` is charged. A generous gas limit therefore locks capital for the duration and is not costless when the account is running near its balance.

**Reverting still costs.** A transaction that runs out of gas, or whose slippage check fails, consumes gas up to the point of failure and pays for it. Failure is a paid outcome, not a free option.

**The base fee moves on a bounded path.** It is adjusted once per block from the previous block's consumption:

```text
base_fee_next = base_fee * (1 + (gas_used - gas_target) / (gas_target * 8))
```

Since `gas_used` lies between zero and twice `gas_target`, the multiplier lies between 0.875 and 1.125. The base fee can rise by at most 12.5% per block and fall by at most 12.5%. Over `n` blocks it is bounded above by `base_fee * 1.125^n`, which is a hard guarantee you can price against.

> info **The base fee is a lagging price** It responds to the block that has already been produced, and its 12.5% cap means a demand spike is rationed by queueing before it is rationed by price. Congestion shows up as delay first and cost second.

---

#### Worked Example: What a Swap Costs and When It Is Priced Out

All figures are illustrative and denominated in the chain's native unit.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Gas limit set by the wallet</td><td>200,000</td></tr>
    <tr><td>Gas actually consumed</td><td>165,000</td></tr>
    <tr><td>Base fee at submission</td><td>20 gwei</td></tr>
    <tr><td>Max priority fee</td><td>2 gwei</td></tr>
    <tr><td>Max fee per gas</td><td>40 gwei</td></tr>
  </tbody>
</table>

1. **Effective gas price**: `min(40, 20 + 2) = 22` gwei
2. **Total fee**: `165,000 * 22 = 3,630,000` gwei, or **0.00363 ETH**
3. **Split**: `165,000 * 20 = 0.00330` ETH burned, `165,000 * 2 = 0.00033` ETH to the producer
4. **Balance locked upfront**: `200,000 * 40 = 8,000,000` gwei, or **0.008 ETH** — 2.2 times the amount finally spent
5. **Exclusion threshold**: the transaction cannot be included once the base fee exceeds 40 gwei
6. **How long that takes**: `1.125^5 = 1.802` and `1.125^6 = 2.027`, so even six consecutive maximally-full blocks are required to double the base fee. The transaction is guaranteed eligible for at least five blocks, roughly a minute at twelve-second block times
7. **The squeeze before exclusion**: at a base fee of 39 gwei the effective price is capped at 40, so the realised priority fee is 1 gwei rather than 2 — the bid for position degrades before eligibility is lost

Now turn the fee into a sizing constraint. A fixed cost of 0.00363 ETH per attempt implies a minimum economic trade size for any given edge:

```text
min_notional = fixed_cost / (edge_in_bps / 10,000)
```

<table>
  <tbody>
    <tr><td><strong>Edge captured</strong></td><td><strong>Break-even notional (ETH)</strong></td></tr>
    <tr><td>5 bps</td><td>7.26</td></tr>
    <tr><td>10 bps</td><td>3.63</td></tr>
    <tr><td>30 bps</td><td>1.21</td></tr>
  </tbody>
</table>

This is the same fixed-cost logic developed in [Fees & Routing](/microstructure/fees-routing), and it is why on-chain strategies concentrate at larger sizes and lower frequencies than their off-chain equivalents. Splitting a parent order into children to reduce impact multiplies the fixed cost by the number of children, so the optimal schedule is coarser than the impact model alone would suggest. See [Market Impact](/execution/market-impact).

---

#### The Mempool Is a Pre-Trade Information Leak

Compare what a resting limit order reveals with what a pending transaction reveals.

<table>
  <tbody>
    <tr><td><strong>Revealed</strong></td><td><strong>Limit order on a book</strong></td><td><strong>Pending transaction</strong></td></tr>
    <tr><td>Side and price</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>Full size</td><td>Optional — iceberg and hidden types exist</td><td>Yes, always</td></tr>
    <tr><td>Identity of the sender</td><td>No</td><td>Yes, as a persistent address</td></tr>
    <tr><td>The exact route and venues</td><td>No</td><td>Yes, encoded in calldata</td></tr>
    <tr><td>The worst price you will accept</td><td>Only for a limit, never for a market order</td><td>Yes — the slippage minimum is a published reservation price</td></tr>
    <tr><td>Withdrawable before execution</td><td>Yes, by cancel</td><td>No, only replaceable by a competing transaction</td></tr>
  </tbody>
</table>

The last two rows are the ones without a traditional analogue. A market order sent to a broker does not announce the worst fill its sender would tolerate; a swap transaction does, because the minimum-output check has to be in the calldata for the contract to enforce it. That figure is an upper bound on what an extractor can take and still leave the transaction succeeding, which is exactly why [Slippage, Fees, and Frontrunning](/risk/slippage-frontrunning) treats the tolerance as a published budget rather than a safety setting.

The identity column compounds it. Addresses are persistent, so flow is attributable across time. A strategy that submits recognisable transactions from one address is running a signed, timestamped, permanently archived trading log, and anyone may condition on it.

> warning **A wide slippage tolerance is not a convenience setting** It is the maximum an extractor may take from the fill while leaving it valid. Setting it loosely to avoid reverts converts a failure mode into a cost.

---

#### Replacement, Cancellation, and Nonce Discipline

A pending transaction cannot be deleted. The only available operation is to broadcast a different transaction with the **same sender and the same nonce**, so that at most one of them can ever be valid.

- **Replacement is a race, not a command.** Both versions propagate. Whichever an assembler happens to hold when it builds is the one that can be included. Nodes commonly refuse to relay a replacement unless the fee is raised by some minimum margin, frequently 10%, but that is node policy rather than a protocol rule and it varies.
- **Cancellation is replacement with a no-op.** Sending a zero-value self-transfer at the same nonce is the standard idiom. It does not remove the original; it competes with it, and it costs gas whether or not it wins.
- **A nonce gap blocks everything behind it.** Transactions from one sender must execute in nonce order. One stuck transaction at nonce `n` makes every later transaction unexecutable, however generous their own fees. Systems that assign nonces optimistically and submit concurrently must reconcile the whole window on any failure, not just the failed item.
- **Replacement leaks intent too.** A visible fee escalation on a pending swap tells observers that the sender wants it filled and how badly, which is information they can price.

Multi-leg strategies inherit this structure. Two transactions that must both land, or neither, cannot be expressed as two independent broadcasts; they have to be one transaction, or one bundle, or the strategy must tolerate a half-filled state. This is the on-chain analogue of the contingent order types described in [Order Types](/execution/order-types), and the analogue is imperfect: a book offers fill-or-kill, immediate-or-cancel, and good-till-time as venue-enforced primitives, whereas on-chain the only native primitives are atomicity within a transaction and a deadline timestamp.

---

#### Inclusion Is a Distribution, Not an Event

Once broadcast, the outcome is a random variable over at least four states, and a trading system needs a policy for each:

1. **Included at the next block, succeeding.** The intended case.
2. **Included later.** The state it executes against has moved. The slippage check either absorbs the move or reverts.
3. **Included and reverted.** Fees paid, nothing achieved, and the position is unchanged when the model may already assume otherwise.
4. **Never included.** It sits until the deadline passes or the sender replaces it, holding the nonce hostage the whole time.

The distribution is not stationary. It shifts precisely during the volatile episodes when execution matters most, because that is when the base fee is climbing, the mempool is deep, and competing flow is willing to outbid you. The correlation between "my fill quality degrades" and "the market is moving" is the on-chain form of the general problem in [Latency Risk](/microstructure/latency-risk) — and note that the contest is resolved by bid rather than by arrival order, so being fast is a qualifying condition rather than the deciding one.

The deadline parameter deserves particular care. A long deadline turns a pending transaction into a free option written to the assembler, exercisable whenever the state makes it profitable to include. A short deadline converts that exposure into revert risk. Neither setting is safe; the choice is which failure you prefer.

---

#### In Practice Across Execution Environments

**Ethereum mainnet.** A public mempool, EIP-1559 pricing, and a mature builder market. Private submission endpoints are available and remove public exposure at the cost of trusting a smaller set of assemblers. See [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses).

**Rollups.** Execution gas is cheap; the dominant cost is publishing data to the settlement layer, priced through a separate blob-gas market whose base fee moves exponentially in accumulated excess demand. The practical consequence is that a rollup's fees are correlated with settlement-layer congestion rather than with its own activity. Most rollups also run a single sequencer with no public mempool, which removes public frontrunning and replaces it with a trust assumption about the sequencer.

**Chains with local fee markets.** Where fees are priced per contended resource rather than globally — for example by the accounts a transaction writes to — congestion in one market does not price out unrelated activity. This changes the sizing calculus materially: the relevant question becomes contention on the specific state you touch, not chain-wide demand. See [Solana SVM](/blockchain-execution-environments/solana-svm).

**First-price chains.** Without a base fee there is no protocol-computed floor, so senders bid directly and systematically overpay under uncertainty. Fee estimation is harder and the variance of realised cost is higher.

**Account abstraction and paymasters.** When a third party sponsors fees, the economics above still hold but the payer changes, and the sponsorship relationship becomes a dependency the strategy must model.

---

#### Assumptions and Failure Modes

- **Gas estimation assumes the current state.** Simulation runs against the state now; execution runs against the state after whatever the assembler put first. A different branch, a cold storage slot, or a changed route can consume more than estimated, and the result is an out-of-gas revert that still pays.
- **The fee estimate assumes a base-fee path.** The 12.5% bound gives a rigorous ceiling over `n` blocks, so a max fee can be set to a stated survival horizon rather than to a guess. Very few systems do this.
- **"The mempool" is assumed to be one object.** It is not. Propagation is uneven, private orderflow is invisible, and two observers disagree about the pending set at the same instant. Any inference drawn from an observed mempool is conditional on your vantage point.
- **Replacement is assumed to work.** It is a race with a node-policy-dependent fee bump, and it fails silently — the original may land while you believe you cancelled it. Treat both outcomes as live until one is confirmed. See [Operational Risk](/risk/operational).
- **Gas is assumed to be the cost.** For small trades it is; for large ones the ordering cost dwarfs it. Optimising the fee while ignoring what the mempool revealed is optimising the smaller term. See [The Economics of Transaction Ordering](/transaction-ordering-mev/ordering-economics).
- **Confirmation is assumed to be final, and fees conveniently denominated.** Where finality is probabilistic, a reorganisation can undo state a strategy has already acted on; and fees are paid in the native asset, which is itself a volatile position for any strategy that does not hold it deliberately.

---

#### Code

```python
def effective_gas_price(base_fee, max_fee, max_priority_fee):
    """Price actually charged per unit of gas, or None if not includable.

    The cap bites before eligibility is lost: the realised priority fee
    is squeezed as the base fee approaches max_fee.
    """
    if base_fee > max_fee:
        return None
    return min(max_fee, base_fee + max_priority_fee)


def base_fee_ceiling(base_fee_now, blocks):
    """Hard upper bound on the base fee after `blocks` blocks.

    The update rule caps the per-block increase at 12.5%, so this bound
    holds whatever demand does. Use it to pick a max fee for a stated
    survival horizon rather than guessing.
    """
    return base_fee_now * 1.125**blocks


def min_economic_notional(fee_in_native, edge_bps):
    """Smallest trade whose expected edge covers one attempt's gas.

    Charge the fee against attempts, not fills: reverted transactions
    pay too, so divide by the historical success rate before sizing.
    """
    return fee_in_native / (edge_bps / 10_000.0)
```

---

#### See Also

* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [Order Types](/execution/order-types)
* [Slippage, Fees, and Frontrunning](/risk/slippage-frontrunning)
* [Fees & Routing](/microstructure/fees-routing)
* [Latency Risk](/microstructure/latency-risk)
* [On-Chain vs Off-Chain Execution](/microstructure/onchain-offchain)
* [MEV, Formally](/microstructure/mev-formal)

---

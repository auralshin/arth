### EVM (Ethereum Virtual Machine)

> info **Metadata** Level: Intermediate | Prerequisites: What Is DeFi, Gas & Mempool | Tags: evm, execution-environments, gas, state, ordering, defi

The **Ethereum Virtual Machine (EVM)** is a single-threaded, deterministic state machine. It holds one global state, applies transactions to it strictly one at a time, and charges every operation a metered price in a unit called **gas**. Ethereum runs it, and so do a large number of other chains and rollups that reuse the same bytecode format and opcode semantics.

For someone building a trading system, the EVM is not infrastructure sitting underneath the market — it *is* the market's matching and settlement layer. Three defining properties, total ordering, synchronous composability, and pay-for-attempt gas metering, determine what your cost function looks like, what your failure modes are, and how large an edge has to be before it survives contact with the chain.

---

#### The Account and State Model

The EVM's world state is a mapping from 20-byte addresses to accounts. There are two kinds.

```text
account = (nonce, balance, storage_root, code_hash)

externally owned account:  code_hash = hash(empty code), storage_root = empty
contract account:          code_hash = hash(bytecode),   storage_root = root of its storage
```

where:

- `nonce` is a per-account transaction counter, used for replay protection and ordering
- `balance` is the native-token balance held directly by the protocol
- `storage_root` commits to that contract's private key-value store
- `code_hash` commits to the bytecode deployed at that address

Each contract owns a private store mapping 256-bit keys to 256-bit values. Nothing else can write to it; other contracts read it only through functions the contract chooses to expose. Token balances are not held by the wallet — an ERC-20 balance is an entry in the *token contract's* storage, keyed by your address. This is why approvals exist, and why "my wallet holds the token" is a user-interface fiction. See [ERC-20](/building-blocks/erc20).

Two consequences matter for quant work. First, **state is not queryable by relation**. There is no index over "all positions with a health factor below 1"; anything resembling a query must be reconstructed off-chain from event logs. Second, the **nonce is a strict sequence**: transaction `n+1` from an address cannot be included before transaction `n`. A single account is therefore a serial channel, and a strategy that wants several transactions in flight at once needs several signing keys.

---

#### Gas Metering

Every opcode has a gas cost meant to approximate the resource it consumes. Storage operations dominate: writing a slot is far more expensive than arithmetic, and the first access to a given slot or address within a transaction ("cold") costs more than later accesses ("warm").

The fee a transaction pays is:

```text
effective_gas_price = min(max_fee, base_fee + priority_fee)
fee                 = gas_used * effective_gas_price
```

where:

- `base_fee` is set by the protocol per block and burned, not paid to the block producer
- `priority_fee` is the tip that accrues to the producer
- `max_fee` is the ceiling the sender signed and is willing to pay
- `gas_used` is metered execution, not the `gas_limit` the sender declared

The base fee is adjusted by the protocol block to block: it rises when the previous block used more than the target amount of gas and falls when it used less, by a bounded fraction each time. That makes the base fee a slow-moving, chain-wide variable and the priority fee the fast-moving, competitive one.

> warning **Gas is charged for attempts, not outcomes** A transaction that reverts still pays for the gas it burned before reverting. An atomic arbitrage that checks profitability and reverts when unprofitable protects your capital, not your fee budget.

---

#### Worked Example

Illustrative figures only. These are inputs to the arithmetic, not measurements of any live network.

<table>
  <tbody>
    <tr>
      <td><strong>Quantity</strong></td>
      <td><strong>Value</strong></td>
    </tr>
    <tr>
      <td>Gas used by the swap</td>
      <td>120,000</td>
    </tr>
    <tr>
      <td>Base fee</td>
      <td>20 gwei</td>
    </tr>
    <tr>
      <td>Priority fee (tip)</td>
      <td>2 gwei</td>
    </tr>
    <tr>
      <td>Gas consumed before a revert</td>
      <td>45,000</td>
    </tr>
  </tbody>
</table>

One gwei is `1e-9` ETH. Step by step:

1. **Effective gas price**: `20 + 2 = 22 gwei`
2. **Fee on success**: `120,000 * 22 = 2,640,000 gwei = 0.00264 ETH`
3. **Split**: `120,000 * 20 = 2,400,000 gwei = 0.00240 ETH` burned, `0.00024 ETH` to the producer
4. **Fee on a revert**: `45,000 * 22 = 990,000 gwei = 0.00099 ETH`, paid with nothing to show for it
5. **Break-even gross edge**: the trade must clear `0.00264 ETH` before it earns anything

Now raise the tip to 20 gwei to compete for position within the block. The effective price becomes 40 gwei, the successful fee becomes `120,000 * 40 = 4,800,000 gwei = 0.00480 ETH`, and the break-even edge nearly doubles. Fee competition is not a rounding error on an on-chain strategy — it is the mechanism by which the edge gets bid away.

---

#### Sequential Execution and Ordering

Transactions in a block execute one after another in the order the producer chose. The state after transaction `i` is the input to transaction `i+1`. There is no protocol-level parallelism, and your position within the block is decided by an actor whose incentives are not yours.

That single fact produces most of what is distinctive about on-chain trading:

- **Position in the block is a priced good.** Being first to touch a pool after an oracle update is worth something, so it is auctioned — through priority fees, through builder auctions, or through private order flow. See [How Blocks Form](/transaction-ordering-mev/how-blocks-form).
- **Your intent is observable before it executes.** A transaction sitting in a public mempool is a signed statement of what you are about to do, at a price you have already committed to. See [Gas & Mempool](/microstructure/gas-mempool).
- **Composability is synchronous and atomic.** Because execution is serial, a contract can call another, read the resulting state, and revert the whole thing if the outcome is unsatisfactory. Flash loans and multi-leg atomic arbitrage exist because of this property, not despite it.

---

#### What This Means for Trading Systems

**Simulation is cheap and faithful.** Execution is deterministic and single-threaded, so you can replay a transaction against a specific historical state and get exactly the result the chain got. There is no scheduler non-determinism to model, which makes EVM chains unusually friendly to transaction-level backtesting. See [On-Chain Data](/simulation/onchain-data).

**Slippage protection is a revert, not a partial fill.** A minimum-output parameter does not fill you smaller; it fails the transaction. Your fill distribution is bimodal — full size, or nothing plus a gas cost — which is a different modelling problem from a partially filled limit order.

**Latency is not the whole story.** The gap between broadcasting and inclusion is dominated by block cadence and auction dynamics, not network round-trips. Shaving time off your signing path matters far less than where you submit and what you bid. See [Latency Risk](/microstructure/latency-risk).

**Cost scales with state writes, not notional.** Fees are broadly flat in trade size, so a fixed cost per attempt makes small trades uneconomic and large trades cheap in relative terms. This is the opposite of the proportional-commission model most equity cost models assume, and it reshapes the optimal trade-size distribution. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).

---

#### Assumptions and Failure Modes

- **"My transaction will be included."** Inclusion is a bid, not a guarantee. A transaction can sit unconfirmed indefinitely if the base fee rises above the signed ceiling. Cost models that assume certain inclusion understate cost.
- **"Simulation predicts execution."** Simulation runs against a state that will have moved by the time you are included. The gap between simulated and realised outcome is adverse selection, and it widens with volatility. See [Adverse Selection](/execution/adverse-selection).
- **"Reverts are free."** They are not. A strategy with a low fill rate can spend more on failures than on fills.
- **"Gas estimates are stable."** Estimated gas depends on the state at estimation time. A path that touches cold storage slots costs more than the warm path you measured, and refund rules change across protocol upgrades.
- **"Confirmed means final."** A transaction confirmed at the head of a chain with probabilistic head selection can still be reorganised away. On rollups, the sequencer's acknowledgement and the settlement layer's confirmation are different events with different trust assumptions.
- **"One address is enough."** Strict nonce ordering means a single stuck transaction blocks every later one from that address. This is an operational failure mode, not a theoretical one. See [Operational Risk](/risk/operational).
- **"Reentrancy is a solved problem."** Synchronous composability means an external call can re-enter your contract mid-execution. Checks-effects-interactions and guards mitigate it; they do not make the surface disappear. See [Smart Contract Risk](/risk/smart-contract).

---

#### Code

```python
GWEI = 1e-9  # ETH per gwei


def transaction_fee_eth(gas_used, base_fee_gwei, priority_fee_gwei, max_fee_gwei):
    """Fee actually paid, in ETH. None when the signed ceiling cannot cover the base fee."""
    if max_fee_gwei < base_fee_gwei:
        return None  # never includable at this base fee
    effective = min(max_fee_gwei, base_fee_gwei + priority_fee_gwei)
    return gas_used * effective * GWEI


def breakeven_notional_eth(gas_used, effective_gwei, edge_bps):
    """Smallest ETH notional whose gross edge covers one successful attempt."""
    fee_eth = gas_used * effective_gwei * GWEI
    return fee_eth / (edge_bps / 10_000)


# A 5 bps gross edge against a 0.00264 ETH fee needs ~5.28 ETH of notional to break even.
breakeven_notional_eth(120_000, 22, 5)
```

> info **Measure your own gas** Gas per call path varies with the contract, the route taken, and whether the storage slots touched are cold or warm. Profile the exact path your strategy uses rather than reusing a published figure.

---

#### See Also

* [Solana / SVM](/blockchain-execution-environments/solana-svm)
* [Comparing Execution Environments](/blockchain-execution-environments/comparative-benchmarks)
* [Quant Engineering Across Environments](/blockchain-execution-environments/quant-engineering)
* [Gas & Mempool](/microstructure/gas-mempool)
* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [ERC-20](/building-blocks/erc20)

---

### Event Logs and Decoding

> info **Metadata** Level: Intermediate | Prerequisites: What On-Chain Means, Tokens and Addresses | Tags: on-chain, event-logs, abi, decoding, indexing, reorgs

A blockchain stores state, but it does not store a readable history of how that state changed. The current balance of an account is a number in a database; the sequence of transfers that produced it is not. **Event logs** are the mechanism contracts use to fill that gap: a contract explicitly emits a record when something happens, the record is written into the transaction receipt, and a commitment to it is sealed under the block header. Almost every on-chain dataset a quantitative researcher works with — swap prices, liquidity positions, borrows, liquidations, token flows — is reconstructed from logs.

The property that matters is that logs are *voluntary annotations*, not state. A contract can change its storage without emitting anything, and a contract can emit an event that corresponds to no state change at all. Logs are cheap to write and cheap for a node to filter, which is why protocols use them and why treating them as ground truth requires care. This page covers how a log is encoded, how to decode one correctly, how to fold a log stream into positions and balances, and what happens when the chain reorganises underneath you.

---

#### Anatomy of a Log Record

A log has two payload fields and a set of positional identifiers.

<table>
  <tbody>
    <tr><td><strong>Field</strong></td><td><strong>Contents</strong></td></tr>
    <tr><td>address</td><td>The contract that emitted the log. Filterable, and the primary way a query is scoped.</td></tr>
    <tr><td>topics</td><td>An ordered array of up to four 32-byte words, each independently filterable by the node.</td></tr>
    <tr><td>data</td><td>One opaque byte string holding the ABI encoding of everything not placed in topics.</td></tr>
    <tr><td>blockNumber, blockHash</td><td>Which block contained it, and the hash pinning that block's contents.</td></tr>
    <tr><td>transactionHash, transactionIndex</td><td>Which transaction produced it, and that transaction's position in the block.</td></tr>
    <tr><td>logIndex</td><td>The log's position. On Ethereum this counts across the whole block, not within the transaction.</td></tr>
    <tr><td>removed</td><td>A provider-level flag meaning this log sat in a block that is no longer canonical.</td></tr>
  </tbody>
</table>

For a normal (non-anonymous) event, `topics[0]` is the **event signature hash**: the Keccak-256 hash of the canonical signature string, built from the event name and its parameter types with no spaces and no parameter names. The remaining topics carry the parameters the contract author marked as indexed, at most three of them. Everything else is ABI-encoded and concatenated into `data`.

That split is a deliberate trade made once, at deployment, which you then inherit. An indexed parameter can be filtered server-side by the node, so you can ask for every transfer whose recipient is a given address without downloading the rest. A non-indexed parameter cannot be filtered but is cheaper to emit.

> warning **Indexed dynamic types are hashed, not stored** If a string, bytes, or array parameter is marked indexed, the topic holds the Keccak-256 hash of the value rather than the value. You can match against it when you already know what you are looking for, but you cannot recover the original from the log.

---

#### Worked Example: Decoding a Transfer

The ERC-20 transfer event is declared like this.

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

Its canonical signature string drops the parameter names and the indexed keyword, leaving `Transfer(address,address,uint256)`. Hashing that string produces the topic every ERC-20 transfer on every chain shares:

```text
topics[0] = keccak256("Transfer(address,address,uint256)")
          = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

Decoding then proceeds mechanically:

1. **Match the signature.** Compare `topics[0]` against the hash above. If it matches, the layout below applies.
2. **Read the indexed parameters.** `topics[1]` is the sender and `topics[2]` the recipient. Each is a 32-byte word holding a 20-byte address right-aligned, so the address is the low 20 bytes; the twelve leading zero bytes are padding and must be discarded rather than carried through.
3. **Read the non-indexed parameters.** Here `data` is exactly 32 bytes, a big-endian unsigned integer holding the value transferred.
4. **Apply decimals.** That value is an integer in the token's smallest unit. Converting it to a human quantity requires dividing by ten raised to the token's decimals, which is a separate lookup against the token contract — and getting it wrong is the most common on-chain data error there is.
5. **Attach the ordering key.** Record the triple of block number, transaction index and log index so the event can be placed in a total order later.

The signature hash is a hash of *types*, not of meaning. Any contract may emit a log carrying this topic, whether or not it is a token and whether or not a transfer occurred. Scoping by the emitting address is therefore not optional.

> info **Overloads collide in name only** Two events sharing a name but differing in parameter types hash to different topics, so they never conflict. Two unrelated protocols using an identically-typed event do collide, which is the reason every sound query filters on address as well as topic.

---

#### Reconstructing State from a Log Stream

Once logs are decoded and ordered, most on-chain analysis is a **fold**: an initial state, plus a function applying one event, applied in sequence.

Token balances are the simplest case. Start every address at zero, then for each transfer subtract the value from the sender and add it to the recipient. Mints appear as transfers out of the zero address and burns as transfers into it, so total supply is the running net flow out of the zero address. In an illustrative stream of five transfers — 1,000 minted to A, then A sends 250 to B, B sends 100 to C, A sends 50 to C, and C burns 30 — the fold yields A at 700, B at 150 and C at 120. Those sum to 970, matching the 1,000 minted less the 30 burned.

The same shape covers richer objects:

- **A constant-product pool's reserves.** Fold mint, burn and swap events, or read the pool's reserve-synchronisation event where one exists. The latter is safer because it reports absolute state rather than a delta, so one missed event does not corrupt everything downstream.
- **A concentrated-liquidity position.** Fold position-changing events keyed by owner and tick range, then track range crossings separately from liquidity changes. See [Concentrated Liquidity](/protocols/concentrated-liquidity).
- **A lending account.** Fold deposit, withdraw, borrow and repay events into principal, then apply the protocol's interest index to convert principal into current debt. Interest accrues continuously without emitting anything, so a pure event fold understates the debt.

That last point generalises. **Deltas compound errors; absolute snapshots do not.** Where a protocol emits both, prefer the snapshot and use the deltas as a check. Where it emits only deltas, reconcile periodically against a direct state read at a known block, as described in [RPC Nodes](/data-tooling/rpc-nodes).

---

#### Reorgs and the Finality Problem

A block a node considered canonical can be replaced. When that happens every log in the orphaned block leaves history, and any state folded from those logs is wrong.

Three defences, in increasing order of rigour:

- **Confirmation depth.** Process only logs from blocks some fixed distance behind the head. Simple, and it trades latency directly for safety. The right depth depends entirely on the chain's finality model: some chains offer explicit finality after which reversion requires a consensus failure, others offer only probabilistic settlement.
- **Block-hash pinning.** Store the block hash alongside every processed log and maintain the parent-hash chain. Before extending, verify the new block's parent hash matches the hash you stored. A mismatch localises the fork point exactly rather than leaving you to guess.
- **Idempotent, revertible writes.** Key every derived row on the block, transaction and log index triple, and make writes upserts. Rolling back is then a delete of every row at or above the fork height followed by a replay. A fold that mutates a running total in place cannot be rolled back at all.

> warning **The removed flag is not a delivery guarantee** Streaming providers emit logs with removed set when a block leaves the canonical chain, but delivery is best-effort and can be missed across a disconnect. Reconciling block hashes on reconnect is the only reliable recovery.

---

#### Assumptions and Failure Modes

- **Assumes logs describe state.** They do not. A contract can move value without emitting, and transfers of the native currency between contracts emit nothing at all — those appear only in execution traces, which most providers meter separately.
- **Assumes token contracts are compliant.** Some tokens deduct a fee on transfer, so the amount received is smaller than the value in the log. Rebasing tokens change balances with no transfer event whatsoever, so a balance fold silently diverges from reality.
- **Assumes a stable ABI.** Behind an upgradeable proxy the emitting address is constant while the implementation changes. An event's meaning, or its existence, can change partway through the history you are decoding.
- **Assumes failed attempts leave a trace.** They do not. A reverted transaction discards its logs entirely, so a log-derived dataset records successes only. Analysis of attempt rates, failed liquidations or losing bids needs transaction and trace data instead.
- **Assumes the ordering key is portable.** The log index counts per block on Ethereum, while other chains and some providers expose a per-transaction index. Always include the transaction index in the key rather than relying on the convention.
- **Assumes complete retrieval.** A filtered query that hits a provider's result cap can return a truncated set without raising an error. Silent truncation produces a fold that is plausible and wrong.
- **Assumes decimals are known and constant.** They are read from the token contract, some tokens do not implement the call, and a small number of non-standard tokens have changed the value.

---

#### Code

```python
from dataclasses import dataclass

TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"


@dataclass(frozen=True)
class TransferEvent:
    block_number: int
    tx_index: int
    log_index: int
    token: str
    sender: str
    recipient: str
    raw_value: int


def decode_transfer(log) -> TransferEvent | None:
    """Decode one ERC-20 Transfer log, or None if it is not one.

    Topic words are 32 bytes with the 20-byte address right-aligned, so the
    address is the last 40 hex characters -- never the first.
    """
    if not log["topics"] or log["topics"][0].lower() != TRANSFER_TOPIC:
        return None
    return TransferEvent(
        block_number=log["blockNumber"],
        tx_index=log["transactionIndex"],
        log_index=log["logIndex"],
        token=log["address"].lower(),
        sender="0x" + log["topics"][1][-40:],
        recipient="0x" + log["topics"][2][-40:],
        raw_value=int(log["data"][:66], 16),
    )


def fold_balances(events: list[TransferEvent]) -> dict[str, int]:
    """Running balances in the token's smallest unit.

    Sort explicitly: providers do not promise ordered results, and this fold
    survives disorder only because addition commutes -- which stops being true
    the moment a rule depends on the balance at the time of the event.
    """
    ordered = sorted(events, key=lambda e: (e.block_number, e.tx_index, e.log_index))
    balances: dict[str, int] = {}
    for event in ordered:
        balances[event.sender] = balances.get(event.sender, 0) - event.raw_value
        balances[event.recipient] = balances.get(event.recipient, 0) + event.raw_value
    return balances
```

---

#### See Also

* [RPC Nodes](/data-tooling/rpc-nodes)
* [The Graph](/data-tooling/the-graph)
* [Dune Analytics](/data-tooling/dune-analytics)
* [Market Data Sources](/data-tooling/data-sources)
* [Connecting Simulations to Real On-Chain Data](/simulation/onchain-data)
* [What On-Chain Means](/start-here/on-chain-meaning)

---

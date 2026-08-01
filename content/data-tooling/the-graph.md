### The Graph

> info **Metadata** Level: Intermediate | Prerequisites: Event Logs and Decoding, RPC Nodes | Tags: on-chain, indexing, subgraph, graphql, data-modelling, latency

Raw logs answer the question "what happened". Most research questions are shaped differently: what is the current state of every position, which pools did this address touch, what was the total volume by day. Answering those from a log stream means replaying the whole history every time you ask. **The Graph** is an indexing layer that performs the replay once, materialises the result into queryable entities, and keeps them current as new blocks arrive.

The unit of work is a **subgraph**: a declaration of which contracts and events to watch, a schema of the entities to produce, and handler code mapping one to the other. An indexer runs the handlers over history in order, writes entities to a database, and serves them over GraphQL. Understood correctly, a subgraph is a *persisted fold* over the event stream described in [Event Logs and Decoding](/data-tooling/event-logs) — the same computation, stored rather than recomputed.

---

#### The Three Pieces

<table>
  <tbody>
    <tr><td><strong>Piece</strong></td><td><strong>Declares</strong></td><td><strong>Decision it forces</strong></td></tr>
    <tr><td>Manifest</td><td>Contract addresses, ABIs, event-to-handler bindings, and a start block</td><td>What history exists at all. Nothing before the start block is ever indexed.</td></tr>
    <tr><td>Schema</td><td>Entity types, their fields, and the relationships between them</td><td>What can be queried. Anything not modelled is unreachable, however cheaply derivable.</td></tr>
    <tr><td>Mappings</td><td>Handler functions transforming one event into entity writes</td><td>What the data means. Every aggregation must be computed here, not at query time.</td></tr>
  </tbody>
</table>

The start block is the first design decision with permanent consequences. Set it at the factory deployment and indexing covers everything; set it later to save time and the earliest history is simply absent, with no error to tell you so.

The schema shapes everything downstream. A minimal design for a swap venue looks like this, where an immutable event record sits alongside mutable running aggregates:

```graphql
type Pool @entity {
  id: ID!               # the pool address
  token0: Token!
  token1: Token!
  feeTier: Int!
  reserve0: BigDecimal!
  reserve1: BigDecimal!
  cumulativeVolumeUSD: BigDecimal!
  swaps: [Swap!]! @derivedFrom(field: "pool")
}

type Swap @entity(immutable: true) {
  id: ID!               # transaction hash concatenated with log index
  pool: Pool!
  blockNumber: BigInt!
  timestamp: BigInt!
  amount0: BigDecimal!
  amount1: BigDecimal!
}
```

Two conventions in that snippet carry weight. Entity identifiers must be deterministic and collision-free, so event-like entities are keyed on the transaction hash joined to the log index — the same ordering key that makes a log stream replayable. And marking a historical record immutable tells the indexer it will never be updated, which materially reduces storage and speeds indexing; running aggregates cannot use it.

---

#### Mappings Are a Fold, Written Imperatively

A handler receives one decoded event and updates entities. It runs in strict block order, so it may depend on the state its earlier invocations left behind — that is exactly what makes running totals possible.

```typescript
export function handleSwap(event: Swap): void {
  const pool = Pool.load(event.address.toHexString())!;

  // Entity id ties this record to a unique position in the chain's total order.
  const swap = new SwapEntity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  swap.pool = pool.id;
  swap.blockNumber = event.block.number;
  swap.timestamp = event.block.timestamp;
  swap.amount0 = toDecimal(event.params.amount0, pool.decimals0);
  swap.amount1 = toDecimal(event.params.amount1, pool.decimals1);
  swap.save();

  // Aggregates must be maintained here: GraphQL cannot sum at query time.
  pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(valueUSD(swap));
  pool.save();
}
```

Handlers must be **deterministic**. Given the same chain, every indexer must produce byte-identical entities, which rules out wall-clock time, randomness and network access. Calling back into a contract from a handler is permitted but expensive: it forces a state read at that block, needs archive access, and is frequently the single largest contributor to indexing time. Where the event already carries the value, use the event.

> warning **A handler that throws stops the subgraph** Indexing is sequential and a failed handler halts progress at that block. The subgraph then serves increasingly stale data while appearing to work, so a null check omitted for an edge case a year into the history is a latent outage.

---

#### When an Index Beats Scanning, and When It Does Not

<table>
  <tbody>
    <tr><td><strong>Favours a subgraph</strong></td><td><strong>Favours a direct log scan</strong></td></tr>
    <tr><td>The same question is asked repeatedly, or by many consumers</td><td>A one-off analysis you will run once and discard</td></tr>
    <tr><td>You need current entity state, not the event history</td><td>You need raw fields nobody modelled</td></tr>
    <tr><td>Queries traverse relationships between entities</td><td>The aggregation dimension is not known in advance</td></tr>
    <tr><td>An application front end depends on it</td><td>You need results within one block of the head</td></tr>
    <tr><td>The protocol already publishes a maintained subgraph</td><td>The question spans protocols with no shared schema</td></tr>
  </tbody>
</table>

The economic argument is straightforward. Indexing pays a large fixed cost once and makes every subsequent query cheap; scanning pays a moderate cost per query and nothing up front. The crossover is at a handful of repetitions for any substantial history.

The argument that catches people out is the **reindexing cost**. Because entities are produced by handlers, changing a handler or adding a schema field does not update existing rows — it invalidates them. The subgraph must replay from its start block, and that replay takes as long as the original. A schema that omits a field you later need is therefore not a small mistake; it is a full re-run. Grafting an updated subgraph onto an existing one's data can avoid replaying from genesis, but only for changes that leave prior entities valid.

**Latency** has two components worth separating. Indexing lag is the distance between the chain head and the last block the indexer has processed, which grows whenever handlers are slower than block production. Reorg handling adds a second: indexers roll back and reprocess when a block is replaced, so entities near the head are provisional in exactly the way described in [Event Logs and Decoding](/data-tooling/event-logs).

---

#### Worked Example: What a Schema Change Costs

Reindexing cost is the number most often discovered too late, and it is simple arithmetic. Take an illustrative subgraph covering 5,000,000 blocks of history, where the indexer processes 400 blocks per second on event handling alone:

1. **Initial sync**: `5,000,000 / 400 = 12,500` seconds, roughly 3.5 hours.
2. **Add one field to an entity**: existing rows were written by the old handler and cannot be patched, so the same 3.5 hours is paid again.
3. **Add a contract call inside a handler**, dropping throughput to 40 blocks per second: `5,000,000 / 40 = 125,000` seconds, or roughly 35 hours — ten times the original.

Step three is the one that surprises people. A single call back into a contract per event turns a coffee break into a day and a half, because each call forces an archive state read at that block. The throughput figures above are illustrative; the order-of-magnitude gap between pure event handling and call-augmented handling is the durable point.

The design consequence is direct. **Model generously at the start.** A field you might need costs a little storage now and a full re-sync later, so the asymmetry argues for over-modelling the schema and under-using contract calls.

---

#### Limitations Worth Knowing Before You Commit

- **No cross-subgraph joins.** Each subgraph is an isolated database. Combining two protocols means querying both and joining in your own code, with no consistency guarantee that the two were at the same block.
- **Aggregation must be precomputed.** GraphQL here is a retrieval language, not an analytical one. There is no arbitrary grouping or summation at query time, so every statistic you might want has to have been anticipated and written into an entity — usually as explicit hourly or daily bucket entities.
- **Pagination is bounded.** Result sets are capped per request, and deep offsets degrade. Large extractions must page by a monotonically increasing key rather than a numeric offset.
- **Historical queries need archived block state.** Querying an entity as of a past block is supported, but only where the indexer retained the history; pruned deployments answer recent blocks only.
- **The schema is an opinion.** A maintained subgraph encodes its author's view of what a swap, a position or a fee is. Two subgraphs over the same protocol can report different volume in good faith. This is the same class of problem as vendor conventions in traditional [Market Data Sources](/data-tooling/data-sources).
- **Availability is an external dependency.** A hosted subgraph you did not deploy can be deprecated, fall behind, or change its schema. For anything load-bearing, deploy your own or hold a fallback path to raw logs.
- **One subgraph covers one chain.** A protocol deployed across several chains needs a deployment per chain, and the deployments drift: different start blocks, different schema versions, and no shared identifiers. Cross-chain aggregates must be assembled by the consumer.

---

#### Assumptions and Failure Modes

- **Assumes handler coverage is complete.** An event not bound in the manifest is silently ignored. Adding a factory-deployed contract that the template did not anticipate produces a data gap with no error.
- **Assumes decimals and prices are correct at write time.** Both are baked into the stored entity. A pricing bug is not a query bug you can patch; it is a reindex.
- **Assumes indexing keeps up.** A subgraph that has fallen behind returns confidently wrong current state. Always read the indexing status alongside the data and treat lag as a first-class field.
- **Assumes determinism holds.** Contract calls inside handlers can behave differently across client versions or archive availability, which is precisely the non-determinism the model forbids.
- **Assumes entity identifiers never collide.** An identifier built from an address alone collides across chains; one built from a block number alone collides within a block. Collisions overwrite rather than duplicate, so they destroy data quietly.
- **Assumes the start block is early enough.** It very often is not, and the omission is invisible: queries return successfully with a shorter history than the reader assumes.

---

#### See Also

* [Event Logs and Decoding](/data-tooling/event-logs)
* [RPC Nodes](/data-tooling/rpc-nodes)
* [Dune Analytics](/data-tooling/dune-analytics)
* [Building a Data Pipeline](/data-tooling/pipeline)
* [Reproducible Experiments](/data-tooling/reproducible)
* [Market Data Sources](/data-tooling/data-sources)

---

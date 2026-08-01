### RPC Nodes

> info **Metadata** Level: Intermediate | Prerequisites: Event Logs and Decoding, What On-Chain Means | Tags: on-chain, rpc, archive-node, infrastructure, reconciliation, data-quality

An **RPC node** is a running copy of a blockchain client that answers questions over a remote procedure call interface. It is the only door between a research process and the chain: every balance, every log, every historical pool reserve arrives through one. Unlike a market data vendor, a node does not curate or restate anything — it either has the answer or it does not, and which questions it can answer is determined entirely by how much history it kept.

That last point is where most on-chain data projects go wrong. Practitioners discover halfway through a backtest that the pool reserves at a block two years ago are unavailable from their provider, or that a log scan quietly returned a truncated result, or that two providers disagree about the same block. None of these are exotic failures. They are the ordinary consequence of a distributed system whose storage economics push operators to discard exactly the data researchers need.

---

#### What Each Node Type Can Answer

A client separates two things: the **chain data** (blocks, transactions, receipts, logs) and the **state** (account balances, contract storage) that results from executing it. Chain data is compact and usually retained. Historical state is enormous and usually discarded.

<table>
  <tbody>
    <tr><td><strong>Node type</strong></td><td><strong>Keeps</strong></td><td><strong>Answers</strong></td></tr>
    <tr><td>Light</td><td>Headers only; fetches proofs on demand</td><td>Header queries and proof-verified reads. Not a research tool.</td></tr>
    <tr><td>Full (pruned)</td><td>All blocks and receipts; state for a recent window only</td><td>Any log query over full history, and any state read near the head.</td></tr>
    <tr><td>Archive</td><td>All blocks, receipts, and state at every historical block</td><td>Everything above, plus reads and contract calls executed at any past block.</td></tr>
    <tr><td>Archive with tracing</td><td>As archive, plus the ability to re-execute and instrument</td><td>Internal calls, native-currency transfers between contracts, per-step execution.</td></tr>
  </tbody>
</table>

The practical dividing line is whether a query needs *state at a past block*. Fetching logs is a chain-data query and works against a pruned full node. Asking what a pool's reserves were 400,000 blocks ago is a historical state read and needs an archive node. So does calling a view function at a past block, which is how most researchers actually retrieve historical protocol state.

This matters because the two have very different costs. Log retrieval is comparatively cheap and widely available; archive access is expensive, and archive-plus-tracing more so again. A study design that can be answered from logs alone is dramatically cheaper to run than one requiring a state read per block, and that is worth knowing *before* the pipeline is written rather than after.

> info **Prefer logs to state reads where the protocol allows it** Many protocols emit an event carrying the same figure a state read would return. Reconstructing from events turns a per-block archive query into a single range scan, often a difference of several orders of magnitude in cost and time.

---

#### Pagination, Caps, and a Retrieval Budget

Providers bound the work a single request may cause. The three limits that shape a pipeline are a cap on the block range of a log query, a cap on the number of results returned, and a rate limit on requests per second, often expressed as an abstract compute budget rather than a raw count.

The block-range cap forces pagination. Consider an illustrative backfill scanning 5,000,000 blocks against a provider allowing 2,000 blocks per request:

1. **Request count**: `5,000,000 / 2,000 = 2,500` requests.
2. **At 5 requests per second**: `2,500 / 5 = 500` seconds, roughly 8 minutes.
3. **At 25 requests per second**: `2,500 / 25 = 100` seconds.

That is tolerable for one contract. It is not tolerable once you multiply by hundreds of contracts and rerun the job whenever the decoder changes, which is the real reason backfills are checkpointed and cached rather than recomputed.

The **result cap** is the more dangerous of the two, because a range that satisfies the block limit can still exceed the result limit. Some providers signal this with an error; others truncate. The robust pattern is recursive bisection: attempt a range, and on a cap error split it in half and retry each side. Log density varies by orders of magnitude across a chain's history, so a fixed range size is either wastefully small in quiet periods or repeatedly failing in busy ones.

**Batching** cuts round trips in two distinct ways. A JSON-RPC batch sends several independent requests in one HTTP call, saving network overhead but not node work. An aggregating contract call is different and better: a single call executes many view functions inside one execution context, so every result is read from the *same* state root. That atomicity is the real benefit, and it is not something batching provides.

---

#### When Providers Disagree

Two nodes queried at the same moment can legitimately return different answers, and distinguishing legitimate disagreement from corruption is a standing operational problem.

- **Different heads.** Nodes propagate at different speeds. One is two blocks ahead of the other, so a query at the chain tip returns different results from each. This is normal.
- **Load-balanced backends.** A single provider endpoint typically fronts many nodes at slightly different heights. Two sequential requests to the same URL can be served by different backends, so a read at the tip followed by a dependent read at the tip is not a consistent snapshot.
- **Reorgs.** One node has already reorganised and the other has not. Both are internally consistent; only one will survive.
- **Genuine defects.** Divergent client versions, a corrupted database, an incomplete re-sync, or a bug in a provider's caching layer. These are the cases worth escalating, and they are indistinguishable from the benign cases unless you pin the block.

The fix for the first three is the same and is almost free: **never query at the tip when you need consistency**. Resolve the head once, subtract a confirmation buffer, and pin every subsequent request to that explicit block number. Reads pinned to the same block should agree; where they do not, you have found a real problem.

For reconciliation proper, quorum reads across independent providers and comparison of block hashes at fixed heights are the two workhorse checks. A block hash commits to the block's entire contents, so agreement on hashes at a series of heights is strong evidence the underlying chain data agrees. This is the on-chain version of the two-source rule in [Market Data Sources](/data-tooling/data-sources).

> warning **Latest is not a point in time** A sequence of requests against "latest" is a sequence of reads against different, drifting states. Any derived quantity computed that way — a ratio, a total, a health factor — can describe a state that never existed on chain.

---

#### Running Your Own Versus Using a Provider

There is no general answer, only a set of dimensions on which the two differ.

<table>
  <tbody>
    <tr><td><strong>Dimension</strong></td><td><strong>Self-hosted</strong></td><td><strong>Provider</strong></td></tr>
    <tr><td>Fixed cost</td><td>Hardware and storage, paid whether used or not</td><td>Usage-metered, near zero when idle</td></tr>
    <tr><td>Marginal cost of a heavy scan</td><td>Effectively zero</td><td>The dominant cost; scales with the work</td></tr>
    <tr><td>Setup time</td><td>Days to weeks, mostly initial sync</td><td>Minutes</td></tr>
    <tr><td>Operational burden</td><td>Sync failures, client upgrades, disk growth, monitoring</td><td>Borne by the provider</td></tr>
    <tr><td>Latency</td><td>Local, and controllable</td><td>Network round trip plus queueing</td></tr>
    <tr><td>Query privacy</td><td>Nothing leaves the machine</td><td>The provider observes every address you look at</td></tr>
    <tr><td>Failure mode</td><td>You are down and you fix it</td><td>You are down and you wait</td></tr>
  </tbody>
</table>

Two of these deserve emphasis. **Query privacy** is routinely overlooked: the sequence of contracts and addresses a research process queries is a fairly direct description of what it is researching, and for a live strategy it can be a description of the position. **Marginal cost** is what usually decides the question in practice, because research is bursty — a self-hosted node is expensive when idle and free during the week-long backfill that would dominate a metered bill.

The common resolution is hybrid: a provider for live reads and small queries, and a self-hosted archive node or a bulk dataset for backfills. The reconciliation discipline above then does double duty, since it also detects drift between the two sources.

---

#### Assumptions and Failure Modes

- **Assumes the provider returns everything matching.** Result caps can truncate silently. Always compare the returned count against the cap and bisect when they are equal — that equality is the only signal you will get.
- **Assumes the node has the state.** A pruned node answers a historical state query with an error at best and, if it is fronting a mixed pool, an inconsistent answer at worst.
- **Assumes requests are independent.** They are not when they span a reorg. A paginated backfill can straddle a reorganisation and stitch together logs from two incompatible chains.
- **Assumes rate limits fail loudly.** Some tiers degrade instead: slower responses, shallower history, or cached results served past their usefulness. A pipeline that only handles explicit errors will not notice.
- **Assumes timestamps are trustworthy.** A block timestamp is declared by the proposer within a tolerance, not measured. It is adequate for daily aggregation and inadequate for sub-minute alignment against an off-chain series.
- **Assumes one chain behaves like another.** Block times, finality guarantees, log index conventions and available methods all differ. Code written against one chain is a hypothesis about the next.
- **Assumes reads are free of survivorship effects.** They largely are, which is a genuine strength — but only for what was written on chain. Transactions that never landed, and orders that were never sent, are invisible from any node.

---

#### Code

```python
def fetch_logs_bisecting(client, address, topic0, start_block, end_block, cap=10_000):
    """Fetch logs over a range, halving on cap errors or suspiciously full pages.

    Log density varies by orders of magnitude across a chain's history, so a
    fixed page size is either wasteful or perpetually failing. A page that is
    exactly full is treated as truncated -- that equality is the only warning
    a truncating provider gives.
    """
    try:
        logs = client.get_logs(address=address, topics=[topic0],
                               from_block=start_block, to_block=end_block)
        if len(logs) < cap:
            return logs
    except RangeTooLargeError:
        pass

    if start_block == end_block:
        raise RuntimeError(f"single block {start_block} exceeds the provider cap")

    midpoint = (start_block + end_block) // 2
    left = fetch_logs_bisecting(client, address, topic0, start_block, midpoint, cap)
    right = fetch_logs_bisecting(client, address, topic0, midpoint + 1, end_block, cap)
    return left + right


def pinned_head(client, confirmations=12):
    """Resolve the head once, then pin every downstream read to this number.

    Reading at 'latest' repeatedly is reading against a moving target, and
    behind a load balancer it can move backwards.
    """
    return client.block_number() - confirmations
```

---

#### See Also

* [Event Logs and Decoding](/data-tooling/event-logs)
* [The Graph](/data-tooling/the-graph)
* [Market Data Sources](/data-tooling/data-sources)
* [Building a Data Pipeline](/data-tooling/pipeline)
* [Reproducible Experiments](/data-tooling/reproducible)
* [Connecting Simulations to Real On-Chain Data](/simulation/onchain-data)

---

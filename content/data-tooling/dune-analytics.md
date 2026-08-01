### Dune Analytics

> info **Metadata** Level: Beginner | Prerequisites: Event Logs and Decoding, SQL basics | Tags: on-chain, sql, decoded-data, analytics, dashboards, data-quality

Dune is a SQL interface over blockchain data. Someone else has already run the nodes, extracted the blocks, decoded the logs against submitted ABIs, and loaded the results into a warehouse. What remains for the analyst is a query. That shift — from writing a decoder to writing a `GROUP BY` — is why it became the default tool for exploratory on-chain work and for the public dashboards that most people's mental model of the space is built from.

The convenience carries an obligation. Every table is the output of a pipeline that made decisions: which contracts to decode, how to price assets, what counts as a trade. Those decisions are usually sensible and always invisible from inside a query. This page covers how the layers relate, the query patterns that recur, and — the part that matters for research quality — the specific places where the abstraction stops holding.

---

#### The Three Layers

<table>
  <tbody>
    <tr><td><strong>Layer</strong></td><td><strong>Contents</strong></td><td><strong>What it costs you</strong></td></tr>
    <tr><td>Raw</td><td>Blocks, transactions, logs, and traces, essentially as a node reports them</td><td>You decode by hand. Topics and calldata arrive as hex.</td></tr>
    <tr><td>Decoded</td><td>One table per contract event or function, with typed columns</td><td>Exists only where an ABI was submitted. Absence is silent.</td></tr>
    <tr><td>Curated</td><td>Cross-protocol models: unified trades, transfers, prices, labels</td><td>Someone's definition of the concept, applied uniformly whether or not it fits.</td></tr>
  </tbody>
</table>

A decoded event table is, conceptually, a view over the raw logs table: filtered to one contract address and one signature hash, with the topics and data field parsed into named columns. Nothing is added that was not already in the log; the value is entirely in the parsing and the typing.

That equivalence is the most useful mental model on this page, because it tells you exactly what decoded data cannot contain. If a protocol never emitted an event, no decoded table will ever show the activity. If a value was in an unindexed field the decoder mishandled, the raw log still holds the truth. When a decoded result looks wrong, dropping to the raw layer and re-deriving the same figure from topics and data is the check that settles it.

Curated tables sit a level above and are a genuine modelling exercise. A unified trades model has to decide whether an aggregator's internal hops are one trade or several, whether a liquidity migration is a trade at all, and which side of a pair is the "amount". Reasonable people choose differently, and two dashboards can report different volume for the same day without either being wrong.

> info **Decoded tables follow a naming convention, not a guarantee** Event tables are conventionally named after the project, the chain, the contract and the event. The convention tells you how to look; it does not tell you the table exists, and a contract whose ABI nobody submitted simply has none.

---

#### Query Patterns That Recur

Almost all on-chain SQL is one of a handful of shapes.

**Attach wall-clock time.** Chain data is ordered by block. Every time-series question requires joining to the block timestamp, and every daily aggregation requires choosing a timezone convention and stating it. See [Cleaning and Resampling Market Data](/data-tooling/cleaning).

**Aggregate by period, then by dimension.** Daily volume by pool, weekly unique addresses by protocol. The trap is that a count of distinct addresses is a count of *addresses*, not participants — see [Wallet Analytics](/data-tooling/wallet-analytics).

**Running totals with window functions.** Cumulative net flow, running balance, position size over time. The ordering clause must be the chain's total order — block number, then transaction index, then log index — and not the timestamp, because many events share a timestamp and ties break arbitrarily.

**Self-joins to pair opening with closing events.** Matching a deposit to its withdrawal, a borrow to its repayment, a liquidity mint to its burn. These need a join key the protocol actually provides, such as a position identifier; matching on amount and address is a heuristic that fails for anyone active enough to matter.

**Joining to a price series.** Converting token amounts to a common numeraire needs a price table keyed on token and time. This join is the single largest source of quiet error in on-chain analytics, for reasons in the next section.

```sql
-- Illustrative shape. Table and column names follow the usual convention
-- but should be checked against the actual schema before use.
select
    date_trunc('day', evt_block_time)              as day,
    contract_address                                as pool,
    sum(abs(amount0) / power(10, t.decimals))       as volume_token0
from myproject_ethereum.Pool_evt_Swap  s
join tokens.erc20 t
  on t.contract_address = s.token0
 and t.blockchain = 'ethereum'
where evt_block_time >= now() - interval '90' day
group by 1, 2
order by 1
```

Note the decimal division. It is not cosmetic: token amounts are stored as integers in the smallest unit, and the scale factor differs per token.

A running position is the same fold described in [Event Logs and Decoding](/data-tooling/event-logs), expressed as a window function. The ordering clause is the part that matters:

```sql
-- Running balance for one address. Order by the chain's total order,
-- not by timestamp: many events share a timestamp and ties break arbitrarily.
select
    evt_block_number,
    evt_index,
    sum(case when "to" = :addr then value else -value end)
        over (order by evt_block_number, evt_index
              rows between unbounded preceding and current row) as running_raw
from erc20_ethereum.evt_Transfer
where contract_address = :token
  and (:addr in ("to", "from"))
```

---

#### Reconciling Decoded Against Raw

Because a decoded table is a parse of the raw logs, any decoded figure can be re-derived from the raw layer, and doing so is the check that resolves a disputed number. The recipe is short:

1. **Compute the signature hash** of the event from its canonical type string. This is the value the raw log carries in its first topic.
2. **Filter the raw logs table** on the contract address and that topic, over the same block range.
3. **Compare row counts first.** A mismatch here means the decoder's coverage differs from your assumption — usually a decoder registered later than the contract was deployed, or a factory pattern that was only partly registered.
4. **Compare a summed quantity second.** If counts agree and sums do not, the difference is in parsing or in the decimal handling, not in coverage.

This separates the two failure classes cleanly, and it is worth doing once for any figure a decision rests on. It is the on-chain form of the two-source rule in [Market Data Sources](/data-tooling/data-sources), with the advantage that both sources are derived from the same immutable record, so a genuine disagreement always indicates a pipeline defect rather than a difference of opinion.

---

#### Worked Example: The Decimals Error

An amount column holds the integer `1,500,000,000`. What it represents depends entirely on the token's decimals, which is not in the events table.

1. **At 6 decimals**: `1,500,000,000 / 10^6 = 1,500.00` units.
2. **At 18 decimals**: `1,500,000,000 / 10^18 = 0.0000000015` units.
3. **Ratio between the two readings**: `10^12`, or one trillion.

A query that hard-codes eighteen decimals because most tokens use eighteen will understate a six-decimal token by a factor of a trillion. In a summed total this is invisible — the affected token simply vanishes into rounding. In a maximum or a ranking it is equally invisible in the other direction, because the mis-scaled row never reaches the top.

The general lesson: **an aggregate that mixes tokens without joining decimals per token is meaningless**, and the failure is silent because the result is still a number. Sanity-checking against an independently known figure is the only reliable detection.

---

#### Where the Abstraction Leaks

- **Undecoded contracts are invisible.** No submitted ABI means no decoded table. A protocol can be active for months with no decoded presence, and a query measuring "all activity" quietly measures activity that someone bothered to decode.
- **Proxies split identity.** With an upgradeable proxy, calls go to the proxy address while the ABI belongs to the implementation. Whether a decoded table keys on the proxy or the implementation determines whether a query finds anything, and the choice is not visible from the table name.
- **Factory-deployed contracts need pattern-level decoding.** A venue with thousands of pools requires the decoder to be registered for the factory pattern rather than per address. Where that was not done, coverage is partial, and partial coverage looks exactly like low activity.
- **Price tables have coverage gaps.** Assets without a mapped feed are absent, so joining to prices silently drops rows. A left join preserves them as nulls, which at least makes the gap countable; an inner join makes it disappear.
- **Internal value transfers live in traces.** Native-currency movement between contracts emits no log. Any flow analysis using only the logs layer omits it entirely.
- **Aggregator hops inflate counts.** A single user trade routed through several pools emits several swap events. Counting events rather than user-level trades overstates activity, and the correction requires knowing which router mediated it.
- **Reverted transactions are excluded.** Consistent with the chain's own view, but it means competitive dynamics — failed liquidation attempts, losing arbitrage bids — cannot be measured from decoded events at all.
- **Curated models change.** A cross-protocol model is maintained code. A definition refinement can move a historical series that a dashboard has been reporting for a year, which is the on-chain equivalent of a vendor restatement.
- **Chains differ.** Column names, availability and semantics are not uniform across chains. A query ported by search-and-replace usually runs and often means something different.

> warning **A query that returns rows is not a query that is correct** The most common on-chain analytics error is a join that silently drops most of the data. Compare row counts before and after every join, and treat a large unexplained drop as a defect rather than a filter.

---

#### Assumptions and Failure Modes

- **Assumes the decoded table is complete for the contract.** It covers what was decoded from the block the decoder was registered onward, which may be later than deployment.
- **Assumes one address is one protocol.** Shared routers, multicall helpers and aggregator contracts appear in many protocols' data, so attributing activity by the address that emitted the event can misattribute who caused it.
- **Assumes token identity is stable.** Multiple deployments share a symbol across chains and bridges. Joining on symbol rather than contract address merges unrelated assets.
- **Assumes a sum over addresses is a sum over participants.** It is not, for the reasons set out in [Wallet Analytics](/data-tooling/wallet-analytics). Any per-user statistic computed from a group-by on address inherits that gap.
- **Assumes timestamps support fine alignment.** Block timestamps are proposer-declared within a tolerance. They are fine for daily buckets and unsuitable for sub-minute joins against an off-chain series.
- **Assumes a public dashboard has been validated.** Most have not. A published query is a claim by its author, and the SQL is visible precisely so it can be checked.
- **Assumes the result is reproducible.** Re-running the same query later can give different answers as decoders, price coverage and curated models are extended backwards. Pin a block range and record the run date. See [Reproducible Experiments](/data-tooling/reproducible).
- **Assumes a dashboard's headline matches its query.** Charts are configured separately from the SQL that feeds them, so filters, unit scaling and date ranges applied at the visualisation layer are invisible in the query text.
- **Assumes recency implies completeness.** The most recent blocks may not be fully ingested or decoded. A query ending at the present frequently shows an artificial decline in the final period, which is an ingestion artefact rather than a change in activity.

> info **Exclude the incomplete tail** Trim the final period from any time series ending at the present, or state explicitly that it is partial. The spurious drop at the right-hand edge of a chart is the most reproduced error in on-chain analytics.

---

#### See Also

* [Event Logs and Decoding](/data-tooling/event-logs)
* [The Graph](/data-tooling/the-graph)
* [Wallet Analytics](/data-tooling/wallet-analytics)
* [RPC Nodes](/data-tooling/rpc-nodes)
* [Cleaning and Resampling Market Data](/data-tooling/cleaning)
* [Dashboards](/data-tooling/dashboards)

---

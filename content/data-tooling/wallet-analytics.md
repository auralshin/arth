### Wallet Analytics

> info **Metadata** Level: Intermediate | Prerequisites: Event Logs and Decoding, Tokens and Addresses | Tags: on-chain, clustering, attribution, cohorts, flows, identification

Wallet analytics is the attempt to convert a stream of addresses into statements about *entities*: how many participants a protocol has, whether they are returning, whether money is entering or leaving. The data supporting these questions is unusually complete — every transfer since genesis, publicly and permanently. The inference layered on top of it is unusually weak, and the gap between the two is the reason so much on-chain commentary is confidently wrong.

The problem is stated in one sentence. **An address is a public key, not a person.** There is no bijection in either direction: one entity routinely controls thousands of addresses, and one address routinely holds funds for thousands of entities. Every metric phrased in terms of "users", "holders", or "whales" is silently asserting a mapping that the chain does not contain. This page covers the techniques used to approximate that mapping, what each one actually assumes, and how badly each fails.

---

#### The Identification Problem

Four distinct failures of the address-equals-entity assumption, each breaking a different class of analysis.

<table>
  <tbody>
    <tr><td><strong>Failure</strong></td><td><strong>Mechanism</strong></td><td><strong>What it breaks</strong></td></tr>
    <tr><td>One entity, many addresses</td><td>Fresh addresses are free. Airdrop farming, privacy hygiene, and operational separation all multiply them.</td><td>Counts of users, holders, and any per-address distribution</td></tr>
    <tr><td>One address, many entities</td><td>Exchange omnibus wallets, custodians, bridges, and pooled vaults hold on behalf of many parties.</td><td>Concentration measures, whale analysis, holder distributions</td></tr>
    <tr><td>Address is not a party</td><td>Routers, aggregators, multicall helpers and settlement contracts appear as counterparties to everything.</td><td>Counterparty graphs, flow attribution, activity rankings</td></tr>
    <tr><td>Signer is not owner</td><td>Multisigs, smart-contract wallets and account abstraction separate who authorises from what executes.</td><td>Any inference from transaction origination</td></tr>
  </tbody>
</table>

A contract address can be distinguished from an externally owned account by whether code exists at it, but that test is weaker than it looks. Code can be deployed to a pre-computed address after funds arrive, so an address with no code today may become a contract tomorrow. And an account with no code can still be operated by an automated system, which is the distinction most analyses actually care about.

> warning **Active addresses is not active users** It is a count of addresses that transacted. It rises when one entity splits activity across more addresses and falls when an entity consolidates, with no change in participation either way. Treat it as an activity proxy with unknown and time-varying scale.

---

#### Clustering Heuristics and Their Failure Modes

Clustering tries to group addresses under a common controller. Every method below is a heuristic with no ground truth to validate against, which is the central methodological problem: you cannot compute the error rate of a clustering you cannot check.

<table>
  <tbody>
    <tr><td><strong>Heuristic</strong></td><td><strong>Assumption</strong></td><td><strong>How it breaks</strong></td></tr>
    <tr><td>Common input ownership</td><td>Inputs spent together share an owner</td><td>Applies to UTXO chains only. There is no equivalent on account-based chains, and importing the intuition is a category error.</td></tr>
    <tr><td>Funding source</td><td>The address that first funded a new address controls it</td><td>Exchanges and faucets fund millions of unrelated addresses. Without excluding hubs, everything merges into one cluster.</td></tr>
    <tr><td>Deposit-address sweeping</td><td>Addresses sweeping to a common wallet belong to that operator</td><td>The strongest heuristic on account chains, but it identifies the custodian, not the customer behind each deposit.</td></tr>
    <tr><td>Behavioural fingerprinting</td><td>Timing, gas settings, and contract choice are stable per operator</td><td>Wallet software defaults dominate the signal, so it clusters software rather than people.</td></tr>
    <tr><td>Temporal correlation</td><td>Addresses acting together are controlled together</td><td>Everyone reacts to the same price moves and the same incentive deadlines. Correlation is ambient.</td></tr>
    <tr><td>Public labels and naming</td><td>Curated or self-declared identity is accurate</td><td>Coverage is thin, provenance is often unrecorded, and labels go stale as entities change wallets.</td></tr>
  </tbody>
</table>

Two properties of this list deserve emphasis. First, the errors are **asymmetric and directional**: funding-graph clustering over-merges, behavioural clustering under-merges, and neither error is random with respect to the quantity being measured. Second, all of them are **cheap to defeat**. Anyone with a reason to avoid clustering — which includes most participants operating at size — funds addresses through an intermediary, varies timing, and never sweeps. The clusters you can build describe the participants who were not trying.

---

#### Worked Example: What Clustering Does to a Distribution

Take an illustrative distribution: 1,000,000 tokens allocated across 10,000 eligible addresses. Suppose funding-graph clustering, after excluding high-degree hubs, collapses these to 1,200 clusters.

1. **Apparent per-address share**: `1,000,000 / 10,000 = 100` tokens.
2. **Per-cluster share**: `1,000,000 / 1,200 = 833` tokens.
3. **Mean addresses per cluster**: `10,000 / 1,200 = 8.33`.

The same distribution now supports two opposite descriptions: broadly distributed across ten thousand participants, or eight-fold concentrated relative to the headline. Neither is verified. The clustering could be over-merging through a shared funding intermediary, in which case 1,200 is too low; it could be under-merging for anyone who funded through a bridge, in which case 1,200 is too high. Both errors are present simultaneously, and the numbers above are chosen for illustration rather than measured.

The honest reporting of this analysis is a range with the heuristic named, not a point estimate. That is unsatisfying, and it is the actual state of knowledge.

---

#### Cohort and Flow Analysis

**Cohort analysis** groups addresses by the period of their first interaction and follows each group forward. It answers whether a protocol retains participants or churns them, and it is more robust than a headline count because it compares like with like over time.

The confounds are specific. Address-level cohorts overstate churn, because an entity returning under a fresh address registers as a lost member of the old cohort and a new member of a later one. Incentive programmes distort cohort boundaries, since a cohort formed during a reward campaign is composed differently from one formed outside it — and its subsequent "retention" is measuring the incentive's duration. The general framing of this problem, and the fact that missing observations are not missing at random, is covered in [Market Data Sources](/data-tooling/data-sources).

**Flow analysis** tracks value moving between labelled groups: to and from exchange wallets, into and out of a protocol, across a bridge. It is the on-chain measurement most often quoted and the one with the weakest inferential foundation.

- Transfers between an exchange's own wallets are internal rebalancing, but appear as flow unless the full wallet set is known.
- A transfer to a custodian is a change of custody, not a sale. The reverse inference — that inflow to an exchange predicts selling — requires that deposits are made to sell, which is an assumption about intent, not an observation.
- Bridge contracts lock on one side and mint on the other, so naive aggregation double-counts the same value.
- Contract-mediated flows attribute value to routers rather than to whoever initiated the trade.

None of this makes flow analysis useless. It makes it a *conditional* measurement whose conditions must be stated: this much value moved between these address sets, under this labelling, at this time. The step from that statement to a claim about intent is not supported by the data.

---

#### Assumptions and Failure Modes

- **Assumes address counts approximate participant counts.** They do not, and the ratio moves with incentives, gas costs and wallet software. Two periods are not comparable on this metric.
- **Assumes labels are current and complete.** Label sets are crowdsourced, unevenly maintained, and stale by construction: entities rotate wallets and nobody updates the record.
- **Assumes clustering error is random.** It is systematic. Sophisticated participants are under-clustered because they take steps to be, and those are precisely the participants that dominate the value being measured.
- **Assumes contracts can be excluded cleanly.** The code test is imperfect, and the interesting distinction — automated versus human — has no on-chain signature at all.
- **Assumes flows imply intent.** A transfer is a change of custody. Reading it as a decision to buy or sell adds an unverifiable assumption to a verifiable fact.
- **Assumes off-chain activity does not exist.** Balances held at a centralised venue move between customers with no on-chain trace. For assets with substantial custodial holdings, the chain observes a shrinking fraction of the economic activity.
- **Assumes one chain is the whole picture.** Entities operate across chains under unrelated addresses, and bridging severs any link a heuristic could follow. Single-chain analysis measures a fragment and reports it as a total.
- **Assumes an entity is a stable thing.** A multisig, a DAO treasury, a fund and a person are all "one entity" to a clustering algorithm and are not comparable units for any distributional statistic.
- **Assumes the population is closed.** Addresses appear and disappear continuously, and a cohort defined at one date is compared against a chain whose composition has changed. Metrics normalised by "total addresses" move when the denominator moves, independently of the numerator.
- **Assumes clustering is stable over time.** Re-running the same heuristic on a longer history merges clusters that were previously separate, so a time series of cluster counts computed at different dates is not internally consistent. Recompute the whole series whenever the method changes.

> warning **Attribution is weak, and stating so is part of the result** Nothing on this page produces identification in a meaningful sense. The usable output is a labelled approximation with a named heuristic and an unmeasurable error, and analyses that present it as anything stronger are overclaiming.

---

#### Code

```python
class FundingClusters:
    """Union-find over a funding graph: an address joins whoever first funded it.

    The hub exclusion is not an optimisation -- it is the whole method. One
    exchange hot wallet funding a million addresses would otherwise merge the
    entire chain into a single cluster, which is the degenerate result this
    heuristic reaches by default.
    """

    def __init__(self, hub_degree_threshold=50):
        self.parent = {}
        self.hub_degree_threshold = hub_degree_threshold

    def find(self, address):
        self.parent.setdefault(address, address)
        while self.parent[address] != address:
            self.parent[address] = self.parent[self.parent[address]]
            address = self.parent[address]
        return address

    def union(self, a, b):
        root_a, root_b = self.find(a), self.find(b)
        if root_a != root_b:
            self.parent[root_b] = root_a

    def build(self, first_funding_edges, out_degree):
        """first_funding_edges: (funder, funded) for each address's first inflow."""
        for funder, funded in first_funding_edges:
            if out_degree.get(funder, 0) >= self.hub_degree_threshold:
                continue          # a hub tells you nothing about common control
            self.union(funder, funded)
        return self

    def cluster_count(self, addresses):
        return len({self.find(a) for a in addresses})
```

---

#### See Also

* [Event Logs and Decoding](/data-tooling/event-logs)
* [Dune Analytics](/data-tooling/dune-analytics)
* [Market Data Sources](/data-tooling/data-sources)
* [On-Chain Activity Signals](/signals/onchain-activity)
* [Tokens and Addresses](/start-here/tokens-addresses)
* [Market Participants](/markets/market-participants)

---

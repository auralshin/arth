### On-Chain vs Off-Chain Execution

> info **Metadata** Level: Intermediate | Prerequisites: Orderbooks vs AMMs, Gas and the Mempool, Execution Overview | Tags: on-chain, off-chain, hybrid, settlement, architecture, microstructure, defi

The choice between executing on-chain and executing off-chain is usually presented as a matter of principle. It is better read as a straightforward engineering trade: on-chain execution buys settlement assurance, custody without a counterparty, public verifiability, and atomic composition with other contracts, and it pays for them in latency, per-operation cost, throughput, and pre-trade privacy. Neither column is free and neither dominates.

What makes the trade sharp is that the costs land almost entirely on *quoting* while the benefits attach almost entirely to *settlement*. A market maker updates its quotes far more often than it trades, so a design that charges for every update and a design that charges only for every fill face bills that differ by the quote-to-fill ratio — which in a competitive book is a large number. Most of the architectural variety in on-chain trading is a response to that single asymmetry. This page works through what each model actually guarantees, what it costs, and what it implies for the way a trading system is built.

---

#### What On-Chain Execution Actually Guarantees

Four properties, and it is worth being precise about each because they are frequently overstated.

- **Validity.** Every node re-executes the state transition and rejects an invalid one. You do not need to trust that the venue applied its own matching rules correctly, because the rules are the code and the code was run publicly.
- **Settlement finality on the consensus protocol's terms.** Once included and finalised, the transfer is done and no operator can reverse, gate, or delay it. Note the qualifier: where finality is probabilistic, an included transaction is a strong convention rather than a settled fact.
- **Custody without a counterparty.** Assets sit in a contract whose withdrawal conditions are public and enforced by the same execution. There is no credit exposure to an operator, and no withdrawal queue at that operator's discretion. This is exchanged for exposure to the contract itself — see [Smart Contract Risk](/risk/smart-contract).
- **Atomic composability.** Several protocols can be touched in one transaction that either wholly succeeds or wholly reverts. Multi-leg trades, collateral migrations, and flash-funded arbitrage exist because of this property and have no off-chain analogue at all.

---

#### What It Costs

- **A latency floor set by block production, not by physics.** Nothing settles between blocks. A quote embedded in on-chain state is stale for the whole interval by construction, and it cannot be withdrawn during it.
- **A metered cost per operation.** Every placement, cancellation, and fill is a priced state change. Cancellation in particular is normally free on a matching engine and is never free on-chain. See [Gas and the Mempool](/microstructure/gas-mempool).
- **A throughput ceiling shared with everyone else.** Block space is a common resource, so a burst of unrelated activity raises your costs and delays your orders.
- **Public pre-trade exposure.** Where there is a public mempool, an order is fully specified and readable before it executes, including its worst acceptable price.
- **Ordering discretion sold to a third party.** Position within a block is bought rather than earned by arrival time, which changes what speed is worth. See [MEV, Formally](/microstructure/mev-formal).

---

#### Worked Example: The Quote-to-Fill Ratio Decides the Architecture

Illustrative figures for one market maker on one instrument over one day. Nothing here is measured from a live venue; the point is the ratio, not the level.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Quote updates per day</td><td>10,000</td></tr>
    <tr><td>Fills per day</td><td>200</td></tr>
    <tr><td>Gas per on-chain quote update</td><td>60,000</td></tr>
    <tr><td>Gas per settlement</td><td>100,000</td></tr>
    <tr><td>Gas price</td><td>20 gwei</td></tr>
  </tbody>
</table>

1. **Quote-to-fill ratio**: `10,000 / 200 = 50` updates per trade
2. **Everything on-chain**: `10,000 * 60,000 + 200 * 100,000 = 620,000,000` gas, or **12.40 ETH per day**
3. **Off-chain matching, on-chain settlement**: only fills touch the chain, so `200 * 100,000 = 20,000,000` gas, or **0.40 ETH per day**
4. **Ratio**: `12.40 / 0.40 = 31` times cheaper, and the multiple grows linearly with the quote-to-fill ratio
5. **Cost per fill**: `0.062` ETH fully on-chain against `0.002` ETH hybrid
6. **Minimum economic clip at a 5 bps edge**: `0.062 / 0.0005 = 124` ETH fully on-chain against `0.002 / 0.0005 = 4` ETH hybrid

Step 6 is the operative one. The fully on-chain design does not merely cost more; it forbids a whole size range. A maker that must quote in clips of 124 ETH cannot serve retail flow at all, which removes the uninformed flow that the business depends on.

Two escapes exist and both are visible in deployed systems. **Move the quoting off-chain** and settle only fills, which is step 3. Or **make quoting cheap enough that step 2 stops mattering** — an execution environment pricing the same work three orders of magnitude lower turns 12.40 ETH into roughly 0.012 ETH per day, and the fully on-chain order book becomes viable. That is the entire argument for application-specific chains, high-throughput execution environments, and rollups. See [Comparative Benchmarks](/blockchain-execution-environments/comparative-benchmarks).

The third escape is to stop quoting altogether: post a passive curve that never updates and let arbitrageurs move it. That is an automated market maker, and its cost is examined below.

---

#### The Staleness Floor

Under a diffusion with annualised volatility `sigma`, the standard deviation of the price move over an interval of `tau` seconds is:

```text
staleness_sd_bps = 10,000 * sigma * sqrt(tau / seconds_per_year)
```

At `sigma = 0.60` and 31,536,000 seconds in a year:

<table>
  <tbody>
    <tr><td><strong>Quote lifetime</strong></td><td><strong>Standard deviation of the move (bps)</strong></td><td><strong>Corresponding venue</strong></td></tr>
    <tr><td>12 seconds</td><td>3.70</td><td>One block on a slow settlement layer</td></tr>
    <tr><td>2 seconds</td><td>1.51</td><td>One block on a faster chain</td></tr>
    <tr><td>0.4 seconds</td><td>0.68</td><td>A high-throughput execution environment</td></tr>
    <tr><td>0.05 seconds</td><td>0.24</td><td>An off-chain matching engine</td></tr>
  </tbody>
</table>

The scaling is the square root of time, so shortening the quote lifetime from twelve seconds to fifty milliseconds shrinks the exposure by `sqrt(12 / 0.05) = 15.5` times, not by 240. Speed has decreasing returns, which is why moderately fast chains capture most of the available improvement and the last increment is expensive. What matters is whether the staleness window is large or small relative to the spread being quoted: at 3.70 bps of one-block dispersion, a 5 bps half-spread is thin protection, and the fills that arrive are disproportionately the ones you would have declined. See [Latency Risk](/microstructure/latency-risk) and [Adverse Selection](/execution/adverse-selection).

A passive curve is the limiting case of this: a quote with an infinite lifetime and no cancel. Its cost has a closed form — variance over eight per unit time — which at 60% annualised volatility is 4.5% of pool value per year, accruing whether or not anyone trades with intent. See [LP as a Business](/strategies/lp-business).

---

#### Hybrid Designs

Almost every deployed on-chain venue is a hybrid. The useful question about each is not "how decentralised is it" but "what moved off-chain, and what new assumption arrived with it".

<table>
  <tbody>
    <tr><td><strong>Design</strong></td><td><strong>Off-chain</strong></td><td><strong>On-chain</strong></td><td><strong>New assumption</strong></td></tr>
    <tr><td>Automated market maker</td><td>Nothing</td><td>Pricing, matching, custody, settlement</td><td>None beyond the contract, but the quote never updates</td></tr>
    <tr><td>Fully on-chain order book</td><td>Nothing</td><td>Placement, cancellation, matching</td><td>None, but throughput and cost bound the design</td></tr>
    <tr><td>Off-chain book, on-chain settlement</td><td>Order entry, cancellation, matching</td><td>Margin, custody, settlement</td><td>Operator liveness, and that matching followed the stated rules</td></tr>
    <tr><td>Intent or request-for-quote with solver settlement</td><td>Quoting and route search</td><td>The settlement transaction and its constraint checks</td><td>Solver competition, and that the constraint you signed was tight</td></tr>
    <tr><td>Batch auction</td><td>Order collection</td><td>Uniform-price clearing and settlement</td><td>A batch operator, and a delay every participant pays</td></tr>
    <tr><td>Rollup</td><td>Execution and ordering</td><td>Data availability and proof or fraud-window verification</td><td>Sequencer liveness and censorship behaviour; a withdrawal delay</td></tr>
    <tr><td>Application-specific chain</td><td>Nothing, but the chain is the venue</td><td>Its own consensus</td><td>A smaller validator set securing the assets directly</td></tr>
  </tbody>
</table>

The pattern is consistent: moving work off-chain buys latency and cost, and pays for it in a trust assumption about a named party. The assumption is usually about **liveness** rather than about theft, because settlement stays on-chain — the operator generally cannot take your assets, but it can stop serving you, reorder you, or fail at the moment you most need it.

Intent-based designs deserve one clarification because they are easy to misread. Signing an intent does not remove ordering risk; it relocates it. The signed constraint — a minimum output, a deadline — is still the binding protection, and a loose constraint is still a budget an executor may spend. What changes is that competition happens among solvers before submission rather than among extractors after it. See [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses).

---

#### What This Means for a Trading System

The architectural consequences are concrete, and they are the part most often discovered late.

- **The source of truth moves.** Off-chain, the venue's record is authoritative and available immediately. On-chain, the chain is authoritative and lags by the confirmation depth you choose to trust. A system spanning both is reconciling two authorities on two clocks, and it needs an explicit rule for the interval where they disagree.
- **Idempotency stops being optional.** Off-chain, a client order identifier prevents duplicate submission. On-chain, the nonce does the same job, but it is mandatory, sequential, and shared across every strategy using the address. Concurrent submission from one address requires central nonce allocation and a recovery path for the whole window when one item fails.
- **The failure taxonomy is different.** A rejected order costs nothing; a reverted transaction costs gas and leaves the position unchanged while your model may already assume otherwise. A disconnection is recoverable by querying open orders; a chain reorganisation invalidates state you already acted on. A venue halt is announced; a sequencer outage is discovered.
- **The latency budget targets a different thing.** Off-chain you are racing a matching engine's arrival order. On-chain you are meeting an assembler's deadline with an attractive bid, so being fastest is a qualifying condition rather than the contest. See [Latency Risk](/microstructure/latency-risk).
- **The cost model changes the optimal schedule.** Off-chain costs scale with notional; on-chain costs are largely fixed per transaction. A fixed cost per child order pushes the optimal execution schedule toward fewer, larger children than an impact model alone implies. See [Execution Overview](/execution/execution-overview) and [Fees & Routing](/microstructure/fees-routing).
- **Capital sits in a different place.** On-chain it sits in contracts, is composable with other protocols, and carries contract risk. Off-chain it sits with an operator, is not composable, and carries credit and operational risk. This is a choice about which failure you are able to underwrite, not about which is safer.

---

#### In Practice Across Venue Types

**Spot automated market makers.** Fully on-chain by construction. The design trades quote quality for zero operating cost and accepts a structural inventory loss in exchange.

**On-chain order books.** Viable where the execution environment prices placement and cancellation cheaply enough that step 2 above becomes affordable. The binding constraint is throughput under stress, not average-case cost.

**Perpetual futures venues.** Commonly hybrid: matching and risk computation off-chain at sub-second cadence, margin and settlement on-chain. The oracle becomes a load-bearing component, since liquidations depend on a price the venue did not observe directly. See [Perp DEX](/protocols/perp-dex).

**Intent and request-for-quote systems.** The user signs a constraint rather than a route. Execution quality then depends on solver competition, and the measurable question is realised price against a reference, not whether the venue was on-chain.

**Cross-chain.** Any design spanning two chains inherits both settlement models plus a messaging layer, and the messaging layer is usually the weakest assumption in the system. See [Bridges](/building-blocks/bridges).

---

#### Assumptions and Failure Modes

- **Assumes the quote-to-fill ratio is known.** It is a property of the instrument and the competition, not of the venue, and it rises as spreads tighten. A design sized for one ratio breaks at another.
- **Assumes gas costs are stable.** They are not, and they spike precisely during the episodes when quoting matters most, so an on-chain maker's cost base is correlated with the volatility that determines its revenue.
- **Assumes the diffusion model for staleness.** Jumps break the square-root scaling: a gap move produces the entire adverse selection in one fill regardless of quote lifetime, and no amount of speed helps.
- **Assumes off-chain operators are live.** The realistic failure of a hybrid venue is not theft but unavailability during a market event, when settlement is still guaranteed and access is not.
- **Assumes on-chain state is readable when needed.** Node infrastructure, indexers, and archive access are dependencies with their own outages, and a strategy blind to state is worse off than one that cannot trade. See [Operational Risk](/risk/operational).
- **Assumes composability is worth its price.** Atomic multi-protocol interaction is genuinely unavailable off-chain, but most strategies never use it, and paying on-chain execution costs for a property you do not exercise is a common and expensive mistake.
- **Assumes the trust assumption is stated.** Many hybrid venues are described by what settles on-chain rather than by what does not. The question to ask of any such design is which party's failure stops you trading or stops you exiting.

---

#### Code

```python
SECONDS_PER_YEAR = 365 * 24 * 3600


def staleness_sd_bps(annual_vol, quote_lifetime_seconds):
    """Standard deviation of the price move across a quote's lifetime.

    Square-root-of-time scaling, so halving the lifetime buys only a
    factor of 1.41. Compare against the half-spread being quoted.
    """
    return 1e4 * annual_vol * (quote_lifetime_seconds / SECONDS_PER_YEAR) ** 0.5


def daily_chain_cost(quotes, fills, gas_per_quote, gas_per_fill,
                     gas_price_gwei):
    """Native-unit cost per day for a given split of on-chain work.

    Set gas_per_quote to zero to model off-chain matching with
    on-chain settlement; the gap is the quote-to-fill ratio at work.
    """
    total_gas = quotes * gas_per_quote + fills * gas_per_fill
    return total_gas * gas_price_gwei / 1e9


def minimum_clip(cost_per_fill, edge_bps):
    """Smallest trade whose edge covers its own settlement cost.

    This is the size range a design forbids, which matters more than
    the headline cost: it decides which flow you can serve.
    """
    return cost_per_fill / (edge_bps / 1e4)
```

---

#### See Also

* [Latency Risk](/microstructure/latency-risk)
* [Execution Overview](/execution/execution-overview)
* [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms)
* [Gas and the Mempool](/microstructure/gas-mempool)
* [MEV, Formally](/microstructure/mev-formal)
* [Perp DEX](/protocols/perp-dex)
* [LP as a Business](/strategies/lp-business)

---

### The Economics of Transaction Ordering

> info **Metadata** Level: Advanced | Prerequisites: Transaction Ordering & MEV, Gas & Mempool, AMMs 101 | Tags: mev, ordering, auctions, rents, microstructure, defi

The [section landing page](/transaction-ordering-mev) makes the claim that a block is an auction over sequence. This page takes that claim seriously: it defines extractable value precisely, shows where in the pipeline the value is created and where it is captured, and explains why the amount extracted from users and the amount kept by extractors are two different quantities that people routinely confuse.

The distinction matters for a practical reason. If you measure how much profit searchers keep and call that the cost of MEV, you will understate the user-side cost by whatever fraction competition has already dissipated into bids. If you measure the theoretical maximum a perfectly informed sequencer could have taken, you will overstate what anyone actually captured. Both numbers are legitimate; they answer different questions, and neither is "the amount of MEV".

---

#### Formal Definition

Let `s` be the chain state at the start of a block and `T` the set of transactions the assembler could include. An **ordering** `pi` is a sequence drawn from `T`, subject to protocol constraints — the block gas limit, per-account nonce monotonicity, and the requirement that each transaction be valid against the state it sees. Write `A` for the set of admissible orderings.

Extractable value is defined against a reference:

```text
EV(s, T) = max over pi in A of  V(pi, s)  -  V(pi_ref, s)
```

where:

- `V(pi, s)` is the assembler's payoff from applying ordering `pi` to state `s` — fees received, plus any profit from transactions the assembler inserted itself
- `pi_ref` is a **reference ordering**: the counterfactual sequence against which extraction is judged
- `A` is the admissible set defined by protocol rules

The `max` term is mechanical. The `pi_ref` term is where all the disagreement lives. Reasonable candidates include the ordering by descending priority fee, the ordering by observed arrival time in the mempool, and the ordering with all assembler-inserted transactions removed. Each gives a different `EV`, and none is privileged by the protocol, because the protocol has no opinion about ordering at all.

> warning **There is no protocol-defined "correct" ordering** Any statement of the form "the fair ordering would have been X" is a statement about a norm the software does not encode. Say which reference ordering you are using, or your measurement is undefined.

---

#### Who Creates the Value and Who Keeps It

A useful way to read the pipeline is as a sequence of markets, each one dissipating some of the rent created upstream.

<table>
  <tbody>
    <tr><td><strong>Stage</strong></td><td><strong>What it contributes</strong></td><td><strong>How competition erodes its rent</strong></td></tr>
    <tr><td>User</td><td>Submits a state transition whose position matters. Sets a slippage tolerance, which bounds what can be taken.</td><td>Bears the cost; captures nothing.</td></tr>
    <tr><td>Searcher</td><td>Identifies the opportunity and writes the bundle that realises it.</td><td>Rival searchers bid up the payment to the builder until margin approaches the cost of running the search.</td></tr>
    <tr><td>Builder</td><td>Packs bundles and ordinary transactions into the highest-value block it can construct.</td><td>Rival builders bid up the payment to the proposer.</td></tr>
    <tr><td>Proposer</td><td>Holds the protocol right to publish a block for the slot.</td><td>Faces no rival for its own slot, so this is where residual rent tends to settle.</td></tr>
  </tbody>
</table>

The important consequence: **the cost borne by the user is invariant to how the rent is split downstream.** A sandwiched swap loses exactly the same amount whether the searcher keeps the proceeds, hands 90% to a builder, or the builder hands 95% of that onward. Competition among extractors redistributes the surplus; it does not return it. This is why "the searcher-level margin is thin" is not a rebuttal to "the user paid a lot", and why [Statistical Modeling](/transaction-ordering-mev/statistical-modeling) insists on measuring the two separately.

---

#### Worked Example: Splitting One Opportunity

All figures below are constructed, and the underlying extraction is the sandwich computed in full in [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts). Take its gross proceeds of `1,372.16` USDC and follow them through the pipeline.

1. **Costs first.** The extractor's two extra transactions cost `20.00` USDC in gas, leaving `1,372.16 - 20.00 = 1,352.16` available to bid.
2. **The searcher's bid.** Rival searchers hold near-identical bundles, so the bid to the builder rises until margin is thin. At 92% of the net, the searcher pays `1,352.16 * 0.92 = 1,243.99` and keeps `108.17`.
3. **The builder's bid.** Rival builders hold near-identical blocks. At 97% of what it received, the builder pays `1,243.99 * 0.97 = 1,206.67` to the proposer and keeps `37.32`.
4. **The proposer.** It receives `1,206.67` and faces no rival for its own slot, so nothing bids this away.

<table>
  <tbody>
    <tr><td><strong>Recipient</strong></td><td><strong>Amount (USDC)</strong></td><td><strong>Share of gross</strong></td></tr>
    <tr><td>Searcher</td><td>108.17</td><td>7.9%</td></tr>
    <tr><td>Builder</td><td>37.32</td><td>2.7%</td></tr>
    <tr><td>Proposer</td><td>1,206.67</td><td>87.9%</td></tr>
    <tr><td>Gas</td><td>20.00</td><td>1.5%</td></tr>
    <tr><td>Total</td><td>1,372.16</td><td>100.0%</td></tr>
  </tbody>
</table>

Now change the assumptions. Suppose searcher competition collapses and the bid falls to 40% of the net. The searcher keeps `811.30`, the builder `16.23`, and the proposer receives `524.64`. The split has moved enormously. **The user still lost the same 0.9664 ETH.** Nothing in steps 1 to 4 touches the victim's fill.

> warning **Thin searcher margins are not evidence of low user cost** The two quantities are connected only through the size of the opportunity, which competition does not shrink. A market where extractors barely break even can be extracting exactly as much from users as one where they profit handsomely.

---

#### Three Ingredients, All Required

Extraction needs all three of these simultaneously. Remove any one and the opportunity disappears — which is exactly what every defence in [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses) tries to do.

1. **Order-dependence.** The pending transactions must not commute. Two swaps against the same pool do not commute; two transfers between unrelated accounts do. Parallel-execution chains exploit this: transactions touching disjoint state can be run concurrently precisely because they commute.
2. **Discretion.** Someone must be able to choose among admissible orderings. A protocol that fixed the ordering by a rule nobody could influence would have no discretion to sell — though as [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms) discusses, every such rule proposed so far can be gamed by manipulating the rule's inputs instead.
3. **Information.** The extractor must know enough about the pending transaction to construct a profitable sequence around it. This is the ingredient user-level defences attack: private orderflow removes the extractor's view of the transaction, and encrypted mempools remove it from everyone until the ordering is already fixed.

---

#### What Determines the Size of the Prize

Discretion is only worth what there is to take. For the commonest case — an arbitrageur restoring a constant-product pool to an external price — the size of the opportunity has a closed form. Write `X` for the pool's quote-asset reserves, `p` for the pool price, and `d` for the fractional gap to the external price, so the external price is `p * (1 + d)`. Ignoring fees, moving the pool to the external price yields:

```text
arb_profit = X * (sqrt(1 + d) - 1)^2   ~=   X * d^2 / 4   for small d
```

The approximation follows from `sqrt(1 + d) - 1 ~= d/2`. Two properties matter more than the formula itself.

**It is linear in depth.** Doubling the pool's size doubles the value of correcting the same proportional gap. Deeper markets are not less contested; they are more.

**It is quadratic in the gap.** Doubling the price move quadruples the prize. Taking the constructed pool used throughout this section — 10,000,000 units of quote asset against 5,000 of base:

<table>
  <tbody>
    <tr><td><strong>Price gap</strong></td><td><strong>Exact profit</strong></td><td><strong>Quadratic approximation</strong></td></tr>
    <tr><td>0.25%</td><td>15.61</td><td>15.63</td></tr>
    <tr><td>0.50%</td><td>62.34</td><td>62.50</td></tr>
    <tr><td>1.00%</td><td>248.76</td><td>250.00</td></tr>
    <tr><td>2.00%</td><td>990.12</td><td>1,000.00</td></tr>
  </tbody>
</table>

The convexity is why extraction clusters in volatile periods rather than accruing steadily, why a sample mean computed across calm and turbulent blocks is an unstable statistic, and why the tail of the distribution dominates any total. [Statistical Modeling](/transaction-ordering-mev/statistical-modeling) treats the measurement consequences.

Fees add a deadband. An arbitrageur pays the venue's fee on the correcting trade, so gaps smaller than roughly the fee rate are not worth closing and the pool is allowed to sit stale within that band. A higher fee therefore reduces extraction and widens the range over which the pool quotes a price the market has left.

---

#### Where the Section Goes From Here

* [How Blocks Form](/transaction-ordering-mev/how-blocks-form) — the pipeline in detail: propagation, the fee mechanism, bundles, proposer-builder separation, and the inclusion rules that define the admissible set `A` above.
* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy) — the concrete strategies, organised by whether they are atomic, whether they need off-chain inventory, and whether they take from users or from liquidity providers.
* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts) — a fully worked sandwich, decomposing a realised fill into fee, own impact, and ordering cost.
* [Statistical Modeling](/transaction-ordering-mev/statistical-modeling) — measurement: the reference-ordering problem above, plus base rates, censoring, and clustering.
* [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses) — which of the three ingredients each defence attacks, and what it costs.
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms) — the same three ingredients under different execution models.

---

#### Assumptions and Failure Modes

- **The admissible set is knowable.** Reconstructing `A` requires knowing what the assembler could see, which includes private orderflow that never appears in any public record. Any computed `EV` is therefore a lower bound conditional on the transactions you know about.
- **Payoffs are denominated consistently.** Extraction spanning several assets has to be valued at some price, and the price moves during the block. Different valuation conventions — pre-block mid, post-block mid, external reference — produce different answers for the same block.
- **Actors are treated as distinct.** Searcher, builder, and proposer are roles, not necessarily separate parties. Where they are vertically integrated, the payments between them stop being observable and the split above becomes unmeasurable even though the user-side cost is unchanged.
- **Competition is assumed to dissipate rent.** It does so only where entry is genuinely open. Extraction that requires off-chain inventory, exchange relationships, or an existing builder relationship has barriers to entry, and rent persists at that stage rather than flowing onward.
- **The reference ordering is a normative choice.** Nothing above makes it otherwise. Two honest analysts using different references will disagree about the size of the number and both be right about their own question.

> info **The useful question is rarely "how much MEV was there"** It is usually "how much worse was this user's fill than a stated counterfactual", which is a question you can actually answer.

---

#### Code

```python
import math


def arb_profit(quote_reserves, price_gap, fee=0.0):
    """Profit from restoring a constant-product pool to an external price.

    price_gap is fractional: 0.01 means the external price sits 1% above
    the pool price. Gaps inside the fee deadband are not worth closing,
    so the pool is left stale there rather than corrected.
    """
    if abs(price_gap) <= fee:
        return 0.0
    return quote_reserves * (math.sqrt(1 + price_gap) - 1) ** 2


def split_rent(gross, gas, searcher_bid_share, builder_bid_share):
    """Follow one opportunity through the pipeline.

    None of these shares affects what the user lost; they only decide
    who ends up holding the proceeds.
    """
    net = gross - gas
    to_builder = net * searcher_bid_share
    to_proposer = to_builder * builder_bid_share
    return {
        "searcher": net - to_builder,
        "builder": to_builder - to_proposer,
        "proposer": to_proposer,
        "gas": gas,
    }
```

---

#### See Also

* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts)
* [MEV Formally](/microstructure/mev-formal)
* [MEV Overview](/building-blocks/mev-overview)
* [Adverse Selection](/execution/adverse-selection)

---

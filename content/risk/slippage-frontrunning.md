### Slippage, Fees, and Frontrunning in Practice

> info **Metadata** Level: Intermediate | Prerequisites: AMMs 101, Slippage, Gas and the Mempool | Tags: risk, slippage, mev, execution, sandwich, private-orderflow

Submitting a swap on a public chain means broadcasting your intent to a network of participants who can see it, price it, and act before it settles. The transaction states which pool, which direction, what size, and — crucially — the worst price you are willing to accept. That last field is not merely a safety limit. It is a published statement of how much value can be taken from you without the transaction failing.

This page is about the practical parameters rather than the theory. [Slippage](/microstructure/slippage) covers why price moves against size, and [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy) covers who extracts what and how. Here the question is narrower: what settings does a swap actually expose, what does each one cost when set wrongly, and what do the available protections genuinely buy.

---

#### The Cost Identity

The all-in cost of a swap decomposes into terms that are managed by different means and are easy to conflate.

```text
total_cost = price_impact + pool_fee + extraction + gas + failed_attempt_cost
```

where:

- `price_impact` is the mechanical movement along the pool curve caused by your own size
- `pool_fee` is the venue's fee rate applied to the traded notional
- `extraction` is value taken by whoever ordered the block, bounded by your slippage tolerance
- `gas` is the execution cost, paid in the native asset whether or not the trade succeeds
- `failed_attempt_cost` is gas on reverted attempts, plus the price drift while you retry

The two terms most often ignored are the last two, and they behave in opposite directions to the first three. Tightening a slippage tolerance reduces `extraction` and raises `failed_attempt_cost`. Splitting an order reduces `price_impact` and raises `gas`. There is no setting that reduces everything, which is why this is a trade-off rather than a best practice.

---

#### Slippage Tolerance Is a Published Budget

A swap carries a minimum acceptable output. If execution would deliver less, the transaction reverts. The gap between the fair output and that minimum is the space in which someone can move the price against you and still have your trade succeed.

A **sandwich** exploits this directly: buy ahead of you, let your trade execute at the worse price your tolerance permits, then sell behind you. The attacker's profit is bounded above by the slack you granted.

```text
max_extraction  ~=  tolerance * notional  -  attacker_fees  -  attacker_gas
```

The implication is uncomfortable and exact: **your tolerance is the attacker's budget**. On an illustrative 100,000 swap, a 0.5% tolerance exposes at most 500 and a 3% tolerance exposes at most 3,000. Setting a loose tolerance to avoid failures is publishing a larger bounty.

Tightening is not free either, because a tolerance that is too tight reverts whenever the price moves between broadcast and inclusion. Expected cost combines both. Taking illustrative figures — gas of 12 per attempt, a 25% chance of being sandwiched when profitable, and revert probabilities declining with tolerance — the trade-off depends sharply on size:

<table>
  <tbody>
    <tr><td><strong>Tolerance</strong></td><td><strong>P(revert)</strong></td><td><strong>Expected cost, 500 notional</strong></td><td><strong>Expected cost, 100,000 notional</strong></td></tr>
    <tr><td>0.10%</td><td>40%</td><td>4.93</td><td>29.80</td></tr>
    <tr><td>0.30%</td><td>15%</td><td>2.17</td><td>76.80</td></tr>
    <tr><td>0.50%</td><td>6%</td><td>1.34</td><td>125.72</td></tr>
    <tr><td>1.00%</td><td>2%</td><td>1.49</td><td>250.24</td></tr>
    <tr><td>3.00%</td><td>0.5%</td><td>3.81</td><td>750.06</td></tr>
  </tbody>
</table>

For the small trade the expected cost is U-shaped and minimised near 0.50%, because wasted gas dominates at tight settings. For the large trade it increases monotonically, so under these assumptions the cost-minimising setting is as tight as the revert rate allows. **The optimal tolerance is a function of trade size relative to gas**, and a single default applied to both sizes is wrong for at least one of them. The revert probabilities above are assumed, not measured; the structure of the answer is the point rather than the specific figures.

> warning **A tolerance set for a volatile pair is not a safety margin** Widening tolerance because a pair moves quickly increases exactly the quantity an extractor is bounded by. Volatility argues for faster inclusion or private submission, not for a looser limit.

---

#### The Deadline Is an Option You Are Writing

A swap also carries a deadline after which it can no longer execute. Its purpose is easy to miss: a transaction that is not included stays valid, sitting in the mempool, executable later.

A transaction with a distant deadline is a **free option** written to whoever can choose when to include it. If the price moves in your favour, they include it and capture the difference within your tolerance. If it moves against you, they include it anyway and you have simply traded much later than you intended. Setting the deadline to the maximum representable value, which some tooling does by default, writes that option with no expiry at all.

The sound setting is a deadline short enough that a stale transaction is worthless, at the cost of more reverts when the network is congested. As with tolerance, the failure of a too-tight setting is a wasted gas fee, and the failure of a too-loose one is unbounded.

---

#### What the Available Protections Actually Buy

<table>
  <tbody>
    <tr><td><strong>Protection</strong></td><td><strong>Prevents</strong></td><td><strong>Costs</strong></td></tr>
    <tr><td>Tight slippage tolerance</td><td>Caps extraction at a level you choose</td><td>Reverts and wasted gas; drift while retrying</td></tr>
    <tr><td>Short deadline</td><td>Stale execution and the free option</td><td>More reverts during congestion</td></tr>
    <tr><td>Private submission to a builder</td><td>Public mempool exposure, and usually reverted-transaction costs</td><td>Trust in the recipient; possibly slower inclusion; fewer eyes on the order</td></tr>
    <tr><td>Order splitting</td><td>Price impact on the pool curve</td><td>Gas per slice; the sequence itself reveals a parent order</td></tr>
    <tr><td>Intent or solver-based settlement</td><td>Shifts execution risk to a party quoting a firm price</td><td>The solver prices that risk in; you accept their quote, not the pool's</td></tr>
    <tr><td>Trading in deeper venues</td><td>Impact and manipulability at the source</td><td>Routing complexity; the deepest venue may not be the cheapest by fee</td></tr>
  </tbody>
</table>

**Private orderflow** deserves precision because it is often described as eliminating the problem. Sending a transaction directly to a block builder rather than the public mempool removes it from the view of general searchers, which does remove the ordinary sandwich. What it does not do is remove trust: the recipient sees the transaction and is in a strictly better position than anyone else to act on it. The protection is a change in who has the information, not an absence of anyone having it. A secondary and genuinely valuable benefit is that transactions which would revert are typically simply not included, so the failed-attempt term drops out.

**Splitting** reduces impact by moving less at once. Its cost is not only gas. A predictable sequence of slices is a legible signal that a larger parent order exists, which is the on-chain instance of the information leakage covered in [Adverse Selection](/execution/adverse-selection). The general schedule-versus-impact trade-off is the same one formalised in [Almgren-Chriss](/execution/almgren-chriss); the difference on chain is that each slice carries a fixed gas cost, which puts a hard floor under the number of slices worth using.

---

#### Measuring It Afterwards

Everything above is a decision made before execution. The corresponding discipline afterwards is to measure what the trade actually cost against the price when the decision was made, which is the on-chain form of [Implementation Shortfall](/execution/implementation-shortfall).

```text
shortfall_bps = 10_000 * (execution_price - decision_price) / decision_price
```

The on-chain specifics worth recording alongside it: the block your transaction landed in versus the block you observed the price in, the position of your transaction within that block, whether the pool state at execution differed from the state you quoted against, and the gas actually paid. That last field matters more than it appears, because gas is denominated in the native asset — so its cost in numeraire terms depends on the native asset's price, which tends to move with the very volatility that made you trade. A fixed gas assumption in a cost model is optimistic in exactly the wrong states of the world.

A cost model calibrated from these measurements is worth more than any default. See [Transaction Cost Analysis](/execution/transaction-cost-analysis) for the general framework.

---

#### Assumptions and Failure Modes

- **Assumes the quoted price will be the executed price.** It will not. A quote is computed against pool state at the time of quoting, and any transaction landing before yours changes it.
- **Assumes a default tolerance is reasonable.** Defaults are chosen to minimise support complaints about failures, which biases them loose. The right value depends on your size, the pair, and current conditions.
- **Assumes reverts are cheap.** They cost gas and, more importantly, time. During a fast move the retry executes at a materially different price, so the true cost of a revert is the drift, not the fee.
- **Assumes private submission removes the exposure.** It relocates it. The recipient still sees the order, and coverage depends on which builders receive it.
- **Assumes splitting is undetectable.** Regular slice sizes at regular intervals from one address are trivially recognisable on a public ledger.
- **Assumes gas costs are stable.** They spike precisely during the congestion that accompanies large moves, so cost assumptions calibrated in calm conditions understate exactly when it matters.
- **Assumes the router's route is the best route.** Routing is computed at quote time against then-current state, and a multi-hop route has more state to go stale between quote and execution.

> warning **Educational content only** This page explains execution mechanics and how their settings trade off. It is not advice about how to trade, and none of the illustrative parameters is a recommendation.

---

#### Code

```python
import math


def volatility_implied_tolerance(annual_vol, expected_wait_seconds, z=2.0):
    """Slippage tolerance covering price drift while the transaction waits.

    This is a floor, not an answer: it covers ordinary drift between broadcast
    and inclusion and says nothing about price impact or extraction. Add the
    expected impact of your own size on top.
    """
    seconds_per_year = 365 * 24 * 3600
    drift_sigma = annual_vol * math.sqrt(expected_wait_seconds / seconds_per_year)
    return z * drift_sigma


def expected_execution_cost(notional, tolerance, revert_prob, gas_cost,
                            sandwich_prob):
    """Expected cost of a tolerance setting, in numeraire terms.

    The two terms move in opposite directions, which is why the answer depends
    on notional: wasted gas is fixed, while extraction scales with trade size.
    Small trades have an interior optimum; large trades want the tightest
    tolerance their revert rate permits.
    """
    wasted_gas = revert_prob * gas_cost
    extraction = sandwich_prob * notional * tolerance
    return {
        "wasted_gas": wasted_gas,
        "expected_extraction": extraction,
        "total": wasted_gas + extraction,
    }


def realised_shortfall_bps(execution_price, decision_price, side):
    """Signed cost against the price when the decision was made.

    Positive means the trade cost more than the decision price implied.
    Record the decision block alongside this -- a shortfall measured against
    a stale quote flatters the result.
    """
    signed = 1.0 if side == "buy" else -1.0
    return 10_000 * signed * (execution_price - decision_price) / decision_price
```

---

#### See Also

* [Slippage](/microstructure/slippage)
* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [Mitigation and Defences](/transaction-ordering-mev/mitigation-and-defenses)
* [Implementation Shortfall](/execution/implementation-shortfall)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Gas and the Mempool](/microstructure/gas-mempool)

---

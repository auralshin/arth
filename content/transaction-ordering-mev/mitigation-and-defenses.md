### Mitigation and Defenses

> info **Metadata** Level: Advanced | Prerequisites: MEV Taxonomy, Quantitative Impacts, How Blocks Form | Tags: mev, mitigation, batch-auctions, encrypted-mempool, private-orderflow, design

Every defence against ordering-based extraction attacks one of three necessary ingredients: the **order-dependence** that makes sequence matter, the **discretion** someone holds over sequence, or the **information** an extractor needs to build a profitable sequence around a target. Remove any one and the opportunity vanishes. None can be removed for free.

That is the discipline this page tries to impose. A defence is not evaluated on whether it stops sandwiching — many do — but on what it costs to stop it, and on where the extraction reappears afterwards. Almost every mechanism below relocates discretion rather than destroying it, and the relocation is the substance of the design choice.

---

#### User-Level: the Slippage Limit

The minimum-output parameter is a hard bound on loss, and the only defence that requires no infrastructure at all. With a tolerance `s`, the worst achievable outcome is exactly:

```text
max_ordering_loss = s * quoted_out
```

Using the constructed pool from [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts) — 10,000,000 USDC and 5,000 ETH at a mid of 2,000, with a 100,000 USDC swap quoting 49.3579 ETH:

<table>
  <tbody>
    <tr><td><strong>Tolerance</strong></td><td><strong>Maximum loss (ETH)</strong></td><td><strong>Maximum loss (USDC at mid)</strong></td></tr>
    <tr><td>0.1%</td><td>0.0494</td><td>98.7</td></tr>
    <tr><td>0.5%</td><td>0.2468</td><td>493.6</td></tr>
    <tr><td>1.0%</td><td>0.4936</td><td>987.2</td></tr>
    <tr><td>2.0%</td><td>0.9872</td><td>1,974.3</td></tr>
    <tr><td>5.0%</td><td>2.4679</td><td>4,935.8</td></tr>
  </tbody>
</table>

The extractor in that worked example took 0.9664 ETH — 97.9% of what a 2% tolerance authorised. Extraction sizes itself to the budget, so the table is close to a schedule of what each setting actually costs when a pool is contested.

The trade-off is real and runs the other way. A tolerance tight enough to be safe is also tight enough to revert on ordinary volatility, and a revert costs gas while leaving the user unfilled and still exposed. The expected cost of a setting is roughly:

```text
E[cost] = P(revert) * (gas + cost_of_being_unfilled)
        + (1 - P(revert)) * E[ordering_loss | filled]
```

Tightening `s` reduces the second term and raises the first. There is no setting that makes both small in a volatile market, which is the honest answer to "what tolerance should I use": it depends on how badly a failed fill hurts you.

> warning **A wide tolerance is an authorisation, not a safety margin** Users typically widen the setting after a trade fails, treating it as a reliability knob. Mechanically it is a signed permission slip for up to that fraction of the trade.

---

#### User-Level: Private Orderflow

Sending a transaction directly to one or more builders rather than to a public node removes the information ingredient. Nobody can sandwich a transaction they cannot see before it executes.

What it costs:

- **A trust substitution, not a trust removal.** The builders receiving the flow can see it. The user has swapped a public exposure for a bilateral one, and the guarantee rests on the recipient's incentives and reputation.
- **Weaker inclusion guarantees.** A transaction that never enters the public mempool is included only if the builders you sent it to win a block. Redundancy across builders helps and reintroduces exposure proportionally.
- **A collective cost.** The public mempool is a shared resource that makes the ordering market contestable — a new builder can compete because it can see the same flow. As flow migrates to private channels, incumbency becomes self-reinforcing, and the network's censorship resistance depends on fewer parties.

Back-running survives private orderflow entirely. Once the transaction executes, its effect is public, and the opportunity to trade immediately afterwards is open to whoever holds the next position.

---

#### Venue-Level: Batch Auctions

A **batch auction** collects orders over an interval and clears them together at a single uniform price. Within a batch there is no sequence, so there is no sequence to sell — this attacks order-dependence directly and is the only category on this page that does so.

What it costs:

- **Latency by construction.** Users wait for the batch. Making batches short reduces the wait and reduces the number of orders that meet each other, which is the whole benefit.
- **The clearing problem moves upstream.** Someone must compute the clearing price and the routing that achieves it. That party — solver, auctioneer, or matching engine — now holds discretion, and competition among solvers becomes the mechanism keeping them honest.
- **Cross-batch extraction remains.** The price at which batch `n` cleared and the price at which batch `n+1` will clear are still different, and arbitrage between the batch and outside venues is untouched.
- **Uniform pricing has distributional effects.** Everyone in the batch gets the same price, which helps the orders that would have been sequenced last and slightly penalises the ones that would have been first.

Closely related are **intent-based** systems, where the user signs a desired outcome and constraints rather than a specific call, and solvers compete to satisfy it. The user is protected by competition among solvers rather than by ordering rules, which is a different trust model with a different failure mode: collusion or thin solver competition rather than sandwiching.

---

#### Cryptographic: Encrypted Mempools and Commit-Reveal

If transaction contents are hidden until the ordering is already fixed, an assembler must commit to a sequence without knowing what it is sequencing. **Threshold encryption** is the usual construction: users encrypt to a committee key, the assembler orders ciphertexts, and the committee decrypts only after the ordering is committed.

What it costs:

- **A liveness dependency.** If the decryption committee fails or stalls, transactions cannot execute. The chain has acquired a new party whose failure is a halt.
- **Ordering garbage.** An assembler that cannot read a transaction cannot check whether it is valid, well-funded, or spam. Blocks must be paid for before their contents are known, which requires a separate anti-spam mechanism.
- **Metadata leaks.** Sender, gas limit, and size are typically still visible. Where a protocol has few users, the metadata alone can be highly identifying.
- **Back-running is untouched.** Encryption delays information; it does not delete it. Once decrypted and executed, the state change is public and the next position is valuable.

Application-level **commit-reveal** achieves something similar without new infrastructure: the user commits to a hash in one transaction and reveals in a later one. It costs a second transaction, a second block of latency, and creates a griefing surface where users can decline to reveal.

---

#### Protocol-Level: Internalising the Auction

Rather than preventing extraction, a protocol can capture it and redirect the proceeds. Recurring patterns:

- **Auction the right to be first.** If the value of trading first against a pool is going to be paid to someone, the pool can sell it and route the proceeds to its liquidity providers. This converts an external transfer into revenue, and does not reduce the amount extracted.
- **Auction-based liquidations.** Rather than a fixed bonus paid to whoever arrives first, run a descending auction that discovers the smallest bonus someone will accept. The borrower pays less; the mechanism is slower, which is a real risk in fast markets. See [Lending Architecture](/protocols/lending-architecture).
- **Oracle-referenced quoting.** A venue that quotes against an external price rather than its own reserve ratio has less stale price to arbitrage. It has, in exchange, a full dependency on the oracle — see [Oracle Designs](/protocols/oracle-designs) and [Oracle Manipulation](/risk/oracle-manipulation).
- **Fee structures that price toxicity.** Dynamic fees that widen with realised volatility charge arbitrageurs more in exactly the moments they profit most, transferring some of the loss-versus-rebalancing back to providers.

---

#### Base-Layer Changes

**Proposer-builder separation** separates ordering discretion from the right to propose, which limits how much extraction infrastructure a validator needs to run. It addresses centralisation pressure, not the extraction itself.

**Inclusion lists** let a proposer require that specified transactions appear in the block it accepts. This is a censorship remedy, and only that: it constrains what may be excluded, not how what remains is ordered.

**Fast finality** removes the class of extraction that depends on re-proposing past blocks. It is a genuine elimination rather than a relocation, of a category that is structurally available rather than commonly exercised.

**Enforced ordering rules** — first-come-first-served with verifiable timestamps, or randomised sequencing — attack discretion directly. Every proposal in this family shares a problem: the rule's inputs become the new target. Timestamp-based ordering turns into a latency race, which is centralising in a familiar way; randomised ordering can be attacked by submitting many transactions to buy more draws.

---

#### What Each Defence Actually Removes

<table>
  <tbody>
    <tr><td><strong>Defence</strong></td><td><strong>Ingredient attacked</strong></td><td><strong>Principal cost</strong></td></tr>
    <tr><td>Slippage limit</td><td>Bounds the loss rather than removing an ingredient</td><td>Reverts during volatility; gas spent for no fill</td></tr>
    <tr><td>Private orderflow</td><td>Information</td><td>Bilateral trust; weaker inclusion; erodes the public mempool</td></tr>
    <tr><td>Batch auction</td><td>Order-dependence within the batch</td><td>Latency; discretion moves to the solver or auctioneer</td></tr>
    <tr><td>Encrypted mempool</td><td>Information</td><td>Liveness dependency; must pay to order unreadable content</td></tr>
    <tr><td>Commit-reveal</td><td>Information</td><td>Two transactions; latency; non-revealing griefers</td></tr>
    <tr><td>Internalised auction</td><td>Redirects proceeds; removes nothing</td><td>Complexity; the auction is itself an ordering contest</td></tr>
    <tr><td>Proposer-builder separation</td><td>Centralisation pressure, not extraction</td><td>New intermediaries; builder concentration</td></tr>
    <tr><td>Inclusion lists</td><td>Censorship, not ordering</td><td>Block-space overhead; no effect on extraction</td></tr>
    <tr><td>Fast finality</td><td>Discretion over past blocks</td><td>Consensus complexity and stronger liveness assumptions</td></tr>
  </tbody>
</table>

---

#### Assumptions and Failure Modes

- **Defences are assumed to compose.** They often do not. Private orderflow and encrypted mempools both hide information from the public, and stacking them adds trust assumptions without adding protection.
- **Relocated discretion is assumed to be better behaved.** A solver, sequencer, or committee that inherits ordering power is a smaller and more identifiable set of parties than an open builder market. Whether that is an improvement depends on which failure you are more worried about.
- **Users are assumed to configure correctly.** Every user-level defence depends on a setting most users never change, and the default is chosen by an interface with its own incentives.
- **Beneficial extraction is suppressed alongside harmful.** A mechanism that stops sandwiching may also delay the arbitrage that keeps a pool aligned and the liquidation that keeps a lending market solvent. Latency added for fairness is latency added to the solvency machinery.
- **Extraction migrates.** Suppressing one strategy raises the return to the next, and activity moves rather than stopping. Evaluations that measure only the targeted category will report a success that the aggregate does not support.
- **Nothing here is a fix.** Every mechanism above trades one property for another. A defence presented without its cost has had its cost omitted, not eliminated.

---

#### Code

```python
def min_output(quoted_out, tolerance):
    """Minimum acceptable output encoded in a swap.

    This value is the extractor's budget as well as the user's floor:
    the difference between the quote and this number is exactly what
    an adverse ordering is permitted to take.
    """
    return quoted_out * (1 - tolerance)


def expected_cost(quoted_out, tolerance, revert_prob, gas_cost,
                  unfilled_cost, expected_loss_if_filled):
    """Compare tolerance settings on total expected cost, not on worst case.

    Tightening the tolerance moves cost from the second term to the first.
    """
    authorised = quoted_out * tolerance  # worst case if filled
    loss = min(expected_loss_if_filled, authorised)
    return revert_prob * (gas_cost + unfilled_cost) + (1 - revert_prob) * loss
```

---

#### See Also

* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts)
* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms)
* [Slippage & Frontrunning](/risk/slippage-frontrunning)
* [Oracle Designs](/protocols/oracle-designs)

---

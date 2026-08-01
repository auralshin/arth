### MEV Taxonomy

> info **Metadata** Level: Advanced | Prerequisites: How Blocks Form, AMMs 101, Liquidations | Tags: mev, taxonomy, arbitrage, liquidations, sandwiching, jit-liquidity

"MEV" names a mechanism, not a strategy. The strategies that exploit it differ enormously in what they require, who pays for them, and whether the market is better or worse for their existence. Lumping them together produces the two most common errors in the field: treating all extraction as theft, and treating all extraction as a healthy price-discovery service.

This page separates them. The organising question for each category is not "is this good or bad" but three narrower ones with answerable forms: does it settle atomically on-chain, what capability does the extractor need that an ordinary participant lacks, and whose balance sheet does the value come out of.

---

#### Two Axes That Do Most of the Work

**Atomicity.** An **atomic** strategy succeeds or fails entirely within one transaction. If the profit condition does not hold at execution time, the whole thing reverts and the extractor loses only gas. This makes atomic extraction close to risk-free in the market-risk sense, which is why it can be capitalised with a flash loan and why competition for it is fierce. A **non-atomic** strategy has at least one leg that settles somewhere the chain cannot see — another venue, another chain, a later block. It carries inventory risk, needs real capital, and behaves far more like market making than like arbitrage.

**Incidence.** Value has to come from somewhere. Sometimes it comes from a specific user's fill price, sometimes from liquidity providers who were holding a stale quote, sometimes from a borrower whose position was priced for liquidation by protocol rule. These are different harms and different policy questions, and a mitigation that helps one may do nothing for another.

<table>
  <tbody>
    <tr><td><strong>Form</strong></td><td><strong>Atomic</strong></td><td><strong>Capability required</strong></td><td><strong>Incidence</strong></td></tr>
    <tr><td>DEX-DEX arbitrage</td><td>Yes</td><td>Pool state, capital or a flash loan, position ahead of rivals</td><td>Liquidity providers on the stale pool</td></tr>
    <tr><td>CEX-DEX arbitrage</td><td>No</td><td>Inventory on both venues, a fast off-chain price, top-of-block position</td><td>Liquidity providers on the stale pool</td></tr>
    <tr><td>Liquidation</td><td>Yes</td><td>Position monitoring, repayment capital, first position after the price update</td><td>The liquidated borrower, by protocol rule</td></tr>
    <tr><td>Sandwiching</td><td>Yes</td><td>Sight of the target swap and its slippage limit</td><td>The swapping user, directly</td></tr>
    <tr><td>JIT liquidity</td><td>Yes</td><td>A concentrated-liquidity pool and a large visible swap</td><td>Passive providers in that pool</td></tr>
    <tr><td>Back-running</td><td>Yes</td><td>Sight of a state change worth trading immediately after</td><td>Usually diffuse; competes mainly with other back-runners</td></tr>
    <tr><td>Oracle-update racing</td><td>Yes</td><td>Knowing when a price update lands</td><td>Whoever holds the stale side of the update</td></tr>
    <tr><td>Cross-domain</td><td>No</td><td>Presence on two domains and capital to warehouse the bridging risk</td><td>Varies by leg</td></tr>
  </tbody>
</table>

---

#### Arbitrage: the Two Kinds Are Barely the Same Trade

**DEX-DEX arbitrage** buys an asset in one on-chain pool and sells it in another within a single transaction. Because both legs settle atomically, the extractor never holds a position and needs no capital of its own — a flash loan supplies the notional and is repaid inside the same transaction. See [Flash Loans](/case-studies/flash-loan). The barrier to entry is therefore not capital but position: the profit goes entirely to whoever executes first, and everyone else reverts. That is a pure ordering contest, and its proceeds flow to whoever controls ordering.

**CEX-DEX arbitrage** buys on-chain and sells on a centralised venue, or the reverse. It cannot be atomic — no transaction can guarantee the off-chain leg — so the extractor holds inventory, bears price risk between legs, and must fund both sides. The barriers are real: exchange accounts, inventory in the right places, and a price feed faster than the pool's. This is the category where competition is least able to dissipate rent, because entry is genuinely hard.

Both categories take from the same place. A pool quoting a price the wider market has moved away from is offering someone a trade at a stale price, and the liquidity provider is on the other side of it. That structural cost to providers — the gap between holding the pool position and continuously rebalancing at the true price — is what practitioners call **loss-versus-rebalancing (LVR)**. It is distinct from [impermanent loss](/building-blocks/impermanent-loss), which compares against simply holding the assets. Impermanent loss can reverse when the price returns; LVR cannot, because it is a realised transfer to whoever arbitraged.

---

#### Liquidations: a Fee the Protocol Advertises

Lending protocols pay a bonus to whoever repays an undercollateralised borrower's debt. This is a designed incentive, not a leak — without it, bad debt accumulates and depositors lose. But because only the first liquidation in a block succeeds, the bonus is contested by ordering, and the contest hands most of it to whoever sequences the block.

**A constructed example.** A borrower deposits 40 ETH at 2,000 USD and borrows 60,000 USDC. The market uses a liquidation threshold of 80% and a close factor of 50%, with a 5% liquidation bonus. All parameters are chosen for the illustration.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>At 2,000 per ETH</strong></td><td><strong>At 1,800 per ETH</strong></td></tr>
    <tr><td>Collateral value</td><td>80,000</td><td>72,000</td></tr>
    <tr><td>Maximum debt at 80% threshold</td><td>64,000</td><td>57,600</td></tr>
    <tr><td>Outstanding debt</td><td>60,000</td><td>60,000</td></tr>
    <tr><td>Health factor</td><td>1.067</td><td>0.960</td></tr>
  </tbody>
</table>

1. **The position becomes liquidatable** when the health factor `57,600 / 60,000 = 0.96` falls below 1. Nothing happens automatically; someone must send a transaction.
2. **Repayment.** The close factor caps repayment at 50% of the debt: `0.50 * 60,000 = 30,000` USDC.
3. **Collateral seized.** The liquidator receives collateral worth `30,000 * 1.05 = 31,500` USD, which at 1,800 per ETH is `31,500 / 1,800 = 17.5` ETH.
4. **Gross profit**, assuming the seized ETH can be sold at 1,800: `31,500 - 30,000 = 1,500` USD.
5. **Where it ends up.** If competing searchers bid 90% of the expected profit for the ordering position, the searcher keeps `1,500 * 0.10 = 150` and `1,350` flows to the block producer.

Step 5 is the point. The protocol set the bonus at a level it judged sufficient to attract liquidators. Ordering competition converts most of that bonus into a payment to whoever controls the block, while the borrower pays the full 5% regardless. The protocol is buying a service at 5% and the service provider is netting a fraction of it — the rest is the price of being first.

---

#### Sandwiching: the One That Takes Directly From a User

A sandwich places a buy immediately before the target swap and a sell immediately after. The front-run moves the pool price against the target, the target trades at the worsened price, and the back-run sells into the price the target itself pushed up. The extractor's inventory exposure is one block long and, in a single-block sandwich, effectively zero.

Three conditions must hold together, and every user-level defence attacks one of them:

- **The extractor must see the swap** before it executes. Private orderflow removes this.
- **The swap must have room to move.** The user's minimum-output parameter is a hard bound on how much can be taken. It is best understood as the extractor's budget: a 2% tolerance authorises up to 2% of loss and nothing more.
- **The extractor must control the two adjacent positions.** Bundles provide this; without them, a rival could interleave and break the sandwich.

[Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts) works a complete sandwich through the constant-product formulas, including where the money goes.

> warning **Sandwiching is not made possible by a bug** Every ingredient — a public mempool, a user-set slippage limit, atomic bundles — is a deliberate design decision that is useful for other reasons. That is why the mitigations in this section are all trade-offs rather than fixes.

---

#### JIT Liquidity and the Long Tail

**Just-in-time liquidity** applies to concentrated-liquidity automated market makers. Seeing a large pending swap, the extractor mints a very tight liquidity position immediately before it, collects most of the swap's fee, and burns the position immediately after. The extractor bears the pool's inventory risk for one transaction rather than continuously. The swapper is marginally better off — there is more depth at the moment they trade — and the passive providers are worse off, having been diluted for exactly the one trade that would have paid them. See [Concentrated Liquidity](/protocols/concentrated-liquidity).

The long tail is where new surfaces appear as protocols are built:

- **Back-running.** Trading immediately after a state change that predictably moves something: a large swap, an oracle update, a governance execution, a vault rebalance. It takes nothing from the transaction it follows.
- **Generalised extraction.** Rather than modelling any protocol, simulate every pending transaction with the sender's address substituted, and submit any that turn a profit. This works on protocols the extractor has never seen, which is why novel launches are contested immediately.
- **Oracle-update racing.** Where a price feed updates on-chain at discrete moments, the position immediately before and immediately after that update are both valuable. See [Oracle Manipulation](/risk/oracle-manipulation) and [Oracle Designs](/protocols/oracle-designs).
- **Auction and mint sniping.** Any first-come allocation implemented on-chain — a mint, a whitelist, a Dutch auction crossing a threshold — is an ordering contest by construction.
- **Cross-domain extraction.** Opportunities spanning two chains cannot settle atomically, so the extractor warehouses risk across a bridge or a messaging delay. This looks far more like inventory-based market making than like arbitrage. See [Bridges](/protocols/bridges) and [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms).
- **Reordering across blocks.** Where finality is probabilistic, re-proposing a past block to capture a missed opportunity is structurally available. It is heavily disincentivised rather than impossible, and its main significance is as an argument for fast finality.

---

#### Barriers to Entry Decide Who Keeps the Money

Which category an actor can run is settled by what it can obtain, not by what it can think of. The strategies are widely documented; the capabilities are not evenly distributed.

<table>
  <tbody>
    <tr><td><strong>Barrier</strong></td><td><strong>Which categories it gates</strong></td><td><strong>How binding it is</strong></td></tr>
    <tr><td>Working capital</td><td>CEX-DEX arbitrage, cross-domain, large liquidations</td><td>Hard. Atomic strategies route around it with flash loans; non-atomic ones cannot.</td></tr>
    <tr><td>Off-chain venue access</td><td>CEX-DEX arbitrage</td><td>Hard. Accounts, inventory, and credit are relationship-dependent.</td></tr>
    <tr><td>Low-latency infrastructure</td><td>All of them, as a qualifying condition</td><td>Moderate. Enough to reach the deadline is necessary; being fastest is not decisive.</td></tr>
    <tr><td>Builder relationships</td><td>Anything needing top-of-block position</td><td>Moderate to hard. The first position in a block is scarce and allocated commercially.</td></tr>
    <tr><td>Protocol-specific modelling</td><td>Liquidations, JIT liquidity, oracle racing</td><td>Soft. Once one party solves a protocol, imitation is fast.</td></tr>
    <tr><td>Sight of pending transactions</td><td>Sandwiching, generalised extraction</td><td>Soft and shrinking, as flow migrates to private channels.</td></tr>
  </tbody>
</table>

The pattern: **soft barriers get competed away and the rent flows to whoever sequences the block; hard barriers keep the rent with the extractor.** This is why atomic on-chain arbitrage is largely bid away as payment for position while CEX-DEX arbitrage sustains a margin — not because one is more sophisticated, but because one has an entry requirement that money alone cannot satisfy quickly.

---

#### Code

```python
def classify_bundle(transactions, victim_index=None):
    """Sketch of a rule-based label for a group of same-block transactions.

    Deliberately conservative: it returns 'unclassified' rather than
    guessing, because a permissive classifier inflates measured
    incidence far more than a strict one deflates it. See the
    base-rate arithmetic in Statistical Modeling.

    Each transaction is a dict with 'sender', 'pool', 'side', 'kind'.
    """
    senders = {tx["sender"] for tx in transactions}
    pools = {tx["pool"] for tx in transactions}

    if any(tx["kind"] == "liquidate" for tx in transactions):
        return "liquidation"
    if len(senders) == 1 and len(pools) > 1:
        return "dex-dex arbitrage"
    if victim_index is not None and len(transactions) == 3:
        first, last = transactions[0], transactions[-1]
        same_party = first["sender"] == last["sender"]
        opposed = first["side"] != last["side"]
        same_pool = first["pool"] == last["pool"] == transactions[1]["pool"]
        if same_party and opposed and same_pool:
            return "sandwich"
    return "unclassified"
```

---

#### Assumptions and Failure Modes

- **The categories are not disjoint.** A single bundle can liquidate a position, arbitrage the resulting price dislocation, and back-run an oracle update. Classification schemes that force one label per bundle will misattribute the value.
- **Atomicity is assumed to imply risk-free.** It removes market risk between legs, not all risk: a bundle can lose the auction, revert on state that moved, or be built on a protocol assumption that fails.
- **"Beneficial" is doing heavy lifting.** Arbitrage aligns prices and liquidations preserve solvency, but neither justifies the *size* of the transfer, which is set by ordering competition rather than by the cost of providing the service.
- **Requirements shift with infrastructure.** A category that needs a rare capability today can become commoditised, and the rent moves accordingly. Any statement about who can capture what is a statement about the current state of the tooling.
- **Incidence is often indirect.** Providers harmed by arbitrage rarely observe it as a loss; they observe a lower yield than they expected and usually attribute it to something else. See [The LP Business](/strategies/lp-business).

---

#### See Also

* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts)
* [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses)
* [Liquidations](/building-blocks/liquidations)
* [Concentrated Liquidity](/protocols/concentrated-liquidity)

---

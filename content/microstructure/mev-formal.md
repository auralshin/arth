### MEV, Formally

> info **Metadata** Level: Advanced | Prerequisites: Gas and the Mempool, AMMs 101, The Economics of Transaction Ordering | Tags: mev, ordering, optimisation, combinatorics, microstructure, defi

**Maximal extractable value (MEV)** is usually introduced through its symptoms — sandwiches, liquidation races, arbitrage bots. This page introduces it through its structure. Blockchain execution is a deterministic state machine applied to a sequence, whoever assembles the block chooses the sequence, and the value of the sequence is not the sum of the values of its parts. Everything else follows from those three sentences.

[The Economics of Transaction Ordering](/transaction-ordering-mev/ordering-economics) defines extractable value against a reference ordering and traces who ends up holding it. This page is its formal complement and does not repeat it. Here the questions are: what kind of optimisation problem is block building, why does the objective fail to decompose, where does the value come from when value is conserved, and is there a criterion — not a sentiment — that separates arbitrage which improves prices from extraction which degrades a user's fill.

---

#### The State Machine and Why Sequence Matters

Write `delta` for the deterministic state transition applied by one transaction:

```text
s' = delta(s, t)
```

An **ordering** `pi = (t_1, ..., t_n)` is applied by composition, so the state a transaction reads is a function only of the prefix before it:

```text
s_i = delta(s_{i-1}, t_i),     s_0 = the state at the start of the block
```

Two transactions **commute** at `s` when the order in which they are applied does not matter:

```text
delta(delta(s, t_1), t_2)  =  delta(delta(s, t_2), t_1)
```

Transactions touching disjoint state always commute — two unrelated transfers, two swaps in unrelated pools. Transactions touching shared state generally do not: any two swaps against the same pool read and write the same reserves, so each changes the price the other receives.

This is the whole source of the phenomenon. If every pair commuted, the block's outcome would be a function of the *set* of transactions and the assembler's discretion would be worth nothing. Extraction exists exactly to the extent that the pending set contains non-commuting pairs. Parallel-execution designs exploit the same fact from the other direction: transactions provably touching disjoint state can be run concurrently precisely because they commute. See [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms).

---

#### Block Building as a Combinatorial Problem

The assembler chooses an ordering `pi` from the admissible set `A` — the sequences satisfying the block gas limit, per-account nonce monotonicity, the base-fee floor, and validity at execution time, enumerated in [How Blocks Form](/transaction-ordering-mev/how-blocks-form). It solves:

```text
maximise   V(pi, s_0)     over pi in A
```

where `V` is its own payoff: priority fees received, plus the profit of any transaction it authored or was paid to place. Two structural properties make this hard in a way that ordinary packing is not.

**The objective does not decompose.** There is no per-transaction value function `v` for which `V(pi) = sum of v(t) over t in pi`. If there were, `V` would depend only on the set and not on the order, and the worked example below is a counterexample. Block building is therefore not a knapsack problem with a sequencing afterthought; it is a sequencing problem whose objective happens to be constrained by capacity. The packing example in [How Blocks Form](/transaction-ordering-mev/how-blocks-form) shows the practical consequence: ranking by value per unit of gas gives the wrong answer as soon as candidates conflict.

**The search space is not enumerable.** Choosing which of 200 candidate transactions to include is a choice among `2^200` subsets. Ordering just 20 of them is a choice among `20!`, about `2.4 x 10^18` sequences. Real assemblers do not search this space; they run heuristics over a small number of high-value candidates — bundles whose internal order is already fixed by their author — and treat the remaining transactions as a nearly separable filler problem where density ranking is close enough. The gap between the heuristic and the true maximum is unobservable, which matters for measurement: any empirical estimate of realised extraction is a lower bound on what was available. See [Statistical Modeling](/transaction-ordering-mev/statistical-modeling).

> info **The bundle is the unit of optimisation** A bundle fixes its own internal order and is atomic, which collapses many sequencing decisions into one placement decision. That is why the market organised itself around bundles rather than around individual transactions.

---

#### Worked Example: The Same Two Trades, Two Orders

An illustrative constant-product pool with the fee set to zero, so that value conservation is exact and the arithmetic is visible. External reference price: 2,000 quote per base.

<table>
  <tbody>
    <tr><td><strong>Item</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Pool reserves</td><td>1,000 base and 2,000,000 quote</td></tr>
    <tr><td>Invariant k</td><td>2,000,000,000</td></tr>
    <tr><td>Pool price</td><td>2,000</td></tr>
    <tr><td>Transaction a</td><td>Spend 100,000 quote to buy base</td></tr>
    <tr><td>Transaction b</td><td>Sell 40 base for quote</td></tr>
  </tbody>
</table>

Apply both, then let an arbitrageur restore the pool to the external price and close out against the external market.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Order (a, b)</strong></td><td><strong>Order (b, a)</strong></td></tr>
    <tr><td>Base received by a</td><td>47.619048</td><td>51.406844</td></tr>
    <tr><td>Quote received by b</td><td>84,644.91</td><td>76,923.08</td></tr>
    <tr><td>Pool price after both</td><td>2,030.83</td><td>2,046.42</td></tr>
    <tr><td>a's result versus the external price</td><td>-4,761.90</td><td>+2,813.69</td></tr>
    <tr><td>b's result versus the external price</td><td>+4,644.91</td><td>-3,076.92</td></tr>
    <tr><td>Terminal arbitrage profit</td><td>116.99</td><td>263.23</td></tr>
    <tr><td>Sum</td><td>0.00</td><td>0.00</td></tr>
  </tbody>
</table>

Three results, each of which generalises.

1. **The same set of transactions has two different values.** No per-transaction accounting can produce both columns, which is the counterexample promised above.
2. **The block is exactly zero-sum.** The pool begins and ends at the external price with `k` unchanged, so its value is unchanged, and every gain is someone else's loss. Reinstating the fee would add one positive term accruing to liquidity providers and make the sum negative by exactly the fee — it would not create the surplus the assembler is competing for.
3. **The assembler's take is the aggregate deviation of user fills from the reference price.** In order `(a, b)` the users lost `4,761.90 - 4,644.91 = 116.99` between them; in order `(b, a)`, `3,076.92 - 2,813.69 = 263.23`. Those are precisely the two arbitrage profits.

The last point is the formal core. **Maximising extractable value means selecting the ordering that maximises how far user fills sit from the external price.** Note also what it does *not* mean: order `(b, a)` is the assembler-preferred one and it makes `a` better off by 7,575.59 while making `b` worse off by 7,721.84. Extraction is not uniformly hostile to users; it is hostile to whichever user the profitable ordering happens to disadvantage.

Permitting the assembler to insert its own transactions strictly enlarges `A` and can only raise the maximum — that is the sandwich case, computed in full in [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts).

---

#### Where the Value Comes From

Value is conserved, so extractable value is never created by the ordering. It is located by it. Every unit of it is a transfer from an identifiable counterparty, and naming that counterparty is more useful than naming the strategy.

<table>
  <tbody>
    <tr><td><strong>Source</strong></td><td><strong>Mechanism</strong></td><td><strong>Benchmark that reveals it</strong></td></tr>
    <tr><td>Traders</td><td>Fills land away from the external price because the ordering put other flow first.</td><td>The same trades under a different admissible ordering.</td></tr>
    <tr><td>Liquidity providers</td><td>A passive curve quotes a price the market has left; the correcting trade takes the difference.</td><td>A portfolio rebalanced continuously at the external price — loss-versus-rebalancing.</td></tr>
    <tr><td>Liquidated borrowers</td><td>Collateral is sold at a protocol-set discount to whoever wins the race to call the function.</td><td>The collateral's mark at the moment of liquidation.</td></tr>
    <tr><td>Rival extractors</td><td>Losing bundles revert or lose the auction and still pay gas.</td><td>None. This is dissipation, not transfer, and it is a real social cost.</td></tr>
  </tbody>
</table>

The second row is the one most often miscounted. A backrunning arbitrage that touches no user transaction still has positive value; by conservation, someone paid for it, and that someone is the liquidity provider. See [Impermanent Loss](/building-blocks/impermanent-loss) and [LP as a Business](/strategies/lp-business), where the same quantity appears as an inventory cost rather than as an extraction.

---

#### The Boundary: Position, Not Intention

Let `q(u, pi)` be the output user `u` realises under ordering `pi`. Let `X` be the set of transactions the assembler or a searcher inserted, and let `pi minus X` be the same ordering with those transactions deleted. Define:

```text
extraction(u) = q(u, pi minus X) - q(u, pi)
```

Because execution is sequential and deterministic, `q(u, pi)` depends only on the prefix of `pi` before `u`. That yields a criterion rather than a judgement:

- **An inserted transaction placed strictly after `u` cannot change `q(u, ·)`.** The prefix `u` reads is identical either way, so `extraction(u) = 0` exactly. A pure backrun is non-extractive with respect to every user in the block, by construction, whatever its author intended.
- **An inserted transaction placed before `u` changes the prefix and therefore changes the fill.** For a constant-product pool the output is monotone in the pre-trade reserves, so a same-direction insertion before `u` makes `u` strictly worse off. Extraction is positive, and it is bounded above by `u`'s stated slippage tolerance, because beyond that the transaction reverts and the extraction fails with it.
- **Pure reordering, with `X` empty, falls outside the criterion.** No insertion happened, so there is nothing to delete, and the comparison must be made against a reference ordering that the protocol does not define. That choice is normative, and [The Economics of Transaction Ordering](/transaction-ordering-mev/ordering-economics) is where it is argued.

The price-improvement side of the boundary follows from the same positional argument. A backrun that moves the pool toward the external reference improves the fill of every user who trades against that pool *afterwards*, including in later blocks. So the operation is simultaneously costless to the users in its own block, beneficial to subsequent users, and paid for by liquidity providers. "Good MEV" and "bad MEV" are not categories of activity; they are statements about which counterparty a particular placement draws from.

> warning **Non-extractive with respect to users is not the same as costless** Conservation still applies. An operation that takes nothing from any trader in the block is taking it from someone, and for pool arbitrage that someone is the liquidity provider.

---

#### Assumptions and Failure Modes

- **Determinism is assumed.** The criterion above depends on `q(u, pi)` being a function of the prefix. Sources of non-determinism — block-level randomness, oracle updates landing mid-block, cross-domain messages — weaken it to a probabilistic statement.
- **The admissible set is assumed knowable.** Reconstructing `A` requires knowing what the assembler could see, including private orderflow that never appears in any public record. Every measured value is conditional on an observed subset.
- **Single-block scope.** The analysis takes the pending flow as given. Over longer horizons a venue known to be extractable loses uninformed flow, which changes the pool's economics entirely — a first-order effect that no per-block model can see. See [Adverse Selection](/execution/adverse-selection).
- **One numeraire is assumed.** Extraction spanning several assets must be valued at some price, and the price moves within the block. Pre-block mid, post-block mid, and an external reference give different answers for the same block.
- **Zero fees in the worked example.** The fee is set to zero so that conservation is exact. With fees, the pool retains a positive term and the arbitrage deadband widens, which reduces both the frequency and the size of the correcting trade.
- **The maximum is assumed to be attained.** It is not. Assemblers run heuristics over an intractable space, so realised extraction understates available extraction by an unknown and probably time-varying margin.
- **Roles are assumed distinct.** Searcher, builder, and proposer are functions, not necessarily separate parties. Vertical integration makes the internal transfers unobservable without changing any quantity computed here.

---

#### Code

```python
import math
from itertools import permutations


def constant_product_swap(x, y, amount_in, base_in):
    """Zero-fee constant-product swap. Returns new reserves and output.

    base_in=True means the trader sells base and receives quote.
    """
    k = x * y
    if base_in:
        x_new = x + amount_in
        y_new = k / x_new
        return x_new, y_new, y - y_new
    y_new = y + amount_in
    x_new = k / y_new
    return x_new, y_new, x - x_new


def terminal_arbitrage(x, y, external_price):
    """Profit from restoring the pool to the external price.

    This is the assembler's residual: by conservation it equals the
    aggregate deviation of the block's fills from `external_price`.
    """
    k = x * y
    x_target = math.sqrt(k / external_price)
    y_target = math.sqrt(k * external_price)
    return (x - x_target) * external_price - (y_target - y)


def best_ordering(x, y, pending, external_price):
    """Exhaustive search over orderings of a tiny pending set.

    Enumeration is only tractable here because `pending` is tiny; the
    real space is factorial and assemblers use heuristics instead.
    """
    best = None
    for order in permutations(range(len(pending))):
        rx, ry = x, y
        for i in order:
            amount_in, base_in = pending[i]
            rx, ry, _ = constant_product_swap(rx, ry, amount_in, base_in)
        value = terminal_arbitrage(rx, ry, external_price)
        if best is None or value > best[1]:
            best = (order, value)
    return best
```

---

#### See Also

* [The Economics of Transaction Ordering](/transaction-ordering-mev/ordering-economics)
* [How Blocks Form](/transaction-ordering-mev/how-blocks-form)
* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts)
* [Gas and the Mempool](/microstructure/gas-mempool)
* [Impermanent Loss](/building-blocks/impermanent-loss)
* [Adverse Selection](/execution/adverse-selection)

---

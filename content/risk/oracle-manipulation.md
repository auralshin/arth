### Oracle Manipulation and Thin Liquidity

> info **Metadata** Level: Advanced | Prerequisites: Oracles, AMMs 101, Leverage and Liquidation Risk | Tags: risk, oracles, manipulation, liquidity-depth, flash-loans, collateral

A lending protocol cannot see a price. It can only see what a contract tells it, and every solvency decision it makes — how much you may borrow, whether you are liquidated, what your collateral is worth — dereferences that value. The oracle is the single point where an external fact enters a system that is otherwise deterministic, which makes it the highest-leverage thing in the system to attack.

The strategic insight behind oracle manipulation is that attacking a *position* is expensive while attacking the *measurement* of that position may be almost free. To profit from a fall in a collateral asset you must be short it, at scale, and be right. To profit from a protocol believing that asset is worth double, you need only move the venue the protocol happens to read — and if that venue is a thin pool, moving it round-trip costs little more than the trading fees. This page covers why that asymmetry exists, how the cost of manipulation scales with depth, and why thin collateral markets rather than exotic code are the recurring vulnerability.

---

#### The Shape of the Attack

Almost every oracle exploit follows the same five steps, differing only in which protocol sits at step four.

1. **Acquire capital without owning it.** A flash loan supplies arbitrarily large size within one transaction, repayable at the end. This removes the capital constraint that would otherwise make manipulation the preserve of the very wealthy.
2. **Move the reference price.** Trade against whatever venue the oracle reads, in the direction that helps.
3. **Transact against the victim at the wrong price.** Borrow against inflated collateral, mint against an inflated share price, or trigger a liquidation at a depressed one.
4. **Restore the price.** Reverse the trade from step two, recovering most of the capital deployed.
5. **Repay the loan and keep the difference.** Everything settles atomically, so a failure at any step reverts the whole transaction and costs only gas.

Step five is what makes the trade so attractive. The attempt is nearly free when it fails, because the transaction reverts. A conventional manipulation carries inventory risk between legs; an atomic one does not.

> warning **Atomicity removes the risk, not just the capital requirement** Because the whole sequence succeeds or reverts as a unit, there is no exposure between the manipulation and the extraction. Reasoning that requires an attacker to hold a position through time does not apply here.

---

#### The Cost of Moving a Constant-Product Price

For a pool holding reserves `x` of the collateral asset and `y` of the numeraire under the invariant `x * y = K`, the marginal price is `P = y / x`. Trading changes both reserves, so to move the price by a factor `k`:

```text
x_new = x / sqrt(k)                 reserve of the asset after the push
y_new = y * sqrt(k)                 reserve of the numeraire after the push
y_in  = y * (sqrt(k) - 1)           numeraire required to push the price
x_out = x * (1 - 1 / sqrt(k))       asset received while doing so
```

where `k` is the ratio of the manipulated price to the starting price. The capital required scales with the pool's reserves, so **depth is the only defence a spot price has**.

The critical quantity, though, is not the capital deployed but the **round-trip cost**. With no fees, a constant-product curve is perfectly reversible: push the price and reverse it, and you end where you started having paid nothing. The real cost is therefore the fees on both legs plus gas, and nothing else.

Take an illustrative pool: 1,000 units of collateral asset X against 2,000,000 of a stable numeraire, so the marginal price is 2,000. Assume a 0.30% fee on the input of each swap, and no other trader interferes within the block.

<table>
  <tbody>
    <tr><td><strong>Step</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Numeraire required to double the reported price</td><td>829,672</td></tr>
    <tr><td>Collateral asset received on the way up</td><td>292.58</td></tr>
    <tr><td>Reported price after the push</td><td>4,000</td></tr>
    <tr><td>Numeraire returned when the trade is reversed</td><td>826,153</td></tr>
    <tr><td>Net round-trip cost</td><td>3,519</td></tr>
  </tbody>
</table>

The round trip costs `829,672 - 826,153 = 3,519`, which is 0.18% of the pool's numeraire reserve. The capital requirement of 829,672 looks enormous and is irrelevant, because it is flash-borrowed and returned within the same transaction. What the attacker actually spends is 3,519.

Now the payoff. Suppose a lending market prices this collateral from that pool's spot price and applies an 80% collateral factor. The attacker deposits 100 units of X, genuinely worth 200,000:

1. **Honest borrow capacity**: `100 * 2,000 * 0.80 = 160,000`.
2. **Borrow capacity at the manipulated price**: `100 * 4,000 * 0.80 = 320,000`.
3. **Attacker's net**: `320,000 - 200,000 - 3,519 = 116,481`, abandoning the collateral.
4. **Bad debt left with the protocol**: `320,000 - 200,000 = 120,000`.

A cost of 3,519 produces a loss of 120,000, a ratio of roughly 34 to 1. Note honestly what the attack does still require: the 100 units of collateral are surrendered permanently, so real capital equal to the collateral is needed. Only the *price move* is free. All figures here are illustrative and chosen to make the arithmetic legible.

---

#### Why the Feed Design Changes the Cost Function

<table>
  <tbody>
    <tr><td><strong>Feed</strong></td><td><strong>Cost to manipulate</strong></td><td><strong>Weakness it introduces</strong></td></tr>
    <tr><td>Spot from one pool</td><td>Round-trip fees only; flash-loanable, single block</td><td>Effectively no defence beyond depth</td></tr>
    <tr><td>Time-weighted average over a window</td><td>Must be sustained across blocks, conceding arbitrage every block</td><td>Lags the true price, so it is stale in fast moves</td></tr>
    <tr><td>Median across independent reporters</td><td>Requires corrupting a majority of reporters</td><td>Reporter correlation; a median of feeds reading one thin venue is not diversified</td></tr>
    <tr><td>Threshold and heartbeat updates</td><td>Not directly manipulable</td><td>Wrong by design between updates, by up to the deviation threshold</td></tr>
  </tbody>
</table>

The **time-weighted average price (TWAP)** changes the cost function qualitatively rather than quantitatively. A flash loan lives inside one transaction, so it cannot influence an average spanning many blocks. To hold a manipulated average the attacker must hold the price across blocks with real capital, and in every intervening block arbitrageurs trade against the distorted pool and take the difference. The cost therefore accumulates roughly linearly with the window length, instead of being a one-off fee. That is the whole security argument, and it is a real one.

It is not free of cost to the protocol. A longer window is more expensive to attack and more wrong during genuine moves, which delays liquidations and lets positions become insolvent before the feed acknowledges the fall. Window length is a direct trade between manipulation resistance and staleness, with no setting that is good at both. See [Oracle Designs](/protocols/oracle-designs) for the construction details.

**Medianised reporter feeds** move the attack off-chain, to the reporters and their data sources. The median resists a minority of corrupted values well and correlated sources not at all — if every reporter derives its price from the same thin venue, the median inherits that venue's manipulability with extra steps. Diversity of sources, not count of reporters, is what the median is actually buying.

**Update policies** create a different exposure. A feed that refreshes on a heartbeat or a deviation threshold is a step function: between updates it is stale by up to the threshold, by design. That is not manipulation, but it is exploitable in the same way — trading against a protocol that is using a price the market has already left. The staleness is largest precisely during rapid moves.

---

#### Thin Collateral Markets Are the Vulnerability

The manipulation cost scales with the depth of the venue the oracle reads. The prize scales with how much can be borrowed against the asset. Those two quantities are set by different people, and nobody necessarily checks that one exceeds the other.

```text
manipulation_cost(k)  ~  2 * fee_rate * notional_traded(k, depth)
extractable(k)        ~  min(borrowable_liquidity, collateral * (k - 1) * CF)
```

An asset is dangerous as collateral when `extractable` exceeds `manipulation_cost` for any achievable `k`. Two levers make this true, and both are governance decisions rather than code defects:

- **Listing a thinly traded asset as collateral.** Depth is the denominator of the cost. A pool an order of magnitude smaller makes manipulation an order of magnitude cheaper while the collateral factor stays where it was.
- **Holding deep borrowable liquidity against it.** The prize is capped by what can actually be borrowed. A market with a small borrow cap is uneconomic to attack even with a manipulable feed.

This is why the recurring pattern is a long-tail asset listed against a deep stable market, rather than anything exotic in the code. It is also why supply caps, borrow caps and per-asset isolation are effective mitigations: they bound the prize directly, without requiring the oracle to be perfect. [Oracle Incident](/case-studies/oracle-incident) works through the pattern in a case-study form.

> info **The relevant depth is the venue the oracle reads** Aggregate liquidity across all venues is irrelevant if the feed observes one pool. An asset can be liquid overall and trivially manipulable through the specific market the protocol happens to price it from.

---

#### Assumptions and Failure Modes

- **Assumes the oracle's source is the price.** It is one venue's marginal price. In fragmented markets that is a sample, and the sample can be moved independently of the market it purports to represent.
- **Assumes deep liquidity persists.** Depth is not a constant. Liquidity providers withdraw during volatility, so the cost of manipulation falls exactly when the incentive to manipulate rises. See [Liquidity Cycles](/regimes-macro/liquidity-cycles).
- **Assumes a TWAP window is long enough.** Long enough for what depends on the attacker's capital, on how much arbitrage capital is actually watching, and on the fee tier. A window secure against a small attacker is not secure against a large one.
- **Assumes reporters fail independently.** Shared data sources, shared infrastructure and shared code make correlated failure far more likely than a count of reporters suggests.
- **Assumes staleness is safe.** A stale feed is a standing mispricing. It protects against manipulation and exposes the protocol to anyone willing to trade against a known-wrong price.
- **Assumes liquidations will occur promptly.** During the congestion that accompanies a large move, liquidation transactions compete for inclusion. A correct feed with delayed liquidation still produces bad debt. See [Simulating Liquidations and Cascades](/simulation/liquidations).
- **Assumes the attacker is external.** Governance can list an asset, raise a collateral factor, or change a feed. Where those powers are cheap to acquire, the oracle is only as strong as the vote protecting it.

> warning **Educational content only** This page explains a failure mechanism so it can be recognised and priced. It is not a description of any live vulnerability and not advice about any protocol or asset.

---

#### Code

```python
def _swap(reserve_in, reserve_out, amount_in, fee_rate):
    """Constant-product swap with the fee taken from the input."""
    effective = amount_in * (1 - fee_rate)
    amount_out = reserve_out * effective / (reserve_in + effective)
    return reserve_in + amount_in, reserve_out - amount_out, amount_out


def push_price_cost(reserve_asset, reserve_numeraire, price_ratio, fee_rate=0.003):
    """Round-trip cost of moving a constant-product price by `price_ratio`.

    Solved numerically rather than in closed form because the fee makes the
    round trip asymmetric: the reverse leg executes along a declining price,
    so charging the fee at the manipulated price overstates the cost.
    """
    low, high = 0.0, reserve_numeraire * 1000
    for _ in range(200):                      # bisect for the required input
        trial = (low + high) / 2
        asset, numeraire, _ = _swap(reserve_numeraire, reserve_asset, trial, fee_rate)
        if numeraire and asset / numeraire < price_ratio * reserve_numeraire / reserve_asset:
            low = trial
        else:
            high = trial

    numeraire_in = (low + high) / 2
    n1, a1, asset_out = _swap(reserve_numeraire, reserve_asset, numeraire_in, fee_rate)
    _, _, numeraire_back = _swap(a1, n1, asset_out, fee_rate)
    return {
        "capital_required": numeraire_in,     # flash-borrowed, so not a real cost
        "round_trip_cost": numeraire_in - numeraire_back,
        "asset_extracted": asset_out,
    }


def manipulation_safety_ratio(reserve_asset, reserve_numeraire, price_ratio,
                              borrowable, collateral, collateral_factor,
                              fee_rate=0.003):
    """Cost of the attack divided by what it extracts. Below 1 is unsafe.

    Borrowable liquidity and the collateral factor are both governance
    parameters, so this ratio is set by a vote rather than by the code.
    """
    cost = push_price_cost(reserve_asset, reserve_numeraire,
                           price_ratio, fee_rate)["round_trip_cost"]
    spot = reserve_numeraire / reserve_asset
    extractable = min(borrowable,
                      collateral * spot * (price_ratio - 1) * collateral_factor)
    return cost / extractable if extractable > 0 else float("inf")
```

---

#### See Also

* [Oracle Designs](/protocols/oracle-designs)
* [Oracle Incident](/case-studies/oracle-incident)
* [Oracles](/building-blocks/oracles)
* [Smart Contract and Protocol Risk](/risk/smart-contract)
* [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation)
* [Simulating Liquidations and Cascades](/simulation/liquidations)

---

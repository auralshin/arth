### Oracle Failure and Cascading Liquidations

> info **Metadata** Level: Advanced | Prerequisites: Lending Protocols, Liquidations, Oracles | Tags: case-study, oracles, liquidations, twap, circuit-breakers, defi-risk

A lending protocol has no independent knowledge of prices. Every solvency judgement it makes — whether a position is healthy, whether it can be liquidated, how much collateral a liquidator receives — is a function of a number handed to it from outside. That number is the protocol's entire connection to reality, and it is the smallest, most attackable surface in the system.

This page follows a bad price through to its consequences: which positions become liquidatable, how much value transfers, and how the resulting forced selling can push a false signal into a true one. It then examines the two standard defences and prices what each of them costs.

> info **A constructed example** The market size, parameters, and price behaviour below are chosen to illustrate the mechanism. This is not a report of a specific protocol, asset, or incident.

---

#### Setup: The Market and a Borrower

<table>
  <tbody>
    <tr><td><strong>Parameter</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Total collateral in token X</td><td>40,000,000</td></tr>
    <tr><td>Total borrows</td><td>22,000,000</td></tr>
    <tr><td>Liquidation threshold</td><td>82.5%</td></tr>
    <tr><td>Liquidation bonus to the liquidator</td><td>8%</td></tr>
    <tr><td>Close factor, the share of debt repayable in one liquidation</td><td>50%</td></tr>
    <tr><td>Price source</td><td>A median of feeds, published to the protocol on a heartbeat</td></tr>
  </tbody>
</table>

Health is measured as `HF = collateral_value * liquidation_threshold / debt`, and a position is liquidatable when `HF` falls below 1. Take a representative borrower with 500,000 of collateral and 350,000 of debt:

```text
HF_true = 500,000 * 0.825 / 350,000 = 1.179
```

Comfortable. The price at which this borrower becomes liquidatable is `350,000 / (500,000 * 0.825) = 84.85%` of the current level, a fall of 15.15%.

---

#### What Happens: A Bad Price

Suppose the published price comes in 18% below the prevailing market price. The cause does not matter for the mechanics: a stale feed that stopped updating, a thin venue dominating a median, a wrapper whose exchange rate was misread, or deliberate manipulation. What matters is that the protocol believes it.

<table>
  <tbody>
    <tr><td><strong>Measure</strong></td><td><strong>At the true price</strong></td><td><strong>At the published price</strong></td></tr>
    <tr><td>Collateral value</td><td>500,000</td><td>410,000</td></tr>
    <tr><td>Health factor</td><td>1.179</td><td>0.966</td></tr>
    <tr><td>Liquidatable</td><td>No</td><td>Yes</td></tr>
  </tbody>
</table>

Every position whose true health factor sits between 1.00 and 1.22 becomes liquidatable at the false price. The liquidation itself is not a bug — the protocol is executing exactly as designed, on an input that is wrong.

---

#### The Arithmetic: What a Single Liquidation Transfers

A liquidator repays half the debt and receives collateral worth the repayment plus the 8% bonus, valued at the *published* price. Because that price is 18% low, each unit of collateral seized is worth more than the protocol thinks.

```text
debt_repaid       = 350,000 * 0.50                    = 175,000
seized_at_oracle  = 175,000 * 1.08                    = 189,000
units_seized      = 189,000 / 0.82                    = 230,488
true_value_seized = 230,488                           = 230,488
liquidator_profit = 230,488 - 175,000                 =  55,488
```

Had the same liquidation happened at a correct price, the liquidator would have taken 189,000 of true value. The excess transferred from borrower to liquidator is `230,488 - 189,000 = 41,488`, or 8.3% of the borrower's original collateral.

The borrower is left with 269,512 of collateral and 175,000 of debt, a true health factor of 1.27 — mechanically healthier and 41,488 poorer.

**At the level of the book.** Suppose 28% of borrows sit in the newly-liquidatable band:

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Debt newly eligible for liquidation</td><td>6,160,000</td></tr>
    <tr><td>Debt repaid at a 50% close factor</td><td>3,080,000</td></tr>
    <tr><td>Collateral seized, true value</td><td>4,056,585</td></tr>
    <tr><td>Value that should have been seized</td><td>3,326,400</td></tr>
    <tr><td>Excess transferred to liquidators</td><td>730,185</td></tr>
  </tbody>
</table>

---

#### What This Teaches: The Cascade

The 4,056,585 of seized collateral does not sit still. Liquidators hedge or sell it immediately, and that selling has market impact. If absorbing it moves the *true* price down by 6%, the false signal has now produced a real one, and positions that were genuinely healthy at the original price become genuinely liquidatable at the new one.

```text
round 1: false price       -> liquidations -> forced selling
round 2: true price falls  -> more positions cross HF = 1
round 3: further selling, at a diminishing rate
```

Whether the loop converges depends on parameters that are set in advance:

- **Close factor.** A 50% cap means each round can only touch half of each affected position, spreading the selling over time.
- **Liquidation bonus.** A large bonus fills liquidations fast, which is what you want in a genuine fall and what accelerates the cascade in a false one.
- **Market depth relative to the book.** The ratio of liquidatable collateral to what the market absorbs without moving is the loop's gain. Above one, it does not converge on its own.
- **Concentration of health factors.** A book where most positions sit just above 1.00 has a much larger first round than one where they are spread out.

---

#### TWAP Versus Spot

A **time-weighted average price (TWAP)** averages observations over a window rather than taking the latest one. The trade-off is exact and unavoidable.

**Manipulation resistance.** With 12-second blocks, a 30-minute window holds 150 observations. A single-block false print of -18% shifts the average by `18 / 150 = 0.12%`. The attacker must sustain the false price across many blocks, at real capital risk, against every arbitrageur in the market. This is what breaks a single-transaction attack; see [Flash Loans](/case-studies/flash-loan).

**Lag.** For a genuine move of size `d` that happens instantly and persists, a TWAP over window `W` reports only `d * t / W` after `t` has elapsed:

<table>
  <tbody>
    <tr><td><strong>Time since the move</strong></td><td><strong>True fall</strong></td><td><strong>Reported by a 30-minute TWAP</strong></td></tr>
    <tr><td>5 minutes</td><td>18%</td><td>3.0%</td></tr>
    <tr><td>15 minutes</td><td>18%</td><td>9.0%</td></tr>
    <tr><td>30 minutes</td><td>18%</td><td>18.0%</td></tr>
  </tbody>
</table>

During that lag the protocol under-liquidates. Whether that is fatal depends on how much room the liquidation threshold leaves. For a position at `HF = 1.02` with 500,000 of collateral, the debt is `500,000 * 0.825 / 1.02 = 404,412`, and the collateral is worth less than the debt only after a fall of:

```text
1 - 404,412 / 500,000 = 19.1%
```

So a 30-minute lag on an 18% move leaves this position solvent, barely. The liquidation threshold's real job is to buy exactly this window. A protocol that sets a long TWAP and a thin threshold has chosen incompatible parameters.

> warning **Every oracle choice is a bet about which failure is cheaper** A responsive price accepts manipulation risk. A smoothed price accepts bad-debt risk. There is no configuration that avoids both, only one that matches the volatility and depth of the specific collateral.

---

#### How to Avoid or Manage It

- **Aggregate independent sources and check each for staleness.** A median is only as good as its least manipulable member, and a stale feed that keeps reporting is worse than one that fails loudly.
- **Bound the per-update deviation.** Rejecting a price that moves more than a set percentage in one update stops a single false print. The cost is that a genuine gap is also rejected, which is why deviation bounds are usually paired with a slower fallback rather than a halt.
- **Pause liquidations, not borrowing, after an anomaly.** A short grace period lets a bad print be corrected before value transfers. The exposure it creates is bounded by the liquidation threshold buffer computed above, which makes the maximum safe pause a calculable number.
- **Set the liquidation bonus per asset.** The bonus must be large enough to attract liquidators through the volatility of that asset and no larger, because every extra point is value taken from borrowers in every liquidation, including the wrong ones.
- **Cap borrowing against thin collateral by its liquidatable depth.** If the market cannot absorb the collateral without moving several percent, the protocol has written a promise it cannot execute.
- **Simulate the cascade, not the single liquidation.** The question is whether the loop converges, and that requires modelling the distribution of health factors together with market impact. See [Simulating Liquidations](/simulation/liquidations).

---

#### Assumptions and Failure Modes

- **Liquidators are assumed to be present and capitalised.** During genuine stress they compete for the most profitable positions and ignore small or illiquid ones, so the realised liquidation rate is uneven and the residue becomes bad debt.
- **The close factor is assumed to bind per transaction, not per block.** Where a position can be liquidated repeatedly within one block, the effective close factor is 100% and the first round is far larger than modelled.
- **The 6% impact of the forced selling is assumed.** Impact during a liquidation cascade is convex and correlated across positions, so a linear or square-root estimate calibrated in calm conditions will understate it.
- **The oracle error is assumed transient and uniform.** An error that persists, or that affects only one of several correlated collateral assets, produces a different and generally worse distribution of outcomes.
- **The TWAP lag formula assumes a single instantaneous jump.** Real paths oscillate, and a TWAP tracking an oscillating price can be either ahead of or behind spot in ways that are not monotone in the window length.
- **Governance is assumed not to intervene.** In practice parameters are changed mid-episode, which is itself a risk: emergency changes are made under time pressure with incomplete information and can worsen the cascade.

---

#### See Also

* [Oracle Manipulation](/risk/oracle-manipulation)
* [Oracle Designs](/protocols/oracle-designs)
* [Liquidations](/building-blocks/liquidations)
* [Oracles](/building-blocks/oracles)
* [Simulating Liquidations](/simulation/liquidations)
* [Flash Loans: Mechanics and Attack Patterns](/case-studies/flash-loan)

---

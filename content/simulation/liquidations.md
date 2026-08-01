### Simulating Liquidations and Cascades

> info **Metadata** Level: Advanced | Prerequisites: Leverage and Liquidation Risk, Lending Architecture | Tags: simulation, liquidations, cascades, reflexivity, stress-testing, market-impact

A single liquidation is arithmetic. [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation) derives the health factor, the trigger price, and what a liquidator receives. Simulating a *market* is a different problem, because the positions are not independent: liquidating one borrower means selling collateral, selling collateral moves the price, and a lower price makes other borrowers liquidatable. The output of the system feeds its own input.

That feedback is why a lending market cannot be stress-tested position by position. Summing the losses of individually shocked positions systematically understates the outcome, in exactly the way the additivity warning in [Types of Risk](/risk/types) describes. What a simulation has to find instead is a **fixed point**: a price at which the collateral forced onto the market is consistent with the price that forced it.

---

#### The Model in Five Components

<table>
  <tbody>
    <tr><td><strong>Component</strong></td><td><strong>What it supplies</strong></td><td><strong>Where the estimate comes from</strong></td></tr>
    <tr><td>Position set</td><td>Per borrower: collateral, debt, liquidation threshold</td><td>Reconstructed from on-chain state at a block</td></tr>
    <tr><td>Price process or shock</td><td>The exogenous move that starts the sequence</td><td>Historical stress, a quantile of a fitted distribution, or a chosen scenario</td></tr>
    <tr><td>Trigger rule</td><td>Which positions become liquidatable, and how much of each may be repaid</td><td>Protocol parameters: threshold, close factor, bonus</td></tr>
    <tr><td>Liquidator behaviour</td><td>Whether a liquidation is actually performed</td><td>A profitability condition, not an assumption of automatic execution</td></tr>
    <tr><td>Market impact</td><td>Price movement caused by selling seized collateral</td><td>Pool depth and a chosen impact model</td></tr>
  </tbody>
</table>

The fourth component is the one naive models omit. Liquidation is permissionless but not automatic: somebody must send a transaction, and they do so only if it pays.

```text
liquidator_profit = repay_amount * bonus - impact_cost(seized) - gas - inventory_risk
```

If the bonus is 5% but unwinding the seized collateral costs 6% in slippage, no rational liquidator acts. The position is not liquidated, and the market takes bad debt rather than a cascade. **A model that assumes liquidations always happen cannot produce the bad-debt outcome at all**, which is the failure mode that actually threatens protocol solvency.

---

#### The Cascade as a Fixed Point

Reduce the position set to a single function: `S(P)`, the value of collateral that must be sold when the price is `P`. Locally, linearise it around the trigger region, and pair it with a linear impact model:

```text
S(P)      = beta * max(P_trigger - P, 0)      collateral forced to market
impact(S) = S / D                             price decline from selling S
A         = beta / D                          the amplification factor
P*        = (P_shock - A * P_trigger) / (1 - A)
```

where:

- `beta` is the marginal collateral liquidated per unit of price decline
- `D` is market depth, the value that can be absorbed per unit of price decline
- `P_shock` is the price after the exogenous move, before any liquidation
- `P*` is the equilibrium price at which forced selling and its own impact are consistent

`A` is the whole story. Each round of liquidation causes a price fall that triggers a further round `A` times as large, so the total endogenous decline is the first round multiplied by `1 / (1 - A)`. Below one, the geometric series converges. At or above one, it does not, and the linearised model has no valid equilibrium.

---

#### Worked Example: Convergent and Divergent Cascades

Take an illustrative market. The collateral starts at 100 and an exogenous shock takes it to 88. Positions begin liquidating below 90, and each unit of price decline below that threshold forces 300,000 of collateral to market, so `beta = 300,000`.

**Case one: depth of 500,000 per unit of price.** Here `A = 300,000 / 500,000 = 0.60`.

<table>
  <tbody>
    <tr><td><strong>Round</strong></td><td><strong>Incremental sale</strong></td><td><strong>Price drop</strong></td><td><strong>Price after</strong></td></tr>
    <tr><td>1</td><td>600,000</td><td>1.200</td><td>86.800</td></tr>
    <tr><td>2</td><td>360,000</td><td>0.720</td><td>86.080</td></tr>
    <tr><td>3</td><td>216,000</td><td>0.432</td><td>85.648</td></tr>
    <tr><td>4</td><td>129,600</td><td>0.259</td><td>85.389</td></tr>
    <tr><td>5</td><td>77,760</td><td>0.156</td><td>85.233</td></tr>
  </tbody>
</table>

The closed form confirms where this is heading: `P* = (88 - 0.6 * 90) / (1 - 0.6) = 34 / 0.4 = 85.00`. Checking consistency at that price, the forced sale is `300,000 * (90 - 85) = 1,500,000`, whose impact is `1,500,000 / 500,000 = 3.00` — exactly the endogenous decline from 88 to 85.

The interpretation is the useful part. The 12-point exogenous shock became a 15-point total decline, an amplification of `15 / 12 = 1.25` times. The endogenous portion is `1 / (1 - 0.6) = 2.5` times the first round's impact alone, so measuring only the first round of liquidations understates the move by a factor of two and a half.

**Case two: depth of 250,000 per unit of price.** Halving depth gives `A = 1.20`. The rounds now sell 600,000, then 720,000, then 864,000, and the price passes 85.60, 82.72, 79.26 and continues falling with each round larger than the last. There is no fixed point in the linear region. In reality something else intervenes — the position set is exhausted, liquidators run out of capital, or liquidations stop being profitable — but the model has told you what it can: this configuration is unstable, and the outcome depends entirely on which limit binds first.

> warning **The interesting output is A, not the final price** The equilibrium price is an artefact of a linearisation. The amplification factor is the structural quantity, and knowing whether it sits near 0.3 or near 0.9 says far more about fragility than any single scenario's endpoint.

---

#### What On-Chain Mechanics Add

Three features distinguish an on-chain cascade from the general deleveraging spiral, and all three make the simulation harder in a specific way.

**Oracle latency delays the trigger.** Positions are liquidatable when the *feed* says so, not when the market does. A feed that updates on a deviation threshold or averages over a window lags a fast fall, so liquidations fire late and at prices further below the threshold than the parameters suggest. Modelling with the market price rather than the feed price systematically understates losses. See [Oracle Manipulation and Thin Liquidity](/risk/oracle-manipulation).

**Liquidations are contested transactions.** They are profitable, so they are competed for, which means inclusion depends on block-space auctions rather than on being first to notice. During the congestion that accompanies a large move, priority fees rise and the marginal liquidation becomes uneconomic. The competition also means liquidations cluster within blocks rather than spreading across them, concentrating impact. See [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy).

**The collateral and the venue may be the same market.** If liquidators unwind seized collateral into the pool the oracle reads, the impact feeds straight back into the trigger with no lag at all. That is the tightest possible version of the loop and the configuration where `A` is largest.

The macro analogue — leverage building in calm conditions and unwinding into thin markets — is [Liquidity Cycles](/regimes-macro/liquidity-cycles). The on-chain version runs on the same logic at the timescale of blocks rather than days.

---

#### Code

```python
def cascade_equilibrium(price_shock, trigger_price, beta, depth, max_rounds=50):
    """Iterate forced selling and its own price impact to a fixed point.

    Returns amplification as well as price: whether A is near 0.3 or near 0.9
    is the structural finding, while the equilibrium price is an artefact of
    the linearisation and should not be quoted on its own.
    """
    amplification = beta / depth
    price, already_sold = price_shock, 0.0
    for _ in range(max_rounds):
        required = beta * max(trigger_price - price, 0.0)
        incremental = required - already_sold
        if incremental <= 0:
            break
        price -= incremental / depth
        already_sold = required
    return {
        "amplification": amplification,
        "equilibrium_price": price,
        "collateral_sold": already_sold,
        "converged": amplification < 1.0,
    }


def liquidation_is_profitable(repay_amount, bonus, seized_value, depth, gas_cost):
    """A liquidation happens only if someone is paid to do it.

    Without this test a model cannot produce bad debt -- it will always
    clear positions, which is the outcome that does not threaten solvency.
    """
    reward = repay_amount * bonus
    slippage_cost = seized_value**2 / (2 * depth)   # convex unwind cost
    return reward - slippage_cost - gas_cost > 0
```

---

#### Assumptions and Failure Modes

- **Assumes impact is linear and constant.** Depth is not a fixed parameter. Liquidity providers withdraw during volatility, so `D` falls exactly as the cascade demands more of it, pushing `A` up mid-event.
- **Assumes liquidators have unlimited capital.** They do not, and their capital is committed elsewhere during precisely the same event. Capacity constraints turn an orderly clearing into a delayed one.
- **Assumes positions are static.** Borrowers add collateral and repay debt when they can. Simulating a frozen position set overstates liquidations for attentive borrowers and understates them for anyone unable to transact under congestion.
- **Assumes the collateral distribution is smooth.** Real position sets are lumpy. A handful of large borrowers create step discontinuities that a linearised `beta` cannot represent, and the ordering of who clears first then matters.
- **Assumes one asset, one market.** Cross-collateralised positions liquidate whichever asset is cheapest to seize, propagating stress into assets that never received the original shock. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Assumes parameters are fixed.** Thresholds, close factors and caps are governance-controlled and are frequently changed mid-stress, which alters `beta` during the event being simulated.
- **Assumes the historical shock is the relevant one.** Position sets and depth change continuously, so replaying a past shock against today's book answers a question about today, not a forecast.

> warning **Educational content only** This page describes a modelling technique. The parameters are invented for illustration, and nothing here characterises the risk of any real lending market.

---

#### See Also

* [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation)
* [Liquidations](/building-blocks/liquidations)
* [Oracle Manipulation and Thin Liquidity](/risk/oracle-manipulation)
* [Liquidity Cycles](/regimes-macro/liquidity-cycles)
* [Scenario and Stress Testing](/simulation/scenarios)
* [Lending Architecture](/protocols/lending-architecture)

---

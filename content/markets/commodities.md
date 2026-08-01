### Commodities

> info **Metadata** Level: Intermediate | Prerequisites: Futures 101, Roll and Carry | Tags: commodities, storage, convenience-yield, cost-of-carry, curves

A commodity is a physical good, and that single fact drives everything that makes commodity markets different from financial ones. A share certificate costs nothing to hold and can be borrowed from any custodian. A million barrels of crude oil must sit somewhere, be insured, be transported, and be of a specified grade delivered to a specified place. Physicality turns storage into a binding constraint and makes the cost of carry a real expense rather than an interest rate.

The consequence is that commodity futures curves can slope either way and change direction quickly, while financial futures curves are pinned by financing. It also means the "spot price" is often not a single number: the price of crude in one location with one sulphur content is not the price of crude elsewhere, and no arbitrage forces them together beyond the cost of moving barrels.

---

#### The Cost-of-Carry Model

```text
F = S * exp((r + u - y) * T)
```

where:

- `F` is the futures price for delivery at `T`
- `S` is the current spot price
- `r` is the financing rate
- `u` is the storage cost, expressed as an annual rate of the commodity's value
- `y` is the **convenience yield**
- `T` is the time to delivery in years

The first three terms are ordinary. Financing and storage are costs of holding the physical, so they push the futures price above spot. The fourth term is the one with no financial analogue.

**Convenience yield** is the benefit of holding the physical commodity rather than a claim on it. A refinery with crude in its tanks can keep running through a supply disruption; a refinery holding futures cannot refine a contract. That optionality is worth something, it rises as inventories fall, and it is subtracted from the carry because it is a benefit of ownership — exactly where a dividend yield sits in the equity index formula from [Futures 101](/markets/futures-101).

Convenience yield is not quoted anywhere. It is a **residual**: the number that makes the equation balance given an observed futures price. That makes it a useful summary of market tightness and a poor input to any model that assumes it is known in advance.

---

#### Worked Example: Backing Out a Convenience Yield

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Spot price</td><td>$80.00 per barrel</td></tr>
    <tr><td>Financing rate <code>r</code></td><td>4.5% per annum</td></tr>
    <tr><td>Storage cost <code>u</code></td><td>3.0% per annum of value</td></tr>
    <tr><td>Tenor <code>T</code></td><td>0.5 years</td></tr>
    <tr><td>Observed 6-month future</td><td>$77.50</td></tr>
  </tbody>
</table>

**Step 1 — what full carry would imply.** With no convenience yield at all:

```text
F_full_carry = 80.00 * exp((0.045 + 0.030) * 0.5)
             = 80.00 * exp(0.0375)
             = 80.00 * 1.038212
             = 83.06
```

The curve would be in contango, with a six-month basis of `83.06 - 80.00 = +3.06`.

**Step 2 — what the market says.** The observed future is 77.50, well below spot. The curve is backwardated.

**Step 3 — solve for the residual.**

```text
77.50 / 80.00 = exp((0.045 + 0.030 - y) * 0.5)
0.96875       = exp((0.075 - y) * 0.5)
ln(0.96875)   = (0.075 - y) * 0.5
-0.031749     = (0.075 - y) * 0.5
0.075 - y     = -0.063497
y             = 0.138497
```

The implied convenience yield is **13.85% per annum**. The market is paying nearly 14% annualised for the privilege of having the barrels now rather than in six months — a direct, quantitative reading of physical tightness, extracted from two prices and two rates.

**Step 4 — the arbitrage that is available, and the one that is not.**

Suppose instead the six-month future traded at 85.00, above the 83.06 full-carry level. Then a **cash-and-carry** trade is available: buy the physical at 80.00, finance it, pay storage, and sell the future at 85.00. At delivery the locked-in profit is `85.00 - 83.06 = 1.94` per barrel, with no price risk. Doing this in size pushes spot up and the future down until the gap closes.

Now suppose the future trades at 77.50, as observed. The mirror trade would be to sell the physical short and buy the future. But you cannot short a barrel you do not have, and there is no deep lending market for physical crude. **The arbitrage is one-directional.**

> info **Why contango is bounded and backwardation is not** Contango wider than the cost of storage invites the cash-and-carry trade, which closes it — until storage fills up, at which point the constraint binds and contango can widen without limit. Backwardation has no such mechanism at all: nothing forces the near contract down towards the deferred one. This asymmetry is the structural reason commodity curves behave unlike any financial curve.

The 2020 episode in which an expiring West Texas Intermediate crude contract settled at a negative price is this constraint at its extreme: with storage effectively full and physical delivery mandatory, holders of the expiring contract had to pay to be relieved of barrels they had nowhere to put.

---

#### How the Groups Differ

<table>
  <tbody>
    <tr><td><strong>Group</strong></td><td><strong>Storage cost</strong></td><td><strong>Typical curve</strong></td><td><strong>Dominant driver</strong></td></tr>
    <tr><td>Precious metals</td><td>Very low relative to value</td><td>Close to full carry, usually contango</td><td>Interest rates; they behave almost like financial assets</td></tr>
    <tr><td>Industrial metals</td><td>Low to moderate</td><td>Either, driven by warehouse stocks</td><td>Inventory levels and industrial demand</td></tr>
    <tr><td>Crude oil and products</td><td>Moderate, and capacity-constrained</td><td>Flips between states with inventory</td><td>Supply disruption and storage utilisation</td></tr>
    <tr><td>Natural gas</td><td>High; storage is limited and seasonal</td><td>Strongly seasonal</td><td>Weather and storage injection cycles</td></tr>
    <tr><td>Grains and softs</td><td>Moderate, with spoilage</td><td>Annual harvest pattern</td><td>Weather, planting decisions, harvest timing</td></tr>
    <tr><td>Electricity</td><td>Not storable at scale</td><td>No carry relationship at all</td><td>Instantaneous supply and demand balance</td></tr>
  </tbody>
</table>

Precious metals are the boundary case that proves the rule: because gold is cheap to store and can genuinely be lent, its curve is pinned near full carry and behaves like a financial asset. Electricity is the opposite extreme — it cannot be stored, so no arbitrage links today's price to next month's, prices are wildly volatile, and negative prices occur routinely when supply cannot be turned down.

---

#### Across Asset Classes

**Versus equity index futures.** The equity formula `F = S * exp((r - q) * T)` is the same expression with `q` in place of `y - u`. The difference is that a dividend yield is forecastable from company announcements while a convenience yield is a residual that moves with inventory. Equity basis is an arbitrage; commodity basis is partly an arbitrage and partly a state variable.

**Versus FX forwards.** FX forward points are fully determined by two observable interest rates, so the "curve" contains no information beyond rate differentials. Commodity curves contain genuine information about physical scarcity that appears nowhere else.

**Versus fixed income.** A bond's carry comes from the shape of the yield curve and is knowable in advance. A commodity's carry depends on inventory conditions that can change in a week.

**Commodity indices.** Passive index products must roll their positions on a published schedule, so their long-run return is dominated by the roll rather than by spot. In persistent contango a passive long can lose money over years while spot is unchanged — the mechanism worked through in [Roll and Carry](/markets/roll-and-carry).

**On-chain.** Tokenised commodity claims exist, but the token is a claim on custody, not a claim on delivery at a location and grade. The convenience yield accrues to the custodian, not the token holder, so the token behaves like a financial asset while the underlying does not. Cross-venue price differences reflect redemption friction rather than storage. See [Tokens 101](/building-blocks/tokens-101).

---

#### Assumptions and Failure Modes

- **Assuming a single spot price.** Grade and location differentials are real and can exceed the futures basis. A hedge in one benchmark against exposure in another is a spread position, not a hedge.
- **Assuming storage is available.** The cost-of-carry model implicitly assumes you can always rent another tank. When capacity binds, the model's central arbitrage stops existing and contango detaches from the storage cost.
- **Assuming convenience yield is a parameter.** It is the residual of the equation, driven by inventory, and it is at its highest and most volatile exactly when a model calibrated on calm periods is being relied upon.
- **Assuming you can short the physical.** For almost all commodities you cannot, which is why the no-arbitrage bound is one-sided and why persistent backwardation is not evidence of mispricing.
- **Using spot price series for backtests.** Most "spot" commodity series are actually front-month futures. They contain roll effects and they are not what a physical participant transacts at.
- **Ignoring delivery obligations.** A long futures position held past the last trading day in a physically delivered contract creates an obligation to take delivery, with all that implies about tanks, ships and warehouses.
- **Fitting seasonality on too few years.** Twenty years of an annual harvest cycle is twenty observations. See [Multiple Testing](/stat-methods/multiple-testing).
- **Assuming commodities hedge inflation uniformly.** The relationship differs by group, by inflation episode, and by whether the inflation is demand-driven or supply-driven. See [Rates and Inflation](/regimes-macro/rates-and-inflation).

---

#### Code

```python
import math


def futures_fair_value(spot, financing_rate, storage_rate,
                       convenience_yield, years):
    """Cost-of-carry fair value. Set convenience_yield=0 for full carry,
    which is the upper bound enforceable by cash-and-carry arbitrage."""
    net_carry = financing_rate + storage_rate - convenience_yield
    return spot * math.exp(net_carry * years)


def implied_convenience_yield(spot, futures, financing_rate,
                              storage_rate, years):
    """Residual that reprices the observed future. Rises as inventory
    tightens; a large value is a measurement of scarcity, not an error."""
    return financing_rate + storage_rate - math.log(futures / spot) / years
```

---

#### See Also

* [Futures 101](/markets/futures-101)
* [Roll and Carry](/markets/roll-and-carry)
* [Calendar Spreads](/markets/calendar-spreads)
* [Instrument Map](/markets/instrument-map)
* [Cash and Carry](/strategies/cash-carry)
* [Basis Signals](/signals/basis)

---

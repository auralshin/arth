### Concentrated Liquidity: A Worked Example

> info **Metadata** Level: Advanced | Prerequisites: AMMs, Impermanent Loss, Constant Product Pools | Tags: case-study, concentrated-liquidity, amm, capital-efficiency, range-orders

Concentrated liquidity lets a liquidity provider confine their capital to a price range instead of spreading it from zero to infinity. Within that range the position quotes far deeper markets than the same capital would in a constant-product pool, and earns a proportionally larger share of fees. Outside the range it earns nothing and holds only one of the two assets.

The trade is therefore leverage on the fee stream, paid for with a sharper loss profile. This page works one position through three end states and shows exactly where the crossover lies.

> info **A constructed example** The prices, range, pool volume, and fee tier below are chosen to make the arithmetic checkable. This is not a report of a specific position, pool, or period.

---

#### Setup: The Position and the Range

A pool pairs a volatile token against a numeraire. The token trades at 2,000. Our provider commits 100,000 to the range 1,600 to 2,500, which is 20% below and 25% above the current price.

The governing quantities are expressed in square roots of price. For a position with liquidity `L` over the range `Pa` to `Pb`, with the current price `P` inside the range:

```text
token_amount     = L * (1 / sqrt(P) - 1 / sqrt(Pb))
numeraire_amount = L * (sqrt(P) - sqrt(Pa))
```

where:

- `L` is the position's liquidity, the concentrated analogue of `sqrt(k)`
- `Pa` and `Pb` are the lower and upper bounds of the range
- `P` is the current pool price, and `sqrt(P)` is what actually moves in the maths

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Lower bound and its root</td><td>1,600 and 40.000</td></tr>
    <tr><td>Upper bound and its root</td><td>2,500 and 50.000</td></tr>
    <tr><td>Current price and its root</td><td>2,000 and 44.7214</td></tr>
    <tr><td>Capital committed</td><td>100,000</td></tr>
    <tr><td>Implied liquidity L</td><td>10,590.17</td></tr>
    <tr><td>Token deposited</td><td>25.0000</td></tr>
    <tr><td>Numeraire deposited</td><td>50,000.00</td></tr>
    <tr><td>Fee tier</td><td>5 bps</td></tr>
    <tr><td>Share of active pool liquidity</td><td>1%</td></tr>
  </tbody>
</table>

---

#### The Arithmetic: Capital Efficiency

Position value inside the range is `L * (2 * sqrt(P) - sqrt(Pa) - P / sqrt(Pb))`. A full-range position with the same `L` would be worth `L * 2 * sqrt(P)`. The ratio is the capital efficiency multiple:

```text
efficiency = 2 * sqrt(P) / (2 * sqrt(P) - sqrt(Pa) - P / sqrt(Pb))
           = 89.4427 / 9.4427
           = 9.47 times
```

The same 100,000 deployed full-range would buy `L = 100,000 / 89.4427 = 1,118.03`. The concentrated position holds 10,590.17, a factor of 9.47 more. While the price is inside the range, that is 9.47 times the fee share for the same money.

**Fee income.** Assume 1,200,000,000 of pool volume over thirty days at the 5 bps tier, giving 600,000 of fees to active liquidity. Our 1% share earns 6,000 for a full month in range. A full-range position of the same capital holds `1,118.03 / 1,059,017 = 0.1056%` of pool liquidity and earns 634.

---

#### What Happens Outside the Range

Once the price leaves the range, the position stops trading and stops earning. Its composition is fixed at the boundary.

```text
above Pb:  entirely numeraire, amount = L * (sqrt(Pb) - sqrt(Pa))
                                      = 10,590.17 * 10 = 105,901.70

below Pa:  entirely token, amount     = L * (1 / sqrt(Pa) - 1 / sqrt(Pb))
                                      = 10,590.17 * 0.005 = 52.9508
```

Above 2,500 the position is worth 105,901.70 no matter how far the price runs. Below 1,600 it holds 52.9508 tokens, worth whatever those tokens are worth. At either boundary the shortfall against simply holding the original 25 tokens and 50,000 numeraire is identical at **-5.87%**, which is the symmetry the square-root formulation produces.

Push further out and the gap widens quickly:

<table>
  <tbody>
    <tr><td><strong>Price</strong></td><td><strong>Position value</strong></td><td><strong>Hold value</strong></td><td><strong>Shortfall</strong></td></tr>
    <tr><td>1,400</td><td>74,131.19</td><td>85,000.00</td><td>-12.79%</td></tr>
    <tr><td>1,600 (lower bound)</td><td>84,721.36</td><td>90,000.00</td><td>-5.87%</td></tr>
    <tr><td>2,000 (entry)</td><td>100,000.00</td><td>100,000.00</td><td>0.00%</td></tr>
    <tr><td>2,500 (upper bound)</td><td>105,901.70</td><td>112,500.00</td><td>-5.87%</td></tr>
    <tr><td>2,800</td><td>105,901.70</td><td>120,000.00</td><td>-11.75%</td></tr>
  </tbody>
</table>

---

#### What This Teaches: Three End States

Compare three positions across three outcomes, each with the same 100,000 of capital and the same pool. In the third scenario the price exits the range on day 22, so the concentrated position earns 22/30 of a month's fees.

<table>
  <tbody>
    <tr><td><strong>Ending price</strong></td><td><strong>Concentrated, with fees</strong></td><td><strong>Full range, with fees</strong></td><td><strong>Hold</strong></td></tr>
    <tr><td>2,000, unchanged</td><td>106,000</td><td>100,633</td><td>100,000</td></tr>
    <tr><td>2,300, still in range</td><td>111,019</td><td>107,871</td><td>107,500</td></tr>
    <tr><td>2,800, above the range</td><td>110,302</td><td>118,955</td><td>120,000</td></tr>
  </tbody>
</table>

The pattern is the whole subject. When the price stays inside the range, concentration wins by roughly the fee multiple: 6,000 of fees against 634. When it leaves, the position's fixed composition costs more than the extra fees ever earned. In the third row the concentrated position collected 3,766 more in fees and gave up 12,420 in position value.

> warning **Capital efficiency is leverage on both sides of the trade** A range that is four times narrower earns roughly four times the fee rate and is exposed to being exited on a move four times smaller. Nothing about concentration reduces risk.

**Choosing the range is a volatility forecast.** A range of plus 25% and minus 20% is an implicit statement that the price will not travel that far within the holding period. Given a volatility estimate `sigma` and horizon `T`, the probability of touching a boundary is computable, and the honest way to choose a range is to set that probability deliberately rather than by eye.

---

#### How to Avoid or Manage It

- **Price the range as a forecast, not a preference.** Convert the bounds into a probability of exit using a volatility estimate. If the implied probability of exit exceeds roughly half the holding period, the fee multiple is unlikely to compensate.
- **Budget for rebalancing before choosing the width.** Re-centring a range costs gas plus the spread of two swaps, and it *realises* the shortfall each time. Narrow ranges require frequent re-centring, which converts a paper loss into a sequence of real ones. See [Gas and the Mempool](/microstructure/gas-mempool).
- **Do not treat an out-of-range position as safe because it stopped moving.** It has become a fully directional holding of one asset with no fee income, which is a different position from the one that was underwritten.
- **Ladder ranges rather than picking one.** Several overlapping ranges of different widths approximate a smoother payoff and reduce the sensitivity to any single boundary choice.
- **Measure against the full-range alternative, not against zero.** The relevant question is whether concentration beat the passive pool position, which the table above answers directly.

---

#### Code

Everything above follows from two functions: one that converts a capital budget and a range into liquidity, and one that values the resulting position at any price.

```python
from math import sqrt


def liquidity_from_capital(capital, price, lower, upper):
    """Liquidity L purchasable with `capital` units of the numeraire.

    Valid only when lower <= price <= upper, which is the case a range
    order is opened in.
    """
    return capital / (2 * sqrt(price) - sqrt(lower) - price / sqrt(upper))


def position_value(L, price, lower, upper):
    """Numeraire value of a concentrated position at any price.

    Outside the range the composition is fixed, which is why the value
    stops responding above `upper`.
    """
    if price >= upper:
        return L * (sqrt(upper) - sqrt(lower))
    if price <= lower:
        return L * (1 / sqrt(lower) - 1 / sqrt(upper)) * price
    s = sqrt(price)
    return L * (1 / s - 1 / sqrt(upper)) * price + L * (s - sqrt(lower))


L = liquidity_from_capital(100_000, 2_000, 1_600, 2_500)   # 10,590.17
print(position_value(L, 2_800, 1_600, 2_500))              # 105,901.70
```

Run `position_value` across a grid of prices before opening the position, alongside the hold benchmark and the full-range alternative, and the range choice stops being an aesthetic judgement.

---

#### Assumptions and Failure Modes

- **The 1% liquidity share is assumed constant.** In practice the active liquidity around the price changes constantly as other providers enter, exit, and re-centre. Fee income is proportional to share, so a crowded range earns far less than the calculation implies.
- **Volume is assumed independent of price level.** It is not. Volume concentrates around dislocations, so the periods that push the price out of range are also the periods with the most fees available, and the position misses them.
- **Fees are assumed to accrue continuously while in range.** In reality liquidity is discretised into ticks, and a position at the very edge of its range earns from only part of the flow.
- **Rebalancing costs are excluded from the comparison table.** Adding realistic gas and swap costs for even one re-centring materially reduces the concentrated position's advantage in the first two rows.
- **The comparison ignores that the two positions have different deltas.** The concentrated position's exposure to the token changes faster with price, so comparing them on terminal value alone understates the difference in risk taken.
- **No provision is made for the pool itself failing.** Contract risk, a broken price feed, or a failed asset dominates every number above; see [Smart Contract Risk](/risk/smart-contract).

---

#### See Also

* [Concentrated Liquidity](/protocols/concentrated-liquidity)
* [Concentrated LP Strategies](/strategies/concentrated-lp)
* [Impermanent Loss](/building-blocks/impermanent-loss)
* [Delta-Hedged LP](/strategies/delta-hedged-lp)
* [AMM Depth](/protocols/amms-depth)
* [Walkthrough: LP on an AMM During Volatility](/case-studies/lp-volatility)

---

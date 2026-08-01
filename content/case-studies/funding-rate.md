### Case Study: A Funding-Rate Carry Trade

> info **Metadata** Level: Intermediate | Prerequisites: Perpetual Futures, Funding Rate, Delta Neutral, Leverage | Tags: case-study, funding, carry, perpetuals, delta-neutral, tail-risk

A perpetual future has no expiry, so nothing forces its price towards spot. Instead, a **funding rate** is exchanged periodically between longs and shorts: when the perpetual trades above the index, longs pay shorts, and when it trades below, shorts pay longs. Holding spot and shorting the perpetual against it produces a position with no directional exposure that collects that payment.

The return profile is the classic carry shape. Most periods pay a small positive amount, the hit rate is high, and the losses are rare, large, and concentrated in exactly the conditions that made funding attractive in the first place. This page prices both halves.

> info **A constructed example** The funding rates, margin parameters, and price path below are chosen to illustrate the mechanism. This is not a report of a specific market, venue, or episode.

---

#### Setup: The Position

Funding is paid every eight hours, so three times a day and 1,095 times a year. A rate quoted as 0.01% per interval is 0.03% per day, or 10.95% per annum on notional before compounding.

<table>
  <tbody>
    <tr><td><strong>Item</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Total capital</td><td>200,000</td></tr>
    <tr><td>Long spot</td><td>150,000, held unencumbered</td></tr>
    <tr><td>Perpetual margin account</td><td>50,000, isolated from the spot holding</td></tr>
    <tr><td>Short perpetual</td><td>150,000 notional, 3 times the margin posted</td></tr>
    <tr><td>Net delta</td><td>Zero at entry</td></tr>
    <tr><td>Maintenance margin rate</td><td>2% of perpetual notional</td></tr>
    <tr><td>Funding convention</td><td>Every 8 hours, credited to a separate account</td></tr>
  </tbody>
</table>

At an average realised funding rate of 0.012% per interval:

```text
income_per_day  = 150,000 * 0.00012 * 3           = 54.00
annualised      = 0.00012 * 3 * 365               = 13.14% of notional
on_capital      = 13.14% * 150,000 / 200,000      =  9.86% per annum
```

Just under 10% on capital, with no directional exposure. That is the advertisement.

---

#### The Arithmetic: Where the Position Dies

The spot leg is unencumbered, so it cannot be liquidated. The perpetual leg can. Let `P` be the price relative to entry. The short loses `150,000 * (P - 1)`, and the maintenance requirement grows with notional `150,000 * P`:

```text
50,000 - 150,000 * (P - 1)  =  0.02 * 150,000 * P
200,000                     =  153,000 * P
P                           =  1.307
```

A **30.7% rally liquidates the short**, even though the combined position is flat. Compare a less leveraged version of the same trade, 100,000 of spot against 100,000 of margin and 100,000 short:

<table>
  <tbody>
    <tr><td><strong>Configuration</strong></td><td><strong>Notional</strong></td><td><strong>Margin</strong></td><td><strong>Liquidation rally</strong></td><td><strong>Carry on capital</strong></td></tr>
    <tr><td>Three times margin</td><td>150,000</td><td>50,000</td><td>30.7%</td><td>9.9% per annum</td></tr>
    <tr><td>Roughly one times margin</td><td>100,000</td><td>100,000</td><td>96.1%</td><td>6.6% per annum</td></tr>
  </tbody>
</table>

The trade-off is explicit: a third more carry, bought by moving the failure point from a 96% rally to a 31% one. There is no configuration that removes the failure point, only configurations that move it.

---

#### What Happens: The Tail

Funding is not independent of price. Persistently positive funding means leveraged longs are paying to hold exposure, and the largest rates appear during sharp rallies — precisely when a short perpetual leg is losing.

<table>
  <tbody>
    <tr><td><strong>Period</strong></td><td><strong>Event</strong></td><td><strong>Funding collected</strong></td></tr>
    <tr><td>Days 1 to 60</td><td>Range-bound. Funding averages 0.012% per interval</td><td>3,240</td></tr>
    <tr><td>Days 61 to 63</td><td>Price rallies 31%. Funding spikes to 0.05% per interval</td><td>675</td></tr>
    <tr><td>Day 63</td><td>Short perpetual liquidated at the 30.7% threshold; margin account goes to zero after the liquidation penalty</td><td>—</td></tr>
    <tr><td>Days 64 to 70</td><td>Price round-trips back to its starting level. The book is now unhedged and long</td><td>—</td></tr>
  </tbody>
</table>

At liquidation the spot leg was up `150,000 * 0.307 = 46,050`, which roughly offset the 50,000 of margin lost. Had the position been closed at that moment, the damage would have been small. It was not closed, and the price came back:

```text
spot value at day 70      = 150,000   (round-trip, unchanged)
perpetual margin account  =       0   (liquidated)
funding collected         =   3,915
final capital             = 153,915
return                    =  -23.0%
```

Two months of carry earned 3,915. Three days cost 46,085. At 9.9% per annum, the loss consumed about 2.3 years of carry.

> warning **The tail of a funding trade is not the rally, it is the liquidation** A rally alone is P&L-neutral for a hedged book. The loss is created by being forced to convert a hedged position into a directional one at the top, and then holding it back down.

---

#### What This Teaches

- **The hedge is only a hedge while both legs exist.** Delta-neutrality is a property of a pair of positions, and liquidation is the mechanism that breaks pairs. Any measurement of "risk" that reports zero delta without reporting the distance to liquidation is measuring the wrong thing.
- **Isolated margin converts a solvency problem into a certainty.** With the two legs in one cross-margined account, the spot gain would have offset the perpetual loss and no liquidation would have occurred. That offset is a venue feature, not a law.
- **Carry positions have a hit rate, not an edge.** Roughly 1,095 funding intervals a year, most of them positive, produce a smooth equity curve that says almost nothing about the loss distribution. Sharpe ratios computed on such a series are systematically flattering. See [Sharpe Ratio](/quant-math/sharpe).
- **High funding is a price, not a gift.** A funding rate of 0.05% per interval is the market paying for something. Usually it is paying for the risk of the move that is currently underway.

---

#### How to Avoid or Manage It

- **Set a de-risk trigger well above the liquidation price.** Reduce or close at a fixed margin-utilisation level, chosen so that the ordinary volatility of a bad day cannot carry the position from trigger to liquidation.
- **Keep top-up collateral liquid and pre-positioned.** Collateral that requires a transfer, a bridge, or a business day is not available in the window that matters.
- **Route funding income to the margin account, not to a separate wallet.** In this example funding was swept away; retaining it would have raised the liquidation threshold slightly and, more importantly, kept the buffer growing with the position.
- **Measure the trade in years-of-carry-at-risk.** A configuration that risks 2.3 years of carry on a single 30% move is a different product from one that risks four months. Quote both numbers together or neither.
- **Hedge the tail explicitly if the size warrants it.** A small long call position, or a portion of the notional held in a dated future that cannot be liquidated, converts an open-ended tail into a known cost. That cost will exceed a meaningful fraction of the carry, which is the honest price of the strategy.

---

#### Code

The two numbers that should be quoted together for any funding carry position, and almost never are.

```python
def liquidation_move(notional, margin, maintenance_rate):
    """Price move, as a fraction, that liquidates the short perpetual leg.

    Returns the rally size, because a short is killed by a rally.
    """
    return (margin + notional) / (notional * (1 + maintenance_rate)) - 1


def years_of_carry_at_risk(notional, margin, maintenance_rate,
                           capital, funding_per_interval, intervals_per_year=1095):
    """How long the carry takes to rebuild the worst-case loss.

    Worst case assumed: the margin is lost and the spot leg round-trips,
    so the whole margin account is the loss.
    """
    annual_carry = funding_per_interval * intervals_per_year * notional
    return margin / annual_carry


print(liquidation_move(150_000, 50_000, 0.02))                       # 0.307
print(years_of_carry_at_risk(150_000, 50_000, 0.02, 200_000, 0.00012))  # 2.54
```

The second function deliberately assumes the worst case rather than the expected one. A configuration whose margin account represents two and a half years of carry is a very different product from one where it represents six months, and the difference is invisible in any Sharpe ratio computed on the smooth part of the return series.

---

#### Assumptions and Failure Modes

- **Funding is assumed positive on average.** It is not a constant of nature. Extended periods of negative funding turn the carry into a cost and are common after sharp falls.
- **The spot and perpetual are assumed to track exactly.** Index construction, venue outages, and withdrawal halts all create basis between the legs that no funding payment compensates.
- **Liquidation is assumed to occur at the maintenance threshold.** In fast markets, liquidation engines fill worse than the threshold, and auto-deleveraging can close the position at a price nobody quoted.
- **The margin account is assumed isolated.** Cross-margin removes this specific failure mode and introduces another: a loss on one leg can consume collateral supporting the whole book.
- **Costs are excluded.** Spot acquisition, perpetual maker or taker fees, borrow costs, and the liquidation penalty all reduce the 9.9%, and at three funding intervals a day they are not negligible.
- **The example uses one round trip.** The realistic risk is a sequence of such episodes, where each liquidation is individually survivable and the compounding of forced re-entries is not.

---

#### See Also

* [Funding Rate](/signals/funding-rate)
* [Funding Trends](/strategies/funding-trends)
* [Perpetual Futures](/building-blocks/perpetual-futures)
* [Delta Neutral](/strategies/delta-neutral)
* [Leverage and Liquidation](/risk/leverage-liquidation)
* [How a Basis Trade Unwinds](/case-studies/basis-unwind)

---

### Calendar Spreads

> info **Metadata** Level: Intermediate | Prerequisites: Futures 101, Roll and Carry | Tags: futures, spreads, term-structure, margin, seasonality

A calendar spread is simultaneously long one expiry of a futures contract and short another. The outright direction of the underlying is largely removed; what remains is a position on the **shape** of the term structure — whether the curve steepens, flattens or inverts between the two dates.

This is the most common way to express a view without taking a directional bet, and it is also the natural instrument for a roll. Anyone rolling a futures position is, for a moment, trading a calendar spread, which is why the spread itself is quoted as a single instrument on most exchanges with its own order book, its own tick size, and its own margin treatment.

---

#### Definition and Quoting

```text
spread = F(near) - F(far)
```

Conventions differ by market — some quote far minus near — so the sign must always be checked against the exchange specification before interpreting a number. Under the near-minus-far convention above:

- A **negative** spread means contango: the deferred contract is more expensive.
- A **positive** spread means backwardation: the near contract is more expensive.
- **Buying the spread** conventionally means buying the near leg and selling the far leg, which profits when the spread rises — when the curve moves towards backwardation.

Exchanges list the spread as a single tradable instrument, which matters more than it sounds. Executing two outright legs separately exposes you to **legging risk**: the market moves between the two fills and you end up with an unintended outright position. A spread order fills both legs at a guaranteed differential or neither.

---

#### Worked Example: Trading a Flattening

A commodity contract with a 1,000-unit multiplier. September trades at 82.50, December at 84.00.

<table>
  <tbody>
    <tr><td><strong>Stage</strong></td><td><strong>Sep</strong></td><td><strong>Dec</strong></td><td><strong>Spread (Sep − Dec)</strong></td></tr>
    <tr><td>Entry</td><td>82.50</td><td>84.00</td><td>-1.50</td></tr>
    <tr><td>Exit</td><td>85.00</td><td>85.75</td><td>-0.75</td></tr>
    <tr><td>Change</td><td>+2.50</td><td>+1.75</td><td>+0.75</td></tr>
  </tbody>
</table>

Buy the spread at -1.50: long one September, short one December.

1. **September leg**: `+2.50 * 1,000 = +2,500`.
2. **December leg**: `-1.75 * 1,000 = -1,750`.
3. **Net profit**: `2,500 - 1,750 = +750`, which is exactly `0.75 * 1,000` — the spread change times the multiplier.

The outright market rose about 3% and contributed nothing. Both legs moved, and the profit came entirely from December rising less than September — the contango narrowing from 1.50 to 0.75.

**Margin.** Suppose the exchange requires £6,000 of initial margin per outright leg. Held separately that is `2 * 6,000 = 12,000`. As a recognised calendar spread the requirement might be £900, because the clearing house recognises the offset:

```text
margin efficiency = 12,000 / 900 = 13.3x
```

The £750 profit is 83% of the £900 posted and 6.25% of the gross outright margin. This is the characteristic profile of spread trading: small moves, low absolute volatility, and leverage supplied by the margin system rather than chosen by the trader.

> warning **The margin offset can be withdrawn** Spread margin credits assume the two legs stay correlated. When they stop — a delivery squeeze, a storage constraint, a regulatory intervention affecting one month — the clearing house can reduce or remove the credit, forcing a margin call on a position that was sized against the old requirement. Leverage granted by a correlation assumption disappears with the assumption.

---

#### Reading the Spread as a Rate

For financial futures the calendar spread is not an opinion, it is an arithmetic consequence of financing. Take the index from [Futures 101](/markets/futures-101): spot 5,000, financing 4.5%, dividend yield 1.8%.

```text
F(3m) = 5,000 * exp(0.027 * 0.25) = 5,033.86
F(6m) = 5,000 * exp(0.027 * 0.50) = 5,067.96
spread (3m - 6m) = -34.10 points
```

Back out the implied rate from the spread alone:

```text
34.10 / 5,033.86 = 0.006773 over one quarter
0.006773 * 4 = 2.71% annualised
```

which recovers `r - q = 2.7%`, the small excess being compounding. So an equity index calendar spread is a traded forward financing rate net of expected dividends. Its two sources of movement are the funding curve and the dividend forecast, and separating them is the substance of index-basis trading.

---

#### Seasonality and Storage

For physical commodities the calendar spread is a price for **time and space in a warehouse**, and it inherits the seasonality of the underlying business.

**Natural gas.** Demand peaks in winter, so the winter contracts trade at a premium to the preceding summer contracts. Gas is injected into storage in summer and withdrawn in winter, and the summer-to-winter spread is essentially the market's price for that storage. The March-to-April spread, which straddles the end of the withdrawal season, is notorious for extreme moves: if the winter ends with storage nearly empty, March has no substitute and the spread can move by multiples of its usual range.

**Agriculture.** Harvest floods the market with supply, so the contract immediately after harvest is typically the cheapest of the year, with the curve rising through the following months to reflect storage. A poor harvest inverts the pattern.

**Energy.** Crude curves respond to inventory. When storage fills, contango widens until it pays for tank space; when inventory is scarce, the curve inverts as consumers bid for prompt barrels. See [Commodities](/markets/commodities).

The general principle: **contango is bounded by the cost of storage, backwardation is unbounded.** If the deferred contract exceeds the near contract by more than the cost of storing and financing the commodity, anyone with a tank can buy the physical, sell the deferred future, and lock the difference. No comparable trade forces the other direction, because you cannot borrow a commodity that nobody has.

---

#### Across Asset Classes

**Equity index futures.** The spread is a financing rate, as derived above. Its liquidity concentrates in the days around each quarterly roll.

**Interest rate futures.** Spreads between consecutive contracts on the same short rate are direct bets on the path of policy, and are often traded in packs and bundles. A three-leg version, the **butterfly**, isolates curvature rather than slope.

**Bond futures.** The calendar spread contains the roll of the cheapest-to-deliver basket as well as financing, so it is materially more complex than the index case.

**FX.** The equivalent structure is the forward-forward swap, priced from the interest rate differential across two dates. See [FX Carry and Parity](/markets/fx-carry-parity).

**Options.** A calendar spread in options — same strike, different expiries — is a position on the term structure of implied volatility rather than of price. Same name, different subject. See [Volatility Term Structure](/derivatives/vol-term-structure).

**Perpetual futures.** No expiries exist, so no calendar spread exists. The nearest analogue is the spread between the perpetual's funding rate and a dated future's basis on the same underlying. See [Perpetual Futures](/building-blocks/perpetual-futures).

---

#### Assumptions and Failure Modes

- **Assuming the spread is directionally neutral.** It is neutral to a parallel shift only. Spot rallies driven by a prompt shortage move the near leg far more than the deferred leg, and the "hedged" position takes a directional loss.
- **Assuming low volatility means low risk.** Spreads are quoted in small numbers and traded in large size for exactly that reason. The leverage is in the position size, and the tail is fatter than the daily range suggests.
- **Assuming the margin offset is permanent.** Covered in the warning above; this is the mechanism through which spread positions become forced sellers.
- **Ignoring delivery mechanics near expiry.** A spread carried into the near contract's delivery period becomes an outright position plus a delivery obligation. Position limits also tighten in the delivery month.
- **Legging in.** The convenience of two separate liquid outright books is a trap: the spread book exists precisely because the differential moves faster than either leg's quoted depth suggests.
- **Fitting seasonality on too few cycles.** Ten years of an annual seasonal pattern is ten observations, not 2,520. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### See Also

* [Futures 101](/markets/futures-101)
* [Roll and Carry](/markets/roll-and-carry)
* [Commodities](/markets/commodities)
* [Yield Curves](/markets/yield-curves)
* [Basis Signals](/signals/basis)
* [Pairs Trading](/strategies/pairs)

---

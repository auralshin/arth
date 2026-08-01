### How a Basis Trade Unwinds

> info **Metadata** Level: Advanced | Prerequisites: Futures, Cash-and-Carry, Margin, Leverage | Tags: case-study, basis, cash-and-carry, margin, funding, liquidity

A cash-and-carry trade is long the spot asset and short the future against it, capturing the difference between the two prices as the future converges to spot at expiry. Priced correctly, it has almost no directional exposure. It is nonetheless one of the most reliable ways for a leveraged book to be destroyed.

The reason is a cash-flow mismatch rather than a price risk. The short futures leg is marked to market and settled in cash every day. The long spot leg accrues its offsetting gain on paper. A large move in either direction is P&L-neutral for the position and severely negative for the cash account, and the position is closed by the treasurer, not the market.

> info **A constructed example** The prices, margin levels, and financing terms below are chosen to make the mechanism legible. This is not a report of a specific market episode.

---

#### Setup: The Position

Spot trades at 100.00 and the three-month future at 102.00, a basis of 2.00 points, or 2.00% of spot over three months — roughly 8% annualised if held to convergence.

<table>
  <tbody>
    <tr><td><strong>Leg</strong></td><td><strong>Detail</strong></td></tr>
    <tr><td>Long spot</td><td>10,000 units at 100.00, notional 1,000,000</td></tr>
    <tr><td>Spot financing</td><td>700,000 borrowed at 6.0% per annum, 70% loan-to-value</td></tr>
    <tr><td>Spot equity</td><td>300,000</td></tr>
    <tr><td>Short future</td><td>10,000 contracts at 102.00, notional 1,020,000</td></tr>
    <tr><td>Futures margin account</td><td>240,000 cash, held at the clearer</td></tr>
    <tr><td>Initial margin requirement</td><td>8% of futures notional, 81,600</td></tr>
    <tr><td>Maintenance margin</td><td>5% of futures notional, 51,000 at entry</td></tr>
    <tr><td>Total equity committed</td><td>540,000</td></tr>
    <tr><td>Gross exposure to equity</td><td>2,020,000 / 540,000 = 3.74 times</td></tr>
  </tbody>
</table>

Expected profit if held to expiry, when the future converges to spot:

```text
basis_capture  = 2.00 * 10,000                    = 20,000
funding_cost   = 700,000 * 0.060 * 0.25           = 10,500
net            = 20,000 - 10,500                  =  9,500
return_on_equity = 9,500 / 540,000                =  1.76% over three months
```

That is about 7.2% annualised on committed equity — a thin, crowded, leveraged return, which is the characteristic shape of a basis trade.

---

#### The Arithmetic: How Far Can the Position Move?

The margin account is exhausted when the loss on the short future plus the maintenance requirement exceeds the cash posted. With `F` the futures price, 10,000 contracts, 240,000 posted, and a 5% maintenance rate:

```text
240,000 - (F - 102) * 10,000  =  0.05 * F * 10,000
240,000 - 10,000F + 1,020,000 =  500F
1,260,000                     =  10,500F
F                             =  120.00
```

The position survives a rally in the future to 120.00, about 18% above entry, before the first margin call. Compute this number before entering, not during. It is the only meaningful measure of how much room the trade has.

---

#### What Happens: A Rally

The mismatch bites on the way up. The short future loses cash daily; the long spot gains value that cannot be spent.

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td><strong>Spot</strong></td><td><strong>Future</strong></td><td><strong>Basis</strong></td><td><strong>Cumulative futures mark</strong></td><td><strong>Margin account</strong></td><td><strong>Maintenance required</strong></td></tr>
    <tr><td>0</td><td>100.00</td><td>102.00</td><td>2.00</td><td>0</td><td>240,000</td><td>51,000</td></tr>
    <tr><td>1</td><td>108.00</td><td>110.00</td><td>2.00</td><td>-80,000</td><td>160,000</td><td>55,000</td></tr>
    <tr><td>2</td><td>118.00</td><td>119.50</td><td>1.50</td><td>-175,000</td><td>65,000</td><td>59,750</td></tr>
    <tr><td>3</td><td>125.00</td><td>126.00</td><td>1.00</td><td>-240,000</td><td>0</td><td>63,000</td></tr>
  </tbody>
</table>

By day 3 the margin account is empty and the clearer calls for 63,000. Note what the basis column is doing: it has *narrowed* from 2.00 to 1.00, which is the direction the trade wanted. On a combined mark, the position is up:

```text
spot gain    = (125.00 - 100.00) * 10,000 =  250,000  (unrealised)
futures loss = (102.00 - 126.00) * 10,000 = -240,000  (settled in cash)
combined                                  =  +10,000
```

The trade is winning and out of money at the same time. This is the entire phenomenon.

**Where the cash could come from.** The spot leg is now worth 1,250,000 against a 700,000 loan, so there is 550,000 of equity in it. But the lender has also watched a 25% move and cuts the advance rate from 70% to 60%:

```text
new_borrowing_cap = 0.60 * 1,250,000 = 750,000
headroom          = 750,000 - 700,000 =  50,000
```

Fifty thousand against a call of 63,000. The shortfall is 13,000, and the position must be closed.

---

#### What This Teaches: The Exit Is the Loss

Forced unwinds of this trade are self-reinforcing. Everyone exiting must *buy back* short futures and *sell* spot, which pushes the future up relative to spot — the basis widens for whoever is left, triggering further calls. The trader who is forced out first exits into that widening.

Assume the unwind executes with spot sold at 124.50 after 40 bps of slippage, and futures bought back at 128.00 as the squeeze runs:

<table>
  <tbody>
    <tr><td><strong>Line</strong></td><td><strong>Calculation</strong></td><td><strong>Amount</strong></td></tr>
    <tr><td>Spot leg</td><td>(124.50 - 100.00) x 10,000</td><td>+245,000</td></tr>
    <tr><td>Futures leg</td><td>(102.00 - 128.00) x 10,000</td><td>-260,000</td></tr>
    <tr><td>Financing, four days</td><td>700,000 x 6.0% x 4 / 365</td><td>-460</td></tr>
    <tr><td><strong>Net</strong></td><td>—</td><td><strong>-15,460</strong></td></tr>
  </tbody>
</table>

That is -2.86% on 540,000 of equity, against an expected +1.76% had the position been carried to expiry. The whole difference is financing and forced execution. The view was correct and the balance sheet was not.

> warning **Convergence is only realisable by a holder who can hold** A trade whose profit arrives at expiry is worthless to a book that runs out of cash before expiry. Solvency is a separate constraint from expected value, and it binds first.

---

#### How to Avoid or Manage It

- **Size to the margin call, not to the expected return.** Compute the futures price at which the first call arrives, as above, and ask whether that move is plausible in a stressed week. If the answer is yes, the position is too large regardless of its expected profit.
- **Hold the cash buffer where the calls land.** Equity in the spot leg is not liquidity. Reserves must sit in the same currency, at the same venue, on the same settlement cycle as the variation margin.
- **Assume financing terms tighten exactly when you need them.** Advance rates fall and haircuts rise during the move that creates the call. Model the loan-to-value cut, not the current cut.
- **Prefer cross-margin, and understand the terms.** Had both legs been margined against a single account, the combined mark of +10,000 would have produced no call at all. Whether that offset is granted, and whether it can be withdrawn mid-episode, is a contractual question worth reading before the trade.
- **Watch the crowding, not just the basis.** Open interest concentrated in one direction means the exit is one-sided. See [Open Interest](/signals/open-interest) and [Liquidity Cycles](/regimes-macro/liquidity-cycles).
- **Pre-agree the deleveraging ladder.** Decide in advance which fraction is cut at which margin utilisation. Choosing during a call means selling everything at once into the worst possible print.

A useful discipline is to state the trade as two separate quantities and never quote one without the other:

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>This trade</strong></td><td><strong>What it answers</strong></td></tr>
    <tr><td>Expected return on equity</td><td>1.76% per quarter</td><td>Is the trade worth doing at all?</td></tr>
    <tr><td>Futures price at first margin call</td><td>120.00, about 18% above entry</td><td>How much room does it have?</td></tr>
    <tr><td>Cash required at that point</td><td>63,000, against 50,000 available</td><td>Can the room actually be used?</td></tr>
  </tbody>
</table>

The first number is what gets presented. The second and third are what determine the outcome.

---

#### Assumptions and Failure Modes

- **The basis is assumed to converge at expiry.** For a physically-settled contract this is enforced by delivery. For contracts settled against an index, convergence depends on the index being reliable, and a broken index breaks the trade's fundamental premise.
- **Both legs are assumed to reference the same asset.** Basis trades using a proxy or a related deliverable carry residual exposure that appears only in stress, when the proxy and the asset stop tracking.
- **Slippage on the unwind is assumed at 40 bps on spot.** In a forced, one-sided exit, realised slippage is a function of how many others are exiting simultaneously, not of the normal spread.
- **Financing is assumed available at 6%.** Term financing that rolls daily is not financing; it is an option the lender holds. A withdrawal of the loan closes the trade even with margin intact.
- **The margin schedule is assumed static.** Clearers raise initial and maintenance requirements during volatility, which can generate a call with no price move at all.
- **The example is a rally.** A sharp fall creates the mirror problem: the spot leg's collateral value drops, the loan-to-value breaches, and the lender calls. Both directions are dangerous; only the identity of the caller changes.

---

#### See Also

* [Cash and Carry](/strategies/cash-carry)
* [Roll and Carry](/markets/roll-and-carry)
* [Liquidity Cycles](/regimes-macro/liquidity-cycles)
* [Leverage and Liquidation](/risk/leverage-liquidation)
* [Basis](/signals/basis)
* [Futures 101](/markets/futures-101)

---

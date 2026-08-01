### Futures 101

> info **Metadata** Level: Beginner | Prerequisites: Instrument Map | Tags: futures, margin, clearing, expiry, basis

A futures contract is a standardised agreement to exchange an asset at a fixed price on a fixed future date. What makes it a *futures* contract rather than a forward is the clearing house: a central counterparty steps between buyer and seller, becomes the counterparty to both, and enforces a daily settlement of gains and losses so that no party ever accumulates a large unpaid claim on another.

That daily settlement — **mark to market** — is the defining feature and the source of most of what is distinctive about futures. It is why you post margin rather than the full price, why a profitable position pays you cash before it closes, why an unprofitable one can be liquidated while your thesis is still intact, and why a futures price and a forward price on the same underlying are not quite the same number.

---

#### Contract Specifications

Everything about a listed future is fixed by the exchange except the price. A specification names:

- **Underlying** — the exact index, grade of commodity, or bond basket deliverable.
- **Contract size / multiplier** — the currency value of one index point, or the physical quantity.
- **Tick size and tick value** — the minimum price increment and what it is worth.
- **Delivery months** — which expiries are listed.
- **Last trading day and settlement date** — when the contract stops trading and how it terminates.
- **Settlement method** — cash or physical delivery.
- **Position limits** — caps on how much any one participant may hold, particularly near expiry.

```text
notional = price * multiplier * contracts
tick P&L = tick_value * ticks_moved * contracts
```

An index at 5,000 with a £50 multiplier gives `5,000 * 50 = 250,000` of notional per contract. If the tick is 0.25 index points, its value is `0.25 * 50 = 12.50`.

---

#### Margin and Mark to Market

**Initial margin** is the collateral required to open a position, sized by the clearing house to cover a plausible one- or two-day adverse move. **Maintenance margin** is the lower level below which the account must be topped back up to the initial level. **Variation margin** is the daily cash transfer of the day's profit or loss — not a deposit, but a realised settlement.

<table>
  <tbody>
    <tr><td><strong>Concept</strong></td><td><strong>What it is</strong></td><td><strong>Direction of cash</strong></td></tr>
    <tr><td>Initial margin</td><td>Performance bond to open</td><td>You post it; you get it back on close</td></tr>
    <tr><td>Maintenance margin</td><td>Trigger level for a call</td><td>No cash flow of its own</td></tr>
    <tr><td>Variation margin</td><td>Daily settlement of P&amp;L</td><td>Paid or received every day, permanently</td></tr>
  </tbody>
</table>

---

#### Worked Example: Three Days of a Long Position

Buy one index future at 5,000. Multiplier £50, initial margin £20,000, maintenance margin £18,000.

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td><strong>Settle</strong></td><td><strong>Points</strong></td><td><strong>Variation margin</strong></td><td><strong>Account equity</strong></td><td><strong>Action</strong></td></tr>
    <tr><td>0</td><td>5,000</td><td>—</td><td>—</td><td>£20,000</td><td>Post initial margin</td></tr>
    <tr><td>1</td><td>4,960</td><td>-40</td><td>-£2,000</td><td>£18,000</td><td>At maintenance, no call</td></tr>
    <tr><td>2</td><td>4,930</td><td>-30</td><td>-£1,500</td><td>£16,500</td><td>Below £18,000: call for £3,500</td></tr>
    <tr><td>2 (after call)</td><td>—</td><td>—</td><td>+£3,500</td><td>£20,000</td><td>Restored to initial</td></tr>
    <tr><td>3</td><td>4,995</td><td>+65</td><td>+£3,250</td><td>£23,250</td><td>—</td></tr>
  </tbody>
</table>

Checking the arithmetic: each point is worth £50, so day 1 is `-40 * 50 = -2,000`, day 2 is `-30 * 50 = -1,500`, and day 3 is `+65 * 50 = +3,250`.

Total cash deposited: `20,000 + 3,500 = 23,500`. Closing equity: `23,250`. Net loss: `-250`. Confirm directly from the price: `(4,995 - 5,000) * 50 = -250`. The daily settlements net exactly to the point-to-point move, which they must.

**Leverage.** The notional is `5,000 * 50 = 250,000` against £20,000 of initial margin, so `250,000 / 20,000 = 12.5` times. A 1% index move is `2,500`, which is 12.5% of the margin posted.

> warning **Being right and being solvent are separate events** The position above finished 65 points above its day-2 low, but a trader who could not meet the £3,500 call on day 2 would have been liquidated at 4,930 and never seen the recovery. Margin calls are settled in hours, not days, and in cash. Size futures positions against the margin path, not the expected outcome. See [Leverage and Liquidation](/risk/leverage-liquidation).

---

#### Expiry, Settlement and Basis

**Cash settlement** ends the contract with a final variation margin payment based on a defined settlement value — typically an average of the underlying index over a window, or a single reference print. Nothing is delivered. Equity index and short-term-rate futures work this way.

**Physical settlement** requires delivery of the underlying. Commodity, currency and bond futures generally do. Most participants never intend to deliver and close out before the last trading day; the ones who remain must be able to make or take delivery, which requires storage, transport or a securities account. The delivery mechanism is what anchors the future to the physical market, so it matters even to those who never use it.

**Basis** is the difference between the futures price and the spot price:

```text
basis = F - S
```

For a financial underlying paying a continuous yield `q`, no-arbitrage gives:

```text
F = S * exp((r - q) * T)
```

where `r` is the financing rate, `q` is the dividend or income yield, and `T` is the time to expiry in years.

With `S = 5,000`, `r = 4.5%`, `q = 1.8%` and `T = 0.25`:

```text
F = 5,000 * exp((0.045 - 0.018) * 0.25)
  = 5,000 * exp(0.00675)
  = 5,000 * 1.006773
  = 5,033.86
```

The basis is `+33.86` points. The future trades above spot because financing the index costs more than the dividends it yields over the quarter. As `T` shrinks the basis shrinks with it, and at expiry the future must equal the settlement value — **convergence** is enforced by the settlement rule itself, not by a market force. Deviations from the fair value above are the raw material of [cash-and-carry](/strategies/cash-carry) arbitrage, and the residual after financing and dividend uncertainty is the [basis signal](/signals/basis).

---

#### Across Asset Classes and Venues

**Equity index futures.** Cash settled against an opening or closing auction print. Quarterly expiries dominate. The fair value depends on a dividend forecast, so basis contains a genuine forecasting component rather than pure arbitrage.

**Interest rate futures.** Short-term contracts settle against a published reference rate and are quoted as `100 - rate`, so a long position profits when rates fall. Bond futures are physically delivered against a basket, with the seller choosing which bond to deliver — the *cheapest to deliver* — which embeds a delivery option in the price and complicates hedging. See [Duration and Convexity](/markets/duration-convexity).

**Commodity futures.** Physically delivered at specified locations and grades. Storage cost and convenience yield replace the dividend term, and the curve can slope either way. See [Commodities](/markets/commodities).

**FX futures.** A listed, cleared version of the FX forward, priced by interest rate parity. Most institutional FX risk is still transferred over the counter. See [FX Carry and Parity](/markets/fx-carry-parity).

**Perpetual futures.** An on-chain contract with no expiry. Instead of converging through a delivery date, it is tethered to spot by a periodic **funding payment** between longs and shorts. Funding replaces basis as the carry term, and the absence of expiry removes the roll entirely. See [Perpetual Futures](/building-blocks/perpetual-futures) and [Funding Rate](/signals/funding-rate).

---

#### Assumptions and Failure Modes

- **Assuming margin requirements are stable.** Clearing houses raise margins in volatile markets, exactly when positions are already losing. The requirement rises when your ability to meet it falls.
- **Assuming the notional is the risk.** Notional is comparable only within a contract. Compare across contracts using the currency value of a one-standard-deviation move, not the face amount.
- **Ignoring the roll.** A futures position with a horizon beyond the contract's expiry must be rolled, and the roll has a cost and a return of its own. See [Roll and Carry](/markets/roll-and-carry).
- **Assuming a continuous price history exists.** It does not. Every long futures series is a stitched construction with an explicit convention, and the convention changes the answer.
- **Ignoring the delivery option.** In physically delivered contracts, the short's choice of what and when to deliver is worth something, and it is embedded in the price.
- **Assuming the settlement price is transactable.** Settlement is often an average or an auction print, and a strategy that assumes it could have traded there at size is assuming liquidity it did not have.
- **Forgetting that variation margin is cash.** A fully hedged position with a physical leg that does not settle daily still needs cash to fund the futures leg's daily losses. Hedges have failed on funding, not on price.

---

#### See Also

* [Roll and Carry](/markets/roll-and-carry)
* [Calendar Spreads](/markets/calendar-spreads)
* [Commodities](/markets/commodities)
* [Instrument Map](/markets/instrument-map)
* [Cash and Carry](/strategies/cash-carry)
* [Leverage and Liquidation](/risk/leverage-liquidation)

---

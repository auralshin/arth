### Short Selling

> info **Metadata** Level: Intermediate | Prerequisites: Equities 101 | Tags: equities, short-selling, borrow, securities-lending, squeeze

Short selling is the sale of a security you do not own. To deliver it at settlement you must first borrow it from someone who does, and you must eventually buy it back to return it. Between those two points you are exposed to the price rising, to the lender demanding the security back, and to the cost of the borrow changing under you.

It is the mechanism that lets prices fall on information as readily as they rise on it, and it is the foundation of every relative-value structure: long-short equity, pairs trading, index arbitrage, convertible arbitrage, and cash-and-carry all require one leg to be short. It is also the leg where strategies fail operationally, because a short is a contract with three counterparties — a broker, a lender, and the market — any of which can end the position on their schedule rather than yours.

---

#### The Mechanics

1. **Locate.** Before selling short, the broker must have reasonable grounds to believe the security can be borrowed. In the United States this is a formal regulatory requirement; the practical effect everywhere is that the broker checks an inventory list.
2. **Borrow.** The lender — typically a custodian acting for index funds, pension funds or insurers — delivers the shares against collateral, usually cash equal to 102–105% of the market value, marked daily.
3. **Sell.** The shares are delivered to the buyer, who is now the legal owner. The lender has given up ownership but retains an economic claim under the loan agreement.
4. **Carry.** The short seller pays a borrow fee and passes through any dividends as **payments in lieu**. Voting rights are lost, which is why lenders recall stock before contentious votes.
5. **Cover and return.** Buy the shares back in the market and return them to the lender, releasing the collateral.

Two fee conventions exist and are easy to confuse:

```text
Rebate convention (US equities):
  net cost = collateral_rate - rebate_rate

Fee convention (most other markets):
  net cost = borrow_fee_rate,  charged on market value
```

Under the rebate convention the short seller's cash collateral earns interest, and the lender keeps a slice by paying a *rebate* below the general collateral rate. For an easy-to-borrow security the rebate is close to the market rate; for a hard-to-borrow one it can go negative, meaning the short seller pays interest on their own cash. The two conventions describe the same economics.

---

#### Worked Example: A Thirty-Day Short

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Shares sold short</td><td>10,000</td></tr>
    <tr><td>Sale price</td><td>£50.00</td></tr>
    <tr><td>Cover price after 30 days</td><td>£44.00</td></tr>
    <tr><td>Average market value over the period</td><td>£47.00 per share</td></tr>
    <tr><td>Borrow fee</td><td>8.00% per annum, act/360</td></tr>
    <tr><td>Dividend with ex-date in the period</td><td>£0.25 per share</td></tr>
    <tr><td>Initial margin requirement</td><td>50% of the short market value</td></tr>
  </tbody>
</table>

1. **Proceeds**: `10,000 * 50.00 = 500,000`.
2. **Gross gain on the price move**: `10,000 * (50.00 - 44.00) = 60,000`.
3. **Borrow cost**: `10,000 * 47.00 * 0.08 * 30 / 360 = 470,000 * 0.0066667 = 3,133.33`.
4. **Payment in lieu of dividend**: `10,000 * 0.25 = 2,500`.
5. **Net profit**: `60,000 - 3,133.33 - 2,500 = 54,366.67`.
6. **Equity committed**: `500,000 * 0.50 = 250,000`.
7. **Return on committed equity**: `54,366.67 / 250,000 = 21.7%` over 30 days.

Now the asymmetry. Suppose instead the share rose to £150:

- Loss on the price move: `10,000 * (150.00 - 50.00) = -1,000,000`.
- That is four times the £250,000 of equity committed, and the position would have been closed out long before by margin calls.

> warning **The loss is unbounded and the exposure grows as it goes against you** A long position that falls 50% becomes a smaller position. A short that rises 50% becomes a larger one, so the same adverse move demands more margin *and* represents a bigger share of the book. Short exposure must be re-sized as it moves, not set and forgotten. See [Leverage and Liquidation](/risk/leverage-liquidation).

---

#### Borrow Cost, Recalls and Squeezes

The borrow market is a supply-and-demand market like any other, and its price is set by how much lendable inventory exists relative to short interest.

<table>
  <tbody>
    <tr><td><strong>Condition</strong></td><td><strong>Typical borrow fee</strong></td><td><strong>Practical meaning</strong></td></tr>
    <tr><td>General collateral</td><td>A few tens of basis points</td><td>Ample inventory; the short is essentially free to carry</td></tr>
    <tr><td>Warm / special</td><td>Low single-digit percent</td><td>Demand is visible; the fee is a real drag on a slow thesis</td></tr>
    <tr><td>Hard to borrow</td><td>Tens of percent, occasionally more</td><td>The carry alone can exceed any plausible price decline</td></tr>
  </tbody>
</table>

Two derived measures matter. **Utilisation** is the fraction of lendable inventory that is currently on loan; as it approaches 100% the fee rises steeply and recall risk becomes material. **Days to cover** is short interest divided by average daily volume, an estimate of how long it would take shorts to exit through normal liquidity.

A **recall** occurs when the lender wants the security back — to sell it, to vote it, or because a fund flow forced their hand. The short seller must find another borrow or buy back immediately. A **buy-in** is the forced version: the broker covers on your behalf, at the market, without waiting for a good price.

A **short squeeze** is what happens when these mechanics compound. Price rises trigger margin calls and recalls; covering is itself buying; that buying raises the price further; the borrow fee spikes; and the shorts still standing face a carry cost that makes waiting irrational. Nothing about the company need have changed. The squeeze is a liquidity event in the borrow market, not a repricing of fundamentals — which is why fundamental correctness offers no protection against it.

---

#### Across Asset Classes and Regions

**US equities.** Locate requirements, `T+1` settlement, and public short-interest reporting twice a month with a lag. The rebate convention dominates.

**European equities.** Net short positions above defined thresholds must be disclosed to regulators and, above a higher threshold, publicly with the holder named. This makes crowded shorts partially observable, and it changes behaviour near the disclosure line.

**Futures.** No borrow at all. A short future is symmetric with a long future — you simply take the other side of a contract that did not previously exist. This is the single biggest structural advantage of futures for systematic strategies, and it is why index shorts are usually expressed through futures rather than baskets.

**Fixed income.** Shorting is done through the repurchase agreement (repo) market. A bond in heavy demand to borrow goes "on special" — its repo rate falls below the general collateral rate — which is the exact analogue of a hard-to-borrow equity.

**FX.** Short is meaningless as a separate concept: every position is long one currency and short another by construction. See [FX 101](/markets/fx-101).

**On-chain.** Perpetual futures allow symmetric shorting without a borrow, at the cost of a periodic funding payment that plays the role of the borrow fee. Spot shorting requires borrowing from a lending protocol, where the rate is set algorithmically by utilisation — mechanically similar to the borrow market above, but continuously observable rather than quoted by a desk. See [Perpetual Futures](/building-blocks/perpetual-futures) and [Lending and Borrowing](/building-blocks/lending-borrowing).

---

#### Assumptions and Failure Modes

- **Assuming the borrow exists at backtest time.** Historical borrow availability and fees are rarely in a price database. A short-side backtest on the full universe silently assumes every name was borrowable at zero cost, which is precisely false for the small, expensive, heavily shorted names where the signal looks strongest.
- **Assuming the fee is constant.** Borrow fees are re-rated daily and can multiply within a week of a squeeze starting. Modelling a fixed annual fee understates the cost exactly when it matters.
- **Ignoring recall risk.** A position that must be closed at an arbitrary moment is not the position you tested. Recall probability rises with utilisation and around votes and index events.
- **Forgetting dividends.** Payments in lieu are a real cash outflow, and they are not tax-symmetric with receiving a dividend in most jurisdictions.
- **Assuming shorting is always permitted.** Temporary bans on short selling in specific sectors have been imposed in multiple jurisdictions during crises. A strategy that requires shorting has regulatory tail risk with no hedge.
- **Sizing by notional rather than by risk.** Because losing shorts grow, a book equal-weighted at inception drifts towards concentration in its worst positions.

---

#### Code

```python
def short_pnl(shares, entry_price, exit_price, days_held,
              borrow_fee_annual, dividends_per_share=0.0,
              day_count=360):
    """P&L of a short, charging borrow on the average market value.

    A real book accrues the fee on each day's mark; the average is a
    reasonable approximation only when the price path is not extreme.
    """
    price_gain = shares * (entry_price - exit_price)
    average_value = shares * (entry_price + exit_price) / 2
    borrow_cost = average_value * borrow_fee_annual * days_held / day_count
    dividend_cost = shares * dividends_per_share
    return price_gain - borrow_cost - dividend_cost


def days_to_cover(short_interest_shares, average_daily_volume):
    """Crowding proxy. Above roughly 5-10 days, an orderly exit is unlikely."""
    return short_interest_shares / average_daily_volume
```

---

#### See Also

* [Equities 101](/markets/equities-101)
* [Market Participants](/markets/market-participants)
* [Futures 101](/markets/futures-101)
* [Leverage and Liquidation](/risk/leverage-liquidation)
* [Pairs Trading](/strategies/pairs)
* [Types of Risk](/risk/types)

---

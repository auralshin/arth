### Cash-and-Carry (Basis Trade) Basics

> info **Metadata** Level: Intermediate | Prerequisites: Futures, Returns, Interest Rates | Tags: basis, carry, arbitrage, futures, funding, no-arbitrage

Cash-and-carry buys an asset in the spot market and simultaneously sells a forward or futures contract on it. The two positions have no net exposure to the asset's price: whatever the spot leg gains, the short futures leg loses. What remains is the **basis** — the gap between the futures price and the spot price — which is captured as the contract converges to spot at expiry.

It is one of the oldest trades in organised markets, predating electronic trading by centuries in agricultural commodities, and it is the trade that anchors futures prices to spot prices. Its modern descendants include the Treasury basis trade, equity index arbitrage, and the crypto funding-capture trade. The mechanics differ; the economics do not.

> warning **Not Financial Advice** This page explains the arithmetic and risks of basis trades. It is not a recommendation to trade any instrument. Basis trades are typically run with leverage, and leverage is where they fail.

---

#### Why It Might Work: The Economic Rationale

The starting point is a **no-arbitrage argument**, not a forecast. Two ways of holding the asset at a future date must cost the same today:

1. Buy the asset now, finance the purchase, pay any storage cost, and receive any income the asset throws off in the interim.
2. Agree today to buy it at date `T` via a futures contract.

If the futures price exceeds the all-in cost of route 1, anyone can execute route 1 and sell route 2 for a riskless profit. Competition forces the two into line, and the resulting relationship is the **cost of carry** formula. The basis is therefore not a prediction about where prices are going; it is a statement about financing rates, storage, and income.

This raises an obvious question: if the relationship is enforced by arbitrage, why is there any profit left?

**Because the arbitrage is not free.** Executing it consumes balance sheet, requires financing at a rate that is not the theoretical risk-free rate, ties up margin at both venues, and demands the operational capacity to deliver or receive. Firms with those resources are finite in number and finite in capacity. The basis persists at the level that clears their capacity.

**Because the trade is not riskless before expiry.** Convergence is certain at delivery, but the path is not. If the basis widens after the position is on, the mark-to-market loss is real and can trigger a margin call. Being *right about the destination* and *unable to hold the position* is the standard way this trade loses money.

**Because supply and demand for the exposure is unbalanced.** Producers hedge by selling forward; consumers and speculators buy. Persistent one-sided demand for exposure shows up as a persistent premium or discount, and the carry trader is paid for taking the other side. This is the hedging-pressure account of the basis, and it is a genuine risk premium rather than an arbitrage.

**What would have to be true.** For the trade to be worth doing, the realised basis must exceed your actual all-in financing cost, including margin funding, borrow, fees, and the capital charge on the balance sheet consumed — with enough margin left over to compensate for the path risk and the operational risk of both legs. When practitioners say a basis trade "yields 4%", the relevant comparison is against their marginal funding cost, not against zero.

---

#### Formal Definition

For an asset with continuous financing rate `r`, storage cost rate `u`, and income or convenience yield `y`:

```text
F(t, T) = S_t * exp( (r + u - y) * (T - t) )
```

where:

- `S_t` is the spot price at time `t`
- `F(t, T)` is the fair futures price for delivery at `T`
- `r` is the financing rate over the period
- `u` is the storage and insurance cost, as a rate (zero for financial assets)
- `y` is the income yield — dividends for equity indices, coupons for bonds, convenience yield for physical commodities

For an equity index this simplifies to `F = S * exp((r - q) * (T - t))` with `q` the dividend yield. The **basis** and its annualised form are:

```text
basis          = F(t, T) - S_t

implied_carry  = ln( F(t, T) / S_t ) / (T - t)

implied_repo   = implied_carry + y - u
```

The `implied_repo` rate is the financing rate at which the market's futures price would be exactly fair. Comparing it to your actual financing cost is the whole trade:

```text
implied_repo > your funding cost   ->  cash-and-carry:  buy spot, sell futures
implied_repo < your funding cost   ->  reverse carry:   sell spot, buy futures
```

The reverse trade requires borrowing and shorting the physical asset, which is frequently impossible or expensive. That asymmetry is why futures can trade cheap to fair value for extended periods and rarely trade rich for long.

---

#### Worked Example: Equity Index Basis

A three-month index future. All numbers are illustrative arithmetic, not a measured result.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Spot index <code>S</code></td><td>4,800.00</td></tr>
    <tr><td>Futures price <code>F</code></td><td>4,845.00</td></tr>
    <tr><td>Time to delivery <code>T - t</code></td><td>0.25 years</td></tr>
    <tr><td>Financing rate <code>r</code></td><td>5.00%</td></tr>
    <tr><td>Dividend yield <code>q</code></td><td>1.60%</td></tr>
    <tr><td>Position size</td><td>1,000 index units (4,800,000 notional)</td></tr>
  </tbody>
</table>

1. **Fair futures price**: `4,800 * exp((0.0500 - 0.0160) * 0.25) = 4,800 * exp(0.0085) = 4,800 * 1.008536 = 4,840.97`
2. **Richness**: `4,845.00 - 4,840.97 = 4.03` index points.
3. **Implied net carry**: `ln(4,845 / 4,800) / 0.25 = 0.009331 / 0.25 = 3.7325%` per annum.
4. **Implied financing rate**: add back the dividend yield, `3.7325% + 1.60% = 5.3325%`.
5. **Edge over funding**: `5.3325% - 5.00% = 33.25` basis points annualised.
6. **Gross cash amount**: `4.03 points * 1,000 units = 4,030` over three months, which is `4,030 / 4,800,000 = 8.4` basis points of notional, or about 33.6 basis points annualised — consistent with step 5.

Now the honest part. Against 4,030 of gross edge on a 4.8 million position you must set: commissions and exchange fees on both legs; the bid-ask paid entering and exiting; the cost of tracking the index (either the full basket, with its own rebalancing, or an ETF with its own tracking error and fee); variation margin funded daily at your actual borrowing rate rather than a theoretical one; and the risk that dividends are not what you assumed. Thirty-three basis points is a thin margin, which is exactly why this business is run at very large size and modest fees, and why it is dominated by participants with the cheapest balance sheet.

---

#### The Perpetual Version: Funding Instead of Delivery

A **perpetual future** has no expiry, so there is no delivery date at which convergence is enforced. Instead, a periodic **funding payment** flows between longs and shorts, sized so that the perpetual price is pulled toward an index. When the perpetual trades above the index, longs pay shorts; when it trades below, shorts pay longs. See [Perpetual Futures](/building-blocks/perpetual-futures) and [Funding Rate](/signals/funding-rate).

The basis trade becomes: hold the spot asset, short the perpetual against it, and collect funding for as long as it is positive.

```text
delta-neutral by construction:  long 1 unit spot, short 1 unit perpetual

periodic P&L = funding_rate * notional   (received when funding is positive)
```

Continuing with illustrative numbers: a funding rate of 0.01% per eight-hour interval, on a 100,000 short perpetual position:

1. **Per interval**: `100,000 * 0.0001 = 10.00`
2. **Per day** (three intervals): `30.00`
3. **Annualised, simple**: `0.03% * 365 = 10.95%` on the perpetual notional

Three structural differences from the dated-futures version matter, and all three cut against the trader:

- **There is no convergence date.** The dated trade has a certain terminal payoff; the perpetual trade has an uncertain stream. Funding can fall to zero or turn negative at any time, and it tends to do so precisely when the crowd has already put the trade on.
- **The carry is a floating rate, not a locked-in one.** With a dated future you know your return at inception. With a perpetual you know only the current rate.
- **The hedge leg is margined and can be liquidated.** A dated futures short and a perpetual short both require margin, but perpetual venues typically liquidate aggressively and the spot leg's gains may sit in a different account or a different venue entirely. See [Delta-Neutral Strategies](/strategies/delta-neutral) for a worked liquidation example.

See also [Roll and Carry](/markets/roll-and-carry) for how dated contracts handle the same problem through rolling, and [Basis](/signals/basis) for reading the signal itself.

---

#### In Practice Across Asset Classes

**Equity index futures.** The most competitive version. Fair value depends on the dividend forecast and the repo rate for the basket, both of which are estimates. The trade is usually expressed against an ETF or a full basket, and index reconstitution dates create predictable dislocations. See [Equity Indices](/markets/equity-indices).

**Government bonds.** The Treasury basis trade is cash-and-carry against a bond futures contract with a *deliverable basket*, so the short has an embedded option over which bond to deliver — the cheapest-to-deliver. Financing is done in repo, and the trade is run at very high leverage because the gross basis is tiny. Repo rate spikes and haircut increases are the classic failure mechanism. See [Fixed Income 101](/markets/fixed-income-101).

**Commodities.** Storage cost and convenience yield are real, physical, and variable. Full storage capacity turns the carry relationship on its head; a shortage produces backwardation, where futures trade below spot and the cash-and-carry direction reverses. Delivery involves warehouses, grades, and locations, so "buy spot" is a logistics operation. See [Commodities](/markets/commodities).

**FX.** The equivalent relationship is **covered interest parity**: the forward points must equal the interest rate differential, or a riskless arbitrage exists. Persistent deviations — the cross-currency basis — are a well-documented consequence of balance-sheet constraints on the banks that would otherwise arbitrage them, and are the clearest real-world illustration that "arbitrage" is a service with a price. See [FX Carry and Parity](/markets/fx-carry-parity).

**Crypto.** Both versions exist side by side: dated futures with a convergence date, and perpetuals with funding. The spot leg carries custody and venue risk that has no analogue in listed markets, the two legs are frequently on different venues with no cross-margining, and the basis is far more volatile than in listed futures — which means both larger gross returns and larger path risk. See [Basis Unwind](/case-studies/basis-unwind) and [Funding Trends](/strategies/funding-trends).

---

#### Assumptions and Failure Modes

- **Assumes financing at the assumed rate, for the whole horizon.** Repo rates are not fixed. A financing squeeze raises the cost of carrying the spot leg after the trade is on, and there is no mechanism to pass that cost to the futures leg. This has repeatedly turned a positive-carry trade negative.
- **Assumes margin can be met on the path.** The futures leg is marked daily; the spot leg may not generate cash. A rally forces cash out of the door on the short future while the offsetting gain remains unrealised. Solvency and liquidity are different constraints, and this trade is where the difference bites. See [Leverage and Liquidation](/risk/leverage-liquidation).
- **Assumes the two legs are fungible at expiry.** Where the futures contract settles against an index or a deliverable basket that differs from the spot position held, residual basis risk remains all the way to delivery.
- **Assumes income is known.** Dividend forecasts, coupon dates, and convenience yields are estimates. An unexpected dividend change moves fair value directly.
- **Assumes the short leg is available.** The reverse carry requires borrowing the physical asset. When it cannot be borrowed, futures can stay cheap indefinitely and there is no trade to put on.
- **Assumes venue and counterparty integrity.** The trade is only neutral if both legs settle. Exchange failure, custody failure, withdrawal suspension, or the inability to move collateral between venues converts a hedged book into two unhedged ones.
- **For perpetuals: assumes funding stays positive.** Funding is set by positioning. A crowded carry trade drives funding toward zero, and a sharp move can flip its sign while everyone is on the same side. The historical average funding rate over a short sample is a particularly unreliable forecast.
- **Leverage magnifies all of the above.** A trade with 30 basis points of annual edge only produces meaningful returns at high leverage, and at high leverage a small adverse basis move is a large capital loss. That is not a distortion of the strategy — it is the strategy.

---

#### Code

```python
import numpy as np


def fair_forward(spot, financing_rate, income_yield, years, storage_rate=0.0):
    """Cost-of-carry fair value. Rates are continuously compounded and
    expressed per annum, matching `years`."""
    return spot * np.exp((financing_rate + storage_rate - income_yield) * years)


def implied_repo_rate(spot, futures, income_yield, years, storage_rate=0.0):
    """The financing rate at which the observed futures price is fair.

    Compare against your own marginal funding cost, not against a
    theoretical risk-free rate: the gap between those two is where
    most of an apparent basis 'edge' actually lives.
    """
    net_carry = np.log(futures / spot) / years
    return net_carry + income_yield - storage_rate


def perpetual_carry_pnl(notional, funding_rate_per_interval, intervals):
    """Funding collected by a short perpetual leg held against spot.

    Positive funding means longs pay shorts. The rate is floating and
    can invert, so this is an accrual, not a locked-in return.
    """
    return notional * funding_rate_per_interval * intervals


def annualised_funding(funding_rate_per_interval, intervals_per_day=3):
    """Simple annualisation of a per-interval funding rate."""
    return funding_rate_per_interval * intervals_per_day * 365
```

---

#### See Also

* [Basis](/signals/basis)
* [Roll and Carry](/markets/roll-and-carry)
* [Perpetual Futures](/building-blocks/perpetual-futures)
* [Delta-Neutral Strategies](/strategies/delta-neutral)
* [FX Carry and Parity](/markets/fx-carry-parity)
* [Basis Unwind](/case-studies/basis-unwind)

---

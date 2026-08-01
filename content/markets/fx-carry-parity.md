### FX Carry and Interest Rate Parity

> info **Metadata** Level: Intermediate | Prerequisites: FX 101, Returns | Tags: fx, carry, parity, forwards, skew, arbitrage

A forward exchange rate is not a forecast. It is an arithmetic consequence of the two currencies' interest rates, enforced by an arbitrage that anyone with access to both money markets can execute. If you can borrow euros, convert to dollars, deposit the dollars, and simultaneously agree today to convert back at a fixed rate, then the forward rate is pinned — any other value hands you a riskless profit.

That relationship is **covered interest parity**. Its uncovered cousin — the claim that the *expected* future spot rate equals the forward — is not an arbitrage and is not enforced. The gap between what the forward implies and what spot actually does is the FX **carry trade**, one of the oldest and most persistently studied return sources in markets, and one with a distinctly unpleasant loss distribution.

---

#### Covered Interest Parity

```text
F = S * (1 + r_quote * T) / (1 + r_base * T)
```

where:

- `S` is the spot rate, expressed as units of the quote currency per unit of the base currency
- `F` is the forward rate for delivery in `T` years
- `r_base` is the interest rate on the base currency
- `r_quote` is the interest rate on the quote currency
- `T` is the time to the forward value date, computed on the relevant day-count convention

The continuously compounded form, which is more convenient for pricing, is `F = S * exp((r_quote - r_base) * T)`.

The rule reads plainly once you see it: **the currency with the higher interest rate trades at a forward discount**. It has to. Otherwise you would earn the higher rate and lock in the exchange rate, which is a riskless return above the lower rate.

**Forward points** are the quoted difference, expressed in pips:

```text
forward_points = F - S
```

Dealers quote the points, not the outright, precisely because the points move with rates while the spot moves with everything else.

---

#### Worked Example: Parity and the Carry Trade

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Spot EUR/USD</td><td>1.0850</td></tr>
    <tr><td>1-year USD rate (quote currency)</td><td>4.80%</td></tr>
    <tr><td>1-year EUR rate (base currency)</td><td>2.90%</td></tr>
    <tr><td>Tenor</td><td>1 year, simple interest, day count ignored for clarity</td></tr>
  </tbody>
</table>

**Step 1 — the forward.**

```text
F = 1.0850 * (1 + 0.0480) / (1 + 0.0290)
  = 1.0850 * 1.0480 / 1.0290
  = 1.0850 * 1.018465
  = 1.105034
```

Forward points: `1.105034 - 1.085000 = 0.020034`, or **200.3 pips**. The dollar, with the higher rate, is at a forward discount: you need more dollars per euro in a year's time.

**Step 2 — the carry trade.** Borrow the low-yielder, invest in the high-yielder, leave the currency risk open.

1. Borrow EUR 1,000,000 for one year at 2.90%. Repayment due: `1,000,000 * 1.0290 = 1,029,000` euros.
2. Convert at spot: `1,000,000 * 1.0850 = 1,085,000` US dollars.
3. Deposit at 4.80%: `1,085,000 * 1.0480 = 1,137,080` dollars in a year.
4. In a year, convert back at whatever spot then prevails, and repay the euro loan.

**Step 3 — the breakeven.** The trade breaks even when the dollars buy exactly the euros owed:

```text
S_breakeven = 1,137,080 / 1,029,000 = 1.105034
```

That is precisely the forward rate. This is the entire content of uncovered interest parity: **the forward is the exchange rate at which the carry trade earns nothing.** Betting on carry is betting that spot will not reach the forward.

**Step 4 — outcomes.**

<table>
  <tbody>
    <tr><td><strong>Spot in one year</strong></td><td><strong>EUR received</strong></td><td><strong>Profit (EUR)</strong></td><td><strong>Return on EUR 1m</strong></td></tr>
    <tr><td>1.0500 (euro weaker)</td><td>1,082,933</td><td>+53,933</td><td>+5.39%</td></tr>
    <tr><td>1.0850 (unchanged)</td><td>1,048,000</td><td>+19,000</td><td>+1.90%</td></tr>
    <tr><td>1.1050 (at the forward)</td><td>1,029,000</td><td>0</td><td>0.00%</td></tr>
    <tr><td>1.1500 (euro stronger)</td><td>988,765</td><td>-40,235</td><td>-4.02%</td></tr>
  </tbody>
</table>

Each row is `1,137,080 / S_1`, less the `1,029,000` owed. The unchanged-spot row returns `1.0480 / 1.0290 - 1 = 1.85%` on the converted amount, or 1.90% measured against the euro principal borrowed — the interest differential, which is what the trade is designed to harvest.

> warning **The differential is not the edge** The carry trade earns the rate differential only if spot fails to move to the forward. Covered interest parity guarantees that hedging the currency risk removes the differential exactly. There is no version of this trade that captures the yield without holding the currency risk.

---

#### Why Carry Has Negative Skew

Empirically, high-yielding currencies have tended not to depreciate by the full interest differential over long samples — the "forward premium puzzle" — which is why carry has been a durable strategy. But its return distribution is badly asymmetric, for structural reasons rather than statistical coincidence.

- **Carry accumulates slowly and is paid daily.** The interest differential drips in continuously and is invisible on a chart.
- **The unwind is fast and self-reinforcing.** Carry positions are levered and crowded. A rise in volatility triggers risk limits; closing a carry position means buying the funding currency; that buying strengthens the funding currency, which triggers more limits. The exit is one-directional.
- **Central banks lean against gradual moves and are overwhelmed by fast ones.** Intervention smooths small deviations, suppressing measured volatility, and then fails discontinuously.
- **The high-yielder is usually high-yielding for a reason.** A high policy rate frequently reflects inflation risk, external funding needs, or a currency being defended. Those conditions resolve abruptly.

The result is a series of small gains punctuated by large losses. As noted on [Sharpe Ratio](/quant-math/sharpe), this is exactly the profile that a two-moment performance statistic flatters: the Sharpe ratio measures the calm periods and is silent about the shape of the loss. [Sortino](/quant-math/sortino), [drawdown](/quant-math/drawdown) and [CVaR](/quant-math/var-cvar) are all more informative here, and none of them are sufficient either.

---

#### When Parity Breaks

Covered interest parity is an arbitrage, so it should never break. It does, and the deviation has a name: the **cross-currency basis**. Persistent non-zero bases have been widely documented since the 2008 financial crisis. The reasons are frictions in the arbitrage rather than mispricing:

- **Balance sheet is not free.** The arbitrage requires borrowing, lending and a forward, all of which consume regulatory capital and leverage-ratio capacity. If the profit is smaller than the capital charge, the trade does not happen.
- **Counterparty and credit limits bind.** The rates in the formula are the rates *you* can transact at, which differ across institutions and by credit quality.
- **Demand for dollar funding is one-directional.** Non-US institutions holding dollar assets need dollar funding, and there is no symmetric flow the other way, so the basis has a persistent sign.
- **Quarter-ends and year-ends distort it.** Balance-sheet reporting dates cause the basis to widen sharply for value dates spanning them, an effect visible every quarter.

For a practitioner the implication is that the "risk-free rate" implied by the FX forward market and the one implied by the domestic money market are different numbers, and hedging costs must be computed from the forward that can actually be traded.

---

#### Across Regions and Instruments

**G10 currencies.** Deep forward markets out to several years; the basis is small but not zero and widens predictably around reporting dates.

**Emerging markets.** Carry differentials are large, and the local forward may be non-deliverable — settled in dollars against an official fixing. Convertibility and capital-control risk are part of the position whether or not they are modelled.

**Pegged currencies.** Forward points on a peg price the probability of the peg breaking, not a smooth rate differential. Historical realised volatility is close to useless as a risk input.

**Fixed income.** The same logic, one asset class over: a hedged foreign bond earns the foreign yield plus the hedge cost, which by parity is approximately the domestic yield. Cross-border yield pickup is largely an illusion once hedged, and the residual is the cross-currency basis.

**On-chain.** Lending rates on the same stablecoin differ across protocols and chains, and the spread is the analogue of a cross-currency basis: an apparent arbitrage that persists because moving collateral costs gas, time, bridge risk and smart-contract exposure. See [Lending and Borrowing](/building-blocks/lending-borrowing) and [Bridges](/building-blocks/bridges). The mechanism is different; the lesson — that an unexploited spread usually prices a friction you have not measured — is the same.

---

#### Assumptions and Failure Modes

- **Assuming the parity rates are observable.** The formula needs the borrowing and lending rates available to you, on the exact tenor, at the exact value dates. Substituting a published benchmark rate produces a "deviation" that is really a measurement error.
- **Ignoring day-count conventions.** Money market rates use act/360 in some currencies and act/365 in others. Applying the wrong one to a one-year forward introduces an error of roughly 1.4% of the rate — small in absolute terms, large relative to a basis.
- **Assuming uncovered parity holds.** It is a hypothesis about expectations, not an arbitrage. Long samples have rejected it; that rejection is the carry trade, and it is not a free lunch.
- **Estimating carry risk from volatility alone.** The distribution is skewed and fat-tailed. Position sizing calibrated on realised volatility systematically over-sizes carry positions in calm regimes.
- **Assuming diversification across many carry pairs helps.** Carry trades share a common risk factor — global risk appetite — so they unwind together. A basket of ten carry pairs is closer to one position than to ten.
- **Ignoring the funding side.** The trade is levered by construction. A funding squeeze can force an exit at the worst point regardless of the view.

---

#### Code

```python
def forward_rate(spot, rate_base, rate_quote, years, simple=True):
    """Covered interest parity. Rates must be for the same tenor and value dates.

    spot is quote-currency units per base-currency unit.
    """
    if simple:
        return spot * (1 + rate_quote * years) / (1 + rate_base * years)
    import math
    return spot * math.exp((rate_quote - rate_base) * years)


def carry_pnl(notional_base, spot_0, spot_1, rate_base, rate_quote, years):
    """P&L of an unhedged carry trade, expressed in the base currency.

    Borrow the base, invest the quote, unwind at spot_1. Breaks even
    when spot_1 equals the forward implied by the same inputs.
    """
    owed_base = notional_base * (1 + rate_base * years)
    quote_proceeds = notional_base * spot_0 * (1 + rate_quote * years)
    return quote_proceeds / spot_1 - owed_base
```

---

#### See Also

* [FX 101](/markets/fx-101)
* [Roll and Carry](/markets/roll-and-carry)
* [Yield Curves](/markets/yield-curves)
* [Sharpe Ratio](/quant-math/sharpe)
* [VaR and CVaR](/quant-math/var-cvar)
* [Cash and Carry](/strategies/cash-carry)

---

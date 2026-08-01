### Options 101

> info **Metadata** Level: Beginner | Prerequisites: Returns, Forwards and futures | Tags: derivatives, options, calls, puts, moneyness, optionality

An option is a contract that gives its holder the right, but not the obligation, to buy or sell an asset at a fixed price on or before a fixed date. The holder pays a premium up front for that right. The seller receives the premium and takes on the obligation to deliver if the holder exercises. Everything else in derivatives pricing — the Greeks, volatility surfaces, exotic structures — is machinery built on top of this single asymmetry.

That asymmetry is what makes options different from a forward or a future. A forward locks in a price and you are committed in both directions. An option lets you walk away, which means its payoff is a bent line rather than a straight one, and a bent payoff cannot be replicated by holding a fixed amount of the underlying. Pricing an option therefore requires a view on how much the underlying will move, not just where it will end up.

---

#### Formal Definition

Write `S_T` for the price of the underlying at expiry and `K` for the strike. The payoffs at expiry are:

```text
Call payoff  = max(S_T - K, 0)
Put payoff   = max(K - S_T, 0)
```

where:

- `K` is the **strike** (or exercise) price, fixed when the contract is written
- `T` is the **expiry** (or maturity), the date the right ends
- `S_T` is the underlying price observed at expiry
- the **premium** is the price paid today for the contract; it is a sunk cost and does not appear in the payoff

The buyer is **long** the option and has limited loss (the premium) with the full payoff as upside. The seller is **short** and has a bounded gain (the premium) with an obligation that is, for a call, theoretically unbounded. Note that the payoff functions above are gross: subtract the premium to get profit and loss.

A position is described by four things: right (call or put), direction (long or short), strike, and expiry. "Long the 100-strike December call" is a complete specification once the underlying and contract size are known.

---

#### Intrinsic Value and Time Value

The premium splits into two parts:

```text
Premium = Intrinsic value + Time value

Intrinsic (call) = max(S - K, 0)
Intrinsic (put)  = max(K - S, 0)
Time value       = Premium - Intrinsic
```

Intrinsic value is what the option would be worth if it expired right now. Time value is everything else: the compensation for the chance that the underlying moves further in your favour before expiry. Time value is largest at-the-money, because that is where the outcome is most uncertain, and it decays to zero at expiry.

---

#### Worked Example

Take an underlying trading at `S = 100`, one year to expiry, a 20% volatility, and a zero interest rate. Call prices under a standard model come out as follows. The split into intrinsic and time value is pure arithmetic.

<table>
  <tbody>
    <tr><td><strong>Strike K</strong></td><td><strong>Call premium</strong></td><td><strong>Intrinsic</strong></td><td><strong>Time value</strong></td><td><strong>Moneyness</strong></td></tr>
    <tr><td>80</td><td>21.19</td><td>20.00</td><td>1.19</td><td>Deep in-the-money</td></tr>
    <tr><td>90</td><td>13.59</td><td>10.00</td><td>3.59</td><td>In-the-money</td></tr>
    <tr><td>100</td><td>7.97</td><td>0.00</td><td>7.97</td><td>At-the-money</td></tr>
    <tr><td>110</td><td>4.29</td><td>0.00</td><td>4.29</td><td>Out-of-the-money</td></tr>
    <tr><td>120</td><td>2.15</td><td>0.00</td><td>2.15</td><td>Deep out-of-the-money</td></tr>
  </tbody>
</table>

Reading the table:

1. **The 80-strike call** costs 21.19 but 20.00 of that is already owed to you by the price level. You are paying 1.19 for optionality — the residual chance that the underlying falls below 80 and you avoid a loss you would have taken on the stock itself.
2. **The 100-strike call** has no intrinsic value at all. The entire 7.97 is time value. This is the maximum: no other strike in the table carries more.
3. **The 120-strike call** is worth 2.15 despite being 20% away from the money. That is the market's price for a one-in-several chance of a large move.
4. **Time value is not monotone in strike.** It rises from 1.19 at K=80 to a peak at the money and falls again to 2.15 at K=120.

At expiry, if the underlying finishes at 106, the 100-strike call pays `max(106 - 100, 0) = 6.00`. Against a premium of 7.97 that is a loss of 1.97 — the option finished in-the-money and the buyer still lost money. The break-even for a long call held to expiry is `K + premium = 107.97`.

---

#### Moneyness

**Moneyness** describes where the strike sits relative to the current price. Three conventions are in common use and they are not interchangeable:

- **Spot moneyness**: `K / S` or `S / K`. Simple, but ignores carry, so it mislabels long-dated options when rates or dividends are large.
- **Forward moneyness**: `K / F`, where `F` is the forward price to expiry. The right convention for anything beyond a few weeks, because the forward is what the option actually references.
- **Standardised (log) moneyness**: `ln(K / F) / (sigma * sqrt(T))`. This measures distance in standard deviations, so a 10% out-of-the-money option is "far" at one week and "near" at two years. This is the natural axis for comparing strikes across expiries — see [The Volatility Surface](/derivatives/vol-surface).

> info **Delta as moneyness** Desks often quote strikes by delta rather than by price — a "25-delta put" rather than "the 92 strike". Delta is scale-free and adjusts automatically for volatility and maturity, which is why it is the standard quoting axis in FX. See [The Greeks](/derivatives/greeks).

---

#### European, American, and Bermudan Exercise

- **European**: exercisable only at expiry. Almost all index options, most FX options, and all cash-settled options on futures in many markets.
- **American**: exercisable at any time up to expiry. Standard for single-stock equity options in the US and for most options on futures.
- **Bermudan**: exercisable on a fixed schedule of dates. Common in rates (swaptions embedded in callable bonds).

An American option is worth at least as much as the otherwise identical European option, because it offers strictly more rights. The gap is the **early exercise premium**, and it is quantified in [Binomial Trees](/derivatives/binomial-trees).

A standard result: an American call on an asset that pays no income is never optimally exercised early. Exercising throws away the remaining time value and pays the strike sooner than necessary. If you want out, selling the option always dominates. The result fails as soon as the underlying pays a dividend large enough to outweigh the interest saved by deferring, which is why US single-stock calls are sometimes exercised the day before an ex-dividend date.

American puts are different. Exercising a deep in-the-money put converts the position into cash immediately and starts earning interest on the strike. That can be worth more than the remaining time value, so early exercise of puts is genuinely optimal in some states.

> warning **A deep in-the-money European put can trade below its intrinsic value** With `S = 50`, `K = 100`, two years to expiry and a 5% rate, the put is worth about 40.61 while `K - S = 50`. You cannot capture the difference, because you cannot exercise before expiry. This is not an arbitrage; it is the present value of the strike, `100 * exp(-0.05 * 2) = 90.48`, doing its work.

---

#### In Practice Across Asset Classes

**Single-stock equities.** American exercise, physical settlement, 100 shares per contract in the US. Contract terms are adjusted for splits, special dividends, and mergers, so the "100 strike" on a stock that has had a corporate action may reference an unusual multiplier — see [Corporate Actions](/markets/corporate-actions). Ordinary dividends are not adjusted for, which is why they show up in the option price instead.

**Index options.** European and cash-settled. Settlement is often against a special opening quotation rather than the close, which matters for anyone holding to expiry. See [Equity Indices](/markets/equity-indices).

**FX options.** European, quoted in volatility terms rather than premium, and structured around delta rather than strike: the standard grid is at-the-money, 25-delta and 10-delta risk reversals and butterflies. Both currencies carry an interest rate, so "the underlying" has two carry legs. A call on EUR/USD is simultaneously a put on USD/EUR, which is a genuine source of confusion. See [FX 101](/markets/fx-101).

**Interest rate options.** Caps and floors are strips of options on forward rates; swaptions are options to enter a swap. The underlying is a rate, not a price, so the payoff is scaled by an annuity factor and the sign conventions invert relative to equities. See [Fixed Income 101](/markets/fixed-income-101).

**Commodity options.** Usually options on futures rather than on spot, with American exercise and physical delivery into a futures position. Seasonality in the underlying forward curve means the term structure of volatility is shaped by the delivery calendar, not just by time. See [Commodities](/markets/commodities).

**On-chain.** Most on-chain volume sits in [perpetual futures](/building-blocks/perpetual-futures) rather than options, and perpetuals have linear payoffs — no optionality. On-chain option protocols do exist and are typically European and cash-settled against an [oracle](/building-blocks/oracles) price, which introduces a settlement risk that listed markets do not have. Note also that a liquidity provider in a constant-product pool holds a position with option-like curvature; see [Impermanent Loss](/building-blocks/impermanent-loss).

---

#### Assumptions and Failure Modes

- **The quoted premium assumes you can transact at it.** Option bid-ask spreads are wide relative to the premium, especially for far out-of-the-money strikes. A 2.15 option quoted 1.95 / 2.35 costs you 9% of the premium to enter and exit.
- **"Limited loss" applies to the buyer only.** A short option position has an obligation, is margined, and can be closed out by the clearing house against your wishes. See [Leverage & Liquidation](/risk/leverage-liquidation).
- **Payoff diagrams ignore the path.** They show what happens at expiry. Before expiry, mark-to-market losses on a short position can force a liquidation that the expiry payoff would never have produced.
- **Contract multipliers are easy to get wrong.** A US equity option controls 100 shares; index and futures options use their own multipliers. A position that looks small in contract count may not be.
- **Dividends and corporate actions change the contract.** An option on a stock is an option on a legal entitlement, not on a price series, and the entitlement can be redefined mid-life.
- **Early exercise is a right you must actively manage.** Short American options can be assigned at any time, including overnight, leaving you with an unhedged underlying position the next morning.

---

#### Code

```python
def call_payoff(spot_at_expiry, strike):
    return max(spot_at_expiry - strike, 0.0)


def put_payoff(spot_at_expiry, strike):
    return max(strike - spot_at_expiry, 0.0)


def decompose_premium(premium, spot, strike, is_call):
    """Split a quoted premium into intrinsic and time value.

    Time value can be negative for deep in-the-money European options,
    because intrinsic here is measured against spot, not against the forward.
    """
    intrinsic = max(spot - strike, 0.0) if is_call else max(strike - spot, 0.0)
    return {"intrinsic": intrinsic, "time_value": premium - intrinsic}
```

---

#### See Also

* [Payoffs & Put-Call Parity](/derivatives/payoffs-parity)
* [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication)
* [The Greeks](/derivatives/greeks)
* [Black-Scholes](/derivatives/black-scholes)
* [Futures 101](/markets/futures-101)
* [Volatility](/quant-math/volatility)

---

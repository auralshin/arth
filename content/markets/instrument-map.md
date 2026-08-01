### The Instrument Map

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: markets, instruments, derivatives, orientation, taxonomy

There are a few thousand tradable instrument types and about four questions that classify almost all of them. Is it a claim on an asset or a contract referencing one? Does its value move one-for-one with the underlying or not? Do you pay the full amount up front? And who stands between you and your counterparty?

Answer those four and you know most of what matters operationally: how much capital the position ties up, what the risk profile looks like, what can go wrong in settlement, and which of the pages in this section applies. This page is the orientation map; every branch below has its own page.

---

#### The Four Axes

**Cash versus derivative.** A *cash* instrument is a claim you own — a share, a bond, a barrel of oil in a tank. A *derivative* is a contract whose value is defined by reference to something else. Owning a share makes you a residual claimant on a company; owning a future on an index makes you a party to an agreement with a clearing house.

**Linear versus non-linear.** A *linear* instrument's value changes proportionally with the underlying: move the underlying 1%, the position moves about 1% of its notional. Futures, forwards, and swaps are linear. *Non-linear* instruments — options and anything built from them — have a sensitivity that itself changes with the underlying. Non-linearity is why the [Greeks](/derivatives/greeks) exist as a separate subject.

**Funded versus unfunded.** A *funded* position requires you to pay the full economic value at the outset: buying shares costs the price of the shares. An *unfunded* position requires only collateral: a futures position of £1m notional might require £80,000 of margin. Unfunded exposure is not free — you still bear the full economic risk, and the financing cost is embedded in the price rather than paid as interest.

**Exchange-traded versus over-the-counter (OTC).** Exchange-traded instruments are standardised, cleared through a central counterparty, and priced on a public book. OTC instruments are bilateral contracts, negotiable in every term, and carry counterparty credit risk unless separately cleared or collateralised.

---

#### The Map

<table>
  <tbody>
    <tr><td><strong>Instrument</strong></td><td><strong>Cash / deriv.</strong></td><td><strong>Linear?</strong></td><td><strong>Funded?</strong></td><td><strong>Typical venue</strong></td><td><strong>Main risk beyond price</strong></td></tr>
    <tr><td>Common shares</td><td>Cash</td><td>Linear</td><td>Funded</td><td>Exchange</td><td>Corporate events changing the claim</td></tr>
    <tr><td>Government / corporate bonds</td><td>Cash</td><td>Near-linear</td><td>Funded</td><td>OTC</td><td>Credit, and convexity at large moves</td></tr>
    <tr><td>FX spot</td><td>Cash</td><td>Linear</td><td>Funded</td><td>OTC</td><td>Settlement across time zones</td></tr>
    <tr><td>Futures</td><td>Derivative</td><td>Linear</td><td>Unfunded (margin)</td><td>Exchange</td><td>Margin calls, expiry and roll</td></tr>
    <tr><td>Forwards, including FX forwards</td><td>Derivative</td><td>Linear</td><td>Unfunded</td><td>OTC</td><td>Counterparty credit</td></tr>
    <tr><td>Interest rate swaps</td><td>Derivative</td><td>Near-linear</td><td>Unfunded</td><td>OTC, mostly cleared</td><td>Curve shape, not just level</td></tr>
    <tr><td>Options</td><td>Derivative</td><td>Non-linear</td><td>Premium paid up front</td><td>Both</td><td>Volatility and time decay</td></tr>
    <tr><td>Credit default swaps</td><td>Derivative</td><td>Non-linear in default</td><td>Unfunded</td><td>OTC, mostly cleared</td><td>Jump to default; documentation</td></tr>
    <tr><td>Exchange-traded funds</td><td>Cash wrapper</td><td>Linear</td><td>Funded</td><td>Exchange</td><td>Tracking error; creation mechanics</td></tr>
    <tr><td>Perpetual futures</td><td>Derivative</td><td>Linear</td><td>Unfunded (margin)</td><td>Mostly on-chain</td><td>Funding payments; liquidation</td></tr>
  </tbody>
</table>

Each row has its own page: shares in [Equities 101](/markets/equities-101), bonds in [Fixed Income 101](/markets/fixed-income-101), spot FX in [FX 101](/markets/fx-101), futures in [Futures 101](/markets/futures-101), forwards and parity in [FX Carry and Parity](/markets/fx-carry-parity), swaps in [Curve Construction](/markets/curve-construction), options in [Options 101](/derivatives/options-101), credit default swaps in [CDS](/credit/cds), index wrappers in [Equity Indices](/markets/equity-indices), and the on-chain variant in [Perpetual Futures](/building-blocks/perpetual-futures).

---

#### Worked Example: One Exposure, Four Wrappers

An investor wants £1,000,000 of exposure to an equity index trading at 5,000. Compare the ways to obtain it.

<table>
  <tbody>
    <tr><td><strong>Route</strong></td><td><strong>Construction</strong></td><td><strong>Capital committed</strong></td></tr>
    <tr><td>Index fund / ETF</td><td>Buy £1,000,000 of units at the market price</td><td>£1,000,000</td></tr>
    <tr><td>Index future</td><td>Index 5,000, multiplier £50 = £250,000 per contract; buy 4</td><td>£80,000 initial margin at 8%</td></tr>
    <tr><td>Call options</td><td>At-the-money calls, delta 0.50, 100 units per contract on a £500 tracker</td><td>£60,000 premium</td></tr>
    <tr><td>Total return swap</td><td>Bilateral contract paying index return against a financing rate</td><td>Negotiated collateral, often 5–15%</td></tr>
  </tbody>
</table>

Working the futures line: one contract is `5,000 * 50 = 250,000`, so `1,000,000 / 250,000 = 4` contracts, and `4 * 250,000 * 0.08 = 80,000` of margin.

Working the options line: one contract covers 100 units of a £500 tracker, so its notional is `100 * 500 = 50,000`. At a delta of 0.50 each contract delivers `50,000 * 0.50 = 25,000` of index exposure, so `1,000,000 / 25,000 = 40` contracts are needed. At a premium of £15 per unit that is `40 * 100 * 15 = 60,000`.

The four routes are not equivalent. The ETF gives permanent exposure and the dividends. The future gives the same directional exposure for 8% of the cash, but the price already embeds financing — you do not get the dividends and you do not avoid the funding cost, you pay it through the basis (see [Futures 101](/markets/futures-101)). The options give only 40 delta-adjusted exposure *today*: after a 5% move the delta is no longer 0.50, and the position needs rebalancing. The swap moves the whole thing bilateral, adding counterparty risk and removing exchange transparency.

> warning **Unfunded is not unleveraged** The futures route commits £80,000 but carries £1,000,000 of risk. A 10% index fall costs £100,000 — more than the margin posted. Capital committed and risk taken are separate quantities, and confusing them is the most common cause of forced liquidation. See [Leverage and Liquidation](/risk/leverage-liquidation).

---

#### Reading the Rest of This Section

The pages divide by underlying, because the conventions differ far more than the mathematics does.

**Equities** — [Equities 101](/markets/equities-101), [Corporate Actions](/markets/corporate-actions), [Short Selling](/markets/short-selling), [Equity Indices](/markets/equity-indices). The distinctive problems are ownership events that change the share count and the mechanics of borrowing to sell short.

**Futures and commodities** — [Futures 101](/markets/futures-101), [Roll and Carry](/markets/roll-and-carry), [Calendar Spreads](/markets/calendar-spreads), [Commodities](/markets/commodities). The distinctive problem is expiry: contracts die, so any long history is a construction rather than an observation.

**Foreign exchange** — [FX 101](/markets/fx-101), [FX Carry and Parity](/markets/fx-carry-parity). The distinctive feature is that every price is a ratio of two things that both move, and that interest rate differentials are enforced by arbitrage.

**Fixed income** — [Fixed Income 101](/markets/fixed-income-101), [Yield Curves](/markets/yield-curves), [Duration and Convexity](/markets/duration-convexity), [Curve Construction](/markets/curve-construction). The distinctive feature is that the instrument has a known terminal value and a mechanical, non-linear price-yield relationship.

---

#### Assumptions and Failure Modes

- **Assuming a wrapper is neutral.** The same economic exposure delivered through an ETF, a future, and a swap has different tax treatment, different financing, different collateral, and different behaviour in stress. The wrapper is part of the trade.
- **Assuming "linear" means "safe".** Linear instruments have unbounded loss in both directions. The non-linear instrument with a capped premium can be the more conservative choice.
- **Treating notional as risk.** A £1m notional five-year swap and a £1m notional thirty-year swap have very different risk. For rates, [DV01](/markets/duration-convexity) is the comparable unit, not notional.
- **Ignoring counterparty risk on OTC positions.** An uncollateralised bilateral contract is worth what the counterparty can pay. Collateral agreements and clearing exist precisely because this failed at scale.
- **Assuming exchange-traded means liquid.** Listing is not liquidity. Many listed contracts trade rarely, and their settlement prices are marks rather than transactable levels.

---

#### See Also

* [Market Participants](/markets/market-participants)
* [Futures 101](/markets/futures-101)
* [Fixed Income 101](/markets/fixed-income-101)
* [Options 101](/derivatives/options-101)
* [Trading Foundations](/trading-foundations)
* [Leverage and Liquidation](/risk/leverage-liquidation)

---

### Equities 101

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: equities, shares, settlement, dividends, valuation

A common share is a residual claim on a company. After employees, suppliers, lenders and tax authorities have been paid, whatever remains belongs to the shareholders — as dividends, as buybacks, or as retained value inside the business. That "after everyone else" position is what makes equity risky and what gives it an unbounded upside: a bond's best case is being repaid in full, while a share has no ceiling.

Shares are also the most operationally visible instrument in finance. They trade on public order books, they settle through central depositories, they pay dividends on published dates, and the company periodically restructures the shares themselves. Every one of those mechanics leaves a mark in the price series, which is why an equity researcher spends more time on data hygiene than on models.

---

#### What Ownership Actually Confers

- **Residual economic claim.** A pro-rata share of distributed profits and of whatever is left in liquidation.
- **Voting rights.** Usually one vote per share, but dual-class structures deliberately break this. A company can be economically owned by outsiders and controlled by insiders.
- **Pre-emption in some jurisdictions.** UK and much of Europe give existing shareholders first refusal on new issuance; US law generally does not.
- **No claim on specific assets.** Shareholders own the company, not its buildings. That distinction matters in insolvency, where the equity is usually worth nothing.

**Preference shares** sit between debt and common equity: a fixed dividend, priority over common shares, and normally no vote. They are priced more like perpetual bonds than like equity.

---

#### Trading and Settlement

Orders arrive at an exchange's limit order book and match by price, then by time. The core order types are covered in [Order Types](/execution/order-types); the essential distinction is that a **market order** demands immediacy and pays the spread, while a **limit order** supplies liquidity and accepts the risk of not trading.

Most exchanges bookend the continuous session with **auctions**. The opening auction clears accumulated overnight interest at a single price; the closing auction produces the official closing price used for index levels, fund valuations and derivative settlements, and it is consequently the single largest liquidity event of the day in many markets.

**Settlement** is the transfer of shares against cash, which happens after the trade. The United States, Canada and Mexico moved to `T+1` settlement in 2024; most other major markets, including the UK and European Union, settle at `T+2` as of this writing, with announced plans to shorten. Until settlement completes you hold a contractual claim, not the shares, which is why the *record date* for a dividend and the *ex-dividend date* differ.

> info **Ex-date versus record date** You must own the shares on the record date to receive a dividend. Because settlement takes time, the exchange sets an ex-dividend date — buy on or after it and the trade will not settle in time, so the seller keeps the dividend. Under `T+1` the ex-date and record date typically coincide; under `T+2` the ex-date is one business day earlier.

---

#### Worked Example: Market Cap, Enterprise Value and Yield

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Share price</td><td>£45.00</td></tr>
    <tr><td>Shares outstanding</td><td>200,000,000</td></tr>
    <tr><td>Total debt</td><td>£3,200,000,000</td></tr>
    <tr><td>Cash and equivalents</td><td>£1,100,000,000</td></tr>
    <tr><td>Quarterly dividend</td><td>£0.30 per share</td></tr>
    <tr><td>Net income (trailing year)</td><td>£740,000,000</td></tr>
  </tbody>
</table>

1. **Market capitalisation** — the value of the equity claim: `45.00 * 200,000,000 = 9,000,000,000`, so £9.0bn.
2. **Net debt**: `3,200,000,000 - 1,100,000,000 = 2,100,000,000`, so £2.1bn.
3. **Enterprise value** — the value of the whole business, independent of how it is financed: `9.0bn + 2.1bn = 11.1bn`.
4. **Annual dividend per share**: `0.30 * 4 = 1.20`.
5. **Dividend yield**: `1.20 / 45.00 = 0.02667`, so 2.67%.
6. **Earnings per share**: `740,000,000 / 200,000,000 = 3.70`.
7. **Price-to-earnings ratio**: `45.00 / 3.70 = 12.16`.
8. **Payout ratio**: `1.20 / 3.70 = 0.324`, so 32.4% of earnings distributed.

The gap between market cap and enterprise value is the whole point of the distinction. If this company were acquired, the buyer would pay £9.0bn for the shares and inherit £2.1bn of net debt — an £11.1bn cost of control. Two companies with identical market caps and identical operations but different leverage will show very different price-to-earnings ratios, because the equity of the levered one is a smaller, riskier slice of the same business.

---

#### Dividends and Buybacks

On the ex-dividend date the share price mechanically drops by roughly the dividend amount, because the cash has left the company. A share at £45.00 going ex a £0.30 dividend should open near £44.70, all else equal. This is not a loss — the holder receives £0.30 — but a naive price series records it as a `-0.67%` return. Fixing that is the subject of [Corporate Actions](/markets/corporate-actions).

Buybacks distribute cash without a dated price drop: the company buys its own shares, reducing the share count, so each remaining share represents a larger claim. Buying back 5% of the shares raises earnings per share by about `1 / (1 - 0.05) - 1 = 5.26%` with no change in total earnings. For a quant, the practical consequence is that share count is a moving quantity and any per-share series needs the contemporaneous count, not today's.

---

#### Across Venues and Regions

**United States.** Fragmented across many exchanges and off-exchange venues, consolidated by a national price feed. Quotes in cents; `T+1` settlement; dual-class structures are common.

**United Kingdom and Europe.** Historically one dominant national exchange per country, now fragmented across pan-European venues. Stamp duty applies to UK share purchases, which materially changes turnover economics for high-frequency strategies. Pre-emption rights are strong.

**Japan.** Trading is in board lots, with a tick size that varies by price band, and the market observes a lunch break — a genuine intraday liquidity gap that breaks naive volume-profile assumptions.

**Emerging markets.** Foreign ownership limits, capital controls, and settlement conventions that require pre-funding are the norm rather than the exception. A backtest that assumes free entry and exit is not modelling the market that exists.

**On-chain equivalents.** Tokenised equity and governance tokens superficially resemble shares but the claim differs: a governance token typically confers protocol voting rights without a residual claim on cash flows. See [Tokens 101](/building-blocks/tokens-101) and [Governance](/building-blocks/governance). Settlement is atomic — delivery and payment occur in the same transaction — which removes the settlement lag that generates the ex-date convention entirely.

---

#### Assumptions and Failure Modes

- **Assuming the price series is the return series.** Dividends, splits and spin-offs all break this. Every equity backtest must state which adjustment it uses.
- **Assuming shares outstanding is constant.** Issuance, buybacks, and conversion of options and convertibles change it continuously. Market cap computed from a stale count is wrong in exactly the situations that matter.
- **Assuming the closing price is transactable.** The closing auction price is a real trade, but at size you may move it. The last continuous trade before the auction is often not repeatable at all.
- **Ignoring survivorship in the universe.** A list of "current index members" backtested over ten years excludes everything that was delisted, acquired or went bankrupt. This inflates results without any coding error.
- **Assuming free-float equals shares outstanding.** Strategic, government and insider stakes are not available to trade. Liquidity and index weight follow the float, not the total. See [Equity Indices](/markets/equity-indices).
- **Ignoring the borrow.** A long-short book depends on being able to borrow the short leg at a knowable cost. See [Short Selling](/markets/short-selling).

> warning **Cheap on price is not cheap** A share that halves has not become cheap; it has become a smaller claim on a business whose prospects the market has revised. Price level carries no information without the denominator.

---

#### See Also

* [Corporate Actions](/markets/corporate-actions)
* [Short Selling](/markets/short-selling)
* [Equity Indices](/markets/equity-indices)
* [Instrument Map](/markets/instrument-map)
* [Order Types](/execution/order-types)
* [Returns](/quant-math/returns)

---

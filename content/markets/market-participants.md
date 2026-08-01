### Market Participants

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: markets, liquidity, flow, dealers, participants

A price is not produced by a market. It is produced by the specific people who happened to be willing to trade at that moment, for their own reasons. A pension fund selling equities to meet a liability, a market maker hedging inventory, and a systematic fund covering a short are all "sellers", but they behave differently, respond differently to price moves, and leave different footprints in the tape.

Knowing who is in a market is the cheapest form of edge in understanding it. It explains why liquidity evaporates at particular times of day, why some flows are predictably price-insensitive, why a crowded position unwinds faster than it accumulated, and why the counterparty on the other side of a good fill is often better informed than you are.

---

#### The Main Categories

<table>
  <tbody>
    <tr><td><strong>Participant</strong></td><td><strong>Primary motive</strong></td><td><strong>Price sensitivity</strong></td><td><strong>Effect on liquidity</strong></td></tr>
    <tr><td>Dealers / market makers</td><td>Earn the bid-ask spread; manage inventory back to flat</td><td>Very high — they quote around a reservation price</td><td>Supply liquidity; withdraw it when uncertainty rises</td></tr>
    <tr><td>Asset managers (long-only, pensions, insurers)</td><td>Track a mandate or match a liability</td><td>Low — trades are driven by inflows and policy, not price</td><td>Consume liquidity in large, slow, predictable blocks</td></tr>
    <tr><td>Index and ETF managers</td><td>Minimise tracking error against a published rule</td><td>Effectively zero at the rebalance</td><td>Create concentrated, dated demand that others front-run</td></tr>
    <tr><td>Hedge funds</td><td>Absolute return from a view or a spread</td><td>High, but leverage-constrained</td><td>Both supply and consume; forced sellers when leverage bites</td></tr>
    <tr><td>Corporates</td><td>Hedge a business exposure; issue or buy back securities</td><td>Low — the hedge is a policy, not a trade</td><td>One-directional and seasonal; a natural counterparty</td></tr>
    <tr><td>Retail</td><td>Savings, speculation, convenience</td><td>Mixed; often uninformed in aggregate</td><td>Small tickets, attractive flow for dealers to internalise</td></tr>
    <tr><td>Central banks and sovereigns</td><td>Policy, reserve management</td><td>None — mandate is not profit</td><td>Can dominate a market outright, especially in rates and FX</td></tr>
  </tbody>
</table>

The useful distinction is not institution type but **why the trade exists**. A trade motivated by information moves the price permanently. A trade motivated by liquidity need — a redemption, a hedge, a rebalance — moves it temporarily and then reverts. Almost all market-making economics reduce to telling these two apart.

---

#### Worked Example: A Dealer's Day

A market maker quotes a liquid share continuously. The mid is 100.00, and they post a bid of 99.98 and an ask of 100.02.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Half-spread</td><td>0.02 per share (2 basis points of the mid)</td></tr>
    <tr><td>Round trips completed</td><td>500 per day, 1,000 shares each</td></tr>
    <tr><td>Share of volume that is informed</td><td>15%</td></tr>
    <tr><td>Adverse mid move on informed fills</td><td>0.12 per share</td></tr>
  </tbody>
</table>

1. **Gross spread capture.** Each round trip buys 1,000 shares at 99.98 and sells 1,000 at 100.02, earning `1,000 * 0.04 = 40`. Across 500 round trips: `500 * 40 = 20,000`.
2. **Total shares traded.** 500,000 bought plus 500,000 sold = 1,000,000 shares.
3. **Informed share volume.** `15% * 1,000,000 = 150,000` shares.
4. **Adverse selection cost.** `150,000 * 0.12 = 18,000`.
5. **Net revenue.** `20,000 - 18,000 = 2,000` per day, before technology, exchange fees and capital costs.

The margin is thin and entirely determined by the informed share. If the informed fraction rises from 15% to 17%, adverse selection becomes `170,000 * 0.12 = 20,400` and the day is a loss. The dealer's rational response is to widen the quote or to reduce size — which is exactly what "liquidity dried up" means when you read it in a market report. Liquidity is not a stock of money sitting in the book; it is a decision by intermediaries, revised continuously.

> info **Why internalisation exists** Retail flow is, on average, uninformed. A dealer who can separate it from institutional flow can quote it tighter and still make money, which is why retail orders are frequently executed off-exchange against a single wholesaler rather than at a public venue.

---

#### How Motive Shapes the Tape

**Predictable flow gets anticipated.** An index fund must own what the index says it owns, on the day the index says so. Because the rule is public, others can position ahead of it. See [Equity Indices](/markets/equity-indices) for how large that effect can be.

**Constrained sellers sell everything, not the worst thing.** A leveraged fund receiving a margin call sells what is liquid, not what it likes least. This is why correlations between unrelated assets converge during stress: the common factor is the seller's balance sheet, not the assets' fundamentals.

**Hedgers create a persistent imbalance.** If commodity producers systematically want to sell forward and few natural buyers exist, speculators must be paid to take the other side. That payment shows up as the shape of the futures curve, covered in [Roll and Carry](/markets/roll-and-carry).

**Time of day is participant composition.** The opening auction is dominated by overnight order accumulation; the close by index and benchmark trades; the middle of the session by dealers and short-horizon strategies. The same order costs different amounts at each.

---

#### Across Venues and Regions

**Exchange-traded equities.** Many competing market makers, a public limit order book, and mandatory trade reporting. Participation is visible after the fact through volume and, in some markets, through short-interest and ownership disclosures.

**Over-the-counter markets (most of fixed income, FX, and swaps).** Dealers are the market. A client asks several dealers for a price and trades on the best one; the dealers see the client's intention before quoting. Information about who is trading what is far more valuable, and far more concentrated, than on an exchange.

**Futures.** A central counterparty stands between all participants, so credit quality does not differentiate them. Regulators in several jurisdictions publish periodic breakdowns of positioning by category (commercial hedgers versus financial participants), which is one of the few direct measurements of participant composition available.

**On-chain markets.** The participant set is pseudonymous but the flow is fully observable, which inverts the usual information asymmetry — positions and liquidations are public in real time. Automated market makers replace the discretionary dealer with a fixed pricing function that cannot widen its quote when it is being adversely selected. See [AMMs 101](/building-blocks/amms-101) and [Impermanent Loss](/building-blocks/impermanent-loss); the loss an AMM liquidity provider suffers to informed flow is the same adverse-selection term as in the worked example above, with the quote-widening response removed.

---

#### Assumptions and Failure Modes

- **Assuming categories are stable.** A "long-only asset manager" running a systematic overlay behaves like a hedge fund at the margin. Labels describe institutions; behaviour comes from mandates and constraints.
- **Assuming liquidity providers are obliged to quote.** In most modern markets they are not, or the obligation is weak enough to be worth breaching. Depth observed in calm conditions is not a promise about stressed conditions.
- **Treating volume as participation.** High volume between two fast intermediaries passing inventory back and forth is not the same as high volume from end investors changing hands. Volume measures activity, not absorption capacity.
- **Assuming the crowd is visible.** Positioning data is delayed, partial, and often reported only for exchange-traded instruments. The crowded trade you cannot see is the one that unwinds violently.
- **Over-reading a single day.** Participation composition is seasonal, calendar-driven, and event-driven. One day's flow tells you about that day.

> warning **The other side is not random** If your order is filled instantly at a good price, ask what the counterparty knew that made them willing. Systematic strategies that ignore this pay for it silently through [adverse selection](/execution/adverse-selection).

---

#### See Also

* [Instrument Map](/markets/instrument-map)
* [Equity Indices](/markets/equity-indices)
* [Short Selling](/markets/short-selling)
* [Order Types](/execution/order-types)
* [Adverse Selection](/execution/adverse-selection)
* [Liquidity](/signals/liquidity)

---

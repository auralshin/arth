### Equity Indices

> info **Metadata** Level: Intermediate | Prerequisites: Equities 101, Corporate Actions | Tags: equities, indices, weighting, rebalancing, tracking

An index is a rule for computing a single number from many share prices. That is all it is — there is no index, only a published methodology and a divisor. Yet trillions of pounds are managed against these rules, which converts a definition into a source of price pressure: when the rule says a share joins the index, real buyers must buy it on a known date, regardless of what they think it is worth.

The choice of weighting scheme is not cosmetic. The same twenty shares, weighted three different ways, produce three series with different returns, different volatilities, different sector exposures and different capacity. Understanding which rule generated a benchmark is a prerequisite for comparing anything to it.

---

#### The Three Weighting Schemes

```text
Price weighted:   w_i = P_i / sum(P_j)
Cap weighted:     w_i = (P_i * Q_i) / sum(P_j * Q_j)
Equal weighted:   w_i = 1 / N
```

where `P_i` is the price of share `i`, `Q_i` is its index share count (usually free-float adjusted), and `N` is the number of constituents.

**Price weighting** gives the largest weight to the highest-priced share, which carries no economic meaning — a share price is an arbitrary consequence of how many shares were issued. It survives in a handful of long-established indices for historical reasons.

**Capitalisation weighting** is the dominant scheme. It has one property nothing else has: the aggregate portfolio is self-rebalancing. If prices move, weights move with them, so a cap-weighted index requires no trading to maintain. This is why it is the only scheme with unlimited capacity, and why it is the natural benchmark.

**Equal weighting** implies continuous rebalancing — selling what rose and buying what fell — which produces a systematic tilt towards smaller constituents and towards mean reversion, and which incurs real turnover costs that the published index does not pay.

---

#### Free Float

Index providers weight by the shares *available to be traded*, not by the shares in issue. Government stakes, founder holdings, cross-shareholdings and strategic blocks are excluded, because index funds cannot buy them.

```text
float_market_cap = P * shares_outstanding * float_factor
```

A company that is 40% state-owned has a float factor of 0.60 and receives 60% of the index weight its full capitalisation would suggest. Float factors are reviewed periodically, and a change in float — a lock-up expiry, a government privatisation tranche — is itself an index event that forces trading.

---

#### Worked Example: Three Indices, One Market

Three shares. The price-weighted index starts with a divisor of `3`, so its initial level is the simple average price.

<table>
  <tbody>
    <tr><td><strong>Share</strong></td><td><strong>Price</strong></td><td><strong>Shares out (m)</strong></td><td><strong>Float factor</strong></td><td><strong>Float cap (m)</strong></td></tr>
    <tr><td>A</td><td>200</td><td>100</td><td>0.50</td><td>10,000</td></tr>
    <tr><td>B</td><td>50</td><td>400</td><td>1.00</td><td>20,000</td></tr>
    <tr><td>C</td><td>20</td><td>1,000</td><td>0.80</td><td>16,000</td></tr>
  </tbody>
</table>

Float caps: `200 * 100 * 0.50 = 10,000`, `50 * 400 * 1.00 = 20,000`, `20 * 1,000 * 0.80 = 16,000`. Total `46,000`.

<table>
  <tbody>
    <tr><td><strong>Scheme</strong></td><td><strong>Weight A</strong></td><td><strong>Weight B</strong></td><td><strong>Weight C</strong></td></tr>
    <tr><td>Price weighted</td><td>200/270 = 74.07%</td><td>50/270 = 18.52%</td><td>20/270 = 7.41%</td></tr>
    <tr><td>Float-cap weighted</td><td>10/46 = 21.74%</td><td>20/46 = 43.48%</td><td>16/46 = 34.78%</td></tr>
    <tr><td>Equal weighted</td><td>33.33%</td><td>33.33%</td><td>33.33%</td></tr>
  </tbody>
</table>

Now share A rises 10%, from 200 to 220, and nothing else moves.

1. **Price weighted.** New sum of prices `220 + 50 + 20 = 290`. Index goes from `270 / 3 = 90.000` to `290 / 3 = 96.667`, a return of **+7.41%**.
2. **Float-cap weighted.** A's float cap becomes `220 * 100 * 0.50 = 11,000`; total `47,000`. Return `47,000 / 46,000 - 1 =` **+2.17%**.
3. **Equal weighted.** `0.3333 * 10% =` **+3.33%**.

Each return equals A's weight multiplied by A's move, which is the defining property of a weighted index. The same market event produces returns differing by more than a factor of three, purely from the weighting rule.

**The divisor.** Now A does a two-for-one split: its price becomes 110 and the new sum of prices is `110 + 50 + 20 = 180`. Nothing has happened economically, so the index must not move. The provider solves for a new divisor:

```text
divisor_new = sum_of_prices_new / index_level_unchanged
            = 180 / 96.667
            = 1.86207
```

Confirm: `180 / 1.86207 = 96.667`. The divisor absorbs every change that is not a price move — splits, additions, deletions, share-count changes, rights issues. It is the mechanism by which an index level stays continuous through events that would otherwise break it, and it is the reason index levels are not comparable to any price.

---

#### Rebalancing and the Index Effect

Providers review membership on a schedule — typically quarterly or semi-annually — and announce changes several days before they take effect. Between announcement and effective date, every passive fund tracking the index knows it must buy the additions and sell the deletions at the closing auction on the effective date.

That is a large, dated, price-insensitive order with a public deadline. Other participants can and do position ahead of it. The resulting pattern — additions drifting up after announcement, then giving some of it back after the effective date — is known as the **index effect**. Its magnitude has varied considerably over time and across markets, and it tends to shrink as it becomes better known and as providers stagger implementation to reduce concentration.

The practical consequences for anyone measuring performance:

- **Index returns are frictionless; fund returns are not.** The published index rebalances at zero cost. A tracker pays spread and impact, which is a permanent drag relative to the benchmark. See [Market Impact](/execution/market-impact).
- **Turnover differs enormously by scheme.** A cap-weighted index turns over only on membership changes. An equal-weighted version of the same universe rebalances every constituent on every review.
- **Reconstitution dates dominate the volume profile.** The closing auction on a major reconstitution date can be many multiples of a normal day's volume.

> info **Tracking error is a two-sided measure** Tracking error is the standard deviation of the difference between fund and index returns. A fund can have low tracking error and persistent underperformance — the drag is in the mean, not the variance. Report both.

---

#### Across Markets and Index Types

**Broad national indices.** Almost universally free-float capitalisation weighted, with caps on individual weights in concentrated markets to satisfy fund diversification rules.

**Price-weighted survivors.** A small number of prominent indices remain price weighted. Their divisors have drifted far from the constituent count through decades of splits, so the level is a pure convention.

**Total return versus price return.** Most headline indices quoted in the media are *price return*: they exclude dividends. The *total return* version reinvests them, and over long horizons the two diverge by roughly the compounded dividend yield. Comparing a strategy's total return to a price-return index is a common and material error.

**Net versus gross total return.** Net versions deduct withholding tax at a standard rate. For cross-border comparisons this can matter by tens of basis points a year.

**Fixed income indices.** Weighted by amount outstanding, which means the largest weight goes to the most indebted issuer — an often-noted structural oddity with no clean alternative. Rebalancing is monthly and mechanical as bonds age out of maturity buckets.

**Commodity indices.** Weighted by a mixture of production and liquidity, and they must roll futures positions on a published schedule, which is itself a tradable event. See [Roll and Carry](/markets/roll-and-carry).

**On-chain indices.** Token-basket products rebalance through automated market makers, so the rebalance is executed against a pricing curve rather than an order book, and the cost appears as slippage against the pool. See [AMMs 101](/building-blocks/amms-101).

---

#### Assumptions and Failure Modes

- **Assuming the index is investable.** Published index returns exclude transaction costs, taxes, and the price impact of the trades the index itself mandates. A tracker's realised return is strictly lower.
- **Assuming constant membership.** Backtesting today's constituent list over history is survivorship bias in its purest form; the delisted, acquired and bankrupt are exactly the sample you deleted.
- **Assuming cap weighting is neutral.** It is a momentum-tilted, concentration-prone rule that maximally allocates to whatever has risen most. It is the market portfolio, not a risk-neutral one.
- **Ignoring float changes.** Weight changes arising from lock-up expiries and secondary offerings force trading with no price change to justify it.
- **Comparing across return conventions.** Price return, net total return and gross total return are three different series with the same name.
- **Assuming free-float data is accurate.** Float factors are estimates, revised in steps, and providers disagree.

---

#### See Also

* [Equities 101](/markets/equities-101)
* [Corporate Actions](/markets/corporate-actions)
* [Market Participants](/markets/market-participants)
* [Instrument Map](/markets/instrument-map)
* [Market Impact](/execution/market-impact)
* [Rebalancing](/quant-math/rebalancing)

---

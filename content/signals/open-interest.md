### Open Interest and Position Imbalances

> info **Metadata** Level: Intermediate | Prerequisites: Futures, Volume | Tags: signals, open-interest, positioning, derivatives, leverage, futures

**Open interest (OI)** is the number of derivative contracts currently outstanding — positions that have been opened and not yet closed or settled. It is a stock, measured at a point in time, whereas volume is a flow measured over a period. The distinction is the whole point: a market can trade enormous volume all day while open interest barely moves, if the activity is participants passing existing positions between themselves rather than creating new exposure.

That makes open interest the closest thing derivatives markets provide to a direct measure of how much capital is committed. Rising open interest means new positions are being established and money is entering; falling open interest means positions are being closed and money is leaving. Combined with the direction of price, it supports a coarse but genuinely informative reading of *who* is driving a move. This page covers the mechanics for both listed futures and perpetual swaps, which report open interest differently and mean subtly different things by it.

---

#### Formal Definition

Every derivative contract has exactly one long and one short. Open interest counts the *contracts*, not the sides:

```text
OI_t = number of contracts open at time t
```

A single transaction changes open interest according to what each counterparty was doing:

<table>
  <tbody>
    <tr><td><strong>Buyer</strong></td><td><strong>Seller</strong></td><td><strong>Effect on OI</strong></td><td><strong>Interpretation</strong></td></tr>
    <tr><td>Opening a long</td><td>Opening a short</td><td>+1</td><td>New exposure created; capital enters</td></tr>
    <tr><td>Opening a long</td><td>Closing a long</td><td>No change</td><td>A position changes hands</td></tr>
    <tr><td>Closing a short</td><td>Opening a short</td><td>No change</td><td>A position changes hands</td></tr>
    <tr><td>Closing a short</td><td>Closing a long</td><td>-1</td><td>Exposure extinguished; capital leaves</td></tr>
  </tbody>
</table>

Contract counts are not comparable across instruments, so express open interest in currency terms:

```text
NotionalOI_t = OI_t * ContractMultiplier * Price_t
```

Two normalised measures are more useful than the raw level:

```text
Turnover_t = Volume_t / OI_t
OI_Change_t = OI_t - OI_{t-1}
```

`Turnover` distinguishes a market where positions are held from one where they are churned. A ratio well below 1 indicates a book of longer-held positions; a ratio well above 1 indicates intraday activity dominating.

> warning **Notional open interest moves when price moves** Because `NotionalOI` multiplies contracts by price, it rises during a rally even if not one new contract has been opened. Always separate the contract-count change from the price change before reading a notional series as a positioning signal. This confusion is extremely common in published crypto commentary.

---

#### Worked Example

An equity index futures contract with a multiplier of 50. Volume and open interest are in millions of contracts.

<table>
  <tbody>
    <tr>
      <td><strong>Day</strong></td>
      <td><strong>Close</strong></td>
      <td><strong>Volume (m)</strong></td>
      <td><strong>OI (m)</strong></td>
      <td><strong>ΔPrice</strong></td>
      <td><strong>ΔOI (m)</strong></td>
      <td><strong>Turnover</strong></td>
    </tr>
    <tr><td>1</td><td>5,000</td><td>1.8</td><td>1.20</td><td>—</td><td>—</td><td>1.50</td></tr>
    <tr><td>2</td><td>5,040</td><td>2.1</td><td>1.26</td><td>+40</td><td>+0.06</td><td>1.67</td></tr>
    <tr><td>3</td><td>5,010</td><td>1.9</td><td>1.22</td><td>-30</td><td>-0.04</td><td>1.56</td></tr>
    <tr><td>4</td><td>4,960</td><td>2.6</td><td>1.30</td><td>-50</td><td>+0.08</td><td>2.00</td></tr>
    <tr><td>5</td><td>5,030</td><td>2.4</td><td>1.24</td><td>+70</td><td>-0.06</td><td>1.94</td></tr>
  </tbody>
</table>

**Notional open interest on day 1**:

```text
1,200,000 contracts * 50 * 5,000 = €300 billion
```

**The four combinations, all of which appear above.** This 2×2 reading is the standard framework, and each cell has a mechanical justification rather than a folkloric one.

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td><strong>Price</strong></td><td><strong>OI</strong></td><td><strong>Reading</strong></td></tr>
    <tr><td>2</td><td>Up</td><td>Up</td><td>New longs. Fresh capital is buying, and the advance is supported by new commitment.</td></tr>
    <tr><td>3</td><td>Down</td><td>Down</td><td>Long liquidation. Existing longs are closing; the decline is exit rather than new selling.</td></tr>
    <tr><td>4</td><td>Down</td><td>Up</td><td>New shorts. Fresh capital is selling, and the decline is being actively driven.</td></tr>
    <tr><td>5</td><td>Up</td><td>Down</td><td>Short covering. Shorts are closing; the rally is exit rather than new buying.</td></tr>
  </tbody>
</table>

**Day 4 deserves attention.** Price fell 50 points on the heaviest volume of the week *and* open interest rose by 80,000 contracts. Volume alone cannot distinguish this from day 3, where price also fell on heavy volume. But on day 3 open interest fell, meaning the selling was longs getting out; on day 4 it rose, meaning new short exposure was created. Those are materially different states — one is a market clearing out weak holders, the other is a market accumulating a position that must eventually be bought back.

**Day 5 completes the sequence**: price recovered 70 points while open interest fell by 60,000. New buyers did not arrive; shorts closed. Rallies driven by short covering tend to be sharp and self-limiting, because the buying stops once the shorts are flat.

Turnover stayed in a narrow band of 1.5 to 2.0 throughout, so none of these moves reflected an unusual change in trading intensity — only in what the trading was doing.

---

#### Listed Futures Versus Perpetual Swaps

The measure exists in both markets but means slightly different things.

<table>
  <tbody>
    <tr><td><strong></strong></td><td><strong>Listed futures</strong></td><td><strong>Perpetual swaps</strong></td></tr>
    <tr><td>Reporting</td><td>Exchange-published, typically once daily after settlement</td><td>Venue-published continuously, often every few seconds</td></tr>
    <tr><td>Expiry effect</td><td>Falls to zero at expiry; the series is naturally segmented by contract</td><td>No expiry, so the series is continuous and comparable over time</td></tr>
    <tr><td>Aggregation</td><td>Must be summed across expiries, or the roll looks like a positioning change</td><td>Must be summed across venues, which do not share a clearing house</td></tr>
    <tr><td>Units</td><td>Contracts, converted via a fixed multiplier</td><td>Contracts, coins, or currency depending on linear or inverse design</td></tr>
    <tr><td>Position detail</td><td>Regulatory reports break down by trader category, weekly and lagged</td><td>Aggregate only on centralised venues; full position set on-chain</td></tr>
  </tbody>
</table>

The perpetual's lack of expiry is the significant difference for research. A listed futures open interest series is chopped into contract-length segments, each rising from zero and collapsing at expiry, so a "change in open interest" near a roll date is mostly calendar mechanics. Perpetual open interest has no such structure and is directly comparable across months and years. Against that, perpetual open interest is fragmented across venues that do not net against each other, so the aggregate depends on which venues the data source covers and how it converts inverse contracts. See [Perpetual Futures](/building-blocks/perpetual-futures) and [Futures 101](/markets/futures-101).

In crypto specifically, the most-watched normalisations are open interest relative to spot market capitalisation and relative to spot volume, both used as gauges of aggregate leverage. Neither is a positioning signal on its own; both are context for how much forced selling a given price move could trigger. See [Leverage and Liquidation](/risk/leverage-liquidation).

---

#### In Practice Across Asset Classes

**Listed futures generally.** Open interest is exchange-reported and reliable, but published once per day after settlement, so it is stale relative to intraday price. It must be aggregated across expiries: front-month open interest collapses through the [roll](/markets/roll-and-carry) while the next contract fills, which produces a large apparent positioning change that is purely mechanical. In commodities, regulatory position reports break open interest down by trader category, distinguishing commercial hedgers from financial participants — coarse, weekly, and released with a lag, but the only such breakdown available in traditional markets.

**Equities.** Single stocks have no open interest in the futures sense, though listed options do, and options open interest by strike is watched for the same reason. Index futures open interest reflects a mixture of directional positioning and hedging by option desks and structured product issuers, which weakens the "committed capital" reading considerably. Short interest — the number of shares sold short, reported semi-monthly in most jurisdictions — is the nearest cash-equity analogue and is even more heavily lagged.

**FX.** Spot FX has no open interest because there is no contract to leave open. Currency futures do, and their open interest is one of the few standardised positioning measures in the currency market. It covers only the exchange-traded slice of a market that is overwhelmingly over-the-counter, so it is a sample of unknown representativeness rather than a census.

**Fixed income.** Government bond futures open interest is closely watched, particularly around delivery, where the cheapest-to-deliver mechanics create their own positioning dynamics. A large share of the open interest represents hedging of cash bond and swap books rather than directional views.

**Crypto.** The richest open interest data of any market: continuously published, per-venue, and available for perpetual swaps whose lack of expiry makes the series directly comparable across time. Continuous trading means there is no settlement boundary to distort the daily change. The costs are real, though: figures are unaudited and venue-reported, inverse contracts denominated in the underlying asset require careful conversion, and cross-venue aggregation double-counts nothing but also nets nothing. On-chain perpetual protocols publish every individual position rather than an aggregate, which is a genuinely unprecedented level of positioning transparency. See [Perp DEX Design](/protocols/perp-dex).

---

#### Assumptions and Failure Modes

- **Open interest does not reveal net direction.** Every contract has a long and a short, so open interest is always balanced. The 2×2 reading above *infers* which side was aggressive from the price change; it does not observe it.
- **Not all positions are directional.** Hedging, spread trading between expiries, basis trades and market-making inventory all contribute to open interest without expressing any view. In some markets they dominate.
- **Notional and contract counts move differently.** Notional open interest rises with price mechanically. Any claim about "record open interest" that has not separated the two is usually a claim about price.
- **Expiry and roll artefacts.** Front-month series show large mechanical swings around rolls. Always aggregate across expiries for listed futures.
- **Reporting lag.** Exchange open interest is typically end-of-day, so it cannot be used to make intraday decisions without introducing look-ahead into a backtest. Perpetual data is continuous, which removes this problem in crypto and only in crypto.
- **Venue fragmentation.** Perpetual open interest is reported per venue with no central clearing. Aggregates depend entirely on coverage, and vendors differ.
- **Data quality.** Crypto open interest is self-reported by exchanges and unaudited. Inverse contract conversion is a common source of error.
- **Extremes are not timing signals.** High open interest indicates fragility — a large position that could be forced to unwind — not that an unwind is imminent. Positions can build for months before anything happens.

---

#### Code

```python
import pandas as pd

def open_interest_features(close: pd.Series, volume: pd.Series,
                           open_interest: pd.Series,
                           multiplier: float = 1.0) -> pd.DataFrame:
    """Open interest features with the price effect separated out.

    notional_oi rises with price even when no contract is opened, so the
    contract-count change is reported alongside it. Reading a notional
    series as positioning without this split is the most common error in
    published open-interest commentary.
    """
    return pd.DataFrame(
        {
            "notional_oi": open_interest * multiplier * close,
            "oi_change": open_interest.diff(),
            "oi_pct_change": open_interest.pct_change(),
            # Volume relative to positions outstanding: below 1 means a
            # market of holders, well above 1 means a market of traders.
            "turnover": volume / open_interest,
        }
    )


def price_oi_regime(close: pd.Series, open_interest: pd.Series) -> pd.Series:
    """Label each bar with the standard price/OI 2x2 reading.

    This infers which side was aggressive from the price change. Open
    interest itself is always balanced and reveals no net direction.
    """
    price_up = close.diff() > 0
    oi_up = open_interest.diff() > 0
    labels = pd.Series("flat", index=close.index, dtype=object)
    labels[price_up & oi_up] = "new_longs"
    labels[~price_up & oi_up] = "new_shorts"
    labels[price_up & ~oi_up] = "short_covering"
    labels[~price_up & ~oi_up] = "long_liquidation"
    return labels
```

---

#### See Also

* [Funding Rate as a Signal](/signals/funding-rate)
* [Basis and Term Structure Signals](/signals/basis)
* [Futures 101](/markets/futures-101)
* [Roll and Carry](/markets/roll-and-carry)
* [Perpetual Futures](/building-blocks/perpetual-futures)
* [Leverage and Liquidation](/risk/leverage-liquidation)
* [Volume and Liquidity-Aware Indicators](/signals/volume)

---

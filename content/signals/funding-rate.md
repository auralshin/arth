### Funding Rate as a Signal

> info **Metadata** Level: Advanced | Prerequisites: Futures, Perpetual Swaps, Basis | Tags: signals, funding-rate, perpetual-swaps, positioning, carry, derivatives

A **perpetual swap** is a futures contract with no expiry date. That single omission creates a problem: a dated future is tethered to spot by the certainty of convergence at delivery, but a contract that never expires has no such anchor and could in principle drift arbitrarily far from the underlying. The **funding rate** is the mechanism that replaces convergence. At regular intervals, whichever side of the contract is trading rich pays the other side a fee proportional to the deviation, and that recurring cost pulls the contract price back toward the index.

Because funding is set by the price the contract trades at rather than by any committee, it is a directly observable, continuously updated price of leveraged directional exposure. Persistently positive funding means longs are collectively paying to keep their positions open. That is genuine information about positioning — the sort of information that in listed futures markets is available only through weekly, lagged regulatory reports. This page covers the mechanism, how funding relates to the [futures basis](/signals/basis), and how to read it as a signal without overreaching.

---

#### The Mechanism

Compare the two contract types directly.

<table>
  <tbody>
    <tr><td><strong></strong></td><td><strong>Dated future</strong></td><td><strong>Perpetual swap</strong></td></tr>
    <tr><td>Anchor to spot</td><td>Convergence at expiry, enforced by delivery or cash settlement</td><td>Periodic funding payment proportional to the premium</td></tr>
    <tr><td>Cost of carry paid</td><td>Embedded in the price at which you buy the contract</td><td>Paid in cash, in instalments, for as long as the position is held</td></tr>
    <tr><td>Maintaining exposure</td><td>Requires a roll into the next contract at each expiry</td><td>No roll; the position simply persists</td></tr>
    <tr><td>Observability of carry</td><td>Implied from the term structure across expiries</td><td>Published directly by the venue, updated every interval</td></tr>
  </tbody>
</table>

The two are economically the same trade with the payment schedule rearranged. A dated future's carry is capitalised into its price and realised through the [roll](/markets/roll-and-carry); a perpetual's carry is paid as it accrues. See [Futures 101](/markets/futures-101) and [Perpetual Futures](/building-blocks/perpetual-futures) for the fuller treatment of each.

---

#### Formal Definition

Venues differ in detail, but the dominant construction has three components.

**The premium index** measures how far the contract trades from the underlying:

```text
Premium_t = (Mark_t - Index_t) / Index_t
```

where:

- `Mark_t` is the contract's mark price, typically an impact-weighted book mid rather than the last trade
- `Index_t` is a composite spot price drawn from several reference venues

The premium is averaged over the funding interval — a time-weighted average, not a single snapshot, so that a momentary dislocation cannot set the rate.

**The funding rate** combines that averaged premium with an interest rate term:

```text
F = Premium_avg + clamp(Interest - Premium_avg, -c, +c)
F = max(-F_cap, min(F_cap, F))
```

where:

- `Interest` is a fixed or index-derived rate differential between the two legs of the pair
- `c` is a clamp width, commonly 0.05% per interval
- `F_cap` is a hard cap on the rate, commonly 0.75% per interval

The clamp has an instructive consequence. When the premium is close to the interest rate, the clamp does not bind and `F` collapses to `Interest` exactly. Only when the premium moves more than `c` away does the funding rate begin to track it, at a fixed offset of `c`.

**The payment** is then:

```text
Payment = PositionNotional * F
```

paid by longs to shorts when `F` is positive, and by shorts to longs when negative. Note that funding is charged on *notional*, not on margin, so a leveraged position pays funding on the full exposure while posting a fraction of it as collateral.

To compare against any other rate, annualise. With `k` intervals per day:

```text
F_annual_simple     = F * k * 365
F_annual_compounded = (1 + F)^(k * 365) - 1
```

> warning **Funding conventions are venue-specific and change** Interval length (eight-hourly, hourly, or continuous accrual), clamp width, cap, index composition, and the interest-rate term all vary between exchanges and are altered by them over time. A funding series stitched across a rule change is not a consistent time series. Verify the specification for the exact venue and period before using historical funding in research.

---

#### Worked Example

A perpetual swap on an asset with an index price of 30,000 and eight-hourly funding. The venue uses an interest rate of 0.01% per interval, a clamp of ±0.05%, and a cap of ±0.75%.

**Case 1 — a mild premium.** The time-weighted mark price over the interval is 30,015.

1. **Premium**: `(30,015 - 30,000) / 30,000 = 0.0005 = 0.05%`
2. **Interest minus premium**: `0.01% - 0.05% = -0.04%`, inside the ±0.05% clamp, so it passes through unchanged
3. **Funding rate**: `0.05% + (-0.04%) = 0.01%` per 8 hours
4. **Annualised (simple)**: `0.01% * 3 * 365 = 10.95%`

The premium was not large enough to escape the clamp, so funding landed exactly on the interest rate. This is the design working as intended: small deviations do not generate a funding signal at all.

**Case 2 — a large premium.** The time-weighted mark is 30,060.

1. **Premium**: `(30,060 - 30,000) / 30,000 = 0.0020 = 0.20%`
2. **Interest minus premium**: `0.01% - 0.20% = -0.19%`, which the clamp truncates to `-0.05%`
3. **Funding rate**: `0.20% - 0.05% = 0.15%` per 8 hours
4. **Annualised (simple)**: `0.15% * 3 * 365 = 164.25%`
5. **Annualised (compounded)**: `(1.0015)^1095 - 1 = 416%`

**What a long actually pays.** On a position with a notional of €300,000:

```text
Per interval: 300,000 * 0.0015 = €450
Per day:      450 * 3          = €1,350
```

If the position is held on €30,000 of margin at ten times leverage, that €1,350 per day is 4.5% of posted collateral, every day, before any price movement. Annualised funding of 164% is not a level any market sustains — it is a signal that the contract has become badly dislocated from spot and that the arbitrage (buy spot, short the perpetual, collect funding) is offering a return that will attract capital until the premium compresses.

The compounded figure of 416% against the simple 164% illustrates why the convention must be stated. Simple annualisation is the honest quote for a position you intend to hold for days; compounding assumes reinvestment at a rate that will not persist.

---

#### Reading Funding as a Signal

Funding is best understood as a **crowding and cost measure**, not a direction forecast.

<table>
  <tbody>
    <tr><td><strong>Observation</strong></td><td><strong>What it establishes</strong></td><td><strong>What it does not establish</strong></td></tr>
    <tr>
      <td>Persistently positive funding</td>
      <td>Long leveraged demand exceeds short; longs are paying to stay on</td>
      <td>That price will fall. Funding can stay positive through an entire advance.</td>
    </tr>
    <tr><td>Sharply negative funding</td><td>Short demand dominates, or spot is unusually hard to borrow</td><td>That a squeeze is imminent, though it raises the cost of staying short</td></tr>
    <tr><td>Funding near the interest rate</td><td>The premium is inside the clamp; positioning is unremarkable</td><td>Anything at all about direction</td></tr>
    <tr><td>Extreme funding at a cap</td><td>The mechanism has saturated and can no longer widen</td><td>The timing of any correction</td></tr>
  </tbody>
</table>

Three uses stand up better than the raw level:

- **As a cost, not a signal.** For any strategy holding perpetual exposure, funding is a direct, unavoidable, and forecastable cost of carry. Modelling it as such is the least speculative and most valuable use.
- **As a carry harvest.** Long spot against short perpetual is delta-neutral and collects funding while it is positive. This is the perpetual analogue of [cash-and-carry](/strategies/cash-carry) on dated futures, and it carries its own risks — venue solvency, liquidation on the short leg during a rally, and funding turning negative. See [Delta-Neutral Strategies](/strategies/delta-neutral).
- **As a standardised extreme.** Funding is strongly autocorrelated and its distribution shifts across regimes, so a z-score against a trailing window is more informative than a raw threshold. Rules calibrated on absolute funding levels from one period rarely transfer to another.

The claim that extreme funding predicts reversals is widespread and only weakly supported. The mechanism is plausible — crowded leveraged positioning is fragile, and forced [liquidation](/risk/leverage-liquidation) can cascade — but the sample of complete cycles is short, extreme episodes are few, and the horizon over which any reversal materialises is not stable. Treat it as a hypothesis worth testing with proper controls, not as an established effect.

---

#### In Practice Across Asset Classes

**Listed futures.** Have no funding rate. The equivalent information is the [basis](/signals/basis) and the shape of the term structure, and the equivalent cost is realised at the roll rather than paid in instalments. Positioning data comes from exchange and regulatory reports, published weekly with a lag of several days and aggregated into broad trader categories — far coarser and far later than a funding rate updated every eight hours.

**Equities.** The closest analogue to negative funding is the stock borrow rate. A hard-to-borrow name commands a high borrow fee, which is a direct, observable cost of maintaining a short position and a real crowding measure. It is quoted per name by prime brokers rather than published by an exchange. See [Short Selling](/markets/short-selling).

**FX.** The swap points on a forward embed the interest rate differential between the two currencies, which is the funding cost of holding a forward position. It is set by covered interest parity rather than by directional demand, so it carries far less positioning information — though the deviation from parity, the cross-currency basis, is itself watched as a funding-stress indicator. See [FX Carry and Parity](/markets/fx-carry-parity).

**Fixed income.** Repo rates play the equivalent role: the cost of financing a bond position. A security trading "special" in repo — at a rate well below the general collateral rate — indicates crowded demand to borrow it, usually to short it. This is the closest traditional-market equivalent to a negative funding rate, and it predates perpetual swaps by decades.

**Crypto.** The only market where a funding rate exists as a published, high-frequency, per-instrument series. It is available on both centralised venues and on-chain perpetual protocols, and the two can diverge because they clear separate pools of leverage. Because funding is venue-specific, a cross-venue comparison is itself a signal about where leverage is concentrated. On-chain protocols additionally expose the full open position set rather than only an aggregate; see [Perp DEX Design](/protocols/perp-dex).

---

#### Assumptions and Failure Modes

- **Funding is a cost mechanism, not a forecast.** Its job is to pull the contract toward the index. Any predictive content is a by-product, and a much weaker one than the mechanical cost it imposes.
- **Venue-specific and non-comparable.** Different intervals, clamps, caps and index compositions mean funding on two exchanges is not the same quantity. Comparing them without normalising to a common annualised basis produces nonsense.
- **Specifications change.** Exchanges revise funding formulas, caps and intervals. Historical series stitched across those changes contain artificial regime shifts.
- **Index manipulation risk.** Funding is computed against a reference index. If that index draws on thin venues, it can be pushed, and funding along with it. See [Oracle Manipulation](/risk/oracle-manipulation).
- **The carry trade is not risk-free.** Collecting funding requires holding spot and short perpetual across two balance sheets. Exchange failure, withdrawal suspension, liquidation of the short leg in a sharp rally, and funding flipping negative are all live risks. See [Cash and Carry](/strategies/cash-carry).
- **Caps break the relationship.** Once funding hits its cap, the rate no longer reflects the premium, and the mapping from dislocation to funding becomes flat.
- **Short and non-stationary history.** Perpetual swaps are recent, the crypto sample contains few complete cycles, and the market structure has changed repeatedly within it. Statistical confidence in any funding-based rule should be low. See [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **Payment timing creates gaming.** Funding accrues to whoever holds at the snapshot. Positions opened just before and closed just after a payment distort measured flow around each interval boundary.

---

#### Code

```python
import numpy as np
import pandas as pd

def funding_rate(premium_twap: float, interest_rate: float = 0.0001,
                 clamp: float = 0.0005, cap: float = 0.0075) -> float:
    """Funding rate for one interval from the time-weighted premium.

    All inputs are per-interval decimals. When the premium sits within
    `clamp` of the interest rate the clamp does not bind and the rate
    collapses to interest_rate exactly — small dislocations produce no
    funding signal at all, which is deliberate.
    """
    rate = premium_twap + np.clip(interest_rate - premium_twap, -clamp, clamp)
    return float(np.clip(rate, -cap, cap))


def funding_features(funding: pd.Series, intervals_per_day: int = 3,
                     window: int = 90) -> pd.DataFrame:
    """Annualised funding and a standardised extreme measure.

    Simple annualisation is quoted rather than compounded: compounding
    assumes a rate persists for a year, which extreme funding never does.
    The z-score is against a trailing window because the funding
    distribution shifts across regimes, so absolute thresholds calibrated
    in one period do not transfer to another.
    """
    baseline = funding.shift(1).rolling(window)
    return pd.DataFrame(
        {
            "annualised": funding * intervals_per_day * 365,
            "cumulative_paid": funding.cumsum(),
            "zscore": (funding - baseline.mean()) / baseline.std(ddof=1),
        }
    )
```

---

#### See Also

* [Basis and Term Structure Signals](/signals/basis)
* [Open Interest and Position Imbalances](/signals/open-interest)
* [Perpetual Futures](/building-blocks/perpetual-futures)
* [Futures 101](/markets/futures-101)
* [Roll and Carry](/markets/roll-and-carry)
* [Cash and Carry](/strategies/cash-carry)
* [Funding Rate Case Study](/case-studies/funding-rate)

---

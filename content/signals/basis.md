### Basis and Term Structure Signals

> info **Metadata** Level: Advanced | Prerequisites: Futures, Interest Rates, Funding Rate | Tags: signals, basis, term-structure, contango, backwardation, carry, roll-yield

The **basis** is the difference between a derivative's price and the price of its underlying. For a dated future it is `F - S`; for a perpetual swap it is the premium the contract trades over the index. Collected across expiries, these differences form a **term structure** — a curve describing what the market charges to hold exposure at each horizon.

The basis is not a free-floating quantity. For any asset that can be bought, financed and stored, the futures price is pinned to spot by an arbitrage relationship, and the basis is essentially the cost of carrying the position to delivery. That makes it one of the few market observables with a *derivable* fair value rather than a purely statistical one. Deviations from that fair value are informative precisely because there is a benchmark to deviate from. Where the arbitrage is hard to execute — because shorting is costly, storage is expensive, or capital is scarce — the deviation persists and becomes a measure of exactly those frictions.

---

#### Formal Definition

The **basis** and its normalised, annualised form:

```text
Basis        = F - S
Basis_pct    = (F - S) / S
Basis_annual = Basis_pct * (365 / days_to_expiry)
```

where:

- `F` is the futures price for a given expiry
- `S` is the spot or index price of the underlying
- `days_to_expiry` is calendar days remaining

Annualisation is essential. A basis of 25 points on a 73-day contract and 65 points on a 164-day contract are not comparable until both are expressed as annual rates.

The **cost-of-carry model** gives fair value for a financial asset:

```text
F_fair = S * exp((r - y) * T)
```

where:

- `r` is the financing rate over the horizon
- `y` is the yield the underlying pays while held (dividends, coupons, staking rewards)
- `T` is time to expiry in years

For commodities the model extends to `F_fair = S * exp((r + u - c) * T)`, adding storage costs `u` and a **convenience yield** `c` — the non-monetary benefit of holding the physical good, which is what allows commodity curves to invert in a way financial curves cannot.

Inverting the model gives the **implied financing rate**, the rate at which the observed futures price would be fair:

```text
r_implied = ln(F / S) / T + y
```

This is the more useful diagnostic. Comparing `r_implied` against the actual cost of funding says directly whether the contract is rich or cheap, in units that mean something.

Two more terms:

```text
Calendar spread = F_2 - F_1        (two expiries on the same underlying)
Roll yield      ≈ -Basis_annual    (for a long position held through the roll)
```

**Contango** is a curve where longer-dated contracts trade above shorter-dated ones; **backwardation** is the reverse. A long position in a contango market loses roll yield — each roll sells the cheaper expiring contract and buys the more expensive next one. See [Roll and Carry](/markets/roll-and-carry) and [Calendar Spreads](/markets/calendar-spreads).

> info **The basis converges to zero at expiry by construction** Delivery or cash settlement forces `F = S` at maturity. This is not a tendency; it is a contractual certainty, and it is what makes the basis a bounded, mean-reverting quantity with a known terminal value — unusual and valuable in a financial time series.

---

#### Worked Example

An equity index at 5,000, with two futures expiries. The financing rate is 4.5% and the index dividend yield is 1.6%.

<table>
  <tbody>
    <tr><td><strong>Contract</strong></td><td><strong>Price</strong></td><td><strong>Days to expiry</strong></td><td><strong>Basis</strong></td></tr>
    <tr><td>Spot index</td><td>5,000</td><td>—</td><td>—</td></tr>
    <tr><td>Near future</td><td>5,025</td><td>73</td><td>+25</td></tr>
    <tr><td>Far future</td><td>5,065</td><td>164</td><td>+65</td></tr>
  </tbody>
</table>

**Step 1 — annualise both.**

```text
Near: (25 / 5,000) * (365 / 73)  = 0.005 * 5.000  = 2.50%
Far:  (65 / 5,000) * (365 / 164) = 0.013 * 2.2256 = 2.89%
```

The far contract carries a higher annualised basis, so the curve is upward-sloping in rate terms as well as in price terms.

**Step 2 — compute fair value.** With `T = 73/365 = 0.2` and `r - y = 4.5% - 1.6% = 2.9%`:

```text
F_fair(near) = 5,000 * exp(0.029 * 0.2)      = 5,000 * 1.005817 = 5,029.08
F_fair(far)  = 5,000 * exp(0.029 * 0.449315) = 5,000 * 1.013115 = 5,065.58
```

**Step 3 — compare with the market.**

```text
Near: 5,025 - 5,029.08 = -4.08 index points (cheap)
Far:  5,065 -  5,065.58 = -0.58 index points (essentially fair)
```

**Step 4 — express the same thing as an implied financing rate.**

```text
Near: ln(5,025 / 5,000) / 0.2      + 0.016 = 0.024938 + 0.016 = 4.09%
Far:  ln(5,065 / 5,000) / 0.449315 + 0.016 = 0.028747 + 0.016 = 4.47%
```

The near contract implies financing at 4.09% against an actual rate of 4.5% — a gap of 41 basis points annualised. The far contract implies 4.47%, effectively the actual rate.

**Step 5 — read the trade, and the friction.** A cheap future means the arbitrage runs one way only: sell the index, buy the future, invest the proceeds at 4.5%, and capture roughly 41 basis points annualised over 73 days. But selling the index requires either owning it already or borrowing it, and borrowing costs money and balance sheet. **That is exactly why equity index futures typically trade slightly below theoretical fair value.** The observed basis is not evidence of a mispricing anyone can capture; it measures the cost of the arbitrage that would remove it. Reading a persistent small deviation as free money is the standard error here.

**Step 6 — the calendar spread.**

```text
Spread     = 5,065 - 5,025 = 40 points over 91 days
Annualised = (40 / 5,025) * (365 / 91) = 0.007960 * 4.011 = 3.19%
```

The forward rate implied between the two expiries is 3.19% annualised, above both the 2.50% near basis and the 2.89% far basis — the term structure of implied financing is upward-sloping. A calendar spread trade isolates this without taking outright index exposure.

---

#### Perpetual Swaps and the Basis

A perpetual swap has no expiry, so there is no convergence date and no roll. Its premium over the index is held in check by the [funding rate](/signals/funding-rate) instead, and this creates a direct correspondence:

```text
Annualised funding  ≈  Annualised basis of a short-dated future
```

Both are the market price of holding leveraged long exposure for a year. In a well-arbitraged market they should be close, because the same participants can express the same view either way. When they diverge, the divergence itself is the signal — it says leverage demand is concentrated in one instrument rather than the other, usually because the two are accessed by different pools of capital or cleared at different venues.

The practical differences matter for research:

<table>
  <tbody>
    <tr><td><strong></strong></td><td><strong>Dated future basis</strong></td><td><strong>Perpetual premium</strong></td></tr>
    <tr><td>Terminal value</td><td>Converges to zero at expiry, contractually</td><td>No terminal value; only the funding pull</td></tr>
    <tr><td>How carry is paid</td><td>Capitalised in the price, realised at the roll</td><td>Paid in cash each funding interval</td></tr>
    <tr><td>Time series</td><td>Segmented by contract; the basis shrinks toward each expiry</td><td>Continuous and directly comparable across periods</td></tr>
    <tr><td>Carry trade</td><td>Buy spot, sell future, hold to expiry: return is known at entry</td><td>Buy spot, sell perpetual: return depends on future funding, unknown at entry</td></tr>
  </tbody>
</table>

The last row is the important one. A dated cash-and-carry locks in its return at the moment it is put on, because convergence is certain. A perpetual carry trade does not — funding can turn negative the day after the position is opened. They are not the same trade, and treating annualised funding as an equivalent to a locked basis overstates the certainty considerably. See [Cash and Carry](/strategies/cash-carry).

---

#### In Practice Across Asset Classes

**Equity index futures.** The cost-of-carry model is tight because the arbitrage is mechanical, but it depends on a dividend forecast for the period to expiry, which is an estimate. Around dividend seasons and index rebalances the basis moves for reasons unrelated to financing. As shown above, the basis typically sits slightly below theoretical fair value because the arbitrage requires shorting the index and consuming balance sheet.

**Commodities.** The one asset class where the curve can invert on fundamentals. Storage costs push the curve into contango; a physical shortage pushes it into backwardation via the convenience yield, because someone who needs the barrel or the bushel now will pay a premium over the forward. Commodity term structure is therefore an informative signal about physical scarcity in a way that a financial futures curve simply is not. See [Commodities](/markets/commodities).

**Fixed income.** Bond futures basis is complicated by the delivery option: the short may deliver any bond from a defined basket, so the future prices off the cheapest-to-deliver issue and the basis embeds the value of that option. Basis trading in government bond futures is a large and specialised activity, and it is fundamentally a repo and optionality trade rather than a directional one.

**FX.** The forward is pinned by covered interest parity, so the forward points are the interest rate differential. Deviations — the cross-currency basis — reflect balance sheet constraints and dollar funding stress rather than any view on the currency, and they widen predictably at quarter and year ends when banks manage reported balance sheet size. See [FX Carry and Parity](/markets/fx-carry-parity).

**Crypto.** The basis is unusually large and unusually volatile compared with traditional markets, because the arbitrage is capital-intensive, capital is fragmented across venues that do not net against each other, and there is no unified prime brokerage to finance it. Dated futures exist alongside perpetuals on the same underlying, so both a term structure and a funding rate are observable at once and can be compared directly — a comparison no traditional market permits. Crypto basis has no dividend to forecast but does have staking yields on some assets, which enter as `y`. It responds sharply to leverage demand and can collapse within hours during a deleveraging, which is the mechanism behind most crypto basis unwinds. See [Basis Unwind Case Study](/case-studies/basis-unwind).

---

#### Assumptions and Failure Modes

- **The cost-of-carry model assumes frictionless arbitrage.** In reality shorting costs money, balance sheet is finite, margin must be posted on both legs, and capital is not free. Persistent deviations usually measure those frictions rather than a mispricing.
- **Financing and yield are estimates, not observations.** `r` and `y` must be assumed. An error in the dividend forecast or the applicable funding rate shows up directly as an apparent basis anomaly.
- **Convergence is certain, its path is not.** The basis must reach zero at expiry, but it can widen substantially first. A carry position marked to market can post large interim losses before the certain profit arrives, and margin calls do not wait for expiry.
- **The delivery option distorts bond futures.** The basis embeds an option value that a simple cost-of-carry calculation does not capture at all.
- **Roll yield is not a return.** A contango curve does not guarantee a loss on a long position, because spot may rise more than the roll costs. Roll yield decomposes a return; it does not forecast one.
- **Perpetual carry is not locked.** Funding is set interval by interval and can reverse. Quoting annualised funding as though it were a term rate implies a certainty that does not exist.
- **Basis extremes reflect crowding, and crowding unwinds discontinuously.** A wide basis means a large financed position exists. When it unwinds, it unwinds fast, often through the same [liquidation](/risk/leverage-liquidation) channel that created it.
- **Stale spot references.** The basis is a difference between two prices that must be observed simultaneously. Mismatched timestamps between a futures print and a spot index create phantom basis, particularly around market opens and closes.

---

#### Code

```python
import numpy as np
import pandas as pd

def basis_metrics(spot: float, futures: float, days_to_expiry: int,
                  financing_rate: float, yield_rate: float = 0.0) -> dict:
    """Basis, fair value under cost of carry, and the implied financing rate.

    implied_rate is the more useful number: it states the deviation in
    rate terms, which is directly comparable against the actual cost of
    funding the arbitrage. A raw basis in index points is not.
    """
    years = days_to_expiry / 365.0
    fair_value = spot * np.exp((financing_rate - yield_rate) * years)

    return {
        "basis": futures - spot,
        "basis_annualised": (futures - spot) / spot / years,
        "fair_value": fair_value,
        "deviation": futures - fair_value,
        "implied_rate": np.log(futures / spot) / years + yield_rate,
    }


def term_structure_slope(curve: pd.Series, spot: float) -> pd.DataFrame:
    """Annualised basis at each expiry, plus the implied forward rates
    between consecutive expiries.

    curve: futures prices indexed by days to expiry, ascending.
    A rising annualised basis means contango steepening in rate terms,
    which is not the same as the price curve simply sloping upward.
    """
    years = pd.Series(curve.index / 365.0, index=curve.index)
    annualised = (curve - spot) / spot / years

    forward = pd.Series(index=curve.index, dtype=float)
    for near, far in zip(curve.index[:-1], curve.index[1:]):
        gap_years = (far - near) / 365.0
        forward[far] = np.log(curve[far] / curve[near]) / gap_years

    return pd.DataFrame({"basis_annualised": annualised, "forward_rate": forward})
```

---

#### See Also

* [Funding Rate as a Signal](/signals/funding-rate)
* [Open Interest and Position Imbalances](/signals/open-interest)
* [Futures 101](/markets/futures-101)
* [Roll and Carry](/markets/roll-and-carry)
* [Calendar Spreads](/markets/calendar-spreads)
* [Perpetual Futures](/building-blocks/perpetual-futures)
* [Cash and Carry](/strategies/cash-carry)

---

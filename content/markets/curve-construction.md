### Curve Construction

> info **Metadata** Level: Advanced | Prerequisites: Yield Curves, Fixed Income 101 | Tags: rates, bootstrapping, discount-factors, interpolation, curve-building

A yield curve is not observed. What is observed is a set of prices for traded instruments — deposits, futures, bonds, swaps — each of which depends on many points of the curve at once. Curve construction is the inverse problem: find the set of discount factors that reprices every input instrument exactly, and that behaves sensibly in between.

The output is a discount factor for any date, which is the object every valuation actually needs. The two decisions that determine it are which instruments to include and how to interpolate between them. Both are choices, and both change every price and every hedge ratio computed from the result.

---

#### Discount Factors and Bootstrapping

Rates are a presentation layer. The quantity that matters is `DF(T)`, the present value today of one unit paid at time `T`. Every rate is just a way of quoting it under some compounding convention:

```text
Annually compounded:   DF(T) = 1 / (1 + z_T)^T
Continuously:          DF(T) = exp(-z_T * T)
Simple (money market): DF(T) = 1 / (1 + r * T)
```

Working in discount factors avoids an entire class of convention errors, because a discount factor has no compounding convention attached. Build the curve in discount factors; convert to rates only for display.

Bootstrapping solves for them sequentially. Order the input instruments by maturity. The shortest depends only on one unknown discount factor, so solve it. The next depends on that one plus one new unknown, so solve it. Repeat.

For a par instrument — one priced at 100 with a coupon `c` — the recursion is:

```text
DF(N) = (100 - c * sum( DF(n) for n = 1..N-1 )) / (100 + c)
```

The intuition: the price of a par bond is 100, all its intermediate coupons can be valued with discount factors already solved, so whatever is left over must be discounted by the one unknown factor attached to the final coupon plus principal.

---

#### Worked Example: A Three-Point Curve

Three annual-paying instruments, all quoted at par.

<table>
  <tbody>
    <tr><td><strong>Instrument</strong></td><td><strong>Maturity</strong></td><td><strong>Quoted rate</strong></td></tr>
    <tr><td>1-year zero-coupon deposit</td><td>1 year</td><td>4.00%</td></tr>
    <tr><td>2-year par swap</td><td>2 years</td><td>4.35%</td></tr>
    <tr><td>3-year par swap</td><td>3 years</td><td>4.55%</td></tr>
  </tbody>
</table>

**Steps 1 to 3 — solve outwards.** The one-year instrument is a single payment. The two-year instrument pays 4.35 then 104.35 and is worth 100, with only `DF(2)` unknown. The three-year instrument pays 4.55, 4.55, then 104.55, with only `DF(3)` unknown.

```text
DF(1) = 1 / 1.0400                                   = 0.961538

100   = 4.35 * 0.961538 + 104.35 * DF(2)
      = 4.182693 + 104.35 * DF(2)
DF(2) = 95.817307 / 104.35                           = 0.918230

100   = 4.55 * (0.961538 + 0.918230) + 104.55 * DF(3)
      = 8.552947 + 104.55 * DF(3)
DF(3) = 91.447053 / 104.55                           = 0.874673
```

**Step 4 — convert to zero rates and forwards.**

<table>
  <tbody>
    <tr><td><strong>Maturity</strong></td><td><strong>Discount factor</strong></td><td><strong>Zero rate</strong></td><td><strong>1y forward starting then</strong></td></tr>
    <tr><td>1</td><td>0.961538</td><td>4.0000%</td><td>4.7165%</td></tr>
    <tr><td>2</td><td>0.918230</td><td>4.3576%</td><td>4.9798%</td></tr>
    <tr><td>3</td><td>0.874673</td><td>4.5646%</td><td>—</td></tr>
  </tbody>
</table>

Checking the conversions:

- `z_2 = (1 / 0.918230)^(1/2) - 1 = (1.089051)^0.5 - 1 = 0.043576`
- `z_3 = (1 / 0.874673)^(1/3) - 1 = (1.143284)^(1/3) - 1 = 0.045646`
- `f(1,2) = 0.961538 / 0.918230 - 1 = 0.047165`
- `f(2,3) = 0.918230 / 0.874673 - 1 = 0.049798`

Note that the par rates (4.00, 4.35, 4.55), the zero rates (4.00, 4.36, 4.56) and the forwards (4.00, 4.72, 4.98) all describe the same curve and none of them are equal beyond one year. Quoting a curve without saying which of the three you mean is ambiguous.

> warning **Repricing the inputs is a necessary check, not a sufficient one** Every reasonable interpolation method reprices the input instruments exactly, by construction. Passing that check tells you nothing about whether the curve is sensible between the nodes — which is where the majority of your portfolio's cash flows fall.

---

#### Interpolation Is Not a Detail

The bootstrap gives three points. A real portfolio has cash flows on hundreds of dates that are not those three. What you assume in between is a modelling choice with visible consequences.

Interpolate the 2.5-year point two ways from the curve above.

**Linear on zero rates.** The obvious method: `z(2.5) = (0.043576 + 0.045646) / 2 = 0.044611`, so 4.4611%.

**Piecewise constant forwards** (equivalently, linear on the log of discount factors). Assume the one-year forward from year 2 to year 3, at 4.9798%, applies uniformly across that year:

```text
DF(2.5) = 0.918230 / (1.049798)^0.5 = 0.918230 / 1.024596 = 0.896187
z(2.5)  = (1 / 0.896187)^(1/2.5) - 1 = 0.044817
```

so 4.4817%. The two methods differ by about 2 basis points at this point — and on a long-dated position that difference is real money.

The more serious problem is what linear-on-zeros does to forwards. Compute the six-month forwards implied by the linear method inside the year-2-to-year-3 bucket:

<table>
  <tbody>
    <tr><td><strong>Period</strong></td><td><strong>Implied annualised forward, linear on zeros</strong></td><td><strong>Piecewise constant forward</strong></td></tr>
    <tr><td>Year 2.0 to 2.5</td><td>4.876%</td><td>4.980%</td></tr>
    <tr><td>Year 2.5 to 3.0</td><td>5.084%</td><td>4.980%</td></tr>
  </tbody>
</table>

The linear method has invented a 21 basis point jump in the forward rate halfway through a year in which no instrument matures and nothing was observed. Since forward rates are what price interest rate derivatives, this artefact propagates directly into valuations and into hedge ratios.

<table>
  <tbody>
    <tr><td><strong>Method</strong></td><td><strong>Property</strong></td><td><strong>Weakness</strong></td></tr>
    <tr><td>Linear on zero rates</td><td>Simple, always well-defined</td><td>Sawtooth forwards; artificial jumps at every node</td></tr>
    <tr><td>Linear on log discount factors</td><td>Piecewise constant forwards; no negative forwards</td><td>Forwards are discontinuous at nodes</td></tr>
    <tr><td>Cubic spline on zeros</td><td>Smooth-looking curve</td><td>Non-local: one bad input ripples across the whole curve, and forwards can oscillate</td></tr>
    <tr><td>Monotone convex methods</td><td>Locality plus continuous, non-negative forwards</td><td>More complex to implement and to explain</td></tr>
  </tbody>
</table>

The practical test is not how the zero curve looks — every method looks fine — but how the **forward curve** looks. Plot it. If it oscillates, the interpolation is generating information that no instrument in the market implied.

---

#### Instrument Selection and the Multi-Curve Framework

**The front end.** Overnight and short-dated deposits, then either short-term interest rate futures or short swaps. Futures need a **convexity adjustment**: a futures contract settles daily while a forward rate agreement settles once, and the difference is worth a few basis points that grows with maturity and volatility.

**The middle and back.** Par swaps at standard tenors, or benchmark government bonds. Mixing the two produces a kink at the transition, since swaps and government bonds trade at a spread to each other.

**Overlaps.** Where two instruments cover the same maturity, they cannot both be repriced exactly if they disagree. Either drop one, or move from exact bootstrapping to a least-squares fit that reprices everything approximately. Which you choose depends on whether you are marking a book (exact matters) or estimating a term structure (fit matters).

**Multi-curve.** Since the 2008 financial crisis, market practice separates the curve used for **discounting** collateralised cash flows — built from overnight index swaps, reflecting the rate paid on posted collateral — from the curves used for **forecasting** each reference rate. Before then, a single curve served both purposes. The change was forced by the observation that lending unsecured for three months and rolling overnight secured lending are not the same risk, and pricing them identically produced errors that could no longer be ignored. A modern rates system therefore builds several curves simultaneously, and they must be solved jointly rather than sequentially.

---

#### Across Markets

**Major currency swap curves.** Deep instrument sets at many tenors, so the curve is well determined and interpolation choice matters mainly in the gaps beyond thirty years.

**Government bond curves.** Fitted rather than bootstrapped, because dozens of bonds with different coupons and liquidity give an over-determined and slightly inconsistent system. Parametric families such as Nelson-Siegel and its extensions are used to impose a shape with few parameters and absorb the noise.

**Emerging markets.** Few liquid points and instruments that are not directly comparable. The curve is as much an assumption as a measurement, and the honest presentation is a range.

**Credit and inflation curves.** Same bootstrapping structure, different unknown: credit default swap quotes imply survival probabilities, and inflation swaps imply a curve of expected index levels with a seasonal adjustment layered on. See [Credit Curves](/credit/credit-curves).

**On-chain.** Lending rates reset continuously as a function of pool utilisation, so there is a spot rate but rarely a term structure to bootstrap. Where fixed-term markets exist, the same machinery applies to whatever discrete tenors trade. See [Lending and Borrowing](/building-blocks/lending-borrowing).

---

#### Assumptions and Failure Modes

- **Assuming the curve is unique.** It is determined jointly by the instruments and the interpolation rule. Two desks with the same market data legitimately hold different curves, and the difference shows up in a reconciliation break, not an error message.
- **Assuming smooth means correct.** A spline can be beautifully smooth in zeros and produce oscillating forwards. Always diagnose on forwards.
- **Ignoring the futures convexity adjustment.** Small at the front, material past a couple of years, and a systematic bias rather than noise.
- **Bootstrapping stale or non-transactable quotes.** An illiquid tenor propagates its error into every forward derived from it and into every hedge referencing that bucket.
- **Extrapolating past the last instrument.** Beyond the longest traded maturity the curve is an assumption. Long-dated pension and insurance liabilities are valued in exactly that region, which is why the extrapolation rule is a regulated parameter in several jurisdictions.
- **Using one curve for discounting and forecasting.** Correct before 2008, wrong now for collateralised trades.
- **Rebuilding without version control.** A curve that cannot be reproduced from stored inputs makes yesterday's P&L unexplainable.

---

#### Code

```python
def bootstrap_par_curve(par_rates, face=100.0):
    """Discount factors from annual-pay par instruments, one per year.

    par_rates: par coupon rates as decimals, index 0 = 1 year. Assumes one
    instrument per whole year; real curves interleave tenors and day counts.
    """
    discount_factors = []
    for rate in par_rates:
        coupon = face * rate
        pv_of_earlier_coupons = coupon * sum(discount_factors)
        discount_factors.append((face - pv_of_earlier_coupons) / (face + coupon))
    return discount_factors


def zero_rate(discount_factor, years):
    """Annually compounded zero rate implied by a discount factor."""
    return discount_factor ** (-1.0 / years) - 1.0


def forward_rate(df_start, df_end, years_between):
    """Annualised forward between two dates. Diagnose interpolation here:
    if this series oscillates, the interpolation is inventing information."""
    return (df_start / df_end) ** (1.0 / years_between) - 1.0
```

---

#### See Also

* [Yield Curves](/markets/yield-curves)
* [Duration and Convexity](/markets/duration-convexity)
* [Fixed Income 101](/markets/fixed-income-101)
* [FX Carry and Parity](/markets/fx-carry-parity)
* [Credit Curves](/credit/credit-curves)
* [Time Series Data](/data-tooling/time-series)

---

### Duration and Convexity

> info **Metadata** Level: Intermediate | Prerequisites: Fixed Income 101, Yield Curves | Tags: rates, duration, convexity, dv01, hedging

A bond's price is a non-linear function of its yield. Duration is the first-order approximation to that function and convexity is the second. Together they let you answer, without repricing anything, the question every rates desk asks continuously: if yields move by `x`, how much does this position make or lose?

Duration also has a second, older meaning — the weighted average time until the bond's cash flows arrive — and the two meanings coincide for good reason. A bond whose money comes back sooner is discounted over a shorter horizon and is therefore less sensitive to the discount rate. Both interpretations are useful, and they are the same number.

---

#### The Three Measures

**Macaulay duration** is the present-value-weighted average time to receipt of the cash flows, measured in years:

```text
D_mac = sum( t_n * PV(CF_n) ) / P
```

**Modified duration** converts that into a price sensitivity — the approximate percentage price change for a one-unit change in yield:

```text
D_mod = D_mac / (1 + y/m)

dP/P ≈ -D_mod * dy
```

**DV01** (dollar value of a basis point, also PV01 or BPV) expresses the same sensitivity in currency rather than percentage terms:

```text
DV01 = D_mod * P * 0.0001
```

**Convexity** is the second-order term, the curvature of the price-yield relationship:

```text
C_periods = (1 / P) * sum( n * (n + 1) * CF_n / (1 + i)^(n + 2) )
C         = C_periods / m^2
```

where:

- `t_n` is the time in years to cash flow `n`, and `n` is its index in periods
- `PV(CF_n)` is the present value of cash flow `n`
- `P` is the full (dirty) price
- `y` is the annual yield, `m` the coupons per year, and `i = y/m` the periodic rate

Combining them gives the standard second-order price approximation:

```text
dP/P ≈ -D_mod * dy + 0.5 * C * dy^2
```

The convexity term is always positive for a plain bond, which means the approximation error from duration alone is always in the holder's favour: prices rise more than duration predicts and fall less.

---

#### Worked Example: A Three-Year Bond

The bond from [Fixed Income 101](/markets/fixed-income-101): 100 face, 4.00% coupon paid semi-annually, three years to maturity, yielding 5.00%. Six periods, coupon 2.00 per period, periodic rate 2.5%. The price is **97.2459**.

<table>
  <tbody>
    <tr><td><strong>Period n</strong></td><td><strong>Time t (yrs)</strong></td><td><strong>Cash flow</strong></td><td><strong>PV at 2.5%</strong></td><td><strong>t × PV</strong></td></tr>
    <tr><td>1</td><td>0.5</td><td>2.00</td><td>1.9512</td><td>0.9756</td></tr>
    <tr><td>2</td><td>1.0</td><td>2.00</td><td>1.9036</td><td>1.9036</td></tr>
    <tr><td>3</td><td>1.5</td><td>2.00</td><td>1.8572</td><td>2.7858</td></tr>
    <tr><td>4</td><td>2.0</td><td>2.00</td><td>1.8119</td><td>3.6238</td></tr>
    <tr><td>5</td><td>2.5</td><td>2.00</td><td>1.7677</td><td>4.4193</td></tr>
    <tr><td>6</td><td>3.0</td><td>102.00</td><td>87.9543</td><td>263.8629</td></tr>
    <tr><td><strong>Total</strong></td><td>—</td><td>—</td><td><strong>97.2459</strong></td><td><strong>277.5710</strong></td></tr>
  </tbody>
</table>

1. **Macaulay duration**: `277.5710 / 97.2459 = 2.8543` years.
2. **Modified duration**: `2.8543 / 1.025 = 2.7847` years.
3. **DV01 per 100 face**: `2.7847 * 97.2459 * 0.0001 = 0.02708`.
4. **DV01 on £10,000,000 face**: `0.02708 * 100,000 = 2,708` per basis point. (There are 100,000 units of 100 face in £10m.)
5. **Convexity**: applying the formula above gives `C = 9.35` in years squared.

Note that the final period contributes `263.86` of the `277.57` total — 95% of the duration comes from the principal repayment. This is why coupon size matters: a zero-coupon bond has a Macaulay duration exactly equal to its maturity, and every coupon paid before maturity pulls duration below it.

**Testing the approximation.** Reprice the bond exactly at yields 100 basis points either side and compare.

<table>
  <tbody>
    <tr><td><strong>Yield change</strong></td><td><strong>Actual price</strong></td><td><strong>Actual % change</strong></td><td><strong>Duration only</strong></td><td><strong>Duration + convexity</strong></td></tr>
    <tr><td>-100 bp (to 4.00%)</td><td>100.0000</td><td>+2.8321%</td><td>+2.7847%</td><td>+2.8314%</td></tr>
    <tr><td>0 (at 5.00%)</td><td>97.2459</td><td>—</td><td>—</td><td>—</td></tr>
    <tr><td>+100 bp (to 6.00%)</td><td>94.5828</td><td>-2.7386%</td><td>-2.7847%</td><td>-2.7379%</td></tr>
  </tbody>
</table>

Working the convexity adjustment: `0.5 * 9.35 * 0.01^2 = 0.5 * 9.35 * 0.0001 = 0.000468`, or 0.0468%, added in both directions. Duration alone is wrong by about 5 basis points of price in each direction; adding convexity reduces the error to under one basis point.

The asymmetry is the point. The same 100 basis point move gains 2.83% and loses 2.74% — a difference of about 9 basis points on a short bond. On a thirty-year bond, where convexity is an order of magnitude larger, the same asymmetry is worth percentage points.

> info **Convexity is a long option-like exposure** Positive convexity means you gain more than linear on rallies and lose less than linear on sell-offs. Nobody gives that away: bonds with high convexity trade at correspondingly lower yields, so convexity is purchased with carry.

---

#### Hedging a Rates Book

DV01 is the working unit of a rates desk because it is additive. The DV01 of a portfolio is the sum of the DV01s of its positions, with sign, regardless of instrument or maturity.

```text
hedge_contracts = DV01_portfolio / DV01_per_hedge_contract
```

**Example.** A portfolio holds £50,000,000 face of the bond above.

1. **Portfolio DV01**: `0.02708 * 500,000 = 13,540` per basis point. (£50m of face is 500,000 units of 100 face.)
2. Hedge with a bond future whose cheapest-to-deliver bond gives the contract a DV01 of, say, £70 per contract per basis point — a figure that must be recomputed as the deliverable basket changes.
3. **Contracts to sell**: `13,540 / 70 = 193.4`, so 193 contracts.

The position is now first-order immune to a parallel shift in yields, and exposed to everything else:

- **Curve risk.** A DV01-neutral hedge across different maturities is neutral to a parallel shift and fully exposed to a steepening or flattening. Books are therefore hedged in maturity buckets, with a DV01 per bucket, not with one aggregate number.
- **Convexity mismatch.** The bond and the futures contract have different convexity, so the hedge is exact only for infinitesimal moves. Over a large move the residual is systematic, not random.
- **Basis risk.** The future tracks its cheapest-to-deliver bond, which can switch when yields move enough — a discrete change in the hedge ratio at an inconvenient moment.

A structural consequence of convexity: a **barbell** (short and long maturities) and a **bullet** (a single intermediate maturity) can have identical duration and very different convexity, the barbell having more. That difference is the standard way to express a view on the magnitude of rate moves independently of their direction, and it is priced accordingly.

---

#### Across Instruments and Markets

**Government bonds.** Duration behaves exactly as derived above. Long-dated bonds have large convexity, which is why a 1% move at the long end produces a visibly asymmetric P&L.

**Callable bonds and mortgages.** These have **negative convexity** over a range of yields, because the borrower's option to prepay or the issuer's option to call caps the price on the upside. Duration itself shortens as rates fall and extends as they rise — the wrong way round on both sides. Hedging a negatively convex book requires buying more hedge as it loses and selling as it gains, which is systematically loss-making and is a genuine mechanism by which rate moves amplify themselves.

**Floating rate notes.** Duration to the next reset is small — a note resetting quarterly behaves like a three-month instrument regardless of its maturity. Its rate risk is minimal; its spread risk is not.

**Swaps.** DV01 is the natural unit, since there is no principal and therefore no meaningful "price". Swaps are the standard instrument for adjusting a book's DV01 without changing its cash holdings.

**Credit.** **Spread duration** measures sensitivity to the credit spread rather than to the underlying rate. A corporate bond has both, and they can move in opposite directions — spreads often widen as government yields fall in a flight to quality, partly offsetting. See [Credit Spreads](/credit/credit-spreads).

**Equities.** Any long-duration cash flow stream has an implicit duration, which is the mechanism connecting rate moves to equity valuations — most strongly for companies whose value sits in distant cash flows.

---

#### Assumptions and Failure Modes

- **Assuming parallel shifts.** Duration measures sensitivity to a uniform change in all yields. Real curves twist. A duration-hedged book can lose substantially on a steepening while its net duration is exactly zero.
- **Assuming a single yield exists.** Modified duration is defined against yield to maturity, which is itself a summary of a curve. For portfolios spanning maturities, key-rate durations — sensitivity to each curve point separately — are the correct tool.
- **Extrapolating to large moves.** The second-order approximation degrades as the move grows. Beyond a few hundred basis points, reprice rather than approximate.
- **Assuming convexity is always positive.** Callable bonds, mortgage-backed securities and many structured products are negatively convex over the ranges where they matter most.
- **Ignoring that duration changes.** As yields move, duration moves — that is what convexity measures. A static hedge ratio drifts, and the drift is systematically adverse for a short-convexity position.
- **Confusing Macaulay and modified duration.** They differ by the factor `1 + y/m`, which is 2.5% at a 5% semi-annual yield. Small, but it is a systematic bias in every hedge ratio.
- **Using clean price in the DV01 calculation.** The sensitivity is of the full price. Using the clean price understates DV01 by the accrued interest fraction.

---

#### Code

```python
def bond_risk_measures(cash_flows, periodic_rate, periods_per_year):
    """Macaulay duration, modified duration, DV01 and convexity.

    cash_flows: list of (period_index, amount), period_index starting at 1.
    periodic_rate: yield divided by periods_per_year.
    Returns durations and convexity in YEARS and years-squared.
    """
    price = sum(cf / (1 + periodic_rate) ** n for n, cf in cash_flows)
    weighted_time = sum(
        (n / periods_per_year) * cf / (1 + periodic_rate) ** n for n, cf in cash_flows
    )
    macaulay = weighted_time / price
    modified = macaulay / (1 + periodic_rate)
    convexity_periods = sum(
        n * (n + 1) * cf / (1 + periodic_rate) ** (n + 2) for n, cf in cash_flows
    ) / price
    return {
        "price": price,
        "macaulay_years": macaulay,
        "modified_years": modified,
        "dv01": modified * price * 0.0001,
        "convexity_years2": convexity_periods / periods_per_year ** 2,
    }


def price_change_estimate(modified_duration, convexity, yield_change):
    """Second-order estimate. The convexity term is always positive,
    so duration alone always understates the holder's outcome."""
    return -modified_duration * yield_change + 0.5 * convexity * yield_change ** 2
```

---

#### See Also

* [Fixed Income 101](/markets/fixed-income-101)
* [Yield Curves](/markets/yield-curves)
* [Curve Construction](/markets/curve-construction)
* [Futures 101](/markets/futures-101)
* [Credit Spreads](/credit/credit-spreads)
* [Types of Risk](/risk/types)

---

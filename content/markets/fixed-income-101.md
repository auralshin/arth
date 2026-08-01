### Fixed Income 101

> info **Metadata** Level: Beginner | Prerequisites: None | Tags: bonds, yield, accrued-interest, pricing, fixed-income

A bond is a loan cut into tradable units. The issuer promises a schedule of coupon payments and a repayment of principal at maturity, and that schedule is known in advance. Unlike a share, whose value depends on an open-ended stream of uncertain profits, a bond's cash flows are contractually specified — so its price is a discounting exercise, and almost all the mathematics of fixed income follows from that one fact.

Because the cash flows are fixed, price and yield are two ways of stating the same thing. Quoting a bond at 97.25 and quoting it at a yield of 5% convey identical information once the schedule is known. The market quotes both, uses them for different purposes, and buries several conventions in the translation between them.

---

#### Anatomy of a Bond

- **Face (par) value** — the principal repaid at maturity, conventionally 100 for quoting purposes.
- **Coupon rate** — the annual interest as a percentage of face. A 4% coupon paid semi-annually pays 2.00 per 100 face, twice a year.
- **Maturity** — the date the principal is repaid.
- **Frequency** — annual in much of Europe, semi-annual in the US and UK, quarterly for most floating-rate notes.
- **Day count convention** — the rule for measuring time between dates. Actual/actual for most government bonds, 30/360 for many corporates, actual/360 in money markets. This is not a detail; it changes the accrued interest and the yield.
- **Seniority and covenants** — where the holder ranks in insolvency and what the issuer has promised not to do. For government bonds this is trivial; for corporates it is the substance of the credit analysis. See [Credit 101](/credit/credit-101).

---

#### Price and Yield

The price of a bond is the present value of its cash flows discounted at a single rate — the **yield to maturity**:

```text
P = sum( C / (1 + y/m)^n  for n = 1..N ) + F / (1 + y/m)^N
```

where:

- `P` is the price per 100 of face value
- `C` is the coupon payment per period
- `F` is the face value repaid at maturity
- `y` is the annual yield to maturity
- `m` is the coupon frequency per year
- `N` is the total number of remaining periods

The yield to maturity is the single discount rate that makes the present value of the promised cash flows equal the market price. It is an internal rate of return, and like all internal rates of return it assumes every coupon is reinvested at that same rate — an assumption which is almost never true and which is the reason [zero-coupon curves](/markets/curve-construction) exist.

Three relationships follow immediately and hold for every plain bond:

<table>
  <tbody>
    <tr><td><strong>Condition</strong></td><td><strong>Price</strong></td><td><strong>Name</strong></td></tr>
    <tr><td>Yield below coupon</td><td>Above 100</td><td>Premium</td></tr>
    <tr><td>Yield equals coupon</td><td>Exactly 100</td><td>At par</td></tr>
    <tr><td>Yield above coupon</td><td>Below 100</td><td>Discount</td></tr>
  </tbody>
</table>

---

#### Worked Example: Pricing a Three-Year Bond

A bond with 100 face, a 4.00% coupon paid semi-annually, and exactly three years to maturity. That is `N = 6` periods, `C = 2.00` per period.

**At a yield of 5.00%**, the periodic rate is `0.05 / 2 = 0.025`.

1. **Discount factor at maturity**: `1.025^6 = 1.1596934`, so `1 / 1.1596934 = 0.8622969`.
2. **Annuity factor for the coupons**: `(1 - 0.8622969) / 0.025 = 0.1377031 / 0.025 = 5.5081240`.
3. **Present value of coupons**: `2.00 * 5.5081240 = 11.0162480`.
4. **Present value of principal**: `100 * 0.8622969 = 86.2296900`.
5. **Price**: `11.0162480 + 86.2296900 = 97.2459`.

Repeat at two other yields to see the shape of the relationship:

<table>
  <tbody>
    <tr><td><strong>Yield</strong></td><td><strong>Price</strong></td><td><strong>Change from previous</strong></td></tr>
    <tr><td>4.00%</td><td>100.0000</td><td>—</td></tr>
    <tr><td>5.00%</td><td>97.2459</td><td>-2.7541</td></tr>
    <tr><td>6.00%</td><td>94.5828</td><td>-2.6631</td></tr>
  </tbody>
</table>

At a 4.00% yield the price is exactly par, because the yield equals the coupon. Note the asymmetry in the last column: the first 100 basis point rise costs 2.7541 in price, the second only 2.6631. Price falls at a decelerating rate as yields rise, and by symmetry rises at an accelerating rate as they fall. That curvature is **convexity**, and it is worth real money — the subject of [Duration and Convexity](/markets/duration-convexity).

---

#### Accrued Interest, Clean and Dirty Prices

A bond accrues interest continuously between coupon dates, but pays it in lumps. If prices were quoted as the full present value, a bond's quoted price would sawtooth upward through each period and drop by the coupon on each payment date — a pattern with no information in it.

Markets therefore quote the **clean price**, which strips out the accrued interest, and settle at the **dirty price** (also called the full or invoice price), which includes it.

```text
dirty_price = clean_price + accrued_interest

accrued_interest = C * (days_since_last_coupon / days_in_coupon_period)
```

**Example.** The bond above pays coupons on 15 January and 15 July. Settlement is 15 March, in a non-leap year, under an actual/actual convention.

1. **Days accrued**: 16 remaining days in January, plus 28 in February, plus 15 in March = `16 + 28 + 15 = 59` days.
2. **Days in the coupon period**: 15 January to 15 July = `16 + 28 + 31 + 30 + 31 + 30 + 15 = 181` days.
3. **Accrued interest**: `2.00 * 59 / 181 = 0.6519` per 100 face.
4. **If the clean price is quoted at 97.25**, the buyer pays `97.25 + 0.6519 = 97.9019` per 100 face.

For a £10,000,000 face position that is `10,000,000 * 0.979019 = 9,790,190` of cash, of which `65,190` is accrued interest reimbursing the seller for the part of the coupon they earned.

> warning **Clean prices are not returns** A total return series built by differencing clean prices omits the coupon entirely and understates the return by approximately the coupon yield, every year. Fixed income return series must be built from dirty prices plus coupons received, or taken from an index that already does so. This is the bond-market analogue of the dividend problem in [Corporate Actions](/markets/corporate-actions).

---

#### Across Markets and Regions

**US Treasuries.** Quoted in points and thirty-seconds of a point — "97-08" means `97 + 8/32 = 97.25`. Semi-annual coupons, actual/actual day count, and the deepest bond market in the world. The most recently issued bond of each maturity is the **on-the-run** issue and trades at a liquidity premium over otherwise similar **off-the-run** bonds.

**UK gilts.** Semi-annual coupons, actual/actual, quoted in decimals. Index-linked gilts pay coupons and principal uprated by inflation, so their quoted yield is a real yield.

**Euro area.** Annual coupons and actual/actual on most sovereigns, which means a German and a US bond with the same stated yield do not have the same effective yield. Converting between annual and semi-annual compounding is required for any cross-market comparison: `y_semi = 2 * ((1 + y_annual)^0.5 - 1)`.

**Corporate bonds.** Frequently 30/360 day count, and traded over the counter with wide and variable spreads. Marks are often derived from evaluated pricing services rather than trades, which smooths the return series and flatters volatility-based statistics.

**Floating rate notes.** The coupon resets periodically to a reference rate plus a spread, so price sensitivity to the level of rates is small and the credit spread dominates. Duration is measured to the next reset, not to maturity.

**On-chain.** Fixed-term, fixed-rate lending exists on-chain, but the dominant model is a variable rate set algorithmically by pool utilisation, which behaves like a floating-rate instrument that reprices continuously. See [Lending and Borrowing](/building-blocks/lending-borrowing). Tokenised government bill products pass through the underlying yield and inherit the same discounting mathematics, plus custody and redemption risk on top.

---

#### Assumptions and Failure Modes

- **Assuming yield to maturity is a realised return.** It is only realised if every coupon is reinvested at the same yield and the bond is held to maturity. Neither typically happens.
- **Assuming a single yield describes the cash flows.** A bond's cash flows occur at different dates and should be discounted at different rates. Yield to maturity is a summary, and it misprices bonds with unusual coupon patterns relative to a proper zero curve.
- **Ignoring day count and compounding conventions.** Comparing an annual-pay European sovereign to a semi-annual US Treasury on stated yield is a direct error of several basis points.
- **Assuming the quoted price is what you pay.** It is not, unless settlement falls on a coupon date. Accrued interest is real cash.
- **Ignoring embedded options.** Callable, puttable and convertible bonds have yields that mean something different, because the issuer or holder can change the cash flow schedule. Yield to maturity on a callable bond is an upper bound at best.
- **Assuming government bonds are risk-free.** They are default-free only in the issuer's own currency, and not always then. They are never free of interest rate risk, inflation risk, or liquidity risk.
- **Treating infrequent marks as low volatility.** Corporate and illiquid bonds are marked by models, not trades. Measured volatility is an artefact of the marking process. See [Sharpe Ratio](/quant-math/sharpe).

---

#### Code

```python
def bond_price(face, coupon_rate, years_to_maturity, yield_to_maturity,
               frequency=2):
    """Clean price per unit of face for a bond settling on a coupon date.

    Away from a coupon date this needs partial-period discounting and an
    accrued-interest deduction; this form is the textbook base case.
    """
    periods = int(round(years_to_maturity * frequency))
    coupon = face * coupon_rate / frequency
    rate = yield_to_maturity / frequency
    pv_coupons = sum(coupon / (1 + rate) ** n for n in range(1, periods + 1))
    pv_principal = face / (1 + rate) ** periods
    return pv_coupons + pv_principal


def accrued_interest(face, coupon_rate, days_accrued, days_in_period,
                     frequency=2):
    """Straight-line accrual within the period. The day counts themselves
    come from the convention, which is where the real complexity lives."""
    return face * coupon_rate / frequency * days_accrued / days_in_period
```

---

#### See Also

* [Yield Curves](/markets/yield-curves)
* [Duration and Convexity](/markets/duration-convexity)
* [Curve Construction](/markets/curve-construction)
* [Instrument Map](/markets/instrument-map)
* [Credit 101](/credit/credit-101)
* [Returns](/quant-math/returns)

---

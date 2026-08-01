### Yield Curves

> info **Metadata** Level: Intermediate | Prerequisites: Fixed Income 101 | Tags: rates, yield-curve, forwards, term-structure, macro

A yield curve is the relationship between the maturity of a debt instrument and its yield. It is the closest thing markets have to a public price for time: what a euro delivered in one year is worth today, versus one delivered in ten. Every discounted cash flow in finance ultimately references it, which is why a change in the curve moves equities, credit, currencies and property simultaneously.

The curve is also the single most-watched macroeconomic indicator produced by markets rather than by statisticians. Its **level** reflects the general cost of money, its **slope** encodes what the market expects policy to do, and its **curvature** reflects positioning and supply and demand at particular maturities. Three numbers, from a market that trades continuously.

---

#### Three Curves, Not One

The word "curve" is used for three related objects. Confusing them is the most common source of error in rates work.

<table>
  <tbody>
    <tr><td><strong>Curve</strong></td><td><strong>What each point means</strong></td><td><strong>Used for</strong></td></tr>
    <tr><td>Spot (zero) curve</td><td>The rate on a single payment received at that maturity, with no intermediate coupons</td><td>Discounting any cash flow correctly</td></tr>
    <tr><td>Par curve</td><td>The coupon a bond of that maturity would need to trade at exactly 100</td><td>Quoting new issues and swap rates</td></tr>
    <tr><td>Forward curve</td><td>The rate, agreed today, for borrowing between two future dates</td><td>Reading expectations and pricing derivatives</td></tr>
  </tbody>
</table>

They are three views of the same information and convert exactly into one another. The relationships, in annually compounded form:

```text
DF(n)       = 1 / (1 + z_n)^n

f(n, n+1)   = (1 + z_(n+1))^(n+1) / (1 + z_n)^n - 1
            = DF(n) / DF(n+1) - 1

par(N)      = (1 - DF(N)) / sum( DF(n) for n = 1..N )
```

where `z_n` is the zero rate to year `n`, `DF(n)` is the discount factor to year `n`, `f(n, n+1)` is the one-year forward rate starting in year `n`, and `par(N)` is the par coupon for an `N`-year bond.

---

#### Worked Example: Converting Between the Three

Start from an observed upward-sloping zero curve, annually compounded.

<table>
  <tbody>
    <tr><td><strong>Maturity</strong></td><td><strong>Zero rate</strong></td><td><strong>Discount factor</strong></td></tr>
    <tr><td>1 year</td><td>4.00%</td><td>0.961538</td></tr>
    <tr><td>2 years</td><td>4.40%</td><td>0.917485</td></tr>
    <tr><td>3 years</td><td>4.60%</td><td>0.873786</td></tr>
  </tbody>
</table>

The discount factors come straight from the definition: `1 / 1.04 = 0.961538`, `1 / 1.044^2 = 1 / 1.089936 = 0.917485`, and `1 / 1.046^3 = 1 / 1.144445 = 0.873786`.

**One-year forward rates.**

1. Starting in one year: `0.961538 / 0.917485 - 1 = 0.048015`, so **4.8015%**.
2. Starting in two years: `0.917485 / 0.873786 - 1 = 0.050012`, so **5.0012%**.

**Par yields.**

3. Two-year par: `(1 - 0.917485) / (0.961538 + 0.917485) = 0.082515 / 1.879023 = 0.043914`, so **4.3914%**.
4. Three-year par: `(1 - 0.873786) / (0.961538 + 0.917485 + 0.873786) = 0.126214 / 2.752809 = 0.045849`, so **4.5849%**.

Read the three curves side by side:

<table>
  <tbody>
    <tr><td><strong>Maturity</strong></td><td><strong>Zero</strong></td><td><strong>Par</strong></td><td><strong>1y forward starting then</strong></td></tr>
    <tr><td>1 year</td><td>4.0000%</td><td>4.0000%</td><td>4.8015%</td></tr>
    <tr><td>2 years</td><td>4.4000%</td><td>4.3914%</td><td>5.0012%</td></tr>
    <tr><td>3 years</td><td>4.6000%</td><td>4.5849%</td><td>—</td></tr>
  </tbody>
</table>

Three properties are visible and hold generally:

- **Par sits below zero when the curve slopes up.** The par bond pays coupons early, discounted at the lower short rates, dragging its yield below the pure zero rate.
- **Forwards sit above zeros when the curve slopes up.** A rising average requires the marginal rate to exceed it. The forward curve is the *derivative* of the zero curve, so it exaggerates every feature — a gentle bend in zeros becomes a sharp kink in forwards.
- **All three agree at one year**, where there is nothing to compound.

> info **Forwards are prices, not predictions** The 4.8015% one-year forward is the rate you can lock in today for borrowing between years one and two. Whether the one-year rate actually turns out to be 4.8015% in a year is a separate question. If investors demand a premium to hold longer maturities, forwards will be systematically above realised future rates without anyone having been wrong.

---

#### Shapes and What They Are Taken to Mean

<table>
  <tbody>
    <tr><td><strong>Shape</strong></td><td><strong>Description</strong></td><td><strong>Common interpretation</strong></td></tr>
    <tr><td>Upward sloping</td><td>Long rates above short rates. The usual state.</td><td>Rates expected stable or rising, plus a term premium for duration risk</td></tr>
    <tr><td>Flat</td><td>Little difference across maturities</td><td>A transition, often late in a tightening cycle</td></tr>
    <tr><td>Inverted</td><td>Short rates above long rates</td><td>Policy is restrictive now and expected to be eased later</td></tr>
    <tr><td>Humped</td><td>Peak at an intermediate maturity</td><td>A specific expected policy path, or concentrated supply and demand</td></tr>
  </tbody>
</table>

The slope is quoted as a spread between two points — the two-year and ten-year yields, written **2s10s**, is the most-followed. A positive number means upward sloping; a negative number means inverted.

**Inversion** attracts attention because it has historically preceded economic slowdowns in several major economies, and the mechanism is not mysterious: it says the market expects the central bank to be cutting rates in a few years' time, and central banks cut when growth deteriorates. It is a statement about expected policy, not a causal force. The lead time has been long and highly variable, and the number of independent historical episodes is small — a handful per economy — so the statistical confidence behind the relationship is far weaker than its prominence suggests. See [Multiple Testing](/stat-methods/multiple-testing).

Practitioners decompose curve moves into four named types, because they have different drivers and are hedged differently:

- **Bull steepener** — yields fall, short end falls more. Typically an easing expectation.
- **Bear steepener** — yields rise, long end rises more. Typically inflation or supply concern.
- **Bull flattener** — yields fall, long end falls more. Often a growth downgrade.
- **Bear flattener** — yields rise, short end rises more. Typically policy tightening.

"Bull" and "bear" refer to bond prices, so a bull move means falling yields. The distinction matters because the same 2s10s change can come from either end of the curve, with opposite implications.

---

#### Carry and Roll-Down

An upward-sloping curve pays a holder even if nothing moves. A three-year bond, held for a year, becomes a two-year bond. If the curve is unchanged it is then priced off the lower two-year yield, so its price rises. That gain is **roll-down**, and combined with the coupon income net of financing it makes up the **carry** of a rates position.

Using the curve above: an instrument yielding 4.60% at three years would, after a year with an unchanged curve, be valued at the 4.40% two-year rate. The yield decline of 20 basis points multiplied by the position's sensitivity is the roll-down return, on top of the coupon. This is the direct analogue of the roll yield in a futures curve — see [Roll and Carry](/markets/roll-and-carry) — and it is why curve-steepness measures appear as signals in systematic rates strategies.

---

#### Across Markets and Regions

**Government bond curves.** The benchmark for each currency, built from on-the-run issues. Distortions arise from liquidity premia at specific points and from central bank holdings concentrated in particular maturities.

**Swap curves.** Built from overnight index swaps and interest rate swaps, and increasingly the primary discounting curve because collateralised derivatives are discounted at the overnight rate. Swap and government curves can and do diverge, and the difference — the swap spread — is a market of its own.

**Money market front end.** Below one year the instruments are deposits, bills and futures, quoted with simple interest and act/360 or act/365 day counts. Stitching the front end to the coupon-bond section is the fiddliest part of [Curve Construction](/markets/curve-construction).

**Real curves.** Inflation-linked bonds produce a curve of real yields. The difference between nominal and real yields at a given maturity is the **breakeven inflation rate**, which contains both an expectation and a risk premium and should not be read as a pure forecast.

**Credit.** Each issuer has its own curve, and its shape differs from the government curve. Distressed issuers often show *inverted* credit curves, because the near-term default risk dominates. See [Credit Curves](/credit/credit-curves).

**On-chain.** Most on-chain lending is overnight and variable, so there is effectively only a front point rather than a curve. Where fixed-term lending markets exist, a genuine term structure emerges, and its shape reflects the same trade-off between locking a rate and staying floating. See [Lending and Borrowing](/building-blocks/lending-borrowing).

---

#### Assumptions and Failure Modes

- **Reading forwards as forecasts.** Forwards embed a term premium of unknown and time-varying size. Treating them as expectations conflates two components that behave differently.
- **Comparing yields across compounding conventions.** An annually compounded 4.60% and a semi-annually compounded 4.60% are different rates. Convert before subtracting.
- **Mixing par and zero curves.** Discounting a cash flow at a par yield is wrong, and the error grows with maturity and with the steepness of the curve.
- **Assuming a smooth curve is a real one.** Published curves are fitted. The smoothness is imposed by the interpolation method, and the fitted level at a maturity with no traded instrument is an assumption, not data.
- **Assuming inversion is a signal you can trade.** The historical sample is small, the lead time is long and unstable, and the position has a carry cost while you wait.
- **Ignoring the front-end conventions.** Money market and bond market rates use different day counts and different compounding. Curves built without harmonising them have a kink at the join that is pure convention error.

---

#### See Also

* [Fixed Income 101](/markets/fixed-income-101)
* [Curve Construction](/markets/curve-construction)
* [Duration and Convexity](/markets/duration-convexity)
* [Roll and Carry](/markets/roll-and-carry)
* [FX Carry and Parity](/markets/fx-carry-parity)
* [Rates and Inflation](/regimes-macro/rates-and-inflation)

---

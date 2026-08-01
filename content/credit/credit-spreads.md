### Credit Spreads

> info **Metadata** Level: Intermediate | Prerequisites: Credit 101, Fixed Income 101, Yield Curves | Tags: credit, spread, z-spread, asset-swap, oas

A credit spread is the extra yield a risky bond offers over a benchmark that is assumed to be free of default risk. It is the single number the credit market quotes, argues about, and trades. It is also four different numbers, because there are at least four defensible ways to define "over a benchmark".

The distinctions are not pedantry. The same bond can quote at 430 basis points on one convention and 412 on another, and a relative-value comparison between two bonds is meaningless unless both are measured the same way. This page defines the common measures, works one bond through all of them, and then asks the harder question: what is the spread actually paying you for?

---

#### The Four Common Measures

**Yield spread (G-spread).** The bond's yield to maturity minus the yield of a government bond of comparable maturity, usually interpolated between the two adjacent benchmark issues: `G_spread = y_bond - y_govt(matched maturity)`. Simple and quotable. Its weakness is that yield to maturity is a single internal rate of return that ignores the shape of the discount curve, so two bonds with the same maturity but different coupons are not strictly comparable.

**I-spread.** The same construction against the interest rate swap curve rather than the government curve, since most credit is hedged and funded against swaps rather than gilts or Treasuries.

**Z-spread (zero-volatility spread).** The constant parallel shift `z` applied to every point of the benchmark **zero** curve that makes the discounted cash flows equal the observed market price.

```text
P = sum over i of  CF_i / (1 + z_i + z)^t_i
```

where:

- `P` is the bond's full (dirty) market price
- `CF_i` is the cash flow at time `t_i`
- `z_i` is the benchmark zero rate for maturity `t_i`
- `z` is the Z-spread, solved for numerically

The Z-spread is curve-consistent: it prices each cash flow against the discount rate appropriate to its own maturity. It is the default measure for comparing bullet bonds. For callable or putable bonds it still contains the value of the embedded option, and the **option-adjusted spread (OAS)** strips that out by valuing the bond in a lattice or Monte Carlo model of rates. For a bullet bond with no options, OAS and Z-spread coincide.

**Asset-swap spread (ASW).** The spread over the floating index that an investor earns in a *par asset swap*: buy the bond, pay away its fixed coupon in a swap, receive floating plus a spread, structured so the package costs par at inception. For an annual-pay bullet,

```text
ASW = C - S + (100 - P) / A
```

where:

- `C` is the bond's coupon rate (per 100 of face)
- `S` is the par swap rate to the bond's maturity
- `P` is the bond's price per 100 of face
- `A` is the swap annuity (the sum of discount factors on the fixed leg)

---

#### Worked Example: One Bond, Three Spreads

A three-year annual-pay corporate bond with a 5.00% coupon trades at 94.00 per 100 of face. To keep the arithmetic checkable, take the benchmark zero curve to be flat at 3.00% and use the same flat 3.00% curve as the swap curve.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Coupon (annual)</td><td>5.00</td></tr>
    <tr><td>Maturity</td><td>3 years</td></tr>
    <tr><td>Market price</td><td>94.00</td></tr>
    <tr><td>Benchmark zero curve</td><td>3.00% flat</td></tr>
    <tr><td>Cash flows</td><td>5, 5, 105</td></tr>
  </tbody>
</table>

**Step 1 — Z-spread by trial.** Discount at `3.00% + z` and search for the `z` that reproduces 94.00.

<table>
  <tbody>
    <tr><td><strong>Trial z</strong></td><td><strong>Discount rate</strong></td><td><strong>PV of 5</strong></td><td><strong>PV of 5</strong></td><td><strong>PV of 105</strong></td><td><strong>Total</strong></td></tr>
    <tr><td>4.00%</td><td>7.00%</td><td>4.6729</td><td>4.3672</td><td>85.7113</td><td>94.7514</td></tr>
    <tr><td>4.50%</td><td>7.50%</td><td>4.6512</td><td>4.3267</td><td>84.5209</td><td>93.4987</td></tr>
  </tbody>
</table>

Linear interpolation between the two trials: the price falls 1.2527 for 50 bp of spread, and we need it to fall 0.7514 from the first trial, so

```text
z = 4.00% + 0.50% * (0.7514 / 1.2527) = 4.00% + 0.30% = 4.30%
```

Interpolation is slightly biased because price is convex in yield; solving numerically gives 4.2988%. Either way, **Z-spread = 430 bp** to the nearest basis point.

**Step 2 — G-spread.** With the discount rate constant at 7.30%, the bond's yield to maturity *is* 7.30%, and the three-year government yield on a flat 3% curve is 3.00%, so `G_spread = 7.30% - 3.00% = 430 bp`. G-spread and Z-spread agree here only because the curve is flat. On a sloped curve they diverge, and the gap grows with the coupon and the maturity.

**Step 3 — Asset-swap spread.** The three-year annuity on a flat 3% curve is

```text
A   = 1/1.03 + 1/1.03^2 + 1/1.03^3
    = 0.970874 + 0.942596 + 0.915142  =  2.828611

ASW = 5.00 - 3.00 + (100 - 94.00) / 2.828611
    = 2.00 + 2.1212  =  4.1212  =  412 bp
```

Read the two terms separately. The investor picks up 200 bp of coupon over the swap rate, and amortises the 6-point discount to par over the annuity for another 212 bp.

**The 18 bp gap.** Z-spread and ASW disagree by 18 bp on the same bond. The Z-spread applies the spread *inside* the discount factors, compounding it; the asset swap spreads the price discount linearly across the annuity. For a bond at par the two nearly coincide; the further from par, the wider the wedge. Neither is wrong — they answer different questions, and quoting one while your counterparty quotes the other is a real source of confusion.

> warning **Match the convention before comparing** A 20 bp "relative value opportunity" between two bonds evaporates if one was measured on ASW and the other on Z-spread. Establish the measure first, then look at the difference.

---

#### What the Spread Compensates For

Decompose the 430 bp from the example. Suppose a credit analyst independently estimates a real-world default intensity of 2% per year with 40% recovery. From the credit triangle (see [Default Probability](/credit/default-probability)):

```text
expected_loss = hazard_rate * (1 - recovery)
              = 0.02 * 0.60
              = 0.012 = 120 bp
```

That leaves 310 bp unexplained by average losses. The residual is attributed to:

- **Default risk premium.** Defaults cluster in bad states of the world — precisely when investors' other assets are also falling and their risk appetite is lowest. Bearing systematically-timed losses commands compensation above the actuarial mean. This is why risk-neutral default probabilities exceed real-world ones.
- **Liquidity premium.** Corporate bonds trade infrequently and in size at wide bid-offer. Part of the spread pays for the cost and uncertainty of getting out.
- **Parameter uncertainty and frictions.** The 2% is an estimate from a small sample, and investors charge for the possibility that it is wrong. Regulatory capital, balance-sheet cost, tax treatment, and index-eligibility rules all leave a further residue in the price.

The consistent empirical finding, across markets and eras, is that spreads on investment-grade credit substantially exceed realised default losses over the same period — sometimes called the credit spread puzzle. Splitting the residual between risk premium and liquidity is genuinely unresolved: practitioners disagree, and the answer moves with market conditions.

> info **Spread is not free money** The excess of spread over expected loss is payment for a loss profile that is small and steady most of the time and large and correlated occasionally. It is the same shape as selling insurance, and it flatters risk-adjusted metrics that only look at volatility. See [Sharpe Ratio](/quant-math/sharpe).

---

#### In Practice Across Asset Classes

**Corporate credit.** Investment grade is usually quoted on spread (Z-spread or ASW); high yield is often quoted on price or yield, because at distressed levels the spread number becomes unstable and the bond trades on recovery expectations rather than on running yield.

**Sovereign credit.** Hard-currency sovereign spreads are quoted against the relevant Treasury curve or against the CDS curve. Local-currency debt mixes credit with monetary policy and inflation expectations, so a "spread" against a foreign benchmark is not a clean credit measure at all.

**Structured credit.** Quoted as a discount margin over the floating index for floating-rate tranches. The spread also embeds prepayment and extension risk, so it is only comparable to a corporate bond's after adjusting for very different cash flow uncertainty.

**On-chain lending.** The nearest analogue is the spread between a lending protocol's borrow rate and its supply rate, but the economics are different in kind. That spread is a reserve factor and utilisation-curve artefact, not compensation for default risk — see [Lending and Borrowing](/building-blocks/lending-borrowing) and [Lending Architecture](/protocols/lending-architecture). Because overcollateralisation plus automated [liquidation](/building-blocks/liquidations) is designed to remove borrower default from the equation, the rate does not decompose into expected loss plus risk premium the way a corporate spread does. What it does contain is smart-contract risk, oracle risk, and the risk that liquidation fails in a fast market — genuine risks that simply do not map onto a hazard rate.

---

#### Assumptions and Failure Modes

- **Assuming the benchmark is risk-free.** Government curves carry their own risk, and swap curves embed bank credit and collateral conventions. The measured spread inherits whatever is wrong with the benchmark.
- **Applying Z-spread to a callable bond.** It is contaminated by option value and will look artificially wide. Use OAS.
- **Comparing spreads across conventions.** G, I, Z, ASW, and OAS are different numbers for the same bond, as the worked example shows.
- **Treating spread as pure default compensation.** Most of an investment-grade spread historically has not been expected loss. Building a strategy on the assumption that it is will mis-size the position.
- **Ignoring the price level.** Spread measures behave poorly far from par and for distressed credit, where the meaningful quote is the price and the implied recovery.
- **Stale prices.** Many corporate bonds do not trade daily, and a spread computed from an evaluated mark carries a smoothing bias that suppresses measured volatility.

---

#### Code

```python
from scipy.optimize import brentq


def price_from_zspread(cash_flows, times, zero_rates, spread):
    """Discount each cash flow at its own zero rate plus a constant spread."""
    return sum(
        cf / (1.0 + r + spread) ** t
        for cf, t, r in zip(cash_flows, times, zero_rates)
    )


def z_spread(market_price, cash_flows, times, zero_rates):
    """Solve for the parallel shift of the zero curve that reprices the bond."""
    def mispricing(spread):
        return price_from_zspread(cash_flows, times, zero_rates, spread) - market_price
    return brentq(mispricing, -0.10, 1.00)


def asset_swap_spread(coupon, price, par_swap_rate, discount_factors):
    """Par asset-swap spread for an annual-pay bullet, per 100 of face.

    The (100 - price) term amortises the bond's discount to par across
    the swap annuity; it is why ASW and Z-spread diverge away from par.
    """
    return coupon - par_swap_rate + (100.0 - price) / sum(discount_factors)


times = [1.0, 2.0, 3.0]
z_spread(94.0, [5.0, 5.0, 105.0], times, [0.03, 0.03, 0.03])        # 0.042988
asset_swap_spread(5.0, 94.0, 3.0, [1 / 1.03 ** t for t in times])   # 4.1212
```

---

#### See Also

* [Credit 101](/credit/credit-101)
* [Default Probability](/credit/default-probability)
* [Credit Curves](/credit/credit-curves)
* [CDS](/credit/cds)
* [Yield Curves](/markets/yield-curves)
* [Curve Construction](/markets/curve-construction)

---

### Credit Curves

> info **Metadata** Level: Advanced | Prerequisites: CDS, Default Probability, Yield Curves | Tags: credit, term-structure, bootstrapping, hazard-rate, forward-spread

A credit curve is the term structure of credit risk for a single issuer: the par CDS spread quoted at each standard maturity, typically 6 months, 1, 2, 3, 5, 7 and 10 years. It is the credit market's analogue of the [yield curve](/markets/yield-curves), and it carries the same kind of information — not just a level, but a market view on *when* the risk lies.

The curve is also the object everything else is calibrated from. A single 5-year spread supports only a flat hazard rate, which will misprice every other maturity. Bootstrapping the whole curve produces a piecewise-constant hazard function that reprices every quoted point exactly and lets you value instruments at maturities nobody quotes.

---

#### Reading the Shape

<table>
  <tbody>
    <tr><td><strong>Shape</strong></td><td><strong>Typical of</strong></td><td><strong>What it says</strong></td></tr>
    <tr><td>Upward sloping</td><td>Investment grade, stable issuers</td><td>Near-term default risk is low; uncertainty accumulates with horizon. The normal shape.</td></tr>
    <tr><td>Flat</td><td>Weaker credit, or high uncertainty about direction</td><td>Default risk is roughly constant per year across the horizon.</td></tr>
    <tr><td>Inverted</td><td>Distressed issuers</td><td>Survival is the binding question. If the issuer gets past the next year, its conditional risk falls sharply.</td></tr>
    <tr><td>Humped</td><td>A dated event risk</td><td>A concentration of risk at a specific point &mdash; a refinancing wall, a maturity cliff, a scheduled legal or political outcome.</td></tr>
  </tbody>
</table>

Inversion is the informative case and the mechanism is worth stating precisely. For a distressed issuer the market is pricing a binary: it defaults soon, or it refinances and survives. The near-term hazard is enormous; conditional on surviving, the forward hazard is much lower, because survival itself would be evidence the funding problem was resolved. Since a longer-dated par spread averages the hazard over its whole life, that low forward hazard drags the long end below the short end. Note the converse too: an upward-sloping curve does *not* mean the market expects deterioration — the par spread slopes upward as soon as the forward hazard exceeds the average hazard to date.

---

#### Bootstrapping Hazard Rates

The bootstrap is the same recursive idea used for [curve construction](/markets/curve-construction) in rates. Work outward from the shortest maturity, and for each new quote solve for the single hazard rate over the new segment that reprices it, holding all earlier segments fixed.

Under the continuous-premium approximation with flat rates, the credit triangle makes each step closed-form rather than iterative. For a par spread `s(T)` under a *flat* hazard to `T`:

```text
lambda_flat(T) = s(T) / (1 - R)
S(T)           = exp( -lambda_flat(T) * T )
```

Once you have survival probabilities at successive tenors, the **forward hazard rate** over the segment from `T1` to `T2` follows from the ratio of survival probabilities:

```text
lambda_forward(T1, T2) = -ln( S(T2) / S(T1) ) / (T2 - T1)
```

and the corresponding forward par spread is that hazard back through the triangle:

```text
s_forward(T1, T2) = lambda_forward(T1, T2) * (1 - R)
```

where:

- `s(T)` is the quoted par CDS spread to maturity `T`, as a decimal
- `R` is the assumed recovery rate
- `S(T)` is the risk-neutral survival probability to `T`
- `lambda_forward` is the constant hazard implied over the segment

> warning **This shortcut is an approximation, not the ISDA bootstrap** Deriving each tenor's flat-equivalent hazard independently ignores that a true bootstrap weights each period by its survival-adjusted discount factor, which puts more weight on early periods. The exact bootstrap therefore produces steeper forward hazards than this method for an upward-sloping curve. Worked below with a full example, the shortcut gives a 3-to-5-year forward hazard of 7.50% where the exact calculation gives about 8.07%. Use the shortcut for intuition and a proper solver for pricing.

---

#### Worked Example: Bootstrapping a Corporate Curve

An issuer quotes the following par CDS spreads. Recovery is assumed at the market convention of 40%, so `1 - R = 0.60` throughout.

<table>
  <tbody>
    <tr><td><strong>Tenor</strong></td><td><strong>Par spread</strong></td><td><strong>Flat-equivalent hazard</strong></td><td><strong>S(T)</strong></td><td><strong>Cumulative PD</strong></td><td><strong>Forward hazard</strong></td><td><strong>Forward spread</strong></td></tr>
    <tr><td>1y</td><td>120 bp</td><td>2.0000%</td><td>0.980199</td><td>1.98%</td><td>2.0000%</td><td>120 bp</td></tr>
    <tr><td>3y</td><td>200 bp</td><td>3.3333%</td><td>0.904837</td><td>9.52%</td><td>4.0000%</td><td>240 bp</td></tr>
    <tr><td>5y</td><td>300 bp</td><td>5.0000%</td><td>0.778801</td><td>22.12%</td><td>7.5000%</td><td>450 bp</td></tr>
    <tr><td>10y</td><td>350 bp</td><td>5.8333%</td><td>0.558035</td><td>44.20%</td><td>6.6667%</td><td>400 bp</td></tr>
  </tbody>
</table>

Work the 5-year row and the segment before it:

1. **Flat-equivalent hazard to 5 years**: `0.0300 / 0.60 = 0.0500`
2. **Survival to 5 years**: `exp(-0.05 * 5) = exp(-0.25) = 0.778801`, so cumulative PD is `22.12%`
3. **Survival to 3 years** (from the row above): `exp(-0.033333 * 3) = exp(-0.10) = 0.904837`
4. **Forward hazard over years 3 to 5**:

```text
lambda_forward(3, 5) = -ln( 0.778801 / 0.904837 ) / 2
                     = -ln( 0.860708 ) / 2
                     = 0.150000 / 2
                     = 0.075000  =  7.50%
```

5. **Forward par spread for a 2-year contract starting in 3 years**: `0.075 * 0.60 = 0.0450 = 450 bp`

Check the 10-year segment the same way: `lambda_flat(10) = 0.0350 / 0.60 = 5.8333%`, `S(10) = exp(-0.583333) = 0.558035`, and `lambda_forward(5, 10) = (0.583333 - 0.250000) / 5 = 6.67%`.

**The interesting feature is in the last two rows.** The par spread still rises from 5 to 10 years, 300 bp to 350 bp — yet the forward hazard *falls*, from 7.50% over years 3 to 5 down to 6.67% over years 5 to 10, and the forward spread falls from 450 bp to 400 bp. A rising par curve is entirely consistent with declining forward risk, because the par spread is an average over the whole life while the forward is the marginal rate. This is the same relationship between spot and forward rates that governs the [yield curve](/markets/yield-curves), and reading a par curve as if it were a forward curve is the standard error.

---

#### Worked Example: An Inverted Curve

The same construction on a distressed issuer quoting 1,500 bp at one year and 800 bp at five years, still at a 40% recovery assumption:

<table>
  <tbody>
    <tr><td><strong>Tenor</strong></td><td><strong>Par spread</strong></td><td><strong>Flat-equivalent hazard</strong></td><td><strong>S(T)</strong></td><td><strong>Cumulative PD</strong></td></tr>
    <tr><td>1y</td><td>1,500 bp</td><td>25.0000%</td><td>0.778801</td><td>22.12%</td></tr>
    <tr><td>5y</td><td>800 bp</td><td>13.3333%</td><td>0.513417</td><td>48.66%</td></tr>
  </tbody>
</table>

The forward hazard over years 1 to 5:

```text
lambda_forward(1, 5) = -ln( 0.513417 / 0.778801 ) / 4
                     = (0.666667 - 0.250000) / 4  =  0.104167  =  10.42%
```

The forward par spread is `0.104167 * 0.60 = 625 bp`. The market prices a 25% annual hazard for the first year and a 10.4% annual hazard thereafter — survive the next twelve months and the conditional risk drops by well over half. That is exactly the binary the inversion encodes, and it is why distressed names stop being quoted as spreads and start being quoted as upfront points: at these levels the running-spread representation is unstable, and the 40% recovery assumption is doing a great deal of unexamined work.

> info **At distressed levels, recovery stops being a convention** The whole point of a conventional recovery is that it cancels out of relative comparisons. When a name is genuinely near default, the market is trading a view on recovery directly, and the implied hazard rates above should be read as arithmetic rather than as belief.

---

#### In Practice Across Asset Classes

**Corporate credit.** Liquidity concentrates overwhelmingly at the 5-year point. The rest of the curve is often quoted off a standard shape applied to that anchor, which means curve trades on illiquid names can be trading a broker's interpolation rather than a market view.

**Sovereign credit.** Curves invert readily under stress and can move on political dates in a way corporate curves rarely do. Humps around scheduled events — elections, programme reviews, large maturities — are common and genuine.

**Structured credit.** There is no single-name curve; the term structure appears as the amortisation profile of the pool and the timing of losses hitting the tranche. A tranche's effective maturity is a model output, not a contract term.

**On-chain lending.** There is no credit term structure of this kind, and the reason is structural rather than an absence of data. Almost all overcollateralised lending is open-term and floating-rate: the borrow rate is a function of pool utilisation, recalculated block by block, with no fixed maturity for a hazard rate to be attached to. See [Lending and Borrowing](/building-blocks/lending-borrowing) and [Lending Architecture](/protocols/lending-architecture). The nearest analogue to a credit curve is the forward path of utilisation-driven rates, which encodes supply and demand for leverage rather than survival probability. Fixed-term on-chain lending markets do produce a rate term structure, but it prices liquidity and demand, not the borrower's hazard rate — because [liquidation](/building-blocks/liquidations) is intended to remove the borrower from the equation entirely.

---

#### Assumptions and Failure Modes

- **Piecewise-constant hazard is a choice.** It reprices the quotes but produces discontinuous forward hazards at each node. Smoother interpolation changes every unquoted maturity while fitting the same inputs.
- **Fixed recovery across the whole curve.** The bootstrap assumes one `R` at every tenor. Recovery expectations are not maturity-independent, especially for a deteriorating credit. See [Recovery Rates](/credit/recovery-rates).
- **Negative forward hazards.** If quoted spreads are inconsistent — an inverted segment steeper than the survival ratio permits, or a stale quote — the bootstrap can imply a negative forward hazard, which is arbitrage, not information. Always check the sign.
- **Interpolating illiquid points.** Filling the curve between two liquid tenors creates the appearance of a term structure the market never priced, and a curve built from evaluated marks rather than trades will look smoother and less volatile than the risk actually is.
- **Assuming rates and credit are independent.** The bootstrap separates the discount curve from the survival curve. For sovereigns and financials this is a poor assumption.
- **Reading par spreads as forwards.** As the worked example shows, a rising par curve can sit on a falling forward curve. Curve trades expressed on par spreads carry unintended forward positioning.

---

#### Code

```python
import math


def bootstrap_credit_curve(quotes, recovery):
    """Survival and forward hazard rates from par CDS spreads.

    `quotes` maps tenor in years to par spread as a decimal, ascending.
    Uses the credit-triangle shortcut for each tenor's flat-equivalent
    hazard; a pricing implementation should instead solve each segment
    against the survival-weighted annuity.
    """
    loss_given_default = 1.0 - recovery
    curve = []
    previous_tenor, previous_survival = 0.0, 1.0
    for tenor, spread in sorted(quotes.items()):
        survival = math.exp(-(spread / loss_given_default) * tenor)
        # Forward hazard applies to the new segment only, not from time zero.
        forward = -math.log(survival / previous_survival) / (tenor - previous_tenor)
        curve.append({
            "tenor": tenor,
            "survival": survival,
            "cumulative_pd": 1.0 - survival,
            "forward_hazard": forward,
            "forward_spread_bp": forward * loss_given_default * 10_000,
        })
        previous_tenor, previous_survival = tenor, survival
    return curve


bootstrap_credit_curve({1: 0.0120, 3: 0.0200, 5: 0.0300, 10: 0.0350}, recovery=0.40)
# forward spreads: 120, 240, 450, 400 bp  -- par rises 5y to 10y while forwards fall
```

---

#### See Also

* [CDS](/credit/cds)
* [Default Probability](/credit/default-probability)
* [Recovery Rates](/credit/recovery-rates)
* [Credit Spreads](/credit/credit-spreads)
* [Yield Curves](/markets/yield-curves)
* [Curve Construction](/markets/curve-construction)

---

### Default Probability

> info **Metadata** Level: Intermediate | Prerequisites: Credit 101, Credit Spreads | Tags: credit, default, hazard-rate, risk-neutral, survival-probability

"What is the probability this issuer defaults?" is two different questions wearing the same words. One asks what will actually happen — a statistical statement about the world, estimated from history and fundamentals. The other asks what probability is embedded in today's market prices — a statement about what investors are willing to pay, which includes their aversion to the losses as well as their belief about them.

These are the **real-world** (or physical) probability, written `P`, and the **risk-neutral** probability, written `Q`. Confusing them is the most common error in credit analysis. Risk-neutral default probabilities backed out of spreads are systematically larger than realised default rates, and that gap is not a mispricing — it is the risk premium, and it is doing exactly what it should.

---

#### The Hazard Rate and Survival

The natural object is not a probability but an **intensity**. Let `tau` be the (random) time of default. The **hazard rate** `lambda(t)` is the instantaneous rate of default conditional on having survived to `t`, and the **survival probability** follows from it:

```text
lambda(t) = lim over dt of  Prob(tau in [t, t+dt] | tau greater than t) / dt
S(t)      = Prob(tau greater than t) = exp( -integral from 0 to t of lambda(u) du )
```

With a constant hazard `lambda` this collapses to the exponential distribution:

```text
S(t) = exp(-lambda * t)
PD_cumulative(t) = 1 - exp(-lambda * t)
```

where:

- `lambda` is the annualised hazard rate (also called the default intensity)
- `S(t)` is the probability of surviving to `t` without default
- `PD_cumulative(t)` is the probability of defaulting at any point before `t`

Three probabilities are routinely confused:

- **Cumulative PD** to year `k`: `1 - S(k)`. Defaults at any time up to `k`.
- **Marginal (unconditional) PD** in year `k`: `S(k-1) - S(k)`. Defaults *during* year `k`, seen from today.
- **Conditional (forward) PD** in year `k`: `(S(k-1) - S(k)) / S(k-1)`. Defaults during year `k` *given* survival to `k-1`.

Under a constant hazard the conditional PD is the same every year; the marginal PD declines, because there are fewer survivors left to default.

---

#### The Credit Triangle

The most useful relationship in credit connects three quantities:

```text
spread ~= lambda * (1 - R)
```

where:

- `spread` is the credit spread as a decimal (300 bp is 0.03)
- `lambda` is the risk-neutral hazard rate
- `R` is the assumed recovery rate

The intuition is direct. Per unit of time, you default with intensity `lambda` and lose fraction `(1 - R)` when you do. The expected loss rate is the product, and in a risk-neutral world the spread must pay exactly that.

This is not merely an approximation. For a credit default swap with continuously-paid premium, a flat hazard rate, and a flat interest rate curve, it is an **exact identity** — the derivation is in [CDS](/credit/cds), where the annuity cancels from both legs. For bond yield spreads it is an approximation whose error grows with `lambda * T`.

> warning **The triangle has two unknowns and one equation** A spread pins down the *product* `lambda * (1 - R)`, not either factor. Every default probability quoted from a market spread is conditional on a recovery assumption that was chosen, not observed. See [Recovery Rates](/credit/recovery-rates).

---

#### Worked Example: From Spread to a Default Curve

A five-year CDS on a corporate issuer quotes at 300 bp. Market convention for a senior unsecured corporate is a 40% recovery assumption.

**Step 1 — Invert the triangle for the hazard rate.**

```text
lambda = spread / (1 - R)
       = 0.0300 / (1 - 0.40)
       = 0.0300 / 0.60
       = 0.0500  =  5.00% per year
```

**Step 2 — Build the survival curve.** `S(t) = exp(-0.05 * t)`.

<table>
  <tbody>
    <tr><td><strong>Year t</strong></td><td><strong>S(t)</strong></td><td><strong>Cumulative PD</strong></td><td><strong>Marginal PD in year t</strong></td><td><strong>Conditional PD in year t</strong></td></tr>
    <tr><td>0</td><td>1.000000</td><td>0.00%</td><td>&mdash;</td><td>&mdash;</td></tr>
    <tr><td>1</td><td>0.951229</td><td>4.8771%</td><td>4.8771%</td><td>4.8771%</td></tr>
    <tr><td>2</td><td>0.904837</td><td>9.5163%</td><td>4.6392%</td><td>4.8771%</td></tr>
    <tr><td>3</td><td>0.860708</td><td>13.9292%</td><td>4.4129%</td><td>4.8771%</td></tr>
    <tr><td>4</td><td>0.818731</td><td>18.1269%</td><td>4.1977%</td><td>4.8771%</td></tr>
    <tr><td>5</td><td>0.778801</td><td>22.1199%</td><td>3.9930%</td><td>4.8771%</td></tr>
  </tbody>
</table>

Check the arithmetic on a few entries:

1. `S(5) = exp(-0.05 * 5) = exp(-0.25) = 0.778801`, so cumulative PD is `1 - 0.778801 = 22.1199%`
2. Marginal PD in year 5 is `S(4) - S(5) = 0.818731 - 0.778801 = 0.039930 = 3.9930%`
3. Conditional PD in year 5 is `0.039930 / 0.818731 = 0.048771 = 4.8771%` — identical to year 1, as constant hazard requires
4. The five marginal PDs sum to `0.048771 + 0.046392 + 0.044129 + 0.041977 + 0.039930 = 0.221199`, matching the cumulative figure exactly

Note the size of the number. A 300 bp spread does not mean "3% chance of default" — it implies a risk-neutral cumulative probability of roughly 22% over five years. And that figure is risk-neutral: the market's best guess at the *actual* five-year default rate for such an issuer would be materially lower.

> info **A 5% hazard is not a 5% annual default probability** `lambda = 5%` gives a one-year default probability of `1 - exp(-0.05) = 4.877%`. The two agree to first order for small `lambda` and diverge as it grows. At `lambda = 25%` the one-year PD is 22.1%, not 25%.

---

#### Real-World Versus Risk-Neutral

<table>
  <tbody>
    <tr><td><strong></strong></td><td><strong>Real-world (P)</strong></td><td><strong>Risk-neutral (Q)</strong></td></tr>
    <tr><td>Estimated from</td><td>Historical default data, financial statements, rating transitions, statistical models</td><td>Market prices: CDS spreads, bond spreads</td></tr>
    <tr><td>Answers</td><td>What is likely to happen</td><td>What price is consistent with no arbitrage</td></tr>
    <tr><td>Used for</td><td>Capital, provisioning, portfolio loss forecasting, credit decisions</td><td>Pricing and hedging derivatives, marking to market</td></tr>
    <tr><td>Relative size</td><td>Smaller</td><td>Larger, typically by a substantial multiple for high-quality credit</td></tr>
  </tbody>
</table>

The relationship is a change of measure (see [Change of Measure](/stochastic-calculus/change-of-measure) and [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)). The ratio `lambda_Q / lambda_P` is a risk premium, and it is not constant: it is larger for higher-quality credit, larger at longer maturities, and it widens sharply in stress, which is precisely when investors least want correlated losses. The practical rule follows. Pricing a CDS or marking a book requires `Q` — anything else admits arbitrage. Forecasting how much a loan book will actually lose next year requires `P`. Using `Q` for provisioning overstates expected losses; using `P` to price a derivative produces a quote nobody will trade against.

---

#### In Practice Across Asset Classes

**Corporate credit.** The triangle is used constantly, with recovery fixed at a market convention so that spreads and hazard rates can be moved between one another mechanically. For high-yield names the convention breaks down and the market prices the recovery directly.

**Sovereign credit.** Recovery from a sovereign restructuring is far more variable than for corporates and depends on politics, documentation, and creditor coordination. Conventional recovery assumptions for sovereign CDS are typically set lower than the corporate convention, but the dispersion around any assumption is very wide.

**Structured credit.** Tranche pricing depends less on any single `lambda` than on the joint distribution of defaults across the pool. A model calibrated correctly for every name marginally can still price a senior tranche badly if the correlation assumption is wrong.

**On-chain lending.** In an overcollateralised protocol there is no meaningful borrower hazard rate to estimate. The mechanism replaces "will they pay" with "can the collateral be sold above the debt" — see [Liquidations](/building-blocks/liquidations) and [Lending Architecture](/protocols/lending-architecture). The analogue of a default event is a liquidation that completes below the debt value, leaving bad debt in the pool. Modelling that is a market-microstructure and oracle-latency problem, not a hazard-rate problem, which is why the credit machinery on this page transfers poorly. Undercollateralised on-chain lending is a different matter and does require exactly this machinery.

---

#### Assumptions and Failure Modes

- **Constant hazard.** Real credit curves slope. A single `lambda` fitted to a five-year spread will misprice one-year and ten-year risk. Use a term structure — see [Credit Curves](/credit/credit-curves).
- **Fixed recovery, and independence of hazard from interest rates.** The whole default curve scales with the recovery assumption: halve `(1 - R)` and every `lambda` doubles. The clean triangle also assumes hazard and rates are uncorrelated, which fails in stress.
- **Treating `Q` as a forecast.** A 22% five-year risk-neutral PD is not a prediction that 22% of such issuers will default. It includes a risk premium that will not be realised as losses on average.
- **Estimating `P` from short samples.** Defaults are rare and clustered in time. A sample covering one or two credit cycles gives a very imprecise estimate of any long-run rate, and is highly sensitive to which years are included.
- **Ignoring contagion.** Both measures treat one issuer in isolation. Portfolio losses depend on how defaults co-move, which no single-name hazard rate captures.

---

#### Code

```python
import math


def hazard_from_spread(spread, recovery_rate):
    """Credit triangle: invert spread = lambda * (1 - R) for lambda.

    Exact for a continuously-paid CDS with flat hazard and flat rates;
    a good approximation for bond spreads when lambda * T is small.
    """
    return spread / (1.0 - recovery_rate)


def default_curve(hazard_rate, horizons):
    """Cumulative, marginal, and conditional PD for each integer horizon."""
    rows = []
    previous_survival = 1.0
    for t in horizons:
        survival = math.exp(-hazard_rate * t)
        marginal = previous_survival - survival
        rows.append({
            "year": t,
            "cumulative_pd": 1.0 - survival,
            "marginal_pd": marginal,
            "conditional_pd": marginal / previous_survival,
        })
        previous_survival = survival
    return rows


hazard = hazard_from_spread(0.0300, 0.40)   # 0.05
default_curve(hazard, [1, 2, 3, 4, 5])      # 5-year cumulative PD 22.12%
```

---

#### See Also

* [Credit Spreads](/credit/credit-spreads)
* [Recovery Rates](/credit/recovery-rates)
* [Credit Curves](/credit/credit-curves)
* [Reduced-Form Models](/credit/reduced-form-models)
* [Merton Model](/credit/merton-model)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)

---

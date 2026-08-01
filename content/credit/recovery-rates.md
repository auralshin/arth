### Recovery Rates

> info **Metadata** Level: Intermediate | Prerequisites: Credit 101, Default Probability | Tags: credit, recovery, lgd, seniority, waterfall

The recovery rate `R` is the fraction of a claim that is ultimately paid after default. Its complement, **loss given default (LGD = 1 - R)**, is the fraction lost. It is the least glamorous parameter in credit and the one with the most leverage: a spread pins down only the *product* of hazard rate and loss given default, so every default probability quoted from a market price is conditional on a recovery number that someone chose.

The choice is usually a convention rather than a measurement. That is defensible — it makes quotes comparable and lets the market speak in hazard rates — but it means a stated "22% probability of default" is really "22%, if you accept 40% recovery". Change the recovery assumption and the probability moves dramatically, as this page demonstrates.

---

#### Definitions and What Gets Measured

```text
LGD = 1 - R
R   = value recovered / face value of the claim
```

Two very different numbers both get called the recovery rate.

**Trading price recovery.** The market price of the defaulted obligation shortly after the credit event, conventionally measured around thirty days after default. This is what a CDS auction determines and what an investor who sells out realises. It is observable, timely, and reflects market expectations plus a liquidity discount from forced sellers.

**Ultimate recovery.** The value actually distributed to creditors when the insolvency process concludes — cash, new debt, or equity in the reorganised entity, discounted back to the default date. This is what a hold-to-resolution creditor experiences. It takes years to observe and requires judgement about how to value non-cash consideration.

These are not the same, and neither dominates. Post-default trading prices tend to be depressed by forced selling and uncertainty, while ultimate recoveries are measured with hindsight over a period during which conditions may have improved. The right one to use depends on whether the position will be sold or held.

> warning **A CDS pays the auction price, not the ultimate recovery** Contract settlement uses the auction-determined final price. A creditor who works the claim through the insolvency process may end up with a materially different outcome — better or worse — than the derivative settled at.

---

#### Seniority and the Waterfall

Recovery is determined by where you sit in the capital structure and how much value there is to distribute. The mechanism is a strict waterfall: each rank is paid in full before the next receives anything.

**Worked example — the same firm, three outcomes.** A company enters insolvency with the following claims and no other liabilities:

<table>
  <tbody>
    <tr><td><strong>Claim</strong></td><td><strong>Face value</strong></td></tr>
    <tr><td>Secured (first lien)</td><td>400</td></tr>
    <tr><td>Senior unsecured</td><td>300</td></tr>
    <tr><td>Subordinated</td><td>200</td></tr>
    <tr><td><strong>Total</strong></td><td><strong>900</strong></td></tr>
  </tbody>
</table>

Distribute three different enterprise values through the waterfall:

<table>
  <tbody>
    <tr><td><strong>Tranche</strong></td><td><strong>EV = 350</strong></td><td><strong>EV = 600</strong></td><td><strong>EV = 1,000</strong></td></tr>
    <tr><td>Secured (400)</td><td>350 &rarr; 87.5%</td><td>400 &rarr; 100%</td><td>400 &rarr; 100%</td></tr>
    <tr><td>Senior unsecured (300)</td><td>0 &rarr; 0%</td><td>200 &rarr; 66.7%</td><td>300 &rarr; 100%</td></tr>
    <tr><td>Subordinated (200)</td><td>0 &rarr; 0%</td><td>0 &rarr; 0%</td><td>200 &rarr; 100%</td></tr>
    <tr><td>Equity</td><td>0</td><td>0</td><td>100</td></tr>
    <tr><td><strong>Blended on total claims</strong></td><td><strong>38.9%</strong></td><td><strong>66.7%</strong></td><td><strong>100%</strong></td></tr>
  </tbody>
</table>

Check the middle column: secured takes the first 400, leaving `600 - 400 = 200` for a senior unsecured claim of 300, so `200 / 300 = 66.7%`; the subordinated claim gets nothing. Blended recovery is `600 / 900 = 66.7%`.

Two things stand out. First, recovery is a **step function of enterprise value**, not a smooth one — the subordinated tranche is at zero across a wide range and then jumps. Second, the same default event produces recoveries from 0% to 100% on claims against one issuer. "The recovery rate" is not a property of a company.

**Debt cushion.** The single best structural predictor of a tranche's recovery is often not its own label but how much junior debt sits beneath it. Senior unsecured debt with a large subordinated layer below it behaves very differently from senior unsecured debt that is the most junior instrument outstanding.

**Structural subordination.** Debt at a holding company ranks behind debt at the operating subsidiary that owns the assets, because the holding company's claim on the subsidiary is an equity claim that ranks last in the subsidiary's own waterfall. Two bonds can both say "senior unsecured" and recover completely differently for this reason alone.

---

#### The Leverage Over Every PD Estimate

This is the point of the page. Fix the market spread at 300 bp and vary only the recovery assumption. From the credit triangle, `lambda = spread / (1 - R)`:

<table>
  <tbody>
    <tr><td><strong>Assumed R</strong></td><td><strong>LGD</strong></td><td><strong>Implied hazard</strong></td><td><strong>S(5)</strong></td><td><strong>5-year cumulative PD</strong></td></tr>
    <tr><td>20%</td><td>80%</td><td>3.7500%</td><td>0.829029</td><td>17.10%</td></tr>
    <tr><td>40%</td><td>60%</td><td>5.0000%</td><td>0.778801</td><td>22.12%</td></tr>
    <tr><td>60%</td><td>40%</td><td>7.5000%</td><td>0.687289</td><td>31.27%</td></tr>
    <tr><td>80%</td><td>20%</td><td>15.0000%</td><td>0.472367</td><td>52.76%</td></tr>
  </tbody>
</table>

Verify the third row: `lambda = 0.0300 / 0.40 = 0.0750`, then `S(5) = exp(-0.075 * 5) = exp(-0.375) = 0.687289`, so cumulative PD is `1 - 0.687289 = 31.27%`.

One unchanged market price supports five-year default probabilities ranging from 17% to 53%. Nothing about the credit changed — only an assumption. The relationship is convex in `R`: moving from 20% to 40% recovery adds five percentage points of implied PD, while moving from 60% to 80% adds twenty-one.

> warning **Never quote an implied PD without its recovery assumption** A default probability derived from a spread is a two-parameter statement collapsed into one number. Reporting it alone is not a simplification, it is a loss of information, and it invites comparisons between figures computed on different conventions.

The practical resolution is that the market fixes `R` by convention — a standard assumption for senior unsecured corporates, a lower one for subordinated claims and for sovereigns — so that spreads and hazard rates can be converted mechanically. The convention is a unit of account, not an estimate. Where recovery genuinely matters, the market stops quoting spreads at all and quotes prices instead.

---

#### Recovery in Practice

Several patterns hold consistently, and are worth stating qualitatively rather than with invented precision.

- **Recoveries are procyclical in the wrong direction.** They tend to be lowest when default rates are highest. The same downturn that pushes firms into default also depresses the value of the assets creditors are trying to sell, and floods the market with distressed assets at once. A model treating `PD` and `R` as independent will understate portfolio tail losses, because the two adverse moves coincide.
- **Asset tangibility matters.** Sectors with liquid, redeployable physical assets tend to recover better than those whose value is intangible or human-capital dependent. A collateral pool that only has value inside the going concern is worth much less in liquidation.
- **Jurisdiction and insolvency regime matter.** Creditor-friendly regimes with fast, predictable processes support higher recoveries than regimes where proceedings are slow, uncertain, or subject to political intervention. This is a first-order effect for cross-border portfolios.
- **Leverage at default predicts recovery.** A firm that defaults with modest leverage usually had an idiosyncratic problem and retains value; one that defaults having accumulated a large debt stack has less to distribute per unit of claim.
- **Time in process erodes value.** Professional fees, operational disruption, and customer and supplier attrition all reduce distributable value. Ultimate recoveries should be discounted back to the default date, and often are not.

---

#### In Practice Across Asset Classes

**Corporate credit.** The most developed recovery framework: an established insolvency process, a market in defaulted debt, and a documented waterfall. Recovery analysis is genuine security-level work — collateral, guarantees, debt cushion, jurisdiction.

**Sovereign credit.** There is no bankruptcy process and no waterfall. Outcomes come from negotiated restructurings, and depend on collective action clauses, the composition of the creditor base, and political willingness. Dispersion around any central assumption is very wide, and holdout creditors have on occasion achieved outcomes wildly different from the exchange terms. Conventional recovery assumptions used for sovereign CDS are typically set below the corporate convention.

**Structured credit.** Recovery is defined at two levels: on the underlying assets in the pool, and on the tranche after the pool's waterfall. A senior tranche can recover in full while the pool recovers poorly, or a mezzanine tranche can go to zero from a pool loss that looks modest. The tranche attachment points do to the pool exactly what seniority does to a corporate balance sheet.

**On-chain lending.** This is where the comparison is most illuminating, because overcollateralised protocols invert the problem. Rather than estimating recovery after a failure, they attempt to guarantee it in advance: the borrower posts collateral worth more than the debt, and an automated [liquidation](/building-blocks/liquidations) sells that collateral once the health ratio breaches a threshold, with a liquidation bonus paid to whoever executes it. See [Lending and Borrowing](/building-blocks/lending-borrowing) and [Lending Architecture](/protocols/lending-architecture). The design target is `R = 100%` — full repayment of the debt from collateral — and in normal conditions it is achieved. When it is not, the failure mode is completely different from a corporate insolvency: no process, no negotiation, no waterfall, just a residual shortfall crystallised in seconds because the collateral gapped through the threshold faster than liquidators could act, or because the oracle price and the executable price diverged. The relevant model is market impact and price-gap risk, not a recovery distribution. Where these systems do have a waterfall, it is a protocol-level one — a reserve or insurance fund absorbing bad debt before it is socialised across suppliers.

---

#### Assumptions and Failure Modes

- **Treating recovery as a constant.** It is a distribution, and a wide, bimodal one. Point estimates hide that a claim often recovers either nearly everything or nearly nothing.
- **Assuming independence between `PD` and `R`.** They are negatively correlated. Ignoring this understates portfolio loss in exactly the scenarios capital is held for.
- **Applying an average recovery to a specific claim.** Averages are taken across seniorities, sectors, jurisdictions, and cycles. A specific instrument's recovery depends on its own collateral, cushion, and documentation.
- **Confusing trading price with ultimate recovery.** They differ systematically and are used for different purposes.
- **Using the market convention as an estimate.** The conventional recovery used to quote CDS is a unit of account. It was chosen for comparability, not fitted to the name in front of you.
- **Estimating from a small sample.** Defaults are rare and clustered. Any recovery statistic drawn from a handful of credit cycles carries wide error bars, and the composition of defaulters differs between cycles.
- **Ignoring the time value of the process.** An undiscounted ultimate recovery overstates what a creditor actually earned.

---

#### Code

```python
import math


def waterfall(enterprise_value, claims):
    """Distribute value through a strict seniority waterfall.

    `claims` is an ordered list of (name, face_value), most senior first.
    """
    remaining = enterprise_value
    results = []
    for name, face in claims:
        paid = min(face, remaining)
        remaining = remaining - paid
        results.append((name, paid, paid / face))
    return results, remaining   # leftover accrues to equity


def implied_pd(spread, recovery, years):
    """Cumulative risk-neutral PD from a spread, for one recovery assumption.

    The recovery assumption is an input, never an output. Report it alongside.
    """
    hazard = spread / (1.0 - recovery)
    return 1.0 - math.exp(-hazard * years)


structure = [("secured", 400), ("senior_unsecured", 300), ("subordinated", 200)]
waterfall(600, structure)
# secured 400 (100%), senior 200 (66.7%), subordinated 0 (0%), equity 0

[round(implied_pd(0.03, r, 5), 4) for r in (0.20, 0.40, 0.60, 0.80)]
# [0.1710, 0.2212, 0.3127, 0.5276]
```

---

#### See Also

* [Default Probability](/credit/default-probability)
* [Credit 101](/credit/credit-101)
* [CDS](/credit/cds)
* [Credit Curves](/credit/credit-curves)
* [Merton Model](/credit/merton-model)
* [Liquidations](/building-blocks/liquidations)

---

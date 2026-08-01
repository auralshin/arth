### Credit 101

> info **Metadata** Level: Beginner | Prerequisites: Fixed Income 101 | Tags: credit, default, seniority, ratings, capital-structure

Credit risk is the risk that someone who owes you money does not pay. That single sentence hides most of the subject, because "does not pay" comes in degrees — late, partial, restructured, or never — and because the price of a bond reflects not just how likely non-payment is but how much investors demand to bear that uncertainty.

Fixed income prices the *timing* of cash flows; credit prices their *existence*. A government bond in its own currency is analysed almost entirely through the discount curve (see [Yield Curves](/markets/yield-curves)). A corporate bond adds a second dimension: the issuer might not be there in year seven. Everything in this section — spreads, hazard rates, structural models, credit default swaps — is machinery for putting a number on that second dimension.

---

#### Who Issues Credit Risk

<table>
  <tbody>
    <tr><td><strong>Issuer type</strong></td><td><strong>Distinctive feature</strong></td><td><strong>What drives the spread</strong></td></tr>
    <tr><td>Sovereigns (own currency)</td><td>Can create the currency of the debt</td><td>Inflation and policy risk more than outright default</td></tr>
    <tr><td>Sovereigns (foreign currency)</td><td>Cannot print what it owes</td><td>Reserves, external balance, willingness to pay</td></tr>
    <tr><td>Financial institutions</td><td>Balance sheet is itself a portfolio of credit</td><td>Funding, capital ratios, resolution regime</td></tr>
    <tr><td>Non-financial corporates</td><td>Cash flows from operations service the debt</td><td>Leverage, earnings volatility, refinancing wall</td></tr>
    <tr><td>Structured vehicles</td><td>A ring-fenced pool of assets with tranched claims</td><td>Pool losses and where the tranche sits in the waterfall</td></tr>
  </tbody>
</table>

The instruments range from bilateral loans and revolving credit facilities, through publicly traded bonds, to synthetic exposure via [credit default swaps](/credit/cds). The economics of the underlying risk are the same; the liquidity, documentation, and recovery process are not.

---

#### Seniority and the Capital Structure

A company's liabilities are ranked. In insolvency, claims are paid in order and each rank is paid in full before the next receives anything. This ordering — the **waterfall** — is what makes an otherwise identical claim on the same firm worth very different amounts.

<table>
  <tbody>
    <tr><td><strong>Rank</strong></td><td><strong>Claim</strong></td><td><strong>Position in the waterfall</strong></td></tr>
    <tr><td>1</td><td>Secured debt (first lien)</td><td>Paid from specific pledged collateral before unsecured claims</td></tr>
    <tr><td>2</td><td>Second lien</td><td>Same collateral, junior to first lien</td></tr>
    <tr><td>3</td><td>Senior unsecured</td><td>General claim on remaining assets; the reference obligation for most CDS</td></tr>
    <tr><td>4</td><td>Subordinated / junior</td><td>Contractually behind senior unsecured</td></tr>
    <tr><td>5</td><td>Hybrid and preferred</td><td>Often coupon-deferrable; equity-like in stress</td></tr>
    <tr><td>6</td><td>Common equity</td><td>Residual claim — paid only if every liability is satisfied</td></tr>
  </tbody>
</table>

Two subtleties matter more than the table suggests. **Structural subordination**: debt issued at a holding company is effectively junior to debt at the operating subsidiary that owns the assets, even if both are labelled "senior unsecured", because the holding company's claim on the subsidiary is an equity claim. **Debt cushion**: the amount of junior debt sitting below your instrument is often a better predictor of your recovery than your own label.

---

#### Worked Example: Expected Loss on a Loan

A bank holds a £10,000,000 senior unsecured loan. Its credit committee estimates a 2% probability of default over the next year and expects to recover 40% of face value if default occurs.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Symbol</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Exposure at default</td><td><code>EAD</code></td><td>£10,000,000</td></tr>
    <tr><td>Probability of default (1 year)</td><td><code>PD</code></td><td>2.0%</td></tr>
    <tr><td>Recovery rate</td><td><code>R</code></td><td>40%</td></tr>
    <tr><td>Loss given default</td><td><code>LGD = 1 - R</code></td><td>60%</td></tr>
  </tbody>
</table>

```text
EL = PD * LGD * EAD
```

1. **Loss given default**: `LGD = 1 - 0.40 = 0.60`
2. **Expected loss**: `EL = 0.02 * 0.60 * 10,000,000 = 120,000`
3. **As a rate on notional**: `120,000 / 10,000,000 = 1.20% = 120 bp per year`

Now suppose a bond from the same issuer trades at 200 bp over the government curve. The 120 bp of expected loss accounts for only 60% of the spread. The residual 80 bp is compensation for something other than average losses: illiquidity, the risk that defaults cluster in bad states of the world, and model uncertainty about the 2% itself. That decomposition is the subject of [Credit Spreads](/credit/credit-spreads).

> info **Expected loss is not the risk** `EL` is a mean. Credit portfolios lose money in lumps: most years slightly better than expected, occasionally far worse. The dispersion around `EL` — unexpected loss — is what capital is held against, and it is driven by default correlation rather than by individual `PD` estimates.

---

#### Ratings and What They Do Not Tell You

Rating agencies map issuers and instruments onto an ordinal scale: `AAA`, `AA`, `A`, `BBB`, `BB`, `B`, `CCC` and below on the S&P and Fitch scales, `Aaa` through `Caa` and below at Moody's, with notches such as `BBB+` and `BBB-`. The boundary between `BBB-`/`Baa3` and `BB+`/`Ba1` divides **investment grade** from **high yield** (also called speculative grade).

What a rating is:

- An ordinal ranking of relative credit quality, produced by analysts against a published methodology.
- Deliberately **through-the-cycle**: agencies aim to rate the issuer's ability to withstand a downturn, not to track its market spread week to week.
- The agencies differ in what the scale targets. Some methodologies are anchored on probability of default, others on expected loss, which folds recovery expectations into the letter. Two ratings that look comparable may therefore be answering different questions.

What a rating is not:

- **Not a spread forecast.** A bond can be downgraded after its spread has already widened by hundreds of basis points. Ratings lag market prices by construction.
- **Not a cardinal probability.** A move from `A` to `BBB` does not correspond to a fixed multiple of default probability across sectors and eras.
- **Not a liquidity measure.** Two equally rated bonds can have completely different bid-offer and market depth.
- **Not free of incentive problems.** The issuer-pays model has an obvious conflict, and rating criteria for structured products have been revised substantially after they underperformed in stress.

> warning **Rating cliffs are mechanical** Many mandates and indices permit only investment-grade holdings. A downgrade across the `BBB-`/`BB+` line can force selling from holders who have no view on the credit at all, so the price move at the boundary reflects flow as much as fundamentals.

---

#### In Practice Across Asset Classes

**Corporate credit.** The analysis is bottom-up: leverage, interest cover, covenant package, maturity profile. The legal machinery of default is well developed and recovery is negotiated in a defined insolvency process.

**Sovereign credit.** There is no bankruptcy court. Restructuring is a negotiation, collective action clauses in the documentation matter enormously, and "willingness to pay" is a genuine variable alongside ability. Local-currency and hard-currency debt from the same sovereign carry materially different risks and often trade with different spreads.

**Structured credit.** Default risk is engineered rather than inherited. A pool of loans is tranched, and the senior tranche's risk depends less on any single borrower than on the correlation of losses across the pool. The critical parameter is one you cannot observe directly.

**On-chain lending.** Overcollateralised lending protocols take a different route entirely: rather than pricing default risk, they attempt to eliminate it. A borrower posts collateral worth more than the loan, and an automated [liquidation](/building-blocks/liquidations) mechanism sells that collateral when the ratio deteriorates. There is no credit committee, no covenant, and no seniority ladder — see [Lending and Borrowing](/building-blocks/lending-borrowing) and [Lending Architecture](/protocols/lending-architecture). The result is not "no risk", it is *different* risk: the exposure moves from borrower solvency to whether the collateral can actually be sold at the oracle price during a fast move. Bad debt in these systems arises from liquidation failure, not from a borrower's income statement. Undercollateralised on-chain credit, where it exists, reintroduces the traditional problem in full.

---

#### Assumptions and Failure Modes

- **Assuming `PD` and `R` are independently knowable.** They are estimated jointly from the same thin data, and a spread pins down only their product. See [Recovery Rates](/credit/recovery-rates).
- **Assuming defaults are independent.** Portfolio losses are driven by correlation. A model that gets every individual `PD` right and the correlation wrong will understate tail loss badly.
- **Treating the rating as the risk measure.** Ratings are slow, ordinal, and coarse. Spreads move first.
- **Ignoring the documentation.** Seniority, guarantees, security, and covenants are legal facts, and two bonds from one issuer can have very different outcomes because of them.
- **Assuming the historical default record generalises.** Default data is sparse, clustered in time, and drawn from a small number of credit cycles. Any estimate of a low-probability event from such a sample carries wide error bars.
- **Extrapolating through-the-cycle statistics to a point-in-time question.** "How likely is default over the next twelve months, given today's conditions" is a different question from "how has this rating band behaved on average".

---

#### Code

```python
def expected_loss(exposure, prob_default, recovery_rate):
    """One-period expected credit loss in currency units.

    Ignores discounting and default timing within the period, which is
    acceptable at short horizons and not at long ones.
    """
    loss_given_default = 1.0 - recovery_rate
    return exposure * prob_default * loss_given_default


def expected_loss_bp(prob_default, recovery_rate):
    """Same quantity expressed as an annual rate on notional, in basis points."""
    return prob_default * (1.0 - recovery_rate) * 10_000


# 2% PD with 40% recovery gives 120 bp of expected loss per year
expected_loss_bp(0.02, 0.40)
```

---

#### See Also

* [Credit Spreads](/credit/credit-spreads)
* [Default Probability](/credit/default-probability)
* [Recovery Rates](/credit/recovery-rates)
* [Fixed Income 101](/markets/fixed-income-101)
* [Lending and Borrowing](/building-blocks/lending-borrowing)
* [Types of Risk](/risk/types)

---

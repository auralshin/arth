### Credit Default Swaps

> info **Metadata** Level: Intermediate | Prerequisites: Credit Spreads, Default Probability | Tags: credit, cds, protection, basis, upfront, mark-to-market

A **credit default swap (CDS)** is an insurance-shaped contract on an issuer's failure to pay. The protection buyer pays a periodic premium; if a credit event occurs, the protection seller compensates for the loss on the reference obligation. Nothing is lent, and neither party need own the underlying bond.

The instrument matters beyond its own market because it produces the cleanest observable credit price. A bond's spread is contaminated by its coupon, its price relative to par, its issue-specific liquidity, and the choice of benchmark curve. A CDS quotes a single spread on a standardised contract with standardised maturity dates and documentation, which is why the [credit curves](/credit/credit-curves) that everything else is calibrated against are built from CDS rather than from bonds.

---

#### Mechanics

**The premium leg.** The buyer pays a fixed rate on the notional, quarterly in arrears, on standard IMM dates (20 March, June, September, December). Payments continue until maturity or the credit event, whichever comes first. If default happens mid-period, the buyer pays the accrued premium up to the default date.

**The protection leg.** On a credit event the seller pays `(1 - R) * notional`. Physical settlement — deliver the bond, receive par — is still permitted, but auction-based cash settlement is now the norm because notional outstanding routinely exceeds the deliverable bonds. An auction establishes one final price for the deliverable obligations, and that price becomes `R` for every contract on the name.

**Credit events.** Defined by ISDA documentation, not by common sense. The standard set for corporates is bankruptcy, failure to pay, and (in some regions) restructuring. Whether a given situation qualifies is decided by a **Determinations Committee**, and that decision is itself a source of risk: contracts have been argued over precisely because a distressed situation sat near a definitional boundary.

> warning **CDS is not insurance in the legal sense** You need no insurable interest. A "naked" position is a directional view on credit, not a hedge, and it carries the full mark-to-market risk of a spread move without any offsetting bond position.

---

#### Formal Definition

Write `S(t)` for the risk-neutral survival probability and `D(t)` for the risk-free discount factor. The two legs are:

```text
PremiumLeg = spread * RPV01
RPV01      = sum over payment dates of  dt_i * D(t_i) * S(t_i)

ProtectionLeg = (1 - R) * integral from 0 to T of  D(s) * (-dS(s))
```

where:

- `RPV01` is the **risky annuity**: the present value of 1 bp paid per year for the life of the contract, weighted by the probability of still being alive to pay it
- `dt_i` is the accrual fraction for period `i`
- `-dS(s)` is the risk-neutral probability density of defaulting at time `s`

The **par spread** is the rate that makes the contract worth zero at inception:

```text
par_spread = ProtectionLeg / RPV01
```

**The credit triangle, derived.** Take a flat hazard `lambda`, a flat continuous rate `r`, and continuously-paid premium. Then `S(s) = exp(-lambda*s)`, `D(s) = exp(-r*s)`, and `-dS(s) = lambda * exp(-lambda*s) ds`. Write `I` for the shared integral:

```text
I             = integral from 0 to T of exp(-(r + lambda) * s) ds
RPV01         = I
ProtectionLeg = (1 - R) * lambda * I
par_spread    = (1 - R) * lambda * I / I  =  lambda * (1 - R)
```

The annuity cancels. This is why `spread = lambda * (1 - R)` is an exact identity for a CDS and only an approximation for a bond yield spread.

---

#### Worked Example: Par Spread, Upfront, and Mark to Market

Take a five-year CDS with a flat 3% continuously compounded rate curve, a 5% hazard rate, and the market-convention 40% recovery. Notional is 10,000,000.

**Step 1 — The shared integral.** With `r + lambda = 0.08`:

```text
I = (1 - exp(-0.08 * 5)) / 0.08 = (1 - 0.670320) / 0.08 = 0.329680 / 0.08 = 4.1210
```

So `RPV01 = 4.1210`. Each basis point of running spread is worth `4.1210 bp` in present value.

**Step 2 — Protection leg.** `(1 - 0.40) * 0.05 * 4.1210 = 0.6 * 0.206050 = 0.123630` per unit of notional.

**Step 3 — Par spread.** `0.123630 / 4.1210 = 0.0300 = 300 bp`, exactly the credit triangle result.

**Step 4 — Upfront on a standard coupon.** Single-name CDS trade with fixed coupons (commonly 100 bp for investment grade and 500 bp for high yield), with the difference settled as cash at inception. With a 100 bp coupon:

```text
upfront = (par_spread - coupon) * RPV01 * notional
        = (0.0300 - 0.0100) * 4.1210 * 10,000,000  =  824,200
```

The protection buyer pays roughly 8.24 points upfront and then 100 bp running. The economics are identical to paying 300 bp running; the standardisation exists so contracts on the same name are fungible and can be netted at a clearing house.

**Step 5 — Mark to market a year later.** The position was struck at 300 bp on five-year protection. One year on, four years remain and the four-year par spread has widened to 500 bp. Inverting the triangle, the implied hazard is now `0.0500 / 0.60 = 8.3333%`, so `r + lambda = 0.113333`:

```text
RPV01(4y) = (1 - exp(-0.113333 * 4)) / 0.113333
          = (1 - 0.635506) / 0.113333  =  3.2161

MTM to buyer = (spread_now - spread_struck) * RPV01_now * notional
             = (0.0500 - 0.0300) * 3.2161 * 10,000,000  =  643,224
```

The buyer is up about 643,000. Note where the sensitivity lives: the gain is `RPV01` multiplied by the spread change multiplied by notional, so `RPV01` is the credit market's equivalent of duration. It is why a 100 bp widening on a ten-year contract hurts far more than the same widening on a two-year one, and why `RPV01` itself shrinks as spreads widen — a convexity effect that makes the position gain less than linearly.

> warning **This uses a continuous-payment approximation** Real contracts pay quarterly, accrue premium to the default date, and are priced with the ISDA standard model on an actual/360 day-count with a specific set of conventions. The figures above are correct for the stated continuous model and will differ from a screen quote by a few basis points of upfront.

---

#### The CDS-Bond Basis

The same credit risk trades in two places, and the prices differ.

```text
basis = CDS_spread - bond_spread
```

with the bond spread usually measured as an asset-swap spread or Z-spread (see [Credit Spreads](/credit/credit-spreads)). A **negative basis** means the bond looks cheap relative to protection: you could buy the bond and buy protection, apparently locking in a spread with the credit risk hedged.

Persistent basis is not free money. It is compensation for the reasons the two instruments are not identical:

- **Funding.** Buying the bond requires cash at your funding rate; buying protection is unfunded. Widen your funding spread and the negative-basis trade stops working.
- **Counterparty risk.** Protection is only as good as the seller, and the seller is most likely to fail exactly when you need to claim. Clearing and collateral reduce but do not eliminate this.
- **The cheapest-to-deliver option.** The protection buyer effectively holds an option over which obligation defines the auction price, which widens CDS relative to any specific bond.
- **Documentation and short-selling frictions.** The CDS references a defined set of obligations under ISDA terms that your bond may not match in a restructuring, and establishing the reverse trade requires borrowing the bond, which may be impossible or expensive.

Basis widens sharply in stress, when funding tightens and counterparty concerns rise — that is, when the "hedged" position is most likely to be marked against you.

---

#### In Practice Across Asset Classes

**Corporate single-name CDS.** Standardised coupons, quarterly IMM maturities, mostly centrally cleared for the liquid names. Liquidity is concentrated at the five-year point and thins quickly elsewhere, so the rest of the curve is often more model than market. Index CDS — baskets of equally weighted single names traded as one contract — are typically far more liquid than their constituents, which creates its own basis between the index spread and the theoretical spread implied by the underlying names.

**Sovereign CDS.** Different conventional recovery, different credit event definitions, and a strong link between the credit event and currency moves. Quoted in the currency of a different sovereign for exactly that reason.

**Structured credit.** Tranched index products (equity, mezzanine, senior) trade off the same single-name curves plus a correlation assumption. The correlation parameter is not observable and is backed out from tranche prices, giving "implied correlation" — a quantity whose behaviour across the capital structure exposes the model's misspecification.

**On-chain credit.** There is no equivalent instrument at meaningful scale, and the reason is instructive. A CDS requires a legally enforceable definition of a credit event, a neutral body to determine whether it occurred, and an auction to price the loss. Overcollateralised lending protocols do not generate credit events in that sense — a position that deteriorates is [liquidated](/building-blocks/liquidations) automatically, not adjudicated. See [Lending Architecture](/protocols/lending-architecture). Protocol cover products that pay on a smart-contract exploit or a stablecoin depeg are structurally closer to parametric insurance than to a CDS: the trigger is a mechanical condition rather than a determination of an obligor's failure to pay.

---

#### Assumptions and Failure Modes

- **Fixed recovery.** Every hazard rate implied from a CDS spread is conditional on the assumed recovery. See [Recovery Rates](/credit/recovery-rates).
- **Independence of rates and credit, and counterparty risk.** The pricing above separates the discount curve from the survival curve. Wrong-way risk sits precisely in this crack: uncleared protection from a seller correlated with the reference entity may be worth far less than its mark, and is most likely to fail when you need to claim.
- **Credit event definitions are legal, not economic.** A restructuring that damages bondholders may or may not trigger. Determinations Committee decisions have been genuinely contested.
- **Liquidity is concentrated.** Off-the-run maturities and less liquid names are marked from interpolated curves, so their reported volatility understates true uncertainty.
- **Auction recovery is not fundamental recovery.** The auction price clears at one moment, driven partly by the balance of physical settlement requests, and can differ substantially from what creditors ultimately receive.
- **`RPV01` is not constant.** Marking a position with a stale annuity misstates the P&L, and the error grows as spreads move.

---

#### Code

```python
import math


def cds_metrics(hazard, recovery, risk_free, years):
    """Risky annuity and par spread under a flat hazard curve.

    Continuous-premium approximation: both legs share the same integral,
    which is why the par spread collapses to the credit triangle.
    """
    total_rate = risk_free + hazard
    shared_integral = (1.0 - math.exp(-total_rate * years)) / total_rate
    protection_leg = (1.0 - recovery) * hazard * shared_integral
    return {"rpv01": shared_integral, "par_spread": protection_leg / shared_integral}


def value_to_buyer(spread_now, spread_paid, rpv01, notional):
    """Upfront at inception and mark to market later are the same expression.

    Positive when the market spread exceeds the rate the buyer is paying.
    """
    return (spread_now - spread_paid) * rpv01 * notional


five_year = cds_metrics(0.05, 0.40, 0.03, 5)
five_year["par_spread"]                                          # 0.0300
value_to_buyer(0.0300, 0.0100, five_year["rpv01"], 10_000_000)   # 824,200 upfront

four_year = cds_metrics(0.05 / 0.60, 0.40, 0.03, 4)
value_to_buyer(0.0500, 0.0300, four_year["rpv01"], 10_000_000)   # 643,224 MTM
```

---

#### See Also

* [Credit Spreads](/credit/credit-spreads)
* [Default Probability](/credit/default-probability)
* [Credit Curves](/credit/credit-curves)
* [Recovery Rates](/credit/recovery-rates)
* [Reduced-Form Models](/credit/reduced-form-models)
* [Fixed Income 101](/markets/fixed-income-101)

---

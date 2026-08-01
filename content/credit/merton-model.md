### The Merton Model

> info **Metadata** Level: Advanced | Prerequisites: Black-Scholes, Options 101, Credit 101 | Tags: credit, structural-model, merton, distance-to-default, option-pricing

The Merton model is the founding idea of structural credit modelling, and it is one observation: **equity is a call option on the firm's assets**. Shareholders own the residual. If the assets are worth more than the debt at maturity, they repay the debt and keep the difference; if not, they hand the firm over and walk away. That payoff — `max(V - K, 0)` where `V` is asset value and `K` is the face of the debt — is exactly a call option struck at the debt.

Once you accept that framing, the whole apparatus of option pricing applies to credit. Default probability becomes the probability the call finishes out of the money. The credit spread becomes the price of the put that bondholders have implicitly written. And leverage and asset volatility become the two variables that matter, which is a genuinely useful reframing even when the model's numbers are wrong.

---

#### Formal Definition

Assume a firm whose assets `V` follow geometric Brownian motion under the risk-neutral measure, and whose entire debt is a single zero-coupon bond of face value `K` maturing at `T`:

```text
dV = r * V * dt + sigma_V * V * dW
```

At maturity the claims split:

```text
Equity_T = max(V_T - K, 0)          (a call on the assets)
Debt_T   = min(V_T, K) = K - max(K - V_T, 0)   (risk-free debt minus a put)
```

So equity is priced by Black-Scholes:

```text
E = V * N(d1) - K * exp(-r*T) * N(d2)

d1 = ( ln(V/K) + (r + 0.5*sigma_V^2) * T ) / ( sigma_V * sqrt(T) )
d2 = d1 - sigma_V * sqrt(T)
```

where:

- `V` is the current market value of the firm's assets
- `K` is the face value of the debt (the default barrier at `T`)
- `sigma_V` is the volatility of asset returns
- `r` is the risk-free rate
- `N(.)` is the standard normal cumulative distribution function

Three quantities fall straight out: `PD_risk_neutral = Prob(V_T less than K) = N(-d2)`, the risk-neutral **distance to default** `= d2`, and the debt value `D = V - E = K * exp(-r*T) - Put`.

**Distance to default** is the interpretable one. `d2` measures how many standard deviations of asset value sit between the firm today and its default barrier at `T`. It compresses leverage, asset volatility, and horizon into one number, and it is monotone in exactly the way intuition demands: more assets, less debt, or lower volatility all push it up.

> info **The unobservable inputs** Neither `V` nor `sigma_V` is observable. What you see is equity value `E` and equity volatility `sigma_E`. The standard fix is to solve two equations simultaneously: the Black-Scholes equation above, and `sigma_E = (V / E) * N(d1) * sigma_V`, which comes from Itô's lemma applied to `E(V)`.

---

#### Worked Example

A firm has assets worth 150, a single zero-coupon debt issue with face value 100 maturing in one year, asset volatility of 25%, and a risk-free rate of 3% (continuously compounded).

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Symbol</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Asset value</td><td><code>V</code></td><td>150</td></tr>
    <tr><td>Debt face value</td><td><code>K</code></td><td>100</td></tr>
    <tr><td>Asset volatility</td><td><code>sigma_V</code></td><td>25%</td></tr>
    <tr><td>Risk-free rate</td><td><code>r</code></td><td>3%</td></tr>
    <tr><td>Horizon</td><td><code>T</code></td><td>1 year</td></tr>
  </tbody>
</table>

1. **`d1`**: `ln(150/100) = 0.405465`, and `(r + 0.5*sigma_V^2)*T = 0.03 + 0.03125 = 0.06125`. So `d1 = (0.405465 + 0.06125) / 0.25 = 1.86686`
2. **`d2`**: `1.86686 - 0.25 = 1.61686`. This is the **distance to default**: the firm sits 1.62 asset-volatility units above its barrier.
3. **Risk-neutral default probability**: `N(-1.61686) = 0.05295 = 5.295%`
4. **Equity value**: `N(d1) = 0.969039`, `N(d2) = 0.947046`, `K*exp(-rT) = 97.0446`

```text
E = 150 * 0.969039 - 97.0446 * 0.947046 = 145.3559 - 91.9056 = 53.450
```

5. **Debt value**: `D = V - E = 150 - 53.450 = 96.550`
6. **Debt yield** (continuously compounded, face 100 in one year): `-ln(96.550 / 100) = 3.5112%`
7. **Credit spread**: `3.5112% - 3.0000% = 0.5112% = 51.1 bp`

**Cross-check via the put.** The bondholders' implicit short put is worth `Put = K*exp(-rT)*N(-d2) - V*N(-d1) = 97.0446*0.052954 - 150*0.030961 = 5.1389 - 4.6441 = 0.4948`. Then `D = 97.0446 - 0.4948 = 96.550`, matching step 5 exactly.

**Equity volatility.** `sigma_E = (V/E) * N(d1) * sigma_V = (150/53.450) * 0.969039 * 0.25 = 67.99%`. A 25% asset volatility becomes a 68% equity volatility at this leverage. This is the leverage amplification that the two-equation solve exploits in reverse.

---

#### What the Example Reveals About Recovery

The model implies a recovery rate, and it is instructive. The risk-neutral expected shortfall given default is the put payoff divided by the default probability:

```text
E[K - V_T | default] = (Put / exp(-r*T)) / PD
                     = (0.4948 / 0.970446) / 0.052954
                     = 0.50990 / 0.052954
                     = 9.629
```

On a face of 100 that is a loss given default of 9.6%, so an implied **recovery of 90.4%**.

Sanity-check against the credit triangle from [Default Probability](/credit/default-probability). A 5.295% one-year PD corresponds to a hazard of `-ln(1 - 0.05295) = 5.441%`, so `spread = lambda * (1 - R)` gives `1 - R = 0.005112 / 0.05441 = 0.0939` and `R = 90.6%` — consistent with the 90.4% above, to within the discrete-versus-continuous approximation.

That 90% recovery is the model telling on itself. In a diffusion, asset value moves continuously, so a firm that defaults at `T` must have drifted only *just* below the barrier. It cannot gap through. The consequence is the model's most famous failure: it produces short-maturity credit spreads that approach zero, because a firm comfortably above its barrier today has essentially no chance of reaching it in a week. Observed short-dated spreads are not zero.

> warning **Diffusion makes default predictable** In the Merton framework, default is a *predictable* stopping time: you can see it coming as `V` drifts toward `K`. Real defaults arrive with surprise — fraud, litigation, a funding market closing overnight. Adding jumps to the asset process, or moving to a [reduced-form model](/credit/reduced-form-models) where default is inaccessible by construction, both fix this.

---

#### Extensions and the Practitioner Version

The academic model is a starting point; the version used commercially is heavily modified.

- **First-passage (barrier) models.** Default is triggered the first time `V` touches a barrier at any point before `T`, not only at maturity. This is far more realistic — covenant breaches and funding runs happen mid-life — and raises default probabilities materially. Endogenous-default variants go further and let shareholders choose the barrier by optimising when to stop injecting equity.
- **KMV-style distance to default.** Practitioners replace the risk-neutral drift `r` with an estimated real-world asset drift `mu`, and replace the barrier with an empirical **default point**, conventionally somewhere between short-term debt and short-term debt plus a portion of long-term debt:

```text
DD = ( ln(V / default_point) + (mu - 0.5*sigma_V^2) * T ) / ( sigma_V * sqrt(T) )
```

  The resulting `DD` is then mapped to a default frequency through an empirical table rather than through `N(-DD)`, precisely because the normal tail is known to fit badly.

- **Coupon debt and multiple maturities.** Real capital structures hold many instruments of differing seniority and maturity, and modelling them jointly reintroduces the whole waterfall from [Credit 101](/credit/credit-101).

---

#### In Practice Across Asset Classes

**Corporate credit.** This is the model's home. Distance to default is a genuinely good *ranking* variable — it tends to deteriorate ahead of downgrades because it responds to equity prices, which move faster than ratings. Its absolute default probabilities are much less trustworthy than its ordering.

**Financial institutions.** The framework struggles badly. A bank's assets are opaque and its liabilities include deposits and short-term funding that can run. "Asset value falls below debt" is not how a bank fails; it fails when funding disappears while it is still nominally solvent.

**Sovereign and structured credit.** For sovereigns there is no balance sheet in the required sense and no enforceable barrier, so structural models are not used. In structured credit, Merton-style thinking appears indirectly: the one-factor Gaussian copula underpinning tranche pricing is essentially a Merton model per obligor with a shared systematic asset factor, and it inherits the diffusion assumption's weaknesses, including the understatement of joint tail events.

**On-chain lending.** There is a real structural analogue here, and it is closer than most comparisons in this section. An overcollateralised loan has an observable "asset value" (the posted collateral, marked by an oracle) and an observable barrier (the liquidation threshold) — both of which Merton has to guess at for a corporate. See [Lending and Borrowing](/building-blocks/lending-borrowing) and [Liquidations](/building-blocks/liquidations). But the mechanism differs in the decisive respect: crossing the barrier triggers an automatic sale rather than an insolvency process, so the protocol is short a put on the collateral only to the extent that liquidation *fails* — through a price gap, an oracle lag, or insufficient liquidity. That residual is a jump-risk problem, which is exactly the risk the pure diffusion model omits.

---

#### Assumptions and Failure Modes

- **Geometric Brownian motion for assets.** No jumps. This drives short-maturity spreads to zero and implied recoveries close to par.
- **A single zero-coupon debt issue.** Real firms have staggered maturities and a seniority ladder, and refinancing risk — rolling debt at an unknown future spread — is absent entirely.
- **Asset value and asset volatility are unobservable.** Everything depends on a two-equation solve whose inputs are equity prices, which contain their own noise and their own risk premia.
- **Default only at maturity.** The basic model ignores mid-life covenant breaches. First-passage variants address this, at the cost of a barrier you must specify.
- **Constant volatility and constant rates.** Asset volatility is itself stochastic and rises in stress, precisely when it matters most.
- **No strategic behaviour.** Firms restructure, negotiate, and default strategically; the model assumes a mechanical rule. And `N(-d2)` is a `Q`-measure probability, not an estimate of how often such firms actually default.

---

#### Code

```python
import math
from statistics import NormalDist

normal_cdf = NormalDist().cdf


def merton(asset_value, debt_face, asset_vol, risk_free, years):
    """Risk-neutral PD, distance to default, equity value and credit spread."""
    vol_time = asset_vol * math.sqrt(years)
    d1 = (math.log(asset_value / debt_face)
          + (risk_free + 0.5 * asset_vol ** 2) * years) / vol_time
    d2 = d1 - vol_time

    equity = (asset_value * normal_cdf(d1)
              - debt_face * math.exp(-risk_free * years) * normal_cdf(d2))
    debt = asset_value - equity

    return {
        "distance_to_default": d2,
        "pd_risk_neutral": normal_cdf(-d2),
        "equity": equity,
        "credit_spread_bp": (-math.log(debt / debt_face) / years - risk_free) * 10_000,
        # Leverage turns asset vol into the much larger observable equity vol.
        "implied_equity_vol": (asset_value / equity) * normal_cdf(d1) * asset_vol,
    }


merton(asset_value=150, debt_face=100, asset_vol=0.25, risk_free=0.03, years=1)
# distance_to_default 1.617, pd 5.295%, spread 51.1 bp, equity vol 68.0%
```

---

#### See Also

* [Reduced-Form Models](/credit/reduced-form-models)
* [Default Probability](/credit/default-probability)
* [Recovery Rates](/credit/recovery-rates)
* [Black-Scholes](/derivatives/black-scholes)
* [Options 101](/derivatives/options-101)
* [Jumps](/quant-math/jumps)

---

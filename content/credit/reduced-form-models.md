### Reduced-Form Models

> info **Metadata** Level: Advanced | Prerequisites: Default Probability, Credit Spreads, Risk-Neutral Pricing | Tags: credit, hazard-rate, intensity, poisson, calibration

Structural models like [Merton](/credit/merton-model) ask *why* a firm defaults and derive default from the balance sheet. Reduced-form models decline to ask. They treat default as an exogenous random event — the first arrival of a jump process with some intensity — and spend their effort making sure the model reproduces observed market prices exactly.

This sounds like a retreat, and philosophically it is. In practice it is the framework that gets used for pricing and hedging, for the same reason Black-Scholes gets used despite lognormality being wrong: it calibrates cleanly to liquid quotes, it prices consistently across instruments on the same name, and it does not require you to estimate the market value of a firm's assets from thin air.

---

#### Default as the First Jump

Let default time `tau` be the first arrival of a counting process with intensity `lambda(t)`. Conditional on survival to `t`, the probability of defaulting in the next instant is `lambda(t) * dt`. Nothing about the firm's state predicts the arrival — it is a surprise by construction.

For a deterministic intensity, survival is:

```text
S(t) = Prob(tau greater than t) = exp( -integral from 0 to t of lambda(u) du )
```

and with `lambda` constant, `tau` is exponentially distributed:

```text
S(t) = exp(-lambda * t)
```

If the intensity is itself stochastic — a **Cox process** or doubly stochastic Poisson process — survival becomes an expectation:

```text
S(t) = E[ exp( -integral from 0 to t of lambda(u) du ) ]
```

which is structurally identical to the pricing of a zero-coupon bond under a stochastic short rate. That is not a coincidence, and it is the whole reason the framework is tractable: **every interest rate model you already know can be repurposed as an intensity model.** A Cox-Ingersoll-Ross process for `lambda` guarantees positivity and gives closed-form survival probabilities; an [Ornstein-Uhlenbeck](/quant-math/mean-reversion) process gives mean reversion but admits negative intensities.

The pricing consequence is the key identity. Under the risk-neutral measure, with independence between rates and intensity, a defaultable claim paying 1 at `T` if no default has occurred is worth:

```text
P_risky(0, T) = exp( -(r + lambda) * T )
```

The intensity acts exactly like a spread added to the discount rate. This is the mathematical reason a credit spread and a hazard rate are so nearly interchangeable.

---

#### Pricing with Recovery

Zero recovery is unrealistic. Assume instead that a fraction `R` of face value is paid at the moment of default. For a zero-coupon bond of face `F` maturing at `T`, with constant `r` and `lambda`:

```text
P = F * exp(-(r + lambda) * T)                                    (survival payoff)
  + F * R * lambda * integral from 0 to T of exp(-(r+lambda)*s) ds   (recovery at default)
```

The integral has a closed form:

```text
integral from 0 to T of exp(-(r+lambda)*s) ds = (1 - exp(-(r+lambda)*T)) / (r + lambda)
```

where:

- `F` is face value
- `R` is the recovery fraction of face, paid at the default time
- `r` is the continuously compounded risk-free rate
- `lambda` is the constant hazard rate

There are three standard recovery conventions and they are not equivalent: recovery of **face value** (used above), recovery of **market value** (a fraction of the pre-default price), and recovery of **treasury** (a fraction of an otherwise identical risk-free bond). Recovery of market value is analytically the cleanest — it makes the spread exactly `lambda * (1 - R)` — but recovery of face value matches how bankruptcy claims actually work.

---

#### Worked Example: A Risky Zero-Coupon Bond

Price a five-year zero-coupon bond with face 100 from an issuer with a 5% hazard rate, assuming 40% recovery of face at default and a flat 3% risk-free rate.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Symbol</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Face value</td><td><code>F</code></td><td>100</td></tr>
    <tr><td>Hazard rate</td><td><code>lambda</code></td><td>5.00%</td></tr>
    <tr><td>Recovery of face</td><td><code>R</code></td><td>40%</td></tr>
    <tr><td>Risk-free rate</td><td><code>r</code></td><td>3.00%</td></tr>
    <tr><td>Maturity</td><td><code>T</code></td><td>5 years</td></tr>
  </tbody>
</table>

1. **Risk-free benchmark**: `100 * exp(-0.03 * 5) = 100 * exp(-0.15) = 86.0708`
2. **Survival payoff**: `100 * exp(-0.08 * 5) = 100 * exp(-0.40) = 67.0320`
3. **Recovery integral**: `(1 - exp(-0.40)) / 0.08 = 0.329680 / 0.08 = 4.12100`
4. **Recovery PV**: `100 * 0.40 * 0.05 * 4.12100 = 8.2420`
5. **Bond price**: `67.0320 + 8.2420 = 75.2740`
6. **Continuous yield**: `-ln(0.752740) / 5 = 0.284036 / 5 = 5.6807%`
7. **Credit spread**: `5.6807% - 3.0000% = 2.6807% = 268.1 bp`

**Compare to the credit triangle.** `lambda * (1 - R) = 0.05 * 0.60 = 0.0300 = 300 bp`. The exact bond spread is 268 bp, about 32 bp lower.

The gap is not an error in either calculation — it is the recovery convention. Under recovery of *market value* the triangle reproduces the bond's yield spread exactly: the risky discount rate becomes `r + lambda*(1 - R) = 0.06`, giving a price of `100 * exp(-0.30) = 74.0818` and a spread of precisely 300 bp. Here we instead assumed recovery of *face*, which pays `0.40 * 100 = 40` regardless of how far the bond had already fallen. Since a risky bond trades below face, recovery of face is the more generous assumption, so it produces a higher price and therefore a narrower spread. The wedge scales with `lambda * T`: at `lambda * T = 0.25` it is 32 bp, and it shrinks toward zero as the hazard or the maturity falls.

> info **When the triangle is exact** For a continuously-paid credit default swap with flat hazard and flat rates, the annuity appears identically in both legs and cancels, making `spread = lambda * (1 - R)` an identity rather than an approximation. The derivation is in [CDS](/credit/cds). Bond spreads are the approximate case, not the other way round.

---

#### Calibration: The Model's Real Job

A reduced-form model is not usually *estimated*, it is *calibrated*. You take the liquid quotes on a name — typically par CDS spreads at 1, 3, 5, 7 and 10 years — and choose a piecewise-constant intensity function that reproduces every one of them. The output is a hazard curve that fits by construction. That procedure is [Credit Curves](/credit/credit-curves).

The value of the fitted curve is not that `lambda` is "true". It is that once the curve is fitted, you can price instruments that are *not* quoted — an off-market maturity, a bond from the same issuer, a forward-starting CDS — consistently with the ones that are. That is the same logic as an implied volatility surface: the parameter is a language for interpolation, not a physical constant.

---

#### Structural Versus Reduced-Form

<table>
  <tbody>
    <tr><td><strong></strong></td><td><strong>Structural (Merton)</strong></td><td><strong>Reduced-form (intensity)</strong></td></tr>
    <tr><td>Default is</td><td>Assets crossing a barrier</td><td>The first jump of a point process</td></tr>
    <tr><td>Predictable?</td><td>Yes &mdash; you see it coming</td><td>No &mdash; inaccessible by construction</td></tr>
    <tr><td>Inputs</td><td>Asset value, asset volatility, debt structure</td><td>Market spreads</td></tr>
    <tr><td>Short-dated spreads</td><td>Approach zero &mdash; contradicts observation</td><td>Approach <code>lambda * (1 - R)</code> &mdash; matches observation</td></tr>
    <tr><td>Economic story</td><td>Strong: links credit to leverage and equity</td><td>Weak: <code>lambda</code> is a fitted number</td></tr>
    <tr><td>Fits market prices</td><td>Poorly without heavy modification</td><td>Exactly, by construction</td></tr>
    <tr><td>Best used for</td><td>Ranking credits, early warning, capital structure arbitrage</td><td>Pricing, hedging, marking to market</td></tr>
  </tbody>
</table>

The two are not rivals so much as tools for different jobs, and hybrid models exist that make the intensity a function of firm state variables, restoring some economic content without giving up the calibration properties.

---

#### In Practice Across Asset Classes

**Corporate credit.** The dominant framework for anything requiring a price. Single-name CDS curves are bootstrapped this way daily; bond-CDS basis analysis compares a bond priced off the fitted curve against its market price.

**Sovereign credit.** Used similarly, but the intensity is far less stable and jumps around political events. The independence assumption between rates and intensity is particularly poor for sovereigns, where a credit event and a currency or rates move are strongly linked.

**Structured credit.** Portfolio versions require the joint distribution of default times, not just marginals. Copula methods glue calibrated marginal hazard curves together with a dependence structure — and the dependence parameter is the one thing no single-name calibration can tell you.

**On-chain lending.** Intensity models are the wrong shape for overcollateralised lending, and it is worth being explicit about why. A hazard rate models an event that arrives without warning from a state you cannot fully observe. In a lending protocol the state *is* observable: every position's health factor is on-chain and continuously visible, and the trigger is a deterministic threshold, not a surprise. See [Lending Architecture](/protocols/lending-architecture) and [Liquidations](/building-blocks/liquidations). The genuinely stochastic part is whether a liquidation clears at a good price during a fast move — a jump-risk and liquidity problem better handled by simulation than by fitting `lambda`. The credit machinery becomes relevant only where a protocol extends undercollateralised or reputation-based credit.

---

#### Assumptions and Failure Modes

- **Independence of rates and default intensity.** The `exp(-(r + lambda)*T)` form requires it. In a crisis, rates and credit move together, and the error is largest exactly when the position matters.
- **Exogenous intensity.** `lambda` responds to nothing. A firm that has just doubled its leverage has the same modelled hazard until you recalibrate.
- **Recovery is an input, not an output.** Structural models at least *derive* recovery. Here it is assumed, and the fitted `lambda` moves inversely with it. See [Recovery Rates](/credit/recovery-rates).
- **Calibration hides misspecification.** A model that fits every quote exactly tells you nothing about whether it will still fit tomorrow. Perfect in-sample fit is the design goal, so it cannot also be evidence of correctness.
- **No contagion in the single-name model.** One issuer's default does not raise another's intensity. Observed defaults cluster far more than independent intensities imply.
- **Sparse or stale quotes.** Bootstrapping from a curve with only two liquid points forces heavy interpolation, and the resulting forward hazard rates can be wildly unstable or even negative if the input quotes are inconsistent.

---

#### Code

```python
import math


def risky_zero_price(face, hazard, recovery, risk_free, years):
    """Zero-coupon bond price with constant hazard and recovery of face at default."""
    total_rate = risk_free + hazard
    survival_leg = face * math.exp(-total_rate * years)

    # PV of receiving R * face at the (random) default time, if it arrives before T.
    annuity = (1.0 - math.exp(-total_rate * years)) / total_rate
    recovery_leg = face * recovery * hazard * annuity

    return survival_leg + recovery_leg


def yield_spread(price, face, risk_free, years):
    """Continuously compounded spread over the risk-free rate, in basis points."""
    continuous_yield = -math.log(price / face) / years
    return (continuous_yield - risk_free) * 10_000


price = risky_zero_price(100, hazard=0.05, recovery=0.40, risk_free=0.03, years=5)
price                                    # 75.2740
yield_spread(price, 100, 0.03, 5)        # 268.07 bp, versus 300 bp from the triangle
```

---

#### See Also

* [Merton Model](/credit/merton-model)
* [Default Probability](/credit/default-probability)
* [Credit Curves](/credit/credit-curves)
* [CDS](/credit/cds)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [Jumps](/quant-math/jumps)

---

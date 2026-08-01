### The Volatility Surface

> info **Metadata** Level: Advanced | Prerequisites: Implied volatility, The Greeks | Tags: derivatives, volatility-surface, skew, smile, arbitrage-free, hedging

If Black-Scholes were true, every option on the same underlying would imply the same volatility. Plot implied volatility against strike and you would get a flat line. What you actually get is a curve — higher volatility at low strikes for equity indices, a rough U-shape for FX — and stacking those curves across expiries gives a two-dimensional object, the **volatility surface**.

The surface is not a model failure to be fixed. It is data: the market's own statement about the distribution of the underlying, expressed in the only units the market agreed to speak. Reading it correctly tells you what the market thinks about tails, about the correlation between price and volatility, and about how much protection costs relative to upside participation. Getting it wrong produces hedge ratios that are off by a third.

---

#### Formal Definition

The volatility surface is the function:

```text
sigma_imp(K, T)
```

giving the Black-Scholes implied volatility of a European option at strike `K` and expiry `T`. Two reparameterisations are standard and both are more useful than raw strike:

```text
log-moneyness      k = ln(K / F(T))
total variance     w(k, T) = sigma_imp(k, T)^2 * T
```

where:

- `F(T)` is the forward price to expiry `T`, so `k = 0` is exactly at-the-money-forward
- `w` is **total implied variance**, the natural unit because option values depend on `sigma * sqrt(T)` rather than on `sigma` alone
- a surface flat in `k` at every `T` is the Black-Scholes world

Two slices of the surface have their own names:

- **Smile**: the shape of `sigma_imp` against strike at fixed expiry.
- **Skew** (or **slope**): the first derivative of that shape. Equity index surfaces have strongly negative skew; a downward slope in strike.

The standard summary statistics, borrowed from FX conventions and used everywhere:

```text
Risk reversal  RR = sigma(25-delta call) - sigma(25-delta put)   -- measures slope
Butterfly      BF = 0.5*(sigma(25d call) + sigma(25d put)) - sigma(ATM)   -- measures curvature
```

---

#### Worked Example: Reading and Checking a Smile

Take a one-year slice with `S = 100`, `r = 0`, and this quoted skew. Prices are Black-Scholes values at each strike's own implied volatility.

<table>
  <tbody>
    <tr><td><strong>Strike</strong></td><td><strong>Implied vol</strong></td><td><strong>Call price</strong></td><td><strong>Slope to next strike</strong></td></tr>
    <tr><td>80</td><td>26.0%</td><td>22.507</td><td>-0.792</td></tr>
    <tr><td>90</td><td>23.0%</td><td>14.590</td><td>-0.662</td></tr>
    <tr><td>100</td><td>20.0%</td><td>7.966</td><td>-0.441</td></tr>
    <tr><td>110</td><td>18.0%</td><td>3.558</td><td>-0.221</td></tr>
    <tr><td>120</td><td>17.0%</td><td>1.346</td><td>—</td></tr>
  </tbody>
</table>

**Check 1 — call spread bounds.** Every slope must lie between `-exp(-r*T) = -1` and `0`. The slopes are `-0.792`, `-0.662`, `-0.441`, `-0.221`. All inside. A slope steeper than `-1` would mean a call spread costing more than the strike width, which pays at most the strike width.

**Check 2 — butterfly convexity.** Compute `C(K1) - 2*C(K2) + C(K3)` for each triple of equally spaced strikes:

1. `22.507 - 2 * 14.590 + 7.966 = 1.293`
2. `14.590 - 2 * 7.966 + 3.558 = 2.216`
3. `7.966 - 2 * 3.558 + 1.346 = 2.196`

All positive, so the surface admits a valid risk-neutral density. A butterfly has a payoff that is never negative, so it must cost something non-negative. Dividing each butterfly by the squared strike spacing gives a discrete estimate of the risk-neutral probability density at the middle strike — the Breeden-Litzenberger result that `d2C/dK2 = exp(-r*T) * f(K)`.

**Check 3 — a violation.** Now suppose the 90-strike is quoted at 28% volatility instead of 23%, perhaps because a large buyer lifted that strike. Its price becomes `16.312`, and the first butterfly is:

```text
22.507 - 2 * 16.312 + 7.966 = -2.151
```

Negative. Buy one 80-strike call, sell two 90-strike calls, buy one 100-strike call: you are **paid 2.151** to put on a structure whose payoff at expiry is never below zero and is `+10` if the underlying finishes at 90. That is a riskless profit, so the quote cannot stand. Equivalently, the implied density is negative somewhere between 80 and 100, which is not a probability distribution.

> info **Run these checks before fitting anything** Convexity and slope violations in raw option data are usually stale quotes or a bad forward, not arbitrage. A surface fitter given inconsistent inputs will produce a smooth, plausible-looking, and wrong surface. Filter first. See [Data Cleaning](/data-tooling/cleaning).

---

#### Why the Smile Exists

Four distinct mechanisms, which is why no single fix reproduces the whole surface:

- **Fat tails.** Real return distributions have more mass in the extremes than a lognormal. Options on those extremes are worth more than a constant-`sigma` model says, so their implied volatilities must be higher. This alone produces a symmetric smile.
- **Jumps.** A discontinuous move cannot be delta-hedged away. Short-dated wings price in jump risk that a diffusion cannot generate, which is why the smile is steepest at short expiries and flattens with maturity. See [Jumps](/quant-math/jumps).
- **Spot-volatility correlation.** In equities, volatility rises when prices fall. That negative correlation makes the terminal distribution left-skewed, which tilts the smile into a downward skew. The economic stories are leverage (a falling equity value raises a firm's leverage and therefore its equity volatility) and demand for downside protection.
- **Supply and demand.** Structurally, institutions buy index puts and sell upside calls. That order flow is one-directional and persistent, and dealers who absorb it charge for it. Part of the observed skew is a price for inventory, not a statement about the distribution.

The relative importance shifts by asset class, which is exactly why equity skew is steeply downward and FX skew is closer to symmetric.

---

#### Sticky Strike, Sticky Delta, and the Hedge Ratio

The surface's **shape** is observable. How it **moves** when spot moves is not, and the assumption you make about that changes your delta. Write `b` for the magnitude of the skew slope in strike, taken from the table above between 100 and 110:

```text
b = (0.20 - 0.18) / 10 = 0.002 per point of strike
```

The hedge ratio adjusts by the vega times the surface's response to spot:

```text
effective delta = BS delta + Vega * (d sigma_imp / d S)
```

Three standard regimes, each a rule for `sigma_imp(K, S)`, evaluated for the at-the-money one-year call where `BS delta = 0.5398` and `Vega = 39.695` per unit of volatility:

<table>
  <tbody>
    <tr><td><strong>Regime</strong></td><td><strong>Rule</strong></td><td><strong>Fixed-strike vol when spot rises</strong></td><td><strong>d sigma / d S</strong></td><td><strong>Effective delta</strong></td></tr>
    <tr><td>Sticky strike</td><td>sigma depends on K only</td><td>Unchanged</td><td>0</td><td>0.540</td></tr>
    <tr><td>Sticky delta (moneyness)</td><td>sigma depends on K / S</td><td>Rises</td><td>+b = +0.002</td><td>0.619</td></tr>
    <tr><td>Sticky local volatility</td><td>sigma moves against spot</td><td>Falls</td><td>-b = -0.002</td><td>0.460</td></tr>
  </tbody>
</table>

Under sticky delta, `sigma_imp = f(K / S)`, so `d sigma / d S = -(K/S) * (d sigma / d K)`, which at the money equals `+b`. Under the local-volatility regime the at-the-money volatility moves at roughly **twice** the skew slope as spot moves, and fixed-strike volatility moves against spot. The adjustments are `39.695 * 0.002 = 0.079` in each direction.

The hedge ratio spans 0.46 to 0.62 — a 35% range — for the same option, driven entirely by an unobservable assumption about surface dynamics. This is not a rounding detail; it is one of the largest discretionary choices on an options desk. Empirically, index markets tend to sit between sticky-strike in quiet ranges and the local-volatility regime in sharp sell-offs, and desks estimate the spot-vol relationship from history rather than assuming a regime.

> warning **Sticky delta contradicts the equity leverage effect** Pure sticky-delta dynamics imply that fixed-strike volatility rises when spot rises. Equity index markets do the opposite. Sticky delta is a reasonable default for FX, where the smile really is anchored to moneyness; applying it to equity index skew produces systematically wrong deltas.

---

#### Arbitrage-Free Constraints

A surface used for pricing must satisfy, at every expiry:

- **Monotonicity**: call prices non-increasing in strike.
- **Slope**: `d C / d K` between `-exp(-r*T)` and `0`.
- **Convexity**: `d2 C / d K2` non-negative — no negative density.
- **Bounds**: `max(0, S*exp(-q*T) - K*exp(-r*T))` at most `C`, at most `S*exp(-q*T)`.
- **Wing growth**: implied variance cannot grow arbitrarily fast in the far strikes. Lee's moment formula bounds the asymptotic slope of `w(k)` at `2 * |k|`; a fitted surface with linear-in-`k` variance steeper than that admits arbitrage.

Across expiries there is one further condition — total variance must not decrease with maturity at fixed log-moneyness — covered in [The Term Structure of Volatility](/derivatives/vol-term-structure).

Parametric forms exist that are arbitrage-free by construction. SVI (stochastic volatility inspired) parameterises total variance per slice with five parameters and has known conditions for absence of butterfly arbitrage; SSVI extends this across expiries. The practical point is that interpolating implied volatility with a spline and hoping is a reliable way to create a negative density between quoted strikes.

---

#### In Practice Across Asset Classes

**Equity indices.** Steep, persistent, downward skew, strongest at short expiries. The put wing is the traded product; the call wing is often thinly quoted and largely a fitted extrapolation. Skew steepens in sell-offs and the whole surface moves up in level simultaneously.

**Single stocks.** Flatter skew than the index, because index skew contains a correlation component that individual names lack — an index option is an option on a basket, and its volatility depends on how correlated the constituents are. A pronounced smile appears around takeover situations, where the distribution is genuinely bimodal.

**FX.** Nearly symmetric smile for major pairs, with the asymmetry carried by the risk reversal. The surface is quoted directly in the three-parameter form (at-the-money, risk reversal, butterfly) at 25 and 10 delta, so the axis is delta, not strike. Emerging market crosses show strong skew in the direction of devaluation risk. See [FX 101](/markets/fx-101).

**Rates and commodities.** The rates surface is three-dimensional — option expiry, underlying swap tenor, and strike — giving a **volatility cube**, and its smile shape depends on whether the market quotes lognormal or normal volatility. Commodities frequently show an **inverse skew**: upside calls carry higher implied volatility than downside puts, because supply shocks drive prices up violently while the downside is bounded by production economics. Energy and agricultural surfaces are strongly seasonal, so the term structure is not smooth across delivery months. See [Commodities](/markets/commodities).

**On-chain.** Listed crypto options show a smile that flips direction with the market regime: downside skew in risk-off, upside skew during strong rallies, reflecting demand for leveraged upside rather than protection. Liquidity concentrates in near-dated at-the-money strikes, so much of the quoted surface is model extrapolation rather than tradable price. For a structurally related exposure, note that a concentrated liquidity range is a short-strangle-like payoff whose value depends on realised range rather than on any quoted surface; see [Concentrated Liquidity](/protocols/concentrated-liquidity).

---

#### Assumptions and Failure Modes

- **The surface is only as good as its inputs.** A wrong forward, dividend, or borrow assumption tilts the whole slice and manufactures skew that is not there. Always reconcile calls and puts through [put-call parity](/derivatives/payoffs-parity) before fitting.
- **Interpolation invents data, and extrapolation is worse.** Between quoted strikes the surface is your model, not the market's. Beyond the quoted range, wing behaviour is entirely a modelling choice and drives the price of tail products — two arbitrage-free surfaces matching every quote can value a far out-of-the-money put very differently.
- **Static shape says nothing about dynamics.** The observed skew constrains today's prices, not how they will move. Two models can fit the same surface exactly and produce different hedges and very different exotic prices.
- **Local volatility fits the surface but misprices forward volatility.** A local-volatility model can be calibrated to reproduce every vanilla price exactly and still misprice forward-starting and cliquet-style products, because it implies the smile flattens over time faster than the market does.
- **Smoothing destroys the arbitrage check.** Fitting first and checking second usually hides the violation. Check the raw quotes, then fit.
- **Delta depends on an unobservable regime.** As shown above, the same option has three defensible deltas. There is no way to resolve this from a static snapshot of prices.

---

#### Code

```python
def butterfly_arbitrage_check(strikes, call_prices):
    """Discrete convexity test on a single expiry slice.

    Returns a list of (K_lo, K_mid, K_hi, butterfly_value). Any negative
    value is an arbitrage or, far more often, a stale or crossed quote.
    Strikes must be sorted; spacing need not be uniform.
    """
    findings = []
    for i in range(1, len(strikes) - 1):
        k_lo, k_mid, k_hi = strikes[i - 1], strikes[i], strikes[i + 1]
        # Wing weights handle unequal spacing; the factor of 2 recovers the
        # familiar 1 / -2 / 1 second difference when strikes are evenly spaced.
        w_lo = (k_hi - k_mid) / (k_hi - k_lo)
        w_hi = (k_mid - k_lo) / (k_hi - k_lo)
        value = 2 * (w_lo * call_prices[i - 1] + w_hi * call_prices[i + 1] - call_prices[i])
        findings.append((k_lo, k_mid, k_hi, value))
    return findings


def skew_adjusted_delta(bs_delta, vega_per_unit_vol, dvol_dspot):
    """Delta including the surface's response to a spot move.

    dvol_dspot is in absolute volatility per unit of spot: 0.002 means the
    implied vol moves 0.2 volatility points per one-point move in the underlying.
    """
    return bs_delta + vega_per_unit_vol * dvol_dspot
```

---

#### See Also

* [Implied Volatility](/derivatives/implied-volatility)
* [The Term Structure of Volatility](/derivatives/vol-term-structure)
* [The Greeks](/derivatives/greeks)
* [Delta Hedging](/derivatives/delta-hedging)
* [Variance Swaps](/derivatives/variance-swaps)
* [Jumps](/quant-math/jumps)

---

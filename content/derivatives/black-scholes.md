### Black-Scholes

> info **Metadata** Level: Advanced | Prerequisites: Binomial trees, Geometric Brownian motion, Ito's lemma | Tags: derivatives, black-scholes, pricing, options, volatility

Black-Scholes is the continuous-time limit of the replication argument. Take the [binomial tree](/derivatives/binomial-trees), shrink the time step to zero, and the hedging portfolio must be rebalanced continuously; the cost of running that hedge to expiry is a closed-form expression involving only the forward, the strike, the time, the discount factor, and one volatility number. It is the single most consequential formula in quantitative finance, and every practitioner who uses it also knows it is wrong.

Both facts matter. The formula is wrong because its assumptions — constant volatility, continuous paths, frictionless trading — describe no real market. It survives because it is a **quoting convention**: an invertible, monotone map between a price and a single number, `sigma`. Traders quote and hedge in implied volatility precisely because Black-Scholes gives them a common language, not because they believe the model. See [Implied Volatility](/derivatives/implied-volatility).

---

#### Formal Definition

For a European call on an asset paying a continuous dividend yield `q`:

```text
C = S * exp(-q*T) * N(d1) - K * exp(-r*T) * N(d2)

P = K * exp(-r*T) * N(-d2) - S * exp(-q*T) * N(-d1)

d1 = ( ln(S/K) + (r - q + 0.5*sigma^2) * T ) / ( sigma * sqrt(T) )
d2 = d1 - sigma * sqrt(T)
```

where:

- `S` is the current price of the underlying, `K` the strike, `T` the time to expiry in years
- `r` is the continuously compounded risk-free rate, `q` the continuous dividend or income yield
- `sigma` is the annualised volatility of log returns, assumed constant
- `N(x)` is the standard normal cumulative distribution function
- `N(d2)` is the risk-neutral probability that the call finishes in the money
- `N(d1)` is that same probability under a measure where the asset is the numeraire; it is also the call's delta (times `exp(-q*T)`)

The formula is not a forecast of `S_T`. It is the initial cost of a self-financing hedging strategy that terminates with exactly `max(S_T - K, 0)`.

**Reading the two terms.** `S * exp(-q*T) * N(d1)` is the present value of receiving the asset, conditional on exercise and weighted appropriately. `K * exp(-r*T) * N(d2)` is the present value of paying the strike, weighted by the probability of paying it. The call is the difference: what you get minus what you pay, both conditioned on the event that you exercise.

**The equation behind the formula.** Applying [Ito's lemma](/stochastic-calculus/ito-lemma) to a portfolio that is long the option and short `dV/dS` units of the underlying eliminates the random term. What remains must earn the risk-free rate, which gives the Black-Scholes partial differential equation:

```text
dV/dt + 0.5 * sigma^2 * S^2 * d2V/dS2 + (r - q) * S * dV/dS - r * V = 0
```

The formula above is this equation's solution with the call payoff as a terminal condition. [Feynman-Kac](/stochastic-calculus/feynman-kac) is the bridge between this PDE and the discounted-expectation form.

---

#### The Assumptions, Stated Plainly

1. The underlying follows [geometric Brownian motion](/quant-math/gbm) with constant volatility and no jumps.
2. Volatility `sigma` is known, constant, and the same for all strikes and expiries.
3. Trading is continuous, costless, and possible in any fraction of a unit.
4. Borrowing and lending are unlimited at the same constant risk-free rate `r`.
5. Short selling is unrestricted, with full use of proceeds.
6. The dividend yield `q` is constant and continuous.
7. The option is European.
8. There is no counterparty or settlement risk.

Every one of these is false. Assumptions 1 and 2 are the ones that produce the [volatility surface](/derivatives/vol-surface); assumption 3 is the one that makes [delta hedging](/derivatives/delta-hedging) a real business rather than a costless procedure.

---

#### Worked Example

Choose inputs that make the arithmetic verifiable: `S = 100`, `K = 100`, `r = 0`, `q = 0`, `sigma = 20%`, `T = 1`.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Spot S</td><td>100</td></tr>
    <tr><td>Strike K</td><td>100</td></tr>
    <tr><td>Rate r</td><td>0.00</td></tr>
    <tr><td>Volatility sigma</td><td>0.20</td></tr>
    <tr><td>Time T</td><td>1.00 year</td></tr>
  </tbody>
</table>

1. **`ln(S/K) = ln(1) = 0`**, and with `r = q = 0` the numerator of `d1` reduces to `0.5 * 0.04 * 1 = 0.02`
2. **`sigma * sqrt(T) = 0.20 * 1 = 0.20`**, so `d1 = 0.02 / 0.20 = 0.10`
3. **`d2 = 0.10 - 0.20 = -0.10`**
4. **Normal CDF values**: `N(0.10) = 0.539828`, and by symmetry `N(-0.10) = 1 - 0.539828 = 0.460172`
5. **Call price**: `100 * 0.539828 - 100 * 1 * 0.460172 = 53.9828 - 46.0172 = 7.9656`

The put has the same value here: with `r = 0` and `S = K`, put-call parity gives `C - P = S - K = 0`. That is a useful sanity check on any implementation.

**A second case with a non-zero rate.** Keep everything else and set `r = 5%`. Then the `d1` numerator is `0.05 + 0.02 = 0.07`, so `d1 = 0.07 / 0.20 = 0.35` and `d2 = 0.15`. With `N(0.35) = 0.636831` and `N(0.15) = 0.559618`:

```text
C = 100 * 0.636831 - 100 * exp(-0.05) * 0.559618
  = 63.6831 - 95.1229 * 0.559618
  = 63.6831 - 53.2325
  = 10.4506
```

Parity check: `P = C - S + K*exp(-r*T) = 10.4506 - 100 + 95.1229 = 5.5735`. Both `d1` and `d2` come out as round numbers here by construction, which makes the example checkable by hand against any normal table.

> info **The at-the-money shortcut** With `r = q = 0` and `S = K`, the formula collapses to `C = S * (2 * N(sigma * sqrt(T) / 2) - 1)`, which for small `sigma * sqrt(T)` is approximately `0.3989 * S * sigma * sqrt(T)`. For the example above that gives `0.3989 * 100 * 0.20 = 7.978` against the exact `7.966` — accurate to about 0.15%. This approximation is how experienced traders sanity-check an at-the-money quote in their head.

---

#### What Each Piece Contributes

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Effect on a call</strong></td><td><strong>Why</strong></td></tr>
    <tr><td>Spot S up</td><td>Up</td><td>Higher chance and size of an in-the-money finish</td></tr>
    <tr><td>Strike K up</td><td>Down</td><td>You pay more on exercise</td></tr>
    <tr><td>Volatility sigma up</td><td>Up</td><td>Wider terminal distribution; the truncated payoff gains from dispersion</td></tr>
    <tr><td>Time T up</td><td>Up (usually)</td><td>More total variance; also more discounting benefit on K</td></tr>
    <tr><td>Rate r up</td><td>Up</td><td>The strike is paid later, so its present value falls</td></tr>
    <tr><td>Dividend q up</td><td>Down</td><td>The forward falls; income accrues to holders of the asset, not the option</td></tr>
  </tbody>
</table>

Volatility and time enter almost entirely through the combination `sigma * sqrt(T)` — **total volatility**. An option with 40% vol and three months to expiry has the same total volatility as one with 20% vol and one year, and up to carry effects they behave the same. This is the single most useful reframing of the formula.

---

#### When It Breaks

- **Fat tails and jumps.** Log-normal terminal distributions assign far too little probability to large moves. Far out-of-the-money options are systematically underpriced by a constant-`sigma` model, which is precisely what the [smile](/derivatives/vol-surface) corrects for.
- **Volatility is not constant.** It clusters, mean-reverts, and is negatively correlated with equity returns. See [GARCH](/stat-methods/garch) and [Volatility](/quant-math/volatility).
- **Deep out-of-the-money and very short-dated options.** As `T` approaches zero, `d1` and `d2` blow up and the price becomes numerically fragile; small changes in `sigma` move the price by amounts smaller than the tick size, making implied volatility ill-conditioned.
- **Discrete dividends.** A single cash dividend is not a continuous yield. Applying `q` to a stock that pays one large dividend misprices strikes on either side of the ex-date.
- **American exercise.** The formula prices European contracts only. For American puts, use a [tree](/derivatives/binomial-trees).
- **Negative underlying prices.** Log-normality forbids them. When front-month oil futures traded negative in 2020, the model was structurally inapplicable and desks moved to normal (Bachelier) dynamics. The same issue arose in EUR rates when yields went negative.

> warning **Constant volatility is contradicted by the market that uses the formula** If Black-Scholes held, every strike would imply the same `sigma`. None does. The volatility surface is the market's own record of the model being wrong, expressed in the model's own units.

---

#### In Practice Across Asset Classes

**Equity indices.** Applied with a term structure of forwards and a full [volatility surface](/derivatives/vol-surface) rather than one `sigma`. The skew is steep and persistent, so the constant-vol form is used only as a quoting map.

**Single stocks.** Requires discrete dividend handling and American exercise, so the usable form is a tree calibrated to listed prices rather than the closed form.

**FX.** Uses the Garman-Kohlhagen variant: `q` becomes the foreign interest rate `r_f`. Quoting is in volatility from the outset — an FX option is negotiated as a vol number and converted to premium via the formula. The smile is closer to symmetric than in equities, with the asymmetry carried by the risk reversal. See [FX 101](/markets/fx-101).

**Rates.** Black's 1976 variant prices options on forwards: replace `S * exp(-q*T)` with `F * exp(-r*T)`. This is the market standard for caps, floors, and swaptions. Where rates can go negative, the lognormal form fails and the normal (Bachelier) model is quoted instead, with volatility expressed in basis points per year rather than in percent. See [Fixed Income 101](/markets/fixed-income-101).

**Commodities.** Options are usually on futures, so Black-76 again. Convenience yield and seasonality make the forward curve, not the spot, the correct reference, and volatility is specified per contract month. See [Commodities](/markets/commodities).

**On-chain.** [Perpetual futures](/building-blocks/perpetual-futures) are linear and need no option model, but the [funding rate](/signals/funding-rate) plays the role of `r - q` in the carry term. On-chain option protocols that price with Black-Scholes need `sigma` from somewhere; sourcing it from an oracle or a governance parameter introduces a manipulation surface that listed markets do not have. See [Oracle Manipulation](/risk/oracle-manipulation).

---

#### Assumptions and Failure Modes

- **One volatility for all strikes.** Fails immediately. Using an at-the-money vol to price a wing option can be wrong by tens of percent of premium.
- **Continuous rebalancing at zero cost.** Real hedging is discrete and costly, so the replication cost exceeds the model premium. The gap is a function of gamma and rebalancing frequency; see [Delta Hedging](/derivatives/delta-hedging).
- **Continuous paths.** A gap move is unhedgeable. Short-gamma books lose in a way the model says cannot happen.
- **A single risk-free rate.** Post-2008, the discount rate depends on the collateral agreement. Uncollateralised trades carry funding and credit valuation adjustments that the formula has no slot for.
- **Volatility is knowable in advance.** You never observe `sigma`; you observe prices and infer implied volatility, which is a different object from the realised volatility that will actually occur. See [Implied Volatility](/derivatives/implied-volatility).
- **The Greeks inherit every flaw.** Delta, gamma, and vega computed from the formula are correct only in the model. Hedging with them is standard practice and also a known source of systematic error; see [The Greeks](/derivatives/greeks).

---

#### Code

```python
import math


def norm_cdf(x):
    # erf is in the standard library; no need for scipy for a scalar CDF.
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def black_scholes(spot, strike, rate, sigma, years, is_call=True, div_yield=0.0):
    """European option price. Handles the T -> 0 limit explicitly, because
    d1 and d2 diverge there and the intrinsic value is the correct answer."""
    if years <= 0 or sigma <= 0:
        intrinsic = spot - strike if is_call else strike - spot
        return max(intrinsic, 0.0)

    total_vol = sigma * math.sqrt(years)
    d1 = (math.log(spot / strike) + (rate - div_yield + 0.5 * sigma**2) * years) / total_vol
    d2 = d1 - total_vol

    discounted_spot = spot * math.exp(-div_yield * years)
    discounted_strike = strike * math.exp(-rate * years)

    if is_call:
        return discounted_spot * norm_cdf(d1) - discounted_strike * norm_cdf(d2)
    return discounted_strike * norm_cdf(-d2) - discounted_spot * norm_cdf(-d1)


def black_76(forward, strike, rate, sigma, years, is_call=True):
    """Options on forwards: rates, commodities, options on futures."""
    undiscounted = black_scholes(forward, strike, 0.0, sigma, years, is_call)
    return undiscounted * math.exp(-rate * years)
```

---

#### See Also

* [Binomial Trees](/derivatives/binomial-trees)
* [The Greeks](/derivatives/greeks)
* [Implied Volatility](/derivatives/implied-volatility)
* [Ito's Lemma](/stochastic-calculus/ito-lemma)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [The Volatility Surface](/derivatives/vol-surface)

---

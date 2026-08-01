### The Greeks

> info **Metadata** Level: Intermediate | Prerequisites: Black-Scholes, Partial derivatives | Tags: derivatives, greeks, delta, gamma, vega, theta, risk-management

The Greeks are the partial derivatives of an option's price with respect to each input. They exist because an option book is too complicated to reason about position by position: a desk holding four thousand contracts across two hundred strikes needs to know one thing — if the underlying moves 1%, what happens? Delta answers that. Gamma says how fast the answer changes. Vega, theta, and rho do the same for volatility, time, and rates.

They are also a linearisation, and linearisations fail. A book that is delta-neutral is neutral to the first order for a small move, over a short interval, holding everything else constant. All three qualifiers are load-bearing. The discipline of an options desk is knowing which Greek dominates in which regime and what the residual terms do when they stop being small.

---

#### Formal Definition

For a European call under Black-Scholes with `d1` and `d2` as defined there, and `n(x)` the standard normal density:

```text
Delta   = dV/dS        = N(d1)                          (call)
                       = N(d1) - 1                      (put)

Gamma   = d2V/dS2      = n(d1) / (S * sigma * sqrt(T))  (same for call and put)

Vega    = dV/dsigma    = S * n(d1) * sqrt(T)            (same for call and put)

Theta   = dV/dt        = -S*n(d1)*sigma/(2*sqrt(T)) - r*K*exp(-r*T)*N(d2)   (call)

Rho     = dV/dr        = K * T * exp(-r*T) * N(d2)      (call)
                       = -K * T * exp(-r*T) * N(-d2)    (put)
```

where:

- `Delta` is dimensionless: units of the underlying held per option
- `Gamma` is per unit of the underlying: how much delta changes for a one-point move in `S`
- `Vega` is quoted per **volatility point** in practice, so divide the formula's output by 100
- `Theta` is quoted per **day**, so divide the annual figure by 252 (trading days) or 365 (calendar days) — the convention matters and desks differ
- `Rho` is quoted per **1% rate move**, so divide by 100

Vega and gamma are identical for a call and a put at the same strike and expiry. That follows directly from put-call parity: the difference between them is a forward, which has no curvature and no volatility sensitivity.

---

#### Worked Example: Greeks Across Moneyness

Take `S = 100`, `r = 0`, `sigma = 20%`, `T = 1` year, and compute call Greeks at five strikes. Theta is shown per trading day at 252 days a year; vega per volatility point.

<table>
  <tbody>
    <tr><td><strong>Strike</strong></td><td><strong>Price</strong></td><td><strong>Delta</strong></td><td><strong>Gamma</strong></td><td><strong>Vega (per pt)</strong></td><td><strong>Theta (per day)</strong></td></tr>
    <tr><td>80</td><td>21.186</td><td>0.888</td><td>0.0095</td><td>0.191</td><td>-0.0076</td></tr>
    <tr><td>90</td><td>13.589</td><td>0.735</td><td>0.0164</td><td>0.328</td><td>-0.0130</td></tr>
    <tr><td>100</td><td>7.966</td><td>0.540</td><td>0.0198</td><td>0.397</td><td>-0.0158</td></tr>
    <tr><td>110</td><td>4.292</td><td>0.353</td><td>0.0186</td><td>0.372</td><td>-0.0147</td></tr>
    <tr><td>120</td><td>2.147</td><td>0.209</td><td>0.0144</td><td>0.287</td><td>-0.0114</td></tr>
  </tbody>
</table>

Reading the table:

1. **Delta runs from near 1 to near 0** as the strike rises. The deep in-the-money call at K=80 behaves like 0.888 units of the underlying; the K=120 call behaves like 0.209 units.
2. **Gamma peaks near the money** and falls away in both directions. At K=100 a one-point rise in `S` raises delta by about 0.0198.
3. **Vega peaks near the money too**, and is proportional to gamma here — under Black-Scholes, `Vega = Gamma * S^2 * sigma * T`. Check at K=100: `0.019848 * 10000 * 0.20 * 1 = 39.70` per unit of vol, which is 0.397 per volatility point. Exactly the table entry.
4. **Theta is proportional to gamma** when `r = 0`: `Theta = -0.5 * sigma^2 * S^2 * Gamma`. At K=100: `-0.5 * 0.04 * 10000 * 0.019848 = -3.9695` per year, or `-3.9695 / 252 = -0.0158` per day. Again exactly the table entry.

That third and fourth relationship is the whole game. **Gamma, vega, and theta are the same risk seen from three angles.** You cannot buy convexity without paying time decay, and the exchange rate between them is set by `sigma`.

---

#### Worked Example: Greeks Across Time

Now hold the strike at 100, at the money, and vary the expiry.

<table>
  <tbody>
    <tr><td><strong>Expiry</strong></td><td><strong>Price</strong></td><td><strong>Delta</strong></td><td><strong>Gamma</strong></td><td><strong>Vega (per pt)</strong></td><td><strong>Theta (per day)</strong></td></tr>
    <tr><td>2 years</td><td>11.246</td><td>0.556</td><td>0.0140</td><td>0.559</td><td>-0.0111</td></tr>
    <tr><td>1 year</td><td>7.966</td><td>0.540</td><td>0.0198</td><td>0.397</td><td>-0.0158</td></tr>
    <tr><td>6 months</td><td>5.637</td><td>0.528</td><td>0.0281</td><td>0.281</td><td>-0.0223</td></tr>
    <tr><td>3 months</td><td>3.988</td><td>0.520</td><td>0.0398</td><td>0.199</td><td>-0.0316</td></tr>
    <tr><td>1 month</td><td>2.303</td><td>0.512</td><td>0.0691</td><td>0.115</td><td>-0.0548</td></tr>
    <tr><td>1 week</td><td>1.106</td><td>0.506</td><td>0.1438</td><td>0.055</td><td>-0.1141</td></tr>
  </tbody>
</table>

Gamma and vega move in **opposite** directions as expiry approaches. Gamma explodes — from 0.014 at two years to 0.144 at one week, a factor of ten — because delta must swing from 0 to 1 over an ever-shorter window. Vega collapses, because there is less remaining time for a change in volatility to matter. Theta scales with gamma, so it explodes too.

This is why short-dated and long-dated options are different products managed by different people. A one-week at-the-money option is a **gamma and theta** instrument: it barely responds to a change in the volatility surface but reacts violently to spot. A two-year option is a **vega** instrument: it hardly moves on a daily spot wiggle but reprices sharply if the whole surface shifts.

---

#### Signs and Intuition

<table>
  <tbody>
    <tr><td><strong>Greek</strong></td><td><strong>Long call</strong></td><td><strong>Long put</strong></td><td><strong>What it means</strong></td></tr>
    <tr><td>Delta</td><td>0 to +1</td><td>-1 to 0</td><td>Equivalent underlying exposure</td></tr>
    <tr><td>Gamma</td><td>Positive</td><td>Positive</td><td>Delta grows in your favour; convexity</td></tr>
    <tr><td>Vega</td><td>Positive</td><td>Positive</td><td>Gains if implied volatility rises</td></tr>
    <tr><td>Theta</td><td>Negative (usually)</td><td>Negative (usually)</td><td>Cost of holding convexity</td></tr>
    <tr><td>Rho</td><td>Positive</td><td>Negative</td><td>Sensitivity to the discount rate on the strike</td></tr>
  </tbody>
</table>

Any long option position is long gamma, long vega, and short theta; any short option position is the reverse. There is no way to be long convexity and collect time decay at the same time in a single instrument — the relationships above forbid it.

Second-order Greeks that matter once a book has size:

- **Vanna** (`d2V/dS dsigma`) — how delta changes when volatility moves, or equivalently how vega changes with spot. This is what makes a skewed surface produce a delta different from the Black-Scholes delta; see [The Volatility Surface](/derivatives/vol-surface).
- **Volga** or **vomma** (`d2V/dsigma2`) — convexity in volatility. Zero at the money, positive in the wings. It is why wing options gain disproportionately in a volatility spike.
- **Charm** (`d2V/dS dt`) — delta drift with the passage of time. Matters over weekends and into expiry, when a position's delta changes with no price move at all.

> warning **Theta is not always negative** A deep in-the-money European put on a high-rate underlying has positive theta: the dominant effect is the strike's discount factor pulling towards par as expiry approaches. The same is true of a deep in-the-money call on a heavily dividend-paying asset. "Options decay" is a good default, not a law.

**Aggregating a book.** Greeks are additive across positions in the same underlying, which is the reason they exist: a book's delta is the position-weighted sum of individual deltas times the contract multiplier. Two cautions. Gamma and vega are **not** comparable across expiries — summing the vega of a one-week and a two-year option produces a number that responds to no observable move, which is why desks report a vega ladder bucketed by tenor rather than a scalar (see [The Term Structure of Volatility](/derivatives/vol-term-structure)). And delta across correlated underlyings is not a hedge: beta-weighting helps, but it does not survive a [correlation shock](/regimes-macro/correlation-breakdown).

---

#### In Practice Across Asset Classes

**Equity indices.** Delta and vega are the primary reported risks; gamma matters most into large expiries. Vega is bucketed by tenor and skew risk is reported separately, because the surface does not shift in parallel.

**Single stocks.** Delta is complicated by discrete dividends and American exercise: the delta of a short call jumps when early exercise becomes likely. Earnings dates create a scheduled vega event that a smooth model does not represent.

**FX.** The market quotes and risk-manages in delta space, and the standard risk report is in at-the-money vega, risk reversal (a vanna proxy), and butterfly (a volga proxy) rather than in raw Greeks. The premium may be denominated in either currency, which changes the delta — "premium-adjusted delta" is a real and frequently confusing convention. See [FX 101](/markets/fx-101).

**Rates.** The equivalent of delta is DV01 or duration, and the equivalent of gamma is convexity. A swaption book reports vega by expiry and by underlying swap tenor, giving a two-dimensional grid rather than a ladder. See [Duration & Convexity](/markets/duration-convexity).

**Commodities.** Delta is expressed per contract month, and a book flat overall can carry large calendar risk. Seasonal forward curves mean the delta of a summer contract is not fungible with a winter one.

**On-chain.** [Perpetual futures](/building-blocks/perpetual-futures) have delta 1 and no gamma, vega, or theta — the [funding rate](/signals/funding-rate) is the carry term. The interesting case is liquidity provision: a constant-product AMM position has negative gamma and positive theta from fees, making it structurally a short straddle. The delta of that position changes continuously with price, which is exactly the rebalancing problem in [Delta-Hedged LP](/strategies/delta-hedged-lp). Concentrated liquidity sharpens the gamma; see [Concentrated Liquidity](/protocols/concentrated-liquidity).

---

#### Assumptions and Failure Modes

- **Greeks are model outputs, not observations.** They inherit every Black-Scholes assumption. A delta computed with a flat volatility is not the delta that minimises hedging variance on a skewed surface.
- **First-order approximations fail on large moves.** Delta alone underestimates a long option's gain and overestimates a short option's loss. Beyond about one standard deviation, gamma is not a correction — it is the main term.
- **Cross-Greeks are ignored at your peril.** Spot and volatility move together, especially in equities. A delta-and-vega-neutral book can still lose from vanna in a sharp sell-off.
- **Gamma near expiry is unbounded.** An at-the-money option on expiry day has effectively infinite gamma: delta flips between 0 and 1 on a tick. No hedging programme handles this; desks reduce position size instead.
- **Vega assumes a parallel shift.** Reported vega answers "what if every implied volatility rose one point". Surfaces do not move that way; the front end moves more than the back, and the wings move differently from the body.
- **Aggregate Greeks hide concentration.** A book with zero net gamma can be long gamma at one strike and short at another, and will behave badly if spot pins near either.

---

#### Code

```python
import math


def norm_cdf(x):
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def norm_pdf(x):
    return math.exp(-0.5 * x * x) / math.sqrt(2.0 * math.pi)


def greeks(spot, strike, rate, sigma, years, is_call=True, trading_days=252):
    """Black-Scholes Greeks in desk-quoting units.

    Vega is per volatility point, theta per trading day, rho per 1% in rates,
    which is how a risk report shows them -- not the raw partial derivatives.
    """
    total_vol = sigma * math.sqrt(years)
    d1 = (math.log(spot / strike) + (rate + 0.5 * sigma**2) * years) / total_vol
    d2 = d1 - total_vol
    discounted_strike = strike * math.exp(-rate * years)

    decay = -spot * norm_pdf(d1) * sigma / (2.0 * math.sqrt(years))
    carry = rate * discounted_strike
    theta = decay - carry * norm_cdf(d2) if is_call else decay + carry * norm_cdf(-d2)
    rho = discounted_strike * years * (norm_cdf(d2) if is_call else -norm_cdf(-d2))

    return {
        "delta": norm_cdf(d1) if is_call else norm_cdf(d1) - 1.0,
        "gamma": norm_pdf(d1) / (spot * total_vol),
        "vega": spot * norm_pdf(d1) * math.sqrt(years) / 100.0,
        "theta": theta / trading_days,
        "rho": rho / 100.0,
    }
```

---

#### See Also

* [Black-Scholes](/derivatives/black-scholes)
* [Delta Hedging](/derivatives/delta-hedging)
* [The Volatility Surface](/derivatives/vol-surface)
* [Implied Volatility](/derivatives/implied-volatility)
* [Delta-Neutral Strategies](/strategies/delta-neutral)
* [Risk Types](/risk/types)

---

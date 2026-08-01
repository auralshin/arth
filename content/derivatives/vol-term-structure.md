### The Term Structure of Volatility

> info **Metadata** Level: Advanced | Prerequisites: Implied volatility, The volatility surface | Tags: derivatives, term-structure, forward-variance, calendar-arbitrage, volatility

Fix a moneyness and walk along the expiry axis of the [volatility surface](/derivatives/vol-surface). The implied volatilities you pass through are the **term structure of volatility**. It is usually upward sloping in calm markets and inverted in stressed ones, and the shape carries information that no single implied volatility number does: it tells you how the market has distributed expected variance across time.

The right way to think about it is not in volatility but in **variance**, because variance is additive across non-overlapping periods and volatility is not. Once you convert to total variance, the term structure becomes a cumulative quantity, differences between maturities become forward variances, and a whole class of arbitrage conditions becomes a single monotonicity requirement.

---

#### Formal Definition

Define **total implied variance** to expiry `T` at a fixed log-moneyness:

```text
w(T) = sigma_imp(T)^2 * T
```

The **forward variance** between two expiries `T1` and `T2` (with `T2` after `T1`) is the variance the market attributes to the interval between them, expressed per year:

```text
sigma_fwd^2 = ( sigma_imp(T2)^2 * T2  -  sigma_imp(T1)^2 * T1 ) / ( T2 - T1 )

sigma_fwd   = sqrt( sigma_fwd^2 )
```

where:

- `sigma_imp(T)` is the implied volatility for expiry `T` at the chosen moneyness
- `w(T)` is measured in variance-years and is what actually enters an option price
- `sigma_fwd` is the volatility implied for the forward window `[T1, T2]` alone

The **no-calendar-arbitrage condition** is that total variance must be non-decreasing in expiry at fixed log-moneyness:

```text
w(T2) >= w(T1)   whenever  T2 >= T1
```

Equivalently, forward variance must be non-negative. Volatility itself may fall with maturity — an inverted term structure is perfectly consistent — as long as total variance still rises.

---

#### Worked Example: Extracting Forward Volatility

Suppose the at-the-money slice quotes 24% for three months and 22% for six months.

1. **Three-month total variance**: `0.24^2 * 0.25 = 0.0576 * 0.25 = 0.014400`
2. **Six-month total variance**: `0.22^2 * 0.50 = 0.0484 * 0.50 = 0.024200`
3. **Variance in the forward window**: `0.024200 - 0.014400 = 0.009800` over `0.25` years
4. **Annualised forward variance**: `0.009800 / 0.25 = 0.039200`
5. **Forward volatility**: `sqrt(0.039200) = 0.19799`, so **19.80%**

The term structure is inverted — six-month vol is below three-month vol — and the forward volatility, 19.80%, is below both. That is the correct reading: the market prices high volatility over the next three months and materially lower volatility in months four to six. Simply noting that "vol is 22% for six months" averages over a distinction the market is making explicitly.

**A second case.** With 30% at three months and 25% at six months:

```text
w(0.25) = 0.09  * 0.25 = 0.022500
w(0.50) = 0.0625 * 0.50 = 0.031250
forward variance = (0.031250 - 0.022500) / 0.25 = 0.035000
forward volatility = 18.71%
```

An inversion of 5 volatility points across the front implies a forward volatility more than 6 points below the six-month level. **Inversions compound**: the forward is a lever on the difference, not an average of the levels.

---

#### Worked Example: A Calendar Arbitrage

Take the same three-month and six-month at-the-money options with `S = K = 100`, `r = 0`, and quotes of 30% and 20% respectively.

1. **Total variances**: `0.09 * 0.25 = 0.022500` and `0.04 * 0.50 = 0.020000`
2. Total variance **falls** with maturity, so the forward variance is `(0.020000 - 0.022500) / 0.25 = -0.010000` — negative
3. **Prices**: the three-month call is worth `5.9785`, the six-month `5.6372`. The shorter option costs more than the longer one

The trade: sell the three-month call and buy the six-month call at the same strike, for a net credit of `5.9785 - 5.6372 = 0.3413` today.

At the three-month expiry, the short call owes `max(S - 100, 0)`. The six-month call you still hold is worth at least its intrinsic value, `max(S - 100, 0)`, and strictly more while it has time left. So the position's value at that date is never negative, and you already banked 0.3413. A riskless profit, so those two quotes cannot coexist.

The general statement: for zero rates and dividends, a European call's price must be non-decreasing in expiry, because the longer option dominates the shorter one state by state. With carry, the condition is stated at fixed **forward** moneyness, and total variance non-decreasing in `T` is the version that survives.

> warning **Calendar checks must fix moneyness, not strike** Comparing the 100-strike at three months against the 100-strike at six months is only valid when the forwards agree. If the forward drifts with maturity, the two strikes sit at different log-moneyness and a naive comparison flags arbitrage that is not there.

---

#### Worked Example: Isolating an Event

Term structure inversions around scheduled events are mechanical, not a signal, and forward variance separates the two. Suppose a stock with earnings inside the next month quotes 45% implied volatility for 30 days and 36% for 60 days. Use `T` in calendar years.

1. **`T1 = 30/365 = 0.082192`**, **`T2 = 60/365 = 0.164384`**
2. **`w(T1) = 0.45^2 * 0.082192 = 0.2025 * 0.082192 = 0.016644`**
3. **`w(T2) = 0.36^2 * 0.164384 = 0.1296 * 0.164384 = 0.021304`**
4. **Forward variance**: `(0.021304 - 0.016644) / 0.082192 = 0.056700`
5. **Forward volatility**: `sqrt(0.056700) = 23.81%`

So the market prices roughly 23.8% for the second month, the quiet one. Assume that same rate is the underlying diffusive volatility in the first month too, and split the first month's variance:

```text
diffusive variance over 30 days = 0.056700 * 0.082192 = 0.004660
event variance                  = 0.016644 - 0.004660 = 0.011984
implied one-day move            = sqrt(0.011984) = 10.9%
```

The market is pricing an earnings-day move of roughly plus or minus 11%. That figure is directly comparable against the stock's historical earnings reactions, which is exactly the kind of check that a headline "45% implied vol" cannot support. The 45% number is an artefact of averaging a single large event across 30 days.

---

#### Typical Shapes and What Drives Them

<table>
  <tbody>
    <tr><td><strong>Shape</strong></td><td><strong>Typical context</strong></td><td><strong>Interpretation</strong></td></tr>
    <tr><td>Upward sloping</td><td>Calm markets</td><td>Near-term realised volatility is low; uncertainty grows with horizon</td></tr>
    <tr><td>Inverted</td><td>Stress, crisis, imminent event</td><td>Immediate uncertainty is high but expected to resolve</td></tr>
    <tr><td>Humped</td><td>A dated catalyst — election, central bank meeting, earnings</td><td>Excess variance concentrated in the expiry that spans the event</td></tr>
    <tr><td>Flat</td><td>Illiquid or thinly quoted surfaces</td><td>Often an absence of information rather than a market view</td></tr>
  </tbody>
</table>

Volatility [mean-reverts](/quant-math/mean-reversion), which is why the term structure slopes at all. Long-dated implied volatility sits near a long-run level and moves little; short-dated implied volatility tracks current conditions and moves a lot. The result is that the front of the curve is the volatile part, and term structure trades are overwhelmingly front-end trades.

---

#### Trading and Using Forward Variance

Because variance is additive, forward variance is directly tradable: a long position in a longer-dated [variance swap](/derivatives/variance-swaps) against a suitably weighted short in a shorter-dated one isolates the variance of the forward window. The weighting is by variance-years, not by notional:

```text
forward variance notional  =  long T2 with weight T2  and  short T1 with weight T1
```

Forward variance is also the correct input for pricing forward-starting products — cliquets, forward-start options, and structures whose strike is set at a future date — because such products depend on the variance of a future window, not on cumulative variance from today. This is where models that fit the vanilla surface exactly can still disagree sharply: a local-volatility model calibrated to today's surface generally implies a forward smile that flattens far faster than the market prices, so its forward-starting valuations are systematically off.

---

#### In Practice Across Asset Classes

**Equity indices.** The term structure inverts sharply in sell-offs and reverts within weeks. Because front-month implied volatility overshoots more than back-month, the slope is itself a widely watched state variable. Volatility index futures make the term structure directly observable and tradable; roll costs on those futures are a direct function of its slope. See [Roll & Carry](/markets/roll-and-carry).

**Single stocks.** Dominated by scheduled events. Earnings, drug trial readouts, and court dates produce humps that resolve on a known day, so the standard treatment separates event variance from diffusive variance as in the example above. Failing to do so makes every pre-earnings term structure look like an arbitrage.

**FX.** Shaped by the central bank meeting calendar and by data releases. Options expiring one day after a policy decision carry visible excess variance. Weekend and holiday effects matter more than in equities because FX trades nearly continuously, so the "time" in `sqrt(T)` needs a business-time adjustment rather than a calendar one.

**Rates and commodities.** The rates term structure has two dimensions — option expiry and underlying swap tenor — so it is a surface before strike is even considered: short-expiry, short-tenor volatility responds to policy meetings, while the long end responds to structural hedging flows from mortgage and insurance portfolios. Commodity term structure is bound to the delivery calendar rather than to smooth time, with gas volatility peaking in winter contracts and agricultural volatility around growing-season weather. A monotone term structure is the exception. See [Commodities](/markets/commodities).

**On-chain.** Listed crypto option expiries are sparse — typically a few weeklies and monthlies plus one or two long quarterlies — so the term structure is a handful of points with wide gaps. Interpolating across them assumes a smoothness the data does not support. Scheduled protocol events such as network upgrades or token unlocks create humps in exactly the way earnings do for single stocks.

---

#### Assumptions and Failure Modes

- **Fixed moneyness is required.** Comparing implied volatilities at the same strike across maturities silently varies moneyness once forwards differ. Always convert to log-moneyness against each expiry's own forward.
- **Interpolation between listed expiries is a model.** Linear interpolation in **variance** is defensible; linear interpolation in **volatility** can create calendar arbitrage between quoted points. Interpolating in `w(T)` is the minimum standard.
- **Calendar time is the wrong clock.** Markets are closed at weekends and volatility is concentrated around events. Using calendar days makes a Friday-to-Monday option look artificially cheap in volatility terms. Business-time or event-weighted clocks fix this and are not standardised across desks.
- **Both ends of the curve are unreliable, for opposite reasons.** Inside a few days, discreteness, spread, and pinning overwhelm the diffusive signal. Beyond two years, implied volatilities often come from a handful of trades or a dealer's mark, so back-end conclusions are conclusions about a model rather than a market.
- **Forward variance can be negative in real data.** When it is, the cause is nearly always inconsistent forwards, stale quotes, or mismatched dividend assumptions — not an exploitable arbitrage. Treat it as a data quality alarm.
- **Event decomposition assumes the diffusive rate is constant.** The split above attributes all excess variance to a single day and assumes the second month's forward volatility also describes the first month's background. Both are approximations; the resulting implied event move is indicative, not exact.

---

#### Code

```python
import math


def forward_volatility(vol_near, years_near, vol_far, years_far):
    """Volatility implied for the window between two expiries.

    Returns None when total variance decreases with maturity, which signals
    a calendar arbitrage or, far more likely, inconsistent input data.
    """
    variance_near = vol_near**2 * years_near
    variance_far = vol_far**2 * years_far
    forward_variance = (variance_far - variance_near) / (years_far - years_near)
    if forward_variance <= 0:
        return None
    return math.sqrt(forward_variance)


def interpolate_vol(target_years, expiries, vols):
    """Interpolate implied volatility linearly in total variance.

    Interpolating volatility directly can produce calendar arbitrage between
    two arbitrage-free quotes; interpolating variance cannot.
    """
    variances = [v**2 * t for v, t in zip(vols, expiries)]
    for i in range(len(expiries) - 1):
        if expiries[i] <= target_years <= expiries[i + 1]:
            span = expiries[i + 1] - expiries[i]
            weight = (target_years - expiries[i]) / span
            w = variances[i] * (1 - weight) + variances[i + 1] * weight
            return math.sqrt(w / target_years)
    raise ValueError("target outside the quoted expiry range")
```

---

#### See Also

* [The Volatility Surface](/derivatives/vol-surface)
* [Implied Volatility](/derivatives/implied-volatility)
* [Variance Swaps](/derivatives/variance-swaps)
* [Calendar Spreads](/markets/calendar-spreads)
* [Mean Reversion](/quant-math/mean-reversion)
* [GARCH Models](/stat-methods/garch)

---

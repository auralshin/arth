### Implied Volatility

> info **Metadata** Level: Intermediate | Prerequisites: Black-Scholes, Volatility | Tags: derivatives, implied-volatility, options, variance-risk-premium, root-finding

Implied volatility is the number you put into Black-Scholes to make it return the price the market is showing. Nothing more. It is not a forecast, not an estimate of anything, and not a property of the underlying asset — it is a change of units, converting a price in currency into a price in volatility. Because the map from `sigma` to price is strictly increasing, the inversion is unique, which is what makes the convention work at all.

That said, the units are enormously useful. A call at 7.97 and a call at 4.29 look nothing alike as prices, yet both are quoting 20% implied volatility — the difference is entirely strike, not the market's view of uncertainty. Prices are not comparable across contracts; implied volatilities are. Quoting in volatility strips out spot level, strike, time to expiry, and rates, leaving only the market's price for uncertainty. It is also the number that the entire option market negotiates in, so understanding what it does and does not contain is a prerequisite for reading any option data.

---

#### Formal Definition

Given an observed market price `V_mkt` for a European option, the implied volatility `sigma_imp` is the unique solution to:

```text
BS(S, K, r, q, sigma_imp, T) = V_mkt
```

where:

- `BS(...)` is the Black-Scholes price with all other inputs taken as observed
- `sigma_imp` is the annualised volatility that reconciles model and market
- uniqueness follows from vega being strictly positive: `dV/dsigma = S * n(d1) * sqrt(T) > 0` for `T > 0`

There is no closed form for the inverse. It is computed numerically.

**What it actually represents.** Under the model's own logic, `sigma_imp` is the constant volatility at which the cost of delta-hedging the option to expiry equals its price. So it is the market's price for the hedging programme, which embeds three separate things: an expectation of future realised volatility, a risk premium for bearing volatility risk, and the frictions of running the hedge. Any interpretation of implied volatility as "the market's forecast" quietly discards the last two.

> info **Implied volatility is a per-option quantity, not a per-asset one** Every strike and expiry has its own implied volatility. If the model were true they would all coincide. They do not, and the resulting structure is the [volatility surface](/derivatives/vol-surface).

---

#### Worked Example: Inverting a Price

Take `S = 100`, `K = 100`, `r = 0`, `T = 1`. At the money with a zero rate the formula collapses to a form that can be inverted by hand:

```text
C = S * ( 2 * N(sigma * sqrt(T) / 2) - 1 )
```

Suppose the market shows `C = 8.75`. We need the `sigma` that produces it.

**Step 1 — a starting guess.** The at-the-money approximation `C ~= 0.3989 * S * sigma * sqrt(T)` inverts directly:

```text
sigma_0 = 8.75 / (0.3989 * 100 * 1) = 0.2194
```

**Step 2 — bisection**, to show the mechanics. Bracket the root on `[0.10, 0.40]`:

<table>
  <tbody>
    <tr><td><strong>Iteration</strong></td><td><strong>Midpoint sigma</strong></td><td><strong>Model price</strong></td><td><strong>Compared to 8.75</strong></td><td><strong>New bracket</strong></td></tr>
    <tr><td>1</td><td>0.2500</td><td>9.9476</td><td>too high</td><td>[0.100, 0.250]</td></tr>
    <tr><td>2</td><td>0.1750</td><td>6.9726</td><td>too low</td><td>[0.175, 0.250]</td></tr>
    <tr><td>3</td><td>0.2125</td><td>8.4616</td><td>too low</td><td>[0.2125, 0.250]</td></tr>
    <tr><td>4</td><td>0.2313</td><td>9.2050</td><td>too high</td><td>[0.2125, 0.2313]</td></tr>
    <tr><td>5</td><td>0.2219</td><td>8.8334</td><td>too high</td><td>[0.2125, 0.2219]</td></tr>
    <tr><td>6</td><td>0.2172</td><td>8.6475</td><td>too low</td><td>[0.2172, 0.2219]</td></tr>
  </tbody>
</table>

Bisection halves the bracket each time and is unconditionally reliable, but slow: six iterations have located `sigma` only to within half a volatility point.

**Step 3 — Newton-Raphson**, using vega as the derivative. Start from `sigma = 0.20`, where the model price is `7.9656` and vega is `S * n(d1) * sqrt(T) = 100 * 0.396953 = 39.6953` per unit of volatility:

```text
sigma_1 = 0.20 + (8.75 - 7.9656) / 39.6953 = 0.20 + 0.019762 = 0.219762
```

Reprice at `0.219762`: the model gives `8.7496`, with vega `39.6541`. One more step:

```text
sigma_2 = 0.219762 + (8.75 - 8.7496) / 39.6541 = 0.219771
```

The answer is `sigma_imp = 21.98%`. Newton converged to six figures in two iterations from a guess that was off by two volatility points, because vega changes slowly near the money. Bisection would have needed roughly twenty.

The market price of 8.75 against a 20%-vol model price of 7.97 means the market is paying about 0.78 more — 2 volatility points — for the same contract.

> warning **Newton is fast and fragile** Vega collapses towards zero for deep out-of-the-money and near-expiry options, so the Newton step divides by a small number and can jump to a nonsensical volatility. Production implementations bracket first, then use a safeguarded method that falls back to bisection whenever a Newton step leaves the bracket.

---

#### Implied Versus Realised

These are different objects and confusing them is the most common error in volatility analysis.

<table>
  <tbody>
    <tr><td><strong></strong></td><td><strong>Implied volatility</strong></td><td><strong>Realised volatility</strong></td></tr>
    <tr><td>Source</td><td>Option prices today</td><td>Underlying returns over a window</td></tr>
    <tr><td>Direction in time</td><td>Forward-looking, to a fixed expiry</td><td>Backward-looking, over a fixed lookback</td></tr>
    <tr><td>Observability</td><td>Directly quoted</td><td>Estimated, with sampling error</td></tr>
    <tr><td>Contains a risk premium</td><td>Yes</td><td>No</td></tr>
    <tr><td>Depends on strike</td><td>Yes — the smile</td><td>No</td></tr>
  </tbody>
</table>

Comparing them requires care about horizon. A 30-day implied volatility should be compared against the realised volatility over the **next** 30 days, not the last 30. Plotting implied against trailing realised produces a chart that always looks like implied lags realised, which is an artefact of the misalignment rather than a finding. See [Volatility](/quant-math/volatility) for estimation conventions and [Rolling Windows](/quant-math/rolling-windows) for the lookback problem.

---

#### The Variance Risk Premium

The **variance risk premium** is the difference between the variance implied by option prices and the variance subsequently realised:

```text
VRP = sigma_implied^2 - sigma_realised^2
```

For equity indices this quantity has been persistently positive on average: options have tended to be priced at higher volatility than the market subsequently delivered. The economic story is that index options are, in aggregate, insurance. Investors are structurally long equities and want protection against the states where equities fall and volatility rises. Sellers of that protection lose money precisely when everything else they own is also losing, so they demand compensation, and that compensation shows up as implied volatility above the expected realised level.

Three properties follow, and all three matter more than the average:

- **The premium is compensation for a genuinely bad payoff shape.** A strategy that harvests it earns small, regular gains and occasional very large losses. Its [Sharpe ratio](/quant-math/sharpe) looks excellent right up until it does not, because Sharpe is blind to skew.
- **It is concentrated in the wings and the front end.** Out-of-the-money puts carry more of it than at-the-money options, and short expiries more than long ones.
- **It is not a constant.** It compresses when volatility is already high and expands in calm markets, so a naive short-volatility position sizes itself largest exactly when the premium is smallest.

> warning **This is not a description of a trade** The variance risk premium is an empirical regularity with a plausible economic explanation and a catastrophic tail. Its existence does not imply that selling volatility is profitable after transaction costs, margin requirements, and the sizing constraints that a realistic loss tolerance imposes.

---

#### In Practice Across Asset Classes

**Equity indices.** Quoted in volatility points, and the entire surface is negatively skewed. Front-month implied volatility spikes far more than back-month during sell-offs, which is why term structure inversion is a widely watched state variable. See [The Term Structure of Volatility](/derivatives/vol-term-structure).

**Single stocks.** Implied volatility contains a scheduled component: the earnings date. Removing it — decomposing implied variance into a diffusive part and an event part — is standard practice, because otherwise the term structure looks discontinuous for mechanical reasons.

**FX.** Quoting is native in volatility. Dealers negotiate "25-delta risk reversal in EUR/USD" and convert to premium afterwards. Implied volatility is therefore the primary market data, not a derived quantity, and the smile is described by three parameters rather than a strike grid. See [FX 101](/markets/fx-101).

**Rates.** Two conventions coexist. Lognormal (Black) volatility is quoted in percent; normal (Bachelier) volatility is quoted in basis points per annum. Since rates went negative in several currencies, normal volatility became the default in many markets, and mixing the two produces errors of an order of magnitude, not a few percent.

**Commodities.** Implied volatility is contract-month specific and shaped by delivery, storage, and seasonality. A January natural gas option and a July one are not two points on a smooth term structure; they are different products. See [Commodities](/markets/commodities).

**On-chain.** Listed crypto option markets are thin outside the largest assets and the nearest expiries, so implied volatility from far strikes is often the midpoint of a very wide spread rather than a price anyone would trade. Realised volatility, by contrast, is easy to compute from continuous 24/7 price data — an unusual case where the realised side is better measured than the implied side. Note also that [perpetual funding](/signals/funding-rate) contains no volatility information at all; it prices carry, not variance.

---

#### Assumptions and Failure Modes

- **It is model-dependent by construction.** Implied volatility means nothing without specifying the model used to invert. Black-76 implied volatility and Bachelier implied volatility on the same option are different numbers.
- **Garbage inputs produce garbage volatility.** The inversion uses your assumed rate, dividend, and forward. If the forward is wrong by 0.5%, the implied volatilities of calls and puts at the same strike will disagree — a good diagnostic that something upstream is broken. Check with [put-call parity](/derivatives/payoffs-parity) first.
- **Wide spreads make it meaningless.** Inverting the mid of a market quoted 1.90 / 2.40 gives a precise number derived from an imprecise input. Always compute implied volatility at bid and at ask and report the range.
- **Vega vanishes in the wings.** Where vega is tiny, a one-tick price change moves implied volatility by several points. Deep out-of-the-money implied volatilities are numerically unstable and should be down-weighted in any fit.
- **No solution may exist.** If the quoted price violates the arbitrage bounds — below intrinsic, or above the underlying — no `sigma` reproduces it and the solver must fail loudly rather than return a boundary value.
- **Implied volatility is not an expectation.** Even in a correct model it is closer to a risk-neutral expectation of average variance than to a real-world forecast, and the gap is the risk premium above.

---

#### Code

```python
import math


def implied_vol(market_price, price_fn, lo=1e-4, hi=5.0, tol=1e-8, max_iter=100):
    """Bracketed bisection on volatility.

    Slower than Newton but cannot diverge, which matters for wing options
    where vega is near zero. price_fn(sigma) returns the model price.
    Raises if the quote is outside the model's attainable range.
    """
    if not price_fn(lo) <= market_price <= price_fn(hi):
        raise ValueError("price outside attainable range; check arbitrage bounds")

    for _ in range(max_iter):
        mid = 0.5 * (lo + hi)
        if price_fn(mid) < market_price:
            lo = mid
        else:
            hi = mid
        if hi - lo < tol:
            break
    return 0.5 * (lo + hi)


def atm_vol_guess(price, spot, years):
    """Brenner-Subrahmanyam starting point for at-the-money options.

    Accurate to roughly 1% of premium for total volatility below ~0.5,
    which makes it a good seed for a Newton iteration.
    """
    return price / (0.3989 * spot * math.sqrt(years))
```

---

#### See Also

* [Black-Scholes](/derivatives/black-scholes)
* [The Volatility Surface](/derivatives/vol-surface)
* [The Term Structure of Volatility](/derivatives/vol-term-structure)
* [Variance Swaps](/derivatives/variance-swaps)
* [Volatility](/quant-math/volatility)
* [GARCH Models](/stat-methods/garch)

---

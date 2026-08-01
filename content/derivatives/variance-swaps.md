### Variance Swaps

> info **Metadata** Level: Advanced | Prerequisites: Implied volatility, Replication, Delta hedging | Tags: derivatives, variance-swap, replication, vix, realised-variance

A variance swap pays the difference between the variance a market actually realises and a fixed strike agreed at inception. It is the cleanest instrument for expressing a view on volatility, because unlike a delta-hedged option it has no exposure to the level of the underlying, no gamma weighting, and no dependence on how often you rebalance. You are paid on realised variance and nothing else.

What makes it genuinely important is the replication argument. A variance swap can be built from a static portfolio of vanilla options — bought once, held to expiry, never rebalanced — plus a dynamic position in the underlying with a known, model-free weight. That is remarkable: a fundamentally non-linear payoff replicated without assuming any particular volatility dynamics. It is also the construction behind the VIX and every index like it.

---

#### Formal Definition

The payoff at expiry is:

```text
Payoff = N_var * ( sigma_R^2 - K_var^2 )
```

with realised variance computed under the market-standard zero-mean convention:

```text
sigma_R^2 = (A / n) * sum_{i=1..n} ( ln(S_i / S_{i-1}) )^2
```

where:

- `K_var` is the **variance strike**, quoted as a volatility (so a strike of "20" means `K_var^2 = 400` in squared volatility points)
- `sigma_R` is the annualised realised volatility over the observation period
- `N_var` is the **variance notional**: currency per point of variance
- `A` is the annualisation factor, conventionally 252 for daily observations
- `n` is the number of return observations, and returns are computed on official closing prices specified in the term sheet
- the mean is **not** subtracted — the convention is zero-mean, which keeps the payoff exactly replicable

Because variance points are unintuitive, trades are sized in **vega notional**: the approximate profit or loss per volatility point near the strike.

```text
N_var = N_vega / ( 2 * K_var )
```

This comes from differentiating `sigma^2` with respect to `sigma`, which gives `2 * sigma`. At the strike the swap behaves like a volatility position of size `N_vega`; away from it, convexity takes over.

---

#### Worked Example: Computing the Payoff

**Step 1 — realised variance from a short return series.** Five daily log returns of `+1.2%`, `-0.8%`, `+2.1%`, `-1.5%`, `+0.6%` square to `0.000144`, `0.000064`, `0.000441`, `0.000225`, `0.000036`, summing to `0.000910`. Annualising: `(252 / 5) * 0.000910 = 50.4 * 0.000910 = 0.045864`, so `sigma_R = sqrt(0.045864) = 21.42%`. Notice the sign of each return is irrelevant — only the squares enter.

**Step 2 — the payoff on a full-term trade.** Take a variance strike of `K_var = 20`, a vega notional of `100,000` per volatility point, and realised volatility over the term of `25`.

1. **Variance notional**: `N_var = 100,000 / (2 * 20) = 2,500` per variance point
2. **Payoff**: `2,500 * (25^2 - 20^2) = 2,500 * (625 - 400) = 2,500 * 225 = 562,500`

A linear vega position would have paid `100,000 * (25 - 20) = 500,000`. The extra `62,500` is convexity.

**Step 3 — the convexity is two-sided and asymmetric.**

<table>
  <tbody>
    <tr><td><strong>Realised vol</strong></td><td><strong>Variance swap payoff</strong></td><td><strong>Linear vega payoff</strong></td><td><strong>Difference</strong></td></tr>
    <tr><td>10</td><td>-750,000</td><td>-1,000,000</td><td>+250,000</td></tr>
    <tr><td>15</td><td>-437,500</td><td>-500,000</td><td>+62,500</td></tr>
    <tr><td>20</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>25</td><td>+562,500</td><td>+500,000</td><td>+62,500</td></tr>
    <tr><td>30</td><td>+1,250,000</td><td>+1,000,000</td><td>+250,000</td></tr>
    <tr><td>40</td><td>+3,000,000</td><td>+2,000,000</td><td>+1,000,000</td></tr>
  </tbody>
</table>

The long side gains more than linearly when volatility rises and loses less than linearly when it falls. That convexity is not free: it is why the variance strike trades above the fair volatility strike, and why the short side of a variance swap has a payoff shape that looks benign in normal conditions and severe in a spike. At 40 realised against a strike of 20, the short loses `3,000,000`, nearly seven times the `437,500` it would gain from a fall to 15 — and three times the `1,000,000` that is the most it could ever make, if volatility collapsed to zero.

> warning **The short side is quadratically exposed** Doubling realised volatility relative to the strike quadruples the loss on the variance leg. Single-name variance swaps are almost always written with a cap, typically at 2.5 times the strike, precisely because the uncapped payoff is unmanageable in a single-stock event.

---

#### The Replication Argument

The construction rests on one identity. For a diffusion with no jumps, applying [Ito's lemma](/stochastic-calculus/ito-lemma) to `ln(S_t)` gives:

```text
d(ln S) = (mu - 0.5*sigma^2) dt + sigma dW
dS / S  =  mu dt + sigma dW
```

Subtracting and integrating to `T`:

```text
integral of sigma^2 dt  =  2 * [ integral of dS/S  -  ln(S_T / S_0) ]
```

The left side is exactly total realised variance. The right side is a self-financing position holding `2/S_t` units of the underlying at all times — a dynamic but **model-free** weight — minus twice a **log contract**, a European claim paying `ln(S_T / S_0)`.

The log contract is where the options come in. Any twice-differentiable payoff `f(S_T)` decomposes into a bond, a forward, and a strip of out-of-the-money options (the Carr-Madan result). Applying this to `-ln(S_T / F)` produces weights proportional to `1/K^2`, and the fair variance strike becomes:

```text
K_var^2 = (2/T) * exp(r*T) * [ sum over K below F of P(K) * dK / K^2
                             + sum over K above F of C(K) * dK / K^2 ]
```

where `P(K)` and `C(K)` are out-of-the-money put and call prices and `dK` is the strike spacing. **The weight `1/K^2` is the whole trick.** Low strikes get large weights, which is why variance swaps are so sensitive to the price of deep out-of-the-money puts and why the replication is expensive precisely in the illiquid part of the surface.

---

#### Worked Example: A Discrete Strip

Take `F = 100`, `T = 1`, `r = 0`, and a **flat** 20% volatility surface, so the true fair variance strike is exactly `0.04`, i.e. 20% volatility. Build a strip from 60 to 140 in steps of 10, using out-of-the-money options at each strike.

<table>
  <tbody>
    <tr><td><strong>Strike</strong></td><td><strong>Option</strong></td><td><strong>Weight dK / K^2</strong></td><td><strong>Price</strong></td><td><strong>Contribution (2 * w * price)</strong></td></tr>
    <tr><td>60</td><td>Put</td><td>0.002778</td><td>0.0261</td><td>0.000145</td></tr>
    <tr><td>70</td><td>Put</td><td>0.002041</td><td>0.2481</td><td>0.001013</td></tr>
    <tr><td>80</td><td>Put</td><td>0.001563</td><td>1.1859</td><td>0.003706</td></tr>
    <tr><td>90</td><td>Put</td><td>0.001235</td><td>3.5891</td><td>0.008862</td></tr>
    <tr><td>100</td><td>Call</td><td>0.001000</td><td>7.9656</td><td>0.015931</td></tr>
    <tr><td>110</td><td>Call</td><td>0.000826</td><td>4.2920</td><td>0.007094</td></tr>
    <tr><td>120</td><td>Call</td><td>0.000694</td><td>2.1473</td><td>0.002982</td></tr>
    <tr><td>130</td><td>Call</td><td>0.000592</td><td>1.0089</td><td>0.001194</td></tr>
    <tr><td>140</td><td>Call</td><td>0.000510</td><td>0.4500</td><td>0.000459</td></tr>
  </tbody>
</table>

The contributions sum to `0.041386`, giving an implied variance strike of `sqrt(0.041386) = 20.34%` against a true value of 20%. Refining the strip converges: strikes 20 to 300 at spacing 5 give `0.040416`, or **20.10%**; strikes 5 to 600 at spacing 1 give `0.040017`, or **20.00%**.

Two biases are visible and they run in opposite directions. **Discretisation** (coarse strike spacing) biases the estimate upward, because the sum over-counts the smooth integrand near the peak. **Truncation** (missing far strikes) biases it downward, because the tails contribute real, if small, variance. In the coarse strip above, discretisation dominates by about a third of a volatility point. In real markets truncation dominates instead, because listed strikes stop long before the integrand does.

---

#### VIX-Style Construction

The VIX and its many imitators apply exactly this formula to listed option prices, with two adjustments for practicality:

```text
sigma^2 = (2/T) * sum_i ( dK_i / K_i^2 ) * exp(r*T) * Q(K_i)
          - (1/T) * ( F / K_0 - 1 )^2
```

where `Q(K_i)` is the mid-quote of the out-of-the-money option at strike `K_i`, `dK_i` is half the distance between the neighbouring strikes, `F` is the forward implied from the strike where the call and put prices are closest, and `K_0` is the first listed strike at or below `F`. The final term corrects for the fact that `K_0` is not exactly the forward. The published index interpolates two expiries to a constant 30-day horizon and multiplies by 100.

Three consequences follow directly. It is a **variance** calculation reported as a volatility — the square root is applied at the end, and averaging then square-rooting is not the same as square-rooting then averaging. It is **truncated**: the sum stops when two consecutive strikes have no bid, so the index is least accurate in a crash, exactly when deep puts dominate the integrand and are worst quoted. And it is **not directly tradable** — only futures and options on the index trade, and a future on a volatility index is not the variance strike.

A **volatility swap**, paying `N * (sigma_R - K_vol)`, looks simpler and is strictly harder to price: `sqrt(variance)` is concave, and concavity is not replicable by the strip argument. By Jensen's inequality `E[sigma_R]` is at most `sqrt(E[sigma_R^2])`, so the fair volatility strike sits **below** the fair variance strike. The gap depends on the volatility of volatility, which the vanilla surface does not determine. Variance swaps are model-free; volatility swaps are not. That is why variance swaps became the market standard despite the less intuitive payoff.

---

#### In Practice Across Asset Classes

**Equity indices.** The deepest variance swap market, and the one the replication argument suits best: liquid listed strikes across a wide range, continuous trading, and no dividends inside the return series if the index is a total-return construction. Index variance swaps are usually uncapped.

**Single stocks.** Almost always capped, typically at 2.5 times the strike, because takeover and fraud gaps produce single-day returns the uncapped payoff cannot absorb. The cap makes the product no longer exactly replicable — it is a variance swap minus a knock-out feature — so it requires a model after all.

**FX.** Traded, with the wrinkle that replication needs out-of-the-money options in both directions and the smile is closer to symmetric than in equities. Nearly continuous trading makes the discrete-sampling error smaller than in exchange-traded markets.

**Rates and commodities.** In rates the analogue is a swaption-based variance or constant-maturity volatility product, and replication is harder because the underlying is a rate: under normal rather than lognormal dynamics the correct strip weight is uniform in strike, not `1/K^2`. In commodities, variance concentrates in the few days per contract month carrying inventory reports or weather, and the zero-mean convention bites harder because contract-month trends make the mean return materially non-zero.

**On-chain.** Realised variance is straightforward to compute from continuous price data, but the option strip needed for replication does not exist with sufficient depth outside the largest assets and nearest expiries. Variance-like products on-chain are therefore typically settled against an oracle-computed realised variance rather than replicated, which shifts the risk from model risk to [oracle risk](/risk/oracle-manipulation). A structurally related exposure already exists on-chain: fee income to a liquidity provider is roughly proportional to realised volume and therefore to realised variance, which is why an LP position is often described as being long realised volatility and short the price move. See [Impermanent Loss](/building-blocks/impermanent-loss).

---

#### Assumptions and Failure Modes

- **The replication assumes continuous paths.** Jumps break the identity between realised variance and the log contract. With jumps, the strip prices the log contract correctly but the variance swap payoff acquires a third-moment term, so the hedge is systematically off in the direction of the skew. See [Jumps](/quant-math/jumps).
- **A continuum of strikes is required, and the wings dominate.** Real markets list a finite grid over a bounded range, so truncation and discretisation both bias the strike in opposite directions. The `1/K^2` weight makes deep out-of-the-money puts the largest single contributor — exactly the options with the widest spreads and least reliable marks.
- **Discrete sampling is not continuous variance.** The payoff uses daily closes; the replication prices continuous quadratic variation. The two differ by a sampling error that is small in expectation and not small in a single realisation.
- **The zero-mean convention is a convention.** It keeps the payoff exactly replicable, and it also means a strongly trending market registers as high variance even with steady daily moves. Intended behaviour, but it surprises people.
- **Caps change the product.** A capped variance swap is a variance swap minus a knock-out and is no longer model-free. Pricing the cap needs a view on the tail, which is the part no model gets right.
- **Return definitions matter.** Which closing price, which holiday calendar, what happens on a trading halt — term sheet detail that has produced real disputes.

---

#### Code

```python
import math


def realised_variance(prices, annualisation=252):
    """Annualised realised variance under the market-standard convention.

    The mean is deliberately not subtracted: the zero-mean form is what makes
    the payoff exactly replicable by the log-contract argument.
    """
    log_returns = [math.log(prices[i] / prices[i - 1]) for i in range(1, len(prices))]
    return annualisation / len(log_returns) * sum(r * r for r in log_returns)


def variance_swap_payoff(realised_vol, strike_vol, vega_notional):
    """Payoff with volatilities quoted in points (20 means 20%).

    Variance notional derives from vega notional, so the swap behaves like a
    linear vega position at the strike and convex away from it.
    """
    return vega_notional / (2.0 * strike_vol) * (realised_vol**2 - strike_vol**2)


def fair_variance_strike(strikes, otm_prices, years, rate=0.0):
    """Discrete strip approximation to the fair variance strike.

    otm_prices holds the out-of-the-money option at each strike: puts below
    the forward, calls above. The 1/K^2 weight makes far downside strikes
    dominate, which is the main source of error when the strip is truncated.
    """
    last = len(strikes) - 1
    spacings = [
        (strikes[min(i + 1, last)] - strikes[max(i - 1, 0)]) / (2 if 0 < i < last else 1)
        for i in range(len(strikes))
    ]
    weighted = sum(dk / k**2 * q for dk, k, q in zip(spacings, strikes, otm_prices))
    return 2.0 / years * math.exp(rate * years) * weighted
```

---

#### See Also

* [Implied Volatility](/derivatives/implied-volatility)
* [Delta Hedging](/derivatives/delta-hedging)
* [The Volatility Surface](/derivatives/vol-surface)
* [The Term Structure of Volatility](/derivatives/vol-term-structure)
* [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication)
* [Ito's Lemma](/stochastic-calculus/ito-lemma)

---

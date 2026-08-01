### Jump Processes

> info **Metadata** Level: Advanced | Prerequisites: Random Variables, Volatility, Geometric Brownian Motion | Tags: jumps, tails, discontinuities, risk

A diffusion moves in infinitesimal steps: over a short enough interval the price change is arbitrarily small. Real markets do not behave this way. Earnings are announced, a central bank surprises, a currency peg breaks, an issuer defaults, a position is liquidated — and the price is somewhere else without having traded through the intervening levels. A jump process adds these discontinuities explicitly, as a separate source of randomness alongside the continuous one.

The addition changes the risk picture more than the return picture. Jumps contribute modestly to total variance and enormously to the tails, and their effect is concentrated at short horizons. They also break the argument that makes continuous hedging work, which is why they matter as much to anyone running an options book as to anyone measuring Value at Risk.

This page is applied. For the construction of Poisson and Lévy processes and the extension of Itô calculus to discontinuous paths, see [SDEs](/stochastic-calculus/sdes).

---

#### Formal Definition

The Merton jump-diffusion adds a compound Poisson term to Geometric Brownian Motion:

```text
dS / S = (mu - lambda * k) * dt  +  sigma * dW  +  (J - 1) * dN
```

where:

- `sigma` is the **diffusive** volatility, excluding jumps
- `dN` is a Poisson increment with intensity `lambda`, the expected number of jumps per unit time
- `J` is the random jump multiplier, so a jump takes `S` to `J * S`
- `k = E[J] - 1` is the expected proportional jump size
- `lambda * k` is the **compensator**, subtracted so that the total expected return remains `mu`

In the common specification `ln(J)` is normal with mean `m` and standard deviation `s`, giving `k = exp(m + s^2/2) - 1`.

**Moments over a horizon `T`.** Cumulants add across the independent diffusive and jump components, and each scales linearly with `T`:

```text
Variance      = ( sigma^2 + lambda * (m^2 + s^2) ) * T
4th cumulant  = lambda * (m^4 + 6*m^2*s^2 + 3*s^4) * T
Excess kurtosis = 4th cumulant / Variance^2
```

Because variance scales as `T` and the fourth cumulant also scales as `T`, excess kurtosis scales as `1/T`. **Jump risk is a short-horizon phenomenon.** Aggregate for long enough and the Central Limit Theorem pulls the distribution back towards normal. See [LLN & CLT](/quant-math/lln-clt).

---

#### Worked Example

A price with diffusive volatility `sigma = 20%` per year, jump intensity `lambda = 3` per year, and log-jumps with mean `m = -0.02` and standard deviation `s = 0.06`.

1. **Jump variance contribution**: `lambda * (m^2 + s^2) = 3 * (0.0004 + 0.0036) = 3 * 0.0040 = 0.0120`
2. **Total annual variance**: `0.04 + 0.0120 = 0.0520`
3. **Total volatility**: `sqrt(0.0520) = 22.8%`
4. **Jumps' share of variance**: `0.0120 / 0.0520 = 23%`

So jumps add `2.8` percentage points to an observed volatility of `22.8%`. Fit a pure diffusion to this data and you get 22.8%, not 20% — the model absorbs the jumps into the diffusion and then misprices the tails.

5. **Fourth cumulant per year**: `3 * (m^4 + 6*m^2*s^2 + 3*s^4)` = `3 * (0.00000016 + 0.00000864 + 0.00003888)` = `3 * 0.00004768` = `0.00014304`
6. **Excess kurtosis by horizon**:

<table>
  <tbody>
    <tr>
      <td><strong>Horizon</strong></td>
      <td><strong>Variance</strong></td>
      <td><strong>Excess kurtosis</strong></td>
    </tr>
    <tr><td>1 day</td><td>0.000206</td><td>13.3</td></tr>
    <tr><td>1 month</td><td>0.004333</td><td>0.63</td></tr>
    <tr><td>1 year</td><td>0.052000</td><td>0.05</td></tr>
  </tbody>
</table>

Daily returns from this process are wildly non-normal; annual returns are almost indistinguishable from normal. The same process, two conclusions, depending only on the measurement horizon.

7. **Jump arrival probabilities**: `1 - exp(-lambda * T)` gives `1.18%` for one day, `22.1%` for one month, and `95.0%` for one year
8. **Expected jump size in price terms**: `exp(-0.02 + 0.0018) - 1 = -1.80%`, so the compensator is `3 * (-1.80%) = -5.41%` of drift per year that must be added back

**The scale problem.** Daily diffusive volatility is `20% / sqrt(252) = 1.26%`. A single `-15%` day is therefore an `11.9` standard deviation event under the pure diffusion — a probability so small the model effectively rules it out. Under the jump model it is one moderately large jump, and jumps occur three times a year. This is the entire practical case for jump models: not a better central forecast, but a loss distribution whose tail is not absurd.

> warning **A fitted diffusion hides jumps inside its volatility** Estimating volatility from a series containing jumps yields a number that is too high for ordinary days and far too low for the tail. The single-parameter fit is wrong in both directions at once.

---

#### Why Jumps Break Hedging

The Black-Scholes replication argument requires the hedge to be adjusted continuously as the price moves. With continuous paths this is possible in principle: the position passes through every intermediate price. With jumps it is not — the price arrives somewhere new without the hedge having been adjusted, and the residual loss is not diversifiable within a single position.

Three consequences follow:

- **The market becomes incomplete.** A jump-diffusion cannot be perfectly replicated by the underlying and cash alone, so there is no unique arbitrage-free price. Jump risk carries a premium that must be assumed rather than derived. See [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication).
- **Short-dated out-of-the-money options are worth more than a diffusion implies.** They are the direct hedge against a jump, and their prices reveal what the market charges for it. This is a major contributor to the volatility smile, and it is steepest at short maturities — exactly matching the `1/T` scaling of jump-induced kurtosis. See [Vol Surface](/derivatives/vol-surface).
- **Gamma risk becomes discrete.** A delta hedge that is accurate for small moves loses on a large one regardless of direction, and the loss is bounded only by the size of the jump. See [Delta Hedging](/derivatives/delta-hedging).

---

#### In Practice Across Asset Classes

- **Equities.** Single names gap on earnings, guidance, and corporate actions, and the timing of scheduled events is known in advance — which makes those jumps forecastable in arrival if not in size. Index-level jumps are rarer but affect everything simultaneously, so they are the least diversifiable risk in an equity book.
- **Futures.** Limit-up and limit-down rules convert a jump into a period of no trading rather than into a price. The position cannot be exited at any price until the market reopens, which means the realised loss can exceed anything a price-based model measures. See [Futures 101](/markets/futures-101).
- **FX.** Pegged and managed currencies are the purest jump processes in finance: near-zero measured volatility for extended periods, then a single discontinuous repricing. Any volatility-based risk measure reads zero risk right up to the event.
- **Fixed income.** Policy decisions and data releases produce jumps at known times. Curve reshaping around those events is discontinuous in a way that a diffusion model of the level cannot represent.
- **Credit.** Jump-to-default is the defining risk. A bond can move from a small spread to its recovery value in one step, and no amount of spread-volatility modelling captures it. Reduced-form credit models are jump models by construction, with default as the first arrival of a Poisson process. See [Reduced-Form Models](/credit/reduced-form-models).
- **Commodities.** Supply disruptions, weather, and inventory announcements produce sharp, physically driven jumps that are asymmetric — shortages spike prices upward far more violently than surpluses push them down.
- **On-chain.** Jumps are frequent and mechanically generated: liquidation cascades, oracle updates arriving in discrete steps, and large swaps against thin liquidity all produce discontinuities within a single block. Crucially they **cluster**, since each liquidation lowers the price and triggers the next, which violates the independence assumption of a Poisson arrival process. Self-exciting models are a better fit than constant-intensity ones. See [Liquidations](/building-blocks/liquidations) and [Slippage & Front-running](/risk/slippage-frontrunning).

---

#### Assumptions and Failure Modes

- **Constant jump intensity.** Poisson arrivals assume jumps occur independently at a constant rate. Real jumps cluster — one liquidation triggers another, one default raises the probability of the next — which self-exciting (Hawkes) processes model and the standard specification does not.
- **Jumps independent of the diffusion.** In practice, volatility rises around the events that produce jumps. The two components are correlated, and modelling them as independent understates the joint tail.
- **Parameters are barely identifiable.** Separating `lambda`, `m`, `s`, and `sigma` requires observing many jumps. With three jumps a year, a decade of data provides roughly thirty events from which to estimate a whole jump distribution.
- **The jump-diffusion split is not observable.** At any finite sampling frequency, a large return could be one jump or a burst of diffusion. High-frequency estimators separate them better but are contaminated by microstructure noise. See [Volatility](/quant-math/volatility).
- **The largest jump has not happened yet.** A fitted jump-size distribution is calibrated to the jumps in the sample. Structural events — a peg breaking, a chain halting, an issuer failing — are drawn from a different distribution than the routine gaps that dominate the fit.
- **Jumps are assumed independent across assets.** They are not. Systemic events move everything at once, so a portfolio diversified against diffusive risk may be entirely undiversified against jump risk. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Risk measures inherit the model's tail.** VaR and CVaR computed from a fitted jump model are only as good as the jump-size distribution assumed. Scenario analysis, which fixes the size by assumption rather than by fit, is the appropriate complement. See [Scenarios](/simulation/scenarios).

---

#### Code

```python
import numpy as np

def simulate_merton(s0, mu, sigma, lam, jump_mean, jump_sd,
                    years, steps_per_year=252, n_paths=1000, seed=None):
    """Merton jump-diffusion. Jump counts per step are Poisson, sizes log-normal.

    The compensator keeps the total expected return equal to mu; omitting it
    silently shifts the drift by lambda * k.
    """
    rng = np.random.default_rng(seed)
    n_steps = int(years * steps_per_year)
    dt = 1.0 / steps_per_year

    k = np.exp(jump_mean + 0.5 * jump_sd**2) - 1.0
    drift = (mu - lam * k - 0.5 * sigma**2) * dt

    diffusion = sigma * np.sqrt(dt) * rng.normal(size=(n_paths, n_steps))
    counts = rng.poisson(lam * dt, size=(n_paths, n_steps))
    # Sum of `counts` iid normals is normal with scaled mean and variance.
    jumps = counts * jump_mean + np.sqrt(counts) * jump_sd * rng.normal(
        size=(n_paths, n_steps)
    )

    log_paths = np.cumsum(drift + diffusion + jumps, axis=1)
    return s0 * np.exp(np.column_stack([np.zeros(n_paths), log_paths]))


def excess_kurtosis(sigma, lam, jump_mean, jump_sd, horizon_years):
    """Jump-induced excess kurtosis scales as 1/T: severe daily, mild annually."""
    m, s = jump_mean, jump_sd
    variance = (sigma**2 + lam * (m**2 + s**2)) * horizon_years
    fourth_cumulant = lam * (m**4 + 6 * m**2 * s**2 + 3 * s**4) * horizon_years
    return fourth_cumulant / variance**2
```

---

#### See Also

* [Geometric Brownian Motion](/quant-math/gbm)
* [VaR & CVaR](/quant-math/var-cvar)
* [Volatility](/quant-math/volatility)
* [Random Variables](/quant-math/random-variables)
* [Scenarios](/simulation/scenarios)
* [Vol Surface](/derivatives/vol-surface)
* [Reduced-Form Models](/credit/reduced-form-models)

---

### Brownian Motion

> info **Metadata** Level: Advanced | Prerequisites: Random Variables, LLN & CLT, Random Walks | Tags: brownian-motion, wiener-process, quadratic-variation, stochastic-processes

Brownian motion is the continuous-time object that every diffusion model in finance is built from. It is the scaling limit of a random walk: take a fair coin-flip walk, shrink the step size, speed up the clock, and in the limit you get a process with continuous paths, Gaussian increments, and variance that grows exactly linearly in time. Once you have it, [Geometric Brownian Motion](/quant-math/gbm), the Black-Scholes model, and almost every interest-rate model follow as transformations of it.

Its most consequential property is not the Gaussian marginal — it is the **quadratic variation**. Over any interval of length `T`, the sum of squared increments converges to `T` itself, not to zero. That single fact is why ordinary calculus fails on these paths, why [Itô's Lemma](/stochastic-calculus/ito-lemma) has a second-order term, and why volatility is observable from a price path in a way that drift is not.

---

#### Formal Definition

A stochastic process `W = {W_t : t at or above 0}` on a probability space is a **standard Brownian motion** (or **Wiener process**) if:

1. `W_0 = 0` almost surely.
2. **Independent increments.** For any increasing sequence of times `0 = t_0, t_1, ..., t_n`, the increments `W_{t_1} - W_{t_0}, ..., W_{t_n} - W_{t_{n-1}}` are mutually independent.
3. **Stationary Gaussian increments.** For `s` before `t`, `W_t - W_s ~ N(0, t - s)`. The distribution depends only on the elapsed time, not on the starting point.
4. **Continuous paths.** With probability one, the map `t -> W_t` is continuous.

Wiener (1923) proved that a process satisfying all four exists — this is not obvious, since properties 2 and 3 alone permit wildly discontinuous versions.

Immediate consequences:

```text
E[W_t]        = 0
Var(W_t)      = t
Cov(W_s, W_t) = min(s, t)
sd(W_t)       = sqrt(t)
```

The covariance follows from independence of increments: for `s` before `t`, `Cov(W_s, W_t) = Cov(W_s, W_s + (W_t - W_s)) = Var(W_s) = s`.

A **Brownian motion with drift** adds a deterministic trend, `X_t = mu*t + sigma*W_t`, so `X_t ~ N(mu*t, sigma^2*t)`.

---

#### Worked Example: Quadratic Variation Beats Total Variation

Simulate one path on `[0, 1]` with four steps, so `dt = 0.25` and `sqrt(dt) = 0.5`. Suppose the four standard normal draws are as follows.

<table>
  <tbody>
    <tr>
      <td><strong>Step k</strong></td><td>1</td><td>2</td><td>3</td><td>4</td>
    </tr>
    <tr>
      <td><strong>Draw Z_k</strong></td><td>0.8</td><td>-1.2</td><td>0.4</td><td>1.6</td>
    </tr>
    <tr>
      <td><strong>Increment = 0.5 * Z_k</strong></td><td>0.4</td><td>-0.6</td><td>0.2</td><td>0.8</td>
    </tr>
    <tr>
      <td><strong>Path W at t = 0.25k</strong></td><td>0.4</td><td>-0.2</td><td>0.0</td><td>0.8</td>
    </tr>
  </tbody>
</table>

1. **Sum of squared increments**: `0.16 + 0.36 + 0.04 + 0.64 = 1.20`. The theoretical limit is `T = 1`. With only four steps the sampling standard deviation of this sum is `T*sqrt(2/n) = sqrt(2/4) = 0.71`, so 1.20 is well inside noise.
2. **Sum of absolute increments**: `0.4 + 0.6 + 0.2 + 0.8 = 2.0`.

Now refine the grid. Because `E|N(0, T/n)| = sqrt(T/n) * sqrt(2/pi)`, the expected total variation over `n` steps is `sqrt(n*T) * 0.7979`:

<table>
  <tbody>
    <tr>
      <td><strong>Steps n</strong></td><td><strong>E[sum of |increments|]</strong></td><td><strong>E[sum of increments^2]</strong></td><td><strong>sd of that sum</strong></td>
    </tr>
    <tr><td>4</td><td>1.60</td><td>1.000</td><td>0.707</td></tr>
    <tr><td>100</td><td>7.98</td><td>1.000</td><td>0.141</td></tr>
    <tr><td>10,000</td><td>79.79</td><td>1.000</td><td>0.014</td></tr>
    <tr><td>1,000,000</td><td>797.9</td><td>1.000</td><td>0.0014</td></tr>
  </tbody>
</table>

The absolute-increment column diverges like `sqrt(n)`; the squared-increment column locks onto `T = 1` with vanishing spread. Formally, for any sequence of partitions of `[0, T]` whose mesh tends to zero,

```text
sum over k of (W_{t_k} - W_{t_{k-1}})^2  ->  T   in probability
```

written in shorthand as `dW * dW = dt`. Meanwhile the total variation is infinite almost surely, which is exactly why a path integral against `dW` cannot be defined pathwise as a Stieltjes integral and needs the Itô construction instead.

---

#### Scaling and Self-Similarity

Brownian motion is invariant under a joint rescaling of space and time. For any `c` above 0,

```text
W~_t = W_{c*t} / sqrt(c)
```

is again a standard Brownian motion. This is self-similarity with Hurst exponent `1/2`, and it is the mathematical origin of the square-root-of-time rule used throughout [Volatility](/quant-math/volatility): a diffusion observed at daily frequency and one observed at hourly frequency are the same object viewed through different lenses, so `sigma_annual = sigma_daily * sqrt(252)`.

Two further invariances are useful in proofs and in simulation:

- **Time inversion.** `t * W_{1/t}` (with value 0 at `t = 0`) is a standard Brownian motion, which converts statements about behaviour near zero into statements about behaviour at infinity.
- **Reflection.** `-W_t` is a standard Brownian motion, and the reflection principle gives the running-maximum law `P(max over [0,T] of W above a) = 2 * P(W_T above a)` for positive `a` — the basis of closed-form barrier option prices.

> info **Hurst exponent** Processes whose variance grows like `t^{2H}` for `H` other than `1/2` are called fractional Brownian motions. They have dependent increments and do not admit standard Itô calculus. Everything on these pages assumes `H = 1/2`.

---

#### Continuous but Nowhere Differentiable

Fix a time `t` and look at the difference quotient over a small step `h`:

```text
(W_{t+h} - W_t) / h  ~  N(0, h) / h  =  N(0, 1/h)
```

Its standard deviation is `1/sqrt(h)`, which diverges as `h` shrinks. So the difference quotient has no limit in distribution, let alone almost surely. Paley, Wiener and Zygmund (1933) proved the far stronger statement: with probability one, the path is differentiable at **no** time point at all.

The path is nonetheless continuous, and more precisely Hölder continuous of every order strictly below `1/2` and of no order above `1/2`. Lévy's modulus of continuity pins the sharp rate:

```text
limsup as h -> 0 of  max |W_{t+h} - W_t| / sqrt(2*h*log(1/h))  =  1
```

The practical reading: over a short interval `h`, moves of size roughly `sqrt(h)` are normal. Since `sqrt(h)` is much larger than `h` for small `h`, the path travels far faster than any straight line — infinitely fast, in the limit — but it never jumps.

> warning **This is a modelling choice, not an empirical fact** No real price path is continuous; quotes move in ticks and gap over closes and halts. Continuity buys tractability, at the cost of assigning zero probability to overnight gaps. See [Jump Processes](/quant-math/jumps).

---

#### Where This Is Used

**Pricing.** Brownian motion is the driver in the Black-Scholes model, in Heston, in Vasicek and Hull-White. The `sqrt(T)` in `d1` and `d2` of the [Black-Scholes](/derivatives/black-scholes) formula is Brownian scaling, nothing more.

**Risk.** Value-at-risk scaling from one day to ten days by `sqrt(10)` is the self-similarity property applied to a portfolio's P&L. It holds exactly for a driftless Brownian motion and only approximately for anything real — the assumption that breaks first is independence of increments, since volatility clusters.

**Simulation.** Because increments are exactly Gaussian and independent, a Brownian path can be sampled on any grid with **no discretisation error**. This is unusual and valuable: contrast with the schemes needed for general [SDEs](/stochastic-calculus/sdes).

**Volatility estimation.** Quadratic variation is the theoretical object that realised-volatility estimators target. Summing squared five-minute returns over a day converges to the day's integrated variance as sampling gets finer — until microstructure noise takes over and the estimator diverges instead, which is why practitioners sample at five minutes rather than every tick.

---

#### Assumptions and Failure Modes

- **Independent increments.** Real returns show near-zero autocorrelation in the mean but strong autocorrelation in squared returns. Volatility clustering is a direct violation, and it breaks `sqrt(T)` scaling of risk.
- **Gaussian increments.** Empirical return distributions have heavier tails than the normal at every frequency, most severely at short horizons. Brownian motion assigns implausibly small probability to five-sigma days.
- **Constant variance rate.** Standard Brownian motion has a fixed variance rate of 1 per unit time. Stochastic-volatility and time-change models exist precisely because this fails.
- **Continuity.** Excludes gaps, halts, and default events by construction.
- **Infinite variation.** A mathematical artefact with real consequences: any strategy requiring continuous rebalancing has infinite turnover, so continuous-time hedging arguments are limits that transaction costs never reach. See [Delta Hedging](/derivatives/delta-hedging).
- **The scaling limit is asymptotic.** Donsker's invariance principle says a rescaled random walk converges to Brownian motion, but the convergence is in distribution over the whole path and says nothing about the accuracy of the approximation at any fixed sample size.

---

#### Code

```python
import numpy as np

def brownian_path(n_steps, horizon=1.0, n_paths=1, seed=None):
    """Exact simulation of standard Brownian motion on a uniform grid.

    Exact, not approximate: increments are genuinely N(0, dt) and
    independent, so refining the grid adds detail without reducing error.
    """
    rng = np.random.default_rng(seed)
    dt = horizon / n_steps
    increments = rng.normal(0.0, np.sqrt(dt), size=(n_paths, n_steps))
    path = np.cumsum(increments, axis=1)
    return np.concatenate([np.zeros((n_paths, 1)), path], axis=1)


def variation_check(path, power):
    """Sum of |increment|^power. power=1 diverges as the grid refines,
    power=2 converges to the horizon T."""
    return (np.abs(np.diff(path)) ** power).sum()
```

---

#### See Also

* [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations)
* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [Stochastic Differential Equations](/stochastic-calculus/sdes)
* [Random Walks](/quant-math/random-walks)
* [Geometric Brownian Motion](/quant-math/gbm)
* [Volatility](/quant-math/volatility)

---

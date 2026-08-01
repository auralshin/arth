### Numerical Schemes for SDEs

> info **Metadata** Level: Advanced | Prerequisites: SDEs, Itô's Lemma, Sampling | Tags: euler-maruyama, milstein, monte-carlo, discretisation, variance-reduction

Most stochastic differential equations have no closed-form solution, so they are solved by stepping forward on a discrete grid. The scheme that does the stepping introduces an error that is systematic, not random: it does not shrink when you add paths. Running ten million paths on a twelve-step grid buys you a very precise estimate of the wrong number.

There are two error budgets to manage, and they respond to different levers. **Discretisation bias** shrinks by refining the time grid. **Monte Carlo error** shrinks by adding paths, at the slow rate `1/sqrt(M)`. Getting both under control efficiently is what the material below is about, and the single most valuable move — where it is available — is to avoid discretisation entirely.

---

#### Formal Definition

For the scalar SDE `dX = a(t, X) dt + b(t, X) dW` on a uniform grid with step `h`, and independent standard normal draws `Z_n`:

**Euler-Maruyama:**

```text
X_{n+1} = X_n + a(t_n, X_n)*h + b(t_n, X_n)*sqrt(h)*Z_n
```

**Milstein:**

```text
X_{n+1} = X_n + a*h + b*sqrt(h)*Z_n + 0.5*b*(db/dx)*h*(Z_n^2 - 1)
```

where `db/dx` is the derivative of the diffusion coefficient in the state variable, evaluated at `(t_n, X_n)`. The extra term comes from carrying the Itô-Taylor expansion one order further, and its expectation is zero because `E[Z^2 - 1] = 0` — it corrects the path, not the mean.

Two notions of accuracy, and they are genuinely different:

<table>
  <tbody>
    <tr>
      <td><strong>Notion</strong></td><td><strong>Definition</strong></td><td><strong>What it controls</strong></td>
    </tr>
    <tr>
      <td>Strong order gamma</td><td>E|X_T - X_T^h| at most C*h^gamma</td><td>Pathwise accuracy: barriers, Asians, lookbacks, multilevel Monte Carlo</td>
    </tr>
    <tr>
      <td>Weak order beta</td><td>|E[g(X_T)] - E[g(X_T^h)]| at most C*h^beta, for smooth g</td><td>Distributional accuracy: European payoffs, moments, most vanilla pricing</td>
    </tr>
  </tbody>
</table>

<table>
  <tbody>
    <tr><td><strong>Scheme</strong></td><td><strong>Strong order</strong></td><td><strong>Weak order</strong></td><td><strong>Cost per step</strong></td></tr>
    <tr><td>Euler-Maruyama</td><td>0.5</td><td>1.0</td><td>One normal draw</td></tr>
    <tr><td>Milstein</td><td>1.0</td><td>1.0</td><td>One normal draw plus db/dx</td></tr>
    <tr><td>Weak order-2 Taylor</td><td>1.0</td><td>2.0</td><td>Higher derivatives, or extra draws</td></tr>
  </tbody>
</table>

Euler's strong order of `0.5` is the awkward one: halving the step improves pathwise accuracy by only about 30%. Milstein fixes this for free in one dimension. In several dimensions it is no longer free, because the correction involves Lévy areas — iterated integrals of one Brownian motion against another — which have no simple simulation.

> info **Milstein and Euler coincide for additive noise** If `b` does not depend on the state, `db/dx = 0` and the two schemes are identical. Bachelier and Ornstein-Uhlenbeck dynamics get strong order 1.0 from plain Euler.

---

#### Worked Example: Measuring the Bias

Take `dS = mu*S dt + sigma*S dW` with `mu = 0`, `sigma = 0.40`, `S_0 = 100`, `T = 1`, and price the payoff `g(S_T) = S_T^2` — chosen because both the exact answer and the Euler answer are computable in closed form, so the bias can be isolated from Monte Carlo noise entirely.

**Exact.** From the lognormal solution, `E[S_T^2] = S_0^2 * exp((2*mu + sigma^2)*T) = 10000*exp(0.16) = 11735.11`.

**Euler.** With `S_{n+1} = S_n*(1 + mu*h + sigma*sqrt(h)*Z)` and `Z` independent of `S_n`:

```text
E[S_{n+1}^2] = E[S_n^2] * ( (1 + mu*h)^2 + sigma^2*h )
```

so after `N = T/h` steps, `E[S_N^2] = S_0^2 * ((1 + mu*h)^2 + sigma^2*h)^N`. With `mu = 0` this is `10000 * (1 + 0.16*h)^N`.

<table>
  <tbody>
    <tr><td><strong>Steps N</strong></td><td><strong>Step h</strong></td><td><strong>Euler E[S_T^2]</strong></td><td><strong>Relative bias</strong></td><td><strong>Bias ratio vs previous</strong></td></tr>
    <tr><td>4</td><td>0.2500</td><td>11698.59</td><td>-0.311%</td><td>&mdash;</td></tr>
    <tr><td>12</td><td>0.0833</td><td>11722.71</td><td>-0.106%</td><td>2.95</td></tr>
    <tr><td>48</td><td>0.0208</td><td>11731.99</td><td>-0.027%</td><td>3.97</td></tr>
    <tr><td>&mdash;</td><td>0 (exact)</td><td>11735.11</td><td>0</td><td>&mdash;</td></tr>
  </tbody>
</table>

Tripling the number of steps cut the bias by a factor of 2.95; quadrupling it cut the bias by 3.97. That is weak order 1 measured directly: bias falls in proportion to `h`.

Now the comparison that matters. `S_T^2` is lognormal with log-standard-deviation `2*sigma*sqrt(T) = 0.8`, so its coefficient of variation is `sqrt(exp(0.64) - 1) = 0.947`. The relative standard error from `M` paths is therefore about `0.947/sqrt(M)`. Setting that equal to the `N = 12` bias of 0.106% gives `M` of order 800,000. Beyond that point every extra path is wasted effort: the estimate converges ever more tightly onto a number that is 0.1% wrong.

**And for this equation, all of it is avoidable.** Itô's lemma gives the exact SDE for `ln S`, whose coefficients are constants, so the exact transition law is available:

```text
S_{n+1} = S_n * exp( (mu - 0.5*sigma^2)*h + sigma*sqrt(h)*Z )
```

This is not a scheme; it samples the true distribution at every grid point. Zero discretisation bias at any step size. The same is true of Ornstein-Uhlenbeck and Vasicek dynamics, and of CIR via its non-central chi-squared transition. **Check for an exact transition law before reaching for a scheme.**

---

#### Where Schemes Break: Square-Root Diffusions

Euler applied to CIR, `dv = kappa*(theta - v) dt + xi*sqrt(v) dW`, produces negative values whenever the shock is large enough, and the next step then takes the square root of a negative number. Every practical fix is a modification of the scheme rather than a repair after the fact:

- **Absorption**: replace `v` by `max(v, 0)` in both the drift and the diffusion. Simple, and it biases variance downward.
- **Full truncation**: keep `v` as it is in the drift but use `max(v, 0)` inside the square root. Empirically the least biased of the simple fixes.
- **Reflection**: use `|v|`. Introduces a systematic upward bias in the variance.
- **Andersen's QE scheme**: moment-match the true conditional distribution with a quadratic-exponential approximation. Far more accurate near the zero boundary, and standard for Heston.

The general lesson: when the diffusion coefficient is not Lipschitz, the classical order results do not apply. Euler's strong order for CIR degrades, and no amount of step refinement recovers order 0.5 uniformly across parameters.

---

#### Variance Reduction

Monte Carlo error is `s/sqrt(M)`, so buying a factor of two in accuracy costs a factor of four in paths. Reducing `s` instead is usually cheaper.

- **Antithetic variates.** Run each path twice, once with `Z` and once with `-Z`. Helps when the payoff is close to monotone in the driving noise; useless or slightly harmful for symmetric payoffs like a straddle, where the two legs are positively correlated.
- **Control variates.** Subtract a correlated quantity with known expectation: `Y_cv = Y - c*(X - E[X])`. At the optimal `c` the variance falls by the factor `1 - rho^2`. With `rho = 0.95` that is a factor of 0.0975 — the same accuracy from 10.3 times fewer paths, or a 3.2-fold reduction in standard error at fixed cost. Classic pairings: the underlying itself for a European payoff, and the geometric-average Asian (which has a closed form) for the arithmetic-average Asian.
- **Common random numbers.** Reuse the same draws across bumped parameter values when computing Greeks by finite difference. Without this the difference of two independent noisy estimates is dominated by noise; with it, most of the noise cancels. See [Greeks](/derivatives/greeks).
- **Importance sampling.** Shift the drift so paths land where the payoff is non-zero, then reweight by the [Radon-Nikodym derivative](/stochastic-calculus/change-of-measure). Essential for deep out-of-the-money options and tail-risk estimates, where the crude estimator gets a non-zero payoff on a tiny fraction of paths.
- **Quasi-Monte Carlo and multilevel methods.** Low-discrepancy sequences such as Sobol approach `1/M` convergence in favourable cases, but need a Brownian bridge or principal-component construction so the leading dimensions carry most of the variance. Multilevel Monte Carlo combines many cheap coarse-grid paths with few fine-grid ones, and is the reason strong convergence order matters even for European payoffs.

> warning **Bias and noise are not interchangeable** A tight confidence interval says nothing about discretisation bias, because the bias is identical on every path. Report both: halve the step size and re-run, and if the answer moves by more than the confidence interval, the grid is the binding constraint, not the path count.

---

#### Where This Is Used

**Exotic pricing.** Anything without a closed form — path-dependent payoffs, baskets, multi-factor hybrids — is priced by simulation, and the scheme is a first-order determinant of accuracy.

**Counterparty and market risk.** Exposure profiles over hundreds of future dates are simulated on coarse grids for cost reasons, so bias control matters more here than in front-office pricing and is more often neglected.

**Model validation and backtesting.** Simulating a model with a known closed-form price and checking convergence to it is the standard first test of an implementation; divergence usually means the scheme, not the model. Synthetic paths used to stress-test a strategy inherit the scheme's bias in exactly the quantities — path maxima, barrier crossings, drawdowns — that strong convergence governs. See [Scenarios](/simulation/scenarios).

---

#### Assumptions and Failure Modes

- **Order results assume smooth coefficients.** Published strong and weak orders require Lipschitz and growth conditions on `a` and `b`. Square-root and other Hölder diffusions do not qualify and converge more slowly.
- **Weak order assumes a smooth payoff.** The order-1 weak result for Euler is proved for sufficiently smooth `g`. Digital payoffs are discontinuous and barrier payoffs depend on the path supremum; both converge more slowly, barriers typically at order `0.5` in `h` because the discrete maximum systematically understates the continuous one. Brownian bridge corrections address this directly.
- **Uniform grids assume nothing special happens between nodes.** Dividend, coupon, and barrier monitoring dates must be grid points, or the scheme silently misses them.
- **Random number quality.** Correlated or short-period generators inject structure that looks like signal. Use a modern generator and seed reproducibly.
- **Variance reduction can backfire.** Antithetics increase variance for payoffs symmetric in the noise, and a control-variate coefficient estimated on the same paths adds bias. Quasi-Monte Carlo has no honest error bar at all — Sobol points are deterministic, so an estimate of the error needs randomised QMC with several independent scrambles.

---

#### Code

```python
import numpy as np

def euler_maruyama(drift, diffusion, x0, horizon, n_steps, n_paths, seed=None):
    rng = np.random.default_rng(seed)
    h = horizon / n_steps
    x = np.full(n_paths, float(x0))
    for step in range(n_steps):
        z = rng.standard_normal(n_paths)
        t = step * h
        x = x + drift(t, x) * h + diffusion(t, x) * np.sqrt(h) * z
    return x


def milstein(drift, diffusion, diffusion_prime, x0, horizon, n_steps, n_paths, seed=None):
    """Adds the Ito-Taylor term, lifting strong order from 0.5 to 1.0.

    Valid in one dimension only: the multi-dimensional correction needs
    Levy areas, which have no cheap exact simulation.
    """
    rng = np.random.default_rng(seed)
    h = horizon / n_steps
    x = np.full(n_paths, float(x0))
    for step in range(n_steps):
        z = rng.standard_normal(n_paths)
        t = step * h
        b = diffusion(t, x)
        x = (x + drift(t, x) * h + b * np.sqrt(h) * z
             + 0.5 * b * diffusion_prime(t, x) * h * (z**2 - 1.0))
    return x


def gbm_exact(s0, mu, sigma, horizon, n_paths, seed=None):
    """No scheme, no bias: samples the true lognormal transition law."""
    rng = np.random.default_rng(seed)
    z = rng.standard_normal(n_paths)
    return s0 * np.exp((mu - 0.5 * sigma**2) * horizon
                       + sigma * np.sqrt(horizon) * z)
```

---

#### See Also

* [Stochastic Differential Equations](/stochastic-calculus/sdes)
* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [Feynman-Kac](/stochastic-calculus/feynman-kac)
* [Scenarios](/simulation/scenarios)
* [Sampling](/quant-math/sampling)

---

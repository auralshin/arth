### Ornstein-Uhlenbeck Process

> info **Metadata** Level: Advanced | Prerequisites: SDEs, Itô's Lemma, Stationarity | Tags: ornstein-uhlenbeck, mean-reversion, vasicek, half-life, pairs-trading, calibration

The Ornstein-Uhlenbeck process is Brownian motion with a spring attached. A restoring force pulls the state back towards a long-run level at a speed proportional to how far away it currently is, while noise keeps pushing it off. The result is the standard continuous-time model of anything that wanders but does not run away: a spread between two related instruments, a short interest rate, a commodity's log price around its cost of carry, a variance level.

It earns its place through tractability. The transition density is exactly Gaussian, the stationary distribution is available in closed form, the discretely sampled process is exactly an AR(1) — so calibration is a linear regression — and simulation requires no discretisation scheme. Almost every quantitative statement one wants to make about mean reversion can be made exactly for this process, which is why it is the reference model even where it is visibly not the truth.

---

#### Formal Definition

```text
dX_t = kappa * (theta - X_t) * dt + sigma * dW_t
```

where:

- `kappa` is the **speed of mean reversion**, in units of 1/time, strictly positive
- `theta` is the **long-run mean level** the process reverts to
- `sigma` is the **instantaneous volatility**, in the same units as `X` per square root of time
- `W` is a standard [Brownian motion](/stochastic-calculus/brownian-motion)

The drift is negative when `X` is above `theta` and positive when below, always pointing home. The diffusion is constant — it does not depend on the state — which makes the noise additive and the process Gaussian.

**Closed-form solution.** Multiply by the integrating factor `exp(kappa*t)` and apply the product rule:

```text
d( exp(kappa*t) * X_t ) = exp(kappa*t) * ( dX_t + kappa*X_t dt )
                        = exp(kappa*t) * ( kappa*theta dt + sigma dW_t )
```

Integrating from `s` to `t` and dividing back through:

```text
X_t = theta + (X_s - theta)*exp(-kappa*(t-s))
      + sigma * Int from s to t of exp(-kappa*(t-u)) dW_u
```

The stochastic integral has a deterministic integrand, so it is Gaussian with mean zero, and its variance follows from the Itô isometry. The conditional law is therefore exactly normal:

```text
E[X_t | X_s]   = theta + (X_s - theta)*exp(-kappa*(t-s))
Var(X_t | X_s) = (sigma^2 / (2*kappa)) * ( 1 - exp(-2*kappa*(t-s)) )
```

**Stationary distribution.** Let the horizon grow and the initial condition is forgotten:

```text
X_infinity ~ N( theta,  sigma^2 / (2*kappa) )
```

**Autocorrelation.** In the stationary regime, `Corr(X_t, X_{t+h}) = exp(-kappa*h)` — pure exponential decay, with no memory beyond the single parameter. See [Autocorrelation](/quant-math/autocorrelation).

**Half-life.** The time for a deviation to decay to half its size, from setting `exp(-kappa*h) = 0.5`:

```text
t_half = ln(2) / kappa
```

This is the number practitioners quote, because it is interpretable in a way that `kappa` is not.

> info **A uniqueness result** Up to scaling and time shift, the Ornstein-Uhlenbeck process is the only stationary Gaussian Markov process with continuous paths (Doob, 1942). If you want mean reversion, Gaussianity, and the Markov property together, there is no other choice to make.

---

#### Worked Example: A Mean-Reverting Spread

A spread between two related instruments is modelled with `kappa = 12` per annum, `theta = 0`, and `sigma = 0.25` per annum. Today the spread sits at 0.15.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Formula</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Half-life</td><td>ln(2)/12 years</td><td>0.0578 yr = 14.6 trading days</td></tr>
    <tr><td>Stationary sd</td><td>sqrt(0.25^2 / (2*12)) = sqrt(0.0026042)</td><td>0.0510</td></tr>
    <tr><td>Current deviation</td><td>0.15 / 0.0510</td><td>2.94 stationary sd</td></tr>
  </tbody>
</table>

Now ask what the spread looks like in ten trading days, `h = 10/252 = 0.03968` years.

1. **Decay factor**: `exp(-12*0.03968) = exp(-0.4762) = 0.6211`.
2. **Conditional mean**: `0 + 0.15*0.6211 = 0.0932`. The spread is expected to have closed only 38% of the way, not most of the way.
3. **Conditional variance**: `(0.0026042)*(1 - exp(-0.9524)) = 0.0026042*0.6142 = 0.0015994`, so conditional sd `= 0.0400`.
4. **Ninety-five per cent interval**: `0.0932 +/- 1.96*0.0400`, that is `[0.0148, 0.1716]`.
5. **Probability the spread has crossed zero**: `Phi(-0.0932/0.0400) = Phi(-2.33) = 0.99%`.

The lesson in step 5 is the one most often missed. A spread nearly three standard deviations from its mean has about a **one per cent** chance of being back through zero in ten days, because ten days is well under one half-life. Mean reversion is a statement about the drift, not a promise of a snap-back, and position sizing that assumes otherwise is sizing against a distribution the model does not have. See [Mean Reversion](/quant-math/mean-reversion) and [Pairs Trading](/strategies/pairs).

---

#### Calibration

Sample the exact solution at a fixed interval `dt`. The result is exactly an AR(1) model:

```text
X_{n+1} = c + phi * X_n + e_{n+1},      e ~ iid N(0, s_e^2)

phi   = exp(-kappa*dt)
c     = theta * (1 - phi)
s_e^2 = sigma^2 * (1 - phi^2) / (2*kappa)
```

Because the discretisation is exact, ordinary least squares of `X_{n+1}` on `X_n` is a valid estimator — no scheme error to worry about — and the parameters invert directly:

```text
kappa = -ln(phi) / dt
theta = c / (1 - phi)
sigma = s_e * sqrt( 2*kappa / (1 - phi^2) )
t_half = ln(2) / kappa = ln(2) * dt / (-ln(phi))
```

**Worked calibration.** Daily observations, `dt = 1/252`. Suppose OLS returns `phi = 0.9524`, `c = 0.00238`, and residual standard deviation `s_e = 0.0080`.

1. `-ln(0.9524) = 0.048770`, so `kappa = 0.048770 * 252 = 12.29` per annum.
2. `t_half = 0.693147 / 0.048770 = 14.21` days. (Working in days directly avoids the annualisation round-trip.)
3. `theta = 0.00238 / (1 - 0.9524) = 0.00238 / 0.0476 = 0.0500`.
4. `1 - phi^2 = 1 - 0.90707 = 0.09293`, so `sigma = 0.0080 * sqrt(2*12.29 / 0.09293) = 0.0080 * 16.26 = 0.1301` per annum.
5. **Cross-check the stationary spread.** From the AR(1) side, `sd = s_e / sqrt(1 - phi^2) = 0.0080 / 0.30485 = 0.02624`. From the continuous side, `sigma / sqrt(2*kappa) = 0.1301 / 4.958 = 0.02624`. They agree, which is the check to run on any implementation.

> warning **OLS understates the half-life** The least-squares estimate of an autoregressive coefficient is biased downward in finite samples, by roughly `(1 + 3*phi)/n`. With `phi = 0.9524` and `n = 500` observations that is about 0.0077, giving an estimate near 0.9447 and an implied half-life of 12.2 days rather than 14.2 — a 14% understatement, and it grows as `phi` approaches 1. The bias always makes mean reversion look faster and more reliable than it is. Bootstrap or bias-correct before trusting a half-life estimated on a short sample.

---

#### Variants and Relatives

- **Vasicek.** The same equation applied to the short rate. Zero-coupon bonds have a closed form, `P(t,T) = A(t,T)*exp(-B(t,T)*r_t)` with `B(t,T) = (1 - exp(-kappa*(T-t)))/kappa` and `A` an explicit function of the parameters. Its defining weakness is that rates are Gaussian and can go negative — a disqualifying flaw before 2014 and a useful feature afterwards. **Hull-White** makes `theta` a deterministic function of time so the model reproduces today's yield curve exactly, while staying Gaussian and tractable.
- **Cox-Ingersoll-Ross.** Replace `sigma` with `sigma*sqrt(r)`. Rates stay non-negative, and stay strictly positive when the Feller condition `2*kappa*theta` at least `sigma^2` holds. The price is a non-central chi-squared transition instead of a Gaussian one, and a diffusion coefficient that is not Lipschitz — see [SDEs](/stochastic-calculus/sdes). The variance process in a Heston model is exactly this.
- **Exponential OU (Schwartz).** Let `ln(S)` follow an Ornstein-Uhlenbeck process. Standard for commodities, where the level reverts towards a cost-of-production anchor but cannot go negative.

---

#### Where This Is Used

**Relative-value trading.** Fitting an Ornstein-Uhlenbeck model to a cointegrating residual turns "these two things move together" into a half-life, an equilibrium level, and a dispersion — the three inputs a horizon and a stop need. Establishing that the residual is stationary in the first place is a separate exercise; see [Cointegration](/stat-methods/cointegration) and [Unit Roots](/stat-methods/unit-roots).

**Rates and volatility.** Vasicek and Hull-White remain workhorses for short-rate modelling where analytic tractability outweighs realism. Realised variance also reverts, and mean-reverting variance is why implied-volatility term structures slope up from a low spot level and down from a high one. See [Vol Term Structure](/derivatives/vol-term-structure).

**Simulation.** Because the transition is exactly Gaussian, paths can be generated with **no discretisation bias** at any step size. That makes the Ornstein-Uhlenbeck process a useful test case for validating a general-purpose scheme: the exact answer is available for comparison.

---

#### Assumptions and Failure Modes

- **Constant parameters.** Reversion speed is regime-dependent. A spread can mean-revert for two years and then trend for six months because the economic link broke — the model has no mechanism to express that, so the fitted `kappa` simply degrades.
- **Gaussian shocks.** Additive normal noise assigns negligible probability to the gap that actually causes losses. Spread strategies are short the tails, and this specification cannot see them.
- **Stationarity is assumed, not tested.** Fitting an Ornstein-Uhlenbeck model to a series with a unit root produces a large estimated half-life and a plausible-looking `theta`. Test for stationarity first; the model cannot tell you it is inapplicable.
- **Estimation bias.** OLS understates the half-life, as above. Separately, `theta` is the hardest parameter to pin down: its standard error depends on the calendar span relative to the half-life, so a sample spanning fewer than several half-lives cannot locate the mean at all. And if `theta` is itself drifting, modelling it as constant produces persistent one-sided residuals that look like a signal and are a specification error.
- **Half-life is not a holding period.** At one half-life you have closed half the gap *on average*, with substantial dispersion around it. Sizing to the mean forecast ignores that the model provides a conditional distribution, not a trajectory.

---

#### Code

```python
import numpy as np

def simulate_ou(kappa, theta, sigma, x0, dt, n_steps, n_paths=1, seed=None):
    """Exact simulation: the transition is Gaussian, so no scheme is needed.
    Any step size gives the true law, unlike Euler-Maruyama."""
    rng = np.random.default_rng(seed)
    decay = np.exp(-kappa * dt)
    step_sd = np.sqrt(sigma**2 * (1 - decay**2) / (2 * kappa))
    path = np.empty((n_paths, n_steps + 1))
    path[:, 0] = x0
    for n in range(n_steps):
        path[:, n + 1] = (theta + (path[:, n] - theta) * decay
                          + rng.standard_normal(n_paths) * step_sd)
    return path


def calibrate_ou(series, dt):
    """OLS on the exact AR(1) representation: kappa, theta, sigma, half-life.

    phi is biased low in short samples, so the half-life returned here is
    biased short. Bootstrap the residuals before quoting it.
    """
    x, y = series[:-1], series[1:]
    phi, intercept = np.polyfit(x, y, 1)
    residual_sd = (y - (intercept + phi * x)).std(ddof=2)
    kappa = -np.log(phi) / dt
    return (kappa, intercept / (1 - phi),
            residual_sd * np.sqrt(2 * kappa / (1 - phi**2)), np.log(2) / kappa)
```

---

#### See Also

* [Stochastic Differential Equations](/stochastic-calculus/sdes)
* [Numerical Schemes](/stochastic-calculus/numerical-schemes)
* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [Mean Reversion](/quant-math/mean-reversion)
* [Cointegration](/stat-methods/cointegration)
* [Pairs Trading](/strategies/pairs)
* [Stationarity](/quant-math/stationarity)

---

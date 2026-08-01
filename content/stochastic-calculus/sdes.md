### Stochastic Differential Equations

> info **Metadata** Level: Advanced | Prerequisites: Brownian Motion, Itô's Lemma, Calculus | Tags: sde, drift, diffusion, existence-uniqueness, models

A stochastic differential equation specifies a process by saying how it moves over the next instant: a deterministic push (the **drift**) plus a random shock scaled by a state-dependent size (the **diffusion**). Almost every continuous-time model in finance is one line of this form, and the modelling work consists entirely of choosing those two functions.

The choice matters more than it first appears. The drift controls where the process is heading; the diffusion controls the shape of the distribution — whether the process can go negative, how fat the tails are, and whether volatility scales with the level. Two models with identical expected value can imply completely different probabilities for the outcomes anyone actually cares about.

---

#### Formal Definition

An SDE in one dimension is written

```text
dX_t = a(t, X_t) dt + b(t, X_t) dW_t,      X_0 = x_0
```

but the differential notation is shorthand. The actual mathematical content is the integral equation

```text
X_t = x_0 + Int from 0 to t of a(s, X_s) ds + Int from 0 to t of b(s, X_s) dW_s
```

where:

- `a(t, x)` is the **drift coefficient** — the instantaneous conditional mean rate, `E[dX_t | F_t] = a(t, X_t) dt`
- `b(t, x)` is the **diffusion coefficient** — the instantaneous conditional volatility, `Var(dX_t | F_t) = b(t, X_t)^2 dt`
- `W` is a standard [Brownian motion](/stochastic-calculus/brownian-motion) generating the filtration
- `x_0` is the initial condition, possibly random but independent of `W`

The first integral is an ordinary pathwise Lebesgue integral; the second is an Itô integral. There is no `dW/dt` anywhere, because Brownian paths are nowhere differentiable — the differential form never stands on its own.

Because the coefficients depend on the current state only, solutions are Markov processes: the conditional law of the future depends on the present value alone, not on the path that produced it.

---

#### Strong versus Weak Solutions

The distinction is about what you are given and what you must produce.

A **strong solution** is a process `X` adapted to the filtration of a *pre-specified* Brownian motion `W` on a *pre-specified* probability space, satisfying the integral equation almost surely. You are handed the noise and must produce the path. Strong solutions are what simulation needs: feeding the same random numbers into the same equation must produce the same path.

A **weak solution** is a triple — a probability space, some Brownian motion, and a process — such that the equation holds. You get to construct the noise to fit. Only the **law** of `X` is determined, not its path as a function of a given `W`.

Strong implies weak. The converse fails: Tanaka's equation `dX = sign(X) dW` has weak solutions (any Brownian motion works) but no strong solution, because the sign function is too discontinuous to be reconstructed from the driving noise. For pricing, weak uniqueness is usually enough, since prices are expectations and expectations depend only on the law. For path-dependent hedging simulation and for variance reduction with common random numbers, you want strong solutions.

---

#### Existence and Uniqueness

The standard theorem (Itô) gives sufficient conditions:

```text
Lipschitz:     |a(t,x) - a(t,y)| + |b(t,x) - b(t,y)|  at most  K*|x - y|
Linear growth: |a(t,x)| + |b(t,x)|                    at most  K*(1 + |x|)
```

for a constant `K`, uniformly in `t` on `[0, T]`. Under these, a unique strong solution exists on `[0, T]`, is adapted and path-continuous, and satisfies `E[sup over t of X_t^2]` finite.

The two conditions do different jobs. **Lipschitz** gives uniqueness: two solutions started at the same point cannot separate, by a Grönwall argument. **Linear growth** prevents explosion: without it a solution can reach infinity in finite time, exactly as the ordinary equation `dx/dt = x^2` does.

Several standard finance models violate the Lipschitz condition, and this is not an edge case:

- The **CIR** diffusion `b(x) = sigma*sqrt(x)` has unbounded derivative at zero, so it is Hölder-1/2 rather than Lipschitz.
- **CEV** with `beta` below 1 has the same problem at zero.

For scalar equations the Yamada-Watanabe conditions rescue these: Lipschitz drift plus a diffusion coefficient that is Hölder continuous of order `1/2` is enough for pathwise uniqueness. This is precisely why the square-root specification is used rather than, say, an exponent of `1/4`.

> warning **Uniqueness does not imply the model is well posed for you** CIR has a unique solution for any parameters, but whether the process can *reach* zero depends on the Feller condition `2*kappa*theta` being at least `sigma^2`. Below that threshold zero is attainable, and any numerical scheme that takes a square root will fail there. Existence theory and usable behaviour are different questions.

---

#### Worked Example: The Diffusion Coefficient Decides the Tails

Two models for the same asset, both with zero drift and both calibrated to the same instantaneous volatility at `S_0 = 100` over one year.

<table>
  <tbody>
    <tr><td><strong>Model</strong></td><td><strong>SDE</strong></td><td><strong>Law of S_1</strong></td></tr>
    <tr><td>Bachelier (arithmetic)</td><td>dS = 30 dW</td><td>Normal, mean 100, sd 30</td></tr>
    <tr><td>Black-Scholes (geometric)</td><td>dS = 0.30 * S dW</td><td>Lognormal, log-mean -0.045, log-sd 0.30</td></tr>
  </tbody>
</table>

Both have `E[S_1] = 100`. Everything else differs.

1. **Probability of a negative price.** Bachelier: `P(S_1 below 0) = Phi(-100/30) = Phi(-3.33)`, about **0.043%**, roughly one path in 2,300. Geometric: exactly **zero**, since the diffusion vanishes as `S` approaches zero.
2. **1st percentile.** Bachelier: `100 - 2.326*30 = 30.21`. Geometric: `100*exp(-0.045 - 2.326*0.30) = 100*exp(-0.7429) = 47.57`.
3. **99th percentile.** Bachelier: `100 + 2.326*30 = 169.79`. Geometric: `100*exp(-0.045 + 0.6979) = 100*exp(0.6529) = 192.11`.
4. **Median.** Bachelier: 100. Geometric: `100*exp(-0.045) = 95.60`.

Same mean, same starting volatility, and a 1st percentile that differs by 17 points of price — 57% relative. The geometric model compresses the downside because volatility shrinks with the level, and stretches the upside because it grows. Neither is right in general; the question is which distortion is less wrong for the instrument in hand.

This is why Bachelier is the market convention for interest-rate options in low- and negative-rate regimes (the level can legitimately cross zero, and absolute rather than relative rate volatility is the stable quantity), while geometric dynamics remain the convention for equities and FX.

---

#### Common SDEs in Finance

<table>
  <tbody>
    <tr>
      <td><strong>Name</strong></td><td><strong>Equation</strong></td><td><strong>Marginal law</strong></td><td><strong>Typical use</strong></td>
    </tr>
    <tr>
      <td>Arithmetic Brownian (Bachelier)</td><td>dS = mu dt + sigma dW</td><td>Normal</td><td>Rates, spreads, quantities that may be negative</td>
    </tr>
    <tr>
      <td>Geometric Brownian</td><td>dS = mu*S dt + sigma*S dW</td><td>Lognormal</td><td>Equities, FX, the Black-Scholes world</td>
    </tr>
    <tr>
      <td>Ornstein-Uhlenbeck / Vasicek</td><td>dX = kappa*(theta - X) dt + sigma dW</td><td>Normal, stationary</td><td>Spreads, short rates, mean-reverting signals</td>
    </tr>
    <tr>
      <td>Cox-Ingersoll-Ross</td><td>dr = kappa*(theta - r) dt + sigma*sqrt(r) dW</td><td>Non-central chi-squared</td><td>Positive short rates, variance processes</td>
    </tr>
    <tr>
      <td>CEV</td><td>dS = mu*S dt + sigma*S^beta dW</td><td>No elementary form</td><td>Equity skew via level dependence of volatility</td>
    </tr>
    <tr>
      <td>Heston</td><td>dS = mu*S dt + sqrt(v)*S dW1; dv = kappa*(theta - v) dt + xi*sqrt(v) dW2</td><td>Semi-analytic via characteristic function</td><td>Volatility surfaces with smile and skew</td>
    </tr>
    <tr>
      <td>SABR</td><td>dF = alpha*F^beta dW1; d(alpha) = nu*alpha dW2</td><td>Asymptotic expansion</td><td>Interest-rate smile quoting</td>
    </tr>
    <tr>
      <td>Merton jump-diffusion</td><td>dS/S = (mu - lambda*k) dt + sigma dW + (J - 1) dN</td><td>Poisson mixture of lognormals</td><td>Gap risk, short-dated smile</td>
    </tr>
  </tbody>
</table>

In Heston and SABR the two Brownian motions are correlated, `d[W1, W2] = rho dt`; that correlation, not the volatility of volatility, is what generates skew. Merton's model leaves the diffusion framework entirely, so [Itô's lemma](/stochastic-calculus/ito-lemma) needs its jump extension — see [Jump Processes](/quant-math/jumps).

---

#### Where This Is Used

**Pricing and calibration.** An SDE under the risk-neutral measure plus [Feynman-Kac](/stochastic-calculus/feynman-kac) gives either a PDE to solve or an expectation to sample; which you pick is a computational decision, not a modelling one. Model choice itself is largely a choice of diffusion coefficient, made to reproduce an observed [volatility surface](/derivatives/vol-surface) — local-volatility models push this to its limit by choosing `b(t, S)` to fit every quoted option exactly.

**Risk.** Scenario generators for market-risk capital, counterparty exposure, and stress testing are systems of SDEs calibrated to historical rather than risk-neutral dynamics. The drift matters here in a way it does not for pricing.

**Signal modelling.** Fitting an Ornstein-Uhlenbeck process to a spread converts a vague statement about mean reversion into estimable parameters: a speed, a level, and a [half-life](/stochastic-calculus/ornstein-uhlenbeck).

---

#### Assumptions and Failure Modes

- **Markov structure.** State-dependent coefficients make the future depend only on the current value. Real markets carry path dependence — volatility clustering, positioning, inventory effects — which needs extra state variables to capture.
- **Constant parameters.** Estimated drift and diffusion are regime-dependent. Calibrating to a calm period and simulating into a stressed one understates risk in exactly the way that matters.
- **Continuity.** No diffusion model produces a gap. If gap risk is the exposure being measured, no amount of recalibration fixes it; the model class is wrong.
- **Drift is nearly unidentifiable.** The standard error of an estimated drift falls with the calendar span of the sample, not the sampling frequency, so decades of data are needed to estimate `mu` even loosely. Diffusion is the opposite: high-frequency data pins it down quickly. See [Sampling](/quant-math/sampling).
- **Lipschitz violations are silent.** Square-root diffusions can go negative under a naive discretisation, producing a domain error or, worse, a plausible-looking wrong number. Handle it in the scheme, not by clipping afterwards.

---

#### Code

```python
import numpy as np

def simulate_sde(drift, diffusion, x0, horizon, n_steps, n_paths, seed=None):
    """Euler-Maruyama for dX = drift(t,X) dt + diffusion(t,X) dW.

    Generic and therefore biased: see the numerical-schemes page for
    when the discretisation error dominates the Monte Carlo error.
    """
    rng = np.random.default_rng(seed)
    dt = horizon / n_steps
    sqrt_dt = np.sqrt(dt)
    x = np.full(n_paths, float(x0))
    for step in range(n_steps):
        t = step * dt
        shock = rng.standard_normal(n_paths) * sqrt_dt
        x = x + drift(t, x) * dt + diffusion(t, x) * shock
    return x


# Geometric Brownian motion: diffusion vanishes at zero, so the
# boundary is unattainable and prices stay positive.
gbm_paths = simulate_sde(
    drift=lambda t, x: 0.05 * x,
    diffusion=lambda t, x: 0.20 * x,
    x0=100.0, horizon=1.0, n_steps=252, n_paths=10_000, seed=7,
)
```

---

#### See Also

* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [Numerical Schemes](/stochastic-calculus/numerical-schemes)
* [Ornstein-Uhlenbeck Process](/stochastic-calculus/ornstein-uhlenbeck)
* [Feynman-Kac](/stochastic-calculus/feynman-kac)
* [Geometric Brownian Motion](/quant-math/gbm)
* [Jump Processes](/quant-math/jumps)

---

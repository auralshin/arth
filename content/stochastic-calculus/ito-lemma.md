### Itô's Lemma

> info **Metadata** Level: Advanced | Prerequisites: Brownian Motion, Martingales & Filtrations, Calculus | Tags: ito-lemma, stochastic-calculus, chain-rule, quadratic-variation, black-scholes

Itô's lemma is the chain rule for functions of a stochastic process, and it is the single most-used result in derivative pricing. Ordinary calculus says that if `y = f(x)` then `dy = f'(x) dx`. That is wrong for a Brownian path, and wrong by an amount that does not vanish: an extra term `0.5 * f''(x) * (dx)^2` survives, because `(dW)^2` behaves like `dt` rather than like a negligible higher-order quantity.

Everything downstream depends on that surviving term. It produces the `-sigma^2/2` in the solution of [Geometric Brownian Motion](/quant-math/gbm), the gamma term in the [Black-Scholes](/derivatives/black-scholes) PDE, the convexity adjustment in rates, and the entire reason that an option's value changes when nothing but volatility does. If you understand only one page in this section, make it this one.

---

#### Formal Definition

Let `X` be an **Itô process** — a process with a drift part and a Brownian part:

```text
dX_t = a_t dt + b_t dW_t
```

where `a` and `b` are adapted processes satisfying enough integrability that the integrals exist. Let `f(t, x)` be continuously differentiable once in `t` and twice in `x` (class `C^{1,2}`). Then `Y_t = f(t, X_t)` is itself an Itô process, and

```text
dY_t = ( df/dt + a_t * df/dx + 0.5 * b_t^2 * d2f/dx2 ) dt  +  b_t * (df/dx) dW_t
```

where all partial derivatives are evaluated at `(t, X_t)`:

- `df/dt` is the partial derivative in time (theta, in options language)
- `df/dx` is the first derivative in the state variable (delta)
- `d2f/dx2` is the second derivative (gamma)
- `a_t` is the drift of `X`, `b_t` its diffusion coefficient

The term `0.5 * b^2 * d2f/dx2` has no counterpart in ordinary calculus. It is the **Itô correction**.

> warning **What is being glossed** The displayed identity is shorthand. The theorem is a statement about integrals: `f(t, X_t) - f(0, X_0)` equals the time integral of the drift bracket plus the Itô integral of `b * df/dx` against `W`, holding almost surely for all `t`. A full proof requires constructing the Itô integral as an `L^2` limit of simple predictable integrands, then a localisation argument to relax the integrability conditions. That construction is not reproduced here.

---

#### Why the Second-Order Term Survives

Take a Taylor expansion of `f` in both arguments:

```text
df = (df/dt) dt + (df/dx) dX + 0.5 (d2f/dx2) (dX)^2 + 0.5 (d2f/dt2) (dt)^2 + ... 
```

In ordinary calculus every term beyond the first order is discarded because `(dx)^2` is of order `(dt)^2` when `x` is differentiable in `t`. Here it is not. Squaring the increment and applying the multiplication table that the quadratic variation of [Brownian Motion](/stochastic-calculus/brownian-motion) forces:

```text
(dX)^2 = a^2 (dt)^2 + 2*a*b*dt*dW + b^2 (dW)^2

dt * dt = 0        dt * dW = 0        dW * dW = dt
```

The first two rules are the usual "higher order, discard it". The third is the whole story. Over a step of length `h`, `dW` has size roughly `sqrt(h)`, so `(dW)^2` has size roughly `h` — the same order as `dt`, not smaller. Summing `n = T/h` such terms gives `T`, not zero, which is exactly the statement that the path has finite non-zero quadratic variation.

So `(dX)^2` collapses to `b^2 dt`, and the second-order Taylor term contributes `0.5 * b^2 * (d2f/dx2) * dt` to the drift. Third-order terms genuinely do vanish, since `(dW)^3` is of order `h^{1.5}`.

The economic reading: a convex function of a volatile variable is worth more than the function of the average, by Jensen's inequality. Itô's lemma quantifies exactly how much more per unit time — `0.5 * gamma * variance rate`. That is why a long-gamma position earns from realised movement and pays theta for the privilege. See [Greeks](/derivatives/greeks).

---

#### Worked Example: log(S) Under Geometric Brownian Motion

This is the application to memorise. Let `S` follow

```text
dS = mu * S * dt + sigma * S * dW
```

so `a = mu*S` and `b = sigma*S`. Apply Itô to `f(S) = ln(S)`, which has no explicit time dependence:

1. **Derivatives**: `df/dt = 0`, `df/dS = 1/S`, `d2f/dS2 = -1/S^2`.
2. **Drift bracket**: `0 + (mu*S)*(1/S) + 0.5*(sigma*S)^2*(-1/S^2) = mu - 0.5*sigma^2`.
3. **Diffusion**: `(sigma*S)*(1/S) = sigma`.
4. **Result**:

```text
d(ln S) = (mu - 0.5*sigma^2) dt + sigma dW
```

The right-hand side has constant coefficients, so it integrates directly:

```text
ln(S_T) = ln(S_0) + (mu - 0.5*sigma^2)*T + sigma*W_T

S_T = S_0 * exp( (mu - 0.5*sigma^2)*T + sigma*W_T )
```

Note what happened: the drift of `ln S` is **not** `mu`. It is `mu` minus half the variance. Naive calculus would have given `d(ln S) = dS/S = mu dt + sigma dW`, which is wrong.

**Numbers.** Take `S_0 = 100`, `mu = 0.08`, `sigma = 0.30`, `T = 1` year.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Formula</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Mean log return</td><td>(mu - 0.5*sigma^2)*T = 0.08 - 0.045</td><td>0.035</td></tr>
    <tr><td>sd of log return</td><td>sigma*sqrt(T)</td><td>0.300</td></tr>
    <tr><td>Median price</td><td>100 * exp(0.035)</td><td>103.56</td></tr>
    <tr><td>Mean price</td><td>100 * exp(mu*T) = 100 * exp(0.08)</td><td>108.33</td></tr>
  </tbody>
</table>

The mean sits 4.6% above the median. Both are correct; they answer different questions. `E[S_T] = S_0*exp(mu*T)` because the lognormal expectation adds back `0.5*sigma^2*T` via `E[exp(sigma*W_T)] = exp(0.5*sigma^2*T)`, exactly cancelling the Itô correction.

The gap `0.5*sigma^2` is **volatility drag**: the difference between the arithmetic and the geometric mean growth rate. At 30% volatility it costs 4.5 percentage points of compound growth per year. At 60% volatility it costs 18 points, which is why a highly volatile asset can have a positive expected return and a typical path that loses money.

> info **A useful sanity check** If you ever derive a result where the drift of a log price equals the drift of the price, you have applied ordinary calculus to a stochastic process. The `-0.5*sigma^2` should always be there.

---

#### The Multi-Dimensional Case

For `f(t, X^1, ..., X^n)` with each `X^i` an Itô process driven by correlated Brownian motions:

```text
df = (df/dt) dt + sum_i (df/dx_i) dX^i + 0.5 * sum_i sum_j (d2f/dx_i dx_j) d[X^i, X^j]

with  d[X^i, X^j] = b_i * b_j * rho_ij * dt
```

The special case `f = x*y` gives the stochastic product rule, `d(X*Y) = X dY + Y dX + d[X, Y]` — ordinary calculus produces only the first two terms. The covariation terms are what generate cross-gamma in a multi-asset book: the P&L of a basket option depends on realised *correlation*, not just on realised volatilities, because the mixed second derivative multiplies the covariation.

---

#### From Itô to the Black-Scholes PDE

Let `V(t, S)` be the value of a derivative on `S`, which follows the GBM above. Itô gives

```text
dV = ( dV/dt + mu*S*(dV/dS) + 0.5*sigma^2*S^2*(d2V/dS2) ) dt + sigma*S*(dV/dS) dW
```

Form the portfolio `Pi = V - Delta*S` and choose `Delta = dV/dS`. The `dW` terms cancel exactly, leaving `dPi = (dV/dt + 0.5*sigma^2*S^2*(d2V/dS2)) dt`. The portfolio is now riskless over the instant, so no-arbitrage forces it to earn the risk-free rate, `dPi = r*Pi*dt`. Substituting `Pi = V - S*(dV/dS)` and rearranging:

```text
dV/dt + 0.5*sigma^2*S^2*(d2V/dS2) + r*S*(dV/dS) - r*V = 0
```

That is the Black-Scholes equation. Notice that `mu` has disappeared. The expected return of the underlying never enters, because it was cancelled by the hedge — the deepest consequence of Itô's lemma and the reason [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing) works at all.

Reading the PDE as a P&L statement makes it concrete: theta plus half gamma times variance equals the financing cost. A delta-hedged option position earns `0.5*gamma*S^2*(realised variance - implied variance)` over its life, which is the whole business of gamma trading.

---

#### Where This Is Used

**Pricing and risk.** Every closed-form option formula is obtained by applying Itô, cancelling the noise with a hedge, and solving the resulting PDE — or equivalently by [Feynman-Kac](/stochastic-calculus/feynman-kac). The same expansion converts a model of the underlying into a model of the derivative's exposures: delta, gamma, and vega are the coefficients that fall out.

**Rates.** Convexity adjustments — futures versus forwards, CMS pricing, quanto corrections — are all Itô correction terms in disguise. When a payoff is convex in a stochastic rate, the second-order term contributes value.

**Simulation.** Log-Euler simulation of GBM works because Itô gives the exact SDE satisfied by `ln S`, which has constant coefficients and hence an exact discretisation. See [Numerical Schemes](/stochastic-calculus/numerical-schemes).

---

#### Assumptions and Failure Modes

- **Requires `C^{1,2}` smoothness.** A digital payoff is not differentiable at the strike, and a barrier payoff is discontinuous. Itô does not apply directly at those points; the Itô-Tanaka formula and local time are needed, which is why digital and barrier hedges blow up near the barrier.
- **Requires continuous paths and finite quadratic variation.** If the underlying jumps, the correct statement adds a term `f(X + J) - f(X)` at each jump, and ignoring it systematically misprices convexity — see [Jump Processes](/quant-math/jumps). Processes with infinite quadratic variation, or with Hurst exponent away from `1/2`, need different machinery entirely.
- **Itô, not Stratonovich.** The Stratonovich integral obeys the ordinary chain rule and has no correction term, but its integrand is evaluated at the midpoint, so it peeks slightly into the future. Finance uses Itô because a hedge ratio must be set before the move. The two conventions give different-looking equations for the same physical process; mixing them silently is a real source of error.
- **Constant-coefficient results do not generalise.** The clean solution for GBM depends on `mu` and `sigma` being constants. With stochastic volatility the log price is no longer Gaussian and there is no elementary closed form.
- **Continuous hedging is a limit, not a strategy.** The PDE derivation rebalances continuously. Discrete rebalancing leaves a residual hedging error whose standard deviation shrinks only as `sqrt(rebalancing interval)`, while transaction costs grow as you rebalance more often.

---

#### Code

```python
import numpy as np

def ito_drift(f_t, f_x, f_xx, drift, diffusion):
    """Drift coefficient of f(t, X) when dX = drift*dt + diffusion*dW.

    The 0.5*diffusion^2*f_xx term is the entire difference from the
    ordinary chain rule.
    """
    return f_t + drift * f_x + 0.5 * diffusion**2 * f_xx


def gbm_log_check(s0=100.0, mu=0.08, sigma=0.30, horizon=1.0, n_paths=200_000, seed=0):
    """E[S_T] = S_0*exp(mu*T) even though the log drift is mu - sigma^2/2."""
    rng = np.random.default_rng(seed)
    z = rng.standard_normal(n_paths)
    terminal = s0 * np.exp((mu - 0.5 * sigma**2) * horizon
                           + sigma * np.sqrt(horizon) * z)
    return terminal.mean(), s0 * np.exp(mu * horizon), np.median(terminal)
```

---

#### See Also

* [Brownian Motion](/stochastic-calculus/brownian-motion)
* [Stochastic Differential Equations](/stochastic-calculus/sdes)
* [Feynman-Kac](/stochastic-calculus/feynman-kac)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [Black-Scholes](/derivatives/black-scholes)
* [Greeks](/derivatives/greeks)
* [Geometric Brownian Motion](/quant-math/gbm)

---

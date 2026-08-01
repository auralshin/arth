### Feynman-Kac

> info **Metadata** Level: Advanced | Prerequisites: Itô's Lemma, SDEs, Risk-Neutral Pricing | Tags: feynman-kac, pde, monte-carlo, kolmogorov, black-scholes

The Feynman-Kac formula is a dictionary between two apparently unrelated objects: the solution of a parabolic partial differential equation, and the expected value of a functional of a diffusion. Give it a PDE and it hands back an expectation you can sample. Give it an expectation and it hands back a PDE you can grid.

For derivatives this is the theorem that reconciles the two ways the subject is taught. Hedge-and-no-arbitrage gives the Black-Scholes PDE; risk-neutral valuation gives a discounted expectation. Feynman-Kac proves they are the same statement, and it tells you which computational route to take: PDE methods for low-dimensional problems with early exercise, Monte Carlo for high-dimensional problems without it.

---

#### Formal Definition

Let `X` solve the SDE

```text
dX_s = a(s, X_s) ds + b(s, X_s) dW_s
```

and suppose `u(t, x)` solves the terminal-value problem on `[0, T]`:

```text
du/dt + a(t,x)*(du/dx) + 0.5*b(t,x)^2*(d2u/dx2) - r(t,x)*u + f(t,x) = 0
u(T, x) = g(x)
```

Then, subject to regularity conditions stated below,

```text
u(t, x) = E[  D(t,T) * g(X_T)
            + Int from t to T of D(t,s) * f(s, X_s) ds   |  X_t = x ]

where  D(t,s) = exp( - Int from t to s of r(v, X_v) dv )
```

where:

- `g` is the **terminal payoff** — what the claim is worth at maturity
- `r(t, x)` is the **discount rate**, possibly state-dependent
- `f(t, x)` is a **running cash flow** — a dividend or coupon paid continuously
- `D(t, s)` is the stochastic discount factor along the path
- The expectation is over paths of `X` started at `x` at time `t`

With constant `r` and no running cash flow the statement reduces to the form used in pricing:

```text
u(t, x) = exp(-r*(T - t)) * E[ g(X_T) | X_t = x ]
```

Setting `r = 0` and `f = 0` gives the **Kolmogorov backward equation**, which describes how the expectation of any terminal function propagates backwards in time. The adjoint equation in the forward variable is the **Kolmogorov forward** (Fokker-Planck) equation, which propagates the transition density forwards; it is what Dupire's local-volatility formula inverts to read a diffusion coefficient off an option surface. See [Vol Surface](/derivatives/vol-surface).

---

#### Why It Is True

The proof is three lines of [Itô's lemma](/stochastic-calculus/ito-lemma) plus a martingale argument.

Define the discounted value process along a path, `Y_s = D(t,s) * u(s, X_s)`. The product rule and Itô give

```text
dY_s = D(t,s) * [ (du/dt + a*(du/dx) + 0.5*b^2*(d2u/dx2) - r*u) ds + b*(du/dx) dW_s ]
```

The bracket in the `ds` term is exactly the left-hand side of the PDE, which equals `-f`, so `dY_s = -D*f ds + D*b*(du/dx) dW_s`. Integrate from `t` to `T`, use `u(T, X_T) = g(X_T)`, and take expectations. If the stochastic integral is a true martingale its expectation is zero, and rearranging gives the formula.

> warning **What is being glossed** Two things. First, the martingale step needs `E[ Int (D*b*du/dx)^2 ds ]` to be finite; without it the stochastic integral is only a local martingale, its expectation need not be zero, and the identity can genuinely fail. Second, the theorem as stated assumes a classical solution `u` exists and is `C^{1,2}` — for non-smooth payoffs such as digitals, or degenerate diffusions, the correct statement is in terms of viscosity solutions. Neither point is developed here.

Note the direction of the logic: Feynman-Kac does **not** prove a solution exists. It says that *if* a suitably regular solution exists, it must equal that expectation. Existence comes from PDE theory separately.

---

#### Worked Example: Both Sides, Same Number

Take `dX = sigma dW` with `sigma = 0.20`, no discounting (`r = 0`), no running cash flow (`f = 0`), payoff `g(x) = x^2`, evaluated at `t = 0`, `x = 1`, `T = 4`. Small enough that both sides are computable by hand.

**PDE side.** With `a = 0` and `b = sigma`, the equation is `du/dt + 0.5*sigma^2*(d2u/dx2) = 0` with `u(T, x) = x^2`. Try `u(t, x) = x^2 + sigma^2*(T - t)`:

1. `du/dt = -sigma^2`
2. `d2u/dx2 = 2`
3. Substitute: `-sigma^2 + 0.5*sigma^2*2 = -sigma^2 + sigma^2 = 0`. The PDE holds.
4. At `t = T` the extra term vanishes, so `u(T, x) = x^2`. The terminal condition holds.

Numerically, `u(0, 1) = 1 + 0.04*4 = 1.16`.

**Probabilistic side.** `X_T` given `X_0 = 1` is `N(1, sigma^2*T) = N(1, 0.16)`. So

```text
E[X_T^2] = (E[X_T])^2 + Var(X_T) = 1 + 0.04*4 = 1.16
```

The two routes agree, and the agreement is not a coincidence of this example: the `sigma^2*(T - t)` term in the PDE solution *is* the accumulated variance, and the `0.5*b^2*(d2u/dx2)` term in the PDE *is* the Itô correction from the convexity of `x^2`. Convexity in the payoff and diffusion in the process are the same fact seen from two sides.

---

#### Black-Scholes as a Special Case

Under the risk-neutral measure the stock satisfies `dS = r*S ds + sigma*S dW~`, so `a(s, S) = r*S` and `b(s, S) = sigma*S`. Substituting into the Feynman-Kac PDE with discount rate `r` and no running cash flow:

```text
dV/dt + r*S*(dV/dS) + 0.5*sigma^2*S^2*(d2V/dS2) - r*V = 0,     V(T, S) = g(S)
```

That is the Black-Scholes equation, arrived at with no hedging argument at all — only a change of measure and this theorem. The same equation appears on the [Itô's Lemma](/stochastic-calculus/ito-lemma) page from the opposite direction, by constructing a riskless portfolio. Feynman-Kac is why both derivations land in the same place, and why `V_0 = exp(-r*T)*E_Q[g(S_T)]` is a theorem rather than a second assumption. For a call, `g(S) = max(S - K, 0)`, and the expectation integrates in closed form against the lognormal density to give the [Black-Scholes](/derivatives/black-scholes) formula.

---

#### Choosing PDE or Monte Carlo

Because both sides are equal, the choice is purely computational. The trade-off is dimension against path dependence.

<table>
  <tbody>
    <tr>
      <td><strong>Criterion</strong></td><td><strong>Finite-difference PDE</strong></td><td><strong>Monte Carlo</strong></td>
    </tr>
    <tr>
      <td>Cost in d state variables</td><td>Grows like N^d — practical to about 3</td><td>Essentially independent of d</td>
    </tr>
    <tr>
      <td>Convergence</td><td>Deterministic, order 1 or 2 in grid spacing</td><td>1/sqrt(paths), plus discretisation bias</td>
    </tr>
    <tr>
      <td>Early exercise</td><td>Natural: compare with intrinsic at every node</td><td>Hard: needs Longstaff-Schwartz regression</td>
    </tr>
    <tr>
      <td>Path-dependent payoffs</td><td>Needs an extra state variable per path feature</td><td>Natural: just record the path</td>
    </tr>
    <tr>
      <td>Greeks and error bars</td><td>Greeks free from the grid; no error bar without refining</td><td>Greeks need extra work; standard error is built in</td>
    </tr>
  </tbody>
</table>

The rule that follows: one or two factors with early exercise, use a PDE or a tree; four or more factors, or a payoff depending on the whole path, use Monte Carlo. An American basket option on ten names sits in the corner where neither is comfortable, which is why Longstaff-Schwartz exists.

---

#### Where This Is Used

**Pricing engines.** The choice of numerical method for a given product is a Feynman-Kac decision, made once at design time and then baked into the library.

**Surface construction.** Local-volatility calibration inverts the forward Kolmogorov equation to recover `b(t, S)` from a continuum of option prices — the same dictionary read in the other direction.

**Credit and risk.** First-passage default models compute survival probabilities as expectations of a diffusion hitting a boundary, equivalently as PDE solutions with an absorbing boundary condition — see [Merton Model](/credit/merton-model). The same machinery gives the probability of breaching a risk limit before a horizon, and where the state space is small the PDE returns the whole profile in one pass rather than one simulation per date.

---

#### Assumptions and Failure Modes

- **Regularity of the payoff.** The classical theorem needs a smooth enough `g`. Digital and barrier payoffs violate this, and the numerical consequences are real: PDE grids oscillate near a discontinuity unless the terminal condition is smoothed, and Monte Carlo convergence degrades.
- **Growth conditions.** The expectation must be finite. Payoffs growing faster than the diffusion's moments — a power payoff under a heavy-tailed model, say — can make the right-hand side infinite while the PDE still looks solvable.
- **Uniqueness needs boundary conditions.** On an unbounded domain the PDE has many solutions without a growth restriction. The probabilistic representation picks out one of them; a finite-difference implementation must impose artificial boundaries, and a bad choice contaminates the interior.
- **Local martingale problems.** If the discounted price is a strict local martingale, the stochastic integral in the proof has non-zero expectation and the PDE solution exceeds the expectation. Both are "correct" answers to different questions, and only one is the replication cost.
- **Markov structure required.** Path-dependent payoffs must be handled by augmenting the state — running maximum, running average — which is exactly what drives the dimension up and pushes you towards simulation.

---

#### Code

```python
import numpy as np

def bs_pde_explicit(strike, rate, sigma, maturity, n_space=400, n_time=20_000):
    """PDE side: European call by explicit finite differences in log-price.

    Log coordinates make the coefficients constant, so the stencil has no
    grid-index dependence. Explicit stepping is stable only for dt below
    roughly dy^2 / sigma^2 -- hence the large n_time.
    """
    y = np.linspace(np.log(strike) - 5.0, np.log(strike) + 5.0, n_space)
    dy, dt = y[1] - y[0], maturity / n_time
    assert dt < dy**2 / sigma**2, "explicit scheme unstable at this step size"
    drift, value = rate - 0.5 * sigma**2, np.maximum(np.exp(y) - strike, 0.0)

    for step in range(n_time):
        tau = (step + 1) * dt  # time remaining, marching backwards from maturity
        first = (value[2:] - value[:-2]) / (2 * dy)
        second = (value[2:] - 2 * value[1:-1] + value[:-2]) / dy**2
        inner = value[1:-1] + dt * (drift * first + 0.5 * sigma**2 * second
                                    - rate * value[1:-1])
        value = np.concatenate([[0.0], inner,
                                [np.exp(y[-1]) - strike * np.exp(-rate * tau)]])
    return np.exp(y), value


def bs_monte_carlo(s0, strike, rate, sigma, maturity, n_paths=200_000, seed=0):
    """Probabilistic side of the identical statement. The two must agree."""
    rng = np.random.default_rng(seed)
    z = rng.standard_normal(n_paths)
    terminal = s0 * np.exp((rate - 0.5 * sigma**2) * maturity
                           + sigma * np.sqrt(maturity) * z)
    return np.exp(-rate * maturity) * np.maximum(terminal - strike, 0.0).mean()
```

---

#### See Also

* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [Numerical Schemes](/stochastic-calculus/numerical-schemes)
* [Stochastic Differential Equations](/stochastic-calculus/sdes)
* [Black-Scholes](/derivatives/black-scholes)
* [Binomial Trees](/derivatives/binomial-trees)

---

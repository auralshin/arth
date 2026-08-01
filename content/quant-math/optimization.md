### Optimization

> info **Metadata** Level: Advanced | Prerequisites: Expectation & Variance, Calculus, Linear algebra | Tags: optimization, objective, constraints, portfolios

Optimisation is the act of choosing decision variables to minimise or maximise an objective subject to constraints. In portfolio work the variables are weights or exposures, the objective is some trade-off between expected return and risk, and the constraints encode everything the mathematics does not know: leverage limits, position caps, liquidity, mandate rules, and the cost of trading.

The formulation is where the difficulty lies, not the solving. Modern solvers handle convex problems of realistic size without difficulty. What they cannot do is tell you that your expected returns are noise, that your covariance matrix is nearly singular, or that the constraint you omitted was the binding one. An optimiser applied to badly estimated inputs does not fail loudly — it produces confident, extreme, and precisely wrong weights.

---

#### Formal Definition

A constrained optimisation problem has the standard form:

```text
minimise    f(w)
subject to  g_i(w) <= 0        inequality constraints
            h_j(w) =  0        equality constraints
```

where `w` is the vector of decision variables, `f` is the objective, and the constraints define the feasible set.

The problem is **convex** when `f` and all the `g_i` are convex functions and the `h_j` are affine. Convexity matters because it guarantees that any local minimum is global, that the solution is unique under mild conditions, and that the problem is solvable reliably at scale. Most useful portfolio problems can be written this way.

**Minimum variance** is the canonical example:

```text
minimise    w' * Sigma * w
subject to  w' * 1 = 1
```

Solving with a Lagrange multiplier gives a closed form:

```text
w* = (Sigma^-1 * 1) / (1' * Sigma^-1 * 1)
```

For two assets this reduces to:

```text
w1* = (sigma_2^2 - Cov) / (sigma_1^2 + sigma_2^2 - 2*Cov)
```

**Karush-Kuhn-Tucker conditions.** At an optimum with inequality constraints, each constraint is either inactive with a zero multiplier, or active with a non-negative multiplier. The multiplier on an active constraint is its **shadow price** — the improvement in the objective obtainable by relaxing it by one unit. Reading the multipliers tells you which constraint is actually driving the answer, which is usually more informative than the weights themselves.

---

#### Worked Example

Two assets, with `sigma_1 = 18%`, `sigma_2 = 12%`, and correlation `rho = 0.30`.

1. **Covariance**: `0.30 * 0.18 * 0.12 = 0.00648`
2. **Numerator**: `sigma_2^2 - Cov = 0.0144 - 0.00648 = 0.00792`
3. **Denominator**: `sigma_1^2 + sigma_2^2 - 2*Cov = 0.0324 + 0.0144 - 0.01296 = 0.03384`
4. **Optimal weight**: `w1* = 0.00792 / 0.03384 = 0.2340`, so `w2* = 0.7660`
5. **Portfolio variance**: `(0.2340)^2(0.0324) + (0.7660)^2(0.0144) + 2(0.2340)(0.7660)(0.00648) = 0.012546`
6. **Portfolio volatility**: `sqrt(0.012546) = 11.20%`

Compare across the whole feasible line:

<table>
  <tbody>
    <tr>
      <td><strong>Weight in asset 1</strong></td>
      <td><strong>Portfolio volatility</strong></td>
    </tr>
    <tr><td>0.00</td><td>12.00%</td></tr>
    <tr><td>0.10</td><td>11.47%</td></tr>
    <tr><td>0.15</td><td>11.31%</td></tr>
    <tr><td><strong>0.234 (optimum)</strong></td><td><strong>11.20%</strong></td></tr>
    <tr><td>0.30</td><td>11.27%</td></tr>
    <tr><td>0.50</td><td>12.22%</td></tr>
  </tbody>
</table>

Two observations worth more than the optimum itself. First, holding some of the *more* volatile asset lowers portfolio risk, from 12.00% to 11.20% — diversification, not risk avoidance. Second, the objective is very flat near the solution: any weight between roughly 16% and 31% in asset 1 sits within 10 basis points of the optimal volatility.

**Now add a constraint**: no more than 15% in asset 1, perhaps a liquidity or concentration rule. The unconstrained optimum violates it, so the constraint is active and the solution sits on the boundary at `w1 = 0.15`, giving `11.31%`. The shadow price of that constraint is about 11 basis points of volatility — the entire cost of the restriction.

> info **Flatness is the practical result** When the objective is nearly flat near the optimum, the precise weights matter far less than staying in the right region. That is fortunate, because the inputs are far too noisy to locate the exact optimum anyway.

---

#### Problems You Can and Cannot Solve

<table>
  <tbody>
    <tr>
      <td><strong>Formulation</strong></td>
      <td><strong>Class</strong></td>
      <td><strong>Notes</strong></td>
    </tr>
    <tr><td>Minimum variance, mean-variance, tracking error</td><td>Quadratic program</td><td>Convex; closed form with equality constraints only</td></tr>
    <tr><td>Minimum CVaR</td><td>Linear program</td><td>Convex; auxiliary variables over scenarios</td></tr>
    <tr><td>Risk parity</td><td>Convex reformulation</td><td>Solvable, though the naive form looks non-convex</td></tr>
    <tr><td>Turnover or cost penalty</td><td>Convex</td><td>Linear and quadratic penalties preserve convexity</td></tr>
    <tr><td>Maximum drawdown objective</td><td>Path-dependent</td><td>Not a function of weights alone; requires simulation</td></tr>
    <tr><td>Cardinality limits, minimum lots</td><td>Mixed-integer</td><td>Non-convex; exact solutions do not scale</td></tr>
  </tbody>
</table>

**Regularisation.** Because the inputs are noisy, unconstrained optimisers produce extreme weights. Standard remedies all amount to adding information the data does not contain: a penalty on the squared deviation from an equal-weight or benchmark portfolio, a no-short constraint (which acts as an implicit shrinkage of the covariance matrix), position caps, or shrinkage of the covariance estimate itself. See [Covariance](/quant-math/covariance) and [Regularisation](/ml-finance/regularisation).

---

#### In Practice Across Asset Classes

- **Equities.** Optimisation is nearly always run on factor-model risk rather than a raw sample covariance matrix, because the sample version is unusable for a universe of hundreds of names. Constraints on sector, country, and factor exposure typically dominate the solution more than the objective does. See [Factor Models](/stat-methods/factor-models).
- **Futures.** The natural decision variable is risk contribution rather than capital weight, since notional is largely arbitrary under margining. Optimisation here usually means allocating a volatility budget across markets subject to correlation.
- **Fixed income.** Constraints are expressed in duration and key-rate exposures rather than weights, and the objective is often tracking error against a benchmark whose composition changes monthly as bonds are issued and mature. See [Duration & Convexity](/markets/duration-convexity).
- **FX.** Weights are naturally net exposures, and the constraint set is dominated by the fact that positions in different pairs overlap in their underlying currency exposures. Optimising over pairs without netting to currencies double-counts risk.
- **Credit.** Liquidity constraints usually bind before risk constraints. The optimiser will happily select a bond that has not traded in weeks, so tradability limits have to be encoded explicitly.
- **Execution.** Optimal trade scheduling is itself a convex problem, trading market impact against timing risk. The Almgren-Chriss formulation is the standard example, and it shares the structure of a mean-variance problem. See [Almgren-Chriss](/execution/almgren-chriss).
- **On-chain.** The frictions are large and discrete: gas costs make small rebalances uneconomic, slippage is a convex function of trade size, and each additional venue adds a fixed cost. This turns a smooth allocation problem into one with fixed charges, where the practical answer is usually a wide no-trade band rather than a computed optimum. See [Rebalancing](/quant-math/rebalancing).

---

#### Assumptions and Failure Modes

- **The inputs are treated as known.** They are estimates. The optimiser has no notion of a standard error and will concentrate the portfolio in whichever asset happened to have the most favourable sampling error. This is the "error maximisation" property, and it is the single most important fact about portfolio optimisation.
- **Small input changes produce large weight changes.** A near-singular covariance matrix means the objective is nearly flat in some directions, so tiny perturbations swing the solution. Check the condition number before trusting the weights.
- **The objective is a proxy.** Variance is not risk. Optimising it exactly delivers a portfolio that is optimal for a criterion nobody actually holds.
- **Constraints do the real work.** In practice, the binding constraints usually determine the solution more than the objective does. If that is the case, the honest description is that the portfolio was constructed by its constraints, and the optimisation was decoration.
- **Non-convex formulations return local optima.** Cardinality limits, minimum position sizes, and discrete rebalancing decisions all destroy convexity. A heuristic result should never be reported as "the optimal portfolio".
- **In-sample optimality does not survive.** Weights optimised on historical data are fitted to that history. Evaluate on data the optimiser never saw. See [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **Costs are omitted.** An optimiser rerun on fresh estimates each period generates enormous turnover chasing noise. Without an explicit turnover penalty the theoretical improvement is consumed by trading. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).

> warning **The optimiser will exploit every error you give it** Expected returns estimated with a standard error larger than their magnitude will still produce confident, extreme, precise-looking weights. Confidence in the output is not evidence about the input.

---

#### Code

```python
import numpy as np

def minimum_variance_weights(covariance_matrix):
    """Closed-form global minimum variance portfolio, budget constraint only.

    No short-sale constraint, so weights can be large and negative when
    the covariance matrix is poorly conditioned.
    """
    cov = np.asarray(covariance_matrix, dtype=float)
    ones = np.ones(cov.shape[0])
    raw = np.linalg.solve(cov, ones)
    return raw / raw.sum()


def shrink_towards_equal_weight(weights, intensity=0.5):
    """Regularisation by blending with equal weight.

    The objective is usually flat enough near the optimum that this
    costs very little in-sample and helps considerably out-of-sample.
    """
    w = np.asarray(weights, dtype=float)
    return (1 - intensity) * w + intensity * np.full_like(w, 1.0 / len(w))


def condition_number(covariance_matrix):
    """Large values mean the objective is nearly flat in some directions,
    so the reported weights are unstable to small input changes."""
    return np.linalg.cond(np.asarray(covariance_matrix, dtype=float))
```

---

#### See Also

* [Mean-Variance](/quant-math/mean-variance)
* [Covariance](/quant-math/covariance)
* [Position Sizing](/quant-math/position-sizing)
* [Rebalancing](/quant-math/rebalancing)
* [Kelly Criterion](/quant-math/kelly)
* [Almgren-Chriss](/execution/almgren-chriss)
* [Regularisation](/ml-finance/regularisation)

---

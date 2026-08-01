### Mean-Variance

> info **Metadata** Level: Advanced | Prerequisites: Covariance, Optimization | Tags: mean-variance, portfolios, frontier, risk-return

Mean-variance analysis describes a portfolio by two numbers — its expected return and the variance of that return — and asks which combinations of assets cannot be improved upon. A portfolio is **efficient** if no other portfolio offers more expected return at the same variance, or less variance at the same expected return. The set of all such portfolios is the **efficient frontier**.

The framework is the foundation of quantitative portfolio construction, and its central insight remains correct: the risk contribution of an asset is not its own volatility but its covariance with everything else you hold. Its central weakness is equally durable. It requires expected returns as inputs, expected returns cannot be estimated precisely, and the optimiser converts small errors in those inputs into large errors in the weights.

---

#### Formal Definition

For a portfolio with weights `w`, expected returns `mu`, and covariance matrix `Sigma`:

```text
E[R_p]     = w' * mu
Var(R_p)   = w' * Sigma * w
```

The efficient frontier solves, for each target return `m`:

```text
minimise    w' * Sigma * w
subject to  w' * mu = m
            w' * 1  = 1
```

Equivalently, sweeping a risk-aversion parameter `lambda` traces the same set:

```text
maximise  w' * mu - (lambda / 2) * w' * Sigma * w
```

In mean-standard-deviation space the frontier is a hyperbola, opening to the right from the **global minimum variance portfolio**. Only the upper branch is efficient; the lower branch offers less return for the same risk.

**With a risk-free asset.** Adding a risk-free rate `r` changes the geometry entirely. The best achievable set becomes a straight line from `r` tangent to the frontier — the **capital allocation line** — and the point of tangency is the portfolio with the highest Sharpe ratio:

```text
w_tangency  proportional to  Sigma^-1 * (mu - r * 1)
```

normalised so the weights sum to one. This is **two-fund separation**: every investor holds the same risky portfolio and adjusts only the split between it and cash. Risk preference sets the leverage, not the composition.

---

#### Worked Example

Two assets, with a risk-free rate of `2%`:

<table>
  <tbody>
    <tr>
      <td><strong>Asset</strong></td>
      <td><strong>Expected return</strong></td>
      <td><strong>Volatility</strong></td>
      <td><strong>Sharpe</strong></td>
    </tr>
    <tr><td>A (equity)</td><td>9.0%</td><td>18.0%</td><td>0.389</td></tr>
    <tr><td>B (bonds)</td><td>4.0%</td><td>8.0%</td><td>0.250</td></tr>
  </tbody>
</table>

Correlation is `rho = 0.20`, so `Cov = 0.20 * 0.18 * 0.08 = 0.00288`.

**Global minimum variance portfolio.**

1. `w_A = (sigma_B^2 - Cov) / (sigma_A^2 + sigma_B^2 - 2*Cov) = (0.0064 - 0.00288) / (0.0324 + 0.0064 - 0.00576) = 0.00352 / 0.03304 = 0.1065`
2. Expected return `(0.1065)(9%) + (0.8935)(4%) = 4.53%`
3. Volatility `7.76%` — below asset B's own 8.0%, achieved by adding the *more* volatile asset

**Tangency portfolio.** Solving `Sigma^-1 (mu - r)` and normalising gives `w_A = 0.4665`, `w_B = 0.5335`.

4. Expected return `(0.4665)(9%) + (0.5335)(4%) = 6.33%`
5. Volatility `10.15%`
6. Sharpe `(6.33 - 2) / 10.15 = 0.427` — above either asset's own Sharpe of 0.389 and 0.250

The full frontier:

<table>
  <tbody>
    <tr>
      <td><strong>Weight in A</strong></td>
      <td><strong>Expected return</strong></td>
      <td><strong>Volatility</strong></td>
      <td><strong>Sharpe</strong></td>
    </tr>
    <tr><td>0.00</td><td>4.00%</td><td>8.00%</td><td>0.250</td></tr>
    <tr><td>0.107 (min variance)</td><td>4.53%</td><td>7.76%</td><td>0.326</td></tr>
    <tr><td>0.250</td><td>5.25%</td><td>8.19%</td><td>0.397</td></tr>
    <tr><td>0.467 (tangency)</td><td>6.33%</td><td>10.15%</td><td>0.427</td></tr>
    <tr><td>0.750</td><td>7.75%</td><td>14.04%</td><td>0.410</td></tr>
    <tr><td>1.00</td><td>9.00%</td><td>18.00%</td><td>0.389</td></tr>
  </tbody>
</table>

**Why the tangency portfolio matters.** Holding 76.5% of the tangency portfolio and 23.5% in cash gives a volatility of `7.76%` — identical to the minimum variance portfolio — at an expected return of `2% + 0.427 * 7.76% = 5.31%`. That is 78 basis points more than the minimum variance portfolio delivers for exactly the same risk. Once a risk-free asset exists, every point on the curved frontier except the tangency point is dominated by a mix of cash and tangency.

> info **The whole frontier collapses to one point plus leverage** With borrowing and lending at the same rate, portfolio construction is choosing one risky portfolio and then choosing how much of it to hold. Everything else is a constraint on that idealisation.

---

#### What the Framework Assumes About Preferences

Mean-variance optimality is justified in exactly two situations: investors have quadratic utility, or returns are elliptically distributed (normality being the familiar case). Neither is true.

Quadratic utility implies increasing absolute risk aversion — wealthier investors take less risk — which is the wrong sign. Returns are not normal: they are skewed and fat-tailed, and the framework is blind to both. A strategy that sells tail insurance appears on the efficient frontier because its variance is low, right up to the point at which the tail arrives.

The defence is that mean-variance is a second-order approximation to any smooth utility function, and is often adequate when returns are close to symmetric over the relevant horizon. That defence weakens exactly as the payoff becomes more optional, more levered, or more concentrated in tail outcomes.

---

#### In Practice Across Asset Classes

- **Equities.** The natural home of the framework, but only with a factor-model covariance matrix; a sample matrix over hundreds of names is unusable. Expected returns typically come from a factor model or from reverse-optimising the market portfolio, rarely from historical averages. See [Factor Models](/stat-methods/factor-models).
- **Fixed income.** Weights are less useful than duration and key-rate exposures. The frontier is usually constructed in factor space — level, slope, curvature — because the covariance matrix of individual bond returns is close to singular. See [Yield Curves](/markets/yield-curves).
- **Futures.** Because margin decouples exposure from capital, the budget constraint `w'1 = 1` is not natural. Practitioners instead allocate a risk budget, which is mean-variance run on volatility contributions rather than on capital shares.
- **FX.** With no natural long-only constraint and no obvious benchmark, FX portfolios are pure relative-value problems where the framework applies cleanly to the variance side and badly to the mean side, since expected currency returns are notoriously unforecastable.
- **Credit.** The return distribution is far from elliptical — most of the risk is jump-to-default rather than spread variance — so a mean-variance frontier for a credit book systematically understates the tail. A CVaR objective is a better fit. See [Default Probability](/credit/default-probability).
- **Multi-asset.** The classic application, and the one where the correlation input matters most: the equity-bond correlation has not been stable across decades, and the entire diversification benefit of the framework rests on it. See [Rates and Inflation](/regimes-macro/rates-and-inflation).
- **On-chain.** Assets within one ecosystem are dominated by a single common factor, so the covariance matrix is close to rank one and the optimiser has almost nothing to diversify with. A frontier drawn across a dozen correlated tokens looks well-populated and represents roughly one independent bet.

---

#### Assumptions and Failure Modes

- **Expected returns are inputs, and they are not knowable to the required precision.** The standard error on a mean return is large enough that the optimiser is largely responding to noise. This is the dominant practical problem.
- **Error maximisation.** The optimiser assigns the largest weights to assets whose expected returns were most overestimated and whose variances were most underestimated. It systematically selects for estimation error.
- **Weights are unstable.** Re-estimating inputs each period produces large weight changes and enormous turnover, most of which is chasing noise rather than tracking anything real.
- **Variance is not risk.** Skew and kurtosis are invisible to the framework. Two portfolios on the same point of the frontier can have completely different tail behaviour.
- **Correlations are assumed stable.** They rise in stress, which removes the diversification the frontier was built on precisely when it is needed. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Single period, no costs, infinitely divisible.** The classical formulation has no transaction costs, no liquidity limits, and no notion of a multi-period path. All three bind in practice.
- **Borrowing and lending at the same rate.** Two-fund separation requires it. Real borrowing costs more than lending earns, which kinks the capital allocation line and reintroduces part of the curved frontier.

**Standard mitigations**: shrink the covariance matrix; constrain weights (a no-short constraint acts as implicit regularisation); penalise turnover; use Black-Litterman to blend market-implied returns with explicit views; or resample the frontier across bootstrapped inputs and average the weights. See [Optimization](/quant-math/optimization) and [Bootstrap](/stat-methods/bootstrap).

> warning **A frontier plotted from historical means is a picture of the past** The curve is exact given the inputs. The inputs are estimates with standard errors comparable to their own size. Precision in the drawing is not precision in the conclusion.

---

#### Code

```python
import numpy as np

def tangency_portfolio(expected_returns, covariance_matrix, risk_free_rate=0.0):
    """Maximum-Sharpe portfolio. Highly sensitive to the expected return vector."""
    excess = np.asarray(expected_returns, dtype=float) - risk_free_rate
    raw = np.linalg.solve(np.asarray(covariance_matrix, dtype=float), excess)
    return raw / raw.sum()


def frontier_point(expected_returns, covariance_matrix, target_return):
    """Minimum-variance weights for a target return, via the KKT system.

    Solves the equality-constrained problem directly; no short-sale limits.
    """
    mu = np.asarray(expected_returns, dtype=float)
    cov = np.asarray(covariance_matrix, dtype=float)
    n = len(mu)
    ones = np.ones(n)

    # [2*Sigma  -mu  -1] [w      ]   [0]
    # [mu'       0    0] [lambda ] = [target]
    # [1'        0    0] [gamma  ]   [1]
    kkt = np.zeros((n + 2, n + 2))
    kkt[:n, :n] = 2 * cov
    kkt[:n, n] = -mu
    kkt[:n, n + 1] = -ones
    kkt[n, :n] = mu
    kkt[n + 1, :n] = ones

    rhs = np.zeros(n + 2)
    rhs[n] = target_return
    rhs[n + 1] = 1.0
    return np.linalg.solve(kkt, rhs)[:n]
```

---

#### See Also

* [Covariance](/quant-math/covariance)
* [Optimization](/quant-math/optimization)
* [Kelly Criterion](/quant-math/kelly)
* [Rebalancing](/quant-math/rebalancing)
* [VaR & CVaR](/quant-math/var-cvar)
* [Factor Models](/stat-methods/factor-models)
* [PCA](/stat-methods/pca)

---

### Covariance

> info **Metadata** Level: Intermediate | Prerequisites: Expectation & Variance | Tags: math, covariance, correlation, portfolios, dependence

Covariance measures how two random variables move together. It is the expected product of their deviations from their own means: positive when they tend to deviate in the same direction, negative when they oppose, zero when there is no *linear* association. Correlation is covariance rescaled by the two standard deviations, which strips out the units and confines the result to the interval from minus one to plus one.

Covariance is the reason a portfolio is not simply the sum of its parts. Individual volatilities tell you how large each position's swings are; the covariance structure tells you whether those swings cancel or reinforce. Every diversification argument, every hedge ratio, every factor decomposition, and every risk-parity weighting rests on this one quantity — and on the uncomfortable fact that it is unstable exactly when it matters most.

---

#### Formal Definition

```text
Cov(X, Y) = E[(X - E[X]) * (Y - E[Y])] = E[XY] - E[X] * E[Y]

rho(X, Y) = Cov(X, Y) / (sigma_X * sigma_Y)
```

where:

- `sigma_X` and `sigma_Y` are the standard deviations of `X` and `Y`
- `rho` is the Pearson correlation coefficient, between -1 and +1
- `Cov(X, X) = Var(X)`, so variance is the special case

From a sample of `n` paired observations, the unbiased estimator is:

```text
Cov_hat(X, Y) = sum over t of (x_t - xbar)(y_t - ybar) / (n - 1)
```

For a portfolio with weights `w` and covariance matrix `Sigma`, portfolio variance is the quadratic form:

```text
Var(R_p) = w' * Sigma * w = sum over i, j of  w_i * w_j * Cov(R_i, R_j)
```

Two derived quantities appear constantly:

```text
beta_X|Y  = Cov(X, Y) / Var(Y)         regression slope, the hedge ratio
```

`beta` is the coefficient you get from regressing `X` on `Y`, and it is the number of units of `Y` that minimises the variance of `X - beta * Y`.

> warning **Correlation captures linear association only** Two variables can be perfectly dependent and have zero correlation. If `Y = X^2` with `X` symmetric about zero, `rho` is 0 while `Y` is fully determined by `X`. Option positions and liquidity-provision payoffs are exactly this kind of nonlinear relationship.

---

#### Worked Example

Six months of returns (%) for a small-cap fund `X` and a broad equity index `Y`:

<table>
  <tbody>
    <tr>
      <td><strong>Month</strong></td>
      <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>
    </tr>
    <tr>
      <td><strong>X (small-cap)</strong></td>
      <td>3.0</td><td>-2.0</td><td>1.5</td><td>4.0</td><td>-3.5</td><td>3.0</td>
    </tr>
    <tr>
      <td><strong>Y (index)</strong></td>
      <td>1.2</td><td>-0.8</td><td>1.4</td><td>0.6</td><td>-1.0</td><td>1.6</td>
    </tr>
  </tbody>
</table>

1. **Means.** `X` sums to 6.0, so `xbar = 1.0`. `Y` sums to 3.0, so `ybar = 0.5`.
2. **Deviations.** `dx = [2.0, -3.0, 0.5, 3.0, -4.5, 2.0]`, `dy = [0.7, -1.3, 0.9, 0.1, -1.5, 1.1]`
3. **Products.** `[1.40, 3.90, 0.45, 0.30, 6.75, 2.20]`, summing to `15.00`
4. **Covariance.** `15.00 / (6 - 1) = 3.00`
5. **Variances.** Squared deviations sum to `46.50` for `X` and `6.46` for `Y`, so `Var(X) = 9.30` and `Var(Y) = 1.292`, giving `sigma_X = 3.05%` and `sigma_Y = 1.14%`
6. **Correlation.** `3.00 / (3.0496 * 1.1367) = 0.865`
7. **Beta.** `3.00 / 1.292 = 2.32` — the small-cap fund moves roughly 2.3 times the index

Now hold the two in equal weight. Portfolio variance is `(0.25)(9.30) + (0.25)(1.292) + 2(0.25)(3.00) = 2.325 + 0.323 + 1.500 = 4.148`, so `sigma_p = 2.04%`. The weighted average of the two volatilities is `(0.5)(3.05) + (0.5)(1.14) = 2.09%`. The diversification benefit is barely six basis points, because at `rho = 0.865` these are close to the same bet in different sizes.

> info **Six observations is not an estimate** With `n = 6`, the standard error on a correlation is very large. The point of this example is the mechanics, not the number.

---

#### The Covariance Matrix and Why It Is Hard

For `N` assets, `Sigma` is `N` by `N` and symmetric, so it holds `N(N + 1) / 2` distinct parameters. For 100 assets that is 5,050 numbers. If you estimate them from `T` periods of data:

- When `T` is smaller than `N`, the sample covariance matrix is **singular** by construction. It reports that some portfolios have exactly zero risk, and an optimiser will happily take an unbounded position in them.
- Even when `T` exceeds `N`, the matrix is badly conditioned. Its smallest eigenvalues are dominated by noise, and those are exactly the directions a minimum-variance optimiser selects.

Standard responses:

- **Shrinkage.** Pull the sample matrix towards a structured target — a constant-correlation matrix or a scaled identity — trading a little bias for a large reduction in variance.
- **Factor structure.** Model returns as loadings on a small number of common factors plus idiosyncratic noise, reducing the parameter count from `N(N + 1)/2` to roughly `N * k`. See [Factor Models](/stat-methods/factor-models) and [PCA](/stat-methods/pca).
- **Longer or higher-frequency samples.** Both help, and both introduce their own problems: longer samples span regimes, higher frequency introduces microstructure noise into the estimate.

Any valid covariance matrix must be **positive semi-definite** — no portfolio can have negative variance. Matrices assembled by hand, or estimated from series with differing histories, frequently violate this and must be repaired before use.

---

#### In Practice Across Asset Classes

- **Equities.** Correlations are structured by sector, country, and style, and they rise sharply in market-wide selloffs. A portfolio diversified in normal conditions can behave as a single position during a drawdown. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Fixed income.** Yields across maturities are so highly correlated that three principal components — level, slope, and curvature — typically explain nearly all of the variation. The covariance matrix of a curve is close to low-rank by nature. See [Yield Curves](/markets/yield-curves).
- **Futures.** Covariances between contracts on the same underlying at different maturities are near one at the front and decay along the curve, which is what makes calendar spreads a lower-variance expression of a curve view. See [Calendar Spreads](/markets/calendar-spreads).
- **FX.** Correlations are largely mechanical, because every cross shares a currency with several others. A basket of dollar pairs is far less diversified than the count of positions suggests.
- **Credit.** Default correlation, not individual default probability, drives the loss distribution of a portfolio of credits. Tranched products are almost pure bets on this parameter. See [Credit Curves](/credit/credit-curves).
- **Options.** Correlation itself is traded, through dispersion and basket structures, so it becomes a priced quantity with its own implied and realised versions.
- **On-chain.** Assets within a single ecosystem tend to be dominated by one common factor, so a portfolio of many tokens often has a lower effective number of independent bets than a two-asset equity-and-bond mix.

---

#### Assumptions and Failure Modes

- **Correlation is not causation, and it is not dependence.** It measures one specific linear relationship. Nonlinear payoffs — options, liquidity positions, capped structures — are systematically mismeasured by it.
- **Correlations are not stable.** They shift with regime and typically rise during stress, which removes diversification exactly when it is needed. Any risk figure that assumes a fixed correlation understates crisis losses.
- **Asynchronous data biases estimates downwards.** Assets that close at different times, or trade infrequently, appear less correlated than they are. This inflates apparent diversification for anything illiquid or stale-marked.
- **Outliers dominate.** Covariance is a product of deviations, so one shared extreme move can set the estimate. Whether that is signal or contamination is a judgement you must make explicitly.
- **Zero correlation does not imply independence.** It only implies independence under joint normality, and financial returns are not jointly normal.
- **Estimation error is amplified by optimisation.** Small covariance errors produce large weight errors. This is the central practical objection to naive mean-variance optimisation. See [Optimization](/quant-math/optimization).

---

#### Code

```python
import numpy as np

def covariance_and_beta(x, y):
    """Sample covariance, correlation and the regression beta of x on y."""
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    cov = np.cov(x, y, ddof=1)[0, 1]
    corr = cov / (x.std(ddof=1) * y.std(ddof=1))
    beta = cov / y.var(ddof=1)
    return cov, corr, beta


def nearest_psd(matrix):
    """Repair a covariance matrix that has negative eigenvalues.

    Hand-built or patchwork matrices are often not positive semi-definite,
    which lets an optimiser find portfolios with 'negative' variance.
    """
    eigenvalues, eigenvectors = np.linalg.eigh((matrix + matrix.T) / 2)
    eigenvalues = np.clip(eigenvalues, 0.0, None)
    return eigenvectors @ np.diag(eigenvalues) @ eigenvectors.T
```

---

#### See Also

* [Expectation & Variance](/quant-math/expectation-variance)
* [Mean-Variance](/quant-math/mean-variance)
* [Optimization](/quant-math/optimization)
* [Factor Models](/stat-methods/factor-models)
* [PCA](/stat-methods/pca)
* [Correlation Breakdown](/regimes-macro/correlation-breakdown)
* [Random Walks](/quant-math/random-walks)

---

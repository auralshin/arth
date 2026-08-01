### Principal Component Analysis

> info **Metadata** Level: Advanced | Prerequisites: Covariance, Linear Regression | Tags: pca, dimensionality-reduction, yield-curve, eigenvalues, risk-model

Principal Component Analysis (PCA) rotates a set of correlated variables into a new set of uncorrelated ones, ordered so the first captures as much variance as possible, the second as much of what remains, and so on. Nothing is discarded in the rotation itself; the compression comes from keeping only the first few components.

In finance the correlated variables are usually returns or yield changes across related instruments, and the payoff is large. Twenty points on a yield curve move almost as one; three components typically reproduce nearly all of their joint variation, and those three have clean names — level, slope, and curvature — that traders use as the vocabulary of curve positioning.

---

#### Formal Definition

Start with a [covariance](/quant-math/covariance) matrix `C` of `k` variables, estimated from data. PCA solves the eigenvalue problem:

```text
C * v_j = lambda_j * v_j
```

where:

- `v_j` is the `j`-th eigenvector, a unit-length vector of loadings across the `k` variables
- `lambda_j` is the corresponding eigenvalue, equal to the variance of that component
- eigenvectors are mutually orthogonal, so the components are uncorrelated

Order the eigenvalues from largest to smallest, then:

```text
explained share    share_j  = lambda_j / sum_l(lambda_l)
score              score_j  = v_j' * x     for an observation vector x
reconstruction     x_approx = sum_{j=1..m} score_j * v_j
```

The denominator of `share_j` equals the trace of `C`, the sum of the individual variances — PCA redistributes total variance without changing it. Keeping all `k` components in the reconstruction reproduces `x` exactly.

> warning **Covariance or correlation?** Running PCA on the covariance matrix lets high-variance variables dominate the first component. On the correlation matrix every variable is standardised first. For yield curves in basis points, covariance is standard because the units are already comparable. For a mixed universe of equities and rates, correlation is usually the right choice. The two give different answers and neither is universally correct.

---

#### Worked Example

Daily changes in three points on a government yield curve, in basis points. The estimated covariance matrix:

<table>
  <tbody>
    <tr><td></td><td><strong>2y</strong></td><td><strong>5y</strong></td><td><strong>10y</strong></td></tr>
    <tr><td><strong>2y</strong></td><td>25</td><td>27</td><td>22</td></tr>
    <tr><td><strong>5y</strong></td><td>27</td><td>36</td><td>31</td></tr>
    <tr><td><strong>10y</strong></td><td>22</td><td>31</td><td>30</td></tr>
  </tbody>
</table>

Daily standard deviations are `sqrt(25) = 5.0`, `sqrt(36) = 6.0`, and `sqrt(30) = 5.48` basis points, and the implied correlations are 0.90 between 2y and 5y, 0.94 between 5y and 10y, and 0.80 between 2y and 10y — the usual pattern of near-perfect correlation between adjacent tenors decaying with distance.

1. **Total variance**: the trace, `25 + 36 + 30 = 91`
2. **Eigenvalues**: `84.49`, `5.39`, `1.12` (they sum to 91)
3. **Explained shares**: `84.49 / 91 = 92.85%`, `5.39 / 91 = 5.93%`, `1.12 / 91 = 1.23%` — two components capture 98.8% of the joint variation

The eigenvectors, with signs chosen for readability:

<table>
  <tbody>
    <tr><td><strong>Tenor</strong></td><td><strong>PC1 (level)</strong></td><td><strong>PC2 (slope)</strong></td><td><strong>PC3 (curvature)</strong></td></tr>
    <tr><td>2y</td><td>0.505</td><td>-0.784</td><td>0.361</td></tr>
    <tr><td>5y</td><td>0.647</td><td>0.066</td><td>-0.760</td></tr>
    <tr><td>10y</td><td>0.572</td><td>0.617</td><td>0.540</td></tr>
  </tbody>
</table>

Each component's daily standard deviation is the square root of its eigenvalue: `9.19`, `2.32`, and `1.06` basis points. **Projecting a single day**, suppose the curve moves `+6` bp at 2y, `+7` bp at 5y, `+6` bp at 10y.

4. **PC1 score**: `0.505*6 + 0.647*7 + 0.572*6 = 3.03 + 4.53 + 3.43 = 10.99`
5. **PC2 score**: `-0.784*6 + 0.066*7 + 0.617*6 = -4.70 + 0.46 + 3.70 = -0.54`
6. **PC3 score**: `0.361*6 - 0.760*7 + 0.540*6 = 2.17 - 5.32 + 3.24 = 0.09`
7. **Reconstruction check** at 5y: `10.99*0.647 + (-0.54)*0.066 + 0.09*(-0.760) = 7.11 - 0.04 - 0.07 = 7.00` — the original value, as required

That day was a level move of about 11 basis points in PC1 units, with almost no slope or curvature content. The PC1 score of 10.99 sits 1.20 standard deviations from zero (`10.99 / 9.19`), so it was a moderately large parallel shift and an unremarkable day for a curve-shape position.

---

#### The Level, Slope, Curvature Interpretation

The names describe the *shape* of the loading vectors, and they recur across currencies and sample periods because they follow from the correlation structure rather than from any particular market.

- **PC1, level.** All loadings share a sign and are roughly similar in size. A positive score means the whole curve moved in one direction. This dominates because adjacent tenors are so highly correlated. The loadings are rarely exactly equal — here the belly loads highest, reflecting its larger variance.
- **PC2, slope.** Loadings change sign from the short end to the long end. A positive score here means the 10y rose relative to the 2y: a steepening. The middle loading is near zero, which is the defining feature of a slope factor.
- **PC3, curvature.** The wings share a sign, the belly takes the opposite one — a butterfly. A positive score means 2y and 10y rose relative to 5y.

Two consequences follow. A portfolio's curve risk can be reported as three numbers instead of twenty tenor sensitivities; and a hedge neutralising PC1 and PC2 leaves a position that only profits or loses on curvature — precisely how butterfly trades are constructed and risk-managed.

> info **The signs are arbitrary** An eigenvector multiplied by -1 is still an eigenvector, so software may return "slope" with the opposite orientation between runs or vendors. Fix a convention — for example, force the first loading positive on PC1 — before comparing results across dates.

---

#### In Practice Across Asset Classes

**Fixed income.** The most established application. PCA on daily yield changes across the curve gives level, slope, and curvature; positions are quoted in those terms and risk limits set on them, and the resulting components feed directly into [factor models](/stat-methods/factor-models) and [cointegration](/stat-methods/cointegration) tests on the curve. The same decomposition applied to swap spreads or to inflation breakevens gives the analogous shape factors for those curves.

**Equities.** PCA on a large cross-section of stock returns produces a dominant first component that behaves like the market, with later components resembling sectors or style tilts. Because the number of assets often exceeds the number of observations, the sample covariance matrix is badly conditioned and the trailing eigenvalues are pure estimation noise. Shrinkage or a random-matrix cutoff is standard.

**Futures, FX and credit.** PCA across contract maturities of a single commodity yields level, slope, and curvature of the forward curve, mapping directly onto outright, calendar spread, and butterfly positions. Components extracted from a basket of currency returns usually reveal a dollar factor first, then regional or commodity-currency blocks, with the result depending heavily on the choice of numeraire. On credit spread changes across rating buckets, PCA separates a common credit-risk factor from a quality-dispersion factor, and the first component's share rises sharply in stress — itself a monitorable regime signal. See [Types of Risk](/risk/types).

**On-chain.** PCA across token returns typically shows one very dominant component, with the leading token's moves explaining most of the cross-section. Short histories and frequent listings and delistings make the covariance matrix unstable, so components re-estimated a quarter apart can rotate substantially.

---

#### Assumptions and Failure Modes

- **Linear relationships only.** PCA is a rotation, so nonlinear dependence — options, liquidation cascades, correlations that switch with the regime — is invisible to it.
- **Variance is not importance.** The first components maximise variance, not predictive power; a small component can carry the entire signal for a strategy while explaining 1% of variance.
- **The covariance matrix must be well estimated.** With `k` variables you need far more than `k` observations. Small eigenvalues in a short sample are dominated by noise, and inverting a matrix rebuilt from them amplifies that noise catastrophically — the core hazard in [mean-variance optimisation](/quant-math/mean-variance).
- **Components are not stable through time.** Loadings drift and can rotate outright, especially when two eigenvalues are close in size and the split between them is almost arbitrary. Re-estimate on a rolling basis before trusting a comparison across periods.
- **Sensitive to scaling.** Changing units, or switching between covariance and correlation, changes the components. State which you used.
- **Interpretation is imposed, not derived.** "Level, slope, curvature" is a human reading of the loading shapes; when a component looks like none of them, resist naming it anyway.
- **Outliers dominate.** A single crisis day can rotate the leading components, because covariance is a squared-deviation quantity. Check the result with and without extreme observations, and treat components estimated on a non-[stationary](/quant-math/stationarity) sample as descriptive only.

---

#### Code

```python
import numpy as np
import pandas as pd


def pca_from_returns(data, use_correlation=False):
    """Eigen-decomposition of a covariance (or correlation) matrix.

    data is a DataFrame of changes/returns, one column per variable.
    """
    clean = data.dropna()
    matrix = clean.corr().values if use_correlation else clean.cov().values

    # eigh, not eig: covariance matrices are symmetric, so eigh returns
    # real orthogonal results without complex round-off.
    eigenvalues, eigenvectors = np.linalg.eigh(matrix)
    order = np.argsort(eigenvalues)[::-1]
    eigenvalues, eigenvectors = eigenvalues[order], eigenvectors[:, order]

    # Force the first loading of each component positive, so results
    # stay comparable across re-estimations.
    eigenvectors *= np.sign(eigenvectors[0, :])

    names = [f"PC{i + 1}" for i in range(len(eigenvalues))]
    loadings = pd.DataFrame(eigenvectors, index=clean.columns, columns=names)
    scores = pd.DataFrame(clean.values @ eigenvectors, clean.index, names)
    return eigenvalues, eigenvalues / eigenvalues.sum(), loadings, scores
```

---

#### See Also

* [Factor Models](/stat-methods/factor-models)
* [Regression Diagnostics](/stat-methods/regression-diagnostics)
* [Cointegration](/stat-methods/cointegration)
* [Covariance](/quant-math/covariance)
* [Types of Risk](/risk/types)

---

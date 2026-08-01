### Regularisation Under Low Signal-to-Noise

> info **Metadata** Level: Advanced | Prerequisites: Linear Regression, ML Overview, Purged Cross-Validation | Tags: machine-learning, regularisation, ridge, lasso, bias-variance, shrinkage

Regularisation is usually introduced as a hedge against overfitting — a mild correction applied once a model starts memorising. In finance it is closer to the main event. When the true relationship explains a tenth of a percent of return variance, an unregularised estimate is almost entirely estimation noise, and the correct response is not a small penalty but a severe one.

The counterintuitive part is that heavy shrinkage improves accuracy even when the model is correctly specified. Shrinking a coefficient toward zero introduces bias by construction. In a low signal-to-noise setting the variance it removes is larger than the bias it adds, often by a factor of several, so the biased estimator is closer to the truth. This is not a compromise; it is the optimum.

---

#### The Bias-Variance Trade-off, With Numbers Attached

Suppose a coefficient has a true value drawn from a distribution with standard deviation `tau`, and your estimate of it carries standard error `s`:

```text
b_ols = beta + e,     e has standard deviation s
beta  has prior standard deviation tau

optimal shrinkage:  k = tau^2 / (tau^2 + s^2)
shrunk estimate:    b_shrunk = k * b_ols
```

where:

- `tau` is the typical magnitude of a real coefficient in your problem
- `s` is the standard error of the fitted coefficient
- `k` is the fraction of the raw estimate you should keep

The ratio `tau / s` is the signal-to-noise ratio of the *estimation problem*. When it is large, `k` approaches 1 and shrinkage is unnecessary. When it is small, `k` approaches 0 and almost the entire fitted value is noise.

---

#### Worked Example: How Much to Shrink

A cross-sectional feature is regressed on next-day residual returns. From long experience with similar features, real coefficients of this type have magnitude around `tau = 0.02`. The regression on the available sample produces a standard error of `s = 0.04` — the noise is twice the typical effect.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Working</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Prior variance of the coefficient</td><td>0.02 squared</td><td>0.00040</td></tr>
    <tr><td>Estimation variance</td><td>0.04 squared</td><td>0.00160</td></tr>
    <tr><td>Optimal shrinkage k</td><td>0.00040 / (0.00040 + 0.00160)</td><td>0.200</td></tr>
  </tbody>
</table>

Keep one fifth of the fitted coefficient and throw away four fifths. Now compare mean squared error against the true value, taking `beta = 0.02`:

<table>
  <tbody>
    <tr><td><strong>Estimator</strong></td><td><strong>Bias squared</strong></td><td><strong>Variance</strong></td><td><strong>MSE</strong></td></tr>
    <tr><td>OLS (no shrinkage)</td><td>0</td><td>0.00160</td><td>0.00160</td></tr>
    <tr><td>Shrunk by k = 0.2</td><td>(0.8 * 0.02) squared = 0.000256</td><td>0.2 squared * 0.00160 = 0.000064</td><td>0.00032</td></tr>
  </tbody>
</table>

The heavily biased estimator has one fifth the mean squared error of the unbiased one. Note the coincidence is exact: the minimum achievable MSE equals `k * s^2 = 0.2 * 0.0016 = 0.00032`.

**Translating to a ridge penalty.** For standardised predictors where `X'X` is approximately `n * I`, ridge regression produces exactly this shrinkage:

```text
b_ridge = [n / (n + alpha)] * b_ols
```

Solving `n / (n + alpha) = 0.2` gives `alpha = 4n`. With `n = 2000` observations, the appropriate penalty is `alpha = 8000`. Scikit-learn's default is `alpha = 1.0`, which for the same sample gives a shrinkage of `2000 / 2001 = 0.9995` — no meaningful regularisation at all. Library defaults are calibrated for domains where the signal is strong. They are wrong here by three or four orders of magnitude.

> warning **The penalty scales with sample size** Because the ridge shrinkage factor is `n / (n + alpha)`, an `alpha` tuned on five years of data is far too weak on twenty. Tune it on the actual sample, inside a [purged split](/ml-finance/purged-cross-validation), and re-tune when the sample grows.

---

#### Choosing a Penalty

<table>
  <tbody>
    <tr><td><strong>Method</strong></td><td><strong>Penalty</strong></td><td><strong>Behaviour with correlated features</strong></td><td><strong>When it suits</strong></td></tr>
    <tr><td>Ridge (L2)</td><td>sum of squared coefficients</td><td>Splits weight evenly across the group; stable across folds</td><td>Many weak, overlapping features — the usual finance case</td></tr>
    <tr><td>Lasso (L1)</td><td>sum of absolute coefficients</td><td>Picks one member of a correlated group arbitrarily; the choice flips between folds</td><td>When genuine sparsity is expected and features are distinct</td></tr>
    <tr><td>Elastic net</td><td>weighted mix of both</td><td>Selects or drops correlated features as a group</td><td>Sparsity wanted but features are correlated</td></tr>
    <tr><td>Early stopping</td><td>implicit, via iteration count</td><td>Neutral</td><td>Boosting and gradient-descent fits</td></tr>
  </tbody>
</table>

Lasso's instability deserves emphasis. Two momentum features with correlation 0.95 are, statistically, one feature. Lasso will keep one and zero the other, and which one it keeps is determined by noise. Reading that selection as "the model chose the 10-day lookback" is a misinterpretation of a coin flip. See [Interpretability](/ml-finance/interpretability).

**Early stopping** is regularisation for iterative learners. Gradient boosting fits residuals sequentially, and in a low signal-to-noise problem it begins fitting noise very early. The remedies are a small learning rate combined with a validation-monitored stopping point — with the validation set drawn from a purged split, or the stopping round is itself fitted to leaked data.

**Structural regularisation** is often stronger than any penalty term. Constraining coefficient signs to match an economic prior, capping the number of features, forcing weights to be non-negative, or shrinking a covariance matrix toward a structured target all reduce variance without needing a tuning parameter. See [Portfolio Optimisation](/quant-math/optimization).

---

#### Why Simpler Models Usually Win

The argument is arithmetic, not aesthetic. Model variance grows roughly with the number of effective parameters divided by the effective sample size. Financial datasets have small effective sample sizes — see [ML Overview](/ml-finance/ml-overview) — so the denominator is small and the ratio deteriorates fast.

A linear model on five well-chosen, standardised features has five parameters. A gradient-boosted forest with 500 trees of depth 6 has on the order of tens of thousands of leaf values. The forest can represent relationships the linear model cannot; the question is whether the data contains enough evidence to locate them. Usually it does not.

This is why a regularised linear model is a serious baseline in production systems and not merely a starting point. It is also why the practical benefit of tree ensembles in finance often comes from a strictly limited configuration — shallow trees, heavy subsampling, hundreds of estimators — which is itself a form of regularisation. See [Ensembles](/ml-finance/ensembles).

---

#### In Practice Across Asset Classes

**Equities.** Cross-sectional models routinely apply both a coefficient penalty and covariance shrinkage, since a sample covariance matrix estimated over fewer days than there are assets is singular and its inverse is meaningless. See [Mean-Variance](/quant-math/mean-variance).

**Fixed income and curves.** Regularisation appears as smoothness penalties on fitted curves rather than as coefficient shrinkage. The prior is that adjacent maturities should behave similarly.

**High frequency.** The one place where light regularisation can be correct, because the effective sample is genuinely large and the signal genuinely stronger. Even here, penalties tuned on one venue rarely transfer to another.

**On-chain.** Short histories and a large number of available metrics make this the most severe case in the encyclopedia: dozens of candidate features against a couple of hundred genuinely independent episodes. Heavy shrinkage and a small hand-chosen feature set are close to mandatory.

---

#### Assumptions and Failure Modes

- **Assumes features are standardised.** Ridge and lasso penalise coefficient magnitude, so an unscaled feature is penalised according to its units. Scale inside the pipeline, per fold.
- **Assumes the penalty was tuned honestly.** Selecting `alpha` on the full sample and reporting cross-validated performance at that `alpha` leaks the test set into the hyperparameter.
- **Assumes shrinking toward zero is right.** It is right when the prior mean is zero, which is reasonable for return prediction. It is wrong when shrinking toward a non-zero structural value would be better, as with a known factor exposure.
- **Assumes the prior magnitude `tau` is knowable.** It is an assumption about how large real effects are in your problem. State it; do not pretend cross-validation discovered it from nothing.
- **Does not fix leakage.** A leaked feature with a genuine in-sample relationship survives any penalty, because the relationship is real inside the sample. Regularisation and purging solve different problems.
- **Does not fix non-stationarity.** A shrunk coefficient is still a constant, and a constant fitted across a regime change is an average of two different worlds.

---

#### Code

```python
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV


def alpha_for_shrinkage(n_samples, shrinkage):
    """Ridge alpha giving a target shrinkage factor on standardised columns.

    Derived from b_ridge = [n / (n + alpha)] * b_ols, valid when X'X ~ n*I.
    Use it to sanity-check a search grid: if the grid tops out below this,
    the search cannot reach the regularisation the problem needs.
    """
    return n_samples * (1.0 - shrinkage) / shrinkage


print(alpha_for_shrinkage(2000, 0.20))   # 8000.0
print(alpha_for_shrinkage(2000, 0.50))   # 2000.0


pipeline = Pipeline([
    ("scale", StandardScaler()),
    ("ridge", Ridge()),
])

# Grid spans several orders of magnitude because the right answer is large.
grid = {"ridge__alpha": np.logspace(1, 5, 9)}

# cv comes from purged_splits — a plain KFold here would leak and would
# select an alpha far too small, because leakage makes weak penalties look good.
# search = GridSearchCV(pipeline, grid, cv=purged_cv, scoring="r2")
# search.fit(X, y, ridge__sample_weight=uniqueness)
```

---

#### See Also

* [Ensembles](/ml-finance/ensembles)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [ML Overview](/ml-finance/ml-overview)
* [Linear Regression](/stat-methods/linear-regression)
* [Portfolio Optimisation](/quant-math/optimization)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)

---

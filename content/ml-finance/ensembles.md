### Ensembles: Bagging, Boosting, and Their Limits

> info **Metadata** Level: Advanced | Prerequisites: Regularisation, Labelling, Purged Cross-Validation | Tags: machine-learning, ensembles, bagging, boosting, random-forest, variance-reduction

An ensemble replaces one model with many and averages them. The appeal in finance is direct: when almost all of a fitted model is estimation noise, averaging independent errors cancels them. A single decision tree fitted to a return series is a machine for memorising accidents; a hundred trees fitted to different subsamples of the same data average most of those accidents away.

The appeal has a hard ceiling, and the ceiling is set by how correlated the base learners are — not by how many there are. Understanding that single equation explains why random forests are configured differently in finance than in other domains, why boosting is more dangerous than bagging here, and why adding the five hundredth tree changes nothing.

---

#### The Variance of an Average

For `B` base learners each with error variance `s^2` and pairwise error correlation `rho`:

```text
Var(ensemble) = rho * s^2 + (1 - rho) * s^2 / B
```

where:

- `s^2` is the error variance of a single base learner
- `rho` is the average pairwise correlation between base-learner errors
- `B` is the number of base learners

The second term vanishes as `B` grows. The first does not. **The irreducible floor is `rho * s^2`.** No amount of averaging can go below it.

---

#### Worked Example: More Trees or Less Correlated Trees?

Take `s^2 = 1` and compare configurations:

<table>
  <tbody>
    <tr><td><strong>rho</strong></td><td><strong>B</strong></td><td><strong>Working</strong></td><td><strong>Ensemble variance</strong></td><td><strong>Reduction</strong></td></tr>
    <tr><td>0.6</td><td>10</td><td>0.6 + 0.4 / 10</td><td>0.640</td><td>36.0%</td></tr>
    <tr><td>0.6</td><td>100</td><td>0.6 + 0.4 / 100</td><td>0.604</td><td>39.6%</td></tr>
    <tr><td>0.6</td><td>1000</td><td>0.6 + 0.4 / 1000</td><td>0.6004</td><td>40.0%</td></tr>
    <tr><td>0.2</td><td>100</td><td>0.2 + 0.8 / 100</td><td>0.208</td><td>79.2%</td></tr>
    <tr><td>0.05</td><td>100</td><td>0.05 + 0.95 / 100</td><td>0.0595</td><td>94.1%</td></tr>
  </tbody>
</table>

Going from 10 trees to 1000 trees at `rho = 0.6` improves variance by 4 percentage points of reduction. Going from `rho = 0.6` to `rho = 0.2` at a fixed 100 trees improves it by 40. Every hour spent decorrelating base learners is worth roughly ten spent adding them.

This reorders the usual hyperparameter priorities. In finance the levers that matter are the ones that lower `rho`:

- **`max_features` set low.** Forcing each split to consider a small random subset of features is the primary decorrelation mechanism in a random forest. With correlated financial features, the default of considering the square root of the feature count is often still too many; `max_features=1` is a defensible setting.
- **Row subsampling below the bootstrap default.** Smaller bags produce more different trees.
- **Shallow trees.** Depth increases each tree's ability to fit the same dominant noise structure, which raises `rho` as well as `s^2`.

---

#### Bagging With Overlapping Labels

The standard bootstrap draws `n` rows with replacement, which contains about `1 - (1 - 1/n)^n = 63.2%` distinct rows for large `n`. That figure assumes the rows are independent observations. Financial labels overlap, so they are not.

From the example in [Labelling](/ml-finance/labelling), three labels spanning six bars had an average uniqueness of 0.667: three rows carrying about two independent observations. A bootstrap that treats them as three will draw near-duplicates repeatedly, so the bags are more similar to one another than the sample size suggests, and `rho` rises exactly where you were trying to lower it.

Two corrections:

1. **Cap the bag size at the average uniqueness.** Setting `max_samples` to roughly the average uniqueness fraction stops the bootstrap from oversampling redundant information.
2. **Sequential bootstrap.** Draw samples one at a time with probability proportional to how little each candidate overlaps what has already been drawn. This is more faithful and considerably slower.

> warning **Out-of-bag scores are not out-of-sample here** A row left out of one bag usually overlaps in time with rows that were included, so it is not held out in any meaningful sense. Treat the out-of-bag score as an in-sample statistic and validate on a purged split instead.

---

#### Bagging Against Boosting

<table>
  <tbody>
    <tr><td><strong></strong></td><td><strong>Bagging / random forest</strong></td><td><strong>Boosting</strong></td></tr>
    <tr><td>Fitting</td><td>Parallel, on independent subsamples</td><td>Sequential, each learner fits the previous residual</td></tr>
    <tr><td>Primarily reduces</td><td>Variance</td><td>Bias</td></tr>
    <tr><td>Behaviour on noise</td><td>Averages it out</td><td>Chases it, with increasing weight</td></tr>
    <tr><td>Overfitting control</td><td>Tree depth, feature subsampling</td><td>Learning rate and early stopping, both critical</td></tr>
    <tr><td>Risk in low signal-to-noise</td><td>Moderate</td><td>High</td></tr>
  </tbody>
</table>

Boosting reduces bias, and in most domains that is what limits performance. In return prediction, bias is not the binding constraint — variance is. Worse, boosting's mechanism actively works against you: each round increases the weight on examples the ensemble currently gets wrong, and in a series that is 99.9% noise, the persistently wrong examples are the pure-noise ones. Left to run, a boosted ensemble drives training error toward zero by memorising them.

This does not make boosting unusable, and gradient-boosted trees are widely used on equity cross-sections. It makes the configuration non-negotiable: a small learning rate, shallow trees, aggressive column and row subsampling, and an early-stopping round selected on a **purged** validation split. Selecting the stopping round on a leaked split will choose far too many rounds, because leakage makes memorisation look like skill.

---

#### Failure Modes on Non-Stationary Data

**Trees cannot extrapolate.** A tree splits on thresholds observed in training and assigns a constant to each leaf. Suppose realised volatility spans 0.005 to 0.030 across the training sample, and deployment arrives with volatility at 0.080. Every tree routes that input to whichever leaf sat at the top of the training range, so the ensemble's prediction for an unprecedented volatility shock is identical to its prediction for the calmest day it saw above 0.03. The model does not fail loudly. It returns a confident, stale answer.

A linear model in the same situation extrapolates, which is also wrong but wrong in a detectable direction. Neither is right; the point is to know which failure you have bought. Rank-transforming or clipping inputs at least makes the tree's behaviour explicit rather than accidental.

**Averaging hides disagreement.** An ensemble reports a mean and discards the spread. When base learners disagree sharply — the usual situation at a regime boundary — the mean is a confident-looking number produced by cancelling opposite views. Report the dispersion of base-learner predictions alongside the mean; it is a free uncertainty estimate and it widens precisely when the model is out of its depth. See [Regimes Overview](/regimes-macro/regimes-overview).

**Ensembles do not fix a wrong label or a leaked feature.** Every base learner sees the same target and the same columns. A hundred trees trained on a leaked feature agree strongly and are all wrong together.

---

#### In Practice Across Asset Classes

**Equities.** Gradient-boosted trees on a cross-section of standardised features are a mainstream production approach. The cross-section supplies the breadth that makes tree flexibility affordable, and rank-based features sidestep the extrapolation problem.

**Futures and FX.** Fewer instruments and heavy mutual correlation mean effective breadth is low. Ensembles here often collapse toward a single averaged rule, which is an argument for using a regularised linear model and being honest about it.

**High frequency.** The strongest case: millions of genuinely independent events per instrument, and event-driven features whose distributions are relatively stable within a venue and a day.

**Credit.** Ensembles are well established for default classification, where the label is an event rather than a return and the base rate is stable enough to learn. See [Default Probability](/credit/default-probability).

**On-chain.** Tree extrapolation failure is acute. Gas prices, pool depths, and volumes routinely move an order of magnitude beyond anything in a training sample, and a forest trained on a quiet period returns its calm-period answer during a liquidation cascade. Log-transform or rank-transform such inputs before they reach a tree, and treat any prediction made outside the training range as unsupported. See [Liquidations](/simulation/liquidations).

---

#### Assumptions and Failure Modes

- **Assumes base-learner errors are partly independent.** Correlated trees hit the `rho * s^2` floor almost immediately, and the ensemble is a slow single model.
- **Assumes bootstrap samples are meaningful draws.** Overlapping labels break this and silently raise `rho`.
- **Assumes inputs stay inside the training range.** Trees clamp outside it and give no warning.
- **Assumes the number of estimators is a safety parameter.** It is not: more trees never overfit in bagging, but they never rescue a poor configuration either. Depth, subsampling, and label quality decide the outcome.
- **Assumes boosting rounds can be selected by validation.** True only if the validation split is purged and embargoed. See [Purged Cross-Validation](/ml-finance/purged-cross-validation).
- **Assumes feature importances from the ensemble are meaningful.** With correlated features they are not, in ways that are easy to misread. See [Interpretability](/ml-finance/interpretability).

---

#### Code

```python
import numpy as np
from sklearn.ensemble import RandomForestClassifier


def ensemble_variance(single_variance, rho, n_estimators):
    """Variance of an averaged ensemble. The rho term is the floor."""
    return rho * single_variance + (1 - rho) * single_variance / n_estimators


print(ensemble_variance(1.0, 0.6, 100))   # 0.604 — decorrelate, do not add trees
print(ensemble_variance(1.0, 0.2, 100))   # 0.208


# Configured for low signal-to-noise, correlated features, overlapping labels.
forest = RandomForestClassifier(
    n_estimators=500,
    max_features=1,                  # one candidate feature per split: decorrelates hard
    max_depth=4,                     # depth buys memorisation, not signal
    min_weight_fraction_leaf=0.05,   # weight-aware, so it respects sample_weight
    bootstrap=True,
    max_samples=0.65,                # ~ average label uniqueness, not the row count
    class_weight="balanced_subsample",
    oob_score=False,                 # out-of-bag rows are entangled; the score lies
    random_state=0,
)

# forest.fit(X_train, y_train, sample_weight=uniqueness_train)

# Base-learner dispersion is a free uncertainty estimate; it widens when the
# ensemble is being asked about conditions it has not seen.
def prediction_dispersion(forest, X):
    per_tree = np.stack([t.predict_proba(X)[:, 1] for t in forest.estimators_])
    return per_tree.mean(axis=0), per_tree.std(axis=0)
```

---

#### See Also

* [Regularisation](/ml-finance/regularisation)
* [Interpretability](/ml-finance/interpretability)
* [Meta-Labelling](/ml-finance/meta-labelling)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [ML Pitfalls](/ml-finance/ml-pitfalls)
* [Correlation Breakdown](/regimes-macro/correlation-breakdown)

---

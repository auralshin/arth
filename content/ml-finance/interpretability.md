### Interpretability and Feature Importance

> info **Metadata** Level: Advanced | Prerequisites: Ensembles, Feature Engineering, Purged Cross-Validation | Tags: machine-learning, interpretability, feature-importance, permutation, shap, leakage-detection

In most applications interpretability is a governance requirement: someone needs to explain why the model declined the loan. In quantitative finance it is a research tool with a more urgent job. When out-of-sample performance is weak and noisy — as it always is — the question "which features is this model actually using?" is often the fastest way to discover that the answer is "a timestamp misalignment".

A model that scores well because it can see the future has a signature. One feature dominates every importance measure, the dominance is stable across folds, and the relationship makes no economic sense. Interpretability is how you read that signature before the strategy reaches capital. Its secondary use — understanding which economic mechanisms the model has latched onto — matters too, but it is the leakage detection that pays for itself.

---

#### Three Ways to Measure Importance

**Mean decrease impurity (MDI).** For tree ensembles, sum the weighted impurity reduction achieved by every split on a feature, across all trees, and normalise so the values sum to 1. It is free (computed during fitting) and it is *in-sample*: it measures how much a feature helped fit the training data, which in a low signal-to-noise setting is largely a measure of how much noise it helped memorise.

MDI is also biased toward features with many distinct values, because a continuous feature offers more candidate split points than a binary one. A pure-noise continuous feature can therefore outscore a genuinely informative categorical one.

**Permutation importance, or mean decrease accuracy (MDA).** Fit the model, then shuffle one column of the *held-out* set and measure how much the score falls:

```text
imp(j) = score(model, X_test, y_test) - mean over R shuffles of score(model, X_test with column j permuted, y_test)
```

This is out-of-sample and model-agnostic, and it is the version that answers a useful question. It must be computed on a purged, embargoed test fold; permuting a column of a leaky validation set measures the leak.

**Shapley-style attribution.** Assign each feature the average marginal contribution it makes to a single prediction, taken over all orderings in which features could be added. The attributions are additive:

```text
prediction(x) = base_value + sum over j of phi_j(x)
```

This is a *local* explanation — it decomposes one prediction rather than ranking features globally — which is what you want when investigating a specific large position the model wants to take.

---

#### Worked Example: The Correlated-Feature Trap

A model is fitted on five features. Two of them, 10-day and 11-day momentum, have a correlation of about 0.98 — statistically one feature measured twice. One feature, `noise_1`, is a continuous random number with no relationship to anything. The figures below are illustrative, chosen to show the mechanism.

<table>
  <tbody>
    <tr><td><strong>Feature</strong></td><td><strong>MDI (in-sample)</strong></td><td><strong>Permutation, one at a time</strong></td><td><strong>Permutation, clustered</strong></td></tr>
    <tr><td>mom_10</td><td>0.14</td><td>0.001</td><td>0.026 (group total)</td></tr>
    <tr><td>mom_11</td><td>0.13</td><td>0.001</td><td>0.026 (same group)</td></tr>
    <tr><td>vol_20</td><td>0.28</td><td>0.030</td><td>0.030</td></tr>
    <tr><td>volume_z</td><td>0.22</td><td>0.018</td><td>0.018</td></tr>
    <tr><td>noise_1</td><td>0.23</td><td>0.000</td><td>0.000</td></tr>
  </tbody>
</table>

Three separate lessons sit in this table.

1. **MDI ranks pure noise third.** `noise_1` scores 0.23 — above both momentum features — because it is continuous, offers many split points, and was useful for carving up the training set. Nothing about that reflects out-of-sample value. Its permutation importance is zero.
2. **Permuting one at a time makes both momentum features look useless.** Shuffling `mom_10` costs almost nothing, because `mom_11` still carries the same information and the model routes around the damage. Shuffling `mom_11` costs nothing for the same reason. Each masks the other, and the naive reading — "momentum contributes nothing" — is exactly wrong.
3. **Clustering fixes it.** Permuting `mom_10` and `mom_11` together destroys the momentum information entirely, and the block scores 0.026 — second only to `vol_20`. Momentum was the model's second most important input all along.

The practical procedure: correlate the feature matrix, cluster features into groups above a correlation threshold, and permute each group as a unit. Report importance per group, not per column. See [PCA](/stat-methods/pca) for the related approach of reducing correlated features before fitting.

> warning **Never read a single-feature importance ranking on correlated features** With redundant columns, individual importances are shared out arbitrarily, and the split is decided by noise. A feature scoring zero may be indispensable; a feature scoring highly may be a duplicate that happened to win the tie.

---

#### Using Interpretability to Detect Leakage

Four diagnostics, in increasing order of effort:

- **Dominance check.** One feature with permutation importance several times larger than every other, in a domain where nothing should be that predictive, is the classic leakage signature. Investigate before celebrating.
- **Extra-lag test.** Shift the suspect feature back by one additional bar and refit. A genuinely predictive feature degrades gradually — a one-bar shift costs some of its edge. A leaked feature collapses to zero, because its power came from being aligned with the label's own bar rather than preceding it.
- **Economic plausibility.** For each of the top few features, state the mechanism in a sentence. "Realised volatility predicts short-horizon mean reversion because market makers widen quotes" is a mechanism. "Feature 47 is important" is not. Features whose importance cannot be narrated are the ones to audit.
- **Local attribution on the extremes.** Take the model's most confident predictions and decompose them with Shapley-style attribution. If the confidence comes overwhelmingly from a single feature on a single date, look at that date's data.

Interpretability also has a monitoring role after deployment. Importance rankings drift when the market does. A model whose top feature changes from volatility to volume over six months has not been retrained into a new regime — it is telling you the old relationship has decayed. See [Regimes Overview](/regimes-macro/regimes-overview) and [Backtest vs Live](/risk/backtest-vs-live).

---

#### In Practice Across Asset Classes

**Equities.** Importance is usually reported per feature *group* — value, momentum, quality, liquidity — because individual columns within a group are highly correlated by construction. This maps naturally onto clustered permutation importance and onto the factor language the rest of the desk already uses. See [Factor Models](/stat-methods/factor-models).

**Futures and FX.** With few instruments, importance estimates are noisy enough that the ranking often reverses between folds. Report importance across every purged fold with its dispersion, not as a single ranked list.

**Credit.** The setting where interpretability is a genuine regulatory obligation as well as a research tool, and where model choice is often constrained to forms whose coefficients can be explained directly.

**On-chain.** Features derived from the same underlying event stream are near-duplicates without looking like it — daily active addresses, transaction count, and gas consumed all measure activity. Clustering is essential, or importance will be scattered across a group that is really one signal. On-chain data is also unusually prone to the dominance signature, because a metric that is only computable after a block is finalised is easy to join at the wrong timestamp. See [Event Logs](/data-tooling/event-logs) and [Wallet Analytics](/data-tooling/wallet-analytics).

---

#### Assumptions and Failure Modes

- **Assumes importance measures causation.** It does not. It measures what the model used, which reflects the sample, the correlation structure, and the fitting procedure as much as any economic relationship.
- **Assumes features are independent.** Almost never true in finance, and the single largest source of misread importance rankings.
- **Assumes the permutation produces plausible rows.** Shuffling one column of a correlated matrix creates feature combinations that could not occur — high momentum with contradictory volatility — so the model is scored on inputs outside its training distribution. Clustered permutation reduces but does not eliminate this.
- **Assumes the test fold is clean.** Importance computed on a leaked split ranks the leak.
- **Assumes the ranking is stable.** In low signal-to-noise data it usually is not. An importance ordering from a single fold is a draw from a wide distribution.
- **Assumes MDI is comparable across feature types.** It is biased toward high-cardinality continuous features and should not be used to compare a continuous feature against a binary flag.

---

#### Code

```python
import numpy as np
import pandas as pd
from scipy.cluster import hierarchy
from scipy.spatial.distance import squareform
from sklearn.metrics import log_loss


def correlation_clusters(X, threshold=0.7):
    """Group features whose absolute correlation exceeds the threshold."""
    corr = X.corr().abs()
    distance = 1.0 - corr
    linkage = hierarchy.linkage(squareform(distance.values, checks=False), "average")
    labels = hierarchy.fcluster(linkage, 1.0 - threshold, criterion="distance")
    return pd.Series(labels, index=X.columns)


def clustered_permutation_importance(model, X_test, y_test, clusters,
                                     n_repeats=20, seed=0):
    """Permute whole correlated groups so members cannot mask one another.

    X_test must come from a purged, embargoed fold — permuting a leaky
    validation set measures the leak, not the feature.
    """
    rng = np.random.default_rng(seed)
    baseline = -log_loss(y_test, model.predict_proba(X_test)[:, 1])
    results = {}

    for cluster_id in sorted(clusters.unique()):
        columns = clusters[clusters == cluster_id].index.tolist()
        drops = []
        for _ in range(n_repeats):
            shuffled = X_test.copy()
            # One shared permutation across the group keeps within-group
            # structure intact while destroying its link to the label.
            order = rng.permutation(len(shuffled))
            shuffled[columns] = shuffled[columns].values[order]
            drops.append(baseline + log_loss(y_test, model.predict_proba(shuffled)[:, 1]))
        results["+".join(columns)] = (np.mean(drops), np.std(drops))

    return pd.DataFrame(results, index=["importance", "std"]).T.sort_values(
        "importance", ascending=False
    )


# Run this per purged fold and report the dispersion across folds.
# A ranking from one fold is a single draw from a wide distribution.
```

---

#### See Also

* [Ensembles](/ml-finance/ensembles)
* [Feature Engineering](/ml-finance/feature-engineering)
* [ML Pitfalls](/ml-finance/ml-pitfalls)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [PCA](/stat-methods/pca)
* [Regression Diagnostics](/stat-methods/regression-diagnostics)

---

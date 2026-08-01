### Meta-Labelling: Separating Side from Size

> info **Metadata** Level: Advanced | Prerequisites: Labelling, Classification metrics, Position Sizing | Tags: machine-learning, meta-labelling, precision-recall, position-sizing, filtering

Most systematic strategies fail not because their direction is wrong but because they take the position too often. A moving-average crossover with a genuine trend-following edge will still fire dozens of times a year in chop, and those trades consume the profit the good ones generate. The natural response is to add filters to the rule until the bad trades disappear, which is how a two-parameter strategy becomes a nine-parameter strategy that only works on the sample it was tuned on.

**Meta-labelling** is the disciplined version of that instinct. It splits the problem in two. A **primary model** — often a simple rule, or an existing strategy already in production — decides the side: long, short, or flat. A **secondary model** then answers a different, binary question: given that the primary model wants to act, would acting have been profitable? The secondary model never chooses direction. It decides whether to act and, through its predicted probability, how large to go.

---

#### The Decomposition

```text
primary   :  features -> side in {-1, 0, +1}
secondary :  features + primary output -> P(this trade is profitable)
position  :  side * size(P)
```

The training set for the secondary model contains only the bars where the primary model fired. The label is binary: `1` if that primary-model trade would have made money after costs, `0` otherwise. Crucially, the primary model's own output — its signal strength, its side, its recent hit rate — is available as a feature to the secondary model.

Why this helps is a statement about learning problems, not about markets. Direction prediction is a symmetric, near-balanced, extremely low signal problem. "Is this particular setup one of the good ones?" is a different problem with a different, often richer, structure: it can depend on volatility regime, liquidity, time of day, or how far the signal has already run — conditions that are far more predictable than direction.

It also changes the objective. The primary model should have **high recall**: catch every real opportunity, and accept a low hit rate. The secondary model supplies **precision**: discard the false positives the primary model deliberately let through.

---

#### Worked Example

A primary model produces 1,000 trade suggestions over a backtest. After costs, 400 would have been profitable and 600 would not. Assume the average winner returns `+1.0%` and the average loser `-0.8%` (a stop set tighter than the target).

**Break-even precision.** The precision `p` at which the strategy makes nothing:

```text
p * 1.0 + (1 - p) * (-0.8) = 0
1.8 * p = 0.8
p = 0.444
```

The primary model's precision is `400 / 1000 = 0.40`, below break-even. Traded as-is it loses money: `400 * 1.0 + 600 * (-0.8) = 400 - 480 = -80` percentage points, or `-0.08%` per trade.

Now a secondary model is fitted on those 1,000 rows and, at its chosen threshold, approves 300 of them, of which 210 are profitable.

<table>
  <tbody>
    <tr><td><strong></strong></td><td><strong>Trade was profitable</strong></td><td><strong>Trade was not</strong></td><td><strong>Total</strong></td></tr>
    <tr><td><strong>Secondary says act</strong></td><td>210</td><td>90</td><td>300</td></tr>
    <tr><td><strong>Secondary says skip</strong></td><td>190</td><td>510</td><td>700</td></tr>
    <tr><td><strong>Total</strong></td><td>400</td><td>600</td><td>1000</td></tr>
  </tbody>
</table>

<table>
  <tbody>
    <tr><td><strong>Metric</strong></td><td><strong>Primary alone</strong></td><td><strong>With meta-model</strong></td></tr>
    <tr><td>Trades taken</td><td>1000</td><td>300</td></tr>
    <tr><td>Precision</td><td>400 / 1000 = 0.400</td><td>210 / 300 = 0.700</td></tr>
    <tr><td>Recall</td><td>400 / 400 = 1.000</td><td>210 / 400 = 0.525</td></tr>
    <tr><td>F1 score</td><td>0.571</td><td>0.600</td></tr>
    <tr><td>Total return</td><td>-80.0 points</td><td>+138.0 points</td></tr>
    <tr><td>Return per trade</td><td>-0.080%</td><td>+0.460%</td></tr>
  </tbody>
</table>

Checking the arithmetic on the filtered book: `210 * 1.0 + 90 * (-0.8) = 210 - 72 = 138`, and `138 / 300 = 0.46%` per trade. That equals the expected value at precision 0.70: `0.7 * 1.0 + 0.3 * (-0.8) = 0.46%`.

Where the improvement came from is worth isolating. The filter gave up 190 winners (`-190` points) and avoided 510 losers (`+510 * 0.8 = +408` points). Net `+218`, which is exactly the swing from `-80` to `+138`. Meta-labelling bought a large reduction in false positives at the price of a moderate reduction in recall — and in a book where losers outnumber winners, that trade is heavily favourable.

Note also that recall fell to 0.525 and the strategy went from losing to profitable. **Recall is not the objective.** A meta-model that improved recall while holding precision at 0.40 would simply lose money faster.

---

#### From Probability to Size

The secondary model outputs a probability, which is a natural sizing input. A common mapping scales linearly from the acceptance threshold:

```text
size = clip((p - threshold) / (1 - threshold), 0, 1)
```

At `threshold = 0.55`, a prediction of 0.70 gives `(0.70 - 0.55) / 0.45 = 0.333` of maximum size; a prediction of 0.95 gives 0.889.

This is deliberately crude. The theoretically correct size for a binary bet paying `b` on a win and losing `a` on a loss is the Kelly fraction:

```text
f = (p * b - q * a) / (a * b)
```

With `p = 0.7`, `q = 0.3`, `b = 0.01`, `a = 0.008` this gives `(0.007 - 0.0024) / 0.00008 = 57.5` — a leverage of 57.5 times capital. The formula is correct and the answer is unusable, because it assumes the 0.8% loss is a hard bound and that `p` is known exactly. Gaps break the first assumption and estimation error breaks the second. See [Kelly Criterion](/quant-math/kelly) and [Position Sizing](/quant-math/position-sizing).

> warning **Predicted probabilities are not calibrated by default** A gradient-boosted classifier's `predict_proba` output ranks well but is often badly calibrated in level. Sizing off an uncalibrated probability sizes off an arbitrary monotone transform of confidence. Check calibration on a purged out-of-sample set before it drives capital.

---

#### What Meta-Labelling Cannot Do

It cannot create directional edge. If the primary model's side is a coin flip conditional on every feature the secondary model can see, then the "profitable" label is also a coin flip and there is nothing to filter. Meta-labelling amplifies an existing edge by concentrating capital into the conditions where it is strongest; it does not manufacture one.

Nor does it remove the multiple-testing problem. Searching over primary rules, then over secondary models, then over thresholds, multiplies the effective number of hypotheses. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### In Practice Across Asset Classes

**Equities.** The most common use is filtering an existing factor or event strategy — taking an earnings-drift signal and learning which announcements it works on, conditioned on liquidity, dispersion, and pre-announcement drift.

**Futures and FX.** Trend-following systems are the classic primary model: high recall by design, a low hit rate by design, and a large population of small losses that a precision filter can attack.

**High-frequency.** The primary model is often a microstructure imbalance signal and the secondary model is effectively an [adverse selection](/execution/adverse-selection) filter — learning which fills are about to be run over.

**On-chain.** A useful primary/secondary split is a strategy rule as primary and a chain-conditions model as secondary, where the secondary learns from gas price, mempool congestion, and pool depth whether the trade is executable at an acceptable cost. This maps naturally onto the fact that on-chain execution failure is a distinct, observable, and partially predictable event. See [Gas and Mempool](/microstructure/gas-mempool) and [MEV Overview](/building-blocks/mev-overview).

---

#### Assumptions and Failure Modes

- **Assumes the primary model has real directional edge.** Without it there is nothing to filter, and any apparent improvement is the secondary model fitting noise.
- **Assumes the secondary label is computed after costs.** Labelling "profitable" on gross return teaches the model to approve trades that lose money net.
- **Assumes probabilities are calibrated if used for sizing.** Uncalibrated output is fine for ranking and wrong for sizing.
- **Assumes the filtered sample is still large enough.** Filtering to 30% of trades cuts the effective sample by the same factor, widening every confidence interval on the result.
- **Assumes the threshold generalises.** The acceptance threshold is a fitted parameter and must be chosen inside the cross-validation loop, not on the full sample. See [Purged Cross-Validation](/ml-finance/purged-cross-validation).
- **Assumes stationarity of the filter.** The conditions under which a signal works are themselves regime-dependent. A filter trained across a trending regime may reject every trade in a mean-reverting one.

---

#### Code

```python
import numpy as np
from sklearn.ensemble import RandomForestClassifier


def build_meta_dataset(features, primary_side, realised_return, cost_per_trade):
    """Rows only where the primary model acted; label is net profitability."""
    acted = primary_side != 0
    net = primary_side[acted] * realised_return[acted] - cost_per_trade
    X = features[acted].copy()
    X["primary_side"] = primary_side[acted]   # the primary's own view is a feature
    return X, (net > 0).astype(int)


def size_from_probability(prob, threshold=0.55):
    """Linear ramp from the acceptance threshold to full size."""
    return np.clip((prob - threshold) / (1.0 - threshold), 0.0, 1.0)


meta_model = RandomForestClassifier(
    n_estimators=500,
    max_depth=4,          # the meta problem is small; depth buys overfitting
    class_weight="balanced_subsample",
    min_weight_fraction_leaf=0.05,
    random_state=0,
)

# X_meta, y_meta = build_meta_dataset(...)
# Fit and threshold-select inside a purged split — see purged-cross-validation.
# meta_model.fit(X_train, y_train, sample_weight=uniqueness_train)
# position = primary_side * size_from_probability(meta_model.predict_proba(X_test)[:, 1])
```

---

#### See Also

* [Labelling](/ml-finance/labelling)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [Ensembles](/ml-finance/ensembles)
* [Position Sizing](/quant-math/position-sizing)
* [Dynamic Sizing](/strategies/dynamic-sizing)
* [What Is a Trading Signal?](/signals/what-is-signal)

---

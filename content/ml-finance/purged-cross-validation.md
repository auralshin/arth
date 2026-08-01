### Purged Cross-Validation

> info **Metadata** Level: Advanced | Prerequisites: Labelling, Autocorrelation, Cross-validation basics | Tags: machine-learning, cross-validation, leakage, purging, embargo, walk-forward

Standard k-fold cross-validation assumes samples are independent and identically distributed. Financial samples are neither. Labels are computed over forward windows that overlap, features are computed over backward windows that overlap, and returns are serially correlated. Under those conditions a shuffled k-fold split places a training sample and a test sample that share most of their information in different folds and then reports the resulting agreement as out-of-sample skill.

The effect is not subtle. A model with no predictive ability at all can post a strong shuffled-k-fold score purely because a training row at bar 100 and a test row at bar 101 are near-duplicates. The fix has two parts, both mechanical: **purging** removes training samples whose labels overlap the test labels in time, and an **embargo** removes a further block after the test window to account for serial correlation and feature lookbacks.

---

#### The Information Footprint of a Sample

A financial training row is not a point in time. It occupies an interval:

```text
feature footprint:  [t - lookback, t]      bars the features were computed from
label footprint:    [t, t_resolved]        bars the label outcome depends on
```

Two samples are entangled if their footprints intersect. Cross-validation is only honest when no training sample is entangled with any test sample.

For a setup with a 10-bar feature lookback and a label resolving up to 5 bars ahead:

```text
sample at bar t:  features from bars (t - 9) to t
                  label depends on bars t to (t + 5)
```

---

#### Worked Example: Exactly Which Rows Leak

Take 200 daily bars, a 4-fold split into blocks of 50, and the third fold as the test set: bars 101 to 150. The test fold's label footprint runs from bar 101 to bar 155, because the sample at bar 150 has a label that resolves as late as bar 155.

<table>
  <tbody>
    <tr><td><strong>Bar</strong></td><td><strong>Feature window</strong></td><td><strong>Label window</strong></td><td><strong>Fold</strong></td><td><strong>Action and reason</strong></td></tr>
    <tr><td>95</td><td>86 to 95</td><td>95 to 100</td><td>train</td><td>Keep. Label resolves at 100, before the test labels begin.</td></tr>
    <tr><td>96</td><td>87 to 96</td><td>96 to 101</td><td>train</td><td>Purge. Its label outcome depends on bar 101, inside the test fold.</td></tr>
    <tr><td>100</td><td>91 to 100</td><td>100 to 105</td><td>train</td><td>Purge. Label overlaps bars 101 to 105 of the test fold.</td></tr>
    <tr><td>101</td><td>92 to 101</td><td>101 to 106</td><td>test</td><td>First test row. Its features look back into training data, which is fine — that is what happens live.</td></tr>
    <tr><td>150</td><td>141 to 150</td><td>150 to 155</td><td>test</td><td>Last test row. Extends the test label footprint to bar 155.</td></tr>
    <tr><td>151</td><td>142 to 151</td><td>151 to 156</td><td>train</td><td>Purge. Label window overlaps the test label footprint, which ends at 155.</td></tr>
    <tr><td>155</td><td>146 to 155</td><td>155 to 160</td><td>train</td><td>Purge. Last row removed by label overlap.</td></tr>
    <tr><td>156</td><td>147 to 156</td><td>156 to 161</td><td>train</td><td>Embargo. Label no longer overlaps, but its features average over bars 147 to 150 of the test fold.</td></tr>
    <tr><td>159</td><td>150 to 159</td><td>159 to 164</td><td>train</td><td>Embargo. Feature window still touches bar 150.</td></tr>
    <tr><td>160</td><td>151 to 160</td><td>160 to 165</td><td>train</td><td>Keep. First clean row after the test fold.</td></tr>
  </tbody>
</table>

The usable training set is bars 1 to 95 and 160 to 200: 136 rows out of the 150 non-test rows. Purging removed 10 (bars 96 to 100 and 151 to 155) and the embargo removed 4 more (156 to 159). Losing 14 rows to buy an honest estimate is a good trade; running the split without them means the reported score is measuring memorisation.

> warning **Sequential splitting alone is not sufficient** `TimeSeriesSplit` in scikit-learn respects time ordering but performs no purging and no embargo. With overlapping labels it still trains on rows whose outcomes are determined inside the test window. `KFold(shuffle=True)` on a time series is worse still and should never appear in this context.

**Choosing the embargo length.** The embargo must be at least the longest feature lookback in the model, or feature windows still reach into the test period. Beyond that, serial correlation in returns means a training sample shortly after the test window carries residual information about it, so practitioners commonly extend the embargo further — expressed as a fixed number of bars or a small percentage of total sample length. Longer is safer and costs only training rows.

---

#### Combinatorial Purged Cross-Validation

A single train/test partition gives one estimate of out-of-sample performance, which is itself a noisy number. **Combinatorial purged cross-validation (CPCV)** splits the sample into `N` contiguous groups and uses every combination of `k` groups as the test set, purging and embargoing each time.

```text
splits = C(N, k)
paths  = k * C(N, k) / N
```

With `N = 6` and `k = 2` this gives `C(6, 2) = 15` splits. Each group appears in the test set in `C(5, 1) = 5` of them, so the out-of-sample predictions can be reassembled into 5 complete, non-overlapping backtest paths.

That is the real value: instead of one equity curve you get a distribution of them. A strategy whose 5 paths show Sharpe ratios clustered around 0.9 is a different proposition from one whose paths span -0.3 to 2.1 with the same mean. The second is a coin flip that happened to land well in the single split you would otherwise have reported. See [Backtest Overfitting](/stat-methods/backtest-overfitting) and [Bootstrap](/stat-methods/bootstrap).

---

#### Choosing a Scheme

<table>
  <tbody>
    <tr><td><strong>Scheme</strong></td><td><strong>Uses future data in training</strong></td><td><strong>Estimates produced</strong></td><td><strong>Best for</strong></td></tr>
    <tr><td>Shuffled k-fold</td><td>Yes, and leaks badly</td><td>k</td><td>Nothing in finance</td></tr>
    <tr><td>Walk-forward</td><td>No</td><td>1 path</td><td>Final validation; mirrors deployment exactly</td></tr>
    <tr><td>Purged k-fold</td><td>Yes, but not entangled</td><td>k</td><td>Model selection with limited history</td></tr>
    <tr><td>CPCV</td><td>Yes, but not entangled</td><td>Many paths</td><td>Assessing the variance of the result</td></tr>
  </tbody>
</table>

**Walk-forward** trains on everything up to a point and tests on what follows, then rolls forward. It is the only scheme that never trains on data later than the test period, so it is the closest analogue of live deployment and the right final check. Its weaknesses are that early folds are trained on very little data, and it produces a single path, so the final number carries all the estimation noise of one draw.

Purged k-fold and CPCV do train on data after the test fold. This is acceptable for *model selection* — comparing hyperparameters, choosing a feature set — because the question there is which configuration generalises, not what the live P&L would have been. It is not acceptable as the headline performance claim. Report walk-forward for that.

---

#### In Practice Across Asset Classes

**Equities.** Cross-sectional panels need purging on the *time* axis, not the row axis: all names on the same date share a footprint, so a fold boundary must fall between dates, never inside one.

**Futures and FX.** Embargo lengths need to accommodate contract rolls and weekend gaps. A five-bar label around a roll date can span a week of calendar time.

**Credit.** Label windows are long — months to years for a default label — so purge regions swallow a large fraction of the sample. With very long labels, purged k-fold can leave almost no training data and walk-forward on wider blocks is usually the only workable scheme.

**On-chain.** Block times give fine-grained timestamps, which makes footprints easy to compute precisely, but be careful that the timestamp used is block time and not indexer ingestion time. Short histories mean folds are few, so CPCV's path distribution is especially valuable for showing how wide the uncertainty really is. See [Data Pipeline](/data-tooling/pipeline).

---

#### Assumptions and Failure Modes

- **Assumes footprints are known.** If the label resolution bar is not recorded at labelling time, purging cannot be computed and any implementation is guessing. Record it. See [Labelling](/ml-finance/labelling).
- **Assumes the embargo covers all lookbacks.** A single feature with a 250-bar window inside a model embargoed for 10 bars reintroduces leakage for that feature alone.
- **Assumes preprocessing is inside the fold.** Purging the split and then fitting a scaler on the full sample leaves the leak intact. See [Feature Engineering](/ml-finance/feature-engineering).
- **Assumes one pass.** Repeatedly adjusting the model after seeing purged out-of-sample scores turns the test set into a training set. The number of times the test set has been consulted is part of the result. See [Multiple Testing](/stat-methods/multiple-testing).
- **Assumes stationarity across folds.** Even a perfectly purged fold from a different regime may be uninformative about the next one. Purging removes leakage, not regime risk. See [Regimes Overview](/regimes-macro/regimes-overview).
- **Does not fix survivorship or point-in-time errors.** Those are properties of the dataset, and no split scheme can detect them.

> info **A cheap leakage detector** Shuffle the labels, keeping features and the split scheme unchanged, and refit. Out-of-sample performance should collapse to chance. If it does not, something in the pipeline is carrying information the split does not know about.

---

#### Code

```python
import numpy as np


def purged_splits(label_start, label_end, n_splits=5, embargo=0):
    """Purged and embargoed k-fold splits for time-extended samples.

    label_start / label_end are integer bar positions describing when each
    label begins and when its outcome is finally determined. Rows must be
    in chronological order. `embargo` must be at least the longest feature
    lookback in the model, otherwise feature windows still touch the test fold.
    """
    label_start = np.asarray(label_start)
    label_end = np.asarray(label_end)
    n = len(label_start)

    for test_idx in np.array_split(np.arange(n), n_splits):
        test_lo = label_start[test_idx].min()
        test_hi = label_end[test_idx].max()

        # Purge: any training label whose life intersects the test labels' life.
        overlaps = (label_end >= test_lo) & (label_start <= test_hi)
        # Embargo: serial correlation and feature lookbacks just after the fold.
        embargoed = (label_start > test_hi) & (label_start <= test_hi + embargo)

        train_idx = np.where(~(overlaps | embargoed))[0]
        yield train_idx, test_idx


# Reproduces the worked example above.
bars = np.arange(1, 201)
train, test = list(purged_splits(bars, bars + 5, n_splits=4, embargo=4))[2]
print(test.min() + 1, test.max() + 1)          # test bars 101 to 150
print(train[train < test.min()].max() + 1)     # last clean bar before: 95
print(train[train > test.max()].min() + 1)     # first clean bar after: 160


# The splitter plugs directly into scikit-learn's cross-validation helpers:
# from sklearn.model_selection import cross_val_score
# cv = list(purged_splits(label_start, label_end, n_splits=5, embargo=10))
# scores = cross_val_score(pipeline, X, y, cv=cv, scoring="neg_log_loss")
```

---

#### See Also

* [ML Pitfalls](/ml-finance/ml-pitfalls)
* [Labelling](/ml-finance/labelling)
* [Regularisation](/ml-finance/regularisation)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Why Backtest](/simulation/why-backtest)
* [Backtest vs Live](/risk/backtest-vs-live)

---

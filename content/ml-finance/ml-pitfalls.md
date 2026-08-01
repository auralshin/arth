### The Pitfall Catalogue

> info **Metadata** Level: Intermediate | Prerequisites: ML Overview, Purged Cross-Validation, Multiple Testing | Tags: machine-learning, leakage, lookahead-bias, survivorship, overfitting, p-hacking

Every failure in this catalogue produces the same symptom: an excellent backtest followed by disappointing live performance. That is the whole difficulty. The errors do not announce themselves as errors — they announce themselves as results, and a result is exactly what everyone involved wants to see. By the time the discrepancy appears in live P&L, months of work and some capital have been committed.

The defence is procedural rather than clever. Each pitfall below has a specific detection test and a specific fix, and the tests are cheap enough to run before the research is finished rather than after. This page consolidates what the rest of the section covers in depth; treat it as the checklist, not the explanation.

---

#### The Catalogue

<table>
  <tbody>
    <tr><td><strong>Pitfall</strong></td><td><strong>How it shows up</strong></td><td><strong>Detection</strong></td><td><strong>Fix</strong></td></tr>
    <tr><td>Lookahead bias</td><td>Data used before it was knowable: publication lags, restatements, adjusted prices</td><td>Re-run with every feature lagged one extra bar; a genuine edge degrades gradually, a leak collapses</td><td>Point-in-time database; join on availability time, not reference time</td></tr>
    <tr><td>Survivorship bias</td><td>Universe built from entities that still exist; failures silently absent</td><td>Count universe members per date — a flat or rising count over a crisis period is the tell</td><td>Point-in-time universe with delisted and defunct members retained</td></tr>
    <tr><td>Feature leakage</td><td>Centred windows, backward fill, scalers fitted on the full panel</td><td>Shuffle the labels and refit; any above-chance score is leakage</td><td>Trailing windows only; all fitted transforms inside the CV fold</td></tr>
    <tr><td>Cross-validation leakage</td><td>Shuffled k-fold, or sequential splits without purging overlapping labels</td><td>Compare shuffled k-fold against a purged split; a large gap is the leak</td><td>Purging and embargo</td></tr>
    <tr><td>Backtest overfitting</td><td>Parameters tuned until the equity curve looks right</td><td>Sensitivity to small parameter changes; performance across CPCV paths</td><td>Fewer parameters, wider grids, out-of-sample held genuinely out</td></tr>
    <tr><td>Model-search p-hacking</td><td>Many configurations tried, best reported, count of trials not disclosed</td><td>Compare the winner's t-statistic against the expected maximum for the search size</td><td>Log every trial; deflate the reported statistic by the trial count</td></tr>
    <tr><td>Unrealistic execution</td><td>Fills at the decision price, unlimited size, no borrow or funding cost</td><td>Re-run with doubled costs; if the result inverts, the edge was in the assumption</td><td>Model spread, impact, and rejection explicitly</td></tr>
    <tr><td>Regime dependence</td><td>Strong result driven by one episode in the sample</td><td>Performance by sub-period; drop the best year and re-check</td><td>Require the result to hold across regimes, not on average</td></tr>
  </tbody>
</table>

---

#### Worked Example: Where Lookahead Enters a Fundamental Join

A quarterly figure has three distinct dates attached to it, and most vendor tables store only two.

<table>
  <tbody>
    <tr><td><strong>Date</strong></td><td><strong>Meaning</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Fiscal period end</td><td>What the figure describes</td><td>2024-03-31</td></tr>
    <tr><td>Actual publication</td><td>When the market could first see it</td><td>2024-05-08</td></tr>
    <tr><td>Vendor row timestamp</td><td>What the table is indexed on</td><td>2024-03-31</td></tr>
    <tr><td>Restatement</td><td>When the figure was later corrected, overwriting the original</td><td>2024-11-12</td></tr>
  </tbody>
</table>

Joining the feature on the vendor row timestamp makes the figure available from 2024-03-31 when it was actually available from 2024-05-08 — 38 days of foresight granted to every row, on a number the market spends considerable effort forecasting. The restatement compounds it: the value stored against 2024-03-31 today is the corrected one, which nobody could have known until November. The correct join is an as-of merge on publication time, with strictly-earlier matching so a figure released at the same instant as the decision is not treated as available. See the code below, and [Feature Engineering](/ml-finance/feature-engineering) for the wider category.

> warning **The same error, three ways** Adjusted price series apply splits and dividends retroactively. Macro series are revised months later. Index membership files list today's members against historical dates. All three look like ordinary data and all three encode the future.

---

#### Worked Example: The Arithmetic of Model Search

A research process tries 4 feature sets, 5 lookback windows, 3 model families, and 6 hyperparameter values: `4 * 5 * 3 * 6 = 360` configurations. Only the best is reported. For `N` independent tests of a true null, the largest `t`-statistic grows roughly like `sqrt(2 * ln(N))`. That expression is an asymptotic upper approximation and overstates the true expectation at realistic `N` — [Backtest Overfitting](/stat-methods/backtest-overfitting) gives a tighter one — but it is the right order of magnitude and errs on the conservative side as a hurdle.

<table>
  <tbody>
    <tr><td><strong>Configurations tried</strong></td><td><strong>Approximate best t-statistic under the null</strong></td><td><strong>Family-wise error rate at alpha = 0.05</strong></td></tr>
    <tr><td>1</td><td>0.00</td><td>0.05</td></tr>
    <tr><td>100</td><td>3.03</td><td>0.994</td></tr>
    <tr><td>360</td><td>3.43</td><td>almost 1</td></tr>
    <tr><td>1000</td><td>3.72</td><td>almost 1</td></tr>
  </tbody>
</table>

The family-wise error rate for 100 independent tests is `1 - 0.95^100 = 0.994`: a 99.4% chance of at least one apparently significant result even when nothing works. So a reported `t` of 3.1 from a 360-configuration search is in the range pure chance delivers routinely. It is not weak evidence of an edge — it is no evidence of one. The conventional threshold of 2 is meaningless once the trial count is in the hundreds, and the trial count is almost never reported. Count it yourself: every abandoned notebook cell is a trial. See [Multiple Testing](/stat-methods/multiple-testing) and [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Worked Example: How Costs Consume an Edge

A daily-rebalanced model shows a gross edge of 12 basis points per trade and a gross annualised Sharpe ratio of 2.0. Realistic frictions: 2 basis points of half-spread crossed on entry and again on exit, plus 4 basis points of market impact and fees over the round trip.

Costs of this kind are close to deterministic, so they reduce the mean without materially changing the volatility. The Sharpe ratio therefore scales with the ratio of net to gross mean:

```text
gross edge per trade = 12 bps
round-trip cost      = 4 + 4 = 8 bps
net edge per trade   = 4 bps
net Sharpe           = 2.0 * (4 / 12) = 0.67
```

Two thirds of the result was an execution assumption. And the sensitivity is brutal: if the true cost is 10 basis points rather than 8, the net edge falls to 2 basis points and the Sharpe to 0.33. A strategy whose ranking depends on a cost estimate accurate to 2 basis points has not been validated. See [Transaction Cost Analysis](/execution/transaction-cost-analysis) and [Market Impact](/execution/market-impact).

---

#### A Pre-Flight Checklist

Run all of these before the result is presented to anyone:

1. **Shuffle the labels** and refit through the whole pipeline. Any above-chance out-of-sample score means leakage somewhere upstream of the model.
2. **Lag every feature one extra bar.** Genuine edges degrade smoothly; leaks vanish.
3. **Double the transaction costs.** If the conclusion inverts, the conclusion was about costs.
4. **Drop the best-performing year** and re-check. One episode should not carry the result.
5. **Count the configurations tried**, including abandoned ones, and compare the winning statistic against `sqrt(2 * ln(N))`.
6. **Check the universe count by date.** A universe that never shrinks through a crisis is survivorship-biased.
7. **Report the dispersion across CPCV paths**, not a single equity curve. See [Purged Cross-Validation](/ml-finance/purged-cross-validation).
8. **Narrate the top features economically.** If nobody can state the mechanism, audit them. See [Interpretability](/ml-finance/interpretability).

---

#### In Practice Across Asset Classes

**Equities.** Survivorship and point-in-time universe construction are the dominant issues, along with fundamental publication lags. Corporate actions applied retroactively also generate lookahead in any price-derived feature.

**Futures, FX, and rates.** The roll convention is a hidden assumption: back-adjusted series are not tradable prices, so percentage returns computed on one far back in history are returns on a number that never existed. Macro data revisions are the other standard trap — the figure in the database is the revised one; the market traded the first print.

**Credit.** Stale marks on illiquid instruments create artificial autocorrelation, which suppresses measured volatility, inflates Sharpe ratios, and makes serial-correlation-aware cross-validation more important rather than less.

**On-chain.** A distinct set of traps. Chain reorganisations make recent blocks provisional, so a feature computed on unfinalised data may later change. Indexer ingestion timestamps differ from block timestamps, and joining on the wrong one grants foresight. Protocol upgrades redefine metrics mid-series. Execution assumptions are the most frequently violated: a backtested swap that ignores price impact on the pool, gas cost, transaction failure, and sandwiching bears little relation to the executed trade. See [Slippage and Frontrunning](/risk/slippage-frontrunning), [MEV Overview](/building-blocks/mev-overview), and [Data Pipeline](/data-tooling/pipeline).

---

#### Assumptions and Failure Modes

- **Assumes the pitfalls are independent.** They are not, and they compound. Leakage inflates the score, which makes an overfitted configuration look validated, which survives a search whose size was never counted.
- **Assumes the checks are run once.** Running them after each iteration and adjusting the model in response turns the checks themselves into a fitting procedure.
- **Assumes a clean backtest implies a viable strategy.** It implies only that these specific errors are absent. Capacity, regime risk, and crowding are separate questions. See [Backtest vs Live](/risk/backtest-vs-live).
- **Assumes costs are estimable.** For thin instruments, in stressed markets, or at size, historical cost estimates understate what a live order pays.
- **Assumes the researcher wants to find the error.** This is the weakest assumption on the page. Incentives run the other way, which is why the checks should be automated into the pipeline rather than left to discipline.

---

#### Code

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import cross_val_score


def point_in_time_join(decisions, facts):
    """Attach a fact to a decision only if it had already been published.

    `facts` is keyed on published_at — when the market could first see the
    value — not on the period the value describes. allow_exact_matches=False
    rejects a value stamped at the same instant as the decision, because
    same-instant availability is an assumption rather than a fact.
    """
    return pd.merge_asof(
        decisions.sort_values("exec_time"),
        facts.sort_values("published_at"),
        left_on="exec_time", right_on="published_at", by="asset",
        direction="backward", allow_exact_matches=False,
    )


def shuffle_label_check(pipeline, X, y, cv, scorer, seed=0):
    """Refit on permuted labels; out-of-sample score should collapse to chance.

    The highest-value test on this page: it catches feature leakage, split
    leakage, and preprocessing leakage at once, without needing to know which.
    """
    y_shuffled = y.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    return cross_val_score(pipeline, X, y_shuffled, cv=cv, scoring=scorer)


def expected_best_t_statistic(n_configurations):
    """Conservative approximation to the best t-stat under the null across N trials."""
    return float(np.sqrt(2.0 * np.log(n_configurations)))


print(round(expected_best_t_statistic(360), 2))   # 3.43
```

---

#### See Also

* [ML Overview](/ml-finance/ml-overview)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [Feature Engineering](/ml-finance/feature-engineering)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Backtest vs Live](/risk/backtest-vs-live)

---

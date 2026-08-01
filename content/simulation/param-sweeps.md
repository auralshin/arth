### Parameter Sweeps and Sensitivity Analysis

> info **Metadata** Level: Advanced | Prerequisites: Hypothesis Testing, Sharpe Ratio, Why Backtest | Tags: overfitting, multiple-testing, robustness, backtesting, research-process

A parameter sweep runs the same strategy across a grid of settings — lookbacks, thresholds, holding periods, stop levels — and reports the results. It is the most natural thing in the world to do, and it is a **multiple-comparisons machine**. Every additional configuration is another draw from a distribution, and the maximum of many draws is larger than the mean of one even when there is nothing there to find. If you sweep and then report the best cell, you have not measured a strategy. You have measured how hard you searched.

This is not a reason to avoid sweeps. It is a reason to change what you take from them. The useful output of a sweep is not the winning configuration; it is the *shape of the surface*. A broad plateau on which many neighbouring settings behave similarly is evidence of a robust effect. A single spike surrounded by mediocrity is evidence of nothing, and reporting the spike converts a search artefact into a claim. Sensitivity analysis is the discipline of reading the surface instead of its maximum.

---

#### Formal Definition

Suppose you evaluate `N` configurations, each producing a test statistic. Under the null hypothesis that none has any edge, with independent tests at significance level `alpha`:

```text
E[false positives]  =  N * alpha
FWER               =  1 - (1 - alpha)^N
```

where:

- `N` is the number of configurations tested — including every one you ran and discarded
- `alpha` is the per-test significance level
- `FWER` is the family-wise error rate: the probability of at least one false positive

More usefully, if the `N` statistics are approximately independent standard normals under the null, the expected maximum grows as:

```text
E[max of N draws]  ~=  sqrt(2 * ln(N))
```

and a t-statistic converts to an annualised Sharpe ratio over `T` years by:

```text
t  ~=  Sharpe * sqrt(T)      so      Sharpe_from_noise  ~=  sqrt(2 * ln(N)) / sqrt(T)
```

This last expression is the one worth internalising. It tells you what Sharpe ratio pure noise will hand you, given how many configurations you tried and how long your sample is — before any real edge is involved.

> warning **N includes every test you ever ran** Not just the ones in the final grid. Configurations abandoned in week one, universes you swapped, features you dropped, and date ranges you shortened all count. `N` is a property of the research process, not of the last script you executed.

---

#### Worked Example

A sweep over three parameters: 12 lookback lengths, 8 entry thresholds and 5 holding periods, evaluated on a sample 10 years long. Suppose — this is the null we are testing against — that none of the configurations has any genuine edge.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Configurations tested</td><td>12 * 8 * 5 = 480</td></tr>
    <tr><td>Sample length</td><td>10 years</td></tr>
    <tr><td>Per-test significance level</td><td>0.05</td></tr>
  </tbody>
</table>

Step by step:

1. **Expected false positives** at `alpha = 0.05`: `480 * 0.05 = 24` configurations will look significant with no edge present
2. **Family-wise error rate**: `1 - 0.95^480 = 0.99999999998`, so a false positive is effectively certain
3. **Expected best t-statistic from noise**: `sqrt(2 * ln(480)) = sqrt(2 * 6.174) = sqrt(12.348) = 3.51`
4. **Implied Sharpe of that noise winner** over 10 years: `3.51 / sqrt(10) = 3.51 / 3.16 = 1.11`
5. **Bonferroni-corrected threshold**: `0.05 / 480 = 0.000104`, which corresponds to a t-statistic near 3.9

The interpretation is uncomfortable and important. Sweeping 480 configurations over a decade of data produces, from noise alone, a best result with an annualised Sharpe around 1.11. That is a number most research reviews would treat as a promising strategy. On a 5-year sample the same search yields `3.51 / sqrt(5) = 1.57` from noise, which is a number many would treat as excellent.

None of this proves your best cell is spurious. It establishes the baseline you have to clear. A backtest reporting a Sharpe of 1.2 from a 480-cell sweep on 10 years of data has, on this arithmetic, produced approximately what an edgeless strategy would.

---

#### Corrections and What They Cost

<table>
  <tbody>
    <tr><td><strong>Approach</strong></td><td><strong>Controls</strong></td><td><strong>Cost</strong></td></tr>
    <tr><td>Bonferroni: use alpha / N</td><td>Family-wise error rate</td><td>Very conservative when tests are correlated, and sweeps are highly correlated</td></tr>
    <tr><td>Benjamini-Hochberg</td><td>False discovery rate</td><td>Less strict, but the answer is a set of candidates, not a winner</td></tr>
    <tr><td>Effective number of tests</td><td>Approximates the correlation structure</td><td>Requires estimating how many independent bets the grid really contains</td></tr>
    <tr><td>Deflated Sharpe ratio</td><td>Adjusts the reported Sharpe for the number of trials and non-normality</td><td>Needs an honest count of trials, which nobody keeps by default</td></tr>
    <tr><td>Held-out data</td><td>Selection effects, if used exactly once</td><td>Consumed on first use; a second look makes it in-sample</td></tr>
    <tr><td>Walk-forward with purging</td><td>Selection plus serial dependence</td><td>Expensive; also the most honest picture available</td></tr>
  </tbody>
</table>

The full treatment of these lives in [Multiple Testing](/stat-methods/multiple-testing) and [Backtest Overfitting](/stat-methods/backtest-overfitting), which covers the deflated Sharpe ratio and the probability of backtest overfitting. For the cross-validation machinery that keeps train and test genuinely separate under serial correlation, see [Purged Cross-Validation](/ml-finance/purged-cross-validation).

---

#### Reading the Surface Instead of the Maximum

**Plateau over spike.** Plot the metric against each parameter. If performance degrades smoothly as you move away from the best cell, the effect is at least continuous in the parameter. If the best cell's neighbours are unremarkable, the maximum is a coincidence.

**Report the neighbourhood, not the peak.** A defensible summary is the median of the top decile of configurations, or the value at the centre of the best-performing contiguous region. Both are far more stable out of sample than the argmax.

**Check parameter interpretability.** A lookback of 20 days and one of 21 should not differ materially. If they do, the sweep is resolving noise, and the grid is finer than the data can support.

**Vary the assumptions too.** Sweep cost, latency and slippage alongside the strategy parameters. A configuration that wins only at the most generous cost assumption is telling you about the cost model, not the signal.

**Sweep the sample, not only the parameters.** Rerun on subperiods and on a block bootstrap of the return series. A result that appears in one subperiod and vanishes in the others is a subperiod result. See [Bootstrap Methods](/stat-methods/bootstrap).

**Log every run.** Store `N` honestly — every configuration, every abandoned variant. Without that count, no correction above can be applied, and the reported Sharpe cannot be deflated.

---

#### In Practice Across Asset Classes

**Daily equities.** The grid multiplies fast because the universe is a parameter too: sector filters, size cuts, liquidity screens. Sweeping universes is a particularly effective way to overfit, because it changes the sample rather than the rule.

**Intraday futures.** Many observations, but far fewer *independent* ones — intraday returns are serially dependent, so the effective sample is much smaller than the row count. This makes the `sqrt(T)` denominator above optimistic, and the noise Sharpe correspondingly higher than it looks.

**FX.** With few genuinely independent currency pairs, cross-sectional variants are highly correlated. Testing a rule on 20 pairs is nowhere near 20 independent tests, so a naive Bonferroni correction is too strict and no correction at all is far too lax.

**Fixed income and credit.** Slow-moving series mean very few independent observations per year. Ten years of monthly data is 120 points; a 480-cell sweep on 120 points is not a search, it is a curve fit.

**On-chain strategies.** Samples are short in calendar terms and the market structure changes underneath them, so both `T` and stationarity work against you. Sweeps here need the harshest deflation. See [On-Chain Data in Backtests](/simulation/onchain-data).

---

#### Assumptions and Failure Modes

- **Tests are independent.** Assumes the `N * alpha` and `sqrt(2 ln N)` arithmetic applies directly. Sweep cells are heavily correlated, so the true effective `N` is smaller than the grid size — but it is also never 1, which is what reporting the best cell implicitly assumes.
- **`N` is known.** Assumes the trial count was recorded. In practice researchers underreport by a wide margin because abandoned variants are forgotten. Any correction applied to an undercounted `N` is itself optimistic.
- **The metric is normally distributed.** Assumes the `sqrt(2 ln N)` result applies. Sharpe ratios from skewed, fat-tailed returns are not normal, and the maximum of fat-tailed draws is larger still.
- **Held-out data stays held out.** Assumes one look. Every subsequent look folds it into the training set, silently.
- **Parameters are the only thing being swept.** Assumes feature choice, universe and date range are fixed. They usually are not, and each is a hidden multiplier on `N`.
- **A plateau implies robustness.** Assumes the plateau is not itself an artefact of a smooth but spurious relationship in one sample. Plateaux are necessary evidence, not sufficient.

> warning **Educational content, not advice** Nothing here identifies a strategy or parameter worth trading. The purpose of this page is to describe how a search process manufactures apparent edge.

---

#### Code

Rather than returning the best cell, this reports the noise baseline and summarises the neighbourhood.

```python
import math
import numpy as np


def noise_baseline_sharpe(n_configurations, years_of_data):
    """Sharpe a sweep of this size produces from pure noise.

    Assumes independent tests, so it understates the baseline when the
    grid is correlated in a way that leaves few effective bets, and
    overstates it when cells are near-duplicates. Use it as a floor
    to clear, not as a precise threshold.
    """
    expected_max_t = math.sqrt(2.0 * math.log(n_configurations))
    return expected_max_t / math.sqrt(years_of_data)


def summarise_sweep(results, top_fraction=0.1):
    """Neighbourhood summary of a sweep.

    `results` maps a parameter tuple to a metric. The argmax is reported
    only so it can be compared with the far more stable decile median.
    """
    ordered = sorted(results.items(), key=lambda kv: kv[1], reverse=True)
    cutoff = max(1, int(len(ordered) * top_fraction))
    top = [value for _, value in ordered[:cutoff]]

    return {
        "n_configurations": len(ordered),
        "best_config": ordered[0][0],
        "best_metric": ordered[0][1],
        "top_decile_median": float(np.median(top)),
        "all_config_median": float(np.median(list(results.values()))),
        # Fraction of the grid that is positive: a real effect lifts the
        # whole surface, an artefact lifts one cell.
        "share_positive": float(np.mean(np.array(list(results.values())) > 0)),
    }


print(round(noise_baseline_sharpe(480, 10), 2))   # 1.11
print(round(noise_baseline_sharpe(480, 5), 2))    # 1.57
```

---

#### See Also

* [Multiple Testing](/stat-methods/multiple-testing)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [Bootstrap Methods](/stat-methods/bootstrap)
* [Performance Metrics for Backtests](/simulation/metrics)
* [Backtest vs Live](/risk/backtest-vs-live)

---

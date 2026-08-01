### Multiple Testing

> info **Metadata** Level: Intermediate | Prerequisites: Hypothesis Testing | Tags: multiple-comparisons, fwer, bonferroni, fdr, data-mining, research-process

A test at the 5% level is designed to produce a false positive one time in twenty. Run twenty independent tests on pure noise and you should expect one significant result. Run a thousand and you should expect fifty. The individual test worked exactly as specified; the interpretation of "significant" did not survive contact with the search.

This is not an edge case in quantitative finance — it is the default condition. A parameter sweep, a factor screen, a [cointegration](/stat-methods/cointegration) scan across pairs, a feature selection loop, and the informal process of trying ideas until one works are all multiple testing procedures, whether or not anyone counted the tests. The counting is the hard part, and it is where the discipline is usually lost.

---

#### Formal Definition

With `m` simultaneous hypothesis tests:

<table>
  <tbody>
    <tr><td><strong>Error rate</strong></td><td><strong>Definition</strong></td><td><strong>Controls</strong></td></tr>
    <tr><td>Per-comparison</td><td>Probability a given single test falsely rejects</td><td>Nothing about the family</td></tr>
    <tr><td>Family-wise (FWER)</td><td>Probability of at least one false positive among all m</td><td>Any false discovery at all</td></tr>
    <tr><td>False discovery rate (FDR)</td><td>Expected proportion of false positives among rejections</td><td>The purity of the reported set</td></tr>
  </tbody>
</table>

For `m` independent tests each at level `alpha`, the family-wise error rate under a global null of no real effects, and the two standard corrections:

```text
FWER          = 1 - (1 - alpha)^m

Bonferroni    reject hypothesis i when p_i is at or below alpha / m

Benjamini-Hochberg, controlling FDR at level q:
              sort p ascending as p_(1) ... p_(m)
              find the largest k with p_(k) at or below k * q / m
              reject the k hypotheses with the smallest p-values
```

Bonferroni guarantees `FWER` at or below `alpha` regardless of dependence between tests, at the cost of being conservative when they are correlated. BH controls the *proportion* of errors among discoveries rather than the probability of any error, a far more useful target when many hypotheses are expected to be true.

---

#### Worked Example

**Part 1: how fast the family-wise error grows.** Suppose a research process tests strategy variants at the conventional 5% level and none of them has any edge.

<table>
  <tbody>
    <tr><td><strong>Tests run (m)</strong></td><td><strong>Probability of at least one "significant" result</strong></td></tr>
    <tr><td>1</td><td>5.0%</td></tr>
    <tr><td>5</td><td>22.6%</td></tr>
    <tr><td>20</td><td>64.2%</td></tr>
    <tr><td>100</td><td>99.4%</td></tr>
  </tbody>
</table>

Checking the `m = 20` row: `1 - 0.95^20 = 1 - 0.3585 = 0.6415`. Testing twenty worthless strategies makes it more likely than not that at least one clears the bar; at one hundred it is a near-certainty. Bonferroni for `m = 20` sets the per-test level at `0.05 / 20 = 0.0025`, which for a two-tailed test corresponds to a critical value of roughly `3.02` rather than `1.96`. In [Sharpe ratio](/quant-math/sharpe) terms, on one year of daily data the hurdle rises from about 1.96 to about 3.02 annualised — a very different research standard.

**Part 2: Bonferroni versus Benjamini-Hochberg.** Ten strategies are tested and produce these p-values, sorted ascending. Control the false discovery rate at `q = 0.10`.

<table>
  <tbody>
    <tr><td><strong>Rank k</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
    <tr><td><strong>p-value</strong></td><td>0.001</td><td>0.008</td><td>0.019</td><td>0.031</td><td>0.044</td><td>0.120</td><td>0.230</td><td>0.410</td><td>0.550</td><td>0.780</td></tr>
    <tr><td><strong>BH threshold k*q/m</strong></td><td>0.010</td><td>0.020</td><td>0.030</td><td>0.040</td><td>0.050</td><td>0.060</td><td>0.070</td><td>0.080</td><td>0.090</td><td>0.100</td></tr>
    <tr><td><strong>p at or below threshold?</strong></td><td>yes</td><td>yes</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td>no</td><td>no</td><td>no</td></tr>
  </tbody>
</table>

1. **BH thresholds** are `k * 0.10 / 10 = 0.01 * k`, and the **largest k passing** is `k = 5`, since `0.044` is at or below `0.050` while `0.120` exceeds `0.060`
2. **BH rejects** the five smallest p-values, and expects roughly 10% of those five — about half a strategy — to be false
3. **Bonferroni at the same 0.10 level** uses a single threshold of `0.10 / 10 = 0.010`, rejecting only the two smallest: `0.001` and `0.008`

Five discoveries versus two, from identical data. BH accepts a controlled proportion of errors in exchange for finding more real effects; Bonferroni all but guarantees no errors and misses most of what is there. Neither is correct in the abstract — the choice depends on the cost of a false positive relative to a missed opportunity, which in strategy research is a capital allocation question, not a statistical one.

> info **Correlated tests make Bonferroni too strict** Twenty variants of the same momentum rule are not twenty independent tests, so Bonferroni over-corrects. Estimating the effective number of independent hypotheses — for instance from the eigenvalue spectrum of the correlation matrix of the strategies' returns, see [PCA](/stat-methods/pca) — gives a less punitive and more honest denominator.

---

#### Why This Is Endemic in Quant Research

The problem is structural, and the count of tests is almost always larger than it appears. **Parameter sweeps are tests.** A grid over three parameters with ten values each is a thousand backtests. The reported best is a maximum over a thousand draws, and the distribution of a maximum bears no resemblance to that of a single draw. See [Parameter Sweeps](/simulation/param-sweeps). **The universe is another dimension**: screening 500 pairs for [cointegration](/stat-methods/cointegration) at 5% yields roughly 25 apparently cointegrated pairs from noise alone.

**Preprocessing and informal iteration are tests.** Winsorisation thresholds, lookback windows, rebalance frequency, universe filters, and cost assumptions are each a variant tried and discarded. A researcher who tries an idea, sees it fail, modifies it, and repeats has run a sequence of tests; because only the survivor is written up, the count exists only in memory and is systematically under-reported.

**The profession is one giant search.** Even a researcher testing exactly one pre-registered hypothesis draws from a space thousands of others have explored, and the ideas that reached them were filtered by prior success. Published results are a selected sample by construction.

The consequence is a research-process problem, not a formula problem. The realistic responses: log every test run including the failures; pre-specify the hypothesis and evaluation criteria before looking at results; hold out data that is genuinely never examined; and demand a higher hurdle in proportion to search effort. See [Backtest Overfitting](/stat-methods/backtest-overfitting) for the quantitative version of that last point.

> warning **The denominator is not optional** Reporting "this strategy has a t-statistic of 2.4" without saying how many were tried renders the number uninterpretable — a reader cannot reconstruct the correction from the outside.

---

#### In Practice Across Asset Classes

**Equity factor research.** The most acute case: candidate factors constructible from accounting and price data run to the hundreds, and the same underlying data have been mined by the profession for decades. Practitioners increasingly demand t-statistic hurdles well above the conventional 2 for newly proposed factors, on precisely this reasoning.

**Futures and FX.** Trend and carry rules are tested across dozens of markets at once. Because markets within a sector are highly correlated, the effective number of independent tests is much smaller than the raw count — but so is the effective sample size, and both corrections point the same way. The FX universe is small enough that cross-sectional multiplicity is limited; multiplicity arrives instead through parameter and horizon choices, and through testing the same rule on many rate differentials.

**Fixed income and credit.** Relative value screens across tenors, issuers, and instruments generate very large candidate sets with strong dependence between them; a basis screen across a bond universe is a multiple testing exercise with hundreds of highly correlated hypotheses.

**On-chain.** The worst combination: thousands of tokens and pools to screen, very short histories, and no convention of pre-registration. A cross-sectional screen over a large token universe on twelve months of data will produce apparently significant results reliably, whether or not any exist.

---

#### Assumptions and Failure Modes

- **The number of tests must be known.** Every correction depends on `m`; when tests were run informally and not logged, `m` is unknowable and no correction can be applied honestly.
- **Independence assumptions.** The simple `FWER` formula assumes independent tests. Bonferroni is valid under any dependence but conservative; BH is valid under independence and a common form of positive dependence, but not universally.
- **Corrections reduce power.** A stricter threshold misses more real effects. On short financial samples a heavily corrected test may have essentially no power — a reason to run fewer, better-motivated tests, not to skip the correction. Correction also cannot repair a biased sample: with survivorship bias or look-ahead leakage, it adjusts the wrong quantity precisely. See [Data Preparation](/simulation/data-prep).
- **FDR controls an expectation, not a guarantee.** BH at `q = 0.10` means roughly 10% of discoveries are false on average across repetitions, not that at most 10% are false in your set. Sequential peeking as data accumulate is a separate problem none of these procedures address.
- **Correction does not make a surviving result true**, only less likely to be pure noise. Out-of-sample confirmation remains the only real test. See [Backtest vs Live](/risk/backtest-vs-live).

---

#### Code

```python
import numpy as np
import pandas as pd
from statsmodels.stats.multitest import multipletests


def compare_corrections(p_values, names=None, alpha=0.05, q=0.10):
    """Uncorrected, Bonferroni (FWER) and BH (FDR) decisions side by side.
    The gap between the columns measures how much was search effort.
    """
    p = np.asarray(p_values, float)
    bonf_reject, bonf_adj, _, _ = multipletests(p, alpha=alpha, method="bonferroni")
    bh_reject, bh_adj, _, _ = multipletests(p, alpha=q, method="fdr_bh")
    columns = {
        "p_value": p,
        "uncorrected": p <= alpha,
        "bonferroni_adj_p": bonf_adj,
        "bonferroni": bonf_reject,
        "bh_adj_p": bh_adj,
        "benjamini_hochberg": bh_reject,
    }
    return pd.DataFrame(columns, index=names or range(len(p)))


def effective_number_of_tests(strategy_returns):
    """Approximate independent test count from correlated strategies.
    Participation ratio of the eigenvalue spectrum: highly correlated
    variants count as far fewer than their raw number.
    """
    eigenvalues = np.linalg.eigvalsh(strategy_returns.dropna().corr().values)
    eigenvalues = np.clip(eigenvalues, 0, None)
    return eigenvalues.sum() ** 2 / (eigenvalues**2).sum()
```

---

#### See Also

* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Hypothesis Testing](/stat-methods/hypothesis-testing)
* [Parameter Sweeps](/simulation/param-sweeps)
* [Backtest vs Live](/risk/backtest-vs-live)

---

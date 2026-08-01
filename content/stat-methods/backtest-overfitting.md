### Backtest Overfitting

> info **Metadata** Level: Advanced | Prerequisites: Multiple Testing, Sharpe Ratio | Tags: overfitting, deflated-sharpe, pbo, data-snooping, research-process, backtesting

A backtest is a maximum. Whatever was reported was chosen from a set of alternatives — parameter values, universes, filters, cost assumptions, start dates — and the selection process is part of the result even when unrecorded. Backtest overfitting is what happens when the selection does more work than the signal.

The distinguishing symptom is a strategy that looks excellent in the backtest and ordinary in live trading, with no bug to find. Nothing broke; the backtest was measuring the researcher's search effort. This page covers the tools that quantify that: an adjusted Sharpe hurdle, a probability that the selection was spurious, and a minimum sample length below which a given search cannot produce meaningful evidence at all.

---

#### Where the Bias Comes From

**Data snooping.** Repeatedly evaluating on the same data makes that data part of the model, whether or not any parameter was formally fitted to it. Every decision informed by a previous result — even the decision to abandon an idea — is an act of fitting.

**Selection of the maximum** compounds it. With `N` independent trials each having a true Sharpe of zero and an estimation standard error, the expected largest observed Sharpe is strictly positive and grows with `N`. An approximation for the expected maximum of `N` standard normal draws, with `g` the Euler-Mascheroni constant (about `0.5772`), `z(.)` the standard normal quantile function and `e` Euler's number — evaluated, this is the hurdle a genuine result must clear, not zero:

```text
E[max Z] = (1 - g) * z(1 - 1/N)  +  g * z(1 - 1/(N * e))

N          20      50      1000
E[max Z]   1.90    2.28    3.26
```

**Look-ahead leakage.** Using information not available at decision time — a survivorship-filtered universe, a restated fundamental, a closing price used to trade at the close, an index constituent list as of today. Not overfitting in the statistical sense, but it produces the same symptom and is far more common. **Cost optimism** does likewise: fills assumed at the mid, impact ignored, a fixed cost that does not scale with size. High-turnover strategies are most affected, and turnover is exactly what a parameter search selects for. See [Market Impact](/execution/market-impact) and [Slippage](/microstructure/slippage).

---

#### The Deflated Sharpe Ratio

The **Deflated Sharpe Ratio (DSR)** replaces the null of "Sharpe equals zero" with "Sharpe equals the expected maximum from this many trials", and additionally corrects for non-normal returns, reporting a probability that the true Sharpe exceeds that selection-adjusted benchmark.

```text
DSR = Phi(  (S_hat - S_0) * sqrt(n - 1)
            / sqrt(1 - skew * S_hat + ((kurtosis - 1) / 4) * S_hat^2)  )
```

where `Phi` is the standard normal cumulative distribution function, `S_hat` the observed Sharpe **per period** (not annualised), `n` the number of return observations, and `skew` and `kurtosis` the sample skewness and non-excess kurtosis of the returns. The benchmark is `S_0 = sqrt(V) * E[max Z]`, also per period, where `V` is the variance across trials of the estimated per-period Sharpe ratios. The denominator is the standard error correction: negative skew and fat tails both inflate it, lowering the DSR, so a strategy with an attractive Sharpe and a short-option-like return profile is penalised — correctly.

---

#### Worked Example

A researcher tests 50 parameter configurations on three years of daily data, and reports the best:

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Trials run (N) / observations (n)</td><td>50 / 756 daily returns</td></tr>
    <tr><td>Best annualised Sharpe / std dev of daily Sharpe across trials</td><td>1.20 / 0.025</td></tr>
    <tr><td>Sample skewness / kurtosis (non-excess)</td><td>-0.50 / 6.00</td></tr>
  </tbody>
</table>

1. **Convert the Sharpe to daily units**: `S_hat = 1.20 / sqrt(252) = 1.20 / 15.87 = 0.07559`, and take `E[max Z] = 2.276` for `N = 50` from the table above
2. **Selection benchmark**: `S_0 = 0.025 * 2.276 = 0.05690` daily, annualising to `0.05690 * 15.87 = 0.903`; the **numerator** is then `(0.07559 - 0.05690) * sqrt(755) = 0.01869 * 27.48 = 0.5136`
3. **Denominator**: `sqrt(1 - (-0.50)(0.07559) + ((6 - 1)/4)(0.07559^2)) = sqrt(1 + 0.03780 + 0.00714) = sqrt(1.04494) = 1.0222`, so the **test statistic** is `0.5136 / 1.0222 = 0.502` and **DSR** `= Phi(0.502) = 0.69`

Two readings. First, the selection-adjusted hurdle is an annualised Sharpe of **0.90**, not zero — a strategy from this search scoring 0.90 carries no evidence at all. Second, at 69% confidence the observed 1.20 falls well short of the conventional 95% standard: the headline number is not obviously fake, and it is not established either.

The sensitivity to inputs is the useful part. Had the same 1.20 come from 5 trials instead of 50, `E[max Z]` drops to about 1.19, the benchmark falls to roughly 0.47 annualised, and the DSR rises substantially; had the returns been symmetric and thin-tailed, the denominator would sit near 1.0 and the statistic would improve. **The same track record is strong or weak evidence depending on facts about the research process that appear nowhere in the return series.**

> warning **The trial count must be honest** `N` counts every configuration actually evaluated, including those abandoned early, plus every variant of the data preparation. Under-reporting it deflates the hurdle and defeats the correction entirely. Researchers who do not log their trials cannot compute this statistic, only approximate it optimistically.

---

#### Minimum Backtest Length

Inverting the same logic bounds how much data a search of a given size needs. Setting the expected maximum Sharpe from noise equal to the target annualised Sharpe gives `MinBTL (years) = (E[max Z] / target_annual_sharpe)^2`:

<table>
  <tbody>
    <tr><td><strong>Trials N</strong></td><td><strong>E[max Z]</strong></td><td><strong>Years for target Sharpe 1.0</strong></td><td><strong>Years for target Sharpe 0.5</strong></td></tr>
    <tr><td>20</td><td>1.90</td><td>3.6</td><td>14.5</td></tr>
    <tr><td>50</td><td>2.28</td><td>5.2</td><td>20.7</td></tr>
    <tr><td>1000</td><td>3.26</td><td>10.6</td><td>42.4</td></tr>
  </tbody>
</table>

Checking `N = 50` at target Sharpe 1.0: `2.276^2 / 1.0^2 = 5.18` years. The reading is uncomfortable and correct: with less than the tabulated sample, a search of that size is expected to produce the target Sharpe from noise alone, so observing it conveys no information. Note how the requirement scales — halving the target Sharpe quadruples the data needed, while going from 50 trials to 1000 only doubles it. Sample length binds far more often than trial count.

---

#### Probability of Backtest Overfitting

The **Probability of Backtest Overfitting (PBO)** answers a different and more direct question: given this research process, how often does the configuration that looks best in-sample turn out below-median out-of-sample? The combinatorially symmetric cross-validation procedure is to:

1. Build a matrix of returns with one column per trial configuration and one row per time period
2. Split the periods into `S` equal blocks (commonly `S = 16`), and enumerate every way of choosing `S/2` as the training set with the rest as the test set
3. For each split, find the highest in-sample Sharpe and record that configuration's rank out-of-sample; **PBO** is the fraction of splits in which the winner ranked below the median

A PBO near 0 means the in-sample winner reliably generalises; near 0.5 means selection is a coin flip, the in-sample ranking carrying no information about out-of-sample performance; above 0.5 indicates active anti-selection, the search systematically picking configurations that fit noise. PBO's advantage over DSR is that it evaluates the *procedure* rather than a single result and needs no distributional assumption; its cost is that it requires the full grid of trial returns to have been retained, which is only possible if the research pipeline was built to keep them. See [Purged Cross-Validation](/ml-finance/purged-cross-validation) for the related problem of leakage across folds in serially correlated data.

---

#### In Practice Across Asset Classes

**Equities and futures.** Cross-sectional factor research has an enormous configuration space — universe filters, breakpoints, weighting schemes, rebalance frequency, neutralisation choices — so the deflation hurdle is high and the honest trial count rarely known, much of the search having happened in prior published work. Trend systems on futures have few parameters but are tested across many markets, and reporting the portfolio Sharpe from the best per-market parameter set searches over markets as well as parameters, making the effective `N` their product. See [Parameter Sweeps](/simulation/param-sweeps).

**FX, fixed income and credit.** Small FX universes limit cross-sectional search but not parameter search, and regime dependence is the dominant hazard: a carry rule tuned on a low-volatility period is fitted to a regime, not to noise, and neither DSR nor PBO detects that ([Regimes Overview](/regimes-macro/regimes-overview)). Long rates and credit samples span several policy and spread regimes, helping sample length and hurting parameter stability, and illiquid-asset return series are smoothed by stale marks, raising measured Sharpe before any overfitting occurs.

**On-chain.** The worst configuration of every factor: histories measured in months, enormous cross-sections, near-zero cost of another backtest, and structural change fast enough that a two-year sample spans several market mechanisms. By the minimum-backtest-length table, most on-chain strategy research lacks the data to support the search that produced it.

---

#### Assumptions and Failure Modes

- **DSR assumes independent, identically distributed trials.** Real parameter grids are highly correlated — adjacent values produce near-identical strategies — so the effective `N` is smaller than the raw count and DSR over-penalises. Estimating the effective number of independent trials is the better input; see [Multiple Testing](/stat-methods/multiple-testing). Both statistics also require a known trial count: neither survives a research process without a log, and retrospective estimates of `N` are always optimistic.
- **They correct for selection, not for leakage.** A backtest with look-ahead or survivorship bias passes a deflation test comfortably; the correction is orthogonal to the bug. They also assume the future resembles the sample — a strategy whose edge genuinely existed and then disappeared is neither overfitted nor useful — and evaluate only a two-moment statistic, so a strategy with hidden tail risk can pass. See [VaR & CVaR](/quant-math/var-cvar).
- **Passing is not validation.** A high DSR and low PBO mean the result is not obviously an artifact of search; out-of-sample performance on data never touched during research remains the only real evidence. See [Backtest vs Live](/risk/backtest-vs-live).
- **The corrections can be gamed.** Reporting a small `N`, choosing a favourable trial-variance estimate, or deflating only the final grid while ignoring months of prior exploration all inflate the result. The statistic is only as honest as the process reporting it.

---

#### Code

```python
import numpy as np
from scipy import stats

EULER_MASCHERONI = 0.5772156649


def expected_max_sharpe_z(n_trials):
    """Expected maximum of n_trials standard normal draws. Pass the
    *effective* number of independent trials, not the raw grid size,
    when configurations are highly correlated."""
    g = EULER_MASCHERONI
    return (1 - g) * stats.norm.ppf(1 - 1 / n_trials) + g * stats.norm.ppf(
        1 - 1 / (n_trials * np.e))


def deflated_sharpe(returns, n_trials, trial_sharpe_std):
    """Probability the true Sharpe beats the selection-adjusted benchmark.
    trial_sharpe_std is the std dev of per-period Sharpe across trials."""
    r = np.asarray(returns, float)
    observed = r.mean() / r.std(ddof=1)
    benchmark = trial_sharpe_std * expected_max_sharpe_z(n_trials)
    skew, kurtosis = stats.skew(r), stats.kurtosis(r, fisher=False)  # non-excess
    denominator = np.sqrt(1 - skew * observed + ((kurtosis - 1) / 4) * observed**2)
    return stats.norm.cdf((observed - benchmark) * np.sqrt(r.size - 1) / denominator)


def minimum_backtest_years(n_trials, target_annual_sharpe):
    """Sample length below which the search yields the target from noise."""
    return (expected_max_sharpe_z(n_trials) / target_annual_sharpe) ** 2
```

---

#### See Also

* [Multiple Testing](/stat-methods/multiple-testing)
* [Confidence Intervals](/stat-methods/confidence-intervals)
* [Bootstrap](/stat-methods/bootstrap)
* [Backtest vs Live](/risk/backtest-vs-live)

---

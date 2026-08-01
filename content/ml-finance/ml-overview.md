### Machine Learning in Finance: What Actually Transfers

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Stationarity, Hypothesis Testing | Tags: machine-learning, overview, signal-to-noise, non-stationarity, overfitting

Machine learning solved image recognition and language translation by exploiting three properties those domains happen to have: an enormous number of samples, a stable relationship between input and output, and a label that is almost entirely determined by the input. Financial return prediction has none of them. The pixel arrangement of a cat determines the label "cat" with near-certainty; today's order-book imbalance determines tomorrow's return with something like one part in a thousand.

This does not make machine learning useless in finance. It makes the failure mode different. In a high signal domain, a badly specified model underperforms visibly and you fix it. In a low signal domain, a badly specified model produces a beautiful backtest, and the error only surfaces as money. Most of the machinery in this section — [purged cross-validation](/ml-finance/purged-cross-validation), [meta-labelling](/ml-finance/meta-labelling), aggressive [regularisation](/ml-finance/regularisation) — exists to make that failure visible before capital is committed.

---

#### The Signal-to-Noise Problem, Stated Formally

Suppose a single standardised feature `f_t` has a linear relationship with the next-period return:

```text
r_next = a * f_t + e_t

Var(r_next) = a^2 * Var(f_t) + Var(e_t)
```

where:

- `f_t` is the feature, standardised so `Var(f_t) = 1`
- `a` is the true coefficient
- `e_t` is everything the feature does not explain
- `IC` is the **information coefficient**, the correlation between `f_t` and `r_next`

For a single standardised predictor, `R^2 = IC^2`. This identity is the whole problem. An information coefficient of 0.03 — a value practitioners would consider genuinely useful for a cross-sectional equity signal — corresponds to `R^2 = 0.0009`. The feature explains under one tenth of one percent of return variance. Nothing about a model architecture changes this ceiling; the noise is in the data.

Detecting such a coefficient requires a sample large enough for the estimate to clear its own standard error. For a correlation near zero the standard error is approximately `1 / sqrt(n)`, so:

```text
t = IC * sqrt(n)
n_required = (t_target / IC)^2
```

---

#### Worked Example: How Much History an Edge Needs

Take a feature with a true information coefficient of 0.03 and ask how many observations are needed before a `t`-statistic of 2 is even achievable.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td><td><strong>Working</strong></td></tr>
    <tr><td>True information coefficient</td><td>0.03</td><td>assumed</td></tr>
    <tr><td>Implied R-squared</td><td>0.0009</td><td>0.03 squared</td></tr>
    <tr><td>Sample of 2,000 daily bars</td><td>t = 1.34</td><td>0.03 * sqrt(2000) = 0.03 * 44.7</td></tr>
    <tr><td>Sample needed for t = 2</td><td>4,445 bars</td><td>(2 / 0.03) squared = 66.67 squared</td></tr>
    <tr><td>In calendar years</td><td>about 17.6 years</td><td>4445 / 252</td></tr>
  </tbody>
</table>

Eight years of clean daily data on a single instrument cannot reliably distinguish a real 0.03 information coefficient from zero. And this is the optimistic case: it assumes the coefficient is constant across the whole 17.6 years, which is exactly the assumption non-stationarity destroys.

The usual escape is **breadth** — running the same signal across 500 names to accumulate more independent observations per day. The fundamental law of active management suggests the information ratio scales as `IC * sqrt(breadth)`, which for 500 names over 252 days would give `0.03 * sqrt(126000) = 10.6`. No such information ratio exists. The formula assumes the bets are independent, and cross-sectional equity bets share market, sector, and style exposure so heavily that effective breadth is smaller than nominal breadth by orders of magnitude.

> warning **Breadth is not the number of positions** Two hundred correlated long positions in the same sector are closer to one bet than to two hundred. Any sample-size argument that counts rows rather than independent episodes will overstate confidence.

---

#### The Five Structural Obstacles

<table>
  <tbody>
    <tr><td><strong>Obstacle</strong></td><td><strong>What it breaks</strong></td><td><strong>Partial remedy</strong></td></tr>
    <tr><td>Low signal-to-noise</td><td>Flexible models fit noise perfectly and generalise not at all</td><td>Severe regularisation, few features, linear baselines</td></tr>
    <tr><td>Non-stationarity</td><td>The training distribution is not the deployment distribution</td><td>Stationary features, walk-forward evaluation, regime awareness</td></tr>
    <tr><td>Serial correlation</td><td>Random k-fold splits leak the future into training</td><td>Purging and embargoing</td></tr>
    <tr><td>Adversarial participants</td><td>A published or crowded edge is arbitraged away</td><td>Decay monitoring, capacity analysis</td></tr>
    <tr><td>Small effective sample</td><td>Confidence intervals wider than the effect being measured</td><td>Honest error bars, deflated performance statistics</td></tr>
  </tbody>
</table>

**Non-stationarity** deserves emphasis because it is the one that has no clean fix. A photograph of a cat in 2015 is a photograph of a cat in 2035. A relationship between order flow and returns in 2015 may not survive a change in tick size, a new dominant venue, or the arrival of participants who trade against it. See [Stationarity](/quant-math/stationarity) and [Regimes Overview](/regimes-macro/regimes-overview).

**Adversarial participants** make finance categorically unlike physics. The data-generating process reads your output. If a predictable pattern is profitable and discoverable, capital flows toward it until it is no longer profitable. The half-life of that process is itself unknown and variable.

---

#### Effective Sample Size

The honest denominator for a confidence statement is not the number of rows:

```text
n_effective = n_bars / bars_per_independent_episode
```

Twenty years of daily data on one instrument is 5,040 bars. If the behaviour you are modelling is driven by macro regimes that persist for roughly two years, the number of independent regime draws is closer to ten. A model selected to perform well across those ten episodes has been fitted to ten observations, whatever the row count says.

This is why practitioners with long horizons often prefer models with a handful of parameters and strong economic priors, while machine learning finds its most defensible use at high frequency, where genuinely independent events arrive thousands of times per day.

---

#### In Practice Across Asset Classes

**Cross-sectional equities.** The most established use. Breadth is real (thousands of names), fundamental and price features are plentiful, and the target — relative rather than absolute return — is better behaved. Gradient-boosted trees over a few dozen standardised features are a mainstream approach. The competition is intense and the surviving edges are small.

**High-frequency microstructure.** The strongest genuine fit. Order-book state predicts very short-horizon price movement with an information coefficient far above anything available at daily frequency, and millions of events per instrument per year give real statistical power. The constraints are latency and [market impact](/execution/market-impact), not model capacity.

**Credit scoring and default prediction.** Machine learning works here because the problem is closer to classical supervised learning: labels (default or not) are unambiguous, the base rate is estimable, and the relationship between borrower characteristics and default is more stable than any return relationship. See [Default Probability](/credit/default-probability).

**Futures and FX macro.** Frequently oversold. The number of independent macro episodes in the historical record is small, instruments are highly correlated, and most published results are indistinguishable from selection across a large model search.

**On-chain data.** Genuinely rich — every transaction, every liquidity event, every liquidation is observable at the individual-actor level, which no traditional market offers. But the history is short, protocol mechanics change under the feed, and the regime shifts are severe (a fee-tier change or a migration rewrites the data-generating process outright). Treat multi-year on-chain backtests as spanning very few independent episodes. See [On-Chain Activity](/signals/onchain-activity), [Dune Analytics](/data-tooling/dune-analytics), and [Event Logs](/data-tooling/event-logs).

---

#### Assumptions and Failure Modes

- **Assumes the training and deployment distributions match.** They rarely do in markets. A model trained across a low-volatility regime learns relationships that may invert when volatility regime changes. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Assumes samples are independent.** Overlapping labels and autocorrelated features violate this, inflating apparent out-of-sample performance. This is the specific failure [purged cross-validation](/ml-finance/purged-cross-validation) addresses.
- **Assumes the label measures what you trade.** A model that predicts a fixed-horizon return is not predicting the P&L of a strategy with stops and targets. See [Labelling](/ml-finance/labelling).
- **Assumes model search is free.** It is not. Every configuration tried consumes statistical evidence, and the best of many searches is biased upward by construction. See [Multiple Testing](/stat-methods/multiple-testing).
- **Assumes frictionless execution.** A model with a real 3 basis point edge and a 6 basis point round-trip cost is a loss-making model. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Assumes more capacity helps.** In low signal-to-noise data, additional model capacity reliably reduces out-of-sample performance. A linear model with three sensible features is a serious baseline, not a placeholder.

> warning **The default outcome is a false positive** With a weak true signal, a large search space, and a leaky validation scheme, an impressive backtest is the expected result whether or not any edge exists. Design the evaluation before the model.

---

#### Code

```python
import numpy as np


def bars_needed(information_coefficient, t_target=2.0):
    """Sample size before an IC of this size could clear a t-stat threshold.

    Uses SE(corr) ~ 1/sqrt(n), valid when the true correlation is near zero.
    Run this before building anything: if the answer exceeds your history,
    the experiment cannot succeed regardless of the model.
    """
    return int(np.ceil((t_target / information_coefficient) ** 2))


def achieved_t_stat(information_coefficient, n_samples):
    return information_coefficient * np.sqrt(n_samples)


for ic in (0.01, 0.03, 0.05, 0.10):
    print(ic, bars_needed(ic), round(achieved_t_stat(ic, 2000), 2))
# 0.01 40000 0.45
# 0.03 4445  1.34
# 0.05 1600  2.24
# 0.10 400   4.47
```

An information coefficient of 0.10 at daily frequency on a liquid instrument would be extraordinary. The row that matters is the second one.

---

#### See Also

* [Feature Engineering](/ml-finance/feature-engineering)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [ML Pitfalls](/ml-finance/ml-pitfalls)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [What Is a Trading Signal?](/signals/what-is-signal)
* [Backtest vs Live](/risk/backtest-vs-live)

---

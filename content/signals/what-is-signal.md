### What Is a Trading Signal?

> info **Metadata** Level: Beginner | Prerequisites: Returns, Correlation | Tags: signals, features, information-coefficient, research-process

A **signal** is a number computed from information available at time `t` that carries some predictive content about returns after time `t`. That is the whole definition. It is not a buy or sell instruction, it is not a strategy, and it is not a chart pattern you recognise by eye. It is a function — of prices, volumes, order books, fundamentals, positioning data, anything — evaluated on data you actually had, producing a number you can test.

The distinction between a signal and a strategy matters more than it sounds. A signal says "this asset looks cheap relative to its peers by 0.8 standard deviations". A strategy decides what size to hold, when to rebalance, what to pay in costs, and what to do when the position moves against it. Most of the money is lost in the second step. This page defines what a signal is, how to standardise one, and how to measure whether it contains information at all — before any of it becomes a position.

---

#### Formal Definition

Let `I_t` be the information set available at time `t` — everything observable up to and including that moment. A signal is a function:

```text
s_t = f(I_t)
```

where:

- `I_t` is the information set at time `t` (prices, volumes, book state, fundamentals)
- `f` is any deterministic function of that information
- `s_t` is the resulting scalar score

The defining constraint is **measurability with respect to `I_t`**: `f` may use nothing from the future. A signal that quietly consumes tomorrow's close, a restated fundamental, or a survivorship-filtered universe is not a signal, it is a look-ahead bug.

Raw signals are rarely comparable across assets or across time, so they are standardised. The usual transform is a cross-sectional z-score:

```text
z_i,t = (s_i,t - mean_t(s)) / sd_t(s)
```

where `mean_t(s)` and `sd_t(s)` are taken across the universe of assets at a single date. Time-series signals use a rolling equivalent, subtracting a trailing mean and dividing by a trailing standard deviation. See [Rolling Windows](/quant-math/rolling-windows) for why the window length is itself a parameter you are fitting.

The standard measure of a signal's predictive content is the **information coefficient (IC)** — the correlation between the signal and the subsequent return:

```text
IC = corr(s_t, R_t+1)
```

Pearson correlation gives the raw IC; correlation of ranks gives the **rank IC** (Spearman), which is far more robust when the signal or the return distribution has fat tails.

---

#### Worked Example

Eight assets are scored by a signal at the end of one month. The following month's returns are then observed.

<table>
  <tbody>
    <tr><td><strong>Asset</strong></td><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td><td>H</td></tr>
    <tr><td><strong>Signal</strong></td><td>1.8</td><td>1.1</td><td>0.4</td><td>0.2</td><td>-0.3</td><td>-0.7</td><td>-1.2</td><td>-1.6</td></tr>
    <tr><td><strong>Next-month return (%)</strong></td><td>1.9</td><td>-1.2</td><td>0.4</td><td>1.6</td><td>0.8</td><td>-2.0</td><td>-0.5</td><td>0.3</td></tr>
  </tbody>
</table>

Step by step:

1. **Means**: the signals sum to `-0.3`, so `mean(s) = -0.0375`. Returns sum to `1.3`, so `mean(R) = 0.1625%`
2. **Sum of cross products**: `sum((s_i - mean(s)) * (R_i - mean(R))) = 3.9087`
3. **Sums of squares**: `9.2188` for the signal and `12.5388` for the returns, giving `sqrt(9.2188 * 12.5388) = 10.7514`
4. **Information coefficient**: `3.9087 / 10.7514 = 0.364`
5. **Rank IC**: ranking both rows and repeating the calculation gives `0.429`
6. **Long-short spread**: the top three signals averaged `+0.37%`, the bottom three `-0.73%`, a spread of `1.10%`

An IC of 0.36 sounds strong. It is not a result. With eight observations the approximate standard error of a correlation is `1 / sqrt(n - 3) = 1 / sqrt(5) = 0.45`, larger than the estimate itself. Note also that asset H had the most negative signal and a positive return, while asset B had the second-highest signal and the second-worst return. The sign matched in five cases out of eight — indistinguishable from coin flipping.

> warning **A single-period IC is one draw from a wide distribution** Signals are judged by the mean IC across many periods and by its stability, never by one cross-section. A promising number on one date is a hypothesis. See [Hypothesis Testing](/stat-methods/hypothesis-testing).

---

#### From Signal to Position

A standardised signal still has to become a holding. That mapping is a modelling decision with real consequences:

<table>
  <tbody>
    <tr><td><strong>Mapping</strong></td><td><strong>Position rule</strong></td><td><strong>Consequence</strong></td></tr>
    <tr><td>Binary</td><td>Long above a threshold, flat otherwise</td><td>Simple; turnover concentrates at the threshold, so noise near it churns the book</td></tr>
    <tr><td>Linear</td><td>Position proportional to <code>z</code></td><td>Smooth turnover; outliers become oversized positions unless clipped</td></tr>
    <tr><td>Rank-based</td><td>Long the top decile, short the bottom decile</td><td>Robust to outliers; discards magnitude information entirely</td></tr>
    <tr><td>Volatility-scaled</td><td>Position proportional to <code>z / sigma_i</code></td><td>Equalises risk contribution; needs a stable volatility estimate</td></tr>
  </tbody>
</table>

The **fundamental law of active management** links signal quality to portfolio quality: the information ratio is approximately `IC * sqrt(breadth)`, where breadth counts roughly independent bets per year. A weak signal applied across many independent assets can beat a strong signal applied to one. At `IC = 0.03`, a single bet gives an information ratio near 0.03; 200 roughly independent bets give about `0.03 * sqrt(200) = 0.42`. The catch is the word *independent* — correlated assets do not deliver the breadth a simple count implies.

---

#### In Practice Across Asset Classes

**Equities.** The natural home of cross-sectional signals: hundreds of names ranked against each other each day, with IC computed per date and averaged. Signals must be neutralised against sector and market exposure, or the IC mostly measures beta. [Factor Models](/stat-methods/factor-models) formalises this.

**Futures.** A smaller universe — a few dozen liquid contracts — so cross-sectional breadth is low and time-series signals dominate. Signals are computed on a continuous series stitched across expiries, which makes the [roll convention](/markets/roll-and-carry) part of the signal definition rather than a data detail.

**FX.** Roughly ten major pairs, heavily driven by rate differentials and policy. Breadth is small, and pairs sharing a common currency leg are highly correlated, so the effective number of bets is well below the number of pairs. See [FX Carry and Parity](/markets/fx-carry-parity).

**Fixed income.** Signals sit on yields, spreads, or curve slopes rather than prices, because raw price changes conflate the signal with duration. See [Yield Curves](/markets/yield-curves).

**Crypto.** Markets run continuously, so there is no natural daily boundary and "one period" becomes a modelling choice rather than a fact about the exchange. Derivatives positioning and on-chain state are publicly observable, giving signal families — [funding rates](/signals/funding-rate), [open interest](/signals/open-interest) — with no direct equity analogue. The history is short, so every estimate is noisier than its equity equivalent.

---

#### Assumptions and Failure Modes

- **Point-in-time data.** The signal assumes you held the data when you claim you did. Restated fundamentals, revised macro releases, and backfilled index membership all leak the future into `I_t`. See [Cleaning Data](/data-tooling/cleaning).
- **Stability of the relationship.** Estimation assumes the signal-return link is stable enough to measure. Regime changes break it, and the break is usually visible only afterwards. See [Regimes Overview](/regimes-macro/regimes-overview).
- **Independence of observations.** Overlapping forward-return windows induce serial correlation and inflate t-statistics badly. Standard errors must be corrected or the sampling scheme changed.
- **The multiple-testing problem.** Trying many signal variants and reporting the best guarantees an impressive IC whether or not any edge exists. See [Multiple Testing](/stat-methods/multiple-testing) and [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **Costs sit outside the signal.** A signal with genuine predictive content can still lose money once spread, impact, and financing are charged. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Capacity is invisible in the IC.** A signal concentrated in small, illiquid names decays as capital grows, and the IC will not tell you where that limit is. See [Market Impact](/execution/market-impact).
- **Signal decay.** Published and widely traded signals weaken as they are arbitraged away. The decay is rarely detectable in real time.

---

#### Code

```python
import pandas as pd

def cross_sectional_zscore(signal_panel):
    """Standardise a wide (date x asset) signal panel within each date."""
    return signal_panel.sub(signal_panel.mean(axis=1), axis=0).div(
        signal_panel.std(axis=1, ddof=1), axis=0
    )


def information_coefficient(signal_panel, forward_returns, method="spearman"):
    """IC per date, plus its mean and t-statistic across dates.

    Rank correlation is the default: it is far less sensitive to the
    fat-tailed outliers that otherwise dominate a Pearson IC.
    """
    signals, returns = signal_panel.align(forward_returns, join="inner")
    per_date = signals.corrwith(returns, axis=1, method=method).dropna()
    mean_ic = per_date.mean()
    # Naive t-stat: assumes ICs are independent across dates. Overlapping
    # forward windows violate that and inflate it.
    t_stat = mean_ic / per_date.std(ddof=1) * len(per_date) ** 0.5
    return per_date, mean_ic, t_stat
```

---

#### See Also

* [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion)
* [Feature Engineering](/ml-finance/feature-engineering)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Autocorrelation](/quant-math/autocorrelation)
* [Backtest vs Live](/risk/backtest-vs-live)
* [How to Read a Strategy](/strategies/how-to-read)

---

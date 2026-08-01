### Performance Metrics for Backtests

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility, Sharpe Ratio | Tags: metrics, evaluation, sharpe, drawdown, turnover, capacity

A backtest produces an equity curve, and the temptation is to summarise it with a single number. That number is almost always the Sharpe ratio, and it is almost always insufficient — not because it is a bad statistic, but because it is a *two-moment* statistic describing an object with many more dimensions than two. Two strategies with identical Sharpe ratios can differ by an order of magnitude in turnover, in capacity, in how their profit is distributed across days, and in how much of the equity curve is explained by market beta.

The right output of a backtest is a **battery**, not a scalar. Each metric closes off a specific way the simulation could be flattering you: turnover exposes cost sensitivity, capacity exposes impact, exposure exposes hidden beta, and the distribution of daily profit exposes whether the result rests on five lucky sessions. This page defines the battery and links to the pages that treat each measure properly; it deliberately does not restate their derivations.

---

#### The Battery

<table>
  <tbody>
    <tr><td><strong>Metric</strong></td><td><strong>What it answers</strong></td><td><strong>What it cannot see</strong></td></tr>
    <tr><td>Total and annualised return</td><td>How much was made</td><td>How much risk was taken to make it</td></tr>
    <tr><td>Volatility</td><td>Dispersion of period returns</td><td>Direction, shape, or clustering of that dispersion</td></tr>
    <tr><td>Sharpe ratio</td><td>Excess return per unit of volatility</td><td>Skew, kurtosis, path, autocorrelation</td></tr>
    <tr><td>Sortino ratio</td><td>Return per unit of downside deviation</td><td>Still blind to the ordering of losses</td></tr>
    <tr><td>Maximum drawdown</td><td>Worst peak-to-trough loss actually experienced</td><td>Whether the sample happened to contain the bad regime</td></tr>
    <tr><td>Calmar ratio</td><td>Annual return per unit of maximum drawdown</td><td>Frequency and duration of drawdowns; it is one observation</td></tr>
    <tr><td>VaR and CVaR</td><td>Loss at and beyond a quantile</td><td>Anything outside the sampled tail</td></tr>
    <tr><td>Turnover</td><td>Traded notional relative to capital</td><td>Whether the trades were fillable</td></tr>
    <tr><td>Capacity</td><td>Size at which impact consumes the edge</td><td>Competitor crowding into the same trade</td></tr>
    <tr><td>Hit rate and payoff ratio</td><td>Frequency and asymmetry of wins</td><td>Nothing alone — the two are only meaningful jointly</td></tr>
    <tr><td>Gross and net exposure</td><td>Leverage and directional tilt</td><td>Factor exposure hidden inside a market-neutral book</td></tr>
  </tbody>
</table>

Each of the first seven has its own page: [Returns](/quant-math/returns), [Volatility](/quant-math/volatility), [Sharpe Ratio](/quant-math/sharpe), [Sortino Ratio](/quant-math/sortino), [Drawdown](/quant-math/drawdown) and [VaR & CVaR](/quant-math/var-cvar). Read them for the derivations and the conventions; what follows here is how they behave when the numbers feeding them come from a simulation rather than from a live account.

---

#### Formal Definition

The core quantities, computed from the equity series `E_t` produced by the portfolio ledger rather than from any signal:

```text
R_t          = E_t / E_(t-1) - 1
Sharpe       = (mean(R) - Rf) / stdev(R) * sqrt(periods_per_year)
Sortino      = (mean(R) - Rf) / downside_dev(R) * sqrt(periods_per_year)
downside_dev = sqrt( mean( min(R_t - target, 0)^2 ) )
drawdown_t   = 1 - E_t / max(E_1 ... E_t)
MaxDD        = max over t of drawdown_t
Calmar       = annualised_return / MaxDD
turnover     = SUM_t |traded_notional_t| / (periods * average_equity)
hit_rate     = count(R_t positive) / count(R_t nonzero)
payoff_ratio = mean(R_t | R_t positive) / |mean(R_t | R_t negative)|
```

where `Rf` is the per-period risk-free rate and `target` is the minimum acceptable return, conventionally zero. Note that `downside_dev` divides by the full count, not by the count of negative periods; the alternative convention exists and produces a different Sortino, so state which you used.

> warning **Turnover and capacity are not derivable from returns** You cannot recover them from an equity curve. They have to be recorded by the backtester as it runs. A framework that reports only a return series has thrown away the information needed to judge whether the return survives contact with a real market.

---

#### Worked Example

Twelve monthly returns from a hypothetical run, with a zero risk-free rate throughout. These are illustrative figures for arithmetic, not results from any strategy.

<table>
  <tbody>
    <tr><td><strong>Month</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td></tr>
    <tr><td><strong>Return (%)</strong></td><td>3</td><td>-2</td><td>4</td><td>1</td><td>-5</td><td>2</td><td>3</td><td>-1</td><td>2</td><td>4</td><td>-3</td><td>2</td></tr>
  </tbody>
</table>

Step by step:

1. **Mean monthly return**: the twelve values sum to 10%, so `mean(R) = 10 / 12 = 0.833%`
2. **Monthly standard deviation**: `stdev(R) = 2.918%` (sample, `ddof = 1`)
3. **Annualised Sharpe**: `0.833 / 2.918 * sqrt(12) = 0.99`
4. **Downside deviation** using the four negative months and a denominator of 12: `sqrt((4 + 25 + 1 + 9) / 12) = sqrt(3.25) = 1.803%`
5. **Annualised Sortino**: `0.833 / 1.803 * sqrt(12) = 1.60`
6. **Compounded total return**: multiplying the twelve growth factors gives `1.0996`, so the year returned `9.96%`
7. **Maximum drawdown**: the peak before month 5 is `1.0603`, the trough is `1.0073`, giving `1 - 1.0073 / 1.0603 = 5.00%`
8. **Calmar**: `9.96 / 5.00 = 1.99`
9. **Hit rate**: 8 positive of 12, so `66.7%`
10. **Payoff ratio**: average win `21 / 8 = 2.625%`, average loss `11 / 4 = 2.75%`, so `2.625 / 2.75 = 0.95`

Read them together. Sortino is well above Sharpe, so losses are smaller than the symmetric measure implies. But the payoff ratio is below 1: the strategy wins more often than it loses and wins slightly less when it does. That combination — high hit rate, payoff below one — is the signature of a short-volatility profile, and the twelve-month sample is far too short to have observed the loss that profile eventually produces.

Note also what is absent. Nothing above tells you how often the strategy traded, what it paid, or how large it could have been. Those are the questions that decide whether a Sharpe of 0.99 means anything.

---

#### The Metrics That Decide Whether the Backtest Is Real

**Turnover.** Combine it with a cost assumption to get an annual cost figure, then express the result as a break-even cost per round trip. A strategy that needs sub-basis-point execution is a different object from one that tolerates 20 bps, even at identical Sharpe. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).

**Capacity.** Rerun the backtest at increasing notional with an impact model attached and plot net return against size. The curve rises, flattens and falls. Report where it peaks. Without an impact model the curve is flat by construction, which is the same as claiming infinite capacity. See [Market Impact](/execution/market-impact).

**Exposure.** Record gross exposure, net exposure and, if the universe supports it, factor loadings on every bar. A strategy described as market-neutral that carries persistent net long exposure is a levered index position wearing a costume. See [Factor Models](/stat-methods/factor-models).

**Concentration of profit.** Compute what fraction of total profit came from the best 1% of periods, and from the single largest instrument. High concentration means the headline number is one observation, not many.

**Drawdown duration.** Depth is only half the picture. A 10% drawdown lasting three weeks and a 10% drawdown lasting two years are entirely different experiences for anyone funding the strategy.

**Uncertainty.** Every metric above is an estimate from a finite sample. Report a confidence interval, ideally from a block bootstrap that preserves serial dependence. See [Bootstrap Methods](/stat-methods/bootstrap) and [Confidence Intervals](/stat-methods/confidence-intervals).

---

#### In Practice Across Asset Classes

**Daily equities.** Sharpe is usually reported against a benchmark rather than cash, which makes it an information ratio. Turnover is quoted as a fraction of book value per year, and both borrow cost and dividend treatment materially change a long-short result.

**Intraday futures.** Annualisation factors get large — thousands of periods per year — so the estimation error in a Sharpe computed from a short sample is severe even when the number of observations sounds comfortable. Report the sample length in calendar time, not in observation count.

**FX.** Carry profiles show high hit rates and negative skew, so Sharpe flatters them and Sortino flatters them further. Drawdown and tail measures are the informative ones here. See [FX Carry and Parity](/markets/fx-carry-parity).

**Fixed income and credit.** Smoothed marks depress measured volatility and inflate every ratio with volatility in the denominator. Serial correlation in the return series also invalidates the `sqrt(T)` annualisation. Check [Autocorrelation](/quant-math/autocorrelation) before annualising anything.

**On-chain strategies.** Gas is a fixed cost per transaction rather than a proportional one, so turnover interacts with metrics differently: small trades are penalised far more than in fee-proportional markets. Samples are also short in calendar terms, which compounds every estimation problem above. See [Simulating LP Returns](/simulation/lp-returns).

---

#### Assumptions and Failure Modes

- **The equity curve is achievable.** Assumes marks were tradeable prices. Illiquid or model-marked positions smooth the curve and inflate every risk-adjusted ratio.
- **Returns are serially independent.** Assumes `sqrt(T)` annualisation is valid. Broken by autocorrelation from stale marks, overlapping holding periods, or momentum in the strategy itself.
- **The sample contains the relevant regimes.** Assumes the worst has been observed. Maximum drawdown is a sample minimum, and sample minima are biased optimistic by construction.
- **Metrics were not selected after the fact.** Assumes you chose the evaluation criteria before seeing the results. Reporting Sortino because Sharpe disappointed is a selection effect. See [Multiple Testing](/stat-methods/multiple-testing).
- **Costs are inside the equity curve.** Assumes the reported metrics are net. Gross-of-cost metrics are a different quantity and should never be compared to net ones.
- **A single run is informative.** Assumes the result is stable. Metrics from one path over one sample carry wide error bars — see [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Code

A single function returning the whole battery, including the fields most frameworks omit.

```python
import numpy as np


def evaluation_battery(returns, traded_notional, average_equity, periods_per_year=252):
    """Full battery from a return series plus recorded trading activity.

    `traded_notional` cannot be recovered from returns; the backtester
    has to log it. Without it, cost sensitivity is unknowable.
    """
    r = np.asarray(returns, dtype=float)
    equity = np.cumprod(1.0 + r)
    drawdown = 1.0 - equity / np.maximum.accumulate(equity)
    downside_dev = np.sqrt(np.mean(np.minimum(r, 0.0) ** 2))
    annual_return = equity[-1] ** (periods_per_year / len(r)) - 1
    max_drawdown = drawdown.max()
    wins, losses = r[r > 0], r[r < 0]
    scale = np.sqrt(periods_per_year)

    return {
        "annual_return": annual_return,
        "volatility": r.std(ddof=1) * scale,
        "sharpe": r.mean() / r.std(ddof=1) * scale,
        "sortino": r.mean() / downside_dev * scale,
        "max_drawdown": max_drawdown,
        "calmar": annual_return / max_drawdown if max_drawdown else np.nan,
        "annual_turnover": traded_notional.sum() / average_equity * periods_per_year / len(r),
        "hit_rate": len(wins) / (len(wins) + len(losses)),
        "payoff_ratio": wins.mean() / abs(losses.mean()) if len(losses) else np.nan,
        # Concentration: if one period dominates, the headline is one observation.
        "top_1pct_profit_share": np.sort(r)[-max(1, len(r) // 100):].sum() / r.sum(),
    }
```

---

#### See Also

* [Sharpe Ratio](/quant-math/sharpe)
* [Sortino Ratio](/quant-math/sortino)
* [Drawdown](/quant-math/drawdown)
* [VaR & CVaR](/quant-math/var-cvar)
* [Parameter Sweeps and Sensitivity Analysis](/simulation/param-sweeps)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Execution Benchmarks](/execution/execution-benchmarks)

---

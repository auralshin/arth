### Drawdown

> info **Metadata** Level: All | Prerequisites: Returns, Basic time-series | Tags: drawdown, risk, path-dependence, performance

Drawdown is the decline from a running high-water mark. At any moment it answers a question no distributional statistic can: how far below the best it has ever been is this account right now. Where volatility describes the dispersion of returns without regard to their order, drawdown is entirely about order — it is a **path-dependent** measure, and paths are what determine whether a position survives.

That makes it the risk measure that binds in practice. Margin calls, redemption triggers, stop rules, risk-committee limits, and the point at which an allocator stops waiting are all functions of drawdown rather than of variance. Two return series with identical means and identical volatilities can have entirely different drawdown profiles, and only one of them may be financeable.

---

#### Formal Definition

For an equity curve `V_t`, the running peak and the drawdown at time `t` are:

```text
Peak_t = max( V_s  for all s <= t )
DD_t   = (V_t - Peak_t) / Peak_t
```

`DD_t` is zero or negative, and it is zero exactly when the curve makes a new high. **Maximum drawdown** is the worst value over the sample:

```text
MDD = min( DD_t  over all t )
```

Related path statistics:

```text
Time to trough     periods from the peak to the lowest point
Recovery time      periods from the trough back to the old peak
Time under water   total periods spent below a previous peak
```

**Recovery asymmetry.** Escaping a drawdown of depth `d` requires a gain of:

```text
required_gain = d / (1 - d)
```

<table>
  <tbody>
    <tr>
      <td><strong>Drawdown</strong></td>
      <td>5%</td><td>10%</td><td>20%</td><td>30%</td><td>50%</td><td>70%</td>
    </tr>
    <tr>
      <td><strong>Gain needed to recover</strong></td>
      <td>5.3%</td><td>11.1%</td><td>25.0%</td><td>42.9%</td><td>100%</td><td>233%</td>
    </tr>
  </tbody>
</table>

The convexity of that table is why drawdown control dominates return maximisation in any strategy that intends to survive.

---

#### Worked Example

A quarterly equity curve over ten quarters:

<table>
  <tbody>
    <tr>
      <td><strong>Quarter</strong></td>
      <td>0</td><td>1</td><td>2</td><td>3</td><td>4</td>
      <td>5</td><td>6</td><td>7</td><td>8</td><td>9</td>
    </tr>
    <tr>
      <td><strong>Equity</strong></td>
      <td>100</td><td>108</td><td>103</td><td>96</td><td>101</td>
      <td>112</td><td>105</td><td>99</td><td>107</td><td>115</td>
    </tr>
    <tr>
      <td><strong>Running peak</strong></td>
      <td>100</td><td>108</td><td>108</td><td>108</td><td>108</td>
      <td>112</td><td>112</td><td>112</td><td>112</td><td>115</td>
    </tr>
    <tr>
      <td><strong>Drawdown (%)</strong></td>
      <td>0.00</td><td>0.00</td><td>-4.63</td><td>-11.11</td><td>-6.48</td>
      <td>0.00</td><td>-6.25</td><td>-11.61</td><td>-4.46</td><td>0.00</td>
    </tr>
  </tbody>
</table>

Working through the two episodes:

1. **First episode.** Peak `108` at quarter 1, trough `96` at quarter 3: `(96 - 108) / 108 = -11.11%`. Recovery when the curve exceeds `108`, which happens at quarter 5. Two quarters down, two quarters back.
2. **Second episode.** Peak `112` at quarter 5, trough `99` at quarter 7: `(99 - 112) / 112 = -11.61%`. Recovery at quarter 9. Again two quarters down, two back.
3. **Maximum drawdown**: `11.61%`, the second episode.
4. **Recovery check**: from `99` back to `112` requires `112/99 - 1 = 13.13%`, matching `0.1161 / (1 - 0.1161) = 13.13%`.
5. **Time under water**: 6 of 10 quarters were spent below a previous peak, despite the strategy finishing 15% up.

**Calmar ratio.** Ten quarters is 2.5 years, and total growth is 15%, so the compound annual rate is `1.15^(1/2.5) - 1 = 5.75%`. The Calmar ratio is annualised return over maximum drawdown:

```text
Calmar = 5.75% / 11.61% = 0.50
```

**Ulcer Index.** Maximum drawdown uses one observation out of ten. The Ulcer Index uses the whole underwater path — the root mean square of the drawdown series — which here gives `6.17%`. Two strategies with the same maximum drawdown can have very different Ulcer Indices if one recovers quickly and the other lingers.

> info **Note the arithmetic trap** The first episode falls 12 points and the second falls 13, but the percentage drawdowns are close because the second starts from a higher peak. Always compare drawdowns in percentage terms, never in currency.

---

#### Why Maximum Drawdown Is a Biased Statistic

Maximum drawdown is the minimum of a path, and minima do not converge the way means do. Three consequences follow:

- **It grows with sample length, mechanically.** For a driftless random walk, the expected extent of excursions scales with the square root of the horizon. A ten-year backtest will show a deeper maximum drawdown than a three-year one even if nothing about the strategy changed. Comparing maximum drawdowns across strategies with different sample lengths is comparing sample lengths.
- **It is a single observation.** It has no standard error in the usual sense and it is entirely determined by one episode. Remove that episode and the statistic changes completely.
- **The worst drawdown is almost always ahead of you.** A backtest reports the worst decline that occurred; a live strategy will eventually experience a worse one, because the sample keeps growing.

Robust alternatives: report the distribution of drawdowns rather than the maximum; report the average of the worst `k` drawdowns; report the Ulcer Index; and simulate drawdowns from resampled returns to obtain a distribution rather than a point. See [Bootstrap](/stat-methods/bootstrap) and [Scenarios](/simulation/scenarios).

---

#### In Practice Across Asset Classes

- **Equities.** Long-only equity drawdowns are deep and slow. Index-level declines of a third or more have occurred repeatedly across market history, with recoveries measured in years, which is why drawdown tolerance rather than volatility tolerance usually sets equity allocation.
- **Futures.** Drawdown interacts directly with margin. A decline that is survivable in an unlevered account triggers a margin call in a levered one, converting a paper drawdown into a realised loss at the worst point. See [Leverage & Liquidation](/risk/leverage-liquidation).
- **Managed futures and trend.** These strategies have long, shallow drawdowns by design — many small losses between trends. Maximum drawdown is a poor summary; time under water is the more informative statistic and is often the reason allocators leave.
- **FX.** Carry drawdowns are short and violent. The distinguishing feature is that the drawdown and the liquidity deterioration arrive together, so the exit is more expensive precisely when it is most needed.
- **Fixed income.** Drawdowns in a held-to-maturity book are mark-to-market rather than economic, but they still bind if the position is financed or if accounting forces recognition. The economic and reported drawdowns diverge.
- **Credit.** Marks are smoothed, so reported drawdowns understate and lag the true decline. The reported curve looks calm right up to the point at which the position must actually be sold.
- **On-chain.** Drawdown maps directly onto liquidation thresholds. A decline in collateral value that would be a temporary paper loss in an unlevered account becomes a permanent, automated loss once the health factor breaches. Drawdown here is not a discomfort measure but a solvency constraint. See [Liquidations](/building-blocks/liquidations).

---

#### Assumptions and Failure Modes

- **The equity curve must be marked at tradable prices.** Model marks and stale prices suppress the drawdown that actually occurred. This is the single largest source of understated drawdown across the industry.
- **Measurement frequency changes the answer.** A daily-marked curve will show a deeper maximum drawdown than the same strategy marked monthly, because monthly marks miss intra-month troughs. Compare like with like.
- **It is one number from one path.** The realised history is one draw from a distribution of possible paths. A strategy with a 12% historical maximum drawdown is not a strategy with a 12% ceiling.
- **It says nothing about what caused it.** A drawdown from a known, understood exposure is a different proposition from one whose source was not anticipated, and the statistic cannot distinguish them.
- **Drawdown limits interact badly with mean reversion.** A rule that cuts exposure at a drawdown threshold realises the loss and forgoes the recovery. For a mean-reverting strategy this converts a temporary decline into a permanent one. See [Stop Loss](/strategies/stop-loss).
- **Backtested drawdowns exclude the operational path.** Financing withdrawn, positions force-closed, and counterparties gone are not in the return series, and they are what turns a survivable drawdown into a terminal one. See [Operational Risk](/risk/operational).

> warning **Drawdown limits must be set before the drawdown** A tolerance chosen while in a decline is chosen by the decline. Fix the level, the response, and the authority to act, in advance and in writing.

---

#### Code

```python
import numpy as np
import pandas as pd

def drawdown_series(equity_curve):
    """Drawdown at each point, as a negative fraction of the running peak."""
    curve = pd.Series(equity_curve, dtype=float)
    running_peak = curve.cummax()
    return curve / running_peak - 1.0


def drawdown_summary(equity_curve):
    """Depth, timing and underwater duration in one pass.

    Report all of these: maximum depth alone hides how long recovery took.
    """
    dd = drawdown_series(equity_curve)
    trough = dd.idxmin()
    peak = pd.Series(equity_curve, dtype=float).loc[:trough].idxmax()
    return {
        "max_drawdown": float(dd.min()),
        "peak_index": peak,
        "trough_index": trough,
        "periods_under_water": int((dd < 0).sum()),
        "ulcer_index": float(np.sqrt((dd**2).mean())),
    }


def gain_to_recover(drawdown_fraction):
    """A 50% loss needs a 100% gain. The asymmetry is why depth dominates."""
    return drawdown_fraction / (1.0 - drawdown_fraction)
```

---

#### See Also

* [Sharpe Ratio](/quant-math/sharpe)
* [Sortino Ratio](/quant-math/sortino)
* [VaR & CVaR](/quant-math/var-cvar)
* [Position Sizing](/quant-math/position-sizing)
* [Kelly Criterion](/quant-math/kelly)
* [Leverage & Liquidation](/risk/leverage-liquidation)
* [Bootstrap](/stat-methods/bootstrap)

---

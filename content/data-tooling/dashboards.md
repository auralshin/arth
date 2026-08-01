### Dashboards

> info **Metadata** Level: Intermediate | Prerequisites: Building a Simple Data Pipeline, Backtest vs Live | Tags: monitoring, observability, data-quality, alerting, metrics

Most dashboards in quantitative shops are built to answer "how are we doing?" and end up being a profit-and-loss chart nobody acts on. The dashboards that earn their maintenance answer a narrower question: **is anything different from what we assumed?** A strategy losing money within its expected distribution needs no alert. A data feed that stopped updating forty minutes ago needs one immediately, and the profit-and-loss chart will not show it until much later, by which point the positions were sized on stale prices.

The distinction is between *outcome* metrics, which are noisy and slow, and *process* metrics, which are precise and fast. A day of losses tells you almost nothing, because a day is one draw from a wide distribution. A completeness check that says today's file has 62 rows fewer than the exchange calendar predicts tells you something definite, and it tells you before the model consumes the data. Monitoring effort should follow that asymmetry.

---

#### Three Audiences, Three Dashboards

<table>
  <tbody>
    <tr>
      <td><strong>Dashboard</strong></td>
      <td><strong>Question</strong></td>
      <td><strong>Latency</strong></td>
      <td><strong>Failure it catches</strong></td>
    </tr>
    <tr>
      <td>Data quality</td>
      <td>Is the data present, complete, fresh, and internally consistent?</td>
      <td>Minutes</td>
      <td>Stalled feed, short file, unapplied corporate action, schema change</td>
    </tr>
    <tr>
      <td>Live system health</td>
      <td>Is the system doing what it was told, at the cost we assumed?</td>
      <td>Seconds to minutes</td>
      <td>Rejected orders, drifting positions, latency spikes, breached limits</td>
    </tr>
    <tr>
      <td>Research and strategy</td>
      <td>Is live behaviour consistent with the backtest?</td>
      <td>Days to weeks</td>
      <td>Cost model wrong, capacity exceeded, signal decay, overfitting</td>
    </tr>
  </tbody>
</table>

These are usually built in the wrong order. The third gets built first because it is the interesting one; the first gets built after an incident. Reversing that order is the single highest-value change available, because data quality failures are common, fast to detect, and cheap to fix, whereas strategy underperformance is rare to diagnose and slow to confirm.

---

#### Data Quality Metrics

Six families cover most of what goes wrong. Each should be a number with a threshold, not a chart someone squints at.

<table>
  <tbody>
    <tr>
      <td><strong>Family</strong></td>
      <td><strong>Metric</strong></td>
      <td><strong>Typical trigger</strong></td>
    </tr>
    <tr>
      <td>Freshness</td>
      <td>Seconds since last update, per feed and per instrument</td>
      <td>Exceeds the expected inter-arrival time for this session</td>
    </tr>
    <tr>
      <td>Completeness</td>
      <td>Observed rows versus calendar-derived expectation</td>
      <td>Materially below expectation for the session type</td>
    </tr>
    <tr>
      <td>Validity</td>
      <td>Rows failing invariants: crossed quotes, negative size, OHLC bounds</td>
      <td>Any, at ingestion; a rate above baseline, in steady state</td>
    </tr>
    <tr>
      <td>Uniqueness</td>
      <td>Duplicate instrument-timestamp pairs</td>
      <td>Any — usually a non-idempotent write, see Pipeline</td>
    </tr>
    <tr>
      <td>Staleness</td>
      <td>Run length of identical quotes during an open session</td>
      <td>A run longer than the instrument's normal quiet period</td>
    </tr>
    <tr>
      <td>Cross-source agreement</td>
      <td>Absolute difference between two independent sources</td>
      <td>Beyond tolerance — locates the problem without naming the culprit</td>
    </tr>
  </tbody>
</table>

Add one distributional check that catches everything else: track the daily distribution of a feature and alert when it shifts. A signal whose cross-sectional standard deviation halves overnight has almost certainly lost part of its universe rather than discovered a calmer market.

---

#### Worked Example: A Completeness Alert That Survives

Consider one-minute bars for a market whose regular session runs 09:30 to 16:00 local time.

1. **Regular session length**: `16:00 - 09:30 = 6h 30m = 390` minutes, so `390` bars.
2. **Naive rule**: alert when the count is not exactly `390`. This is correct on regular days and wrong on every early close.
3. **Early close**: a session ending at 13:00 gives `13:00 - 09:30 = 3h 30m = 210` bars. The naive rule fires, the team learns the alert is unreliable, and it gets muted — after which the rule detects nothing at all.
4. **Calendar-aware rule**: derive the expectation from the exchange calendar for that date, so the threshold is `390` on a regular day and `210` on the early close.
5. **Tolerance for genuinely untraded minutes**: alert when the count falls below `98%` of expectation, which is `390 * 0.98 = 382.2`, so fewer than `383` bars on a regular day.

The lesson generalises beyond bar counts. An alert whose threshold ignores a known, legitimate source of variation will fire on that variation, and an alert that fires on legitimate variation gets silenced. **Alert fatigue is not a discipline problem; it is a threshold design problem.** Every muted alert began as a rule that was right in the common case and wrong in a case somebody knew about.

> warning **Absence of data is not absence of a problem** A dashboard fed by a broken pipeline shows a flat line, which looks calm. Monitor the age of the newest record, not only the values in it, or the most serious outage will be the quietest panel on the screen.

---

#### Live System Metrics

For a running system, the informative metrics are comparisons against an expectation rather than levels.

- **Position versus target.** The difference between intended and actual exposure, per instrument and in aggregate. Persistent non-zero drift means orders are not completing, and the strategy being run is not the one that was tested.
- **Realised versus modelled cost.** Slippage against the arrival price, compared with the backtest's cost assumption. This is where backtests most reliably diverge from live results. See [Transaction Cost Analysis](/execution/transaction-cost-analysis) and [Market Impact](/execution/market-impact).
- **Fill rate and rejection rate.** Rejections cluster around limit breaches, stale reference data, and venue rule changes, and the cluster is diagnostic.
- **Latency percentiles, never the mean.** Report the median alongside a high percentile. The mean of a heavy-tailed latency distribution describes nothing that ever happened. See [Latency Risk](/microstructure/latency-risk).
- **Risk limit utilisation.** Distance to each limit, so the alert arrives before the breach rather than as the breach.
- **Profit-and-loss attribution.** Split into signal, cost, financing, and unexplained. A growing unexplained component is the most useful early warning a live system produces, because it means the model of the system no longer matches the system.

Compare live against backtest continuously rather than at review time. Plot the live equity curve inside the distribution of backtest paths, and treat a live path that leaves the interior of that distribution as a hypothesis about a broken assumption, not as good or bad luck. See [Backtest vs Live](/risk/backtest-vs-live) and [Bootstrap](/stat-methods/bootstrap).

---

#### In Practice Across Asset Classes

**Equities.** Calendar awareness dominates: half-days, holidays that differ by venue, and auction periods where bar structure changes. Corporate actions need their own monitor, since an unapplied split appears as a large clean price jump that no generic outlier rule distinguishes from a real move. See [Corporate Actions](/markets/corporate-actions).

**Futures.** Monitor the roll explicitly. Volume migration between contracts, open interest crossing over, and the continuous series' roll adjustment are all things that break quietly and are obvious on a chart if anyone drew one. See [Roll and Carry](/markets/roll-and-carry).

**FX.** With no consolidated tape, cross-source disagreement is the primary quality signal. Triangular consistency — checking that `A/B` times `B/C` approximates `A/C` within spread — is cheap, continuous, and catches a stalled contributor faster than any freshness check.

**Fixed income.** Sparse trading makes freshness alerts noisy and staleness alerts essential. Track the proportion of prices that came from observed trades rather than from indicative quotes or a curve, because a falling proportion means the risk numbers are increasingly model output. See [Fixed Income 101](/markets/fixed-income-101).

**On-chain.** Monitor block lag against the chain head, reorganisation depth, and node or provider disagreement on the same block. The equivalent of a stale feed is an indexer that has fallen behind while still returning successful responses. See [RPC Nodes](/data-tooling/rpc-nodes) and [The Graph](/data-tooling/the-graph).

---

#### Assumptions and Failure Modes

- **Assumes a green dashboard means healthy.** A stalled feed produces no failures because it produces nothing. Freshness must be monitored explicitly.
- **Assumes fixed thresholds hold.** Thresholds calibrated in calm conditions fire constantly in a crisis, which is when they get muted and when they mattered.
- **Assumes the monitor is independent.** A quality check reading the same cached table as the pipeline shares its failure. Check against the source where possible.
- **Assumes more panels are better.** Attention is the scarce resource. A dashboard nobody can read in thirty seconds is a dashboard nobody reads.
- **Assumes alerts are actionable.** An alert without a documented response becomes noise on its second occurrence.
- **Assumes profit and loss is a monitor.** It is an outcome with an enormous variance, so it detects problems long after cheaper process metrics would have.
- **Assumes the monitoring stack cannot fail.** It can, and silently. A heartbeat that alerts on its own absence is the only defence.

---

#### Code

```python
import pandas as pd


def completeness_report(bars: pd.DataFrame, calendar: pd.DataFrame,
                        tolerance: float = 0.98) -> pd.DataFrame:
    """Compare observed bar counts against the session length for each date.

    `calendar` supplies expected_bars per trade_date, derived from the
    exchange's actual open and close. A constant expectation is the reason
    completeness alerts get muted after the first early close.
    """
    observed = bars.groupby(["trade_date", "instrument_id"]).size().rename("observed")
    report = observed.reset_index().merge(calendar, on="trade_date", how="left")
    report["ratio"] = report["observed"] / report["expected_bars"]
    report["breach"] = report["ratio"] < tolerance
    return report.sort_values("ratio")


def freshness_seconds(last_update: pd.Series, now: pd.Timestamp) -> pd.Series:
    """Age of the newest record per feed. Monitors absence, which value-based
    checks structurally cannot: a dead feed emits no bad values at all."""
    return (now - last_update).dt.total_seconds()


def cross_source_gap(primary: pd.Series, secondary: pd.Series,
                     tolerance_bps: float = 10.0) -> pd.DataFrame:
    """Relative disagreement between two independent sources, in basis points.

    Disagreement does not identify which source is wrong. It identifies the
    instrument and the timestamp, which is the expensive part of the search.
    """
    aligned = pd.concat([primary.rename("a"), secondary.rename("b")], axis=1).dropna()
    gap_bps = (aligned["a"] - aligned["b"]).abs() / aligned["b"] * 10_000
    return aligned.assign(gap_bps=gap_bps, breach=gap_bps > tolerance_bps)


def unexplained_pnl(realised: pd.Series, signal_pnl: pd.Series,
                    cost_pnl: pd.Series, financing_pnl: pd.Series) -> pd.Series:
    """Residual after attribution. A trending residual means the model of the
    system has diverged from the system — the earliest warning available."""
    return realised - (signal_pnl + cost_pnl + financing_pnl)
```

---

#### See Also

* [Building a Simple Data Pipeline](/data-tooling/pipeline)
* [Cleaning and Resampling Market Data](/data-tooling/cleaning)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Operational Risk](/risk/operational)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Risk Checklists](/risk/checklists)

---

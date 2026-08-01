### Code Snippets

> info **Metadata** Level: Intermediate | Prerequisites: Basic Python, Returns | Tags: reference, code, python, pandas, numpy, snippets

A library of short, self-contained Python functions for the calculations that recur across quantitative research: loading and cleaning a price series, computing returns and volatility, evaluating performance, building indicators, running a simple backtest, and sizing risk.

Every snippet on this page runs as written on a standard `numpy` and `pandas` installation. They are written to be copied into a notebook and read in one screen, not to be a library — there is no packaging, no configuration, and no error handling unless the error handling *is* the lesson.

> warning **These are teaching implementations** They omit the input validation, timezone handling, and edge-case guards that production code needs. Read the linked page for the conventions and failure modes before relying on any of them.

---

#### Conventions Used Throughout

- Inputs are `pandas` objects indexed by a timezone-aware `DatetimeIndex`, sorted ascending.
- `returns` always means simple returns unless the name says `log`.
- Rates passed as `risk_free_rate` are **per period**, matching the return series, not annual.
- `periods_per_year` is 252 for daily equity data, 365 for daily crypto data, 12 for monthly.
- Functions return new objects; nothing is modified in place.

```python
import numpy as np
import pandas as pd
```

---

#### Loading and Cleaning

```python
def load_prices(path, price_column="close", tz="UTC"):
    """Read a CSV of bars into a sorted, timezone-aware price series.

    Duplicated timestamps are a data-vendor artefact, not a market event:
    keeping the last observation matches how a live feed would have seen them.
    """
    frame = pd.read_csv(path, parse_dates=["timestamp"])
    frame = frame.set_index("timestamp").sort_index()
    if frame.index.tz is None:
        frame.index = frame.index.tz_localize(tz)
    frame = frame[~frame.index.duplicated(keep="last")]
    return frame[price_column]
```

```python
def resample_ohlcv(bars, rule="1D"):
    """Aggregate finer bars into coarser ones without inventing data.

    Bars with no trades are dropped rather than forward-filled, because a
    synthetic flat bar looks like a genuine zero return to every estimator.
    """
    aggregated = bars.resample(rule).agg(
        {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"}
    )
    return aggregated.dropna(subset=["open"])
```

```python
def flag_suspect_prices(prices, max_abs_log_move=0.5, reversion_tolerance=0.2):
    """Mark bars that jump and immediately revert, the signature of a bad print.

    A genuine move persists into the next bar; a mistaken print does not.
    Returns a boolean Series aligned to `prices`, for inspection rather than
    silent deletion.
    """
    log_move = np.log(prices).diff()
    next_move = log_move.shift(-1)
    large = log_move.abs() > max_abs_log_move
    reverts = (log_move + next_move).abs() < reversion_tolerance * log_move.abs()
    return (large & reverts).fillna(False)
```

Pages: [Market Data Sources](/data-tooling/data-sources), [Cleaning and Resampling Market Data](/data-tooling/cleaning), [Getting Historical Time Series](/data-tooling/time-series).

---

#### Point-in-Time Joins

```python
def as_of_join(observations, reference, on="timestamp", knowledge="knowledge_time"):
    """Attach each observation the most recent reference value KNOWN at the time.

    Joining on event time instead of knowledge time is the single most common
    source of lookahead bias in a backtest built from vendor data.
    """
    left = observations.sort_values(on)
    right = reference.sort_values(knowledge)
    return pd.merge_asof(
        left, right, left_on=on, right_on=knowledge, direction="backward"
    )
```

Pages: [Data Preparation for Backtests](/simulation/data-prep), [Reproducible Experiments](/data-tooling/reproducible).

---

#### Returns and Volatility

```python
def simple_returns(prices):
    """Period-over-period simple returns."""
    return prices.pct_change().dropna()


def log_returns(prices):
    """Log returns, which add across time and are the natural modelling unit."""
    return np.log(prices).diff().dropna()
```

```python
def realised_volatility(returns, periods_per_year=252, window=None):
    """Annualised volatility, either over the full sample or on a rolling window.

    The sqrt scaling assumes returns are serially uncorrelated. Where they are
    not, this understates true annualised risk.
    """
    scale = np.sqrt(periods_per_year)
    if window is None:
        return returns.std(ddof=1) * scale
    return returns.rolling(window).std(ddof=1) * scale
```

```python
def ewma_volatility(returns, decay=0.94, periods_per_year=252):
    """Exponentially weighted annualised volatility.

    Reacts faster than a rolling window because old observations decay
    geometrically instead of dropping out all at once.
    """
    variance = returns.pow(2).ewm(alpha=1 - decay, adjust=False).mean()
    return np.sqrt(variance * periods_per_year)
```

```python
def parkinson_volatility(high, low, periods_per_year=252, window=20):
    """Range-based volatility estimator, more efficient than close-to-close.

    Blind to overnight gaps, since it only sees the intraday range.
    """
    log_range_squared = np.log(high / low) ** 2
    variance = log_range_squared.rolling(window).mean() / (4 * np.log(2))
    return np.sqrt(variance * periods_per_year)
```

Pages: [Returns](/quant-math/returns), [Volatility](/quant-math/volatility), [Rolling Windows](/quant-math/rolling-windows).

---

#### Performance Metrics

```python
def sharpe_ratio(returns, risk_free_rate=0.0, periods_per_year=252):
    """Annualised Sharpe ratio. risk_free_rate is per period, matching returns."""
    excess = returns - risk_free_rate
    deviation = excess.std(ddof=1)
    if deviation == 0:
        return np.nan
    return excess.mean() / deviation * np.sqrt(periods_per_year)


def sharpe_standard_error(sharpe, n_periods):
    """Standard error of a Sharpe estimate, valid for IID returns.

    Treat it as a lower bound when returns autocorrelate. Quoting a Sharpe
    without this is like quoting a poll without its margin of error.
    """
    return np.sqrt((1 + 0.5 * sharpe**2) / n_periods)
```

```python
def sortino_ratio(returns, target=0.0, periods_per_year=252):
    """Excess return per unit of downside deviation.

    The denominator divides by the full observation count, not by the number
    of losing periods. The other convention exists and gives a different number.
    """
    excess = returns - target
    downside = np.sqrt(np.mean(np.minimum(excess, 0.0) ** 2))
    if downside == 0:
        return np.nan
    return excess.mean() / downside * np.sqrt(periods_per_year)
```

```python
def drawdown_series(equity):
    """Fractional drawdown from the running peak, at every point in time."""
    running_peak = equity.cummax()
    return equity / running_peak - 1.0


def max_drawdown(equity):
    """Worst peak-to-trough decline, as a negative fraction."""
    return drawdown_series(equity).min()


def time_under_water(equity):
    """Number of periods spent below a previous peak.

    Depth is what gets reported; duration is what people actually quit over.
    """
    return int((drawdown_series(equity) < 0).sum())
```

```python
def calmar_ratio(equity, periods_per_year=252):
    """Annualised return divided by maximum drawdown.

    Rests on a single order statistic, so it is far noisier than it looks.
    """
    years = len(equity) / periods_per_year
    total_growth = equity.iloc[-1] / equity.iloc[0]
    annualised = total_growth ** (1 / years) - 1
    worst = abs(max_drawdown(equity))
    if worst == 0:
        return np.nan
    return annualised / worst
```

```python
def performance_summary(returns, risk_free_rate=0.0, periods_per_year=252):
    """The battery, not the scalar. Returns a Series of the usual metrics."""
    equity = (1 + returns).cumprod()
    sharpe = sharpe_ratio(returns, risk_free_rate, periods_per_year)
    losses = returns[returns < 0]
    wins = returns[returns > 0]
    return pd.Series(
        {
            "annualised_return": equity.iloc[-1] ** (periods_per_year / len(returns)) - 1,
            "annualised_volatility": returns.std(ddof=1) * np.sqrt(periods_per_year),
            "sharpe": sharpe,
            "sharpe_se": sharpe_standard_error(sharpe, len(returns)),
            "sortino": sortino_ratio(returns, risk_free_rate, periods_per_year),
            "max_drawdown": max_drawdown(equity),
            "calmar": calmar_ratio(equity, periods_per_year),
            "hit_rate": len(wins) / max(len(wins) + len(losses), 1),
            "payoff_ratio": wins.mean() / abs(losses.mean()) if len(losses) else np.nan,
            "skew": returns.skew(),
            "excess_kurtosis": returns.kurt(),
        }
    )
```

Pages: [Sharpe Ratio](/quant-math/sharpe), [Sortino Ratio](/quant-math/sortino), [Drawdown](/quant-math/drawdown), [Performance Metrics for Backtests](/simulation/metrics).

---

#### Indicators

```python
def sma(prices, window=20):
    """Simple moving average."""
    return prices.rolling(window).mean()


def ema(prices, span=20):
    """Exponential moving average with the standard alpha = 2 / (span + 1)."""
    return prices.ewm(span=span, adjust=False).mean()
```

```python
def rsi(close, period=14):
    """Relative strength index using Wilder's smoothing.

    Wilder's alpha is 1 / period, equivalent to an EMA of span 2*period - 1.
    Passing `period` straight into an EMA of that span is the classic bug.
    """
    change = close.diff()
    gains = change.clip(lower=0.0)
    losses = -change.clip(upper=0.0)
    average_gain = gains.ewm(alpha=1 / period, adjust=False).mean()
    average_loss = losses.ewm(alpha=1 / period, adjust=False).mean()
    relative_strength = average_gain / average_loss.replace(0.0, np.nan)
    return 100 - 100 / (1 + relative_strength)
```

```python
def true_range(high, low, close):
    """True range, which includes the gap from the previous close."""
    previous_close = close.shift(1)
    candidates = pd.concat(
        [high - low, (high - previous_close).abs(), (low - previous_close).abs()],
        axis=1,
    )
    return candidates.max(axis=1)


def atr(high, low, close, period=14):
    """Average true range, Wilder-smoothed. Volatility in price units."""
    return true_range(high, low, close).ewm(alpha=1 / period, adjust=False).mean()
```

```python
def bollinger_bands(prices, window=20, num_std=2.0, ddof=0):
    """Middle, upper and lower bands.

    Bollinger's original definition uses the population standard deviation
    (ddof=0); pandas defaults to the sample version, which widens the envelope.
    """
    middle = prices.rolling(window).mean()
    deviation = prices.rolling(window).std(ddof=ddof)
    return pd.DataFrame(
        {
            "middle": middle,
            "upper": middle + num_std * deviation,
            "lower": middle - num_std * deviation,
        }
    )


def percent_b(prices, window=20, num_std=2.0):
    """Position of price within the bands, on a 0 to 1 scale."""
    bands = bollinger_bands(prices, window, num_std)
    width = bands["upper"] - bands["lower"]
    return (prices - bands["lower"]) / width
```

```python
def rolling_zscore(series, window=60):
    """Standardise a series against its own recent history.

    The workhorse transform for turning any raw feature into a comparable one.
    """
    mean = series.rolling(window).mean()
    deviation = series.rolling(window).std(ddof=1)
    return (series - mean) / deviation
```

```python
def variance_ratio(returns, q=5):
    """Variance ratio at horizon q. One under a random walk.

    Above one indicates trending behaviour, below one indicates reversal.
    """
    values = np.asarray(returns, dtype=float)
    usable = len(values) - (len(values) % q)
    one_period = values[:usable]
    q_period = one_period.reshape(-1, q).sum(axis=1)
    return q_period.var(ddof=1) / (q * one_period.var(ddof=1))
```

Pages: [Moving Averages (SMA, EMA)](/signals/moving-averages), [Relative Strength Index (RSI)](/signals/rsi), [Average True Range (ATR)](/signals/atr), [Bollinger Bands](/signals/bollinger), [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion).

---

#### Backtest Skeleton

```python
def backtest(prices, signal, cost_bps=5.0, max_leverage=1.0):
    """Vectorised single-asset backtest with proportional trading costs.

    The shift(1) is the whole point: today's position must be decided from
    yesterday's signal, or the result is an accounting of the future.
    """
    position = signal.clip(-max_leverage, max_leverage).shift(1).fillna(0.0)
    asset_returns = prices.pct_change().fillna(0.0)
    traded = position.diff().abs().fillna(position.abs())
    costs = traded * cost_bps / 10_000
    strategy_returns = position * asset_returns - costs
    return pd.DataFrame(
        {
            "position": position,
            "asset_return": asset_returns,
            "cost": costs,
            "strategy_return": strategy_returns,
            "equity": (1 + strategy_returns).cumprod(),
        }
    )
```

```python
def turnover(position, periods_per_year=252):
    """Annualised one-way turnover, the multiplier on per-trade cost."""
    return position.diff().abs().sum() / len(position) * periods_per_year


def breakeven_cost_bps(strategy_returns, position):
    """Cost level at which the strategy's gross edge is exactly consumed.

    Compare against your realised cost before believing any Sharpe ratio.
    """
    traded = position.diff().abs().sum()
    if traded == 0:
        return np.inf
    return strategy_returns.sum() / traded * 10_000
```

Pages: [Why Backtest and Simulate?](/simulation/why-backtest), [Event-Driven Backtesting Basics](/simulation/event-driven), [Building a Simple Backtester](/simulation/building-backtester), [Backtest vs Live Trading](/risk/backtest-vs-live).

---

#### Risk Calculations

```python
def historical_var(returns, alpha=0.95):
    """Historical VaR as a positive loss number.

    Empirical quantiles say nothing about the tail beyond the worst observation
    in the sample, which is exactly where the interesting losses live.
    """
    return -np.quantile(np.asarray(returns, dtype=float), 1 - alpha)


def historical_cvar(returns, alpha=0.95):
    """Mean loss conditional on exceeding the VaR threshold."""
    values = np.asarray(returns, dtype=float)
    threshold = np.quantile(values, 1 - alpha)
    tail = values[values <= threshold]
    return -tail.mean() if len(tail) else np.nan
```

```python
def volatility_target_weight(returns, target_annual_vol=0.10,
                             window=60, periods_per_year=252, max_weight=3.0):
    """Scale exposure inversely to a rolling volatility estimate.

    Capping matters: as the estimate approaches zero the raw weight diverges.
    """
    estimate = returns.rolling(window).std(ddof=1) * np.sqrt(periods_per_year)
    weight = target_annual_vol / estimate
    return weight.clip(upper=max_weight)
```

```python
def kelly_fraction(mean_excess_return, variance, cap=0.5):
    """Continuous-case Kelly fraction, capped.

    Full Kelly maximises long-run growth and produces drawdowns almost nobody
    tolerates in practice, which is why the cap is the default rather than an option.
    """
    if variance <= 0:
        return 0.0
    return float(np.clip(mean_excess_return / variance, -cap, cap))


def liquidation_price(entry_price, leverage, maintenance_margin, is_long=True):
    """Price at which a levered position hits its maintenance requirement."""
    if is_long:
        return entry_price * (1 - 1 / leverage) / (1 - maintenance_margin)
    return entry_price * (1 + 1 / leverage) / (1 + maintenance_margin)
```

Pages: [VaR & CVaR](/quant-math/var-cvar), [Position Sizing](/quant-math/position-sizing), [Kelly Criterion](/quant-math/kelly), [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation).

---

#### Statistics

```python
def ols_beta(y, x):
    """Slope, intercept and R-squared of a univariate OLS regression.

    Written out rather than imported so the standard error below is visibly
    the classical one, which is wrong whenever residuals autocorrelate.
    """
    y_values = np.asarray(y, dtype=float)
    x_values = np.asarray(x, dtype=float)
    x_centred = x_values - x_values.mean()
    beta = float((x_centred * (y_values - y_values.mean())).sum() / (x_centred**2).sum())
    alpha = float(y_values.mean() - beta * x_values.mean())
    fitted = alpha + beta * x_values
    residual_ss = float(((y_values - fitted) ** 2).sum())
    total_ss = float(((y_values - y_values.mean()) ** 2).sum())
    return {"alpha": alpha, "beta": beta, "r_squared": 1 - residual_ss / total_ss}
```

```python
def block_bootstrap(returns, block_size=20, n_replications=1000, seed=0):
    """Resample contiguous blocks so serial dependence survives the resample.

    An IID bootstrap destroys autocorrelation and volatility clustering, which
    is precisely the structure that makes financial confidence intervals wide.
    """
    rng = np.random.default_rng(seed)
    values = np.asarray(returns, dtype=float)
    n_blocks = int(np.ceil(len(values) / block_size))
    starts = rng.integers(0, len(values) - block_size + 1, size=(n_replications, n_blocks))
    offsets = np.arange(block_size)
    indices = (starts[:, :, None] + offsets).reshape(n_replications, -1)
    return values[indices[:, : len(values)]]


def bootstrap_sharpe_interval(returns, periods_per_year=252, level=0.95, **kwargs):
    """Percentile confidence interval for the Sharpe ratio."""
    samples = block_bootstrap(returns, **kwargs)
    scale = np.sqrt(periods_per_year)
    ratios = samples.mean(axis=1) / samples.std(axis=1, ddof=1) * scale
    tail = (1 - level) / 2
    return float(np.quantile(ratios, tail)), float(np.quantile(ratios, 1 - tail))
```

Pages: [Linear Regression](/stat-methods/linear-regression), [Bootstrap](/stat-methods/bootstrap), [Confidence Intervals](/stat-methods/confidence-intervals), [Regression Diagnostics](/stat-methods/regression-diagnostics).

---

#### Putting It Together

A complete evaluation from a price series to a metric battery, using only the functions above.

```python
def evaluate_moving_average_rule(prices, fast=20, slow=100, cost_bps=5.0):
    """End-to-end example: signal, backtest, then the full metric battery.

    Deliberately reports the Sharpe standard error and the breakeven cost
    alongside the headline number, because neither is optional.
    """
    signal = np.sign(ema(prices, fast) - ema(prices, slow))
    result = backtest(prices, signal, cost_bps=cost_bps)
    strategy_returns = result["strategy_return"].dropna()
    summary = performance_summary(strategy_returns)
    summary["turnover"] = turnover(result["position"])
    summary["breakeven_cost_bps"] = breakeven_cost_bps(
        strategy_returns, result["position"]
    )
    return summary
```

> warning **A result from this function is a hypothesis, not an edge** One parameter pair on one asset over one sample tells you almost nothing. See [Parameter Sweeps and Sensitivity Analysis](/simulation/param-sweeps) and [Backtest Overfitting](/stat-methods/backtest-overfitting) for what has to happen next.

---

#### See Also

* [Working with Market Data in Python](/data-tooling/python)
* [Backtesting in Python](/simulation/python)
* [Formula Reference](/reference/formulas)
* [Indicator Index](/reference/indicators)
* [Metric Index](/reference/metric-index)
* [Code Examples](/contributing/code-examples)

---

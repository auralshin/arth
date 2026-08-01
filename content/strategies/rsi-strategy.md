### RSI-Based Entry and Exit Rules

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility, RSI | Tags: rsi, mean-reversion, oscillator, entry-rules, overfitting

The **Relative Strength Index (RSI)** compresses recent up-moves and down-moves into a single number between 0 and 100. A trading rule built on it typically buys when RSI falls below a low threshold and exits when it recovers — the canonical thresholds being 30 and 70, taken from J. Welles Wilder's 1978 presentation of the indicator.

The rule is easy to state and easy to backtest, which is precisely the problem. RSI is a deterministic function of the price series: it contains no information that is not already in the returns. Whatever edge an RSI rule has must come from the *shape* of the transformation making a genuine statistical property easier to act on — not from the indicator revealing anything new. This page takes that claim seriously and asks what would have to be true for it to hold.

> warning **Not Financial Advice** This page explains how RSI rules are specified and where they break down. It is not a recommendation to trade any rule or threshold.

---

#### Why It Might Work: The Economic Rationale

An RSI rule with a low entry threshold is a **short-horizon mean-reversion strategy**. Its economic case is narrow but real, and it has nothing to do with the number 30.

**Liquidity provision to urgent sellers.** When a participant needs to exit a position quickly — a redemption, a margin call, a risk-limit breach, a hedge that must be put on today — they pay for immediacy by accepting worse prices. The price moves further than the information warrants, and it recovers once the flow is absorbed. The counterparty who buys into that pressure is supplying liquidity and is compensated for the inventory risk of holding an asset that just fell. This is the same economics as [market making](/strategies/mm-lite), expressed at a slower frequency, and it is the only rationale for short-horizon reversal that survives scrutiny.

**Overreaction to salient news.** A closely related behavioural account holds that participants over-extrapolate dramatic news, pushing prices past fair value before correcting. This is harder to distinguish empirically from the liquidity account and makes weaker predictions.

**What RSI contributes.** RSI is a smoothed, bounded measure of one-sided price pressure over a lookback window. Its usefulness, if any, is that it normalises: a reading of 25 means roughly the same thing on an asset trading at 8 as on one trading at 8,000, which a raw price change does not. That normalisation is a genuine convenience. It is not an edge.

**What would have to be true.** For the rule to have positive expected return, returns must exhibit *negative* short-horizon serial correlation of a magnitude exceeding round-trip costs, in the specific asset and regime being traded. That property is not universal — it is roughly the opposite of what [momentum](/strategies/momentum) assumes at longer horizons — and it varies enormously across markets and across time. See [Autocorrelation](/quant-math/autocorrelation) and [Mean Reversion](/quant-math/mean-reversion).

> warning **The thresholds carry no theory** 30 and 70 are conventions from a book written for hand-drawn charts. There is no model in which they are optimal. Tuning them on historical data is one of the purest forms of parameter fitting available, because the parameter is scale-free and the search space is small enough to exhaust.

---

#### Formal Definition

Over a lookback of `n` periods, split each price change into its up and down parts:

```text
gain_t = max(P_t - P_{t-1}, 0)
loss_t = max(P_{t-1} - P_t, 0)
```

Wilder's smoothing is a recursive average with weight `1/n` on the newest observation:

```text
avg_gain_t = ( avg_gain_{t-1} * (n - 1) + gain_t ) / n
avg_loss_t = ( avg_loss_{t-1} * (n - 1) + loss_t ) / n
```

The relative strength and the index itself:

```text
RS_t  = avg_gain_t / avg_loss_t
RSI_t = 100 - 100 / (1 + RS_t)
```

which simplifies to a form that is easier to reason about and avoids the division-by-zero case:

```text
RSI_t = 100 * avg_gain_t / (avg_gain_t + avg_loss_t)
```

where:

- `n` is the lookback, conventionally 14 periods
- `avg_gain`, `avg_loss` are seeded with simple averages over the first `n` periods
- `RSI_t` is bounded in `[0, 100]` and equals 50 when average gains and losses are equal

A representative rule set:

```text
entry (long):  RSI_{t-1} <= 30  and  RSI_t > 30      -> enter at t+1 open
exit  (long):  RSI_t >= 50                            -> exit at t+1 open
stop:          P_t <= P_entry - k * ATR_n             -> exit immediately
time stop:     t - t_entry >= H bars                  -> exit at t+1 open
```

Entering on the *cross back above* the threshold rather than on the threshold breach is a deliberate choice: it avoids adding to a position while the pressure that caused the fall is still active. It also delays entry and gives up part of the move. Neither variant is correct in general.

Wilder's smoothing means RSI is an infinite-memory statistic — every past bar retains some weight — so RSI computed from a short warm-up differs from RSI computed from a long one. This routinely produces mismatches between a backtest and a live feed.

---

#### Worked Example: Three Bars of Wilder RSI

Take `n = 14`. After the seeding window, the sum of gains over the 14 periods is 3.50 and the sum of losses is 10.50, so `avg_gain = 0.25` and `avg_loss = 0.75`. All figures are illustrative arithmetic constructed for this example.

<table>
  <tbody>
    <tr><td><strong>Bar</strong></td><td><strong>Close</strong></td><td><strong>Change</strong></td><td><strong>avg_gain</strong></td><td><strong>avg_loss</strong></td><td><strong>RSI</strong></td></tr>
    <tr><td>14</td><td>92.00</td><td>&mdash;</td><td>0.2500</td><td>0.7500</td><td>25.00</td></tr>
    <tr><td>15</td><td>94.10</td><td>+2.10</td><td>0.3821</td><td>0.6964</td><td>35.43</td></tr>
    <tr><td>16</td><td>95.50</td><td>+1.40</td><td>0.4548</td><td>0.6467</td><td>41.29</td></tr>
  </tbody>
</table>

1. **Bar 14 RSI**: `100 * 0.25 / (0.25 + 0.75) = 25.00`. Below 30, so the rule is watching but not yet positioned.
2. **Bar 15 update**: gain of 2.10, no loss. `avg_gain = (0.25 * 13 + 2.10) / 14 = 5.35 / 14 = 0.3821`, and `avg_loss = (0.75 * 13 + 0) / 14 = 9.75 / 14 = 0.6964`.
3. **Bar 15 RSI**: `100 * 0.3821 / (0.3821 + 0.6964) = 35.43`. RSI has crossed from below 30 to above it — the entry condition fires.
4. **Execution**: the position is taken at the bar 16 open, not the bar 15 close. Using the close that generated the signal as the fill price is look-ahead, and on a rule that trades reversals it can account for a large share of apparent performance, because the signal bar is by construction a bar that moved.
5. **Bar 16 update**: gain of 1.40. `avg_gain = (0.3821 * 13 + 1.40) / 14 = 0.4548`, `avg_loss = (0.6964 * 13) / 14 = 0.6467`, giving RSI 41.29. Still below the exit level of 50, so the position is held.

Notice how much of the recovery happened between the signal and the fill: the close that triggered the entry was 94.10, and the trade is being put on the following bar. The gap between those two prices is the strategy's most fragile assumption.

---

#### Implementation Considerations

**The long-only version inherits drift.** On an asset with positive expected return, a rule that is long roughly 40% of the time will make money in a rising market whether or not the reversal effect exists. The comparison that matters is against [buy and hold](/strategies/buy-hold) scaled to the same average exposure — not against zero.

**Exit design dominates entry design.** A rule that enters at RSI 30 and exits at 50 has a different holding period, hit rate, and cost profile from one that exits at 70, and the two are not variations on a theme — they are different strategies. Adding a time stop bounds the tail case where RSI never recovers.

**Bar frequency changes the meaning.** RSI(14) on daily bars measures roughly three weeks of pressure; on 5-minute bars it measures just over an hour. The economic story — liquidity provision to urgent sellers — is far more plausible at the short end, where it is also comprehensively swamped by costs for anyone without a low-latency infrastructure.

**Combining with a trend filter.** A common construction takes RSI signals only in the direction of a longer-horizon trend. This is a legitimate response to the strategy's worst failure mode, but each added condition is another parameter, and the joint search space grows multiplicatively. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### In Practice Across Asset Classes

**Equities.** Short-horizon reversal is strongest in smaller, more volatile, less liquid names — the same names where the spread and impact costs are largest. That is not a coincidence: the reversal *is* the compensation for supplying liquidity there. Index constituents with tight spreads show weaker reversal because the compensation is competed away.

**Futures.** Trend behaviour is more pronounced than in equities, and a reversal rule applied to a trending contract sits on the wrong side of a persistent drift. Session boundaries and overnight gaps make bar-based RSI sensitive to how the session is defined.

**FX.** Major pairs are among the most liquid instruments in existence, so the liquidity-provision premium is small. Reversal signals in FX often reflect scheduled flow rather than pressure, and behave differently around fixings.

**Fixed income.** Prices are driven by rate expectations rather than by inventory pressure at most horizons, so the mean-reversion rationale is weak except in specific dislocations. Sizing must be in DV01 terms.

**On-chain markets.** Order flow is public and pending transactions are observable, so a mechanical rule that reacts to a large move is competing with participants who saw the move being constructed. Costs are lumpy, and slippage on a thin pool during exactly the volatility spike the rule keys on is at its worst. See [Slippage](/microstructure/slippage) and [Slippage and Front-Running](/risk/slippage-frontrunning).

---

#### Assumptions and Failure Modes

- **Assumes reversal, not continuation.** In a sustained downtrend RSI can remain below 30 for many bars while price keeps falling. The rule then buys repeatedly into a decline. This is the single most common way RSI strategies lose money, and it is a direct consequence of the assumption being false in that regime.
- **Assumes the thresholds mean something.** They do not. Any reported result is contingent on a choice that was made for chart-reading convenience, and a rule whose profitability disappears at a threshold of 28 or 32 has discovered nothing.
- **Assumes the fill is near the signal price.** Reversal signals fire on bars with large moves, which are also the bars with the widest spreads and thinnest books. The gap between backtest and live execution is systematically adverse here. See [Backtest vs Live](/risk/backtest-vs-live).
- **Assumes the indicator adds information.** It does not. RSI is a function of past prices, so any RSI rule is a restricted form of a rule on returns. If a general return-based reversal model shows no effect, the RSI version is not going to find one.
- **Ignores costs relative to edge.** Short-horizon reversal edges are small per trade. A rule that trades often converts a modest gross edge into a reliable net loss.
- **Vulnerable to divergence-style discretion.** "Bullish divergence" — price making a lower low while RSI does not — is identified after the fact and has no unambiguous definition. It cannot be backtested honestly, and rules containing it are not systematic.
- **Assumes stable volatility.** RSI has no volatility normalisation. The same reading means something different in a calm regime than in a crisis, and stops set in price terms will be hit at very different frequencies across regimes. See [ATR](/signals/atr).

---

#### Code

```python
import numpy as np
import pandas as pd


def wilder_rsi(close, window=14):
    """RSI with Wilder's smoothing (alpha = 1/n), the original definition.

    Note this differs from an EMA-based RSI using alpha = 2/(n+1);
    the two produce visibly different readings, so backtest and live
    implementations must agree on which one is in use.
    """
    change = close.diff()
    gain = change.clip(lower=0.0)
    loss = (-change).clip(lower=0.0)

    avg_gain = gain.ewm(alpha=1.0 / window, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / window, adjust=False).mean()

    # Equivalent to 100 - 100/(1+RS), but well behaved when avg_loss is 0.
    return 100.0 * avg_gain / (avg_gain + avg_loss)


def rsi_positions(close, window=14, entry=30.0, exit_level=50.0, max_bars=20):
    """Long-only reversal rule. Enters on the cross back above `entry`,
    exits on `exit_level` or after `max_bars`.

    The returned series is the position held from t to t+1, so it must
    be lagged against returns by one bar when computing P&L.
    """
    rsi = wilder_rsi(close, window)
    crossed_up = (rsi.shift(1) <= entry) & (rsi > entry)

    position = pd.Series(0.0, index=close.index)
    bars_held = 0
    in_trade = False

    for t in range(1, len(close)):
        if in_trade:
            bars_held += 1
            if rsi.iloc[t] >= exit_level or bars_held >= max_bars:
                in_trade = False
                bars_held = 0
        elif crossed_up.iloc[t]:
            in_trade = True
            bars_held = 0
        position.iloc[t] = 1.0 if in_trade else 0.0

    return position
```

---

#### See Also

* [RSI](/signals/rsi)
* [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion)
* [Mean Reversion](/quant-math/mean-reversion)
* [Stop-Loss and Take-Profit Frameworks](/strategies/stop-loss)
* [RSI Walkthrough](/case-studies/rsi-walkthrough)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)

---

### Roll and Carry

> info **Metadata** Level: Intermediate | Prerequisites: Futures 101, Returns | Tags: futures, roll, carry, contango, backwardation, continuous-series

Futures contracts expire. A view that lasts longer than one contract must be moved into the next one, and that move — the **roll** — has an economic consequence that has nothing to do with whether the underlying went up or down. Over a year of monthly rolls, this consequence can dominate the return of a position that was directionally correct the whole time.

The roll also creates a data problem with no clean solution. There is no such thing as "the price of oil futures over ten years", because no contract lived that long. Every long futures history is a stitched construction, and the stitching convention changes the returns you compute from it. Two researchers with the same raw data and different roll conventions will report different Sharpe ratios for the same strategy.

---

#### Contango and Backwardation

```text
Contango:        F(near) < F(far)      the curve slopes upward
Backwardation:   F(near) > F(far)      the curve slopes downward
```

These describe the shape of the futures curve at a point in time, nothing more. They are not forecasts. A curve in contango does not predict that prices will rise; it reflects the cost of holding the underlying between the two dates, which for a financial asset is financing minus income, and for a commodity is financing plus storage minus convenience yield. See [Commodities](/markets/commodities) for the physical case.

The consequence for a position held through a roll is direct. A long in contango sells the cheaper expiring contract and buys the more expensive next one, so the position loses ground unless spot rises to compensate. A long in backwardation does the reverse and gains.

---

#### Roll Yield

Decompose the total return of a fully collateralised long futures position:

```text
total_return = spot_return + roll_yield + collateral_return
```

where:

- `spot_return` is the change in the underlying spot price
- `roll_yield` is the return from convergence as each contract approaches expiry
- `collateral_return` is the interest earned on the cash backing the position

A simple annualised approximation of the roll yield between two adjacent contracts:

```text
roll_yield ≈ (F_near / F_far - 1) * 365 / days_between_expiries
```

---

#### Worked Example: The Cost of Standing Still

A commodity trades at a spot price of 100. The one-month future is 101 and the two-month future is 102 — a curve in steady contango, with 30 days between expiries.

1. **Enter.** Buy the one-month future at 101.
2. **Wait a month.** Spot is unchanged at 100. The contract you hold is now expiring, so it must converge to spot: it settles at 100.
3. **Loss on the position**: `100 / 101 - 1 = -0.9901%` for the month, with no move in the underlying at all.
4. **Roll.** The curve has rolled forward and the new one-month future is again 101. Buy it, and repeat.
5. **Annualised drag**: `(1 - 0.009901)^12 - 1 = -11.3%` per year, compounded.

Cross-check with the approximation formula: `(101 / 102 - 1) * 365 / 30 = -0.009804 * 12.167 = -11.9%`. The two differ because one compounds and the other does not, and because the approximation measures the slope between the two listed contracts rather than the realised convergence. Both say the same thing: a persistently contangoed curve costs roughly the slope of the curve, annualised, to be long.

Now invert the curve. If the one-month future were 99 and spot 100, the same mechanics deliver `100 / 99 - 1 = +1.01%` per month, or `(1.010101)^12 - 1 = +12.8%` a year of positive roll yield. This is why the shape of the curve, not the direction of spot, drives the long-run return of a passive commodity index.

> info **Roll yield is not free money** Backwardation usually exists because holders of the physical asset are being compensated for a real service — supplying inventory in a tight market. The positive carry is payment for bearing the risk that the tightness resolves.

---

#### Building a Continuous Series

To backtest anything you need one series. Three choices must be made explicitly.

**When to roll.** Common rules: a fixed number of days before expiry, on the day open interest in the next contract exceeds the front, or on the exchange's own index roll schedule. Each produces a different series.

**Which contract to roll into.** The next listed month, or a deferred month chosen to avoid the steepest part of the curve.

**How to stitch.** This is where the substantive difference lies.

Take a series that rolls after day 3. The expiring contract settles at 100 on the roll date; the new contract trades at 102.

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
    <tr><td><strong>Raw (front contract)</strong></td><td>90</td><td>95</td><td>100</td><td>102</td><td>101</td><td>103</td></tr>
    <tr><td><strong>Back-adjusted (+2)</strong></td><td>92</td><td>97</td><td>102</td><td>102</td><td>101</td><td>103</td></tr>
    <tr><td><strong>Ratio-adjusted (x1.02)</strong></td><td>91.80</td><td>96.90</td><td>102.00</td><td>102</td><td>101</td><td>103</td></tr>
  </tbody>
</table>

The raw series shows a jump from 100 to 102 on day 4 that no trader experienced — they rolled at those two prices simultaneously. Both adjustments remove the jump, differently:

- **Back-adjustment** adds the roll gap `102 - 100 = +2` to every price before the roll. It preserves *absolute point differences*: the day-1-to-day-2 move is 5 points in both the raw and adjusted series. But it distorts percentage returns: `97 / 92 - 1 = 5.43%` against the true `95 / 90 - 1 = 5.56%`.
- **Ratio adjustment** multiplies every prior price by `102 / 100 = 1.02`. It preserves *percentage returns* exactly — `96.90 / 91.80 - 1 = 5.56%` — but distorts point differences, showing 5.10 points instead of 5.

Choose by what the strategy consumes. A percentage-return or volatility-scaled strategy needs ratio adjustment. A strategy whose rules are denominated in points or ticks — a fixed stop, a breakout of a certain size — needs back-adjustment. Using the wrong one is not a rounding error: over decades of rolls, back-adjusted prices can go negative, at which point percentage returns computed from them are meaningless.

> warning **The roll convention is part of the result** As noted on [Sharpe Ratio](/quant-math/sharpe), a managed-futures programme evaluated on a back-adjusted series and the same programme evaluated on a ratio-adjusted series can report visibly different Sharpe ratios from identical trades. Any published futures backtest without a stated roll convention is not reproducible.

---

#### Across Asset Classes

**Equity index futures.** Contango is the normal state, because financing exceeds the dividend yield in most rate environments. The roll is quarterly, concentrated in a few days, and heavily traded — the calendar spread itself is a liquid instrument. See [Calendar Spreads](/markets/calendar-spreads).

**Commodities.** The most variable case. Energy curves flip between contango and backwardation with inventory; agricultural curves are shaped by harvest seasonality; precious metals sit close to full carry because storage is cheap and they can be lent. Storage capacity places a hard limit on how steep contango can get, and no limit at all on backwardation.

**Interest rate futures.** The "roll" is better thought of as rolling down the yield curve. A steep curve means the contract's implied rate falls as it ages, generating carry independent of any rate move. See [Yield Curves](/markets/yield-curves).

**FX forwards.** The forward points are entirely determined by the interest rate differential, so the roll return is the carry, exactly. See [FX Carry and Parity](/markets/fx-carry-parity).

**Volatility futures.** Curves are usually steeply upward-sloping in calm regimes and invert sharply in stress, producing one of the largest and most persistent roll effects in listed markets — and one of the most punishing when it inverts.

**Perpetual futures.** No expiry, so no roll and no stitching problem. The carry is paid continuously as a funding rate instead of being embedded in the curve, which makes it directly observable rather than inferred. See [Funding Rate](/signals/funding-rate) and [Perpetual Futures](/building-blocks/perpetual-futures).

---

#### Assumptions and Failure Modes

- **Assuming roll yield persists.** Curve shape is a state, not a constant. Strategies calibrated on a decade of one regime fail when it flips, and the flip is usually fast.
- **Assuming the roll executes at the settlement spread.** The roll is a crowded, dated trade. A large participant rolling on the same schedule as an index pays for the privilege.
- **Mixing conventions within one study.** Prices from a back-adjusted series and returns from a ratio-adjusted one will silently disagree.
- **Ignoring negative back-adjusted prices.** Long histories of steeply contangoed contracts can produce a back-adjusted series that crosses zero. Any percentage calculation on it is invalid.
- **Treating the front contract as spot.** It is not spot; it is a contract with time value remaining. Basis is small near expiry, not zero, and near expiry it is also at its most volatile.
- **Ignoring liquidity migration.** Volume moves to the next contract before the front expires. A series that holds the front too long is priced on a thinning book.

---

#### Code

```python
import numpy as np


def stitch(front_prices, roll_index, gap_ratio, gap_diff, method="ratio"):
    """Splice a contract history at one roll point.

    front_prices: array of prices, old contract before roll_index, new after.
    gap_ratio:    new_contract_price / old_contract_price on the roll date.
    gap_diff:     new_contract_price - old_contract_price on the roll date.
    Ratio preserves returns; difference preserves point moves. Pick one and
    state it wherever the results are reported.
    """
    out = np.asarray(front_prices, dtype=float).copy()
    if method == "ratio":
        out[:roll_index] *= gap_ratio
    else:
        out[:roll_index] += gap_diff
    return out


def annualised_roll_yield(near, far, days_between):
    """Slope-based approximation. Negative in contango, positive in backwardation."""
    return (near / far - 1.0) * 365.0 / days_between
```

---

#### See Also

* [Futures 101](/markets/futures-101)
* [Calendar Spreads](/markets/calendar-spreads)
* [Commodities](/markets/commodities)
* [Sharpe Ratio](/quant-math/sharpe)
* [Basis Signals](/signals/basis)
* [Cash and Carry](/strategies/cash-carry)

---

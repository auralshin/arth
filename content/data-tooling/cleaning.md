### Cleaning and Resampling Market Data

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Market Data Sources | Tags: data, cleaning, corporate-actions, outliers, missing-data, stale-quotes

Raw market data is not wrong so much as *literal*. It records what the venue and the vendor recorded, including erroneous prints, quotes nobody could have traded on, prices quoted in the wrong units after a split, and rows that are absent because the collector failed rather than because the market was shut. Cleaning is the process of converting that literal record into a series that means what your model assumes it means.

The dangerous thing about cleaning is that both under-cleaning and over-cleaning produce plausible-looking output. Leave a bad print in and a volatility estimate explodes. Filter aggressively and you delete the genuine crash you were trying to study. The discipline is therefore not "remove anomalies" but "classify each anomaly, decide deliberately, and record what you did".

---

#### A Taxonomy of Defects

<table>
  <tbody>
    <tr>
      <td><strong>Defect</strong></td>
      <td><strong>Signature</strong></td>
      <td><strong>Usual cause</strong></td>
    </tr>
    <tr>
      <td>Bad print</td>
      <td>One tick far from neighbours, immediately reverted</td>
      <td>Fat finger, mis-keyed price, test message on the feed</td>
    </tr>
    <tr>
      <td>Unadjusted action</td>
      <td>Large clean jump, price roughly halves or doubles</td>
      <td>Split, reverse split, or spin-off not applied</td>
    </tr>
    <tr>
      <td>Stale quote</td>
      <td>Bid and ask unchanged across many intervals</td>
      <td>Feed stall, market closed, instrument not quoted</td>
    </tr>
    <tr>
      <td>Crossed or locked book</td>
      <td>Bid at or above ask</td>
      <td>Cross-venue composite, timestamp skew, latency</td>
    </tr>
    <tr>
      <td>Structural gap</td>
      <td>Missing rows</td>
      <td>Holiday, halt, delisting, or a failed collection job</td>
    </tr>
    <tr>
      <td>Unit drift</td>
      <td>Prices off by a constant factor over a date range</td>
      <td>Currency redenomination, contract-size change, minor units</td>
    </tr>
  </tbody>
</table>

Notice that two of these — the unadjusted action and the failed collection job — are indistinguishable from real market events if you only look at the price column. Resolving them requires reference data, not statistics.

---

#### Corporate Actions and Adjustment

A **corporate action** changes the relationship between a share and the economic claim it represents: splits, reverse splits, cash dividends, stock dividends, rights issues, spin-offs, and mergers. Raw exchange prices reflect the action on the day it takes effect. If you compute returns from raw prices, every action becomes a phantom return.

Adjustment applies a multiplicative factor to all prices *before* the ex-date, so the series is continuous through the event:

```text
adj_factor(t) = product over events e with ex_date(e) > t of f(e)

f(split n-for-1)   = 1 / n
f(cash dividend D) = 1 - D / close(ex_date - 1)

adjusted_close(t)  = close(t) * adj_factor(t)
adjusted_volume(t) = volume(t) / adj_factor_price_only(t)
```

where `f(e)` is the factor for a single event, `n` is the split ratio, `D` is the dividend per share, and volume moves inversely to price so that price times volume stays comparable.

**Worked example.** One instrument over five sessions. A cash dividend of `2.00` goes ex on day 2, and a 2-for-1 split takes effect on day 4.

<table>
  <tbody>
    <tr>
      <td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td>
    </tr>
    <tr>
      <td><strong>Raw close</strong></td>
      <td>100.00</td><td>98.00</td><td>99.00</td><td>50.00</td><td>51.00</td>
    </tr>
    <tr>
      <td><strong>Event</strong></td>
      <td>—</td><td>ex-div 2.00</td><td>—</td><td>2-for-1 split</td><td>—</td>
    </tr>
  </tbody>
</table>

1. **Naive returns from raw closes**: `-2.00%`, `+1.02%`, `-49.49%`, `+2.00%`. The day-4 figure is entirely an artefact, and the day-2 figure is a real cash flow misread as a loss.
2. **Dividend factor**: `1 - 2.00 / 100.00 = 0.98`, applying to day 1 only (all days strictly before the ex-date).
3. **Split factor**: `1 / 2 = 0.5`, applying to days 1, 2 and 3.
4. **Cumulative factors**: day 1 `0.98 * 0.5 = 0.49`; days 2 and 3 `0.5`; days 4 and 5 `1.0`.
5. **Adjusted closes**: `49.00`, `49.00`, `49.50`, `50.00`, `51.00`.
6. **Adjusted returns**: `0.00%`, `+1.02%`, `+1.01%`, `+2.00%`.

The phantom `-49.49%` is gone, the dividend day correctly shows a flat total return, and day 3 is unchanged because it shares a factor with day 2.

> warning **Adjusted prices are not historical prices** After adjustment, day 1 reads `49.00` — a level at which the share never traded. Liquidity screens, tick-size rules, price-level filters, and anything denominated in currency must use raw prices. Return calculations use adjusted prices. Mixing them is a common and quiet error.

Two further consequences follow. First, adjustment is **retroactive**: a dividend paid tomorrow rewrites every price in the file. A cached adjusted series and a fresh download will legitimately disagree, which is why pipelines should store raw prices plus an action table and derive the adjusted series on read. Second, the dividend convention above is one of several in use; some vendors chain total returns directly as `(P_t + D_t) / P_{t-1}`, which differs at second order when the ex-date price move is not exactly the dividend. Record which convention your source uses. See [Corporate Actions](/markets/corporate-actions).

---

#### Bad Prints, Outliers, and Stale Quotes

An outlier filter must answer one question: is this observation implausible *given the market*, or merely large? A move of five standard deviations means nothing during a crisis and everything at 03:00 in an illiquid name.

Useful discriminators, in rough order of reliability:

- **Reversion.** A genuine move persists; a bad print reverts on the next tick. Testing `|r_t + r_{t+1}|` against `|r_t|` catches this without assuming a distribution.
- **Quote consistency.** A trade far outside the prevailing bid-ask is suspect in a way a trade inside it is not.
- **Robust scale.** Use a rolling median and median absolute deviation rather than mean and standard deviation, since a single extreme value corrupts the very statistics used to detect it.
- **Condition codes.** Where the feed labels prints (auction, late-reported, off-book, corrected), the label is better evidence than any statistic. Discarding condition codes early destroys information you cannot rebuild.

**Stale quotes** are the opposite failure: data that is present but not live. A quote repeated unchanged for an hour contributes zero measured volatility while the true uncertainty grows, which biases realised volatility down and autocorrelation up. Detect staleness by run length of identical values, and treat a stale interval as missing rather than as a flat return. See [Autocorrelation](/quant-math/autocorrelation).

---

#### Missing Data

Decide what "missing" means before choosing a strategy, because the same row absence has several causes:

<table>
  <tbody>
    <tr>
      <td><strong>Meaning</strong></td>
      <td><strong>Correct handling</strong></td>
    </tr>
    <tr>
      <td>Market closed (holiday, weekend)</td>
      <td>Not missing. The date should not be in the index at all.</td>
    </tr>
    <tr>
      <td>Instrument not yet listed or already dead</td>
      <td>Not missing. Exclude from the universe on that date.</td>
    </tr>
    <tr>
      <td>Trading halt</td>
      <td>Genuinely no price. Carry the last valid quote, flagged as stale.</td>
    </tr>
    <tr>
      <td>Illiquid, no trade that day</td>
      <td>Forward-fill the price, but never the volume, and mark the row.</td>
    </tr>
    <tr>
      <td>Collection failure</td>
      <td>Refetch. Filling it manufactures data that existed and was lost.</td>
    </tr>
  </tbody>
</table>

Forward-filling is the default in most codebases and is defensible for price levels, provided the filled rows carry a flag so downstream volatility and correlation estimates can exclude them. Interpolating *between* known values is almost always wrong for prices, because it uses the future value to construct the past one. Filling with zero returns is worse still: it asserts the price did not move, which is a claim about the market rather than about the data.

---

#### In Practice Across Asset Classes

**Equities.** Corporate actions dominate. Add identifier changes, multiple listings of one entity, and the interaction between adjustment and index membership. Auction prints at the open and close often need separating from continuous trading.

**Futures.** Individual contracts are clean; the stitched continuous series is where the artefacts live. A roll produces a price discontinuity that is not a return, and the adjustment method (back-adjusted differences, ratio-adjusted, or unadjusted with an explicit roll flag) changes every historical level. Keep the roll dates as data. See [Roll and Carry](/markets/roll-and-carry).

**FX.** No consolidated tape means composites built from different contributor sets, so crossed quotes and one-off spikes are common near session boundaries and thin hours. Cross-rate consistency (checking that `A/B * B/C` approximates `A/C`) is a cheap and effective validator. See [FX 101](/markets/fx-101).

**Fixed income.** Much of the series is indicative or model-derived rather than traded. The failure mode is inverted: the data looks unusually smooth, so outlier detection finds nothing while measured volatility is far too low. Track how many observations were real trades. See [Fixed Income 101](/markets/fixed-income-101).

**On-chain.** The ledger has no bad prints in the traditional sense — every recorded swap genuinely executed. The equivalent defects are reorganised blocks, decoding errors, and prices from pools too thin to be economically meaningful. A single large swap against a shallow pool is a real transaction and a meaningless price. Filter by liquidity depth rather than by statistical distance. See [Event Logs](/data-tooling/event-logs) and [Wallet Analytics](/data-tooling/wallet-analytics).

---

#### Assumptions and Failure Modes

- **Assumes the action table is complete.** A single missing split leaves a phantom return that dominates any statistic computed over that window.
- **Assumes adjustment direction.** Applying factors to the wrong side of the ex-date inverts the error instead of fixing it, and it looks superficially correct.
- **Assumes outliers are errors.** Aggressive filtering removes exactly the tail events that risk models exist to capture, flattering every drawdown statistic.
- **Assumes present means live.** Stale quotes suppress volatility, inflate autocorrelation, and make illiquid assets look attractive on risk-adjusted measures. See [Sharpe Ratio](/quant-math/sharpe).
- **Assumes forward-fill is harmless.** It is, for levels; it is not for volume, spread, or any count, where it invents activity.
- **Assumes cleaning is deterministic.** Rules based on rolling statistics change their output when the window start changes, so a rerun over a longer history can clean a different set of rows. See [Reproducible Experiments](/data-tooling/reproducible).
- **Assumes clean once.** Vendors restate. A cleaning step run in 2023 and rerun in 2025 over the same date range can legitimately produce different data.

---

#### Code

```python
import numpy as np
import pandas as pd

def apply_corporate_actions(prices: pd.DataFrame, actions: pd.DataFrame) -> pd.DataFrame:
    """Back-adjust closes and volumes for splits and cash dividends.

    `actions` has columns ex_date, kind ('split'|'dividend'), value.
    Factors apply to every row STRICTLY BEFORE the ex-date, so the
    cumulative factor is built from the end of the series backwards.
    """
    factor = pd.Series(1.0, index=prices.index)
    for ex_date, kind, value in actions.itertuples(index=False):
        if kind == "split":
            f = 1.0 / value
        else:  # cash dividend, using the close before the ex-date
            prior = prices["close"].asof(ex_date - pd.Timedelta(days=1))
            f = 1.0 - value / prior
        factor.loc[factor.index < ex_date] *= f

    out = prices.copy()
    out["adj_close"] = prices["close"] * factor
    out["adj_volume"] = prices["volume"] / factor  # price down, size up
    return out


def flag_bad_prints(close: pd.Series, window: int = 21, threshold: float = 8.0) -> pd.Series:
    """Flag single-tick spikes that immediately revert.

    Median and MAD are used instead of mean and standard deviation because
    the outlier being hunted would otherwise inflate its own denominator.
    """
    log_ret = np.log(close).diff()
    med = log_ret.rolling(window, center=True, min_periods=5).median()
    mad = (log_ret - med).abs().rolling(window, center=True, min_periods=5).median()
    robust_z = (log_ret - med) / (1.4826 * mad.replace(0, np.nan))
    reverts = np.sign(log_ret) != np.sign(log_ret.shift(-1))
    return (robust_z.abs() > threshold) & reverts


def flag_stale(quote: pd.Series, min_run: int = 5) -> pd.Series:
    """Flag runs of identical quotes — present data that is not live."""
    block = (quote != quote.shift()).cumsum()
    return quote.groupby(block).transform("size") >= min_run
```

---

#### See Also

* [Market Data Sources](/data-tooling/data-sources)
* [Getting Historical Time Series](/data-tooling/time-series)
* [Corporate Actions](/markets/corporate-actions)
* [Reproducible Experiments](/data-tooling/reproducible)
* [Volatility](/quant-math/volatility)
* [Data Preparation](/simulation/data-prep)

---

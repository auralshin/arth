### Corporate Actions and Price Adjustment

> info **Metadata** Level: Intermediate | Prerequisites: Equities 101, Returns | Tags: equities, corporate-actions, data-quality, dividends, splits

A corporate action is any event that changes the terms of the security itself rather than its market value. A two-for-one split doubles the share count and halves the price; the owner is no poorer. A £2 dividend removes £2 of cash from the company; the owner is no poorer either, because they hold the £2. In both cases the quoted price falls, and in both cases a return computed naively from that quoted price is fiction.

This is the single largest source of silent error in equity research. It does not throw an exception and it does not look wrong. A 2-for-1 split shows up as a `-50%` day, a spin-off as a `-30%` day, and a strategy that trades on large negative moves will happily accumulate a portfolio of companies that did nothing but restructure their share register.

---

#### The Main Event Types

<table>
  <tbody>
    <tr><td><strong>Event</strong></td><td><strong>What changes</strong></td><td><strong>Effect on quoted price</strong></td><td><strong>Effect on holder's wealth</strong></td></tr>
    <tr><td>Cash dividend</td><td>Cash leaves the company</td><td>Falls by roughly the dividend on the ex-date</td><td>None — cash replaces price</td></tr>
    <tr><td>Forward split (2-for-1)</td><td>Share count doubles</td><td>Halves</td><td>None</td></tr>
    <tr><td>Reverse split (1-for-10)</td><td>Share count falls tenfold</td><td>Multiplies by ten</td><td>None, except fractional-share cash-outs</td></tr>
    <tr><td>Stock dividend / scrip</td><td>New shares issued pro rata</td><td>Falls proportionally</td><td>None</td></tr>
    <tr><td>Rights issue</td><td>Shareholders may buy new shares below market</td><td>Falls to the theoretical ex-rights price</td><td>None if the rights are exercised or sold</td></tr>
    <tr><td>Spin-off</td><td>A division becomes a separate listed company</td><td>Falls by the value of the distributed entity</td><td>None — the holder receives the new shares</td></tr>
    <tr><td>Merger, cash</td><td>Shares are cancelled for cash</td><td>Series ends</td><td>Realised at the offer price</td></tr>
    <tr><td>Merger, stock</td><td>Shares are exchanged at a fixed ratio</td><td>Series continues in the acquirer</td><td>Depends on the acquirer's price</td></tr>
  </tbody>
</table>

Only cash mergers, delistings and bankruptcies genuinely end a return series. Everything else should be continued through the event, not truncated at it.

---

#### Worked Example: Adjusting a Contaminated Series

A share pays a £2.00 dividend and then splits two-for-one, within five days.

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td><strong>Raw close</strong></td><td>100.00</td><td>99.00</td><td>102.00</td><td>51.00</td><td>52.00</td></tr>
    <tr><td><strong>Event</strong></td><td>—</td><td>Ex-div £2.00</td><td>—</td><td>2-for-1 split</td><td>—</td></tr>
  </tbody>
</table>

The naive return over the window is `52.00 / 100.00 - 1 = -48.0%`. The correct answer is a gain. Work it out one period at a time, using the general total-return form:

```text
R_t = (P_t * S_t + D_t) / P_(t-1) - 1
```

where:

- `P_t` is the raw closing price on day `t`
- `D_t` is any cash distributed with an ex-date of day `t`, per pre-event share
- `S_t` is the number of new shares each old share became on day `t` (1 if no split, 2 for a 2-for-1)

Step by step:

1. **Day 1 to 2**, ex-dividend: `(99.00 + 2.00) / 100.00 - 1 = +1.000%`
2. **Day 2 to 3**, nothing happens: `102.00 / 99.00 - 1 = +3.0303%`
3. **Day 3 to 4**, the split: each old share is now two shares worth 51.00, so `(51.00 * 2) / 102.00 - 1 = 0.000%`
4. **Day 4 to 5**: `52.00 / 51.00 - 1 = +1.9608%`
5. **Compound them**: `1.01 * 1.030303 * 1.0 * 1.019608 = 1.061010`, a **+6.10%** total return

To turn that into an adjusted price series, chain the returns backwards from the most recent price so that today's price is unchanged:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td><strong>Adjusted close</strong></td><td>49.0099</td><td>49.5000</td><td>51.0000</td><td>51.0000</td><td>52.0000</td></tr>
  </tbody>
</table>

Check: `52.0000 / 49.0099 - 1 = +6.10%`, matching the compounded returns exactly. Day 1's cumulative adjustment factor is `49.0099 / 100.00 = 0.490099`, which decomposes into the split factor `0.5` and the dividend factor `99 / (99 + 2) = 0.980198`.

> warning **Two dividend conventions exist and they disagree** Many vendors use the shortcut factor `1 - D / P_cum = 1 - 2/100 = 0.980000`, giving an adjusted day-1 close of 49.0000 rather than 49.0099. The shortcut assumes the price falls by exactly the dividend; the exact factor `P_ex / (P_ex + D)` uses what actually happened. The gap is small per event and compounds across decades of history. Know which one your data uses before comparing two sources.

---

#### How Adjustment Factors Work in Practice

A vendor stores, for each event, a factor `f` that converts pre-event prices into post-event terms. The adjusted price on day `t` is:

```text
P_adj(t) = P_raw(t) * prod( f_k  for all events k with ex-date after t )
```

Two consequences follow directly and both surprise people:

**Adjusted history changes every time a dividend is paid.** The adjusted price of a share ten years ago is not a fact; it is a function of everything that has happened since. A backtest re-run after a dividend gives different numbers on the same data. Store the raw series and the event table, not the adjusted series.

**Price-adjusted and total-return series are different objects.** A *split-only adjusted* series shows what the price did. A *fully adjusted* series shows what a reinvesting holder earned. Comparing a strategy computed on one against a benchmark computed on the other manufactures alpha equal to the dividend yield.

Spin-offs are the hardest case, because you need the value of the distributed entity on the distribution date, and that value is often only observable from the new company's first traded price. Rights issues need the theoretical ex-rights price:

```text
TERP = (N_old * P_cum + N_new * P_subscription) / (N_old + N_new)
```

For a 1-for-4 rights issue at £8.00 with the shares at £10.00: `(4 * 10.00 + 1 * 8.00) / 5 = 48 / 5 = 9.60`. The adjustment factor is `9.60 / 10.00 = 0.96`.

---

#### Across Asset Classes

**Equities.** The full menagerie above. Cross-listed shares complicate matters further, since the same event lands on different dates in different currencies.

**Equity indices.** Indices handle the event through the divisor rather than the price, so an index level is continuous through a constituent's split by construction. See [Equity Indices](/markets/equity-indices).

**Futures.** No corporate actions, but expiry poses the same structural problem: a raw series is discontinuous at the roll and needs an explicit adjustment convention. See [Roll and Carry](/markets/roll-and-carry).

**Fixed income.** The analogue is the coupon. Quoted prices are clean, excluding accrued interest, so a return series built from clean prices systematically understates total return by exactly the coupon. See [Fixed Income 101](/markets/fixed-income-101).

**FX.** No corporate actions, but currency redenominations and pegs breaking are the structural breaks. Historical series spanning a redenomination need explicit handling.

**On-chain tokens.** Token splits are rare but rebasing tokens, which change every holder's balance algorithmically, are the exact analogue of a stock dividend — the balance changes, the wealth does not. Airdrops behave like spin-offs. See [Token Standards](/building-blocks/token-standards).

---

#### Assumptions and Failure Modes

- **Assuming the vendor caught everything.** Small-cap and emerging-market corporate actions are frequently missed or dated wrongly. Scan for absolute daily returns above roughly 30% and inspect them by hand; most will be real, and the ones that are not are your data errors.
- **Assuming the adjustment convention is documented.** Two providers can both be "adjusted" and disagree by the cumulative dividend yield over the sample. Always reconcile a few known events between sources.
- **Using adjusted prices for anything price-level dependent.** Tick sizes, round lots, penny-stock filters and price-based liquidity screens must use raw prices. A share adjusted back to £0.40 was never a penny stock.
- **Assuming ex-date equals payment date.** The price adjusts on the ex-date; the cash arrives weeks later. For a daily return series the ex-date is the one that matters.
- **Ignoring withholding tax.** A gross-dividend total-return series overstates what a taxable foreign holder actually received, sometimes by 15–30% of the dividend depending on treaty. Net and gross return indices both exist for this reason.
- **Truncating a series at a merger.** Dropping the acquired company from the sample after the announcement removes the very outcome an event study is trying to measure.

---

#### Code

```python
import numpy as np
import pandas as pd


def total_return_series(raw_close, dividends, split_ratios):
    """Correct total returns through dividends and splits.

    raw_close: Series of unadjusted closes, indexed by date.
    dividends: Series of cash per pre-event share, indexed by EX-date.
    split_ratios: Series of new-shares-per-old-share, indexed by effective date.
    """
    div = dividends.reindex(raw_close.index).fillna(0.0)
    split = split_ratios.reindex(raw_close.index).fillna(1.0)
    # The split multiplies the shares you hold; the dividend adds cash.
    return (raw_close * split + div) / raw_close.shift(1) - 1.0


def back_adjusted_prices(raw_close, returns):
    """Adjusted series anchored so the LAST price equals the raw last price.

    Re-derive this whenever new events land; do not cache it as if it were data.
    """
    growth = (1.0 + returns.fillna(0.0)).cumprod()
    return raw_close.iloc[-1] * growth / growth.iloc[-1]
```

---

#### See Also

* [Equities 101](/markets/equities-101)
* [Equity Indices](/markets/equity-indices)
* [Roll and Carry](/markets/roll-and-carry)
* [Returns](/quant-math/returns)
* [Data Cleaning](/data-tooling/cleaning)
* [Backtest vs Live](/risk/backtest-vs-live)

---

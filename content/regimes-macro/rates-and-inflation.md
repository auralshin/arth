### Rates and Inflation Regimes

> info **Metadata** Level: Intermediate | Prerequisites: Fixed Income Basics, Duration, Present Value | Tags: regimes, macro, interest-rates, inflation, breakevens, duration, discount-rate

Every asset is a claim on future cash flows, and every valuation of future cash flows requires a discount rate. The policy rate set by a central bank is the anchor for that discount rate: it fixes the short end of the curve, and expectations about its future path fix much of the rest. When the anchor moves, the price of every long-dated claim moves with it — not because bonds and equities are correlated, but because they share an input.

This is why a **rate regime** is the most consequential kind of regime. A change in the level or expected path of policy rates does not affect one asset class; it re-prices all of them simultaneously, and it does so in proportion to how far into the future their cash flows lie. Long-duration assets move most. That single fact explains why an equity index, a long government bond, and a growth-heavy portfolio can all fall together on the same day despite having nothing else in common.

---

#### Formal Definition

**Present value.** The value of a claim to cash flows `CF_t` at discount rate `y`:

```text
PV = sum over t of  CF_t / (1 + y)^t
```

**The Fisher relation** connects nominal and real rates through expected inflation:

```text
(1 + i) = (1 + r) * (1 + pi_e)

i ~= r + pi_e            (the common approximation, dropping r * pi_e)
```

where:

- `i` is the nominal interest rate
- `r` is the real interest rate
- `pi_e` is expected inflation over the same horizon

**Breakeven inflation** is the market-implied inflation rate that would make a nominal bond and an inflation-linked bond of the same maturity deliver identical returns:

```text
breakeven ~= y_nominal - y_real
```

**Duration and convexity** measure the price sensitivity of any claim to a change in its discount rate:

```text
dP / P  ~=  -D_mod * dy  +  0.5 * C * dy^2
```

where `D_mod` is modified duration (percentage price change per unit change in yield), `C` is convexity, and `dy` is the yield change.

---

#### Worked Example: A 100bp Repricing

Suppose the whole discount-rate curve shifts up by 100 basis points. Price three hypothetical claims.

**1. A bond with modified duration 7.0 and convexity 65.**

```text
first-order:  -7.0 * 0.01           = -7.000%
convexity:     0.5 * 65 * 0.01^2    = +0.325%
total                               = -6.675%
```

Convexity is a positive correction for a conventional bond: it loses slightly less on a rate rise, and gains slightly more on a fall, than duration alone predicts.

**2. An equity paying 3.00 per share, growing at 3% forever, discounted at 8%.**

Using the constant-growth valuation `P = D / (r - g)`:

```text
before:  P = 3.00 / (0.08 - 0.03) = 3.00 / 0.05 = 60.00
after:   P = 3.00 / (0.09 - 0.03) = 3.00 / 0.06 = 50.00
change:  50 / 60 - 1 = -16.67%
```

**3. The same equity, but growing at 5%.**

```text
before:  P = 3.00 / (0.08 - 0.05) = 3.00 / 0.03 = 100.00
after:   P = 3.00 / (0.09 - 0.05) = 3.00 / 0.04 =  75.00
change:  75 / 100 - 1 = -25.00%
```

<table>
  <tbody>
    <tr>
      <td><strong>Claim</strong></td><td><strong>Effective duration</strong></td><td><strong>Predicted (linear)</strong></td><td><strong>Actual on +100bp</strong></td>
    </tr>
    <tr>
      <td>Bond</td><td>7.0</td><td>-7.00%</td><td>-6.68%</td>
    </tr>
    <tr>
      <td>Equity, g = 3%</td><td>20.0</td><td>-20.00%</td><td>-16.67%</td>
    </tr>
    <tr>
      <td>Equity, g = 5%</td><td>33.3</td><td>-33.33%</td><td>-25.00%</td>
    </tr>
  </tbody>
</table>

The effective duration of a constant-growth equity is `1 / (r - g)`: 20 years at `g = 3%`, 33.3 years at `g = 5%`. The higher-growth asset loses nearly four times as much as a seven-year bond, from an identical shock, purely because its cash flows sit further out. Note also that the linear prediction overstates every loss, because `1 / (r - g)` is convex in `r` — the same reason bond convexity is a positive correction.

> info **This is why "long-duration equity" is a macro position** A portfolio tilted towards assets whose value rests on distant cash flows is short rates whether or not it holds a single bond. The exposure does not appear in any equity risk model that does not include a rate factor.

---

#### Breakevens and What They Actually Contain

Suppose a hypothetical ten-year nominal yield of 4.50% and a ten-year inflation-linked yield of 1.90%.

1. **Arithmetic breakeven:** `4.50 - 1.90 = 2.60%`.
2. **Exact Fisher breakeven:** `(1.0450 / 1.0190) - 1 = 2.55%`. The 5bp difference is the dropped cross-term `r * pi_e`. Small at these levels, larger when both rates are high.
3. **Realised real return check.** If inflation over the decade averages exactly 2.60%, the nominal bond's realised real return is `(1.0450 / 1.0260) - 1 = 1.85%` per year — slightly below the linker's 1.90%, again the cross-term.

The important caveat is that a breakeven is **not** a forecast of inflation. It is the sum of at least three things:

- expected inflation
- an **inflation risk premium** — compensation demanded by holders of nominal bonds for bearing inflation uncertainty, which can be positive or negative depending on whether inflation shocks are seen as growth-negative or growth-positive
- a **relative liquidity premium** — inflation-linked markets are typically smaller and less liquid, and that discount widens in stress, mechanically pushing breakevens down for reasons having nothing to do with inflation expectations

> warning **A falling breakeven in a stress episode is ambiguous** It may signal collapsing inflation expectations, or it may signal that inflation-linked bonds are being sold because they are harder to fund. The two are indistinguishable from the breakeven alone.

---

#### Duration as a Macro Exposure

Once you accept that duration is just "how far out are the cash flows", the concept escapes fixed income entirely.

- **Equities.** Effective duration rises with the growth rate and falls with the payout rate. Sectors whose earnings are expected far in the future carry more of it.
- **Credit.** Spread duration and rate duration are distinct exposures. A credit portfolio can be rate-hedged and still lose from spread widening, or spread-hedged and still lose from rates. See [Credit Spreads](/credit/credit-spreads).
- **Carry strategies.** Any position financed at a short rate has a funding exposure that is a duration position of maturity zero but leverage-scaled. A change in the short rate changes the carry directly.
- **Real assets.** Long-lived, inflation-linked cash flows behave like real-rate duration rather than nominal-rate duration, and re-price on the real leg of a move rather than the nominal one.

The practical point: a portfolio's total rate sensitivity is rarely visible from its asset-class labels. It has to be measured, usually by regressing portfolio returns on curve factors from a [PCA](/stat-methods/pca) of yield changes.

---

#### In Practice Across Asset Classes

**Equities.** Rate regimes affect equities through two channels that can offset. Higher rates raise the discount rate (negative), but if they reflect stronger growth they also raise expected cash flows (positive). The observed equity-rate correlation therefore flips sign depending on whether the dominant shock is to growth or to inflation — which is the core reason a fixed equity-bond correlation assumption is unsafe. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).

**Rates.** The curve itself has regimes. Level, slope, and curvature — the first three principal components of yield changes — carry different amounts of variance in different policy environments. Steepening and flattening dynamics near a policy turning point differ from those in the middle of a cycle. See [Yield Curves](/markets/yield-curves).

**FX.** Interest-rate differentials drive forward points through covered interest parity, which is an arbitrage identity, not a forecast. The uncovered version — that high-rate currencies should depreciate to offset the carry — is an empirical proposition that behaves differently across rate regimes. See [FX Carry and Parity](/markets/fx-carry-parity).

**Commodities.** Financing and storage costs enter the cost of carry directly, so rate regimes shift the whole forward curve's shape. Gold and other non-yielding stores of value are conventionally analysed against real rates rather than nominal.

**Credit.** Higher rates raise refinancing costs and eventually default probabilities, so a rate regime shift transmits into spreads with a lag. Total return decomposes into a rate component and a spread component that frequently move in opposite directions. See [Credit 101](/credit/credit-101).

**On-chain markets.** There is no policy rate. The nearest analogues are stablecoin lending rates and perpetual [funding rates](/signals/funding-rate), which are set by supply and demand for leverage rather than by a central authority. They are far more volatile than policy rates and reset continuously. The link to traditional rates runs through the opportunity cost of stablecoin capital: when short-term yields available off-chain rise, on-chain borrowing rates face upward pressure from the same lenders' alternatives. See [Lending and Borrowing](/building-blocks/lending-borrowing) and [Cash and Carry](/strategies/cash-carry).

---

#### Assumptions and Failure Modes

- **Parallel curve shifts.** The duration calculation above assumes every point on the curve moves by the same amount. Real moves are combinations of level, slope, and curvature, and a portfolio hedged for a parallel shift can lose substantially on a twist.
- **Duration is a local approximation.** It is a first derivative. For large moves the convexity term matters, and for very large moves even that is insufficient.
- **Constant growth in the equity example.** The Gordon formula requires `g` below `r` and constant forever. It is a teaching device for the duration intuition, not a valuation method.
- **Growth and rates are independent.** They are not. If a rate rise reflects stronger nominal growth, cash-flow expectations rise too and the net equity effect is ambiguous.
- **Breakevens measure expectations.** They contain risk and liquidity premia that move independently of expected inflation, and those premia move most in exactly the episodes people most want to read the breakeven.
- **Inflation indices measure your inflation.** A published index is a fixed basket with methodological choices, subject to revision. A portfolio's real return depends on the deflator you actually face.
- **The rate regime is observable in real time.** Policy intentions are communicated with deliberate ambiguity, and the market's expected path is itself an estimate. What looks in hindsight like a clean regime boundary was a gradual repricing at the time.
- **History covers the relevant regimes.** A model estimated within a single rate environment has never seen the transition it is being asked to survive.

---

#### Code

```python
import numpy as np

def price_change_from_yield(modified_duration, convexity, yield_change):
    """Second-order price approximation. `yield_change` in decimal, so 100bp is 0.01."""
    return -modified_duration * yield_change + 0.5 * convexity * yield_change**2


def constant_growth_value(cash_flow, discount_rate, growth_rate):
    if growth_rate >= discount_rate:
        raise ValueError("constant-growth value diverges unless growth is below the discount rate")
    return cash_flow / (discount_rate - growth_rate)


def equity_effective_duration(discount_rate, growth_rate):
    # d(logP)/dr for P = CF/(r-g). Long-duration equity is a rates position.
    return 1.0 / (discount_rate - growth_rate)


def exact_breakeven(nominal_yield, real_yield):
    """Fisher-exact breakeven. The simple difference drops the cross-term
    and overstates the breakeven by roughly real * expected inflation."""
    return (1 + nominal_yield) / (1 + real_yield) - 1
```

---

#### See Also

* [Macro Factors](/regimes-macro/macro-factors)
* [Liquidity Cycles](/regimes-macro/liquidity-cycles)
* [Correlation Breakdown](/regimes-macro/correlation-breakdown)
* [Yield Curves](/markets/yield-curves)
* [Duration and Convexity](/markets/duration-convexity)
* [Credit Spreads](/credit/credit-spreads)
* [PCA](/stat-methods/pca)

---

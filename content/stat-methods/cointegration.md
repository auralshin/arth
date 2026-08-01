### Cointegration

> info **Metadata** Level: Advanced | Prerequisites: Unit Roots, Linear Regression | Tags: cointegration, pairs-trading, error-correction, engle-granger, johansen, relative-value

Two series can each wander without a fixed level and still be tied to one another. Cointegration is the formal statement of that idea: individually each series has a unit root, but some linear combination of them is stationary. The combination is an equilibrium relationship, and deviations from it decay.

This is the missing statistical prerequisite for relative value trading. [Pairs trading](/strategies/pairs) rests entirely on the claim that a spread mean-reverts — and correlation, the statistic most often quoted in support of it, cannot establish that claim. Two series can be 95% correlated in returns and drift apart permanently in levels. Cointegration is the property that actually matters, and it must be tested rather than assumed.

---

#### Formal Definition

Two series `y_t` and `x_t` are **cointegrated** when each is integrated of order one — `I(1)`, non-stationary in levels and stationary in first differences — and there exists a coefficient `beta` making the combination `z_t = y_t - alpha - beta * x_t` stationary, `I(0)`, where `z_t` is the **spread** or equilibrium error, `beta` is the **cointegrating coefficient** (also the hedge ratio), and `alpha` sets the equilibrium level. The vector `(1, -beta)` is the **cointegrating vector**, defined only up to scale — multiplying by any non-zero constant gives the same relationship — so a normalisation must be chosen, conventionally by fixing the coefficient on `y` at 1.

**Correlation versus cointegration.** Correlation is a property of contemporaneous returns and says nothing about the levels; cointegration is a property of the levels and says nothing about short-horizon co-movement. Neither implies the other, and only cointegration supports a mean-reverting spread.

---

#### The Error Correction Representation

The Granger representation theorem states that cointegrated series always admit an **error correction model (ECM)**:

```text
delta_y_t = c_y + a_y * z_{t-1} + (lagged differences) + u_t
delta_x_t = c_x + a_x * z_{t-1} + (lagged differences) + v_t
```

where `z_{t-1}` is last period's deviation from equilibrium and `a_y`, `a_x` are the **adjustment coefficients** or loadings. The economics live in the signs. If `a_y` is negative, then when the spread sits above its equilibrium `y` falls to close the gap; if `a_x` is positive, `x` rises to meet `y`. At least one adjustment coefficient must be non-zero — that is what makes the relationship an equilibrium rather than a coincidence. The magnitude sets the speed: for a spread following an AR(1) with persistence `phi = 1 + a_y`, the `half-life = ln(0.5) / ln(1 + a_y)`. This number is the single most decision-relevant output of the whole exercise. It tells you the holding period the relationship implies, which determines whether financing and transaction costs consume the deviation before it closes.

---

#### Worked Example

Two related instruments over five periods. Five points is nowhere near enough to test anything; the arithmetic is small so every step can be checked by hand.

<table>
  <tbody>
    <tr><td><strong>Period</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td><strong>Price B</strong></td><td>100.0</td><td>102.0</td><td>101.0</td><td>104.0</td><td>103.0</td></tr>
    <tr><td><strong>Price A</strong></td><td>50.3</td><td>51.4</td><td>50.8</td><td>52.1</td><td>51.6</td></tr>
  </tbody>
</table>

**Step 1 of Engle-Granger: estimate the cointegrating relationship by OLS of A on B.**

1. **Means**: `mean(B) = 510 / 5 = 102.0`, `mean(A) = 256.2 / 5 = 51.24`
2. **Deviations of B**: `-2, 0, -1, 2, 1`, so `Sbb = 4 + 0 + 1 + 4 + 1 = 10`; deviations of A: `-0.94, 0.16, -0.44, 0.86, 0.36`
3. **Cross-products**: `1.88 + 0 + 0.44 + 1.72 + 0.36 = 4.40`, so `beta = 4.40 / 10 = 0.44`
4. **Intercept**: `alpha = 51.24 - 0.44 * 102.0 = 6.36`, giving **fitted values** `50.36, 51.24, 50.80, 52.12, 51.68`
5. **Residuals (the spread)**: `-0.06, 0.16, 0.00, -0.02, -0.08` — they sum to zero, as OLS requires
6. **Residual standard deviation**: `sqrt(0.036 / 3) = sqrt(0.012) = 0.110`

The fitted relationship is `A = 6.36 + 0.44 * B`; a position long 1 unit of A and short 0.44 units of B holds the spread.

**Step 2 of Engle-Granger: test the residual for a unit root.** Run an ADF regression on `z_t` — but the critical values are **not** the standard ADF ones. Because `beta` was estimated by minimising the residual sum of squares, which mechanically makes the residual look as stationary as possible, the correct Engle-Granger critical values are more negative: roughly `-3.3` at 5% for two variables with a constant, becoming more negative as the number of variables grows. Using standard ADF values here is a common and serious error that manufactures cointegration where none exists.

**Interpreting the adjustment speed.** Suppose the ECM on a real-length sample gives `a_A = -0.15`, so the spread persistence is `phi = 1 - 0.15 = 0.85` and the half-life is `ln(0.5) / ln(0.85) = -0.693 / -0.1625 = 4.3` periods. Fifteen per cent of any deviation closes each period, and half closes in about four and a third — on daily data, a holding period of roughly a week. Whether the spread's typical deviation is large enough to survive the round-trip cost over that week decides whether the relationship is economically usable at all. See [Slippage](/microstructure/slippage) and [Transaction Cost Analysis](/execution/transaction-cost-analysis).

> warning **The hedge ratio is an estimate with a standard error** Trading `0.44` as though it were exact ignores that uncertainty. A ratio wrong by 10% leaves a residual directional exposure that can dominate the spread's own movement.

---

#### Engle-Granger versus Johansen

<table>
  <tbody>
    <tr><td></td><td><strong>Engle-Granger</strong></td><td><strong>Johansen</strong></td></tr>
    <tr><td>Approach</td><td>Two-step: OLS, then unit root test on residuals</td><td>Maximum likelihood on a vector error correction system</td></tr>
    <tr><td>Number of series</td><td>Two, practically</td><td>Any number</td></tr>
    <tr><td>Relationships found</td><td>At most one</td><td>Tests for and estimates several (the rank)</td></tr>
    <tr><td>Symmetry</td><td>Depends on which series is the dependent variable</td><td>Symmetric in all series</td></tr>
    <tr><td>Complexity</td><td>Simple, transparent, easy to audit</td><td>More assumptions, parameters, and ways to go wrong</td></tr>
  </tbody>
</table>

The asymmetry of Engle-Granger deserves emphasis: regressing A on B and regressing B on A give hedge ratios that are not reciprocals of one another, and can even give different test conclusions. Running it both ways and checking for agreement is a cheap robustness check.

**Johansen** works within a vector autoregression and tests the rank of the long-run impact matrix using trace and maximum-eigenvalue statistics. Rank 0 means no cointegration; rank `r` between 1 and `k-1` means `r` independent relationships; full rank means the series were stationary to begin with and the framework does not apply. Its advantage is handling three or more series at once — what a yield curve, a commodity forward curve, or a basket relative-value trade requires — at the cost of sensitivity to lag length and to the treatment of deterministic terms.

---

#### In Practice Across Asset Classes

**Equities.** Applied to pairs within an industry, dual-listed shares of the same company, and holding companies against their listed stakes. The strongest cases have a structural link — the same cash flows priced in two places — rather than a statistical resemblance. Corporate actions, index inclusions, and capital structure changes break the relationship abruptly and permanently. See [Corporate Actions](/markets/corporate-actions).

**Fixed income.** The natural multivariate application: yields across tenors move together, and butterfly combinations (long the wings, short the belly, duration-neutral) are stationary by construction of the curve's shape. Johansen on a set of tenors and [PCA](/stat-methods/pca) on yield changes are two routes to the same structure.

**FX.** Cointegration among currencies sharing an economic bloc or a managed relationship is the standard case — and the standard cautionary tale: a peg or band makes a pair look beautifully cointegrated for years, right up to the repeg or float, at which point the relationship does not mean-revert, it ends.

**Futures, commodities and credit.** Calendar and inter-commodity spreads (crack, crush, spark) rest on physical conversion relationships, so the cointegrating vector comes from the production process rather than the data — among the most reliable cases, though it still shifts with capacity and technology. In credit, cash bond spreads and credit default swap spreads on the same issuer are linked by arbitrage, giving the CDS-bond basis; funding costs, deliverability, and balance sheet constraints keep it from closing fully. See [CDS](/credit/cds).

**On-chain.** Wrapped and bridged representations of the same asset, liquid staking tokens against their underlying, and the same token on multiple venues are natural candidates, all backed by an explicit redemption or arbitrage mechanism. The mechanism is also the risk: cointegration holds while the bridge or redemption path functions, and breaks permanently if it does not. See [Bridges](/protocols/bridges) and [Smart Contract Risk](/risk/smart-contract).

---

#### Assumptions and Failure Modes

- **Both series must be I(1).** If one is stationary and the other is not, no stationary combination exists. Test each series first — see [Unit Roots](/stat-methods/unit-roots).
- **The relationship is assumed constant.** Cointegrating vectors drift as capital structures, index weights, and market structure change; a hedge ratio estimated over five years may describe none of the last five months. Rolling re-estimation reveals drift and introduces look-ahead risk if done carelessly.
- **Breakdown is permanent, not temporary.** When a relationship ends — a merger, a peg change, a delisting, a bridge exploit — the spread does not revert. The position is a directional bet held at maximum size on the assumption that it will.
- **Tests have low power on short samples.** Detecting slow mean reversion needs many multiples of the half-life; a 40-day half-life is hard to establish with one year of data.
- **Searching over pairs is a multiple testing problem.** Screening 500 candidates at 5% yields roughly 25 false positives by construction — endemic to pair selection and rarely corrected for. See [Multiple Testing](/stat-methods/multiple-testing).
- **Engle-Granger critical values, not standard ADF values.** The pre-estimation of `beta` requires the more negative values; getting this wrong produces cointegration on demand. Both the ADF step and Johansen also assume homoskedastic residuals, which volatility clustering violates. See [GARCH](/stat-methods/garch).
- **Stationary is not the same as tradable.** A spread can mean-revert reliably with an amplitude smaller than the round-trip cost of trading it, and a half-life longer than any position can be financed. Statistical and economic significance are separate tests.

---

#### Code

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.tsa.stattools import coint
from statsmodels.tsa.vector_ar.vecm import coint_johansen


def engle_granger(price_y, price_x):
    """Two-step Engle-Granger: hedge ratio, spread, and test p-value.

    coint() applies Engle-Granger critical values, more negative than
    plain ADF because beta was pre-estimated.
    """
    frame = pd.concat({"y": price_y, "x": price_x}, axis=1).dropna()
    fitted = sm.OLS(frame["y"], sm.add_constant(frame["x"])).fit()
    spread = frame["y"] - fitted.params["const"] - fitted.params["x"] * frame["x"]
    return fitted.params["x"], spread, coint(frame["y"], frame["x"])[1]


def adjustment_speed(spread):
    """ECM adjustment coefficient and implied half-life of the spread."""
    z = spread.dropna()
    frame = pd.concat({"delta": z.diff(), "lag": z.shift(1)}, axis=1).dropna()
    fitted = sm.OLS(frame["delta"], sm.add_constant(frame["lag"])).fit()
    phi = 1 + fitted.params["lag"]
    half_life = np.log(0.5) / np.log(phi) if 0 < phi < 1 else np.inf
    return fitted.params["lag"], half_life, fitted.tvalues["lag"]


def johansen_rank(price_frame, det_order=0, k_ar_diff=1):
    """Johansen trace test. The rank is the first row whose trace
    statistic falls below its 95% critical value.
    """
    result = coint_johansen(price_frame.dropna(), det_order, k_ar_diff)
    return pd.DataFrame({"trace_stat": result.lr1, "crit_95": result.cvt[:, 1]})
```

---

#### See Also

* [Unit Roots](/stat-methods/unit-roots)
* [Linear Regression](/stat-methods/linear-regression)
* [PCA](/stat-methods/pca)
* [Pairs Trading](/strategies/pairs)
* [Mean Reversion](/quant-math/mean-reversion)
* [Stationarity](/quant-math/stationarity)

---

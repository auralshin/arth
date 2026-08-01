### Liquidity and Depth as Features

> info **Metadata** Level: Advanced | Prerequisites: Volume, Order Books, Slippage | Tags: signals, liquidity, depth, spread, order-book-imbalance, kyle-lambda, amihud

Liquidity is the capacity of a market to absorb a trade without moving the price. It is not one number. A market can be tight (narrow spread) but shallow (little size at the touch), or deep but slow to replenish after a trade. Any single liquidity metric captures one facet of a multi-dimensional property, and metrics that agree in calm conditions diverge sharply in stress — which is precisely when the measurement matters.

For a quantitative researcher, liquidity plays two roles. As a **cost model**, it determines what a strategy will actually pay to implement, and this is where the bulk of established, well-evidenced work sits. As a **feature**, liquidity measures can carry predictive content about returns: order book imbalance has genuine short-horizon forecasting power, and illiquidity has been studied as a priced risk premium at longer horizons. This page covers both, and is explicit about which measures require order book data and which can be recovered from bars alone.

---

#### Formal Definition

Liquidity metrics fall into three families by what data they require.

**From the order book.** The **quoted spread** and its normalised form:

```text
Spread     = P_ask - P_bid
Mid        = (P_ask + P_bid) / 2
Spread_bps = 10000 * Spread / Mid
```

**Depth** is the quantity resting within a distance `delta` of the mid:

```text
D_bid(delta)  = sum of bid sizes at prices at or above Mid - delta
D_ask(delta)  = sum of ask sizes at prices at or below Mid + delta
```

**Order book imbalance** compares the two sides:

```text
OBI = (D_bid - D_ask) / (D_bid + D_ask)
```

`OBI` runs from `-1` (all depth on the offer) to `+1` (all depth on the bid). It is one of the better-supported short-horizon predictors in microstructure: a book weighted toward the bid tends to be followed by an uptick over the next few seconds. The effect is real, well documented, and almost entirely consumed by the spread for anyone crossing it — it is a signal for passive quoting, not for taking liquidity.

**From trade data.** **Kyle's lambda** measures price impact per unit of signed volume, estimated by regressing price change on net signed flow through the origin:

```text
dP_k    = lambda * x_k + e_k
lambda  = sum(x_k * dP_k) / sum(x_k^2)
```

where `x_k` is net signed volume in interval `k` (buys minus sells) and `dP_k` is the price change over that interval. A larger `lambda` means a less liquid market: each unit of imbalance moves price further.

**From bars alone.** The **Amihud illiquidity ratio** — price impact per unit of currency traded, averaged over `n` days:

```text
ILLIQ = (1/n) * sum( |R_t| / DollarVolume_t )
```

and the **Roll effective spread estimator**, which recovers the spread from the negative serial covariance that bid-ask bounce induces in transaction prices:

```text
Roll_spread = 2 * sqrt( -Cov(dP_t, dP_{t-1}) )
```

Roll's estimator is defined only when that covariance is negative; when it is positive — which happens whenever genuine price trends dominate the bounce — the estimator returns no value at all.

> info **Match the measure to the horizon** Spread and depth describe the cost of trading right now. Amihud and Roll describe an average condition over days. Using a daily illiquidity measure to size an order in the next thirty seconds mixes two entirely different quantities.

---

#### Worked Example

A snapshot of a limit order book:

<table>
  <tbody>
    <tr><td><strong>Bid price</strong></td><td><strong>Bid size</strong></td><td><strong>Ask price</strong></td><td><strong>Ask size</strong></td></tr>
    <tr><td>99.98</td><td>500</td><td>100.02</td><td>300</td></tr>
    <tr><td>99.96</td><td>700</td><td>100.04</td><td>400</td></tr>
    <tr><td>99.94</td><td>600</td><td>100.06</td><td>500</td></tr>
    <tr><td>99.90</td><td>600</td><td>100.10</td><td>400</td></tr>
  </tbody>
</table>

**Step 1 — spread and mid.**

```text
Mid        = (99.98 + 100.02) / 2 = 100.00
Spread     = 100.02 - 99.98 = 0.04
Spread_bps = 10000 * 0.04 / 100.00 = 4.0 bps
```

The half-spread, the immediate cost of crossing for an infinitesimal order, is 2.0 bps.

**Step 2 — depth within 10 bps of mid** (prices from 99.90 to 100.10):

```text
D_bid = 500 + 700 + 600 + 600 = 2,400
D_ask = 300 + 400 + 500 + 400 = 1,600
OBI   = (2,400 - 1,600) / (2,400 + 1,600) = 800 / 4,000 = +0.20
```

The book leans to the bid.

**Step 3 — walk the book for a 1,000-unit market buy.** The order consumes 300 at 100.02, 400 at 100.04, and 300 at 100.06:

```text
Notional = 300*100.02 + 400*100.04 + 300*100.06
         = 30,006 + 40,016 + 30,018 = 100,040
Avg fill = 100,040 / 1,000 = 100.040
Slippage = 10000 * (100.040 - 100.00) / 100.00 = 4.0 bps
```

The realised cost is 4.0 bps against a half-spread of 2.0. The extra 2.0 bps is the price of size: half the cost of this trade came from crossing the spread and half from exhausting the top of book. Quoting a strategy's cost as "the half-spread" understates it by a factor of two at this size, and by far more at larger ones. See [Slippage](/microstructure/slippage) and [Market Impact](/execution/market-impact).

**Step 4 — Roll's estimator from trade prices alone.** Suppose eight successive transaction price changes were `+0.02, -0.03, +0.01, -0.02, +0.03, -0.01, +0.02, -0.03`. The mean change is `-0.00125`, and the lag-1 autocovariance is `-0.000400`:

```text
Roll_spread = 2 * sqrt(0.000400) = 0.0400
```

The estimator recovers 0.0400 against a quoted spread of 0.0400 — because in this constructed series the alternating pattern *is* pure bid-ask bounce with no underlying price movement. On real data the two rarely match this closely, since genuine price changes are mixed in with the bounce and bias the covariance upward.

**Step 5 — Amihud over five days.** Daily returns in per cent and dollar volume in millions:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td><strong>|Return| (%)</strong></td><td>1.2</td><td>0.8</td><td>2.1</td><td>1.5</td><td>0.6</td></tr>
    <tr><td><strong>Dollar volume (€m)</strong></td><td>4.2</td><td>3.8</td><td>5.1</td><td>4.6</td><td>3.9</td></tr>
    <tr><td><strong>Ratio</strong></td><td>0.2857</td><td>0.2105</td><td>0.4118</td><td>0.3261</td><td>0.1538</td></tr>
  </tbody>
</table>

```text
ILLIQ = (0.2857 + 0.2105 + 0.4118 + 0.3261 + 0.1538) / 5 = 0.2776
```

Read this as roughly 0.28% of price movement per million of currency traded. The units matter enormously — the number changes with the currency, the return scaling, and the volume scaling — so Amihud values are only meaningful as a *relative ranking* within a consistently constructed panel, never as an absolute quantity.

---

#### Choosing a Measure

<table>
  <tbody>
    <tr><td><strong>Measure</strong></td><td><strong>Data needed</strong></td><td><strong>Captures</strong></td><td><strong>Blind to</strong></td></tr>
    <tr><td>Quoted spread</td><td>Top of book</td><td>Cost for a very small order</td><td>Size; a tight quote for 1 unit says nothing about 10,000</td></tr>
    <tr><td>Depth at <code>delta</code></td><td>Full book</td><td>Immediately available size</td><td>Hidden and iceberg orders; replenishment speed</td></tr>
    <tr><td>Order book imbalance</td><td>Full book</td><td>Short-horizon direction pressure</td><td>Spoofing and fleeting quotes; decays in seconds</td></tr>
    <tr><td>Kyle's lambda</td><td>Signed trades</td><td>Realised impact per unit of flow</td><td>Requires a signing rule that errs in fast markets</td></tr>
    <tr><td>Amihud</td><td>Daily bars</td><td>Average impact per unit of turnover</td><td>Intraday variation; unit-dependent, so ranking only</td></tr>
    <tr><td>Roll estimator</td><td>Trade prices</td><td>Effective spread, no quotes required</td><td>Undefined when the serial covariance is positive</td></tr>
  </tbody>
</table>

The general principle: measures requiring less data are more widely computable and more heavily contaminated. Amihud can be built for any instrument with daily bars, which is why it dominates long-horizon cross-sectional research; order book imbalance needs a full book feed and clock synchronisation, which is why it lives in high-frequency work.

---

#### In Practice Across Asset Classes

**Equities.** Liquidity is fragmented across lit exchanges, dark pools and internalisers, so a book from one venue understates true available depth while the consolidated view understates the cost of reaching it. Displayed size is only part of the picture, because hidden and iceberg orders participate without appearing. Intraday variation is enormous: spreads at the open can be several times their midday level, and depth is thinnest exactly when volatility is highest.

**Futures.** The cleanest measurement environment, because a single exchange runs a central limit order book with full depth published. This is why microstructure research disproportionately uses futures data. The complication is the [roll](/markets/roll-and-carry): liquidity migrates between expiries over a few sessions, so front-month depth collapses while the next contract fills, and a naive front-month liquidity series shows a cliff that reflects nothing about the market.

**FX.** No central book exists. Each platform shows its own liquidity, much of it from the same underlying providers, so aggregating across venues double-counts. "Last look" arrangements on some platforms mean displayed quotes are not firm — a fill can be rejected after the fact — which makes quoted spread a weaker measure of realised cost than elsewhere.

**Fixed income.** Most cash bonds are dealer-quoted rather than order-book traded, so there is no depth to measure. Liquidity is assessed indirectly through dealer quote dispersion, trade frequency, and the on-the-run versus off-the-run distinction. Off-the-run issues can go days without a print. See [Fixed Income 101](/markets/fixed-income-101).

**Crypto.** Centralised exchange books are fully visible via public feeds, giving equity-quality microstructure data without the fragmentation of a consolidated tape — but each venue is a separate market with its own book, and depth does not aggregate cleanly because moving inventory between venues takes time and costs money. Continuous trading removes the open and close liquidity extremes that dominate equity intraday patterns, replacing them with a milder weekly cycle. Automated market makers are structurally different again: depth is a deterministic function of the pool's reserves and curve rather than a set of resting orders, so slippage for any size can be computed exactly in advance rather than estimated. See [Order Books vs AMMs](/microstructure/orderbooks-vs-amms) and [Concentrated Liquidity](/protocols/concentrated-liquidity).

---

#### Assumptions and Failure Modes

- **Displayed depth is not available depth.** Hidden orders add to it; spoofed and fleeting quotes subtract from it. Book snapshots systematically misstate what a real order would find.
- **Liquidity is endogenous to your own trading.** The book you measure before sending an order is not the book that receives it. Repeated trading against the same participants teaches them your pattern. See [Adverse Selection](/execution/adverse-selection).
- **It evaporates under stress.** Every one of these measures deteriorates fastest exactly when a position most needs to be closed. Cost models calibrated on calm data underestimate stressed costs by a wide margin.
- **Snapshot timing.** A book sampled at fixed intervals misses everything between samples. In fast markets the state at the moment your order arrives may bear no resemblance to the last snapshot.
- **Trade signing is error-prone.** Kyle's lambda requires classifying each trade as buyer- or seller-initiated. Quote-based rules misclassify a meaningful share of trades, and the error rate rises in exactly the volatile conditions where lambda is most interesting.
- **Roll's estimator fails when it is needed.** Positive serial covariance leaves it undefined, and that happens during trending markets — when effective spreads are typically widest.
- **Amihud is unit-dependent.** The absolute value has no interpretation. It is a ranking device within a consistently built panel and nothing more.
- **Order book imbalance decays in seconds.** Its predictive content is real but extremely short-lived, and it is not recoverable by anyone who has to cross the spread to act on it.

---

#### Code

```python
import numpy as np
import pandas as pd

def book_features(bids, asks, depth_bps: float = 10.0) -> dict:
    """Spread, depth and imbalance from a single book snapshot.

    bids/asks are sequences of (price, size), best price first.
    depth_bps sets how far from mid to accumulate size, so the measure
    is comparable across instruments at different price levels.
    """
    best_bid, best_ask = bids[0][0], asks[0][0]
    mid = (best_bid + best_ask) / 2.0
    band = mid * depth_bps / 10000.0

    depth_bid = sum(size for price, size in bids if price >= mid - band)
    depth_ask = sum(size for price, size in asks if price <= mid + band)

    return {
        "mid": mid,
        "spread_bps": 10000.0 * (best_ask - best_bid) / mid,
        "depth_bid": depth_bid,
        "depth_ask": depth_ask,
        "imbalance": (depth_bid - depth_ask) / (depth_bid + depth_ask),
    }


def amihud_illiquidity(close: pd.Series, volume: pd.Series, window: int = 21
                       ) -> pd.Series:
    """Rolling Amihud ratio: |return| per unit of currency traded.

    The absolute level depends on the units of price and volume, so this
    is only interpretable as a cross-sectional ranking within a panel
    built the same way for every instrument.
    """
    dollar_volume = (close * volume).replace(0, np.nan)
    return (close.pct_change().abs() / dollar_volume).rolling(window).mean()


def roll_effective_spread(trade_prices: pd.Series, window: int = 60) -> pd.Series:
    """Roll's estimator from transaction prices alone.

    Returns NaN where the lag-1 autocovariance is positive: the model has
    no solution there. That is not a bug to patch — a positive covariance
    means genuine price movement dominates the bid-ask bounce the
    estimator relies on.
    """
    changes = trade_prices.diff()
    autocov = changes.rolling(window).apply(
        lambda x: pd.Series(x).autocorr(lag=1) * pd.Series(x).var(ddof=1), raw=True
    )
    return 2.0 * np.sqrt(-autocov.where(autocov < 0))
```

---

#### See Also

* [Volume and Liquidity-Aware Indicators](/signals/volume)
* [Order Books vs AMMs](/microstructure/orderbooks-vs-amms)
* [Market Impact](/execution/market-impact)
* [Adverse Selection](/execution/adverse-selection)
* [Slippage](/microstructure/slippage)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)

---

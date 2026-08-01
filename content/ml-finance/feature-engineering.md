### Feature Engineering for Financial Data

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Stationarity, Rolling Windows | Tags: machine-learning, features, stationarity, normalisation, leakage

A feature is a number computed from information available at a point in time, intended to carry some of the explanatory content of the future. In most machine learning domains, feature engineering has largely been replaced by learned representations. In finance it has not, and will not be, for a simple reason: there is not enough signal in the data for a model to discover a good representation on its own. The representation has to be supplied.

Financial feature engineering is dominated by three constraints that do not appear elsewhere. The input must be roughly stationary, or the model learns a relationship that only holds inside the training range. It must be scaled by information available at the time, or the scaler itself leaks the future. And it must be timestamped by when it became *knowable*, not by when it *refers to*. Each constraint has a specific failure that looks like performance.

---

#### The Stationarity Requirement

A tree splits on absolute thresholds; a linear model applies a fixed coefficient. Both assume the feature's distribution is comparable between training and deployment. Raw price fails this immediately:

```text
Non-stationary:  P_t                      level wanders without bound
Stationary:      r_t = ln(P_t / P_t-1)    differences are roughly mean-zero
Stationary:      P_t / SMA_n(P_t) - 1     price relative to its own average
Stationary:      (x_t - mean_n(x)) / sd_n(x)   rolling z-score
```

where `SMA_n` is the `n`-period simple moving average and `mean_n`, `sd_n` are trailing moments over `n` periods.

Differencing achieves stationarity by discarding memory. Log returns are stationary but retain almost no information about where the price sits relative to its own history — which is precisely what a mean-reversion signal needs. **Fractional differentiation** applies a differencing exponent between 0 and 1, keeping the minimum memory removal that passes a unit-root test. It is the standard compromise. See [Unit Roots](/stat-methods/unit-roots).

> info **Test, do not assume** Run an augmented Dickey-Fuller test on every engineered feature before it enters a model. A feature that fails is not necessarily useless, but it will not behave the way the fitted coefficient implies.

---

#### Worked Example: The Two Traps

**Trap one — a threshold learned on a level.** Consider an instrument observed across two regimes:

<table>
  <tbody>
    <tr><td><strong>Regime</strong></td><td><strong>Price range</strong></td><td><strong>Daily volatility</strong></td><td><strong>Rule "price above 200 implies long"</strong></td></tr>
    <tr><td>Training window</td><td>100 to 150</td><td>0.9%</td><td>never fires</td></tr>
    <tr><td>Deployment window</td><td>400 to 600</td><td>2.4%</td><td>always fires</td></tr>
  </tbody>
</table>

A tree trained on raw price can only split within the training range. Out of that range it does not extrapolate; it returns whatever leaf value applied at the boundary. The learned rule becomes a constant position with no relation to anything.

**Trap two — a scaler fitted on the whole sample.** Take six daily observations of 20-day realised volatility, where the sixth is a genuine shock:

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
    <tr><td><strong>Realised vol</strong></td><td>0.010</td><td>0.012</td><td>0.011</td><td>0.013</td><td>0.012</td><td>0.032</td></tr>
  </tbody>
</table>

Standardise day 6 two ways:

1. **Full-sample scaler.** Mean over all six values is `0.090 / 6 = 0.015`. Sample standard deviation is `0.00839`. The z-score is `(0.032 - 0.015) / 0.00839 = 2.03`.
2. **Trailing scaler using only days 1 to 5.** Mean is `0.058 / 5 = 0.0116`. Sample standard deviation is `0.00114`. The z-score is `(0.032 - 0.0116) / 0.00114 = 17.9`.

The full-sample scaler used day 6 to compute its own mean and standard deviation, absorbing the shock into the denominator. Day 6 is recorded as a mild two-sigma event. In real time it was an extreme one. The model trained on the leaky version never learns what a volatility shock looks like, because it never saw one — and its backtest will nonetheless look better, because the leaky feature is smoother and better conditioned.

> warning **`StandardScaler().fit(X)` on the full panel is leakage** Any transform with fitted parameters — scaling, imputation, quantile binning, principal components — must be fitted inside the cross-validation fold, on training data only. A scikit-learn `Pipeline` does this automatically; a manual `fit_transform` before splitting does not.

---

#### Feature Families

<table>
  <tbody>
    <tr><td><strong>Family</strong></td><td><strong>Examples</strong></td><td><strong>Main hazard</strong></td></tr>
    <tr><td>Price-derived</td><td>Returns over multiple horizons, distance from moving average, drawdown depth</td><td>Horizons chosen after seeing results; heavy mutual correlation</td></tr>
    <tr><td>Volatility</td><td>Realised vol, Parkinson and Garman-Klass estimators, vol-of-vol</td><td>Window length is a tuned parameter and inflates the search space</td></tr>
    <tr><td>Volume and flow</td><td>Volume z-score, order-flow imbalance, trade sign autocorrelation</td><td>Venue-specific definitions change silently over time</td></tr>
    <tr><td>Cross-sectional</td><td>Rank within universe, sector-neutralised score, beta-adjusted residual</td><td>Universe membership must be point-in-time or survivorship enters</td></tr>
    <tr><td>Fundamental</td><td>Earnings surprise, leverage, accruals</td><td>Publication lag; restatements rewrite history in most vendor feeds</td></tr>
    <tr><td>On-chain</td><td>Active addresses, net exchange flow, pool depth, funding rate</td><td>Protocol upgrades redefine the metric mid-series</td></tr>
  </tbody>
</table>

Cross-sectional features carry an underappreciated advantage: ranking within a universe is automatically scale-free and roughly stationary, because the rank distribution is uniform by construction whatever the regime. This is one reason equity cross-section is the friendliest home for machine learning in finance.

---

#### Where Leakage Enters Feature Construction

- **Centred windows.** `rolling(window=21, center=True)` uses ten future bars. It appears in smoothing code constantly and is almost never intentional.
- **Backward-filled data.** `fillna(method='bfill')` propagates a future value backwards. Forward-fill is the point-in-time-safe direction.
- **Whole-sample fitted transforms.** Scalers, imputers, principal components, and target encoders, as above.
- **Restated fundamentals.** Vendor databases often store the corrected figure against the original period. The number you can see now is not the number the market saw.
- **Publication lag ignored.** A quarterly figure stamped with the fiscal period end rather than the release date grants weeks of foresight. See [ML Pitfalls](/ml-finance/ml-pitfalls).
- **Universe defined today.** Building a feature over "current index constituents" imports survivorship into every row.
- **Adjusted price series.** Split and dividend adjustments are applied retroactively across the whole history, so an adjusted close from a decade ago is not a price that was ever observable.

---

#### In Practice Across Asset Classes

**Equities.** Features are usually cross-sectionally standardised each day, then neutralised against size, sector, and market beta so the model learns residual behaviour rather than a factor exposure it could get more cheaply. See [Factor Models](/stat-methods/factor-models).

**Futures.** Everything is computed on a stitched continuous series, so the roll convention is a feature-engineering decision. Back-adjusted series can produce negative prices far back in history, which breaks any ratio-based feature.

**FX.** Quoting conventions and the choice of numeraire determine the sign of every feature. Interest rate differentials are effectively a feature and dominate short-horizon carry behaviour.

**Credit.** Spread levels are more informative than price and far more stable in distribution, but marks on illiquid instruments are stale, which produces artificial autocorrelation in any feature built from them.

**On-chain.** The data is granular in a way traditional markets are not — you can compute features per address, per pool, per block. The corresponding hazards are that a protocol upgrade can change what a metric means without changing its name, that raw event logs need careful decoding before they are numbers, and that reorgs make the most recent blocks provisional. Build the feature pipeline against finalised blocks only. See [Event Logs](/data-tooling/event-logs) and [Cleaning](/data-tooling/cleaning).

---

#### Assumptions and Failure Modes

- **Assumes the feature is stationary enough.** When it is not, coefficients fitted in one regime are applied to inputs outside the range they were estimated on. Trees clamp; linear models extrapolate wildly.
- **Assumes the timestamp is the availability time.** If it is the reference time, every row has foresight and no amount of correct cross-validation will detect it.
- **Assumes features are not near-duplicates.** Ten momentum lookbacks are one feature measured ten ways. This destroys [interpretability](/ml-finance/interpretability) and inflates the effective number of hypotheses tested.
- **Assumes the transform is invariant.** Adjusted prices, restated fundamentals, and revised macro series all change after the fact. Only a point-in-time database avoids this.
- **Assumes more features help.** Each added feature raises variance and expands the search space. In low signal-to-noise data the marginal feature usually costs more than it contributes. See [Regularisation](/ml-finance/regularisation).
- **Assumes the feature survives costs.** A feature that only predicts at horizons shorter than the round-trip cost horizon is not tradable regardless of its information coefficient.

---

#### Code

```python
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge


def trailing_zscore(series, window=252, min_periods=60):
    """Standardise using only bars strictly available at each timestamp.

    pandas rolling windows are trailing and closed on the right, so the
    value at t is included but nothing after t is. That is what we want.
    """
    mu = series.rolling(window, min_periods=min_periods).mean()
    sd = series.rolling(window, min_periods=min_periods).std(ddof=1)
    return ((series - mu) / sd).replace([np.inf, -np.inf], np.nan)


def build_features(ohlcv):
    out = pd.DataFrame(index=ohlcv.index)
    log_price = np.log(ohlcv["close"])
    out["ret_1"] = log_price.diff()
    # Ratio to own moving average: stationary, unlike the level itself.
    out["px_vs_sma_50"] = ohlcv["close"] / ohlcv["close"].rolling(50).mean() - 1.0
    out["realised_vol_20"] = out["ret_1"].rolling(20).std(ddof=1)
    out["vol_regime"] = trailing_zscore(out["realised_vol_20"])
    out["volume_z"] = trailing_zscore(ohlcv["volume"], window=60, min_periods=20)
    return out


# Scaling lives inside the pipeline so it is refitted on each training fold.
# Calling StandardScaler().fit_transform(X) before splitting leaks the test set.
model = Pipeline([
    ("scale", StandardScaler()),
    ("ridge", Ridge(alpha=10.0)),
])
```

---

#### See Also

* [ML Overview](/ml-finance/ml-overview)
* [Labelling](/ml-finance/labelling)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [Interpretability](/ml-finance/interpretability)
* [Stationarity](/quant-math/stationarity)
* [Data Cleaning](/data-tooling/cleaning)

---

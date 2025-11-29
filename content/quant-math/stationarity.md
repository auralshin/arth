### Stationarity

> info **Metadata** Level: Advanced | Prerequisites: Autocorrelation, Sampling | Tags: time-series, stationarity, regimes, modelling

Stationarity describes time series whose statistical properties are stable over time. In a stationary series, quantities such as mean, variance, and autocovariance do not change with the starting point in time. This property underlies many time series models and inference techniques.

Financial series such as prices are often non-stationary, displaying trends, drifts, and structural breaks. Returns and certain transformed variables can be closer to stationary, but even then, regimes and volatility shifts are common. Treating a non-stationary series as stationary leads to misleading estimates and forecasts.

In DeFi analytics, stationarity assumptions appear in models of returns, funding, usage metrics, and protocol flows. Testing for stationarity and identifying breaks or regime changes is an important step before fitting models or extrapolating risk metrics into the future.

---

#### See Also

* [Autocorrelation](/quant-math/autocorrelation)
* [Random Walks](/quant-math/random-walks)
* [Rolling Windows](/quant-math/rolling-windows)

---

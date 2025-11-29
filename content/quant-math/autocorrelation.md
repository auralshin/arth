### Autocorrelation

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Expectation & Variance | Tags: time-series, autocorrelation, dependence, momentum, mean-reversion

Autocorrelation measures dependence between a time series and its own past values. Positive autocorrelation means that high values tend to follow high values; negative autocorrelation means that high values tend to be followed by low values. In returns, positive autocorrelation is associated with momentum effects, while negative autocorrelation can indicate mean reversion or microstructure noise.

Formally, autocorrelation at a lag compares returns separated by that lag. Estimating the pattern of autocorrelations across lags reveals structure such as trending behaviour, seasonality, or the memory of volatility shocks.

For DeFi markets, autocorrelation is relevant to signal design and backtesting. Evidence of persistence in funding rates, volume, or on-chain activity supports strategies that lean into or against recent patterns. Strong autocorrelation also affects risk models, since independence assumptions break down.

---

#### See Also

* [Stationarity](/quant-math/stationarity)
* [Random Walks](/quant-math/random-walks)
* [Mean Reversion](/quant-math/mean-reversion)

---

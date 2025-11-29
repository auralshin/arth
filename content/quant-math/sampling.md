### Sampling

> info **Metadata** Level: Intermediate | Prerequisites: Random Variables, Expectation & Variance | Tags: statistics, sampling, estimation, data, backtesting

Sampling describes how data points are collected from an underlying process and how those samples are used to estimate properties of that process. For time series such as prices or returns, sampling frequency and method directly shape the statistics that are observed.

Estimators such as sample mean and sample variance use finite samples to approximate expectations and variances. Their accuracy depends on sample size, dependence structure, and the presence of outliers. Biased sampling, such as ignoring periods of extreme volatility or failing to record failed transactions, leads to distorted conclusions.

In DeFi, sampling choices include bar sizes for candles, aggregation across chains or pools, and selection of intervals for funding or liquidation statistics. Seemingly small decisions, such as using daily versus hourly returns, can produce different volatility and risk estimates, especially for assets with heavy tails or clustered volatility.

---

#### See Also

* [LLN & CLT](/quant-math/lln-clt)
* [Rolling Windows](/quant-math/rolling-windows)
* [Returns](/quant-math/returns)

---

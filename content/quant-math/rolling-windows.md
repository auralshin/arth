### Rolling Windows

> info **Metadata** Level: Intermediate | Prerequisites: Sampling, Returns | Tags: time-series, estimation, rolling, volatility, metrics

Rolling windows are moving subsets of data used to compute time-varying statistics. Instead of using the entire sample to estimate a single volatility or mean, a rolling approach computes these quantities over recent periods, updating them as new data arrives and old data leaves the window.

This technique highlights how metrics evolve over time. Rolling volatility reveals clusters of high and low risk. Rolling Sharpe ratios show how performance changes across regimes. Rolling correlations show when diversification benefits weaken or strengthen.

In DeFi, rolling windows are natural in dashboards and risk monitors. They align with how protocols and traders experience markets day by day. Window choice is a key parameter: short windows react quickly but are noisy, while long windows are smoother but slower to reflect new conditions.

---

#### See Also

* [Volatility](/quant-math/volatility)
* [Sharpe Ratio](/quant-math/sharpe)
* [Drawdown](/quant-math/drawdown)

---

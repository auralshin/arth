### Volatility

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Expectation & Variance | Tags: volatility, dispersion, risk, time-series

Volatility summarises the typical magnitude of fluctuations in returns. Statistically, it is often defined as the standard deviation of returns over a chosen horizon, sometimes annualised to ease comparison across assets and strategies. High volatility indicates wide swings; low volatility indicates relatively stable behaviour.

Volatility is path dependent and sensitive to sampling choices. Short horizons capture fine-grained noise and microstructure effects, while longer horizons average over more variation. Volatility also tends to cluster in time, rising during stressed periods and receding during calm ones, which creates challenges for models that assume constant variance.

In DeFi, volatility affects liquidation thresholds, margin requirements, option pricing, and risk limits. LP strategies and leveraged perps are especially sensitive to volatility, both through realised PnL and through indirect effects such as funding and slippage.

---

#### See Also

* [Returns](/quant-math/returns)
* [Autocorrelation](/quant-math/autocorrelation)
* [VaR & CVaR](/quant-math/var-cvar)

---

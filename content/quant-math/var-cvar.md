### VaR & CVaR

> info **Metadata** Level: Advanced | Prerequisites: Expectation & Variance, Sampling, Drawdown | Tags: risk, tails, var, cvar, loss-distribution

Value at Risk and Conditional Value at Risk focus on the tail of the loss distribution. Value at Risk at a given confidence level is a threshold loss that is exceeded only with a specified small probability over a fixed horizon. Conditional Value at Risk, also called expected shortfall, is the average loss given that this threshold has been breached.

VaR provides a percentile view of potential losses but does not describe what happens beyond that point. CVaR extends the picture by summarising the severity of worse cases. Both measures can be computed from historical data, parametric models, or simulations.

In DeFi, VaR and CVaR can be applied to portfolios containing spot tokens, LP positions, borrowed funds, and derivative exposures. The presence of jumps, liquidation events, and sharply changing liquidity means that tail behaviour is often more complex than simple normal models assume, and scenario based or simulation based approaches become important.

---

#### See Also

* [Drawdown](/quant-math/drawdown)
* [Volatility](/quant-math/volatility)
* [Simulation – Scenarios](/simulation/scenarios)

---

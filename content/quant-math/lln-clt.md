### LLN & CLT

> info **Metadata** Level: Advanced | Prerequisites: Random Variables, Expectation & Variance | Tags: math, probability, convergence, asymptotics

The Law of Large Numbers and the Central Limit Theorem explain how averages behave when many independent or weakly dependent observations are combined. The Law of Large Numbers states that sample averages tend to approach the true expectation as the number of observations grows. The Central Limit Theorem describes how suitably scaled sums tend to have approximately normal distributions, even when individual terms are not normal.

These results justify treating sample means and other statistics as stable quantities, at least under conditions where independence and identical distributions are reasonable approximations. They underpin confidence intervals, hypothesis tests, and many risk metrics based on historical data.

In DeFi analytics, LLN and CLT are often used implicitly when returns are aggregated over time, when Sharpe ratios are estimated from samples, or when backtests assume that average behaviour in the sample is indicative of the future. Understanding the limitations of these theorems is as important as knowing their statements, especially in environments with regime changes and structural breaks.

---

#### See Also

* [Sampling](/quant-math/sampling)
* [Returns](/quant-math/returns)
* [Volatility](/quant-math/volatility)

---

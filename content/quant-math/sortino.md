### Sortino Ratio

> info **Metadata** Level: Intermediate | Prerequisites: Sharpe Ratio, Returns | Tags: performance, downside-risk, sortino, risk-adjusted-return

The Sortino ratio refines the Sharpe ratio by focusing on downside volatility rather than total volatility. It compares average excess return to the standard deviation of negative returns or returns below a target level. Upside moves do not contribute to the risk measure.

This perspective aligns more closely with risk concerns that focus on losses rather than fluctuations in general. Two strategies can have similar total volatility but very different downside profiles; Sortino distinguishes between them by penalising only harmful deviations.

For DeFi portfolios that may experience occasional sharp drawdowns or liquidations, Sortino can provide a more informative view than Sharpe alone. However, it shares similar sensitivities to sample length and regime changes, and it relies on a chosen target or threshold for defining downside.

---

#### See Also

* [Sharpe Ratio](/quant-math/sharpe)
* [Drawdown](/quant-math/drawdown)
* [VaR & CVaR](/quant-math/var-cvar)

---

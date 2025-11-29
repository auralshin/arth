### Rebalancing

> info **Metadata** Level: Intermediate | Prerequisites: Mean-Variance, Position Sizing | Tags: rebalancing, portfolios, drift, trading-costs

Rebalancing is the process of bringing a portfolio back toward target weights after market movements cause drift. Without rebalancing, assets that outperform tend to dominate the portfolio over time, changing its risk profile. Rebalancing rules determine when and how to trade to restore desired allocations.

Strategies include calendar based rebalancing at fixed intervals, threshold based rebalancing when weights deviate by more than a set amount, and more dynamic approaches linked to volatility or risk measures. Each choice trades off tracking of targets against trading costs, taxes, and market impact.

On chain, rebalancing carries additional frictions: gas fees, slippage in AMMs, and potential MEV issues. For LP positions and concentrated liquidity, rebalancing may involve adjusting ranges and pool selections rather than simply buying or selling tokens. Designing rebalancing rules that respect both risk objectives and protocol level costs is a central task in DeFi portfolio engineering.

---

#### See Also

* [Position Sizing](/quant-math/position-sizing)
* [Mean-Variance](/quant-math/mean-variance)
* [Rolling Windows](/quant-math/rolling-windows)

---

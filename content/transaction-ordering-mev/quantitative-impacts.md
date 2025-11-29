### Quantitative Impacts

> info **Metadata** Level: Advanced | Prerequisites: Slippage, Returns, MEV Taxonomy | Tags: mev, measurement, cost, metrics, lp

Quantitative analysis of MEV focuses on measuring how much value is extracted, from whom, and under which market conditions. It turns abstract discussions of fairness and efficiency into concrete numbers: basis points of slippage, share of LP returns lost to arbitrage, or fraction of fees captured by block level actors.

At the trade level, costs can be decomposed into explicit fees, baseline price impact given liquidity, and additional losses attributable to adversarial ordering, such as sandwiches. Comparing observed execution prices to counterfactual benchmarks, such as best available price in absence of front running, reveals MEV related costs.

For LPs, analysis examines how much of the rebalancing and price alignment work is compensated by fees versus lost to arbitrageurs with ordering advantage. The balance between LP returns, arbitrage profits, and protocol fees determines whether providing liquidity remains attractive over time.

At the system level, metrics aggregate MEV across blocks, markets, or time periods. These include total extractable value, realised MEV captured by different actor classes, and correlations between MEV intensity and volatility or liquidity. Scenario analysis considers how changes in protocol design, fee structures, or ordering rules would shift these quantities.

Quantitative impacts also feed back into design. Protocols can simulate the introduction of batch auctions, different fee tiers, or new routing rules to estimate their effect on user costs and MEV distribution before deployment.

---

#### See Also

* [Statistical Modeling](/transaction-ordering-mev/statistical-modeling)
* [Slippage](/microstructure/slippage)
* [Liquidity Pools](/building-blocks/liquidity-pools)

---

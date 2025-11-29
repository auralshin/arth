### Jump Processes

> info **Metadata** Level: Advanced | Prerequisites: Random Variables, Volatility, Geometric Brownian Motion | Tags: jumps, tails, discontinuities, risk

Jump processes extend diffusion models by allowing occasional discontinuous moves. Instead of prices evolving only through small incremental changes, jumps represent sudden shifts driven by news, liquidations, exploits, or structural events. Mathematically, these processes combine continuous components with Poisson or more general jump mechanisms.

Jumps matter for risk because they concentrate loss or gain into short intervals and produce heavier tails than normal distributions predict. Classic variance based risk metrics can underestimate the probability and severity of extreme moves in the presence of jumps.

In DeFi, jumps are common. Security incidents, governance decisions, regulatory news, and large liquidation cascades can produce sharp price and liquidity changes. Modelling these events as jump processes supports more realistic scenario analysis and tail risk estimation, especially for leveraged and path sensitive structures.

---

#### See Also

* [Geometric Brownian Motion](/quant-math/gbm)
* [VaR & CVaR](/quant-math/var-cvar)
* [Simulation – Scenarios](/simulation/scenarios)

---

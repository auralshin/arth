### Kelly Criterion

> info **Metadata** Level: Advanced | Prerequisites: Expectation & Variance, Returns | Tags: kelly, bet-sizing, growth, risk

The Kelly criterion describes how to size repeated bets to maximise long run exponential growth of wealth under specific assumptions. For simple binary bets with known probabilities and payoffs, it yields a closed form fraction of capital to allocate. For more complex distributions, the principle generalises by maximising expected log utility.

Kelly optimal sizing is mathematically appealing but often aggressive in practice. It assumes precise knowledge of edge and distribution, independence of bets, and infinite horizon growth objectives. Errors in edge estimation can lead to over sizing and large drawdowns.

In DeFi, Kelly style reasoning appears in leverage choices for strategies with perceived edge, such as basis trades, LP provisioning, or funding capture. Practitioners often scale down from full Kelly to partial fractions to trade off expected growth against drawdown risk and estimation uncertainty.

---

#### See Also

* [Position Sizing](/quant-math/position-sizing)
* [Optimization](/quant-math/optimization)
* [Drawdown](/quant-math/drawdown)

---

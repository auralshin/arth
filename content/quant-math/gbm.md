### Geometric Brownian Motion

> info **Metadata** Level: Advanced | Prerequisites: Random Walks, Calculus, Volatility | Tags: gbm, stochastic-processes, prices, diffusion

Geometric Brownian Motion is a continuous time model where the logarithm of price follows a Brownian motion with drift. In this framework, prices remain positive, returns are normally distributed over fixed intervals, and variance grows linearly with time. The model has a long history in option pricing and basic risk calculations.

The structure of Geometric Brownian Motion allows closed form solutions for many quantities, including distribution of future prices and some derivatives. It encodes constant volatility and log normal price distributions, which rarely hold exactly in practice but provide a tractable starting point.

In DeFi, Geometric Brownian Motion is useful as a simple scenario generator or benchmark. Comparing empirical return distributions and volatility clustering to GBM predictions highlights where real markets diverge, pointing toward the need for models with stochastic volatility, jumps, or more complex dynamics when higher fidelity is required.

---

#### See Also

* [Random Walks](/quant-math/random-walks)
* [Volatility](/quant-math/volatility)
* [Jump Processes](/quant-math/jumps)

---

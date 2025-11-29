### Random Walks

> info **Metadata** Level: Intermediate | Prerequisites: Random Variables, Autocorrelation | Tags: random-walks, time-series, prices, martingales

Random walk models describe processes where each step is the sum of a previous value and an innovation term. In a simple random walk, increments are independent and identically distributed, often with zero mean. Applied to prices, this leads to the idea that future changes are unpredictable given current information.

Mathematically, random walks provide a baseline for thinking about drift, variance growth over time, and the relationship between levels and differences. Over longer horizons, variance of a random walk grows linearly with time, reflecting the accumulation of independent shocks.

In DeFi, random walk assumptions underpin some simple simulations and risk estimates. They are often too simplistic for detailed modelling, since real markets display autocorrelation in volatility, jumps, and regime changes, but they offer a clear reference against which more complex behaviours can be compared.

---

#### See Also

* [Geometric Brownian Motion](/quant-math/gbm)
* [Mean Reversion](/quant-math/mean-reversion)
* [LLN & CLT](/quant-math/lln-clt)

---

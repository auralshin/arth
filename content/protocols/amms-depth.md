### AMMs In Depth

> info **Metadata** Level: Advanced | Prerequisites: AMMs 101, Liquidity Pools | Tags: invariant, pricing, arbitrage, cfmm, derivatives

Constant-function market makers (CFMMs) generalise the idea of an AMM by defining trades through a constraint f(r<sub>1</sub>, r<sub>2</sub>, …, r<sub>n</sub>) = C, where r<sub>i</sub> are reserves and C is a constant. Each choice of function induces a different price surface and slippage profile. Understanding these invariants at a mathematical level clarifies how pools behave under extreme conditions, respond to arbitrage, and generate or destroy value for LPs.

This page discusses the derivation of marginal prices from invariants, compares common functional forms, and sketches how invariant design interacts with fee capture, MEV, and hedging strategies.

---

#### Marginal Pricing and the Invariant Gradient

For a two-asset pool with invariant f(r<sub>1</sub>, r<sub>2</sub>) = C, the marginal price of asset 1 in terms of asset 2 is given by the ratio of partial derivatives:

```formula
p<sub>1,2</sub> = −∂f/∂r<sub>1</sub> / (∂f/∂r<sub>2</sub>)
```

This formula arises from the implicit function theorem: holding C constant, a small change in r<sub>1</sub> must be offset by a change in r<sub>2</sub> such that the total differential of f equals zero. The negative sign reflects that increasing one reserve decreases the other.

For the constant-product AMM f(r<sub>1</sub>, r<sub>2</sub>) = r<sub>1</sub> r<sub>2</sub>, the partials are r<sub>2</sub> and r<sub>1</sub>, yielding p<sub>1,2</sub> = r<sub>2</sub> / r<sub>1</sub>. For a constant-sum AMM f = r<sub>1</sub> + r<sub>2</sub>, both partials are 1, so the marginal price is always 1:1.

More sophisticated curves, like the stableswap invariant, blend these behaviours: near balance the curve is nearly linear (low slippage), while far from balance it transitions toward constant-product behaviour to maintain some liquidity at all prices.

---

#### Slippage and Convexity

Slippage refers to the difference between the marginal price at the start of a trade and the average execution price for a finite trade size. This gap is determined by the curvature of the invariant. High curvature means the slope changes rapidly, leading to large slippage; low curvature (near-linear) implies more stable pricing.

Mathematically, slippage for a trade Δr<sub>1</sub> can be approximated by a second-order Taylor expansion of the invariant around the current reserves. The second derivative of f with respect to r<sub>1</sub> (holding C constant by adjusting r<sub>2</sub>) measures local convexity. Curves with high convexity in the direction of the trade produce worse execution than those that are flatter.

The trade-off is that flatter curves concentrate liquidity narrowly. A constant-sum pool offers zero slippage but provides no price discovery mechanism and breaks down entirely once one reserve is exhausted. Constant-product pools offer continuous liquidity across all prices but at the cost of significant slippage for large trades far from the current ratio. Concentrated liquidity attempts to get the best of both by focusing a constant-product-like curve over a restricted range.

---

#### Multi-Asset Pools and Generalised Invariants

Extending beyond two assets, an invariant f(r<sub>1</sub>, …, r<sub>n</sub>) = C defines an (n−1)-dimensional hypersurface. Prices become pairwise ratios of gradients. Trades may involve swapping asset i for asset j directly, or they may route through an intermediate asset if that provides better execution.

Balancer pools use weighted geometric means:

```formula
∏<sub>i</sub> r<sub>i</sub><sup>w<sub>i</sub></sup> = C
```

where w<sub>i</sub> are fixed weights summing to 1. This generalises constant-product (which is the special case w<sub>i</sub> = 1/n) and allows asymmetric exposure. The marginal price of asset i in terms of asset j is:

```formula
p<sub>i,j</sub> = (r<sub>j</sub> / r<sub>i</sub>) · (w<sub>i</sub> / w<sub>j</sub>)
```

Curve Finance's stableswap invariant blends a sum and a product term with an amplification coefficient A. The invariant is implicit and must be solved numerically, but it produces nearly flat pricing near balance and transitions smoothly to constant-product as reserves diverge.

---

#### Fees, Arbitrage Bounds, and No-Arbitrage Bands

In the absence of fees, any deviation between the AMM's marginal price and an external reference price creates a riskless arbitrage. Arbitrageurs exploit this by trading until the prices align, rebalancing the pool without compensating LPs. Fees introduce a transaction cost that establishes a no-arbitrage band: the pool's price can deviate from the external market by up to the fee percentage before arbitrage becomes profitable.

The width of this band depends on fee size, gas costs, and external liquidity. Under high volatility or low external depth, the band can widen or shift rapidly. During such periods, LPs bear greater inventory risk and see more frequent rebalancing, while arbitrageurs capture the spread.

From a modelling perspective, fee revenue is a function of trade volume and fee rate. Volume itself depends on the pool's competitiveness relative to other venues, which in turn depends on slippage, depth, and fee level. Optimising the fee parameter is a dynamic problem sensitive to market conditions and pool size.

---

#### Hedging LP Positions and Portfolio Dynamics

An LP position in a constant-product pool is equivalent to holding a dynamic portfolio that rebalances toward the worse-performing asset. This resembles a short position in a variance swap or a short gamma option: when prices move, the portfolio loses relative to a static hold.

Quantifying this precisely requires modelling the pool's reserve dynamics as a stochastic process. If external prices follow a geometric Brownian motion and arbitrage is instantaneous (ignoring fees), the LP's value evolves according to a PDE analogous to the Black–Scholes equation but with negative gamma.

Adding fees changes the picture: fee accrual provides a positive drift term that can offset rebalancing losses if volume is sufficiently high relative to volatility. Whether an LP position is profitable depends on the balance between these two forces, along with the initial deposit size, time horizon, and correlation structure of the underlying assets.

Delta-hedging an LP position involves taking offsetting positions in the constituent assets or derivatives to neutralise the rebalancing effect. This transforms the position into a more stable exposure, isolating the fee yield. However, hedging incurs transaction costs and basis risk, and it may not be feasible for all LPs or asset pairs.

---

#### See Also

* [AMMs 101](/building-blocks/amms-101) – Foundational concepts and terminology
* [Concentrated Liquidity](/protocols/concentrated-liquidity) – Range-based liquidity and Uniswap v3 design
* [Liquidity Pools](/building-blocks/liquidity-pools) – Reserve composition, LP tokens, and risk
* [Impermanent Loss](/building-blocks/impermanent-loss) – Path dependence and rebalancing cost
* [LP Returns](/simulations/lp-returns) – Simulated returns under different vol and fee regimes

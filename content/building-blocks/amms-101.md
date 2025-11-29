### AMMs 101

> info **Metadata** Level: All | Prerequisites: Liquidity Pools | Tags: amm, constant-product, invariant, pricing, slippage

Automated Market Makers (AMMs) replace order-book matching with a pricing rule defined by a mathematical invariant. A pool holds reserves of multiple assets and permits trades only if the resulting reserve vector satisfies the invariant. This approach allows anyone to trade against the pool at any time, without waiting for a counterparty to arrive. The price at which a trade executes is determined by where it falls on the invariant's surface.

The canonical example is the constant-product market maker (CPMM), which enforces the rule:

```formula
r<sub>1</sub> · r<sub>2</sub> = k
```

where r<sub>1</sub> and r<sub>2</sub> are the reserves of the two assets, and k is a constant. A trade that gives the pool Δr<sub>1</sub> of asset 1 in exchange for some amount of asset 2 must leave the product of the new reserves equal to k. This forces the price to adjust smoothly as reserves shift.

---

#### Invariant Surfaces and Pricing

An invariant defines an (n−1)-dimensional surface in reserve space. In a two-asset pool, the invariant is a curve in the (r<sub>1</sub>, r<sub>2</sub>) plane. The slope of this curve at any point determines the local marginal price. For the constant-product AMM, the curve is a rectangular hyperbola, and the marginal price is proportional to the ratio r<sub>2</sub> / r<sub>1</sub>.

As trading activity moves the reserves along this curve, the marginal price changes. This effect, often called "slippage," is not a symptom of market friction but a consequence of the invariant. A trader who demands a large quantity of one asset will push the reserves far from their starting point and therefore realise a less favourable average price than the initial marginal price suggested.

Different invariants produce different shapes. Stableswap curves, for instance, keep the slope nearly flat near the centre of the reserve range, allowing for low slippage when assets are close in value; constant-sum rules move linearly and behave more like limit orders. The choice of invariant encodes trade-offs between capital efficiency, slippage characteristics, and exposure to impermanent loss.

---

#### Fees and Pool Balancing

Most deployed AMMs charge a small fee on each trade. Instead of sending the fee to a separate treasury or distributing it immediately, protocols typically add the fee to the pool's reserves. This increases the product (or sum, or whatever the invariant tracks) without requiring LPs to deposit additional capital. Over time, if volume is sustained, the growth in reserves can generate a real return for LPs.

Fees also create a buffer against arbitrage that would otherwise drain the pool. Without fees, each external price movement would be immediately reflected in the pool through arbitrage, leaving LPs with a rebalanced portfolio but no compensation. With fees, arbitrageurs must cross a hurdle before acting, and the pool can sustain a small price deviation relative to the external market. The magnitude of this deviation depends on fee size, external liquidity, and transaction costs.

From a research standpoint, fees introduce both a return component and a friction term into the dynamics of reserve evolution and LP PnL. Calibrating the fee parameter is a balance: too high and volume is diverted to other pools; too low and arbitrage erodes value without compensating LPs.

---

#### Capital Efficiency and Concentration

In the basic constant-product model, capital is spread uniformly along the entire price range from zero to infinity. Most of this capital is rarely used; if a stablecoin pair spends 99% of its time within a narrow band around 1:1, the liquidity beyond that range is largely idle.

Concentrated liquidity mechanisms address this by allowing LPs to specify a range. The pool behaves as if it only exists over that interval; outside it, liquidity is not available. This concentrates capital where it is most likely to be used, increasing the depth at the active price and reducing slippage for typical trades. However, it also increases the rate at which LPs rebalance and exposes them to greater impermanent loss if the price moves out of range.

Variations on this theme include multi-range deposits, dynamic curves that shift automatically based on volatility, and hybrid models that blend constant-product and concentrated logic. Each trades off simplicity, gas costs, and performance characteristics.

---

#### MEV, Arbitrage, and Ordering

Because AMM pools sit on-chain and quote continuous prices, they are natural targets for arbitrage and MEV extraction. When external prices shift, arbitrageurs rush to trade against the pool to bring its implied price back in line. This rebalancing is mechanical: the pool does not know about external markets, so it relies on profit-seeking traders to maintain coherence.

However, the race to capture this arbitrage creates priority conflicts. Block proposers, searchers, and validators each have incentives to order or insert transactions to maximise extracted value. Sandwiching, front-running, and back-running emerge as standard tactics. These phenomena redistribute value from ordinary users (and sometimes LPs) to participants with access to ordering power or faster execution.

From an AMM design perspective, reducing MEV leakage motivates features like batch auctions, delayed settlement, off-chain order matching with on-chain settlement, and protocols that route fee capture back to LPs. Research into order flow dynamics, proposer-builder separation, and auction mechanisms feeds into how next-generation AMMs evolve.

---

#### See Also

* [Liquidity Pools](/building-blocks/liquidity-pools) – Pool structure, LP tokens, and reserve dynamics
* [AMMs In Depth](/protocols/amms-depth) – Mathematical details of common invariants and extensions
* [Concentrated Liquidity](/protocols/concentrated-liquidity) – Range orders and Uniswap v3 mechanics
* [Swaps & DEXs](/building-blocks/swaps-dexs) – Routing, aggregation, and execution flow
* [Impermanent Loss](/building-blocks/impermanent-loss) – Rebalancing effects on LP returns

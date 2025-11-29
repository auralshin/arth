### Concentrated Liquidity

> info **Metadata** Level: Advanced | Prerequisites: AMMs 101, AMMs In Depth | Tags: uniswap-v3, range-orders, capital-efficiency, lp-strategy

Concentrated liquidity replaces the uniform distribution of capital across all prices with LP-specified ranges. Instead of providing liquidity from zero to infinity, an LP chooses a lower and upper price bound; within that range, the pool behaves as if only that liquidity exists. Outside the range, the LP's capital is idle. This design dramatically increases capital efficiency for pairs that trade within predictable bounds, but it also magnifies rebalancing effects and exposes LPs to greater impermanent loss if the price moves beyond their chosen interval.

Uniswap v3 is the canonical implementation. Each position is an NFT representing a specific range and liquidity amount. The protocol aggregates these individual ranges into a global liquidity distribution and routes trades through the active ranges. Understanding how ranges interact, how liquidity is measured, and how fees accrue within this system is essential for designing profitable LP strategies or building on top of concentrated-liquidity protocols.

---

#### Liquidity, Ranges, and Virtual Reserves

In a constant-product pool, liquidity L is defined such that r<sub>1</sub> r<sub>2</sub> = L². A concentrated range [p<sub>a</sub>, p<sub>b</sub>] is equivalent to a constant-product curve over that interval. The reserves at the boundaries are determined by the range and the chosen liquidity amount; within the range, trades move the price along the curve as usual.

Mathematically, the relationship between real reserves (r<sub>1</sub>, r<sub>2</sub>) and liquidity L in a range is:

```formula
L = √(r<sub>1</sub> · r<sub>2</sub>)
```

when the current price is inside the range. At the edges, one reserve goes to zero: below p<sub>a</sub>, the position is entirely in asset 1; above p<sub>b</sub>, entirely in asset 2. The protocol tracks liquidity per tick and accumulates it as the price crosses boundaries.

This structure means that a given amount of capital can be deployed as if it were much larger. For instance, a narrow range around 1:1 for a stablecoin pair can provide the same depth at that price as a global pool many times its size.

---

#### Ticks, Bins, and Discrete Price Levels

Uniswap v3 divides the price axis into discrete ticks. Each tick corresponds to a price level, and ranges are defined by pairs of ticks. When the price crosses a tick, the set of active liquidity changes: positions with an endpoint at that tick are added or removed from the active set.

This discrete structure simplifies accounting and gas costs: instead of recalculating reserves for every trade, the protocol updates liquidity only when crossing a tick. However, it also introduces step discontinuities in depth. If many LPs cluster ranges around the same tick boundaries, liquidity can change abruptly, leading to sudden slippage spikes.

Choosing tick spacing is a trade-off. Finer spacing allows more precise range selection but increases gas costs and fragmentation. Coarser spacing reduces complexity at the expense of flexibility. Different fee tiers in Uniswap v3 have different tick spacings, tuned to the expected volatility and trading behaviour of the pair.

---

#### Fee Accrual and In-Range vs Out-of-Range

Fees are earned only when a position is in range and actively facilitating trades. If the price moves out of range, the position stops accruing fees until the price returns. This creates a strong incentive to keep positions aligned with the current market price, but it also requires active management.

The fee rate per unit of liquidity is higher for concentrated positions because the same trade volume is divided among fewer LPs. This can lead to high APRs for narrow ranges in volatile pairs, but it also means that any time spent out of range is lost opportunity. The trade-off between range width, fee capture, and risk of going out of range is central to LP strategy design.

In practice, many LPs use automated position managers or vaults that rebalance ranges dynamically based on price movements, volatility, and other signals. These systems attempt to maximise fee income while minimising the frequency and cost of rebalancing.

---

#### Impermanent Loss, Rebalancing Frequency, and Gamma

Concentrated liquidity amplifies the rebalancing effect that produces impermanent loss. A narrow range corresponds to a high-gamma position: small price moves cause large changes in portfolio composition. As the price oscillates within the range, the LP is continuously buying the falling asset and selling the rising one, locking in losses relative to a static hold.

If the range is very narrow and the price is volatile, rebalancing happens rapidly and the cumulative drag can be severe. On the other hand, a wide range behaves more like a traditional AMM position, with lower capital efficiency but gentler rebalancing.

Quantifying this requires modelling the distribution of price paths and the interaction between volatility, range width, and fee income. High volatility increases both the potential fee yield (more volume) and the rebalancing cost (more frequent and larger adjustments). Whether a concentrated position outperforms a passive hold depends on the balance between these forces.

---

#### Strategic Considerations and Position Management

Successful LP strategies in concentrated-liquidity protocols must address several questions:
- How wide should the range be, given expected volatility and fee tier?
- When and how should ranges be adjusted in response to price moves?
- Should multiple ranges be deployed to cover different scenarios?
- How should gas costs and opportunity costs be factored into rebalancing decisions?

Static strategies (set a range and leave it) are simple but can underperform if the price drifts. Dynamic strategies (rebalance periodically or in response to events) can capture more fees but incur transaction costs and complexity. Hybrid approaches, such as deploying a base range plus opportunistic narrow ranges, attempt to balance these concerns.

From a protocol-design perspective, concentrated liquidity opens new possibilities: options-like payoffs, just-in-time liquidity that appears only for specific trades, and integration with lending or derivatives to hedge the LP position. Research into optimal range selection, automated rebalancing algorithms, and risk-adjusted performance metrics is ongoing.

---

#### See Also

* [AMMs In Depth](/protocols/amms-depth) – Invariant design and pricing mechanics
* [Liquidity Pools](/building-blocks/liquidity-pools) – Core concepts of reserves and LP tokens
* [LP Business Models](/strategies/lp-business) – Evaluating profitability and risk-adjusted returns
* [Delta-Hedged LP](/strategies/delta-hedged-lp) – Neutralising rebalancing with offsetting positions
* [LP Returns](/simulations/lp-returns) – Simulated performance under different parameter choices

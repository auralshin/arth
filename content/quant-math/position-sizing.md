### Position Sizing

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Drawdown, Volatility | Tags: position-sizing, risk, leverage, capital-allocation

Position sizing answers the question of how large a position should be relative to capital. It connects risk metrics such as volatility and drawdown to practical decisions such as notional exposure, leverage, and margin allocation.

Common approaches include fixed fraction sizing, where a constant proportion of capital is allocated per trade or strategy; volatility targeting, where position size is adjusted to maintain roughly constant risk; and sizing that is explicitly tied to risk limits such as maximum acceptable drawdown.

In DeFi, position sizing interacts with protocol constraints and liquidation thresholds. A position that looks modest relative to portfolio value might still be large relative to collateral at risk in a specific lending or perp account. Integrating on chain constraints with overall portfolio risk management is essential to avoid forced liquidations during ordinary volatility.

---

#### See Also

* [Kelly Criterion](/quant-math/kelly)
* [Rebalancing](/quant-math/rebalancing)
* [Drawdown](/quant-math/drawdown)

---

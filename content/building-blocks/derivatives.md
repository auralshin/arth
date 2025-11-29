### Derivatives

> info **Metadata** Level: Intermediate | Prerequisites: Trading Foundations, Perpetual Futures, Returns | Tags: derivatives, futures, options, structured-products, leverage, risk-transfer

Derivatives are financial contracts whose value depends on the behaviour of underlying assets or indices. In DeFi, derivatives extend beyond perpetual futures to include options, structured products, volatility tokens, interest-rate swaps, and more. They enable leverage, hedging, and risk transfer, but also introduce layers of complexity and new failure modes.

At a high level, a derivative defines a payoff function mapping future states of the world into cash flows or asset transfers. The structure of this function determines how risk is shared between counterparties.

---

#### Linear vs Nonlinear Payoffs

Linear derivatives, such as futures and forwards, have payoffs that scale linearly with changes in the underlying. A unit long position gains when the underlying rises and loses when it falls, with proportional sensitivity.

Nonlinear derivatives, such as options, have payoffs that depend on thresholds, convexity, and path features. For example, a call option provides upside beyond a strike price while limiting downside to the premium paid. Structured products combine multiple linear and nonlinear components to construct bespoke payoff shapes.

In DeFi, both types appear in on-chain protocols and off-chain agreements settled via smart contracts.

---

#### Option Protocols and Volatility Products

Option protocols provide markets for calls and puts on crypto assets, often with standardised expiries and strikes. These markets allow hedging of directional and volatility risk, speculation on implied volatility, and construction of structured strategies.

Some designs tokenise options directly, while others use vault structures that deploy capital into options strategies on behalf of depositors. Volatility tokens and indices compress information about option markets into tradeable instruments, exposing holders to volatility rather than spot direction.

---

#### Interest-Rate and Funding Derivatives

DeFi also experiments with derivatives on interest rates and funding rates. Fixed-rate lending protocols, rate swaps, and products that reference funding on perps aim to separate rate risk from other exposures.

These instruments require robust benchmarks and clear definitions of reference rates. They also rely on sufficient liquidity and transparency in the underlying rate markets to support valuation and risk management.

---

#### Collateral, Margin, and Stacking

Most on-chain derivatives are collateralised using other crypto assets. Collateral can be pledged directly in the derivative protocol or via positions in lending systems. Margin mechanics resemble those in perps and lending, with risk engines tracking exposures and triggering liquidations when needed.

Derivative exposures are often stacked. A user might hold LP positions, borrow against them, and then enter derivatives based on those same underlying assets. This stacking amplifies both opportunity and fragility, especially when many participants adopt similar configurations.

---

#### Systemic Considerations

Derivatives shape how shocks propagate through the system. Hedged positions may dampen volatility in one segment while concentrating it elsewhere. Leverage magnifies sensitivity to small price moves, increasing the likelihood and impact of liquidation cascades.

Assessing these effects involves mapping networks of exposures, understanding how derivative payoffs align or conflict with spot positions, and modelling behaviour under stress scenarios.

---

#### See Also

* [Perpetual Futures](/building-blocks/perpetual-futures) – Main linear derivative in crypto markets  
* [Trading Foundations](/advanced-topics/trading-foundations) – Framework for thinking about payoffs and risk  
* [Risk Types](/risk/types) – Market, liquidity, and counterparty risk in derivative structures  
* [Simulation – Scenarios](/simulation/scenarios) – Scenario analysis for derivative-heavy portfolios

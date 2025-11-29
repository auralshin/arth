### Liquidations

> info **Metadata** Level: Intermediate | Prerequisites: Lending & Borrowing, Perpetual Futures, Oracles | Tags: liquidations, margin, lending, perps, auctions, risk

Liquidations are the process by which protocols close or reduce risky positions whose collateral is no longer sufficient. In lending systems, liquidations protect depositors by ensuring that borrowed amounts remain backed by collateral. In derivative systems, liquidations prevent insolvent accounts from accumulating and harming counterparties.

Liquidations are mechanical but not neutral. They generate order flow, affect prices, and can trigger feedback loops across markets that share collateral or reference prices.

---

#### Triggers and Thresholds

Liquidation triggers arise when a health metric crosses a threshold. In lending protocols, health factors depend on collateral values, borrowed amounts, and risk parameters like liquidation thresholds. In perp systems, margin ratios depend on mark prices, position sizes, and fee or funding accrual.

Oracle updates and price feeds are central to this process. Delayed or manipulated prices can cause liquidations to occur too late, too early, or at distorted levels. Threshold design balances protection for the system against fairness for users.

---

#### Liquidation Mechanisms

Several mechanism types appear in practice:

- Fixed discount models, where liquidators repay a portion of debt and seize collateral at a set discount.  
- Auctions, where collateral is sold competitively to discover a clearing price.  
- Internal socialised loss mechanisms or insurance funds that absorb residual risk.  

Each approach shapes incentives for liquidators and affects how quickly and reliably distressed positions are resolved. Well-designed systems aim for timely, economically rational liquidations that keep the protocol solvent while limiting unnecessary user losses.

---

#### Market Impact and Cascades

Liquidations produce concentrated order flow. When many positions rely on the same collateral or reference prices, a price move can push a cluster of accounts into distress. Liquidators then sell collateral into the market, contributing to further downward pressure, which can in turn push more positions across their thresholds.

These cascades link lending markets, spot markets, and perps. Even if each protocol is individually solvent, combined liquidation flows can move prices sharply, stress liquidity, and cause systemic episodes. Modelling these cascades requires understanding leverage distribution, correlation of positions, and depth across venues.

---

#### Incentive Design and Edge Cases

Liquidation incentives must be strong enough to motivate participants to monitor and act, but not so generous as to encourage predatory behaviour or inefficient design. Edge cases include:

- Sandwiching users near thresholds through MEV and front-running.  
- Liquidations in thin markets where collateral cannot be sold at assumed prices.  
- Interactions with circuit breakers, pause switches, or oracle outages.  

Stress testing liquidation behaviour under extreme but plausible price paths and liquidity conditions reveals where incentives or parameters may fail.

---

#### See Also

* [Lending Architecture](/protocols/lending-architecture) – Where liquidation logic lives in lending protocols  
* [Perpetual Futures](/building-blocks/perpetual-futures) – Margin and liquidation in derivative venues  
* [Risk Types](/risk/types) – Market, liquidity, and operational risk around liquidations  
* [Simulation – Liquidations](/simulation/liquidations) – Scenario analysis of liquidation cascades

### Lending Architecture

> info **Metadata** Level: Advanced | Prerequisites: Lending & Borrowing, Oracles, Risk Types | Tags: lending, protocol-design, risk-engine, interest-rates, collateral, liquidation

Lending Architecture describes how lending protocols are built internally. It focuses on account structures, interest rate models, collateral management, liquidation mechanisms, and governance levers. The aim is to treat a lending protocol as a collection of state variables and update rules that define a dynamic system.

Most designs follow a pool-based model, but the details of accounting, oracle integration, and risk parameterisation vary. These details strongly influence resilience, capital efficiency, and failure modes.

---

#### Core Components

Key components of a typical lending architecture include:

- Asset pools and their accounting, often using interest-bearing tokens whose exchange rate increases over time.  
- User account structures that track supplied assets, borrowed amounts, and collateral configuration.  
- A risk engine that aggregates positions into health indicators and determines eligibility for borrowing or liquidation.  
- Oracle integrations that provide asset prices in a consistent unit, usually a major stablecoin.  

Design choices around precision, rounding, and accrual frequency in these components have financial implications.

---

#### Interest Accrual and Rate Curves

Interest accrues continuously or in discrete updates based on utilisation-driven rate curves. Internally, this often appears as an index factor that multiplies underlying balances. When a rate changes, future growth of this index adjusts accordingly, while current balances remain coherent.

Rate curves must balance three objectives: reflect demand for borrowing and supply of lending, protect liquidity in extreme conditions, and remain predictable enough for users to reason about costs. Kinked curves that sharply increase rates beyond a target utilisation are common, providing a backstop to prevent pools from becoming fully drained.

---

#### Collateral Configuration and Risk Engine

Collateral configuration encodes which assets can back which borrows and at what ratios. Some designs use isolated pools, where risky collateral types are sandboxed. Others use cross-collateral portfolios, allowing a basket of assets to back multiple borrows.

The risk engine combines these parameters with price data to compute health factors. Implementation details matter: how often prices are refreshed, how quickly extreme moves propagate into health calculations, and whether buffers or hysteresis are used to avoid thrashing around thresholds.

---

#### Liquidation Flow and Incentives

Liquidation architecture governs how unhealthy positions are closed and how liquidators are rewarded. A typical flow allows third parties to repay a portion of a borrower's debt at a discount and seize collateral in return. Parameters such as liquidation bonus, close factor, and auction mechanics influence both robustness and potential for abuse.

Some systems use auctions to discover clearing prices for collateral, while others rely on fixed discount models. The interaction between oracle speed, liquidity depth, and liquidation incentives is critical. Poorly tuned systems can either fail to liquidate in time or encourage overly aggressive behaviour that harms users and destabilises markets.

---

#### Governance, Upgrades, and Safety

Governance sets and can change risk parameters, add or remove collateral types, and upgrade protocol logic. Architecture must account for these powers through timelocks, multi-step upgrades, and emergency controls. Misconfigured parameters or rushed upgrades are frequent sources of risk.

Formal verification, audits, circuit breakers, and conservative defaults serve as partial mitigations. From a research and monitoring viewpoint, tracking parameter changes and simulating their effects is as important as analysing static states.

---

#### See Also

* [Lending & Borrowing](/building-blocks/lending-borrowing) – User-facing behaviour of lending markets  
* [Liquidations](/building-blocks/liquidations) – Detailed liquidation mechanics  
* [Oracles](/building-blocks/oracles) – Price inputs feeding the risk engine  
* [Risk Types](/risk/types) – How architectural choices map into risk categories

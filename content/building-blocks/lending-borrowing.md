### Lending & Borrowing

> info **Metadata** Level: All | Prerequisites: Stablecoins, Tokens 101 | Tags: lending, borrowing, collateral, interest-rates, leverage, defi

Lending and borrowing protocols form the core credit layer of DeFi. They accept assets as collateral, issue claims against that collateral, and manage interest rates and liquidations according to programmatic rules. Most mainstream designs are overcollateralised, avoiding traditional credit underwriting in favour of transparent collateral constraints and algorithmic pricing.

From a user perspective, the protocol resembles a pool-based money market. Lenders supply assets and receive interest-bearing tokens. Borrowers lock collateral and draw credit in supported assets up to a borrowing limit. Behind these actions lies a risk engine that tracks health factors and triggers liquidations when necessary.

---

#### Pool-Based Money Markets

Many protocols organise lending as shared pools per asset. Depositors transfer assets into a pool and receive a claim token that grows in value over time as interest accrues. Borrowers draw assets from these pools, paying interest that is distributed among lenders after any protocol fees.

This structure allows continuous entry and exit without matching individual lenders and borrowers directly. It also concentrates risk and liquidity at the protocol level, which can be quantified by utilisation, concentration of collateral types, and distribution of borrows.

---

#### Collateral, LTV, and Health Factors

Borrowing capacity is determined by collateral posted and its risk parameters. Each collateral type is assigned values such as maximum loan-to-value ratio and liquidation threshold. The protocol aggregates collateral positions into a health factor or similar metric, measuring distance to liquidation.

Collateral is marked to market using oracles. Changes in prices update borrowing capacity in real time. If the value of collateral falls or borrowed amounts increase (for example, due to accumulated interest), a position can cross its liquidation threshold. This mapping from prices to health factors links lending markets to spot and derivatives markets.

---

#### Interest Rate Models

Interest rates are typically set algorithmically as a function of pool utilisation, defined as the ratio of total borrowed to total supplied. Low utilisation corresponds to abundant liquidity and low rates; high utilisation signals scarcity and triggers higher rates to attract supply and discourage further borrowing.

Different curves can be used, such as simple piecewise linear models with kink points, or more complex shapes incorporating volatility or historical behaviour. Rate models affect both protocol stability and competitiveness: overly aggressive curves can cause sudden spikes that destabilise positions; overly flat curves can misprice risk.

---

#### Use Cases and Position Types

On top of these primitives, a variety of position types appear:

- Simple lenders seeking passive yield.  
- Leverage seekers borrowing stablecoins against volatile collateral to increase exposure.  
- Carry trades that borrow low-yielding assets to lend high-yielding ones.  
- Complex strategies that loop collateral and borrows to amplify exposure.  

Each configuration embeds specific risks. Leveraged collateral positions, for example, become highly sensitive to price moves and can trigger liquidation cascades.

---

#### See Also

* [Lending Architecture](/protocols/lending-architecture) – Internal design of lending protocols  
* [Liquidations](/building-blocks/liquidations) – Mechanics of closing unhealthy positions  
* [Perpetual Futures](/building-blocks/perpetual-futures) – Margin and leverage outside money markets  
* [Risk Types](/risk/types) – Credit and market risk in lending systems

### Where People Lose Money in DeFi

> info **Metadata** Level: Beginner | Prerequisites: Common DeFi Use Cases | Tags: [risk, loss, pitfalls]

DeFi creates new possibilities, but the ways people lose money are often surprisingly repeatable. This page is not here to scare you; it is here so you recognise patterns before you step into them.

---

#### 1. Price Moves and Leverage

The straightforward one:

* You buy an asset, its price falls, you lose money.
* You borrow against an asset, its price falls enough, you are liquidated.

Leverage exaggerates this:

* With 3x exposure, a 30% drop can wipe out a large fraction of your equity.
* On some protocols, price moves do not need to be extreme for liquidation to trigger.

Common trap: **"I'll just borrow a bit more; I'll manage the position."**

Then life gets busy, and markets move faster than you react.

---

#### 2. Impermanent Loss for Liquidity Providers

Providing liquidity sounds attractive:

* Earn fees on every trade.
* Asset exposure on both sides of a pair.

But:

* If the price of one asset moves relative to the other, your share of each changes.
* Compared to simply holding the two assets, you can end up with less value.
* This difference is called **impermanent loss** (though it can become quite permanent).

People lose money when:

* They enter a pool without understanding how price paths affect their position.
* Fees are not high enough or volume not sustained enough to offset this effect.
* They choose volatile pairs or focus only on headline APYs.

---

#### 3. Smart Contract and Protocol Bugs

DeFi runs on code. That code can contain:

* Logic bugs
* Math errors
* Misconfigured parameters
* Upgrade paths that introduce new vulnerabilities

Losses can happen through:

* Exploits that drain pools or vaults.
* Bugs that lock funds accidentally.
* Governance attacks that change rules unexpectedly.

Audits and formal methods help but are not guarantees. Every interaction with a contract is, in part, a bet on its correctness and security.

---

#### 4. Stablecoin Depegs

Stablecoins aim to track a reference value (usually 1 unit of fiat). They can break:

* Collateral backing becomes insufficient or illiquid.
* Market confidence evaporates.
* Peg mechanisms (especially algorithmic ones) fail under stress.

Loss patterns:

* Holding a "stable" asset that suddenly trades at a discount.
* Providing liquidity in a stablecoin pool that depegs.
* Using a volatile or weakly-backed stablecoin as collateral for loans.

Not all stablecoins are alike. Understanding their designs is part of risk assessment.

---

#### 5. Oracle and Liquidity Risks

Many protocols rely on external price feeds (oracles):

* If an oracle is manipulated or lags during volatility, it can misprice assets.
* Attackers can profit from these mispricings via loans, liquidations, or swaps.

Similarly, thin liquidity makes systems fragile:

* Large trades move price significantly.
* It becomes easier to push prices around in small windows of time.
* Protocols that assume deep markets can break when those markets dry up.

Losses here often appear as:

* Unexpected liquidations at "impossible" prices.
* Collateral suddenly valued far below expectations.
* Protocols pausing or failing due to liquidity stress.

---

#### 6. Slippage, Fees, and MEV

Even without bugs or depegs, execution details can erode returns:

* **Slippage**: receiving worse prices than quoted, especially on large trades.
* **Fees**: swap fees, gas fees, protocol fees, management fees all stacking.
* **MEV (Miner/Maximal Extractable Value)**: others reorder or sandwich your transactions to capture value at your expense.

Example:

* You backtest a strategy with mid-market prices and no transaction costs.
* On-chain, every trade incurs slippage and gas.
* MEV bots may front-run or sandwich large orders.

The result: a strategy that looked profitable in theory becomes marginal or unprofitable in practice.

---

#### 7. Composability Cascades

One of DeFi's strengths is **composability**: protocols building on each other. That is also a source of systemic risk.

Consider:

* A vault strategy that deposits into a lending protocol.
* That protocol uses a certain stablecoin as collateral.
* That stablecoin relies on a different protocol for backing.

If any link in this chain fails:

* Losses propagate.
* Yields vanish or invert.
* Rehypothecated positions unwind under stress.

Users often underestimate how many layers their "simple" strategy actually involves.

---

#### 8. Operational Mistakes

Not all losses are market or protocol failures. Some are human:

* Sending funds to the wrong address.
* Signing a malicious transaction in a phishing interface.
* Approving a contract to spend unlimited amounts of a token.
* Mis-typing an amount or chain.

Because transactions are hard to reverse, these mistakes can be final. Basic operational hygiene—verifying URLs, using hardware wallets, double-checking addresses—matters as much as math.

---

#### 9. Following Numbers Without Context

Finally, a quiet but common source of loss: **Chasing the highest APY or newest narrative without understanding the mechanism.**

Signs:

* Joining a pool because yields look high, without asking where they come from.
* Copying a strategy because someone posted a strong backtest curve.
* Using formulas (like Kelly or Sharpe) without understanding their assumptions.

The pattern is not "people are careless"; the pattern is "systems are complex and promotional messages are simple". Slowing down, reading underlying docs, and asking uncomfortable questions is a protective habit.

---

#### What to Do With This

Use this list as a checklist whenever you engage with a new protocol or strategy:

* Where is price risk?
* Where is leverage and liquidation risk?
* Where is smart-contract and protocol risk?
* Where is oracle and liquidity risk?
* How do execution, fees, and MEV affect outcomes?
* How many layers of composability are involved?
* What operational mistakes would be costly here?

The goal is not to avoid all risk (that is rarely possible) but to know what you are actually betting on.

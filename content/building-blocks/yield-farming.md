### Yield Farming

> info **Metadata** Level: Intermediate | Prerequisites: Liquidity Pools, Tokenomics | Tags: incentives, emissions, lp-rewards, governance

Yield farming refers to protocols that distribute tokens (often governance tokens) to users who provide liquidity, stake assets, or engage in other productive activities. These programs aim to bootstrap liquidity, align incentives, and distribute protocol ownership. From a user's perspective, yield farming can generate returns well above market rates, but it also introduces risks tied to token price volatility, smart-contract exploits, and the sustainability of emission schedules.

Understanding the mechanics of emission curves, dilution, and how incentives shape user behaviour is essential for both protocol designers and participants evaluating whether a yield opportunity is attractive or merely a short-term subsidy.

---

#### Emission Schedules and Dilution

Most yield programs issue tokens according to a schedule defined by time or activity. A common pattern is to emit E<sub>t</sub> tokens per block or per epoch, distributed pro-rata to participants based on their share of the pool. If a user provides fraction f<sub>t</sub> of the total liquidity, they receive:

```formula
e<sub>t</sub> = E<sub>t</sub> · f<sub>t</sub>
```

tokens in that period. The value of these tokens depends on their market price and total supply. If emissions are high and supply grows rapidly, dilution reduces the price per token, offsetting the nominal yield.

Emission schedules often start high to attract early participants and decay over time (exponentially, linearly, or step-wise). This creates a race to farm early and exit before dilution erodes returns. The sustainability of a program depends on whether the protocol generates enough value (fees, usage, network effects) to justify the token price as emissions taper off.

---

#### APR, APY, and Real vs Nominal Returns

Advertised yields are typically expressed as annualised percentage rates (APR) or yields (APY). APR calculates returns assuming no compounding; APY accounts for reinvestment. Both are projections based on current prices and emission rates, which can change rapidly.

Real returns must account for:
- Impermanent loss or rebalancing effects if farming involves LP positions
- Token price decay due to dilution or selling pressure
- Gas costs for claiming, compounding, or rebalancing
- Smart-contract risk and potential for exploits or rug pulls

A 1000% APY may be attractive on paper, but if the token loses 90% of its value over the farming period or if the position suffers significant impermanent loss, the realised return can be negative. Evaluating yield opportunities requires stress-testing assumptions and understanding the source of the yield.

---

#### Liquidity Mining and Protocol Goals

Liquidity mining is a subset of yield farming focused on incentivising LP deposits in specific pools. Protocols use this to:
- Bootstrap liquidity for new tokens or pairs with low natural demand
- Compete with other protocols for liquidity in established pairs
- Distribute governance tokens to align LPs with long-term protocol success

The effectiveness of a mining program depends on whether it attracts sticky liquidity (users who stay after incentives end) or mercenary capital (users who farm, dump, and leave). Design choices like vesting schedules, lock-up periods, and bonus multipliers for long-term participants attempt to filter for committed users.

From a game-theoretic perspective, yield farming is a coordination problem: if everyone believes others will dump the token, the price collapses and the program fails; if participants believe in long-term value, the token retains value and the program succeeds. Mechanism design and narrative matter as much as raw emission rates.

---

#### Governance, Voting, and Meta-Incentives

Many yield tokens also function as governance tokens, granting voting power over protocol parameters, fee splits, and upgrade paths. This introduces a second layer of incentives: users farm not only for yield but for influence. Protocols like Curve have leveraged this by creating vote-locking mechanisms (veCRV) where users lock tokens for extended periods in exchange for boosted rewards and governance weight.

This dynamic creates meta-games where large holders or DAOs compete to accumulate voting power, sometimes bribing other voters (vote markets) to direct emissions toward their preferred pools. The interplay between emissions, governance, and vote markets can dominate protocol economics and shift liquidity in unexpected ways.

---

#### Risks and Failure Modes

Yield farming carries multiple risk vectors:
- **Smart-contract risk**: Bugs, exploits, or admin keys that allow funds to be drained
- **Token risk**: Price collapse due to dilution, lack of demand, or coordinated dumps
- **Regulatory risk**: Unclear legal status of farming rewards in many jurisdictions
- **Composability risk**: Farming often involves staking LP tokens in secondary contracts; failures in any layer can cascade

Historical examples include protocols that launched with high APYs but failed to generate revenue, leading to token death spirals; exploits where attackers drained farming contracts; and regulatory actions that forced programs to shut down.

Due diligence requires auditing contracts, understanding tokenomics, evaluating the team and governance structure, and sizing positions relative to risk tolerance.

---

#### See Also

* [Liquidity Pools](/building-blocks/liquidity-pools) – LP mechanics and fee accrual
* [Tokenomics](/building-blocks/tokenomics) – Supply, inflation, and value capture
* [Risk Types](/building-blocks/risk-types) – Categorising and measuring DeFi risks

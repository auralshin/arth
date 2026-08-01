### Protocol Archetypes

> info **Metadata** Level: Intermediate | Prerequisites: What Is DeFi, Tokens 101 | Tags: reference, defi, protocols, archetypes, mechanism-design, risk

On-chain finance has produced fewer genuinely distinct designs than the number of deployed protocols suggests. Almost every application is a variation on a dozen or so archetypes: an invariant that prices trades, a pool that lends against collateral, a mechanism that holds a peg, a feed that reports a price, a bridge that moves value across chains.

This page catalogues those archetypes: what each type of system does, the mechanism that makes it work, and the risk that mechanism creates. Learning the archetype is far more durable than learning any individual deployment, because the archetype is what determines how the thing breaks.

> info **Archetypes versus named protocols** This page covers *designs*. For an A–Z of specific named protocols and which archetype each belongs to, see the [Protocol Index](/reference/protocol-index).

---

#### Trading Venues

<table>
  <tbody>
    <tr>
      <td><strong>Archetype</strong></td>
      <td><strong>What it does</strong></td>
      <td><strong>Key mechanism</strong></td>
      <td><strong>Main risk</strong></td>
    </tr>
    <tr>
      <td>Constant-product AMM</td>
      <td>Quotes a price for any size from pooled reserves, with no counterparty needed</td>
      <td>The product of reserves is held fixed across a trade, so price moves along a hyperbola</td>
      <td>Liquidity providers are systematically on the wrong side of every price move</td>
    </tr>
    <tr>
      <td>Stable-asset AMM</td>
      <td>Trades assets expected to hold a common value at very low slippage</td>
      <td>An invariant that behaves like a constant sum near parity and like a constant product away from it</td>
      <td>The flat region becomes a trap once the assets genuinely diverge</td>
    </tr>
    <tr>
      <td>Weighted-pool AMM</td>
      <td>Holds a target portfolio and lets arbitrageurs rebalance it</td>
      <td>A weighted geometric mean of reserves is held constant, giving fixed value weights</td>
      <td>Weighting choices change the loss profile without changing the headline fee</td>
    </tr>
    <tr>
      <td>Concentrated-liquidity AMM</td>
      <td>Lets providers place liquidity only over a chosen price range</td>
      <td>Virtual reserves and tick boundaries make each range behave like a small constant-product pool</td>
      <td>Capital efficiency and inventory risk rise together; out-of-range positions earn nothing</td>
    </tr>
    <tr>
      <td>On-chain order book</td>
      <td>Matches resting limit orders by price and time priority</td>
      <td>An order book maintained in contract state or on an application-specific chain</td>
      <td>Cost and latency of placing and cancelling orders shape who can quote</td>
    </tr>
    <tr>
      <td>Aggregator and router</td>
      <td>Splits a trade across venues to minimise total execution cost</td>
      <td>An optimisation over pool depths, fees, gas, and route length</td>
      <td>Routing decisions leak intent, and quoted routes can be stale by execution</td>
    </tr>
    <tr>
      <td>Batch auction and intent venue</td>
      <td>Clears many orders together at a uniform price rather than continuously</td>
      <td>Solvers compete to propose the settlement that best serves the batch</td>
      <td>Removes ordering advantage inside the batch but concentrates trust in solvers</td>
    </tr>
  </tbody>
</table>

Pages: [AMMs 101](/building-blocks/amms-101), [AMMs In Depth](/protocols/amms-depth), [Concentrated Liquidity](/protocols/concentrated-liquidity), [Swaps & DEXs](/building-blocks/swaps-dexs), [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms).

> warning **Every passive AMM position is short volatility** The pool sells the asset that is rising and buys the one that is falling. Fees are the premium paid for that exposure, and whether they cover it is an empirical question, not a design guarantee. See [Impermanent Loss](/building-blocks/impermanent-loss).

---

#### Credit Markets

<table>
  <tbody>
    <tr>
      <td><strong>Archetype</strong></td>
      <td><strong>What it does</strong></td>
      <td><strong>Key mechanism</strong></td>
      <td><strong>Main risk</strong></td>
    </tr>
    <tr>
      <td>Pooled lending market</td>
      <td>Lets anyone supply an asset and anyone borrow it against collateral</td>
      <td>A shared pool with an interest rate curve driven by utilisation</td>
      <td>Every listed asset shares risk with every other; one bad listing can impair the pool</td>
    </tr>
    <tr>
      <td>Isolated lending market</td>
      <td>Confines each collateral and debt pair to its own market</td>
      <td>Per-market parameters and separate accounting, so losses do not spread</td>
      <td>Liquidity fragments across markets, and each needs its own risk parameters</td>
    </tr>
    <tr>
      <td>Fixed-rate lending</td>
      <td>Offers a known rate to a known maturity rather than a floating one</td>
      <td>Tokenised claims on principal and interest that trade at a discount</td>
      <td>Rate certainty is bought with liquidity and maturity mismatch</td>
    </tr>
    <tr>
      <td>Flash loan</td>
      <td>Lends without collateral inside a single transaction</td>
      <td>Atomicity: the transaction reverts unless the loan is repaid within it</td>
      <td>Removes the capital barrier to any attack that is profitable atomically</td>
    </tr>
    <tr>
      <td>Liquidation engine</td>
      <td>Closes undercollateralised positions before the pool takes a loss</td>
      <td>A bonus paid to whoever repays the debt and claims the collateral</td>
      <td>In a fast move, liquidations become the move, and the bonus is paid out of a falling asset</td>
    </tr>
  </tbody>
</table>

Pages: [Lending & Borrowing](/building-blocks/lending-borrowing), [Lending Architecture](/protocols/lending-architecture), [Liquidations](/building-blocks/liquidations), [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation).

---

#### Stablecoin Mechanisms

<table>
  <tbody>
    <tr>
      <td><strong>Archetype</strong></td>
      <td><strong>What it does</strong></td>
      <td><strong>Key mechanism</strong></td>
      <td><strong>Main risk</strong></td>
    </tr>
    <tr>
      <td>Fiat-backed</td>
      <td>Issues tokens against reserves held off-chain</td>
      <td>Redemption at par by authorised parties keeps the market price close to the peg</td>
      <td>Custodial and legal risk; redemption may be restricted exactly when it matters</td>
    </tr>
    <tr>
      <td>Overcollateralised CDP</td>
      <td>Mints a stable unit against crypto collateral locked in a vault</td>
      <td>A collateral ratio well above one, enforced by liquidation</td>
      <td>Capital inefficiency in calm markets, cascading liquidations in violent ones</td>
    </tr>
    <tr>
      <td>Algorithmic and reflexive</td>
      <td>Attempts a peg with little or no exogenous collateral</td>
      <td>Mint-and-burn arbitrage against a companion token whose value depends on demand for the stable unit</td>
      <td>The support asset and the peg fail together; the design is reflexive by construction</td>
    </tr>
    <tr>
      <td>Delta-neutral synthetic</td>
      <td>Holds crypto collateral and hedges its price risk with derivatives</td>
      <td>Long spot plus short perpetual, so net price exposure is near zero and funding accrues</td>
      <td>Funding can turn negative, and the hedge depends on venue solvency and margin availability</td>
    </tr>
    <tr>
      <td>Yield-bearing wrapper</td>
      <td>Passes protocol or reserve income to holders of a staked version of the token</td>
      <td>A share token whose exchange rate against the base token grows over time</td>
      <td>The yield source is a separate risk from the peg, and holders often conflate the two</td>
    </tr>
  </tbody>
</table>

Pages: [Stablecoins](/building-blocks/stablecoins), [Stablecoin Designs](/protocols/stablecoin-designs), [Tokens 101](/building-blocks/tokens-101).

---

#### Perpetual and Derivatives Venues

<table>
  <tbody>
    <tr>
      <td><strong>Archetype</strong></td>
      <td><strong>What it does</strong></td>
      <td><strong>Key mechanism</strong></td>
      <td><strong>Main risk</strong></td>
    </tr>
    <tr>
      <td>Order-book perpetual venue</td>
      <td>Runs a matching engine for perpetual contracts</td>
      <td>Central limit order book, with funding payments tying the mark to an index</td>
      <td>Performance requirements push matching off-chain or onto a dedicated chain, changing the trust model</td>
    </tr>
    <tr>
      <td>Pool-backed perpetual venue</td>
      <td>Lets traders take positions against a shared liquidity pool</td>
      <td>The pool is the counterparty; prices come from an oracle rather than from a book</td>
      <td>Liquidity providers are short the aggregate trader position, and stale oracles can be picked off</td>
    </tr>
    <tr>
      <td>Virtual AMM (vAMM)</td>
      <td>Prices perpetuals from a synthetic invariant with no real reserves</td>
      <td>A constant-product curve over virtual balances, with margin held separately</td>
      <td>The curve parameters, not real liquidity, set slippage, so depth can be illusory</td>
    </tr>
    <tr>
      <td>Pooled-collateral synthetics</td>
      <td>Issues synthetic exposure backed by a shared collateral pool</td>
      <td>Stakers collectively take the other side of every synthetic position</td>
      <td>Debt is mutualised: one crowded trade is everyone's loss</td>
    </tr>
    <tr>
      <td>On-chain options</td>
      <td>Writes and settles option contracts on-chain</td>
      <td>Collateral locked against the payoff, priced from a model or a pool</td>
      <td>Pricing and hedging depend on volatility inputs that on-chain venues rarely have</td>
    </tr>
  </tbody>
</table>

Pages: [Perpetual Futures](/building-blocks/perpetual-futures), [Perp DEX](/protocols/perp-dex), [Derivatives](/building-blocks/derivatives), [Funding Rate as a Signal](/signals/funding-rate).

---

#### Oracles

<table>
  <tbody>
    <tr>
      <td><strong>Archetype</strong></td>
      <td><strong>What it does</strong></td>
      <td><strong>Key mechanism</strong></td>
      <td><strong>Main risk</strong></td>
    </tr>
    <tr>
      <td>Reporter network, push model</td>
      <td>Publishes prices on-chain on a schedule or on a deviation threshold</td>
      <td>Independent reporters submit values; the contract aggregates them, usually by median</td>
      <td>Update latency is a hard floor on how stale a protocol's view of price can be</td>
    </tr>
    <tr>
      <td>First-party feed, pull model</td>
      <td>Lets the consumer fetch and verify a signed price at the moment it is needed</td>
      <td>Publishers sign updates off-chain; the consumer submits one with its transaction</td>
      <td>Shifts liveness to the consumer and creates a selection problem over which update to submit</td>
    </tr>
    <tr>
      <td>On-chain TWAP</td>
      <td>Derives a price from the venue's own trading history</td>
      <td>A time-weighted average of observed pool prices over a window</td>
      <td>Manipulable at cost proportional to window length and pool depth; slow by design</td>
    </tr>
    <tr>
      <td>Optimistic oracle</td>
      <td>Answers arbitrary questions with a dispute window rather than continuous reporting</td>
      <td>A proposed answer stands unless challenged and escalated within the window</td>
      <td>Unsuitable for anything needing a fast answer; security rests on the dispute economics</td>
    </tr>
  </tbody>
</table>

Pages: [Oracles](/building-blocks/oracles), [Oracle Designs](/protocols/oracle-designs), [Oracle Manipulation and Thin Liquidity](/risk/oracle-manipulation).

> warning **Oracle choice is a risk decision, not an integration detail** Every collateralised protocol inherits the manipulation cost, update latency, and liveness assumptions of its price source. See [Oracle Designs](/protocols/oracle-designs).

---

#### Cross-Chain

<table>
  <tbody>
    <tr>
      <td><strong>Archetype</strong></td>
      <td><strong>What it does</strong></td>
      <td><strong>Key mechanism</strong></td>
      <td><strong>Main risk</strong></td>
    </tr>
    <tr>
      <td>Lock-and-mint bridge</td>
      <td>Represents an asset on a second chain while the original is held on the first</td>
      <td>A custodian or validator set attests to the deposit and authorises minting</td>
      <td>The entire supply of the wrapped asset depends on one attestation set</td>
    </tr>
    <tr>
      <td>Liquidity network bridge</td>
      <td>Delivers the asset on the destination chain from a local pool, then rebalances</td>
      <td>Relayers front the funds and are reimbursed once the source event is confirmed</td>
      <td>Capacity is bounded by pool depth, and rebalancing costs are passed to users</td>
    </tr>
    <tr>
      <td>Native verification bridge</td>
      <td>Verifies the source chain's consensus directly on the destination</td>
      <td>A light client or validity proof, so no external attestation is required</td>
      <td>Expensive and chain-specific; correctness rests on the proof system and its implementation</td>
    </tr>
    <tr>
      <td>Generic messaging layer</td>
      <td>Passes arbitrary messages, not only asset transfers</td>
      <td>A configurable verification stack chosen by the application</td>
      <td>The security of the message equals the weakest configured verifier</td>
    </tr>
  </tbody>
</table>

Pages: [Bridges (Primitives)](/building-blocks/bridges), [Bridges & Cross-Chain](/protocols/bridges), [On-Chain vs Off-Chain](/microstructure/onchain-offchain).

---

#### Staking, Restaking, and Yield

<table>
  <tbody>
    <tr>
      <td><strong>Archetype</strong></td>
      <td><strong>What it does</strong></td>
      <td><strong>Key mechanism</strong></td>
      <td><strong>Main risk</strong></td>
    </tr>
    <tr>
      <td>Liquid staking</td>
      <td>Turns bonded stake into a transferable, yield-bearing token</td>
      <td>A share token whose redemption value accrues staking rewards</td>
      <td>The token can trade below its redemption value when exit queues are long</td>
    </tr>
    <tr>
      <td>Restaking and shared security</td>
      <td>Reuses staked capital to secure additional services</td>
      <td>Opt-in slashing conditions layered on top of the base protocol's stake</td>
      <td>Correlated slashing across services, and yields that price risk poorly</td>
    </tr>
    <tr>
      <td>Yield aggregator or vault</td>
      <td>Automates a strategy on behalf of depositors</td>
      <td>A share token over a strategy contract that harvests and compounds</td>
      <td>Depositors inherit every dependency of the strategy, usually without seeing them</td>
    </tr>
    <tr>
      <td>Yield tokenisation</td>
      <td>Separates a yield-bearing asset into principal and yield claims</td>
      <td>Two tokens that recombine into the original at maturity</td>
      <td>The yield token is a leveraged view on a rate, and is often traded as if it were not</td>
    </tr>
    <tr>
      <td>Emissions programme</td>
      <td>Pays protocol tokens to attract liquidity or borrowing</td>
      <td>Scheduled distribution proportional to a measured contribution</td>
      <td>The return is denominated in an asset whose price depends on the programme continuing</td>
    </tr>
  </tbody>
</table>

Pages: [Staking & Restaking](/protocols/staking-restaking), [Yield Farming](/building-blocks/yield-farming), [Tokenomics](/building-blocks/tokenomics), [Simple Yield Farming](/strategies/yield-farming).

---

#### Governance and Ordering Infrastructure

<table>
  <tbody>
    <tr>
      <td><strong>Archetype</strong></td>
      <td><strong>What it does</strong></td>
      <td><strong>Key mechanism</strong></td>
      <td><strong>Main risk</strong></td>
    </tr>
    <tr>
      <td>Token governance</td>
      <td>Lets holders set protocol parameters and authorise upgrades</td>
      <td>Weighted voting, usually with a timelock between approval and execution</td>
      <td>Voting power concentrates, and parameter control is often equivalent to fund control</td>
    </tr>
    <tr>
      <td>Vote-escrow governance</td>
      <td>Weights votes by how long tokens are locked</td>
      <td>Longer locks grant more voting power and often more reward share</td>
      <td>Creates a market in votes, which shifts emissions towards whoever pays most for them</td>
    </tr>
    <tr>
      <td>Block-building marketplace</td>
      <td>Separates who proposes a block from who assembles its contents</td>
      <td>Builders bid for the right to have their block included; relays mediate</td>
      <td>Concentration among builders and relays becomes a censorship and ordering chokepoint</td>
    </tr>
    <tr>
      <td>Private order flow channel</td>
      <td>Routes transactions to builders without exposing them in the public mempool</td>
      <td>Direct submission, so sandwich strategies cannot see the transaction in advance</td>
      <td>Protection depends on the recipient's honesty and on flow not being resold</td>
    </tr>
  </tbody>
</table>

Pages: [Governance](/building-blocks/governance), [MEV Overview](/building-blocks/mev-overview), [How Blocks Form](/transaction-ordering-mev/how-blocks-form), [Mitigation & Defenses](/transaction-ordering-mev/mitigation-and-defenses).

---

#### Reading a Protocol Design

Whatever the archetype, the same handful of questions determine the risk you are taking. Ask them in this order.

- **Where does the price come from?** An oracle, a pool, an order book, or a governance parameter. Each has a different manipulation cost and a different staleness profile.
- **Who is the counterparty?** A pool of passive depositors, an active market maker, or the protocol's own balance sheet. Passive depositors rarely price their exposure correctly.
- **What happens when collateral falls faster than liquidators can act?** Every collateralised system has a speed at which its liquidation engine stops working, and that speed is rarely documented.
- **What can governance change, and how quickly?** A timelock is the difference between a parameter and a key. Check the delay and who can bypass it.
- **What is the dependency graph?** Most protocols compose: a vault on a lending market on an oracle on a DEX. Contagion travels along that graph.
- **Is the yield organic or emitted?** Fee income and token emissions look identical in an annual percentage figure and behave completely differently.

> warning **Composability makes the failure surface the union of every dependency** A position can be fully solvent on its own terms and still be liquidated because something three layers down reported a stale price. See [Types of Risk](/risk/types) and [Smart Contract and Protocol Risk Overview](/risk/smart-contract).

---

#### See Also

* [Protocol Index](/reference/protocol-index)
* [AMMs In Depth](/protocols/amms-depth)
* [Lending Architecture](/protocols/lending-architecture)
* [Stablecoin Designs](/protocols/stablecoin-designs)
* [Oracle Designs](/protocols/oracle-designs)
* [Glossary](/reference/glossary)

---

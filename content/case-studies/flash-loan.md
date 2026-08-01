### Flash Loans: Mechanics and Attack Patterns

> info **Metadata** Level: Advanced | Prerequisites: AMMs, Lending Protocols, Oracles | Tags: case-study, flash-loans, oracle-manipulation, mev, atomicity, defi-risk

A **flash loan** lends an arbitrary amount with no collateral, on one condition: the loan must be repaid within the same transaction. The lending contract sends the funds, calls back into the borrower's code, and then checks its own balance. If the balance is short, the entire transaction reverts and it is as though nothing happened.

This is not a credit product. It is a consequence of atomicity — the property that a transaction either fully executes or fully does not. Flash loans matter for quantitative work because they sever the link between capital and market power. Any operation that is profitable at size, and completes within one transaction, becomes available to someone with no capital at all.

> info **A constructed example** Both worked examples below are invented to show the mechanics. The second is a generic mechanism sketch, not a description of any specific incident, protocol, or attacker.

---

#### Setup: What Atomicity Buys

```text
1. borrower calls flashLoan(amount)
2. lender transfers amount to borrower
3. lender calls back into borrower's code
4. borrower does arbitrary work with the funds
5. borrower returns amount + fee
6. lender checks its balance
   - sufficient: transaction commits
   - insufficient: the entire transaction reverts
```

Two properties follow. First, the lender takes no credit risk, because a failed repayment un-happens the loan. Second, the borrower takes no *market* risk on the borrowed principal, because a loss-making path can simply be made to revert — although the gas is still paid.

<table>
  <tbody>
    <tr><td><strong>Use</strong></td><td><strong>What atomicity provides</strong></td></tr>
    <tr><td>Cross-venue arbitrage</td><td>Size without capital, and no inventory risk between legs</td></tr>
    <tr><td>Collateral swap</td><td>Repay a loan, swap collateral, re-borrow, all without unwinding first</td></tr>
    <tr><td>Debt refinancing</td><td>Move a position between lending markets in one step</td></tr>
    <tr><td>Liquidating a large position</td><td>Repay debt, seize collateral, sell it, repay the flash loan</td></tr>
    <tr><td>Self-liquidation</td><td>Close an unhealthy position without depositing more collateral</td></tr>
    <tr><td>Price manipulation</td><td>Temporary market power over any price derived from a single venue</td></tr>
  </tbody>
</table>

---

#### The Arithmetic: A Legitimate Arbitrage

A token trades at 100.00 on venue A and 100.60 on venue B, a 60 bps gap. Flash-borrow 500,000 of the numeraire at a 5 bps fee, buy on A, sell on B, repay.

<table>
  <tbody>
    <tr><td><strong>Step</strong></td><td><strong>Calculation</strong></td><td><strong>Amount</strong></td></tr>
    <tr><td>Borrow</td><td>—</td><td>500,000.00</td></tr>
    <tr><td>Buy on A at 15 bps of fee and slippage</td><td>500,000 / 100.15</td><td>4,992.5112 units</td></tr>
    <tr><td>Sell on B at 20 bps of fee and slippage</td><td>4,992.5112 x 100.3988</td><td>501,242.14</td></tr>
    <tr><td>Repay principal plus 5 bps fee</td><td>500,000 + 250</td><td>-500,250.00</td></tr>
    <tr><td>Gas</td><td>—</td><td>-40.00</td></tr>
    <tr><td><strong>Net</strong></td><td>—</td><td><strong>952.14</strong></td></tr>
  </tbody>
</table>

Of the 60 bps of headline gap, 19 bps survived. The breakeven gap is `15 + 20 + 5 = 40` bps of execution and financing cost, so any dislocation smaller than that is not a trade. Return on capital is undefined, because no capital was committed — but the 40 of gas is a real, sunk cost paid whether or not the transaction succeeds.

---

#### What Happens: The Shape of a Manipulation Attack

The general pattern has three ingredients: a price that is read from a single venue at a single instant, a venue thin enough to move, and a contract that acts on that price immediately. All three must be present. Removing any one removes the attack.

Consider a lending market that values collateral by reading the spot reserve ratio of one constant-product pool holding 2,000 tokens and 200,000 numeraire, so a price of 100.

```text
1. Attacker deposits 200 tokens as collateral (true value 20,000)
2. Flash-borrow 1,800,000 of the numeraire
3. Swap it into the pool for tokens
4. Read the new pool price
5. Borrow against the collateral at its inflated valuation
6. Swap the tokens back, repay the flash loan
7. Keep the borrowed assets; abandon the collateral
```

The arithmetic of step 3, with a 30 bps pool fee and `x * y = k`:

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Pool before</td><td>2,000 tokens, 200,000 numeraire, price 100.00</td></tr>
    <tr><td>Numeraire in</td><td>1,800,000</td></tr>
    <tr><td>Tokens received</td><td>1,799.4585</td></tr>
    <tr><td>Pool after</td><td>200.5415 tokens, 2,000,000 numeraire</td></tr>
    <tr><td>Spot price after</td><td>9,973.00, a factor of 99.7</td></tr>
    <tr><td>Effective purchase price paid</td><td>1,000.30 per token</td></tr>
  </tbody>
</table>

The lending market now values the 200 deposited tokens at `200 * 9,973 = 1,994,600` and, at a 75% loan-to-value limit, will lend 1,495,950 against them. Reversing the swap returns 1,798,916 of the 1,800,000, and the flash fee is 900:

```text
round_trip_cost = 1,800,000 - 1,798,916 =  1,084
flash_fee       = 1,800,000 * 0.0005    =    900
collateral_forfeited                    = 20,000
extracted       = 1,495,950 - 1,084 - 900 - 20,000 = 1,473,966
```

The manipulation cost under 2,000 in fees. The pool round trip is cheap precisely because the fee is levied in units of the asset whose price was inflated, and most of what the pool retained on the way in comes back on the way out.

> warning **The binding constraint is the depth of the price source, not the attacker's capital** A price read from a pool holding 200,000 of one side can be moved by anyone who can borrow 1,800,000 for a single transaction, which is everyone.

The extraction is capped by what the lending market actually holds and by any borrow caps it enforces — the attack cannot take more than is there. What it destroys is the market's solvency: it is left with 200 tokens worth 20,000 against a debt of 1,495,950.

---

#### How Cheap Is Moving a Constant-Product Price?

For a pool obeying `x * y = k`, adding an amount `dy` to the numeraire reserve multiplies the spot price by a factor that depends only on the ratio of the trade to the reserve. Writing `r = dy / y`:

```text
price_after / price_before = (1 + r)^2
```

In the example, `r = 1,800,000 / 200,000 = 9`, so the price multiple is `(1 + 9)^2 = 100`, which is the 99.7 observed once the swap fee is applied. The relationship inverts to give the cost of a target manipulation:

<table>
  <tbody>
    <tr><td><strong>Desired price multiple</strong></td><td><strong>Required trade, as a multiple of the reserve</strong></td></tr>
    <tr><td>1.5 times</td><td>0.22</td></tr>
    <tr><td>2 times</td><td>0.41</td></tr>
    <tr><td>4 times</td><td>1.00</td></tr>
    <tr><td>25 times</td><td>4.00</td></tr>
    <tr><td>100 times</td><td>9.00</td></tr>
  </tbody>
</table>

The practical reading is that doubling a constant-product price costs only 41% of one side's reserve. A protocol reading spot from a pool holding 200,000 of a side has, in effect, told the world that roughly 83,000 buys a doubling of its collateral valuation — for the length of one transaction, which is all that is needed.

---

#### How to Avoid or Manage It

The defence is never to ban flash loans. Atomicity is a property of the execution environment; a contract that is unsafe with flash loans is unsafe with a well-funded adversary, who differs only in patience.

- **Never price collateral from a single spot source.** A median across independent sources, with staleness checks on each, removes the single point of manipulation. See [Oracle Designs](/protocols/oracle-designs).
- **Use a time-weighted average over multiple blocks.** A price averaged over many blocks cannot be moved inside one transaction, which breaks atomicity as an advantage — the attacker must hold the manipulated price across block boundaries, at real capital risk, against everyone arbitraging them.
- **Size borrowing capacity to the liquidity of the collateral, not to its market capitalisation.** A cap of the form "total borrowable against this asset must not exceed a fraction of the depth available to liquidate it" makes the attack unprofitable by construction.
- **Reject prices that move more than a bound in one update.** A deviation circuit breaker turns a hundred-fold print into a rejected update. The cost is that genuine gaps are also rejected, which is a real trade-off, not a free win.
- **Test with the adversary's budget set to infinity.** Any invariant that holds only because "nobody has that much capital" does not hold. This is the single most useful reframing flash loans force on protocol design.
- **Separate the price used for borrowing from the price used for liquidation.** Conservative valuation for new borrowing and a more responsive price for liquidation limits what a single manipulated reading can unlock.

---

#### Assumptions and Failure Modes

- **The 5 bps flash fee is illustrative.** Fees vary by protocol and some are zero. The conclusions do not depend on the level, because the fee scales with the loan while the extracted value scales with the collateral limit.
- **The example assumes the lending market reads one pool.** Most do not, and the attack correspondingly becomes an attack on whichever component is weakest — a thin leg of a median, a stale feed, or a wrapper's exchange rate.
- **Gas is treated as a fixed 40.** During the congestion that a large manipulation itself causes, gas costs rise sharply, and priority fees paid to get ordered ahead of others can dominate the arithmetic entirely.
- **The attacker is assumed to be included in a block.** Transactions are visible before inclusion, and a profitable public transaction is a target for reordering. This constrains attacks and legitimate arbitrage equally; see [MEV Overview](/building-blocks/mev-overview).
- **Reverting is assumed free apart from gas.** It is not free in an adversarial setting: a reverted attempt reveals the strategy to anyone watching the mempool.
- **The mechanism sketch is deliberately generic.** Real attacks combine several of these steps with protocol-specific quirks — reentrancy, rounding, wrapper exchange rates, or governance timelocks — and no single template captures them.

---

#### See Also

* [MEV Overview](/building-blocks/mev-overview)
* [Oracle Manipulation](/risk/oracle-manipulation)
* [Oracle Designs](/protocols/oracle-designs)
* [Lending and Borrowing](/building-blocks/lending-borrowing)
* [Smart Contract Risk](/risk/smart-contract)
* [Oracle Failure and Cascading Liquidations](/case-studies/oracle-incident)

---

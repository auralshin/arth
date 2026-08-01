### Smart Contract and Protocol Risk Overview

> info **Metadata** Level: Intermediate | Prerequisites: Types of Risk, What On-Chain Means | Tags: risk, smart-contract, protocol-risk, audits, upgradeability, position-sizing

A smart contract holds assets under rules that execute without discretion. That removes a familiar exposure — there is no counterparty who might decline to pay — and replaces it with an unfamiliar one: the rules might not say what their author believed they said, or might say exactly what they were meant to say and still be exploitable. **Smart contract risk** is the possibility that interacting with a protocol destroys capital through a defect in its code, its economic design, its administration, or something it depends on.

In the taxonomy of [Types of Risk](/risk/types), this is closest to operational and legal risk fused together, but the loss profile is distinctive. Failures are rare, sudden, and often near-total. There is no partial fill and no negotiated recovery. The right posture is therefore not to seek certainty about correctness — which is unavailable — but to treat protocol risk as a hazard rate that enters position sizing, in the same way a credit spread enters the pricing of a bond.

---

#### Bug Classes, Conceptually

The specific vulnerabilities change; the categories are stable. What matters for a non-engineer is knowing which questions each category implies.

<table>
  <tbody>
    <tr><td><strong>Class</strong></td><td><strong>Mechanism</strong></td><td><strong>Question it raises</strong></td></tr>
    <tr><td>Reentrancy</td><td>An external call hands control away before internal accounting is finalised, letting the callee re-enter mid-update.</td><td>Does the protocol call out to arbitrary tokens or contracts while its own state is inconsistent?</td></tr>
    <tr><td>Access control</td><td>A privileged function is unguarded, guarded by the wrong condition, or left initialisable after deployment.</td><td>Which functions are privileged, and who or what holds those privileges?</td></tr>
    <tr><td>Upgrade and admin keys</td><td>A key or governance vote can replace the logic holding the assets, or change parameters at will.</td><td>Can the rules change while my position is open, and how fast?</td></tr>
    <tr><td>Arithmetic and precision</td><td>Rounding in the protocol's favour or against it, decimal mismatches, share-price manipulation on an empty vault.</td><td>Where does rounding go, and what happens at zero or at extreme values?</td></tr>
    <tr><td>Economic and parameter</td><td>The code is correct and the incentives are exploitable: collateral factors too generous, fees too low, rewards gameable.</td><td>Is there a profitable action nobody intended, requiring no bug at all?</td></tr>
    <tr><td>Dependency</td><td>Risk inherited from an oracle, a bridged asset, a wrapper, or an integrated protocol.</td><td>What must remain true elsewhere for this position to be safe?</td></tr>
    <tr><td>Denial of service</td><td>An unbounded loop, a blocked withdrawal path, or a griefing vector prevents an action from executing.</td><td>Can I get out, under congestion, when everyone else is trying to?</td></tr>
  </tbody>
</table>

Reentrancy illustrates why the class matters more than the instance. The canonical defence orders operations so state is settled before control leaves the contract.

```solidity
// Checks-effects-interactions: state is final before control leaves.
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);   // checks
    balances[msg.sender] -= amount;            // effects, before the call
    (bool ok, ) = msg.sender.call{value: amount}("");   // interactions, last
    require(ok);
}
```

The pattern is well known and widely applied, and reentrancy keeps recurring anyway — in cross-function variants where two entry points share state, and in read-only variants where a view function returns a mid-update value that another protocol trusts. **Knowing the defence does not retire the class**, which is the general lesson: security is not a checklist that can be completed.

Economic risk deserves separate emphasis because it is the category most often omitted. A protocol whose code is flawless can still be drained by someone who follows its rules precisely — borrowing against a collateral asset whose price can be moved, or farming an incentive that pays more than the activity is worth. No audit of the code detects this, because the code is fine.

---

#### What an Audit Establishes

An audit is a time-boxed review by a team with a defined scope against a specific commit. Read that sentence as four independent limitations.

**What it does establish.** That competent reviewers examined the code and did not find certain classes of defect. That the team was willing to be reviewed and to publish. That known anti-patterns were probably checked. All genuinely informative, and a protocol with no review at all is meaningfully different from one with several.

**What it does not establish.** Absence of bugs — a review is a search, and searches terminate without proving the space empty. Nor does it cover what the scope excluded, and scopes routinely exclude economic design, governance procedures, off-chain components, and deployment configuration. Nor does it cover the code actually running: audits examine a commit, while users interact with deployed bytecode, and verifying the two match is a separate step. Nor does it survive an upgrade, since new logic behind the same address was never reviewed.

> warning **The strongest signal from an audit is often its scope section** It states in the auditors' own words what they did not look at. That list is usually where the residual risk lives, and it is the part almost nobody reads.

Two other proxies are used and both are weak. **Bug bounties** create an incentive to disclose rather than exploit, but only where the bounty exceeds what exploitation would pay — which for a large protocol it rarely does. **Time deployed with value at risk** is the most honest available signal: code that has held substantial assets for a long period without modification has survived scrutiny by people motivated to break it. Its weakness is that it evaporates on upgrade and says nothing about a state the protocol has not yet reached.

---

#### Immutability Cuts Both Ways

<table>
  <tbody>
    <tr><td><strong>Property</strong></td><td><strong>Immutable contract</strong></td><td><strong>Upgradeable contract</strong></td></tr>
    <tr><td>Rules while you hold the position</td><td>Cannot change</td><td>Can change, possibly within one block</td></tr>
    <tr><td>Response to a discovered bug</td><td>None available; the flaw is permanent</td><td>Can be patched, if the process is fast enough</td></tr>
    <tr><td>Trust required</td><td>In the code, once</td><td>In the code and in whoever controls the upgrade, continuously</td></tr>
    <tr><td>Attack surface</td><td>The logic</td><td>The logic, plus the upgrade mechanism itself</td></tr>
    <tr><td>Adaptation to new conditions</td><td>Impossible; parameters set at deployment are permanent</td><td>Possible, and therefore also possible in the wrong direction</td></tr>
  </tbody>
</table>

Neither choice dominates. Immutability converts a code defect into a permanent loss but eliminates the administrator as an attack surface. Upgradeability enables repair and introduces a mechanism that, if captured, transfers everything at once. Timelocks partially reconcile the two by guaranteeing a window in which users can exit before a change takes effect — which is only protection if the exit path remains open and you are watching.

What matters for a position is not which model the protocol chose but the concrete answer to: who can change what, through which process, on what notice, and is that notice long enough for me to leave.

---

#### Protocol Risk as a Position-Sizing Input

The tractable way to handle an unquantifiable risk is to make the assumption explicit and see what it implies. Model protocol failure as a hazard with an annual probability, and a loss given failure as a fraction of the position.

```text
expected_drag   = P_fail_annual * LGF
risk_adj_yield  = gross_yield - expected_drag
P_survive(n)    = (1 - P_fail_annual) ^ n
```

where:

- `P_fail_annual` is your assumed probability of a loss-causing failure in a year
- `LGF` is loss given failure, the fraction of the position lost when one occurs
- `gross_yield` is the yield the position earns before this charge

Take an illustrative position earning 9% annually. You assign a 3% annual failure probability and assume 70% is lost when it happens — both numbers being your judgement, not measurements:

1. **Expected drag**: `0.03 * 0.70 = 2.1%` per year.
2. **Risk-adjusted yield**: `9.0% - 2.1% = 6.9%`.
3. **Probability of no failure over three years**: `0.97^3 = 0.913`, so roughly a one-in-eleven chance of a failure across that horizon.

The number is not the output. The output is the discipline: writing down `P_fail` forces you to state what you believe, and the sensitivity is stark. At a 10% annual hazard with total loss, the drag is 10% and the 9% yield is negative in expectation. Anyone unwilling to name a hazard rate is implicitly using zero.

Two structural adjustments follow from the shape of the loss rather than its mean, exactly as in the credit example in [Types of Risk](/risk/types). Because failures are near-total, **the cap that matters is per-protocol exposure as a fraction of capital**, not expected loss. And because protocols share oracles, bridges and wrapped assets, exposures across "different" protocols are correlated: splitting across five venues that all price the same collateral through the same feed is one position, not five.

---

#### Reading a Protocol's Risk Surface

The categories above become useful when they are turned into questions with checkable answers. None requires reading Solidity; all require reading documentation and on-chain configuration.

<table>
  <tbody>
    <tr><td><strong>Question</strong></td><td><strong>What a weak answer looks like</strong></td></tr>
    <tr><td>Who can change the code, and on what notice?</td><td>An upgrade controlled by a small multisig with no timelock</td></tr>
    <tr><td>Which parameters are governable, and how fast can they move?</td><td>Collateral factors and caps changeable by a vote that executes immediately</td></tr>
    <tr><td>What does the protocol depend on that it does not control?</td><td>A single price feed, one bridged asset, or one wrapper with no fallback</td></tr>
    <tr><td>What is the exit path under stress?</td><td>Withdrawals that can be paused, or that depend on liquidity being present</td></tr>
    <tr><td>Does deployed bytecode match published source?</td><td>Unverified contracts, or a verified proxy with an unverified implementation</td></tr>
    <tr><td>How long has this exact code held this much value?</td><td>A recent upgrade, which resets the answer regardless of the protocol's age</td></tr>
  </tbody>
</table>

The last row is worth dwelling on, because "battle-tested" is usually asserted about a protocol rather than about the code currently deployed. An upgrade replaces the logic while the reputation stays attached to the name. What accumulates scrutiny is code, not brand.

---

#### Assumptions and Failure Modes

- **Assumes an audit is evidence of safety.** It is evidence of review. The distinction is the entire subject of the section above.
- **Assumes the deployed code is the reviewed code.** Verifying deployed bytecode against published source is a separate, skippable step that is frequently skipped.
- **Assumes risks are independent across protocols.** Shared dependencies make them correlated, and correlation appears exactly in the scenario where it hurts. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Assumes governance is benign.** Governance is a mechanism, and mechanisms can be bought. Low participation makes capture cheap, and a passing vote can be entirely legitimate and still expropriate you.
- **Assumes parameters are constant.** Collateral factors, fee tiers and reward rates are usually changeable, so the position you sized is not necessarily the position you hold.
- **Assumes time deployed is proportional to safety.** It measures exposure to scrutiny, not correctness, and it resets on upgrade. Old code in a new market condition is untested code.
- **Assumes exit is available.** Withdrawal paths can be paused, congested, or dependent on liquidity that vanishes with confidence. A risk you cannot exit is a larger risk than the same one you can.

> warning **Educational content only** This page describes how protocol risk is categorised and reasoned about. It is not an assessment of any protocol, and no probability or sizing rule here is a recommendation.

---

#### Code

```python
def protocol_risk_charge(gross_yield, annual_failure_prob, loss_given_failure):
    """Turn an assumed hazard rate into a yield haircut.

    The output is not a measurement -- there is no dataset from which to
    estimate annual_failure_prob. Its value is forcing the assumption into
    the open, where its sensitivity is visible.
    """
    expected_drag = annual_failure_prob * loss_given_failure
    return {
        "expected_drag": expected_drag,
        "risk_adjusted_yield": gross_yield - expected_drag,
        "breaks_even_at_hazard": gross_yield / loss_given_failure,
    }


def survival_probability(annual_failure_prob, years):
    """Chance of no failure over a horizon, under a constant hazard.

    Constant hazard is optimistic for new code and pessimistic for old:
    real failure rates are front-loaded towards recently changed logic.
    """
    return (1.0 - annual_failure_prob) ** years
```

---

#### See Also

* [Types of Risk](/risk/types)
* [Oracle Manipulation and Thin Liquidity](/risk/oracle-manipulation)
* [Operational Risk](/risk/operational)
* [Risk Checklists](/risk/checklists)
* [Position Sizing](/quant-math/position-sizing)
* [Lending Architecture](/protocols/lending-architecture)

---

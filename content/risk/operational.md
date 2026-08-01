### Operational Risk: Keys, Custody, and Human Error

> info **Metadata** Level: Intermediate | Prerequisites: Types of Risk | Tags: operational-risk, controls, reconciliation, custody, key-management, incident-response

Operational risk is the risk of loss from failed people, processes and systems — everything that goes wrong that is not a price moving. It is the category most consistently underweighted in quantitative work, because it resists the tools quants like. There is no return series to estimate a volatility from, the events are rare and heterogeneous, and the loss distribution is dominated by a tail nobody has sampled. So it gets a paragraph in the risk section and a number that is really a placeholder.

That neglect is expensive. A firm can be right about the market and still lose money through a duplicated order, a stale position file, a deployment that reversed a sign, a payment released to the wrong account, or a signing key on a laptop that was stolen. These losses do not diversify, they do not mean-revert, and they are usually discovered later than the market losses because nothing about them looks unusual on a P&L chart until reconciliation runs.

---

#### Formal Definition

Operational risk is conventionally modelled with a **loss distribution approach**: separate the frequency of events from their severity, then compound them.

```text
N        ~ Poisson(lambda)                 number of loss events per year
X_i      ~ severity distribution           size of the i-th loss
Loss     = sum of X_i for i = 1 to N       annual aggregate loss

EL_op    = lambda * E[X]                   expected annual loss
VaR_op(a) = quantile_a( Loss )             capital held against the tail
```

where:

- `lambda` is the expected number of events per year for a given event type
- `X` is severity, usually modelled as heavy-tailed (lognormal or Pareto-like)
- `EL_op` is the expected annual loss, the number you budget for
- `VaR_op(a)` is the aggregate loss quantile, the number you capitalise against

The gap between `EL_op` and `VaR_op` is the whole problem. Frequency is estimable from internal incident data; severity in the tail is not, because the events that would calibrate it have not happened to you yet.

A more tractable piece of the same problem is **authorisation design**. For an `m`-of-`n` scheme in which each credential is independently compromised with probability `p` and independently lost with probability `q`:

```text
P(unauthorised action) = sum over k from m to n of C(n,k) * p^k * (1-p)^(n-k)
P(locked out)          = sum over k from n-m+1 to n of C(n,k) * q^k * (1-q)^(n-k)
```

Raising `m` reduces the first and increases the second. There is no setting that minimises both.

---

#### Worked Example: Choosing a Quorum

Take a per-credential annual compromise probability of 2% and a per-credential annual loss probability of 5% — both chosen to make the arithmetic legible, not measured from any population — and compare three authorisation designs. The same arithmetic applies to releasing a wire transfer, approving a production deployment, or signing a blockchain transaction.

<table>
  <tbody>
    <tr><td><strong>Scheme</strong></td><td><strong>P(unauthorised action)</strong></td><td><strong>P(locked out)</strong></td></tr>
    <tr><td>1-of-1</td><td>2.0%</td><td>5.0%</td></tr>
    <tr><td>2-of-3</td><td>0.118%</td><td>0.725%</td></tr>
    <tr><td>3-of-5</td><td>0.0078%</td><td>0.116%</td></tr>
  </tbody>
</table>

Working the 3-of-5 compromise case:

1. **Three compromised**: `C(5,3) * 0.02^3 * 0.98^2 = 10 * 0.000008 * 0.9604 = 0.00007683`
2. **Four compromised**: `C(5,4) * 0.02^4 * 0.98 = 5 * 0.00000016 * 0.98 = 0.00000078`
3. **All five**: `0.02^5 = 0.0000000032`
4. **Total**: `0.0000776`, or about 0.0078% per year

Against a single credential at 2%, that is a reduction of roughly `0.02 / 0.0000776 = 258` times. The lockout calculation runs the same way with `q = 0.05` and a threshold of three lost credentials, giving 0.116% — also a large improvement on 5%, because losing three of five is much harder than losing one of one.

> warning **The independence assumption does most of the work** If all five credentials live on devices administered by one person, sit behind one identity provider, or were generated from one seed ceremony, the effective number of independent failures is one. The table above then describes a system you do not have.

---

#### Reconciliation: The Core Control

Reconciliation is the systematic comparison of two independently maintained records of the same fact, and it is the single control that catches the widest range of operational failures.

- **Trade reconciliation.** Your order-management system's fills against the broker's or venue's confirmations. Catches duplicated orders, dropped fills, wrong-account bookings and rejected orders your system believes were filled.
- **Position reconciliation.** Your book against the custodian's or exchange's statement. Catches corporate-action mishandling, missed transfers and sign errors.
- **Cash reconciliation.** Your expected balances against bank and clearing statements. Catches fee errors, failed settlements and unauthorised movements.
- **P&L reconciliation.** Independent recomputation of the day's P&L from prices and positions, compared to the accounting system. A residual that cannot be explained is a warning about either the book or the model.

What makes reconciliation a control rather than a chore is the treatment of breaks. Every break needs an owner, a cause and an age, and break age must be reported. A break that has been open for a week is not a small break; it is an unmeasured exposure that has survived every attempt to explain it.

---

#### Keys, Credentials, and Custody

The same underlying question — who can move value, and what does it take to stop them — has very different mechanics across contexts.

**Traditional custody and payments.** Assets sit with a custodian; instructions are authenticated by callback, secure messaging or a payments platform with dual authorisation. Segregation of duties separates the person who initiates a payment from the one who releases it and the one who reconciles it. The distinctive failure modes are social: business-email compromise, an approver who rubber-stamps, and standing instructions nobody re-reviews.

**Trading credentials.** API keys are the operational equivalent of signing authority. Controls that matter are scoping (trade-only keys that cannot withdraw), IP allow-listing, per-key rate and notional limits, rotation, and an inventory that says which key is used by which process. Long-lived keys with full permissions checked into a configuration repository are a recurring, entirely preventable failure.

**Self-custody.** Private keys collapse authorisation and ownership into one secret. There is no callback, no reversal and no counterparty to claim against. The controls are a hot/warm/cold tiering by value at risk, hardware-backed key storage, `m`-of-`n` signing with genuinely independent signers, transaction simulation before signing, and allow-lists of destination addresses. Blind-signing an opaque payload is the on-chain equivalent of signing a blank cheque.

**Recovery.** Every scheme needs a tested path back from a lost credential, and the recovery path is itself an attack surface. A recovery mechanism that has never been rehearsed should be assumed not to work.

---

#### Deployment and Change Risk

The most common cause of a sudden, self-inflicted trading loss is a change that was just made. Systems fail on the day they are altered.

- **Separate the deploy from the enable.** Ship code in a disabled state, then turn it on deliberately, decoupling "does it run" from "does it trade".
- **Stage by exposure, not by confidence.** Route a small fraction of flow first, compare against the incumbent, then scale. Confidence is not evidence.
- **Make rollback the fastest operation available.** If reverting takes longer than the loss takes to accumulate, you do not have a rollback.
- **Version configuration as strictly as code.** Limits, parameters and instrument lists cause as many incidents as logic, and are changed with less review.
- **Freeze around events.** Rolls, rebalances, expiries and month-end are the worst moments to discover a regression.
- **Enforce pre-trade limits outside the strategy.** A maximum order size, a maximum position, a price collar and a message-rate limit in a separate component are what protect you from a bug in the component generating orders.

---

#### Monitoring and Incident Response

Detection time dominates loss size for most operational events, because losses accrue while the system is confidently wrong.

Monitor at three layers. **Liveness**: is the process running, connected, and receiving market data? **Correctness**: do positions match, are orders acknowledged, is the P&L within an expected band, are quotes inside sensible bounds? **Behaviour**: is order rate, cancel ratio, fill rate or turnover outside its normal range? Liveness alerts are easy and catch the least; behavioural alerts are hard and catch the most.

An incident process needs four things that are decided in advance, when nobody is under pressure:

1. **A severity scale** tied to concrete thresholds, so nobody debates whether an event qualifies.
2. **A named decision-maker** per severity level with the authority to halt trading, and a deputy.
3. **A kill switch** that flattens or halts without depending on the failing system, and that is tested on a schedule.
4. **A blameless post-mortem** producing dated, owned actions. Cause analysis that stops at "human error" has stopped one step early: the question is why the process permitted the error to reach production. See [Post-Mortem](/case-studies/post-mortem).

---

#### Traditional and On-Chain Operations Compared

<table>
  <tbody>
    <tr><td><strong>Dimension</strong></td><td><strong>Traditional</strong></td><td><strong>On-chain</strong></td></tr>
    <tr><td>Error reversal</td><td>Trade breaks, cancellations and recalls exist</td><td>Settlement is final; no recall</td></tr>
    <tr><td>Authorisation</td><td>Dual control, callbacks, entitlements</td><td>Multi-signature quorum, timelocks</td></tr>
    <tr><td>Reconciliation source</td><td>Custodian and broker statements</td><td>Chain state, read from an independent node</td></tr>
    <tr><td>Deployment</td><td>Rollback to a previous release</td><td>Contract upgrade or migration, often irreversible</td></tr>
    <tr><td>Counterparty recourse</td><td>Legal claim, insurance, regulator</td><td>Usually none</td></tr>
    <tr><td>Failure visibility</td><td>Private until disclosed</td><td>Public and immediate</td></tr>
  </tbody>
</table>

The controls transfer better than the vocabulary suggests. Reconciling chain state against internal records is the same discipline as reconciling a custodian statement, and it is more reliable because the source of truth is queryable directly — provided you query a node you control rather than the same provider your system already trusts. Contract-level risk is a separate topic: see [Smart Contract Risk](/risk/smart-contract).

---

#### Assumptions and Failure Modes

- **Failures are assumed independent.** Shared infrastructure, a single cloud region, one identity provider, or one person holding several roles collapses `m`-of-`n` schemes to 1-of-1 in the scenario that matters.
- **Historical incident data is assumed sufficient.** Internal loss history is dominated by small, frequent events and says almost nothing about the tail that determines capital.
- **Controls are assumed to be operating.** A control that is documented, disabled, and never tested is worse than no control, because it is credited in the risk assessment.
- **Alerts are assumed to be read.** Alert volume above what a human can triage is equivalent to no alerting. Every alert needs a defined action; alerts with no action should be deleted.
- **The kill switch is assumed to work.** If it depends on the same connectivity, credentials or process as the system it stops, it will fail in exactly the scenarios it exists for.
- **Backups are assumed restorable.** A backup that has never been restored is a hypothesis. The same applies to key recovery procedures and to disaster-recovery sites.
- **Manual steps are assumed reliable under stress.** Procedures that work on a calm Tuesday are performed differently at 3am during a market dislocation, by whoever happens to be available.

> warning **Educational content only** This page describes operational control concepts. It is not a compliance framework, a security audit, or advice on any specific custody or trading arrangement.

---

#### Code

```python
from math import comb


def quorum_risk(m, n, compromise_prob, loss_prob):
    """Failure probabilities for an m-of-n authorisation scheme.

    Assumes independent credentials — the assumption that most often
    fails in practice, and the one worth attacking first in review.
    """
    unauthorised = sum(
        comb(n, k) * compromise_prob**k * (1 - compromise_prob) ** (n - k)
        for k in range(m, n + 1)
    )
    locked_out = sum(
        comb(n, k) * loss_prob**k * (1 - loss_prob) ** (n - k)
        for k in range(n - m + 1, n + 1)
    )
    return {"unauthorised": unauthorised, "locked_out": locked_out}
```

---

#### See Also

* [Types of Risk](/risk/types)
* [Risk Checklists](/risk/checklists)
* [Smart Contract Risk](/risk/smart-contract)
* [Reproducible Research](/data-tooling/reproducible)
* [Post-Mortem](/case-studies/post-mortem)
* [Execution Overview](/execution/execution-overview)

---

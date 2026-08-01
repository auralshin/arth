### Writing a Post-Mortem

> info **Metadata** Level: Intermediate | Prerequisites: VaR & CVaR, Operational Risk, Risk Types | Tags: case-study, post-mortem, operational-risk, process, incident-review

A post-mortem is the process of converting a loss into information. It is not an apology, a performance review, or a narrative about market conditions. It is a reconstruction of what happened, in order, with numbers, followed by a short list of changes that would have altered the outcome.

The discipline matters most when the loss was survivable. A firm that only investigates catastrophes has no sample to learn from. A firm that investigates every VaR breach and every unexplained P&L difference builds a catalogue of its own failure modes, which is the only asset in risk management that compounds.

> info **A constructed example** The incident below is invented to illustrate the method. The numbers are chosen for arithmetic clarity and describe no specific firm, desk, or event.

---

#### Setup: The Position and the Loss

<table>
  <tbody>
    <tr><td><strong>Item</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Book equity</td><td>50,000,000</td></tr>
    <tr><td>Gross exposure</td><td>60,000,000 long in the primary instrument</td></tr>
    <tr><td>Intended hedge</td><td>52,000,000 short, leaving 8,000,000 net long</td></tr>
    <tr><td>Secondary position</td><td>12,000,000 in a related instrument, modelled as uncorrelated</td></tr>
    <tr><td>1-day 99% VaR</td><td>1.6% of equity, or 800,000</td></tr>
    <tr><td>Realised one-day loss</td><td>4.16% of equity, or 2,080,000</td></tr>
  </tbody>
</table>

The loss was 2.6 times the 99% one-day VaR. Under a normal distribution the VaR maps to a daily standard deviation of `1.6% / 2.326 = 0.688%`, which makes the realised loss a 6.05 standard deviation event, with a probability of roughly one in a billion.

> warning **A six-sigma loss is evidence against the model, not evidence of bad luck** When a realised outcome is impossible under the model, the correct first hypothesis is that the model was wrong about the exposure, not that a rare draw occurred.

---

#### What Happens: The Timeline

Reconstruct times from system logs, not from memory. Every row should be citable to a timestamp in an order log, a risk snapshot, or a message archive.

<table>
  <tbody>
    <tr><td><strong>Time</strong></td><td><strong>Event</strong></td><td><strong>Detected?</strong></td></tr>
    <tr><td>T-3 days</td><td>Hedge instrument's expiry roll scheduled; roll order queued</td><td>—</td></tr>
    <tr><td>T-1 day</td><td>Roll order rejected by the venue for an instrument-code mismatch; rejection written to the log</td><td>Logged, not alerted</td></tr>
    <tr><td>T 09:05</td><td>Old hedge expires. 30,000,000 of the 52,000,000 hedge rolls off; the remaining 22,000,000 sits on a later expiry. Net long exposure becomes 38,000,000, not 8,000,000</td><td>No</td></tr>
    <tr><td>T 09:20</td><td>Risk system reads a stale price for the primary instrument and reports exposure unchanged</td><td>No</td></tr>
    <tr><td>T 09:20 to 10:00</td><td>Primary instrument falls 3.5%</td><td>—</td></tr>
    <tr><td>T 10:02</td><td>Stale feed clears; risk system reprices; exposure alert fires</td><td>Yes</td></tr>
    <tr><td>T 10:05 to 11:40</td><td>Manual unwind of 45,000,000 gross into a wide market</td><td>—</td></tr>
    <tr><td>T 11:40</td><td>Book flat. Loss booked at 2,080,000</td><td>—</td></tr>
  </tbody>
</table>

---

#### The Arithmetic: Decomposing the Loss

Split the loss into the part that was intended, the part caused by each contributing factor, and the part caused by the response. Every component must be independently computable.

<table>
  <tbody>
    <tr><td><strong>Component</strong></td><td><strong>Calculation</strong></td><td><strong>Loss</strong></td><td><strong>% of equity</strong></td></tr>
    <tr><td>Intended net exposure</td><td>8,000,000 x 3.5%</td><td>280,000</td><td>0.56%</td></tr>
    <tr><td>Lapsed hedge</td><td>30,000,000 x 3.5%</td><td>1,050,000</td><td>2.10%</td></tr>
    <tr><td>Exit slippage above model</td><td>45,000,000 x 100 bps</td><td>450,000</td><td>0.90%</td></tr>
    <tr><td>Correlated secondary position</td><td>12,000,000 x 2.5%</td><td>300,000</td><td>0.60%</td></tr>
    <tr><td><strong>Total</strong></td><td>—</td><td><strong>2,080,000</strong></td><td><strong>4.16%</strong></td></tr>
  </tbody>
</table>

The exit slippage line deserves attention: the transaction cost model assumed 15 bps for a 45,000,000 unwind, and realised cost was 115 bps. The 100 bps excess is not a market event — it is the cost of unwinding under time pressure rather than on a schedule.

Only 0.56 percentage points of the 4.16 came from the risk the desk intended to run. Three-quarters of the loss came from a control failure and the reaction to it.

---

#### What This Teaches: Contributing Factors, Not a Cause

Incidents rarely have a single cause. They have a set of conditions that were individually tolerable and jointly not. Write them as conditions, not as people.

<table>
  <tbody>
    <tr><td><strong>Contributing factor</strong></td><td><strong>Why it was tolerated</strong></td><td><strong>Change</strong></td></tr>
    <tr><td>Order rejections logged but not alerted</td><td>Rejections are common and mostly benign</td><td>Alert on rejection of any order tagged as a hedge</td></tr>
    <tr><td>No independent check that the hedge exists</td><td>The roll had never failed before</td><td>Reconcile intended against actual net exposure each morning</td></tr>
    <tr><td>Risk system trusted a single price feed</td><td>Staleness had been rare and short</td><td>Staleness check with a hard fail; fall back to a second source</td></tr>
    <tr><td>Position limit expressed in notional</td><td>Notional is easy to explain and audit</td><td>Add a risk-based limit that responds to volatility</td></tr>
    <tr><td>Correlation between the two books assumed zero</td><td>It was near zero in calm conditions</td><td>Stress correlations to 1 within a risk class</td></tr>
    <tr><td>Unwind executed manually under pressure</td><td>No pre-agreed unwind procedure existed</td><td>Written unwind playbook with a target schedule</td></tr>
  </tbody>
</table>

**Blameless does not mean consequence-free.** A blameless post-mortem asks why a reasonable person, with the information and incentives available at the time, took the action they took. If the answer is "because the alert did not exist", the fix is an alert. If the answer is "because the person was under pressure to avoid a limit breach", the fix is the incentive. Naming an individual as the cause ends the investigation exactly where it should begin, and guarantees the next incident is concealed.

---

#### How to Avoid or Manage It: A Reusable Template

```text
INCIDENT POST-MORTEM

1. SUMMARY
   One paragraph. What was lost, over what period, and the single
   most important contributing factor. Written for someone who will
   read nothing else.

2. IMPACT
   Realised P&L. Comparison to VaR and to the largest historical
   daily loss. Capital, liquidity, client, and regulatory impact.

3. TIMELINE
   Timestamped, sourced to logs. Include when each condition arose,
   when it became detectable, and when it was actually detected.
   Detection lag is a first-class metric.

4. LOSS DECOMPOSITION
   Table splitting the loss into intended risk, each contributing
   factor, and the cost of the response. Components must sum to the
   realised loss. State what is a residual.

5. CONTRIBUTING FACTORS
   Conditions, not people. For each: why was this tolerated until now?

6. WHAT WENT RIGHT
   Controls that worked, and detections that fired. Removing these in
   a later cost-cutting exercise is a known failure mode.

7. ACTIONS
   Each action has an owner, a date, and a test that demonstrates it
   works. "Improve monitoring" is not an action.

8. OPEN QUESTIONS
   What is still unexplained. Carry these forward rather than closing
   the document with a tidy story.
```

Two habits make the template work. Write the timeline before writing the summary, so the summary is a conclusion rather than a premise. And record the *detection lag* separately from the loss: in this incident the condition arose at T-1 day and was detected at T 10:02, which is the number to reduce.

---

#### Assumptions and Failure Modes

- **The decomposition assumes components are separable.** The exit slippage would have been smaller had the exposure been smaller, so the lapsed-hedge and slippage lines are not independent. Attribution that sums exactly is a convention; say so rather than implying precision.
- **The VaR comparison assumes VaR was correctly computed for the intended book.** Here it was computed for a book with a hedge that no longer existed, so the breach measures the control failure, not the model's tail behaviour.
- **Timeline reconstruction depends on retained logs.** Log retention shorter than the investigation window silently converts facts into recollections. Retention policy is a risk control.
- **Blameless review can decay into consequence-free review.** If actions are never completed, the process becomes a ritual that produces documents rather than changes. Track action completion as a metric.
- **Near-misses are under-reported.** Incidents with no loss carry the same information and none of the incentive to report. Without deliberate collection, the sample is biased towards expensive, rare events.
- **Post-mortems written by the affected desk understate organisational factors.** An independent reviewer with access to the same data catches the incentive-level causes that participants cannot see.

---

#### See Also

* [Operational Risk](/risk/operational)
* [Risk Checklists](/risk/checklists)
* [Types of Risk](/risk/types)
* [VaR & CVaR](/quant-math/var-cvar)
* [Case Study: A Strategy That Failed, and Why](/case-studies/failed-strategy)
* [Backtest vs Live](/risk/backtest-vs-live)

---

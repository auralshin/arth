### Hidden Markov Models

> info **Metadata** Level: Advanced | Prerequisites: Markov Switching, Conditional Probability, Bayes' Rule | Tags: regimes, hmm, filtering, smoothing, viterbi, forward-backward

A **Hidden Markov Model (HMM)** separates two things that are easy to conflate: the state of the market, which you cannot see, and the observations it produces, which you can. The state evolves as a Markov chain. Each state emits observations from its own distribution. Your job is to reason backwards from the observations to a probability distribution over the state — never to a certainty, because different states can produce identical observations.

The HMM is the general machinery behind [Markov switching models](/regimes-macro/markov-switching): switching models are HMMs with Gaussian emissions on returns. What the general framing adds is a clear vocabulary for three distinct questions — how likely is this data, what state am I in, and what path did the market take — and a sharp distinction between the answers you could have known at the time and the answers you can only construct afterwards. That distinction is the whole practical content of this page.

---

#### The Three Ingredients

An HMM is specified by three objects:

```text
Transition:  A[i][j] = P(s_t = j | s_(t-1) = i)
Emission:    b_j(y)  = P(y_t = y | s_t = j)      (or a density, for continuous y)
Initial:     pi[i]   = P(s_1 = i)
```

where:

- `s_t` is the hidden state at time `t`
- `y_t` is the observation at time `t` — a return, a realised-volatility figure, a spread, or a vector of these
- `A` is the transition matrix, rows summing to 1
- `b_j` is the emission distribution belonging to state `j`

The model asserts two conditional independencies. Given `s_(t-1)`, the state `s_t` is independent of everything earlier. Given `s_t`, the observation `y_t` is independent of everything else. All the tractability flows from these.

Three canonical problems follow. **Evaluation**: how probable is the observed sequence under the model — answered by the forward recursion. **Decoding**: which states were active — answered by forward-backward for per-date probabilities, or Viterbi for the single most likely path. **Learning**: what are `A`, `b`, and `pi` — answered by Baum-Welch, the EM algorithm specialised to HMMs.

---

#### Filtering, Smoothing, and Viterbi Without the Notation

**The forward pass (filtering).** Walk through time once. At each date you hold a probability distribution over states given everything seen so far. Two operations move it forward:

1. *Predict.* Push yesterday's distribution through the transition matrix. This blurs it — persistence keeps most of the mass where it was, and the rest leaks to other states.
2. *Update.* Multiply each state's predicted probability by how well that state explains today's observation, then renormalise so the numbers sum to 1.

That is Bayes' rule applied once per period. The result at time `t` is the **filtered probability**, `P(s_t = j | y_1 ... y_t)`. It uses no future data.

**The backward pass (smoothing).** Run the same idea in reverse, accumulating for each date and state the likelihood of everything that came *after*. Multiply the forward and backward quantities together, renormalise, and you get the **smoothed probability**, `P(s_t = j | y_1 ... y_T)`, which conditions on the entire sample including the future.

> info **The forward pass is Bayes' rule on a loop** Predict, observe, reweight, normalise. Everything else in this page is a variation on those four steps — the backward pass runs them in reverse, and Viterbi swaps the sum for a maximum.

**Viterbi.** Identical in shape to the forward pass, but at each step it takes a maximum instead of a sum, and records which predecessor state achieved it. Instead of asking "how much total probability flows into state `j`", it asks "what is the single best path ending in state `j`". Walking the recorded pointers back from the end gives the most likely *path* — which is not the same as stringing together the individually most likely states, and may even include a transition the model assigns zero probability to if you build the path pointwise.

---

#### Worked Example: One Filter Step, Then One Smoothing Step

Use a two-state model with the transition matrix from [Markov switching](/regimes-macro/markov-switching):

<table>
  <tbody>
    <tr>
      <td><strong>From \ To</strong></td><td><strong>Calm</strong></td><td><strong>Stressed</strong></td>
    </tr>
    <tr>
      <td><strong>Calm</strong></td><td>0.95</td><td>0.05</td>
    </tr>
    <tr>
      <td><strong>Stressed</strong></td><td>0.20</td><td>0.80</td>
    </tr>
  </tbody>
</table>

Emissions are zero-mean Normal with daily volatility 0.80% in calm and 2.50% in stressed. Yesterday's filtered probabilities were 0.90 calm, 0.10 stressed. Today's return is `-3.0%`.

1. **Predict.** Calm: `0.90 * 0.95 + 0.10 * 0.20 = 0.855 + 0.020 = 0.875`. Stressed: `0.90 * 0.05 + 0.10 * 0.80 = 0.045 + 0.080 = 0.125`. These sum to 1.
2. **Evaluate the emissions at `-3.0`.** Using the Normal density (units are per percentage point; only the ratio matters):
   - calm: `0.000441`
   - stressed: `0.07766`
   - The likelihood ratio in favour of stressed is `0.07766 / 0.000441 = 176`.
3. **Update.** Unnormalised weights are `0.875 * 0.000441 = 0.000386` and `0.125 * 0.07766 = 0.009708`, summing to `0.010094`.
4. **Filtered probabilities.** Calm `0.000386 / 0.010094 = 0.038`; stressed `0.009708 / 0.010094 = 0.962`.

A single 3% down day moves the stressed probability from a predicted 12.5% to 96.2%. The prior odds of 1-to-7 against are overwhelmed by a 176-to-1 likelihood ratio.

Now suppose the *next* day's return is `+0.3%`, and you revisit your estimate for the day just described. The backward quantities for that date are the probability of the `+0.3%` observation reachable from each state:

- from calm: `0.95 * 0.4648 + 0.05 * 0.1584 = 0.4416 + 0.0079 = 0.4495`
- from stressed: `0.20 * 0.4648 + 0.80 * 0.1584 = 0.0930 + 0.1267 = 0.2197`

Multiply by the filtered values and renormalise: calm gets `0.038 * 0.4495 = 0.01708`, stressed gets `0.962 * 0.2197 = 0.21135`, total `0.22843`. Dividing through gives 7.5% and 92.5%.

<table>
  <tbody>
    <tr>
      <td><strong>Estimate for that day</strong></td><td><strong>P(calm)</strong></td><td><strong>P(stressed)</strong></td><td><strong>Uses</strong></td>
    </tr>
    <tr>
      <td>Filtered</td><td>3.8%</td><td>96.2%</td><td>data up to that day</td>
    </tr>
    <tr>
      <td>Smoothed (one day later)</td><td>7.5%</td><td>92.5%</td><td>data including the next day</td>
    </tr>
  </tbody>
</table>

One calm follow-up day revises the stressed probability down by nearly four points. A full backward pass over months of subsequent data revises far more.

---

#### Why Only Filtered Probabilities Are Tradeable

The smoothed series looks better on every measure you might care about. It is less jagged, it identifies turning points at the date they actually occurred rather than several days late, and it produces far fewer brief false switches. All of that is because it has seen the future.

If a backtest sizes positions using smoothed state probabilities, it is using tomorrow's returns to decide today's exposure. The resulting equity curve is not optimistic — it is meaningless. The failure is exactly the one in [Backtest vs Live](/risk/backtest-vs-live), just wearing statistical clothing that makes it harder to spot in a code review.

Two subtler versions of the same leak:

- **Whole-sample parameter fitting.** Even if you run the filter causally, `A` and the emission parameters were estimated on the full history. The model's structure encodes the future. Expanding-window re-estimation is the fix; it is slower and produces weaker results.
- **State ordering chosen after the fact.** Deciding that "state 2 is the stressed one" by looking at which state's periods had bad returns is a whole-sample decision. Constrain it by parameters instead (order by `sigma`), not by outcomes.

> warning **The smoothed path is a description, not a signal** Use smoothed probabilities to understand history and to compute expected sufficient statistics inside EM. Never to generate a position.

---

#### In Practice Across Asset Classes

**Equities.** Realised volatility, cross-sectional dispersion, and index returns make natural multivariate observations. Adding an implied-volatility observation sharpens the filter because it carries forward-looking information the return series does not — see [Implied Volatility](/derivatives/implied-volatility).

**Rates.** Observations are usually curve factors (level, slope, curvature from a [PCA](/stat-methods/pca)) rather than raw yields, since the factor representation is lower-dimensional and more stable.

**FX.** The stressed state is short and infrequent, so its emission parameters have wide standard errors. Pooling across related pairs to estimate a shared transition matrix, while allowing pair-specific emissions, is a common compromise.

**Commodities.** Emissions built from curve shape and inventory proxies separate states better than returns alone, because physical constraints show up in the term structure before they show up in spot volatility.

**Credit.** Stale marks induce autocorrelation in the observations, which violates the conditional-independence assumption and makes the filter too slow to switch. Using spread changes over a longer horizon reduces the problem without eliminating it.

**On-chain markets.** Rich, high-frequency, non-price observations are available — funding rates, open interest, [liquidity](/signals/liquidity) depth, liquidation volumes — which is a genuine advantage over traditional markets. The offset is a short history: with few complete cycles, the transition matrix and the stressed-state emissions rest on very little data.

---

#### Assumptions and Failure Modes

- **Conditional independence of observations given the state.** Autocorrelated observations are the most common violation. The filter compensates by switching states to explain persistence, producing regimes that are really just momentum.
- **Discrete states.** Continuously varying conditions get quantised, creating chatter at the boundaries.
- **Correctly specified emission distributions.** Gaussian emissions with fat-tailed data force extra states into existence. A `t` emission usually reduces `K`.
- **A known number of states.** Likelihood rises monotonically with `K`; standard tests do not apply because the null lies on a parameter boundary.
- **Baum-Welch finds a local optimum.** Different initialisations give different fits. Run several starts and inspect the spread, do not report the best one.
- **Filtered probabilities lag.** By construction the filter needs evidence, and evidence arrives after the switch. A regime signal is always late; the question is only how late.
- **Numerical underflow.** Multiplying densities over long sequences underflows to zero. Work in logs or rescale each step, as the code below does.

---

#### Code

```python
import numpy as np

def forward_filter(observations, emission_logpdf, transition, initial):
    """Filtered state probabilities, causal at every row.

    emission_logpdf(y) returns a vector of log-densities, one per state.
    Rescaling each step keeps the recursion numerically stable.
    """
    A = np.asarray(transition, dtype=float)
    alpha = np.asarray(initial, dtype=float)
    filtered = np.empty((len(observations), A.shape[0]))
    log_lik = 0.0
    for t, y in enumerate(observations):
        predicted = alpha @ A
        logdens = emission_logpdf(y)
        weighted = predicted * np.exp(logdens - logdens.max())
        scale = weighted.sum()
        alpha = weighted / scale
        filtered[t] = alpha
        log_lik += np.log(scale) + logdens.max()
    return filtered, log_lik


def backward_smooth(observations, emission_logpdf, transition, filtered):
    """Smoothed probabilities. Uses the whole sample, so it is for
    analysis and for the E-step of EM only, never for live sizing."""
    A = np.asarray(transition, dtype=float)
    n_obs, n_states = filtered.shape
    beta = np.ones(n_states)
    smoothed = np.empty_like(filtered)
    smoothed[-1] = filtered[-1]
    for t in range(n_obs - 2, -1, -1):
        logdens = emission_logpdf(observations[t + 1])
        beta = A @ (np.exp(logdens - logdens.max()) * beta)
        beta /= beta.sum()
        combined = filtered[t] * beta
        smoothed[t] = combined / combined.sum()
    return smoothed
```

---

#### See Also

* [Markov Switching Models](/regimes-macro/markov-switching)
* [Changepoint Detection](/regimes-macro/changepoint-detection)
* [Market Regimes: An Overview](/regimes-macro/regimes-overview)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [Backtest vs Live](/risk/backtest-vs-live)
* [PCA](/stat-methods/pca)

---

### Advanced Topics

> info **Metadata** Level: Advanced | Prerequisites: Returns, Volatility, Linear Regression | Tags: reading-path, stochastic-calculus, volatility, mev, machine-learning, regimes, execution

Most of Arth is organised by subject. This page is organised by difficulty. It collects the material that is genuinely hard — not hard because the notation is unfamiliar, but hard because the naive approach produces an answer that looks right and is not.

That is the criterion used throughout. A topic belongs here if at least one of three things is true: the standard method has a failure mode that is invisible in-sample, the maths requires machinery that is not covered by ordinary statistics, or getting it right demands tools from two disciplines at once. Each track below is a curated path with an entry point, an order, and an explicit statement of what it demands of you. They are independent — take whichever the problem in front of you requires.

---

#### How to Use This Page

This is a hub, not a topic. Nothing here is meant to be read front to back.

Pick the track that matches the problem you have, read it in the order given, and stop when the material stops being relevant to that problem. The tracks share prerequisites but not content, so finishing one is not a requirement for starting another. Where two tracks overlap — regime detection and machine learning share a great deal of statistical machinery, and execution optimisation borrows directly from stochastic calculus — the overlap is noted in the track itself.

If a track's opening page already feels dense, that is a signal about prerequisites rather than about ability. The section below lists what each track assumes, and every one of those assumptions has a page.

---

#### The Six Tracks

<table>
  <tbody>
    <tr>
      <td><strong>Track</strong></td>
      <td><strong>What it demands</strong></td>
      <td><strong>Where the naive approach breaks</strong></td>
    </tr>
    <tr>
      <td>Continuous-time foundations</td>
      <td>Comfort with probability spaces, limits, and change of measure</td>
      <td>Treating a stochastic integral like an ordinary one; the correction term is not optional</td>
    </tr>
    <tr>
      <td>The volatility surface</td>
      <td>Option pricing plus a tolerance for a model known to be wrong</td>
      <td>Quoting one volatility per underlying when the market quotes a surface</td>
    </tr>
    <tr>
      <td>Ordering and MEV modelling</td>
      <td>Microstructure, combinatorial optimisation, and careful empirics</td>
      <td>Measuring extraction with a heuristic that mostly counts false positives</td>
    </tr>
    <tr>
      <td>Machine learning on market data</td>
      <td>Statistical discipline more than modelling skill</td>
      <td>Cross-validation that leaks the future into the training set</td>
    </tr>
    <tr>
      <td>Regime detection</td>
      <td>Latent-state models and honesty about identifiability</td>
      <td>Fitting a regime model that identifies regimes only in hindsight</td>
    </tr>
    <tr>
      <td>Execution optimisation</td>
      <td>Stochastic control, plus impact estimates you cannot measure cleanly</td>
      <td>Optimising a schedule against an impact model calibrated on your own trades</td>
    </tr>
  </tbody>
</table>

---

#### Track 1 — Continuous-Time Foundations

This is the machinery underneath every derivative price in the encyclopedia. It is worth learning in order, because each step depends on the previous one.

Start with [Brownian Motion](/stochastic-calculus/brownian-motion) for the driving process, then [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations), which is the page that makes "information available at time t" a precise object rather than a phrase. The [Itô lemma](/stochastic-calculus/ito-lemma) is the pivot: it is where ordinary calculus stops working and the second-order term appears. Follow it with [Stochastic Differential Equations](/stochastic-calculus/sdes).

From there the pricing chain closes. [Change of Measure](/stochastic-calculus/change-of-measure) shows how drift can be reassigned without changing what is possible, [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing) turns that into a valuation principle, and [Feynman-Kac](/stochastic-calculus/feynman-kac) connects the expectation to the partial differential equation. [Numerical Schemes](/stochastic-calculus/numerical-schemes) is where it becomes code, and [Ornstein-Uhlenbeck](/stochastic-calculus/ornstein-uhlenbeck) is the mean-reverting process behind most statistical-arbitrage modelling.

If [Geometric Brownian Motion](/quant-math/gbm) and [Mean Reversion](/quant-math/mean-reversion) are unfamiliar, read those first — they are the discrete-time intuition this track formalises.

---

#### Track 2 — The Volatility Surface

The hard part of options is not the formula. It is that the market disagrees with it, consistently and in a structured way, and the structure is the tradeable object.

Begin with [Implied Volatility](/derivatives/implied-volatility) — the number obtained by inverting a model everyone knows to be wrong, which is why it is a quoting convention rather than a forecast. Then [Volatility Surface](/derivatives/vol-surface) for the shape across strike and expiry, and [Volatility Term Structure](/derivatives/vol-term-structure) for the maturity dimension specifically.

[Black-Scholes](/derivatives/black-scholes) is the reference model the surface is quoted against; understanding exactly which of its assumptions the skew violates is the point of reading it after the surface rather than before. [Greeks](/derivatives/greeks) and [Delta Hedging](/derivatives/delta-hedging) cover managing the resulting exposure, and [Variance Swaps](/derivatives/variance-swaps) show how to trade volatility as a quantity in its own right without carrying the delta. [Exotics](/derivatives/exotics) is where surface assumptions stop being an approximation and start being the price.

---

#### Track 3 — Ordering and MEV Modelling

On-chain, sequence within a block is not fixed by the protocol, and because state transitions are order-dependent, discretion over sequence has a price. Modelling that price is a microstructure problem with an unusually adversarial measurement layer.

[MEV Overview](/building-blocks/mev-overview) is the orientation. [Transaction Ordering & MEV](/transaction-ordering-mev) is the section landing page and sets out why sequence has value at all. [MEV Formally](/microstructure/mev-formal) frames block construction as a combinatorial optimisation, which is the framing that makes the problem tractable rather than anecdotal.

The two pages that matter most for research are [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts), which puts ordering cost into basis points on an ordinary fill, and [Statistical Modeling](/transaction-ordering-mev/statistical-modeling), which is the page that stops you publishing an extraction figure that is mostly detection artefacts. [MEV Beyond EVMs](/transaction-ordering-mev/mev-beyond-evms) shows the phenomenon reappearing under parallel execution and single sequencers, which is the strongest evidence that it is structural rather than a quirk of one virtual machine.

---

#### Track 4 — Machine Learning Without Fooling Yourself

Financial data is low signal-to-noise, serially correlated, non-stationary, and available in far smaller effective quantities than the row count suggests. Standard machine-learning practice assumes none of that, and every one of those violations inflates measured performance.

Read [ML Pitfalls](/ml-finance/ml-pitfalls) first, before any modelling. It is deliberately placed at the start of this track rather than at the end, because the failure modes are easier to avoid than to detect. Then [Purged Cross-Validation](/ml-finance/purged-cross-validation), which is the concrete fix for the leakage that ordinary k-fold introduces on overlapping labels.

[Labelling](/ml-finance/labelling) and [Meta-Labelling](/ml-finance/meta-labelling) cover the step that determines what you are actually predicting, which is usually the highest-leverage design decision in the whole pipeline. [Feature Engineering](/ml-finance/feature-engineering) and [Interpretability](/ml-finance/interpretability) follow.

The statistical companions are [Multiple Testing](/stat-methods/multiple-testing) and [Backtest Overfitting](/stat-methods/backtest-overfitting). Anyone who has run more than a handful of model configurations needs both, because the reported performance of the best of many trials is a biased estimate whether or not any edge exists.

---

#### Track 5 — Regime Detection

Most strategies do not stop working gradually. They work, and then the environment changes and they do not. Regime modelling is the attempt to make that observation quantitative, and its central difficulty is that regimes are latent — you infer them, you never observe them.

[Regimes Overview](/regimes-macro/regimes-overview) frames the problem. [Markov Switching](/regimes-macro/markov-switching) and [Hidden Markov Models](/regimes-macro/hidden-markov-models) are the two standard formalisms; read them together, because the difference between them is mostly a matter of what is observed. [Changepoint Detection](/regimes-macro/changepoint-detection) is the alternative framing that asks *when* something shifted rather than *which state* you are in.

[Correlation Breakdown](/regimes-macro/correlation-breakdown) is the most practically damaging regime effect, because diversification and hedge ratios are both estimated from correlations that move exactly when you need them not to. [Liquidity Cycles](/regimes-macro/liquidity-cycles) covers the regime variable that most directly affects execution.

---

#### Track 6 — Execution Optimisation

Trading a decision into a position costs money in ways that a backtest with mid-price fills does not see. This track makes those costs explicit and then optimises against them.

[Execution Overview](/execution/execution-overview) gives the decomposition. [Market Impact](/execution/market-impact) is the core empirical object — the reason large orders cannot be executed at the observed price — and [Almgren-Chriss](/execution/almgren-chriss) is the canonical stochastic-control treatment of the resulting trade-off between impact and timing risk.

[Implementation Shortfall](/execution/implementation-shortfall) defines the benchmark that makes the trade-off measurable, and [TWAP & VWAP](/execution/twap-vwap) covers the schedule-based algorithms most commonly used against it. [Adverse Selection](/execution/adverse-selection) explains why passive execution is not free, and [Transaction Cost Analysis](/execution/transaction-cost-analysis) closes the loop by measuring what a live system actually paid.

For on-chain execution specifically, [Blockchain Execution Environments](/blockchain-execution-environments) covers how the virtual machine itself shapes the cost function — a term with no clean off-chain equivalent.

---

#### Prerequisites Worth Not Skipping

Every track above assumes the same small foundation, and the most common reason an advanced page reads as impenetrable is a gap here rather than in the advanced material itself.

- **Returns and their conventions.** [Returns](/quant-math/returns) and [Volatility](/quant-math/volatility) settle whether you are compounding simple or log returns, and over what horizon. Almost every later error in scaling traces back to this.
- **Serial dependence and stationarity.** [Autocorrelation](/quant-math/autocorrelation) and [Stationarity](/quant-math/stationarity) are the two properties financial data violates, and the two that most standard statistical results assume. Tracks 4 and 5 are largely about coping with the violations.
- **Regression and its diagnostics.** [Linear Regression](/stat-methods/linear-regression) and [Regression Diagnostics](/stat-methods/regression-diagnostics) underpin factor models, hedge ratios, and impact estimation alike. The diagnostics page matters more than the regression page.
- **Inference under repeated testing.** [Hypothesis Testing](/stat-methods/hypothesis-testing) and [Confidence Intervals](/stat-methods/confidence-intervals) are the vocabulary that [Multiple Testing](/stat-methods/multiple-testing) then corrects. Reading them in that order is worth the detour.
- **Cointegration for anything mean-reverting.** [Cointegration](/stat-methods/cointegration) and [Unit Roots](/stat-methods/unit-roots) are the difference between a spread that reverts and two series that happened to drift together in-sample.
- **Evaluation that survives contact with reality.** [Sharpe Ratio](/quant-math/sharpe) and [Drawdown](/quant-math/drawdown) are the reporting conventions; [Backtest vs Live](/risk/backtest-vs-live) is the page that explains why the reported figure is optimistic.

---

#### What These Tracks Have in Common

Three failure modes recur across all six, and recognising them transfers between tracks.

- **In-sample optimism.** Every track has a version of "it worked on the data I fitted it to". Purged cross-validation, out-of-sample regime classification, and impact models calibrated on someone else's trades are the same discipline applied in three places.
- **Latent quantities treated as observed.** Volatility, regime state, permanent impact, and extractable value are all inferred. Each is reported as though measured, and each carries estimation error that is routinely dropped by the time it reaches a decision.
- **Model risk that is invisible until it is expensive.** These methods fail quietly. A wrong Sharpe ratio announces itself; a wrong hedge ratio, a wrong impact coefficient, or a wrong regime classification does not, until the position is already on.

> warning **Sophistication is not evidence** A more advanced method is not more likely to be right. It has more parameters, more ways to be fitted to noise, and fewer people able to check it. [Backtest vs Live](/risk/backtest-vs-live) applies with more force here, not less.

---

#### See Also

* [Blockchain Execution Environments](/blockchain-execution-environments)
* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [ML Pitfalls](/ml-finance/ml-pitfalls)
* [Regimes Overview](/regimes-macro/regimes-overview)
* [Volatility Surface](/derivatives/vol-surface)
* [The Itô Lemma](/stochastic-calculus/ito-lemma)
* [Backtest vs Live](/risk/backtest-vs-live)

---

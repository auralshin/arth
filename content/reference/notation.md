### Notation Reference

> info **Metadata** Level: All | Prerequisites: None | Tags: reference, notation, symbols, conventions, lookup

Every symbol used in formulas across Arth, grouped by the domain it belongs to. If you have hit an unfamiliar letter mid-derivation, this is the page to search.

Arth writes mathematics in plain ASCII inside backticks and fenced blocks — `sigma`, `sqrt(252)`, `E[X]`, `P_t` — because the site has no maths renderer. That constraint shapes the notation: Greek letters are spelled out, subscripts use underscores, and superscripts use a caret. The tables below give the exact spelling used in the text.

> info **This page complements, not duplicates, the conventions page** [Notation & Conventions](/welcome/notation-conventions) explains *how* Arth writes: naming habits, code style, callouts, and document structure. This page is the symbol dictionary: *what each letter means and where it appears*.

---

#### Reading the ASCII Conventions

<table>
  <tbody>
    <tr>
      <td><strong>Written as</strong></td>
      <td><strong>Means</strong></td>
      <td><strong>Note</strong></td>
    </tr>
    <tr>
      <td>P_t</td>
      <td>Subscript: the value at index or time t</td>
      <td>The previous value is written P_prev; braced forms appear only inside code blocks</td>
    </tr>
    <tr>
      <td>x^2</td>
      <td>Superscript: x raised to a power</td>
      <td>sigma^2 is variance, not a second series</td>
    </tr>
    <tr>
      <td>sqrt(x)</td>
      <td>Square root</td>
      <td>Never a radical sign</td>
    </tr>
    <tr>
      <td>exp(x), ln(x)</td>
      <td>Exponential and natural logarithm</td>
      <td>log always means natural log unless stated</td>
    </tr>
    <tr>
      <td>sum over i of ...</td>
      <td>Summation</td>
      <td>Ranges are given in words or as sum over i = 1..n</td>
    </tr>
    <tr>
      <td>w' * Sigma * w</td>
      <td>Vector transpose and matrix product</td>
      <td>The apostrophe is transpose; capitals are matrices</td>
    </tr>
    <tr>
      <td>1 followed by a braced condition</td>
      <td>Indicator: one when the condition holds, zero otherwise</td>
      <td>Used in payoff definitions, as in digital and barrier options</td>
    </tr>
    <tr>
      <td>|x|</td>
      <td>Absolute value</td>
      <td>Also used for the size of a set where obvious</td>
    </tr>
  </tbody>
</table>

Two conventions are worth spelling out. A compound subscript inside a fenced code block is written with braces, as in `P_{t-1}`; in prose and in tables the same quantity is written `P_prev` to keep the markup simple. An indicator function is written as the digit one followed by its condition in braces, as in the digital option payoffs on [Exotic Options](/derivatives/exotics).

Greek letters are written out in full: `alpha`, `beta`, `gamma`, `delta`, `epsilon`, `theta`, `kappa`, `lambda`, `mu`, `rho`, `sigma`, `tau`, `phi`, `Phi`, `pi`, `omega`. Capitalisation is meaningful where a lower-case and upper-case pair are both standard, as with `phi` for the normal density and `Phi` for its cumulative distribution.

---

#### Prices, Returns, and Volatility

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>P_t</td><td>Price at time t</td><td>Returns; Moving Averages; most signal pages</td></tr>
    <tr><td>S, S_t</td><td>Spot price of the underlying</td><td>Black-Scholes; Futures 101; Merton Model</td></tr>
    <tr><td>H_t, L_t, C_t</td><td>Bar high, low, and close</td><td>ATR; Stochastic Oscillator; OBV</td></tr>
    <tr><td>V_t</td><td>Traded volume in period t; also portfolio value</td><td>Volume; OBV; Drawdown</td></tr>
    <tr><td>R_t</td><td>Simple return over one period</td><td>Returns; Sharpe Ratio; Performance Metrics</td></tr>
    <tr><td>r_t</td><td>Log return, ln(P_t / P_prev)</td><td>Returns; GARCH; Feature Engineering</td></tr>
    <tr><td>sigma</td><td>Volatility, the standard deviation of returns</td><td>Volatility; Black-Scholes; Position Sizing</td></tr>
    <tr><td>sigma_ann</td><td>Annualised volatility</td><td>Volatility; Dynamic Position Sizing</td></tr>
    <tr><td>h_t</td><td>Conditional variance at time t</td><td>GARCH Models</td></tr>
    <tr><td>lambda</td><td>Decay factor in an EWMA estimator</td><td>Rolling Windows; Dynamic Position Sizing</td></tr>
    <tr><td>n</td><td>Lookback length of a window or sample size</td><td>Rolling Windows; Sampling; all indicator pages</td></tr>
    <tr><td>ADV</td><td>Average daily volume</td><td>Market Impact; Risk Checklists</td></tr>
  </tbody>
</table>

Pages: [Returns](/quant-math/returns), [Volatility](/quant-math/volatility), [Rolling Windows](/quant-math/rolling-windows), [GARCH Models](/stat-methods/garch).

---

#### Probability and Statistics

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>X, Y</td><td>Random variables</td><td>Random Variables; Covariance</td></tr>
    <tr><td>E[X]</td><td>Expectation of X</td><td>Expectation &amp; Variance; everywhere</td></tr>
    <tr><td>Var(X)</td><td>Variance of X</td><td>Expectation &amp; Variance; Mean-Variance</td></tr>
    <tr><td>Cov(X, Y)</td><td>Covariance of X and Y</td><td>Covariance; Factor Models</td></tr>
    <tr><td>rho</td><td>Correlation coefficient</td><td>Covariance; Correlation Breakdown; Ensembles</td></tr>
    <tr><td>P(A)</td><td>Probability of event A</td><td>Random Variables; Default Probability</td></tr>
    <tr><td>mu</td><td>Population or model mean</td><td>Sampling; ARIMA; Kelly Criterion</td></tr>
    <tr><td>xbar, s</td><td>Sample mean and sample standard deviation</td><td>Sampling; Hypothesis Testing</td></tr>
    <tr><td>Sigma</td><td>Covariance matrix</td><td>Mean-Variance; Optimization; PCA</td></tr>
    <tr><td>e_t, epsilon</td><td>Error or innovation term</td><td>Linear Regression; ARIMA; Factor Models</td></tr>
    <tr><td>alpha</td><td>Regression intercept; also a test significance level</td><td>Linear Regression; Hypothesis Testing</td></tr>
    <tr><td>beta</td><td>Regression slope or factor loading</td><td>Linear Regression; Factor Models; Pairs Trading</td></tr>
    <tr><td>phi, theta</td><td>Autoregressive and moving-average coefficients</td><td>ARIMA; Unit Roots</td></tr>
    <tr><td>rho_k, gamma_k</td><td>Autocorrelation and autocovariance at lag k</td><td>Autocorrelation; Stationarity</td></tr>
    <tr><td>Phi, phi</td><td>Standard normal cumulative distribution and density</td><td>Black-Scholes; VaR &amp; CVaR</td></tr>
    <tr><td>N(d1), N(d2)</td><td>Standard normal cumulative distribution, option-pricing notation</td><td>Black-Scholes; The Greeks; Merton Model</td></tr>
    <tr><td>lambda_j, v_j</td><td>Eigenvalue and eigenvector j</td><td>Principal Component Analysis</td></tr>
    <tr><td>q</td><td>False discovery rate level; also a horizon in variance ratios</td><td>Multiple Testing; Momentum vs Mean Reversion</td></tr>
  </tbody>
</table>

Pages: [Expectation & Variance](/quant-math/expectation-variance), [Covariance](/quant-math/covariance), [Linear Regression](/stat-methods/linear-regression), [Hypothesis Testing](/stat-methods/hypothesis-testing), [Principal Component Analysis](/stat-methods/pca).

---

#### Portfolio, Sizing, and Performance

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>w_i</td><td>Weight of asset i in a portfolio</td><td>Mean-Variance; Rebalancing; Momentum</td></tr>
    <tr><td>w_t</td><td>Position or exposure at time t</td><td>How to Read Strategy Write-Ups; Dynamic Sizing</td></tr>
    <tr><td>R_p</td><td>Portfolio return</td><td>Returns; Mean-Variance</td></tr>
    <tr><td>Rf, r</td><td>Risk-free rate</td><td>Sharpe Ratio; Black-Scholes; Kelly Criterion</td></tr>
    <tr><td>S</td><td>Sharpe ratio (context distinguishes it from spot)</td><td>Sharpe Ratio; Backtest Overfitting</td></tr>
    <tr><td>MDD</td><td>Maximum drawdown</td><td>Drawdown; Performance Metrics</td></tr>
    <tr><td>DD_t</td><td>Drawdown at time t</td><td>Drawdown</td></tr>
    <tr><td>E_t</td><td>Equity or account value at time t</td><td>Building a Simple Backtester; Performance Metrics</td></tr>
    <tr><td>f, f*</td><td>Fraction of capital risked; the optimal Kelly fraction</td><td>Kelly Criterion; Position Sizing</td></tr>
    <tr><td>L</td><td>Leverage factor</td><td>Leverage, Margin, and Liquidation Risk</td></tr>
    <tr><td>m</td><td>Maintenance margin fraction</td><td>Leverage, Margin, and Liquidation Risk</td></tr>
    <tr><td>lambda</td><td>Risk-aversion parameter in a mean-variance objective</td><td>Mean-Variance; Almgren-Chriss</td></tr>
    <tr><td>VaR_a, CVaR_a</td><td>Value at risk and conditional value at risk at level a</td><td>VaR &amp; CVaR; Types of Risk</td></tr>
    <tr><td>c</td><td>Round-trip cost per unit of turnover</td><td>Why Backtest; How to Read Strategy Write-Ups</td></tr>
  </tbody>
</table>

Pages: [Mean-Variance](/quant-math/mean-variance), [Position Sizing](/quant-math/position-sizing), [Kelly Criterion](/quant-math/kelly), [Drawdown](/quant-math/drawdown), [VaR & CVaR](/quant-math/var-cvar).

---

#### Options, Greeks, and Volatility Surfaces

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>C, P</td><td>Call and put prices</td><td>Options 101; Payoffs &amp; Put-Call Parity</td></tr>
    <tr><td>K</td><td>Strike price</td><td>Options 101; Black-Scholes; Exotics</td></tr>
    <tr><td>T</td><td>Time to expiry in years</td><td>Black-Scholes; Vol Term Structure</td></tr>
    <tr><td>F</td><td>Forward or futures price</td><td>Futures 101; Payoffs &amp; Put-Call Parity; Basis</td></tr>
    <tr><td>q</td><td>Continuous dividend or convenience yield</td><td>Black-Scholes; Commodities</td></tr>
    <tr><td>d1, d2</td><td>The two Black-Scholes arguments</td><td>Black-Scholes; The Greeks; Merton Model</td></tr>
    <tr><td>Delta</td><td>Sensitivity of value to the underlying price</td><td>The Greeks; Delta Hedging</td></tr>
    <tr><td>Gamma</td><td>Sensitivity of Delta to the underlying price</td><td>The Greeks; Delta Hedging</td></tr>
    <tr><td>Vega</td><td>Sensitivity of value to implied volatility</td><td>The Greeks; Vol Surface</td></tr>
    <tr><td>Theta</td><td>Sensitivity of value to the passage of time</td><td>The Greeks; Delta Hedging</td></tr>
    <tr><td>Rho</td><td>Sensitivity of value to the interest rate</td><td>The Greeks</td></tr>
    <tr><td>sigma_imp</td><td>Implied volatility</td><td>Implied Volatility; Vol Surface</td></tr>
    <tr><td>k</td><td>Log-moneyness, ln(K / F)</td><td>The Volatility Surface</td></tr>
    <tr><td>w(k, T)</td><td>Total implied variance, sigma_imp^2 times T</td><td>Vol Surface; Vol Term Structure</td></tr>
    <tr><td>u, d, p</td><td>Up factor, down factor, risk-neutral probability</td><td>Binomial Trees</td></tr>
    <tr><td>N_var, K_var</td><td>Variance notional and variance strike</td><td>Variance Swaps</td></tr>
    <tr><td>H, M, m</td><td>Barrier level, running maximum, running minimum</td><td>Exotic Options</td></tr>
  </tbody>
</table>

Pages: [Options 101](/derivatives/options-101), [Black-Scholes](/derivatives/black-scholes), [The Greeks](/derivatives/greeks), [The Volatility Surface](/derivatives/vol-surface), [Variance Swaps](/derivatives/variance-swaps).

---

#### Rates, Fixed Income, and Credit

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>y</td><td>Yield to maturity</td><td>Fixed Income 101; Duration and Convexity</td></tr>
    <tr><td>z_n</td><td>Zero-coupon (spot) rate for maturity n</td><td>Yield Curves; Curve Construction</td></tr>
    <tr><td>DF(T)</td><td>Discount factor for maturity T</td><td>Curve Construction; CDS</td></tr>
    <tr><td>f(n, n+1)</td><td>Forward rate between two future dates</td><td>Yield Curves</td></tr>
    <tr><td>C, CF_n</td><td>Coupon and cash flow at period n</td><td>Fixed Income 101; Credit Spreads</td></tr>
    <tr><td>D_mac, D_mod</td><td>Macaulay and modified duration</td><td>Duration and Convexity</td></tr>
    <tr><td>DV01</td><td>Value change per basis point of yield</td><td>Duration and Convexity</td></tr>
    <tr><td>z</td><td>Z-spread, added to every curve point</td><td>Credit Spreads</td></tr>
    <tr><td>lambda</td><td>Default hazard rate or intensity</td><td>Default Probability; Reduced-Form Models</td></tr>
    <tr><td>S(t)</td><td>Survival probability to time t</td><td>Default Probability; Credit Curves</td></tr>
    <tr><td>tau</td><td>Random default time</td><td>Default Probability; Reduced-Form Models</td></tr>
    <tr><td>R</td><td>Recovery rate</td><td>Recovery Rates; CDS; Credit Curves</td></tr>
    <tr><td>LGD</td><td>Loss given default, equal to 1 minus R</td><td>Recovery Rates; Credit 101</td></tr>
    <tr><td>PD, EAD, EL</td><td>Probability of default, exposure at default, expected loss</td><td>Credit 101; Types of Risk</td></tr>
    <tr><td>RPV01</td><td>Risky annuity, the survival-weighted premium value</td><td>Credit Default Swaps</td></tr>
    <tr><td>V, sigma_V</td><td>Firm asset value and asset volatility</td><td>The Merton Model</td></tr>
    <tr><td>pi_e</td><td>Expected inflation</td><td>Rates and Inflation Regimes</td></tr>
  </tbody>
</table>

Pages: [Fixed Income 101](/markets/fixed-income-101), [Yield Curves](/markets/yield-curves), [Duration and Convexity](/markets/duration-convexity), [Default Probability](/credit/default-probability), [Credit Default Swaps](/credit/cds).

---

#### Microstructure and Execution

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>P_bid, P_ask, Mid</td><td>Best bid, best offer, and their midpoint</td><td>Liquidity and Depth; Slippage</td></tr>
    <tr><td>s</td><td>Half-spread earned by a passive quote</td><td>Adverse Selection; Market Making Lite</td></tr>
    <tr><td>alpha</td><td>Probability that a counterparty is informed</td><td>Adverse Selection; Orderbooks vs AMMs</td></tr>
    <tr><td>delta</td><td>Adverse move conditional on trading with an informed counterparty</td><td>Adverse Selection</td></tr>
    <tr><td>lambda</td><td>Kyle's lambda, price impact per unit of signed flow</td><td>Liquidity and Depth as Features</td></tr>
    <tr><td>OBI</td><td>Order book imbalance</td><td>Liquidity and Depth as Features</td></tr>
    <tr><td>ILLIQ</td><td>Amihud illiquidity ratio</td><td>Liquidity and Depth; Liquidity Cycles</td></tr>
    <tr><td>Q, X</td><td>Total order quantity to execute</td><td>Market Impact; Almgren-Chriss</td></tr>
    <tr><td>v(t), x(t)</td><td>Trading rate and remaining inventory at time t</td><td>Almgren-Chriss</td></tr>
    <tr><td>eta, gamma</td><td>Temporary and permanent impact coefficients</td><td>Almgren-Chriss; Market Impact</td></tr>
    <tr><td>Y</td><td>Dimensionless constant in the square-root impact law</td><td>Market Impact</td></tr>
    <tr><td>rho</td><td>Target participation rate in a POV schedule</td><td>TWAP &amp; VWAP</td></tr>
    <tr><td>P_d, P_a, P_avg</td><td>Decision price, arrival price, average fill price</td><td>Implementation Shortfall</td></tr>
    <tr><td>IS</td><td>Implementation shortfall</td><td>Implementation Shortfall; Slippage</td></tr>
    <tr><td>Q_t</td><td>Queue position ahead of your order</td><td>Orderbook Simulation</td></tr>
  </tbody>
</table>

Pages: [Slippage](/microstructure/slippage), [Market Impact](/execution/market-impact), [Almgren–Chriss](/execution/almgren-chriss), [Implementation Shortfall](/execution/implementation-shortfall), [Adverse Selection](/execution/adverse-selection).

---

#### Stochastic Calculus and Processes

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>W_t</td><td>Standard Brownian motion at time t</td><td>Brownian Motion; SDEs; GBM</td></tr>
    <tr><td>dW</td><td>Brownian increment over an instant</td><td>SDEs; Itô's Lemma</td></tr>
    <tr><td>F_t</td><td>Filtration: information available at time t</td><td>Martingales &amp; Filtrations</td></tr>
    <tr><td>a(t, x), b(t, x)</td><td>Drift and diffusion coefficients of an SDE</td><td>SDEs; Numerical Schemes; Feynman-Kac</td></tr>
    <tr><td>mu, sigma</td><td>Drift and volatility of geometric Brownian motion</td><td>Geometric Brownian Motion; Black-Scholes</td></tr>
    <tr><td>kappa, theta</td><td>Mean-reversion speed and long-run level</td><td>Ornstein-Uhlenbeck Process</td></tr>
    <tr><td>Q, P</td><td>Risk-neutral and real-world probability measures</td><td>Change of Measure; Risk-Neutral Pricing</td></tr>
    <tr><td>Z_T</td><td>Radon-Nikodym derivative of Q with respect to P</td><td>Change of Measure</td></tr>
    <tr><td>B_t, N_t</td><td>Money-market account; a numéraire process</td><td>Risk-Neutral Pricing</td></tr>
    <tr><td>h</td><td>Time step in a discretisation scheme</td><td>Numerical Schemes for SDEs</td></tr>
    <tr><td>Z_n</td><td>Standard normal draw at step n</td><td>Numerical Schemes for SDEs</td></tr>
  </tbody>
</table>

Pages: [Brownian Motion](/stochastic-calculus/brownian-motion), [Itô's Lemma](/stochastic-calculus/ito-lemma), [Stochastic Differential Equations](/stochastic-calculus/sdes), [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing).

---

#### Signals, Machine Learning, and Regimes

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>s_t</td><td>Signal value at time t</td><td>What Is a Trading Signal?</td></tr>
    <tr><td>I_t</td><td>Information set available at time t</td><td>What Is a Trading Signal?; Strategy Write-Ups</td></tr>
    <tr><td>IC</td><td>Information coefficient</td><td>What Is a Trading Signal?; ML Overview</td></tr>
    <tr><td>z_t</td><td>Rolling z-score of a feature or spread</td><td>Bollinger Bands; Pairs Trading; Feature Engineering</td></tr>
    <tr><td>y_t</td><td>Label the model is trained to predict</td><td>Labelling; Meta-Labelling</td></tr>
    <tr><td>alpha (penalty)</td><td>Regularisation strength in ridge or lasso</td><td>Regularisation</td></tr>
    <tr><td>B</td><td>Number of base learners in an ensemble, or bootstrap replications</td><td>Ensembles; Bootstrap</td></tr>
    <tr><td>s_t (state)</td><td>Latent regime indicator at time t</td><td>Markov Switching; Hidden Markov Models</td></tr>
    <tr><td>p_ij</td><td>Transition probability from regime i to regime j</td><td>Markov Switching; Hidden Markov Models</td></tr>
    <tr><td>pi</td><td>Stationary distribution over regimes</td><td>Markov Switching</td></tr>
    <tr><td>S_t (CUSUM)</td><td>Cumulative sum statistic</td><td>Changepoint Detection</td></tr>
  </tbody>
</table>

Pages: [What Is a Trading Signal?](/signals/what-is-signal), [Labelling](/ml-finance/labelling), [Markov Switching Models](/regimes-macro/markov-switching), [Changepoint Detection](/regimes-macro/changepoint-detection).

---

#### On-Chain and DeFi

<table>
  <tbody>
    <tr>
      <td><strong>Symbol</strong></td>
      <td><strong>Meaning</strong></td>
      <td><strong>Where used</strong></td>
    </tr>
    <tr><td>r_1, r_2</td><td>Reserves of the two assets in a pool</td><td>AMMs 101; AMMs In Depth</td></tr>
    <tr><td>k</td><td>Constant-product invariant, the product of reserves</td><td>AMMs 101</td></tr>
    <tr><td>L</td><td>Liquidity parameter of a concentrated range</td><td>Concentrated Liquidity</td></tr>
    <tr><td>w_i (pool)</td><td>Weight of asset i in a weighted-geometric-mean pool</td><td>AMMs In Depth</td></tr>
    <tr><td>F</td><td>Perpetual funding rate per interval</td><td>Funding Rate as a Signal</td></tr>
    <tr><td>Mark, Index</td><td>Perpetual mark price and its reference index</td><td>Funding Rate as a Signal; Perp DEX</td></tr>
    <tr><td>health_factor</td><td>Adjusted collateral value divided by debt value</td><td>Leverage, Margin, and Liquidation Risk</td></tr>
    <tr><td>OI</td><td>Open interest in contracts</td><td>Open Interest and Position Imbalances</td></tr>
    <tr><td>e_t, E_t</td><td>Emissions to a pool and total emissions in period t</td><td>Yield Farming; Tokenomics</td></tr>
  </tbody>
</table>

Pages: [AMMs 101](/building-blocks/amms-101), [Concentrated Liquidity](/protocols/concentrated-liquidity), [Perpetual Futures](/building-blocks/perpetual-futures), [Funding Rate as a Signal](/signals/funding-rate).

---

#### Symbols That Mean Different Things

A handful of letters are overloaded by convention, and no amount of tidiness fixes that. Context always resolves them, but these are worth flagging.

- `S` — spot price in derivatives pages, Sharpe ratio in performance pages, survival probability in credit pages.
- `lambda` — EWMA decay in volatility estimation, Kyle's lambda in microstructure, hazard rate in credit, risk aversion in optimisation, Poisson intensity in operational risk.
- `alpha` — regression intercept, significance level, informed-trader probability, EMA smoothing factor, regularisation strength.
- `beta` — factor loading in a regression, hedge ratio in a pair, and a GARCH persistence coefficient.
- `sigma` — return volatility almost everywhere, but asset volatility in the Merton model and implied volatility when written `sigma_imp`.
- `q` — dividend yield in options, horizon in a variance ratio, false discovery level in multiple testing, quantity in execution.
- `k` — window length in indicators, log-moneyness in the vol surface, invariant in an AMM, lag index in autocorrelation.

> warning **Always read the local definition** Every page defines its symbols in a `where:` list beneath the formula. Where this reference and a page disagree, the page wins — it may be following a domain convention deliberately.

---

#### See Also

* [Notation & Conventions](/welcome/notation-conventions)
* [Formula Reference](/reference/formulas)
* [Formula Cheat Sheet](/reference/formula-cheatsheet)
* [Glossary](/reference/glossary)
* [Metric Index](/reference/metric-index)

---

### Formula Cheat Sheet

> info **Metadata** Level: Intermediate | Prerequisites: None | Tags: reference, formulas, cheatsheet, quick-lookup, tables

A dense, scannable index of every formula on the site: the expression, one line on what it means, and the page it comes from. No derivations, no symbol glossaries, no caveats — this is the page to keep open in a second tab.

> info **Want the full treatment?** [Formula Reference](/reference/formulas) gives every formula below with its symbols defined, its assumptions stated, and a pointer to the derivation. Use that page when you need to *rely* on a formula; use this one when you need to *find* it.

---

#### Returns and Compounding

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>R_t = P_t / P_prev - 1</code></td><td>Simple return</td><td>Returns</td></tr>
    <tr><td><code>r_t = ln(P_t / P_prev)</code></td><td>Log return, additive across time</td><td>Returns</td></tr>
    <tr><td><code>R = (1+R_1)...(1+R_n) - 1</code></td><td>Compounding simple returns</td><td>Returns</td></tr>
    <tr><td><code>R_p = sum_i w_i * R_i</code></td><td>Portfolio return from weights</td><td>Returns</td></tr>
    <tr><td><code>R_total = (P_t + D_t - P_prev) / P_prev</code></td><td>Total return including income</td><td>Corporate Actions</td></tr>
    <tr><td><code>g = (W_n / W_0)^(1/n) - 1</code></td><td>Compound annual growth rate</td><td>Buy and Hold</td></tr>
    <tr><td><code>P_adj(t) = P_raw(t) * prod(f_k)</code></td><td>Back-adjusted price series</td><td>Corporate Actions</td></tr>
  </tbody>
</table>

Full treatment: [Returns](/quant-math/returns), [Corporate Actions and Price Adjustment](/markets/corporate-actions), [Benchmark: Buy and Hold vs Do Nothing](/strategies/buy-hold).

---

#### Volatility

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>sigma = sqrt( sum (r_t - rbar)^2 / (n-1) )</code></td><td>Sample volatility</td><td>Volatility</td></tr>
    <tr><td><code>sigma_ann = sigma_period * sqrt(periods_per_year)</code></td><td>Annualisation, needs IID returns</td><td>Volatility</td></tr>
    <tr><td><code>sigma^2_t = lambda*sigma^2_prev + (1-lambda)*r^2_prev</code></td><td>EWMA variance</td><td>Rolling Windows</td></tr>
    <tr><td><code>half_life = ln(0.5) / ln(lambda)</code></td><td>Memory of an EWMA</td><td>Rolling Windows</td></tr>
    <tr><td><code>sigma^2_P = (1/(4 ln2)) * (ln(High/Low))^2</code></td><td>Parkinson range estimator</td><td>Volatility</td></tr>
    <tr><td><code>h_t = omega + alpha*r^2_prev + beta*h_prev</code></td><td>GARCH(1,1) conditional variance</td><td>GARCH Models</td></tr>
    <tr><td><code>omega / (1 - alpha - beta)</code></td><td>GARCH long-run variance</td><td>GARCH Models</td></tr>
  </tbody>
</table>

Full treatment: [Volatility](/quant-math/volatility), [Rolling Windows](/quant-math/rolling-windows), [GARCH Models](/stat-methods/garch).

---

#### Performance and Risk Metrics

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>S = (E[R] - Rf) / sigma(R)</code></td><td>Sharpe ratio</td><td>Sharpe Ratio</td></tr>
    <tr><td><code>S_annual = S_period * sqrt(periods_per_year)</code></td><td>Annualised Sharpe</td><td>Sharpe Ratio</td></tr>
    <tr><td><code>se(S) = sqrt((1 + 0.5*S^2)/n)</code></td><td>Standard error of Sharpe</td><td>Confidence Intervals</td></tr>
    <tr><td><code>Sortino = (E[R] - MAR) / DD</code></td><td>Return per unit of downside risk</td><td>Sortino Ratio</td></tr>
    <tr><td><code>DD = sqrt( sum min(R_t - MAR, 0)^2 / n )</code></td><td>Downside deviation</td><td>Sortino Ratio</td></tr>
    <tr><td><code>DD_t = (V_t - Peak_t) / Peak_t</code></td><td>Drawdown at time t</td><td>Drawdown</td></tr>
    <tr><td><code>MDD = min(DD_t)</code></td><td>Maximum drawdown</td><td>Drawdown</td></tr>
    <tr><td><code>required_gain = d / (1 - d)</code></td><td>Gain needed to recover depth d</td><td>Drawdown</td></tr>
    <tr><td><code>Calmar = annualised_return / abs(MDD)</code></td><td>Return per unit of worst loss</td><td>Backtest Metrics</td></tr>
    <tr><td><code>hit_rate = count(R positive) / count(R nonzero)</code></td><td>Win frequency</td><td>Backtest Metrics</td></tr>
    <tr><td><code>payoff = mean(win) / |mean(loss)|</code></td><td>Win-loss asymmetry</td><td>Backtest Metrics</td></tr>
    <tr><td><code>turnover = sum |traded| / (periods * equity)</code></td><td>Trading intensity</td><td>Backtest Metrics</td></tr>
    <tr><td><code>VaR_a = z_a * sigma</code></td><td>Normal-case value at risk</td><td>VaR and CVaR</td></tr>
    <tr><td><code>CVaR_a = (phi(z_a)/(1-a)) * sigma</code></td><td>Normal-case expected shortfall</td><td>VaR and CVaR</td></tr>
    <tr><td><code>VaR(h) = VaR(1) * sqrt(h)</code></td><td>Horizon scaling of VaR</td><td>VaR and CVaR</td></tr>
    <tr><td><code>IC = corr(s_t, R_next)</code></td><td>Information coefficient of a signal</td><td>What Is a Signal</td></tr>
  </tbody>
</table>

Full treatment: [Sharpe Ratio](/quant-math/sharpe), [Sortino Ratio](/quant-math/sortino), [Drawdown](/quant-math/drawdown), [VaR & CVaR](/quant-math/var-cvar), [Performance Metrics for Backtests](/simulation/metrics).

---

#### Portfolio and Sizing

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>Var(R_p) = w' * Sigma * w</code></td><td>Portfolio variance</td><td>Mean-Variance</td></tr>
    <tr><td><code>E[R_p] = w' * mu</code></td><td>Portfolio expected return</td><td>Mean-Variance</td></tr>
    <tr><td><code>w_mvp = (Sigma^-1 * 1)/(1' * Sigma^-1 * 1)</code></td><td>Minimum-variance weights</td><td>Optimization</td></tr>
    <tr><td><code>w_tan prop. Sigma^-1 * (mu - r*1)</code></td><td>Tangency portfolio direction</td><td>Mean-Variance</td></tr>
    <tr><td><code>f* = (b*p - q) / b</code></td><td>Kelly fraction, binary bet</td><td>Kelly Criterion</td></tr>
    <tr><td><code>f* = (mu - r) / sigma^2</code></td><td>Kelly fraction, continuous case</td><td>Kelly Criterion</td></tr>
    <tr><td><code>w = sigma_target / sigma_asset</code></td><td>Volatility targeting</td><td>Position Sizing</td></tr>
    <tr><td><code>units = risk_fraction * capital / stop_distance</code></td><td>Fixed-fractional sizing</td><td>Position Sizing</td></tr>
    <tr><td><code>units = risk_fraction * Equity / (k * ATR_n)</code></td><td>ATR-based sizing</td><td>Dynamic Sizing</td></tr>
    <tr><td><code>turnover = 0.5 * sum |w* - w_t|</code></td><td>Rebalancing turnover</td><td>Rebalancing</td></tr>
    <tr><td><code>L = q * P_0 / E_0</code></td><td>Gross leverage at inception</td><td>Leverage and Liquidation</td></tr>
    <tr><td><code>P_liq = P_0 * (1 - 1/L)/(1 - m)</code></td><td>Long liquidation price</td><td>Leverage and Liquidation</td></tr>
    <tr><td><code>health = collateral * threshold / debt</code></td><td>Distance from liquidation</td><td>Leverage and Liquidation</td></tr>
    <tr><td><code>sigma_p = sigma * sqrt((1 + rho)/2)</code></td><td>Two-asset equal-weight volatility</td><td>Correlation Breakdown</td></tr>
  </tbody>
</table>

Full treatment: [Mean-Variance](/quant-math/mean-variance), [Kelly Criterion](/quant-math/kelly), [Position Sizing](/quant-math/position-sizing), [Rebalancing](/quant-math/rebalancing), [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation).

---

#### Options and Greeks

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>max(S_T - K, 0)</code></td><td>Call payoff</td><td>Options 101</td></tr>
    <tr><td><code>max(K - S_T, 0)</code></td><td>Put payoff</td><td>Options 101</td></tr>
    <tr><td><code>C - P = S*exp(-qT) - K*exp(-rT)</code></td><td>Put-call parity</td><td>Payoffs and Parity</td></tr>
    <tr><td><code>F = S * exp((r - q) * T)</code></td><td>Forward price under carry</td><td>Futures 101</td></tr>
    <tr><td><code>F = S * exp((r + u - y) * T)</code></td><td>Commodity forward with storage</td><td>Commodities</td></tr>
    <tr><td><code>p = (R - d)/(u - d)</code></td><td>Binomial risk-neutral probability</td><td>Binomial Trees</td></tr>
    <tr><td><code>C = S exp(-qT) N(d1) - K exp(-rT) N(d2)</code></td><td>Black-Scholes call</td><td>Black-Scholes</td></tr>
    <tr><td><code>d1 = (ln(S/K) + (r-q+0.5 sigma^2)T)/(sigma sqrt(T))</code></td><td>First Black-Scholes argument</td><td>Black-Scholes</td></tr>
    <tr><td><code>d2 = d1 - sigma * sqrt(T)</code></td><td>Second Black-Scholes argument</td><td>Black-Scholes</td></tr>
    <tr><td><code>Delta = N(d1)</code></td><td>Call delta</td><td>The Greeks</td></tr>
    <tr><td><code>Gamma = n(d1)/(S sigma sqrt(T))</code></td><td>Curvature of value in spot</td><td>The Greeks</td></tr>
    <tr><td><code>Vega = S n(d1) sqrt(T)</code></td><td>Sensitivity to implied volatility</td><td>The Greeks</td></tr>
    <tr><td><code>Rho = K T exp(-rT) N(d2)</code></td><td>Call sensitivity to rates</td><td>The Greeks</td></tr>
    <tr><td><code>0.5 Gamma S^2 [(dS/S)^2 - sigma_imp^2 dt]</code></td><td>Delta-hedged P&amp;L per step</td><td>Delta Hedging</td></tr>
    <tr><td><code>q_hedge = -q_spot * delta_spot / delta_hedge</code></td><td>Hedge quantity</td><td>Delta-Neutral</td></tr>
  </tbody>
</table>

Full treatment: [Options 101](/derivatives/options-101), [Black-Scholes](/derivatives/black-scholes), [The Greeks](/derivatives/greeks), [Delta Hedging](/derivatives/delta-hedging), [Binomial Trees](/derivatives/binomial-trees).

---

#### Implied Volatility and Surface

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>BS(S,K,r,q,sigma_imp,T) = V_market</code></td><td>Definition of implied volatility</td><td>Implied Volatility</td></tr>
    <tr><td><code>k = ln(K / F(T))</code></td><td>Log-moneyness</td><td>Vol Surface</td></tr>
    <tr><td><code>w(k,T) = sigma_imp^2 * T</code></td><td>Total implied variance</td><td>Vol Surface</td></tr>
    <tr><td><code>RR = sigma(25d call) - sigma(25d put)</code></td><td>Risk reversal, the skew</td><td>Vol Surface</td></tr>
    <tr><td><code>BF = 0.5(sigma_c + sigma_p) - sigma_ATM</code></td><td>Butterfly, the curvature</td><td>Vol Surface</td></tr>
    <tr><td><code>sigma_fwd^2 = (w(T2) - w(T1))/(T2 - T1)</code></td><td>Forward variance</td><td>Vol Term Structure</td></tr>
    <tr><td><code>Payoff = N_var (sigma_R^2 - K_var^2)</code></td><td>Variance swap payoff</td><td>Variance Swaps</td></tr>
    <tr><td><code>N_var = N_vega / (2 * K_var)</code></td><td>Variance notional from vega notional</td><td>Variance Swaps</td></tr>
  </tbody>
</table>

Full treatment: [Implied Volatility](/derivatives/implied-volatility), [The Volatility Surface](/derivatives/vol-surface), [The Term Structure of Volatility](/derivatives/vol-term-structure), [Variance Swaps](/derivatives/variance-swaps).

---

#### Fixed Income and FX

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>P = sum C/(1+y/m)^n + F/(1+y/m)^N</code></td><td>Bond price from yield</td><td>Fixed Income 101</td></tr>
    <tr><td><code>dirty = clean + accrued</code></td><td>Settlement price convention</td><td>Fixed Income 101</td></tr>
    <tr><td><code>D_mac = sum(t_n * PV(CF_n)) / P</code></td><td>Macaulay duration</td><td>Duration and Convexity</td></tr>
    <tr><td><code>D_mod = D_mac / (1 + y/m)</code></td><td>Modified duration</td><td>Duration and Convexity</td></tr>
    <tr><td><code>dP/P = -D_mod * dy</code></td><td>First-order price sensitivity</td><td>Duration and Convexity</td></tr>
    <tr><td><code>DV01 = D_mod * P * 0.0001</code></td><td>Value of one basis point</td><td>Duration and Convexity</td></tr>
    <tr><td><code>DF(n) = 1/(1 + z_n)^n</code></td><td>Discount factor from zero rate</td><td>Yield Curves</td></tr>
    <tr><td><code>f(n,n+1) = DF(n)/DF(n+1) - 1</code></td><td>One-period forward rate</td><td>Yield Curves</td></tr>
    <tr><td><code>par(N) = (1 - DF(N)) / sum DF(n)</code></td><td>Par coupon for maturity N</td><td>Yield Curves</td></tr>
    <tr><td><code>F = S (1 + r_quote T)/(1 + r_base T)</code></td><td>Covered interest parity</td><td>FX Carry and Parity</td></tr>
    <tr><td><code>Basis = F - S</code></td><td>Futures basis</td><td>Basis Signals</td></tr>
    <tr><td><code>Basis_annual = Basis_pct * 365/days</code></td><td>Annualised basis</td><td>Basis Signals</td></tr>
    <tr><td><code>i ~= r + pi_e</code></td><td>Fisher relation</td><td>Rates and Inflation</td></tr>
  </tbody>
</table>

Full treatment: [Fixed Income 101](/markets/fixed-income-101), [Duration and Convexity](/markets/duration-convexity), [Yield Curves](/markets/yield-curves), [FX Carry and Interest Rate Parity](/markets/fx-carry-parity), [Basis and Term Structure Signals](/signals/basis).

---

#### Credit

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>EL = PD * LGD * EAD</code></td><td>Expected credit loss</td><td>Credit 101</td></tr>
    <tr><td><code>LGD = 1 - R</code></td><td>Loss given default</td><td>Recovery Rates</td></tr>
    <tr><td><code>S(t) = exp(-lambda * t)</code></td><td>Survival under constant hazard</td><td>Default Probability</td></tr>
    <tr><td><code>PD(t) = 1 - exp(-lambda * t)</code></td><td>Cumulative default probability</td><td>Default Probability</td></tr>
    <tr><td><code>spread ~= lambda * (1 - R)</code></td><td>The credit triangle</td><td>Credit Spreads</td></tr>
    <tr><td><code>lambda = spread / (1 - R)</code></td><td>Hazard implied by a spread</td><td>Default Probability</td></tr>
    <tr><td><code>RPV01 = sum dt_i D(t_i) S(t_i)</code></td><td>Risky annuity</td><td>Credit Default Swaps</td></tr>
    <tr><td><code>par_spread = ProtectionLeg / RPV01</code></td><td>Fair CDS spread</td><td>Credit Default Swaps</td></tr>
    <tr><td><code>upfront = (par - coupon) * RPV01 * notional</code></td><td>CDS upfront payment</td><td>Credit Default Swaps</td></tr>
    <tr><td><code>lambda_fwd = -ln(S(T2)/S(T1))/(T2 - T1)</code></td><td>Forward hazard rate</td><td>Credit Curves</td></tr>
    <tr><td><code>E = V N(d1) - K exp(-rT) N(d2)</code></td><td>Merton equity as a call on assets</td><td>Merton Model</td></tr>
    <tr><td><code>P = sum CF_i / (1 + z_i + z)^t_i</code></td><td>Z-spread definition</td><td>Credit Spreads</td></tr>
  </tbody>
</table>

Full treatment: [Credit 101](/credit/credit-101), [Default Probability](/credit/default-probability), [Credit Default Swaps](/credit/cds), [Credit Curves](/credit/credit-curves), [The Merton Model](/credit/merton-model).

---

#### Execution and Microstructure

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>slippage_bps = 1e4 * side * (P_exec - P_ref)/P_ref</code></td><td>Slippage against a reference</td><td>Slippage</td></tr>
    <tr><td><code>IS = delay + execution + opportunity + fees</code></td><td>Implementation shortfall</td><td>Implementation Shortfall</td></tr>
    <tr><td><code>impact = Y * sigma * sqrt(Q / V)</code></td><td>Square-root impact law</td><td>Market Impact</td></tr>
    <tr><td><code>E[C] = (gamma/2)X^2 + eta * int v(t)^2 dt</code></td><td>Almgren-Chriss expected cost</td><td>Almgren-Chriss</td></tr>
    <tr><td><code>x(t) = X sinh(kappa(T-t))/sinh(kappa T)</code></td><td>Optimal execution trajectory</td><td>Almgren-Chriss</td></tr>
    <tr><td><code>kappa = sqrt(lambda sigma^2 / eta)</code></td><td>Urgency parameter</td><td>Almgren-Chriss</td></tr>
    <tr><td><code>VWAP = sum(v_i p_i)/sum(v_i)</code></td><td>Volume-weighted average price</td><td>TWAP and VWAP</td></tr>
    <tr><td><code>q_i = rho * v_i</code></td><td>Participation-rate schedule</td><td>TWAP and VWAP</td></tr>
    <tr><td><code>t = mean_cost / (stdev(c)/sqrt(n))</code></td><td>Is measured cost distinguishable from noise</td><td>Transaction Cost Analysis</td></tr>
    <tr><td><code>Spread_bps = 1e4 * (P_ask - P_bid)/Mid</code></td><td>Quoted spread</td><td>Liquidity Features</td></tr>
    <tr><td><code>OBI = (D_bid - D_ask)/(D_bid + D_ask)</code></td><td>Order book imbalance</td><td>Liquidity Features</td></tr>
    <tr><td><code>lambda = sum(x_k dP_k)/sum(x_k^2)</code></td><td>Kyle's lambda</td><td>Liquidity Features</td></tr>
    <tr><td><code>ILLIQ = mean(|R_t| / DollarVolume_t)</code></td><td>Amihud illiquidity</td><td>Liquidity Features</td></tr>
    <tr><td><code>Roll = 2 sqrt(-Cov(dP_t, dP_prev))</code></td><td>Roll's effective spread</td><td>Liquidity Features</td></tr>
    <tr><td><code>s* = alpha * delta</code></td><td>Break-even half-spread</td><td>Adverse Selection</td></tr>
    <tr><td><code>markout(h) = side * (mid(t+h) - fill)</code></td><td>Post-fill toxicity</td><td>Adverse Selection</td></tr>
    <tr><td><code>r_t = S_t - q_t gamma sigma^2 (T - t)</code></td><td>Inventory-adjusted reservation price</td><td>Market Making Lite</td></tr>
  </tbody>
</table>

Full treatment: [Slippage](/microstructure/slippage), [Market Impact](/execution/market-impact), [Almgren–Chriss](/execution/almgren-chriss), [Adverse Selection](/execution/adverse-selection), [Liquidity and Depth as Features](/signals/liquidity).

---

#### Statistics and Time Series

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>sd(xbar) = sigma / sqrt(n)</code></td><td>Standard error of the mean</td><td>Sampling</td></tr>
    <tr><td><code>t = (estimate - null)/se(estimate)</code></td><td>Test statistic</td><td>Hypothesis Testing</td></tr>
    <tr><td><code>t = Sharpe_annual * sqrt(years)</code></td><td>Sharpe expressed as a t-statistic</td><td>Hypothesis Testing</td></tr>
    <tr><td><code>beta_hat = Cov(x,y)/Var(x)</code></td><td>OLS slope</td><td>Linear Regression</td></tr>
    <tr><td><code>R^2 = 1 - SSR/SST</code></td><td>Explained variance share</td><td>Linear Regression</td></tr>
    <tr><td><code>factor = 1 + 2 sum w_j rho_j</code></td><td>Newey-West inflation of variance</td><td>Regression Diagnostics</td></tr>
    <tr><td><code>rho_k = gamma_k / gamma_0</code></td><td>Autocorrelation at lag k</td><td>Autocorrelation</td></tr>
    <tr><td><code>Q = n(n+2) sum rho_k^2/(n-k)</code></td><td>Ljung-Box joint test</td><td>Autocorrelation</td></tr>
    <tr><td><code>VR(q) = Var(q-period)/(q Var(1-period))</code></td><td>Variance ratio</td><td>Momentum vs Mean Reversion</td></tr>
    <tr><td><code>x_t = c + sum phi_i x_lag_i + e_t</code></td><td>AR(p) process</td><td>ARIMA Models</td></tr>
    <tr><td><code>half_life = ln(0.5)/ln(phi)</code></td><td>Mean-reversion half-life</td><td>ARIMA Models</td></tr>
    <tr><td><code>delta_y = mu + gamma y_prev + ... + e_t</code></td><td>ADF regression</td><td>Unit Roots</td></tr>
    <tr><td><code>z_t = y_t - alpha - beta x_t</code></td><td>Cointegrating residual</td><td>Cointegration</td></tr>
    <tr><td><code>FWER = 1 - (1 - alpha)^m</code></td><td>Chance of any false positive</td><td>Multiple Testing</td></tr>
    <tr><td><code>p_(k) at or below k*q/m</code></td><td>Benjamini-Hochberg cutoff</td><td>Multiple Testing</td></tr>
    <tr><td><code>E[max of N] ~= sqrt(2 ln N)</code></td><td>Best of N pure-noise trials</td><td>Backtest Overfitting</td></tr>
    <tr><td><code>C v_j = lambda_j v_j</code></td><td>Principal components</td><td>PCA</td></tr>
    <tr><td><code>R_i - Rf = alpha + sum b_ij F_j + e_i</code></td><td>Factor model</td><td>Factor Models</td></tr>
    <tr><td><code>b_shrunk = tau^2/(tau^2 + s^2) * b_ols</code></td><td>Optimal shrinkage</td><td>Regularisation</td></tr>
    <tr><td><code>Var(ens) = rho s^2 + (1 - rho) s^2 / B</code></td><td>Ensemble variance floor</td><td>Ensembles</td></tr>
  </tbody>
</table>

Full treatment: [Hypothesis Testing](/stat-methods/hypothesis-testing), [Linear Regression](/stat-methods/linear-regression), [Autocorrelation](/quant-math/autocorrelation), [Multiple Testing](/stat-methods/multiple-testing), [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Stochastic Calculus

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>Var(W_t) = t, Cov(W_s, W_t) = min(s,t)</code></td><td>Brownian motion moments</td><td>Brownian Motion</td></tr>
    <tr><td><code>dt dt = 0, dt dW = 0, dW dW = dt</code></td><td>Itô multiplication table</td><td>Itô's Lemma</td></tr>
    <tr><td><code>dY = (f_t + a f_x + 0.5 b^2 f_xx)dt + b f_x dW</code></td><td>Itô's lemma</td><td>Itô's Lemma</td></tr>
    <tr><td><code>dS = mu S dt + sigma S dW</code></td><td>Geometric Brownian motion</td><td>GBM</td></tr>
    <tr><td><code>S_T = S_0 exp((mu - sigma^2/2)T + sigma sqrt(T) Z)</code></td><td>GBM exact solution</td><td>GBM</td></tr>
    <tr><td><code>dX = kappa(theta - X)dt + sigma dW</code></td><td>Ornstein-Uhlenbeck process</td><td>Ornstein-Uhlenbeck</td></tr>
    <tr><td><code>half_life = ln(2)/kappa</code></td><td>OU reversion speed in time units</td><td>Ornstein-Uhlenbeck</td></tr>
    <tr><td><code>V_t = B_t E_Q[V_T / B_T | F_t]</code></td><td>Risk-neutral pricing</td><td>Risk-Neutral Pricing</td></tr>
    <tr><td><code>Z_T = exp(-int theta dW - 0.5 int theta^2 ds)</code></td><td>Girsanov density</td><td>Change of Measure</td></tr>
    <tr><td><code>X_next = X_n + a h + b sqrt(h) Z_n</code></td><td>Euler-Maruyama step</td><td>Numerical Schemes</td></tr>
    <tr><td><code>+ 0.5 b b_x h (Z_n^2 - 1)</code></td><td>Milstein correction term</td><td>Numerical Schemes</td></tr>
  </tbody>
</table>

Full treatment: [Brownian Motion](/stochastic-calculus/brownian-motion), [Itô's Lemma](/stochastic-calculus/ito-lemma), [Ornstein-Uhlenbeck Process](/stochastic-calculus/ornstein-uhlenbeck), [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing), [Numerical Schemes for SDEs](/stochastic-calculus/numerical-schemes).

---

#### Indicators

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>SMA_n(t) = (1/n) sum P over the last n bars</code></td><td>Simple moving average</td><td>Moving Averages</td></tr>
    <tr><td><code>EMA_n(t) = a P_t + (1-a) EMA_n(t-1), a = 2/(n+1)</code></td><td>Exponential moving average</td><td>Moving Averages</td></tr>
    <tr><td><code>RSI = 100 - 100/(1 + AvgGain/AvgLoss)</code></td><td>Relative strength index</td><td>RSI</td></tr>
    <tr><td><code>MACD = EMA_fast - EMA_slow</code></td><td>MACD line</td><td>MACD</td></tr>
    <tr><td><code>Upper = SMA + k * sigma_n</code></td><td>Bollinger upper band</td><td>Bollinger Bands</td></tr>
    <tr><td><code>%b = (P - Lower)/(Upper - Lower)</code></td><td>Position within the bands</td><td>Bollinger Bands</td></tr>
    <tr><td><code>TR = max(H-L, |H-C_prev|, |L-C_prev|)</code></td><td>True range</td><td>ATR</td></tr>
    <tr><td><code>ATR_n(t) = ((n-1)ATR_n(t-1) + TR_t)/n</code></td><td>Wilder-smoothed ATR</td><td>ATR</td></tr>
    <tr><td><code>%K = 100 (C - L_n)/(H_n - L_n)</code></td><td>Stochastic oscillator</td><td>Stochastic</td></tr>
    <tr><td><code>OBV_t = OBV_prev + sign(dC) * V_t</code></td><td>On-balance volume</td><td>OBV</td></tr>
    <tr><td><code>RVOL_t = V_t / median(V previous n)</code></td><td>Relative volume</td><td>Volume</td></tr>
    <tr><td><code>z_t = (x_t - mean_n)/sd_n</code></td><td>Rolling z-score</td><td>Bollinger Bands</td></tr>
  </tbody>
</table>

Full treatment: [Indicator Index](/reference/indicators), which lists every indicator with its parameters and failure modes.

---

#### On-Chain

<table>
  <tbody>
    <tr><td><strong>Formula</strong></td><td><strong>Meaning</strong></td><td><strong>Page</strong></td></tr>
    <tr><td><code>r_1 * r_2 = k</code></td><td>Constant-product invariant</td><td>AMMs 101</td></tr>
    <tr><td><code>price = r_2 / r_1</code></td><td>Marginal pool price</td><td>AMMs 101</td></tr>
    <tr><td><code>prod r_i^w_i = C</code></td><td>Weighted geometric-mean pool</td><td>AMMs In Depth</td></tr>
    <tr><td><code>p_ij = (r_j / r_i)(w_i / w_j)</code></td><td>Weighted pool price</td><td>AMMs In Depth</td></tr>
    <tr><td><code>L = sqrt(r_1 * r_2)</code></td><td>Concentrated liquidity parameter</td><td>Concentrated Liquidity</td></tr>
    <tr><td><code>Premium = (Mark - Index)/Index</code></td><td>Perpetual premium</td><td>Funding Rate</td></tr>
    <tr><td><code>Payment = Notional * F</code></td><td>Funding payment per interval</td><td>Funding Rate</td></tr>
    <tr><td><code>NotionalOI = OI * multiplier * Price</code></td><td>Open interest in currency</td><td>Open Interest</td></tr>
    <tr><td><code>max_leverage = 1 / haircut</code></td><td>Leverage ceiling from margin rules</td><td>Liquidity Cycles</td></tr>
  </tbody>
</table>

Full treatment: [AMMs 101](/building-blocks/amms-101), [AMMs In Depth](/protocols/amms-depth), [Concentrated Liquidity](/protocols/concentrated-liquidity), [Funding Rate as a Signal](/signals/funding-rate).

---

#### See Also

* [Formula Reference](/reference/formulas)
* [Notation Reference](/reference/notation)
* [Indicator Index](/reference/indicators)
* [Metric Index](/reference/metric-index)
* [Code Snippets](/reference/code-snippets)
* [Glossary](/reference/glossary)

---

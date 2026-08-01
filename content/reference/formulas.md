### Formula Reference

> info **Metadata** Level: Intermediate | Prerequisites: None | Tags: reference, formulas, equations, lookup, mathematics

The comprehensive formula collection for Arth, organised by topic. Every entry states the formula in ASCII, defines each symbol, and links to the page that derives it and explains when it fails.

This page is for when you need the formula *and* its context. If you only want to scan a table and find an expression quickly, use the [Formula Cheat Sheet](/reference/formula-cheatsheet) instead — it strips out the derivation pointers and symbol lists in favour of density.

> warning **A formula without its assumptions is a trap** Almost every expression below holds under conditions that markets violate somewhere. The linked page is where those conditions are set out, and reading it is not optional if you intend to rely on the number.

---

#### Returns and Compounding

Simple and log returns over one period:

```text
R_t = (P_t - P_{t-1}) / P_{t-1} = P_t / P_{t-1} - 1
r_t = ln(P_t / P_{t-1}) = ln(1 + R_t)
```

where `P_t` is the price at time `t`. Log returns add across time; simple returns compound. See [Returns](/quant-math/returns).

Aggregation across `n` periods:

```text
r_(1 to n) = r_1 + r_2 + ... + r_n
R_(1 to n) = (1 + R_1)(1 + R_2)...(1 + R_n) - 1
```

Portfolio return from weights, valid for simple returns only:

```text
R_p = sum over i of  w_i * R_i
```

where `w_i` is the weight of asset `i`. See [Returns](/quant-math/returns).

Total return including income, and the compound annual growth rate:

```text
R_total = (P_t + D_t - P_{t-1}) / P_{t-1}
g       = (W_n / W_0)^(1/n) - 1
```

where `D_t` is the dividend or coupon paid in the period, `W_0` and `W_n` are starting and ending wealth over `n` years. See [Corporate Actions and Price Adjustment](/markets/corporate-actions) and [Benchmark: Buy and Hold vs Do Nothing](/strategies/buy-hold).

---

#### Volatility

Sample standard deviation of returns, and its annualisation:

```text
sigma_period = sqrt( sum of (r_t - rbar)^2 / (n - 1) )
sigma_annual = sigma_period * sqrt(periods_per_year)
```

where `rbar` is the sample mean return and `n` the number of observations. The `sqrt` scaling requires serially uncorrelated returns. See [Volatility](/quant-math/volatility).

Exponentially weighted variance, the standard recursive estimator:

```text
sigma^2_t   = lambda * sigma^2_{t-1} + (1 - lambda) * r^2_{t-1}
half_life   = ln(0.5) / ln(lambda)
```

where `lambda` in `(0, 1)` is the decay factor. See [Rolling Windows](/quant-math/rolling-windows).

Parkinson range estimator, which uses the intraday high and low:

```text
sigma^2_Parkinson = (1 / (4 * ln 2)) * (ln(High / Low))^2
```

More efficient than close-to-close for the same sample, but blind to gaps. See [Volatility](/quant-math/volatility).

GARCH(1,1) conditional variance and its long-run level:

```text
h_t                  = omega + alpha * r_{t-1}^2 + beta * h_{t-1}
long_run_variance    = omega / (1 - alpha - beta)
half_life_in_periods = ln(0.5) / ln(alpha + beta)
```

where `omega`, `alpha`, `beta` are non-negative and `alpha + beta` is below one for stationarity. See [GARCH Models](/stat-methods/garch).

---

#### Performance Metrics

Sharpe ratio and its annualisation:

```text
S        = (E[R] - Rf) / sigma(R)
S_annual = S_period * sqrt(periods_per_year)
```

where `Rf` is the per-period risk-free rate. See [Sharpe Ratio](/quant-math/sharpe).

Standard error of an estimated Sharpe ratio, valid for IID returns:

```text
se(S) = sqrt( (1 + 0.5 * S^2) / n )
```

Report it beside the ratio; at short samples it dominates the point estimate. See [Confidence Intervals](/stat-methods/confidence-intervals).

Sortino ratio and downside deviation:

```text
DD      = sqrt( sum over t of  min(R_t - MAR, 0)^2  /  n )
Sortino = (E[R] - MAR) / DD
```

where `MAR` is the minimum acceptable return. Note the division by the full count `n`, not the count of negative periods; the alternative convention exists and gives a different number. See [Sortino Ratio](/quant-math/sortino).

Drawdown, maximum drawdown, and the gain needed to recover:

```text
Peak_t        = max( V_s  for all s at or before t )
DD_t          = (V_t - Peak_t) / Peak_t
MDD           = min( DD_t  over all t )
required_gain = d / (1 - d)
```

where `V_t` is the equity value and `d` the fractional depth of the drawdown. See [Drawdown](/quant-math/drawdown).

Calmar ratio, hit rate, payoff ratio, and turnover, computed from the equity series `E_t`:

```text
Calmar       = annualised_return / abs(MDD)
hit_rate     = count(R_t positive) / count(R_t nonzero)
payoff_ratio = mean(R_t | R_t positive) / |mean(R_t | R_t negative)|
turnover     = SUM_t |traded_notional_t| / (periods * average_equity)
```

Turnover cannot be recovered from returns alone; the backtester must record it. See [Performance Metrics for Backtests](/simulation/metrics).

Value at risk and conditional value at risk, in general and under normality:

```text
VaR_alpha  = the smallest x such that P(L at most x) is at least alpha
CVaR_alpha = E[ L | L at least VaR_alpha ]

VaR_alpha  = z_alpha * sigma                                (normal case)
CVaR_alpha = (phi(z_alpha) / (1 - alpha)) * sigma           (normal case)
```

where `L` is the loss, `z_alpha` the standard normal quantile, and `phi` its density. See [VaR & CVaR](/quant-math/var-cvar).

---

#### Portfolio Construction and Sizing

Portfolio moments in matrix form:

```text
E[R_p]   = w' * mu
Var(R_p) = w' * Sigma * w
```

where `w` is the weight vector, `mu` the vector of expected returns, and `Sigma` the covariance matrix. See [Mean-Variance](/quant-math/mean-variance).

The minimum-variance portfolio, and the tangency direction:

```text
w_mvp       = (Sigma^-1 * 1) / (1' * Sigma^-1 * 1)
w_tangency  proportional to  Sigma^-1 * (mu - r * 1)
```

where `1` is a vector of ones and `r` the risk-free rate. Both require inverting an estimated covariance matrix, which is where the trouble starts. See [Optimization](/quant-math/optimization).

Kelly fraction for a binary bet and for a continuous return:

```text
f* = (b * p - q) / b                (win b per unit with probability p, lose the stake with probability q)
f* = (mu - r) / sigma^2             (continuous case, excess drift over variance)
```

See [Kelly Criterion](/quant-math/kelly).

Volatility targeting and fixed-fractional sizing:

```text
w        = sigma_target / sigma_asset
units    = (risk_fraction * capital) / stop_distance_per_unit
```

See [Position Sizing](/quant-math/position-sizing) and [Dynamic Position Sizing with Volatility](/strategies/dynamic-sizing).

Portfolio volatility for `n` equally-weighted positions with common correlation `rho` and common volatility `s`:

```text
sigma_portfolio = s * sqrt( n + n*(n-1)*rho ) / n
```

The `rho` term is what fails in a crisis. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).

Rebalancing drift and turnover:

```text
drift_i  = w_{t,i} - w*_i
turnover = 0.5 * sum over i of  |w*_i - w_{t,i}|
```

where `w*` are target weights. See [Rebalancing](/quant-math/rebalancing).

Leverage and the liquidation price of a levered position:

```text
L     = q * P_0 / E_0
P_liq = P_0 * (1 - 1/L) / (1 - m)      long
P_liq = P_0 * (1 + 1/L) / (1 + m)      short
```

where `q` is quantity, `E_0` initial equity, and `m` the maintenance margin fraction. See [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation).

---

#### Options: Payoffs, Parity, and Pricing

Vanilla payoffs and put-call parity:

```text
Call payoff = max(S_T - K, 0)
Put payoff  = max(K - S_T, 0)

C - P = S * exp(-q*T) - K * exp(-r*T)
C - P = exp(-r*T) * (F - K)
```

where `S` is spot, `K` strike, `T` time to expiry, `r` the rate, `q` the dividend or convenience yield, and `F` the forward. Parity is an arbitrage identity, not a model. See [Payoffs & Put-Call Parity](/derivatives/payoffs-parity).

Forward price under cost of carry:

```text
F = S * exp((r - q) * T)
F = S * exp((r + u - y) * T)      with storage cost u and convenience yield y
```

See [Futures 101](/markets/futures-101) and [Commodities](/markets/commodities).

One-period binomial risk-neutral probability and value:

```text
p       = (R - d) / (u - d)
V       = (p * V_up + (1 - p) * V_down) / R
delta   = (V_up - V_down) / (S*u - S*d)
```

where `u` and `d` are the up and down factors and `R` the one-period gross rate. See [Binomial Trees](/derivatives/binomial-trees).

Black-Scholes prices with continuous dividend yield:

```text
C = S * exp(-q*T) * N(d1) - K * exp(-r*T) * N(d2)
P = K * exp(-r*T) * N(-d2) - S * exp(-q*T) * N(-d1)

d1 = ( ln(S/K) + (r - q + 0.5*sigma^2) * T ) / ( sigma * sqrt(T) )
d2 = d1 - sigma * sqrt(T)
```

where `N` is the standard normal cumulative distribution and `sigma` the volatility. See [Black-Scholes](/derivatives/black-scholes).

The Black-Scholes partial differential equation:

```text
dV/dt + 0.5 * sigma^2 * S^2 * d2V/dS2 + (r - q) * S * dV/dS - r * V = 0
```

See [Black-Scholes](/derivatives/black-scholes) and [Feynman-Kac](/stochastic-calculus/feynman-kac).

---

#### The Greeks

```text
Delta = dV/dS     = N(d1)                             (call)
                  = N(d1) - 1                         (put)
Gamma = d2V/dS2   = n(d1) / (S * sigma * sqrt(T))     (same both ways)
Vega  = dV/dsigma = S * n(d1) * sqrt(T)               (same both ways)
Rho   = dV/dr     = K * T * exp(-r*T) * N(d2)         (call)
                  = -K * T * exp(-r*T) * N(-d2)       (put)
```

where `n` is the standard normal density. These are the derivatives at `q = 0`; with a continuous dividend yield, multiply Delta, Gamma and Vega by `exp(-q*T)`. Vega is conventionally quoted per one percentage point of volatility, so divide by 100. See [The Greeks](/derivatives/greeks).

Hedged option P&L, the decomposition that motivates delta hedging:

```text
dV         = Delta*dS + 0.5*Gamma*(dS)^2 + Theta*dt + Vega*dsigma + higher order
hedged P&L ~= 0.5*Gamma*S^2 * [ (dS/S)^2 - sigma_implied^2 * dt ]
```

A delta-hedged long option is long realised variance and short implied variance. See [Delta Hedging](/derivatives/delta-hedging).

Portfolio delta and the hedge quantity:

```text
Delta_p = sum_i ( q_i * delta_i )
q_hedge = - q_spot * (delta_spot / delta_hedge)
```

See [Delta-Neutral Strategies](/strategies/delta-neutral).

---

#### Implied Volatility and the Surface

Implied volatility is defined implicitly by inverting the pricing model:

```text
BS(S, K, r, q, sigma_imp, T) = V_market
```

There is no closed form; it is solved numerically. See [Implied Volatility](/derivatives/implied-volatility).

Surface coordinates and the no-arbitrage condition in maturity:

```text
log-moneyness   k       = ln(K / F(T))
total variance  w(k, T) = sigma_imp(k, T)^2 * T
calendar bound  w(k, T2) at least w(k, T1)   whenever T2 is later than T1
```

See [The Volatility Surface](/derivatives/vol-surface).

Skew and curvature summaries, and the forward variance between two maturities:

```text
RR = sigma(25-delta call) - sigma(25-delta put)
BF = 0.5*(sigma(25d call) + sigma(25d put)) - sigma(ATM)

sigma_fwd^2 = ( sigma_imp(T2)^2 * T2 - sigma_imp(T1)^2 * T1 ) / (T2 - T1)
```

A negative forward variance means the quoted term structure admits calendar arbitrage. See [The Term Structure of Volatility](/derivatives/vol-term-structure).

Variance swap payoff and realised variance:

```text
Payoff    = N_var * ( sigma_R^2 - K_var^2 )
sigma_R^2 = (A / n) * sum_{i=1..n} ( ln(S_i / S_{i-1}) )^2
N_var     = N_vega / ( 2 * K_var )
```

where `A` is the annualisation factor and `N_vega` the desired vega notional. See [Variance Swaps](/derivatives/variance-swaps).

---

#### Fixed Income and Rates

Bond price from yield, and the accrued-interest convention:

```text
P           = sum( C / (1 + y/m)^n  for n = 1..N ) + F / (1 + y/m)^N
dirty_price = clean_price + accrued_interest
```

where `C` is the periodic coupon, `y` the yield, `m` the compounding frequency, and `F` the face value. See [Fixed Income 101](/markets/fixed-income-101).

Duration, modified duration, and DV01:

```text
D_mac  = sum( t_n * PV(CF_n) ) / P
D_mod  = D_mac / (1 + y/m)
dP/P  ~= -D_mod * dy
DV01   = D_mod * P * 0.0001
```

See [Duration and Convexity](/markets/duration-convexity).

Discount factors, forward rates, and par yields:

```text
DF(n)     = 1 / (1 + z_n)^n
f(n, n+1) = DF(n) / DF(n+1) - 1
par(N)    = (1 - DF(N)) / sum( DF(n) for n = 1..N )
```

where `z_n` is the zero rate for maturity `n`. See [Yield Curves](/markets/yield-curves) and [Curve Construction](/markets/curve-construction).

Covered interest parity, the FX forward:

```text
F = S * (1 + r_quote * T) / (1 + r_base * T)
```

See [FX Carry and Interest Rate Parity](/markets/fx-carry-parity).

Futures basis and annualised roll yield:

```text
Basis        = F - S
Basis_pct    = (F - S) / S
Basis_annual = Basis_pct * (365 / days_to_expiry)
```

See [Basis and Term Structure Signals](/signals/basis) and [Roll and Carry](/markets/roll-and-carry).

---

#### Credit

Expected loss, the identity that organises credit risk:

```text
EL = PD * LGD * EAD
```

where `PD` is probability of default, `LGD` loss given default, and `EAD` exposure at default. See [Credit 101](/credit/credit-101).

Hazard rate and survival probability:

```text
S(t)             = exp( -integral from 0 to t of lambda(u) du )
S(t)             = exp(-lambda * t)                (constant hazard)
PD_cumulative(t) = 1 - exp(-lambda * t)
```

See [Default Probability](/credit/default-probability) and [Reduced-Form Models](/credit/reduced-form-models).

The credit triangle, linking spread, hazard rate, and recovery:

```text
spread ~= lambda * (1 - R)
lambda  = spread / (1 - R)
```

where `R` is the recovery rate. Exact under a constant hazard and continuous premium payment; a good approximation otherwise. See [Credit Spreads](/credit/credit-spreads).

CDS legs and the par spread:

```text
RPV01         = sum over payment dates of  dt_i * D(t_i) * S(t_i)
PremiumLeg    = spread * RPV01
ProtectionLeg = (1 - R) * integral from 0 to T of D(s) * (-dS(s))
par_spread    = ProtectionLeg / RPV01
upfront       = (par_spread - coupon) * RPV01 * notional
```

where `D(t)` is the discount factor and `S(t)` the survival probability. See [Credit Default Swaps](/credit/cds).

Forward hazard rate bootstrapped from a survival curve:

```text
lambda_forward(T1, T2) = -ln( S(T2) / S(T1) ) / (T2 - T1)
s_forward(T1, T2)      = lambda_forward(T1, T2) * (1 - R)
```

See [Credit Curves](/credit/credit-curves).

Merton's structural model: equity as a call on firm assets:

```text
E  = V * N(d1) - K * exp(-r*T) * N(d2)
d1 = ( ln(V/K) + (r + 0.5*sigma_V^2) * T ) / ( sigma_V * sqrt(T) )
d2 = d1 - sigma_V * sqrt(T)
```

where `V` is asset value, `sigma_V` asset volatility, and `K` the face value of debt. `N(-d2)` is the risk-neutral default probability. See [The Merton Model](/credit/merton-model).

Z-spread, the constant addition to the discount curve that reprices a bond:

```text
P = sum over i of  CF_i / (1 + z_i + z)^t_i
```

See [Credit Spreads](/credit/credit-spreads).

---

#### Execution, Impact, and Cost

Slippage against a reference price, and the implementation shortfall decomposition:

```text
slippage_bps = 10000 * side * (P_exec - P_ref) / P_ref        side = +1 buy, -1 sell
IS           = delay + execution + opportunity + fees

delay        = Q_f * (P_a - P_d)
execution    = Q_f * (P_avg - P_a)
opportunity  = Q_u * (P_end - P_d)
```

where `P_d` is the decision price, `P_a` the arrival price, `P_avg` the average fill, `Q_f` the filled quantity, and `Q_u` the unfilled quantity. See [Slippage](/microstructure/slippage) and [Implementation Shortfall](/execution/implementation-shortfall).

The square-root law of market impact:

```text
impact = Y * sigma * sqrt(Q / V)
```

where `Q` is order size, `V` the period volume, `sigma` the volatility over the same period, and `Y` a dimensionless constant of order one. See [Market Impact](/execution/market-impact).

Almgren-Chriss cost and risk for a schedule `v(t)` with remaining inventory `x(t)`:

```text
E[C]   = (gamma / 2) * X^2 + eta * integral_0^T v(t)^2 dt
Var(C) = sigma^2 * integral_0^T x(t)^2 dt

minimise  E[C] + lambda * Var(C)
solution  x(t) = X * sinh(kappa * (T - t)) / sinh(kappa * T)
          kappa = sqrt(lambda * sigma^2 / eta)
```

where `gamma` is the permanent impact coefficient, `eta` the temporary one, `X` the total quantity, and `lambda` the risk-aversion parameter. See [Almgren–Chriss](/execution/almgren-chriss).

Execution benchmarks and schedules:

```text
VWAP = sum(v_i * p_i) / sum(v_i)
TWAP = sum(p_i) / n

TWAP schedule:  w_i = 1 / n
VWAP schedule:  w_i = v_hat_i / sum(v_hat)
POV schedule:   q_i = rho * v_i
```

See [TWAP & VWAP](/execution/twap-vwap) and [Execution Benchmarks](/execution/execution-benchmarks).

Cost per trade and its significance test in transaction cost analysis:

```text
cost_bps  = side * (P_avg - P_b) / P_b * 1e4
mean_cost = mean(c_i)
se        = stdev(c_i) / sqrt(n)
t         = mean_cost / se
```

See [Transaction Cost Analysis](/execution/transaction-cost-analysis).

---

#### Microstructure and Liquidity

Spread, mid price, and depth:

```text
Spread     = P_ask - P_bid
Mid        = (P_ask + P_bid) / 2
Spread_bps = 10000 * Spread / Mid
OBI        = (D_bid - D_ask) / (D_bid + D_ask)
```

where `D_bid` and `D_ask` are the summed sizes within a chosen distance of the mid. See [Liquidity and Depth as Features](/signals/liquidity).

Kyle's lambda, Amihud illiquidity, and Roll's spread estimator:

```text
lambda      = sum(x_k * dP_k) / sum(x_k^2)
ILLIQ       = (1/n) * sum( |R_t| / DollarVolume_t )
Roll_spread = 2 * sqrt( -Cov(dP_t, dP_{t-1}) )
```

where `x_k` is signed order flow in interval `k`. Roll's estimator is undefined when the autocovariance is positive, which happens often. See [Liquidity and Depth as Features](/signals/liquidity).

The market maker's break-even condition under adverse selection:

```text
E[profit per share] = (1 - alpha) * s + alpha * (s - delta) = s - alpha * delta
s* = alpha * delta
```

where `alpha` is the probability the counterparty is informed, `s` the half-spread, and `delta` the adverse move when they are. See [Adverse Selection](/execution/adverse-selection).

Markout, the standard toxicity measure:

```text
markout(h) = side * (mid(t + h) - fill_price)
```

See [Adverse Selection](/execution/adverse-selection).

Avellaneda-Stoikov style reservation price and optimal spread for a market maker with inventory `q_t`:

```text
r_t          = S_t - q_t * gamma * sigma^2 * (T - t)
spread_total = gamma * sigma^2 * (T - t) + (2 / gamma) * ln(1 + gamma / kappa)
```

where `gamma` is risk aversion and `kappa` the order-arrival intensity parameter. See [Market Making Lite](/strategies/mm-lite).

---

#### Statistics, Inference, and Time Series

Sample moments and standard errors:

```text
xbar     = (1/n) * sum of x_t
s^2      = (1/(n-1)) * sum of (x_t - xbar)^2
sd(xbar) = sigma / sqrt(n)
```

See [Sampling](/quant-math/sampling).

Test statistic, confidence interval, and the Sharpe-to-t identity:

```text
t  = (estimate - null_value) / standard_error(estimate)
CI = estimate  plus or minus  critical_value * standard_error(estimate)
t  = Sharpe_annualised * sqrt(years_of_data)
```

The last line is why a Sharpe of 0.5 needs many years before it is distinguishable from zero. See [Hypothesis Testing](/stat-methods/hypothesis-testing).

Ordinary least squares in the single-regressor case:

```text
beta_hat  = Cov(x, y) / Var(x)
alpha_hat = mean(y) - beta_hat * mean(x)
R^2       = 1 - SSR / SST
se(beta)  = s / sqrt(Sxx)
```

where `SSR` is the residual sum of squares, `SST` the total sum of squares, and `Sxx` the sum of squared deviations of `x`. See [Linear Regression](/stat-methods/linear-regression).

Newey-West correction factor for autocorrelated residuals:

```text
factor = 1 + 2 * sum_{j=1..L} w_j * rho_j
w_j    = 1 - j / (L + 1)
```

where `rho_j` is the residual autocorrelation at lag `j` and `L` the truncation lag. See [Regression Diagnostics](/stat-methods/regression-diagnostics).

Autocorrelation, the Ljung-Box statistic, and the variance ratio:

```text
rho_k = gamma_k / gamma_0
Q     = n * (n + 2) * sum over k=1..h of  rho_hat_k^2 / (n - k)
VR(q) = Var(q-period return) / (q * Var(1-period return))
      = 1 + 2 * sum over k=1..q-1 of (1 - k/q) * rho_k
```

`VR(q)` equals one under a random walk, exceeds one under trend, and falls below one under reversal. See [Autocorrelation](/quant-math/autocorrelation) and [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion).

Augmented Dickey-Fuller regression, and the cointegrating residual:

```text
delta_y_t = mu + gamma * y_{t-1} + sum_{i=1..p} d_i * delta_y_{t-i} + e_t
z_t       = y_t - alpha - beta * x_t          stationary if the pair cointegrates
half_life = ln(0.5) / ln(1 + a_y)
```

where `gamma = phi - 1` and `a_y` is the error-correction loading. See [Unit Roots](/stat-methods/unit-roots) and [Cointegration](/stat-methods/cointegration).

Multiple testing corrections:

```text
FWER       = 1 - (1 - alpha)^m
Bonferroni : reject test i when p_i is at or below alpha / m
Benjamini-Hochberg : sort p ascending, find the largest k with p_(k) at or below k*q/m
```

See [Multiple Testing](/stat-methods/multiple-testing).

Expected maximum Sharpe from pure search over `N` independent trials:

```text
E[max of N draws] ~= sqrt(2 * ln(N))
Sharpe_from_noise ~= sqrt(2 * ln(N)) / sqrt(T)
```

where `T` is the sample length in years. See [Backtest Overfitting](/stat-methods/backtest-overfitting) and [Parameter Sweeps and Sensitivity Analysis](/simulation/param-sweeps).

Principal components from the covariance matrix:

```text
C * v_j = lambda_j * v_j
share_j = lambda_j / sum_l(lambda_l)
```

See [Principal Component Analysis](/stat-methods/pca).

Factor model and its variance decomposition:

```text
R_i - Rf = alpha_i + sum_j b_ij * F_j + e_i
Var(R_i) = sum_j sum_l  b_ij * b_il * Cov(F_j, F_l) + Var(e_i)
```

See [Factor Models](/stat-methods/factor-models).

---

#### Stochastic Calculus

Brownian motion moments, and the Itô multiplication rules:

```text
E[W_t] = 0        Var(W_t) = t        Cov(W_s, W_t) = min(s, t)

dt * dt = 0       dt * dW = 0         dW * dW = dt
```

See [Brownian Motion](/stochastic-calculus/brownian-motion).

A general Itô process and Itô's lemma applied to `Y_t = f(t, X_t)`:

```text
dX_t = a_t dt + b_t dW_t
dY_t = ( df/dt + a_t * df/dx + 0.5 * b_t^2 * d2f/dx2 ) dt + b_t * (df/dx) dW_t
```

The second-order term is the whole difference from ordinary calculus. See [Itô's Lemma](/stochastic-calculus/ito-lemma).

Geometric Brownian motion and its exact solution:

```text
dS  = mu * S * dt + sigma * S * dW
S_T = S_0 * exp( (mu - sigma^2/2) * T + sigma * sqrt(T) * Z )

E[S_T]      = S_0 * exp(mu * T)
median(S_T) = S_0 * exp((mu - sigma^2/2) * T)
```

where `Z` is a standard normal draw. See [Geometric Brownian Motion](/quant-math/gbm).

Ornstein-Uhlenbeck dynamics and its conditional moments:

```text
dX_t           = kappa * (theta - X_t) * dt + sigma * dW_t
E[X_t | X_s]   = theta + (X_s - theta) * exp(-kappa*(t-s))
Var(X_t | X_s) = (sigma^2 / (2*kappa)) * ( 1 - exp(-2*kappa*(t-s)) )
half_life      = ln(2) / kappa
```

See [Ornstein-Uhlenbeck Process](/stochastic-calculus/ornstein-uhlenbeck).

Risk-neutral pricing and the change of measure:

```text
V_t = B_t * E_Q[ V_T / B_T | F_t ]
V_t = exp(-r*(T - t)) * E_Q[ V_T | F_t ]           (constant rate)
Z_T = exp( -Int theta_s dW_s - 0.5 * Int theta_s^2 ds )
```

where `B_t` is the money-market account and `theta` the market price of risk. See [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing) and [Change of Measure](/stochastic-calculus/change-of-measure).

Euler-Maruyama and Milstein discretisation of an SDE with step `h`:

```text
X_{n+1} = X_n + a*h + b*sqrt(h)*Z_n
X_{n+1} = X_n + a*h + b*sqrt(h)*Z_n + 0.5*b*(db/dx)*h*(Z_n^2 - 1)
```

For GBM, the exact log-scheme avoids discretisation bias entirely:

```text
S_{n+1} = S_n * exp( (mu - 0.5*sigma^2)*h + sigma*sqrt(h)*Z )
```

See [Numerical Schemes for SDEs](/stochastic-calculus/numerical-schemes).

---

#### On-Chain and DeFi

Constant-product invariant and the marginal price it implies:

```text
r_1 * r_2 = k
price of asset 1 in units of asset 2 = r_2 / r_1
```

where `r_1` and `r_2` are pool reserves. See [AMMs 101](/building-blocks/amms-101).

Weighted-pool invariant and its price relation:

```text
product over i of  r_i ^ w_i  = C
p_ij = (r_j / r_i) * (w_i / w_j)
```

where `w_i` are the pool weights, summing to one. See [AMMs In Depth](/protocols/amms-depth).

Concentrated liquidity: the liquidity parameter of a range:

```text
L = sqrt(r_1 * r_2)
```

See [Concentrated Liquidity](/protocols/concentrated-liquidity).

Perpetual funding, from the mark-index premium to the payment:

```text
Premium_t = (Mark_t - Index_t) / Index_t
F         = Premium_avg + clamp(Interest - Premium_avg, -c, +c)
Payment   = PositionNotional * F
```

where `c` is the clamp width and `F` is capped at the venue's limit. See [Funding Rate as a Signal](/signals/funding-rate).

Collateralised borrowing health and the deleveraging spiral:

```text
health_factor = collateral_value * liquidation_threshold / debt_value
max_leverage  = 1 / haircut
```

See [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation) and [Liquidity Cycles](/regimes-macro/liquidity-cycles).

---

#### See Also

* [Formula Cheat Sheet](/reference/formula-cheatsheet)
* [Notation Reference](/reference/notation)
* [Metric Index](/reference/metric-index)
* [Indicator Index](/reference/indicators)
* [Code Snippets](/reference/code-snippets)
* [Glossary](/reference/glossary)

---

### Resources

> info **Metadata** Level: All | Prerequisites: None | Tags: reference, resources, reading, books, papers, further-study

Arth is a reference, not a curriculum. At some point on every topic you will want the book that spends three hundred pages where this site spends three sections. This page lists those books, organised by subject, with a line on what each is good for and who it suits.

The list is deliberately conservative. It contains works whose authorship and title are certain, and nothing else. Where a subject has no settled canonical text — much of decentralised finance, for instance — this page says so rather than filling the gap.

> warning **No links, DOIs, or edition numbers are given** They go stale, and a guessed URL is worse than none. Search by author and title; every work below is findable that way, and most are in print in multiple editions.

---

#### Where to Start

For readers arriving without a quantitative background, these describe how the industry actually works before asking you to do any mathematics.

- **Rishi K. Narang — *Inside the Black Box*.** A non-technical account of how systematic funds are structured, from alpha models to risk and execution. Best read before any textbook, because it tells you what the textbooks are for.
- **Ernest P. Chan — *Quantitative Trading*.** A practitioner's walkthrough of building and testing a strategy end to end. Suits someone who wants to run code this week rather than derive results first.
- **Emanuel Derman — *My Life as a Quant*.** A memoir of the field's formative period. Read it for the culture and for an unusually honest account of what models are and are not.

---

#### Probability, Statistics, and Econometrics

- **Larry Wasserman — *All of Statistics*.** Compact, rigorous coverage of inference for readers who want the whole apparatus in one volume. Suits someone with a mathematics background who needs statistics quickly.
- **Gareth James, Daniela Witten, Trevor Hastie, and Robert Tibshirani — *An Introduction to Statistical Learning*.** The gentlest serious introduction to modelling, with worked code. The right first book on the subject for almost everyone.
- **Trevor Hastie, Robert Tibshirani, and Jerome Friedman — *The Elements of Statistical Learning*.** The same material at full technical depth. Suits readers who found the previous book too light.
- **Bradley Efron and Robert Tibshirani — *An Introduction to the Bootstrap*.** The definitive treatment of resampling, which matters enormously when your sample is short and dependent.
- **Jeffrey M. Wooldridge — *Introductory Econometrics: A Modern Approach*.** Careful, applied regression with an emphasis on what assumptions buy you. Suits anyone whose regressions keep producing suspiciously significant results.
- **William H. Greene — *Econometric Analysis*.** The comprehensive graduate reference. Use it to look things up rather than to read through.

Related pages: [Hypothesis Testing](/stat-methods/hypothesis-testing), [Linear Regression](/stat-methods/linear-regression), [Bootstrap](/stat-methods/bootstrap), [Multiple Testing](/stat-methods/multiple-testing).

---

#### Time Series and Volatility Modelling

- **Ruey S. Tsay — *Analysis of Financial Time Series*.** The standard text on ARIMA, GARCH, and their financial applications. Suits anyone modelling returns or volatility directly.
- **James D. Hamilton — *Time Series Analysis*.** The rigorous reference, and the original source for regime-switching models. Demanding, and worth it for state-space and Markov-switching work.
- **John Y. Campbell, Andrew W. Lo, and A. Craig MacKinlay — *The Econometrics of Financial Markets*.** Connects time-series methods to asset-pricing questions. Suits readers who want the empirical finance literature organised.

Related pages: [ARIMA Models](/stat-methods/arima), [GARCH Models](/stat-methods/garch), [Markov Switching Models](/regimes-macro/markov-switching), [Cointegration](/stat-methods/cointegration).

---

#### Stochastic Calculus and Continuous-Time Finance

- **Steven E. Shreve — *Stochastic Calculus for Finance I: The Binomial Asset Pricing Model*.** Builds every important idea in discrete time before any measure theory appears. The best possible on-ramp.
- **Steven E. Shreve — *Stochastic Calculus for Finance II: Continuous-Time Models*.** The continuous-time companion, and the standard graduate text. Suits readers comfortable with real analysis.
- **Martin Baxter and Andrew Rennie — *Financial Calculus: An Introduction to Derivative Pricing*.** Short, intuitive, and unusually good at explaining why the risk-neutral measure exists. Suits readers who want the ideas before the machinery.
- **Tomas Björk — *Arbitrage Theory in Continuous Time*.** Clear treatment of pricing, measure change, and interest rate models. A good bridge between Baxter-Rennie and Shreve.
- **Bernt Øksendal — *Stochastic Differential Equations: An Introduction with Applications*.** The mathematics of SDEs, with finance as one application among several.
- **Ioannis Karatzas and Steven E. Shreve — *Brownian Motion and Stochastic Calculus*.** The rigorous probabilistic foundation. A reference, not a course.
- **Mark S. Joshi — *The Concepts and Practice of Mathematical Finance*.** Written to explain why each piece of theory exists. Suits readers preparing for practitioner work or interviews.
- **Paul Glasserman — *Monte Carlo Methods in Financial Engineering*.** The reference on simulation, discretisation, and variance reduction. Essential if you are pricing anything numerically.

Related pages: [Brownian Motion](/stochastic-calculus/brownian-motion), [Itô's Lemma](/stochastic-calculus/ito-lemma), [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing), [Numerical Schemes for SDEs](/stochastic-calculus/numerical-schemes).

---

#### Derivatives and Volatility

- **John C. Hull — *Options, Futures, and Other Derivatives*.** The universal reference. Broad rather than deep, and the first place to look for any convention or contract detail.
- **Sheldon Natenberg — *Option Volatility and Pricing*.** How options behave from a trader's seat rather than a modeller's. Suits anyone who needs intuition about the Greeks.
- **Euan Sinclair — *Volatility Trading*.** Practical, statistical, and refreshingly honest about how thin real option edges are.
- **Jim Gatheral — *The Volatility Surface: A Practitioner's Guide*.** The standard treatment of skew, term structure, and arbitrage-free surface construction. Assumes stochastic calculus.
- **Lorenzo Bergomi — *Stochastic Volatility Modeling*.** Advanced, opinionated, and the reference for forward-variance modelling. For readers already fluent in Gatheral.
- **Nassim Nicholas Taleb — *Dynamic Hedging*.** A practitioner's catalogue of what actually goes wrong when hedging real books. Idiosyncratic and valuable.
- **Espen Gaarder Haug — *The Complete Guide to Option Pricing Formulas*.** A formula reference for exotic and non-standard payoffs. Use it as a lookup table.
- **Riccardo Rebonato — *Volatility and Correlation*.** Careful thinking about what volatility inputs mean and how much to trust them.
- **Paul Wilmott, Sam Howison, and Jeff Dewynne — *The Mathematics of Financial Derivatives*.** The partial differential equation route to pricing, for readers who prefer analysis to probability.

Related pages: [Black-Scholes](/derivatives/black-scholes), [The Greeks](/derivatives/greeks), [The Volatility Surface](/derivatives/vol-surface), [Variance Swaps](/derivatives/variance-swaps).

---

#### Fixed Income and Credit

- **Bruce Tuckman and Angel Serrat — *Fixed Income Securities: Tools for Today's Markets*.** The clearest practical treatment of curves, duration, and relative value. The default recommendation for rates.
- **Frank J. Fabozzi — *Bond Markets, Analysis, and Strategies*.** Broad institutional coverage of instruments and conventions. Suits readers who need the market plumbing.
- **Damiano Brigo and Fabio Mercurio — *Interest Rate Models: Theory and Practice*.** The reference for short-rate and market models. Advanced, and the standard citation for rates derivatives.
- **Darrell Duffie and Kenneth J. Singleton — *Credit Risk: Pricing, Measurement, and Management*.** The canonical treatment of both structural and reduced-form credit modelling.
- **Dominic O'Kane — *Modelling Single-name and Multi-name Credit Derivatives*.** Practical CDS mechanics, curve bootstrapping, and correlation products.

Related pages: [Fixed Income 101](/markets/fixed-income-101), [Curve Construction](/markets/curve-construction), [Credit Default Swaps](/credit/cds), [The Merton Model](/credit/merton-model).

---

#### Portfolio Construction and Factor Investing

- **Richard C. Grinold and Ronald N. Kahn — *Active Portfolio Management*.** The framework almost every systematic equity shop still uses: information ratio, breadth, transfer coefficient. The single most useful book on this list for a systematic researcher.
- **Antti Ilmanen — *Expected Returns*.** A survey of what has historically been compensated across asset classes, with unusual care about evidence quality.
- **Andrew Ang — *Asset Management: A Systematic Approach to Factor Investing*.** Factors as the organising principle for allocation. Suits allocators and multi-asset researchers.
- **Attilio Meucci — *Risk and Asset Allocation*.** Rigorous treatment of estimation, shrinkage, and allocation under uncertainty. Advanced.
- **John H. Cochrane — *Asset Pricing*.** The theory underneath all of the above, built from the stochastic discount factor. Academic and clarifying.

Related pages: [Mean-Variance](/quant-math/mean-variance), [Factor Models](/stat-methods/factor-models), [Position Sizing](/quant-math/position-sizing), [Rebalancing](/quant-math/rebalancing).

---

#### Market Microstructure

- **Larry Harris — *Trading and Exchanges: Market Microstructure for Practitioners*.** How venues, participants, and order types actually work. Almost no mathematics, and indispensable.
- **Maureen O'Hara — *Market Microstructure Theory*.** The theoretical models of information and price formation, including the adverse-selection literature.
- **Joel Hasbrouck — *Empirical Market Microstructure*.** How to estimate microstructure quantities from real data. Suits anyone building signals from quotes and trades.
- **Jean-Philippe Bouchaud, Julius Bonart, Jonathan Donier, and Martin Gould — *Trades, Quotes and Prices: Financial Markets Under the Microscope*.** The modern empirical account of order flow, impact, and liquidity. The best current source on the square-root impact law.

Related pages: [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms), [Adverse Selection](/execution/adverse-selection), [Liquidity and Depth as Features](/signals/liquidity), [Market Impact](/execution/market-impact).

---

#### Execution and Algorithmic Trading

- **Barry Johnson — *Algorithmic Trading and DMA*.** A practical survey of execution algorithms and venue mechanics. The standard first book on execution.
- **Robert Kissell — *The Science of Algorithmic Trading and Portfolio Management*.** Cost modelling, transaction cost analysis, and the link from execution back to portfolio construction.
- **Álvaro Cartea, Sebastian Jaimungal, and José Penalva — *Algorithmic and High-Frequency Trading*.** The mathematical treatment of optimal execution and market making. Assumes stochastic control.
- **Olivier Guéant — *The Financial Mathematics of Market Liquidity*.** Optimal execution and quoting problems worked through carefully. Advanced.
- **Irene Aldridge — *High-Frequency Trading*.** A broad practical overview of the strategies and the infrastructure they need.

Related pages: [Execution Overview](/execution/execution-overview), [Almgren–Chriss](/execution/almgren-chriss), [Implementation Shortfall](/execution/implementation-shortfall), [Market Making Lite](/strategies/mm-lite).

---

#### Machine Learning in Finance

- **Marcos López de Prado — *Advances in Financial Machine Learning*.** The source of purged cross-validation, meta-labelling, and the triple-barrier method. Opinionated and occasionally overstated, and still the most useful single book on applying machine learning to markets.
- **Marcos López de Prado — *Machine Learning for Asset Managers*.** Shorter and more focused, particularly on covariance estimation and clustering.
- **Stefan Jansen — *Machine Learning for Algorithmic Trading*.** Implementation-heavy, with substantial worked code. Suits readers who learn by building.

Related pages: [Machine Learning in Finance](/ml-finance/ml-overview), [Purged Cross-Validation](/ml-finance/purged-cross-validation), [Labelling](/ml-finance/labelling), [The Pitfall Catalogue](/ml-finance/ml-pitfalls).

---

#### Risk Management

- **Alexander J. McNeil, Rüdiger Frey, and Paul Embrechts — *Quantitative Risk Management: Concepts, Techniques and Tools*.** The reference on tails, copulas, coherent risk measures, and extreme value theory.
- **Philippe Jorion — *Value at Risk*.** The standard treatment of VaR, including its limitations and its regulatory history.
- **John C. Hull — *Risk Management and Financial Institutions*.** Institutional risk from the perspective of a bank balance sheet. Good on credit, liquidity, and operational risk together.
- **Nassim Nicholas Taleb — *Fooled by Randomness* and *The Black Swan*.** Arguments about inference under fat tails and small samples. Read them for the discipline about evidence, not for a method.

Related pages: [Types of Risk](/risk/types), [VaR & CVaR](/quant-math/var-cvar), [Scenario and Stress Testing](/simulation/scenarios), [Operational Risk](/risk/operational).

---

#### Programming and Data

- **Wes McKinney — *Python for Data Analysis*.** Written by the creator of pandas. The fastest route to competence with the tools every snippet on this site assumes.
- **Yves Hilpisch — *Python for Finance*.** Financial applications of the same stack, including derivatives pricing and simulation.

Related pages: [Working with Market Data in Python](/data-tooling/python), [Python Setup](/data-tooling/python-setup), [Code Snippets](/reference/code-snippets), [Reproducible Experiments](/data-tooling/reproducible).

---

#### Foundational Papers

These are the primary sources behind results used throughout Arth. Each is listed with author, title, year, and journal.

- Harry Markowitz, "Portfolio Selection", *Journal of Finance*, 1952.
- John L. Kelly Jr., "A New Interpretation of Information Rate", *Bell System Technical Journal*, 1956.
- Fischer Black and Myron Scholes, "The Pricing of Options and Corporate Liabilities", *Journal of Political Economy*, 1973.
- Robert C. Merton, "On the Pricing of Corporate Debt: The Risk Structure of Interest Rates", *Journal of Finance*, 1974.
- Robert F. Engle, "Autoregressive Conditional Heteroscedasticity with Estimates of the Variance of United Kingdom Inflation", *Econometrica*, 1982.
- Albert S. Kyle, "Continuous Auctions and Insider Trading", *Econometrica*, 1985.
- Tim Bollerslev, "Generalized Autoregressive Conditional Heteroskedasticity", *Journal of Econometrics*, 1986.
- Robert F. Engle and Clive W. J. Granger, "Co-integration and Error Correction: Representation, Estimation, and Testing", *Econometrica*, 1987.
- Whitney K. Newey and Kenneth D. West, "A Simple, Positive Semi-Definite, Heteroskedasticity and Autocorrelation Consistent Covariance Matrix", *Econometrica*, 1987.
- Andrew W. Lo and A. Craig MacKinlay, "Stock Market Prices Do Not Follow Random Walks: Evidence from a Simple Specification Test", *Review of Financial Studies*, 1988.
- André F. Perold, "The Implementation Shortfall: Paper versus Reality", *Journal of Portfolio Management*, 1988.
- James D. Hamilton, "A New Approach to the Economic Analysis of Nonstationary Time Series and the Business Cycle", *Econometrica*, 1989.
- Steven L. Heston, "A Closed-Form Solution for Options with Stochastic Volatility with Applications to Bond and Currency Options", *Review of Financial Studies*, 1993.
- Eugene F. Fama and Kenneth R. French, "Common Risk Factors in the Returns on Stocks and Bonds", *Journal of Financial Economics*, 1993.
- Yoav Benjamini and Yosef Hochberg, "Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing", *Journal of the Royal Statistical Society, Series B*, 1995.
- Robert Almgren and Neil Chriss, "Optimal Execution of Portfolio Transactions", *Journal of Risk*, 2000.
- Yakov Amihud, "Illiquidity and Stock Returns: Cross-Section and Time-Series Effects", *Journal of Financial Markets*, 2002.
- Marco Avellaneda and Sasha Stoikov, "High-Frequency Trading in a Limit Order Book", *Quantitative Finance*, 2008.
- David H. Bailey and Marcos López de Prado, "The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting, and Non-Normality", *Journal of Portfolio Management*, 2014.

---

#### On-Chain and Decentralised Finance

This field has no settled textbook canon, and books written about it date faster than any other subject on this page. The primary sources below are stable; treat everything else as needing a currency check.

- **Satoshi Nakamoto — "Bitcoin: A Peer-to-Peer Electronic Cash System".** Nine pages, and still the clearest statement of the problem the whole field is trying to solve.
- **Gavin Wood — "Ethereum: A Secure Decentralised Generalised Transaction Ledger" (the Yellow Paper).** The formal specification of the Ethereum virtual machine and its gas model.
- **The Uniswap v2 and v3 core whitepapers.** The primary sources for the constant-product invariant and for concentrated liquidity. Short, precise, and worth reading before any secondary explanation.
- **Philip Daian and co-authors — "Flash Boys 2.0: Frontrunning, Transaction Reordering, and Consensus Instability in Decentralized Exchanges".** The paper that named and formalised maximal extractable value.
- **Guillermo Angeris and Tarun Chitra — "Improved Price Oracles: Constant Function Market Makers".** The theoretical framing of AMMs as a general class rather than a specific product.
- **Guillermo Angeris and co-authors — "An Analysis of Uniswap Markets".** Careful analysis of arbitrage behaviour and price tracking in constant-product pools.
- **Protocol documentation and the Ethereum Improvement Proposal repository.** For anything version-specific, the protocol's own current documentation is the only reliable source.

Related pages: [What Is DeFi](/welcome/what-is-defi), [AMMs In Depth](/protocols/amms-depth), [MEV Overview](/building-blocks/mev-overview), [Protocol Archetypes](/reference/protocols).

---

#### Context and Narrative

Not technical, and useful for a sense of how markets fail and how people behave when they do.

- **Peter L. Bernstein — *Against the Gods: The Remarkable Story of Risk*.** A history of how the idea of measurable risk developed.
- **Roger Lowenstein — *When Genius Failed*.** The collapse of Long-Term Capital Management. A case study in leverage, correlation, and liquidity failing at once.
- **Michael Lewis — *Flash Boys*.** Contested as reportage, and still the most widely read account of modern market structure.
- **Scott Patterson — *Dark Pools*.** A longer and more careful history of electronic market structure than the above.
- **Benoit Mandelbrot and Richard L. Hudson — *The (Mis)Behavior of Markets*.** The case against normally distributed returns, made accessibly by the person who made it first.
- **Emanuel Derman — *Models.Behaving.Badly*.** A short argument about what financial models can and cannot be. Pairs well with the assumptions section of any page on this site.

---

#### What This Page Deliberately Omits

- **Blog posts, courses, and video series.** They move and disappear, and a reference page that links to dead resources is worse than one that does not link at all.
- **Anything whose author or title could not be stated with certainty.** Several works that would otherwise belong here were left out rather than cited approximately.
- **Vendor and exchange documentation.** Always go to the current source directly; contract specifications and fee schedules change without notice.
- **Edition numbers, publishers, and page references.** These differ across printings and would create false precision.

---

#### See Also

* [Prerequisites](/welcome/prerequisites)
* [Reading Paths](/welcome/reading-paths)
* [Glossary](/reference/glossary)
* [Formula Reference](/reference/formulas)
* [Code Snippets](/reference/code-snippets)
* [How to Contribute](/contributing/how-to-contribute)

---

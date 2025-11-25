## Quantitative Impacts & Modeling

Searchers and protocol designers rely on quantitative models to estimate MEV profit, user cost, and welfare
redistribution. This section covers the core math behind auctions, latency advantages, and social utility.

### Gas auctions and bidding

Gas markets resemble first-price auctions with endogenous block space. Expected clearing prices depend on
searcher competition, bundle profitability, and validator policies. Modeling involves equilibrium analysis and
historical mempool data.

### Latency games

Milliseconds of latency advantage can translate into consistent edge. Queueing theory models arrival processes
and success probabilities for competing bundles, while network simulations quantify benefits of specialized
infrastructure.

### Slippage and price impact

MEV profits often derive from predictable slippage in AMMs. Linking invariant equations to probabilistic order
flow lets analysts forecast profits and user loss. Monte Carlo scenarios stress test how liquidity and volatility
shape outcomes.

### Fairness and welfare

Welfare analysis compares user cost, validator revenue, and searcher profit. Metrics such as surplus distribution
or fairness curves guide protocol design decisions and regulatory debates.

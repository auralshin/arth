## How Blocks Form

Before transactions land on-chain they traverse gossip networks, mempools, block builders, and proposer
policies. Each stage introduces latency and ordering incentives that MEV searchers exploit.

### Mempools and propagation

Nodes maintain local views of pending transactions. Differences arise from propagation delays, bandwidth
limits, and relay policies (e.g., private mempools). Gas pricing heuristics determine which transactions stay
buffered and which are dropped under load.

### Builder and proposer separation

Modern Ethereum uses Proposer/Bidder Separation (PBS) and markets like MEV-Boost. Builders assemble bundles,
compute bids, and submit blocks to proposers who select the most profitable bundle. This structure concentrates
ordering power in builders and relays, shaping who captures MEV.

### Inclusion policies and latency

Validators apply policies: strict gas-price ordering, inclusion lists, or censorship preferences. Latency
advantages let searchers insert transactions just before block sealing. Modeling propagation delay, bundle
size, and validator behavior is essential for estimating order success rates.

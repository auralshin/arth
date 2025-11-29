### Roadmap and Content Priorities

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, planning, roadmap

This page outlines planned topics, content gaps, and priorities for Arth documentation. Use it to identify high-value contribution areas, propose new topics, or understand where the project is heading.

---

#### Current Priorities

**High Priority (Q1 2024)**
- **Concentrated Liquidity Deep Dive**: Advanced mechanics, capital efficiency, range management
- **MEV and Transaction Ordering**: Sandwich attacks, backrunning, searcher strategies
- **Protocol Risk Frameworks**: Systematic risk assessment for DeFi protocols
- **Yield Optimization Strategies**: Auto-compounding, rebalancing, multi-pool strategies
- **On-chain Data Analysis**: Using Dune, subgraphs, and direct RPC calls

**Medium Priority (Q2 2024)**
- **Governance Mechanisms**: Token voting, delegation, proposal lifecycle
- **Cross-chain Bridges**: Security models, liquidity networks, trade-offs
- **Options and Derivatives**: On-chain options protocols, perps, structured products
- **Stablecoin Mechanics**: Collateralized, algorithmic, and hybrid designs
- **Gas Optimization**: Smart contract patterns for minimizing transaction costs

**Ongoing**
- **Protocol Updates**: Keep existing pages current as protocols evolve (Uniswap v4, Aave v4, etc.)
- **Code Examples**: Add more Solidity, Python, and TypeScript examples to existing pages
- **Case Studies**: Real-world protocol incidents, attacks, or successes
- **Simulation Notebooks**: Jupyter notebooks for modeling and analysis

---

#### Content Gaps

**Missing Foundational Topics**
- Flash loans: mechanics, use cases, risks
- Oracle design: price feeds, TWAP, Chainlink vs Uniswap oracles
- Rebase tokens: mechanics and integration challenges
- ERC-20 extensions: permit, hooks, fee-on-transfer

**Advanced Topics Needed**
- Multi-hop routing optimization algorithms
- Dynamic fee models (Uniswap v4 hooks)
- Just-in-time liquidity strategies
- Cross-domain MEV (L1-L2 arbitrage)
- Protocol composability: building on multiple primitives

**Practical Guides**
- Setting up a local fork for testing
- Building a simple MEV bot
- Creating custom Dune dashboards
- Integrating Tenderly or Foundry for simulations

---

#### Community Requests

Topics suggested by community members (from GitHub Issues or Discord):

**Requested (Open)**
- [ ] Curve stableswap invariant mathematical derivation (#42)
- [ ] Comparison of concentrated liquidity implementations (#38)
- [ ] NFT-based liquidity positions (Uniswap v3, Maverick) (#35)
- [ ] Impermanent loss hedging strategies (#29)
- [ ] Tokenomics design best practices (#27)

**Completed**
- [x] Liquidity pool basics and LP tokens (#15)
- [x] AMM 101: constant product formula (#12)
- [x] Yield farming and emissions (#8)

See full list: [GitHub Issues tagged "content-request"](https://github.com/auralshin/arth/issues?q=is%3Aissue+is%3Aopen+label%3Acontent-request)

---

#### Contribution Opportunities

**Good for Beginners**
- Write a "What is..." explainer for a DeFi primitive
- Add code examples to existing pages (e.g., swap function in Solidity)
- Create a Jupyter notebook demonstrating impermanent loss calculation
- Document a specific protocol (e.g., GMX, Balancer, Velodrome)

**Advanced Contributors**
- Derive and explain advanced AMM invariants (Curve, Balancer weighted pools)
- Analyze historical MEV attacks with on-chain data
- Build simulation comparing capital efficiency across AMM designs
- Write a comprehensive risk framework for evaluating new protocols

**Research-Oriented**
- Literature review: academic papers on AMM design
- Empirical analysis: LP profitability across protocols
- Game-theoretic modeling: governance attack scenarios
- Economic impact: how protocol parameter changes affect behavior

---

#### Proposing New Topics

**How to Suggest**
1. **Check Existing Content**: Search docs to avoid duplication
2. **Open a GitHub Issue**: Use "content-request" template
3. **Provide Context**: Explain why the topic matters and who benefits
4. **Outline Scope**: Suggest sections or subtopics to cover
5. **Tag Appropriately**: Use labels like "foundational," "advanced," "protocol-specific"

**Proposal Template**
```text
Title: [Topic Name]

Description:
Brief explanation of what the topic covers.

Why it matters:
Real-world use cases, relevance to practitioners.

Suggested scope:
- Section 1: ...
- Section 2: ...
- Section 3: ...

Prerequisites:
What readers should know before reading this.

Related topics:
Links to existing docs or external resources.
```

**Maintainer Review**
- Proposals reviewed within 1 week
- Feedback on scope, priority, and fit
- Approved proposals added to roadmap
- Contributors encouraged to write the content (or find co-authors)

---

#### Version-Specific Content

As protocols release major upgrades, documentation needs updating:

**Uniswap**
- v2: Covered in AMM 101, liquidity pools
- v3: Concentrated liquidity page
- v4: Planned (hooks, custom pools, singleton architecture)

**Aave**
- v2: Covered in lending/borrowing sections (if exists)
- v3: Efficiency mode, isolation mode, portals
- v4: Planned when released

**Curve**
- v1: Stableswap invariant
- v2: Crypto pools (tricrypto)
- Updates: Ongoing as new pool types emerge

**Approach**: Maintain version-specific pages when mechanics differ significantly. Otherwise, note version differences inline.

---

#### Long-Term Vision

**Comprehensive DeFi Knowledge Base**
- Cover all major primitives: AMMs, lending, derivatives, stablecoins, bridges
- Protocol-agnostic foundations + protocol-specific deep-dives
- Balance theory (math, economics) with practice (code, case studies)
- Make advanced topics accessible without sacrificing rigor

**Tooling and Ecosystem**
- Integrate simulation tools directly into docs (e.g., embedded calculators)
- Link to open-source codebases and reference implementations
- Create standard templates for protocol analysis
- Build community-maintained data dashboards

**Maintenance and Currency**
- Regular audits to update outdated information
- Protocol version tracking and deprecation notices
- Archive historical content (e.g., "How Uniswap v1 Worked")
- Community-driven alerts for inaccuracies

---

#### How to Influence Priorities

**Active Participation**
- Submit high-quality PRs for requested topics
- Review others' contributions thoughtfully
- Engage in GitHub Discussions on roadmap and priorities
- Propose and lead working groups for major initiatives

**Voting and Governance**
- Community polls on Discord for topic prioritization (informal)
- Maintainers make final decisions based on community input, urgency, and strategic fit
- Transparent roadmap updates shared monthly

**Sponsorship and Grants** (Future)
- Potential for grants to fund specific content development
- Protocol teams may sponsor comprehensive coverage of their ecosystem
- All content remains open-source and unbiased

---

#### See Also

* [How to Contribute](/contributing/how-to-contribute) – Contribution workflow
* [Community](/contributing/community) – Engagement channels
* [GitHub Issues: content-request](https://github.com/auralshin/arth/issues?q=is%3Aissue+is%3Aopen+label%3Acontent-request) – Suggested topics

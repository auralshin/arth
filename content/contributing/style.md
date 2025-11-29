### Style Guide

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, writing, standards

This style guide defines terminology, notation, formatting, and usage conventions across Arth documentation. Consistency in these details improves readability, reduces ambiguity, and maintains a professional standard. Refer to this page when editing existing content or creating new pages.

---

#### Technical Terminology

**Preferred Terms**
- **smart contract** (not "smart-contract" or "smartcontract")
- **liquidity pool** (not "pool" alone unless context is clear)
- **automated market maker (AMM)** on first use, then "AMM"
- **decentralized exchange (DEX)** on first use, then "DEX"
- **liquidity provider (LP)** on first use, then "LP"
- **impermanent loss** (not "divergence loss" or "opportunity cost")
- **gas fee** or **transaction cost** (not "gas price" for end-user cost)
- **on-chain** (hyphenated when used as adjective, e.g., "on-chain data")
- **off-chain** (hyphenated when used as adjective)
- **yield farming** (not "liquidity mining" unless protocol-specific)

**Protocol and Token Names**
- Use official capitalization: Uniswap, Aave, Compound, Curve
- Spell out full name on first reference: "Uniswap v3" before using "v3"
- Token symbols in uppercase without periods: ETH, USDC, DAI (not E.T.H. or Eth)

**Blockchain Networks**
- Ethereum mainnet (lowercase "mainnet")
- Polygon, Arbitrum, Optimism (capitalize network names)
- Layer 2 or L2 (not "layer-2" or "l2")

---

#### Mathematical Notation

**Subscripts and Superscripts**
- Inline variables use HTML tags: `S<sub>t</sub>`, `x<sub>i</sub>`, `π<sub>pool</sub>`
- Time indices: `t`, `t+1`, `t-1` (not `_{t}` or other LaTeX)
- Pool or asset indices: `i`, `j`, `k`
- Greek letters: Use Unicode (`π`, `Δ`, `Σ`) or HTML entities (`&pi;`, `&Delta;`, `&Sigma;`)

**Display Formulas**
Use `formula` code blocks for centered equations (triple backticks with `formula` as the language identifier).
- Keep formulas simple and readable
- Define all variables immediately before or after the formula
- Use HTML subscripts within formula blocks: `<sub>t</sub>`

**Numbers and Percentages**
- Percentages: Use "5%" not "5 percent" or "five percent"
- Large numbers: Use commas for readability (1,000,000 not 1000000)
- Decimals: Maximum 4 significant figures unless precision is critical (0.0123 not 0.012345678)
- Basis points: "50 bps" or "50 basis points" on first use

**Ratios and Fractions**
- Use `x/y` for inline fractions
- Use `·` (middle dot) for multiplication: `x · y` not `x * y` or `xy`
- Division in formulas: `/` or fraction notation

---

#### Capitalization

**Section Headings**
- Use sentence case for h4 and below: "Liquidity pool mechanics" not "Liquidity Pool Mechanics"
- Capitalize proper nouns and protocol names: "Uniswap v3 range orders"

**UI Elements and Code**
- Function names, variables, and code: preserve exact casing from source (`swapExactTokensForTokens`, `msg.sender`)
- Smart contract events: PascalCase as defined (`Transfer`, `Swap`, `Mint`)

**Acronyms**
- All caps on first use with definition: "automated market maker (AMM)"
- Subsequent uses: "AMM" or "AMMs" (plural)
- No periods: AMM not A.M.M.

---

#### Links and References

**Internal Links**
- Use descriptive text: "[concentrated liquidity](/building-blocks/concentrated-liquidity)" not "click here"
- Avoid bare URLs in prose; use markdown link syntax
- Link to specific sections when possible: `/guards#authorization-guards`

**External Links**
- Protocol documentation: link to official docs or GitHub
- Research papers: link to arxiv.org, DOI, or authoritative source
- Dashboard or analytics: link to Dune, DeFiLlama, or protocol-native analytics
- Mark external links where helpful: "see [Uniswap v3 whitepaper](https://uniswap.org/whitepaper-v3.pdf) (external)"

**Citations**
- Inline citations for claims: "According to [source], ..."
- Footnotes for supplementary references when needed
- Always link to primary sources, not secondary summaries

---

#### Lists and Formatting

**Bulleted Lists**
- Use bullets for unordered items
- Use parallel structure: all items start with verbs, or all are noun phrases
- Capitalize first word of each item
- No period at end unless item is a complete sentence

**Numbered Lists**
- Use numbers for sequential steps or ranked items
- Start each item with a capital letter
- Use periods at the end if items are full sentences

**Code Blocks**
- Always specify language: ` ```solidity`, ` ```python`, ` ```typescript`
- Use comments to explain non-obvious logic
- Keep examples focused and minimal; avoid boilerplate

**Emphasis**
- **Bold** for key terms or important warnings
- *Italic* for emphasis or variable names in prose
- `Code formatting` for inline code, function names, variable names

---

#### Voice and Tense

- **Third person**: "The protocol calculates..." not "You calculate..." or "We calculate..."
- **Present tense**: "The pool adjusts prices" not "The pool will adjust" or "The pool adjusted"
- **Active voice**: "Arbitrageurs restore balance" not "Balance is restored by arbitrageurs"
- **Declarative**: State facts, avoid tutorial language ("Let's see..." or "Now we will...")

---

#### Diagrams and Visuals

- Use clear, simple diagrams with labeled components
- Place diagrams after the paragraph that introduces them
- Include alt text for accessibility: `![AMM curve diagram](path/to/image.png "Constant product invariant visualization")`
- Use consistent color schemes across related diagrams

---

#### Version and Protocol Specifics

- When discussing protocol behavior, specify version: "Uniswap v2" or "Uniswap v3"
- Note when behavior differs across versions
- Indicate if information is network-specific (e.g., "on Ethereum mainnet")

---

#### See Also

* [Content Guidelines](/contributing/content-guidelines) – Overall writing standards
* [New Page](/contributing/new-page) – Template for creating content
* [Code Examples](/contributing/code-examples) – Standards for code snippets


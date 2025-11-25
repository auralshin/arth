# Content Format Guide

This document describes the formatting conventions, structure, and style used throughout the Arth documentation. Follow these guidelines when creating new pages or updating existing content.

---

## Page Structure

Every documentation page should follow this template:

```markdown
### Page Title

> info **Metadata** Level: [Beginner/Intermediate/Advanced/All] | Prerequisites: [list or "None"] | Tags: [tag1, tag2, tag3]

[Opening paragraph that states what this page covers and why it matters]

---

#### First Major Section

[Content...]

---

#### Second Major Section

[Content...]

---

#### See Also

* [Related Topic 1](link)
* [Related Topic 2](link)
```

### Key Elements

1. **Title (h3)**: Use `###` for the main page title
2. **Metadata Block**: Always include immediately after title
3. **Opening Paragraph**: Hook + context (1-3 paragraphs)
4. **Horizontal Rules**: Use `---` to separate major sections
5. **Subsections (h4)**: Use `####` for main content sections
6. **See Also**: End with related links when applicable

---

## Metadata Block Format

The metadata block uses the info callout and must include:

```markdown
> info **Metadata** Level: [Level] | Prerequisites: [List] | Tags: [comma, separated, tags]
```

### Level Guidelines

- **All**: Suitable for all readers (welcome, overview, reference pages)
- **Beginner**: No prior DeFi or quant knowledge required
- **Intermediate**: Assumes basic DeFi concepts or some math/stats background
- **Advanced**: Requires deep protocol knowledge, complex math, or both

### Prerequisites

- Use `None` for welcome/introductory pages
- List specific concepts: "AMMs, impermanent loss, basic statistics"
- Link to prerequisite pages when possible

### Tags

Use lowercase, hyphenated tags. Common categories:

- **Content type**: `overview`, `tutorial`, `reference`, `case-study`
- **Topic area**: `defi`, `amm`, `lending`, `signals`, `risk`, `math`
- **Concepts**: `volatility`, `liquidity`, `leverage`, `backtesting`
- **Tools**: `python`, `typescript`, `simulation`

---

## Writing Style

### Voice and Tone

- **Clear and direct**: Avoid unnecessary jargon
- **Educational, not prescriptive**: Explain concepts, don't give trading advice
- **Respectful of reader's background**: Provide multiple entry points
- **Honest about limitations**: Call out assumptions, risks, and edge cases

### Key Principles

1. **Define before abbreviating**

   ```markdown
   The **Relative Strength Index (RSI)** measures momentum...
   
   Later you can use: The RSI typically ranges from 0 to 100...
   ```

2. **Front-load important context**
   - State assumptions early
   - Put warnings near the top, not buried in text
   - Use opening paragraphs to set expectations

3. **Use consistent terminology**
   - Pick one term and stick with it (e.g., "liquidity pool" not "pool" then "LP" then "liquidity")
   - Define variants when they appear

4. **Structure for scanning**
   - Use headings liberally
   - Break long paragraphs into shorter ones
   - Use lists for parallel items
   - Highlight key formulas, warnings, and takeaways

---

## Content Conventions

### Mathematical Notation

Follow consistent notation across all pages:

**Prices and Returns**

- `P_t` — price at time t
- `R_t` — simple return
- `r_t` — log return
- `sigma` — volatility

**Portfolio and Strategy**

- `w_i` — weight of asset i
- `R_p` — portfolio return
- `S` — Sharpe ratio
- `MDD` — maximum drawdown
- `f` — position size fraction

**Probability**

- `E[X]` — expectation of X
- `Var(X)` — variance of X
- `Cov(X, Y)` — covariance
- `rho` — correlation

See [Notation & Conventions](/welcome/notation-conventions) for full reference.

### Formulas

Present formulas in blocks with context:

```markdown
The simple return is calculated as:

$$
R_t = \frac{P_t - P_{t-1}}{P_{t-1}}
$$

where:
- `P_t` is the current price
- `P_{t-1}` is the previous price
```

### Code Examples

Use fenced code blocks with language tags:

````markdown
```python
# Python example with descriptive variable names
returns = prices.pct_change().dropna()
volatility = returns.std() * np.sqrt(252)
```

```typescript
// TypeScript example
const calculateReturn = (current: number, previous: number): number => {
  return (current - previous) / previous;
};
```

```text
# Pseudocode when language doesn't matter
for each time step:
    calculate signals
    if entry_condition:
        open_position(size, direction)
```
````

**Code Style**:

- Use descriptive names (`position_size`, not `ps`)
- Keep examples short and focused
- Omit error handling/production code unless that's the point
- Comment the "why", not the "what"

---

## Callouts and Admonitions

Use blockquotes with special prefixes for different types of callouts:

### Info Blocks (General Information)

```markdown
> info **Note Title** Additional context or clarification
```

### Warning Blocks (Important Caveats)

```markdown
> warning **Risk** This approach assumes constant volatility, which rarely holds in practice.
```

### Tip Blocks (Helpful Advice)

```markdown
> tip **Pro tip** Use log returns when aggregating over time to avoid compounding bias.
```

Use callouts to:

- Highlight assumptions
- Call out common mistakes
- Provide warnings about risk or limitations
- Offer practical tips

---

## Lists and Tables

### Lists

Use lists for:

- Parallel items or steps
- Prerequisites or requirements
- Related concepts

```markdown
**Beginner readers should:**

* Start with Building Blocks
* Skim formulas; focus on intuition
* Use examples and diagrams
```

### Tables

Use tables for structured comparisons:

```markdown
<table>
  <tbody>
    <tr>
      <td><strong>Section</strong></td>
      <td><strong>Description</strong></td>
    </tr>
    <tr>
      <td>Building Blocks</td>
      <td>Core DeFi concepts: AMMs, lending, oracles</td>
    </tr>
    <tr>
      <td>Signals</td>
      <td>Indicators like RSI, MACD, and on-chain metrics</td>
    </tr>
  </tbody>
</table>
```

---

## Page-Specific Formats

### Overview/Navigation Pages

Structure:

1. Welcome statement
2. Who this is for / how to use it
3. Visual map or table of sections
4. Tips for navigation
5. What to do if lost

Example: [How to Navigate](/welcome/how-to-navigate)

### Strategy Pages

Required sections:

1. **Overview**: What the strategy does (plain language)
2. **Intuition**: Why it might work
3. **Setup**: Assets, timeframes, parameters
4. **Rules**: Entry, exit, position sizing
5. **Metrics**: Performance measures used
6. **Risks**: What can go wrong
7. **Variations**: Common tweaks
8. **See Also**: Related strategies/concepts

### Indicator/Signal Pages

Required sections:

1. **Definition**: What it measures
2. **Formula**: Mathematical definition with variable explanations
3. **Intuition**: How to interpret values
4. **Usage**: Common trading rules or thresholds
5. **Limitations**: When it fails or misleads
6. **Code Example**: Python or TypeScript implementation
7. **See Also**: Related indicators

### Concept/Building Block Pages

Structure:

1. **What it is**: Plain language definition
2. **Why it matters**: Real-world importance
3. **How it works**: Mechanism or process
4. **Example**: Concrete scenario
5. **Risks/Trade-offs**: Downsides or failure modes
6. **See Also**: Related concepts and deep dives

---

## Links and Cross-References

### Internal Links

Use relative paths for internal links:

```markdown
See [AMMs 101](/building-blocks/amms-101) for background.

For the mathematical foundation, check [Returns & Volatility](/quant-math/returns).
```

### External Links

Always include titles and open in new tabs when appropriate:

```markdown
For implementation details, see the [Uniswap v3 whitepaper](https://uniswap.org/whitepaper-v3.pdf).
```

### "See Also" Sections

End substantive pages with 3-5 related links:

```markdown
---

#### See Also

* [Impermanent Loss](/building-blocks/impermanent-loss) – Risk side of LP positions
* [Concentrated Liquidity](/protocols/concentrated-liquidity) – Uniswap v3 architecture
* [LP Strategies](/strategies/lp-business) – How to manage LP positions actively
```

---

## Risk and Disclaimer Language

### Required Disclaimers

Pages discussing strategies, returns, or actionable content should include:

```markdown
> warning **Not Financial Advice** This content explains concepts and tools for educational purposes. It is not investment, trading, or financial advice. Any decisions based on these ideas are your own responsibility.
```

### Honest About Limitations

Always be explicit about:

- **Simplifications**: "This analysis ignores gas costs and MEV"
- **Assumptions**: "Assumes constant volatility and no regime changes"
- **Backtesting caveats**: "Historical results do not guarantee future performance"
- **Data issues**: "Limited sample size; results may not be robust"

Example:

```markdown
> warning **Backtest Limitations** This example uses clean 1-hour OHLCV data and assumes no slippage, gas costs, or failed transactions. Real trading would face all of these frictions.
```

---

## File Naming

### Markdown Files

Use kebab-case for file names matching route slugs:

```
content/building-blocks/amms-101.md
content/quant-math/sharpe.md
content/strategies/rsi-strategy.md
```

### Images and Assets

Store in `src/assets/images/` with descriptive names:

```
amm-constant-product-curve.png
impermanent-loss-chart.svg
rsi-divergence-example.png
```

Reference in markdown:

```markdown
![AMM Constant Product Curve](/assets/images/amm-constant-product-curve.png)
```

---

## Editing Checklist

Before submitting new content, verify:

- [ ] Metadata block is present and complete
- [ ] Title uses h3 (`###`)
- [ ] Sections use h4 (`####`)
- [ ] Formulas have explanations of variables
- [ ] Code examples have language tags and comments
- [ ] Assumptions and risks are stated early
- [ ] "See Also" links are included (if applicable)
- [ ] No jargon without definition
- [ ] Consistent notation (check [Notation & Conventions](/welcome/notation-conventions))
- [ ] Disclaimers included for strategy/trading content
- [ ] Links work and point to correct pages
- [ ] Markdown renders correctly (preview before commit)

---

## Examples to Follow

**Good navigation/overview pages:**

- [How to Navigate](/welcome/how-to-navigate)
- [Reading Paths](/welcome/reading-paths)

**Good concept pages:**

- [Risk & Reality Check](/welcome/risk-reality-check)
- [Notation & Conventions](/welcome/notation-conventions)

**Strategy format reference:**

- Check any page in `/strategies/` for required sections

**Math/formula reference:**

- Check any page in `/quant-math/` for notation and explanation style

---

## Getting Help

If you're unsure about formatting:

1. Check similar existing pages in the same section
2. Review the examples linked above
3. Refer to [Contributing Guidelines](/contributing/how-to-contribute)
4. Ask in the community or open a draft PR for feedback

**Key principle**: Consistency matters more than perfection. Match the style of nearby pages, and the docs will feel cohesive.

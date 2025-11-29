### New Page Template

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, template

This page provides a complete template for creating new documentation pages in Arth. Copy the structure below and replace placeholder text with your content. Refer to [Content Guidelines](/contributing/content-guidelines) and [Style Guide](/contributing/style) for detailed standards.

---

#### File Location and Naming

Place new pages in the appropriate content directory:
- **Building blocks**: `content/building-blocks/` – Core DeFi primitives (AMMs, pools, swaps)
- **Strategies**: `content/strategies/` – Trading and portfolio strategies
- **Protocols**: `content/protocols/` – Specific protocol deep-dives
- **Tooling**: `content/tooling-simulation-ecosystem.md` or subdirectories
- **Case Studies**: `content/case-studies/` – Real-world examples and post-mortems
- **Meta**: `content/meta/` – Governance, tokenomics, risk frameworks

File names should be lowercase, hyphen-separated, descriptive: `concentrated-liquidity.md`, `yield-farming.md`, `uniswap-v3-analysis.md`.

---

#### Page Template

Copy this structure for new pages:

```markdown
### Page Title

> info **Metadata** Level: foundational | Prerequisites: [prerequisite-page](/path/to/prerequisite) | Tags: category, topic, protocol

Opening paragraph: 2-3 sentences explaining what the topic is, why it matters, and what the page covers. Avoid tutorial language like "you will learn." Write in third person declarative style.

---

#### Core Concept One

First major section explaining foundational concepts. Define key terms, introduce variables, provide context.

Inline variables use HTML subscripts: S<sub>t</sub> represents state at time t, π<sub>pool</sub> represents pool fees.

Display formulas use code blocks:
```formula
L = √(x · y)
```

Define all variables immediately after formulas:
- L: Liquidity constant
- x: Reserve of token X
- y: Reserve of token Y

#### Core Concept Two

Second major section building on the first. Include:
- Mechanisms and dynamics
- Trade-offs and design choices
- Real-world behavior vs idealized models

#### Implementation and Integration

Practical considerations:
- How protocols implement the concept
- Integration patterns and stack diagrams
- Code examples where relevant

Example code block:
```solidity
function exampleFunction(uint256 amount) external {
    // Clear comments explaining logic
    uint256 result = amount * constant;
    emit Event(result);
}
```

#### Risks and Monitoring

What can go wrong:
- Technical risks (smart contract, oracle, liquidity)
- Economic risks (incentive misalignment, attack vectors)
- Operational risks (governance, upgrades)

Monitoring and metrics:
- Key indicators to track
- Data sources (Dune, DeFiLlama, protocol analytics)
- Warning signals and thresholds

#### Edge Cases and Limitations

Situations where the concept behaves unexpectedly:
- Extreme market conditions
- Low liquidity or high volatility scenarios
- Protocol-specific quirks

Acknowledge limitations of analysis or model assumptions.

---

#### See Also

* [Related Topic One](/path/to/related-one) – Brief description
* [Related Topic Two](/path/to/related-two) – Brief description
* [Related Topic Three](/path/to/related-three) – Brief description
* [External Resource](https://example.com) – Description (external)
```

---

#### Section Guidelines

**Opening Paragraph**
- 2-3 sentences maximum
- State what the topic is, not "this page will teach you"
- Third person: "Concentrated liquidity allows..." not "You will learn how..."

**Metadata Block**
- **Level**: foundational, intermediate, advanced, or specialized
- **Prerequisites**: Link to required reading or "None"
- **Tags**: Comma-separated keywords for search and categorization

**Section Headings (h4)**
- Use sentence case: "Liquidity pool mechanics" not "Liquidity Pool Mechanics"
- Organize logically: concepts → implementation → risks → edge cases
- Aim for 4-7 sections plus See Also

**Mathematical Notation**
- Inline: HTML tags `<sub>` and `<sup>`
- Display: `formula` code blocks
- Define all variables
- Keep equations readable, avoid excessive complexity

**Code Examples**
- Always specify language tag
- Include comments explaining logic
- Keep focused and minimal
- Test code for correctness

**See Also Section**
- 3-6 related links
- Mix internal and external references
- Use descriptive text, not bare URLs
- Group thematically if many links

---

#### Before Submitting

1. **Verify Structure**: Check that metadata, sections, and See Also are present
2. **Test Locally**: Run `npm start` and preview the page
3. **Check Links**: Ensure all internal links resolve correctly
4. **Validate Formulas**: Confirm subscripts and formula blocks render properly
5. **Review Style**: Match tone, terminology, and formatting to existing pages
6. **Run Build**: Ensure `npm run build` completes without errors

---

#### See Also

* [Content Guidelines](/contributing/content-guidelines) – Writing standards
* [Style Guide](/contributing/style) – Terminology and notation
* [Checklist](/contributing/checklist) – Pre-submission review
* [How to Contribute](/contributing/how-to-contribute) – Contribution workflow

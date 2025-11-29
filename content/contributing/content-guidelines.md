### Content Guidelines

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, documentation, style

These guidelines ensure consistency, clarity, and technical accuracy across all Arth documentation. They cover structure, tone, mathematical notation, and how to present complex DeFi concepts for different audiences.

---

#### Page Structure and Metadata

Every content page follows a standard template:

1. **Title** (h3 level): Clear, descriptive name for the topic
2. **Metadata block**: Level (All/Beginner/Intermediate/Advanced), Prerequisites, Tags
3. **Opening paragraph**: 2-3 sentences establishing what the topic is and why it matters
4. **Body sections** (h4 level): Logical breakdown of the topic
5. **See Also section**: Related pages with brief descriptions

**Example**: A metadata block uses the `> info` callout format with Level, Prerequisites, and Tags separated by pipes.

---

#### Tone and Voice

Write in **third person, declarative style**. Avoid:
- "You will learn" or tutorial language
- "This guide teaches" phrasing
- Marketing or promotional tone
- Subjective claims without data

**Good**: "Concentrated liquidity allows LPs to provide capital within chosen price ranges, increasing depth per unit capital."

**Bad**: "In this guide, you'll learn how concentrated liquidity can help you earn more fees!"

Frame concepts as analytical tools, not prescriptions. Present trade-offs, failure modes, and context rather than claiming one approach is always best.

---

#### Mathematical Notation

Use HTML subscripts and superscripts for inline variables:
- S<sub>t</sub> for time-indexed variables
- x<sub>i</sub> for indexed elements
- 2<sup>n</sup> for exponents

For display formulas, use code blocks with `formula` language (triple backticks with `formula` on the first line). The formula content should use HTML `<sub>` and `<sup>` tags for subscripts and superscripts.

This renders as a centered, styled formula block. Avoid:
- LaTeX `$$` blocks (not supported without KaTeX)
- Complex Unicode math that may not render consistently
- Images of equations (not accessible or searchable)

---

#### Code and Examples

When including code examples:
- Use appropriate language tags (typescript, javascript, python, solidity)
- Include context: what the code demonstrates and why it matters
- Comment critical lines or non-obvious logic
- Avoid overly minimal snippets that lack real-world context

For pseudo-code or algorithms, use plain text code blocks with clear structure. Number the steps and use descriptive variable names. Document inputs, outputs, and the algorithm steps clearly.

---

#### Linking and Cross-References

Link generously to related pages. Use descriptive link text:

**Good**: "See [Impermanent Loss](/building-blocks/impermanent-loss) for quantitative analysis of LP rebalancing effects."

**Bad**: "Click [here](/building-blocks/impermanent-loss) for more info."

Organize See Also sections thematically:
1. Prerequisites or foundational concepts
2. Related building blocks or protocols
3. Advanced applications or case studies
4. Tools and simulation references

---

#### Precision and Rigor

Be precise about:
- **Assumptions**: State when results depend on specific conditions
- **Approximations**: Note when using simplified models
- **Scope**: Clarify what's in and out of scope for the page
- **Data sources**: Cite when referring to empirical patterns or metrics

Avoid vague quantifiers like "often," "usually," "many" without supporting context. If a claim is empirical, acknowledge measurement challenges or data limitations.

---

#### Accessibility and Inclusivity

Write for international audiences:
- Define acronyms on first use
- Avoid idioms or cultural references that may not translate
- Provide context for terminology that varies across regions or protocols
- Use simple sentence structures where possible without sacrificing precision

Aim for readability by varying sentence length and breaking complex ideas into digestible chunks. Use bullet lists and numbered steps to organize multi-part concepts.

---

#### See Also

* [How to Contribute](/contributing/how-to-contribute) – Getting started with contributions
* [Style](/contributing/style) – Specific formatting and terminology conventions
* [New Page](/contributing/new-page) – Template for creating new content
* [Review Process](/contributing/review-process) – How submissions are evaluated

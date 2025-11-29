### Submission Checklist

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, review, quality

Use this checklist before submitting new content or edits to ensure quality, consistency, and technical accuracy. Address all items to streamline the review process and increase the likelihood of acceptance.

---

#### Content Structure

**Required Elements**

- [ ] **h3 title** at the top of the file
- [ ] **Metadata block** with Level, Prerequisites, and Tags
- [ ] **Opening paragraph** (2-3 sentences, third person, no tutorial language)
- [ ] **Horizontal rule** (`---`) after opening paragraph
- [ ] **4-7 h4 section headings** with logical flow
- [ ] **See Also section** at the end with 3-6 related links

**Structure Validation**

- [ ] Sections flow logically: concepts → implementation → risks → edge cases
- [ ] Each section is 2-5 paragraphs (not too short, not overwhelming)
- [ ] No orphaned h5 or h6 headings (use h4 for all main sections)

---

#### Writing Style

**Voice and Tone**

- [ ] Third person declarative: "The protocol calculates..." not "You calculate..."
- [ ] Present tense: "The pool adjusts" not "The pool will adjust"
- [ ] Active voice: "Arbitrageurs restore balance" not "Balance is restored"
- [ ] No tutorial language: avoid "Let's," "Now we will," "You will learn"

**Clarity and Precision**

- [ ] All technical terms defined on first use
- [ ] Acronyms spelled out: "automated market maker (AMM)" before using "AMM"
- [ ] Mathematical variables defined immediately before or after formulas
- [ ] Assumptions and limitations explicitly stated

**Terminology Consistency**

- [ ] Matches [Style Guide](/contributing/style) terminology (smart contract, liquidity pool, AMM, DEX)
- [ ] Protocol names use official capitalization (Uniswap, Aave, Compound)
- [ ] Token symbols uppercase without periods (ETH, USDC, DAI)

---

#### Mathematical Notation

**Inline Math**

- [ ] Variables use HTML subscripts: `S<sub>t</sub>`, `π<sub>i</sub>`
- [ ] Greek letters use Unicode or HTML entities: `π`, `Δ`, `Σ`
- [ ] Multiplication uses middle dot: `x · y` not `x * y`

**Display Formulas**

- [ ] All display formulas in `formula` code blocks
- [ ] HTML subscripts used inside formula blocks: `<sub>t</sub>`
- [ ] Variables defined immediately after formula block
- [ ] Formulas readable and not overly complex

**Formula Testing**

- [ ] All formulas render correctly in local preview
- [ ] Subscripts display properly (not as raw HTML)
- [ ] No Angular template errors from curly braces

---

#### Code Examples

**Code Standards**

- [ ] All code blocks specify language: ` ```solidity`, ` ```python`, ` ```typescript`
- [ ] Code includes explanatory comments
- [ ] Variable names are descriptive and consistent with prose
- [ ] Code has been tested and runs without errors (or noted as pseudo-code)

**Integration**

- [ ] Code introduced with context: "The following function demonstrates..."
- [ ] Code referenced in surrounding prose
- [ ] Simplified examples include disclaimer about missing production safeguards

---

#### Links and References

**Internal Links**

- [ ] All internal links use correct paths: `/building-blocks/liquidity-pools`
- [ ] Link text is descriptive: "[concentrated liquidity](/path)" not "click here"
- [ ] Links verified to resolve correctly in local preview
- [ ] See Also section has 3-6 related links

**External Links**

- [ ] Links to authoritative sources (protocol docs, whitepapers, research)
- [ ] External links marked when helpful: "(external)"
- [ ] No bare URLs in prose; use markdown link syntax

**Citations**

- [ ] Claims backed by sources where appropriate
- [ ] Links to primary sources, not secondary summaries
- [ ] Data and statistics cited with source and date

---

#### Technical Accuracy

**Verification**

- [ ] All formulas mathematically correct
- [ ] Code examples tested and verified
- [ ] Protocol behavior accurately described (version-specific if needed)
- [ ] No outdated information or deprecated patterns

**Scope and Limitations**

- [ ] Assumptions clearly stated (e.g., "assuming zero fees," "in ideal conditions")
- [ ] Edge cases and limitations acknowledged
- [ ] Caveats noted for simplified models

---

#### Build and Preview

**Local Testing**

- [ ] Run `npm start` and preview page in browser
- [ ] Verify all sections render correctly
- [ ] Check formulas, code blocks, and links display properly
- [ ] Test navigation to/from See Also links

**Build Validation**

- [ ] Run `npm run build` successfully (exit code 0)
- [ ] No Angular template errors (NG5002, NG8002, etc.)
- [ ] No broken link warnings
- [ ] Bundle size reasonable (check output logs)

**Cross-Browser Check**

- [ ] Page loads correctly in Chrome/Edge
- [ ] Formulas render in Firefox
- [ ] Mobile responsive layout works

---

#### Metadata and File Organization

**File Placement**

- [ ] File in correct directory: `building-blocks/`, `strategies/`, `protocols/`, etc.
- [ ] Filename lowercase, hyphen-separated, descriptive

**Metadata Accuracy**

- [ ] **Level** correctly set: foundational, intermediate, advanced, specialized
- [ ] **Prerequisites** list actual prerequisite pages or "None"
- [ ] **Tags** relevant and comma-separated

---

#### Pre-Submission Actions

**Self-Review**

- [ ] Read through entire page as if you were a new reader
- [ ] Check for typos, grammatical errors, awkward phrasing
- [ ] Verify consistency with existing documentation style

**Commit Message**

- [ ] Clear commit message: "Add concentrated liquidity documentation" not "Update files"
- [ ] Reference issue numbers if applicable: "Fixes #123"

**Pull Request Description**

- [ ] Explain what the PR adds or changes
- [ ] Provide context: why this content matters
- [ ] Note any areas where reviewer feedback is especially desired
- [ ] Tag relevant reviewers or maintainers

---

#### Post-Submission

**Responsiveness**

- [ ] Monitor PR for reviewer comments
- [ ] Respond to feedback within a reasonable timeframe
- [ ] Make requested changes and push updates
- [ ] Mark conversations as resolved once addressed

**Collaboration**

- [ ] Be open to suggestions and alternative approaches
- [ ] Provide rationale for choices if asked
- [ ] Acknowledge and thank reviewers for their time

---

#### See Also

- [Content Guidelines](/contributing/content-guidelines) – Writing standards
- [Style Guide](/contributing/style) – Terminology and notation
- [New Page](/contributing/new-page) – Page template
- [Review Process](/contributing/review-process) – How submissions are evaluated

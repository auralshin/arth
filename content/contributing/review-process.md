### Review Process

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, review, workflow

All contributions to Arth documentation go through a peer review process to ensure technical accuracy, consistency, and clarity. This page explains how submissions are evaluated, typical timelines, and how to incorporate feedback effectively.

---

#### Review Criteria

**Technical Accuracy**
- Formulas and mathematical notation are correct
- Protocol behavior accurately described (version-specific when relevant)
- Code examples tested and functional
- Claims backed by authoritative sources or data
- Edge cases and limitations acknowledged

**Content Quality**
- Clear, concise prose free of jargon overload
- Logical flow from concepts to implementation to risks
- Appropriate depth for the stated level (foundational, intermediate, advanced)
- Real-world context and practical considerations included

**Style Consistency**
- Matches [Content Guidelines](/contributing/content-guidelines) tone (third person declarative)
- Follows [Style Guide](/contributing/style) terminology and notation standards
- Proper structure: metadata, opening, sections, See Also
- Mathematical notation uses HTML subscripts and formula blocks

**Integration**
- Links to related pages appropriate and functional
- Fits cohesively within existing documentation structure
- No redundancy with existing pages unless intentional consolidation
- Adds value beyond what's already documented

---

#### Review Stages

**1. Initial Triage (1-2 days)**
- Maintainers confirm PR scope and relevance
- Check for basic formatting and structure
- Assign reviewers with topic expertise
- Flag any immediate blockers (missing files, broken builds)

**2. Technical Review (3-7 days)**
- Subject matter experts evaluate accuracy
- Reviewers verify formulas, code, and claims
- Feedback provided as inline comments or suggestions
- May request additional citations or clarifications

**3. Editorial Review (2-5 days)**
- Style and consistency check
- Tone, voice, and terminology alignment
- Link validation and cross-reference verification
- Suggestions for improved clarity or organization

**4. Final Approval (1-3 days)**
- All reviewer feedback addressed
- Build passes without errors
- Final sign-off from maintainer
- Merge to main branch and deployment

**Total Timeline**: Typically 1-2 weeks for new content, faster for minor edits

---

#### Types of Feedback

**Blocking Issues (Must Fix)**
- Technical inaccuracies or incorrect formulas
- Missing required elements (metadata, See Also)
- Build errors or broken links
- Code examples that don't compile/run
- Violations of content policy or licensing

**Improvement Suggestions (Recommended)**
- Clarity enhancements or reorganization
- Additional examples or context
- Link to related topics for cross-reference
- Terminology consistency adjustments
- Tone or voice refinements

**Optional Enhancements (Nice to Have)**
- Diagrams or visualizations
- Extended code examples
- Additional citations or data sources
- Future expansion ideas

---

#### Incorporating Feedback

**Best Practices**
1. **Respond Promptly**: Acknowledge feedback within a few days
2. **Ask for Clarification**: If feedback is unclear, request examples or specifics
3. **Make Changes Iteratively**: Push updates as you address comments
4. **Mark Resolved**: Use GitHub's "Resolve conversation" feature once addressed
5. **Explain Decisions**: If declining a suggestion, provide reasoning

**Handling Disagreements**
- Provide technical rationale for your approach
- Cite sources or examples supporting your position
- Seek input from additional reviewers if needed
- Escalate to maintainers for final decision on contentious issues

**Example Workflow**:
1. Reviewer comments: "Formula for impermanent loss appears incorrect"
2. Contributor responds: "Thanks! Fixed in commit abc123. Used formula from Uniswap v2 docs."
3. Reviewer verifies change and resolves conversation
4. Process continues with remaining feedback

---

#### Reviewer Roles

**Subject Matter Experts**
- Evaluate technical accuracy and depth
- Verify formulas, models, and protocol behavior
- Suggest additional context or considerations
- Typically protocol developers, researchers, or advanced practitioners

**Style and Consistency Reviewers**
- Check adherence to style guide and content guidelines
- Ensure consistent terminology and notation
- Verify structural requirements met
- Improve clarity and readability

**Maintainers**
- Provide final approval for merging
- Resolve conflicts or disagreements
- Ensure contribution aligns with roadmap and priorities
- Manage release and deployment

---

#### Self-Review Before Submission

Before requesting review, use the [Checklist](/contributing/checklist) to self-review:
- Run build locally and verify no errors
- Check formulas render correctly
- Test all links resolve
- Read through as if you were a new learner
- Verify code examples execute without errors

A thorough self-review reduces review cycles and speeds up approval.

---

#### After Merge

**Publication**
- Merged PRs deployed to production within 24-48 hours
- Content appears on docs.arth.fi (or staging environment first)
- Contributors notified when live

**Recognition**
- Added to Contributors list in repository
- Mentioned in release notes if significant contribution
- May be featured in community updates or newsletters

**Ongoing Maintenance**
- Authors may be asked to update content if protocols change
- Community members can submit corrections or improvements
- Maintainers monitor for outdated information

---

#### See Also

* [Checklist](/contributing/checklist) – Pre-submission review checklist
* [How to Contribute](/contributing/how-to-contribute) – Contribution workflow
* [Content Guidelines](/contributing/content-guidelines) – Writing standards
* [Community](/contributing/community) – Communication channels

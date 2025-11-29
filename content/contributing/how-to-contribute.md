### How to Contribute

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, open-source, community

Arth is an open-source knowledge hub for DeFi practitioners, researchers, and developers. Contributions span documentation improvements, new content, code examples, simulation notebooks, and tooling integrations. This page outlines how to get involved and what types of contributions are most valuable.

---

#### Types of Contributions

**Documentation and Content**
- New pages explaining DeFi primitives, protocols, or strategies
- Improvements to existing pages: clarifications, examples, diagrams
- Corrections of technical errors or outdated information
- Translations or accessibility improvements

**Code and Examples**
- Python notebooks demonstrating simulations or data analysis
- Smart contract examples and security patterns
- Integration guides for data providers or protocols
- Testing and bug fixes for documentation infrastructure

**Community and Curation**
- Discussions on Discord or GitHub about content direction
- Reviewing and providing feedback on pull requests
- Suggesting new topics or identifying gaps in coverage
- Sharing use cases or production learnings

---

#### Getting Started

1. **Read the Content Guidelines**  
   Familiarize yourself with our [Content Guidelines](/contributing/content-guidelines) to understand tone, structure, and mathematical notation standards.

2. **Identify a Contribution Area**  
   Browse the [Roadmap](/contributing/roadmap) for planned topics or check [GitHub Issues](https://github.com/auralshin/arth/issues) for requested content. You can also propose new topics.

3. **Set Up Your Environment**  
   Fork the repository and follow the setup instructions in the README. The project uses Angular, Dgeni for doc generation, and Markdown for content.

4. **Make Your Changes**  
   - For new content: use the [New Page](/contributing/new-page) template
   - For edits: make changes directly to the relevant `.md` files in `content/`
   - For code: ensure tests pass and follow existing patterns

5. **Submit a Pull Request**  
   Push your changes to your fork and open a PR. Provide context: what you're adding/fixing and why it matters. Reference related issues if applicable.

---

#### Content Creation Workflow

When creating new content pages:

1. **Research and Outline**  
   Gather technical references, protocol documentation, and empirical data. Outline the page structure before writing.

2. **Draft the Content**  
   Follow the standard template: title, metadata, opening, sections, See Also. Write in third-person declarative style.

3. **Add Mathematical Notation**  
   Use `<sub>` tags for subscripts and `formula` code blocks for display equations. Test rendering locally.

4. **Test Locally**  
   Run `npm start` to preview changes. Verify links work, formulas render correctly, and there are no build errors.

5. **Request Review**  
   Submit your PR and tag reviewers if you know who has expertise in the topic area. Be responsive to feedback.

---

#### Code Contributions

For code examples, notebooks, or tooling:

- **Notebooks**: Place in `content/simulation/` or `content/case-studies/` with clear documentation
- **Smart contracts**: Include security considerations and testing instructions
- **Tools integration**: Update relevant sections in `content/tooling-simulation-ecosystem.md`
- **Infrastructure**: Open an issue first to discuss approach before implementing

Ensure all code is well-commented and includes a README or inline explanation of what it demonstrates.

---

#### Community Standards

- Be respectful and constructive in all interactions
- Assume good intent; clarify misunderstandings before escalating
- Give credit: cite sources, acknowledge collaborators, link to related work
- Stay on topic: keep discussions focused on improving the knowledge hub

We aim for a technical, professional tone that welcomes practitioners at all levels while maintaining rigor. Avoid gatekeeping language or unnecessary jargon.

---

#### Recognition and Acknowledgment

Significant contributors will be acknowledged in:
- The Contributors section of the repository
- Specific page authorship notes where appropriate
- Community highlights in announcements or newsletters

While Arth is a non-commercial educational resource, we value and celebrate the time and expertise contributors share.

---

#### See Also

* [Content Guidelines](/contributing/content-guidelines) – Writing and formatting standards
* [Style](/contributing/style) – Terminology and notation conventions
* [Review Process](/contributing/review-process) – How submissions are evaluated
* [Roadmap](/contributing/roadmap) – Planned topics and priorities

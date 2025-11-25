### Arth: A DeFi Knowledge Hub

Arth is a focused knowledge hub for DeFi practitioners, quantitative researchers, and curious learners. It brings together clear, practical explanations of decentralized finance protocols, trading and yield strategies, and the quantitative modeling techniques that support them. Content ranges from approachable primers to deep-dive technical explainers.

Arth is built for people who like to connect theory with code. As you move through the docs, you'll see:

* **DeFi primers** that explain how protocols and primitives work.
* **Strategy write-ups** that show how traders and builders capture value or design automated strategies.
* **Mathematical explainers** with worked examples in probability, statistics, optimization, and numerical methods.

Many articles include code snippets, math notation, diagrams, and small, reproducible examples. Where it helps, we link to runnable examples or notebooks in
[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript),
[TypeScript](https://www.typescriptlang.org/), or
[Python](https://www.python.org/)
so you can reproduce results, tweak parameters, and see how ideas behave in practice.

The `content/` folder contains markdown pages grouped by topic. When you add a new page, place it next to related topics so readers can discover connected material via navigation and search.

#### Who Arth Is For

If you are:

* A **protocol engineer** designing or reviewing mechanisms,
* A **quant developer** building models, backtests, or execution systems, or
* An **active DeFi researcher or learner** trying to understand how things work under the hood,

you should find both hands-on tutorials and reference material here. A reasonable path through the docs is:

1. Start with **primers** to build intuition.
2. Move on to **strategy posts** once you're comfortable with basic concepts.
3. Dive into the **math and modeling** sections when you want more rigour.

#### Principles: Clarity, Rigour, Reproducibility

Each article should:

* State its **assumptions** explicitly.
* Include **references** or links where relevant.
* Provide at least one **small, reproducible example** (code, notebook, or worked calculation).

When you write about strategies or live markets, include short notes on:

* **Risk:** market regimes change, backtests can overfit, and historical performance is not predictive.
* **Execution:** slippage, liquidity, oracle risk, and gas costs all affect real outcomes.
* **Scope:** what the example does *not* cover (e.g. no L2 gas modeling, no MEV considerations).

Readers should be able to understand what was tested, under which assumptions, and how to reproduce or adapt the work.

---

#### Contributing

Contributions are welcome. Arth is meant to grow as a community-driven collection of explainers, tutorials, and references.

If you'd like to add content, update an article, or fix a typo, follow the steps below.

1. **Fork and branch**

   * Fork the repository.
   * Create a feature branch named:

     ```text
     feature/<short-description>
     ```

2. **Add or update content**

   * Add or edit a markdown file under the appropriate folder in `content/`.
   * Use clear headings and a logical structure.
   * Prefer small, focused changes over large, sweeping edits.
   * Make examples reproducible (include parameters, data sources, and any setup notes).

3. **Add assets (if needed)**

   * For protocol or project logos, use `logos/`.
   * For general site images, diagrams, or figures, use `src/assets/`.
   * Reference them using relative paths, for example:

     * `/logos/your-image.svg`
     * `assets/your-image.png`

4. **Install dependencies and generate docs locally**

   Using **npm**:

   ```bash
   npm install
   npm run docs    # regenerates docs using the Dgeni pipeline (runs the "docs-only" script)
   npm run start   # serve the site locally at http://localhost:4200/
   ```

   Using **yarn**:

   ```bash
   yarn            # installs dependencies
   yarn docs       # regenerates docs (runs the "docs-only" script)
   yarn start      # serve the site locally at http://localhost:4200/
   ```

   Using **pnpm**:

   ```bash
   pnpm install
   pnpm run docs
   pnpm run start
   ```

   Once the dev server is running, navigate to the relevant route and confirm that:

   * Your new page appears in the expected section.
   * Code blocks render correctly.
   * Links and images work.

5. **Run checks**

   * Run linters if available:

     ```bash
     npm run lint
     ```

   * Keep your markdown consistent with the existing style:

     * Use meaningful headings.
     * Keep line lengths reasonable.
     * Prefer fenced code blocks with language tags (for example, ` ```ts`, ` ```python`).

   * Keep commits small and atomic, with descriptive commit messages.

6. **Open a pull request**

   * Open a PR against the `master` branch.
   * In the description, explain:

     * What you changed.
     * Why you changed it.
     * Any reproduction steps, sample inputs, or supporting artifacts (data files, notebooks, diagrams).
   * A maintainer will review your changes and may request small adjustments before merging.

By contributing, you agree to the project's MIT license (see `LICENSE`). If you have questions about structure, content style, or the publication workflow, open an issue and describe what you're trying to do. We'll help you get oriented so you can focus on the content itself.

Thank you for helping build Arth. Every contribution makes the library more useful for the next reader.

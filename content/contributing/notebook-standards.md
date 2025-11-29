### Notebook Standards

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, jupyter, simulation, python

Jupyter notebooks are valuable tools for demonstrating DeFi simulations, data analysis, and protocol modeling. This page defines standards for creating, formatting, and integrating computational notebooks into Arth documentation.

---

#### When to Use Notebooks

**Appropriate Use Cases**
- Simulating protocol behavior under various market conditions
- Analyzing historical on-chain data (pool performance, LP profitability)
- Demonstrating mathematical models with interactive calculations
- Backtesting trading or liquidity strategies
- Visualizing complex dynamics (price impact, impermanent loss curves)

**When to Use Markdown Instead**
- Purely conceptual or theoretical content
- Documentation without computational components
- Content that doesn't benefit from interactivity
- Simple code examples that fit in a code block

---

#### Notebook Structure

**Required Sections**

1. **Title and Overview Cell** (Markdown)
   ```markdown
   # Topic Title
   
   **Author**: Your Name  
   **Date**: YYYY-MM-DD  
   **Prerequisites**: [Link to prerequisite topics]
   
   Brief description of what the notebook demonstrates and key takeaways.
   ```

2. **Setup and Imports Cell** (Code)
   ```python
   # Standard library imports
   import numpy as np
   import pandas as pd
   import matplotlib.pyplot as plt
   
   # Third-party imports
   from web3 import Web3
   import requests
   
   # Configuration
   plt.style.use('seaborn-v0_8-darkgrid')
   np.random.seed(42)  # For reproducibility
   ```

3. **Content Sections** (Alternating Markdown and Code)
   - Use markdown cells to explain what each section does
   - Follow with code cells demonstrating the concept
   - Include output (charts, tables, printed results)

4. **Conclusion Cell** (Markdown)
   - Summarize findings or key insights
   - Link to related notebooks or documentation pages
   - Suggest extensions or further exploration

---

#### Code Cell Standards

**Formatting**
- Use PEP 8 style: 4-space indentation, descriptive variable names
- Keep cells focused: one concept or calculation per cell
- Maximum 50-60 lines per cell; split longer logic into multiple cells
- Add comments explaining non-obvious logic

**Documentation**
```python
def calculate_impermanent_loss(price_ratio: float) -> float:
    """
    Calculate impermanent loss for constant product AMM.
    
    Args:
        price_ratio: Final price / initial price
    
    Returns:
        Impermanent loss as decimal (0.05 = 5% loss)
    """
    return 2 * np.sqrt(price_ratio) / (1 + price_ratio) - 1
```

**Output**
- Include outputs for all code cells (run before committing)
- Use clear visualizations with labels, titles, and legends
- Format printed output for readability (use f-strings, round decimals)

---

#### Markdown Cell Standards

**Explanations**
- Write in third person declarative: "This section demonstrates..." not "We will now..."
- Keep markdown cells concise: 2-5 sentences introducing code
- Use headers (`##`, `###`) to organize sections
- Include mathematical notation using LaTeX in markdown: `$x_{t+1} = x_t + \Delta x$`

**Visual Elements**
- Use **bold** for key terms or warnings
- Use `code formatting` for variable names or function references
- Include blockquotes for important notes:
  ```markdown
  > **Note**: This simulation assumes zero fees for simplicity.
  ```

---

#### Data and Dependencies

**External Data**
- Prefer publicly accessible data sources (Dune, DeFiLlama APIs)
- Include data fetching code in the notebook (or link to separate data file)
- Document data sources and date ranges
- Commit small data files (<1MB) to repo; link to larger datasets

**Dependencies**
- List all required packages in a `requirements.txt` or in opening cell:
  ```python
  # Required packages (install via pip):
  # numpy>=1.24.0
  # pandas>=2.0.0
  # matplotlib>=3.7.0
  # web3>=6.0.0
  ```
- Use standard data science libraries when possible
- Avoid obscure or unmaintained packages

**Environment**
- Test notebooks in clean environment to verify dependencies
- Use Python 3.9+ syntax
- Note any OS-specific requirements (e.g., blockchain node access)

---

#### Reproducibility

**Deterministic Results**
- Set random seeds: `np.random.seed(42)`, `random.seed(42)`
- Document any sources of non-determinism (live API calls, timestamps)
- Include expected output in markdown if results may vary

**Version Control**
- Clear all outputs before committing to reduce diff noise (optional, depends on project preference)
- Alternatively: commit with outputs for immediate viewing on GitHub
- Use `.ipynb_checkpoints/` in `.gitignore`

**Execution Order**
- Design notebooks to run top-to-bottom without errors
- Before committing: "Restart Kernel and Run All Cells"
- Number cells sequentially; avoid out-of-order execution

---

#### Visualizations

**Chart Standards**
```python
plt.figure(figsize=(10, 6))
plt.plot(price_ratios, il_values, linewidth=2, color='#e0234e')
plt.xlabel('Price Ratio (Final / Initial)', fontsize=12)
plt.ylabel('Impermanent Loss (%)', fontsize=12)
plt.title('Impermanent Loss vs Price Change', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.axhline(0, color='black', linewidth=0.8, linestyle='--')
plt.tight_layout()
plt.show()
```

**Best Practices**
- Always label axes with units
- Include titles that describe what the chart shows
- Use color intentionally; maintain accessibility (avoid red/green alone)
- Add legends for multi-line plots
- Use `tight_layout()` to prevent label cutoff

---

#### Integration with Documentation

**File Placement**
- Store notebooks in `content/notebooks/` or topic-specific subdirectories
- Name files descriptively: `concentrated_liquidity_simulation.ipynb`

**Linking from Pages**
- Reference notebooks in related documentation pages:
  ```markdown
  For an interactive simulation, see the [Impermanent Loss Calculator](/notebooks/il_calculator.ipynb).
  ```

**Rendering**
- GitHub renders notebooks natively; outputs display automatically
- For production docs, consider using nbconvert to generate HTML or embedding outputs

---

#### Review Checklist

Before submitting a notebook:
- [ ] All cells execute without errors (Restart Kernel and Run All)
- [ ] Code follows PEP 8 and includes docstrings
- [ ] Markdown cells explain what code does and why
- [ ] Visualizations have labels, titles, and legends
- [ ] Dependencies documented and commonly available
- [ ] Random seeds set for reproducibility
- [ ] Outputs included (or intentionally cleared)
- [ ] Conclusion summarizes findings
- [ ] Links to related documentation pages

---

#### Example Notebook Outline

A well-structured notebook on "Uniswap v2 Impermanent Loss Simulation" would include:

1. **Header section**: Title, author, date, and prerequisites links
2. **Introduction**: Brief explanation of what the notebook demonstrates
3. **Setup and Imports**: Code cell with necessary library imports and configuration
4. **Constant Product Formula**: Markdown explanation followed by implementation code cell
5. **Impermanent Loss Calculation**: Concept explanation, IL function code cell with output
6. **Simulation**: Price volatility impact with visualization
7. **Sensitivity Analysis**: Fee impact comparison with charts
8. **Conclusion**: Summary of findings with links to related pages

---

#### See Also

* [Code Examples](/contributing/code-examples) – Standards for code snippets
* [Style Guide](/contributing/style) – Terminology and notation
* [New Page](/contributing/new-page) – Documentation page template

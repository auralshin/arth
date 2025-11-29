### Documentation Pipeline

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, infrastructure, build, dgeni

Arth documentation uses a custom build pipeline that transforms Markdown files into a production Angular application. This page explains how the pipeline works, key components, and how to troubleshoot build issues.

---

#### Pipeline Overview

The documentation build pipeline follows this flow: Markdown files are read by Dgeni, processed through Marked.js with custom renderers, converted to HTML, integrated into Angular components, and finally built into a static site.

**Key Technologies**:
- **Dgeni**: Documentation generation tool from Angular ecosystem
- **Marked.js**: Markdown parser with extensible renderer system
- **Angular**: Frontend framework for documentation site
- **Angular CLI**: Build tooling and production optimization

---

#### Dgeni Processor

**Purpose**: Orchestrates markdown processing and generates structured documentation data.

**Location**: `tools/transforms/`

**Key Files**:
- `dgeni-cli.ts`: Entry point for documentation generation
- `content-package/`: Dgeni package configuration
- `services/`: Custom markdown renderers and processors

**Process**:
1. Reads all `.md` files from `content/` directory
2. Parses frontmatter metadata (if present)
3. Processes markdown through custom renderers
4. Generates JSON data files for Angular consumption
5. Outputs to `src/app/homepage/pages/` (dynamically)

**Configuration**:
```typescript
// Simplified dgeni config
module.exports = new Package('content', [])
  .processor(require('./processors/markdown-processor'))
  .config(function(renderMarkdown) {
    renderMarkdown.renderer = customRenderer;
  });
```

---

#### Custom Markdown Renderers

**Why Custom Renderers?**
Standard markdown rendering doesn't account for:
- Angular template syntax conflicts (curly braces `{}`)
- Special mathematical notation (HTML subscripts in formulas)
- Code example formatting and syntax highlighting
- Custom UI elements (metadata blocks, info boxes)

**Key Renderers**:

**1. Code Renderer** (`code.renderer.ts`)
- Handles all code block rendering
- Special case for `formula` language: uses `<div>` instead of `<code>` to preserve HTML
- Applies syntax highlighting class names
- Escapes content for other languages

```typescript
// Simplified code renderer
if (language === 'formula') {
  return `<pre class="language-formula"><div class="formula-content">${code}</div></pre>`;
}
return originalCodeRenderer(code, language);
```

**2. Paragraph Renderer** (via `wrapRendererWithEscapeBrackets`)
- Escapes curly braces to prevent Angular ICU message parsing errors
- Converts `{` → `&#123;`, `}` → `&#125;`
- Applied to paragraph and list items

**3. Link Renderer**
- Processes internal links to resolve to correct routes
- Maintains external link URLs as-is
- Handles anchor links within pages

**Location**: `tools/transforms/content-package/services/renderer/`

---

#### Escape Functions

**escapeBrackets**
```typescript
export function escapeBrackets(text: string): string {
  return text
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');
}
```
- Prevents Angular from interpreting `{}` as template variables
- Critical for pages with mathematical notation like `{t+1}`

**escapeAts**
```typescript
export function escapeAts(text: string): string {
  return text.replace(/@/g, '&#64;');
}
```
- Prevents Angular decorator syntax conflicts
- Applied to code blocks and specific renderers

**Wrapper Functions**
- `wrapRendererWithEscapeBrackets`: Applies bracket escaping to any renderer method
- `wrapRendererWithEscapeAts`: Applies &#64; escaping
- Used in `renderNestJSMarkdown.ts` to configure renderer

---

#### Formula Rendering System

**Challenge**: Display mathematical formulas with HTML subscripts without triggering Angular template errors or code block literal text rendering.

**Solution**: Custom `formula` language type that:
1. Bypasses standard code block `<code>` wrapper
2. Uses `<div class="formula-content">` to allow HTML rendering
3. Applies custom CSS for centered, serif-font mathematical appearance

**Markdown Input**:
````markdown
```formula
S<sub>t+1</sub> = S<sub>t</sub> (1 + π<sub>t</sub>)
```
````

**HTML Output**:
```html
<pre class="language-formula">
  <div class="formula-content">
    S<sub>t+1</sub> = S<sub>t</sub> (1 + π<sub>t</sub>)
  </div>
</pre>
```

**CSS Styling** (`src/scss/hljs.scss`):
```scss
pre.language-formula {
  text-align: center;
  .formula-content {
    font-family: 'Georgia', 'Cambria Math', serif;
    font-style: italic;
  }
}
```

---

#### Angular Integration

**Component Structure**
- `src/app/homepage/pages/`: Contains page components
- Each documentation page becomes an Angular route
- Metadata determines navigation structure

**Routing**
- Dgeni output feeds into Angular router configuration
- URLs match markdown file paths: `content/building-blocks/liquidity-pools.md` → `/building-blocks/liquidity-pools`

**Template Rendering**
- Processed HTML injected into Angular templates
- Syntax highlighting applied via highlight.js
- Custom CSS styles from `src/scss/`

---

#### Build Commands

**Development Build**
```bash
npm start
# Runs dgeni processor + Angular dev server
# Watch mode: rebuilds on file changes
# Accessible at http://localhost:4200
```

**Production Build**
```bash
npm run build:prod
# Full optimization: AOT compilation, minification, tree-shaking
# Outputs to dist/ directory
# Typical build time: 15-20 seconds
```

**Documentation Generation Only**
```bash
npm run docs:dgeni
# Runs dgeni processor without Angular build
# Useful for testing markdown rendering
```

---

#### Troubleshooting

**Error: "NG5002: Invalid ICU message"**
- **Cause**: Curly braces `{}` in markdown not escaped
- **Solution**: Ensure `escapeBrackets` applied to paragraph/list renderers
- **Check**: `renderNestJSMarkdown.ts` includes `wrapRendererWithEscapeBrackets`

**Error: HTML tags displaying as literal text**
- **Cause**: Tags inside `<code>` blocks render as text
- **Solution**: For formulas, use `formula` language type with custom renderer
- **Check**: `code.renderer.ts` has special handling for `language === 'formula'`

**Error: "Cannot find module" during build**
- **Cause**: Missing dependency or incorrect import path
- **Solution**: Run `npm install`, verify paths in imports
- **Check**: `package.json` dependencies are installed

**Build Succeeds but Page Doesn't Render**
- **Cause**: Markdown syntax error, missing metadata, or routing issue
- **Solution**: Check browser console for errors, verify metadata block format
- **Check**: File is in correct `content/` subdirectory

**Formulas Not Rendering Correctly**
- **Cause**: Missing `<sub>` tags or incorrect formula block syntax
- **Solution**: Use ` ```formula` with HTML subscripts inside
- **Check**: Local preview shows subscripts, not raw HTML

---

#### Extending the Pipeline

**Adding a New Renderer**
1. Create renderer file in `tools/transforms/content-package/services/renderer/`
2. Implement custom rendering logic
3. Import and apply in `renderNestJSMarkdown.ts`
4. Test with sample markdown content

**Example: Custom Blockquote**
```typescript
// custom-blockquote.renderer.ts
export function customBlockquoteRenderer(quote: string): string {
  return `<blockquote class="custom-quote">${quote}</blockquote>`;
}

// In renderNestJSMarkdown.ts
import { customBlockquoteRenderer } from './renderer/custom-blockquote.renderer';
renderer.blockquote = customBlockquoteRenderer;
```

**Adding Custom CSS**
- Add styles to `src/scss/hljs.scss` or create new `.scss` file
- Import in `src/styles.scss` if new file
- Use BEM naming or scoped classes to avoid conflicts

---

#### Performance Considerations

**Build Time**
- Dgeni processing: ~2-5 seconds for ~200 pages
- Angular production build: ~12-15 seconds
- Total: ~15-20 seconds for full build

**Optimization**
- Dgeni caches processed files (watch mode)
- Angular CLI uses incremental builds in dev mode
- Production builds tree-shake unused code

**Bundle Size**
- Target: <2MB for main bundle (including docs content)
- Monitor via Angular CLI output: `main.[hash].js` size
- Large content pages increase bundle; consider lazy loading

---

#### See Also

* [How to Contribute](/contributing/how-to-contribute) – Contribution workflow
* [Content Guidelines](/contributing/content-guidelines) – Writing standards
* [Checklist](/contributing/checklist) – Pre-submission review

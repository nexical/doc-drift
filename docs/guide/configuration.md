# Configuration

DocGap is configured via a `.docgap.yaml` file (or JSON) in the root of your project.

## AI-Assisted Configuration 🤖

We have prepared a specialized guide for AI models (like ChatGPT, Claude, Gemini) to generate this configuration file for you.

1.  **[Click here to view the AI Prompt](/llms.txt)** (or open `docs/public/llms.txt` in repo).
2.  Copy the entire content of that file.
3.  Paste it into your AI chat session along with your project's file structure (e.g. output of `tree`).
4.  The AI will generate a valid `.docgap.yaml` for you.

---

## Schema Reference

The configuration is validated using Zod. Here is the complete structure.

### Root Object (`DocGapConfig`)

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rules` | `Rule[]` | **Required** | Array of mapping rules between docs and source. |
| `ignore` | `string[]` | `['node_modules', 'dist', '.git']` | Global glob patterns to ignore during file discovery. |
| `git` | `GitConfig` | `{}` | Git integration settings. |
| `semantic` | `SemanticConfig` | `{}` | Semantic analysis settings. |

### Rule Object (`Rule`)

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `doc` | `string` | **Required** | Path to the documentation file (relative to root). |
| `source` | `string \| string[]` | **Required** | Path(s) or glob pattern(s) to source files described by the doc. |
| `ignore` | `string[]` | `undefined` | Specific ignore patterns for this rule. |
| `maxStaleness` | `number` | `0` | Allowed drift in minutes before warning. |

### Git Configuration (`GitConfig`)

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ignoreCommitPatterns` | `string[]` | `['^chore:', '^style:', ...]` | Regex patterns to ignore "noise" commits (e.g. formatting). |
| `shallow` | `boolean` | `true` | Optimize git operations (keep true for speed). |

### Semantic Configuration (`SemanticConfig`)

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | `boolean` | `true` | Enable semantic checking (ignoring whitespace/comments). |
| `strict` | `boolean` | `false` | If `true`, *any* change to source files marks the doc as stale, bypassing semantic checks. |

## Examples

### 1. Minimal Configuration
Suitable for small libraries.

```yaml
rules:
  - doc: "README.md"
    source: "src/index.ts"
```

### 2. Monorepo Configuration
Handling multiple packages and exclusions.

```yaml
ignore: ["**/node_modules", "**/dist", "**/.turbo"]

rules:
  # Core Logic
  - doc: "packages/core/README.md"
    source: 
      - "packages/core/src/**/*.ts"
      - "!packages/core/src/**/*.test.ts"
  
  # CLI
  - doc: "apps/cli/README.md"
    source: "apps/cli/src/main.ts"
```

### 3. Strict Mode
For security policies or critical docs.

```yaml
semantic:
  strict: true # Every commit to source triggers stale status

rules:
  - doc: "SECURITY.md"
    source: "src/security_critical_logic.ts"
```

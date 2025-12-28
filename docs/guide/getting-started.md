# Getting Started

DocGap is a tool designed to solve a critical problem in software development: **Documentation Drift**. It ensures that your documentation stays in sync with your source code by verifying that updates to code are reflected in the corresponding documentation.

## Why DocGap?

- ❌ **The Problem**: Developers update code but forget to update the docs. Over time, documentation becomes misleading, causing frustration and wasted time.
- ✅ **The Solution**: DocGap treats documentation like code. It fails your build if docs are stale, forcing developers to keep them updated.

## Installation

Install DocGap as a development dependency in your project:

```bash
npm install -D @nexical/docgap
# or
pnpm add -D @nexical/docgap
# or
yarn add -D @nexical/docgap
```

## Usage Patterns

DocGap is designed to be used in two primary ways:

### 1. The CLI (Local Development)
Run DocGap locally to check for drift before you commit.

```bash
npx docgap check
```

This will analyze your `.docgap.yaml` configuration and report any files that are out of sync. You can also run it in strict mode for CI/CD pipelines.

### 2. GitHub Actions (CI/CD)
Integrate DocGap directly into your Pull Request workflow. The official GitHub Action provides rich feedback directly on your PRs.

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0 # Important! DocGap needs git history
  
  - uses: nexical/docgap@v1
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
```

## Next Steps

1.  **[Configuration](./configuration.md)**: Learn how to set up your `.docgap.yaml` file.
2.  **[CLI Reference](../reference/cli.md)**: Explore all command-line options.
3.  **[GitHub Action](../reference/action.md)**: Configure the automated workflow.

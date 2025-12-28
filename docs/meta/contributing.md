# Contributing to DocGap

Thank you for your interest in contributing to `docgap`! We aim to build a high-performance, developer-friendly tool.

## Tech Stack

*   **Node.js**: 20+
*   **Package Manager**: pnpm
*   **Language**: TypeScript 5+

## Philosophy

> **Speed > Complexity**

This tool runs in CI/CD pipelines. Every millisecond counts.
*   **Prefer simple solutions**: Avoid over-engineering.
*   **Minimize dependencies**: Keep the install size small.
*   **Performance first**: Always consider the cold-start time.

## Development

### Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-org/docgap.git
    cd docgap
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Build

We use `tsup` for bundling the CLI and `tsc` for type-checking.

```bash
pnpm build
```

### Test

We use `vitest` for fast unit testing.

```bash
pnpm test
```

# Architecture Overview

DocGap is structured as a monorepo with a core logic package and multiple interface applications (CLI, GitHub Action).

## Core Package
The `@docgap/core` package (`packages/core/src/index.ts`) exports the primary API for other consumers. Key exports include:
- `runAnalysis`: The main entry point for running a drift check.
- `checkDrift`: The specific function for checking a single rule.
- `ConfigSchema`: Zod schema for validation.

It also exports shared types from `packages/core/src/types.ts`:
- `FileCheckResult`: The result of a drift check.
- `DocGapConfig`: The parsed configuration object.
- `DriftReason`: Detailed reason for why a file is considered stale.

## Design Philosophy
The architecture separates the **Analysis Layer** (Core) from the **Presentation Layer** (CLI/Action). This allows the core drift detection logic—involving Git operations, hashing, and AST parsing—to be reused across any interface.

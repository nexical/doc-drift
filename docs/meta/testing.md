# Testing Strategy

We ensure 100% coverage and high reliability using Vitest.

## Workspace
The project uses a workspace configuration defined in `vitest.workspace.ts`, which includes:
- `packages/*`
- `apps/*`

## Configuration
The root `vitest.config.ts` defines shared settings, specifically coverage exclusions:
- `coverage/**`
- `**/dist/**`
- `**/*.test.ts`

This ensures that our coverage metrics reflect the actual application code.

## Test Implementation
We use standard `expect` assertions across all tests.
- **Unit Tests**: Locate in `tests/unit`. Use helpers like `createCommit` and `factory` to mock Git and file objects.
- **E2E Tests**: Found in `apps/cli/tests/e2e/cli.test.ts` (using `runCli` to simulate execution) and `apps/cli/tests/e2e/coverage.test.ts`.
- **Parsing Tests**: `packages/core/tests/unit/coverage/analyzer.test.ts` verifies that `entities` are correctly extracted.

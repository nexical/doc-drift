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

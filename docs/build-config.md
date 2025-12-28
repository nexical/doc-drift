# Build Configuration

DocGap is a monorepo built with TypeScript.

## TSConfig
The base configuration is in `tsconfig.base.json`, which enforces:
- `ES2022` target.
- `NodeNext` module resolution.
- `strict` type checking.

## Packages
The core package uses `packages/core/tsconfig.build.json` to compile to the `dist` folder.

## Applications
The CLI app uses `apps/cli/tsup.config.ts` to bundle the application using `tsup`. It produces an ESM bundle with sourcemaps and code splitting disabled for a single-file executable feel.

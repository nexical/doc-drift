# CLI Reference

The DocGap CLI is the primary way users interact with the tool locally or in CI pipelines.

## Logic
The `handleCheck` function in `apps/cli/src/commands.ts` drives the CLI. It handles:
1. Loading configuration using `ConfigSchema`.
2. Running the analysis via `runAnalysis`.
3. Rendering output using `renderHeader`, `renderResults`, and `renderCoverage`.

## Views
The CLI logic separates data retrieval from presentation. The `apps/cli/src/view.ts` file contains the presentation logic, ensuring that the core logic remains pure.

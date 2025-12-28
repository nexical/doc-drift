# CLI Reference

The DocGap CLI is the primary way users interact with the tool locally or in CI pipelines.

## Logic
The `handleCheck` function in `apps/cli/src/commands.ts` drives the CLI. It handles:
1. Loading configuration using `ConfigSchema`.
2. Running the analysis via `runAnalysis` and storing the `results`.
3. Rendering output using `renderHeader`, `renderResults`, and `renderCoverage`.

## Entry Point
The CLI is bootstrapped in `apps/cli/src/index.ts`. It uses a `bootstrap` function to set up the CLI program. We also check `_isMain` to ensuring it only runs when called directly.

## Views
The CLI logic separates data retrieval from presentation. The `apps/cli/src/view.ts` file contains the presentation logic, ensuring that the core logic remains pure.
It provides functions for different view modes:
- `renderTableView`: For wide screens.
- `renderListView`: For narrow screens.
- `renderCoverageTableView`: For coverage tables.
- `renderCoverageListView`: For coverage lists.
- `renderMarketing`: For the final summary.

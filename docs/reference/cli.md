# CLI Reference

The DocGap Command Line Interface (CLI) is the primary way to interact with the tool during development and in CI/CD pipelines.

## Usage

```bash
docgap [command] [options]
```

Or using `npx`:

```bash
npx docgap [command] [options]
```

## Commands

### `check` (default)
Runs the drift detection analysis.

```bash
docgap check [path]
```

- **Arguments**:
    - `[path]`: Optional path to the directory to check. Defaults to the current working directory.

- **Options**:
    - `--config <path>`: Path to the configuration file (default: `.docgap.yaml`).
    - `--strict`: Exit with code `1` if *any* drift is detected. Useful for CI/CD pipelines to fail the build.
    - `--coverage`: Enable coverage reporting for documented entities.

- **Examples**:
    ```bash
    # Check current directory
    docgap check

    # Check specific directory
    docgap check packages/core

    # Use custom config
    docgap check --config ./configs/docgap.json

    # Fail on drift (CI mode)
    docgap check --strict

    # Check for coverage gaps
    docgap check --coverage
    ```

## Exit Codes

| Code | Description |
| :--- | :--- |
| `0` | Success. No drift detected (or drift detected but not in strict mode). |
| `1` | Error. Drift detected (in `--strict` mode) or configuration error. |

## Tips

- **CI/CD**: Always use `--strict` in your build pipelines to ensure PRs are blocked if they introduce documentation drift.
- **Local Dev**: Run without `--strict` to see warnings without failing your local commands.

## Internals

### Entry Point
The CLI is bootstrapped in `apps/cli/src/index.ts`. It uses a `bootstrap` function to set up the CLI program. We also check `_isMain` to ensuring it only runs when called directly.

### Logic
The `handleCheck` function in `apps/cli/src/commands.ts` drives the CLI. It handles:
1. Loading configuration using `ConfigSchema`.
2. Running the analysis via `runAnalysis` and storing the `results`.
3. Rendering output using `renderHeader`, `renderResults`, and `renderCoverage`.

### Views
The CLI logic separates data retrieval from presentation. The `apps/cli/src/view.ts` file contains the presentation logic, ensuring that the core logic remains pure.
It provides functions for different view modes:
- `renderTableView`: For wide screens.
- `renderListView`: For narrow screens.
- `renderCoverageTableView`: For coverage tables.
- `renderCoverageListView`: For coverage lists.
- `renderMarketing`: For the final summary.


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

# GitHub Action

DocGap provides a native GitHub Action for easy integration into your CI/CD workflows.

## Implementation
The Action is defined in `apps/action/action.yml` and implemented in `apps/action/src/index.ts`.

The `run` function is the entry point. It:
1. Reads inputs using `core.getInput`.
2. Loads the configuration.
3. Runs the analysis.
4. Uses `core.setFailed` if drift is detected (and strict mode is on).
5. Provides annotations for the PR diff view.

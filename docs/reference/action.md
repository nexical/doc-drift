# GitHub Action Reference

The DocGap GitHub Action allows you to integrate drift detection specifically into your CI/CD workflow, providing rich feedback on Pull Requests.

## Usage

Add the following workflow file to your repository at `.github/workflows/docgap.yml`.

```yaml
name: DocGap Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  check-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # CRITICAL: DocGap needs full git history to compare timestamps
      
      - name: Run DocGap
        uses: nexical/docgap@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          strict: true # Recommended for CI to fail the build on drift
```

## Inputs

| Input | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `token` | GitHub Token for posting comments access. | <code v-pre>${{ github.token }}</code> | **No** (but needed for PR comments) |
| `strict` | If `'true'`, the action will fail the workflow if drift is detected. | `'false'` | No |
| `config` | Path to the configuration file. | `.docgap.yaml` | No |
| `coverage` | If `'true'`, runs coverage analysis instead of drift check. | `'false'` | No |

## Behavior

1.  **Drift Detection**: It scans your files based on `.docgap.yaml`.
2.  **PR Comments**: If drift is found, it posts a detailed comment on the Pull Request listing the stale files.
3.  **Annotations**: It adds file-level annotations to the "Files Changed" tab in GitHub, highlighting exactly which files are out of sync.

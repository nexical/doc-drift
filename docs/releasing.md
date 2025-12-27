# Releasing DocGap

This guide describes how to release new versions of DocGap.

## Prerequisites

- Access to the `nexical/docgap` GitHub repository with write permissions.
- `NPM_TOKEN` configured in the repository secrets (for CLI publishing).

## Release Process

The release process is automated using GitHub Actions. To trigger a release:

1.  **Update Version Numbers**:
    - Update the version in `apps/cli/package.json`.
    - Update the version in `apps/action/package.json`.
    - (Optional) Update versions in `packages/core/package.json` if it has changed independent of the apps.

    You can use `pnpm version patch`, `pnpm version minor`, or `pnpm version major` in the respective directories, or manually edit the files.

2.  **Commit and Push**:
    - Commit the version bumps: `git commit -am "chore(release): vX.Y.Z"`
    - Push the changes to the `main` branch.

3.  **Automated Workflow**:
    - The `.github/workflows/release.yml` workflow will automatically run on push to `main`.
    - It will:
        - Build and test the project.
        - Publish the `@docgap/cli` package to NPM.
        - Build the GitHub Action and update the `v1` tag (and push to `releases/v1` if configured).

## Manual Trigger

You can also manually trigger the "Release" workflow from the GitHub Actions tab if needed, though pushing to `main` is the standard method.

## Verifying the Release

- **NPM**: Check [npmjs.com](https://www.npmjs.com/) to confirm `@docgap/cli` has the new version.
- **GitHub Action**: Check that the `v1` tag on GitHub points to the new commit.

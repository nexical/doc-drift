# Git Analysis

DocGap relies heavily on Git history to determine file "freshness". This logic is split across client interaction, content retrieval, and commit filtering.

## Client and Content
The `packages/core/src/git/client.ts` module provides low-level git access.
- `getFileCommitHistory`: Retrieves the commit log for a specific file.

The `packages/core/src/git/content.ts` module handles reading file content.
- `getFileContent`: Reads the current file content from the filesystem.
- `getFileContentAtCommit`: Reads the file content from a specific commit hash.

## Filtering Commits
The `filterMeaningfulCommits` function in `packages/core/src/git/filter.ts` is crucial for reducing noise. Not every commit to a source file requires a documentation update (e.g., fixing a typo or changing indentation).

### Noise Patterns
The system defines `NORMALIZED_COMMIT_NOISE` as a regex to catch standard Conventional Commit types that are usually irrelevant to documentation:
- `chore`
- `style`
- `test`
- `ci`
- `build`

### User Configuration
The `filterMeaningfulCommits` function also accepts `ignorePatterns` from the user configuration. It iterates through the `GitCommit` list and excludes any commit where the message matches the built-in noise regex or any of the user-provided patterns.

## Types
The system uses `GitCommit` to represent the meaningful data needed: hash, date, and message.
Other types in `packages/core/src/git/types.ts` include:
- `GitLogOptions`: Options for fetching logs.
- `GitError`: Custom error class.
- `constructor`: The constructor for GitError.

# Hashing and Timestamps

Reviewing the mechanism behind "Semantic Drift Detection".

## Semantic Hashing
The `getSemanticHash` function in `packages/core/src/analysis/hasher.ts` is responsible for generating a unique fingerprint of a file's "meaningful" content.

### Cleaning Content
Before hashing, the content is normalized using `normalizeViaRepomix`. This function leverages the [Repomix](https://github.com/yamadashy/repomix) library to compress the code structure.

1. It writes the content to a temporary file.
2. It runs `repomix` with the `compress` option enabled.
3. This process strips comments, extraneous whitespace, and reducing the code to its structural elements (while preserving logic signatures).

This ensures that formatting changes, comment updates, or refactors that don't change the structural logic do not trigger a drift alert.

### Hashing
We use `createHash('sha256')` to generate the final hex digest of the cleaned content.

## Timestamps
The timestamp analysis relies on `getEffectiveFileUpdate` in `packages/core/src/analysis/timestamp.ts`. This function determines the last "meaningful" commit date for a file, filtering out noise based on the configuration.

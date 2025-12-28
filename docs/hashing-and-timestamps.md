# Hashing and Timestamps

Reviewing the mechanism behind "Semantic Drift Detection".

## Semantic Hashing
The `getSemanticHash` function in `packages/core/src/analysis/hasher.ts` is responsible for generating a unique fingerprint of a file's "meaningful" content.

### Cleaning Content
Before hashing, the content is passed through `cleanContent`. This function:
1. Removes block comments `/* ... */`.
2. Removes line comments `// ...` (while preserving URLs).
3. Normalizes whitespace (collapsing multiple spaces and newlines into single spaces).
4. Trims the result.

This ensures that formatting changes, comment updates, or refactors that don't change the logic code do not trigger a drift alert.

### Hashing
We use `createHash('sha256')` to generate the final hex digest of the cleaned content.

## Timestamps
The timestamp analysis (though partly covered in drift detection) relies on fetching the `effective` update time, which is the date of the last *meaningful* commit.

# Drift Detection

The core of DocGap is its ability to detect when documentation is out of sync with the underlying source code. This logic is encapsulated in the `checkDrift` function.

## The Drift Check Process

The `checkDrift` function in `packages/core/src/drift.ts` orchestrates the entire verification process. It takes a documentation path, a list of source files, and a configuration object, returning a `FileCheckResult`.

### 1. Timestamp Verification
First, the system retrieves the last "effective" update time for the documentation file using `getEffectiveFileUpdate`. If the documentation file has no git history, the status is returned as `UNKNOWN`.

For each source file, we compare its last effective update time (`t_code`) against the documentation's update time (`t_doc`). If `t_code` is newer than `t_doc`, it triggers a potential drift warning.

### 2. Semantic Verification (Phase 2)
If a timestamp mismatch is found, DocGap attempts to verify if the change was meaningful.

- It fetches the **current content** of the source file using `getFileContent`.
- It fetches the **old content** of the source file (at the time the doc was last updated) using `getFileContentAtCommit`.
- It calculates a semantic hash for both using `getSemanticHash`.

If the hashes match `sigCurrent === sigOld`, the change is considered cosmetic (e.g., whitespace, comments) and is ignored. If they differ, it is recorded as a `STALE_SEMANTIC` drift.

## Result

The function returns a `FileCheckResult` which contains:
- `status`: 'FRESH', 'STALE_TIMESTAMP', or 'STALE_SEMANTIC'.
- `driftingSources`: A list of files contributing to the drift.
- `lastDocCommit`: Metadata about the doc's last change.

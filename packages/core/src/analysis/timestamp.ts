import { DocDriftConfig } from '../config.js';
import { GitCommit } from '../git/types.js';
import { getFileCommitHistory } from '../git/client.js';
import { filterMeaningfulCommits } from '../git/filter.js';

export async function getEffectiveFileUpdate(
    filePath: string,
    config: DocDriftConfig
): Promise<GitCommit | null> {
    // 1. Get raw history (limit to last 20 to save speed)
    const commits = await getFileCommitHistory(filePath, {
        maxCount: 20,
    });

    // 2. Filter using config.git.ignoreCommitPatterns
    const ignorePatterns = config.git?.ignoreCommitPatterns ?? [];
    const meaningfulCommits = filterMeaningfulCommits(commits, ignorePatterns);

    // 3. Return the first commit (latest) that passes the filter.
    if (meaningfulCommits.length > 0) {
        return meaningfulCommits[0];
    }

    return null;
}

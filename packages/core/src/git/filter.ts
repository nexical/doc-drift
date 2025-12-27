import { GitCommit } from './types.js';

export function filterMeaningfulCommits(
    commits: GitCommit[],
    ignorePatterns: string[] = []
): GitCommit[] {
    if (ignorePatterns.length === 0) {
        return commits;
    }

    const regexes = ignorePatterns.map((pattern) => new RegExp(pattern));

    return commits.filter((commit) => {
        // If ANY regex matches the message, we exclude (filter out) the commit.
        // So we keep it if NO regex matches.
        const isIgnored = regexes.some((regex) => regex.test(commit.message));
        return !isIgnored;
    });
}

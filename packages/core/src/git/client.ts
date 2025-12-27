import { simpleGit, SimpleGit, DefaultLogFields } from 'simple-git';
import { GitCommit, GitLogOptions, GitError } from './types.js';

const git: SimpleGit = simpleGit();

export async function getFileCommitHistory(
    filePath: string,
    options: GitLogOptions = {}
): Promise<GitCommit[]> {
    try {
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            throw new GitError('Current directory is not a git repository');
        }

        const logResult = await git.log({
            file: filePath,
            maxCount: options.maxCount,
            from: options.from,
            to: options.to,
            strictDate: options.strictDate,
        });

        return logResult.all.map((commit: DefaultLogFields & { body: string }) => ({
            hash: commit.hash,
            date: new Date(commit.date),
            message: commit.message,
            author_name: commit.author_name,
            author_email: commit.author_email,
            refs: commit.refs,
            body: commit.body,
        }));
    } catch (error) {
        if (error instanceof GitError) {
            throw error;
        }
        throw new GitError(
            `Failed to fetch commit history for ${filePath}`,
            error
        );
    }
}

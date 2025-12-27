import { simpleGit, SimpleGit } from 'simple-git';
import fs from 'node:fs/promises';

const git: SimpleGit = simpleGit();

/**
 * Reads the current file content from the filesystem.
 */
export async function getFileContent(path: string): Promise<string> {
    return fs.readFile(path, 'utf8');
}

/**
 * Retrieves file content at a specific commit hash.
 * If the file did not exist or there is an error, returns an empty string.
 */
export async function getFileContentAtCommit(path: string, commitHash: string): Promise<string> {
    try {
        // git show <commit>:<path>
        // We use the absolute path, but git show expects paths relative to the repo root usually.
        // However, simple-git might handle this or we rely on git resolving it if run from root.
        // To be safe, if we get errors, we might need to compute relative path.
        // For now, following instructions to use the path directly.
        return await git.show([`${commitHash}:${path}`]);
    } catch (error) {
        // Return empty string if file didn't exist or other error
        return '';
    }
}

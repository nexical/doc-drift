export interface GitCommit {
    hash: string;
    date: Date;
    message: string;
    author_name: string;
    author_email: string;
    refs: string;
    body: string;
}

export interface GitLogOptions {
    maxCount?: number;
    from?: string;
    to?: string;
    strictDate?: boolean;
}

export class GitError extends Error {
    constructor(message: string, public originalError?: unknown) {
        super(message);
        this.name = 'GitError';
    }
}

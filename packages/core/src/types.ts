export type VerificationStatus =
    | 'FRESH'
    | 'STALE_TIMESTAMP'
    | 'STALE_SEMANTIC'
    | 'UNKNOWN';

export interface DriftingSource {
    sourceFile: string;
    reason: string;
    lastCommit?: { hash: string; date: Date; message: string };
}

export interface FileCheckResult {
    docPath: string;
    sourceFiles: string[];
    status: VerificationStatus;
    lastDocCommit?: { hash: string; date: Date };
    lastSourceCommit?: { hash: string; date: Date; message: string }; // @deprecated Use driftingSources
    driftReason?: string; // @deprecated Use driftingSources
    driftingSources: DriftingSource[];
}

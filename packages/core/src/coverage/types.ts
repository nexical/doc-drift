export interface Entity {
    name: string;
    kind: string;
    line: number;
}

export interface CoverageReport {
    file: string;
    missing: Entity[];
    present: Entity[];
    score: number;
}

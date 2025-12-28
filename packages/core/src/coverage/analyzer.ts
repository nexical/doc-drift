import { pack } from 'repomix';
import { Entity, CoverageReport } from './types.js';
import path from 'path';

// Define a minimal config satisfying RepomixConfigMerged requirements
// copying values from what we saw in d.ts defaults where possible or safe defaults
const REPOMIX_CONFIG: any = {
    output: {
        filePath: 'repomix-output.xml',
        style: 'xml',
        parsableStyle: true,
        fileSummary: false,
        directoryStructure: false,
        files: true,
        removeComments: false,
        removeEmptyLines: true,
        compress: true,
        showLineNumbers: false,
        truncateBase64: true,
        copyToClipboard: false,
        includeEmptyDirectories: false,
        includeFullDirectoryStructure: false,
        tokenCountTree: false,
        git: {
            sortByChanges: false,
            includeDiffs: false,
            includeLogs: false,
        }
    },
    input: {
        maxFileSize: 10 * 1024 * 1024
    },
    include: [],
    ignore: {
        useGitignore: true,
        useDotIgnore: true,
        useDefaultPatterns: true,
        customPatterns: []
    },
    security: {
        enableSecurityCheck: false
    },
    tokenCount: {
        encoding: 'o200k_base'
    },
    cwd: process.cwd(),
};

export class CoverageAnalyzer {
    /**
     * Analyze coverage for multiple source files against documentation content
     */
    static async analyze(sourceFiles: string[], docContent: string): Promise<CoverageReport[]> {
        if (sourceFiles.length === 0) {
            return [];
        }

        // 1. Run Repomix to get compressed code with signatures
        const xmlOutput = await this.runRepomix(sourceFiles);

        // 2. Parse XML and extract entities per file
        const fileEntities = this.parseRepomixOutput(xmlOutput);

        // 3. Verify against docContent
        const normalizedDoc = docContent.toLowerCase();
        const reports: CoverageReport[] = [];

        for (const [file, entities] of fileEntities) {
            const present: Entity[] = [];
            const missing: Entity[] = [];

            for (const entity of entities) {
                const nameLower = entity.name.toLowerCase();
                // Simple whole word match
                const regex = new RegExp(`\\b${this.escapeRegExp(nameLower)}\\b`, 'i');

                if (regex.test(normalizedDoc)) {
                    present.push(entity);
                } else {
                    missing.push(entity);
                }
            }

            const score = entities.length > 0 ? present.length / entities.length : 1;

            reports.push({
                file,
                missing,
                present,
                score
            });
        }

        // Ensure we have a report for every input file
        for (const sourceFile of sourceFiles) {
            if (!fileEntities.has(sourceFile)) {
                const isFound = Array.from(fileEntities.keys()).some(k => k.endsWith(path.basename(sourceFile)));
                if (!isFound) {
                    reports.push({
                        file: sourceFile,
                        missing: [],
                        present: [],
                        score: 1
                    });
                }
            }
        }

        return reports;
    }

    private static async runRepomix(files: string[]): Promise<string> {
        const cwd = process.cwd();
        const config = { ...REPOMIX_CONFIG, cwd };
        const relativeFiles = files.map(f => path.relative(cwd, f));

        // pack(rootDirs, config, progressCallback, checkDeps, explicitFiles, options)
        const result = await pack([cwd], config, undefined, undefined, relativeFiles);

        // @ts-ignore
        if (result && result.output) {
            // @ts-ignore
            return result.output;
        }

        // If output is undefined (written to disk), read the file
        const outputPath = path.resolve(cwd, 'repomix-output.xml');
        try {
            const fs = await import('node:fs/promises');
            const content = await fs.readFile(outputPath, 'utf8');
            return content;
        } catch (e) {
            console.error('Failed to read repomix output file:', e);
            throw e;
        }
    }

    private static parseRepomixOutput(xml: string): Map<string, Entity[]> {
        const fileMap = new Map<string, Entity[]>();

        // We use a global regex with matchAll to robustly iterate tags
        const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;

        for (const match of xml.matchAll(fileRegex)) {
            const filePath = match[1];
            const content = match[2];
            const entities: Entity[] = [];

            const lines = content.split('\n');
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                if (!trimmed) return;

                let name: string | null = null;
                let kind = 'unknown';

                let cleanLine = trimmed;

                // Strip common modifiers from the start of the line to find the definition
                const modifiers = [
                    'export', 'default', 'async', 'static', 'public', 'private', 'protected', 'readonly', 'abstract', 'declare'
                ];

                // Repeatedly strip modifiers (e.g. export default async class)
                let changed = true;
                while (changed) {
                    changed = false;
                    for (const mod of modifiers) {
                        if (cleanLine.startsWith(mod + ' ')) {
                            cleanLine = cleanLine.substring(mod.length).trim();
                            changed = true;
                        }
                    }
                }

                const keywords = ['class', 'interface', 'function', 'def', 'fn', 'type', 'enum', 'var', 'let', 'const', 'struct'];

                let matched = false;
                for (const kw of keywords) {
                    // Check if line starts with keyword (after stripping modifiers)
                    if (cleanLine.startsWith(kw + ' ')) {
                        const namePart = cleanLine.substring(kw.length).trim();
                        // Extract first word as name
                        const m = /^([a-zA-Z0-9_$]+)/.exec(namePart);
                        if (m) {
                            kind = kw;
                            name = m[1];
                            matched = true;
                            break;
                        }
                    }
                }

                if (!matched) {
                    // Check for "Name(" pattern (methods)
                    const methodRegex = /^([a-zA-Z0-9_$]+)\s*[<(]/; // handle generic <T> too? just ( is enough usually. Repomix might keep generics. 
                    const m = methodRegex.exec(cleanLine);
                    if (m) {
                        // Ensure it's not a keyword (e.g. "if (")
                        if (!keywords.includes(m[1]) && m[1] !== 'if' && m[1] !== 'for' && m[1] !== 'while' && m[1] !== 'switch' && m[1] !== 'catch') {
                            kind = 'function'; // method
                            name = m[1];
                        }
                    }
                }

                if (name) {
                    entities.push({
                        name,
                        kind,
                        line: index + 1
                    });
                }
            });

            const absPath = path.resolve(process.cwd(), filePath);
            fileMap.set(absPath, entities);
        }

        return fileMap;
    }

    private static escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

import fs from 'node:fs/promises';
import { getProfile, LanguageProfile } from './languages.js';
import { Entity, CoverageReport } from './types.js';
import path from 'path';

export class CoverageAnalyzer {
    /**
     * Extract code entities from compressed code based on language profile
     */
    static extractEntities(compressedCode: string, profile: LanguageProfile): Entity[] {
        const entities: Entity[] = [];
        const lines = compressedCode.split('\n');

        lines.forEach((lineContent, index) => {
            for (const def of profile.definitionPatterns) {
                const match = def.pattern.exec(lineContent);
                if (match && match[1]) {
                    entities.push({
                        name: match[1],
                        kind: def.kind,
                        line: index + 1
                    });
                    // Break after first match per line to avoid duplicates or misinterpretation
                    // (Assuming one definition per line in compressed output usually)
                    break;
                }
            }
        });

        return entities;
    }

    /**
     * Analyze coverage for a single source file against documentation content
     */
    static async analyze(sourceFile: string, docContent: string): Promise<CoverageReport> {
        const ext = path.extname(sourceFile);
        const profile = getProfile(ext);

        if (!profile) {
            // No profile for this language, return empty report or throw
            return {
                file: sourceFile,
                missing: [],
                present: [],
                score: 0
            };
        }

        // Use fs to read file content directly to avoid repomix issues in some environments
        const compressedCode = await fs.readFile(sourceFile, 'utf8');

        // 2. Extract Entities
        const entities = this.extractEntities(compressedCode, profile);

        // 3. Verify against docContent
        const normalizedDoc = docContent.toLowerCase();
        const present: Entity[] = [];
        const missing: Entity[] = [];

        for (const entity of entities) {
            // Simple check: does the name appear in the doc?
            // Enhancements could include word boundary checks.
            const nameLower = entity.name.toLowerCase();
            // A simple includes might be too loose (e.g. matching "var" in "variable"), 
            // but entity names are usually specific identifiers.
            // Let's stick to 'includes' for now as per prompt "exact word match preferred, or case-insensitive search"

            // Should try to match whole word if possible to avoid partial matches
            // e.g. "log" matching "login".
            const regex = new RegExp(`\\b${escapeRegExp(nameLower)}\\b`, 'i');

            if (regex.test(normalizedDoc)) {
                present.push(entity);
            } else {
                missing.push(entity);
            }
        }

        const score = entities.length > 0 ? present.length / entities.length : 1; // 100% if nothing to cover? Or 0? Usually 1 if empty.

        return {
            file: sourceFile,
            missing,
            present,
            score
        };
    }
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

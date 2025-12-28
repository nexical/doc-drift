
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoverageAnalyzer } from '../../../src/coverage/analyzer.js';
import path from 'path';

// Hoist mock for repomix
const { mockPack } = vi.hoisted(() => ({
    mockPack: vi.fn(),
}));

vi.mock('repomix', () => ({
    pack: mockPack,
    defaultConfig: {},
}));

describe('CoverageAnalyzer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('analyze', () => {
        it('should analyze coverage for multiple files', async () => {
            const xmlOutput = `
<file path="test.py">
class User
    def getName
    def setName
</file>
<file path="auth.py">
class Auth
    def login
</file>
`;
            mockPack.mockResolvedValue({ output: xmlOutput });

            const sourceFiles = [
                path.resolve('test.py'),
                path.resolve('auth.py')
            ];
            const docContent = "The User class has a getName method.";

            const reports = await CoverageAnalyzer.analyze(sourceFiles, docContent);

            expect(reports).toHaveLength(2);

            // Check test.py report
            // Names: User (class), getName (function), setName (function)
            // Doc has: User, getName. Missing: setName.
            const userReport = reports.find(r => r.file.endsWith('test.py'));
            expect(userReport).toBeDefined();
            expect(userReport!.present.map(e => e.name).sort()).toEqual(['User', 'getName'].sort());
            expect(userReport!.missing.map(e => e.name).sort()).toEqual(['setName']);
            expect(userReport!.score).toBeCloseTo(2 / 3);

            // Check auth.py report
            // Names: Auth (class), login (function)
            // Doc has coverage for User/getName, but checking if it has anything for Auth/login? 
            // Doc content is "The User class has a getName method." -> Auth/login missing.
            const authReport = reports.find(r => r.file.endsWith('auth.py'));
            expect(authReport).toBeDefined();
            expect(authReport!.present).toHaveLength(0);
            expect(authReport!.missing.map(e => e.name).sort()).toEqual(['Auth', 'login'].sort());
            expect(authReport!.score).toBe(0);
        });

        it('should handle files with no entities', async () => {
            const xmlOutput = `
<file path="empty.ts">
</file>
`;
            mockPack.mockResolvedValue({ output: xmlOutput });

            const reports = await CoverageAnalyzer.analyze([path.resolve('empty.ts')], 'content');

            expect(reports).toHaveLength(1);
            expect(reports[0].score).toBe(1); // Nothing to document -> 100% compliant
        });

        it('should handle repomix returning empty output', async () => {
            mockPack.mockResolvedValue({ output: '<repomix><files></files></repomix>' });

            // Should fill in gaps
            const report = await CoverageAnalyzer.analyze([path.resolve('missing.ts')], 'content');
            expect(report).toHaveLength(1);
            expect(report[0].file).toContain('missing.ts');
            expect(report[0].score).toBe(1);
        });
    });
});

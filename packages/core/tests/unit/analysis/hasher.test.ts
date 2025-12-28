import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSemanticHash, normalizeViaRepomix } from '../../../src/analysis/hasher.js';
import fs from 'node:fs/promises';

// Mock Repomix pack
const mockPack = vi.fn();
vi.mock('repomix', () => ({
    pack: (...args: any[]) => mockPack(...args)
}));

// Mock FS mkdtemp/writeFile/rm but we can actually use real temp files or mock depending on preference.
// Mocking fs/promises is safer for speed and cleanliness.
const mockWriteFile = vi.fn();
const mockMkTemp = vi.fn();
const mockRm = vi.fn();

vi.mock('node:fs/promises', () => ({
    default: {
        writeFile: (...args: any[]) => mockWriteFile(...args),
        mkdtemp: (...args: any[]) => mockMkTemp(...args),
        rm: (...args: any[]) => mockRm(...args),
        // we need real implementation for others if used? no we removed cleanContent
    }
}));

describe('Hasher with Repomix', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMkTemp.mockResolvedValue('/tmp/docgap-drift-12345');
        mockWriteFile.mockResolvedValue(undefined);
        mockRm.mockResolvedValue(undefined);
    });

    it('normalizeViaRepomix calls repomix.pack with correct config', async () => {
        const content = 'const a = 1;';
        const extension = '.ts';

        // Mock repomix output
        mockPack.mockResolvedValue({
            output: '<file path="temp.ts">const a=1;</file>'
        });

        const normalized = await normalizeViaRepomix(content, extension);

        expect(mockMkTemp).toHaveBeenCalled();
        expect(mockWriteFile).toHaveBeenCalledWith(expect.stringContaining('temp.ts'), content);

        // Check Repomix call
        // pack([tempDir], config, undefined, undefined, [file])
        expect(mockPack).toHaveBeenCalledTimes(1);
        const configArg = mockPack.mock.calls[0][1];
        expect(configArg.output.compress).toBe(true);
        expect(configArg.output.removeComments).toBe(true);

        // Check output extraction
        expect(normalized).toBe('const a=1;');

        // Check cleanup
        expect(mockRm).toHaveBeenCalled();
    });

    it('getSemanticHash returns consistent hash for same content', async () => {
        mockPack.mockResolvedValue({
            output: '<file path="temp.ts">code</file>'
        });

        const hash1 = await getSemanticHash('foo', '.ts');
        const hash2 = await getSemanticHash('foo', '.ts');

        expect(hash1).toBe(hash2);
        expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('getSemanticHash returns different hash for different content', async () => {
        mockPack.mockResolvedValueOnce({
            output: '<file path="temp.ts">code1</file>'
        }).mockResolvedValueOnce({
            output: '<file path="temp.ts">code2</file>'
        });

        const hash1 = await getSemanticHash('foo', '.ts');
        const hash2 = await getSemanticHash('bar', '.ts');

        expect(hash1).not.toBe(hash2);
    });
});

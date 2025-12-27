
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import fs from 'fs/promises';

const CLI_BIN = path.resolve(__dirname, '../../dist/index.js');
const FIXTURE_DIR = path.resolve(__dirname, '../fixtures/coverage-e2e');

describe('CLI Coverage Reporting', () => {
    beforeAll(async () => {
        await fs.mkdir(FIXTURE_DIR, { recursive: true });

        // Create a simple TS file
        await fs.writeFile(path.join(FIXTURE_DIR, 'utils.ts'), `
export class MathHelper {
    static add(a: number, b: number) { return a + b; }
    static subtract(a: number, b: number) { return a - b; }
}
export function log(msg: string) { console.log(msg); }
        `);

        // Create a doc file that documents MathHelper but misses log
        await fs.writeFile(path.join(FIXTURE_DIR, 'utils.md'), `
# Utils

The MathHelper class provides add and subtract methods.
        `);

        // Create config
        await fs.writeFile(path.join(FIXTURE_DIR, '.docgap.yaml'), `
rules:
  - doc: utils.md
    source: utils.ts
        `);

        // Init git repo
        await execa('git', ['init'], { cwd: FIXTURE_DIR });
        await execa('git', ['config', 'user.name', 'Test User'], { cwd: FIXTURE_DIR });
        await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: FIXTURE_DIR });
        await execa('git', ['add', '.'], { cwd: FIXTURE_DIR });
        await execa('git', ['commit', '-m', 'Initial commit'], { cwd: FIXTURE_DIR });

        // Initialize git repo to satisfy git checks if needed, but doc-drift might run without git for simple checks 
        // if we mock or if core allows it. 
        // Actually core requires git for timestamps. 
        // For this test, we might hit errors if not a git repo.
        // Let's rely on the mock or assumes we run in the project root which IS a git repo, 
        // but we are pointing to a new dir.
        // Wait, drift detection needs git history.
        // If we can't easily mock git in E2E, we might see "UNKNOWN" status, which is fine.
        // Coverage analysis shouldn't depend on Git, only on file content.
        // So even if status is UNKNOWN, coverage report should run.
    });

    afterAll(async () => {
        await fs.rm(FIXTURE_DIR, { recursive: true, force: true });
    });

    it('should report coverage when --coverage flag is used', async () => {
        // We use node to run the built CLI
        // We need to build CLI first? It should be built by the user or previous steps.
        // The user hasn't explicitly asked to build CLI in this step, but I should probably do it or assume it's there.
        // I'll try to run it. If it fails, I'll build.

        try {
            const { stdout, stderr } = await execa('node', [CLI_BIN, 'check', '--coverage'], {
                cwd: FIXTURE_DIR,
                reject: false // Don't throw if exit code 1 (which might happen due to drift/unknown)
            });

            console.log('CLI Stdout:', stdout);
            console.log('CLI Stderr:', stderr);

            expect(stdout, `Stdout: ${stdout}\nStderr: ${stderr}`).toContain('Coverage Report:');
            expect(stdout).toContain('utils.ts');
            // expect(stdout).toContain('MathHelper'); // Present entities are hidden by default
            expect(stdout).toContain('log'); // Missing
            expect(stdout).toMatch(/\d+%/); // Percentage
        } catch (e: any) {
            console.error('Error running CLI:', e);
            throw e;
        }
    }, 20000);
});

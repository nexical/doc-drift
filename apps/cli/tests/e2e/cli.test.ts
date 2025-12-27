import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import fs from 'fs-extra';
import tmp from 'tmp';

// Helper to run the CLI
const cliPath = path.resolve(__dirname, '../../dist/index.js');
const runCli = async (args: string[], cwd: string) => {
    return execa('node', [cliPath, ...args], { cwd, reject: false });
};

describe('CLI E2E: The Lifecycle of Drift', () => {
    let tmpDir: tmp.DirResult;
    let cwd: string;

    beforeAll(() => {
        // Create a temporary directory for the test repo
        tmpDir = tmp.dirSync({ unsafeCleanup: true });
        cwd = tmpDir.name;
    });

    afterAll(() => {
        // Cleanup
        tmpDir.removeCallback();
    });

    it('should correctly detect drift lifecycle', async () => {
        // 1. Init: Create a temp dir, git init, set git user/email
        await execa('git', ['init'], { cwd });
        await execa('git', ['config', 'user.name', 'Test User'], { cwd });
        await execa('git', ['config', 'user.email', 'test@example.com'], { cwd });

        // 2. Baseline: Create src/main.ts, docs/main.md, and .doc-drift.yaml. Commit.
        await fs.mkdirp(path.join(cwd, 'src'));
        await fs.mkdirp(path.join(cwd, 'docs'));

        await fs.writeFile(path.join(cwd, 'src/main.ts'), 'console.log("Hello");');
        await fs.writeFile(path.join(cwd, 'docs/main.md'), '# Main Doc\n\nRefers to [main.ts](../src/main.ts).');
        await fs.writeFile(path.join(cwd, '.docgap.yaml'),
            `rules:
  - doc: docs/main.md
    source: src/main.ts
`);

        await execa('git', ['add', '.'], { cwd });
        await execa('git', ['commit', '-m', 'Initial commit'], { cwd });

        // 3. Check 1: Run CLI. Assert exit code 0 (FRESH).
        let result = await runCli([], cwd);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('FRESH');

        // 4. Drift: Modify src/main.ts (semantic change). Commit.
        await fs.writeFile(path.join(cwd, 'src/main.ts'), 'console.log("Hello World");');
        await execa('git', ['add', '.'], { cwd });
        await execa('git', ['commit', '-m', 'Update logic'], { cwd });

        // 5. Check 2: Run CLI. Assert exit code 1 (DRIFT) and stdout contains "❌ DRIFT".
        result = await runCli([], cwd);
        // Depending on existing implementation, exit code for drift might be 1 or 0 with output. 
        // Requirement says "Assert exit code 1 (DRIFT)".
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('❌ DRIFT');

        // 6. Remediation: Update docs/main.md. Commit.
        await fs.writeFile(path.join(cwd, 'docs/main.md'), '# Main Doc\n\nUpdated. Refers to [main.ts](../src/main.ts).');
        await execa('git', ['add', '.'], { cwd });
        await execa('git', ['commit', '-m', 'Update docs'], { cwd });

        // 7. Check 3: Run CLI. Assert exit code 0 (FRESH).
        result = await runCli([], cwd);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('FRESH');
    }, 20000); // Increase timeout for E2E
});

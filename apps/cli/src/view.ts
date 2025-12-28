import pc from 'picocolors';
import Table from 'cli-table3';
import { FileCheckResult, CoverageReport } from '@docgap/core';
import path from 'node:path';
import ora from 'ora';

export const spinner = ora();

export function renderHeader() {
    console.log(); // Spacing
    spinner.start(pc.cyan('DocGap: Analyzing codebase...'));
}

export function renderResults(results: FileCheckResult[], root: string, options?: { width?: number }) {
    spinner.stop(); // Stop spinner before printing

    const width = options?.width || process.stdout.columns || 80;
    const isNarrow = width < 100;

    if (isNarrow) {
        renderListView(results, root);
    } else {
        renderTableView(results, root);
    }
}

function renderListView(results: FileCheckResult[], root: string) {
    console.log(pc.dim('─'.repeat(50)));
    results.forEach(res => {
        const relativeDoc = path.relative(root, res.docPath);

        // Format sources with indentation for new lines
        const sourcesList = res.sourceFiles.map(s => {
            const rel = path.relative(root, s);
            const isDrifting = res.driftingSources?.some(d => d.sourceFile === s);
            return isDrifting ? pc.red(rel) : pc.gray(rel);
        });

        const relativeSources = sourcesList.length > 0
            ? sourcesList.join('\n           ') // Align with "Source: " (8 chars + 3 spaces)
            : pc.italic('None');

        let statusIcon = '✅';
        let statusText = pc.green('FRESH');

        if (res.status === 'STALE_TIMESTAMP') {
            statusIcon = '⚠️ ';
            statusText = pc.yellow('STALE');
        } else if (res.status === 'STALE_SEMANTIC') {
            statusIcon = '❌';
            statusText = pc.red('DRIFT');
        } else if (res.status === 'UNKNOWN') {
            statusIcon = '❓';
            statusText = pc.gray('UNKNOWN');
        }

        console.log(`${statusIcon} ${pc.bold(statusText)}  ${pc.bold(pc.cyan(relativeDoc))}`);
        console.log(`   ${pc.dim('Source:')} ${relativeSources}`);

        if (res.driftingSources && res.driftingSources.length > 0) {
            console.log(`   ${pc.dim('Details:')}`);
            res.driftingSources.forEach(d => {
                const rel = path.relative(root, d.sourceFile);
                console.log(`           ${pc.red(rel)}: ${pc.yellow(d.reason)}`);
            });
        } else if (res.driftReason) {
            console.log(`   ${pc.dim('Reason:')} ${pc.yellow(res.driftReason)}`);
        }
        console.log(pc.dim('─'.repeat(50)));
    });
}

function renderTableView(results: FileCheckResult[], root: string) {
    const table = new Table({
        head: [pc.white(pc.bold('Status')), pc.white(pc.bold('Doc File')), pc.white(pc.bold('Source')), pc.white(pc.bold('Reason'))],
        wordWrap: true,
        wrapOnWordBoundary: false
    });

    results.forEach((res) => {
        let statusFormatted = pc.green('✅ FRESH');
        if (res.status === 'STALE_TIMESTAMP') {
            statusFormatted = pc.yellow('⚠️  STALE');
        } else if (res.status === 'STALE_SEMANTIC') {
            statusFormatted = pc.bold(pc.red('❌ DRIFT'));
        } else if (res.status === 'UNKNOWN') {
            statusFormatted = pc.gray('❓ UNKNOWN');
        }

        const relativeDoc = path.relative(root, res.docPath);

        const relativeSources = res.sourceFiles.map(s => {
            const rel = path.relative(root, s);
            const isDrifting = res.driftingSources?.some(d => d.sourceFile === s);
            return isDrifting ? pc.red(rel) : pc.gray(rel);
        }).join('\n');

        let reasonContent = '';
        if (res.driftingSources && res.driftingSources.length > 0) {
            reasonContent = res.driftingSources.map(d => {
                const rel = path.relative(root, d.sourceFile);
                return `${pc.red(rel)}: ${d.reason}`;
            }).join('\n');
        } else if (res.driftReason) {
            reasonContent = pc.yellow(res.driftReason);
        }

        table.push([
            statusFormatted,
            pc.bold(pc.cyan(relativeDoc)),
            relativeSources || '-',
            reasonContent,
        ]);
    });

    console.log(table.toString());
}

export function renderCoverage(reports: CoverageReport[], root: string) {
    if (reports.length === 0) {
        console.log(pc.gray('\nNo coverage data available for checked files.'));
        return;
    }

    console.log(pc.bold(pc.white('\nCoverage Report:')));

    const table = new Table({
        head: [pc.white(pc.bold('File')), pc.white(pc.bold('Coverage')), pc.white(pc.bold('Missing Entities'))],
        wordWrap: true,
        wrapOnWordBoundary: false
    });

    let totalScore = 0;

    reports.forEach(report => {
        const relativeFile = path.relative(root, report.file);
        const percentage = Math.round(report.score * 100);
        let coverageText = `${percentage}%`;

        if (percentage >= 80) coverageText = pc.green(coverageText);
        else if (percentage >= 50) coverageText = pc.yellow(coverageText);
        else coverageText = pc.red(coverageText);

        const missingText = report.missing.length > 0
            ? report.missing.map(e => e.name).slice(0, 5).join(', ') + (report.missing.length > 5 ? '...' : '')
            : pc.green('None');

        table.push([
            pc.cyan(relativeFile),
            coverageText,
            pc.gray(missingText)
        ]);

        totalScore += report.score;
    });

    console.log(table.toString());

    const avgCoverage = Math.round((totalScore / reports.length) * 100);
    console.log(pc.bold(`Total Coverage: ${avgCoverage}%`));

    console.log(
        '\n' +
        pc.bgBlue(
            pc.white(
                pc.bold(' Run this command to have AI fix it: npx @docgap/fix fix --improve ')
            )
        )
    );
}

export function renderMarketing(stats: { total: number; stale: number }) {
    if (stats.stale > 0) {
        console.log('\n' + pc.yellow(`[!] Found ${stats.stale} drifting files.`));
    } else {
        console.log('\n' + pc.green('✨ All documentation is up to date!'));
    }
}

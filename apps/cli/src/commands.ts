import fs from 'node:fs/promises';
import path from 'node:path';
import { runAnalysis, ConfigSchema, DocDriftConfig, CoverageAnalyzer, CoverageReport } from '@doc-drift/core';
import { renderHeader, renderResults, renderMarketing, renderCoverage, spinner } from './view.js';
import pc from 'picocolors';
import { parse } from 'yaml';

export async function handleCheck(cwd: string, options: { config?: string; strict?: boolean; coverage?: boolean }) {
    renderHeader();

    const root = cwd || process.cwd();
    let config: DocDriftConfig;

    try {
        if (options.config) {
            const configPath = path.resolve(root, options.config);
            const content = await fs.readFile(configPath, 'utf8');
            let json;
            if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
                json = parse(content);
            } else {
                json = JSON.parse(content);
            }
            config = ConfigSchema.parse(json);
        } else {
            // Let core load default (.doc-drift.yaml)
            // We do nothing here, leaving config undefined so core handles it.
        }
    } catch (error: any) {
        spinner.fail(pc.red(`Error loading config: ${error.message}`));
        process.exit(1);
    }

    try {
        // @ts-ignore - We are handling the variable assignment logic above implicitly or explicitly
        const results = await runAnalysis(root, config); // config might be undefined

        renderResults(results, root);

        if (options.coverage) {
            spinner.start(pc.cyan('Calculating coverage...'));
            const reports: CoverageReport[] = [];

            for (const res of results) {
                // Read doc content
                // Note: runAnalysis already reads files but doesn't return contents in result.
                // We re-read here. Performance hit acceptable for CLI reporting.
                let docContent = '';
                try {
                    docContent = await fs.readFile(res.docPath, 'utf8');
                } catch {
                    // If doc missing (shouldn't happen if validation passed), skip
                    continue;
                }

                for (const sourceFile of res.sourceFiles) {
                    try {
                        const report = await CoverageAnalyzer.analyze(sourceFile, docContent);
                        // Only include if we got a valid score/profile (implied if score > 0 or present/missing exist, 
                        // but analyzer returns score 0 for no profile. We should probably filter those out or show as N/A?)
                        // Analyzer returns score 0 and empty missing/present for no profile.
                        // Let's filter out "empty" reports to avoid cluttering "unknown" files
                        if (report.missing.length > 0 || report.present.length > 0) {
                            reports.push(report);
                        }
                    } catch (e) {
                        // Ignore errors in coverage analysis for single file
                    }
                }
            }
            spinner.stop();
            renderCoverage(reports, root);
        }

        const staleCount = results.filter((r) => r.status === 'STALE_TIMESTAMP' || r.status === 'STALE_SEMANTIC').length;
        renderMarketing({ total: results.length, stale: staleCount });

        if (staleCount > 0) {
            // Check command should fail if drift is detected for CI/Hooks
            process.exit(1);
        }
    } catch (error: any) {
        spinner.fail(pc.red(`Analysis failed: ${error.message}`));
        process.exit(1);
    }
}

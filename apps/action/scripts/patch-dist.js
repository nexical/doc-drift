const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));

let patchedCount = 0;

console.log(`Scanning ${files.length} files in ${distDir}...`);

files.forEach(file => {
    const filePath = path.join(distDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Patch 1: Switch runtime to child_process
    content = content.replace(/runtime:\s*['"]worker_threads['"]/g, "runtime: 'child_process'");

    // Patch 2: Fix process.js path
    // Match: __nccwpck_require__.ab + "process.js" (with optional spaces)
    // Replacement: require('url').pathToFileURL(require('path').join(__dirname, 'tinypool-dist', 'entry', 'process.js')).href
    const processJsRegex = /__nccwpck_require__\.ab\s*\+\s*['"]process\.js['"]/g;

    if (processJsRegex.test(content)) {
        console.log(`Patching process.js path in ${file}`);
        content = content.replace(processJsRegex, "require('url').pathToFileURL(require('path').join(__dirname, 'tinypool-dist', 'entry', 'process.js')).href");
    }

    // Patch 3: Circular dependency in repomix (loadLanguage_require)
    if (file === 'index.js') {
        content = content.replace(/loadLanguage_require\(['"]url['"]\)/g, "require('url')");
    }

    if (content !== originalContent) {
        console.log(`Patched ${file}`);
        fs.writeFileSync(filePath, content);
        patchedCount++;
    }
});

if (patchedCount === 0) {
    console.error("No files were patched! This suggests the build output structure has changed.");
    process.exit(1);
}

console.log(`Successfully patched ${patchedCount} files.`);

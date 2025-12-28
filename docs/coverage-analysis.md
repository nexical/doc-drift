# Coverage Analysis

DocGap ensures your documentation is not just fresh, but *complete*. The `CoverageAnalyzer` class handles this by verifying that entities exported in your code are mentioned in your documentation.

## The Analyzer Class

The `CoverageAnalyzer` class in `packages/core/src/coverage/analyzer.ts` provides the static `analyze` method. This method takes a list of source files and the documentation content string.

### 1. Code Parsing with Repomix
The analyzer uses `runRepomix` to act as a bridge to the `repomix` tool. This packs the source files into an XML format that is easier to parse.

### 2. Entity Extraction
The `parseRepomixOutput` method mimics a simple parser (or uses Repomix's structure) to extract `Entity` objects from the XML. It looks for definitions like:
- `class`
- `function`
- `interface`
- `type`
- `const` / `let` / `var`

It is robust enough to strip modifiers like `export`, `async`, or `static` to get the raw name. It uses regex patterns like `methodRegex` to identify methods.

### 3. Verification
For every source file, `CoverageAnalyzer` compares the extracted entities against the `docContent`.
- It normalizes the documentation to lowercase.
- It performs a whole-word regex search for each entity name.
- It uses helper functions like `escapeRegExp` to ensure safe regex matching.
- It produces a `CoverageReport` listing `present` and `missing` entities, and calculates a `score`.

## Types
The system uses the `CoverageReport` interface to return data, which includes:
- `file`: The source file path.
- `missing`: Array of `Entity` objects not found in the doc.
- `present`: Array of `Entity` objects found.
- `score`: A number between 0 and 1.

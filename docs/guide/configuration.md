# Configuration

DocGap is configured via a `.docgap.yaml` file (or JSON).

## Schema
The configuration is validated using Zod schemas defined in `packages/core/src/config.ts`.

### DocGapConfig
The root object `DocGapConfig` contains:
- `ignore`: Global ignore patterns (default: `node_modules`, `dist`, `.git`).
- `rules`: Array of `RuleSchema` objects.
- `git`: Git status configuration.
- `semantic`: Semantic analysis configuration.

### RuleSchema
Each rule defines a mapping:
- `doc`: Path to the documentation file.
- `source`: Single path or array of paths to source files.
- `maxStaleness`: Allowed drift in minutes (default 0).

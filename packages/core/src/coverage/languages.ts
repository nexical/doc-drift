
export interface LanguageProfile {
    extensions: string[];
    // Patterns to identify definitions in the compressed repomix output
    definitionPatterns: Array<{
        kind: 'class' | 'function' | 'variable' | 'interface';
        // Simple regex to capture the name from a CLEAN signature line
        pattern: RegExp;
    }>;
}

const TS_JS_PROFILE: LanguageProfile = {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
    definitionPatterns: [
        { kind: 'class', pattern: /class\s+(\w+)/ },
        { kind: 'function', pattern: /function\s+(\w+)/ },
        // Matches "const foo =" or "let foo =" where foo is the name
        { kind: 'variable', pattern: /(?:const|let|var)\s+(\w+)\s*=/ },
        { kind: 'interface', pattern: /interface\s+(\w+)/ },
        { kind: 'variable', pattern: /type\s+(\w+)\s*=/ },
    ]
};

const PYTHON_PROFILE: LanguageProfile = {
    extensions: ['.py'],
    definitionPatterns: [
        { kind: 'class', pattern: /class\s+(\w+)/ },
        { kind: 'function', pattern: /def\s+(\w+)/ },
    ]
};

const GO_PROFILE: LanguageProfile = {
    extensions: ['.go'],
    definitionPatterns: [
        { kind: 'function', pattern: /func\s+(\w+)/ },
        { kind: 'variable', pattern: /type\s+(\w+)/ },
    ]
};

const RUST_PROFILE: LanguageProfile = {
    extensions: ['.rs'],
    definitionPatterns: [
        { kind: 'function', pattern: /fn\s+(\w+)/ },
        { kind: 'class', pattern: /struct\s+(\w+)/ }, // Mapping struct to class for similarity
        { kind: 'variable', pattern: /enum\s+(\w+)/ },
    ]
};

const SHELL_PROFILE: LanguageProfile = {
    extensions: ['.sh', '.bash', '.zsh'],
    definitionPatterns: [
        { kind: 'function', pattern: /function\s+(\w+)/ },
        { kind: 'function', pattern: /(\w+)\(\)/ },
    ]
};

const PROFILES = [
    TS_JS_PROFILE,
    PYTHON_PROFILE,
    GO_PROFILE,
    RUST_PROFILE,
    SHELL_PROFILE
];

export function getProfile(ext: string): LanguageProfile | undefined {
    return PROFILES.find(p => p.extensions.includes(ext));
}

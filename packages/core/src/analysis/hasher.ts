import { createHash } from 'node:crypto';

/**
 * Normalizes content by removing all whitespace.
 * This effectively ignores formatting changes like indentation, newlines, etc.
 */
export function normalize(content: string): string {
    return content.replace(/\s+/g, '');
}

/**
 * Generates a SHA-256 signature for the content after normalization.
 */
export function generateSignature(content: string): string {
    const normalized = normalize(content);
    return createHash('sha256').update(normalized).digest('hex');
}

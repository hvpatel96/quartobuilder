/**
 * Sanitizes user-provided CSS to prevent data exfiltration and external resource loading.
 * Strips dangerous constructs: @import, url() with external domains, expression(), -moz-binding, etc.
 */
export function sanitizeCSS(css: string): string {
    if (!css) return '';

    let sanitized = css;

    // Remove @import rules (can load external stylesheets)
    sanitized = sanitized.replace(/@import\s+[^;]+;?/gi, '/* @import removed */');

    // Remove url() calls pointing to external resources (http/https/data URIs with scripts)
    // Allow url() only for safe inline data URIs (images) and relative paths
    sanitized = sanitized.replace(
        /url\s*\(\s*(['"]?)\s*(https?:\/\/[^)]*)\1\s*\)/gi,
        '/* external url removed */'
    );

    // Remove javascript: protocol in url()
    sanitized = sanitized.replace(
        /url\s*\(\s*(['"]?)\s*javascript\s*:[^)]*\1\s*\)/gi,
        '/* javascript url removed */'
    );

    // Remove IE expression() (legacy XSS vector)
    sanitized = sanitized.replace(/expression\s*\(/gi, '/* expression removed */ (');

    // Remove -moz-binding (Firefox XSS vector)
    sanitized = sanitized.replace(/-moz-binding\s*:/gi, '/* -moz-binding removed */:');

    // Remove behavior: url() (IE XSS vector)
    sanitized = sanitized.replace(/behavior\s*:\s*url\s*\(/gi, '/* behavior removed */: (');

    return sanitized;
}

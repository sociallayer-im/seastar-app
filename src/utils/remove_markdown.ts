import removeMarkdownImport from 'markdown-to-text'

/**
 * markdown-to-text is TS-compiled CJS (`exports.default = fn`). webpack's
 * interop unwrapped the default automatically; in Vite's RSC/SSR environment a
 * default import yields the CJS namespace, so calling it threw
 * "default is not a function" (first seen on /event/detail generateMetadata).
 * Import it from here instead of the package.
 */
const removeMarkdown = (
    typeof removeMarkdownImport === 'function'
        ? removeMarkdownImport
        : (removeMarkdownImport as {default: typeof removeMarkdownImport}).default
) as (markdown: string, options?: Record<string, unknown>) => string

export default removeMarkdown

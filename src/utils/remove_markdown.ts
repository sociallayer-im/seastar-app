/**
 * Strip markdown syntax and return plain text. Ported from markdown-to-text
 * 0.1.1 (MIT, https://github.com/EmandM/markdown-to-text) so we own the code —
 * the package is TS-compiled CJS (`exports.default = fn`) whose default import
 * broke under Vite's RSC environment, and at ~40 lines it isn't worth a
 * dependency plus an interop shim. Behavior is unchanged; callers use it for
 * og:description previews.
 */
type Options = {
    stripListLeaders?: boolean
    listUnicodeChar?: string | boolean
    gfm?: boolean
    useImgAltText?: boolean
}

const removeMarkdown = (markdown: string, options: Options = {}): string => {
    const {
        stripListLeaders = true,
        listUnicodeChar = false,
        gfm = true,
        useImgAltText = true
    } = options

    let output = markdown || ''

    // Horizontal rules first — the list-leader rule would eat them otherwise.
    output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, '')

    try {
        if (stripListLeaders) {
            output = listUnicodeChar
                ? output.replace(/^([\s\t]*)([*\-+]|\d+\.)\s+/gm, listUnicodeChar + ' $1')
                : output.replace(/^([\s\t]*)([*\-+]|\d+\.)\s+/gm, '$1')
        }
        if (gfm) {
            output = output
                .replace(/\n={2,}/g, '\n')      // setext header underline
                .replace(/~{3}.*\n/g, '')       // ~~~ fenced codeblock
                .replace(/~~/g, '')             // strikethrough
                .replace(/`{3}.*\n/g, '')       // ``` fenced codeblock
        }
        output = output
            .replace(/<[^>]*>/g, '')                                  // HTML tags
            .replace(/^[=-]{2,}\s*$/g, '')                            // setext headers
            .replace(/\[\^.+?\](: .*?$)?/g, '')                       // footnotes
            .replace(/\s{0,2}\[.*?\]: .*?$/g, '')                     // link definitions
            .replace(/!\[(.*?)\][[(].*?[\])]/g, useImgAltText ? '$1' : '') // images
            .replace(/\[(.*?)\][[(].*?[\])]/g, '$1')                  // inline links
            .replace(/^\s{0,3}>\s?/g, '')                             // blockquotes
            .replace(/(^|\n)\s{0,3}>\s?/g, '\n\n')
            .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')    // reference links
            .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3') // atx headers
            .replace(/([*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')            // emphasis…
            .replace(/([*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')            // …run twice for nesting
            .replace(/(`{3,})(.*?)\1/gm, '$2')                        // code blocks
            .replace(/`(.+?)`/g, '$1')                                // inline code
            .replace(/\n{2,}/g, '\n\n')                               // collapse blank lines
    } catch (e) {
        console.error(e)
        return markdown
    }
    return output
}

export default removeMarkdown

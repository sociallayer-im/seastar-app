/**
 * Render markdown to HTML without a DOM, so event/marker descriptions can be
 * produced on the server instead of by mounting a read-only ProseMirror
 * EditorView in the browser (which cost ~102 KB gzip of markdown-it +
 * prosemirror on the event detail page's first load).
 *
 * The markup is not reimplemented: the document is parsed with the same
 * `defaultMarkdownParser` as before and then walked, emitting HTML from each
 * node's and mark's own `toDOM` spec — the very spec the browser used to build
 * the DOM from. Structure therefore stays identical by construction, and
 * `scripts/verify-markdown-html.mjs` checks that against the real rendering.
 */

import type {Mark, Node as ProseMirrorNode} from 'prosemirror-model'
import {defaultMarkdownParser} from '@/components/client/Editor/markdown'

// prosemirror's DOMOutputSpec, narrowed to the shapes this schema actually uses.
type OutputSpec = string | readonly [string, ...unknown[]]

const VOID_TAGS = new Set(['img', 'br', 'hr'])

/**
 * Only these may appear in href/src. markdown-it's own validateLink already
 * rejects javascript:/vbscript:/file: while parsing, but this output is
 * inserted as raw HTML, so the guarantee is re-established here rather than
 * inherited from a dependency's default configuration.
 */
const SAFE_PROTOCOL = /^(https?:|mailto:|tel:)/i

function escapeText(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

function escapeAttr(value: string): string {
    return escapeText(value).replace(/"/g, '&quot;')
}

function safeUrl(value: string): string | null {
    const trimmed = value.trim()
    if (!trimmed) return null

    // Control characters are stripped by browsers *before* the scheme is
    // parsed, so "java\tscript:" reaches the parser as "javascript:". Testing
    // the raw string would let that through the scheme check below and fall out
    // of the relative-URL branch untouched. markdown-it percent-encodes these
    // today, which is the only reason it is not already exploitable — this does
    // not depend on that.
    const probe = trimmed.replace(/[\u0000-\u0020]/g, '')

    // Anything with a colon before the first path/query/fragment separator is
    // claiming a scheme, and only the allowlisted ones may pass.
    const schemeEnd = probe.search(/[/?#]/)
    const beforePath = schemeEnd === -1 ? probe : probe.slice(0, schemeEnd)
    if (beforePath.includes(':')) {
        return SAFE_PROTOCOL.test(probe) ? trimmed : null
    }

    // Relative, root-relative, anchor and protocol-relative ("//host") links
    // carry no scheme. The last is an open-redirect surface but cannot express
    // a script URL, and it is what the previous renderer allowed too.
    return trimmed
}

/** Attribute names come from schema specs today, but never trust that later. */
const SAFE_ATTR_NAME = /^[a-zA-Z][a-zA-Z0-9-]*$/

const URL_ATTRS = new Set(['href', 'src'])

function renderAttrs(attrs: Record<string, unknown>): string {
    let out = ''
    for (const [name, raw] of Object.entries(attrs)) {
        if (raw === null || raw === undefined || raw === false) continue
        if (!SAFE_ATTR_NAME.test(name)) continue
        let value = String(raw)
        if (URL_ATTRS.has(name)) {
            const safe = safeUrl(value)
            if (safe === null) continue
            value = safe
        }
        out += ` ${name}="${escapeAttr(value)}"`
    }
    return out
}

/**
 * Turn one `toDOM` spec into HTML, substituting `content` at the hole (`0`).
 * Specs look like `["p", 0]`, `["pre", {attrs}, ["code", 0]]` or `["br"]`.
 *
 * `implicitHole` mirrors a difference in prosemirror's own serializer: a mark
 * spec such as `["strong"]` declares no hole, and its content goes straight
 * into the element (`top = contentDOM || dom`), whereas a node spec with no
 * hole is a leaf and renders no content at all.
 */
function renderSpec(spec: OutputSpec, content: string, implicitHole = false): string {
    if (typeof spec === 'string') return escapeText(spec)

    const tag = spec[0]
    let index = 1
    let attrs = ''

    const maybeAttrs = spec[1]
    if (maybeAttrs && typeof maybeAttrs === 'object' && !Array.isArray(maybeAttrs)) {
        attrs = renderAttrs(maybeAttrs as Record<string, unknown>)
        index = 2
    }

    if (VOID_TAGS.has(tag)) return `<${tag}${attrs}>`

    let inner = ''
    let sawHole = false
    for (; index < spec.length; index++) {
        const child = spec[index]
        // 0 is the content hole this node's children go into.
        if (child === 0) {
            inner += content
            sawHole = true
        } else {
            inner += renderSpec(child as OutputSpec, content, implicitHole)
        }
    }
    if (!sawHole && implicitHole) inner += content

    return `<${tag}${attrs}>${inner}</${tag}>`
}

function renderMarks(marks: readonly Mark[], content: string): string {
    // Applied outermost-first, matching how the editor nests mark elements.
    let html = content
    for (let i = marks.length - 1; i >= 0; i--) {
        const mark = marks[i]
        const toDOM = mark.type.spec.toDOM
        if (!toDOM) continue
        html = renderSpec(toDOM(mark, true) as OutputSpec, html, true)
    }
    return html
}

function renderNode(node: ProseMirrorNode): string {
    if (node.isText) {
        return renderMarks(node.marks, escapeText(node.text ?? ''))
    }

    let content = ''
    node.forEach((child) => {
        content += renderNode(child)
    })

    const toDOM = node.type.spec.toDOM
    if (!toDOM) return content
    return renderSpec(toDOM(node) as OutputSpec, content)
}

/** Markdown source to an HTML fragment, for insertion inside `.ProseMirror`. */
export function markdownToHtml(markdown: string): string {
    if (!markdown) return ''

    const doc = defaultMarkdownParser.parse(markdown)
    if (!doc) return ''

    let html = ''
    doc.forEach((child) => {
        html += renderNode(child)
    })
    return html
}

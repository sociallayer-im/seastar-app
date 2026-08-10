import type {ImgHTMLAttributes} from 'react'

export type ImgProps = ImgHTMLAttributes<HTMLImageElement> & {
    /**
     * Load this one immediately and ask the browser to prioritise it. For the
     * LCP image only — a hero or the first carousel slide. Everything else
     * should stay lazy.
     */
    priority?: boolean
}

/**
 * A plain `<img>` with the loading policy attached, in one place.
 *
 * Deliberately native and framework-free: `loading` and `decoding` are browser
 * attributes, so the decision happens while the HTML is being parsed, with no
 * JavaScript involved. An IntersectionObserver version would have to download
 * and execute JS before any image could even start — on a link where a round
 * trip costs over a second, that is strictly worse than doing nothing.
 *
 * next/image is not used either: these URLs are already resized and re-encoded
 * by Cloudflare (see cfImage — format=auto, quality=85, explicit dimensions),
 * so a second optimisation layer would add configuration and a proxy hop for
 * no gain.
 *
 * Browsers without `loading="lazy"` ignore the attribute and fetch eagerly,
 * which is exactly today's behaviour — the change cannot regress them.
 */
export default function Img({priority, loading, ...props}: ImgProps) {
    // React 18.2 does not know the camelCase `fetchPriority` prop and warns on
    // it; the all-lowercase spelling is passed through to the DOM untouched,
    // which is what the browser reads. Revisit when React reaches 18.3+.
    const priorityAttrs: Record<string, string> = priority ? {fetchpriority: 'high'} : {}

    return <img
        {...props}
        {...priorityAttrs}
        loading={loading ?? (priority ? 'eager' : 'lazy')}
        decoding="async"/>
}

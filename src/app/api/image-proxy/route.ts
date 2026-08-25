// Same-origin relay for the object-store image hosts (datastore.sola.day on
// R2/international, assets.juluo.xyz on Aliyun OSS/CN), neither of which
// sends an Access-Control-Allow-Origin header. saveDomImage
// (src/utils/index.ts) uses dom-to-image to capture the event share card, and
// dom-to-image embeds <img> sources by fetching them itself — without CORS
// headers that fetch is blocked, and the capture throws "Failed to capture
// image: Unknown error" (see ShareActionsBtn.tsx). Routing the same bytes
// through this same-origin endpoint sidesteps that entirely; nothing on the
// object-store side needs to change.
//
// `url` is allow-listed by hostname, not proxied blindly — an open proxy here
// would let this server fetch arbitrary attacker-supplied URLs (SSRF).
const ALLOWED_HOSTS = new Set(['datastore.sola.day', 'assets.juluo.xyz'])

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const target = new URL(request.url).searchParams.get('url')
    if (!target) return new Response('missing url', {status: 400})

    let parsed: URL
    try {
        parsed = new URL(target)
    } catch {
        return new Response('invalid url', {status: 400})
    }
    if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
        return new Response('host not allowed', {status: 400})
    }

    const upstream = await fetch(parsed.toString())
    if (!upstream.ok || !upstream.body) {
        return new Response('upstream fetch failed', {status: 502})
    }

    return new Response(upstream.body, {
        status: 200,
        headers: {
            'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    })
}

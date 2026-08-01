/** @type {import('next').NextConfig} */

// ActivityPub federation proxy (soon/design/FEDERATION_PLAN.md §2.2).
// app.sola.day is the canonical federation host, so protocol paths served by
// the soon backend are rewritten there. Rails does the Accept negotiation:
// AP clients get activity+json, browsers get redirected back to the human
// pages (/profile/:handle, /group/:handle, /event/detail/:id) — none of
// which collide with these paths. While the backend has FEDERATION_ENABLED
// off these all 404, same as before the rewrites existed.
const FEDERATION_API =
    process.env.FEDERATION_API_URL
    || process.env.NEXT_PUBLIC_API_URL
    || (process.env.NEXT_PUBLIC_CLIENT_MODE === 'prod' ? 'https://api.sola.day' : 'http://localhost:3000')

const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
            },
            {
                protocol: 'https',
                hostname: 'datastore.sola.day',
            },
            {
                protocol: 'https',
                hostname: 'raindrop-nft-data.s3.us-east-2.amazonaws.com',
            }
        ]
    },
    async rewrites() {
        // [source, destination-path] — the source may carry a regex constraint,
        // the destination only the named params.
        const pairs = [
            ['/.well-known/webfinger', '/.well-known/webfinger'],
            ['/.well-known/host-meta', '/.well-known/host-meta'],
            ['/.well-known/nodeinfo', '/.well-known/nodeinfo'],
            ['/nodeinfo/2.0', '/nodeinfo/2.0'],
            ['/actor', '/actor'],
            ['/inbox', '/inbox'],
            ['/users/:handle', '/users/:handle'],
            ['/users/:handle/:collection(inbox|outbox|followers|following)', '/users/:handle/:collection'],
            ['/groups/:handle', '/groups/:handle'],
            ['/groups/:handle/:collection(inbox|outbox|followers|following)', '/groups/:handle/:collection'],
            ['/events/:id', '/events/:id'],
        ]
        return pairs.map(([source, destination]) => ({
            source,
            destination: `${FEDERATION_API}${destination}`,
        }))
    }
}

export default nextConfig

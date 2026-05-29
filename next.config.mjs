import {createRequire} from 'module'

const require = createRequire(import.meta.url)

// ProseMirror core packages rely on module-level singletons (e.g. the plugin-key
// registry in prosemirror-state). Under bun's isolated node_modules layout each
// consumer gets its own physical copy, so webpack loads several instances and the
// editor crashes with "Adding different instances of a keyed plugin". Force every
// bare import of these packages to resolve to a single copy. The trailing `$`
// makes the alias an exact match (these packages have no deep subpath imports).
const prosemirrorSingletons = [
    'prosemirror-state',
    'prosemirror-model',
    'prosemirror-transform',
    'prosemirror-view',
]

const prosemirrorAliases = Object.fromEntries(
    prosemirrorSingletons.map(pkg => [`${pkg}$`, require.resolve(pkg)])
)

/** @type {import('next').NextConfig} */
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
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            ...prosemirrorAliases,
        }
        return config
    }
}

export default nextConfig

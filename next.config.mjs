/** @type {import('next').NextConfig} */
const nextConfig = {
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
    }
}

export default nextConfig

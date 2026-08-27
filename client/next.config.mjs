// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'cloudflare-ipfs.com',
            },
        ],
    },
    reactStrictMode: true,
};

export default nextConfig;

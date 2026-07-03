import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@jugasaro/shared'],
  images: {
    remotePatterns: [
      // Will be expanded in Phase 8 to include the Cloudflare R2 / CDN domain
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.cloudflarestorage.com' },
    ],
  },
};

export default nextConfig;

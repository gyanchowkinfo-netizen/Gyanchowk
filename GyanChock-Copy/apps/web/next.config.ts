import type { NextConfig } from 'next';

const PRODUCTION_API_URL = 'https://gyanchowk-1.onrender.com';

function apiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';
  if (raw && !raw.includes('vercel.app')) return raw;
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') return PRODUCTION_API_URL;
  return 'http://localhost:4000';
}

/**
 * OneDrive / synced-folder fix for Windows local dev:
 *
 * The `predev` script (scripts/setup-next-dir.mjs) sets the Hidden+System attribute
 * on apps/web/.next before each `next dev`, so OneDrive ignores that folder and never
 * locks the build files. distDir stays as the default '.next' so Node module resolution
 * continues to work normally.
 *
 * Webpack cache uses 'memory' mode on Windows as an extra guard against the
 * OneDrive ENOENT rename-lock error on .pack.gz_ → .pack.gz atomic renames.
 */
const nextConfig: NextConfig = {
  transpilePackages: ['@gyan-chowk/shared'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (dev && process.platform === 'win32') {
      // Exclude heavy directories so Webpack never crawls node_modules or .next on Windows
      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
      };
      // Memory cache avoids ENOENT rename errors on .pack.gz (OneDrive locking)
      config.cache = { type: 'memory' };
    }
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async rewrites() {
    const api = apiOrigin();
    return [
      { source: '/favicon.ico', destination: '/g2.png' },
      { source: '/api/:path*', destination: `${api}/api/:path*` },
    ];
  },
};

export default nextConfig;

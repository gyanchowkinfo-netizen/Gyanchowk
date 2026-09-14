import type { NextConfig } from 'next';

const PRODUCTION_API_URL = 'https://gyanchowk-1.onrender.com';

function apiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';
  if (raw && !raw.includes('vercel.app')) return raw;
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') return PRODUCTION_API_URL;
  return 'http://localhost:4000';
}

const nextConfig: NextConfig = {
  transpilePackages: ['@gyan-chowk/shared', 'three', '@react-three/fiber'],
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

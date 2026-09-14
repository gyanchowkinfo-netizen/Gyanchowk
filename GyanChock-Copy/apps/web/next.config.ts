import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@gyan-chowk/shared', 'three', '@react-three/fiber'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      { source: '/favicon.ico', destination: '/g2.png' },
      { source: '/backend/:path*', destination: `${api}/:path*` },
    ];
  },
};

export default nextConfig;

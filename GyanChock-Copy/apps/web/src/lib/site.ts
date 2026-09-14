export const PRODUCTION_API_URL = 'https://gyanchowk-1.onrender.com';
export const PRODUCTION_APP_URL = 'https://gyanchowk.vercel.app';

export function apiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';
  if (raw && !isFrontendHost(raw)) return raw;
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') return PRODUCTION_API_URL;
  return 'http://localhost:4000';
}

function isFrontendHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'gyanchowk.vercel.app' || hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

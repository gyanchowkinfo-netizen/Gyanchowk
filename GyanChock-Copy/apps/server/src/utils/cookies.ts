import type { CookieOptions, Response } from 'express';
import { isProd } from '../config/env.js';

const base: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
};

export function setAuthCookies(res: Response, access: string, refresh: string) {
  res.cookie('gc_access', access, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('gc_refresh', refresh, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('gc_access', { ...base });
  res.clearCookie('gc_refresh', { ...base });
}

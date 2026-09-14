'use client';

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const KEY = 'gc-recent-courses';

export function rememberCourse(slug: string, title: string) {
  if (typeof window === 'undefined') return;
  const prev = getRecentCourses().filter((x) => x.slug !== slug);
  const next = [{ slug, title }, ...prev].slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getRecentCourses(): Array<{ slug: string; title: string }> {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Array<{ slug: string; title: string }>;
  } catch {
    return [];
  }
}

export function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Razorpay checkout failed to load. Add RAZORPAY_KEY_ID on the server.'));
    document.body.appendChild(s);
  });
}

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

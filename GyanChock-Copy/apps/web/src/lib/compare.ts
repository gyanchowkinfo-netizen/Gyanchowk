'use client';

import { create } from 'zustand';

const KEY = 'gc-compare-courses';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

export const useCompare = create<{
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
}>((set, get) => ({
  ids: [],
  toggle: (id) => {
    const cur = get().ids.length ? get().ids : read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].slice(-3);
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ ids: next });
  },
  clear: () => {
    localStorage.removeItem(KEY);
    set({ ids: [] });
  },
}));

export function hydrateCompare() {
  useCompare.setState({ ids: read() });
}

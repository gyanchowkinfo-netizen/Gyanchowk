'use client';

import { create } from 'zustand';
import { api } from './api';

export interface SessionUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: string;
  teacherStatus?: string;
  mustChangePassword?: boolean;
  referralCode?: string;
  avatar?: { url?: string };
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  setUser: (user: SessionUser | null) => void;
  refresh: () => Promise<void>;
  logout: (all?: boolean) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  refresh: async () => {
    try {
      const data = await api<{ user: SessionUser }>('/api/auth/me');
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async (all = false) => {
    await api('/api/auth/logout', { method: 'POST', body: JSON.stringify({ allDevices: all }) });
    set({ user: null, loading: false });
  },
}));

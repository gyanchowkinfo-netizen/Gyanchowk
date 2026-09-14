export type { Role, Permission, Language, RankScope } from './constants.js';

export interface AuthUser {
  id: string;
  role: 'student' | 'teacher' | 'admin';
  email: string;
  name: string;
  status: string;
  teacherStatus?: string;
  permissions?: string[];
  mustChangePassword?: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
  details?: unknown;
}

export interface PlaybackGrant {
  videoId: string;
  hlsUrl: string;
  posterUrl?: string;
  duration?: number;
  subtitles: Array<{ label: string; src: string; srclang: string }>;
  resumeAt: number;
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface CourseDetailAdminBarProps {
  courseTitle: string;
  onOpenAdmin: () => void;
}

export function CourseDetailAdminBar({ courseTitle, onOpenAdmin }: CourseDetailAdminBarProps) {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold">Admin Mode:</span>
          <span>
            You can customize every section of <strong>{courseTitle}</strong>.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 font-bold text-slate-950 shadow-xs hover:bg-amber-500 transition active:scale-95"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Manage Course Content</span>
          </button>

          <Link
            href="/admin/catalogue-courses"
            className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 hover:underline"
          >
            <span>Catalogue Dashboard</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

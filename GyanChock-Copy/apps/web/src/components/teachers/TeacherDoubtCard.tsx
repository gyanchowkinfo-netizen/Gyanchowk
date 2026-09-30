'use client';

import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import type { TeacherCardData } from '@/lib/types';

export function TeacherDoubtCard({ teacher }: { teacher: TeacherCardData }) {
  if (teacher.doubtCTA && teacher.doubtCTA.visible === false) return null;

  const title = teacher.doubtCTA?.title || 'Have doubts?';
  const description =
    teacher.doubtCTA?.description || `Ask ${teacher.name} directly in doubt section`;
  const buttonText = teacher.doubtCTA?.buttonText || 'Ask a Question';
  const buttonUrl = teacher.doubtCTA?.buttonUrl || '/doubts';

  return (
    <div id="qa-section" className="relative overflow-hidden rounded-3xl bg-[#1C1815] p-6 text-white shadow-md">
      {/* Subtle Warm Gradient in background */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-600/15 blur-2xl" />

      <div className="relative z-10 flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-amber-300 backdrop-blur-sm">
          <MessageSquareText className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <h3 className="font-display text-base font-bold text-white tracking-tight">{title}</h3>
          <p className="mt-0.5 text-xs text-stone-300 leading-snug">{description}</p>

          <div className="mt-4">
            <Link
              href={buttonUrl}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold text-[#1C1815] shadow-sm transition hover:bg-stone-100 hover:shadow active:scale-95"
            >
              <span>{buttonText}</span>
              <span className="text-sm leading-none">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

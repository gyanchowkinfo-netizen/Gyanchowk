'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { TeacherCardData } from '@/lib/types';

export function TeacherSubjectsCard({ teacher }: { teacher: TeacherCardData }) {
  const primarySubject = teacher.subject || teacher.subjects?.[0] || 'Chemistry';
  const subjectsList =
    teacher.subjects && teacher.subjects.length > 0
      ? teacher.subjects
      : [primarySubject, 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'];

  // Ensure unique list
  const uniqueSubjects = Array.from(new Set([primarySubject, ...subjectsList]));

  return (
    <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
            <BookOpen className="h-4 w-4" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#1C1815]">Subjects</h2>
        </div>

        <Link
          href={`/courses?subject=${encodeURIComponent(primarySubject)}`}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors"
        >
          <span>View All</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {/* Subject Pills */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        {uniqueSubjects.map((sub, index) => {
          const isPrimary = index === 0;
          return (
            <span
              key={sub}
              className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isPrimary
                  ? 'bg-[#1C1815] text-white shadow-sm'
                  : 'border border-[#E5DFD4] bg-[#FAF8F5] text-[#473E36] hover:bg-white hover:border-[#D6CEC1]'
              }`}
            >
              {sub}
            </span>
          );
        })}
      </div>
    </div>
  );
}

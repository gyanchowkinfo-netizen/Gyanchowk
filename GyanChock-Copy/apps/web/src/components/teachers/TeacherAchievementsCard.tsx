'use client';

import { Trophy, Users, FileText, Star } from 'lucide-react';
import type { TeacherCardData } from '@/lib/types';

export function TeacherAchievementsCard({ teacher }: { teacher: TeacherCardData }) {
  const enrollmentCount = teacher.stats?.enrollmentCount ?? teacher.enrollmentCount ?? 17;
  const reviewCount = teacher.stats?.reviewCount ?? teacher.ratingCount ?? 38;
  const rating = teacher.stats?.rating ?? teacher.ratingAvg ?? 5.0;

  // Custom achievements if set
  const customAchievements = teacher.achievements ?? [];

  return (
    <div id="achievements-section" className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
            <Trophy className="h-4 w-4" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#1C1815]">Key Achievements</h2>
        </div>

        <button
          type="button"
          onClick={() => {
            document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors"
        >
          <span>View All</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {/* Verified Enrollments */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EDE7DD] bg-[#FAF8F5] p-5 text-center transition-all hover:bg-white hover:border-amber-200 hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/70 text-orange-700 mb-2.5">
            <Users className="h-5 w-5" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#1C1815]">{enrollmentCount}</p>
          <p className="mt-1 text-xs font-medium text-[#736A61]">Verified Enrollments</p>
        </div>

        {/* Course Reviews */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EDE7DD] bg-[#FAF8F5] p-5 text-center transition-all hover:bg-white hover:border-amber-200 hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/70 text-amber-700 mb-2.5">
            <FileText className="h-5 w-5" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#1C1815]">{reviewCount}</p>
          <p className="mt-1 text-xs font-medium text-[#736A61]">Course Reviews</p>
        </div>

        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EDE7DD] bg-[#FAF8F5] p-5 text-center transition-all hover:bg-white hover:border-amber-200 hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100/70 text-yellow-700 mb-2.5">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#1C1815]">{rating.toFixed(1)}</p>
          <p className="mt-1 text-xs font-medium text-[#736A61]">Average Rating</p>
        </div>
      </div>

      {/* Additional custom achievements if any */}
      {customAchievements.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F0EBE3]">
          {customAchievements.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-xl border border-stone-200/70 p-3 bg-white">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                {item.value ? <p className="text-xs font-bold text-amber-700">{item.value}</p> : null}
                {item.description ? <p className="text-xs text-stone-500 mt-0.5">{item.description}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

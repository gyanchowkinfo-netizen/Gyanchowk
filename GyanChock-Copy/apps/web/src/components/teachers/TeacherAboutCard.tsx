'use client';

import { User, Calendar, GraduationCap, MapPin, Globe } from 'lucide-react';
import type { TeacherCardData } from '@/lib/types';

export function TeacherAboutCard({ teacher }: { teacher: TeacherCardData }) {
  const bio =
    teacher.bio ||
    teacher.details ||
    `${teacher.name} is a passionate educator dedicated to helping students build conceptual clarity and achieve academic excellence through structured lessons and engaging practice.`;

  const experience = teacher.experience || '8+ Years';
  const education = teacher.education || (teacher.qualifications && teacher.qualifications[0]) || 'M.Sc. Chemistry';
  const location = teacher.location || 'Online / New Delhi';
  const languages =
    teacher.languages && teacher.languages.length > 0
      ? teacher.languages.join(', ')
      : 'English, Hindi';

  return (
    <div id="about-section" className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
          <User className="h-4 w-4" />
        </div>
        <h2 className="font-display text-lg font-bold text-[#1C1815]">About Teacher</h2>
      </div>

      {/* Bio */}
      <p className="text-sm leading-relaxed text-[#5C544D] whitespace-pre-line">
        {bio}
      </p>

      {/* 4 Details Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F0EBE3] pt-5">
        {/* Experience */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Experience</p>
            <p className="text-sm font-semibold text-[#1C1815]">{experience}</p>
          </div>
        </div>

        {/* Education */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Education</p>
            <p className="text-sm font-semibold text-[#1C1815]">{education}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Location</p>
            <p className="text-sm font-semibold text-[#1C1815]">{location}</p>
          </div>
        </div>

        {/* Languages */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Languages</p>
            <p className="text-sm font-semibold text-[#1C1815]">{languages}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

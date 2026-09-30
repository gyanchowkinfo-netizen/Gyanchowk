'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, ChevronRight, BookOpen, Settings2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { TeacherCourseManagerModal, type FeaturedCourseItem } from './TeacherCourseManagerModal';
import type { CourseCardData, TeacherCardData } from '@/lib/types';

const DEFAULT_COURSES: FeaturedCourseItem[] = [
  {
    title: 'Organic Chemistry Complete Course',
    subject: 'Chemistry',
    modulesCount: 12,
    durationHours: 45,
    rating: 5.0,
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=120&q=80',
    url: '/courses',
  },
  {
    title: 'Inorganic Chemistry Mastery',
    subject: 'Chemistry',
    modulesCount: 10,
    durationHours: 38,
    rating: 5.0,
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=120&q=80',
    url: '/courses',
  },
  {
    title: 'Physical Chemistry Concepts',
    subject: 'Chemistry',
    modulesCount: 8,
    durationHours: 32,
    rating: 5.0,
    thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=120&q=80',
    url: '/courses',
  },
];

export function TeacherFeaturedCoursesCard({
  teacher,
  catalogCourses = [],
}: {
  teacher: TeacherCardData;
  catalogCourses?: CourseCardData[];
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [managerOpen, setManagerOpen] = useState(false);

  // Prioritize customCourses managed by admin, then catalogCourses, then defaults
  let displayCourses: FeaturedCourseItem[] = [];

  if (teacher.customCourses && teacher.customCourses.length > 0) {
    displayCourses = teacher.customCourses;
  } else if (catalogCourses.length > 0) {
    displayCourses = catalogCourses.map((c) => ({
      title: c.title,
      subject: (c as any).subjects?.[0] || (c as any).subject || c.category || teacher.subject || 'Chemistry',
      modulesCount: (c as any).curriculum?.length || 10,
      durationHours: 40,
      rating: c.ratingAvg || 5.0,
      price: c.price,
      url: `/courses/${c.slug || c._id}`,
      thumbnail: c.thumbnail?.url,
    }));
  } else {
    displayCourses = DEFAULT_COURSES;
  }

  return (
    <>
      <div id="teacher-courses" className="rounded-3xl border border-[#ECE6DE] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h2 className="font-display text-base font-bold text-[#1C1815]">Featured Courses</h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Admin Quick Manage Button */}
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setManagerOpen(true)}
                title="Manage featured courses"
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50/80 px-2.5 py-1 text-[11px] font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
              >
                <Settings2 className="h-3 w-3" />
                <span>Manage</span>
              </button>
            ) : null}

            <Link
              href={`/courses?teacher=${encodeURIComponent(teacher.name)}`}
              className="group inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors"
            >
              <span>View All</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-3 pt-1">
          {displayCourses.slice(0, 6).map((c, i) => (
            <Link
              key={i}
              href={c.url || '/courses'}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-[#EDE7DD] bg-[#FAF8F5] p-3 transition hover:bg-white hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-200 border border-stone-100">
                  {c.thumbnail ? (
                    <Image src={c.thumbnail} alt={c.title} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-amber-100 text-amber-800">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#1C1815] group-hover:text-amber-900 transition-colors">
                    {c.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.subject ? (
                      <span className="text-[10px] font-medium text-amber-800">{c.subject}</span>
                    ) : null}
                    <span className="text-[10px] text-stone-400">•</span>
                    <span className="text-[10px] text-stone-500">
                      {c.modulesCount ?? 10} Modules • {c.durationHours ?? 40} Hours
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Admin Course Manager Modal */}
      {isAdmin ? (
        <TeacherCourseManagerModal
          teacher={teacher}
          open={managerOpen}
          onClose={() => setManagerOpen(false)}
        />
      ) : null}
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { MarketplaceCourseCard } from '@/components/courses/MarketplaceCourseCard';
import { EmptyState, ErrorState, SkeletonCard } from '@/components/ui/States';
import type { CourseCardData, HomeSectionCopy } from '@/lib/types';
import { SectionHeading } from './SectionHeading';
import { useAuth } from '@/lib/auth';
import { CourseEditModal } from '@/components/admin/CourseEditModal';

export function FeaturedCourses({
  courses,
  loading,
  error,
  onRetry,
  copy,
}: {
  courses: CourseCardData[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  copy?: HomeSectionCopy;
}) {
  const user = useAuth((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseCardData | null>(null);

  const handleCreate = () => {
    setSelectedCourse(null);
    setEditModalOpen(true);
  };

  const handleEdit = (c: CourseCardData) => {
    setSelectedCourse(c);
    setEditModalOpen(true);
  };

  return (
    <section
      className="relative overflow-hidden border-y border-gc-line/80 bg-[linear-gradient(180deg,#f3f0e8_0%,#f6f4ee_45%,#fffcf7_100%)]"
      aria-labelledby="featured-courses"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-[color:var(--brand-blue)]/[0.06] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-[color:var(--brand-violet)]/[0.06] blur-3xl" />
      </div>

      <div className="gc-container relative py-7 md:py-10">
        <div className="relative">
          <SectionHeading
            id="featured-courses"
            kicker={copy?.kicker || 'Catalogue'}
            title={copy?.title || 'Featured courses'}
            subtitle={copy ? copy.subtitle : 'Structured programs designed around outcomes, not endless content.'}
            align="center"
          />

          {/* Admin Quick Action Button */}
          {isAdmin && (
            <div className="mt-3 flex justify-center">
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition hover:bg-slate-900 hover:text-white"
              >
                <Plus size={13} className="text-amber-600" />
                <span>Add New Course (Admin)</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <div className="mt-6">
            <ErrorState message={error} onRetry={onRetry} />
          </div>
        ) : courses.length ? (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {courses.slice(0, 8).map((course, idx) => (
                <MarketplaceCourseCard
                  key={course._id}
                  course={course}
                  index={idx}
                  onEdit={isAdmin ? handleEdit : undefined}
                  onDelete={isAdmin ? handleEdit : undefined}
                  ctaText="View course"
                />
              ))}
            </div>

            <p className="mt-10 text-center">
              <Link href="/courses" className="gc-btn-outline">
                View All Courses
              </Link>
            </p>
          </>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No courses available yet."
              body="The catalogue is curated by the team. Check back shortly."
              action={{ href: '/courses', label: 'Explore other categories' }}
            />
          </div>
        )}
      </div>

      {/* Admin Course Edit / Add Modal */}
      {isAdmin && (
        <CourseEditModal
          course={selectedCourse}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSaved={() => setEditModalOpen(false)}
        />
      )}
    </section>
  );
}

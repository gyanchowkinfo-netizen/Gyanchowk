'use client';

import Link from 'next/link';
import { CourseGrid } from '@/components/public/CourseCard';
import { EmptyState, ErrorState, SkeletonCard } from '@/components/ui/States';
import type { CourseCardData, HomeSectionCopy } from '@/lib/types';
import { SectionHeading } from './SectionHeading';

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
  return (
    <section
      className="relative overflow-hidden border-y border-gc-line/80 bg-[linear-gradient(180deg,#f3f0e8_0%,#f6f4ee_45%,#fffcf7_100%)]"
      aria-labelledby="featured-courses"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-[color:var(--brand-blue)]/[0.06] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-[color:var(--brand-violet)]/[0.06] blur-3xl" />
      </div>
      <div className="gc-container relative py-16 md:py-20">
        <SectionHeading
          id="featured-courses"
          kicker={copy?.kicker || 'Catalogue'}
          title={copy?.title || 'Featured courses'}
          subtitle={copy ? copy.subtitle : 'Structured programs designed around outcomes, not endless content.'}
          align="center"
        />
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : courses.length ? (
          <>
            <CourseGrid courses={courses.slice(0, 6)} featured variant="catalog" />
            <p className="mt-8 text-center">
              <Link href="/courses" className="gc-btn-outline">
                View All Courses
              </Link>
            </p>
          </>
        ) : (
          <EmptyState
            title="No courses available yet."
            body="The catalogue is curated by the team. Check back shortly."
            action={{ href: '/courses', label: 'Explore other categories' }}
          />
        )}
      </div>
    </section>
  );
}

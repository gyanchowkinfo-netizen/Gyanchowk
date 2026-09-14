'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, Breadcrumbs } from '@/components/layout/Page';
import { ErrorState } from '@/components/ui/States';
import { AnimatedSection, ScrollProgress } from '@/components/motion';
import { api } from '@/lib/api';
import type { BatchCardData, CourseCardData, TeacherCardData } from '@/lib/types';
import { TeacherProfileHero } from './TeacherProfileHero';
import { TeacherCourses } from './TeacherCourses';
import { TeacherReviews, type TeacherReviewItem } from './TeacherReviews';

export interface TeacherProfilePayload {
  teacher: TeacherCardData;
  courses: CourseCardData[];
  batches: BatchCardData[];
  reviews: TeacherReviewItem[];
}

export function TeacherProfileSkeleton() {
  return (
    <PageContainer>
      <div className="h-4 w-48 animate-pulse rounded bg-gc-navy" />
      <div className="mt-6 grid gap-8 rounded-3xl border border-gc-line p-8 md:grid-cols-[280px_1fr]">
        <div className="mx-auto h-48 w-48 animate-pulse rounded-[2rem] bg-gc-navy" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-gc-navy" />
          <div className="h-4 w-full animate-pulse rounded bg-gc-navy" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-gc-navy" />
        </div>
      </div>
    </PageContainer>
  );
}

export function TeacherProfileView({
  slug,
  initial,
  loadError,
}: {
  slug: string;
  initial?: TeacherProfilePayload;
  loadError?: string;
}) {
  const query = useQuery({
    queryKey: ['teacher', slug],
    queryFn: () => api<TeacherProfilePayload>(`/api/catalog/teachers/${slug}`),
    initialData: initial,
  });

  if (query.isLoading && !query.data) return <TeacherProfileSkeleton />;
  if (query.error || (loadError && !query.data)) {
    return (
      <PageContainer>
        <ErrorState
          message="Unable to load this teacher. Please try again."
          onRetry={() => void query.refetch()}
        />
      </PageContainer>
    );
  }
  const teacher = query.data?.teacher;
  if (!teacher) {
    return (
      <PageContainer>
        <ErrorState message="Teacher not found" onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  const courses = query.data?.courses ?? [];
  const batches = query.data?.batches ?? [];
  const reviews = query.data?.reviews ?? [];
  const subjects = teacher.subjects?.length ? teacher.subjects : teacher.categories ?? [];
  const achievements = [
    teacher.courseCount ? `${teacher.courseCount} published course${teacher.courseCount === 1 ? '' : 's'}` : null,
    teacher.enrollmentCount ? `${teacher.enrollmentCount} verified enrollment${teacher.enrollmentCount === 1 ? '' : 's'}` : null,
    teacher.ratingCount ? `${teacher.ratingCount} course review${teacher.ratingCount === 1 ? '' : 's'}` : null,
  ].filter(Boolean) as string[];

  return (
    <PageContainer>
      <ScrollProgress />
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/teachers', label: 'Teachers' }, { label: teacher.name }]} />
      <TeacherProfileHero teacher={teacher} />

      <AnimatedSection>
        <h2 className="mt-12 font-display text-2xl text-gc-black">Profile</h2>
        <p className="mt-3 max-w-3xl text-gc-mist">{teacher.bio || 'This teacher has not added a public bio yet.'}</p>
        {teacher.createdAt ? (
          <p className="mt-2 text-sm text-gc-mute">On Gyan Chowk since {new Date(teacher.createdAt).toLocaleDateString()}</p>
        ) : null}
      </AnimatedSection>

      <AnimatedSection>
        <h2 className="mt-10 font-display text-2xl text-gc-black">Subjects</h2>
        {subjects.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {subjects.map((s) => (
              <li key={s} className="gc-card px-4 py-2 text-sm">
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gc-mute">Subjects appear after this teacher publishes a course.</p>
        )}
      </AnimatedSection>

      {achievements.length ? (
        <AnimatedSection>
          <h2 className="mt-10 font-display text-2xl text-gc-black">Achievements</h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {achievements.map((item) => (
              <li key={item} className="gc-card p-4 text-sm text-gc-mist">
                {item}
              </li>
            ))}
          </ul>
        </AnimatedSection>
      ) : null}

      <TeacherCourses courses={courses} />

      <AnimatedSection>
        <h2 className="mt-10 font-display text-2xl text-gc-black">Batches</h2>
        {batches.length ? (
          <ul className="mt-3 space-y-2">
            {batches.map((b) => (
              <li key={b._id}>
                <Link href={`/batches/${b.slug}`} className="gc-card block p-4 transition-transform duration-300 hover:-translate-y-0.5 hover:border-gc-gold">
                  {b.name}
                  <span className="ml-2 text-xs text-gc-mute">{b.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gc-mute">No open batches assigned to this teacher.</p>
        )}
      </AnimatedSection>

      <TeacherReviews reviews={reviews} />

      <AnimatedSection>
        <div className="mt-12 gc-card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-display text-2xl text-gc-black">Start learning with {teacher.name.split(' ')[0]}</p>
            <p className="text-sm text-gc-mute">Enrollment unlocks after Razorpay verification on paid courses.</p>
          </div>
          <Link href="/courses" className="gc-btn-gold">
            Browse courses <span className="gc-btn-arrow">→</span>
          </Link>
        </div>
      </AnimatedSection>
    </PageContainer>
  );
}

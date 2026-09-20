'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';
import { CourseCard } from '@/components/public/CourseCard';
import { EmptyState, LoadingState } from '@/components/ui/States';
import type { CourseCardData } from '@/lib/types';

export default function GovernmentExamsPage() {
  const courses = useQuery({
    queryKey: ['gov-courses'],
    queryFn: () => api<{ items: CourseCardData[] }>('/api/courses?careerTrack=government-exam'),
  });
  const tests = useQuery({
    queryKey: ['gov-tests'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/tests?careerTrack=government-exam'),
  });
  return (
    <PageContainer>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/career', label: 'Career' }, { label: 'Government exams' }]} />
      <PageHeader
        title="Government exam preparation"
        subtitle="Courses and mocks tagged careerTrack=government-exam. Same catalogue and quiz engine — no parallel product."
      />
      {courses.isLoading ? <LoadingState /> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(courses.data?.items ?? []).map((c) => (
          <CourseCard key={c._id} course={c} />
        ))}
      </div>
      {!courses.isLoading && !(courses.data?.items.length) ? (
        <EmptyState title="No government-exam courses yet" action={{ href: '/courses', label: 'Browse all courses' }} />
      ) : null}
      <h2 className="mt-10 font-display text-2xl">Mocks</h2>
      <ul className="mt-3 space-y-2">
        {(tests.data?.items ?? []).map((t) => (
          <li key={t._id}>
            <Link href="/student/tests">{t.title}</Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

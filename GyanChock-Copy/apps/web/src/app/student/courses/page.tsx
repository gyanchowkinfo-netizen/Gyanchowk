'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';

export default function StudentCoursesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () =>
      api<{
        items: Array<{
          _id: string;
          status?: string;
          course?: { _id: string; title: string; slug: string };
          batch?: { name: string };
        }>;
      }>('/api/learning/enrollments'),
  });
  const courses = (data?.items ?? []).filter((e) => e.course);
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">My courses</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-6 space-y-3">
        {courses.map((e) => (
          <li key={e._id}>
            <Link href={`/student/learning/${e.course!._id}`} className="gc-card block p-5 hover:border-gc-gold">
              <p className="font-display text-lg">{e.course!.title}</p>
              {e.batch ? <p className="text-sm text-gc-mute">{e.batch.name}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
      {!isLoading && !courses.length ? (
        <EmptyState title="No enrollments yet" action={{ href: '/courses', label: 'Browse courses' }} />
      ) : null}
    </div>
  );
}

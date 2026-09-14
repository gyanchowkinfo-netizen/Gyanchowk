'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimatedProgress } from '@/components/motion';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';

export default function BacklogPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['backlog'],
    queryFn: () =>
      api<{
        byCourse: Record<string, { total: number; done: number }>;
        unwatched: Array<{ _id: string; title: string; course?: string }>;
      }>('/api/learning/backlog'),
  });
  const courses = Object.entries(data?.byCourse ?? {});
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Backlog planner</h1>
      <p className="mt-2 text-sm text-gc-mute">Incomplete lessons from enrolled courses. Daily/weekly targets stay on this device until a planner API is expanded.</p>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <div className="mt-6 space-y-4">
        {courses.map(([id, c]) => (
          <div key={id} className="gc-card p-4">
            <div className="flex justify-between text-sm">
              <span>Course {id.slice(-6)}</span>
              <span>
                {c.done}/{c.total}
              </span>
            </div>
            <div className="mt-2">
              <AnimatedProgress value={c.total ? Math.round((c.done / c.total) * 100) : 0} />
            </div>
            <Link href={`/student/learning/${id}`} className="mt-2 inline-block text-sm text-gc-glow">
              Continue
            </Link>
          </div>
        ))}
      </div>
      <h2 className="mt-8 font-display text-xl text-gc-black">Incomplete lessons</h2>
      <ul className="mt-3 space-y-2">
        {(data?.unwatched ?? []).map((l) => (
          <li key={l._id} className="gc-card p-3 text-sm">
            {l.title}
          </li>
        ))}
      </ul>
      {!isLoading && !courses.length ? <EmptyState title="No backlog" body="Enroll and start watching to build a plan." /> : null}
    </div>
  );
}

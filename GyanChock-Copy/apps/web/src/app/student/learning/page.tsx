'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, LoadingState } from '@/components/ui/States';

export default function StudentLearningIndex() {
  const { data, isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () =>
      api<{ items: Array<{ course?: { _id: string; title: string; slug: string } }> }>('/api/learning/enrollments'),
  });
  const courses = (data?.items ?? []).map((e) => e.course).filter(Boolean);
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Learning</h1>
      <p className="mt-2 text-sm text-gc-mute">Open a course classroom. The player is not lazy-loaded; HLS starts as soon as playback is granted.</p>
      {isLoading ? <LoadingState /> : null}
      <ul className="mt-6 space-y-3">
        {courses.map((c) =>
          c ? (
            <li key={c._id}>
              <Link href={`/student/learning/${c._id}`} className="gc-card block p-5 hover:border-gc-gold">
                {c.title}
              </Link>
            </li>
          ) : null,
        )}
      </ul>
      {!isLoading && !courses.length ? <EmptyState title="Enroll in a course to start" action={{ href: '/courses', label: 'Browse' }} /> : null}
    </div>
  );
}

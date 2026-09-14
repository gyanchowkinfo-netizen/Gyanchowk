'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';

export default function StudentAssignmentsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assignments'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; title: string; deadline?: string; totalMarks?: number }> }>('/api/learning/assignments'),
  });
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Assignments</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-6 space-y-3">
        {(data?.items ?? []).map((a) => (
          <li key={a._id}>
            <Link href={`/student/assignments/${a._id}`} className="gc-card block p-5 hover:border-gc-gold">
              <p className="font-display text-lg">{a.title}</p>
              <p className="text-xs text-gc-mute">
                Deadline {a.deadline ? new Date(a.deadline).toLocaleString() : '—'} · {a.totalMarks ?? '—'} marks
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? (
        <EmptyState title="No published assignments" body="Assignments from your enrolled courses appear here." />
      ) : null}
    </div>
  );
}

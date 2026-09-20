'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/panel/ResourceManager';

type Row = {
  _id: string;
  user?: { name?: string; email?: string; lastLoginAt?: string };
  course?: { title?: string };
};

export default function TeacherStudentsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-roster'],
    queryFn: () =>
      api<{ items: Row[]; progress: Array<{ user: string; course: string; percent: number; lastStudiedAt?: string }> }>(
        '/api/learning/roster',
      ),
  });

  return (
    <div>
      <PageHeader title="Students" subtitle="Roster across your courses with last activity." />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-4 space-y-3">
        {(data?.items ?? []).map((row) => {
          const userId = (row.user as { _id?: string } | undefined)?._id;
          const prog = data?.progress.find((p) => String(p.user) === String(userId));
          return (
            <li key={row._id} className="gc-card flex flex-wrap justify-between gap-3 p-4">
              <div>
                <p>{row.user?.name}</p>
                <p className="text-xs text-gc-mute">{row.user?.email} · {row.course?.title}</p>
              </div>
              <p className="text-sm text-gc-gold">{Math.round(prog?.percent ?? 0)}% complete</p>
            </li>
          );
        })}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No enrolled students yet" /> : null}
    </div>
  );
}

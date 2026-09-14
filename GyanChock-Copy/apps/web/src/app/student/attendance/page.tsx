'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProgressBar } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';

export default function AttendancePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance-me'],
    queryFn: () =>
      api<{
        percent: number;
        present: number;
        total: number;
        items: Array<{ _id: string; mark: string; createdAt?: string; session?: { title?: string; scheduledAt?: string } }>;
      }>('/api/attendance/me'),
  });
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Attendance</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <div className="mt-6 gc-card p-5">
        <p className="text-sm text-gc-mute">
          {data?.present ?? 0} present / {data?.total ?? 0} sessions
        </p>
        <div className="mt-3">
          <ProgressBar value={data?.percent ?? 0} />
        </div>
        <p className="mt-2 font-display text-2xl">{data?.percent ?? 0}%</p>
      </div>
      <ul className="mt-6 space-y-2">
        {(data?.items ?? []).map((i) => (
          <li key={i._id} className="gc-card flex justify-between p-4 text-sm">
            <span>{i.session?.title ?? 'Session'}</span>
            <span className="capitalize text-gc-gold">{i.mark}</span>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? (
        <EmptyState title="No attendance marked yet" body="Batch teachers mark sessions. Live classes are not used." />
      ) : null}
    </div>
  );
}

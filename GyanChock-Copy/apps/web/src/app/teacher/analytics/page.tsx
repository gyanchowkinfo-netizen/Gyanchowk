'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/format';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { CountUp } from '@/components/motion';

export default function TeacherAnalyticsPage() {
  const earnings = useQuery({
    queryKey: ['tearn'],
    queryFn: () => api<{ summary: Array<{ _id: string; total: number }> }>('/api/payouts/earnings'),
  });
  const doubts = useQuery({
    queryKey: ['tdoubts'],
    queryFn: () => api<{ total?: number; items?: unknown[] }>('/api/doubts'),
  });
  const courses = useQuery({
    queryKey: ['tcourses-all'],
    queryFn: () => api<{ total?: number; items?: unknown[] }>('/api/courses?limit=1'),
  });
  if (earnings.isLoading) return <LoadingState />;
  if (earnings.error) return <ErrorState message={(earnings.error as Error).message} onRetry={() => void earnings.refetch()} />;
  const summary = Object.fromEntries((earnings.data?.summary ?? []).map((s) => [s._id, s.total]));
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Analytics</h1>
      <p className="mt-2 text-sm text-gc-mute">Counts and rupees from live APIs. No placeholder charts.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Courses in catalogue (page total)</p>
          <p className="font-display text-2xl">
            <CountUp value={Number(courses.data?.total ?? courses.data?.items?.length ?? 0)} />
          </p>
        </div>
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Assigned doubts</p>
          <p className="font-display text-2xl">
            <CountUp value={Number(doubts.data?.total ?? doubts.data?.items?.length ?? 0)} />
          </p>
        </div>
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Available</p>
          <p className="font-display text-2xl">{formatPaise(Number(summary.available ?? 0))}</p>
        </div>
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Paid out</p>
          <p className="font-display text-2xl">{formatPaise(Number(summary.paid ?? 0))}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/format';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { CountUp } from '@/components/motion';
import { PageHeader } from '@/components/panel/ResourceManager';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
      <PageHeader title="Analytics" subtitle="Earnings, doubts, and catalogue counts from live APIs." />
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
      <div className="gc-card mt-6 p-4">
        <p className="mb-3 text-sm text-gc-mute">Earnings by status</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={(earnings.data?.summary ?? []).map((s) => ({ status: s._id, rupees: Math.round(s.total / 100) }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3d5c" />
              <XAxis dataKey="status" stroke="#c9a227" />
              <YAxis stroke="#c9a227" />
              <Tooltip />
              <Bar dataKey="rupees" fill="#c9a227" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

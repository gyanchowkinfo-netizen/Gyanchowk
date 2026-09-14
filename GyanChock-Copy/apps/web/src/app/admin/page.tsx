'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/format';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { CountUp } from '@/components/motion';

export default function AdminHome() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dash'],
    queryFn: () =>
      api<{
        students: number;
        teachers: number;
        courses: number;
        batches: number;
        enrollments: number;
        pendingTeachers: number;
        openDoubts: number;
        pendingPayouts: number;
        totalRevenuePaise: number;
        platformRevenuePaise: number;
        teacherRevenuePaise: number;
      }>('/api/admin/dashboard'),
  });
  const keys = [
    ['Students', data?.students, '/admin/students'],
    ['Teachers', data?.teachers, '/admin/teachers'],
    ['Courses', data?.courses, '/admin/courses'],
    ['Batches', data?.batches, '/admin/batches'],
    ['Enrollments', data?.enrollments, '/admin/payments'],
    ['Pending teachers', data?.pendingTeachers, '/admin/teachers'],
    ['Open doubts', data?.openDoubts, '/admin/doubts'],
    ['Pending payouts', data?.pendingPayouts, '/admin/payouts'],
  ] as const;
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Admin dashboard</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {keys.map(([k, v, href]) => (
          <Link key={k} href={href} className="gc-card p-4 hover:border-gc-gold">
            <p className="text-xs uppercase tracking-widest text-gc-mute">{k}</p>
            <p className="mt-2 font-display text-2xl">{v != null ? <CountUp value={Number(v)} /> : '—'}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Gross captured</p>
          <p className="font-display text-2xl">{formatPaise(data?.totalRevenuePaise ?? 0)}</p>
        </div>
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Platform share</p>
          <p className="font-display text-2xl">{formatPaise(data?.platformRevenuePaise ?? 0)}</p>
        </div>
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Teacher share</p>
          <p className="font-display text-2xl">{formatPaise(data?.teacherRevenuePaise ?? 0)}</p>
        </div>
      </div>
    </div>
  );
}

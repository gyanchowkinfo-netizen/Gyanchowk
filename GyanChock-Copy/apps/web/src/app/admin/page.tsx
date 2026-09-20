'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/format';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { CountUp } from '@/components/motion';
import { PageHeader } from '@/components/panel/ResourceManager';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
        revenueSeries?: Array<{ _id: string; total: number }>;
        enrollmentSeries?: Array<{ _id: string; total: number }>;
        topCourses?: Array<{ _id: string; title: string; enrollmentCount?: number }>;
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
  const revenue = (data?.revenueSeries ?? []).map((p) => ({ month: p._id, rupees: Math.round((p.total ?? 0) / 100) }));
  const enroll = (data?.enrollmentSeries ?? []).map((p) => ({ month: p._id, count: p.total }));
  const top = (data?.topCourses ?? []).map((c) => ({ name: c.title, enrollments: c.enrollmentCount ?? 0 }));

  return (
    <div>
      <PageHeader title="Admin dashboard" subtitle="Live counts, revenue trend, and top courses." />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {keys.map(([k, v, href]) => (
          <Link key={k} href={href} className="gc-card p-4 hover:border-gc-blue">
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
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="gc-card p-4">
          <p className="mb-3 text-sm text-gc-mute">Revenue over time</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3d5c" />
                <XAxis dataKey="month" stroke="#c9a227" />
                <YAxis stroke="#c9a227" />
                <Tooltip />
                <Line type="monotone" dataKey="rupees" stroke="#c9a227" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="gc-card p-4">
          <p className="mb-3 text-sm text-gc-mute">Enrollments over time</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enroll}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3d5c" />
                <XAxis dataKey="month" stroke="#c9a227" />
                <YAxis stroke="#c9a227" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4ea1ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="gc-card mt-6 p-4">
        <p className="mb-3 text-sm text-gc-mute">Top courses</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3d5c" />
              <XAxis dataKey="name" stroke="#c9a227" hide={top.length > 4} />
              <YAxis stroke="#c9a227" />
              <Tooltip />
              <Bar dataKey="enrollments" fill="#c9a227" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

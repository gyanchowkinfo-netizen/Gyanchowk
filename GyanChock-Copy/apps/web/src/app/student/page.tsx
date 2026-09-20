'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { ProgressBar, StatusBadge } from '@/components/ui/Badge';
import { getRecentCourses } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { CountUp } from '@/components/motion';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentHome() {
  const user = useAuth((s) => s.user);
  const analytics = useQuery({ queryKey: ['analytics'], queryFn: () => api<Record<string, number>>('/api/learning/analytics') });
  const enrollments = useQuery({
    queryKey: ['enrollments'],
    queryFn: () =>
      api<{
        items: Array<{
          course?: { _id: string; title: string; slug: string };
          batch?: { name: string; slug: string };
        }>;
      }>('/api/learning/enrollments'),
  });
  const notes = useQuery({ queryKey: ['notifs'], queryFn: () => api<{ items: Array<{ _id: string; title: string; readAt?: string }> }>('/api/notifications') });
  const ranks = useQuery({ queryKey: ['ranks-me'], queryFn: () => api<{ items: Array<{ rank: number; scope: string; percentile?: number }> }>('/api/rankings/me') });
  const tests = useQuery({ queryKey: ['tests'], queryFn: () => api<{ items: Array<{ _id: string; title: string; status: string }> }>('/api/tests') });
  const assignments = useQuery({ queryKey: ['assignments'], queryFn: () => api<{ items: Array<{ _id: string; title: string; deadline?: string }> }>('/api/learning/assignments') });
  const recommended = useQuery({
    queryKey: ['recommended'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string; slug: string }> }>('/api/learning/recommended'),
  });
  const [recent, setRecent] = useState<Array<{ slug: string; title: string }>>([]);
  useEffect(() => setRecent(getRecentCourses()), []);

  const cards = [
    ['Courses', analytics.data?.enrollments ?? 0, '/student/courses'],
    ['Videos watched', analytics.data?.videosWatched ?? 0, '/student/learning'],
    ['Completion', analytics.data?.avgCompletion != null ? Math.round(analytics.data.avgCompletion) : 0, '/student/progress'],
    ['Streak', analytics.data?.streak ?? 0, '/student/progress'],
  ] as const;
  const firstCourse = enrollments.data?.items?.find((e) => e.course);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gc-mute">{greeting()}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-gc-black">{user?.name ?? 'Student'}</h1>
      </div>
      {firstCourse ? (
        <Link href={`/student/learning/${firstCourse.course!._id}`} className="gc-card flex flex-wrap items-center justify-between gap-4 p-6 hover:border-gc-blue">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gc-mute">Continue learning</p>
            <p className="mt-1 font-display text-xl font-semibold text-gc-black">{firstCourse.course?.title}</p>
            {firstCourse.batch ? <p className="mt-1 text-sm text-gc-mute">{firstCourse.batch.name}</p> : null}
          </div>
          <span className="gc-btn-primary">Continue</span>
        </Link>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([k, v, href]) => (
          <Link key={k} href={href} className="gc-card block p-5 hover:border-gc-blue">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gc-mute">{k}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-gc-black">
              {k === 'Completion' ? (
                <>
                  <CountUp value={Number(v)} />%
                </>
              ) : (
                <CountUp value={Number(v)} />
              )}
            </p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="gc-card p-6">
          <h2 className="font-display text-lg font-semibold text-gc-black">My courses & batches</h2>
          {enrollments.isLoading ? <LoadingState /> : null}
          <ul className="mt-4 space-y-3 text-sm">
            {(enrollments.data?.items ?? []).map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-gc-line/70 pb-3 last:border-0 last:pb-0">
                {e.course ? (
                  <Link className="font-medium text-gc-blue" href={`/student/learning/${e.course._id}`}>
                    {e.course.title}
                  </Link>
                ) : null}
                {e.batch ? <span className="text-gc-mute">{e.batch.name}</span> : null}
              </li>
            ))}
          </ul>
          {!enrollments.data?.items.length && !enrollments.isLoading ? (
            <EmptyState title="No enrollments yet" body="Browse the catalogue and enroll after payment is verified." action={{ href: '/courses', label: 'Browse courses' }} />
          ) : null}
        </section>
        <section className="gc-card p-6">
          <h2 className="font-display text-lg font-semibold text-gc-black">Upcoming</h2>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-gc-mute">Tests</p>
          <ul className="mt-2 space-y-2 text-sm">
            {(tests.data?.items ?? []).slice(0, 4).map((t) => (
              <li key={t._id} className="flex items-center justify-between gap-2">
                <Link href="/student/tests">{t.title}</Link>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gc-mute">Assignments</p>
          <ul className="mt-2 space-y-2 text-sm">
            {(assignments.data?.items ?? []).slice(0, 4).map((a) => (
              <li key={a._id}>
                <Link href="/student/assignments">{a.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="gc-card p-6">
          <h2 className="font-display text-lg font-semibold text-gc-black">Rank</h2>
          {(ranks.data?.items ?? []).slice(0, 3).map((r, i) => (
            <p key={i} className="mt-2 text-sm">
              {r.scope}: #{r.rank} {r.percentile != null ? `(p${r.percentile})` : ''}
            </p>
          ))}
          {!ranks.data?.items.length ? <p className="mt-2 text-sm text-gc-mute">Ranks appear after you submit a test.</p> : null}
        </section>
        <section className="gc-card p-6">
          <h2 className="font-display text-lg font-semibold text-gc-black">Progress</h2>
          <p className="mt-2 text-sm text-gc-mute">Average completion</p>
          <div className="mt-3">
            <ProgressBar value={Number(analytics.data?.avgCompletion ?? 0)} />
          </div>
          <Link href="/student/backlog" className="mt-4 inline-block text-sm font-semibold text-gc-blue">
            Open backlog planner
          </Link>
        </section>
        <section className="gc-card p-6">
          <h2 className="font-display text-lg font-semibold text-gc-black">Notifications</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(notes.data?.items ?? []).slice(0, 5).map((n) => (
              <li key={n._id} className={n.readAt ? 'text-gc-mute' : 'font-medium text-gc-black'}>
                {n.title}
              </li>
            ))}
          </ul>
          <Link href="/student/notifications" className="mt-3 inline-block text-sm font-semibold text-gc-blue">
            Notification centre
          </Link>
        </section>
      </div>
      {(recommended.data?.items ?? []).length ? (
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-gc-black">Recommended courses</h2>
          <div className="flex flex-wrap gap-2">
            {recommended.data!.items.map((c) => (
              <Link key={c._id} href={`/courses/${c.slug}`} className="rounded-full border border-gc-line px-3 py-1.5 text-sm hover:border-gc-blue">
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {recent.length ? (
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-gc-black">Recently viewed</h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((c) => (
              <Link key={c.slug} href={`/courses/${c.slug}`} className="rounded-full border border-gc-line px-3 py-1.5 text-sm hover:border-gc-blue">
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { getRecentCourses } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { AnimatedProgress, CountUp, Reveal, StaggerContainer, StaggerItem } from '@/components/motion';

export default function StudentHome() {
  const user = useAuth((s) => s.user);
  const analytics = useQuery({ queryKey: ['analytics'], queryFn: () => api<Record<string, number>>('/api/learning/analytics') });
  const enrollments = useQuery({ queryKey: ['enrollments'], queryFn: () => api<{ items: Array<{ course?: { _id: string; title: string; slug: string }; batch?: { name: string; slug: string } }> }>('/api/learning/enrollments') });
  const notes = useQuery({ queryKey: ['notifs'], queryFn: () => api<{ items: Array<{ _id: string; title: string; readAt?: string }> }>('/api/notifications') });
  const ranks = useQuery({ queryKey: ['ranks-me'], queryFn: () => api<{ items: Array<{ rank: number; scope: string; percentile?: number }> }>('/api/rankings/me') });
  const tests = useQuery({ queryKey: ['tests'], queryFn: () => api<{ items: Array<{ _id: string; title: string; status: string }> }>('/api/tests') });
  const assignments = useQuery({ queryKey: ['assignments'], queryFn: () => api<{ items: Array<{ _id: string; title: string; deadline?: string }> }>('/api/learning/assignments') });
  const [recent, setRecent] = useState<Array<{ slug: string; title: string }>>([]);
  useEffect(() => setRecent(getRecentCourses()), []);

  const cards = [
    ['Courses', analytics.data?.enrollments ?? 0, '/student/courses'],
    ['Videos watched', analytics.data?.videosWatched ?? 0, '/student/learning'],
    ['Completion', analytics.data?.avgCompletion != null ? Math.round(analytics.data.avgCompletion) : 0, '/student/progress'],
    ['Streak', analytics.data?.streak ?? 0, '/student/progress'],
  ] as const;

  return (
    <div className="space-y-8">
      <Reveal>
        <p className="text-sm text-gc-mute">Welcome back</p>
        <h1 className="font-display text-3xl text-gc-black">{user?.name ?? 'Student'}</h1>
      </Reveal>
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([k, v, href]) => (
          <StaggerItem key={k}>
            <Link href={href} className="gc-card block p-4 hover:border-gc-gold">
              <p className="text-xs uppercase tracking-widest text-gc-mute">{k}</p>
              <p className="mt-2 font-display text-2xl">
                {k === 'Completion' ? <><CountUp value={Number(v)} />%</> : <CountUp value={Number(v)} />}
              </p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
        <section className="gc-card p-5">
          <h2 className="text-gc-gold">My courses & batches</h2>
          {enrollments.isLoading ? <LoadingState /> : null}
          <ul className="mt-3 space-y-2 text-sm">
            {(enrollments.data?.items ?? []).map((e, i) => (
              <li key={i}>
                {e.course ? <Link href={`/student/learning/${e.course._id}`}>{e.course.title}</Link> : null}
                {e.batch ? <span className="text-gc-mute"> · {e.batch.name}</span> : null}
              </li>
            ))}
          </ul>
          {!enrollments.data?.items.length && !enrollments.isLoading ? (
            <EmptyState title="No enrollments yet" action={{ href: '/courses', label: 'Browse courses' }} />
          ) : null}
        </section>
        </Reveal>
        <Reveal>
        <section className="gc-card p-5">
          <h2 className="text-gc-gold">Upcoming tests</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(tests.data?.items ?? []).slice(0, 5).map((t) => (
              <li key={t._id}>
                <Link href="/student/tests">{t.title}</Link> <span className="text-gc-mute">{t.status}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-gc-gold">Assignments</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {(assignments.data?.items ?? []).slice(0, 4).map((a) => (
              <li key={a._id}>
                <Link href="/student/assignments">{a.title}</Link>
              </li>
            ))}
          </ul>
        </section>
        </Reveal>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="gc-card p-5">
          <h2 className="text-gc-gold">Rank</h2>
          {(ranks.data?.items ?? []).slice(0, 3).map((r, i) => (
            <p key={i} className="mt-2 text-sm">
              {r.scope}: #{r.rank} {r.percentile != null ? `(p${r.percentile})` : ''}
            </p>
          ))}
          {!ranks.data?.items.length ? <p className="mt-2 text-sm text-gc-mute">Ranks appear after you submit a test.</p> : null}
        </section>
        <section className="gc-card p-5">
          <h2 className="text-gc-gold">Progress</h2>
          <p className="mt-2 text-sm text-gc-mute">Average completion</p>
          <div className="mt-2">
            <AnimatedProgress value={Number(analytics.data?.avgCompletion ?? 0)} />
          </div>
          <Link href="/student/backlog" className="mt-4 inline-block text-sm text-gc-glow">
            Open backlog planner
          </Link>
        </section>
        <section className="gc-card p-5">
          <h2 className="text-gc-gold">Notifications</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {(notes.data?.items ?? []).slice(0, 5).map((n) => (
              <li key={n._id}>{n.title}</li>
            ))}
          </ul>
          <Link href="/student/notifications" className="mt-3 inline-block text-sm text-gc-glow">
            Notification centre
          </Link>
        </section>
      </div>
      {recent.length ? (
        <section>
          <h2 className="mb-3 font-display text-xl text-gc-black">Recently viewed</h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((c) => (
              <Link key={c.slug} href={`/courses/${c.slug}`} className="rounded-full border border-gc-line px-3 py-1 text-sm">
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

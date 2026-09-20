'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Gauge, ListChecks, Timer, Trophy } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const CAPABILITIES = [
  { icon: ListChecks, title: 'Mock tests', body: 'Full papers with a server timer and autosave.' },
  { icon: Trophy, title: 'Ranks', body: 'Placement is calculated from submitted attempts — not a demo board.' },
  { icon: Gauge, title: 'Accuracy', body: 'See what you got right after the paper is closed.' },
  { icon: Timer, title: 'Time analysis', body: 'Know which sections consumed the clock.' },
] as const;

export function PerformanceSection() {
  const user = useAuth((s) => s.user);
  return (
    <section className="gc-container py-14 md:py-20" aria-labelledby="performance">
      <SectionHeading
        id="performance"
        kicker="Tests"
        title="Practice. Measure. Improve."
        subtitle="The test engine reports what you actually submitted. No sample ranks are shown as yours."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((c) => {
          const Icon = c.icon;
          return (
            <article key={c.title} className="gc-card p-5">
              <span className="gc-icon-well gc-icon-well-accent">
                <Icon size={18} aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-xl text-gc-black">{c.title}</h3>
              <p className="mt-2 text-sm text-gc-mute">{c.body}</p>
            </article>
          );
        })}
      </div>
      <p className="mt-8">
        <Link href={user ? '/student/tests' : '/login'} className="gc-btn-outline">
          {user ? 'Open your tests' : 'Sign in to view scores'}
        </Link>
      </p>
    </section>
  );
}

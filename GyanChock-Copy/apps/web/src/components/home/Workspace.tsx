'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Eye,
  Play,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ProgressBar } from '@/components/ui/Badge';
import { Reveal } from '@/components/motion';
import { SectionHeading } from './SectionHeading';
import styles from './Workspace.module.css';

const WORKSPACE_TILES = [
  { title: 'Upcoming tests', body: 'Open when ready', Icon: Calendar },
  { title: 'Recent scores', body: 'From submitted papers', Icon: BarChart3 },
  { title: 'Saved lessons', body: 'Your revision list', Icon: Play },
  { title: 'Certificates', body: 'When rules are met', Icon: Award },
] as const;

export function DashboardPreview({
  completion,
}: {
  completion?: number;
}) {
  const user = useAuth((s) => s.user);
  const isReal = Boolean(user && completion != null);
  const pct = isReal ? Math.max(0, Math.min(100, Math.round(completion as number))) : 68;
  const href = user ? '/student' : '/register';

  return (
    <section className={styles.section} aria-labelledby="workspace">
      <div className="gc-container py-14 md:py-20">
        <div className={styles.grid}>
          <Reveal>
            <div className={styles.copy}>
              <p className={styles.kicker}>
                Workspace
                <span className={styles.kickerLine} aria-hidden="true" />
              </p>
              <h2 id="workspace" className={styles.title}>
                Everything in one place.
              </h2>
              <p className={styles.subtitle}>
                Progress, tests, saved lessons and certificates — a student desk, not an admin console.
              </p>
              <Link href={href} className={styles.cta}>
                <UserRound size={16} strokeWidth={1.8} aria-hidden="true" />
                {user ? 'Open your workspace' : 'Create free account'}
                <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className={styles.stack}>
              <span className={`${styles.layer} ${styles.layerA}`} aria-hidden="true" />
              <span className={`${styles.layer} ${styles.layerB}`} aria-hidden="true" />
              <div className={styles.board}>
                <div className={styles.header}>
                  <div>
                    <p className={styles.today}>Today</p>
                    <p className={styles.heading}>Continue learning</p>
                  </div>
                  <span className={styles.preview}>
                    <Eye size={13} strokeWidth={1.8} aria-hidden="true" />
                    Preview
                  </span>
                </div>
                <div className={styles.programme}>
                  <span className={styles.icon} aria-hidden="true">
                    <BookOpen size={16} strokeWidth={1.7} />
                  </span>
                  <div className={styles.programmeBody}>
                    <p className={styles.programmeTitle}>Current programme</p>
                    <p className={styles.programmeMeta}>Recorded lessons · server-tracked progress</p>
                  </div>
                  <ChevronRight className={styles.chevron} size={16} strokeWidth={1.8} aria-hidden="true" />
                  <div className={styles.progressRow}>
                    <div
                      className={styles.progress}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Current programme progress"
                    >
                      <span className={styles.progressFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.progressValue}>{pct}%</span>
                  </div>
                </div>
                <div className={styles.tiles}>
                  {WORKSPACE_TILES.map(({ title, body, Icon }) => (
                    <div key={title} className={styles.tile}>
                      <span className={styles.icon} aria-hidden="true">
                        <Icon size={15} strokeWidth={1.7} />
                      </span>
                      <div>
                        <p className={styles.tileTitle}>{title}</p>
                        <p className={styles.tileBody}>{body}</p>
                      </div>
                      <ChevronRight className={styles.chevron} size={15} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ContinueLearning({
  items,
}: {
  items: Array<{ id: string; title: string; href: string; percent?: number }>;
}) {
  const user = useAuth((s) => s.user);

  if (!user) {
    return (
      <section className="gc-container py-14 md:py-16" aria-labelledby="journey">
        <div className="gc-card flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="gc-kicker mb-2">Account</p>
            <h2 id="journey" className="gc-section-title">
              Your learning journey starts here.
            </h2>
            <p className="mt-2 max-w-md text-sm text-gc-mute">A free student account unlocks the catalogue, tests and a quiet workspace.</p>
          </div>
          <Link href="/register" className="gc-btn-primary w-full sm:w-auto">
            Create free account
          </Link>
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="gc-container py-14 md:py-16" aria-labelledby="continue">
      <SectionHeading id="continue" kicker="Resume" title="Continue learning" href="/student/learning" action="Open learning →" />
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.slice(0, 4).map((c) => (
          <li key={c.id}>
            <Link href={c.href} className="gc-card gc-card-lift flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="truncate font-display text-xl text-gc-black">{c.title}</p>
                {c.percent != null ? (
                  <div className="mt-3 max-w-xs">
                    <p className="mb-1 text-xs text-gc-mute">{c.percent}% complete</p>
                    <ProgressBar value={c.percent} />
                  </div>
                ) : null}
              </div>
              <span className="gc-btn-primary shrink-0">Continue →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

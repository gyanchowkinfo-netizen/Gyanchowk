'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock3, ListChecks } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { SkeletonCard } from '@/components/ui/States';
import { SectionHeading } from './SectionHeading';

export type HomeTest = {
  _id: string;
  title: string;
  durationMin?: number;
  status?: string;
  category?: string;
  negativeMarking?: boolean;
};

function PracticeWorkspaceGate({ href, signedIn }: { href: string; signedIn: boolean }) {
  return (
    <div className="gc-practice-gate">
      <div className="gc-practice-gate-media" aria-hidden="true">
        <Image
          src="/practice-workspace.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 1100px, 100vw"
          className="gc-practice-gate-photo"
        />
        <span className="gc-practice-gate-veil" />
      </div>
      <div className="gc-practice-gate-copy">
        <p className="gc-practice-gate-kicker">Student workspace</p>
        <h2 className="gc-practice-gate-title text-[#fffaf2]">Tests live in your student workspace</h2>
        <span className="gc-practice-gate-rule" aria-hidden="true" />
        <p className="gc-practice-gate-body">
          Sign in to start a timed paper. Ranks are calculated after you submit.
        </p>
        <Link href={href} className="gc-practice-gate-cta">
          {signedIn ? 'Open tests' : 'Sign in to practice'}
        </Link>
      </div>
    </div>
  );
}

export function PracticeSection({ tests, loading }: { tests: HomeTest[]; loading?: boolean }) {
  const user = useAuth((s) => s.user);
  const startHref = user ? '/student/tests' : '/login';

  return (
    <section className="gc-container py-7 md:py-10" aria-labelledby="practice">
      <SectionHeading
        id="practice"
        kicker="Practice"
        title="Practice with purpose."
        subtitle="Mocks, topic sets and ranked papers — started when you are ready."
        align="center"
      />
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : tests.length ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {tests.slice(0, 4).map((t) => (
            <li key={t._id}>
              <Link href="/student/tests" className="gc-card gc-card-lift flex h-full flex-col p-5">
                <p className="text-xs uppercase tracking-wider text-gc-mute">{t.category || t.status || 'Test'}</p>
                <h3 className="mt-2 font-display text-xl text-gc-black">{t.title}</h3>
                <p className="mt-3 flex flex-wrap gap-3 text-xs text-gc-mute">
                  {t.durationMin ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={12} /> {t.durationMin} min
                    </span>
                  ) : null}
                  {t.negativeMarking ? (
                    <span className="inline-flex items-center gap-1">
                      <ListChecks size={12} /> Negative marking
                    </span>
                  ) : null}
                </p>
                <span className="gc-btn-primary mt-5 w-full sm:w-auto">Start test</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <PracticeWorkspaceGate href={startHref} signedIn={Boolean(user)} />
      )}
    </section>
  );
}

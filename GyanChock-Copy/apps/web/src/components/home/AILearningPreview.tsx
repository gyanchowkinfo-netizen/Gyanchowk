'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Reveal } from '@/components/motion';
import { SectionHeading } from './SectionHeading';

const PROMPTS = [
  { label: 'Generate 10 questions', href: '/student/tests' },
  { label: 'Create revision plan', href: '/student/progress' },
  { label: 'Explain differently', href: '/student/doubts' },
] as const;

export function AILearningPreview() {
  const user = useAuth((s) => s.user);
  const cta = user ? '/student/doubts' : '/register';

  return (
    <section id="ai-copilot" className="gc-container py-14 md:py-20" aria-labelledby="copilot">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
        <Reveal>
          <SectionHeading
            id="copilot"
            kicker="Intelligence"
            title="Meet your learning copilot."
            subtitle="Ask questions, simplify difficult concepts, generate practice questions, or turn your mistakes into a focused revision plan."
          />
          <Link href={cta} className="gc-btn-primary mt-2">
            Try AI learning
          </Link>
          <p className="mt-3 max-w-sm text-xs text-gc-mute">
            Preview of the study workspace. Doubts, tests and progress use your existing account — no extra product to install.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="gc-card overflow-hidden p-5 shadow-[var(--shadow-md)] sm:p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gc-mute">Study thread</p>
            <div className="mt-5 space-y-4">
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[color:var(--gyan-primary-soft)] px-4 py-3 text-sm text-gc-black">
                Explain projectile motion simply.
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-gc-line bg-white px-4 py-3 text-sm leading-relaxed text-gc-mist">
                Imagine throwing a ball at an angle. Gravity only pulls downward, so the horizontal speed stays even while the vertical speed changes. The path is a parabola — not a mystery, just two motions at once.
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <Link key={p.label} href={user ? p.href : '/login'} className="gc-chip h-9 px-3 text-xs">
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

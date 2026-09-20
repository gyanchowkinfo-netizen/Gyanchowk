'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import type { HomeSectionCopy } from '@/lib/types';
import { SectionHeading } from './SectionHeading';

function MentorshipWorkspaceGate({ href, signedIn }: { href: string; signedIn: boolean }) {
  return (
    <div className="gc-practice-gate">
      <div className="gc-practice-gate-media" aria-hidden="true">
        <Image
          src="/mentorship-workspace.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 1100px, 100vw"
          className="gc-practice-gate-photo gc-practice-gate-photo--mentor"
        />
        <span className="gc-practice-gate-veil" />
      </div>
      <div className="gc-practice-gate-copy">
        <p className="gc-practice-gate-kicker">Written thread</p>
        <h2 className="gc-practice-gate-title text-[#fffaf2]">Mentors reply in your workspace</h2>
        <span className="gc-practice-gate-rule" aria-hidden="true" />
        <p className="gc-practice-gate-body">
          Ask once. The answer stays with the lesson — no live-class queue.
        </p>
        <Link href={href} className="gc-practice-gate-cta">
          {signedIn ? 'Open doubts' : 'Ask a doubt'}
        </Link>
      </div>
    </div>
  );
}

export function DoubtMentorSection({ copy }: { copy?: HomeSectionCopy }) {
  const user = useAuth((s) => s.user);
  const href = user ? '/student/doubts' : '/login';

  return (
    <section className="gc-container py-14 md:py-20" aria-labelledby="doubts">
      <SectionHeading
        id="doubts"
        kicker={copy?.kicker || 'Mentorship'}
        title={copy?.title || 'Never stay stuck.'}
        subtitle={
          copy
            ? copy.subtitle
            : 'Ask doubts and receive mentor responses in a written thread — built for recorded learning, not a live-class chat.'
        }
        align="center"
      />
      <MentorshipWorkspaceGate href={href} signedIn={Boolean(user)} />
    </section>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import type { HomeSectionCopy } from '@/lib/types';
import { SectionHeading } from './SectionHeading';

function MentorshipWorkspaceGate({ href, signedIn }: { href: string; signedIn: boolean }) {
  return (
    <div
      className="gc-practice-gate w-full mx-0 !rounded-none rounded-none border-x-0"
      style={{ borderRadius: 0 }}
    >
      <div className="gc-practice-gate-media" aria-hidden="true" style={{ borderRadius: 0 }}>
        <Image
          src="/mentorship-workspace.png"
          alt=""
          fill
          sizes="100vw"
          className="gc-practice-gate-photo gc-practice-gate-photo--mentor !rounded-none"
          style={{ borderRadius: 0 }}
        />
        <span className="gc-practice-gate-veil !rounded-none" style={{ borderRadius: 0 }} />
      </div>
      <div className="gc-container relative z-10 w-full py-8 sm:py-12">
        <div className="gc-practice-gate-copy !max-w-2xl px-0 sm:px-4">
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
    </div>
  );
}

export function DoubtMentorSection({ copy }: { copy?: HomeSectionCopy }) {
  const user = useAuth((s) => s.user);
  const href = user ? '/student/doubts' : '/login';

  return (
    <section className="w-full mx-0 px-0 py-7 md:py-10" aria-labelledby="doubts">
      <div className="gc-container mb-6 sm:mb-8">
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
      </div>
      <MentorshipWorkspaceGate href={href} signedIn={Boolean(user)} />
    </section>
  );
}

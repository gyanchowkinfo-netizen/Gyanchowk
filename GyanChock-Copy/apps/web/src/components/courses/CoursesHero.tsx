'use client';

import { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal } from '@/components/motion';

export function CoursesHero({
  total,
  query,
  onQuery,
  onSearch,
}: {
  total?: number;
  query: string;
  onQuery: (v: string) => void;
  onSearch: (e: FormEvent) => void;
}) {
  return (
    <section className="relative border-b border-gc-line/60">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--gyan-text)_4%,transparent),transparent)]"
        aria-hidden
      />
      <PageContainer className="relative py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="gc-kicker mb-4">Catalogue</p>
          </Reveal>
          <Reveal delay={0.04}>
            <h1 className="font-display text-[2.35rem] font-normal leading-[1.08] tracking-tight text-gc-black sm:text-5xl md:text-[3.5rem]">
              Courses built for deep work
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-gc-mist">
              Recorded syllabi, verified enrollment, and tests that rank on the server — browse everything the team has published.
            </p>
          </Reveal>
          {total != null && total > 0 ? (
            <Reveal delay={0.1}>
              <p className="mt-4 text-sm text-gc-mute">{total} programme{total === 1 ? '' : 's'} available</p>
            </Reveal>
          ) : null}
          <Reveal delay={0.12}>
            <form onSubmit={onSearch} className="mx-auto mt-8 flex w-full max-w-lg flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gc-mute" size={17} aria-hidden />
                <input
                  className="gc-input pl-11"
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  placeholder="Search by title, exam or subject"
                  aria-label="Search courses"
                  suppressHydrationWarning
                />
              </label>
              <button className="gc-btn-primary w-full shrink-0 sm:w-auto" type="submit" suppressHydrationWarning>
                Search
              </button>
            </form>
          </Reveal>
        </div>
      </PageContainer>
    </section>
  );
}

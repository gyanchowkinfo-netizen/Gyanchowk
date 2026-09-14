'use client';

import Link from 'next/link';
import { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { FloatingElement, Parallax, Reveal, ScaleIn, SoftBg, TextReveal } from '@/components/motion';
import { BatchesHeroVisual } from '@/components/3d/HeroVisual';
import type { BatchCardData, BatchCatalogStats } from '@/lib/types';

export function BatchesHero({
  stats,
  featured,
  query,
  onQuery,
  onSearch,
}: {
  stats: BatchCatalogStats | undefined;
  featured: BatchCardData[];
  query: string;
  onQuery: (v: string) => void;
  onSearch: (e: FormEvent) => void;
}) {
  const first = featured[0];
  const second = featured[1];
  return (
    <section className="relative overflow-hidden">
      <SoftBg />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,111,255,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
      <PageContainer>
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <Parallax speed={0.08}>
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gc-gold">Structured programmes</p>
            </Reveal>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
              <TextReveal text="Find the right batch." />
              <span className="mt-1 block text-gc-gold">
                <TextReveal text="Build your future." />
              </span>
            </h1>
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-xl text-gc-mist">
                Join structured learning programs designed by expert educators and prepare with a clear recorded learning path —
                no live-class noise.
              </p>
            </Reveal>
            <ScaleIn className="mt-8">
              <form onSubmit={onSearch} className="flex max-w-xl gap-2">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gc-mute" size={16} aria-hidden />
                  <input
                    className="gc-input pl-10 transition-[border-color,box-shadow,transform] duration-300 focus:-translate-y-0.5 focus:shadow-[0_12px_40px_rgba(30,111,255,0.12)]"
                    value={query}
                    onChange={(e) => onQuery(e.target.value)}
                    placeholder="Search batches, exams or courses"
                    aria-label="Search batches"
                  />
                </label>
                <button className="gc-btn-gold shrink-0" type="submit">
                  Search
                </button>
              </form>
            </ScaleIn>
            <Reveal delay={0.12}>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="#all-batches" className="gc-btn-gold">
                  Explore batches <span className="gc-btn-arrow">→</span>
                </Link>
                <Link href="/courses" className="gc-btn-ghost">
                  View courses
                </Link>
              </div>
            </Reveal>
          </Parallax>
          <Parallax speed={0.16} className="relative flex justify-center">
            <ScaleIn>
              <BatchesHeroVisual />
            </ScaleIn>
            <FloatingElement duration={4} className="absolute left-0 top-8 hidden max-w-[180px] md:block">
              <span className="gc-card block px-3 py-2 text-xs">
                {first ? (
                  <>
                    <span className="block font-medium">{first.name}</span>
                    <span className="text-gc-mute">
                      {first.enrolledCount ? `${first.enrolledCount} enrolled` : first.status}
                    </span>
                  </>
                ) : (
                  'Structured learning'
                )}
              </span>
            </FloatingElement>
            <FloatingElement duration={5} className="absolute right-0 top-20 hidden max-w-[170px] md:block">
              <span className="gc-card block px-3 py-2 text-xs">
                {second ? (
                  <>
                    <span className="block font-medium">{second.name}</span>
                    <span className="text-gc-mute">Recorded lessons</span>
                  </>
                ) : (
                  'Recorded classes'
                )}
              </span>
            </FloatingElement>
            <FloatingElement duration={4.5} className="absolute bottom-10 left-6 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">
                {stats?.batches ? `${stats.batches} open programmes` : 'Exam-focused batches'}
              </span>
            </FloatingElement>
          </Parallax>
        </div>
      </PageContainer>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { FloatingElement, MagneticButton, Parallax, Reveal, ScaleIn, SoftBg, TextReveal } from '@/components/motion';
import { BlogHeroVisual } from '@/components/3d/HeroVisual';

export function BlogHero({
  query,
  onQuery,
  onSearch,
}: {
  query: string;
  onQuery: (v: string) => void;
  onSearch: (e: FormEvent) => void;
}) {
  return (
    <section className="relative overflow-hidden">
      <SoftBg />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,208,0,0.08),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
      <PageContainer>
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <Parallax speed={0.08}>
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gc-gold">Knowledge hub</p>
            </Reveal>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
              <TextReveal text="Ideas That Help You Learn Better." />
            </h1>
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-xl text-gc-mist">
                Explore insights, guides, career advice, exam preparation strategies and educational resources from Gyan
                Chowk.
              </p>
            </Reveal>
            <ScaleIn className="mt-8">
              <form onSubmit={onSearch} className="flex max-w-xl gap-2">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gc-mute" size={16} aria-hidden />
                  <input
                    className="gc-input pl-10 shadow-sm transition-[border-color,box-shadow] duration-300 focus:border-gc-gold/60 focus:shadow-[0_12px_40px_rgba(30,111,255,0.12)]"
                    value={query}
                    onChange={(e) => onQuery(e.target.value)}
                    placeholder="Search articles, tags or topics"
                    aria-label="Search articles"
                  />
                </label>
                <button className="gc-btn-gold shrink-0" type="submit">
                  Search
                </button>
              </form>
            </ScaleIn>
            <div className="mt-6 flex flex-wrap gap-3">
              <MagneticButton href="#articles">Explore Articles</MagneticButton>
              <Link href="#topics" className="gc-btn-ghost">
                Browse topics
              </Link>
            </div>
          </Parallax>
          <Parallax speed={0.16} className="relative flex justify-center">
            <ScaleIn>
              <BlogHeroVisual />
            </ScaleIn>
            <FloatingElement duration={5} className="absolute left-0 top-8 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">Open book</span>
            </FloatingElement>
            <FloatingElement duration={4} className="absolute right-2 top-20 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">Guides</span>
            </FloatingElement>
            <FloatingElement duration={6} className="absolute bottom-10 left-8 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">Ideas</span>
            </FloatingElement>
          </Parallax>
        </div>
      </PageContainer>
    </section>
  );
}

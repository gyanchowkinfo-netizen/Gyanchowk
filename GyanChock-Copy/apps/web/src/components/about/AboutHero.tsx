'use client';

import React from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Play,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { FloatingElement, MagneticButton, Parallax, Reveal } from '@/components/motion';
import type { AboutHeroConfig } from '@/lib/types';
import { DEFAULT_ABOUT_PAGE_CONFIG } from '@/lib/types';

function renderHighlightedHeading(heading: string, highlight?: string) {
  if (!highlight || !highlight.trim()) return heading;
  const trimmed = highlight.trim();
  const lowerH = heading.toLowerCase();
  const lowerSub = trimmed.toLowerCase();
  const idx = lowerH.indexOf(lowerSub);
  if (idx === -1) return heading;

  const before = heading.slice(0, idx);
  const match = heading.slice(idx, idx + trimmed.length);
  const after = heading.slice(idx + trimmed.length);

  return (
    <>
      {before}
      <span className="font-serif italic font-normal text-amber-700">
        {match}
      </span>
      {after}
    </>
  );
}

type IconType = React.ComponentType<{ className?: string; size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>;

interface IconDef {
  component: IconType;
  bg: string;
  text: string;
  border: string;
}

const ICON_MAP: Record<string, IconDef> = {
  video:      { component: Video,          bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200/60' },
  award:      { component: Award,          bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-200/60' },
  shield:     { component: ShieldCheck,    bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200/60' },
  sparkles:   { component: Sparkles,       bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200/60' },
  book:       { component: BookOpen,       bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200/60' },
  users:      { component: Users,          bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-200/60' },
  star:       { component: Star,           bg: 'bg-yellow-50',  text: 'text-yellow-600',  border: 'border-yellow-200/60' },
  play:       { component: PlayCircle,     bg: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-200/60' },
  check:      { component: CheckCircle2,   bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200/60' },
  instructor: { component: GraduationCap,  bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200/60' },
};

const DEFAULT_ICON: IconDef = { component: CheckCircle2, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/60' };

function renderStatIcon(label: string): IconDef {
  const l = label.toLowerCase();
  if (l.includes('student') || l.includes('enroll')) return ICON_MAP.users;
  if (l.includes('course') || l.includes('video')) return ICON_MAP.video;
  if (l.includes('teacher') || l.includes('faculty') || l.includes('instructor')) return ICON_MAP.instructor;
  if (l.includes('rating') || l.includes('star')) return ICON_MAP.star;
  if (l.includes('award') || l.includes('batch')) return ICON_MAP.award;
  return ICON_MAP.shield;
}

export function AboutHero({ config }: { config?: AboutHeroConfig }) {
  const hero = config ?? DEFAULT_ABOUT_PAGE_CONFIG.hero;

  const activeStats = (hero.stats || DEFAULT_ABOUT_PAGE_CONFIG.hero.stats).filter(
    (s) => s.active !== false,
  );
  const activeBadges = (hero.badges || DEFAULT_ABOUT_PAGE_CONFIG.hero.badges).filter(
    (b) => b.active !== false,
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf9f4] via-[#f7f5ed] to-[#f4f1e6] border-b border-slate-200/70 pt-8 pb-14 sm:pt-12 sm:pb-18 lg:py-20">
      {/* Decorative ambient backdrop glows matching Teachers Hero */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-10 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl"
        aria-hidden
      />

      <PageContainer className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left Column: Editorial intro & CTAs & Stats */}
          <div className="text-left">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/90 border border-amber-200/70 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-900 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                  {hero.eyebrow || 'ABOUT GYAN CHOWK'}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.04}>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.08] tracking-tight text-slate-900">
                {renderHighlightedHeading(hero.heading, hero.headingHighlight)}
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
                {hero.description}
              </p>
            </Reveal>

            {/* Badges Pill Strip */}
            {activeBadges.length > 0 && (
              <Reveal delay={0.12}>
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  {activeBadges.map((b) => {
                    const iconDef = ICON_MAP[b.icon ?? 'award'] || DEFAULT_ICON;
                    const Icon = iconDef.component;
                    return (
                      <div
                        key={b._key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-white/90 px-3.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                      >
                        <Icon className={`h-3.5 w-3.5 ${iconDef.text}`} />
                        <span>{b.text}</span>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            )}

            {/* Action Buttons */}
            <Reveal delay={0.14}>
              <div className="mt-8 flex w-full flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center">
                <MagneticButton href={(!hero.primaryCtaLink || hero.primaryCtaLink === '#ecosystem') ? '#why' : hero.primaryCtaLink}>
                  {hero.primaryCtaText || 'Explore Gyan Chowk'}
                </MagneticButton>
                <Link
                  href={hero.secondaryCtaLink || '/courses'}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-amber-400 hover:bg-[#FAF8F5] hover:text-amber-900"
                >
                  {hero.secondaryCtaText || 'Explore Courses'}
                </Link>
              </div>
            </Reveal>

            {/* Key Stats Row matching Teachers Hero */}
            {activeStats.length > 0 && (
              <Reveal delay={0.18}>
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/70 sm:gap-6 max-w-xl">
                  {activeStats.map((stat, idx) => {
                    const statIcon = renderStatIcon(stat.label);
                    const StatIcon = statIcon.component;
                    return (
                    <div key={stat._key || idx} className="flex items-center gap-2.5 sm:gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${statIcon.bg} border ${statIcon.border} shadow-xs ${statIcon.text}`}
                      >
                        <StatIcon size={18} />
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-slate-900">
                          {stat.value}
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </Reveal>
            )}
          </div>

          {/* Right Column: Hero Visual with Faculty & Floating Cards matching Teachers Hero */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Parallax speed={0.08}>
              <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
                {/* Organic backdrop glow */}
                <div
                  className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-amber-200/50 via-orange-100/30 to-blue-100/50 blur-xl opacity-70"
                  aria-hidden
                />

                {/* Hero Photo Frame */}
                <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-amber-50/70 via-slate-50 to-slate-100 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.imageUrl || '/about-hero-students.jpg'}
                    alt={hero.imageAlt || 'Gyan Chowk Students'}
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                  />
                  {/* Soft overlay gradient */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
                </div>

                {/* Floating Glassmorphic Cards matching Teachers Hero */}
                <FloatingElement duration={5} className="absolute -top-4 -left-2 sm:-top-5 sm:-left-4 z-20">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md transition hover:scale-105">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <BookOpen size={18} />
                    </div>
                    <div className="pr-1 text-left">
                      <p className="text-xs font-bold text-slate-900">Courses & Batches</p>
                      <p className="text-[10px] text-slate-500">Structured lessons</p>
                    </div>
                  </div>
                </FloatingElement>

                <FloatingElement duration={4} className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-4 z-20">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md transition hover:scale-105">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-sm">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="pr-1 text-left">
                      <p className="text-xs font-bold text-slate-900">100% Verified Tests</p>
                      <p className="text-[10px] text-slate-500">Real rank percentiles</p>
                    </div>
                  </div>
                </FloatingElement>
              </div>
            </Parallax>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

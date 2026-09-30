'use client';

import React, { FormEvent } from 'react';
import Link from 'next/link';
import {
  Search,
  GraduationCap,
  Users,
  Award,
  Star,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Play,
  User,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal } from '@/components/motion';
import type {
  TeachersHeroConfig,
  TeachersHeroStat,
  TeachersHeroFloatingCard,
} from '@/lib/types';
import { DEFAULT_TEACHERS_PAGE_CONFIG } from '@/lib/types';

interface TeachersHeroProps {
  heroConfig?: TeachersHeroConfig;
  query: string;
  onQuery: (v: string) => void;
  onSearch: (e: FormEvent) => void;
}

function renderStatIcon(icon?: string) {
  switch (icon) {
    case 'students':
    case 'teachers':
      return <Users size={18} />;
    case 'rate':
    case 'verified':
      return <ShieldCheck size={18} />;
    case 'award':
      return <Award size={18} />;
    case 'star':
      return <Star size={18} />;
    case 'book':
      return <BookOpen size={18} />;
    case 'instructor':
    case 'faculty':
    default:
      return <GraduationCap size={18} />;
  }
}

function renderStatBg(icon?: string) {
  switch (icon) {
    case 'students':
    case 'teachers':
      return 'bg-orange-100 text-orange-800';
    case 'rate':
    case 'verified':
      return 'bg-amber-100 text-amber-800';
    case 'star':
      return 'bg-yellow-100 text-yellow-800';
    case 'book':
      return 'bg-blue-100 text-blue-800';
    case 'instructor':
    case 'faculty':
    default:
      return 'bg-amber-100 text-amber-800';
  }
}

function renderFloatingIcon(icon?: string) {
  switch (icon) {
    case 'check':
    case 'verified':
      return <CheckCircle2 size={18} />;
    case 'award':
      return <Award size={18} />;
    case 'star':
      return <Star size={18} />;
    case 'faculty':
      return <User size={16} />;
    case 'teachers':
      return <Users size={16} />;
    case 'play':
    default:
      return <Play size={14} className="fill-slate-900 ml-0.5" />;
  }
}

function getFloatingPositionClass(position?: string, index = 0) {
  switch (position) {
    case 'top-left':
      return '-top-4 -left-2 sm:-top-5 sm:-left-4';
    case 'bottom-right':
      return '-bottom-4 -right-2 sm:-bottom-5 sm:-right-4';
    case 'bottom-left':
      return '-bottom-4 -left-2 sm:-bottom-5 sm:-left-4';
    case 'top-right':
    default:
      return index === 0
        ? '-top-4 -right-2 sm:-top-5 sm:-right-4'
        : '-bottom-4 -left-2 sm:-bottom-5 sm:-left-4';
  }
}

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
      <span className="italic font-normal text-slate-800">
        {match}
      </span>
      {after}
    </>
  );
}

export function TeachersHero({
  heroConfig,
  query,
  onQuery,
  onSearch,
}: TeachersHeroProps) {
  const hero: TeachersHeroConfig = {
    ...DEFAULT_TEACHERS_PAGE_CONFIG.hero,
    ...(heroConfig || {}),
  };

  if (hero.active === false) {
    return null;
  }

  // Derive stats (use hero.stats if provided, otherwise default stats)
  const activeStats: TeachersHeroStat[] = (
    hero.stats?.length ? hero.stats : DEFAULT_TEACHERS_PAGE_CONFIG.hero.stats!
  ).filter((s) => s.active !== false);

  // Derive floating cards (use hero.floatingCards if provided, or map from hero.badges)
  const fallbackFloatingCards: TeachersHeroFloatingCard[] = hero.badges?.length
    ? hero.badges.map((b, i) => ({
        _key: b._key,
        title: b.text,
        subtitle: i === 0 ? 'Admin-approved' : 'Verified educator',
        icon: b.icon === 'verified' ? 'check' : b.icon === 'award' ? 'award' : 'play',
        position: i === 0 ? 'top-right' : 'bottom-left',
        active: b.active,
      }))
    : DEFAULT_TEACHERS_PAGE_CONFIG.hero.floatingCards!;

  const activeFloatingCards: TeachersHeroFloatingCard[] = (
    hero.floatingCards?.length ? hero.floatingCards : fallbackFloatingCards
  ).filter((c) => c.active !== false);

  const imageUrl = hero.imageUrl || '/teachers-hero-faculty.png';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf9f4] via-[#f7f5ed] to-[#f4f1e6] border-b border-gc-line/60 pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-16">
      {/* Decorative ambient backdrop glows matching Courses Hero */}
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
          {/* Left Column: Editorial intro & Search & Stats */}
          <div className="text-left">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/90 border border-amber-200/70 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-900 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                  {hero.eyebrow || 'YOUR LEARNING PARTNER'}
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

            {/* Primary Search Bar matching Courses Hero UI */}
            <Reveal delay={0.12}>
              <form
                onSubmit={onSearch}
                className="mt-7 flex w-full max-w-xl items-center rounded-full border border-slate-200/80 bg-white p-1.5 shadow-md shadow-slate-200/50 transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10"
              >
                <div className="flex flex-1 items-center pl-3 sm:pl-4">
                  <Search className="text-slate-400 shrink-0" size={19} aria-hidden />
                  <input
                    suppressHydrationWarning
                    className="w-full border-none bg-transparent px-3 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    value={query}
                    onChange={(e) => onQuery(e.target.value)}
                    placeholder={hero.searchPlaceholder || 'Search by name, headline or subject'}
                    aria-label="Search teachers"
                  />
                </div>
                <button
                  suppressHydrationWarning
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-900 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  type="submit"
                >
                  <span>{hero.searchButtonText || 'Search'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </Reveal>

            {/* Secondary Links Row */}
            <Reveal delay={0.14}>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                {hero.browseAllText && (
                  <Link
                    href={hero.browseAllLink || '#all-teachers'}
                    className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-amber-800 hover:decoration-amber-500"
                  >
                    {hero.browseAllText}
                  </Link>
                )}
                {hero.browseAllText && hero.becomeTeacherText && (
                  <span className="text-slate-300">|</span>
                )}
                {hero.becomeTeacherText && (
                  <Link
                    href={hero.becomeTeacherLink || '/register?role=teacher'}
                    className="font-semibold text-amber-700 transition hover:text-amber-900 flex items-center gap-1"
                  >
                    {hero.becomeTeacherText}
                  </Link>
                )}
              </div>
            </Reveal>

            {/* Key Stats Row matching Courses Hero */}
            {activeStats.length > 0 && (
              <Reveal delay={0.16}>
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/70 sm:gap-6 max-w-xl">
                  {activeStats.map((stat, idx) => (
                    <div key={stat._key || idx} className="flex items-center gap-2.5 sm:gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${renderStatBg(
                          stat.icon,
                        )}`}
                      >
                        {renderStatIcon(stat.icon)}
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
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* Right Column: Hero Visual with Faculty & Floating Cards */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Reveal delay={0.1}>
              <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
                {/* Organic backdrop glow */}
                <div
                  className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-amber-200/50 via-orange-100/30 to-blue-100/50 blur-xl opacity-70"
                  aria-hidden
                />

                {/* Hero Faculty Photo Frame */}
                <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-amber-50/70 via-slate-50 to-slate-100 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={hero.imageAlt || 'Expert Faculty'}
                    className="h-full w-full object-contain object-bottom"
                    loading="eager"
                  />
                  {/* Soft overlay gradient */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-transparent" />
                </div>

                {/* Floating Glassmorphic Cards matching Courses Hero */}
                {activeFloatingCards.map((card, idx) => {
                  const posClass = getFloatingPositionClass(card.position, idx);
                  const isFirst = idx === 0;

                  return (
                    <div
                      key={card._key || idx}
                      className={`absolute ${posClass} flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md transition hover:scale-105`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          card.icon === 'check'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-amber-400 text-slate-900 shadow-sm'
                        }`}
                      >
                        {renderFloatingIcon(card.icon)}
                      </div>
                      <div className="pr-1 text-left">
                        <p className="text-xs font-bold text-slate-900">{card.title}</p>
                        <p className="text-[10px] text-slate-500">{card.subtitle}</p>
                      </div>
                      {isFirst && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <ArrowRight size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

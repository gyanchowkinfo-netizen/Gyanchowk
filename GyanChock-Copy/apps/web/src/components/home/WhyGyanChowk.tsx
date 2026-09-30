'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type LearningStackAccent =
  | 'amber'
  | 'violet'
  | 'green'
  | 'coral'
  | 'orange'
  | 'blue'
  | 'indigo'
  | 'teal'
  | 'pink';

export type LearningStackCardItem = {
  _id?: string;
  title: string;
  description: string;
  accentColor: LearningStackAccent | string;
  displayOrder?: number;
  isActive?: boolean;
};

const DEFAULT_CARDS: LearningStackCardItem[] = [
  {
    title: 'Recorded Video Learning',
    description: 'HLS lessons you can pause, resume and revisit on your own time.',
    accentColor: 'amber',
  },
  {
    title: 'Structured Batches',
    description: 'Cohorts with a syllabus, schedule and faculty guidance.',
    accentColor: 'violet',
  },
  {
    title: 'Study Materials',
    description: 'Notes and PDFs unlocked after verified enrollment.',
    accentColor: 'green',
  },
  {
    title: 'Tests',
    description: 'Timed papers, negative marking and all-India ranks.',
    accentColor: 'coral',
  },
  {
    title: 'Assignments',
    description: 'Published work evaluated rigorously on the server.',
    accentColor: 'orange',
  },
  {
    title: 'Doubt Resolution',
    description: 'Async doubt engine with direct faculty replies.',
    accentColor: 'blue',
  },
  {
    title: 'Mentorship',
    description: 'Guided reviews with faculty on a recorded learning cadence.',
    accentColor: 'indigo',
  },
  {
    title: 'Analytics',
    description: 'Progress from actual watch and attempt data.',
    accentColor: 'teal',
  },
  {
    title: 'Rankings',
    description: 'Leaderboards from submitted tests, not estimates.',
    accentColor: 'pink',
  },
  {
    title: 'Certificates',
    description: 'Issued from completion rules you can verify publicly.',
    accentColor: 'indigo',
  },
  {
    title: 'Career Resources',
    description: 'Roadmaps and articles from the career desk.',
    accentColor: 'teal',
  },
];

export interface AccentTheme {
  bar: string;
  waveStart: string;
  waveEnd: string;
}

export const ACCENT_PALETTE: Record<string, AccentTheme> = {
  amber: {
    bar: '#F59E0B',
    waveStart: '#F59E0B',
    waveEnd: '#FBBF24',
  },
  violet: {
    bar: '#7C3AED',
    waveStart: '#7C3AED',
    waveEnd: '#A78BFA',
  },
  green: {
    bar: '#059669',
    waveStart: '#059669',
    waveEnd: '#34D399',
  },
  coral: {
    bar: '#EF4444',
    waveStart: '#EF4444',
    waveEnd: '#F87171',
  },
  orange: {
    bar: '#F97316',
    waveStart: '#F97316',
    waveEnd: '#FB923C',
  },
  blue: {
    bar: '#0284C7',
    waveStart: '#0284C7',
    waveEnd: '#38BDF8',
  },
  indigo: {
    bar: '#4F46E5',
    waveStart: '#4F46E5',
    waveEnd: '#818CF8',
  },
  teal: {
    bar: '#0D9488',
    waveStart: '#0D9488',
    waveEnd: '#2DD4BF',
  },
  pink: {
    bar: '#DB2777',
    waveStart: '#DB2777',
    waveEnd: '#F472B6',
  },
};

const DEFAULT_THEME: AccentTheme = ACCENT_PALETTE.amber;

function getAccentTheme(accent?: string): AccentTheme {
  if (!accent) return DEFAULT_THEME;
  const key = accent.toLowerCase().trim();
  return ACCENT_PALETTE[key] || DEFAULT_THEME;
}

export function WhyGyanChowk({ cards: initialCards }: { cards?: unknown }) {
  const { data, isLoading } = useQuery({
    queryKey: ['learning-stack-cards-public'],
    queryFn: () => api<{ cards: LearningStackCardItem[] }>('/api/learning-stack/cards'),
    initialData: { cards: DEFAULT_CARDS },
    staleTime: 60_000,
  });

  const cards = data?.cards && data.cards.length > 0 ? data.cards : DEFAULT_CARDS;

  return (
    <section
      id="why"
      aria-labelledby="why-gyan-chowk-heading"
      className="relative overflow-hidden bg-[#FAF7F2] py-14 sm:py-20 border-b border-[#ECE6DE]"
    >
      {/* Subtle depth - minimal and warm */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(247,242,233,0.7),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="gc-container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER - Matching Reference Image */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          {/* Badge with horizontal lines */}
          <div className="inline-flex items-center gap-2.5 mb-3.5">
            <span className="w-5 h-px bg-[#D6CBBB]" aria-hidden="true" />
            <span className="inline-block rounded-full bg-[#FAF0E4] border border-[#E8DCC8] px-3.5 py-0.5 text-[11px] font-bold tracking-[0.18em] uppercase text-[#8C6228]">
              WHY GYAN CHOWK
            </span>
            <span className="w-5 h-px bg-[#D6CBBB]" aria-hidden="true" />
          </div>

          {/* Main Heading: "A complete recorded learning stack" */}
          <h2
            id="why-gyan-chowk-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#0F172A] leading-[1.14]"
          >
            A complete{' '}
            <span className="font-serif italic font-normal text-[#B87B2E]">
              recorded learning stack
            </span>
          </h2>

          {/* Supporting Text */}
          <p className="mt-3.5 text-xs sm:text-[14px] text-slate-500 font-normal leading-relaxed max-w-2xl">
            Everything is built from the ground up for serious learners who value clarity and
            proof of progress.
          </p>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && !data ? (
          <div className="grid grid-cols-12 gap-5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="col-span-12 sm:col-span-6 lg:col-span-3 h-36 rounded-[22px] border border-slate-200/60 bg-white/70 p-6 animate-pulse"
              >
                <div className="h-5 w-3/4 rounded bg-slate-200/80 mb-3" />
                <div className="h-3.5 w-full rounded bg-slate-200/60 mb-2" />
                <div className="h-3.5 w-2/3 rounded bg-slate-200/60" />
              </div>
            ))}
          </div>
        ) : cards.length > 0 ? (
          /* FEATURE CARDS GRID */
          <div className="grid grid-cols-12 gap-5 sm:gap-6">
            {cards.map((item, idx) => {
              const theme = getAccentTheme(item.accentColor);
              const gradId = `wave-grad-${item._id || idx}`;
              const is11Items = cards.length === 11;
              const isBottomRow = is11Items && idx >= 8;

              // Row 1 & 2: 4 cards (span 3 on desktop)
              // Row 3: 3 cards (span 4 on desktop for wider proportions matching reference)
              const colSpanClass = isBottomRow
                ? 'col-span-12 sm:col-span-6 lg:col-span-4'
                : 'col-span-12 sm:col-span-6 lg:col-span-3';

              return (
                <div key={item._id || `${item.title}-${idx}`} className={colSpanClass}>
                  <div
                    tabIndex={0}
                    className="group relative h-full rounded-[22px] border border-slate-200/70 bg-white p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.08)] hover:border-slate-300/80 overflow-hidden flex flex-col justify-between min-h-[148px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                  >
                    {/* Left vertical accent line - rounded left pill */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[4.5px] rounded-l-[22px] transition-all duration-300 group-hover:w-[5.5px]"
                      style={{ backgroundColor: theme.bar }}
                      aria-hidden="true"
                    />

                    {/* Content (Typography & Hierarchy Focused, NO ICONS) */}
                    <div className="relative z-10 pr-2">
                      <h3 className="font-serif text-[1.125rem] sm:text-[1.2rem] font-bold text-[#0F172A] tracking-tight leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-xs sm:text-[13.5px] text-[#475569] font-normal leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Subtle decorative curved wave shape in bottom-right corner matching reference */}
                    <svg
                      className="pointer-events-none absolute -bottom-0.5 -right-0.5 w-32 h-20 transition-transform duration-300 ease-out group-hover:scale-105"
                      viewBox="0 0 140 90"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M140 18 C105 18 70 52 0 90 L140 90 Z"
                        fill={`url(#${gradId})`}
                      />
                      <defs>
                        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={theme.waveStart} stopOpacity="0.04" />
                          <stop offset="100%" stopColor={theme.waveEnd} stopOpacity="0.18" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D5CBBB] bg-white/60 p-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              No learning stack items available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

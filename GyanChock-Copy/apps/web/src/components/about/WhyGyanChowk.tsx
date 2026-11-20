'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AboutWhyConfig } from '@/lib/types';
import { DEFAULT_ABOUT_PAGE_CONFIG } from '@/lib/types';
import {
  ArchedCardsCarousel,
  DEFAULT_STACK_CARDS,
  type LearningStackCardItem,
} from '@/components/home/WhyGyanChowk';

export interface AccentTheme {
  bar: string;
  waveStart: string;
  waveEnd: string;
  glow: string;
}

export const WHY_ACCENT_MAP: Record<string, AccentTheme> = {
  amber: {
    bar: '#F59E0B',
    waveStart: '#F59E0B',
    waveEnd: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.12)',
  },
  violet: {
    bar: '#7C3AED',
    waveStart: '#7C3AED',
    waveEnd: '#A78BFA',
    glow: 'rgba(124, 58, 237, 0.12)',
  },
  green: {
    bar: '#059669',
    waveStart: '#059669',
    waveEnd: '#34D399',
    glow: 'rgba(5, 150, 105, 0.12)',
  },
  coral: {
    bar: '#EF4444',
    waveStart: '#EF4444',
    waveEnd: '#F87171',
    glow: 'rgba(239, 68, 68, 0.12)',
  },
  orange: {
    bar: '#F97316',
    waveStart: '#F97316',
    waveEnd: '#FB923C',
    glow: 'rgba(249, 115, 22, 0.12)',
  },
  blue: {
    bar: '#0284C7',
    waveStart: '#0284C7',
    waveEnd: '#38BDF8',
    glow: 'rgba(2, 132, 199, 0.12)',
  },
  indigo: {
    bar: '#4F46E5',
    waveStart: '#4F46E5',
    waveEnd: '#818CF8',
    glow: 'rgba(79, 70, 229, 0.12)',
  },
  teal: {
    bar: '#0D9488',
    waveStart: '#0D9488',
    waveEnd: '#2DD4BF',
    glow: 'rgba(13, 148, 136, 0.12)',
  },
  pink: {
    bar: '#DB2777',
    waveStart: '#DB2777',
    waveEnd: '#F472B6',
    glow: 'rgba(219, 39, 119, 0.12)',
  },
  rose: {
    bar: '#E11D48',
    waveStart: '#E11D48',
    waveEnd: '#FB7185',
    glow: 'rgba(225, 29, 72, 0.12)',
  },
  cyan: {
    bar: '#0891B2',
    waveStart: '#0891B2',
    waveEnd: '#22D3EE',
    glow: 'rgba(8, 145, 178, 0.12)',
  },
};

const DEFAULT_THEME: AccentTheme = WHY_ACCENT_MAP.amber;

export function getAccentTheme(accent?: string): AccentTheme {
  if (!accent) return DEFAULT_THEME;
  const key = accent.toLowerCase().trim();
  return WHY_ACCENT_MAP[key] || DEFAULT_THEME;
}

export function renderHighlightedHeading(heading: string, highlight?: string) {
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
      <span className="font-serif italic font-normal text-[#B87B2E]">
        {match}
      </span>
      {after}
    </>
  );
}

export function WhyGyanChowk({ config }: { config?: AboutWhyConfig }) {
  const why = config ?? DEFAULT_ABOUT_PAGE_CONFIG.whyGyanChowk;

  const { data } = useQuery({
    queryKey: ['learning-stack-cards-public'],
    queryFn: () => api<{ cards: LearningStackCardItem[] }>('/api/learning-stack/cards'),
    initialData: { cards: DEFAULT_STACK_CARDS },
    staleTime: 60_000,
  });

  const cards = useMemo(() => {
    const raw: LearningStackCardItem[] = data?.cards && data.cards.length > 0 ? data.cards : DEFAULT_STACK_CARDS;
    return raw.map((item: LearningStackCardItem, idx: number) => {
      const fallback = DEFAULT_STACK_CARDS[idx % DEFAULT_STACK_CARDS.length];
      return {
        ...fallback,
        ...item,
        imageUrl: item.imageUrl || fallback.imageUrl,
        badge: item.badge || fallback.badge,
        kicker: item.kicker || fallback.kicker,
        href: item.href || fallback.href,
      };
    });
  }, [data?.cards]);

  const eyebrow = why.eyebrow || 'WHY GYAN CHOWK';
  const heading = why.heading || 'A complete recorded learning stack';
  const headingHighlight = why.headingHighlight || 'recorded learning stack';
  const description =
    why.description ||
    'Everything is built from the ground up for serious learners who value clarity and proof of progress.';

  return (
    <section
      id="why"
      aria-labelledby="why-gyan-chowk-heading"
      className="relative overflow-hidden bg-[#FAF7F2] py-14 sm:py-20 border-b border-[#ECE6DE]"
    >
      {/* Subtle depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(247,242,233,0.7),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="gc-container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER - Matching Reference Image */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3.5">
            <span className="w-5 h-px bg-[#D6CBBB]" aria-hidden="true" />
            <span className="inline-block rounded-full bg-[#FAF0E4] border border-[#E8DCC8] px-3.5 py-0.5 text-[11px] font-bold tracking-[0.18em] uppercase text-[#8C6228]">
              {eyebrow}
            </span>
            <span className="w-5 h-px bg-[#D6CBBB]" aria-hidden="true" />
          </div>

          <h2
            id="why-gyan-chowk-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#0F172A] leading-[1.14]"
          >
            {renderHighlightedHeading(heading, headingHighlight)}
          </h2>

          {description && (
            <p className="mt-3.5 text-xs sm:text-[14px] text-slate-500 font-normal leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* ARCHED RECOMMENDATION CARDS CAROUSEL */}
      <ArchedCardsCarousel items={cards} />
    </section>
  );
}

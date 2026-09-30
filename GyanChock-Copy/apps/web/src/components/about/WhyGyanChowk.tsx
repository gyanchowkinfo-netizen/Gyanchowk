'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/Page';
import { Reveal } from '@/components/motion';
import type { AboutWhyConfig, AboutWhyItem } from '@/lib/types';
import { DEFAULT_ABOUT_PAGE_CONFIG } from '@/lib/types';

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
    queryFn: () =>
      api<{
        cards: Array<{
          _id: string;
          title: string;
          description: string;
          accentColor: string;
          displayOrder: number;
          isActive: boolean;
        }>;
      }>('/api/learning-stack/cards'),
    staleTime: 60_000,
  });

  const rawItems: AboutWhyItem[] =
    data?.cards && data.cards.length > 0
      ? data.cards.map((c) => ({
          _key: c._id,
          title: c.title,
          body: c.description,
          accent: c.accentColor as any,
          order: c.displayOrder,
          active: c.isActive,
        }))
      : why.items || DEFAULT_ABOUT_PAGE_CONFIG.whyGyanChowk.items;

  // Filter active and sort by display order if present
  const items: AboutWhyItem[] = [...rawItems]
    .filter((i) => i.active !== false)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  return (
    <section
      id="why"
      className="relative overflow-hidden bg-[#FAF7F2] py-14 sm:py-20 border-b border-[#ECE6DE]"
    >
      {/* Subtle ambient depth - minimal and warm */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(247,242,233,0.7),transparent_65%)]"
        aria-hidden="true"
      />

      <PageContainer className="relative !py-0">
        {/* SECTION HEADER - strictly matching reference image */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          {/* Badge with horizontal line accents */}
          <Reveal>
            <div className="inline-flex items-center gap-2.5 mb-3.5">
              <span className="w-5 h-px bg-[#C4A05A]/45" aria-hidden="true" />
              <span className="inline-block rounded-full bg-[#FAF0E4] border border-[#E8DCC8] px-3.5 py-0.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#8C6228]">
                {why.eyebrow || 'WHY GYAN CHOWK'}
              </span>
              <span className="w-5 h-px bg-[#C4A05A]/45" aria-hidden="true" />
            </div>
          </Reveal>

          {/* Main Heading: "A complete recorded learning stack" */}
          <Reveal delay={0.04}>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#0F172A] leading-[1.14]">
              {renderHighlightedHeading(
                why.heading || 'A complete recorded learning stack',
                why.headingHighlight || 'recorded learning stack',
              )}
            </h2>
          </Reveal>

          {/* Supporting Text */}
          {why.description && (
            <Reveal delay={0.08}>
              <p className="mt-3.5 text-xs sm:text-[14px] text-slate-500 font-normal leading-relaxed max-w-2xl">
                {why.description}
              </p>
            </Reveal>
          )}
        </div>

        {/* FEATURE CARDS GRID */}
        {items.length > 0 ? (
          <div className="grid grid-cols-12 auto-rows-fr gap-5 sm:gap-6">
            {items.map((item, idx) => {
              const theme = getAccentTheme(item.accent);
              const gradId = `wave-grad-${item._key || idx}`;
              const is11Items = items.length === 11;
              const isBottomRow = is11Items && idx >= 8;
              const colSpanClass = isBottomRow
                ? 'col-span-12 sm:col-span-6 lg:col-span-4'
                : 'col-span-12 sm:col-span-6 lg:col-span-3';

              return (
                <div key={item._key || `${item.title}-${idx}`} className={`${colSpanClass} flex flex-col`}>
                  <Reveal delay={idx * 0.025} className="h-full w-full flex flex-col flex-1">
                    <div
                      tabIndex={0}
                      className="group relative h-full w-full rounded-[22px] border border-slate-200/70 bg-white p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.08)] hover:border-slate-300/80 overflow-hidden flex flex-col justify-between flex-1 min-h-[175px] sm:min-h-[185px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                    >
                      {/* Left vertical accent line - rounded left pill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[4.5px] rounded-l-[22px] transition-all duration-300 group-hover:w-[5.5px]"
                        style={{ backgroundColor: theme.bar }}
                        aria-hidden="true"
                      />

                      {/* Content (Typography & Hierarchy Focused, NO ICONS) */}
                      <div className="relative z-10 pr-2 flex flex-col flex-1">
                        <h3 className="font-serif text-[1.125rem] sm:text-[1.2rem] font-bold text-[#0F172A] tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        <p className="mt-2.5 text-xs sm:text-[13.5px] text-[#475569] font-normal leading-relaxed line-clamp-4 sm:line-clamp-5 flex-1">
                          {item.body}
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
                  </Reveal>
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
      </PageContainer>
    </section>
  );
}

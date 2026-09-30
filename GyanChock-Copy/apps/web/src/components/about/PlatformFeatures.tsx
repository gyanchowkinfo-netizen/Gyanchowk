'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { Reveal } from '@/components/motion';
import type { AboutPlatformConfig } from '@/lib/types';
import { DEFAULT_ABOUT_PAGE_CONFIG } from '@/lib/types';
import { getAccentTheme, renderHighlightedHeading } from './WhyGyanChowk';

const FEATURE_ACCENTS = [
  'amber',
  'blue',
  'green',
  'violet',
  'coral',
  'orange',
  'indigo',
  'teal',
  'pink',
  'rose',
  'cyan',
];

export function PlatformFeatures({ config }: { config?: AboutPlatformConfig }) {
  const platform = config ?? DEFAULT_ABOUT_PAGE_CONFIG.platformFeatures;
  const items = (platform.items || DEFAULT_ABOUT_PAGE_CONFIG.platformFeatures.items).filter(
    (i) => i.active !== false,
  );

  return (
    <section
      id="platform"
      className="relative overflow-hidden bg-[#FAF7F2] py-14 sm:py-20 border-b border-[#ECE6DE]"
    >
      {/* Subtle ambient depth - minimal and warm */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(247,242,233,0.7),transparent_65%)]"
        aria-hidden="true"
      />

      <PageContainer className="relative !py-0">
        {/* SECTION HEADER - matching Why Gyan Chowk reference design */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          {/* Badge with horizontal line accents */}
          <Reveal>
            <div className="inline-flex items-center gap-2.5 mb-3.5">
              <span className="w-5 h-px bg-[#C4A05A]/45" aria-hidden="true" />
              <span className="inline-block rounded-full bg-[#FAF0E4] border border-[#E8DCC8] px-3.5 py-0.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#8C6228]">
                {platform.eyebrow || 'PLATFORM FEATURES'}
              </span>
              <span className="w-5 h-px bg-[#C4A05A]/45" aria-hidden="true" />
            </div>
          </Reveal>

          {/* Main Heading */}
          <Reveal delay={0.04}>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#0F172A] leading-[1.14]">
              {renderHighlightedHeading(platform.heading, platform.headingHighlight)}
            </h2>
          </Reveal>

          {/* Supporting Text */}
          {platform.description && (
            <Reveal delay={0.08}>
              <p className="mt-3.5 text-xs sm:text-[14px] text-slate-500 font-normal leading-relaxed max-w-2xl">
                {platform.description}
              </p>
            </Reveal>
          )}
        </div>

        {/* PLATFORM FEATURES GRID - Matching Why Gyan Chowk Card Grid */}
        <div className="grid grid-cols-12 auto-rows-fr gap-5 sm:gap-6">
          {items.map((item, idx) => {
            const accentKey = FEATURE_ACCENTS[idx % FEATURE_ACCENTS.length];
            const theme = getAccentTheme(accentKey);
            const gradId = `wave-grad-platform-${item._key || idx}`;
            const is11Items = items.length === 11;
            const isBottomRow = is11Items && idx >= 8;
            const colSpanClass = isBottomRow
              ? 'col-span-12 sm:col-span-6 lg:col-span-4'
              : 'col-span-12 sm:col-span-6 lg:col-span-3';

            return (
              <div key={item._key || `${item.title}-${idx}`} className={`${colSpanClass} flex flex-col`}>
                <Reveal delay={idx * 0.025} className="h-full w-full flex flex-col flex-1">
                  <Link
                    href={item.href || '#'}
                    className="group relative h-full w-full rounded-[22px] border border-slate-200/70 bg-white p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.08)] hover:border-slate-300/80 overflow-hidden flex flex-col justify-between flex-1 min-h-[185px] sm:min-h-[195px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 block"
                  >
                    {/* Left vertical accent line - rounded left pill */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[4.5px] rounded-l-[22px] transition-all duration-300 group-hover:w-[5.5px]"
                      style={{ backgroundColor: theme.bar }}
                      aria-hidden="true"
                    />

                    {/* Content (Typography & Hierarchy Focused, NO BULKY ICON BOXES) */}
                    <div className="relative z-10 pr-2 flex flex-col flex-1">
                      {item.badge && item.badge.trim().toLowerCase() !== 'recorded' && (
                        <div className="mb-2.5">
                          <span
                            className="inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: theme.glow, color: theme.bar }}
                          >
                            {item.badge}
                          </span>
                        </div>
                      )}
                      <h3 className="font-serif text-[1.125rem] sm:text-[1.2rem] font-bold text-[#0F172A] tracking-tight leading-snug group-hover:text-[#B87B2E] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-xs sm:text-[13.5px] text-[#475569] font-normal leading-relaxed line-clamp-4 sm:line-clamp-5 flex-1">
                        {item.body}
                      </p>
                    </div>

                    {/* Subtle decorative curved wave shape in bottom-right corner matching Why Gyan Chowk */}
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
                  </Link>
                </Reveal>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

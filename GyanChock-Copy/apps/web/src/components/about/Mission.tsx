'use client';

import React from 'react';
import { BookOpen, CheckCircle2, Clock, Quote, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { FloatingElement, Reveal } from '@/components/motion';
import type { AboutMissionConfig } from '@/lib/types';
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

const ICON_MAP: Record<string, IconType> = {
  book: BookOpen,
  clock: Clock,
  check: CheckCircle2,
  sparkles: Sparkles,
};

export function Mission({
  config,
  title,
  body,
}: {
  config?: AboutMissionConfig;
  title?: string;
  body?: string;
}) {
  const mission = config ?? DEFAULT_ABOUT_PAGE_CONFIG.mission;
  const effectiveHeading = title || mission.heading;
  const effectiveBody = body || mission.body;
  const lines = effectiveBody.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <section id="mission" className="relative overflow-hidden bg-[#faf8f4] py-12 sm:py-16 border-b border-amber-900/5">
      <PageContainer className="!py-0">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left Column: Mission Content */}
          <div className="text-left">
            <Reveal>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/70 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase text-amber-900 mb-2 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                {mission.eyebrow || 'OUR MISSION'}
              </div>
            </Reveal>

            <Reveal delay={0.04}>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-[2.65rem] font-medium leading-[1.1] tracking-tight text-slate-900">
                {renderHighlightedHeading(effectiveHeading, mission.headingHighlight)}
              </h2>
            </Reveal>

            <div className="mt-4 space-y-3 text-xs sm:text-sm font-normal text-slate-600 leading-relaxed max-w-2xl">
              {lines.map((line, i) => (
                <Reveal key={i} delay={0.06 + i * 0.04}>
                  <p>{line}</p>
                </Reveal>
              ))}
            </div>

            {/* Quote Callout matching Teachers card style */}
            {mission.quote && (
              <Reveal delay={0.16}>
                <div className="mt-6 rounded-2xl border border-amber-200/70 bg-white/95 p-5 shadow-sm shadow-slate-900/4">
                  <div className="flex gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700">
                      <Quote className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-serif italic text-slate-900 text-sm sm:text-base leading-relaxed">
                        &ldquo;{mission.quote}&rdquo;
                      </p>
                      {mission.quoteAuthor && (
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                          — {mission.quoteAuthor}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* Right Column: Studio Demo Image + Benefit Badges matching Teachers layout */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Reveal delay={0.1}>
              <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
                {/* Organic backdrop glow */}
                <div
                  className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-amber-200/40 via-orange-100/20 to-blue-100/40 blur-xl opacity-70"
                  aria-hidden
                />

                {/* Photo Frame */}
                <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-amber-50/70 via-slate-50 to-slate-100 shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mission.imageUrl || '/about-mission-studio.jpg'}
                    alt={mission.imageAlt || 'Gyan Chowk Mission Studio'}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-600/90 px-2 py-0.5 rounded-sm">
                      Studio Standard
                    </span>
                    <p className="text-xs font-medium text-slate-100 mt-1">Recorded with crystal-clear audio and zero ambient noise</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

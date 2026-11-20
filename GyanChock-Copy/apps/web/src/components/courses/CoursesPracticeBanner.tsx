'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Edit2, Sparkles, Trophy } from 'lucide-react';
import type { CoursesPracticeBannerConfig } from '@/lib/types';
import { DEFAULT_COURSES_PAGE_CONFIG } from '@/lib/types';

export function CoursesPracticeBanner({
  config,
  onEdit,
}: {
  config?: CoursesPracticeBannerConfig | null;
  onEdit?: () => void;
}) {
  const data = {
    ...DEFAULT_COURSES_PAGE_CONFIG.practiceBanner,
    ...config,
    features: config?.features?.length
      ? config.features
      : DEFAULT_COURSES_PAGE_CONFIG.practiceBanner?.features ?? [],
  };

  if (data.active === false) {
    return null;
  }

  const bgImage = data.imageUrl || '/practice-workspace.png';
  const ctaText = data.ctaText?.trim() || 'Open Practice Tests';
  const ctaLink = data.ctaLink?.trim() || '/student/tests';
  const secondaryCtaText = data.secondaryCtaText?.trim() || 'Explore Test Series';
  const secondaryCtaLink = data.secondaryCtaLink?.trim() || '/student/tests';

  return (
    <section
      className="relative w-full overflow-hidden bg-stone-950 text-white m-0 p-0 rounded-none border-y border-stone-800/80 shadow-2xl"
      aria-label="Practice Workspace"
    >
      {/* Background Image with Depth Gradients */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {bgImage ? (
          <Image
            src={bgImage}
            alt={data.imageAlt || 'Practice Workspace'}
            fill
            sizes="100vw"
            className="object-cover object-center opacity-30 filter contrast-125"
            priority={false}
          />
        ) : null}
        {/* Layered Gradient Veils */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/95 to-stone-950/80" />
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-60" />
        {/* Top & Bottom Accent Lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
      </div>

      {/* Admin Quick Edit Button */}
      {onEdit && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-stone-900/90 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-md backdrop-blur transition hover:bg-amber-400 hover:text-stone-950"
            title="Edit Practice Banner in CMS"
          >
            <Edit2 size={13} />
            <span>Edit Banner (CMS)</span>
          </button>
        </div>
      )}

      {/* Main Banner Content */}
      <div className="gc-container relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            {/* Badge */}
            {data.badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[11px] font-bold tracking-widest text-amber-300 uppercase shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span>{data.badge}</span>
              </div>
            )}

            {/* Title & Highlight */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {data.title}{' '}
              {data.titleHighlight ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
                  {data.titleHighlight}
                </span>
              ) : null}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-stone-300/90 leading-relaxed font-normal max-w-2xl">
              {data.subtitle}
            </p>

            {/* Feature Highlights */}
            {data.features?.length ? (
              <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2.5 text-xs font-medium text-stone-200">
                {data.features
                  .filter((f) => f.active)
                  .map((feat) => (
                    <div key={feat._key} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-amber-400 shrink-0" />
                      <span>{feat.text}</span>
                    </div>
                  ))}
              </div>
            ) : null}
          </div>

          {/* Action Buttons & Rank Callout */}
          <div className="flex flex-col gap-4 shrink-0 sm:items-start lg:items-start pt-2 lg:pt-0">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                href={ctaLink}
                className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-7 py-3 text-sm font-bold text-stone-950 shadow-[0_4px_22px_rgba(245,158,11,0.45)] hover:from-amber-300 hover:to-amber-400 hover:shadow-[0_6px_28px_rgba(245,158,11,0.6)] transition-all duration-200 hover:scale-105 active:scale-95 text-center"
              >
                <span>{ctaText}</span>
                <ArrowRight size={16} className="text-stone-950 stroke-[2.5]" />
              </Link>

              {secondaryCtaText && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-white/90 bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-stone-950 hover:scale-105 active:scale-95 text-center"
                >
                  <span>{secondaryCtaText}</span>
                </Link>
              )}
            </div>

            <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-4 py-2 text-xs font-semibold text-amber-200 shadow-sm backdrop-blur">
              <Trophy size={15} className="text-amber-400 shrink-0" />
              <span>Real-time rank computed instantly upon submission</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

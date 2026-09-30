'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Target,
  BookOpen,
  User,
  BarChart3,
  Compass,
  ShieldCheck,
  Award,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal } from '@/components/motion';
import type { TeachersWhyCard, TeachersWhyConfig } from '@/lib/types';
import { DEFAULT_TEACHERS_PAGE_CONFIG } from '@/lib/types';

interface TeachersWhySectionProps {
  whyConfig?: TeachersWhyConfig;
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
      <span className="font-serif italic font-normal text-amber-700 decoration-amber-300">
        {match}
      </span>
      {after}
    </>
  );
}

function getWhyIcon(iconName: string) {
  switch (iconName) {
    case 'educator':
      return <GraduationCap className="h-5 w-5 text-amber-700" />;
    case 'target':
      return <Target className="h-5 w-5 text-amber-700" />;
    case 'book':
      return <BookOpen className="h-5 w-5 text-amber-700" />;
    case 'doubt':
      return <User className="h-5 w-5 text-amber-700" />;
    case 'chart':
      return <BarChart3 className="h-5 w-5 text-amber-700" />;
    case 'mentor':
      return <Compass className="h-5 w-5 text-amber-700" />;
    case 'shield':
      return <ShieldCheck className="h-5 w-5 text-amber-700" />;
    case 'award':
      return <Award className="h-5 w-5 text-amber-700" />;
    case 'laptop':
      return <Laptop className="h-5 w-5 text-amber-700" />;
    default:
      return <CheckCircle2 className="h-5 w-5 text-amber-700" />;
  }
}

export function TeachersWhySection({ whyConfig }: TeachersWhySectionProps) {
  const config = whyConfig ?? DEFAULT_TEACHERS_PAGE_CONFIG.whyLearn;

  if (config.active === false) {
    return null;
  }

  const activeCards = (config.cards ?? [])
    .filter((c) => c.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section className="relative overflow-hidden bg-[#faf8f4] py-8 sm:py-10 border-b border-amber-900/5">
      <PageContainer className="!py-0">
        {/* Section Header */}
        <div className="max-w-3xl mb-6 sm:mb-8">
          {config.eyebrow && (
            <Reveal>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/70 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase text-amber-900 mb-2 shadow-2xs">
                {config.eyebrow}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.04}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-[2.65rem] font-medium leading-[1.1] tracking-tight text-slate-900">
              {renderHighlightedHeading(config.heading, config.headingHighlight)}
            </h2>
          </Reveal>

          {config.description && (
            <Reveal delay={0.08}>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed max-w-2xl">
                {config.description}
              </p>
            </Reveal>
          )}
        </div>

        {/* Feature Cards: 3 columns on desktop, 2 columns on tablet, 1 column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {activeCards.map((card, idx) => {
            const cardContent = (
              <div className="h-full rounded-2xl border border-amber-200/60 bg-white/95 p-6 shadow-sm shadow-slate-900/4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md hover:shadow-amber-900/5 flex flex-col">
                {/* Icon Container */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/70 mb-4 shadow-2xs">
                  {getWhyIcon(card.icon)}
                </div>

                {/* Card Title */}
                <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1.5">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="text-xs sm:text-sm font-normal text-slate-600 leading-relaxed flex-1">
                  {card.description}
                </p>

                {card.badge && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      {card.badge}
                    </span>
                  </div>
                )}
              </div>
            );

            return (
              <Reveal key={card._key || idx} delay={idx * 0.04}>
                {card.link ? (
                  <Link href={card.link} className="block h-full">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </Reveal>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

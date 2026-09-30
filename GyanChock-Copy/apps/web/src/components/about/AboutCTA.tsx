'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, CheckCircle2, HelpCircle, Sparkles, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { AnimatedSection, Parallax, Reveal } from '@/components/motion';
import type { AboutCTAConfig } from '@/lib/types';
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
      <span className="text-[#c4964a] font-normal font-serif italic">
        {match}
      </span>
      {after}
    </>
  );
}

type IconType = React.ComponentType<{ className?: string; size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>;

interface IconDef {
  component: IconType;
  color: string;
}

const ICON_MAP: Record<string, IconDef> = {
  users:    { component: Users,        color: 'text-blue-400' },
  award:    { component: Award,        color: 'text-[#c4964a]' },
  help:     { component: HelpCircle,   color: 'text-sky-400' },
  check:    { component: CheckCircle2, color: 'text-emerald-400' },
  sparkles: { component: Sparkles,     color: 'text-purple-400' },
};

const DEFAULT_CTA_ICON: IconDef = { component: CheckCircle2, color: 'text-[#c4964a]' };

export function AboutCTA({ config }: { config?: AboutCTAConfig }) {
  const cta = config ?? DEFAULT_ABOUT_PAGE_CONFIG.cta;
  const badges = (cta.badges || DEFAULT_ABOUT_PAGE_CONFIG.cta.badges).filter(
    (b) => b.active !== false,
  );

  return (
    <AnimatedSection>
      <section className="relative overflow-hidden bg-[#11161d] text-white py-12 sm:py-16 border-t border-slate-800/80">
        {/* Optional Ambient Banner Image */}
        {cta.bannerImageUrl && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image
              src={cta.bannerImageUrl}
              alt="CTA Background"
              fill
              className="object-cover opacity-20 mix-blend-luminosity filter blur-[0.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11161d] via-[#11161d]/85 to-[#11161d]/90" />
          </div>
        )}

        {/* Subtle background glow matching BecomeTeacherCTA */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.12),transparent_65%)]" />

        <PageContainer className="!py-0">
          <Parallax speed={0.05}>
            <div className="relative mx-auto max-w-2xl text-center px-4">
              {/* Eyebrow / Kicker styled like BecomeTeacherCTA */}
              {cta.eyebrow && (
                <Reveal>
                  <div className="flex items-center justify-center gap-3 mb-2.5">
                    <span className="block w-6 sm:w-10 h-px bg-[#c4a05a]/45" aria-hidden="true" />
                    <p className="rounded-full bg-[#f4ead8]/15 border border-[#c4a05a]/35 px-3.5 py-0.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c4964a]">
                      {cta.eyebrow}
                    </p>
                    <span className="block w-6 sm:w-10 h-px bg-[#c4a05a]/45" aria-hidden="true" />
                  </div>
                </Reveal>
              )}

              {/* Heading matching BecomeTeacherCTA */}
              <Reveal delay={0.04}>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-medium leading-[1.15] tracking-tight text-white">
                  {renderHighlightedHeading(cta.heading, cta.headingHighlight)}
                </h2>
              </Reveal>

              {/* Description */}
              {cta.description && (
                <Reveal delay={0.08}>
                  <p className="mt-3 text-xs sm:text-sm font-medium text-slate-300 leading-relaxed max-w-xl mx-auto">
                    {cta.description}
                  </p>
                </Reveal>
              )}

              {/* Verified Trust Badges */}
              {badges.length > 0 && (
                <Reveal delay={0.12}>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                    {badges.map((b) => {
                      const iconDef = ICON_MAP[b.icon ?? 'award'] || DEFAULT_CTA_ICON;
                      const Icon = iconDef.component;
                      return (
                        <div
                          key={b._key}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/60 px-3.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-xs"
                        >
                          <Icon className={`h-3.5 w-3.5 ${iconDef.color}`} />
                          <span>{b.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </Reveal>
              )}

              {/* CTA Action Buttons matching BecomeTeacherCTA */}
              <Reveal delay={0.16}>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                  <Link
                    href={cta.primaryButtonLink || '/courses'}
                    className="inline-flex items-center justify-center rounded-xl bg-[#c4964a] hover:bg-[#b0843c] text-slate-950 font-bold px-6 py-3 text-sm transition shadow-lg shadow-amber-900/20 active:scale-95"
                  >
                    {cta.primaryButtonText || 'Explore Courses'}
                  </Link>

                  <Link
                    href={cta.secondaryButtonLink || '/register'}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-white font-medium px-6 py-3 text-sm transition hover:border-slate-500"
                  >
                    {cta.secondaryButtonText || 'Create account'}
                  </Link>
                </div>
              </Reveal>
            </div>
          </Parallax>
        </PageContainer>
      </section>
    </AnimatedSection>
  );
}

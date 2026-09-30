'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { Parallax, Reveal } from '@/components/motion';
import type { TeachersBecomeCTAConfig } from '@/lib/types';
import { DEFAULT_TEACHERS_PAGE_CONFIG } from '@/lib/types';

interface BecomeTeacherCTAProps {
  ctaConfig?: TeachersBecomeCTAConfig;
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
      <span className="text-[#c4964a] font-normal">
        {match}
      </span>
      {after}
    </>
  );
}

export function BecomeTeacherCTA({ ctaConfig }: BecomeTeacherCTAProps) {
  const config = ctaConfig ?? DEFAULT_TEACHERS_PAGE_CONFIG.becomeTeacher;

  if (config.active === false) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#11161d] text-white py-6 sm:py-8 border-t border-slate-800/80">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.12),transparent_65%)]" />

      <PageContainer className="!py-0">
        <Parallax speed={0.05}>
          <div className="relative mx-auto max-w-2xl text-center px-4">
            {/* Eyebrow / Kicker styled like FinalCTA */}
            {config.eyebrow && (
              <Reveal>
                <div className="flex items-center justify-center gap-3 mb-2.5">
                  <span className="block w-6 sm:w-10 h-px bg-[#c4a05a]/45" aria-hidden="true" />
                  <p className="rounded-full bg-[#f4ead8]/15 border border-[#c4a05a]/35 px-3.5 py-0.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c4964a]">
                    {config.eyebrow}
                  </p>
                  <span className="block w-6 sm:w-10 h-px bg-[#c4a05a]/45" aria-hidden="true" />
                </div>
              </Reveal>
            )}

            {/* Heading styled like Your next chapter starts here */}
            <Reveal delay={0.04}>
              <h2 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-normal tracking-[-0.04em] text-[#fffaf2] leading-[1.12]">
                {renderHighlightedHeading(config.heading, config.headingHighlight)}
              </h2>
            </Reveal>

            {/* Description */}
            {config.description && (
              <Reveal delay={0.08}>
                <p className="mt-2.5 text-xs sm:text-sm md:text-base text-slate-300 leading-[1.7] max-w-xl mx-auto">
                  {config.description}
                </p>
              </Reveal>
            )}

            {/* Become a Teacher Button styled like FinalCTA primary action */}
            {config.buttonActive !== false && config.buttonText && (
              <div className="mt-4 sm:mt-5 flex justify-center">
                <Reveal delay={0.12}>
                  <Link
                    href={config.buttonUrl || '/register?role=teacher'}
                    className="inline-flex items-center justify-center rounded-full bg-[#c4964a] hover:bg-[#b5883e] px-7 py-2.5 text-xs sm:text-sm font-semibold tracking-[0.01em] text-[#fffaf2] shadow-[0_12px_28px_rgba(196,150,74,0.32)] transition active:scale-95"
                  >
                    <span>{config.buttonText}</span>
                  </Link>
                </Reveal>
              </div>
            )}
          </div>
        </Parallax>
      </PageContainer>
    </section>
  );
}

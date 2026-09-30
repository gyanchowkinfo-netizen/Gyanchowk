'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, useMotionPrefs } from '@/components/motion';
import type { AboutFutureVisionConfig } from '@/lib/types';
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

export function FutureVision({
  config,
  title,
  body,
}: {
  config?: AboutFutureVisionConfig;
  title?: string;
  body?: string;
}) {
  const future = config ?? DEFAULT_ABOUT_PAGE_CONFIG.futureVision;
  const effectiveHeading = title || future.heading;
  const effectiveBody = body || future.description;

  const { reduce } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.4'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const height = useTransform(line, [0, 1], ['0%', '100%']);

  const steps = (future.steps || DEFAULT_ABOUT_PAGE_CONFIG.futureVision.steps).filter(
    (s) => s.active !== false,
  );

  return (
    <section id="future" className="relative overflow-hidden bg-[#FAF8F5] py-12 sm:py-16 border-b border-amber-900/5">
      <PageContainer className="!py-0">
        <div className="max-w-3xl mb-8 sm:mb-10">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/70 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase text-amber-900 mb-2 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
              {future.eyebrow || "WHERE WE'RE GOING"}
            </div>
          </Reveal>

          <Reveal delay={0.04}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-[2.65rem] font-medium leading-[1.1] tracking-tight text-slate-900">
              {renderHighlightedHeading(effectiveHeading, future.headingHighlight)}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed max-w-2xl">
              {effectiveBody}
            </p>
          </Reveal>
        </div>

        {/* 2-Column Layout matching Teachers Page */}
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Milestones */}
          <div className="lg:col-span-7">
            <div ref={ref} className="relative pl-7 sm:pl-9">
              {/* Background Guide Line */}
              <div className="absolute bottom-4 left-3 sm:left-4 top-4 w-0.5 bg-amber-200/60" aria-hidden />

              {/* Animated Progress Line */}
              <motion.div
                className="absolute left-3 sm:left-4 top-4 w-0.5 origin-top bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700"
                style={{ height: reduce ? '100%' : height }}
                aria-hidden
              />

              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <motion.li
                    key={step._key || step.title}
                    className="relative"
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.05 }}
                  >
                    {/* Node Dot */}
                    <span className="absolute -left-7 sm:-left-9 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-amber-600 bg-white shadow-2xs">
                      <span className="h-2 w-2 rounded-full bg-amber-600" />
                    </span>

                    <article className="group rounded-2xl border border-amber-200/60 bg-white/95 p-4 sm:p-5 shadow-sm shadow-slate-900/4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-base sm:text-lg md:text-xl font-medium tracking-tight text-slate-900 transition-colors group-hover:text-amber-800">
                          {step.title}
                        </h3>
                        {step.tag && (
                          <span className="shrink-0 rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            {step.tag}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm font-normal text-slate-600 leading-relaxed">
                        {step.body}
                      </p>
                    </article>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right Column: Visual Showcase Frame matching TeachersHero */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-amber-50/70 via-slate-50 to-slate-100 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={future.imageUrl || '/practice-workspace.png'}
                  alt="Future Workspace"
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-600/90 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    Future Horizon
                  </div>
                  <p className="mt-2 text-sm sm:text-base font-bold">Personalized AI Diagnostics</p>
                  <p className="text-xs text-slate-300">Targeted practice recommendations based on actual learner data</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 rounded-2xl bg-white/90 p-4 border border-amber-200/60 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-amber-700" />
                  <span>Real-time adaptive backlog planning</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-amber-700" />
                  <span>Cross-curriculum performance percentiles</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-amber-700" />
                  <span>Seamless transition to verified career roadmaps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

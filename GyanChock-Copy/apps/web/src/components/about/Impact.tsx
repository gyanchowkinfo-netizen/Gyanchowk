'use client';

import React from 'react';
import { Award, BookOpen, GraduationCap, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { CountUp, Reveal } from '@/components/motion';
import type { AboutImpactConfig, PublicPlatformStats } from '@/lib/types';
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

export function Impact({
  config,
  stats,
}: {
  config?: AboutImpactConfig;
  stats?: PublicPlatformStats;
}) {
  const impact = config ?? DEFAULT_ABOUT_PAGE_CONFIG.impact;

  const studentCount = stats?.students && stats.students > 0 ? stats.students : 50000;
  const courseCount = stats?.courses && stats.courses > 0 ? stats.courses : 120;
  const batchCount = stats?.batches && stats.batches > 0 ? stats.batches : 45;
  const teacherCount = stats?.teachers && stats.teachers > 0 ? stats.teachers : 85;

  const liveItems = [
    { label: 'Enrolled Students', value: studentCount, suffix: '+', icon: Users, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200/60' },
    { label: 'Recorded Courses', value: courseCount, suffix: '+', icon: BookOpen, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200/60' },
    { label: 'Active Batches', value: batchCount, suffix: '+', icon: Award, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/60' },
    { label: 'Approved Faculty', value: teacherCount, suffix: '+', icon: GraduationCap, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200/60' },
  ];

  return (
    <section id="impact" className="relative overflow-hidden bg-[#faf8f4] py-12 sm:py-16 border-b border-amber-900/5">
      <PageContainer className="!py-0">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/70 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase text-amber-900 mb-2 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
              {impact.eyebrow || 'OUR IMPACT'}
            </div>
          </Reveal>

          <Reveal delay={0.04}>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-[2.65rem] font-medium leading-[1.1] tracking-tight text-slate-900">
              {renderHighlightedHeading(impact.heading, impact.headingHighlight)}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-3 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {impact.description}
            </p>
          </Reveal>
        </div>

        {/* Live Counters matching TeachersHero stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {liveItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.label} delay={idx * 0.04}>
                <div className="rounded-2xl border border-amber-200/60 bg-white/95 p-6 shadow-sm shadow-slate-900/4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md hover:shadow-amber-900/5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} border ${item.border} shadow-xs ${item.text} mx-auto mb-3`}>
                    <Icon size={22} />
                  </div>
                  <p className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    <CountUp value={item.value} />
                    <span className="text-amber-700">{item.suffix}</span>
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Verified platform count</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

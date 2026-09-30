'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  Compass,
  FileText,
  HelpCircle,
  Sparkles,
  Target,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal } from '@/components/motion';
import type { AboutEcosystemConfig } from '@/lib/types';
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

interface IconDef {
  component: IconType;
  bg: string;
  text: string;
  border: string;
}

const ICON_MAP: Record<string, IconDef> = {
  book:      { component: BookOpen,      bg: 'bg-amber-50',    text: 'text-amber-600',    border: 'border-amber-200/60' },
  users:     { component: Users,         bg: 'bg-blue-50',     text: 'text-blue-600',     border: 'border-blue-200/60' },
  user:      { component: User,          bg: 'bg-violet-50',   text: 'text-violet-600',   border: 'border-violet-200/60' },
  file:      { component: FileText,      bg: 'bg-emerald-50',  text: 'text-emerald-600',  border: 'border-emerald-200/60' },
  clipboard: { component: ClipboardList,  bg: 'bg-rose-50',     text: 'text-rose-600',     border: 'border-rose-200/60' },
  target:    { component: Target,        bg: 'bg-indigo-50',   text: 'text-indigo-600',   border: 'border-indigo-200/60' },
  help:      { component: HelpCircle,    bg: 'bg-sky-50',      text: 'text-sky-600',      border: 'border-sky-200/60' },
  barChart:  { component: BarChart3,     bg: 'bg-purple-50',   text: 'text-purple-600',   border: 'border-purple-200/60' },
  compass:   { component: Compass,       bg: 'bg-teal-50',     text: 'text-teal-600',     border: 'border-teal-200/60' },
  userCheck: { component: UserCheck,     bg: 'bg-cyan-50',     text: 'text-cyan-600',     border: 'border-cyan-200/60' },
};

const DEFAULT_ICON: IconDef = { component: BookOpen, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/60' };

export function LearningEcosystem({ config }: { config?: AboutEcosystemConfig }) {
  const eco = config ?? DEFAULT_ABOUT_PAGE_CONFIG.learningEcosystem;
  const nodes = (eco.nodes || DEFAULT_ABOUT_PAGE_CONFIG.learningEcosystem.nodes).filter(
    (n) => n.active !== false,
  );

  return (
    <section id="ecosystem" className="relative overflow-hidden bg-[#FAF8F5] py-12 sm:py-16 border-b border-amber-900/5">
      <PageContainer className="!py-0">
        <div className="text-center max-w-3xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/70 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase text-amber-900 mb-2 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
              {eco.eyebrow || 'LEARNING ECOSYSTEM'}
            </div>
          </Reveal>

          <Reveal delay={0.04}>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-[2.65rem] font-medium leading-[1.1] tracking-tight text-slate-900">
              {renderHighlightedHeading(eco.heading, eco.headingHighlight)}
            </h2>
          </Reveal>

          {eco.description && (
            <Reveal delay={0.08}>
              <p className="mt-3 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {eco.description}
              </p>
            </Reveal>
          )}
        </div>

        {/* Connected Ecosystem Nodes with premium distinct-colored icons */}
        <div className="mt-10 sm:mt-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {nodes.map((node, idx) => {
              const iconDef = ICON_MAP[node.icon ?? 'book'] || DEFAULT_ICON;
              const Icon = iconDef.component;
              return (
                <Reveal key={node._key || node.name} delay={idx * 0.03}>
                  <Link
                    href={node.href}
                    className="group flex flex-col justify-between rounded-2xl bg-white/95 p-4 border border-amber-200/60 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md hover:shadow-amber-900/5 h-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconDef.bg} border ${iconDef.border} shadow-xs ${iconDef.text} transition-transform duration-200 group-hover:scale-105`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-700" />
                    </div>

                    <div className="mt-4">
                      <p className="font-display text-sm font-bold text-slate-900 transition-colors group-hover:text-amber-800">
                        {node.name}
                      </p>
                      {node.badge && (
                        <span className="mt-1.5 inline-block text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          {node.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

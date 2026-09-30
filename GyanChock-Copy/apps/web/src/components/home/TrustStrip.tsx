'use client';

import type { LucideIcon } from 'lucide-react';
import { BookMarked, ClipboardList, MessageSquareText, UsersRound } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { cn } from '@/lib/format';

export type HomeHighlight = {
  value: string;
  title: string;
  description: string;
};

type HighlightTone = 'courses' | 'practice' | 'support' | 'educators';

function highlightMeta(title: string): { Icon: LucideIcon; tone: HighlightTone } {
  const t = title.toLowerCase();
  if (t.includes('course') || t.includes('batch') || t.includes('path')) {
    return { Icon: BookMarked, tone: 'courses' };
  }
  if (t.includes('test') || t.includes('paper') || t.includes('note') || t.includes('practice')) {
    return { Icon: ClipboardList, tone: 'practice' };
  }
  if (t.includes('doubt') || t.includes('mentor') || t.includes('support')) {
    return { Icon: MessageSquareText, tone: 'support' };
  }
  if (t.includes('educator') || t.includes('teacher') || t.includes('faculty')) {
    return { Icon: UsersRound, tone: 'educators' };
  }
  return { Icon: BookMarked, tone: 'courses' };
}

export function TrustStrip({ highlights }: { highlights?: HomeHighlight[] }) {
  const items = (highlights ?? []).slice(0, 12);
  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden" aria-label="Platform highlights">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-blue)]/18 to-transparent" />
      </div>
      <div className="gc-container relative py-2.5 md:py-3.5">
        <div className="overflow-hidden rounded-2xl border border-gc-line bg-[color:var(--gyan-surface)] shadow-[var(--shadow-sm)]">
          <div
            className={cn(
              'grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]',
              items.length === 2 ? 'grid-cols-2' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-4',
            )}
          >
            {items.map((item, index) => {
              const { Icon, tone } = highlightMeta(item.title);
              return (
                <Reveal key={`${item.value}-${item.title}`} delay={index * 0.05} className="h-full">
                  <article
                    className={cn(
                      'group relative flex h-full min-w-0 flex-col items-center justify-center border-gc-line/80 px-1.5 py-3 text-center sm:px-6 sm:py-5',
                      'border-l first:border-l-0',
                      'sm:border-t-0 sm:border-l-0 sm:even:border-l sm:[&:nth-child(n+3)]:border-t',
                      'lg:border-t-0 lg:even:border-l-0 lg:[&:not(:first-child)]:border-l',
                    )}
                  >
                    <span className="gc-highlight-icon !h-8 !w-8 rounded-xl sm:!h-10 sm:!w-10" data-tone={tone}>
                      <Icon size={16} strokeWidth={2} className="sm:hidden" aria-hidden />
                      <Icon size={20} strokeWidth={2} className="hidden sm:block" aria-hidden />
                    </span>
                    <p className="mt-1.5 w-full truncate text-center text-xs font-bold leading-tight tracking-tight text-gc-black sm:mt-3 sm:text-[clamp(1.35rem,2vw,1.75rem)]">
                      {item.value}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-center text-[10.5px] font-semibold leading-tight tracking-tight text-gc-black sm:mt-2 sm:line-clamp-none sm:text-sm">
                      {item.title}
                    </p>
                    <p className="mt-1 hidden text-center text-[13px] leading-snug text-gc-mute sm:block">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/format';
import { FacultyPortraitCard, type FacultyPortraitItem } from '@/components/public/FacultyPortraitCard';

export type FacultyCarouselItem = FacultyPortraitItem;

const INTERVAL = 2000;
const SLIDE_MS = 720;

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function FacultyCarousel({ items }: { items: FacultyCarouselItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [compact, setCompact] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = items.length;
  const looping = count > 1;

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = window.matchMedia('(max-width: 639px)');
    const sync = () => {
      setReduce(motion.matches);
      setCompact(narrow.matches);
    };
    sync();
    motion.addEventListener('change', sync);
    narrow.addEventListener('change', sync);
    return () => {
      motion.removeEventListener('change', sync);
      narrow.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [count]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!looping) return;
      setIndex((current) => wrapIndex(current + dir, count));
    },
    [count, looping],
  );

  useEffect(() => {
    if (paused || reduce || !looping) return;
    const id = window.setInterval(() => go(1), INTERVAL);
    return () => window.clearInterval(id);
  }, [go, looping, paused, reduce]);

  const slides = useMemo(() => {
    if (!count) return [];
    return items.map((item, i) => {
      let offset = i - index;
      if (looping) {
        if (offset > count / 2) offset -= count;
        if (offset < -count / 2) offset += count;
      }
      return { item, offset, i };
    });
  }, [count, index, items, looping]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  }

  return (
    <div
      className="gc-faculty-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Faculty educators"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onTouchStart={(e) => {
        const t = e.changedTouches[0];
        touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touch.current.x;
        const dy = t.clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="gc-faculty-stage relative">
        {slides.map(({ item, offset, i }) => {
          const abs = Math.abs(offset);
          const hidden = abs > 2;
          const x = offset * (compact ? 118 : 188);
          const rotate = offset * -18;
          const scale = abs === 0 ? 1 : abs === 1 ? 0.84 : 0.7;
          const z = 40 - abs * 12;
          return (
            <div
              key={`${item.id}-${i}`}
              className={cn('gc-faculty-slide', hidden && 'is-hidden', abs === 0 && 'is-center')}
              style={{
                transform: `translateX(${x}px) rotateY(${rotate}deg) scale(${scale})`,
                zIndex: z,
                opacity: hidden ? 0 : abs === 0 ? 1 : abs === 1 ? 0.78 : 0.42,
                transitionDuration: reduce ? '0ms' : `${SLIDE_MS}ms`,
                pointerEvents: abs === 0 ? 'auto' : 'none',
              }}
              aria-hidden={abs !== 0}
            >
              <FacultyPortraitCard item={item} active={abs === 0} />
            </div>
          );
        })}
        {looping ? (
          <>
            <button
              type="button"
              className="absolute left-2 sm:left-4 md:left-6 top-1/2 z-50 grid h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[color:var(--brand-navy)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white hover:scale-105 active:scale-95 transition-all border border-slate-200/80 cursor-pointer"
              aria-label="Previous teachers"
              onClick={() => go(-1)}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
            <button
              type="button"
              className="absolute right-2 sm:right-4 md:right-6 top-1/2 z-50 grid h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[color:var(--brand-navy)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white hover:scale-105 active:scale-95 transition-all border border-slate-200/80 cursor-pointer"
              aria-label="Next teachers"
              onClick={() => go(1)}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function FacultyCarouselSkeleton() {
  return (
    <div className="gc-faculty-carousel" aria-label="Faculty loading">
      <div className="gc-faculty-stage">
        <div className="gc-faculty-card animate-pulse bg-[color:var(--gyan-primary-soft)]" />
      </div>
    </div>
  );
}

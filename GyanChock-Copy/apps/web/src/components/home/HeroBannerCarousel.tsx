'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/format';
import type { PublicBanner } from './BannerCarousel';

const INTERVAL = 3000;
const SLIDE_MS = 600;

const TAG_LABEL: Record<string, string> = {
  promo: 'Promotion',
  course: 'Course',
  exam: 'Exam',
  announcement: 'Announcement',
  general: 'Learning',
};

export function HeroBannerCarousel() {
  const query = useQuery({
    queryKey: ['banners-active', 'hero'],
    queryFn: () => api<{ items: PublicBanner[] }>('/api/banners/active?placement=hero'),
    staleTime: 60_000,
  });
  const items = query.data?.items ?? [];

  if (query.isLoading) {
    return (
      <div
        className="gc-hero-banner animate-pulse bg-[color:var(--gyan-primary-soft)]"
        aria-label="Promotional banners loading"
      />
    );
  }

  if (query.isError || !items.length) {
    return <HeroBannerFallback />;
  }

  return <HeroCarouselCore items={items} />;
}

function HeroBannerFallback() {
  return (
    <div className="gc-hero-banner" aria-label="Gyan Chowk">
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--brand-navy)]/55 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">Gyan Chowk</p>
        <p className="mt-2 font-display text-2xl leading-tight text-white sm:text-3xl">Learn with purpose</p>
        <p className="mt-2 max-w-sm text-sm text-white/80">Structured courses, focused practice, and measurable progress.</p>
      </div>
    </div>
  );
}

function HeroCarouselCore({ items }: { items: PublicBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const width = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      setReduce(mq.matches);
      setIsMobile(width.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    width.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      width.removeEventListener('change', sync);
    };
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (paused || reduce || items.length < 2) return;
    const id = window.setInterval(() => go(1), INTERVAL);
    return () => window.clearInterval(id);
  }, [go, items.length, paused, reduce]);

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
      className="gc-hero-banner"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
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
      <div className="absolute inset-0">
        {items.map((banner, i) => {
          const src = isMobile ? banner.mobileImageUrl || banner.imageUrl : banner.imageUrl || banner.mobileImageUrl;
          const offset = i - index;
          const nearby =
            Math.abs(offset) <= 1 || (index === 0 && i === items.length - 1) || (index === items.length - 1 && i === 0);
          const tag = TAG_LABEL[banner.bannerType || 'promo'] || 'Promotion';
          const titleId = `hero-banner-title-${banner.id}`;
          return (
            <article
              key={banner.id}
              className={cn('absolute inset-0 flex motion-reduce:transition-none', i === index ? 'z-10' : 'z-0')}
              style={{
                transform: `translateX(${offset * 100}%)`,
                transitionProperty: 'transform',
                transitionDuration: reduce ? '0ms' : `${SLIDE_MS}ms`,
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              aria-hidden={i !== index}
              aria-labelledby={i === index ? titleId : undefined}
            >
              {src && nearby ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={i === index ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" aria-hidden />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--brand-navy)]/80 via-[color:var(--brand-navy)]/40 to-transparent" />
              <div className="relative z-10 flex h-full max-w-md flex-col justify-end p-5 sm:p-7">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">{tag}</p>
                <p id={titleId} className="mt-2 font-display text-2xl leading-tight text-white sm:text-3xl">
                  {banner.title}
                </p>
                {banner.subtitle ? (
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">{banner.subtitle}</p>
                ) : null}
                {banner.ctaUrl ? (
                  <Link
                    href={banner.ctaUrl}
                    className="gc-btn mt-4 w-fit bg-white text-[color:var(--brand-navy)] hover:bg-white/90"
                  >
                    {banner.ctaText || 'Learn more'}
                    <span className="gc-btn-arrow" aria-hidden>
                      →
                    </span>
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      {items.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--brand-navy)] shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label="Previous banner"
            onClick={() => go(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--brand-navy)] shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label="Next banner"
            onClick={() => go(1)}
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2" role="tablist" aria-label="Banner slides">
            {items.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show banner ${i + 1}: ${b.title}`}
                className={cn(
                  'h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                  i === index ? 'w-7 bg-white' : 'w-2.5 bg-white/50',
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/format';
import { ErrorState } from '@/components/ui/States';

export type PublicBanner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  placement?: string;
  bannerType?: string;
};

const INTERVAL = 3000;

export function BannerCarousel() {
  const query = useQuery({
    queryKey: ['banners-active'],
    queryFn: () => api<{ items: PublicBanner[] }>('/api/banners/active'),
    staleTime: 60_000,
  });
  const items = query.data?.items ?? [];

  if (query.isLoading) {
    return (
      <section className="w-full mx-0 px-0 pb-2 pt-2 sm:pb-4 sm:pt-5" aria-label="Promotions loading">
        <div className="w-full aspect-[1024/261] animate-pulse border-y border-gc-line bg-[color:var(--gyan-primary-soft)]" />
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="gc-container py-6">
        <ErrorState message="Unable to load banners." onRetry={() => void query.refetch()} />
      </section>
    );
  }

  if (!items.length) return null;

  return <Carousel items={items} />;
}

function Carousel({ items }: { items: PublicBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const region = useRef<HTMLDivElement>(null);

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
    <section className="w-full mx-0 px-0 pb-2 pt-2 sm:pb-5 sm:pt-5" aria-roledescription="carousel" aria-label="Gyan Chowk promotions">
      <div
        ref={region}
        className="relative w-full overflow-hidden border-y border-x-0 border-gc-line bg-[color:var(--brand-navy)] shadow-[var(--shadow-md)]"
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
        <div className="relative w-full aspect-[1024/261]">
          {items.map((banner, i) => {
            const src = banner.imageUrl || banner.mobileImageUrl;
            const offset = i - index;
            const nearby = Math.abs(offset) <= 1 || (index === 0 && i === items.length - 1) || (index === items.length - 1 && i === 0);
            return (
              <article
                key={banner.id}
                className={cn(
                  'absolute inset-0 flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                  i === index ? 'z-10' : 'z-0',
                )}
                style={{ transform: `translateX(${offset * 100}%)` }}
                aria-hidden={i !== index}
              >
                {src && nearby ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={i === index ? 'eager' : 'lazy'}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--brand-navy)]/80 via-[color:var(--brand-navy)]/35 to-transparent" />
                <div className="gc-container relative z-10 flex h-full flex-col justify-end pb-2 sm:pb-5 lg:pb-7">
                  <Link
                    href={banner.ctaUrl || '/courses'}
                    className="gc-btn w-fit bg-white text-[color:var(--brand-navy)] hover:bg-white/90 shadow-md !min-h-0 !h-auto !py-1 !px-2.5 sm:!py-2 sm:!px-4 lg:!px-6 !text-[9px] min-[380px]:!text-[10px] sm:!text-xs md:!text-sm rounded-full sm:rounded-xl"
                  >
                    {banner.ctaText || 'Learn more'}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        {items.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-1.5 sm:left-4 md:left-6 top-1/2 z-20 grid h-6 w-6 sm:h-9 sm:w-9 md:h-11 md:w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--brand-navy)] shadow-sm hover:bg-white transition-transform active:scale-95"
              aria-label="Previous banner"
              onClick={() => go(-1)}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </button>
            <button
              type="button"
              className="absolute right-1.5 sm:right-4 md:right-6 top-1/2 z-20 grid h-6 w-6 sm:h-9 sm:w-9 md:h-11 md:w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--brand-navy)] shadow-sm hover:bg-white transition-transform active:scale-95"
              aria-label="Next banner"
              onClick={() => go(1)}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </button>
            <div className="absolute bottom-1 sm:bottom-3 left-0 right-0 z-20 flex justify-center gap-1 sm:gap-2" role="tablist" aria-label="Banner slides">
              {items.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show banner ${i + 1}`}
                  className={cn('h-1 sm:h-2.5 rounded-full transition-all', i === index ? 'w-3.5 sm:w-7 bg-white' : 'w-1 sm:w-2.5 bg-white/50')}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export type LearningStackAccent =
  | 'amber'
  | 'violet'
  | 'green'
  | 'coral'
  | 'orange'
  | 'blue'
  | 'indigo'
  | 'teal'
  | 'pink';

export type LearningStackCardItem = {
  _id?: string;
  title: string;
  description: string;
  accentColor: LearningStackAccent | string;
  displayOrder?: number;
  isActive?: boolean;
  kicker?: string;
  badge?: string;
  imageUrl?: string;
  href?: string;
};

export const DEFAULT_STACK_CARDS: LearningStackCardItem[] = [
  {
    _id: 'card-video',
    kicker: '01 / Video Lectures',
    badge: 'HLS Playback',
    title: 'Recorded Video Learning',
    description: 'Studio-quality lessons with persistent resume, 2x speed adjustment, and offline notes.',
    accentColor: '#F59E0B',
    imageUrl: '/overlays/overlay-recorded.png',
    href: '/courses',
  },
  {
    _id: 'card-batches',
    kicker: '02 / Cohorts',
    badge: 'Syllabus Schedule',
    title: 'Structured Batches',
    description: 'Organized term cohorts with clear timelines, topic pacing, and faculty guidance.',
    accentColor: '#7C3AED',
    imageUrl: '/about-hero-students.jpg',
    href: '/batches',
  },
  {
    _id: 'card-materials',
    kicker: '03 / Resources',
    badge: 'Formula Sheets & PDFs',
    title: 'Study Materials',
    description: 'Downloadable chapter summary notes and verified formula sheets unlocked upon enrollment.',
    accentColor: '#059669',
    imageUrl: '/overlays/overlay-notes.png',
    href: '/student',
  },
  {
    _id: 'card-tests',
    kicker: '04 / Assessments',
    badge: 'Autosave & Timed',
    title: 'Timed Mocks & Tests',
    description: 'Real-time autosaving exam portal, countdown timer alerts, and detailed scorecards.',
    accentColor: '#EF4444',
    imageUrl: '/practice-workspace.png',
    href: '/student',
  },
  {
    _id: 'card-assignments',
    kicker: '05 / Practice',
    badge: 'Evaluated Work',
    title: 'Assignments & Drills',
    description: 'Server-evaluated practice question sets to solidify concepts after every lecture.',
    accentColor: '#F97316',
    imageUrl: '/overlays/overlay-library.png',
    href: '/student',
  },
  {
    _id: 'card-doubts',
    kicker: '06 / Support',
    badge: 'Timestamp Doubts',
    title: 'Async Doubt Desk',
    description: 'Tag exact video timestamps or upload photos; verified mentors post written answers.',
    accentColor: '#0284C7',
    imageUrl: '/mentorship-workspace.png',
    href: '/student/doubts',
  },
  {
    _id: 'card-mentorship',
    kicker: '07 / Guidance',
    badge: 'Faculty Reviews',
    title: 'Guided Mentorship',
    description: 'Structured progress evaluations and academic advice tailored for self-paced students.',
    accentColor: '#4F46E5',
    imageUrl: '/career-life-3.jpg',
    href: '/student',
  },
  {
    _id: 'card-analytics',
    kicker: '08 / Metrics',
    badge: 'Watch & Quiz Data',
    title: 'Deep Learning Analytics',
    description: 'Honest progress metrics generated from actual watch sessions and test accuracies.',
    accentColor: '#0D9488',
    imageUrl: '/overlays/overlay-progress.png',
    href: '/student',
  },
  {
    _id: 'card-rankings',
    kicker: '09 / Competition',
    badge: 'All-India Ranks',
    title: 'Ranked Leaderboards',
    description: 'Accurate comparative rankings calculated directly from completed mock test papers.',
    accentColor: '#DB2777',
    imageUrl: '/career-life-4.jpg',
    href: '/student',
  },
  {
    _id: 'card-certificates',
    kicker: '10 / Credentials',
    badge: 'Tamper-Proof ID',
    title: 'Verifiable Certificates',
    description: 'Issued at 90% completion with a unique ID shareable on LinkedIn and portfolios.',
    accentColor: '#6366F1',
    imageUrl: '/overlays/overlay-certificate.png',
    href: '/verify/certificate',
  },
  {
    _id: 'card-career',
    kicker: '11 / Career Desk',
    badge: 'Industry Roadmaps',
    title: 'Career Roadmaps & Guidance',
    description: 'Curated career roadmaps, interview preparation notes, and practical industry insights.',
    accentColor: '#14B8A6',
    imageUrl: '/career-hero.jpg',
    href: '/career',
  },
];

const SPEED = 36; // px per second drift
const NUDGE_AMOUNT = 300;

export function WhyGyanChowk({ cards: initialCards }: { cards?: unknown }) {
  const { data } = useQuery({
    queryKey: ['learning-stack-cards-public'],
    queryFn: () => api<{ cards: LearningStackCardItem[] }>('/api/learning-stack/cards'),
    initialData: { cards: DEFAULT_STACK_CARDS },
    staleTime: 60_000,
  });

  const cards = useMemo(() => {
    const raw = data?.cards && data.cards.length > 0 ? data.cards : DEFAULT_STACK_CARDS;
    // Merge fallback visual metadata if API returned minimal items
    return raw.map((item, idx) => {
      const fallback = DEFAULT_STACK_CARDS[idx % DEFAULT_STACK_CARDS.length];
      return {
        ...fallback,
        ...item,
        imageUrl: item.imageUrl || fallback.imageUrl,
        badge: item.badge || fallback.badge,
        kicker: item.kicker || fallback.kicker,
        href: item.href || fallback.href,
      };
    });
  }, [data?.cards]);

  return (
    <section
      id="why"
      aria-labelledby="why-gyan-chowk-heading"
      className="relative overflow-hidden bg-[#FAF7F2] py-14 sm:py-20 border-b border-[#ECE6DE]"
    >
      {/* Subtle depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(247,242,233,0.7),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="gc-container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER - Matching Reference Image */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3.5">
            <span className="w-5 h-px bg-[#D6CBBB]" aria-hidden="true" />
            <span className="inline-block rounded-full bg-[#FAF0E4] border border-[#E8DCC8] px-3.5 py-0.5 text-[11px] font-bold tracking-[0.18em] uppercase text-[#8C6228]">
              WHY GYAN CHOWK
            </span>
            <span className="w-5 h-px bg-[#D6CBBB]" aria-hidden="true" />
          </div>

          <h2
            id="why-gyan-chowk-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#0F172A] leading-[1.14]"
          >
            A complete{' '}
            <span className="font-serif italic font-normal text-[#B87B2E]">
              recorded learning stack
            </span>
          </h2>

          <p className="mt-3.5 text-xs sm:text-[14px] text-slate-500 font-normal leading-relaxed max-w-2xl">
            Everything is built from the ground up for serious learners who value clarity and
            proof of progress.
          </p>
        </div>
      </div>

      {/* ARCHED RECOMMENDATION CARDS CAROUSEL */}
      <ArchedCardsCarousel items={cards} />
    </section>
  );
}

export function ArchedCardsCarousel({ items }: { items: LearningStackCardItem[] }) {
  const count = items.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const speedRef = useRef(SPEED);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragXRef = useRef(0);
  const dragOriginRef = useRef(0);
  const loopWidthRef = useRef(0);
  const rafRef = useRef(0);
  const [reduce, setReduce] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  // 3 duplicate sets of slides ensures seamless wrap-around with wide viewport coverage
  const duplicatedSlides = useMemo(() => {
    return [...items, ...items, ...items];
  }, [items]);

  const cardWidth = isMobile ? 228 : 268;
  const cardGap = isMobile ? 16 : 20;
  const stride = cardWidth + cardGap;
  const singleSetWidth = count * stride;

  // Track window resizing & reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const widthQuery = window.matchMedia('(max-width: 640px)');

    const sync = () => {
      setReduce(mq.matches);
      setIsMobile(widthQuery.matches);
    };

    sync();
    mq.addEventListener('change', sync);
    widthQuery.addEventListener('change', sync);

    return () => {
      mq.removeEventListener('change', sync);
      widthQuery.removeEventListener('change', sync);
    };
  }, []);

  // Update layout loop width
  useEffect(() => {
    loopWidthRef.current = singleSetWidth;
    setReady(true);
  }, [singleSetWidth]);

  // RequestAnimationFrame animation loop with arch parabola transform calculation
  useEffect(() => {
    if (!ready || reduce || count < 2) return;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(32, now - last) / 1000;
      last = now;

      if (!pausedRef.current && !draggingRef.current) {
        offsetRef.current -= speedRef.current * dt;
        const lw = loopWidthRef.current;
        if (lw > 0) {
          while (offsetRef.current <= -lw) offsetRef.current += lw;
          while (offsetRef.current > 0) offsetRef.current -= lw;
        }
      }

      // Calculate the arch curve transforms for every card
      const vp = viewportRef.current;
      const track = trackRef.current;

      if (vp && track) {
        const vpWidth = vp.clientWidth;
        const halfVp = vpWidth / 2;
        const cardsEls = track.children;

        for (let i = 0; i < cardsEls.length; i++) {
          const cardEl = cardsEls[i] as HTMLElement;
          // Card center relative to track start
          const cardCenter = offsetRef.current + i * stride + cardWidth / 2;
          // Distance from viewport center
          const delta = cardCenter - halfVp;
          // Normalized ratio (-1 at left edge, 0 at center, +1 at right edge)
          const u = Math.max(-1.4, Math.min(1.4, delta / (halfVp * 0.92)));

          // Parabolic arch: center card is highest (translateY = 0), edge cards dip downwards
          const translateY = Math.pow(u, 2) * (isMobile ? 18 : 28);
          // Rotation: tilt outwards from center (-6deg to +6deg)
          const rotate = u * (isMobile ? 4.5 : 6.2);
          // Scale: center card is slightly more prominent
          const scale = 1 - Math.pow(u, 2) * 0.025;

          const innerCard = cardEl.firstElementChild as HTMLElement;
          if (innerCard) {
            innerCard.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          }
        }

        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, reduce, count, stride, cardWidth, isMobile]);

  const nudge = (dir: 1 | -1) => {
    const lw = loopWidthRef.current;
    offsetRef.current += dir * NUDGE_AMOUNT;
    if (lw > 0) {
      while (offsetRef.current <= -lw) offsetRef.current += lw;
      while (offsetRef.current > 0) offsetRef.current -= lw;
    }
  };

  return (
    <div className="relative w-full overflow-hidden pt-4 pb-6 sm:pb-8 select-none">
      <div className="relative w-full">
        {/* Viewport with lateral gradient masks */}
        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Why Gyan Chowk Learning Stack Showcase"
          tabIndex={0}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            if (!draggingRef.current) pausedRef.current = false;
          }}
          onFocus={() => {
            pausedRef.current = true;
          }}
          onBlur={() => {
            pausedRef.current = false;
          }}
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            draggingRef.current = true;
            dragXRef.current = e.clientX;
            dragOriginRef.current = offsetRef.current;
            pausedRef.current = true;
            viewportRef.current?.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            const dx = e.clientX - dragXRef.current;
            offsetRef.current = dragOriginRef.current + dx;
            const lw = loopWidthRef.current;
            if (lw > 0) {
              while (offsetRef.current <= -lw) offsetRef.current += lw;
              while (offsetRef.current > 0) offsetRef.current -= lw;
            }
          }}
          onPointerUp={() => {
            draggingRef.current = false;
            pausedRef.current = false;
          }}
          onPointerCancel={() => {
            draggingRef.current = false;
            pausedRef.current = false;
          }}
          className="w-full overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ minHeight: isMobile ? '350px' : '410px' }}
        >
          <div
            ref={trackRef}
            className="flex will-change-transform py-4"
            style={{ width: 'max-content' }}
          >
            {duplicatedSlides.map((card, i) => {
              return (
                <div
                  key={`${card._id || card.title}-${i}`}
                  style={{
                    width: `${cardWidth}px`,
                    flex: `0 0 ${cardWidth}px`,
                    marginRight: `${cardGap}px`,
                  }}
                  className="perspective-[1000px]"
                  aria-hidden={i >= count}
                >
                  {/* Inner Card Container that receives arch transform */}
                  <div
                    className="transition-[box-shadow,border-color] duration-200 will-change-transform"
                    style={{
                      transformOrigin: '50% 100%',
                      transform: 'translate3d(0, 0, 0) rotate(0deg)',
                    }}
                  >
                    <Link
                      href={card.href || '/courses'}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-black/10 bg-[#161B26] text-white shadow-[0_16px_36px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] hover:border-amber-400/50"
                      style={{
                        height: isMobile ? '320px' : '360px',
                      }}
                    >
                      {/* Background Visual Image */}
                      <div className="absolute inset-0 z-0">
                        {card.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading={i < 6 ? 'eager' : 'lazy'}
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#1E293B] to-[#0F172A]" />
                        )}

                        {/* Film grain and dark readability gradient veil */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/65 to-black/30" />
                      </div>

                      {/* Card Top: Accent pill & Serial badge */}
                      <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.22)',
                          }}
                        >
                          {card.badge}
                        </span>

                        <span
                          className="h-2.5 w-2.5 rounded-full shadow-xs"
                          style={{ backgroundColor: card.accentColor }}
                          aria-hidden="true"
                        />
                      </div>

                      {/* Card Bottom: Title & Body description */}
                      <div className="relative z-10 p-5 sm:p-6 mt-auto">
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
                          {card.kicker}
                        </p>

                        <h3 className="mt-1 font-serif text-[1.25rem] sm:text-[1.35rem] font-bold leading-snug text-white tracking-tight">
                          {card.title}
                        </h3>

                        <p className="mt-2 text-xs leading-relaxed text-stone-300 line-clamp-2">
                          {card.description}
                        </p>

                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-white/80 group-hover:text-amber-300 transition-colors">
                          <span>Explore</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="Previous learning stack cards"
              className="absolute left-2 sm:left-4 md:left-6 top-1/2 z-20 grid h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[color:var(--brand-navy)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white hover:scale-105 active:scale-95 transition-all border border-slate-200/80 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Next learning stack cards"
              className="absolute right-2 sm:right-4 md:right-6 top-1/2 z-20 grid h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[color:var(--brand-navy)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white hover:scale-105 active:scale-95 transition-all border border-slate-200/80 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

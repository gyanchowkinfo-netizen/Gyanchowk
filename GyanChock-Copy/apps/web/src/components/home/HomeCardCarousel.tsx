'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/format';
import styles from './HomeVisualCards.module.css';

/** Pixels per second — calm, premium drift. */
const SPEED = 38;
const NUDGE = 280;

function cardWidth(viewportWidth: number) {
  if (viewportWidth < 640) return Math.min(viewportWidth * 0.86, 300);
  if (viewportWidth < 900) return 260;
  if (viewportWidth < 1100) return 240;
  if (viewportWidth < 1400) return 228;
  return 220;
}

export function HomeCardCarousel({
  count,
  ariaLabel,
  renderSlide,
}: {
  count: number;
  ariaLabel: string;
  renderSlide: (index: number, eager: boolean) => ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const speed = useRef(SPEED);
  const paused = useRef(false);
  const dragging = useRef(false);
  const dragX = useRef(0);
  const dragOrigin = useRef(0);
  const loopWidth = useRef(0);
  const raf = useRef(0);
  const [reduce, setReduce] = useState(false);
  const [width, setWidth] = useState(240);
  const [ready, setReady] = useState(false);

  const canLoop = count >= 2;
  /** Two full sets so the track can wrap seamlessly. */
  const slides = useMemo(() => {
    if (!count) return [];
    const real = Array.from({ length: count }, (_, i) => i);
    if (!canLoop) return real;
    return [...real, ...real];
  }, [canLoop, count]);

  const measure = useCallback(() => {
    const el = viewport.current;
    const tr = track.current;
    if (!el || !tr || !count) return;
    const cw = cardWidth(el.clientWidth);
    setWidth(cw);
    // Defer so flex widths apply before measuring the loop seam.
    requestAnimationFrame(() => {
      const nodes = tr.children;
      if (canLoop && nodes.length >= count * 2) {
        const first = nodes[0] as HTMLElement;
        const mid = nodes[count] as HTMLElement;
        loopWidth.current = Math.max(1, mid.offsetLeft - first.offsetLeft);
      } else {
        loopWidth.current = tr.scrollWidth;
      }
      setReady(true);
    });
  }, [canLoop, count]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReduce(motion.matches);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    syncMotion();
    measure();
    motion.addEventListener('change', syncMotion);
    return () => {
      ro.disconnect();
      motion.removeEventListener('change', syncMotion);
    };
  }, [measure]);

  useEffect(() => {
    if (!ready || reduce || !canLoop) return;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(32, now - last) / 1000;
      last = now;
      if (!paused.current && !dragging.current) {
        offset.current -= speed.current * dt;
        const w = loopWidth.current;
        if (w > 0) {
          // Keep offset in [-w, 0) for seamless wrap.
          while (offset.current <= -w) offset.current += w;
          while (offset.current > 0) offset.current -= w;
        }
        if (track.current) {
          track.current.style.transform = `translate3d(${offset.current}px,0,0)`;
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [canLoop, ready, reduce]);

  const setPaused = (value: boolean) => {
    paused.current = value;
  };

  const nudge = (dir: 1 | -1) => {
    if (!canLoop) return;
    const w = loopWidth.current;
    offset.current += dir * NUDGE;
    if (w > 0) {
      while (offset.current <= -w) offset.current += w;
      while (offset.current > 0) offset.current -= w;
    }
    if (track.current) {
      track.current.style.transition = 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)';
      track.current.style.transform = `translate3d(${offset.current}px,0,0)`;
      window.setTimeout(() => {
        if (track.current) track.current.style.transition = 'none';
      }, 440);
    }
  };

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nudge(-1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nudge(1);
    }
  }

  return (
    <div className={styles.marqueeWrap}>
      <div
        ref={viewport}
        className={cn(styles.viewport, styles.marqueeViewport)}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKey}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          if (!dragging.current) setPaused(false);
        }}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          dragging.current = true;
          dragX.current = e.clientX;
          dragOrigin.current = offset.current;
          setPaused(true);
          viewport.current?.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const dx = e.clientX - dragX.current;
          offset.current = dragOrigin.current + dx;
          const w = loopWidth.current;
          if (canLoop && w > 0) {
            while (offset.current <= -w) offset.current += w;
            while (offset.current > 0) offset.current -= w;
          }
          if (track.current) {
            track.current.style.transition = 'none';
            track.current.style.transform = `translate3d(${offset.current}px,0,0)`;
          }
        }}
        onPointerUp={() => {
          dragging.current = false;
          setPaused(false);
        }}
        onPointerCancel={() => {
          dragging.current = false;
          setPaused(false);
        }}
      >
        <div
          ref={track}
          className={cn(styles.track, styles.marqueeTrack)}
          style={{ transform: 'translate3d(0,0,0)', transition: 'none' }}
        >
          {slides.map((real, i) => (
            <div
              key={`${real}-${i}`}
              className={cn(styles.slide, styles.marqueeSlide)}
              style={{ width: width, flex: `0 0 ${width}px` }}
              aria-hidden={canLoop && i >= count}
            >
              {renderSlide(real, i < Math.min(5, count))}
            </div>
          ))}
        </div>
        <div className={styles.marqueeFadeLeft} aria-hidden />
        <div className={styles.marqueeFadeRight} aria-hidden />
      </div>
      {count > 1 ? (
        <div className={cn(styles.nav, 'mt-5 justify-center sm:justify-end')}>
          <button type="button" className={styles.navBtn} aria-label="Previous cards" onClick={() => nudge(1)}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" className={styles.navBtn} aria-label="Next cards" onClick={() => nudge(-1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function HomeCardSectionHeading({
  id,
  kicker,
  title,
  subtitle,
  highlight,
}: {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  highlight?: string;
}) {
  let heading: ReactNode = title;
  if (highlight && title.includes(highlight)) {
    const [before, after] = title.split(highlight);
    heading = (
      <>
        {before}
        <span className={styles.gradient}>{highlight}</span>
        {after}
      </>
    );
  }

  return (
    <div className={styles.head}>
      <p className={styles.kicker}>{kicker}</p>
      <h2 className={styles.title} id={id}>
        {heading}
      </h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}

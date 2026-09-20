'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/format';

type Props = {
  label: string;
  /** Compact list for mobile drawer */
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

const POPULAR_LINKS: Array<[string, string]> = [
  ['JEE', '/courses?category=JEE'],
  ['NEET', '/courses?category=NEET'],
  ['Boards', '/courses?category=Boards'],
  ['Government', '/courses?category=Government%20exams'],
  ['Programming', '/courses?category=Programming'],
];

const PANEL_CLASS =
  'rounded-2xl border border-gc-line bg-[color:var(--gyan-surface)] p-2 shadow-[var(--shadow-lg)]';

function useDropdownCoords(open: boolean, triggerRef: RefObject<HTMLElement | null>) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const sync = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.bottom, left: rect.left + rect.width / 2 });
  }, [triggerRef]);

  useEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [open, sync]);

  return { coords, sync };
}

function PopularLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <p className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-gc-mute">Popular</p>
      <ul className="mt-0.5 space-y-0.5">
        {POPULAR_LINKS.map(([catLabel, href]) => (
          <li key={catLabel}>
            <Link
              href={href}
              className="block rounded-xl px-3 py-2.5 text-sm text-gc-black hover:bg-[color:var(--gyan-primary-soft)]"
              onClick={() => onNavigate?.()}
            >
              {catLabel}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function CoursesNavMenu({ label, variant = 'desktop', onNavigate }: Props) {
  const pathname = usePathname();
  const active = pathname === '/courses' || pathname.startsWith('/courses/');
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { coords, sync: syncCoords } = useDropdownCoords(open, triggerRef);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }, [clearCloseTimer]);

  const close = useCallback(() => {
    onNavigate?.();
    setOpen(false);
  }, [onNavigate]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (variant !== 'desktop') return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if ((target as Element).closest?.('[data-courses-nav-panel]')) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [variant]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const panel = (
    <div
      data-courses-nav-panel
      className={cn(PANEL_CLASS, 'flex w-56 flex-col')}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      <PopularLinks onNavigate={() => setOpen(false)} />
      <div className="mt-2 border-t border-gc-line/70 pt-2">
        <Link href="/courses" className="gc-btn-primary flex w-full justify-center text-sm" onClick={() => setOpen(false)}>
          View all courses
        </Link>
      </div>
    </div>
  );

  if (variant === 'mobile') {
    return (
      <div className="border-b border-gc-line/60 pb-4">
        <button
          type="button"
          className="flex w-full items-center justify-between py-3 font-display text-3xl text-gc-black"
          aria-expanded={open}
          suppressHydrationWarning
          onClick={() => setOpen((v) => !v)}
        >
          {label}
          <ChevronDown size={22} className={cn('transition-transform', open ? 'rotate-180' : '')} />
        </button>
        {open ? (
          <div className={cn(PANEL_CLASS, 'mt-2 flex flex-col')}>
            <PopularLinks onNavigate={close} />
            <div className="mt-2 border-t border-gc-line/70 pt-2">
              <Link href="/courses" className="gc-btn-primary flex w-full justify-center text-sm" onClick={close}>
                View all courses
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
        syncCoords();
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'gc-nav-link inline-flex items-center gap-1',
          (active || open) && 'is-active',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        suppressHydrationWarning
        onClick={() =>
          setOpen((v) => {
            const next = !v;
            if (next) window.requestAnimationFrame(() => syncCoords());
            return next;
          })
        }
      >
        {label}
        <ChevronDown
          size={14}
          strokeWidth={2.25}
          className={cn('opacity-55 transition-transform duration-200 ease-out', open ? 'rotate-180 opacity-80' : '')}
        />
      </button>
      {open && mounted && coords
        ? createPortal(
            <div
              data-courses-nav-panel
              className="fixed z-[100] w-56 -translate-x-1/2 pt-2"
              style={{ top: coords.top, left: coords.left }}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={scheduleClose}
            >
              {panel}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

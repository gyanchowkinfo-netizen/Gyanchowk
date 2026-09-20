'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/format';

export function NavDropdown({
  label,
  items,
  active,
}: {
  label: string;
  items: Array<{ href: string; label: string; hint?: string }>;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.bottom, left: rect.left + rect.width / 2 });
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    syncCoords();
    window.addEventListener('resize', syncCoords);
    window.addEventListener('scroll', syncCoords, true);
    return () => {
      window.removeEventListener('resize', syncCoords);
      window.removeEventListener('scroll', syncCoords, true);
    };
  }, [open, syncCoords]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if ((target as Element).closest?.(`[data-nav-dropdown="${label}"]`)) return;
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
  }, [label]);

  const clearCloseTimer = () => {
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    t.current = setTimeout(() => setOpen(false), 160);
  };

  const panel = (
    <div
      data-nav-dropdown={label}
      className="w-56 -translate-x-1/2 rounded-2xl border border-gc-line bg-[color:var(--gyan-surface)] p-2 shadow-[var(--shadow-lg)]"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      {items.map((it, index) => (
        <Link
          key={`${label}-${index}-${it.label}`}
          href={it.href}
          className="block rounded-xl px-3 py-2.5 text-sm text-gc-black hover:bg-[color:var(--gyan-primary-soft)]"
          onClick={() => setOpen(false)}
        >
          {it.label}
          {it.hint ? <span className="mt-0.5 block text-xs text-gc-mute">{it.hint}</span> : null}
        </Link>
      ))}
    </div>
  );

  return (
    <div
      ref={ref}
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
        className={cn('inline-flex items-center gap-1 transition-colors hover:text-gc-black', active || open ? 'text-gc-black' : '')}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() =>
          setOpen((v) => {
            const next = !v;
            if (next) window.requestAnimationFrame(() => syncCoords());
            return next;
          })
        }
        suppressHydrationWarning
      >
        {label}
        <ChevronDown size={14} className={cn('opacity-60 transition-transform', open ? 'rotate-180' : '')} />
      </button>
      {open && mounted && coords
        ? createPortal(
            <div
              className="fixed z-[100] pt-2"
              style={{ top: coords.top, left: coords.left }}
              data-nav-dropdown={label}
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

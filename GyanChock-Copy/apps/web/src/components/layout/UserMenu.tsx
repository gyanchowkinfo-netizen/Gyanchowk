'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Badge';
import { useAuth, type SessionUser } from '@/lib/auth';
import { cn } from '@/lib/format';

type MenuItem = { href?: string; label: string; onClick?: () => void };

export function itemsForUser(user: SessionUser): MenuItem[] {
  if (user.role === 'admin') {
    return [{ href: '/admin', label: 'Admin Dashboard' }];
  }
  if (user.role === 'teacher') {
    return [
      { href: '/teacher/settings', label: 'My profile' },
      { href: '/teacher/courses', label: 'My Courses' },
    ];
  }
  return [
    { href: '/student/profile', label: 'My profile' },
    { href: '/student/courses', label: 'My Courses' },
  ];
}

export function UserMenu({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const syncCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.bottom, right: window.innerWidth - rect.right });
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
      if (rootRef.current?.contains(target)) return;
      if ((target as Element).closest?.('[data-user-menu-panel]')) return;
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
  }, []);

  async function onLogout() {
    setOpen(false);
    onNavigate?.();
    await logout();
    router.push('/');
  }

  const links = itemsForUser(user);

  const panel = (
    <div
      data-user-menu-panel
      className="w-56 rounded-2xl border border-gc-line bg-[color:var(--gyan-surface)] p-2 shadow-[var(--shadow-lg)]"
    >
      <p className="truncate px-3 py-2 text-sm font-medium text-gc-black">{user.name}</p>
      <p className="truncate px-3 pb-2 text-xs text-gc-mute">{user.email}</p>
      <div className="border-t border-gc-line/70 pt-1">
        {links.map((item) => (
          <Link
            key={item.label}
            href={item.href!}
            className="block rounded-xl px-3 py-2.5 text-sm text-gc-black hover:bg-[color:var(--gyan-primary-soft)]"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-gc-black hover:bg-[color:var(--gyan-primary-soft)]"
          onClick={() => void onLogout()}
        >
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'gc-navbar-profile grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#263b2d] transition duration-200',
          open && 'ring-2 ring-[rgba(38,59,45,0.25)]',
        )}
        aria-label="Open profile menu"
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
        <Avatar name={user.name} src={user.avatar?.url} size={40} />
      </button>
      {open && mounted && coords
        ? createPortal(
            <div
              data-user-menu-panel
              className="fixed z-[100] pt-2"
              style={{ top: coords.top, right: coords.right }}
            >
              {panel}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

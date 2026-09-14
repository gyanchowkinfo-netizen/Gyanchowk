'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/lib/auth';
import { SearchCommand } from './SearchCommand';
import { Avatar } from '@/components/ui/Badge';
import { cn } from '@/lib/format';
import { isAppPanelPath } from '@/lib/paths';

const links = [
  { href: '/courses', key: 'courses' },
  { href: '/batches', key: 'batches' },
  { href: '/teachers', key: 'teachers' },
  { href: '/career', key: 'career' },
  { href: '/blog', key: 'blog' },
  { href: '/about', key: 'about' },
] as const;

export function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const { user, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboard =
    user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : user ? '/student' : null;

  if (isAppPanelPath(pathname)) {
    return null;
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-gc-line/60 bg-gyan-background/80 backdrop-blur-xl transition-[transform,padding,box-shadow] duration-300',
        compact ? 'shadow-glow py-0' : '',
      )}
    >
      <div className={cn('mx-auto flex max-w-7xl items-center justify-between gap-4 px-4', compact ? 'py-2' : 'py-3')}>
        <BrandLogo />
        <nav className="hidden items-center gap-6 text-sm text-gc-mist lg:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'relative py-1 transition-colors hover:text-gc-gold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gc-gold after:transition-transform',
                pathname.startsWith(l.href) ? 'text-gc-gold after:scale-x-100' : 'hover:after:scale-x-100',
              )}
            >
              {t.nav[l.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SearchCommand />
          <select
            className="h-10 rounded-xl border border-gc-line bg-gc-navy px-3 text-sm text-gc-mist"
            value={locale}
            onChange={(e) => setLocale(e.target.value as typeof locale)}
            aria-label="Language"
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="hinglish">Hinglish</option>
          </select>
          {dashboard ? (
            <button className="gc-btn-primary hidden h-10 sm:inline-flex" onClick={() => router.push(dashboard)}>
              <Avatar name={user?.name} src={user?.avatar?.url} size={20} /> Dashboard
            </button>
          ) : (
            <>
              <Link href="/login" className="gc-btn-ghost hidden h-10 sm:inline-flex">
                {t.nav.login}
              </Link>
              <Link href="/register" className="gc-btn-primary h-10">
                {t.nav.register}
                <span className="gc-btn-arrow">→</span>
              </Link>
            </>
          )}
          <button className="gc-btn-ghost lg:hidden" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="space-y-2 border-t border-gc-line px-4 py-4 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block py-2 text-gc-mist" onClick={() => setOpen(false)}>
              {t.nav[l.key]}
            </Link>
          ))}
          <Link href="/contact" className="block py-2" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

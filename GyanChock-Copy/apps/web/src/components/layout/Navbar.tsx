'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/lib/auth';
import { SearchCommand, SearchTrigger } from './SearchCommand';
import { CoursesNavMenu } from './CoursesNavMenu';
import { UserMenu, itemsForUser } from './UserMenu';
import { cn } from '@/lib/format';
import { isAppPanelPath } from '@/lib/paths';

export function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const { user, refresh, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(72);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const updateNavHeight = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setNavHeight(Math.max(56, Math.round(rect.bottom)));
      }
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    window.addEventListener('scroll', updateNavHeight, { passive: true });
    return () => {
      window.removeEventListener('resize', updateNavHeight);
      window.removeEventListener('scroll', updateNavHeight);
    };
  }, [open, scrolled]);

  if (isAppPanelPath(pathname)) {
    return null;
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link href={href} className={cn('gc-nav-link', active && 'is-active')}>
        {label}
      </Link>
    );
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        'gc-navbar sticky top-0 z-50 overflow-visible',
        !open && 'backdrop-blur-md',
        scrolled && 'is-scrolled',
      )}
    >
      <div className="gc-navbar-inner gc-container flex items-center gap-5 overflow-visible sm:gap-6 lg:gap-8">
        <BrandLogo size={36} imageClassName="gc-navbar-logo" />
        <nav className="hidden flex-1 items-center justify-center gap-6 overflow-visible text-[15px] xl:gap-9 lg:flex" aria-label="Primary">
          <CoursesNavMenu label={t.nav.courses} />
          {navLink('/teachers', t.nav.teachers)}
          {navLink('/career', t.nav.career)}
          {navLink('/about', t.nav.about)}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden w-[min(100%,18rem)] md:block lg:w-[min(100%,20rem)]">
            <SearchTrigger className="h-10 w-full" onClick={() => setSearchOpen(true)} />
          </div>
          <button
            className="gc-navbar-icon-btn grid h-10 w-10 place-items-center rounded-full md:hidden"
            aria-label="Search"
            suppressHydrationWarning
            onClick={() => setSearchOpen(true)}
          >
            <Search size={18} />
          </button>
          {user ? (
            <UserMenu
              user={user}
              onNavigate={() => {
                setOpen(false);
              }}
            />
          ) : (
            <>
              <Link href="/login" className="gc-nav-link hidden min-h-10 items-center px-2 text-sm sm:inline-flex">
                {t.nav.login}
              </Link>
              <Link href="/register" className="gc-btn-primary !hidden h-10 px-5 text-sm sm:!inline-flex">
                {t.nav.register}
              </Link>
            </>
          )}
          <div className="lg:hidden">
            <button
              className="gc-navbar-icon-btn grid h-10 w-10 place-items-center rounded-full"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              suppressHydrationWarning
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>
      {open && mounted
        ? createPortal(
            <div
              className="gc-navbar-drawer fixed inset-x-0 bottom-0 z-[49] overflow-y-auto px-5 py-6"
              style={{ top: navHeight }}
            >
              <nav className="flex min-h-full flex-col pb-24" aria-label="Mobile">
                <SearchTrigger
                  className="mb-6 h-12 w-full"
                  onClick={() => {
                    setOpen(false);
                    setSearchOpen(true);
                  }}
                />
                <div className="space-y-1">
                  <CoursesNavMenu label={t.nav.courses} variant="mobile" onNavigate={() => setOpen(false)} />
                  <Link
                    href="/teachers"
                    className="block min-h-11 py-3 font-display text-3xl text-[#26352d] transition-colors hover:text-amber-800"
                    onClick={() => setOpen(false)}
                  >
                    {t.nav.teachers}
                  </Link>
                  <Link
                    href="/career"
                    className="block min-h-11 py-3 font-display text-3xl text-[#26352d] transition-colors hover:text-amber-800"
                    onClick={() => setOpen(false)}
                  >
                    {t.nav.career}
                  </Link>
                  <Link
                    href="/about"
                    className="block min-h-11 py-3 font-display text-3xl text-[#26352d] transition-colors hover:text-amber-800"
                    onClick={() => setOpen(false)}
                  >
                    {t.nav.about}
                  </Link>
                </div>
                <label className="mt-8 block text-sm font-medium text-[#626860]">
                  Language
                  <select
                    className="gc-input mt-2 w-full"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as typeof locale)}
                    suppressHydrationWarning
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </label>
                <div className="mt-8 space-y-3 pt-6 border-t border-gc-line/60">
                  {user ? (
                    <>
                      {itemsForUser(user).map((item) => (
                        <Link
                          key={item.label}
                          href={item.href!}
                          className="gc-btn-outline w-full justify-center"
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        className="gc-btn-primary w-full justify-center"
                        onClick={async () => {
                          setOpen(false);
                          await logout();
                          router.push('/');
                        }}
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="gc-btn-outline w-full justify-center" onClick={() => setOpen(false)}>
                        {t.nav.login}
                      </Link>
                      <Link href="/register" className="gc-btn-primary w-full justify-center" onClick={() => setOpen(false)}>
                        {t.nav.register}
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
      {mounted
        ? createPortal(
            <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />,
            document.body,
          )
        : null}
    </header>
  );
}

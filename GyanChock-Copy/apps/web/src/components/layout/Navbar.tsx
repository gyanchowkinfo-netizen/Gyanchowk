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
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(72);

  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollYRef = useRef(0);
  const openRef = useRef(open);
  openRef.current = open;
  const searchOpenRef = useRef(searchOpen);
  searchOpenRef.current = searchOpen;
  const isInteractingRef = useRef(false);

  const clearTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const startHideTimer = () => {
    clearTimer();
    // Only schedule auto-hide if user is scrolled away from the top and not interacting
    if (
      window.scrollY > 10 &&
      !openRef.current &&
      !searchOpenRef.current &&
      !isInteractingRef.current
    ) {
      hideTimerRef.current = setTimeout(() => {
        if (
          window.scrollY > 10 &&
          !openRef.current &&
          !searchOpenRef.current &&
          !isInteractingRef.current
        ) {
          setVisible(false);
        }
      }, 5000);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setOpen(false);
    clearTimer();
    setVisible(true);
    if (window.scrollY > 10) {
      startHideTimer();
    }
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Mobile drawer open/close edge case
  useEffect(() => {
    if (open) {
      clearTimer();
      setVisible(true);
    } else if (window.scrollY > 10) {
      startHideTimer();
    }
  }, [open]);

  // Search dialog open/close edge case
  useEffect(() => {
    if (searchOpen) {
      clearTimer();
      setVisible(true);
    } else if (window.scrollY > 10) {
      startHideTimer();
    }
  }, [searchOpen]);

  // Scroll listener: hides on scroll down, reveals on scroll up for 5 seconds
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 8);

      // 1. Initial / At top of page: Keep visible, never auto-hide
      if (currentScrollY <= 10) {
        clearTimer();
        setVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // If mobile drawer, search modal, or hover interaction is active, keep visible
      if (openRef.current || searchOpenRef.current || isInteractingRef.current) {
        clearTimer();
        setVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollYRef.current;

      // 2. Scrolling DOWN (diff > 4): hide Navbar immediately
      if (diff > 4) {
        clearTimer();
        setVisible(false);
      }
      // 3. Scrolling UP (diff < -4): show Navbar and start 5-second inactivity timer
      else if (diff < -4) {
        setVisible(true);
        startHideTimer();
      }

      lastScrollYRef.current = currentScrollY;
    };

    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onScroll);
      window.removeEventListener('touchmove', onScroll);
      clearTimer();
    };
  }, []);

  useEffect(() => {
    const updateNavHeight = () => {
      if (headerRef.current) {
        // Measure un-transformed height to avoid collapsing when translateY(-100%)
        const h = headerRef.current.offsetHeight || (window.innerWidth >= 640 ? 80 : 72);
        setNavHeight(h);
      }
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => {
      window.removeEventListener('resize', updateNavHeight);
    };
  }, []);

  const handleMouseEnter = () => {
    isInteractingRef.current = true;
    clearTimer();
    setVisible(true);
  };

  const handleMouseLeave = () => {
    isInteractingRef.current = false;
    if (window.scrollY > 10 && !openRef.current && !searchOpenRef.current) {
      startHideTimer();
    }
  };

  const handleFocus = () => {
    isInteractingRef.current = true;
    clearTimer();
    setVisible(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (headerRef.current && !headerRef.current.contains(e.relatedTarget as Node)) {
      isInteractingRef.current = false;
      if (window.scrollY > 10 && !openRef.current && !searchOpenRef.current) {
        startHideTimer();
      }
    }
  };

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
    <>
      {/* Structural layout spacer to prevent layout shift while Navbar is position: fixed */}
      <div
        style={{ height: navHeight }}
        className="w-full shrink-0 invisible pointer-events-none select-none"
        aria-hidden="true"
      />
      <header
        ref={headerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
        className={cn(
          'gc-navbar fixed top-0 left-0 right-0 z-50 overflow-visible',
          !open && 'backdrop-blur-md',
          scrolled && 'is-scrolled',
          visible ? 'is-visible' : 'is-hidden',
        )}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          transition:
            'transform 350ms ease-in-out, background-color 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
        }}
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
                <Link href="/login" className="gc-nav-link hidden min-h-10 items-center px-2 text-sm whitespace-nowrap shrink-0 sm:inline-flex">
                  {t.nav.login}
                </Link>
                <Link href="/register" className="gc-btn-primary !hidden h-10 px-5 text-sm whitespace-nowrap shrink-0 sm:!inline-flex">
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
                      <Link href="/login" className="gc-btn-outline w-full justify-center whitespace-nowrap" onClick={() => setOpen(false)}>
                        {t.nav.login}
                      </Link>
                      <Link href="/register" className="gc-btn-primary w-full justify-center whitespace-nowrap" onClick={() => setOpen(false)}>
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
    </>
  );
}

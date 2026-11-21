'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { HeroBannerCarousel } from './HeroBannerCarousel';
import { SearchSuggestionsDropdown } from '@/components/search/SearchSuggestionsDropdown';

export function Hero({
  kicker,
  title,
  body,
  cta,
  secondary,
  onSearch,
}: {
  kicker: string;
  title: string;
  body: string;
  cta: string;
  secondary: string;
  onSearch: (q: string) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSearch(q.trim());
  }

  const lines = title.includes('\n') ? title.split('\n') : splitHeadline(title);

  return (
    <section className="relative z-20" aria-labelledby="home-hero">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[color:var(--brand-blue)]/[0.08] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[color:var(--brand-violet)]/[0.08] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-blue)]/20 to-transparent" />
      </div>
      <div className="gc-container relative z-20 grid items-center gap-8 py-5 sm:gap-8 sm:py-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10 lg:py-8">
        <div className="order-1 min-w-0 text-center lg:text-left relative z-30">
          <Reveal>
            <p className="gc-kicker mb-3">{kicker}</p>
          </Reveal>
          <Reveal delay={0.04}>
            <h1 id="home-hero" className="gc-hero-title">
              {lines[0]}
              {lines[1] ? (
                <>
                  <br />
                  {lines[1]}
                </>
              ) : null}
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-gc-mist sm:text-[17px] lg:mx-0">{body}</p>
            <p className="mt-2.5 font-display text-base italic text-[color:var(--brand-navy)] sm:text-lg">
              Learn at your pace. Practice with intent. Progress with confidence.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-6 grid w-full grid-cols-3 gap-1.5 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start sm:gap-3">
              <Link
                href="/register"
                className="gc-btn-primary min-h-10 w-full sm:min-h-12 sm:w-auto !px-1 sm:!px-6 !text-[11px] min-[380px]:!text-xs sm:!text-sm font-semibold tracking-tight text-center leading-tight"
              >
                {cta}
              </Link>
              <Link
                href="/courses"
                className="gc-btn-outline min-h-10 w-full sm:min-h-12 sm:w-auto !px-1 sm:!px-6 !text-[11px] min-[380px]:!text-xs sm:!text-sm font-semibold tracking-tight text-center leading-tight"
              >
                {secondary}
              </Link>
              <Link
                href="/student/tests"
                className="gc-btn-outline min-h-10 w-full sm:min-h-12 sm:w-auto !px-1 sm:!px-6 !text-[11px] min-[380px]:!text-xs sm:!text-sm font-semibold tracking-tight text-center leading-tight"
              >
                Take a free test
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.16} className="relative z-30">
            <form onSubmit={submit} className="relative z-30 mx-auto mt-6 w-full max-w-xl lg:mx-0">
              <label className="sr-only" htmlFor="home-search">
                Search courses, exams, teachers
              </label>
              <div className="gc-hero-search flex w-full items-center gap-2 rounded-full border border-gc-line bg-[color:var(--gyan-surface)] px-3 py-2 shadow-[var(--shadow-sm)] sm:px-4">
                <Search size={18} className="shrink-0 text-gc-mute" aria-hidden />
                <input
                  id="home-search"
                  type="text"
                  className="gc-hero-search-input min-h-11 min-w-0 flex-1 bg-transparent text-base text-gc-black sm:text-[15px]"
                  placeholder="Search courses, exams, teachers..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  autoComplete="off"
                  suppressHydrationWarning
                />
                <button className="gc-btn-primary h-10 shrink-0 px-4 text-sm" type="submit" suppressHydrationWarning>
                  Search
                </button>
              </div>
              {focused && q.trim().length >= 1 ? (
                <SearchSuggestionsDropdown
                  query={q}
                  open={focused && q.trim().length >= 1}
                  onSelect={(href, title) => {
                    setFocused(false);
                    if (title) setQ(title);
                    router.push(href);
                  }}
                  onClose={() => setFocused(false)}
                />
              ) : null}
            </form>
          </Reveal>
        </div>
        <Reveal delay={0.1} direction="in" className="order-2 w-full min-w-0">
          <HeroBannerCarousel />
        </Reveal>
      </div>
    </section>
  );
}

function splitHeadline(title: string) {
  const marker = '. ';
  const i = title.indexOf(marker);
  if (i === -1) {
    const to = title.toLowerCase().indexOf(' to ');
    if (to === -1) return [title];
    return [title.slice(0, to + 3).trim(), title.slice(to + 3).trim()];
  }
  return [title.slice(0, i + 1).trim(), title.slice(i + 1).trim()];
}

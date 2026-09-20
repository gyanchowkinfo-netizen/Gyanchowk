'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Briefcase, Loader2, Search, UserRound, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { cn } from '@/lib/format';
import { duration, ease } from '@/lib/motion';
import { POPULAR_SEARCHES } from '@/components/home/content';

const RECENT_KEY = 'gc-recent-searches';

function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return (JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as string[]).slice(0, 6);
  } catch {
    return [];
  }
}

function writeRecent(q: string) {
  const next = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

interface SearchHit {
  courses: Array<{ _id: string; title: string; slug: string }>;
  batches: Array<{ _id: string; name: string; slug: string }>;
  teachers: Array<{ _id: string; name: string }>;
  blogs: Array<{ title: string; slug: string }>;
  career: Array<{ title: string; slug: string }>;
}

function ResultGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BookOpen;
  children: ReactNode;
}) {
  if (!children) return null;
  return (
    <div className="py-2">
      <p className="flex items-center gap-2 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gc-mute">
        <Icon size={13} />
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function SearchTrigger({ className, onClick }: { className?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        'gc-navbar-search group flex h-10 w-full min-w-0 items-center gap-2.5 rounded-full px-3.5 text-left text-sm sm:px-4',
        className,
      )}
      onClick={onClick}
      aria-label="Open search"
      suppressHydrationWarning
    >
      <Search size={16} className="shrink-0 text-[#626860] transition-colors duration-200 group-hover:text-[#26352d]" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-[#626860]">Search courses, exams, teachers...</span>
    </button>
  );
}

export function SearchCommand({
  open: openProp,
  onOpenChange,
  trigger = false,
  className,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @deprecated Prefer SearchTrigger + controlled open */
  trigger?: boolean;
  className?: string;
}) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = openProp ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 350);
  const [data, setData] = useState<SearchHit | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      setData(null);
      setLoading(false);
      return;
    }
    setRecent(readRecent());
    if (debounced.length < 2) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void api<SearchHit>(`/api/catalog/search?q=${encodeURIComponent(debounced)}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [debounced, open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQ('');
  }

  function go(href: string, term?: string) {
    if (term) writeRecent(term);
    else if (q.trim().length >= 2) writeRecent(q.trim());
    close();
    router.push(href);
  }

  const hasQuery = debounced.length >= 2;
  const empty =
    hasQuery &&
    !loading &&
    data &&
    !data.courses.length &&
    !data.teachers.length &&
    !data.career.length;

  return (
    <>
      {trigger ? <SearchTrigger className={className} onClick={() => setOpen(true)} /> : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[max(1rem,12vh)] sm:p-6"
            role="dialog"
            aria-modal
            aria-label="Site search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
          >
            <button type="button" className="absolute inset-0 bg-[color-mix(in_srgb,var(--gyan-text)_35%,transparent)] backdrop-blur-[2px]" aria-label="Close search" onClick={close} />
            <motion.div
              className="relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] border border-gc-line bg-[color:var(--gyan-surface)] shadow-[var(--shadow-lg)]"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: duration.fast, ease: ease.smooth }}
            >
              <div className="flex items-center gap-2 border-b border-gc-line/80 px-4 py-3">
                <Search size={18} className="shrink-0 text-gc-mute" aria-hidden />
                <input
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent py-2 text-base text-gc-black outline-none placeholder:text-gc-mute sm:text-[15px]"
                  placeholder="What are you looking for?"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gc-mute hover:bg-[color:var(--gyan-primary-soft)] hover:text-gc-black"
                  aria-label="Close"
                  onClick={close}
                  suppressHydrationWarning
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[min(52vh,24rem)] overflow-y-auto px-1 py-2 text-sm">
                {!hasQuery ? (
                  <div className="px-3 py-3">
                    <p className="px-1 font-display text-xl text-gc-black">Search Gyan Chowk</p>
                    {recent.length ? (
                      <div className="mt-4">
                        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-gc-mute">Recent</p>
                        <div className="mt-2 space-y-0.5">
                          {recent.map((r) => (
                            <button
                              key={r}
                              type="button"
                              className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-gc-black hover:bg-[color:var(--gyan-primary-soft)]"
                              onClick={() => go(`/courses?q=${encodeURIComponent(r)}`, r)}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-4">
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-gc-mute">Popular searches</p>
                      <div className="mt-2 flex flex-wrap gap-2 px-1">
                        {POPULAR_SEARCHES.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            className="gc-chip h-9 px-3 text-xs"
                            onClick={() => go(p.href, p.label)}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 px-1 text-xs text-gc-mute">Type at least two characters for courses, teachers, or career articles.</p>
                  </div>
                ) : null}
                {loading ? (
                  <p className="flex items-center justify-center gap-2 px-4 py-8 text-gc-mute">
                    <Loader2 size={16} className="animate-spin" />
                    Searching…
                  </p>
                ) : null}
                {empty ? <p className="px-4 py-8 text-center text-gc-mute">No matches for &ldquo;{debounced}&rdquo;.</p> : null}

                {data?.courses.length ? (
                  <ResultGroup title="Courses" icon={BookOpen}>
                    {data.courses.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        className="group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--gyan-primary-soft)]"
                        onClick={() => go(`/courses/${c.slug}`)}
                      >
                        <span className="truncate font-medium text-gc-black">{c.title}</span>
                        <ArrowRight size={14} className="shrink-0 text-gc-mute opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </ResultGroup>
                ) : null}
                {data?.teachers.length ? (
                  <ResultGroup title="Teachers" icon={UserRound}>
                    {data.teachers.map((t) => (
                      <button
                        key={t._id}
                        type="button"
                        className="group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--gyan-primary-soft)]"
                        onClick={() => go(`/teachers/${t._id}`)}
                      >
                        <span className="truncate font-medium text-gc-black">{t.name}</span>
                        <ArrowRight size={14} className="shrink-0 text-gc-mute opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </ResultGroup>
                ) : null}
                {data?.career.length ? (
                  <ResultGroup title="Career" icon={Briefcase}>
                    {data.career.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        className="group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--gyan-primary-soft)]"
                        onClick={() => go(`/career/${c.slug}`)}
                      >
                        <span className="truncate font-medium text-gc-black">{c.title}</span>
                        <ArrowRight size={14} className="shrink-0 text-gc-mute opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </ResultGroup>
                ) : null}
              </div>

              <div className="border-t border-gc-line/80 px-4 py-2.5 text-[11px] text-gc-mute">
                <span className="hidden sm:inline">Navigate with </span>
                <kbd className="rounded border border-gc-line px-1">↵</kbd>
                <span className="mx-1">·</span>
                <kbd className="rounded border border-gc-line px-1">Esc</kbd> close
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

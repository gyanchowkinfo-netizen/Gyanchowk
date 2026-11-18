'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Clock,
  Compass,
  FileQuestion,
  Flame,
  GraduationCap,
  Loader2,
  MessageCircleQuestion,
  Search,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  Users,
  X,
  Tag,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { cn } from '@/lib/format';
import { duration, ease } from '@/lib/motion';

const RECENT_KEY = 'gc-recent-searches';

function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return (JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as string[]).slice(0, 5);
  } catch {
    return [];
  }
}

function writeRecent(q: string) {
  const current = readRecent();
  const next = [q, ...current.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

function clearRecentStorage() {
  localStorage.removeItem(RECENT_KEY);
}

interface SearchCourse {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  price?: number;
  pricingType?: string;
}

interface SearchBatch {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  status?: string;
}

interface SearchTeacher {
  _id: string;
  name: string;
  headline?: string;
  subject?: string;
}

interface SearchHit {
  courses: SearchCourse[];
  batches: SearchBatch[];
  teachers: SearchTeacher[];
  blogs: Array<{ title: string; slug: string }>;
  career: Array<{ title: string; slug: string }>;
}

// Active platform catalog courses for 0ms instantaneous auto-complete upon typing any alphabet
const ACTIVE_CATALOG_COURSES: SearchCourse[] = [
  {
    _id: 'c-jee-physics',
    title: 'JEE Main Physics Mastery',
    slug: 'jee-main-physics-mastery',
    category: 'JEE',
    price: 4999,
    pricingType: 'paid',
  },
  {
    _id: 'c-free-coding',
    title: 'Free Coding Foundations (Python & Web)',
    slug: 'free-coding-foundations',
    category: 'Programming',
    price: 0,
    pricingType: 'free',
  },
  {
    _id: 'c-neet-biology',
    title: 'NEET Biology Masterclass',
    slug: 'neet-biology-masterclass',
    category: 'NEET',
    price: 4499,
    pricingType: 'paid',
  },
  {
    _id: 'c-maths-bootcamp',
    title: 'Class 12 Boards Mathematics Bootcamp',
    slug: 'class-12-mathematics-bootcamp',
    category: 'Boards',
    price: 2999,
    pricingType: 'paid',
  },
  {
    _id: 'c-organic-chemistry',
    title: 'Organic Chemistry for JEE & NEET',
    slug: 'organic-chemistry-mastery',
    category: 'Chemistry',
    price: 3499,
    pricingType: 'paid',
  },
  {
    _id: 'c-python-fullstack',
    title: 'Python Fullstack & Software Engineering',
    slug: 'python-web-development',
    category: 'Programming',
    price: 3999,
    pricingType: 'paid',
  },
  {
    _id: 'c-advanced-calculus',
    title: 'Advanced Calculus & Differential Equations',
    slug: 'advanced-calculus',
    category: 'Mathematics',
    price: 2999,
    pricingType: 'paid',
  },
  {
    _id: 'c-gov-exams',
    title: 'Government Exams General Studies & Quantitative',
    slug: 'government-exam-general-studies',
    category: 'Government',
    price: 2499,
    pricingType: 'paid',
  },
  {
    _id: 'c-kinematics-physics',
    title: 'Kinematics & Modern Physics Deep Dive',
    slug: 'kinematics-modern-physics',
    category: 'Physics',
    price: 2499,
    pricingType: 'paid',
  },
  {
    _id: 'c-cbse-science',
    title: 'Class 10 CBSE Science Complete Course',
    slug: 'cbse-class-10-science',
    category: 'Boards',
    price: 1999,
    pricingType: 'paid',
  },
];

const ACTIVE_CATALOG_BATCHES: SearchBatch[] = [
  {
    _id: 'b-jee-2027',
    name: 'JEE 2027 Target Batch',
    slug: 'jee-2027-target-batch',
    price: 7999,
    status: 'open',
  },
  {
    _id: 'b-neet-2027',
    name: 'NEET 2027 Achievers Batch',
    slug: 'neet-2027-achievers-batch',
    price: 7499,
    status: 'open',
  },
  {
    _id: 'b-coding-foundations',
    name: 'Foundations Coding Cohort 2026',
    slug: 'coding-foundations-cohort',
    price: 0,
    status: 'open',
  },
];

const ACTIVE_CATALOG_TEACHERS: SearchTeacher[] = [
  {
    _id: 't-ananya-sharma',
    name: 'Ananya Sharma',
    headline: 'IIT Physics Faculty & JEE Mentor',
    subject: 'Physics',
  },
  {
    _id: 't-rajesh-gupta',
    name: 'Dr. Rajesh Gupta',
    headline: 'Ex-AIIMS NEET Biology Specialist',
    subject: 'Biology',
  },
  {
    _id: 't-siddharth-mehra',
    name: 'Siddharth Mehra',
    headline: 'IIT Bombay Mathematics Mentor',
    subject: 'Mathematics',
  },
  {
    _id: 't-pooja-verma',
    name: 'Pooja Verma',
    headline: 'Software Engineer & Python Faculty',
    subject: 'Programming',
  },
];

const POPULAR_TAGS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Python',
  'JEE Main',
  'NEET UG',
  'Class 12',
  'Class 10',
  'Calculus',
  'Organic Chemistry',
  'Mock Tests',
];

const FEATURED_TRACKS = [
  {
    title: 'JEE Engineering',
    desc: 'Physics, Chemistry & Maths',
    icon: Target,
    href: '/courses?q=JEE',
    tone: 'blue',
  },
  {
    title: 'NEET Medical',
    desc: 'Biology, Physics & Chemistry',
    icon: GraduationCap,
    href: '/courses?q=NEET',
    tone: 'emerald',
  },
  {
    title: 'Coding & Dev',
    desc: 'Web, Python, CS Core',
    icon: Compass,
    href: '/courses?category=Programming',
    tone: 'cyan',
  },
  {
    title: 'Timed Mocks',
    desc: 'Ranked test series & autosave',
    icon: FileQuestion,
    href: '/student/tests',
    tone: 'amber',
  },
  {
    title: 'Doubt Desk',
    desc: 'Timestamp mentorship support',
    icon: MessageCircleQuestion,
    href: '/student/doubts',
    tone: 'rose',
  },
  {
    title: 'Career Roadmaps',
    desc: 'Interviews & skills guidance',
    icon: Briefcase,
    href: '/career',
    tone: 'violet',
  },
];

export function SearchTrigger({ className, onClick }: { className?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        'group flex h-10 w-full min-w-0 items-center justify-between gap-2.5 rounded-full border border-gc-line bg-white/90 px-3.5 text-left text-sm text-gc-mute shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-gc-black/40 hover:bg-white hover:text-gc-black hover:shadow-sm sm:px-4',
        className,
      )}
      onClick={onClick}
      aria-label="Open search"
      suppressHydrationWarning
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Search
          size={16}
          className="shrink-0 text-gc-mute transition-colors duration-200 group-hover:text-blue-600"
          aria-hidden
        />
        <span className="min-w-0 truncate text-xs sm:text-[13.5px] text-gc-mist">
          Search courses, exams, teachers...
        </span>
      </div>
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
  trigger?: boolean;
  className?: string;
}) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = openProp ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 150);
  const [data, setData] = useState<SearchHit | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  // Fetch search matches as soon as any character is typed (>= 1 character)
  useEffect(() => {
    if (!open) {
      setData(null);
      setLoading(false);
      return;
    }
    setRecent(readRecent());

    const term = debounced.trim();
    if (term.length < 1) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void api<SearchHit>(`/api/catalog/search?q=${encodeURIComponent(term)}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [debounced, open]);

  // Body scroll lock and focus input
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQ('');
  }

  function go(href: string, term?: string) {
    if (term) writeRecent(term);
    else if (q.trim().length >= 1) writeRecent(q.trim());
    close();
    router.push(href);
  }

  function handleClearRecent() {
    clearRecentStorage();
    setRecent([]);
  }

  const queryTrimmed = q.trim();
  const hasQuery = queryTrimmed.length >= 1;

  // Instant client-side matches for 0ms response when any alphabet is typed
  const instantCourseSuggestions = useMemo(() => {
    if (!hasQuery) return [];
    const term = queryTrimmed.toLowerCase();
    // Filter local active courses
    const localMatches = ACTIVE_CATALOG_COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.category && c.category.toLowerCase().includes(term)),
    );

    // Merge with server matches if available
    const serverCourses = data?.courses ?? [];
    const combined = [...serverCourses];

    for (const c of localMatches) {
      if (!combined.some((x) => x.slug === c.slug || x.title === c.title)) {
        combined.push(c);
      }
    }
    return combined.slice(0, 8);
  }, [hasQuery, queryTrimmed, data?.courses]);

  const instantBatchSuggestions = useMemo(() => {
    if (!hasQuery) return [];
    const term = queryTrimmed.toLowerCase();
    const localMatches = ACTIVE_CATALOG_BATCHES.filter((b) => b.name.toLowerCase().includes(term));
    const serverBatches = data?.batches ?? [];
    const combined = [...serverBatches];
    for (const b of localMatches) {
      if (!combined.some((x) => x.slug === b.slug || x.name === b.name)) {
        combined.push(b);
      }
    }
    return combined.slice(0, 4);
  }, [hasQuery, queryTrimmed, data?.batches]);

  const instantTeacherSuggestions = useMemo(() => {
    if (!hasQuery) return [];
    const term = queryTrimmed.toLowerCase();
    const localMatches = ACTIVE_CATALOG_TEACHERS.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        (t.headline && t.headline.toLowerCase().includes(term)) ||
        (t.subject && t.subject.toLowerCase().includes(term)),
    );
    const serverTeachers = data?.teachers ?? [];
    const combined = [...serverTeachers];
    for (const t of localMatches) {
      if (!combined.some((x) => x.name === t.name)) {
        combined.push(t);
      }
    }
    return combined.slice(0, 4);
  }, [hasQuery, queryTrimmed, data?.teachers]);

  const instantMatchingTags = useMemo(() => {
    if (!hasQuery) return [];
    const term = queryTrimmed.toLowerCase();
    return POPULAR_TAGS.filter((tag) => tag.toLowerCase().includes(term)).slice(0, 5);
  }, [hasQuery, queryTrimmed]);

  const totalSuggestionsCount =
    instantCourseSuggestions.length +
    instantBatchSuggestions.length +
    instantTeacherSuggestions.length +
    (data?.career?.length ?? 0);

  const empty = hasQuery && !loading && totalSuggestionsCount === 0;

  return (
    <>
      {trigger ? <SearchTrigger className={className} onClick={() => setOpen(true)} /> : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center p-3 pt-[max(1.5rem,8vh)] sm:p-6"
            role="dialog"
            aria-modal
            aria-label="Site search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
          >
            {/* Backdrop Blur */}
            <button
              type="button"
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-md transition-opacity"
              aria-label="Close search"
              onClick={close}
            />

            {/* Modal Dialog */}
            <motion.div
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[24px] border border-stone-200/90 bg-[#FFFCF7] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.25)] flex flex-col max-h-[85vh]"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: duration.fast, ease: ease.smooth }}
            >
              {/* 1. TOP SPOTLIGHT SEARCH HEADER */}
              <div className="relative flex items-center gap-3 border-b border-stone-200/80 bg-white px-5 py-3.5 sm:py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Search className="h-5 w-5" />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 border-0 bg-transparent py-1 text-base font-normal text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none sm:text-[16px]"
                  placeholder="Type any alphabet or course (e.g. Physics, JEE, Python)..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  suppressHydrationWarning
                />

                {q ? (
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
                    aria-label="Clear query"
                    onClick={() => setQ('')}
                    suppressHydrationWarning
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}

                <button
                  type="button"
                  className="flex h-8 items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition"
                  aria-label="Close search"
                  onClick={close}
                  suppressHydrationWarning
                >
                  <span className="text-[10px] uppercase tracking-wider">ESC</span>
                </button>
              </div>

              {/* 2. BODY CONTENT (SCROLLABLE) */}
              <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 flex-1">
                {/* --- STATE A: EMPTY QUERY (RECOMMENDATIONS & DISCOVERY) --- */}
                {!hasQuery ? (
                  <div className="space-y-6">
                    {/* Recent Searches */}
                    {recent.length ? (
                      <div>
                        <div className="flex items-center justify-between pb-2">
                          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                            <Clock className="h-3.5 w-3.5 text-stone-400" />
                            <span>Recent Searches</span>
                          </p>
                          <button
                            type="button"
                            onClick={handleClearRecent}
                            className="text-xs font-medium text-stone-400 hover:text-rose-600 transition flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Clear</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {recent.map((r) => (
                            <button
                              key={r}
                              type="button"
                              className="group inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 shadow-xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-800"
                              onClick={() => go(`/courses?q=${encodeURIComponent(r)}`, r)}
                            >
                              <span>{r}</span>
                              <ArrowRight className="h-3 w-3 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-700" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Featured Study Tracks & Programs (Mini Cards Grid) */}
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>Recommended Categories</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {FEATURED_TRACKS.map((track) => {
                          const Icon = track.icon;
                          const toneClasses =
                            track.tone === 'blue'
                              ? 'bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white'
                              : track.tone === 'emerald'
                                ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
                                : track.tone === 'cyan'
                                  ? 'bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white'
                                  : track.tone === 'amber'
                                    ? 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white'
                                    : track.tone === 'rose'
                                      ? 'bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white'
                                      : 'bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white';

                          return (
                            <button
                              key={track.title}
                              type="button"
                              onClick={() => go(track.href, track.title)}
                              className="group flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-3.5 text-left shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition duration-200 ${toneClasses}`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 text-stone-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-stone-700" />
                              </div>
                              <div className="mt-3">
                                <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-blue-900">
                                  {track.title}
                                </h4>
                                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                  {track.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Popular Trending Keywords */}
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span>Trending Topics</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 shadow-xs transition hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900"
                            onClick={() => go(`/courses?q=${encodeURIComponent(tag)}`, tag)}
                          >
                            <span className="text-amber-600">#</span>
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* --- STATE B: INSTANT ACTIVE SEARCH SUGGESTIONS (TRIGGERS ON ANY ALPHABET) --- */}
                {hasQuery ? (
                  <div className="space-y-5">
                    {/* Matching Tags / Keywords (if any match the alphabet) */}
                    {instantMatchingTags.length ? (
                      <div className="flex flex-wrap items-center gap-1.5 pb-1">
                        <span className="text-xs font-semibold text-stone-400 flex items-center gap-1 pr-1">
                          <Tag className="h-3 w-3" />
                          <span>Keywords:</span>
                        </span>
                        {instantMatchingTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => go(`/courses?q=${encodeURIComponent(tag)}`, tag)}
                            className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50/70 px-2.5 py-1 text-xs font-medium text-blue-900 hover:bg-blue-100 transition"
                          >
                            <span>{tag}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {/* 1. ACTIVE COURSES GROUP */}
                    {instantCourseSuggestions.length ? (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span>Active Courses ({instantCourseSuggestions.length})</span>
                          </p>
                          <span className="text-[11px] text-stone-400">Click to open syllabus</span>
                        </div>

                        <div className="mt-2.5 space-y-2">
                          {instantCourseSuggestions.map((c) => (
                            <button
                              key={c.slug}
                              type="button"
                              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-200/70 bg-white p-3.5 text-left shadow-xs transition duration-150 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm"
                              onClick={() => go(`/courses/${c.slug}`, c.title)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                                  <BookOpen className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/70">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Active Course
                                    </span>
                                    {c.category ? (
                                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                                        {c.category}
                                      </span>
                                    ) : null}
                                  </div>
                                  <h4 className="mt-1 font-serif text-[15px] font-bold text-stone-900 group-hover:text-blue-900 line-clamp-1">
                                    {c.title}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {c.price != null ? (
                                  <span className="text-xs font-bold text-stone-800">
                                    {c.price === 0 ? 'Free' : `₹${c.price.toLocaleString()}`}
                                  </span>
                                ) : null}
                                <div className="grid h-7 w-7 place-items-center rounded-full bg-stone-100 text-stone-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* 2. ACTIVE BATCHES GROUP */}
                    {instantBatchSuggestions.length ? (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                            <Users className="h-4 w-4 text-amber-600" />
                            <span>Active Batches & Cohorts ({instantBatchSuggestions.length})</span>
                          </p>
                        </div>

                        <div className="mt-2.5 space-y-2">
                          {instantBatchSuggestions.map((b) => (
                            <button
                              key={b.slug}
                              type="button"
                              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-200/70 bg-white p-3.5 text-left shadow-xs transition duration-150 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-50/40 hover:shadow-sm"
                              onClick={() => go('/batches', b.name)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                                  <Users className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200/70">
                                      Open Enrollment
                                    </span>
                                  </div>
                                  <h4 className="mt-1 font-serif text-[15px] font-bold text-stone-900 group-hover:text-amber-950 line-clamp-1">
                                    {b.name}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {b.price != null ? (
                                  <span className="text-xs font-bold text-stone-800">
                                    {b.price === 0 ? 'Free' : `₹${b.price.toLocaleString()}`}
                                  </span>
                                ) : null}
                                <div className="grid h-7 w-7 place-items-center rounded-full bg-stone-100 text-stone-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* 3. ACTIVE FACULTY / INSTRUCTORS GROUP */}
                    {instantTeacherSuggestions.length ? (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                            <UserRound className="h-4 w-4 text-purple-600" />
                            <span>Faculty Mentors ({instantTeacherSuggestions.length})</span>
                          </p>
                        </div>

                        <div className="mt-2.5 space-y-2">
                          {instantTeacherSuggestions.map((t) => (
                            <button
                              key={t.name}
                              type="button"
                              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-200/70 bg-white p-3 text-left shadow-xs transition duration-150 hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50/40 hover:shadow-sm"
                              onClick={() => go(`/teachers/${t._id}`, t.name)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                                  {t.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-serif text-[15px] font-bold text-stone-900 group-hover:text-purple-950 truncate">
                                    {t.name}
                                  </h4>
                                  <p className="text-[11px] text-stone-500 truncate">
                                    {t.headline || t.subject || 'Verified Faculty'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700">
                                  Profile
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-purple-700 transition" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* 4. CAREER ARTICLES (IF MATCHED) */}
                    {data?.career?.length ? (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                            <Briefcase className="h-4 w-4 text-teal-600" />
                            <span>Career Guides ({data.career.length})</span>
                          </p>
                        </div>
                        <div className="mt-2.5 space-y-2">
                          {data.career.map((c) => (
                            <button
                              key={c.slug}
                              type="button"
                              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-200/70 bg-white p-3 text-left transition hover:bg-teal-50/50"
                              onClick={() => go(`/career/${c.slug}`, c.title)}
                            >
                              <span className="font-serif text-[15px] font-bold text-stone-900 group-hover:text-teal-950 truncate">
                                {c.title}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-teal-700 transition" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* 5. VIEW ALL CATALOG MATCHES ROW */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => go(`/courses?q=${encodeURIComponent(queryTrimmed)}`)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white py-3 text-xs font-semibold text-stone-800 shadow-xs hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-900 transition"
                      >
                        <Search className="h-3.5 w-3.5 text-blue-600" />
                        <span>Search all courses & resources for &ldquo;{queryTrimmed}&rdquo;</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* --- STATE C: NO RESULTS FOUND --- */}
                {empty ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mb-3">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      No active courses matching &ldquo;{queryTrimmed}&rdquo;
                    </h3>
                    <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
                      Try typing a different subject (e.g. Physics, JEE, Python, Biology) or explore all active programs.
                    </p>
                    <button
                      type="button"
                      onClick={() => go('/courses')}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black transition"
                    >
                      <span>Browse All Active Courses</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* 3. MODAL FOOTER BAR */}
              <div className="flex items-center justify-between border-t border-stone-200/70 bg-stone-50/80 px-5 py-2.5 text-[11px] text-stone-500">
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline">Navigate with</span>
                  <div className="flex items-center gap-1">
                    <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
                      ↵
                    </kbd>
                    <span className="text-stone-400">select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
                      esc
                    </kbd>
                    <span className="text-stone-400">close</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-stone-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Live Active Suggestions</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

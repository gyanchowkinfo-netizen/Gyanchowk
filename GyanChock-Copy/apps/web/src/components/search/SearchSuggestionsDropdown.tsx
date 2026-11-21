'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Layers, Users, Search, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { formatInr } from '@/lib/format';

export interface SearchCourseItem {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  price?: number;
  pricingType?: string;
}

export interface SearchBatchItem {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  status?: string;
}

export interface SearchTeacherItem {
  _id: string;
  name: string;
  headline?: string;
  subject?: string;
}

export const CATALOG_COURSES: SearchCourseItem[] = [
  { _id: 'c-jee-physics', title: 'JEE Main Physics Mastery', slug: 'jee-main-physics-mastery', category: 'JEE', price: 4999, pricingType: 'paid' },
  { _id: 'c-free-coding', title: 'Free Coding Foundations (Python & Web)', slug: 'free-coding-foundations', category: 'Programming', price: 0, pricingType: 'free' },
  { _id: 'c-neet-biology', title: 'NEET Biology Masterclass', slug: 'neet-biology-masterclass', category: 'NEET', price: 4499, pricingType: 'paid' },
  { _id: 'c-maths-bootcamp', title: 'Class 12 Boards Mathematics Bootcamp', slug: 'class-12-mathematics-bootcamp', category: 'Boards', price: 2999, pricingType: 'paid' },
  { _id: 'c-organic-chemistry', title: 'Organic Chemistry for JEE & NEET', slug: 'organic-chemistry-mastery', category: 'Chemistry', price: 3499, pricingType: 'paid' },
  { _id: 'c-python-fullstack', title: 'Python Fullstack & Software Engineering', slug: 'python-web-development', category: 'Programming', price: 3999, pricingType: 'paid' },
  { _id: 'c-advanced-calculus', title: 'Advanced Calculus & Differential Equations', slug: 'advanced-calculus', category: 'Mathematics', price: 2999, pricingType: 'paid' },
  { _id: 'c-gov-exams', title: 'Government Exams General Studies & Quantitative', slug: 'government-exam-general-studies', category: 'Government', price: 2499, pricingType: 'paid' },
  { _id: 'c-kinematics-physics', title: 'Kinematics & Modern Physics Deep Dive', slug: 'kinematics-modern-physics', category: 'Physics', price: 2499, pricingType: 'paid' },
  { _id: 'c-cbse-science', title: 'Class 10 CBSE Science Complete Course', slug: 'cbse-class-10-science', category: 'Boards', price: 1999, pricingType: 'paid' },
];

export const CATALOG_BATCHES: SearchBatchItem[] = [
  { _id: 'b-jee-2027', name: 'JEE 2027 Target Batch', slug: 'jee-2027-target-batch', price: 7999, status: 'open' },
  { _id: 'b-neet-2027', name: 'NEET 2027 Achievers Batch', slug: 'neet-2027-achievers-batch', price: 7499, status: 'open' },
  { _id: 'b-coding-foundations', name: 'Foundations Coding Cohort 2026', slug: 'coding-foundations-cohort', price: 0, status: 'open' },
];

export const CATALOG_TEACHERS: SearchTeacherItem[] = [
  { _id: 't-ananya-sharma', name: 'Ananya Sharma', headline: 'IIT Physics Faculty & JEE Mentor', subject: 'Physics' },
  { _id: 't-rajesh-gupta', name: 'Dr. Rajesh Gupta', headline: 'Ex-AIIMS NEET Biology Specialist', subject: 'Biology' },
  { _id: 't-siddharth-mehra', name: 'Siddharth Mehra', headline: 'IIT Bombay Mathematics Mentor', subject: 'Mathematics' },
  { _id: 't-pooja-verma', name: 'Pooja Verma', headline: 'Software Engineer & Python Faculty', subject: 'Programming' },
];

export interface SearchSuggestionsDropdownProps {
  query: string;
  open: boolean;
  onSelect?: (href: string, title?: string) => void;
  onClose?: () => void;
  filterType?: 'all' | 'courses' | 'batches' | 'teachers';
  className?: string;
}

export function SearchSuggestionsDropdown({
  query,
  open,
  onSelect,
  onClose,
  filterType = 'all',
  className = '',
}: SearchSuggestionsDropdownProps) {
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 120);
  const [remoteData, setRemoteData] = useState<{
    courses?: SearchCourseItem[];
    batches?: SearchBatchItem[];
    teachers?: SearchTeacherItem[];
  } | null>(null);

  const cleanQuery = query.trim();
  const cleanDebounced = debouncedQuery.trim();

  // Fetch server suggestions for any typed character (alphabet or number)
  useEffect(() => {
    if (!open || cleanDebounced.length < 1) {
      setRemoteData(null);
      return;
    }

    let active = true;
    api<{
      courses?: SearchCourseItem[];
      batches?: SearchBatchItem[];
      teachers?: SearchTeacherItem[];
    }>(`/api/catalog/search?q=${encodeURIComponent(cleanDebounced)}`)
      .then((res) => {
        if (active) setRemoteData(res);
      })
      .catch(() => {
        if (active) setRemoteData(null);
      });

    return () => {
      active = false;
    };
  }, [cleanDebounced, open]);

  // Combined instant 0ms suggestions + remote data
  const matchedCourses = useMemo(() => {
    if (cleanQuery.length < 1 || filterType === 'batches' || filterType === 'teachers') return [];
    const term = cleanQuery.toLowerCase();
    const local = CATALOG_COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.category && c.category.toLowerCase().includes(term)),
    );
    const remote = remoteData?.courses ?? [];
    const combined = [...remote];
    for (const item of local) {
      if (!combined.some((x) => x.slug === item.slug || x.title.toLowerCase() === item.title.toLowerCase())) {
        combined.push(item);
      }
    }
    return combined.slice(0, 5);
  }, [cleanQuery, filterType, remoteData?.courses]);

  const matchedBatches = useMemo(() => {
    if (cleanQuery.length < 1 || filterType === 'courses' || filterType === 'teachers') return [];
    const term = cleanQuery.toLowerCase();
    const local = CATALOG_BATCHES.filter((b) => b.name.toLowerCase().includes(term));
    const remote = remoteData?.batches ?? [];
    const combined = [...remote];
    for (const item of local) {
      if (!combined.some((x) => x.slug === item.slug || x.name.toLowerCase() === item.name.toLowerCase())) {
        combined.push(item);
      }
    }
    return combined.slice(0, 3);
  }, [cleanQuery, filterType, remoteData?.batches]);

  const matchedTeachers = useMemo(() => {
    if (cleanQuery.length < 1 || filterType === 'courses' || filterType === 'batches') return [];
    const term = cleanQuery.toLowerCase();
    const local = CATALOG_TEACHERS.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        (t.headline && t.headline.toLowerCase().includes(term)) ||
        (t.subject && t.subject.toLowerCase().includes(term)),
    );
    const remote = remoteData?.teachers ?? [];
    const combined = [...remote];
    for (const item of local) {
      if (!combined.some((x) => x.name.toLowerCase() === item.name.toLowerCase())) {
        combined.push(item);
      }
    }
    return combined.slice(0, 3);
  }, [cleanQuery, filterType, remoteData?.teachers]);

  const totalMatches = matchedCourses.length + matchedBatches.length + matchedTeachers.length;

  if (!open || cleanQuery.length < 1) {
    return null;
  }

  const handleItemClick = (href: string, title?: string) => {
    if (onSelect) {
      onSelect(href, title);
    } else {
      router.push(href);
      if (onClose) onClose();
    }
  };

  return (
    <div
      className={`absolute left-0 right-0 top-full mt-2 z-[100] rounded-2xl border border-stone-200/90 bg-white p-2.5 shadow-2xl backdrop-blur-lg transition-all animate-in fade-in-50 slide-in-from-top-1 text-left ${className}`}
      onMouseDown={(e) => {
        // Prevent input blur before click finishes
        e.preventDefault();
      }}
    >
      <div className="max-h-[22rem] overflow-y-auto space-y-3 pr-1 text-slate-800">
        {/* COURSES */}
        {matchedCourses.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <BookOpen size={12} className="text-amber-600" />
              <span>Courses ({matchedCourses.length})</span>
            </div>
            <div className="mt-1 space-y-1">
              {matchedCourses.map((c) => (
                <button
                  key={c.slug || c._id}
                  type="button"
                  onClick={() => handleItemClick(`/courses/${c.slug}`, c.title)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-amber-50/60 transition group cursor-pointer border border-transparent hover:border-amber-200/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-900 group-hover:text-amber-950 truncate">
                      {c.title}
                    </div>
                    {c.category && (
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                        {c.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      {c.pricingType === 'free' || c.price === 0 ? 'Free' : formatInr(c.price ?? 0)}
                    </span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BATCHES */}
        {matchedBatches.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Layers size={12} className="text-blue-600" />
              <span>Batches ({matchedBatches.length})</span>
            </div>
            <div className="mt-1 space-y-1">
              {matchedBatches.map((b) => (
                <button
                  key={b.slug || b._id}
                  type="button"
                  onClick={() => handleItemClick(`/batches#all-batches`, b.name)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-blue-50/60 transition group cursor-pointer border border-transparent hover:border-blue-200/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-900 group-hover:text-blue-950 truncate">
                      {b.name}
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                      {b.status || 'Enrollment Open'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      {b.price ? formatInr(b.price) : 'Enrolling'}
                    </span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TEACHERS */}
        {matchedTeachers.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Users size={12} className="text-purple-600" />
              <span>Teachers ({matchedTeachers.length})</span>
            </div>
            <div className="mt-1 space-y-1">
              {matchedTeachers.map((t) => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => handleItemClick(`/teachers/${t._id}`, t.name)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-purple-50/60 transition group cursor-pointer border border-transparent hover:border-purple-200/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-[13px] font-semibold text-slate-900 group-hover:text-purple-950 truncate">
                        {t.name}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {t.headline || t.subject || 'Faculty'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-purple-600">
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NO DIRECT MATCHES */}
        {totalMatches === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-slate-600 font-medium">
              No direct matches for &ldquo;{cleanQuery}&rdquo;
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Press Enter or click below to search the full catalog
            </p>
          </div>
        )}

        {/* BOTTOM SEARCH ALL ROW */}
        <div className="pt-1.5 border-t border-stone-200/70">
          <button
            type="button"
            onClick={() => handleItemClick(`/courses?q=${encodeURIComponent(cleanQuery)}`, cleanQuery)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-amber-50/80 px-3 py-2 text-xs font-semibold text-slate-800 hover:text-amber-900 transition border border-stone-200/60"
          >
            <Search size={13} className="text-amber-600" />
            <span>Search all for &ldquo;{cleanQuery}&rdquo;</span>
            <ArrowRight size={13} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

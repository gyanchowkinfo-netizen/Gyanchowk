'use client';

import { useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  Globe,
  Tag,
  Star,
  FolderOpen,
  Check,
} from 'lucide-react';
import type { CourseFiltersState } from './CourseCatalogToolbar';

type Meta = {
  categories: string[];
  subjects: string[];
  exams: string[];
  classes: string[];
  languages: string[];
};

export function MarketplaceFilterFields({
  filters,
  meta,
  onChange,
  onApply,
  onClear,
}: {
  filters: CourseFiltersState;
  meta: Meta | undefined;
  onChange: (patch: Partial<CourseFiltersState>) => void;
  onApply?: () => void;
  onClear: () => void;
}) {
  const [priceMax, setPriceMax] = useState<number>(200);

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Category</label>
        <div className="relative">
          <FolderOpen
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            suppressHydrationWarning
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs font-medium text-slate-800 transition hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {(meta?.categories ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Subject</label>
        <div className="relative">
          <BookOpen
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            suppressHydrationWarning
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs font-medium text-slate-800 transition hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            value={filters.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
          >
            <option value="">All subjects</option>
            {(meta?.subjects ?? []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Exam */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Exam</label>
        <div className="relative">
          <Award
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            suppressHydrationWarning
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs font-medium text-slate-800 transition hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            value={filters.exam}
            onChange={(e) => onChange({ exam: e.target.value })}
          >
            <option value="">All exams</option>
            {(meta?.exams ?? []).map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Class */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Class</label>
        <div className="relative">
          <Layers
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            suppressHydrationWarning
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs font-medium text-slate-800 transition hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            value={filters.class}
            onChange={(e) => onChange({ class: e.target.value })}
          >
            <option value="">All classes</option>
            {(meta?.classes ?? []).map((cl) => (
              <option key={cl} value={cl}>
                Class {cl}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Language</label>
        <div className="relative">
          <Globe
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            suppressHydrationWarning
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs font-medium text-slate-800 transition hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            value={filters.language}
            onChange={(e) => onChange({ language: e.target.value })}
          >
            <option value="">All languages</option>
            {(meta?.languages ?? []).map((l) => (
              <option key={l} value={l}>
                {l === 'en' || l.toLowerCase() === 'english'
                  ? 'English'
                  : l === 'hi' || l.toLowerCase() === 'hindi'
                    ? 'Hindi'
                    : l.toLowerCase() === 'hinglish'
                      ? 'Hinglish'
                      : l}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Price</label>
        <div className="relative">
          <Tag
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            suppressHydrationWarning
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs font-medium text-slate-800 transition hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            value={filters.pricing}
            onChange={(e) => onChange({ pricing: e.target.value })}
          >
            <option value="">Any price</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Rating</label>
        <div className="relative">
          <Star
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            suppressHydrationWarning
            className="w-full appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs font-medium text-slate-800 transition hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            value={filters.minRating}
            onChange={(e) => onChange({ minRating: e.target.value })}
          >
            <option value="">Any rating</option>
            <option value="4">4.0 &amp; above</option>
            <option value="3">3.0 &amp; above</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="pt-2">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Price Range</span>
        </div>
        <div className="relative flex items-center">
          <input
            suppressHydrationWarning
            type="range"
            min="0"
            max="200"
            step="10"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-amber-400/80 accent-amber-500"
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>₹0</span>
          <span suppressHydrationWarning>₹{priceMax >= 200 ? '20,000+' : (priceMax * 100).toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-slate-100">
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => {
            if (onApply) onApply();
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <Check size={14} />
          <span>Apply Filters</span>
        </button>

        <button
          suppressHydrationWarning
          type="button"
          onClick={onClear}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw size={13} />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
}

export function MarketplaceFilterSidebar({
  filters,
  meta,
  onChange,
  onClear,
}: {
  filters: CourseFiltersState;
  meta: Meta | undefined;
  onChange: (patch: Partial<CourseFiltersState>) => void;
  onClear: () => void;
}) {
  return (
    <aside className="hidden lg:block w-[260px] shrink-0">
      <div className="sticky top-24 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Filter Courses</h3>
          </div>
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-slate-400 hover:text-slate-700 transition"
          >
            Reset
          </button>
        </div>

        <MarketplaceFilterFields
          filters={filters}
          meta={meta}
          onChange={onChange}
          onClear={onClear}
        />
      </div>
    </aside>
  );
}

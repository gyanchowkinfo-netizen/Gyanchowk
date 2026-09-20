'use client';

import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Drawer } from '@/components/ui/Overlay';
import { Select } from '@/components/ui/Input';

export type CourseFiltersState = {
  category: string;
  subject: string;
  exam: string;
  class: string;
  language: string;
  pricing: string;
  minRating: string;
  sort: string;
};

type Meta = {
  categories: string[];
  subjects: string[];
  exams: string[];
  classes: string[];
  languages: string[];
};

export function CourseFilterFields({
  idPrefix,
  filters,
  meta,
  onChange,
}: {
  idPrefix: string;
  filters: CourseFiltersState;
  meta: Meta | undefined;
  onChange: (patch: Partial<CourseFiltersState>) => void;
}) {
  return (
    <div className="grid gap-4">
      <Select id={`${idPrefix}-cat`} label="Category" value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
        <option value="">All categories</option>
        {(meta?.categories ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select id={`${idPrefix}-sub`} label="Subject" value={filters.subject} onChange={(e) => onChange({ subject: e.target.value })}>
        <option value="">All subjects</option>
        {(meta?.subjects ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select id={`${idPrefix}-exam`} label="Exam" value={filters.exam} onChange={(e) => onChange({ exam: e.target.value })}>
        <option value="">All exams</option>
        {(meta?.exams ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select id={`${idPrefix}-class`} label="Class" value={filters.class} onChange={(e) => onChange({ class: e.target.value })}>
        <option value="">All classes</option>
        {(meta?.classes ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select id={`${idPrefix}-lang`} label="Language" value={filters.language} onChange={(e) => onChange({ language: e.target.value })}>
        <option value="">All languages</option>
        {(meta?.languages ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select id={`${idPrefix}-price`} label="Price" value={filters.pricing} onChange={(e) => onChange({ pricing: e.target.value })}>
        <option value="">Any price</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </Select>
      <Select id={`${idPrefix}-rating`} label="Rating" value={filters.minRating} onChange={(e) => onChange({ minRating: e.target.value })}>
        <option value="">Any rating</option>
        <option value="4">4+</option>
        <option value="3">3+</option>
      </Select>
    </div>
  );
}

export function CourseCatalogToolbar({
  query,
  onQuery,
  filters,
  meta,
  drawer,
  onDrawer,
  onChange,
  onClearFilters,
  resultCount,
}: {
  query: string;
  onQuery: (v: string) => void;
  filters: CourseFiltersState;
  meta: Meta | undefined;
  drawer: boolean;
  onDrawer: (open: boolean) => void;
  onChange: (patch: Partial<CourseFiltersState>) => void;
  onClearFilters: () => void;
  resultCount?: number;
}) {
  const chips = [
    filters.category && { key: 'category' as const, label: filters.category },
    filters.subject && { key: 'subject' as const, label: filters.subject },
    filters.exam && { key: 'exam' as const, label: filters.exam },
    filters.class && { key: 'class' as const, label: `Class ${filters.class}` },
    filters.language && { key: 'language' as const, label: filters.language },
    filters.pricing && { key: 'pricing' as const, label: filters.pricing === 'free' ? 'Free' : 'Paid' },
    filters.minRating && { key: 'minRating' as const, label: `${filters.minRating}+ stars` },
  ].filter(Boolean) as Array<{ key: keyof CourseFiltersState; label: string }>;

  return (
    <>
      <section id="course-catalog" className="sticky top-14 z-30 border-b border-gc-line/70 bg-[color:var(--gyan-background)]/90 backdrop-blur-xl sm:top-16">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="gc-card flex flex-col gap-3 p-3 md:flex-row md:items-center md:p-4">
            <label className="relative min-w-0 flex-1 md:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gc-mute" size={16} aria-hidden />
              <input
                className="gc-input h-10 py-2 pl-10 text-sm"
                placeholder="Filter in catalogue…"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                aria-label="Filter courses"
                suppressHydrationWarning
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                label="Sort"
                value={filters.sort}
                onChange={(e) => onChange({ sort: e.target.value })}
                className="h-10 min-w-[9rem] flex-1 space-y-0 sm:flex-none [&_span]:sr-only"
              >
                <option value="new">Newest</option>
                <option value="rating">Top rated</option>
                <option value="price">Price</option>
              </Select>
              <button
                type="button"
                className="gc-btn-outline h-10 gap-2 px-4 lg:hidden"
                onClick={() => onDrawer(true)}
                suppressHydrationWarning
              >
                <SlidersHorizontal size={16} />
                Refine
              </button>
              {resultCount != null ? (
                <span className="hidden text-sm text-gc-mute md:inline">{resultCount} result{resultCount === 1 ? '' : 's'}</span>
              ) : null}
            </div>
          </div>
          {chips.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="gc-chip h-9 px-3 text-xs"
                  onClick={() => onChange({ [c.key]: '' })}
                  suppressHydrationWarning
                >
                  {c.label}
                  <span className="ml-1 opacity-50">×</span>
                </button>
              ))}
              <button
                type="button"
                className="text-xs text-gc-mute underline-offset-2 hover:underline"
                onClick={onClearFilters}
                suppressHydrationWarning
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <Drawer open={drawer} title="Refine catalogue" onClose={() => onDrawer(false)}>
        <CourseFilterFields idPrefix="drawer" filters={filters} meta={meta} onChange={onChange} />
        <button type="button" className="gc-btn-primary mt-6 w-full" onClick={() => onDrawer(false)} suppressHydrationWarning>
          Show results
        </button>
      </Drawer>
    </>
  );
}

export function CourseCatalogSidebar({
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
    <aside className="hidden lg:block">
      <div className="gc-card sticky top-36 p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-medium text-gc-black">
            <Filter size={15} className="text-gc-mute" />
            Refine
          </p>
          <button
            type="button"
            className="text-xs text-gc-mute hover:text-gc-black"
            onClick={onClear}
            suppressHydrationWarning
          >
            Reset
          </button>
        </div>
        <CourseFilterFields idPrefix="sidebar" filters={filters} meta={meta} onChange={onChange} />
      </div>
    </aside>
  );
}

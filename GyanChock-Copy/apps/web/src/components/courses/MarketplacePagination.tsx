'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MarketplacePagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;

  // Build page numbers with ellipsis like in reference: 1 2 3 4 5 ... 10
  const getPageNumbers = () => {
    const list: (number | string)[] = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) list.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) list.push(i);
        list.push('...');
        list.push(pages);
      } else if (page >= pages - 3) {
        list.push(1);
        list.push('...');
        for (let i = pages - 4; i <= pages; i++) list.push(i);
      } else {
        list.push(1);
        list.push('...');
        list.push(page - 1);
        list.push(page);
        list.push(page + 1);
        list.push('...');
        list.push(pages);
      }
    }
    return list;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Course pagination">
      {/* Previous */}
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Pages */}
      {pageNumbers.map((p, idx) => {
        if (typeof p === 'string') {
          return (
            <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
              …
            </span>
          );
        }

        const isCurrent = p === page;

        return (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold transition ${
              isCurrent
                ? 'bg-slate-900 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {p}
          </button>
        );
      })}

      {/* Next */}
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

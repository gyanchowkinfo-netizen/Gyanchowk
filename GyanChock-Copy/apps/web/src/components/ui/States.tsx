'use client';

import { Inbox, TriangleAlert } from 'lucide-react';
import { Button } from './Button';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="space-y-3 py-4" role="status" aria-live="polite" aria-label={label}>
      <div className="h-4 w-40 animate-pulse rounded bg-[color:var(--gyan-primary-soft)]" />
      <div className="h-24 animate-pulse rounded-[16px] bg-[color:var(--gyan-primary-soft)]" />
      <div className="h-24 animate-pulse rounded-[16px] bg-[color:var(--gyan-primary-soft)]" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function SkeletonCard() {
  return <div className="h-64 animate-pulse rounded-[16px] border border-gc-line bg-[color:var(--gyan-primary-soft)]" />;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: { href?: string; label: string; onClick?: () => void };
}) {
  return (
    <div className="gc-card px-6 py-14 text-center">
      <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--gyan-primary-soft)] text-gc-blue">
        <Inbox size={20} aria-hidden />
      </span>
      <h2 className="font-display text-xl text-gc-black">{title}</h2>
      {body ? <p className="mx-auto mt-2 max-w-md text-sm text-gc-mute">{body}</p> : null}
      {action?.href ? (
        <a href={action.href} className="gc-btn-primary mt-5 inline-flex">
          {action.label}
        </a>
      ) : action?.onClick ? (
        <Button className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="gc-card p-8 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--gyan-error-soft)] text-[color:var(--gyan-error)]">
        <TriangleAlert size={20} aria-hidden />
      </span>
      <p className="text-sm text-[color:var(--gyan-error)]">{message}</p>
      {onRetry ? (
        <Button variant="ghost" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-8 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center" aria-label="Pagination">
      <Button variant="ghost" className="w-full sm:w-auto" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span className="text-center text-sm text-gc-mute">
        {page} / {pages}
      </span>
      <Button variant="ghost" className="w-full sm:w-auto" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </nav>
  );
}

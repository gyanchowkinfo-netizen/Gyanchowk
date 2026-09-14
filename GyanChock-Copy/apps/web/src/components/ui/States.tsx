'use client';

import { Button } from './Button';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <p className="py-10 text-center text-sm text-gc-mute">{label}</p>;
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
    <div className="gc-card px-6 py-12 text-center">
      <h2 className="font-display text-xl text-gc-black">{title}</h2>
      {body ? <p className="mt-2 text-sm text-gc-mute">{body}</p> : null}
      {action?.href ? (
        <a href={action.href} className="gc-btn-gold mt-5 inline-flex">
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
    <div className="gc-card p-6 text-center">
      <p className="text-red-300">{message}</p>
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
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-gc-mute">
        {page} / {pages}
      </span>
      <Button variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </nav>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState, EmptyState, ErrorState, Pagination } from './States';
import { DataTable, statusCell } from './DataTable';
import { useState } from 'react';
import { Input } from './Input';
import { useDebounce } from '@/lib/hooks';

function extractItems(data: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items as Record<string, unknown>[];
  const tx = data.transactions as { items?: Record<string, unknown>[] } | undefined;
  if (Array.isArray(tx?.items)) return tx.items;
  return [];
}

export function EntityList({
  title,
  path,
  columns,
  empty,
}: {
  title: string;
  path: string;
  columns?: Array<{ key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode }>;
  empty?: string;
}) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 400);
  const sep = path.includes('?') ? '&' : '?';
  const url = `${path}${sep}page=${page}&limit=20&q=${encodeURIComponent(dq)}`;
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [url],
    queryFn: () => api<{ items?: Record<string, unknown>[]; total?: number; pages?: number } & Record<string, unknown>>(url),
  });
  const items = extractItems(data as Record<string, unknown> | undefined);
  const cols =
    columns ??
    (items[0]
      ? Object.keys(items[0])
          .filter((k) => !['_id', '__v', 'passwordHash'].includes(k))
          .slice(0, 5)
          .map((key) => ({
            key,
            label: key,
            render: key === 'status' ? (row: Record<string, unknown>) => statusCell(row.status) : undefined,
          }))
      : [{ key: 'title', label: 'Title' }]);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl text-gc-black">{title}</h1>
        <Input aria-label="Search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      {!isLoading && !error && items.length === 0 ? (
        <EmptyState title={empty ?? 'Nothing here yet'} body="When data is available it will appear here." />
      ) : null}
      {items.length > 0 ? <DataTable columns={cols} rows={items} /> : null}
      <Pagination page={page} pages={data?.pages ?? 1} onPage={setPage} />
    </section>
  );
}

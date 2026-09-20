'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatPaise, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/panel/ResourceManager';

export default function AdminReportsPage() {
  const [view, setView] = useState('revenue');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const qs = `view=${view}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-reports', qs],
    queryFn: () => api<{ items: Array<Record<string, unknown>>; view: string }>(`/api/admin/reports?${qs}`),
  });

  function onFilter(e: FormEvent) {
    e.preventDefault();
    void refetch();
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Student, teacher, and revenue views with CSV export." />
      <form onSubmit={onFilter} className="mb-6 grid gap-3 md:grid-cols-4">
        <Select label="View" value={view} onChange={(e) => setView(e.target.value)}>
          <option value="revenue">Revenue</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
        </Select>
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="flex items-end gap-2">
          <Button type="submit">Apply</Button>
          <a className="gc-btn-ghost" href={`/api/admin/reports?${qs}&csv=1`}>
            CSV
          </a>
        </div>
      </form>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="space-y-2">
        {(data?.items ?? []).map((row, i) => (
          <li key={String(row._id ?? i)} className="gc-card flex flex-wrap justify-between gap-2 p-3 text-sm">
            <span>{String(row.name ?? row.invoiceNumber ?? row.email ?? 'Row')}</span>
            <span className="text-gc-mute">
              {row.amountPaise != null ? formatPaise(Number(row.amountPaise)) : String(row.status ?? row.teacherStatus ?? '')}{' '}
              {formatDate(typeof row.createdAt === 'string' ? row.createdAt : undefined)}
            </span>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No rows in this range" /> : null}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState, Pagination } from '@/components/ui/States';
import { toast } from '@/lib/toast';

const TYPES = [
  'pdf_notes',
  'class_notes',
  'revision_notes',
  'formula_sheet',
  'question_bank',
  'assignment',
  'reference',
  'ebook',
  'pyq',
  'sample_paper',
];

export default function MaterialsPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounce(q, 400);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['materials', dq, type, page],
    queryFn: () =>
      api<{
        items: Array<{ _id: string; title: string; type?: string; mime?: string }>;
        pages: number;
      }>(`/api/learning/materials?page=${page}&q=${encodeURIComponent(dq)}&type=${encodeURIComponent(type)}`),
  });

  async function download(id: string) {
    try {
      const res = await api<{ url: string }>(`/api/learning/materials/${id}/download`);
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download unavailable. Cloudinary must be configured.');
    }
  }

  async function bookmark(id: string) {
    try {
      await api(`/api/learning/materials/${id}/bookmark`, { method: 'POST' });
      toast.success('Bookmarked');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not bookmark');
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Study materials</h1>
      <div className="mt-4 flex flex-wrap gap-3">
        <Input value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Search" className="max-w-xs" aria-label="Search materials" />
        <Select value={type} onChange={(e) => { setPage(1); setType(e.target.value); }} className="max-w-[200px]">
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace('_', ' ')}
            </option>
          ))}
        </Select>
      </div>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(data?.items ?? []).map((m) => (
          <article key={m._id} className="gc-card p-5">
            <p className="text-xs uppercase text-gc-glow">{m.type}</p>
            <h2 className="mt-1 font-display text-lg">{m.title}</h2>
            <div className="mt-3 flex gap-2">
              <Button variant="gold" type="button" onClick={() => void download(m._id)}>
                Download
              </Button>
              <Button variant="ghost" type="button" onClick={() => void bookmark(m._id)}>
                Bookmark
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No materials" body="Published notes, PYQs and PDFs from your courses appear here." /> : null}
      <Pagination page={page} pages={data?.pages ?? 1} onPage={setPage} />
    </div>
  );
}

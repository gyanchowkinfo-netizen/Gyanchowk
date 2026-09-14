'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { StaggerContainer, StaggerItem } from '@/components/motion';

export default function StudentDoubtsPage() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useQuery({
    queryKey: ['doubts', status],
    queryFn: () =>
      api<{ items: Array<{ _id: string; title: string; status: string; createdAt?: string }> }>(
        `/api/doubts${status ? `?status=${status}` : ''}`,
      ),
  });

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/doubts', {
        method: 'POST',
        body: JSON.stringify({ title: form.get('title'), body: form.get('body') }),
      });
      toast.success('Doubt submitted');
      e.currentTarget.reset();
      await list.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={create} className="gc-card space-y-3 p-5">
        <h1 className="font-display text-2xl text-gc-black">Ask a doubt</h1>
        <p className="text-xs text-gc-mute">Asynchronous desk — not a live class chat.</p>
        <Input name="title" label="Title" required minLength={4} />
        <Textarea name="body" label="Describe the problem" required minLength={8} />
        <Button loading={busy} type="submit">
          Submit doubt
        </Button>
      </form>
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-xl text-gc-black">My doubts</h2>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[200px]">
          <option value="">All</option>
          {['pending', 'assigned', 'in_progress', 'answered', 'closed'].map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </Select>
      </div>
      {list.isLoading ? <LoadingState /> : null}
      {list.error ? <ErrorState message={(list.error as Error).message} onRetry={() => void list.refetch()} /> : null}
      <StaggerContainer className="space-y-3">
        {(list.data?.items ?? []).map((d) => (
          <StaggerItem key={d._id}>
            <Link href={`/student/doubts/${d._id}`} className="gc-card flex items-center justify-between p-4 hover:border-gc-gold">
              <span>{d.title}</span>
              <StatusBadge status={d.status} />
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
      {!list.isLoading && !(list.data?.items.length) ? <EmptyState title="No doubts yet" /> : null}
    </div>
  );
}

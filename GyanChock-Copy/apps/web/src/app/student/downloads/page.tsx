'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';
import { useState } from 'react';

type Item = { _id: string; title?: string; bytes?: number; expiresAt?: string };

export default function StudentDownloadsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => api<{ items: Item[]; usedBytes: number }>('/api/learning/downloads'),
  });
  const [del, setDel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!del) return;
    setBusy(true);
    try {
      await api(`/api/learning/downloads/${del}`, { method: 'DELETE' });
      toast.success('Download removed');
      setDel(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  const usedMb = ((data?.usedBytes ?? 0) / (1024 * 1024)).toFixed(1);

  return (
    <div>
      <PageHeader title="Downloads" subtitle={`Offline grants are encrypted and expire. Storage used: ${usedMb} MB.`} />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-4 space-y-3">
        {(data?.items ?? []).map((d) => (
          <li key={d._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{d.title ?? 'Lecture'}</p>
              <p className="text-xs text-gc-mute">Expires {d.expiresAt ? new Date(d.expiresAt).toLocaleString() : ''}</p>
            </div>
            <Button variant="danger" type="button" onClick={() => setDel(d._id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? (
        <EmptyState title="No offline grants" body="Use Download for offline from a lecture you are enrolled in." />
      ) : null}
      <ConfirmDialog
        open={Boolean(del)}
        title="Delete this download?"
        body="The encrypted offline grant is revoked. You can request a new one from the player."
        loading={busy}
        onClose={() => setDel(null)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}

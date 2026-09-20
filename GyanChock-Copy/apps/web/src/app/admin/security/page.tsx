'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/panel/ResourceManager';

type Session = {
  _id: string;
  userAgent?: string;
  ip?: string;
  createdAt?: string;
  revokedAt?: string;
  user?: { name?: string; email?: string };
};

export default function AdminSecurityPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: () => api<{ items: Session[] }>('/api/admin/sessions?active=1'),
  });
  const [id, setId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function revoke() {
    if (!id) return;
    setBusy(true);
    try {
      await api(`/api/admin/sessions/${id}/revoke`, { method: 'POST' });
      toast.success('Session revoked');
      setId(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Security" subtitle="Active sessions and devices. Revoking signs that browser out." />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-4 space-y-3">
        {(data?.items ?? []).map((s) => (
          <li key={s._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{s.user?.name ?? 'User'} · {s.user?.email}</p>
              <p className="text-xs text-gc-mute">{s.userAgent ?? 'Unknown device'} · {s.ip}</p>
              <p className="text-xs text-gc-mute">{formatDate(s.createdAt)}</p>
            </div>
            <Button variant="danger" type="button" onClick={() => setId(s._id)}>
              Revoke
            </Button>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No active sessions" /> : null}
      <ConfirmDialog
        open={Boolean(id)}
        title="Revoke this session?"
        body="The device must sign in again. Access tokens expire on their own; refresh is blocked immediately."
        confirmLabel="Revoke"
        loading={busy}
        onClose={() => setId(null)}
        onConfirm={() => void revoke()}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

type Student = { _id: string; name: string; email: string; status?: string; lastLoginAt?: string };

export default function AdminStudentsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-students'],
    queryFn: () => api<{ items: Student[] }>('/api/admin/users?role=student'),
  });
  const [action, setAction] = useState<{ id: string; kind: 'suspend' | 'active' | 'deactivated' | 'logout' | 'reset' } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!action) return;
    setBusy(true);
    try {
      if (action.kind === 'logout') {
        await api(`/api/admin/users/${action.id}/revoke-sessions`, { method: 'POST' });
        toast.success('Sessions revoked');
      } else if (action.kind === 'reset') {
        await api(`/api/admin/users/${action.id}/send-reset`, { method: 'POST' });
        toast.success('Password reset email sent');
      } else {
        await api(`/api/admin/users/${action.id}/status`, {
          method: 'POST',
          body: JSON.stringify({ status: action.kind === 'suspend' ? 'suspended' : action.kind }),
        });
        toast.success('Student status updated');
      }
      setAction(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Students" subtitle="Suspend, force-logout, or email a password reset." />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-6 space-y-3">
        {(data?.items ?? []).map((s) => (
          <li key={s._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{s.name}</p>
              <p className="text-xs text-gc-mute">{s.email}</p>
              <div className="mt-1">
                <StatusBadge status={s.status ?? 'pending'} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => setAction({ id: s._id, kind: 'active' })}>
                Reactivate
              </Button>
              <Button variant="ghost" type="button" onClick={() => setAction({ id: s._id, kind: 'reset' })}>
                Reset email
              </Button>
              <Button variant="ghost" type="button" onClick={() => setAction({ id: s._id, kind: 'logout' })}>
                Force logout
              </Button>
              <Button variant="danger" type="button" onClick={() => setAction({ id: s._id, kind: 'suspend' })}>
                Suspend
              </Button>
              <Button variant="danger" type="button" onClick={() => setAction({ id: s._id, kind: 'deactivated' })}>
                Deactivate
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? (
        <EmptyState title="No students yet" body="Registered students appear here." />
      ) : null}
      <ConfirmDialog
        open={Boolean(action)}
        title="Update this student?"
        body="This writes to the live user record. Force logout revokes every refresh session. Reset email sends a one-time link."
        confirmLabel="Confirm"
        loading={busy}
        onClose={() => setAction(null)}
        onConfirm={() => void run()}
      />
    </div>
  );
}

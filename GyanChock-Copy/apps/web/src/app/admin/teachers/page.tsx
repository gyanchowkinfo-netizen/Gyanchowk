'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';

export default function AdminTeachersPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; name: string; email: string; teacherStatus?: string }> }>(
        '/api/admin/users?role=teacher',
      ),
  });
  const [action, setAction] = useState<{ id: string; status: 'approved' | 'rejected' | 'suspended' } | null>(null);
  const [busy, setBusy] = useState(false);

  async function decide() {
    if (!action) return;
    setBusy(true);
    try {
      await api(`/api/admin/teachers/${action.id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ teacherStatus: action.status }),
      });
      toast.success(`Teacher ${action.status}`);
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
      <h1 className="font-display text-3xl text-gc-black">Teachers</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-6 space-y-3">
        {(data?.items ?? []).map((t) => (
          <li key={t._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{t.name}</p>
              <p className="text-xs text-gc-mute">{t.email}</p>
              <div className="mt-1">
                <StatusBadge status={t.teacherStatus ?? 'pending'} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setAction({ id: t._id, status: 'approved' })}>
                Approve
              </Button>
              <Button variant="ghost" type="button" onClick={() => setAction({ id: t._id, status: 'rejected' })}>
                Reject
              </Button>
              <Button variant="danger" type="button" onClick={() => setAction({ id: t._id, status: 'suspended' })}>
                Suspend
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No teacher accounts" /> : null}
      <ConfirmDialog
        open={Boolean(action)}
        title={`${action?.status} this teacher?`}
        body="This updates teacherStatus on the server and notifies the applicant. Rejected teachers cannot log in."
        confirmLabel={action?.status === 'approved' ? 'Approve' : action?.status === 'rejected' ? 'Reject' : 'Suspend'}
        loading={busy}
        onClose={() => setAction(null)}
        onConfirm={() => void decide()}
      />
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { toast } from '@/lib/toast';

export default function NotificationCenter() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifs'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string; body?: string; type?: string; readAt?: string; createdAt?: string }> }>('/api/notifications'),
  });
  async function markAll() {
    await api('/api/notifications/read', { method: 'POST' });
    toast.success('Marked as read');
    await refetch();
  }
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-gc-black">Notifications</h1>
        <Button variant="ghost" onClick={() => void markAll()}>
          Mark all read
        </Button>
      </div>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="space-y-3">
        {(data?.items ?? []).map((n) => (
          <li key={n._id} className="gc-card p-4">
            <p className="text-xs uppercase text-gc-mute">{n.type} {n.readAt ? '' : '· unread'}</p>
            <p className="mt-1 font-medium">{n.title}</p>
            {n.body ? <p className="mt-1 text-sm text-gc-mist">{n.body}</p> : null}
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No notifications" /> : null}
    </div>
  );
}

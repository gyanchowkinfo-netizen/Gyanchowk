'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

export default function ReferralsPage() {
  const user = useAuth((s) => s.user);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['referrals'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; status?: string; referee?: { name?: string; email?: string } }> }>('/api/referrals'),
  });
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ user: { referralCode?: string } }>('/api/auth/me'),
  });
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const code = me.data?.user.referralCode ?? user?.referralCode;
  const link = code ? `${origin}/register?ref=${code}` : '';

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success('Link copied');
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Referrals</h1>
      <div className="mt-6 gc-card p-5">
        <p className="text-xs text-gc-mute">Your code</p>
        <p className="mt-1 font-display text-2xl text-gc-black">{code ?? '—'}</p>
        {link ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <code className="rounded-lg bg-gc-ink px-3 py-2 text-xs">{link}</code>
            <Button variant="ghost" type="button" onClick={() => void copy()}>
              Copy link
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gc-mute">Sign in fully to load your referral code from the server.</p>
        )}
      </div>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-6 space-y-2">
        {(data?.items ?? []).map((r) => (
          <li key={r._id} className="gc-card p-4 text-sm">
            {r.referee?.name ?? r.referee?.email ?? 'Invitee'} · {r.status}
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No referrals yet" /> : null}
    </div>
  );
}

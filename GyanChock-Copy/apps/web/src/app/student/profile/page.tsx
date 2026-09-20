'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Avatar } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/panel/ResourceManager';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const enrollments = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api<{ items: unknown[] }>('/api/learning/enrollments'),
  });
  const certs = useQuery({
    queryKey: ['certs'],
    queryFn: () => api<{ items: unknown[] }>('/api/learning/certificates'),
  });
  if (!user) return <LoadingState />;
  return (
    <div>
      <PageHeader title="Profile" subtitle="A snapshot of your Gyan Chowk account." />
      <div className="gc-card flex flex-wrap items-center gap-4 p-5">
        <Avatar name={user.name} size={64} />
        <div>
          <p className="font-display text-2xl">{user.name}</p>
          <p className="text-sm text-gc-mute">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Purchased courses</p>
          <p className="font-display text-2xl">{enrollments.data?.items.length ?? 0}</p>
        </div>
        <div className="gc-card p-4">
          <p className="text-xs text-gc-mute">Certificates</p>
          <p className="font-display text-2xl">{certs.data?.items.length ?? 0}</p>
        </div>
      </div>
      <Link href="/student/settings" className="mt-6 inline-flex gc-btn-primary">
        Edit in Settings
      </Link>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatPaise } from '@/lib/format';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { FileUploader } from '@/components/ui/FileUploader';
import { StatusBadge } from '@/components/ui/Badge';
import { toast } from '@/lib/toast';
import { Alert } from '@/components/ui/Badge';
import { CountUp } from '@/components/motion';

export default function TeacherHome() {
  const user = useAuth((s) => s.user);
  const pending = user?.teacherStatus && user.teacherStatus !== 'approved';
  const doubts = useQuery({
    queryKey: ['tdoubts'],
    queryFn: () => api<{ total?: number; items?: unknown[] }>('/api/doubts'),
  });
  const earnings = useQuery({
    enabled: user?.teacherStatus === 'approved',
    queryKey: ['tearn'],
    queryFn: () => api<{ summary: Array<{ _id: string; total: number }>; commissionPercent: number }>('/api/payouts/earnings'),
  });
  const courses = useQuery({
    queryKey: ['tcourses'],
    queryFn: () => api<{ items?: unknown[] }>('/api/courses?mine=1&limit=5'),
  });
  const [docError, setDocError] = useState('');

  async function uploadDoc(file: File) {
    setDocError('');
    try {
      const sig = await api<{
        timestamp: number;
        signature: string;
        folder: string;
        cloudName: string;
        apiKey: string;
        resourceType: string;
      }>('/api/uploads/signature', {
        method: 'POST',
        body: JSON.stringify({ folder: 'teacher-docs', resourceType: 'raw' }),
      });
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      const cloud = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`, { method: 'POST', body: fd });
      const json = (await cloud.json()) as { public_id?: string; secure_url?: string; error?: { message?: string } };
      if (!json.public_id) throw new Error(json.error?.message || 'Upload failed');
      await api('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          teacherDocuments: [{ publicId: json.public_id, url: json.secure_url, name: file.name }],
        }),
      });
      toast.success('Document recorded');
    } catch (err) {
      setDocError(err instanceof Error ? err.message : 'Upload is not available until Cloudinary is configured.');
    }
  }

  const summary = Object.fromEntries((earnings.data?.summary ?? []).map((s) => [s._id, s.total]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gc-mute">Welcome</p>
        <h1 className="font-display text-3xl text-gc-black">{user?.name ?? 'Teacher'}</h1>
        {user?.teacherStatus ? <div className="mt-2"><StatusBadge status={user.teacherStatus} /></div> : null}
      </div>
      {pending ? (
        <Alert kind="info">
          Teacher catalog tools wait for admin approval. You can upload documents below and prepare courses after approval.
        </Alert>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/teacher/doubts" className="gc-card p-5 hover:border-gc-gold">
          <p className="text-xs text-gc-mute">Assigned doubts</p>
          <p className="mt-2 font-display text-3xl">
            <CountUp value={Number(doubts.data?.total ?? doubts.data?.items?.length ?? 0)} />
          </p>
        </Link>
        <Link href="/teacher/earnings" className="gc-card p-5 hover:border-gc-gold">
          <p className="text-xs text-gc-mute">Available earnings</p>
          <p className="mt-2 font-display text-2xl">{formatPaise(Number(summary.available ?? 0))}</p>
        </Link>
        <Link href="/teacher/courses" className="gc-card p-5 hover:border-gc-gold">
          <p className="text-xs text-gc-mute">Commission</p>
          <p className="mt-2 font-display text-2xl">{earnings.data?.commissionPercent ?? '—'}%</p>
        </Link>
      </div>
      {earnings.error ? <ErrorState message={(earnings.error as Error).message} onRetry={() => void earnings.refetch()} /> : null}
      <section className="gc-card space-y-3 p-5">
        <h2 className="font-display text-xl text-gc-black">Application documents</h2>
        <p className="text-sm text-gc-mute">ID / qualification files. Upload uses a signed Cloudinary request — never a fake success.</p>
        <FileUploader label="Upload PDF or image" accept="application/pdf,image/*" onSelect={(f) => void uploadDoc(f)} />
        {docError ? <p className="text-sm text-red-300">{docError}</p> : null}
      </section>
      <p className="text-sm">
        <Link href="/teacher/courses" className="text-gc-glow">
          Open course builder →
        </Link>
      </p>
      {courses.isLoading ? <LoadingState /> : null}
      {!courses.data?.items?.length && !pending ? (
        <EmptyState title="No courses yet" action={{ href: '/teacher/courses', label: 'Create a course' }} />
      ) : null}
    </div>
  );
}

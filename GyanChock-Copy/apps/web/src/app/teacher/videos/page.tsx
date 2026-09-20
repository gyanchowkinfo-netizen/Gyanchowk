'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

type Video = { _id: string; title: string; status?: string; isDemo?: boolean; publicId?: string };

export default function TeacherVideosPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-videos'],
    queryFn: () => api<{ items: Video[] }>('/api/videos'),
  });
  const courses = useQuery({
    queryKey: ['tcourses-all'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/courses?mine=1&limit=50'),
  });
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  async function upload(file: File, form: HTMLFormElement) {
    setBusy(true);
    setProgress('Requesting signature…');
    try {
      const sig = await api<{
        timestamp: number;
        signature: string;
        folder: string;
        cloudName: string;
        apiKey: string;
      }>('/api/uploads/signature', {
        method: 'POST',
        body: JSON.stringify({ folder: 'videos', resourceType: 'video' }),
      });
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      setProgress('Uploading to Cloudinary…');
      const cloud = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`, { method: 'POST', body: fd });
      const json = (await cloud.json()) as { public_id?: string; duration?: number; bytes?: number; format?: string; error?: { message?: string } };
      if (!json.public_id) throw new Error(json.error?.message || 'Upload failed');
      const fields = new FormData(form);
      await api('/api/videos', {
        method: 'POST',
        body: JSON.stringify({
          title: fields.get('title'),
          course: fields.get('course'),
          publicId: json.public_id,
          duration: json.duration,
          bytes: json.bytes,
          format: json.format,
          isDemo: fields.get('isDemo') === 'on',
        }),
      });
      toast.success('Video recorded. Processing status will update on refresh.');
      form.reset();
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Videos" subtitle="Upload through Cloudinary. Playback stays enrollment-gated except free previews." />
      <form
        className="gc-card grid gap-3 p-5 md:grid-cols-2"
        onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
      >
        <Input name="title" label="Title" required />
        <Select name="course" label="Course" required>
          <option value="">Select course</option>
          {(courses.data?.items ?? []).map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isDemo" /> Free preview
        </label>
        <div className="md:col-span-2">
          <FileUploader
            label={busy ? progress || 'Uploading…' : 'Lecture video'}
            accept="video/*"
            onSelect={(file) => {
              const form = document.querySelector('form.gc-card') as HTMLFormElement | null;
              if (form) void upload(file, form);
            }}
          />
        </div>
      </form>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="space-y-3">
        {(data?.items ?? []).map((v) => (
          <li key={v._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{v.title}</p>
              <StatusBadge status={v.status ?? 'processing'} />
              {v.isDemo ? <span className="ml-2 text-xs text-gc-gold">preview</span> : null}
            </div>
            <Button
              variant="ghost"
              type="button"
              onClick={async () => {
                await api(`/api/videos/${v._id}`, { method: 'PATCH', body: JSON.stringify({ isDemo: !v.isDemo }) });
                toast.success('Updated');
                await refetch();
              }}
            >
              Toggle preview
            </Button>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? (
        <EmptyState title="No videos yet" body="Upload a lecture after Cloudinary is configured." />
      ) : null}
    </div>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

export default function AdminNotificationsPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<number | null>(null);

  async function compose(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const channels = ['inApp', 'email', 'push'].filter((c) => form.get(c) === 'on');
    setBusy(true);
    try {
      const res = await api<{ sent: number }>('/api/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          body: form.get('body'),
          audience: form.get('audience'),
          role: form.get('role') || undefined,
          batchId: form.get('batchId') || undefined,
          courseId: form.get('courseId') || undefined,
          channels,
        }),
      });
      toast.success(`Sent to ${res.sent} users`);
      setSent(res.sent);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Compose in-app, email, and push messages to a selected audience." />
      <form onSubmit={compose} className="gc-card grid max-w-2xl gap-3 p-5">
        <Input name="title" label="Title" required />
        <Textarea name="body" label="Body" required />
        <Select name="audience" label="Audience" defaultValue="all">
          <option value="all">Everyone active</option>
          <option value="role">By role</option>
          <option value="batch">By batch</option>
          <option value="course">By course</option>
        </Select>
        <Select name="role" label="Role (if by role)">
          <option value="">—</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
        </Select>
        <Input name="batchId" label="Batch id (if by batch)" />
        <Input name="courseId" label="Course id (if by course)" />
        <fieldset className="flex flex-wrap gap-4 text-sm">
          <legend className="text-gc-mist">Channels</legend>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="inApp" defaultChecked /> In-app
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="email" defaultChecked /> Email
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="push" /> Push
          </label>
        </fieldset>
        <Button loading={busy} type="submit">
          Send announcement
        </Button>
        {sent != null ? <p className="text-sm text-gc-mute">Last send reached {sent} users.</p> : null}
      </form>
    </div>
  );
}

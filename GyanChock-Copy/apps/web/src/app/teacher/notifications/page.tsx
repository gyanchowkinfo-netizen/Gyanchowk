'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

export default function TeacherNotificationsPage() {
  const [busy, setBusy] = useState(false);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await api<{ sent: number }>('/api/notifications/compose', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          body: form.get('body'),
          batchId: form.get('batchId') || undefined,
          courseId: form.get('courseId') || undefined,
          channels: ['inApp', form.get('email') === 'on' ? 'email' : '', form.get('push') === 'on' ? 'push' : ''].filter(Boolean),
        }),
      });
      toast.success(`Sent to ${res.sent} students`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Message students" subtitle="Send to a batch or course you teach." />
      <form onSubmit={send} className="gc-card grid max-w-2xl gap-3 p-5">
        <Input name="title" label="Title" required />
        <Textarea name="body" label="Message" required />
        <Input name="batchId" label="Batch id" />
        <Input name="courseId" label="Course id" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="email" /> Also email
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="push" /> Also push
        </label>
        <Button loading={busy} type="submit">
          Send
        </Button>
      </form>
    </div>
  );
}

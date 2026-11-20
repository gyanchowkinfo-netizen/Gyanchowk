'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

export default function TeacherNotificationsPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<number | null>(null);

  const coursesQuery = useQuery({
    queryKey: ['teacher-notifications-courses'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/courses?mine=1&limit=100'),
  });

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const courseId = form.get('courseId');
    if (!courseId) {
      toast.error('Please select a course');
      return;
    }
    setBusy(true);
    try {
      const res = await api<{ sent: number }>('/api/notifications/compose', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          body: form.get('body'),
          courseId,
          channels: ['inApp', form.get('email') === 'on' ? 'email' : '', form.get('push') === 'on' ? 'push' : ''].filter(Boolean),
        }),
      });
      toast.success(`Message sent to ${res.sent} enrolled students`);
      setSent(res.sent);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setBusy(false);
    }
  }

  const courses = coursesQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gc-black">Message Students</h1>
        <p className="text-sm text-gc-mute">
          Send course announcements and notifications directly to students enrolled in your courses.
        </p>
      </div>

      <form onSubmit={send} className="gc-card grid max-w-2xl gap-4 p-5">
        <div>
          <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Target Course</label>
          <Select name="courseId" required defaultValue="">
            <option value="">Select a course to notify…</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} (ID: {c._id})
              </option>
            ))}
          </Select>
        </div>

        <Input name="title" label="Subject / Title" placeholder="e.g. Test series schedule updated" required />
        <Textarea name="body" label="Message Content" placeholder="Write your announcement or notice here…" required />

        <fieldset className="flex flex-wrap gap-4 text-sm pt-2 border-t border-gc-border">
          <legend className="text-xs uppercase font-semibold text-gc-mute mb-2">Delivery Channels</legend>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="inApp" defaultChecked disabled /> In-app notification
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="email" /> Also send email
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="push" /> Also send push notification
          </label>
        </fieldset>

        <Button loading={busy} type="submit">
          Send announcement
        </Button>

        {sent !== null ? <p className="text-xs text-emerald-600 font-medium">Delivered to {sent} students.</p> : null}
      </form>
    </div>
  );
}

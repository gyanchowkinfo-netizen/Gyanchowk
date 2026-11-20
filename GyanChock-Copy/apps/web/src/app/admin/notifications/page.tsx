'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

export default function AdminNotificationsPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const [audience, setAudience] = useState('all');

  const coursesQuery = useQuery({
    queryKey: ['admin-notifications-courses'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/courses?limit=200'),
  });

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

  const courses = coursesQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gc-black">Announcements</h1>
        <p className="text-sm text-gc-mute">
          Compose in-app, email, and push messages to a selected audience across courses or user roles.
        </p>
      </div>

      <form onSubmit={compose} className="gc-card grid max-w-2xl gap-4 p-5">
        <Input name="title" label="Announcement Title" required />
        <Textarea name="body" label="Message Body" required />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Target Audience</label>
            <Select name="audience" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="all">Everyone active</option>
              <option value="role">By user role</option>
              <option value="course">By enrolled course</option>
            </Select>
          </div>

          {audience === 'role' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Select Role</label>
              <Select name="role">
                <option value="student">All Students</option>
                <option value="teacher">All Teachers</option>
              </Select>
            </div>
          )}

          {audience === 'course' && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Select Course</label>
              <Select name="courseId" required>
                <option value="">— Choose a Course —</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} (ID: {c._id})
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <fieldset className="flex flex-wrap gap-4 text-sm pt-2 border-t border-gc-border">
          <legend className="text-xs uppercase font-semibold text-gc-mute mb-2">Delivery Channels</legend>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="inApp" defaultChecked /> In-app
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="email" defaultChecked /> Email
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="push" /> Push
          </label>
        </fieldset>

        <Button loading={busy} type="submit">
          Broadcast message
        </Button>

        {sent !== null ? <p className="text-xs text-emerald-600 font-medium">Delivered to {sent} recipients.</p> : null}
      </form>
    </div>
  );
}

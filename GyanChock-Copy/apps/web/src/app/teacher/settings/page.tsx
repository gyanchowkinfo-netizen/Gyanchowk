'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

export default function TeacherSettingsPage() {
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.get('name'),
          headline: form.get('headline'),
          bio: form.get('bio'),
          expertise: String(form.get('expertise') || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          payoutBank: {
            accountName: form.get('accountName'),
            ifsc: form.get('ifsc'),
            accountLast4: form.get('accountLast4'),
            upi: form.get('upi'),
          },
        }),
      });
      await refresh();
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Teacher settings" subtitle="Public profile, expertise tags, and payout bank details." />
      <form onSubmit={save} className="gc-card grid max-w-2xl gap-3 p-5 md:grid-cols-2">
        <Input name="name" label="Name" defaultValue={user?.name} required />
        <Input name="headline" label="Headline" />
        <Textarea name="bio" label="Bio" className="md:col-span-2" />
        <Input name="expertise" label="Expertise tags (comma)" className="md:col-span-2" />
        <Input name="accountName" label="Account name" />
        <Input name="ifsc" label="IFSC" />
        <Input name="accountLast4" label="Account last 4" />
        <Input name="upi" label="UPI" />
        <div className="md:col-span-2">
          <Button loading={busy} type="submit">
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
}

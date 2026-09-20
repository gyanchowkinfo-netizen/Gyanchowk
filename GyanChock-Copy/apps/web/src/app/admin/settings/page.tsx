'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

type Setting = { _id: string; key: string; value: unknown };

export default function AdminSettingsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api<{ items: Setting[] }>('/api/admin/settings'),
  });
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    let value: unknown = String(form.get('value') ?? '');
    try {
      value = JSON.parse(String(value));
    } catch {
      /* keep string */
    }
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: form.get('key'), value }),
      });
      toast.success('Setting saved');
      e.currentTarget.reset();
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Key/value store for app name, commission, and feature flags." />
      <form onSubmit={save} className="gc-card mb-6 grid gap-3 p-5 md:grid-cols-3">
        <Input name="key" label="Key" required placeholder="app.name" />
        <Input name="value" label="Value (JSON or text)" required placeholder='"Gyan Chowk" or 20' />
        <div className="flex items-end">
          <Button loading={busy} type="submit">
            Save
          </Button>
        </div>
      </form>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="space-y-2">
        {(data?.items ?? []).map((s) => (
          <li key={s._id} className="gc-card flex justify-between gap-3 p-3 text-sm">
            <span className="text-gc-gold">{s.key}</span>
            <code className="text-gc-mist">{JSON.stringify(s.value)}</code>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? (
        <EmptyState title="No settings yet" body="Save app.name, commission.percent or feature flags." />
      ) : null}
    </div>
  );
}

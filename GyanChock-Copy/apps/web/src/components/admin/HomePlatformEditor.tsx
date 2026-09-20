'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { HomePlatformFeature } from '@/lib/types';

type PlatformDraft = HomePlatformFeature & { active: boolean; _key: string };

const TONE_OPTIONS = [
  { value: 'navy', label: 'Navy' },
  { value: 'blue', label: 'Blue' },
  { value: 'violet', label: 'Violet' },
  { value: 'cyan', label: 'Teal' },
  { value: 'warm', label: 'Warm gold' },
];

const ICON_OPTIONS = [
  { value: 'play', label: 'Recorded video' },
  { value: 'trophy', label: 'Trophy / ranks' },
  { value: 'message', label: 'Doubt chat' },
  { value: 'chart', label: 'Progress chart' },
  { value: 'award', label: 'Certificate' },
  { value: 'layout', label: 'Dashboard' },
  { value: 'bookmark', label: 'Bookmark' },
  { value: 'library', label: 'Practice library' },
  { value: 'path', label: 'Learning path' },
  { value: 'target', label: 'Exam analytics' },
  { value: 'clock', label: 'Timed study' },
  { value: 'shield', label: 'Verified access' },
  { value: 'notes', label: 'Notes' },
  { value: 'users', label: 'Mentors' },
  { value: 'book', label: 'Open book' },
];

function newKey() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random()}`;
}

function emptyRow(): PlatformDraft {
  return {
    _key: newKey(),
    title: '',
    body: '',
    icon: 'play',
    tone: 'navy',
    active: true,
  };
}

function toDrafts(items: Array<HomePlatformFeature & { active?: boolean }> | undefined): PlatformDraft[] {
  if (!items?.length) return [emptyRow()];
  return items.map((item) => ({
    ...item,
    tone: item.tone ?? 'navy',
    active: item.active !== false,
    _key: newKey(),
  }));
}

export function HomePlatformEditor() {
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () => api<{ platform?: HomePlatformFeature[] }>('/api/cms/public'),
  });
  const settings = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api<{ items: Array<{ key: string; value: unknown }> }>('/api/admin/settings'),
  });
  const [rows, setRows] = useState<PlatformDraft[]>(() => [emptyRow()]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = settings.data?.items.find((item) => item.key === 'home.platform')?.value;
    if (Array.isArray(stored) && stored.length) {
      setRows(toDrafts(stored as Array<HomePlatformFeature & { active?: boolean }>));
      return;
    }
    if (cms.data?.platform) setRows(toDrafts(cms.data.platform));
  }, [cms.data?.platform, settings.data?.items]);

  function updateRow(index: number, patch: Partial<PlatformDraft>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? [emptyRow()] : prev.filter((_, i) => i !== index)));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = rows
      .filter((r) => r.title.trim())
      .map(({ title, body, icon, tone, active }) => ({
        title: title.trim(),
        body: body.trim(),
        icon,
        tone,
        active,
      }));
    if (!payload.some((r) => r.active)) {
      toast.error('Add at least one active platform card.');
      return;
    }
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.platform', value: payload }),
      });
      toast.success('Platform section saved.');
      await Promise.all([cms.refetch(), settings.refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save platform cards.');
    } finally {
      setBusy(false);
    }
  }

  async function resetDefaults() {
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.platform', value: [] }),
      });
      toast.success('Platform cards reset to built-in defaults.');
      await Promise.all([cms.refetch(), settings.refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset platform cards.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="gc-card grid gap-4 p-5" onSubmit={save}>
      <div>
        <h2 className="font-display text-xl text-gc-black">Platform — Built for deep work</h2>
        <p className="mt-1 text-sm text-gc-mute">
          Add, edit, update or delete homepage platform cards. Choose an icon and colour, then save. Inactive cards stay off the homepage until you turn them back on.
        </p>
      </div>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={row._key} className="rounded-2xl border border-gc-line p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gc-mute">Card {i + 1}</p>
              <Button type="button" variant="ghost" className="h-9 text-xs" disabled={busy} onClick={() => removeRow(i)}>
                Delete
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Title"
                placeholder="Recorded Courses"
                value={row.title}
                onChange={(e) => updateRow(i, { title: e.target.value })}
              />
              <Select label="Icon" value={row.icon} onChange={(e) => updateRow(i, { icon: e.target.value })}>
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Colour tone"
                value={row.tone ?? 'navy'}
                onChange={(e) => updateRow(i, { tone: e.target.value as PlatformDraft['tone'] })}
              >
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <label className="flex min-h-10 items-center gap-2 text-sm text-gc-mist">
                <input type="checkbox" checked={row.active} onChange={(e) => updateRow(i, { active: e.target.checked })} />
                Active on homepage
              </label>
              <Textarea
                label="Description"
                className="md:col-span-2"
                value={row.body}
                onChange={(e) => updateRow(i, { body: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => setRows((prev) => [...prev, emptyRow()])}>
          Add new card
        </Button>
        <Button type="submit" loading={busy}>
          Save platform
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void resetDefaults()}>
          Reset to defaults
        </Button>
      </div>
    </form>
  );
}

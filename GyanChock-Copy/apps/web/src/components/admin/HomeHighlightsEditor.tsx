'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import type { HomeHighlight } from '@/lib/types';

type HighlightDraft = HomeHighlight & { active: boolean; _key: string };

function newKey() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `h-${Date.now()}-${Math.random()}`;
}

function emptyRow(): HighlightDraft {
  return {
    _key: newKey(),
    value: '',
    title: '',
    description: '',
    active: true,
  };
}

function toDrafts(items: HomeHighlight[] | undefined): HighlightDraft[] {
  if (!items?.length) return [emptyRow()];
  return items.map((item) => ({ ...item, active: true, _key: newKey() }));
}

export function HomeHighlightsEditor() {
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () => api<{ highlights?: HomeHighlight[] }>('/api/cms/public'),
  });
  const [rows, setRows] = useState<HighlightDraft[]>(() => [emptyRow()]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cms.data?.highlights) setRows(toDrafts(cms.data.highlights));
  }, [cms.data?.highlights]);

  function updateRow(index: number, patch: Partial<HighlightDraft>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? [emptyRow()] : prev.filter((_, i) => i !== index)));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = rows
      .filter((r) => r.active && r.value.trim() && r.title.trim())
      .map(({ value, title, description, active }) => ({
        value: value.trim(),
        title: title.trim(),
        description: description.trim(),
        active,
      }));
    if (!payload.length) {
      toast.error('Add at least one active highlight tile.');
      return;
    }
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.highlights', value: payload }),
      });
      toast.success('Homepage highlights updated.');
      await cms.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save highlights.');
    } finally {
      setBusy(false);
    }
  }

  async function resetToLiveStats() {
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.highlights', value: [] }),
      });
      toast.success('Highlights reset — homepage uses live platform stats.');
      await cms.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset highlights.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="gc-card grid gap-4 p-5" onSubmit={save}>
      <div>
        <h2 className="font-display text-xl text-gc-black">Homepage highlights strip</h2>
        <p className="mt-1 text-sm text-gc-mute">
          Benefit tiles below the hero. Add, edit, deactivate or delete tiles, then save. Reset to pull live course, test and educator counts.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((row, i) => (
          <div key={row._key} className="rounded-2xl border border-gc-line p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gc-mute">Tile {i + 1}</p>
              <Button type="button" variant="ghost" className="h-9 text-xs" disabled={busy} onClick={() => removeRow(i)}>
                Delete
              </Button>
            </div>
            <div className="grid gap-3">
              <Input
                label="Headline value"
                placeholder="70+"
                value={row.value}
                onChange={(e) => updateRow(i, { value: e.target.value })}
              />
              <Input
                label="Title"
                placeholder="Structured courses"
                value={row.title}
                onChange={(e) => updateRow(i, { title: e.target.value })}
              />
              <Textarea
                label="Description"
                value={row.description}
                onChange={(e) => updateRow(i, { description: e.target.value })}
              />
              <label className="flex min-h-10 items-center gap-2 text-sm text-gc-mist">
                <input type="checkbox" checked={row.active} onChange={(e) => updateRow(i, { active: e.target.checked })} />
                Active on homepage
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => setRows((prev) => [...prev, emptyRow()])}>
          Add new tile
        </Button>
        <Button type="submit" loading={busy}>
          Save highlights
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void resetToLiveStats()}>
          Reset to live stats
        </Button>
      </div>
    </form>
  );
}

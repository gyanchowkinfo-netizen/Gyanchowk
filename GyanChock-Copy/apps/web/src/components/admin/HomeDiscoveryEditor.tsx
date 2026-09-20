'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { HomeDiscoveryPath } from '@/lib/types';

type DiscoveryDraft = HomeDiscoveryPath & { active: boolean; _key: string };

const TONE_OPTIONS = [
  { value: 'navy', label: 'Navy' },
  { value: 'blue', label: 'Blue' },
  { value: 'violet', label: 'Violet' },
  { value: 'cyan', label: 'Teal' },
  { value: 'warm', label: 'Warm gold' },
];

const ICON_OPTIONS = [
  { value: 'graduation', label: 'Graduation cap' },
  { value: 'microscope', label: 'Microscope' },
  { value: 'book', label: 'Book' },
  { value: 'landmark', label: 'Institution' },
  { value: 'code', label: 'Code' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'flask', label: 'Science flask' },
  { value: 'sigma', label: 'Mathematics' },
];

function newKey() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `d-${Date.now()}-${Math.random()}`;
}

function emptyRow(): DiscoveryDraft {
  return {
    _key: newKey(),
    name: '',
    href: '/courses',
    body: '',
    tone: 'navy',
    icon: 'book',
    active: true,
  };
}

function toDrafts(items: HomeDiscoveryPath[] | undefined): DiscoveryDraft[] {
  if (!items?.length) return [emptyRow()];
  return items.map((item) => ({ ...item, active: true, _key: newKey() }));
}

export function HomeDiscoveryEditor() {
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () => api<{ discovery?: HomeDiscoveryPath[] }>('/api/cms/public'),
  });
  const [rows, setRows] = useState<DiscoveryDraft[]>(() => [emptyRow()]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cms.data?.discovery) setRows(toDrafts(cms.data.discovery));
  }, [cms.data?.discovery]);

  function updateRow(index: number, patch: Partial<DiscoveryDraft>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? [emptyRow()] : prev.filter((_, i) => i !== index)));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = rows
      .filter((r) => r.active && r.name.trim() && r.href.trim())
      .map(({ name, href, body, tone, icon, active }) => ({
        name: name.trim(),
        href: href.trim(),
        body: body.trim(),
        tone,
        icon: icon?.trim() || undefined,
        active,
      }));
    if (!payload.length) {
      toast.error('Add at least one active discovery card.');
      return;
    }
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.discovery', value: payload }),
      });
      toast.success('Discovery section saved.');
      await cms.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save discovery cards.');
    } finally {
      setBusy(false);
    }
  }

  async function resetDefaults() {
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.discovery', value: [] }),
      });
      toast.success('Discovery reset to built-in defaults.');
      await cms.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset discovery.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="gc-card grid gap-4 p-5" onSubmit={save}>
      <div>
        <h2 className="font-display text-xl text-gc-black">Discovery — Choose your path</h2>
        <p className="mt-1 text-sm text-gc-mute">
          Edit homepage category cards: headline, description, link, colour tone and icon. Add, deactivate or remove tiles.
        </p>
      </div>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={row._key} className="rounded-2xl border border-gc-line p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gc-mute">Card {i + 1}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" className="h-9 text-xs" disabled={busy} onClick={() => removeRow(i)}>
                  Delete
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Headline (category name)"
                placeholder="JEE"
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
              />
              <Input
                label="Link URL"
                placeholder="/courses?category=JEE"
                value={row.href}
                onChange={(e) => updateRow(i, { href: e.target.value })}
              />
              <Select label="Colour tone" value={row.tone} onChange={(e) => updateRow(i, { tone: e.target.value as HomeDiscoveryPath['tone'] })}>
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Select label="Icon" value={row.icon ?? 'book'} onChange={(e) => updateRow(i, { icon: e.target.value })}>
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Textarea
                label="Description"
                className="md:col-span-2"
                value={row.body}
                onChange={(e) => updateRow(i, { body: e.target.value })}
              />
              <label className="flex min-h-10 items-center gap-2 text-sm text-gc-mist md:col-span-2">
                <input type="checkbox" checked={row.active} onChange={(e) => updateRow(i, { active: e.target.checked })} />
                Active on homepage
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => setRows((prev) => [...prev, emptyRow()])}>
          Add new card
        </Button>
        <Button type="submit" loading={busy}>
          Save discovery
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void resetDefaults()}>
          Reset to defaults
        </Button>
      </div>
    </form>
  );
}

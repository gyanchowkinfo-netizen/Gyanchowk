'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { uploadCloudinaryImage } from '@/lib/upload';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import type { HomeCardAccent, HomeDiscoveryPath, HomePlatformFeature, HomeWhyCard } from '@/lib/types';

export type HomeCardSectionKind = 'discovery' | 'platform' | 'why';

type Draft = {
  _key: string;
  title: string;
  body: string;
  href: string;
  ctaText: string;
  imageUrl: string;
  accent: HomeCardAccent;
  icon: string;
  order: number;
  active: boolean;
};

const ACCENTS: Array<{ value: HomeCardAccent; label: string }> = [
  { value: 'blue', label: 'Soft blue' },
  { value: 'lavender', label: 'Soft lavender' },
  { value: 'cyan', label: 'Soft cyan' },
  { value: 'mint', label: 'Soft mint' },
  { value: 'peach', label: 'Soft peach' },
  { value: 'pink', label: 'Soft pink' },
];

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const COPY: Record<HomeCardSectionKind, { heading: string; help: string; settingKey: string; ctaDefault: string }> = {
  discovery: {
    heading: 'Discovery — Choose your path',
    help: 'Homepage discovery carousel. Order controls slide sequence. Inactive cards stay off the public site.',
    settingKey: 'home.discovery',
    ctaDefault: 'Explore →',
  },
  platform: {
    heading: 'Platform — Built for deep work',
    help: 'Homepage platform carousel. Upload a photo, set accent colour, CTA and destination.',
    settingKey: 'home.platform',
    ctaDefault: 'Explore →',
  },
  why: {
    heading: 'Why Gyan Chowk — Serious tools. Quiet rooms.',
    help: 'Homepage Why Gyan Chowk carousel. CTA is optional so cards can stay editorial.',
    settingKey: 'home.why',
    ctaDefault: '',
  },
};

function newKey() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}-${Math.random()}`;
}

function emptyRow(kind: HomeCardSectionKind, order: number): Draft {
  return {
    _key: newKey(),
    title: '',
    body: '',
    href: kind === 'discovery' ? '/courses' : '',
    ctaText: COPY[kind].ctaDefault,
    imageUrl: '',
    accent: 'blue',
    icon: kind === 'platform' ? 'play' : kind === 'discovery' ? 'book' : '',
    order,
    active: true,
  };
}

function fromStored(kind: HomeCardSectionKind, raw: unknown[]): Draft[] {
  return raw.map((item, index) => {
    const row = (item || {}) as Record<string, unknown>;
    const title = String(row.title || row.name || '');
    return {
      _key: newKey(),
      title,
      body: String(row.body || ''),
      href: String(row.href || row.ctaUrl || ''),
      ctaText: String(row.ctaText || COPY[kind].ctaDefault),
      imageUrl: String(row.imageUrl || ''),
      accent: (row.accent as HomeCardAccent) || 'blue',
      icon: String(row.icon || ''),
      order: typeof row.order === 'number' ? row.order : index + 1,
      active: row.active !== false,
    };
  });
}

export function HomeVisualCardEditor({ kind }: { kind: HomeCardSectionKind }) {
  const meta = COPY[kind];
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () =>
      api<{
        discovery?: HomeDiscoveryPath[];
        platform?: HomePlatformFeature[];
        why?: HomeWhyCard[];
      }>('/api/cms/public'),
  });
  const settings = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api<{ items: Array<{ key: string; value: unknown }> }>('/api/admin/settings'),
  });
  const [rows, setRows] = useState<Draft[]>(() => [emptyRow(kind, 1)]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    const stored = settings.data?.items.find((item) => item.key === meta.settingKey)?.value;
    if (Array.isArray(stored) && stored.length) {
      setRows(fromStored(kind, stored));
      return;
    }
    const pub =
      kind === 'discovery' ? cms.data?.discovery : kind === 'platform' ? cms.data?.platform : cms.data?.why;
    if (Array.isArray(pub) && pub.length) setRows(fromStored(kind, pub));
  }, [cms.data, kind, meta.settingKey, settings.data?.items]);

  function updateRow(index: number, patch: Partial<Draft>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function moveRow(index: number, dir: -1 | 1) {
    setRows((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next.map((item, i) => ({ ...item, order: i + 1 }));
    });
  }

  async function onImage(index: number, file: File) {
    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error('Use a JPG, JPEG, PNG or WEBP image.');
      return;
    }
    const key = rows[index]?._key;
    setUploading(key);
    try {
      const media = await uploadCloudinaryImage(file, 'cms');
      updateRow(index, { imageUrl: media.url });
      toast.success('Image uploaded. Save the section to publish it.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload image.');
    } finally {
      setUploading(null);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = rows
      .filter((row) => row.title.trim())
      .map((row, index) => {
        const base = {
          title: row.title.trim(),
          name: row.title.trim(),
          body: row.body.trim(),
          href: row.href.trim(),
          ctaUrl: row.href.trim(),
          ctaText: row.ctaText.trim(),
          imageUrl: row.imageUrl.trim(),
          accent: row.accent,
          icon: row.icon || undefined,
          order: row.order || index + 1,
          active: row.active,
        };
        return base;
      });
    if (kind === 'discovery' && !payload.some((row) => row.active && row.href)) {
      toast.error('Add at least one active discovery card with a destination URL.');
      return;
    }
    if (!payload.some((row) => row.active)) {
      toast.error('Add at least one active card.');
      return;
    }
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: meta.settingKey, value: payload }),
      });
      toast.success('Cards saved.');
      await Promise.all([cms.refetch(), settings.refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save cards.');
    } finally {
      setBusy(false);
    }
  }

  async function resetDefaults() {
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: meta.settingKey, value: [] }),
      });
      toast.success('Reset to built-in defaults.');
      await Promise.all([cms.refetch(), settings.refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset cards.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="gc-card grid gap-4 p-5" onSubmit={save}>
      <div>
        <h2 className="font-display text-xl text-gc-black">{meta.heading}</h2>
        <p className="mt-1 text-sm text-gc-mute">{meta.help}</p>
      </div>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={row._key} className="rounded-2xl border border-gc-line p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gc-mute">
                Card {i + 1} · order {row.order || i + 1}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" className="h-9 text-xs" disabled={busy || i === 0} onClick={() => moveRow(i, -1)}>
                  Move up
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 text-xs"
                  disabled={busy || i === rows.length - 1}
                  onClick={() => moveRow(i, 1)}
                >
                  Move down
                </Button>
                <Button type="button" variant="ghost" className="h-9 text-xs" disabled={busy} onClick={() => setDeleteIndex(i)}>
                  Delete
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-24 w-36 overflow-hidden rounded-xl border border-gc-line bg-[color:var(--gyan-primary-soft)]">
                    {row.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-gc-mute">No image</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="gc-btn-outline h-9 cursor-pointer px-3 text-xs">
                      <ImagePlus size={14} /> {row.imageUrl ? 'Replace image' : 'Add image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={uploading === row._key || busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void onImage(i, file);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                    {row.imageUrl ? (
                      <Button type="button" variant="ghost" className="h-9 px-3 text-xs" onClick={() => updateRow(i, { imageUrl: '' })}>
                        Remove image
                      </Button>
                    ) : null}
                    {uploading === row._key ? <span className="self-center text-xs text-gc-mute">Uploading…</span> : null}
                  </div>
                </div>
              </div>
              <Input label="Title" value={row.title} onChange={(e) => updateRow(i, { title: e.target.value })} />
              <Input label="Order" type="number" value={String(row.order)} onChange={(e) => updateRow(i, { order: Number(e.target.value) || 0 })} />
              <Input label="CTA URL" placeholder="/courses" value={row.href} onChange={(e) => updateRow(i, { href: e.target.value })} />
              <Input label="CTA text" placeholder="Explore →" value={row.ctaText} onChange={(e) => updateRow(i, { ctaText: e.target.value })} />
              <Select label="Accent style" value={row.accent} onChange={(e) => updateRow(i, { accent: e.target.value as HomeCardAccent })}>
                {ACCENTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
        <Button type="button" variant="outline" disabled={busy} onClick={() => setRows((prev) => [...prev, emptyRow(kind, prev.length + 1)])}>
          Add new card
        </Button>
        <Button type="submit" loading={busy}>
          Save cards
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void resetDefaults()}>
          Reset to defaults
        </Button>
      </div>
      <ConfirmDialog
        open={deleteIndex !== null}
        title="Delete this card?"
        body="This removes the card from the editor. Save to publish the change."
        confirmLabel="Delete card"
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex === null) return;
          setRows((prev) => (prev.length <= 1 ? [emptyRow(kind, 1)] : prev.filter((_, i) => i !== deleteIndex).map((row, i) => ({ ...row, order: i + 1 }))));
          setDeleteIndex(null);
        }}
      />
    </form>
  );
}

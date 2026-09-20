'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadCloudinaryImage } from '@/lib/upload';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Alert } from '@/components/ui/Badge';

type Media = { publicId?: string; url?: string };
type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  image?: Media;
  mobileImage?: Media;
  ctaText?: string;
  ctaUrl?: string;
  placement: string;
  bannerType: string;
  active: boolean;
  sortOrder: number;
  startAt?: string | null;
  endAt?: string | null;
  live?: boolean;
};

type Draft = {
  title: string;
  subtitle: string;
  image?: Media;
  mobileImage?: Media;
  ctaText: string;
  ctaUrl: string;
  placement: string;
  bannerType: string;
  active: boolean;
  sortOrder: number;
  startAt: string;
  endAt: string;
};

const emptyDraft = (): Draft => ({
  title: '',
  subtitle: '',
  ctaText: 'Explore',
  ctaUrl: '/courses',
  placement: 'hero',
  bannerType: 'promo',
  active: true,
  sortOrder: 0,
  startAt: '',
  endAt: '',
});

function toLocal(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function fromBanner(b: Banner): Draft {
  return {
    title: b.title,
    subtitle: b.subtitle ?? '',
    image: b.image,
    mobileImage: b.mobileImage,
    ctaText: b.ctaText ?? '',
    ctaUrl: b.ctaUrl ?? '',
    placement: b.placement || 'hero',
    bannerType: b.bannerType || 'promo',
    active: b.active,
    sortOrder: b.sortOrder ?? 0,
    startAt: toLocal(b.startAt),
    endAt: toLocal(b.endAt),
  };
}

export default function BannerAdminPage() {
  const query = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => api<{ items: Banner[] }>('/api/banners'),
  });
  const items = query.data?.items ?? [];
  const [editingId, setEditingId] = useState<string | null | 'new'>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const preview = useMemo(() => draft, [draft]);

  function openCreate() {
    setDraft({ ...emptyDraft(), sortOrder: items.length });
    setEditingId('new');
  }

  function openEdit(b: Banner) {
    setDraft(fromBanner(b));
    setEditingId(b._id);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (draft.title.trim().length < 2) {
      toast.error('Title needs at least 2 characters.');
      return;
    }
    if (draft.ctaUrl && !(draft.ctaUrl.startsWith('/') || /^https?:\/\//i.test(draft.ctaUrl))) {
      toast.error('CTA link must be a site path or https URL.');
      return;
    }
    const start = toIso(draft.startAt);
    const end = toIso(draft.endAt);
    if (start && end && new Date(start) > new Date(end)) {
      toast.error('End date must be after start date.');
      return;
    }
    setBusy(true);
    try {
      const body = {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        image: draft.image,
        mobileImage: draft.mobileImage,
        ctaText: draft.ctaText.trim(),
        ctaUrl: draft.ctaUrl.trim(),
        placement: draft.placement,
        bannerType: draft.bannerType,
        active: draft.active,
        sortOrder: Number(draft.sortOrder) || 0,
        startAt: start,
        endAt: end,
      };
      if (editingId === 'new') {
        await api('/api/banners', { method: 'POST', body: JSON.stringify(body) });
        toast.success('Banner created successfully.');
      } else if (editingId) {
        await api(`/api/banners/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        toast.success('Banner updated successfully.');
      }
      setEditingId(null);
      await query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save banner.');
    } finally {
      setBusy(false);
    }
  }

  async function upload(kind: 'image' | 'mobileImage', file: File) {
    setUploadError('');
    try {
      const media = await uploadCloudinaryImage(file, 'banners');
      setDraft((d) => ({ ...d, [kind]: media }));
      toast.success(kind === 'image' ? 'Desktop image uploaded.' : 'Mobile image uploaded.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setUploadError(msg);
      toast.error(msg);
    }
  }

  async function setActive(id: string, active: boolean) {
    try {
      await api(`/api/banners/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active }) });
      toast.success(active ? 'Banner activated.' : 'Banner deactivated.');
      await query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed.');
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const ids = items.map((b) => b._id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    try {
      await api('/api/banners/reorder', { method: 'PATCH', body: JSON.stringify({ ids: next }) });
      toast.success('Banner order updated.');
      await query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reorder failed.');
    }
  }

  async function remove() {
    if (!deleteId) return;
    setBusy(true);
    try {
      await api(`/api/banners/${deleteId}`, { method: 'DELETE' });
      toast.success('Banner deleted successfully.');
      if (editingId === deleteId) setEditingId(null);
      setDeleteId(null);
      await query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-gc-black">Banner Management</h1>
          <p className="mt-1 text-sm text-gc-mute">
            Hero banners appear in the homepage hero. Homepage carousel banners appear in the existing promotions strip below the hero.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          + Create Banner
        </Button>
      </div>

      {editingId ? (
        <form onSubmit={save} className="grid gap-6 rounded-[20px] border border-gc-line bg-white p-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <h2 className="font-display text-xl text-gc-black">{editingId === 'new' ? 'Create banner' : 'Edit banner'}</h2>
            <Input label="Title" value={draft.title} required onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <Textarea label="Subtitle" value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="CTA text" value={draft.ctaText} onChange={(e) => setDraft({ ...draft, ctaText: e.target.value })} />
              <Input label="CTA URL" value={draft.ctaUrl} placeholder="/courses" onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Placement" value={draft.placement} onChange={(e) => setDraft({ ...draft, placement: e.target.value })}>
                <option value="hero">Hero carousel</option>
                <option value="home">Homepage carousel</option>
                <option value="home_mid">Home mid</option>
                <option value="offer">Offer</option>
                <option value="top">Top announcement</option>
                <option value="announcement">Announcement</option>
              </Select>
              <Select label="Category" value={draft.bannerType} onChange={(e) => setDraft({ ...draft, bannerType: e.target.value })}>
                <option value="promo">Promo</option>
                <option value="course">Course</option>
                <option value="exam">Exam</option>
                <option value="announcement">Announcement</option>
                <option value="general">General</option>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label="Sort order"
                type="number"
                min={0}
                value={draft.sortOrder}
                onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
              />
              <Input label="Starts" type="datetime-local" value={draft.startAt} onChange={(e) => setDraft({ ...draft, startAt: e.target.value })} />
              <Input label="Ends" type="datetime-local" value={draft.endAt} onChange={(e) => setDraft({ ...draft, endAt: e.target.value })} />
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm text-gc-mist">
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
              Active
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageField
                label="Desktop image"
                value={draft.image}
                onFile={(f) => void upload('image', f)}
                onClear={() => setDraft({ ...draft, image: undefined })}
              />
              <ImageField
                label="Mobile image"
                value={draft.mobileImage}
                onFile={(f) => void upload('mobileImage', f)}
                onClear={() => setDraft({ ...draft, mobileImage: undefined })}
              />
            </div>
            {uploadError ? <Alert kind="error">{uploadError}</Alert> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={busy}>
                Save banner
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            </div>
          </div>
          <aside>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gc-mute">Live preview</p>
            <div className="overflow-hidden rounded-[20px] border border-gc-line bg-[color:var(--brand-navy)]">
              <div className="relative min-h-[180px]">
                {preview.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview.image.url} alt="" className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 bg-[image:var(--gradient-hero)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 p-4 text-white">
                  <p className="font-display text-2xl">{preview.title || 'Banner title'}</p>
                  <p className="mt-1 text-sm text-white/80">{preview.subtitle || 'Subtitle appears here'}</p>
                  <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs text-[color:var(--brand-navy)]">
                    {preview.ctaText || 'CTA'}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      ) : null}

      {query.isLoading ? (
        <LoadingState label="Loading banners…" />
      ) : query.isError ? (
        <ErrorState message="Unable to load banners." onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="No banners yet" body="Create a promotional banner to show it on the landing page carousel." />
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-gc-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gc-line text-xs uppercase tracking-wider text-gc-mute">
              <tr>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b, i) => (
                <tr key={b._id} className="border-b border-gc-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <div className="h-14 w-24 overflow-hidden rounded-lg bg-[color:var(--gyan-primary-soft)]">
                      {b.image?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.image.url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gc-black">{b.title}</p>
                    <p className="text-xs text-gc-mute">{b.placement}</p>
                    {b.ctaText ? <p className="text-xs text-gc-mute">{b.ctaText}</p> : null}
                  </td>
                  <td className="px-4 py-3 capitalize text-gc-mist">{b.bannerType}</td>
                  <td className="px-4 py-3">
                    <span className={b.active ? 'text-[color:var(--gyan-success)]' : 'text-gc-mute'}>
                      {b.active ? (b.live ? 'Live' : 'Scheduled') : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gc-mute">
                    {b.startAt || b.endAt
                      ? `${b.startAt ? new Date(b.startAt).toLocaleDateString() : '—'} → ${b.endAt ? new Date(b.endAt).toLocaleDateString() : '—'}`
                      : 'Always on'}
                  </td>
                  <td className="px-4 py-3">{b.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <IconBtn label="Edit" onClick={() => openEdit(b)}>
                        <Pencil size={14} />
                      </IconBtn>
                      <IconBtn label="Move up" disabled={i === 0} onClick={() => void move(b._id, -1)}>
                        <ArrowUp size={14} />
                      </IconBtn>
                      <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => void move(b._id, 1)}>
                        <ArrowDown size={14} />
                      </IconBtn>
                      <Button type="button" variant="ghost" className="h-9 px-2 text-xs" onClick={() => void setActive(b._id, !b.active)}>
                        {b.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <IconBtn label="Delete" onClick={() => setDeleteId(b._id)}>
                        <Trash2 size={14} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this banner?"
        body="The promotion is removed from the landing page. Uploaded images are cleaned up when storage allows."
        confirmLabel="Delete"
        loading={busy}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}

function IconBtn({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="grid h-9 w-9 place-items-center rounded-full text-gc-mist hover:bg-[color:var(--gyan-primary-soft)] disabled:opacity-40"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ImageField({
  label,
  value,
  onFile,
  onClear,
}: {
  label: string;
  value?: Media;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gc-line p-3">
      <p className="text-sm text-gc-mist">{label}</p>
      {value?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value.url} alt="" className="mt-2 h-24 w-full rounded-xl object-cover" />
      ) : (
        <div className="mt-2 grid h-24 place-items-center rounded-xl bg-[color:var(--gyan-primary-soft)] text-gc-mute">
          <ImagePlus size={20} />
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <label className="gc-btn-outline h-9 cursor-pointer px-3 text-xs">
          Upload
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.currentTarget.value = '';
            }}
          />
        </label>
        {value?.url ? (
          <Button type="button" variant="ghost" className="h-9 px-3 text-xs" onClick={onClear}>
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}

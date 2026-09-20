'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadCloudinaryImage } from '@/lib/upload';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import type { HomeFacultyCard } from '@/lib/types';

type FacultyDraft = HomeFacultyCard & { active: boolean; _key: string };

function newKey() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `f-${Date.now()}-${Math.random()}`;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function listValue(items?: string[]) {
  return Array.isArray(items) ? items.join(', ') : '';
}

function splitList(value: string) {
  return value
    .split(/[,•|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function emptyRow(): FacultyDraft {
  return {
    _key: newKey(),
    slug: '',
    name: '',
    headline: '',
    bio: '',
    details: '',
    experience: '',
    subjects: [],
    qualifications: [],
    languages: [],
    href: '',
    imageUrl: '',
    courseCount: 0,
    enrollmentCount: 0,
    ratingAvg: 0,
    ratingCount: 0,
    active: true,
  };
}

function toDrafts(items: Array<HomeFacultyCard & { active?: boolean; subjects?: string[] | string }> | undefined): FacultyDraft[] {
  if (!items?.length) return [emptyRow()];
  return items.map((item) => ({
    ...emptyRow(),
    ...item,
    slug: item.slug || slugify(item.name),
    subjects: Array.isArray(item.subjects) ? item.subjects : [],
    qualifications: Array.isArray(item.qualifications) ? item.qualifications : [],
    languages: Array.isArray(item.languages) ? item.languages : [],
    details: item.details ?? '',
    experience: item.experience ?? '',
    active: item.active !== false,
    _key: newKey(),
  }));
}

export function HomeFacultyEditor() {
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () => api<{ faculty?: HomeFacultyCard[] }>('/api/cms/public'),
  });
  const settings = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api<{ items: Array<{ key: string; value: unknown }> }>('/api/admin/settings'),
  });
  const [rows, setRows] = useState<FacultyDraft[]>(() => [emptyRow()]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const stored = settings.data?.items.find((item) => item.key === 'home.faculty')?.value;
    if (Array.isArray(stored) && stored.length) {
      setRows(toDrafts(stored as Array<HomeFacultyCard & { active?: boolean }>));
      return;
    }
    if (cms.data?.faculty) setRows(toDrafts(cms.data.faculty));
  }, [cms.data?.faculty, settings.data?.items]);

  function updateRow(index: number, patch: Partial<FacultyDraft>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? [emptyRow()] : prev.filter((_, i) => i !== index)));
  }

  async function onImage(index: number, file: File) {
    const key = rows[index]?._key;
    setUploading(key);
    try {
      const media = await uploadCloudinaryImage(file, 'cms');
      updateRow(index, { imageUrl: media.url });
      toast.success('Faculty image uploaded. Save the section to publish it.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload image.');
    } finally {
      setUploading(null);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const used = new Set<string>();
    const payload = rows
      .filter((row) => row.name.trim())
      .map((row) => {
        const name = row.name.trim();
        let slug = slugify(row.slug || name) || 'teacher';
        const base = slug;
        let n = 2;
        while (used.has(slug)) slug = `${base}-${n++}`;
        used.add(slug);
        return {
          slug,
          name,
          headline: row.headline.trim(),
          bio: row.bio.trim(),
          details: (row.details ?? '').trim(),
          experience: (row.experience ?? '').trim(),
          href: `/teachers/${slug}`,
          imageUrl: row.imageUrl.trim(),
          subjects: Array.isArray(row.subjects) ? row.subjects : [],
          qualifications: Array.isArray(row.qualifications) ? row.qualifications : [],
          languages: Array.isArray(row.languages) ? row.languages : [],
          courseCount: Number(row.courseCount) || 0,
          enrollmentCount: Number(row.enrollmentCount) || 0,
          ratingAvg: Number(row.ratingAvg) || 0,
          ratingCount: Number(row.ratingCount) || 0,
          active: row.active,
        };
      });
    if (!payload.some((row) => row.active)) {
      toast.error('Add at least one active faculty card.');
      return;
    }
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.faculty', value: payload }),
      });
      toast.success('Faculty section saved.');
      await Promise.all([cms.refetch(), settings.refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save faculty cards.');
    } finally {
      setBusy(false);
    }
  }

  async function resetDefaults() {
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.faculty', value: [] }),
      });
      toast.success('Faculty cards cleared. Homepage will use approved teachers until you add cards again.');
      await Promise.all([cms.refetch(), settings.refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset faculty cards.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="gc-card grid gap-4 p-5" onSubmit={save}>
      <div>
        <h2 className="font-display text-xl text-gc-black">Faculty — Meet our educators</h2>
        <p className="mt-1 text-sm text-gc-mute">
          Add, edit, update or delete faculty cards. The same cards appear on the homepage carousel and on Teachers → All
          teachers as a static grid. View Profile opens that teacher’s profile page — fill bio, details, qualifications and
          experience here.
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
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-28 w-20 overflow-hidden rounded-xl border border-gc-line bg-[color:var(--gyan-primary-soft)]">
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
                        accept="image/*"
                        className="sr-only"
                        disabled={uploading === row._key}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void onImage(i, file);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                    {row.imageUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-3 text-xs"
                        onClick={() => updateRow(i, { imageUrl: '' })}
                      >
                        <Trash2 size={14} /> Remove image
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
              <Input
                label="Name"
                placeholder="Ananya Sharma"
                value={row.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const nextSlug = !row.slug || row.slug === slugify(row.name) ? slugify(name) : row.slug;
                  updateRow(i, { name, slug: nextSlug });
                }}
              />
              <Input
                label="Subject line"
                placeholder="Hindi"
                value={row.subjects.join(' • ') || row.headline}
                onChange={(e) =>
                  updateRow(i, {
                    headline: e.target.value,
                    subjects: splitList(e.target.value),
                  })
                }
              />
              <Input
                label="Profile slug"
                placeholder="ananya-sharma"
                value={row.slug}
                onChange={(e) => updateRow(i, { slug: slugify(e.target.value) })}
              />
              <p className="self-end text-xs text-gc-mute md:col-span-1">
                Profile URL: <span className="font-medium text-gc-mist">/teachers/{row.slug || 'name'}</span>
              </p>
              <Input
                label="Courses"
                type="number"
                min={0}
                value={String(row.courseCount)}
                onChange={(e) => updateRow(i, { courseCount: Number(e.target.value) || 0 })}
              />
              <Input
                label="Enrollments"
                type="number"
                min={0}
                value={String(row.enrollmentCount)}
                onChange={(e) => updateRow(i, { enrollmentCount: Number(e.target.value) || 0 })}
              />
              <Input
                label="Rating (0–5)"
                type="number"
                min={0}
                max={5}
                step="0.1"
                value={String(row.ratingAvg)}
                onChange={(e) => updateRow(i, { ratingAvg: Number(e.target.value) || 0 })}
              />
              <Input
                label="Rating count"
                type="number"
                min={0}
                value={String(row.ratingCount)}
                onChange={(e) => updateRow(i, { ratingCount: Number(e.target.value) || 0 })}
              />
              <Input
                label="Experience"
                placeholder="12 years teaching Chemistry"
                className="md:col-span-2"
                value={row.experience ?? ''}
                onChange={(e) => updateRow(i, { experience: e.target.value })}
              />
              <Input
                label="Qualifications"
                placeholder="M.Sc. Chemistry, B.Ed."
                className="md:col-span-2"
                value={listValue(row.qualifications)}
                onChange={(e) => updateRow(i, { qualifications: splitList(e.target.value) })}
              />
              <Input
                label="Languages"
                placeholder="Hindi, English"
                className="md:col-span-2"
                value={listValue(row.languages)}
                onChange={(e) => updateRow(i, { languages: splitList(e.target.value) })}
              />
              <Textarea
                label="Bio"
                className="md:col-span-2"
                value={row.bio}
                onChange={(e) => updateRow(i, { bio: e.target.value })}
              />
              <Textarea
                label="Profile details"
                className="md:col-span-2"
                placeholder="Extra profile copy shown on the teacher page."
                value={row.details ?? ''}
                onChange={(e) => updateRow(i, { details: e.target.value })}
              />
              <label className="flex min-h-10 items-center gap-2 text-sm text-gc-mist md:col-span-2">
                <input type="checkbox" checked={row.active} onChange={(e) => updateRow(i, { active: e.target.checked })} />
                Active on Faculty and Teachers pages
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
          Save faculty
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void resetDefaults()}>
          Reset to catalogue teachers
        </Button>
      </div>
    </form>
  );
}

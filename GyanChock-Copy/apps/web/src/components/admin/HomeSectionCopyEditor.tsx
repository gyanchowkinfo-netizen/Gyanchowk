'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import type { HomeSectionCopy, HomeSectionCopyMap } from '@/lib/types';

const DEFAULTS: HomeSectionCopyMap = {
  discovery: {
    kicker: 'Discovery',
    title: 'Choose your path',
    subtitle: 'Focused learning for exams, academics, careers, and technology.',
  },
  featured: {
    kicker: 'Catalogue',
    title: 'Featured courses',
    subtitle: 'Structured programs designed around outcomes, not endless content.',
  },
  platform: {
    kicker: 'Platform',
    title: 'Built for deep work',
    subtitle: 'Recorded video, tests & ranks, doubts & mentors — plus the workspace that holds them together.',
  },
  mentorship: {
    kicker: 'Mentorship',
    title: 'Never stay stuck.',
    subtitle: 'Ask doubts and receive mentor responses in a written thread — built for recorded learning, not a live-class chat.',
  },
  faculty: {
    kicker: 'Faculty',
    title: 'Meet our educators',
    subtitle: 'Approved educators teaching recorded programmes — without live-class noise.',
  },
};

type SectionKey = keyof HomeSectionCopyMap;

function emptyCopy(): HomeSectionCopy {
  return { kicker: '', title: '', subtitle: '' };
}

export function HomeSectionCopyEditor() {
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () => api<{ sections?: HomeSectionCopyMap }>('/api/cms/public'),
  });
  const [rows, setRows] = useState<HomeSectionCopyMap>(DEFAULTS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cms.data?.sections) setRows({ ...DEFAULTS, ...cms.data.sections });
  }, [cms.data?.sections]);

  function update(key: SectionKey, patch: Partial<HomeSectionCopy>) {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.sections', value: rows }),
      });
      toast.success('Section headings saved.');
      await cms.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save section copy.');
    } finally {
      setBusy(false);
    }
  }

  async function resetDefaults() {
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.sections', value: DEFAULTS }),
      });
      setRows(DEFAULTS);
      toast.success('Section headings restored to defaults.');
      await cms.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset section copy.');
    } finally {
      setBusy(false);
    }
  }

  const blocks: Array<{ key: SectionKey; label: string }> = [
    { key: 'discovery', label: 'Discovery — Choose your path' },
    { key: 'featured', label: 'Catalogue — Featured courses' },
    { key: 'platform', label: 'Platform — Built for deep work' },
    { key: 'mentorship', label: 'Mentorship — Never stay stuck' },
    { key: 'faculty', label: 'Faculty — Meet our educators' },
  ];

  return (
    <form className="gc-card grid gap-4 p-5" onSubmit={save}>
      <div>
        <h2 className="font-display text-xl text-gc-black">Homepage section headings</h2>
        <p className="mt-1 text-sm text-gc-mute">
          Edit the kicker, title and subtitle under Discovery, Featured courses, Platform, Mentorship and Faculty. Delete a subtitle to hide it; restore defaults to bring the original lines back.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {blocks.map((block) => {
          const row = rows[block.key] ?? emptyCopy();
          return (
            <div key={block.key} className="rounded-2xl border border-gc-line p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gc-mute">{block.label}</p>
              <div className="grid gap-3">
                <Input label="Kicker" value={row.kicker} onChange={(e) => update(block.key, { kicker: e.target.value })} />
                <Input label="Title" value={row.title} onChange={(e) => update(block.key, { title: e.target.value })} />
                <Textarea
                  label="Subtitle"
                  value={row.subtitle}
                  onChange={(e) => update(block.key, { subtitle: e.target.value })}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 text-xs"
                    disabled={busy || Boolean(row.subtitle)}
                    onClick={() => update(block.key, { subtitle: DEFAULTS[block.key].subtitle })}
                  >
                    Add subtitle
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 text-xs"
                    disabled={busy || !row.subtitle}
                    onClick={() => update(block.key, { subtitle: '' })}
                  >
                    Delete subtitle
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy}>
          Save headings
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void resetDefaults()}>
          Reset to defaults
        </Button>
      </div>
    </form>
  );
}

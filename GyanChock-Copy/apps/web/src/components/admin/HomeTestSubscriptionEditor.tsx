'use client';

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadCloudinaryImage } from '@/lib/upload';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { TestSubscriptionSection } from '@/components/home/testSubscription/TestSubscriptionSection';
import { TEST_SUBSCRIPTION_ICON_OPTIONS, testSubscriptionIcon } from '@/components/home/testSubscription/icons';
import {
  DEFAULT_HOME_TEST_SUBSCRIPTION,
  TEST_PRIME_VARIANT_OPTIONS,
  hydrateHomeTestSubscription,
} from '@/components/home/testSubscription/defaults';
import type { HomeTestSubscription, TestPrimeVariant, TestSubscriptionBenefit, TestSubscriptionIcon } from '@/lib/types';

type ConfirmKind = 'benefit' | 'image' | 'reset' | 'hide' | null;

function newKey(prefix: string) {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyBenefit(): TestSubscriptionBenefit {
  return {
    id: newKey('benefit'),
    value: '',
    title: '',
    description: '',
    icon: 'ClipboardCheck',
    variant: 'blue',
    order: 99,
    isActive: true,
  };
}

function isSafeHref(value: string) {
  const href = value.trim();
  if (!href) return false;
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const next = index + direction;
  if (next < 0 || next >= items.length) return items;
  const copy = [...items];
  const [row] = copy.splice(index, 1);
  copy.splice(next, 0, row);
  return copy;
}

export function HomeTestSubscriptionEditor() {
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () => api<{ testSubscription?: HomeTestSubscription | null }>('/api/cms/public'),
  });
  const settings = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api<{ items: Array<{ key: string; value: unknown }> }>('/api/admin/settings'),
  });

  const [draft, setDraft] = useState<HomeTestSubscription>(DEFAULT_HOME_TEST_SUBSCRIPTION);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; index?: number }>({ kind: null });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = settings.data?.items.find((item) => item.key === 'home.testSubscription')?.value;
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      setDraft(hydrateHomeTestSubscription(stored));
      return;
    }
    if (cms.data?.testSubscription) setDraft(hydrateHomeTestSubscription(cms.data.testSubscription));
  }, [cms.data?.testSubscription, settings.data?.items]);

  const preview = useMemo(
    () => ({
      ...draft,
      isActive: true,
      benefits: draft.benefits.filter((item) => item.isActive && item.title.trim()),
    }),
    [draft],
  );

  function patch(partial: Partial<HomeTestSubscription>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function validateDraft(next: HomeTestSubscription) {
    const nextErrors: Record<string, string> = {};
    if (!next.title.trim()) nextErrors.title = 'Title is required.';
    if (!next.description.trim()) nextErrors.description = 'Description is required.';
    if (next.isActive) {
      if (!next.primaryButtonText.trim()) nextErrors.primaryButtonText = 'CTA text is required when the section is active.';
      if (!isSafeHref(next.primaryButtonLink)) nextErrors.primaryButtonLink = 'Use an internal path or a valid http(s) URL.';
    } else if (next.primaryButtonLink.trim() && !isSafeHref(next.primaryButtonLink)) {
      nextErrors.primaryButtonLink = 'Use an internal path or a valid http(s) URL.';
    }
    const activeBenefits = next.benefits.filter((item) => item.isActive && item.title.trim());
    if (next.isActive && !activeBenefits.length) nextErrors.benefits = 'Add at least one active benefit card.';
    next.benefits.forEach((item, index) => {
      if (!item.title.trim() && !item.description.trim() && !item.value.trim()) return;
      if (!item.title.trim()) nextErrors[`benefit-title-${index}`] = 'Benefit title is required.';
      if (!item.description.trim()) nextErrors[`benefit-description-${index}`] = 'Benefit description is required.';
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function persist(value: HomeTestSubscription, ok: string) {
    setBusy(true);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'home.testSubscription', value }),
      });
      toast.success(ok);
      await Promise.all([cms.refetch(), settings.refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save Test Prime.');
    } finally {
      setBusy(false);
    }
  }

  function toPayload(next: HomeTestSubscription): HomeTestSubscription {
    return {
      ...next,
      eyebrow: next.eyebrow.trim(),
      badgeLabel: next.badgeLabel.trim(),
      title: next.title.trim(),
      highlightedTitle: next.highlightedTitle.trim(),
      description: next.description.trim(),
      primaryButtonText: next.primaryButtonText.trim(),
      primaryButtonLink: next.primaryButtonLink.trim(),
      heroImage: next.heroImage.trim(),
      heroImageAlt: next.heroImageAlt.trim(),
      motivationalText: DEFAULT_HOME_TEST_SUBSCRIPTION.motivationalText,
      secondaryButtonText: '',
      secondaryButtonLink: '',
      backgroundImage: '',
      benefits: next.benefits.map((item, index) => ({ ...item, order: index + 1 })),
      floatingCards: DEFAULT_HOME_TEST_SUBSCRIPTION.floatingCards,
      examBadges: DEFAULT_HOME_TEST_SUBSCRIPTION.examBadges,
    };
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = toPayload(draft);
    if (!validateDraft(payload)) {
      toast.error('Please fix the highlighted fields before saving.');
      return;
    }
    await persist(payload, 'Test Prime section saved.');
  }

  async function onImage(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error('Use a JPG, PNG or WebP image.');
      return;
    }
    setUploading(true);
    try {
      const media = await uploadCloudinaryImage(file, 'cms');
      patch({ heroImage: media.url });
      toast.success('Image uploaded. Save the section to publish it.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  }

  function runConfirm() {
    const { kind, index } = confirm;
    if (kind === 'benefit' && typeof index === 'number') {
      setDraft((prev) => ({
        ...prev,
        benefits: prev.benefits.length <= 1 ? [emptyBenefit()] : prev.benefits.filter((_, i) => i !== index),
      }));
    }
    if (kind === 'image') patch({ heroImage: DEFAULT_HOME_TEST_SUBSCRIPTION.heroImage });
    if (kind === 'reset') {
      setDraft(DEFAULT_HOME_TEST_SUBSCRIPTION);
      void persist(DEFAULT_HOME_TEST_SUBSCRIPTION, 'Test Prime restored to defaults.');
    }
    if (kind === 'hide') {
      const hidden = toPayload({ ...draft, isActive: false });
      setDraft(hidden);
      void persist(hidden, 'Section hidden on the homepage.');
    }
    setConfirm({ kind: null });
  }

  const confirmCopy = {
    benefit: { title: 'Delete this Test Prime card?', body: 'This benefit will be removed after you save.' },
    image: {
      title: 'Remove this student image?',
      body: 'The default Gyan Chowk illustration will be used until you upload another image.',
    },
    reset: { title: 'Restore default content?', body: 'Custom copy, cards and images will be replaced with Gyan Chowk defaults.' },
    hide: { title: 'Hide this section?', body: 'The homepage will not show Test Prime until you activate it again.' },
  } as const;

  return (
    <form className="gc-card grid gap-5 p-5" onSubmit={save}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-gc-black">Test Prime</h2>
          <p className="mt-1 text-sm text-gc-mute">
            Manage the homepage Test Prime copy, Explore button, student image and benefit cards. Decorative right-side
            elements stay static.
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${draft.isActive ? 'border-[color:var(--gyan-success)]/30 bg-[color:var(--gyan-success-soft)] text-[color:var(--gyan-success)]' : 'border-gc-line text-gc-mute'}`}
        >
          {draft.isActive ? 'Active' : 'Hidden'}
        </span>
      </div>

      <label className="flex min-h-10 items-center gap-2 text-sm text-gc-mist">
        <input type="checkbox" checked={draft.isActive} onChange={(e) => patch({ isActive: e.target.checked })} />
        Show this section on the homepage
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Eyebrow" value={draft.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        <Input label="Prime badge" value={draft.badgeLabel} onChange={(e) => patch({ badgeLabel: e.target.value })} />
        <div className="md:col-span-2">
          <Input label="Title *" value={draft.title} error={errors.title} onChange={(e) => patch({ title: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Input label="Highlighted title" value={draft.highlightedTitle} onChange={(e) => patch({ highlightedTitle: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label="Description *"
            value={draft.description}
            error={errors.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </div>
        <Input
          label="CTA text *"
          value={draft.primaryButtonText}
          error={errors.primaryButtonText}
          onChange={(e) => patch({ primaryButtonText: e.target.value })}
        />
        <Input
          label="CTA URL *"
          placeholder="/student/tests"
          value={draft.primaryButtonLink}
          error={errors.primaryButtonLink}
          onChange={(e) => patch({ primaryButtonLink: e.target.value })}
        />
        <Input label="Student image alt text" value={draft.heroImageAlt} onChange={(e) => patch({ heroImageAlt: e.target.value })} />
      </div>

      <MediaField
        label="Student image"
        src={draft.heroImage}
        alt={draft.heroImageAlt}
        uploading={uploading}
        busy={busy}
        onUpload={(file) => void onImage(file)}
        onRemove={() => setConfirm({ kind: 'image' })}
      />

      <CollectionHeader
        title="Benefit cards"
        error={errors.benefits}
        onAdd={() => patch({ benefits: [...draft.benefits, emptyBenefit()] })}
        addLabel="Add new"
      />
      <div className="space-y-3">
        {draft.benefits.map((row, index) => {
          const Icon = testSubscriptionIcon(row.icon);
          return (
            <div key={row.id} className="rounded-2xl border border-gc-line p-4">
              <RowToolbar
                label={`Benefit ${index + 1}`}
                icon={<Icon size={14} />}
                index={index}
                total={draft.benefits.length}
                onMove={(dir) => patch({ benefits: moveItem(draft.benefits, index, dir) })}
                onDelete={() => setConfirm({ kind: 'benefit', index })}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Number / value"
                  placeholder="1.5 Lakh+"
                  value={row.value}
                  onChange={(e) =>
                    patch({ benefits: draft.benefits.map((item, i) => (i === index ? { ...item, value: e.target.value } : item)) })
                  }
                />
                <Select
                  label="Icon"
                  value={row.icon}
                  onChange={(e) =>
                    patch({
                      benefits: draft.benefits.map((item, i) =>
                        i === index ? { ...item, icon: e.target.value as TestSubscriptionIcon } : item,
                      ),
                    })
                  }
                >
                  {TEST_SUBSCRIPTION_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Title *"
                  value={row.title}
                  error={errors[`benefit-title-${index}`]}
                  onChange={(e) =>
                    patch({ benefits: draft.benefits.map((item, i) => (i === index ? { ...item, title: e.target.value } : item)) })
                  }
                />
                <Select
                  label="Accent"
                  value={row.variant}
                  onChange={(e) =>
                    patch({
                      benefits: draft.benefits.map((item, i) =>
                        i === index ? { ...item, variant: e.target.value as TestPrimeVariant } : item,
                      ),
                    })
                  }
                >
                  {TEST_PRIME_VARIANT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <label className="flex min-h-10 items-center gap-2 self-end text-sm text-gc-mist">
                  <input
                    type="checkbox"
                    checked={row.isActive}
                    onChange={(e) =>
                      patch({
                        benefits: draft.benefits.map((item, i) => (i === index ? { ...item, isActive: e.target.checked } : item)),
                      })
                    }
                  />
                  Active
                </label>
                <div className="md:col-span-2">
                  <Textarea
                    label="Description *"
                    value={row.description}
                    error={errors[`benefit-description-${index}`]}
                    onChange={(e) =>
                      patch({
                        benefits: draft.benefits.map((item, i) => (i === index ? { ...item, description: e.target.value } : item)),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gc-line">
        <p className="border-b border-gc-line bg-[color:var(--gyan-background)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gc-mute">
          Preview
        </p>
        <TestSubscriptionSection data={preview} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy}>
          Save section
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => setConfirm({ kind: 'reset' })}>
          Restore defaults
        </Button>
        <Button type="button" variant="ghost" disabled={busy || !draft.isActive} onClick={() => setConfirm({ kind: 'hide' })}>
          Hide on homepage
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(confirm.kind)}
        title={confirm.kind ? confirmCopy[confirm.kind].title : ''}
        body={confirm.kind ? confirmCopy[confirm.kind].body : ''}
        confirmLabel={confirm.kind === 'reset' ? 'Restore' : confirm.kind === 'hide' ? 'Hide' : 'Delete'}
        onClose={() => setConfirm({ kind: null })}
        onConfirm={runConfirm}
      />
    </form>
  );
}

function CollectionHeader({
  title,
  error,
  onAdd,
  addLabel,
}: {
  title: string;
  error?: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg text-gc-black">{title}</h3>
        <Button type="button" variant="outline" className="h-9 text-xs" onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
      {error ? <p className="mb-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

function RowToolbar({
  label,
  icon,
  index,
  total,
  onMove,
  onDelete,
}: {
  label: string;
  icon: ReactNode;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gc-mute">
        {icon} {label}
      </p>
      <div className="flex flex-wrap gap-1">
        <Button type="button" variant="ghost" className="h-9 px-2" disabled={index === 0} onClick={() => onMove(-1)}>
          <ChevronUp size={16} /> <span className="sr-only">Move up</span>
        </Button>
        <Button type="button" variant="ghost" className="h-9 px-2" disabled={index === total - 1} onClick={() => onMove(1)}>
          <ChevronDown size={16} /> <span className="sr-only">Move down</span>
        </Button>
        <Button type="button" variant="ghost" className="h-9 text-xs" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function MediaField({
  label,
  src,
  alt,
  uploading,
  busy,
  onUpload,
  onRemove,
}: {
  label: string;
  src: string;
  alt: string;
  uploading: boolean;
  busy: boolean;
  onUpload: (file: File) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gc-line p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gc-mute">{label}</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="h-24 w-40 overflow-hidden rounded-xl border border-gc-line bg-[color:var(--gyan-primary-soft)]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} className="h-full w-full object-contain" />
          ) : (
            <div className="grid h-full place-items-center text-xs text-gc-mute">No image</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="gc-btn-outline h-9 cursor-pointer px-3 text-xs">
            <ImagePlus size={14} /> {src ? 'Replace image' : 'Upload image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="sr-only"
              disabled={uploading || busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.currentTarget.value = '';
              }}
            />
          </label>
          {src && onRemove ? (
            <Button type="button" variant="ghost" className="h-9 px-3 text-xs" onClick={onRemove}>
              <Trash2 size={14} /> Remove
            </Button>
          ) : null}
          {uploading ? <span className="self-center text-xs text-gc-mute">Uploading…</span> : null}
        </div>
      </div>
    </div>
  );
}

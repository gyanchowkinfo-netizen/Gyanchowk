'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadCloudinaryImage } from '@/lib/upload';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatInr } from '@/lib/format';
import { useAuthQueryEnabled } from '@/lib/hooks';

type CourseRow = {
  _id: string;
  title: string;
  subtitle?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  price?: number;
  discountPercent?: number;
  pricingType?: string;
  enrollmentCount?: number;
  thumbnail?: { url?: string; publicId?: string };
};

export function HomeFeaturedCoursesEditor() {
  const enabled = useAuthQueryEnabled();
  const query = useQuery({
    queryKey: ['admin-cms-courses'],
    queryFn: () => api<{ items: CourseRow[] }>('/api/courses?limit=50'),
    enabled,
  });
  const items = query.data?.items ?? [];
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  async function patchCourse(id: string, body: Record<string, unknown>, ok: string) {
    setBusyId(id);
    try {
      await api(`/api/courses/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast.success(ok);
      await query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setBusyId(null);
    }
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const f = new FormData(e.currentTarget);
    try {
      await api('/api/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: f.get('title'),
          subtitle: f.get('subtitle'),
          category: f.get('category'),
          pricingType: f.get('pricingType') || 'paid',
          price: Number(f.get('price') || 0),
          discountPercent: Number(f.get('discountPercent') || 0),
          featured: f.get('featured') === 'on',
        }),
      });
      toast.success('Course created.');
      setCreateOpen(false);
      e.currentTarget.reset();
      await query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create course.');
    } finally {
      setCreating(false);
    }
  }

  async function onImage(id: string, file: File) {
    setBusyId(id);
    try {
      const media = await uploadCloudinaryImage(file, 'courses');
      await patchCourse(id, { thumbnail: media }, 'Course image updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed.');
      setBusyId(null);
    }
  }

  return (
    <section className="gc-card grid gap-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-gc-black">Featured courses &amp; catalogue</h2>
          <p className="mt-1 text-sm text-gc-mute">
            Create courses, upload cover images, feature them on the homepage, edit details, or archive. Featured courses appear first in the homepage strip.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setCreateOpen((v) => !v)}>
            {createOpen ? 'Close form' : 'Create course'}
          </Button>
          <Link href="/admin/courses" className="gc-btn-outline min-h-11 px-4">
            Full course admin
          </Link>
        </div>
      </div>

      {createOpen ? (
        <form className="grid gap-3 rounded-2xl border border-gc-line p-4 md:grid-cols-2" onSubmit={onCreate}>
          <Input name="title" label="Title" required className="md:col-span-2" placeholder="JEE Main Physics Mastery" />
          <Textarea name="subtitle" label="Subtitle" className="md:col-span-2" placeholder="Concept-first recorded lessons…" />
          <Input name="category" label="Category" placeholder="JEE" />
          <Select name="pricingType" label="Pricing" defaultValue="paid">
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </Select>
          <Input name="price" label="Price (INR)" type="number" defaultValue={3999} />
          <Input name="discountPercent" label="Discount %" type="number" defaultValue={0} />
          <label className="flex min-h-10 items-center gap-2 text-sm text-gc-mist md:col-span-2">
            <input type="checkbox" name="featured" defaultChecked className="accent-[color:var(--brand-navy)]" />
            Feature on homepage
          </label>
          <Button type="submit" loading={creating} className="md:col-span-2 w-fit">
            Create course
          </Button>
        </form>
      ) : null}

      {query.isLoading ? <LoadingState label="Loading courses…" /> : null}
      {query.isError ? <ErrorState message="Unable to load courses." onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState title="No courses yet" body="Create a course to populate the Featured courses section." />
      ) : null}

      {items.length ? (
        <div className="space-y-3">
          {items.map((course) => (
            <article key={course._id} className="rounded-2xl border border-gc-line p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="gc-course-media h-28 w-full shrink-0 overflow-hidden rounded-xl lg:h-24 lg:w-40">
                  {course.thumbnail?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-white/85">No cover image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gc-black">{course.title}</p>
                      <p className="mt-1 text-xs text-gc-mute">
                        {[course.category, course.status, course.featured ? 'Featured' : null].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[color:var(--brand-navy)]">
                        {course.pricingType === 'free' ? 'Free' : formatInr(course.price ?? 0)}
                        {course.enrollmentCount != null ? (
                          <span className="ml-2 text-xs font-normal text-gc-mute">{course.enrollmentCount} enrolled</span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="gc-btn-outline h-9 cursor-pointer px-3 text-xs">
                        <ImagePlus size={14} /> Image
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={busyId === course._id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (file) void onImage(course._id, file);
                          }}
                        />
                      </label>
                      <Button type="button" variant="ghost" className="h-9 text-xs" onClick={() => setEditId(editId === course._id ? null : course._id)}>
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 text-xs"
                        disabled={busyId === course._id}
                        onClick={() =>
                          void patchCourse(
                            course._id,
                            { featured: !course.featured },
                            course.featured ? 'Removed from featured.' : 'Marked as featured.',
                          )
                        }
                      >
                        {course.featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        type="button"
                        variant={course.status === 'published' ? 'ghost' : 'primary'}
                        className="h-9 text-xs"
                        disabled={busyId === course._id}
                        onClick={() =>
                          void patchCourse(
                            course._id,
                            { status: course.status === 'published' ? 'draft' : 'published' },
                            course.status === 'published' ? 'Unpublished.' : 'Published.',
                          )
                        }
                      >
                        {course.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button type="button" variant="danger" className="h-9 text-xs" onClick={() => setArchiveId(course._id)}>
                        <Trash2 size={14} /> Archive
                      </Button>
                    </div>
                  </div>
                  {editId === course._id ? (
                    <CourseEditForm
                      course={course}
                      busy={busyId === course._id}
                      onSave={async (body) => {
                        await patchCourse(course._id, body, 'Course updated.');
                        setEditId(null);
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(archiveId)}
        title="Archive this course?"
        body="It will be removed from the public catalogue and homepage featured strip."
        confirmLabel="Archive"
        onClose={() => setArchiveId(null)}
        onConfirm={() => {
          if (!archiveId) return;
          void patchCourse(archiveId, { status: 'archived' }, 'Course archived.').then(() => setArchiveId(null));
        }}
      />
    </section>
  );
}

function CourseEditForm({
  course,
  busy,
  onSave,
}: {
  course: CourseRow;
  busy: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState(course.title);
  const [subtitle, setSubtitle] = useState(course.subtitle ?? '');
  const [category, setCategory] = useState(course.category ?? '');
  const [price, setPrice] = useState(String(course.price ?? 0));
  const [discount, setDiscount] = useState(String(course.discountPercent ?? 0));

  return (
    <form
      className="mt-4 grid gap-3 border-t border-gc-line pt-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          title: title.trim(),
          subtitle: subtitle.trim(),
          category: category.trim(),
          price: Number(price) || 0,
          discountPercent: Number(discount) || 0,
        });
      }}
    >
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="md:col-span-2" />
      <Textarea label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="md:col-span-2" />
      <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <Input label="Price (INR)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      <Input label="Discount %" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
      <Button type="submit" loading={busy} className="md:col-span-2 w-fit">
        Update course
      </Button>
    </form>
  );
}

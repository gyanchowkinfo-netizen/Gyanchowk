'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Pencil, Trash2, ExternalLink, Sliders } from 'lucide-react';
import { CourseDetailAdminDrawer } from '@/components/courses/detail/CourseDetailAdminDrawer';
import type { CourseDetail } from '@/lib/types';
import { api } from '@/lib/api';
import { uploadCloudinaryImage } from '@/lib/upload';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatInr, formatStartedOn } from '@/lib/format';
import { useAuthQueryEnabled } from '@/lib/hooks';

type CourseRow = {
  _id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  category?: string;
  targetExam?: string;
  status?: string;
  featured?: boolean;
  price?: number;
  discountPercent?: number;
  pricingType?: string;
  enrollmentCount?: number;
  language?: string;
  foundation?: string;
  startsOn?: string;
  teacherName?: string;
  thumbnail?: { url?: string; publicId?: string };
};

function toDateInput(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function HomeFeaturedCoursesEditor() {
  const enabled = useAuthQueryEnabled();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-cms-courses'],
    queryFn: () => api<{ items: CourseRow[] }>('/api/courses?limit=50'),
    enabled,
  });
  const items = query.data?.items ?? [];
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detailCourse, setDetailCourse] = useState<CourseDetail | null>(null);
  const [loadingDetailSlug, setLoadingDetailSlug] = useState<string | null>(null);

  async function openCourseDetailManager(slug?: string) {
    if (!slug) {
      toast.error('Course slug missing');
      return;
    }
    setLoadingDetailSlug(slug);
    try {
      const res = await api<{ course: CourseDetail }>(`/api/courses/${slug}`);
      if (res?.course) {
        setDetailCourse(res.course);
      } else {
        toast.error('Failed to load course details.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch course details.');
    } finally {
      setLoadingDetailSlug(null);
    }
  }

  async function refreshPublicCatalogue() {
    await Promise.all([
      query.refetch(),
      queryClient.invalidateQueries({ queryKey: ['cms-public'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-cms-courses'] }),
    ]);
  }

  async function patchCourse(id: string, body: Record<string, unknown>, ok: string) {
    setBusyId(id);
    try {
      await api(`/api/courses/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast.success(ok);
      await refreshPublicCatalogue();
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
    const startsOnRaw = String(f.get('startsOn') || '').trim();
    try {
      await api('/api/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: f.get('title'),
          subtitle: f.get('subtitle'),
          category: f.get('category'),
          targetExam: String(f.get('targetExam') || '').trim() || undefined,
          foundation: String(f.get('foundation') || '').trim() || 'Foundation',
          language: String(f.get('language') || '').trim() || 'English',
          teacherName: String(f.get('teacherName') || '').trim() || 'Expert Faculty',
          startsOn: startsOnRaw || null,
          pricingType: f.get('pricingType') || 'paid',
          price: Number(f.get('price') || 0),
          discountPercent: Number(f.get('discountPercent') || 0),
          featured: f.get('featured') === 'on',
        }),
      });
      toast.success('Course created.');
      setCreateOpen(false);
      e.currentTarget.reset();
      await refreshPublicCatalogue();
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

  async function onDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api(`/api/courses/${deleteId}`, { method: 'DELETE' });
      toast.success('Course deleted.');
      setDeleteId(null);
      await refreshPublicCatalogue();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete course.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="gc-card grid gap-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-gc-black">Catalogue Courses</h2>
          <p className="mt-1 text-sm text-gc-mute">
            Add, edit, update or delete homepage catalogue cards — including Target Exam, foundation, language, start date,
            price and cover image.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setCreateOpen((v) => !v)}>
            {createOpen ? 'Close form' : 'Add new course'}
          </Button>
          <Link href="/admin/courses" className="gc-btn-outline min-h-11 px-4">
            Full course admin
          </Link>
        </div>
      </div>

      {createOpen ? (
        <form className="grid gap-3 rounded-2xl border border-gc-line p-4 md:grid-cols-2" onSubmit={onCreate}>
          <Input name="title" label="Title" required className="md:col-span-2" placeholder="JEE Main Physics Mastery" />
          <Input name="teacherName" label="Faculty / Teacher Name" defaultValue="Expert Faculty" placeholder="e.g. Expert Faculty" />
          <Input name="foundation" label="Foundation / level" defaultValue="Foundation" placeholder="Foundation" />
          <Input name="language" label="Language" defaultValue="English" placeholder="English / Hindi / Hinglish" />
          <Input name="startsOn" label="Started on" type="date" />
          <Input name="targetExam" label="Target Exam" placeholder="JEE Main" required />
          <Input name="category" label="Category" placeholder="JEE" />
          <Select name="pricingType" label="Pricing" defaultValue="paid">
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </Select>
          <Input name="price" label="Price (INR)" type="number" defaultValue={3999} />
          <Input name="discountPercent" label="Discount %" type="number" defaultValue={0} />
          <Textarea name="subtitle" label="Subtitle (optional, hidden on catalogue card)" className="md:col-span-2" />
          <label className="flex min-h-10 items-center gap-2 text-sm text-gc-mist md:col-span-2">
            <input type="checkbox" name="featured" defaultChecked className="accent-[color:var(--brand-navy)]" />
            Feature on homepage catalogue
          </label>
          <Button type="submit" loading={creating} className="md:col-span-2 w-fit">
            Create course
          </Button>
        </form>
      ) : null}

      {query.isLoading ? <LoadingState label="Loading courses…" /> : null}
      {query.isError ? <ErrorState message="Unable to load courses." onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState title="No courses yet" body="Create a course to populate the homepage Catalogue section." />
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
                        {[
                          course.targetExam ? `Target Exam: ${course.targetExam}` : null,
                          course.foundation || 'Foundation',
                          course.language || 'English',
                          course.startsOn ? `Started ${formatStartedOn(course.startsOn)}` : null,
                          course.status,
                          course.featured ? 'Featured' : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[color:var(--brand-navy)]">
                        {course.pricingType === 'free' ? 'Free' : formatInr(course.price ?? 0)}
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
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 text-xs"
                        onClick={() => setEditId(editId === course._id ? null : course._id)}
                      >
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
                      <Button type="button" variant="danger" className="h-9 text-xs" onClick={() => setDeleteId(course._id)}>
                        <Trash2 size={14} /> Delete
                      </Button>
                      <Button
                        type="button"
                        className="h-9 text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs border border-amber-500/60"
                        disabled={loadingDetailSlug === course.slug}
                        onClick={() => void openCourseDetailManager(course.slug)}
                        title="Manage all course sections: Hero, Banner, Highlights, Features, Includes, Curriculum, Instructor, FAQs, CTA"
                      >
                        <Sliders size={13} /> {loadingDetailSlug === course.slug ? 'Loading…' : 'Manage Details'}
                      </Button>
                      <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <ExternalLink size={13} /> View Detail Page
                      </Link>
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
        open={Boolean(deleteId)}
        title="Delete this course?"
        body="This permanently removes the course from the catalogue and homepage. This cannot be undone."
        confirmLabel="Delete course"
        loading={deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void onDelete()}
      />

      {detailCourse && (
        <CourseDetailAdminDrawer
          course={detailCourse}
          open={Boolean(detailCourse)}
          onClose={() => setDetailCourse(null)}
          onUpdated={() => void refreshPublicCatalogue()}
        />
      )}
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
  const [teacherName, setTeacherName] = useState(course.teacherName || 'Expert Faculty');
  const [foundation, setFoundation] = useState(course.foundation || 'Foundation');
  const [language, setLanguage] = useState(course.language || 'English');
  const [startsOn, setStartsOn] = useState(toDateInput(course.startsOn));
  const [targetExam, setTargetExam] = useState(course.targetExam ?? '');
  const [category, setCategory] = useState(course.category ?? '');
  const [price, setPrice] = useState(String(course.price ?? 0));
  const [discount, setDiscount] = useState(String(course.discountPercent ?? 0));
  const [subtitle, setSubtitle] = useState(course.subtitle ?? '');

  return (
    <form
      className="mt-4 grid gap-3 border-t border-gc-line pt-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          title: title.trim(),
          teacherName: teacherName.trim() || 'Expert Faculty',
          foundation: foundation.trim() || 'Foundation',
          language: language.trim() || 'English',
          startsOn: startsOn || null,
          targetExam: targetExam.trim(),
          category: category.trim(),
          subtitle: subtitle.trim(),
          price: Number(price) || 0,
          discountPercent: Number(discount) || 0,
        });
      }}
    >
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="md:col-span-2" />
      <Input
        label="Faculty / Teacher Name"
        value={teacherName}
        onChange={(e) => setTeacherName(e.target.value)}
        placeholder="e.g. Expert Faculty"
      />
      <Input
        label="Foundation / level"
        value={foundation}
        onChange={(e) => setFoundation(e.target.value)}
        placeholder="Foundation"
      />
      <Input
        label="Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        placeholder="English / Hindi / Hinglish"
      />
      <Input label="Started on" type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
      <Input
        label="Target Exam"
        value={targetExam}
        onChange={(e) => setTargetExam(e.target.value)}
        placeholder="JEE Main"
        required
      />
      <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <Input label="Price (INR)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      <Input label="Discount %" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
      <Textarea label="Subtitle (optional)" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="md:col-span-2" />
      <Button type="submit" loading={busy} className="md:col-span-2 w-fit">
        Update course
      </Button>
    </form>
  );
}

'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, BookOpen, Eye, Send, ExternalLink, Layers, CheckCircle2, Edit2, AlertCircle, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Overlay';
import { StatusBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { CourseCurriculumManager } from '@/components/teachers/CourseCurriculumManager';

const STEPS = ['Basic info', 'Pricing', 'Create'];

export default function TeacherCoursesPage() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('courseId');

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourseId);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editCourse, setEditCourse] = useState<Record<string, any> | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-courses-list'],
    queryFn: () => api<{ items: Array<Record<string, any>>; total?: number }>('/api/courses?mine=1&limit=50'),
  });

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const created = await api<{ course: { _id: string } }>('/api/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          subtitle: form.get('subtitle'),
          description: form.get('description'),
          pricingType: form.get('pricingType'),
          price: Number(form.get('price') || 0),
          category: form.get('category'),
          targetExam: form.get('targetExam'),
          level: form.get('level') || 'Advanced',
          language: form.get('language') || 'English',
          duration: form.get('duration') || '12 Months',
          validityDays: Number(form.get('validityDays') || 365),
          certificateEnabled: form.get('certificate') === 'on',
        }),
      });
      toast.success('Course created as draft! You can now build its curriculum and add lessons.');
      setStep(0);
      setShowCreateWizard(false);
      e.currentTarget.reset();
      await refetch();
      if (created?.course?._id) {
        setSelectedCourseId(created.course._id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create course');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editCourse?._id) return;
    setSavingEdit(true);
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/courses/${editCourse._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: form.get('title'),
          subtitle: form.get('subtitle'),
          description: form.get('description'),
          category: form.get('category'),
          targetExam: form.get('targetExam'),
          level: form.get('level'),
          language: form.get('language'),
          duration: form.get('duration'),
          pricingType: form.get('pricingType'),
          price: Number(form.get('price') || 0),
          validityDays: Number(form.get('validityDays') || 365),
        }),
      });
      toast.success('Course details updated successfully');
      setEditCourse(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  }

  // If a course is selected for curriculum editing, render the Curriculum Manager
  if (selectedCourseId) {
    return (
      <CourseCurriculumManager
        courseId={selectedCourseId}
        onBack={() => {
          setSelectedCourseId(null);
          void refetch();
        }}
      />
    );
  }

  const courses = data?.items ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gc-black">My Courses & Curriculum</h1>
          <p className="mt-1 text-sm text-gc-mute">
            Create draft courses, construct your curriculum (subjects &rarr; chapters &rarr; topics &rarr; lessons), and submit for admin review.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateWizard((prev) => !prev)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> {showCreateWizard ? 'Close Creator' : 'Create New Course'}
        </Button>
      </div>

      {/* Course Creator Form */}
      {showCreateWizard && (
        <div className="gc-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gc-line pb-3">
            <h2 className="font-display text-xl font-semibold text-gc-black">New Course Wizard</h2>
            <ol className="flex gap-2 text-xs">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={`rounded-full px-3 py-1 font-medium ${
                    i === step ? 'bg-gc-gold text-black' : 'bg-stone-100 text-gc-mute'
                  }`}
                >
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
          </div>

          <form onSubmit={create} className="grid gap-3 md:grid-cols-2">
            <div className={step === 0 ? 'contents' : 'hidden'}>
              <Input name="title" required label="Course Title" placeholder="e.g. Complete JEE Physics Mastery" className="md:col-span-2" />
              <Input name="subtitle" label="Subtitle / Tagline" placeholder="Targeted problem solving and theory" className="md:col-span-2" />
              <Input name="category" label="Category" placeholder="JEE, NEET, Foundation…" />
              <Input name="targetExam" label="Target Exam" placeholder="JEE Main & Advanced" />
              <Select name="level" label="Level" defaultValue="Intermediate">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </Select>
              <Select name="language" label="Language" defaultValue="English">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </Select>
              <Input name="duration" label="Duration" placeholder="e.g. 12 Months or 60 Hours" defaultValue="12 Months" className="md:col-span-2" />
              <Textarea name="description" label="Detailed Course Description" className="md:col-span-2" />
            </div>

            <div className={step === 1 ? 'contents' : 'hidden'}>
              <Select name="pricingType" label="Pricing Model" defaultValue="paid">
                <option value="paid">Paid Course</option>
                <option value="free">Free Course</option>
              </Select>
              <Input name="price" type="number" min={0} label="Price (INR)" placeholder="e.g. 2999" />
              <Input name="validityDays" type="number" min={1} label="Enrollment Validity (Days)" defaultValue={365} />
              <label className="flex items-center gap-2 text-sm text-gc-black pt-3 md:col-span-2">
                <input type="checkbox" name="certificate" defaultChecked className="accent-gc-gold h-4 w-4" suppressHydrationWarning />
                Issue certificate upon completion
              </label>
            </div>

            {step === 2 && (
              <div className="md:col-span-2 rounded-xl bg-amber-50/60 border border-amber-200/80 p-4 text-xs text-amber-900">
                <p className="font-semibold text-sm mb-1">Ready to create course?</p>
                <p>
                  The course will be saved as a <strong>Draft</strong>. Immediately after creating, you will be taken to the Curriculum Builder to add subjects, chapters, topics, video lectures, and study materials.
                </p>
              </div>
            )}

            <div className="md:col-span-2 flex justify-between gap-2 pt-2 border-t border-gc-line">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              ) : <span />}
              <Button loading={busy} type="submit">
                {step < 2 ? 'Next Step' : 'Create Draft Course'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-gc-black">Your Courses Catalogue</h2>

        {isLoading && <LoadingState />}
        {error && <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />}

        {!isLoading && !error && courses.length === 0 && (
          <EmptyState
            title="No courses created yet"
            body="Click 'Create New Course' to launch your first course and start structuring your curriculum."
          />
        )}

        {courses.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((c) => (
              <div key={c._id} className="gc-card p-5 flex flex-col justify-between gap-4 hover:border-gc-blue/40 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-gc-black line-clamp-1">{c.title}</h3>
                    <StatusBadge status={c.status || 'draft'} />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-gc-mute bg-gc-canvas-subtle px-2 py-0.5 rounded border border-gc-border select-all">
                      Course ID: {c._id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(c._id);
                        toast.success('Course ID copied');
                      }}
                      className="text-[11px] text-gc-primary hover:underline flex items-center gap-1 cursor-pointer"
                      title="Copy Course ID"
                    >
                      <Copy size={11} /> Copy ID
                    </button>
                  </div>
                  {c.subtitle && <p className="mt-1 text-xs text-gc-mute line-clamp-2">{c.subtitle}</p>}
                  
                  {c.approvalNotes && c.status === 'draft' && (
                    <div className="mt-2.5 rounded-lg border border-amber-300 bg-amber-50/80 p-2.5 text-xs text-amber-900">
                      <p className="font-semibold flex items-center gap-1 text-amber-800">
                        <AlertCircle size={13} /> Admin review feedback:
                      </p>
                      <p className="mt-0.5 text-stone-700">{c.approvalNotes}</p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gc-mist">
                    <span>Target: <strong>{c.targetExam || c.category || 'General'}</strong></span>
                    <span>Level: <strong>{c.level || 'Advanced'}</strong></span>
                    <span>Lang: <strong>{c.language || 'English'}</strong></span>
                    <span>Pricing: <strong>{c.pricingType === 'free' ? 'Free' : `₹${c.price}`}</strong></span>
                    <span>Enrolled: <strong>{c.enrollmentCount || 0}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gc-line">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseId(c._id)}
                    className="gc-btn-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-3"
                  >
                    <Layers size={14} /> Curriculum Builder
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditCourse(c)}
                    className="gc-btn-ghost inline-flex items-center gap-1 text-xs py-1.5 px-2.5"
                    title="Edit course metadata"
                  >
                    <Edit2 size={13} /> Edit Info
                  </button>

                  <Link
                    href={`/student/learning/${c._id}?preview=1`}
                    target="_blank"
                    className="gc-btn-ghost inline-flex items-center gap-1 text-xs py-1.5 px-2.5"
                    title="Preview student classroom"
                  >
                    <Eye size={13} /> Preview <ExternalLink size={11} />
                  </Link>

                  {c.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCourseId(c._id)}
                      className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 ml-auto"
                    >
                      <Send size={12} /> Submit
                    </button>
                  )}

                  {c.status === 'published' && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium ml-auto">
                      <CheckCircle2 size={13} /> Live on Store
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Course Details Modal */}
      {editCourse && (
        <Modal
          open={Boolean(editCourse)}
          onClose={() => setEditCourse(null)}
          title={`Edit Course: ${editCourse.title}`}
        >
          <form onSubmit={handleUpdateCourse} className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gc-canvas-subtle border border-gc-border text-xs">
              <span className="text-gc-mute">Course ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-gc-ink select-all">{editCourse._id}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(editCourse._id);
                    toast.success('Course ID copied');
                  }}
                  className="text-gc-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
            <Input name="title" defaultValue={editCourse.title} required label="Course Title" />
            <Input name="subtitle" defaultValue={editCourse.subtitle ?? ''} label="Subtitle / Tagline" />
            <div className="grid grid-cols-2 gap-3">
              <Input name="category" defaultValue={editCourse.category ?? ''} label="Category" placeholder="JEE, NEET…" />
              <Input name="targetExam" defaultValue={editCourse.targetExam ?? ''} label="Target Exam" placeholder="JEE Main" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Select name="level" label="Level" defaultValue={editCourse.level ?? 'Intermediate'}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </Select>
              <Select name="language" label="Language" defaultValue={editCourse.language ?? 'English'}>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </Select>
              <Input name="duration" defaultValue={editCourse.duration ?? '12 Months'} label="Duration" placeholder="e.g. 12 Months" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Select name="pricingType" label="Pricing" defaultValue={editCourse.pricingType ?? 'paid'}>
                <option value="paid">Paid</option>
                <option value="free">Free</option>
              </Select>
              <Input name="price" type="number" min={0} defaultValue={editCourse.price ?? 0} label="Price (INR)" />
              <Input name="validityDays" type="number" min={1} defaultValue={editCourse.validityDays ?? 365} label="Validity (Days)" />
            </div>
            <Textarea name="description" defaultValue={editCourse.description ?? ''} label="Detailed Description" rows={4} />

            <div className="flex justify-end gap-2 pt-3 border-t border-gc-line">
              <Button type="button" variant="ghost" onClick={() => setEditCourse(null)}>
                Cancel
              </Button>
              <Button loading={savingEdit} type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

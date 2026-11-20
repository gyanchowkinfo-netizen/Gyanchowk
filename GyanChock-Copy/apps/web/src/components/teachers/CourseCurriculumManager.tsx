'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  FolderPlus,
  Plus,
  PlayCircle,
  FileText,
  Trash2,
  Edit2,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Overlay';
import { LoadingState } from '@/components/ui/States';
import { StatusBadge } from '@/components/ui/Badge';

export interface CurriculumData {
  course: {
    _id: string;
    title: string;
    slug: string;
    subtitle?: string;
    description?: string;
    status: string;
    category?: string;
    targetExam?: string;
    level?: string;
    language?: string;
    duration?: string;
    pricingType?: string;
    price?: number;
    validityDays?: number;
    approvalNotes?: string;
    thumbnail?: { url?: string };
  };
  subjects: Array<{ _id: string; name: string; slug: string; order: number; description?: string }>;
  chapters: Array<{ _id: string; name: string; slug: string; subject: string; order: number; description?: string }>;
  topics: Array<{ _id: string; name: string; slug: string; chapter: string; order: number; description?: string }>;
  lessons: Array<{
    _id: string;
    title: string;
    slug: string;
    topic: string;
    chapter?: string;
    order: number;
    durationSec?: number;
    isDemo?: boolean;
    description?: string;
    video?: { _id: string; title: string; duration?: number };
  }>;
  materials: Array<{ _id: string; title: string; type: string; url?: string }>;
  tests: Array<{ _id: string; title: string; category?: string; totalMarks?: number }>;
  assignments: Array<{ _id: string; title: string; totalMarks?: number }>;
  availableVideos: Array<{ _id: string; title: string; duration?: number }>;
}

export function CourseCurriculumManager({
  courseId,
  onBack,
}: {
  courseId: string;
  onBack: () => void;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['curriculum', courseId],
    queryFn: () => api<CurriculumData>(`/api/catalog/curriculum/${courseId}`),
  });

  // Modal states
  const [subjectModal, setSubjectModal] = useState<{ open: boolean; id?: string; name: string; description: string; order: number }>({
    open: false,
    name: '',
    description: '',
    order: 0,
  });

  const [chapterModal, setChapterModal] = useState<{ open: boolean; subjectId: string; id?: string; name: string; description: string; order: number }>({
    open: false,
    subjectId: '',
    name: '',
    description: '',
    order: 0,
  });

  const [topicModal, setTopicModal] = useState<{ open: boolean; chapterId: string; id?: string; name: string; description: string; order: number }>({
    open: false,
    chapterId: '',
    name: '',
    description: '',
    order: 0,
  });

  const [lessonModal, setLessonModal] = useState<{
    open: boolean;
    topicId: string;
    chapterId?: string;
    id?: string;
    title: string;
    description: string;
    video: string;
    durationMin: number;
    isDemo: boolean;
    order: number;
  }>({
    open: false,
    topicId: '',
    title: '',
    description: '',
    video: '',
    durationMin: 0,
    isDemo: false,
    order: 0,
  });

  const [submittingReview, setSubmittingReview] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const toggleSubject = (id: string) => setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleChapter = (id: string) => setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));

  if (isLoading) return <LoadingState />;
  if (error || !data) return <div className="gc-card p-6 text-red-600">Failed to load course curriculum.</div>;

  const { course, subjects, chapters, topics, lessons, availableVideos } = data;

  // Validation
  const hasTitle = Boolean(course.title && course.title.trim().length >= 3);
  const hasSubjects = subjects.length > 0;
  const hasLessons = lessons.length > 0;
  const isReadyForReview = hasTitle && hasSubjects && hasLessons;

  // Submit for Review
  async function handleSubmitReview() {
    if (!isReadyForReview) {
      toast.error('Complete the required checklist before submitting: at least 1 subject and 1 lesson are required.');
      return;
    }
    setSubmittingReview(true);
    try {
      await api(`/api/courses/${courseId}/submit-review`, { method: 'POST' });
      toast.success('Course submitted for review. An administrator will verify and publish it.');
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmittingReview(false);
    }
  }

  // Course Details Save
  async function saveCourseDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingCourse(true);
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/courses/${courseId}`, {
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
      setCourseModalOpen(false);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingCourse(false);
    }
  }

  // Subject Save
  async function saveSubject() {
    try {
      if (!subjectModal.name.trim()) return toast.error('Subject name is required');
      if (subjectModal.id) {
        await api(`/api/catalog/subjects/${subjectModal.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: subjectModal.name, description: subjectModal.description, order: subjectModal.order }),
        });
        toast.success('Subject updated');
      } else {
        await api('/api/catalog/subjects', {
          method: 'POST',
          body: JSON.stringify({ course: courseId, name: subjectModal.name, description: subjectModal.description, order: subjectModal.order }),
        });
        toast.success('Subject created');
      }
      setSubjectModal({ open: false, name: '', description: '', order: 0 });
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  // Subject Delete
  async function deleteSubject(id: string) {
    if (!confirm('Are you sure you want to delete this subject and all its chapters, topics, and lessons?')) return;
    try {
      await api(`/api/catalog/subjects/${id}`, { method: 'DELETE' });
      toast.success('Subject deleted');
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // Chapter Save
  async function saveChapter() {
    try {
      if (!chapterModal.name.trim()) return toast.error('Chapter name is required');
      if (chapterModal.id) {
        await api(`/api/catalog/chapters/${chapterModal.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: chapterModal.name, description: chapterModal.description, order: chapterModal.order }),
        });
        toast.success('Chapter updated');
      } else {
        await api('/api/catalog/chapters', {
          method: 'POST',
          body: JSON.stringify({
            course: courseId,
            subject: chapterModal.subjectId,
            name: chapterModal.name,
            description: chapterModal.description,
            order: chapterModal.order,
          }),
        });
        toast.success('Chapter created');
      }
      setChapterModal({ open: false, subjectId: '', name: '', description: '', order: 0 });
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  // Chapter Delete
  async function deleteChapter(id: string) {
    if (!confirm('Delete this chapter and all its topics and lessons?')) return;
    try {
      await api(`/api/catalog/chapters/${id}`, { method: 'DELETE' });
      toast.success('Chapter deleted');
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // Topic Save
  async function saveTopic() {
    try {
      if (!topicModal.name.trim()) return toast.error('Topic name is required');
      if (topicModal.id) {
        await api(`/api/catalog/topics/${topicModal.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: topicModal.name, description: topicModal.description, order: topicModal.order }),
        });
        toast.success('Topic updated');
      } else {
        await api('/api/catalog/topics', {
          method: 'POST',
          body: JSON.stringify({
            course: courseId,
            chapter: topicModal.chapterId,
            name: topicModal.name,
            description: topicModal.description,
            order: topicModal.order,
          }),
        });
        toast.success('Topic created');
      }
      setTopicModal({ open: false, chapterId: '', name: '', description: '', order: 0 });
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  // Topic Delete
  async function deleteTopic(id: string) {
    if (!confirm('Delete this topic and its lessons?')) return;
    try {
      await api(`/api/catalog/topics/${id}`, { method: 'DELETE' });
      toast.success('Topic deleted');
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // Lesson Save
  async function saveLesson() {
    try {
      if (!lessonModal.title.trim()) return toast.error('Lesson title is required');
      const payload = {
        title: lessonModal.title,
        description: lessonModal.description,
        isDemo: lessonModal.isDemo,
        durationSec: Math.round(lessonModal.durationMin * 60),
        order: lessonModal.order,
        video: lessonModal.video || undefined,
      };

      if (lessonModal.id) {
        await api(`/api/catalog/lessons/${lessonModal.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Lesson updated');
      } else {
        await api('/api/catalog/lessons', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            course: courseId,
            topic: lessonModal.topicId,
            chapter: lessonModal.chapterId,
          }),
        });
        toast.success('Lesson created');
      }
      setLessonModal({
        open: false,
        topicId: '',
        title: '',
        description: '',
        video: '',
        durationMin: 0,
        isDemo: false,
        order: 0,
      });
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  // Lesson Delete
  async function deleteLesson(id: string) {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api(`/api/catalog/lessons/${id}`, { method: 'DELETE' });
      toast.success('Lesson deleted');
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gc-mist hover:text-gc-black"
        >
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/student/learning/${course._id}?preview=1`}
            target="_blank"
            className="gc-btn-ghost inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Eye size={14} /> Preview Classroom <ExternalLink size={12} />
          </Link>

          {course.status === 'draft' ? (
            <Button
              loading={submittingReview}
              onClick={handleSubmitReview}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <Send size={14} /> Submit for Review
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gc-mute">Status:</span>
              <StatusBadge status={course.status} />
            </div>
          )}
        </div>
      </div>

      {/* Course Overview Card */}
      <div className="gc-card p-6">
        {course.approvalNotes && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-900">
            <p className="font-semibold flex items-center gap-1.5 text-amber-800">
              <AlertCircle size={15} /> Feedback from Administrator Review:
            </p>
            <p className="mt-1 text-stone-700">{course.approvalNotes}</p>
          </div>
        )}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-gc-black">{course.title}</h1>
              <StatusBadge status={course.status} />
              <button
                type="button"
                onClick={() => setCourseModalOpen(true)}
                className="gc-btn-ghost text-xs py-1 px-2.5 inline-flex items-center gap-1"
                title="Edit Course Information"
              >
                <Edit2 size={13} /> Edit Info
              </button>
            </div>
            {course.subtitle && <p className="mt-1 text-sm text-gc-mute">{course.subtitle}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gc-mist">
              <span>Category: <strong>{course.category || 'Unassigned'}</strong></span>
              <span>Target: <strong>{course.targetExam || 'General'}</strong></span>
              <span>Level: <strong>{course.level || 'Advanced'}</strong></span>
              <span>Lang: <strong>{course.language || 'English'}</strong></span>
              <span>Duration: <strong>{course.duration || '12 Months'}</strong></span>
              <span>Pricing: <strong>{course.pricingType === 'free' ? 'Free' : `₹${course.price}`}</strong></span>
              <span>Validity: <strong>{course.validityDays} days</strong></span>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="rounded-xl border border-gc-line bg-stone-50/50 p-4 text-xs min-w-[220px]">
            <p className="font-semibold text-gc-black mb-2">Publishing Readiness:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                {hasTitle ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-500" />}
                <span className={hasTitle ? 'text-stone-700' : 'text-stone-400'}>Course information</span>
              </li>
              <li className="flex items-center gap-2">
                {hasSubjects ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-500" />}
                <span className={hasSubjects ? 'text-stone-700' : 'text-stone-400'}>Subjects created ({subjects.length})</span>
              </li>
              <li className="flex items-center gap-2">
                {hasLessons ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-500" />}
                <span className={hasLessons ? 'text-stone-700' : 'text-stone-400'}>Lessons added ({lessons.length})</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Curriculum Builder Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-gc-black">Curriculum Hierarchy</h2>
            <p className="text-xs text-gc-mute">Subject &rarr; Chapter &rarr; Topic &rarr; Lesson</p>
          </div>
          <Button
            onClick={() => setSubjectModal({ open: true, name: '', description: '', order: subjects.length })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus size={14} /> Add Subject
          </Button>
        </div>

        {subjects.length === 0 ? (
          <div className="gc-card p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-stone-300 mb-2" />
            <p className="font-display text-lg text-gc-black">No subjects in curriculum yet</p>
            <p className="text-xs text-gc-mute mt-1 mb-4">Start by adding your first subject (e.g. Physics, Chemistry, Mathematics).</p>
            <Button
              onClick={() => setSubjectModal({ open: true, name: '', description: '', order: 0 })}
              className="inline-flex items-center gap-1.5 text-xs"
            >
              <Plus size={14} /> Add Subject
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {subjects.map((subj) => {
              const subjChapters = chapters.filter((c) => String(c.subject) === String(subj._id));
              const isExpanded = expandedSubjects[subj._id] !== false; // expanded by default

              return (
                <div key={subj._id} className="gc-card overflow-hidden">
                  {/* Subject Header */}
                  <div className="flex items-center justify-between bg-stone-50/80 px-4 py-3 border-b border-gc-line">
                    <button
                      type="button"
                      onClick={() => toggleSubject(subj._id)}
                      className="flex items-center gap-2 text-left font-display text-base font-semibold text-gc-black hover:text-gc-blue"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span>{subj.name}</span>
                      <span className="text-xs font-sans font-normal text-gc-mute">({subjChapters.length} chapters)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChapterModal({ open: true, subjectId: subj._id, name: '', description: '', order: subjChapters.length })}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gc-blue hover:bg-blue-50"
                      >
                        <Plus size={13} /> Add Chapter
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubjectModal({ open: true, id: subj._id, name: subj.name, description: subj.description || '', order: subj.order })}
                        className="p-1 text-stone-400 hover:text-gc-black"
                        title="Edit Subject"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSubject(subj._id)}
                        className="p-1 text-stone-400 hover:text-red-600"
                        title="Delete Subject"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Chapters Container */}
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {subjChapters.length === 0 ? (
                        <p className="text-xs text-gc-mute italic py-2 pl-4">No chapters yet. Click &quot;Add Chapter&quot; above.</p>
                      ) : (
                        subjChapters.map((chap) => {
                          const chapTopics = topics.filter((t) => String(t.chapter) === String(chap._id));
                          const isChapExpanded = expandedChapters[chap._id] !== false;

                          return (
                            <div key={chap._id} className="rounded-xl border border-gc-line/70 bg-white">
                              {/* Chapter Header */}
                              <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50/40 rounded-t-xl border-b border-gc-line/50">
                                <button
                                  type="button"
                                  onClick={() => toggleChapter(chap._id)}
                                  className="flex items-center gap-2 text-sm font-semibold text-gc-black hover:text-gc-blue"
                                >
                                  {isChapExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  <span>{chap.name}</span>
                                  <span className="text-[11px] font-normal text-gc-mute">({chapTopics.length} topics)</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setTopicModal({ open: true, chapterId: chap._id, name: '', description: '', order: chapTopics.length })}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gc-blue hover:underline px-1.5 py-0.5"
                                  >
                                    <Plus size={12} /> Add Topic
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setChapterModal({ open: true, subjectId: subj._id, id: chap._id, name: chap.name, description: chap.description || '', order: chap.order })}
                                    className="p-1 text-stone-400 hover:text-gc-black"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteChapter(chap._id)}
                                    className="p-1 text-stone-400 hover:text-red-600"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Topics Container */}
                              {isChapExpanded && (
                                <div className="p-3 space-y-3">
                                  {chapTopics.length === 0 ? (
                                    <p className="text-xs text-gc-mute italic py-1 pl-2">No topics yet. Click &quot;Add Topic&quot; above.</p>
                                  ) : (
                                    chapTopics.map((top) => {
                                      const topLessons = lessons.filter((l) => String(l.topic) === String(top._id));

                                      return (
                                        <div key={top._id} className="rounded-lg border border-dashed border-stone-200 bg-stone-50/20 p-2.5">
                                          {/* Topic Header */}
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                                              Topic: {top.name}
                                            </span>
                                            <div className="flex items-center gap-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setLessonModal({
                                                    open: true,
                                                    topicId: top._id,
                                                    chapterId: chap._id,
                                                    title: '',
                                                    description: '',
                                                    video: '',
                                                    durationMin: 15,
                                                    isDemo: false,
                                                    order: topLessons.length,
                                                  })
                                                }
                                                className="inline-flex items-center gap-1 rounded bg-stone-900 px-2 py-0.5 text-[11px] font-medium text-amber-200 hover:bg-stone-800"
                                              >
                                                <Plus size={11} /> Add Lesson
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setTopicModal({ open: true, chapterId: chap._id, id: top._id, name: top.name, description: top.description || '', order: top.order })}
                                                className="p-1 text-stone-400 hover:text-gc-black"
                                              >
                                                <Edit2 size={12} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => deleteTopic(top._id)}
                                                className="p-1 text-stone-400 hover:text-red-600"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            </div>
                                          </div>

                                          {/* Lessons List */}
                                          {topLessons.length === 0 ? (
                                            <p className="text-[11px] text-gc-mute italic">No lessons in this topic yet.</p>
                                          ) : (
                                            <ul className="space-y-1.5">
                                              {topLessons.map((les) => (
                                                <li
                                                  key={les._id}
                                                  className="flex items-center justify-between rounded-md border border-gc-line/60 bg-white px-3 py-2 text-xs shadow-2xs hover:border-gc-blue/40"
                                                >
                                                  <div className="flex items-center gap-2.5 min-w-0">
                                                    <PlayCircle size={15} className="shrink-0 text-gc-blue" />
                                                    <span className="font-medium text-gc-black truncate">{les.title}</span>
                                                    {les.isDemo && (
                                                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                                        Free Preview
                                                      </span>
                                                    )}
                                                    {les.video ? (
                                                      <span className="flex items-center gap-1 text-[11px] text-gc-mist">
                                                        <Video size={12} /> Video Attached
                                                      </span>
                                                    ) : (
                                                      <span className="text-[11px] text-amber-600 italic">No video attached</span>
                                                    )}
                                                    {les.durationSec ? (
                                                      <span className="flex items-center gap-1 text-[11px] text-gc-mute">
                                                        <Clock size={11} /> {Math.round(les.durationSec / 60)} min
                                                      </span>
                                                    ) : null}
                                                  </div>

                                                  <div className="flex items-center gap-1">
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setLessonModal({
                                                          open: true,
                                                          topicId: top._id,
                                                          chapterId: chap._id,
                                                          id: les._id,
                                                          title: les.title,
                                                          description: les.description || '',
                                                          video: (les.video as any)?._id || (typeof les.video === 'string' ? les.video : ''),
                                                          durationMin: Math.round((les.durationSec || 0) / 60),
                                                          isDemo: Boolean(les.isDemo),
                                                          order: les.order || 0,
                                                        })
                                                      }
                                                      className="p-1 text-stone-400 hover:text-gc-black"
                                                    >
                                                      <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => deleteLesson(les._id)}
                                                      className="p-1 text-stone-400 hover:text-red-600"
                                                    >
                                                      <Trash2 size={12} />
                                                    </button>
                                                  </div>
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject Modal */}
      <Modal
        open={subjectModal.open}
        onClose={() => setSubjectModal((s) => ({ ...s, open: false }))}
        title={subjectModal.id ? 'Edit Subject' : 'Add Subject'}
      >
        <div className="space-y-3 p-1">
          <Input
            label="Subject Name"
            value={subjectModal.name}
            onChange={(e) => setSubjectModal((s) => ({ ...s, name: e.target.value }))}
            placeholder="e.g. Organic Chemistry"
            required
          />
          <Textarea
            label="Description (Optional)"
            value={subjectModal.description}
            onChange={(e) => setSubjectModal((s) => ({ ...s, description: e.target.value }))}
            placeholder="Brief overview of subject..."
          />
          <Input
            type="number"
            label="Display Order"
            value={subjectModal.order}
            onChange={(e) => setSubjectModal((s) => ({ ...s, order: Number(e.target.value) }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSubjectModal((s) => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button onClick={saveSubject}>Save Subject</Button>
          </div>
        </div>
      </Modal>

      {/* Chapter Modal */}
      <Modal
        open={chapterModal.open}
        onClose={() => setChapterModal((s) => ({ ...s, open: false }))}
        title={chapterModal.id ? 'Edit Chapter' : 'Add Chapter'}
      >
        <div className="space-y-3 p-1">
          <Input
            label="Chapter Name"
            value={chapterModal.name}
            onChange={(e) => setChapterModal((s) => ({ ...s, name: e.target.value }))}
            placeholder="e.g. Hydrocarbons & Reaction Mechanisms"
            required
          />
          <Textarea
            label="Description (Optional)"
            value={chapterModal.description}
            onChange={(e) => setChapterModal((s) => ({ ...s, description: e.target.value }))}
          />
          <Input
            type="number"
            label="Display Order"
            value={chapterModal.order}
            onChange={(e) => setChapterModal((s) => ({ ...s, order: Number(e.target.value) }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setChapterModal((s) => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button onClick={saveChapter}>Save Chapter</Button>
          </div>
        </div>
      </Modal>

      {/* Topic Modal */}
      <Modal
        open={topicModal.open}
        onClose={() => setTopicModal((s) => ({ ...s, open: false }))}
        title={topicModal.id ? 'Edit Topic' : 'Add Topic'}
      >
        <div className="space-y-3 p-1">
          <Input
            label="Topic Name"
            value={topicModal.name}
            onChange={(e) => setTopicModal((s) => ({ ...s, name: e.target.value }))}
            placeholder="e.g. Electrophilic Addition Reactions"
            required
          />
          <Textarea
            label="Description (Optional)"
            value={topicModal.description}
            onChange={(e) => setTopicModal((s) => ({ ...s, description: e.target.value }))}
          />
          <Input
            type="number"
            label="Display Order"
            value={topicModal.order}
            onChange={(e) => setTopicModal((s) => ({ ...s, order: Number(e.target.value) }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setTopicModal((s) => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button onClick={saveTopic}>Save Topic</Button>
          </div>
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        open={lessonModal.open}
        onClose={() => setLessonModal((s) => ({ ...s, open: false }))}
        title={lessonModal.id ? 'Edit Lesson' : 'Add Lesson'}
      >
        <div className="space-y-3 p-1">
          <Input
            label="Lesson Title"
            value={lessonModal.title}
            onChange={(e) => setLessonModal((s) => ({ ...s, title: e.target.value }))}
            placeholder="e.g. Markovnikov's Rule & Carbocation Stability"
            required
          />

          <Select
            label="Attach Video Lecture"
            value={lessonModal.video}
            onChange={(e) => setLessonModal((s) => ({ ...s, video: e.target.value }))}
          >
            <option value="">-- No video (or attach later) --</option>
            {availableVideos.map((v) => (
              <option key={v._id} value={v._id}>
                {v.title} {v.duration ? `(${Math.round(v.duration / 60)} min)` : ''}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Estimated Duration (Minutes)"
              value={lessonModal.durationMin}
              onChange={(e) => setLessonModal((s) => ({ ...s, durationMin: Number(e.target.value) }))}
            />
            <Input
              type="number"
              label="Display Order"
              value={lessonModal.order}
              onChange={(e) => setLessonModal((s) => ({ ...s, order: Number(e.target.value) }))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gc-black pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={lessonModal.isDemo}
              onChange={(e) => setLessonModal((s) => ({ ...s, isDemo: e.target.checked }))}
              className="accent-gc-gold h-4 w-4"
              suppressHydrationWarning
            />
            <span>Free Preview (allow un-enrolled students to watch this lesson)</span>
          </label>

          <Textarea
            label="Lesson Notes / Description"
            value={lessonModal.description}
            onChange={(e) => setLessonModal((s) => ({ ...s, description: e.target.value }))}
            placeholder="Optional summary or reading notes for this lesson..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setLessonModal((s) => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button onClick={saveLesson}>Save Lesson</Button>
          </div>
        </div>
      </Modal>

      {/* Course Edit Modal */}
      <Modal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={`Edit Course: ${course.title}`}
      >
        <form onSubmit={saveCourseDetails} className="space-y-4 pt-2">
          <Input name="title" defaultValue={course.title} required label="Course Title" />
          <Input name="subtitle" defaultValue={course.subtitle ?? ''} label="Subtitle / Tagline" />
          <div className="grid grid-cols-2 gap-3">
            <Input name="category" defaultValue={course.category ?? ''} label="Category" placeholder="JEE, NEET…" />
            <Input name="targetExam" defaultValue={course.targetExam ?? ''} label="Target Exam" placeholder="JEE Main" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select name="level" label="Level" defaultValue={course.level ?? 'Intermediate'}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </Select>
            <Select name="language" label="Language" defaultValue={course.language ?? 'English'}>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </Select>
            <Input name="duration" defaultValue={course.duration ?? '12 Months'} label="Duration" placeholder="e.g. 12 Months" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select name="pricingType" label="Pricing" defaultValue={course.pricingType ?? 'paid'}>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </Select>
            <Input name="price" type="number" min={0} defaultValue={course.price ?? 0} label="Price (INR)" />
            <Input name="validityDays" type="number" min={1} defaultValue={course.validityDays ?? 365} label="Validity (Days)" />
          </div>
          <Textarea name="description" defaultValue={course.description ?? ''} label="Detailed Description" rows={4} />

          <div className="flex justify-end gap-2 pt-3 border-t border-gc-line">
            <Button type="button" variant="ghost" onClick={() => setCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={savingCourse} type="submit">
              Save Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

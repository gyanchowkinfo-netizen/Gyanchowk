'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Trash2, Edit3, Filter, Video, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Modal, ConfirmDialog } from '@/components/ui/Overlay';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

type VideoItem = {
  _id: string;
  title: string;
  status?: string;
  isDemo?: boolean;
  publicId?: string;
  duration?: number;
  format?: string;
  course?: { _id: string; title: string; slug?: string } | string;
  subject?: { _id: string; name: string; slug?: string } | string;
  topic?: { _id: string; name: string; slug?: string } | string;
  lesson?: { _id: string; title: string; slug?: string } | string;
  createdAt?: string;
};

export default function TeacherVideosPage() {
  // Cascading Selection State for Upload
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  // Upload progress and loading
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  // Search & Filter State for Video List
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // Edit Video Modal State
  const [editTarget, setEditTarget] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editIsDemo, setEditIsDemo] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Delete Video Modal State
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch Teacher's Courses
  const coursesQuery = useQuery({
    queryKey: ['teacher-courses-all'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/courses?mine=1&limit=100'),
  });

  // 2. Cascading: Fetch Subjects for Upload Form
  const subjectsQuery = useQuery({
    enabled: Boolean(selectedCourse),
    queryKey: ['curriculum-subjects', selectedCourse],
    queryFn: () => api<{ items: Array<{ _id: string; name: string }> }>(`/api/catalog/subjects?course=${selectedCourse}`),
  });

  // 3. Cascading: Fetch Topics for Upload Form
  const topicsQuery = useQuery({
    enabled: Boolean(selectedSubject),
    queryKey: ['curriculum-topics', selectedCourse, selectedSubject],
    queryFn: () => api<{ items: Array<{ _id: string; name: string }> }>(`/api/catalog/topics?course=${selectedCourse}&subject=${selectedSubject}`),
  });

  // 4. Cascading: Fetch Lessons for Upload Form (Optional Direct Link)
  const lessonsQuery = useQuery({
    enabled: Boolean(selectedTopic),
    queryKey: ['curriculum-lessons', selectedTopic],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>(`/api/catalog/lessons?topic=${selectedTopic}`),
  });

  // 5. Filter: Fetch Subjects for Filter Bar
  const filterSubjectsQuery = useQuery({
    enabled: filterCourse !== 'all',
    queryKey: ['filter-subjects', filterCourse],
    queryFn: () => api<{ items: Array<{ _id: string; name: string }> }>(`/api/catalog/subjects?course=${filterCourse}`),
  });

  // 6. Fetch Video List with active filters and search
  const videosQuery = useQuery({
    queryKey: ['teacher-videos', filterCourse, filterSubject, searchQuery],
    queryFn: () => {
      const p = new URLSearchParams();
      if (filterCourse !== 'all') p.set('course', filterCourse);
      if (filterSubject !== 'all') p.set('subject', filterSubject);
      if (searchQuery.trim()) p.set('q', searchQuery.trim());
      const qs = p.toString();
      return api<{ items: VideoItem[] }>(`/api/videos${qs ? `?${qs}` : ''}`);
    },
  });

  // Handle Cascading Changes
  function handleCourseChange(courseId: string) {
    setSelectedCourse(courseId);
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedLesson('');
  }

  function handleSubjectChange(subjectId: string) {
    setSelectedSubject(subjectId);
    setSelectedTopic('');
    setSelectedLesson('');
  }

  function handleTopicChange(topicId: string) {
    setSelectedTopic(topicId);
    setSelectedLesson('');
  }

  // Upload Video Flow
  async function handleUpload(file: File) {
    if (!selectedCourse) {
      toast.error('Please select a course for this video');
      return;
    }
    if (!videoTitle.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    setBusy(true);
    setProgress('Requesting upload authorization…');
    try {
      const sig = await api<{
        timestamp: number;
        signature: string;
        folder: string;
        cloudName: string;
        apiKey: string;
      }>('/api/uploads/signature', {
        method: 'POST',
        body: JSON.stringify({ folder: 'videos', resourceType: 'video' }),
      });

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);

      setProgress('Uploading video to Cloudinary…');
      const cloud = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`, {
        method: 'POST',
        body: fd,
      });

      const json = (await cloud.json()) as {
        public_id?: string;
        duration?: number;
        bytes?: number;
        format?: string;
        error?: { message?: string };
      };

      if (!json.public_id) {
        throw new Error(json.error?.message || 'Video upload to Cloudinary failed');
      }

      setProgress('Saving video to curriculum…');
      await api('/api/videos', {
        method: 'POST',
        body: JSON.stringify({
          title: videoTitle.trim(),
          course: selectedCourse,
          subject: selectedSubject || undefined,
          topic: selectedTopic || undefined,
          lesson: selectedLesson || undefined,
          publicId: json.public_id,
          duration: json.duration ? Math.round(json.duration) : undefined,
          bytes: json.bytes,
          format: json.format,
          isDemo,
        }),
      });

      toast.success('Video recorded and attached to curriculum!');
      setVideoTitle('');
      setIsDemo(false);
      await videosQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  // Edit Video Save
  async function handleSaveEdit() {
    if (!editTarget) return;
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    setEditSaving(true);
    try {
      await api(`/api/videos/${editTarget._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle.trim(),
          isDemo: editIsDemo,
        }),
      });
      toast.success('Video updated successfully');
      setEditTarget(null);
      await videosQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setEditSaving(false);
    }
  }

  // Delete Video
  async function handleDeleteVideo() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/videos/${deleteTarget._id}`, { method: 'DELETE' });
      toast.success('Video deleted and unlinked from lessons');
      setDeleteTarget(null);
      await videosQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  // Helper labels
  const getEntityTitle = (entity: any, fallback = '—') => {
    if (!entity) return fallback;
    if (typeof entity === 'string') return entity;
    return entity.title || entity.name || fallback;
  };

  const courseList = coursesQuery.data?.items ?? [];
  const subjectList = subjectsQuery.data?.items ?? [];
  const topicList = topicsQuery.data?.items ?? [];
  const lessonList = lessonsQuery.data?.items ?? [];
  const filterSubjectList = filterSubjectsQuery.data?.items ?? [];
  const videos = videosQuery.data?.items ?? [];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Video Management & Curriculum Uploads"
        subtitle="Upload lectures linked dynamically to your course curriculum. Videos automatically attach to subjects, topics, and lessons."
      />

      {/* CASCADING UPLOAD FORM */}
      <section className="gc-card p-6 space-y-5">
        <div className="border-b border-gc-line pb-3">
          <h2 className="font-display text-xl font-bold text-gc-black flex items-center gap-2">
            <Video className="h-5 w-5 text-gc-gold" />
            Upload New Lecture Video
          </h2>
          <p className="mt-1 text-xs text-gc-mute">
            Follow the sequential hierarchy: select Course &rarr; Subject &rarr; Topic to properly categorize your lecture.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 1. Course Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gc-mute">
              1. Course <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={busy}
              aria-label="Select course"
            >
              <option value="">-- Choose Course --</option>
              {courseList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>

          {/* 2. Subject Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gc-mute">
              2. Subject {!selectedCourse ? '(Select course first)' : ''}
            </label>
            <Select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              disabled={!selectedCourse || busy}
              aria-label="Select subject"
            >
              <option value="">
                {!selectedCourse
                  ? '-- Select Course First --'
                  : subjectList.length === 0
                  ? '-- No Subjects In Course (Optional) --'
                  : '-- Choose Subject --'}
              </option>
              {subjectList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          {/* 3. Topic Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gc-mute">
              3. Topic {!selectedSubject ? '(Select subject first)' : ''}
            </label>
            <Select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              disabled={!selectedSubject || busy}
              aria-label="Select topic"
            >
              <option value="">
                {!selectedSubject
                  ? '-- Select Subject First --'
                  : topicList.length === 0
                  ? '-- No Topics In Subject (Optional) --'
                  : '-- Choose Topic --'}
              </option>
              {topicList.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>

          {/* 4. Lesson Selection (Optional direct linking) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gc-mute">
              4. Direct Lesson Link (Optional)
            </label>
            <Select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              disabled={!selectedTopic || busy}
              aria-label="Select lesson"
            >
              <option value="">
                {!selectedTopic
                  ? '-- Select Topic First --'
                  : lessonList.length === 0
                  ? '-- No Lessons In Topic --'
                  : '-- Link To Lesson Slot --'}
              </option>
              {lessonList.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Video Title */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gc-mute">
              Video Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="e.g. Chapter 1: Newton's First Law and Equilibrium"
              disabled={busy}
              required
            />
          </div>

          {/* Free Preview Toggle */}
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isDemoCheckbox"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              disabled={busy}
              className="accent-gc-gold h-4 w-4 rounded"
              suppressHydrationWarning
            />
            <label htmlFor="isDemoCheckbox" className="text-sm font-medium text-gc-black cursor-pointer">
              Mark as Free Preview (allows unenrolled students to preview this lecture)
            </label>
          </div>

          {/* File Uploader */}
          <div className="md:col-span-2 pt-2">
            <FileUploader
              label={busy ? progress || 'Uploading video…' : 'Choose lecture video file'}
              accept="video/*"
              onSelect={(file) => void handleUpload(file)}
            />
          </div>
        </div>
      </section>

      {/* VIDEO MANAGEMENT & SEARCH / FILTER SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-gc-black">Your Uploaded Videos</h2>
            <p className="mt-0.5 text-xs text-gc-mute">
              Manage video files, edit titles, toggle free preview permissions, or delete unused lectures.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="gc-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gc-mute" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos by title…"
              className="gc-input pl-9 w-full text-xs"
              suppressHydrationWarning
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Course */}
            <Select
              value={filterCourse}
              onChange={(e) => {
                setFilterCourse(e.target.value);
                setFilterSubject('all');
              }}
              className="text-xs"
              aria-label="Filter by course"
            >
              <option value="all">All Courses</option>
              {courseList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </Select>

            {/* Filter by Subject */}
            <Select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              disabled={filterCourse === 'all'}
              className="text-xs"
              aria-label="Filter by subject"
            >
              <option value="all">All Subjects</option>
              {filterSubjectList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Video Items List */}
        {videosQuery.isLoading && <LoadingState />}
        {videosQuery.error && (
          <ErrorState message={(videosQuery.error as Error).message} onRetry={() => void videosQuery.refetch()} />
        )}

        {!videosQuery.isLoading && !videosQuery.error && videos.length === 0 && (
          <EmptyState
            title="No videos found"
            body={
              searchQuery || filterCourse !== 'all'
                ? 'Try adjusting your search query or filter selection.'
                : 'Upload your first lecture video above to attach it to your curriculum.'
            }
          />
        )}

        {videos.length > 0 && (
          <ul className="space-y-3">
            {videos.map((v) => {
              const courseTitle = getEntityTitle(v.course, 'Course');
              const subjectName = getEntityTitle(v.subject, '');
              const topicName = getEntityTitle(v.topic, '');
              const lessonTitle = getEntityTitle(v.lesson, '');

              return (
                <li
                  key={v._id}
                  className="gc-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gc-blue/40 transition-all"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-gc-black truncate">
                        {v.title}
                      </h3>
                      <StatusBadge status={v.status ?? 'ready'} />
                      {v.isDemo ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-200">
                          Free Preview
                        </span>
                      ) : null}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gc-mist">
                      <span className="rounded bg-stone-100 px-2 py-0.5 text-stone-700 font-medium">
                        {courseTitle}
                      </span>
                      {subjectName && (
                        <span className="rounded bg-sky-50 px-2 py-0.5 text-sky-800 border border-sky-200">
                          Subject: {subjectName}
                        </span>
                      )}
                      {topicName && (
                        <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-800 border border-indigo-200">
                          Topic: {topicName}
                        </span>
                      )}
                      {lessonTitle && (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 border border-emerald-200">
                          Lesson: {lessonTitle}
                        </span>
                      )}
                      {typeof v.duration === 'number' && v.duration > 0 && (
                        <span>
                          {Math.floor(v.duration / 60)}m {Math.round(v.duration % 60)}s
                        </span>
                      )}
                      {v.format && <span className="uppercase text-[11px] font-mono">{v.format}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      type="button"
                      className="text-xs py-1.5 px-2.5"
                      onClick={async () => {
                        try {
                          await api(`/api/videos/${v._id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ isDemo: !v.isDemo }),
                          });
                          toast.success(v.isDemo ? 'Preview disabled' : 'Free preview enabled');
                          await videosQuery.refetch();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Update failed');
                        }
                      }}
                    >
                      {v.isDemo ? 'Disable Preview' : 'Enable Preview'}
                    </Button>

                    <Button
                      variant="ghost"
                      type="button"
                      className="text-xs py-1.5 px-2.5"
                      onClick={() => {
                        setEditTarget(v);
                        setEditTitle(v.title);
                        setEditIsDemo(Boolean(v.isDemo));
                      }}
                    >
                      <Edit3 size={13} className="mr-1" /> Edit
                    </Button>

                    <Button
                      variant="danger"
                      type="button"
                      className="text-xs py-1.5 px-2.5"
                      onClick={() => setDeleteTarget(v)}
                    >
                      <Trash2 size={13} className="mr-1" /> Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* EDIT VIDEO MODAL */}
      <Modal
        open={Boolean(editTarget)}
        title="Edit Video Details"
        onClose={() => setEditTarget(null)}
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Video Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-sm text-gc-black">
            <input
              type="checkbox"
              checked={editIsDemo}
              onChange={(e) => setEditIsDemo(e.target.checked)}
              className="accent-gc-gold h-4 w-4 rounded"
              suppressHydrationWarning
            />
            Mark as Free Preview
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-gc-line">
            <Button variant="ghost" type="button" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button loading={editSaving} type="button" onClick={() => void handleSaveEdit()}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE VIDEO CONFIRM DIALOG */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete video "${deleteTarget?.title}"?`}
        body="This will permanently delete this video and remove its attachment from any lessons in the curriculum. Are you sure?"
        confirmLabel="Delete Video"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteVideo()}
      />
    </div>
  );
}

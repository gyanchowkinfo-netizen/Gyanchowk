'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Trash2, Edit3, Filter, Video, Layers, CheckCircle2, Play, Plus, User, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Modal, ConfirmDialog } from '@/components/ui/Overlay';
import { toast } from '@/lib/toast';

type VideoItem = {
  _id: string;
  title: string;
  status?: string;
  isDemo?: boolean;
  publicId?: string;
  duration?: number;
  format?: string;
  course?: { _id: string; title: string; slug?: string } | string;
  subject?: { _id: string; name?: string; title?: string; slug?: string } | string;
  topic?: { _id: string; name?: string; title?: string; slug?: string } | string;
  lesson?: { _id: string; title: string; slug?: string } | string;
  teacher?: { _id: string; name: string; email?: string } | string;
  uploadedBy?: { _id: string; name: string; email?: string; role?: string } | string;
  createdAt?: string;
};

export default function AdminVideosPage() {
  // Cascading Selection State for Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
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
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // Preview Video Modal
  const [previewTarget, setPreviewTarget] = useState<VideoItem | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loadingPlayback, setLoadingPlayback] = useState(false);

  // Edit Video Modal State
  const [editTarget, setEditTarget] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editIsDemo, setEditIsDemo] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Delete Video Modal State
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch All Teachers
  const teachersQuery = useQuery({
    queryKey: ['admin-teachers-list'],
    queryFn: () => api<{ items: Array<{ _id: string; name: string; email?: string }> }>('/api/teachers?limit=200'),
  });

  // 2. Fetch Courses (filtered by teacher if selected, or all courses)
  const coursesQuery = useQuery({
    queryKey: ['admin-courses-all', selectedTeacher],
    queryFn: () => {
      const q = selectedTeacher ? `?teacher=${selectedTeacher}&limit=200` : '?limit=200';
      return api<{ items: Array<{ _id: string; title: string; teacher?: string; teachers?: string[] }> }>(`/api/courses${q}`);
    },
  });

  // 3. Cascading: Fetch Subjects for Upload Form
  const subjectsQuery = useQuery({
    enabled: Boolean(selectedCourse),
    queryKey: ['curriculum-subjects', selectedCourse],
    queryFn: () => api<{ items: Array<{ _id: string; name?: string; title?: string }> }>(`/api/catalog/subjects?course=${selectedCourse}`),
  });

  // 4. Cascading: Fetch Topics for Upload Form
  const topicsQuery = useQuery({
    enabled: Boolean(selectedSubject),
    queryKey: ['curriculum-topics', selectedCourse, selectedSubject],
    queryFn: () => api<{ items: Array<{ _id: string; name?: string; title?: string }> }>(`/api/catalog/topics?course=${selectedCourse}&subject=${selectedSubject}`),
  });

  // 5. Cascading: Fetch Lessons for Upload Form
  const lessonsQuery = useQuery({
    enabled: Boolean(selectedTopic),
    queryKey: ['curriculum-lessons', selectedTopic],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>(`/api/catalog/lessons?topic=${selectedTopic}`),
  });

  // 6. Filter: Fetch Subjects for Filter Bar
  const filterSubjectsQuery = useQuery({
    enabled: filterCourse !== 'all',
    queryKey: ['filter-subjects', filterCourse],
    queryFn: () => api<{ items: Array<{ _id: string; name?: string; title?: string }> }>(`/api/catalog/subjects?course=${filterCourse}`),
  });

  // 7. Fetch Video List with active filters and search
  const videosQuery = useQuery({
    queryKey: ['admin-videos', filterTeacher, filterCourse, filterSubject, searchQuery],
    queryFn: () => {
      const p = new URLSearchParams();
      if (filterTeacher !== 'all') p.set('teacher', filterTeacher);
      if (filterCourse !== 'all') p.set('course', filterCourse);
      if (filterSubject !== 'all') p.set('subject', filterSubject);
      if (searchQuery.trim()) p.set('q', searchQuery.trim());
      const qs = p.toString();
      return api<{ items: VideoItem[]; total: number }>(`/api/videos${qs ? `?${qs}` : ''}`);
    },
  });

  // Upload Handlers
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
        throw new Error(json.error?.message || 'Video upload failed');
      }

      setProgress('Saving video metadata…');
      await api('/api/videos', {
        method: 'POST',
        body: JSON.stringify({
          title: videoTitle.trim(),
          course: selectedCourse,
          subject: selectedSubject || undefined,
          topic: selectedTopic || undefined,
          lesson: selectedLesson || undefined,
          teacher: selectedTeacher || undefined,
          publicId: json.public_id,
          duration: json.duration ? Math.round(json.duration) : undefined,
          bytes: json.bytes,
          format: json.format,
          isDemo,
        }),
      });

      toast.success('Video uploaded successfully!');
      videosQuery.refetch();
      setIsUploadOpen(false);
      setVideoTitle('');
      setSelectedCourse('');
      setSelectedSubject('');
      setSelectedTopic('');
      setSelectedLesson('');
      setIsDemo(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  // Preview Video Handler
  async function handleOpenPreview(video: VideoItem) {
    setPreviewTarget(video);
    setLoadingPlayback(true);
    setPlaybackUrl(null);
    try {
      const res = await api<{ playbackUrl?: string; hlsUrl?: string; mp4Url?: string }>(`/api/videos/${video._id}/playback`);
      setPlaybackUrl(res.playbackUrl || res.hlsUrl || res.mp4Url || null);
    } catch {
      if (video.publicId) {
        setPlaybackUrl(`https://res.cloudinary.com/demo/video/upload/${video.publicId}.mp4`);
      }
    } finally {
      setLoadingPlayback(false);
    }
  }

  // Edit Video Flow
  function handleOpenEdit(video: VideoItem) {
    setEditTarget(video);
    setEditTitle(video.title);
    setEditIsDemo(Boolean(video.isDemo));
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
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
      videosQuery.refetch();
      setEditTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update video');
    } finally {
      setEditSaving(false);
    }
  }

  // Quick Demo Toggle
  async function handleToggleDemo(video: VideoItem) {
    try {
      await api(`/api/videos/${video._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isDemo: !video.isDemo }),
      });
      toast.success(video.isDemo ? 'Removed from free demo' : 'Marked as free preview demo');
      videosQuery.refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle demo');
    }
  }

  // Delete Video Flow
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/videos/${deleteTarget._id}`, { method: 'DELETE' });
      toast.success('Video deleted safely');
      videosQuery.refetch();
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete video');
    } finally {
      setDeleting(false);
    }
  }

  const videos = videosQuery.data?.items ?? [];
  const teachers = teachersQuery.data?.items ?? [];
  const courses = coursesQuery.data?.items ?? [];
  const subjects = subjectsQuery.data?.items ?? [];
  const topics = topicsQuery.data?.items ?? [];
  const lessons = lessonsQuery.data?.items ?? [];
  const filterSubjects = filterSubjectsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-gc-black">Video Management</h1>
          <p className="text-sm text-gc-mute">
            Manage, preview, organize, and upload videos across all courses and teachers with full audit traceability.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Upload Video</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="gc-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gc-ink">
          <Filter className="w-4 h-4 text-gc-primary" />
          <span>Filter & Search Videos</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by video title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            value={filterTeacher}
            onChange={(e) => {
              setFilterTeacher(e.target.value);
              setFilterCourse('all');
              setFilterSubject('all');
            }}
          >
            <option value="all">All Teachers</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </Select>

          <Select
            value={filterCourse}
            onChange={(e) => {
              setFilterCourse(e.target.value);
              setFilterSubject('all');
            }}
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Select>

          <Select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            disabled={filterCourse === 'all'}
          >
            <option value="all">All Subjects</option>
            {filterSubjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name || s.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Videos List / Table */}
      {videosQuery.isLoading ? (
        <LoadingState label="Loading video records…" />
      ) : videosQuery.isError ? (
        <ErrorState message="Failed to load videos" onRetry={() => videosQuery.refetch()} />
      ) : videos.length === 0 ? (
        <EmptyState
          title="No videos found"
          body="Try adjusting your search or filters, or upload a new video to a course curriculum."
        />
      ) : (
        <div className="gc-card overflow-hidden">
          <div className="p-4 border-b border-gc-border flex items-center justify-between text-xs text-gc-mute">
            <span>Total Videos: <strong>{videos.length}</strong></span>
            <span>Traceability: Teacher Ownership + Uploaded By Tracked</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gc-canvas-subtle/50 text-xs text-gc-mute uppercase font-semibold border-b border-gc-border">
                  <th className="p-3">Video Title & Duration</th>
                  <th className="p-3">Hierarchy (Course / Subject / Topic)</th>
                  <th className="p-3">Teacher Owner</th>
                  <th className="p-3">Uploaded By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gc-border">
                {videos.map((vid) => {
                  const courseTitle = typeof vid.course === 'object' ? vid.course?.title : '—';
                  const subjectTitle = typeof vid.subject === 'object' ? (vid.subject?.name || vid.subject?.title) : '—';
                  const topicTitle = typeof vid.topic === 'object' ? (vid.topic?.name || vid.topic?.title) : '—';
                  const teacherName = typeof vid.teacher === 'object' ? vid.teacher?.name : 'Assigned Teacher';
                  const uploadedByName = typeof vid.uploadedBy === 'object' ? vid.uploadedBy?.name : 'System';

                  return (
                    <tr key={vid._id} className="hover:bg-gc-canvas-subtle/40 transition">
                      <td className="p-3">
                        <div className="font-medium text-gc-ink flex items-center gap-2">
                          <Video className="w-4 h-4 text-gc-primary shrink-0" />
                          <span>{vid.title}</span>
                        </div>
                        <div className="text-xs text-gc-mute mt-1 flex items-center gap-2">
                          <span>{vid.duration ? `${Math.floor(vid.duration / 60)}m ${vid.duration % 60}s` : 'Duration N/A'}</span>
                          {vid.format && <span>• {vid.format.toUpperCase()}</span>}
                        </div>
                      </td>

                      <td className="p-3 text-xs">
                        <div className="font-semibold text-gc-ink truncate max-w-[200px]" title={courseTitle}>
                          {courseTitle}
                        </div>
                        <div className="text-gc-mute truncate max-w-[200px]" title={`${subjectTitle} → ${topicTitle}`}>
                          {subjectTitle || 'No Subject'} → {topicTitle || 'No Topic'}
                        </div>
                      </td>

                      <td className="p-3 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-gc-ink">
                          <User className="w-3.5 h-3.5 text-gc-mute" />
                          <span>{teacherName}</span>
                        </div>
                      </td>

                      <td className="p-3 text-xs">
                        <div className="flex items-center gap-1.5 text-gc-mute">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                          <span>{uploadedByName}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={vid.status || 'ready'} />
                          {vid.isDemo && (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Free Demo
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            title="Preview Video"
                            onClick={() => handleOpenPreview(vid)}
                            className="p-1.5"
                          >
                            <Play className="w-4 h-4 text-emerald-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            title={vid.isDemo ? 'Remove free preview' : 'Mark as free preview'}
                            onClick={() => handleToggleDemo(vid)}
                            className="p-1.5"
                          >
                            <CheckCircle2 className={`w-4 h-4 ${vid.isDemo ? 'text-emerald-600' : 'text-gc-mute'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            title="Edit Details"
                            onClick={() => handleOpenEdit(vid)}
                            className="p-1.5"
                          >
                            <Edit3 className="w-4 h-4 text-gc-ink" />
                          </Button>
                          <Button
                            variant="ghost"
                            title="Delete Video"
                            onClick={() => setDeleteTarget(vid)}
                            className="p-1.5 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal with Cascading Course -> Subject -> Topic -> Lesson */}
      <Modal
        open={isUploadOpen}
        onClose={() => !busy && setIsUploadOpen(false)}
        title="Upload Video to Curriculum"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <p className="text-xs text-gc-mute">
            Select course and curriculum hierarchy. Content ownership will remain with the teacher, while admin upload activity is recorded in the audit log.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Teacher Owner (Optional Override)
            </label>
            <Select
              value={selectedTeacher}
              onChange={(e) => {
                setSelectedTeacher(e.target.value);
                setSelectedCourse('');
              }}
              disabled={busy}
            >
              <option value="">Auto-assign based on Course Owner</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.email || 'Teacher'})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Select Course *
            </label>
            <Select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={busy}
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>

          {selectedCourse && (
            <div>
              <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
                Select Subject (Optional)
              </label>
              <Select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={busy}
              >
                <option value="">None / General Course Video</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name || s.title}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {selectedSubject && (
            <div>
              <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
                Select Topic (Optional)
              </label>
              <Select
                value={selectedTopic}
                onChange={(e) => handleTopicChange(e.target.value)}
                disabled={busy}
              >
                <option value="">None / General Subject Video</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name || t.title}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {selectedTopic && (
            <div>
              <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
                Attach to Lesson (Optional)
              </label>
              <Select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                disabled={busy}
              >
                <option value="">None (Available in Topic Library)</option>
                {lessons.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Video Title *
            </label>
            <Input
              placeholder="e.g., Introduction to Organic Chemistry"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              disabled={busy}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-gc-ink pt-1">
            <input
              type="checkbox"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              disabled={busy}
              className="rounded border-gc-border"
            />
            <span>Allow Free Preview (Non-enrolled students can watch)</span>
          </label>

          <div className="pt-2">
            <FileUploader
              label="Choose MP4 / MOV / WebM Video"
              accept="video/*"
              onSelect={handleUpload}
            />
          </div>

          {busy && (
            <div className="p-3 bg-gc-canvas-subtle rounded text-xs text-gc-ink flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gc-primary border-t-transparent rounded-full animate-spin" />
              <span>{progress || 'Processing upload…'}</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        open={Boolean(previewTarget)}
        onClose={() => setPreviewTarget(null)}
        title={previewTarget?.title || 'Video Preview'}
      >
        <div className="space-y-4">
          {loadingPlayback ? (
            <LoadingState label="Preparing video stream…" />
          ) : playbackUrl ? (
            <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                src={playbackUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gc-mute text-sm bg-gc-canvas-subtle rounded-lg">
              Video playback stream not available for this record.
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setPreviewTarget(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Video Modal */}
      <Modal
        open={Boolean(editTarget)}
        onClose={() => !editSaving && setEditTarget(null)}
        title="Edit Video Information"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Video Title
            </label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              disabled={editSaving}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-gc-ink">
            <input
              type="checkbox"
              checked={editIsDemo}
              onChange={(e) => setEditIsDemo(e.target.checked)}
              disabled={editSaving}
              className="rounded border-gc-border"
            />
            <span>Allow Free Preview</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-gc-border">
            <Button variant="ghost" type="button" onClick={() => setEditTarget(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={editSaving}>
              {editSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Video"
        body={`Are you sure you want to delete "${deleteTarget?.title}"? Any linked lessons will have their video attachment removed.`}
        confirmLabel="Delete Video"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}

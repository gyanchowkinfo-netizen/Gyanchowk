'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Trash2, Edit3, Download, Filter, Eye, EyeOff } from 'lucide-react';
import { api, downloadPdf } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Modal, ConfirmDialog } from '@/components/ui/Overlay';
import { toast } from '@/lib/toast';

type MaterialItem = {
  _id: string;
  title: string;
  type: string;
  status?: string;
  publicId?: string;
  url?: string;
  bytes?: number;
  course?: { _id: string; title: string; slug?: string } | string;
  subject?: { _id: string; title?: string; name?: string } | string;
  topic?: { _id: string; title?: string; name?: string } | string;
  createdAt?: string;
};

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  pdf_notes: 'PDF Notes',
  class_notes: 'Class Notes',
  revision_notes: 'Revision Notes',
  formula_sheet: 'Formula Sheet',
  question_bank: 'Question Bank',
  assignment: 'Assignment',
  pyq: 'Previous Year Question (PYQ)',
  other: 'Other Material',
};

export default function TeacherMaterialsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState('pdf_notes');

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Edit Modal State
  const [editTarget, setEditTarget] = useState<MaterialItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('pdf_notes');
  const [editSaving, setEditSaving] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<MaterialItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch Teacher's Courses
  const coursesQuery = useQuery({
    queryKey: ['teacher-courses-materials'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/courses?mine=1&limit=100'),
  });

  // 2. Cascading Subjects
  const subjectsQuery = useQuery({
    enabled: Boolean(selectedCourse),
    queryKey: ['teacher-materials-subjects', selectedCourse],
    queryFn: () => api<{ items: Array<{ _id: string; name?: string; title?: string }> }>(`/api/catalog/subjects?course=${selectedCourse}`),
  });

  // 3. Cascading Topics
  const topicsQuery = useQuery({
    enabled: Boolean(selectedSubject),
    queryKey: ['teacher-materials-topics', selectedCourse, selectedSubject],
    queryFn: () => api<{ items: Array<{ _id: string; name?: string; title?: string }> }>(`/api/catalog/topics?course=${selectedCourse}&subject=${selectedSubject}`),
  });

  // 4. Fetch Materials
  const materialsQuery = useQuery({
    queryKey: ['teacher-materials', filterCourse, filterType, searchQuery],
    queryFn: () => {
      const p = new URLSearchParams();
      if (filterCourse !== 'all') p.set('course', filterCourse);
      if (filterType !== 'all') p.set('type', filterType);
      if (searchQuery.trim()) p.set('q', searchQuery.trim());
      p.set('limit', '100');
      const qs = p.toString();
      return api<{ items: MaterialItem[]; total: number }>(`/api/learning/materials?${qs}`);
    },
  });

  async function handleUpload(file: File) {
    if (!materialTitle.trim()) {
      toast.error('Please enter a material title');
      return;
    }

    setBusy(true);
    setProgress('Authorizing upload…');
    try {
      const sig = await api<{
        timestamp: number;
        signature: string;
        folder: string;
        cloudName: string;
        apiKey: string;
      }>('/api/uploads/signature', {
        method: 'POST',
        body: JSON.stringify({ folder: 'materials', resourceType: 'raw' }),
      });

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);

      setProgress('Uploading document to Cloudinary…');
      const cloud = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`, {
        method: 'POST',
        body: fd,
      });

      const json = (await cloud.json()) as {
        public_id?: string;
        secure_url?: string;
        bytes?: number;
        error?: { message?: string };
      };

      if (!json.public_id) {
        throw new Error(json.error?.message || 'Upload to Cloudinary failed');
      }

      setProgress('Saving study material record…');
      await api('/api/learning/materials', {
        method: 'POST',
        body: JSON.stringify({
          title: materialTitle.trim(),
          type: materialType,
          status: 'published',
          course: selectedCourse || undefined,
          subject: selectedSubject || undefined,
          topic: selectedTopic || undefined,
          publicId: json.public_id,
          url: json.secure_url,
          bytes: json.bytes || file.size,
          mime: file.type || 'application/pdf',
        }),
      });

      toast.success('Study material uploaded successfully!');
      materialsQuery.refetch();
      setIsUploadOpen(false);
      setMaterialTitle('');
      setSelectedCourse('');
      setSelectedSubject('');
      setSelectedTopic('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  async function handleDownload(material: MaterialItem) {
    try {
      const res = await api<{ url?: string; title?: string }>(`/api/learning/materials/${material._id}/download`);
      const downloadPath = res.url || `/api/learning/materials/${material._id}/file`;
      const cleanTitle = (material.title || 'study-material').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
      const filename = cleanTitle.toLowerCase().endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;
      await downloadPdf(downloadPath, filename);
      toast.success('Download started');
    } catch {
      const fallback = (material.url || '').replace('/fl_attachment/', '/');
      if (fallback) {
        window.open(fallback, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Download failed');
      }
    }
  }

  async function handleToggleStatus(material: MaterialItem) {
    const nextStatus = material.status === 'published' ? 'hidden' : 'published';
    try {
      await api(`/api/learning/materials/${material._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(nextStatus === 'published' ? 'Material published' : 'Material hidden from students');
      materialsQuery.refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  function handleOpenEdit(m: MaterialItem) {
    setEditTarget(m);
    setEditTitle(m.title);
    setEditType(m.type);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await api(`/api/learning/materials/${editTarget._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle.trim(),
          type: editType,
        }),
      });
      toast.success('Material updated');
      materialsQuery.refetch();
      setEditTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update material');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/learning/materials/${deleteTarget._id}`, { method: 'DELETE' });
      toast.success('Study material deleted');
      materialsQuery.refetch();
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  const materials = materialsQuery.data?.items ?? [];
  const courses = coursesQuery.data?.items ?? [];
  const subjects = subjectsQuery.data?.items ?? [];
  const topics = topicsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-gc-black">Study Materials</h1>
          <p className="text-sm text-gc-mute">
            Upload and manage lecture notes, formula sheets, chapter PDFs, and question banks for your courses.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Upload Material</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="gc-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gc-ink">
          <Filter className="w-4 h-4 text-gc-primary" />
          <span>Filter & Search</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">All My Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Select>

          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.entries(MATERIAL_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Materials List */}
      {materialsQuery.isLoading ? (
        <LoadingState label="Loading study materials…" />
      ) : materialsQuery.isError ? (
        <ErrorState message="Failed to load study materials" onRetry={() => materialsQuery.refetch()} />
      ) : materials.length === 0 ? (
        <EmptyState
          title="No materials uploaded yet"
          body="Upload your chapter notes, formula sheets, and practice sets to help your students learn."
        />
      ) : (
        <div className="gc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gc-canvas-subtle/50 text-xs text-gc-mute uppercase font-semibold border-b border-gc-border">
                  <th className="p-3">Title & Type</th>
                  <th className="p-3">Course / Hierarchy</th>
                  <th className="p-3">Size / Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gc-border">
                {materials.map((m) => {
                  const courseTitle = typeof m.course === 'object' ? m.course?.title : '—';
                  const subjectTitle = typeof m.subject === 'object' ? (m.subject?.title || m.subject?.name) : '—';
                  const topicTitle = typeof m.topic === 'object' ? (m.topic?.title || m.topic?.name) : '—';
                  const sizeMb = m.bytes ? (m.bytes / 1024 / 1024).toFixed(2) : null;

                  return (
                    <tr key={m._id} className="hover:bg-gc-canvas-subtle/40 transition">
                      <td className="p-3">
                        <div className="font-medium text-gc-ink flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gc-primary shrink-0" />
                          <span>{m.title}</span>
                        </div>
                        <div className="text-xs text-gc-mute mt-1">
                          <span className="font-semibold text-gc-primary">
                            {MATERIAL_TYPE_LABELS[m.type] || m.type}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-xs">
                        <div className="font-semibold text-gc-ink truncate max-w-[200px]" title={courseTitle}>
                          {courseTitle}
                        </div>
                        <div className="text-gc-mute truncate max-w-[200px]" title={`${subjectTitle} → ${topicTitle}`}>
                          {subjectTitle || 'General'} → {topicTitle || 'General'}
                        </div>
                      </td>

                      <td className="p-3 text-xs">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={m.status || 'published'} />
                          {sizeMb && <span className="text-[11px] text-gc-mute">{sizeMb} MB</span>}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            title="Download or View"
                            onClick={() => handleDownload(m)}
                            className="p-1.5"
                          >
                            <Download className="w-4 h-4 text-emerald-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            title={m.status === 'published' ? 'Hide from students' : 'Publish to students'}
                            onClick={() => handleToggleStatus(m)}
                            className="p-1.5"
                          >
                            {m.status === 'published' ? (
                              <EyeOff className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-emerald-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            title="Edit Title / Type"
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5"
                          >
                            <Edit3 className="w-4 h-4 text-gc-ink" />
                          </Button>
                          <Button
                            variant="ghost"
                            title="Delete Material"
                            onClick={() => setDeleteTarget(m)}
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

      {/* Upload Material Modal */}
      <Modal
        open={isUploadOpen}
        onClose={() => !busy && setIsUploadOpen(false)}
        title="Upload Study Material"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Select Course (Optional)
            </label>
            <Select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedSubject('');
                setSelectedTopic('');
              }}
              disabled={busy}
            >
              <option value="">None / General Material</option>
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
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopic('');
                }}
                disabled={busy}
              >
                <option value="">None / General Course Material</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title || s.name}
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
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={busy}
              >
                <option value="">None / General Subject Material</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title || t.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Material Title *
            </label>
            <Input
              placeholder="e.g. Kinematics Chapter Formula Sheet"
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Material Type
            </label>
            <Select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              disabled={busy}
            >
              {Object.entries(MATERIAL_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>

          <div className="pt-2">
            <FileUploader
              label="Choose PDF / Document File"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
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

      {/* Edit Material Modal */}
      <Modal
        open={Boolean(editTarget)}
        onClose={() => !editSaving && setEditTarget(null)}
        title="Edit Material Details"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Material Title
            </label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              disabled={editSaving}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gc-mute uppercase mb-1">
              Type
            </label>
            <Select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              disabled={editSaving}
            >
              {Object.entries(MATERIAL_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>

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
        title="Delete Study Material"
        body={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Material"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Star,
  Eye,
  Edit2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Users,
  BookOpen,
  Award,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState, Pagination } from '@/components/ui/States';
import { TeacherEditModal } from '@/components/admin/TeacherEditModal';
import type { TeacherCardData } from '@/lib/types';

interface AdminTeachersResponse {
  items: TeacherCardData[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  summary: {
    total: number;
    published: number;
    draft: number;
    featured: number;
    pending: number;
  };
}

export default function AdminTeachersPage() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Navigation tab between Teachers Directory & Teacher Applicants
  const [adminView, setAdminView] = useState<'directory' | 'applicants'>('directory');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'true' | 'false'>('all');
  const [sortOption, setSortOption] = useState('order');
  const [page, setPage] = useState(1);

  // Edit / Create Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherCardData | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<TeacherCardData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Applicant decision state
  const [applicantAction, setApplicantAction] = useState<{
    id: string;
    status: 'approved' | 'rejected' | 'suspended';
  } | null>(null);
  const [applicantBusy, setApplicantBusy] = useState(false);

  // Fetch Admin Teachers Query
  const teachersQuery = useQuery({
    queryKey: ['admin-teachers-list', search, statusFilter, subjectFilter, featuredFilter, sortOption, page],
    queryFn: async () => {
      const qParams = new URLSearchParams();
      if (search) qParams.set('q', search);
      if (statusFilter !== 'all') qParams.set('status', statusFilter);
      if (subjectFilter !== 'all') qParams.set('subject', subjectFilter);
      if (featuredFilter !== 'all') qParams.set('featured', featuredFilter);
      if (sortOption !== 'order') qParams.set('sort', sortOption);
      qParams.set('page', String(page));
      qParams.set('limit', '20');

      return api<AdminTeachersResponse>(`/api/admin/teachers?${qParams.toString()}`);
    },
    enabled: adminView === 'directory',
  });

  // Fetch Subjects for Filter
  const subjectsQuery = useQuery({
    queryKey: ['admin-teacher-subjects'],
    queryFn: () => api<{ subjects: string[] }>('/api/admin/teacher-subjects'),
    enabled: adminView === 'directory',
  });

  // Fetch Applicants Query
  const applicantsQuery = useQuery({
    queryKey: ['admin-teacher-applicants'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; name: string; email: string; teacherStatus?: string; headline?: string }> }>(
        '/api/admin/users?role=teacher',
      ),
    enabled: adminView === 'applicants',
  });

  const teachers = teachersQuery.data?.items ?? [];
  const summary = teachersQuery.data?.summary ?? { total: 0, published: 0, draft: 0, featured: 0, pending: 0 };
  const subjectsList = subjectsQuery.data?.subjects ?? [];

  // Toggle Featured
  async function toggleFeatured(teacher: TeacherCardData) {
    try {
      await api(`/api/admin/teachers/${teacher._id}/featured`, {
        method: 'PATCH',
        body: JSON.stringify({ featured: !teacher.featured }),
      });
      toast.success(`${teacher.name} is now ${!teacher.featured ? 'featured' : 'unfeatured'}`);
      await teachersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle featured');
    }
  }

  // Quick Status Change
  async function changeStatus(teacher: TeacherCardData, newStatus: string) {
    try {
      await api(`/api/admin/teachers/${teacher._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Status updated to ${newStatus}`);
      await teachersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  // Duplicate Teacher
  async function duplicateTeacher(teacher: TeacherCardData) {
    try {
      const copy = {
        ...teacher,
        name: `${teacher.name} (Copy)`,
        slug: `${teacher.slug || 'teacher'}-copy-${Date.now().toString().slice(-4)}`,
        status: 'draft',
      };
      delete (copy as any)._id;
      delete (copy as any).createdAt;
      delete (copy as any).updatedAt;

      await api('/api/admin/teachers', {
        method: 'POST',
        body: JSON.stringify(copy),
      });
      toast.success('Teacher duplicated as Draft');
      await teachersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate teacher');
    }
  }

  // Delete Teacher
  async function handleDeleteTeacher() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/admin/teachers/${deleteTarget._id}?permanent=true`, {
        method: 'DELETE',
      });
      toast.success('Teacher deleted successfully');
      setDeleteTarget(null);
      await teachersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete teacher');
    } finally {
      setDeleting(false);
    }
  }

  // Move Display Order Up/Down
  async function moveOrder(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === teachers.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...teachers];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderedIds = reordered.map((t) => t._id);
    try {
      await api('/api/admin/teachers/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ orderedIds }),
      });
      toast.success('Order updated');
      await teachersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reorder');
    }
  }

  // Bulk Checkbox Handlers
  function toggleSelectAll() {
    if (selectedIds.length === teachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(teachers.map((t) => t._id));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  // Bulk Actions
  async function handleBulkAction() {
    if (!bulkAction || selectedIds.length === 0) return;
    setBulkProcessing(true);
    try {
      if (bulkAction === 'publish' || bulkAction === 'unpublish') {
        const targetStatus = bulkAction === 'publish' ? 'published' : 'draft';
        await Promise.all(
          selectedIds.map((id) =>
            api(`/api/admin/teachers/${id}/status`, {
              method: 'PATCH',
              body: JSON.stringify({ status: targetStatus }),
            }),
          ),
        );
        toast.success(`${selectedIds.length} teachers marked as ${targetStatus}`);
      } else if (bulkAction === 'feature' || bulkAction === 'unfeature') {
        const targetFeatured = bulkAction === 'feature';
        await Promise.all(
          selectedIds.map((id) =>
            api(`/api/admin/teachers/${id}/featured`, {
              method: 'PATCH',
              body: JSON.stringify({ featured: targetFeatured }),
            }),
          ),
        );
        toast.success(`${selectedIds.length} teachers updated`);
      } else if (bulkAction === 'delete') {
        await Promise.all(
          selectedIds.map((id) =>
            api(`/api/admin/teachers/${id}?permanent=true`, { method: 'DELETE' }),
          ),
        );
        toast.success(`${selectedIds.length} teachers deleted`);
      }
      setSelectedIds([]);
      setBulkAction(null);
      await teachersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk operation failed');
    } finally {
      setBulkProcessing(false);
    }
  }

  // Applicant Decision
  async function decideApplicant() {
    if (!applicantAction) return;
    setApplicantBusy(true);
    try {
      await api(`/api/admin/teachers/${applicantAction.id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ teacherStatus: applicantAction.status }),
      });
      toast.success(`Applicant ${applicantAction.status}`);
      setApplicantAction(null);
      await applicantsQuery.refetch();
      await teachersQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Decision failed');
    } finally {
      setApplicantBusy(false);
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6 pb-12" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
                Teacher Management
              </h1>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                CMS & Directory
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Create, edit, organize faculty profiles, assign courses, and moderate reviews.
            </p>
          </div>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12" suppressHydrationWarning>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Teacher Management
            </h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              CMS & Directory
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Create, edit, organize faculty profiles, assign courses, and moderate reviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={() => {
              setSelectedTeacher(null);
              setEditModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* View Switcher: Directory vs Applicants */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setAdminView('directory')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            adminView === 'directory'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Faculty Directory ({summary.total})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminView('applicants')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            adminView === 'applicants'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Teacher Applicants ({applicantsQuery.data?.items?.length ?? 0})</span>
        </button>
      </div>

      {adminView === 'directory' ? (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Total Teachers</p>
              <p className="font-display text-2xl font-bold text-stone-900 mt-1">{summary.total}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Published</p>
              <p className="font-display text-2xl font-bold text-emerald-950 mt-1">{summary.published}</p>
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Featured</p>
              <p className="font-display text-2xl font-bold text-amber-950 mt-1">{summary.featured}</p>
            </div>
            <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">Drafts</p>
              <p className="font-display text-2xl font-bold text-stone-900 mt-1">{summary.draft}</p>
            </div>
            <div className="rounded-2xl border border-orange-200/80 bg-orange-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">Pending</p>
              <p className="font-display text-2xl font-bold text-orange-950 mt-1">{summary.pending}</p>
            </div>
          </div>

          {/* Search, Filter & Bulk Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search teacher, subject, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter status"
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 outline-none focus:border-stone-900"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="archived">Archived</option>
              </select>

              {/* Subject Filter */}
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter subject"
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 outline-none focus:border-stone-900 max-w-[150px]"
              >
                <option value="all">All Subjects</option>
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Featured Filter */}
              <select
                value={featuredFilter}
                onChange={(e) => {
                  setFeaturedFilter(e.target.value as any);
                  setPage(1);
                }}
                aria-label="Filter featured"
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 outline-none focus:border-stone-900"
              >
                <option value="all">All (Featured & Regular)</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                aria-label="Sort order"
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 outline-none focus:border-stone-900"
              >
                <option value="order">Display Order</option>
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
                <option value="students">Most Students</option>
              </select>
            </div>
          </div>

          {/* Bulk Operations Toolbar */}
          {selectedIds.length > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-950 animate-fadeIn">
              <span className="font-semibold">
                {selectedIds.length} teacher{selectedIds.length === 1 ? '' : 's'} selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setBulkAction('publish');
                    void handleBulkAction();
                  }}
                  disabled={bulkProcessing}
                >
                  Publish
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setBulkAction('unpublish');
                    void handleBulkAction();
                  }}
                  disabled={bulkProcessing}
                >
                  Unpublish
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setBulkAction('feature');
                    void handleBulkAction();
                  }}
                  disabled={bulkProcessing}
                >
                  Feature
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Permanently delete ${selectedIds.length} teachers?`)) {
                      setBulkAction('delete');
                      void handleBulkAction();
                    }
                  }}
                  disabled={bulkProcessing}
                >
                  Delete Selected
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-stone-500 hover:text-stone-800 ml-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {/* Teacher Table */}
          {teachersQuery.isLoading ? (
            <LoadingState />
          ) : teachersQuery.isError ? (
            <ErrorState
              message={(teachersQuery.error as Error).message}
              onRetry={() => void teachersQuery.refetch()}
            />
          ) : !teachers.length ? (
            <EmptyState
              title="No teachers found"
              body="Add a new teacher or adjust your search filters."
              action={{
                label: 'Add Teacher',
                onClick: () => {
                  setSelectedTeacher(null);
                  setEditModalOpen(true);
                },
              }}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === teachers.length && teachers.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                      </th>
                      <th className="p-3.5">Teacher</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Experience</th>
                      <th className="p-3.5">Courses</th>
                      <th className="p-3.5">Students</th>
                      <th className="p-3.5">Rating</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-center">Featured</th>
                      <th className="p-3.5 text-center">Order</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {teachers.map((t, idx) => {
                      const isSelected = selectedIds.includes(t._id);
                      const ratingVal = t.stats?.rating ?? t.ratingAvg ?? 5.0;
                      const courseNum = t.stats?.courseCount ?? t.courseCount ?? 0;
                      const studentNum = t.stats?.enrollmentCount ?? t.enrollmentCount ?? 0;
                      const avatarUrl = t.profileImage?.url || t.avatar?.url;

                      return (
                        <tr
                          key={t._id}
                          className={`transition hover:bg-stone-50/70 ${
                            isSelected ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(t._id)}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                          </td>

                          {/* Profile & Name */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-stone-200 border border-stone-200">
                                {avatarUrl ? (
                                  <Image
                                    src={avatarUrl}
                                    alt={t.name}
                                    fill
                                    className="object-cover object-top"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center font-bold text-stone-600">
                                    {t.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-stone-900 truncate">{t.name}</p>
                                <p className="text-[11px] text-stone-400 truncate">
                                  /teachers/{t.slug || t._id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Subject & Specialization */}
                          <td className="p-3.5">
                            <span className="font-medium text-stone-800">
                              {t.subject || t.subjects?.[0] || 'General'}
                            </span>
                            {t.specialization ? (
                              <p className="text-[10px] text-stone-400 truncate max-w-[140px]">
                                {t.specialization}
                              </p>
                            ) : null}
                          </td>

                          {/* Experience */}
                          <td className="p-3.5 text-stone-600 font-medium">
                            {t.experience || '5+ Years'}
                          </td>

                          {/* Courses */}
                          <td className="p-3.5 text-stone-700 font-medium">{courseNum}</td>

                          {/* Students */}
                          <td className="p-3.5 text-stone-700 font-medium">{studentNum}</td>

                          {/* Rating */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1 font-bold text-stone-800">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                              <span>{ratingVal.toFixed(1)}</span>
                            </div>
                          </td>

                          {/* Status Badge with quick toggle */}
                          <td className="p-3.5">
                            <select
                              value={t.status || 'published'}
                              onChange={(e) => void changeStatus(t, e.target.value)}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border outline-none cursor-pointer ${
                                t.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : t.status === 'draft'
                                  ? 'bg-stone-100 text-stone-700 border-stone-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="pending">Pending</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>

                          {/* Featured Star Toggle */}
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => void toggleFeatured(t)}
                              title={t.featured ? 'Unfeature' : 'Feature'}
                              className={`p-1.5 rounded-lg transition ${
                                t.featured
                                  ? 'text-amber-500 hover:bg-amber-50'
                                  : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                              }`}
                            >
                              <Star className={`h-4 w-4 ${t.featured ? 'fill-amber-400' : ''}`} />
                            </button>
                          </td>

                          {/* Order Up / Down */}
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => void moveOrder(idx, 'up')}
                                disabled={idx === 0}
                                title="Move up"
                                className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void moveOrder(idx, 'down')}
                                disabled={idx === teachers.length - 1}
                                title="Move down"
                                className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Row Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View public profile */}
                              <Link
                                href={`/teachers/${t.slug || t._id}`}
                                target="_blank"
                                title="View public profile"
                                className="p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTeacher(t);
                                  setEditModalOpen(true);
                                }}
                                title="Edit teacher"
                                className="p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              {/* Duplicate */}
                              <button
                                type="button"
                                onClick={() => void duplicateTeacher(t)}
                                title="Duplicate"
                                className="p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition"
                              >
                                <Copy className="h-4 w-4" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(t)}
                                title="Delete"
                                className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {teachersQuery.data && teachersQuery.data.pages > 1 ? (
                <div className="flex justify-between items-center border-t border-stone-200 p-4">
                  <p className="text-xs text-stone-500">
                    Showing {(page - 1) * 20 + 1} to{' '}
                    {Math.min(page * 20, teachersQuery.data.total)} of{' '}
                    {teachersQuery.data.total} teachers
                  </p>
                  <Pagination
                    page={page}
                    pages={teachersQuery.data.pages}
                    onPage={setPage}
                  />
                </div>
              ) : null}
            </div>
          )}
        </>
      ) : (
        /* APPLICANTS VIEW */
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-stone-900">
              Teacher Applications & Approvals
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Users who signed up or applied to teach on Gyan Chowk. Approving them grants teacher access.
            </p>

            {applicantsQuery.isLoading ? (
              <LoadingState />
            ) : applicantsQuery.isError ? (
              <ErrorState
                message={(applicantsQuery.error as Error).message}
                onRetry={() => void applicantsQuery.refetch()}
              />
            ) : !(applicantsQuery.data?.items?.length) ? (
              <EmptyState title="No teacher applicants" />
            ) : (
              <ul className="mt-5 space-y-3">
                {applicantsQuery.data.items.map((t) => (
                  <li
                    key={t._id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 p-4 bg-stone-50/50"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">{t.name}</p>
                      <p className="text-xs text-stone-500">{t.email}</p>
                      {t.headline ? <p className="text-xs text-amber-800 mt-0.5">{t.headline}</p> : null}
                      <div className="mt-1.5">
                        <StatusBadge status={t.teacherStatus ?? 'pending'} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setApplicantAction({ id: t._id, status: 'approved' })}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setApplicantAction({ id: t._id, status: 'rejected' })}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="danger"
                        type="button"
                        onClick={() => setApplicantAction({ id: t._id, status: 'suspended' })}
                      >
                        Suspend
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Teacher Edit Modal */}
      <TeacherEditModal
        teacher={selectedTeacher}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTeacher(null);
        }}
        onSaved={() => void teachersQuery.refetch()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete teacher "${deleteTarget?.name}"?`}
        body="This will remove the teacher profile from Gyan Chowk. Are you sure you want to proceed?"
        confirmLabel="Delete Teacher"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteTeacher()}
      />

      {/* Applicant Decision Modal */}
      <ConfirmDialog
        open={Boolean(applicantAction)}
        title={`${applicantAction?.status} this teacher applicant?`}
        body="This updates teacherStatus on the server and notifies the applicant."
        confirmLabel={
          applicantAction?.status === 'approved'
            ? 'Approve'
            : applicantAction?.status === 'rejected'
            ? 'Reject'
            : 'Suspend'
        }
        loading={applicantBusy}
        onClose={() => setApplicantAction(null)}
        onConfirm={() => void decideApplicant()}
      />
    </div>
  );
}

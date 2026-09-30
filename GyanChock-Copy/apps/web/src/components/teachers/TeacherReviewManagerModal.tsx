'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Star,
  Trash2,
  Edit2,
  Plus,
  Check,
  X,
  Upload,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Overlay';
import { uploadCloudinaryImage } from '@/lib/upload';
import type { TeacherCardData } from '@/lib/types';

interface ReviewItem {
  _id?: string;
  id?: string;
  studentName: string;
  studentAvatar?: string;
  roleOrExam?: string;
  targetExam?: string;
  rating: number;
  comment: string;
  reviewText?: string;
  date?: string;
  approved?: boolean;
  featured?: boolean;
}

export function TeacherReviewManagerModal({
  teacher,
  open,
  onClose,
  onSaved,
}: {
  teacher: TeacherCardData;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'calibrate'>('list');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Add review form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newRoleOrExam, setNewRoleOrExam] = useState('UPSC Aspirant');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newApproved, setNewApproved] = useState(true);
  const [newFeatured, setNewFeatured] = useState(true);
  const [adding, setAdding] = useState(false);
  const [uploadingNewAvatar, setUploadingNewAvatar] = useState(false);

  // Edit review state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editRoleOrExam, setEditRoleOrExam] = useState('');
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editApproved, setEditApproved] = useState(true);
  const [editFeatured, setEditFeatured] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingEditAvatar, setUploadingEditAvatar] = useState(false);

  // Calibrate stats state
  const [customRating, setCustomRating] = useState('5.0');
  const [customReviewCount, setCustomReviewCount] = useState('38');
  const [calibrating, setCalibrating] = useState(false);

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      return;
    }

    if (teacher.reviews && teacher.reviews.length > 0) {
      setReviews(JSON.parse(JSON.stringify(teacher.reviews)));
    } else {
      setReviews([]);
    }

    const currentRating = teacher.stats?.rating ?? teacher.ratingAvg ?? 5.0;
    const currentReviewCount = teacher.stats?.reviewCount ?? teacher.ratingCount ?? reviews.length;
    setCustomRating(String(currentRating));
    setCustomReviewCount(String(currentReviewCount));
    setNewDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
  }, [open, teacher]);

  async function refreshTeacherData() {
    await queryClient.invalidateQueries({ queryKey: ['teacher-profile', teacher.slug] });
    await queryClient.invalidateQueries({ queryKey: ['teacher-profile', teacher._id] });
    await queryClient.invalidateQueries({ queryKey: ['teachers-list'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-teachers-list'] });
    onSaved?.();
  }

  // --- Add Review ---
  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newStudentName.trim()) {
      toast.error('Student name is required');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Review comment is required');
      return;
    }

    setAdding(true);
    try {
      const res = await api<{ teacher: any; review: ReviewItem }>(
        `/api/admin/teachers/${teacher._id}/reviews`,
        {
          method: 'POST',
          body: JSON.stringify({
            studentName: newStudentName.trim(),
            studentAvatar: newAvatar.trim() || undefined,
            roleOrExam: newRoleOrExam.trim() || 'Student',
            rating: newRating,
            comment: newComment.trim(),
            reviewText: newComment.trim(),
            date: newDate.trim() || undefined,
            approved: newApproved,
            featured: newFeatured,
          }),
        },
      );

      toast.success('Verified review added successfully');
      setReviews(res.teacher?.reviews || [res.review, ...reviews]);
      // Reset form
      setNewStudentName('');
      setNewRoleOrExam('UPSC Aspirant');
      setNewRating(5);
      setNewComment('');
      setNewAvatar('');
      setActiveTab('list');
      await refreshTeacherData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add review');
    } finally {
      setAdding(false);
    }
  }

  // --- Edit Review ---
  function startEditing(rev: ReviewItem, idx: number) {
    const id = rev._id || rev.id || String(idx);
    setEditingId(id);
    setEditStudentName(rev.studentName || '');
    setEditRoleOrExam(rev.roleOrExam || rev.targetExam || '');
    setEditRating(rev.rating || 5);
    setEditComment(rev.comment || rev.reviewText || '');
    setEditDate(rev.date || '');
    setEditAvatar(rev.studentAvatar || '');
    setEditApproved(rev.approved !== false);
    setEditFeatured(rev.featured !== false);
  }

  async function handleUpdateReview(revId: string) {
    if (!editStudentName.trim()) {
      toast.error('Student name cannot be empty');
      return;
    }
    if (!editComment.trim()) {
      toast.error('Review comment cannot be empty');
      return;
    }

    setUpdating(true);
    try {
      const res = await api<{ teacher: any; review: ReviewItem }>(
        `/api/admin/teachers/${teacher._id}/reviews/${revId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            studentName: editStudentName.trim(),
            studentAvatar: editAvatar.trim(),
            roleOrExam: editRoleOrExam.trim(),
            rating: editRating,
            comment: editComment.trim(),
            reviewText: editComment.trim(),
            date: editDate.trim(),
            approved: editApproved,
            featured: editFeatured,
          }),
        },
      );

      toast.success('Review updated successfully');
      setReviews(res.teacher?.reviews || reviews);
      setEditingId(null);
      await refreshTeacherData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update review');
    } finally {
      setUpdating(false);
    }
  }

  // --- Toggle Moderation (Approve / Hide) ---
  async function handleToggleModerate(rev: ReviewItem, idx: number) {
    const revId = rev._id || rev.id || String(idx);
    const newStatus = rev.approved === false;
    try {
      const res = await api<{ teacher: any; review: ReviewItem }>(
        `/api/admin/teachers/${teacher._id}/reviews/${revId}/moderate`,
        {
          method: 'PATCH',
          body: JSON.stringify({ approved: newStatus }),
        },
      );

      toast.success(newStatus ? 'Review approved & visible' : 'Review hidden from public');
      setReviews(res.teacher?.reviews || reviews);
      await refreshTeacherData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change review status');
    }
  }

  // --- Delete Review ---
  async function handleDeleteReview(rev: ReviewItem, idx: number) {
    const revId = rev._id || rev.id || String(idx);
    if (!window.confirm(`Delete review from "${rev.studentName}"?`)) return;

    try {
      const res = await api<{ success: boolean; teacher: any }>(
        `/api/admin/teachers/${teacher._id}/reviews/${revId}`,
        { method: 'DELETE' },
      );

      toast.success('Review deleted');
      setReviews(res.teacher?.reviews || reviews.filter((_, i) => i !== idx));
      if (editingId === revId) setEditingId(null);
      await refreshTeacherData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete review');
    }
  }

  // --- Calibrate Stats ---
  async function handleSaveStats() {
    setCalibrating(true);
    try {
      const parsedRating = Math.max(1, Math.min(5, parseFloat(customRating) || 5.0));
      const parsedCount = Math.max(0, parseInt(customReviewCount, 10) || 0);

      await api(`/api/admin/teachers/${teacher._id}/stats`, {
        method: 'PATCH',
        body: JSON.stringify({
          rating: parsedRating,
          reviewCount: parsedCount,
        }),
      });

      toast.success('Rating & review count calibrated successfully');
      await refreshTeacherData();
      setActiveTab('list');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to calibrate stats');
    } finally {
      setCalibrating(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Manage Reviews: ${teacher.name}`}
    >
      <div className="flex flex-col max-h-[75vh] w-full max-w-2xl">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                setEditingId(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'list'
                  ? 'bg-[#1C1815] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('add');
                setEditingId(null);
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'add'
                  ? 'bg-[#1C1815] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Plus className="h-3 w-3" /> Add Review
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('calibrate');
                setEditingId(null);
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'calibrate'
                  ? 'bg-[#1C1815] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Sliders className="h-3 w-3" /> Calibrate Rating
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>{(teacher.stats?.rating ?? 5.0).toFixed(1)}</span>
            <span className="text-stone-400 font-normal">
              ({teacher.stats?.reviewCount ?? reviews.length} reviews)
            </span>
          </div>
        </div>

        {/* Tab 1: REVIEWS LIST */}
        {activeTab === 'list' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center bg-stone-50">
                <Star className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                <p className="text-sm font-bold text-stone-800">No reviews yet</p>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Add student testimonials or let students submit reviews directly from the profile page.
                </p>
                <div className="mt-4">
                  <Button type="button" onClick={() => setActiveTab('add')}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Verified Review
                  </Button>
                </div>
              </div>
            ) : (
              reviews.map((rev, idx) => {
                const revId = rev._id || rev.id || String(idx);
                const isEditing = editingId === revId;
                const isApproved = rev.approved !== false;

                if (isEditing) {
                  return (
                    <div
                      key={revId}
                      className="rounded-2xl border border-amber-300 bg-amber-50/20 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                        <span className="text-xs font-bold text-amber-900">
                          Editing Review #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-stone-400 hover:text-stone-600 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Student Name
                          </label>
                          <Input
                            value={editStudentName}
                            onChange={(e) => setEditStudentName(e.target.value)}
                            placeholder="Student Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Target Exam
                          </label>
                          <Input
                            value={editRoleOrExam}
                            onChange={(e) => setEditRoleOrExam(e.target.value)}
                            placeholder="e.g. UPSC Aspirant"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Rating (1 - 5)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={String(editRating)}
                            onChange={(e) => setEditRating(parseFloat(e.target.value) || 5)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Date Displayed
                          </label>
                          <Input
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            placeholder="e.g. 15 Aug 2025"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Student Avatar Photo
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50">
                              <Upload className="h-3 w-3 inline mr-1" />
                              {uploadingEditAvatar ? 'Uploading...' : 'Change Photo'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingEditAvatar}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setUploadingEditAvatar(true);
                                  try {
                                    const res = await uploadCloudinaryImage(file, 'avatars');
                                    setEditAvatar(res.url);
                                    toast.success('Photo updated');
                                  } catch (err) {
                                    toast.error(err instanceof Error ? err.message : 'Upload failed');
                                  } finally {
                                    setUploadingEditAvatar(false);
                                  }
                                }}
                              />
                            </label>
                            {editAvatar && (
                              <span className="text-[11px] text-emerald-600 font-medium">✓ Uploaded</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Review Text
                        </label>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editApproved}
                              onChange={(e) => setEditApproved(e.target.checked)}
                              className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
                            />
                            <span>Approved (Visible)</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFeatured}
                              onChange={(e) => setEditFeatured(e.target.checked)}
                              className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
                            />
                            <span>Featured</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleUpdateReview(revId)}
                            disabled={updating}
                            className="bg-[#8C6228] text-white hover:bg-[#735020]"
                          >
                            {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={revId}
                    className={`rounded-2xl border p-3.5 transition ${
                      isApproved
                        ? 'border-stone-200 bg-white hover:border-amber-200'
                        : 'border-amber-200 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Student info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                          {rev.studentAvatar ? (
                            <Image
                              src={rev.studentAvatar}
                              alt={rev.studentName}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-stone-600">
                              {rev.studentName.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs font-bold text-[#1C1815]">
                              {rev.studentName}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {isApproved ? 'Approved' : 'Hidden'}
                            </span>
                            {rev.featured ? (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200">
                                Featured
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-stone-500">
                            {rev.roleOrExam || rev.targetExam || 'Student'}
                            {rev.date ? ` • ${rev.date}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Rating & Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 text-xs font-bold text-amber-700">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                          <span>{(rev.rating || 5).toFixed(1)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleModerate(rev, idx)}
                          title={isApproved ? 'Hide from public' : 'Approve & show publicly'}
                          className={`p-1.5 rounded-lg transition ${
                            isApproved
                              ? 'text-stone-400 hover:text-amber-800 hover:bg-amber-50'
                              : 'text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          {isApproved ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => startEditing(rev, idx)}
                          title="Edit review"
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev, idx)}
                          title="Delete review"
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="mt-2 text-xs leading-relaxed text-stone-600 pl-11">
                      &ldquo;{rev.comment || rev.reviewText}&rdquo;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: ADD VERIFIED REVIEW */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddReview} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Exam / Goal
                </label>
                <Input
                  value={newRoleOrExam}
                  onChange={(e) => setNewRoleOrExam(e.target.value)}
                  placeholder="e.g. NEET Aspirant"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Star Rating (1 - 5)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={String(newRating)}
                  onChange={(e) => setNewRating(parseFloat(e.target.value) || 5)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Date Displayed
                </label>
                <Input
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. 24 Sep 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Student Photo (Cloudinary)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 transition">
                    <Upload className="h-3.5 w-3.5 inline mr-1" />
                    {uploadingNewAvatar ? 'Uploading...' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingNewAvatar}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingNewAvatar(true);
                        try {
                          const res = await uploadCloudinaryImage(file, 'avatars');
                          setNewAvatar(res.url);
                          toast.success('Photo uploaded');
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Upload failed');
                        } finally {
                          setUploadingNewAvatar(false);
                        }
                      }}
                    />
                  </label>
                  {newAvatar ? (
                    <span className="text-xs text-emerald-600 font-semibold">✓ Photo attached</span>
                  ) : (
                    <span className="text-[11px] text-stone-400">Optional</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Review Testimonial Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write student's genuine experience, results, or praise..."
                rows={3}
                required
                className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newApproved}
                    onChange={(e) => setNewApproved(e.target.checked)}
                    className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
                  />
                  <span>Publish Immediately (Approved)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFeatured}
                    onChange={(e) => setNewFeatured(e.target.checked)}
                    className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
                  />
                  <span>Featured on Profile</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={adding || uploadingNewAvatar}
                className="bg-[#8C6228] text-white hover:bg-[#735020]"
              >
                {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                Add Verified Review
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: CALIBRATE RATING */}
        {activeTab === 'calibrate' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
            <div className="rounded-2xl border border-amber-200 bg-[#FFFDF8] p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Admin Rating & Count Calibration</span>
              </div>
              <p className="text-xs text-[#5C544D] leading-relaxed">
                By default, the system calculates the live rating from all approved student reviews.
                Here, you can adjust or calibrate the baseline rating and review count shown across teacher cards and profile banners.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Overall Rating (e.g. 5.0 or 4.9)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={customRating}
                  onChange={(e) => setCustomRating(e.target.value)}
                  placeholder="5.0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Total Reviews Displayed (e.g. 38 or 120)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={customReviewCount}
                  onChange={(e) => setCustomReviewCount(e.target.value)}
                  placeholder="38"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <Button
                type="button"
                onClick={handleSaveStats}
                disabled={calibrating}
                className="bg-[#8C6228] text-white hover:bg-[#735020]"
              >
                {calibrating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Save Calibrated Stats
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

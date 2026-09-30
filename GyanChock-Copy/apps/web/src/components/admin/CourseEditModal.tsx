'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ImagePlus, Trash2, X, Save, Plus, Sparkles, Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Overlay';
import { uploadCloudinaryImage } from '@/lib/upload';
import type { CourseCardData } from '@/lib/types';

function toDateInput(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function CourseEditModal({
  course,
  open,
  onClose,
  onDeleted,
  onSaved,
}: {
  course?: CourseCardData | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: (id: string) => void;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(course?._id);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('engineering');
  const [targetExam, setTargetExam] = useState('');
  const [foundation, setFoundation] = useState('Basic');
  const [language, setLanguage] = useState('Spanish');
  const [teacherName, setTeacherName] = useState('Expert Faculty');
  const [startsOn, setStartsOn] = useState('2026-09-30');
  const [pricingType, setPricingType] = useState('paid');
  const [price, setPrice] = useState('3000');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [ratingAvg, setRatingAvg] = useState('4.8');
  const [ratingCount, setRatingCount] = useState('1800');
  const [enrollmentCount, setEnrollmentCount] = useState('8200');
  const [featured, setFeatured] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setSubtitle(course.subtitle || '');
      setCategory(course.category || 'engineering');
      setTargetExam(course.targetExam || '');
      setFoundation(course.foundation || 'Basic');
      setLanguage(course.language || 'Spanish');
      setTeacherName(course.teacherName || course.teachers?.[0]?.name || 'Expert Faculty');
      setStartsOn(toDateInput(course.startsOn) || '2026-09-30');
      setPricingType(course.pricingType || 'paid');
      setPrice(String(course.price ?? 3000));
      setDiscountPercent(String(course.discountPercent ?? 20));
      setRatingAvg(course.ratingAvg != null ? String(course.ratingAvg) : '4.8');
      setRatingCount(course.ratingCount != null ? String(course.ratingCount) : '1800');
      setEnrollmentCount(course.enrollmentCount != null ? String(course.enrollmentCount) : '8200');
      setFeatured(course.featured !== false);
      setImageUrl(course.thumbnail?.url || '');
      setImagePublicId('');
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('engineering');
      setTargetExam('MERN');
      setFoundation('Basic');
      setLanguage('Spanish');
      setTeacherName('Expert Faculty');
      setStartsOn('2026-09-30');
      setPricingType('paid');
      setPrice('3000');
      setDiscountPercent('20');
      setRatingAvg('4.8');
      setRatingCount('1800');
      setEnrollmentCount('8200');
      setFeatured(true);
      setImageUrl('');
      setImagePublicId('');
    }
  }, [course, open]);

  async function refreshAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['courses'] }),
      queryClient.invalidateQueries({ queryKey: ['cms-public'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-cms-courses'] }),
      queryClient.invalidateQueries({ queryKey: ['course-meta'] }),
    ]);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadCloudinaryImage(file, 'courses');
      setImageUrl(media.url);
      setImagePublicId(media.publicId);
      toast.success('Course cover uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a course title.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        category: category.trim() || 'general',
        targetExam: targetExam.trim() || undefined,
        foundation: foundation.trim() || 'Basic',
        language: language.trim() || 'Spanish',
        teacherName: teacherName.trim() || 'Expert Faculty',
        startsOn: startsOn ? startsOn : null,
        pricingType,
        price: Number(price) || 0,
        discountPercent: Number(discountPercent) || 0,
        ratingAvg: Number(ratingAvg) || 4.8,
        ratingCount: Number(ratingCount) || 1800,
        enrollmentCount: Number(enrollmentCount) || 8200,
        featured,
      };

      if (imagePublicId && imageUrl) {
        payload.thumbnail = { publicId: imagePublicId, url: imageUrl };
      } else if (imageUrl && !imagePublicId) {
        payload.thumbnail = { publicId: `custom-${Date.now()}`, url: imageUrl };
      }

      if (isEditing && course?._id) {
        await api(`/api/courses/${course._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Course updated successfully!');
      } else {
        await api('/api/courses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Course created and published!');
      }

      await refreshAll();
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!course?._id) return;
    setDeleting(true);
    try {
      await api(`/api/courses/${course._id}`, { method: 'DELETE' });
      toast.success('Course deleted.');
      await refreshAll();
      if (onDeleted) onDeleted(course._id);
      setConfirmDelete(false);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete course.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEditing ? 'Edit Course Card' : 'Add New Course'}
      >
        <form onSubmit={onSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JAVA Develop or Full-Stack MERN"
              required
            />
          </div>

          {/* Teacher / Faculty Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Faculty / Teacher Name
            </label>
            <Input
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="e.g. Expert Faculty"
            />
          </div>

          {/* Foundation (Left side) & Language (Right side - transparent) */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Foundation Tag (Left side, e.g. Basic)
              </label>
              <Input
                value={foundation}
                onChange={(e) => setFoundation(e.target.value)}
                placeholder="e.g. Basic, Foundation, Advanced"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Language Tag (Right side, transparent)
              </label>
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. Spanish, English, Hindi"
              />
            </div>
          </div>

          {/* Target Exam & Category */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Exam / Tech Badge (e.g. MERN)
              </label>
              <Input
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="e.g. MERN, JAVA, GATE"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. engineering, IT, medical"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date (e.g. 2026-09-30 displays as Started on 30th Sept&apos;26)
              </label>
              <Input
                type="date"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pricing Type
              </label>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
              >
                <option value="paid">Paid</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>

          {/* Price & Discount */}
          {pricingType === 'paid' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Original Price (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 3000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount (%) e.g. 20 for ₹2,400
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="e.g. 20"
                />
              </div>
            </div>
          )}

          {/* Social Proof: Rating & Students Enrolled */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rating (e.g. 4.8)
              </label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={ratingAvg}
                onChange={(e) => setRatingAvg(e.target.value)}
                placeholder="4.8"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Review Count (e.g. 1800 for 1.8k)
              </label>
              <Input
                type="number"
                min="0"
                value={ratingCount}
                onChange={(e) => setRatingCount(e.target.value)}
                placeholder="1800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Students (e.g. 8200 for 8.2k)
              </label>
              <Input
                type="number"
                min="0"
                value={enrollmentCount}
                onChange={(e) => setEnrollmentCount(e.target.value)}
                placeholder="8200"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cover Image URL
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... or upload below"
            />

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                <ImagePlus size={14} />
                <span>{uploading ? 'Uploading…' : 'Upload Cover Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>

              {imageUrl && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-10 w-16 rounded object-cover border border-slate-200"
                  />
                  <span className="text-[11px] text-slate-400">Preview</span>
                </div>
              )}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2 rounded-xl bg-amber-50/70 p-3 border border-amber-200/60">
            <input
              type="checkbox"
              id="course-featured-toggle"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="course-featured-toggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Feature on Homepage Catalogue &amp; Popular Courses
            </label>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving || deleting}
                  className="text-xs font-semibold"
                >
                  <Trash2 size={13} className="mr-1" />
                  Delete Course
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving} className="font-semibold">
                <Save size={14} className="mr-1.5" />
                {isEditing ? 'Save Changes' : 'Publish Course'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this course?"
        body="This will permanently delete the course, its syllabus, enrollments, and remove it from the catalogue. This cannot be undone."
        confirmLabel="Yes, Delete Course"
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}

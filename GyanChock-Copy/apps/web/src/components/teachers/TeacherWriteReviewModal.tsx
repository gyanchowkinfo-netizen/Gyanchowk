'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import { Star, Upload, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Overlay';
import { uploadCloudinaryImage } from '@/lib/upload';
import type { TeacherCardData } from '@/lib/types';

const RATING_LABELS: Record<number, string> = {
  1: '1.0 - Needs Improvement',
  2: '2.0 - Fair Experience',
  3: '3.0 - Good Teacher',
  4: '4.0 - Very Good & Clear',
  5: '5.0 - Exceptional & Outstanding',
};

export function TeacherWriteReviewModal({
  teacher,
  open,
  onClose,
  onSubmitted,
}: {
  teacher: TeacherCardData;
  open: boolean;
  onClose: () => void;
  onSubmitted?: (review: any) => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [studentName, setStudentName] = useState('');
  const [roleOrExam, setRoleOrExam] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [studentAvatar, setStudentAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmittedSuccess(false);
      return;
    }
    // Prefill name if logged in
    if (user?.name) {
      setStudentName(user.name);
    }
    if ((user as any)?.avatar?.url) {
      setStudentAvatar((user as any).avatar.url);
    }
  }, [open, user]);

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    try {
      const res = await uploadCloudinaryImage(file, 'avatars');
      setStudentAvatar(res.url);
      toast.success('Photo uploaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!studentName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a few words about your learning experience');
      return;
    }

    setSubmitting(true);
    try {
      const teacherId = teacher._id || teacher.slug;
      const res = await api<{ success: boolean; review: any; stats: any }>(
        `/api/teachers/${teacherId}/reviews`,
        {
          method: 'POST',
          body: JSON.stringify({
            studentName: studentName.trim(),
            studentAvatar: studentAvatar.trim() || undefined,
            roleOrExam: roleOrExam.trim() || 'Student',
            targetExam: roleOrExam.trim() || 'Student',
            rating,
            comment: comment.trim(),
            reviewText: comment.trim(),
          }),
        },
      );

      toast.success('Your review has been submitted successfully!');
      setSubmittedSuccess(true);

      // Invalidate relevant queries so live ratings and carousel refresh
      await queryClient.invalidateQueries({ queryKey: ['teacher-profile', teacher.slug] });
      await queryClient.invalidateQueries({ queryKey: ['teacher-profile', teacher._id] });
      await queryClient.invalidateQueries({ queryKey: ['teachers-list'] });

      onSubmitted?.(res.review);

      // Close modal after a short joyful delay or let user dismiss
      setTimeout(() => {
        onClose();
        // Reset form
        setComment('');
        setRoleOrExam('');
        setRating(5);
        setSubmittedSuccess(false);
      }, 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  const activeRating = hoverRating ?? rating;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={submittedSuccess ? 'Review Submitted!' : `Review ${teacher.name}`}
    >
      {submittedSuccess ? (
        <div className="py-6 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-stone-900">
            Thank you for your valuable feedback!
          </h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            Your review and rating help students across Gyan Chowk discover the best educators.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Rating Stars Selector */}
          <div className="rounded-2xl border border-amber-200/80 bg-[#FFFDF8] p-4 text-center space-y-2">
            <p className="text-xs font-semibold text-[#8C6228]">Rate your learning experience</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const filled = starVal <= activeRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    aria-label={`${starVal} Star`}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        filled
                          ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                          : 'fill-stone-100 text-stone-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-[#1C1815]">
              {RATING_LABELS[activeRating] || `${activeRating}.0 Rating`}
            </p>
          </div>

          {/* Student Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Exam / Class
              </label>
              <Input
                value={roleOrExam}
                onChange={(e) => setRoleOrExam(e.target.value)}
                placeholder="e.g. UPSC Aspirant, NEET 2026, Class 12"
              />
            </div>
          </div>

          {/* Optional Avatar Upload */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Your Photo / Avatar <span className="text-[10px] text-stone-500 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                {studentAvatar ? (
                  <Image
                    src={studentAvatar}
                    alt="Student"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-stone-500">
                    {studentName ? studentName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:border-amber-300">
                <Upload className="h-3.5 w-3.5 text-stone-500" />
                <span>{uploadingAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleAvatarUpload(file);
                  }}
                />
              </label>

              {studentAvatar && (
                <button
                  type="button"
                  onClick={() => setStudentAvatar('')}
                  className="text-stone-400 hover:text-red-500 p-1 rounded transition"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Comment / Review Body */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Your Review & Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share what you liked most about ${teacher.name}'s teaching methods, clarity of concepts, notes, or exam preparation tips...`}
              rows={4}
              required
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs leading-relaxed text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadingAvatar}
              className="bg-[#8C6228] hover:bg-[#735020] text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

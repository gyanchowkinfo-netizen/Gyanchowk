'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  PenLine,
  Settings2,
  MessageSquareQuote,
  Loader2,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Overlay';
import { uploadCloudinaryImage } from '@/lib/upload';

import { SHARED_STUDENT_REVIEWS, type UnifiedReview } from '../teachers/sharedReviews';

export interface LandingReviewItem {
  _id?: string;
  id?: string;
  studentName?: string;
  body?: string;
  comment?: string;
  reviewText?: string;
  rating?: number;
  verified?: boolean;
  user?: { name?: string; avatar?: string };
  course?: { title?: string; category?: string };
  roleOrExam?: string;
  targetExam?: string;
  studentAvatar?: string;
  date?: string;
  approved?: boolean;
}

export function LandingStudentReviews({
  reviews: rawReviewsProp = [],
}: {
  reviews?: LandingReviewItem[];
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();

  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  // Normalize all incoming reviews
  const userReviews: UnifiedReview[] = rawReviewsProp
    .map((r) => ({
      _id: r._id || r.id,
      studentName: r.user?.name || r.studentName || 'Student',
      studentAvatar: r.studentAvatar || r.user?.avatar || '',
      roleOrExam: r.course?.category || r.roleOrExam || r.targetExam || r.course?.title || 'Student',
      rating: r.rating || 5,
      comment: r.body || r.comment || r.reviewText || '',
      date: r.date || '',
    }))
    .filter((r) => r.comment.trim().length > 0);

  // Merge with SHARED_STUDENT_REVIEWS so data is 100% identical on both Teachers and Landing pages
  const reviews: UnifiedReview[] = [
    ...userReviews,
    ...SHARED_STUDENT_REVIEWS.filter(
      (d) => !userReviews.some((u) => u.studentName.toLowerCase() === d.studentName.toLowerCase()),
    ),
  ];

  function prev() {
    if (reviews.length === 0) return;
    setStartIndex((curr) => (curr === 0 ? Math.max(0, reviews.length - 1) : curr - 1));
  }

  function next() {
    if (reviews.length === 0) return;
    setStartIndex((curr) => (curr >= reviews.length - 1 ? 0 : curr + 1));
  }

  // Slice visible reviews (always wrap around to show 3 cards)
  const visible =
    reviews.length >= 3
      ? [
          reviews[startIndex % reviews.length]!,
          reviews[(startIndex + 1) % reviews.length]!,
          reviews[(startIndex + 2) % reviews.length]!,
        ]
      : reviews;

  // Write Review form state
  const [studentName, setStudentName] = useState('');
  const [roleOrExam, setRoleOrExam] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [studentAvatar, setStudentAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

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

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!studentName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please share your learning experience');
      return;
    }

    setSubmitting(true);
    try {
      await api('/api/teachers/riju/reviews', {
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
      });

      toast.success('Thank you! Your review has been submitted.');
      setSubmittedSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ['cms-public'] });
      await queryClient.invalidateQueries({ queryKey: ['home-teachers'] });

      setTimeout(() => {
        setWriteModalOpen(false);
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

  return (
    <>
      <section id="student-reviews" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Identical Card Container to Teachers Details Page */}
        <div className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-[#1C1815]">Student Reviews</h2>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200/60">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                    <span>4.9</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Student "Write a Review" Button */}
              <button
                type="button"
                onClick={() => {
                  if (user?.name) setStudentName(user.name);
                  setWriteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-[#FAF7F2] hover:bg-[#F3EFEA] hover:border-amber-300 px-3 py-1.5 text-xs font-bold text-stone-800 shadow-sm transition active:scale-95"
              >
                <PenLine className="h-3.5 w-3.5 text-amber-700" />
                <span>Write a Review</span>
              </button>

              {/* Admin "Manage Reviews" Button */}
              {isAdmin && (
                <Link
                  href="/admin/teachers"
                  title="Manage student reviews & moderation"
                  className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50/90 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100 active:scale-95"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>Manage</span>
                </Link>
              )}

              {/* View All Button - Always visible on all screens */}
              <button
                type="button"
                onClick={() => setViewAllOpen(true)}
                className="inline-flex items-center text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors cursor-pointer"
              >
                View All →
              </button>

              {/* Navigation Arrows */}
              {reviews.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous review"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next review"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-95"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Review Cards Grid (1 column on mobile, 2 on tablet, 3 on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {visible.map((review, i) => (
              <div
                key={`${review.studentName}-${review._id || i}`}
                className="flex flex-col justify-between rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-4 sm:p-4.5 transition hover:bg-white hover:border-amber-200 hover:shadow-sm"
              >
                <div>
                  {/* Student Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-200 border border-white">
                        {review.studentAvatar ? (
                          <Image
                            src={review.studentAvatar}
                            alt={review.studentName}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-stone-600 bg-amber-100 text-amber-900">
                            {review.studentName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#1C1815]">{review.studentName}</p>
                        <p className="truncate text-[10px] text-stone-500">{review.roleOrExam || 'Student'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      <span>{(review.rating || 5).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="mt-3 text-xs leading-relaxed text-[#5C544D] line-clamp-3">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                {/* Date */}
                {review.date ? (
                  <p className="mt-3 text-[10px] font-medium text-stone-400">
                    {review.date}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {reviews.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-1.5">
              {reviews.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  onClick={() => setStartIndex(dotIndex)}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    dotIndex === startIndex % reviews.length
                      ? 'w-4 bg-[#8C6228]'
                      : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal: Write a Review */}
      <Modal
        open={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        title={submittedSuccess ? 'Thank You!' : 'Write a Student Review'}
      >
        {submittedSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900">
              Review Submitted Successfully!
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Your feedback inspires thousands of aspirants across Gyan Chowk to keep learning with purpose.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4 pt-1">
            {/* Star selector */}
            <div className="rounded-2xl border border-amber-200/80 bg-[#FFFDF8] p-4 text-center space-y-2">
              <p className="text-xs font-semibold text-[#8C6228]">Rate your experience on Gyan Chowk</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const filled = starVal <= (hoverRating ?? rating);
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
                {rating === 5 ? '5.0 - Exceptional & Highly Recommended' : `${rating}.0 Stars`}
              </p>
            </div>

            {/* Inputs */}
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
                  Target Exam / Course
                </label>
                <Input
                  value={roleOrExam}
                  onChange={(e) => setRoleOrExam(e.target.value)}
                  placeholder="e.g. NEET 2026, UPSC, Class 12"
                />
              </div>
            </div>

            {/* Avatar upload */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Photo <span className="text-[10px] text-stone-400">(Optional)</span>
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
                      {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                </div>

                <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100">
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
                    className="text-stone-400 hover:text-red-500 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Feedback textarea */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Review & Story <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how Gyan Chowk lectures, notes, test series, or faculty guidance helped you..."
                rows={3}
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs leading-relaxed text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setWriteModalOpen(false)}
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

      {/* Modal: View All Reviews */}
      <Modal
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        title={`All Student Reviews (${reviews.length})`}
      >
        <div className="max-h-[70vh] overflow-y-auto space-y-3.5 pr-1 pt-1">
          {reviews.map((r, i) => (
            <div
              key={r._id || i}
              className="rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-amber-100">
                    {r.studentAvatar ? (
                      <Image
                        src={r.studentAvatar}
                        alt={r.studentName}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-900">
                        {r.studentName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">{r.studentName}</p>
                    <p className="text-[10px] text-stone-500">{r.roleOrExam || 'Student'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                  <span>{(r.rating || 5).toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
              {r.date && <p className="text-[10px] text-stone-400">{r.date}</p>}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, PenLine, Settings2, Sparkles, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { TeacherWriteReviewModal } from './TeacherWriteReviewModal';
import { TeacherReviewManagerModal } from './TeacherReviewManagerModal';
import { Modal } from '@/components/ui/Overlay';
import type { TeacherCardData } from '@/lib/types';

import { SHARED_STUDENT_REVIEWS } from './sharedReviews';

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

export function TeacherReviewsCarousel({ teacher }: { teacher: TeacherCardData }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  // Normalize raw reviews and merge with SHARED_STUDENT_REVIEWS for consistent data across pages
  const userReviews: ReviewItem[] = (
    teacher.reviews && teacher.reviews.length > 0 ? (teacher.reviews as ReviewItem[]) : []
  )
    .map((r) => ({
      ...r,
      comment: r.comment || r.reviewText || '',
      roleOrExam: r.roleOrExam || r.targetExam || 'Student',
      rating: r.rating || 5,
    }))
    .filter((r) => isAdmin || r.approved !== false);

  const reviews: ReviewItem[] = [
    ...userReviews,
    ...SHARED_STUDENT_REVIEWS.filter(
      (d) => !userReviews.some((u) => u.studentName.toLowerCase() === d.studentName.toLowerCase()),
    ),
  ];

  const displayRating = teacher.stats?.rating ?? teacher.ratingAvg ?? 5.0;

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

  return (
    <>
      <div id="reviews-section" className="rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
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
                  <span>{displayRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Student "Write a Review" Button */}
            <button
              type="button"
              onClick={() => setWriteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-[#FAF7F2] hover:bg-[#F3EFEA] hover:border-amber-300 px-3 py-1.5 text-xs font-bold text-stone-800 shadow-sm transition active:scale-95"
            >
              <PenLine className="h-3.5 w-3.5 text-amber-700" />
              <span>Write a Review</span>
            </button>

            {/* Admin "Manage Reviews" Button */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setManagerModalOpen(true)}
                title="Manage student reviews & moderation"
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50/90 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100 active:scale-95"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Manage</span>
              </button>
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

        {/* Empty State */}
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center bg-[#FAF8F5]">
            <MessageSquareQuote className="mx-auto h-8 w-8 text-stone-400 mb-2" />
            <h3 className="text-sm font-bold text-[#1C1815]">No student reviews yet</h3>
            <p className="text-xs text-[#5C544D] mt-1 max-w-sm mx-auto">
              Have you studied with {teacher.name}? Be the first to share your learning experience and rating!
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setWriteModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#8C6228] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#735020] active:scale-95"
              >
                <PenLine className="h-3.5 w-3.5" />
                <span>Write the First Review</span>
              </button>
            </div>
          </div>
        ) : (
          /* Review Cards Grid (1 column on mobile, 2 on tablet, 3 on desktop) */
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
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-bold text-[#1C1815]">{review.studentName}</p>
                          {isAdmin && review.approved === false && (
                            <span className="rounded bg-amber-200 px-1 py-0.2 text-[8px] font-bold text-amber-900">
                              Hidden
                            </span>
                          )}
                        </div>
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
        )}

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

      {/* Modal: Write a Review (for students/users) */}
      <TeacherWriteReviewModal
        teacher={teacher}
        open={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
      />

      {/* Modal: Manage Reviews (for admins) */}
      {isAdmin && (
        <TeacherReviewManagerModal
          teacher={teacher}
          open={managerModalOpen}
          onClose={() => setManagerModalOpen(false)}
        />
      )}

      {/* Modal: View All Reviews */}
      <Modal
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        title={`All Reviews for ${teacher.name} (${reviews.length})`}
      >
        <div className="max-h-[70vh] overflow-y-auto space-y-3 pr-1 pt-1">
          {reviews.map((r, i) => (
            <div
              key={r._id || i}
              className="rounded-2xl border border-stone-200 bg-[#FAF8F5] p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-amber-100">
                    {r.studentAvatar ? (
                      <Image
                        src={r.studentAvatar}
                        alt={r.studentName}
                        fill
                        className="object-cover"
                        sizes="32px"
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

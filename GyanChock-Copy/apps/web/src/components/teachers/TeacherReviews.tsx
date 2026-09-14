'use client';

import { Rating } from '@/components/ui/Badge';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/motion';

export interface TeacherReviewItem {
  rating: number;
  body: string;
  title?: string;
  verified?: boolean;
  createdAt?: string;
  user?: { name?: string };
  course?: { title?: string; slug?: string };
}

export function TeacherReviews({ reviews }: { reviews: TeacherReviewItem[] }) {
  return (
    <AnimatedSection>
      <h2 className="mt-10 font-display text-2xl text-gc-black">Reviews</h2>
      {reviews.length ? (
        <StaggerContainer className="mt-4 space-y-3">
          {reviews.map((r, i) => (
            <StaggerItem key={`${r.createdAt ?? i}-${r.user?.name ?? 'student'}`}>
              <article className="gc-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{r.user?.name ?? 'Student'}</p>
                  <Rating value={r.rating} />
                </div>
                {r.course?.title ? <p className="mt-1 text-xs text-gc-gold">{r.course.title}</p> : null}
                {r.title ? <p className="mt-2 text-sm text-gc-mist">{r.title}</p> : null}
                <p className="mt-2 text-sm text-gc-mist">{r.body}</p>
                {r.createdAt ? <p className="mt-2 text-xs text-gc-mute">{new Date(r.createdAt).toLocaleDateString()}</p> : null}
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <p className="mt-3 text-sm text-gc-mute">No verified reviews on this teacher’s published courses yet.</p>
      )}
    </AnimatedSection>
  );
}

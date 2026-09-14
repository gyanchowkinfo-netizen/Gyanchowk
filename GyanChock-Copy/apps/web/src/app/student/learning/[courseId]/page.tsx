'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { ProgressBar } from '@/components/ui/Badge';
import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function CourseClassroom() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['classroom', courseId],
    queryFn: async () => {
      const enrollments = await api<{ items: Array<{ course?: { _id: string; slug: string; title: string } }> }>(
        '/api/learning/enrollments',
      );
      const match = enrollments.items.find((e) => e.course && (e.course._id === courseId || e.course.slug === courseId));
      const slug = match?.course?.slug;
      if (!slug) throw new Error('You are not enrolled in this course');
      const detail = await api<{
        course: { title: string; _id: string };
        lessons: Array<{ _id: string; title: string; video?: string; isDemo?: boolean }>;
      }>(`/api/courses/${slug}`);
      return { ...detail, slug };
    },
  });
  const lessons = data?.lessons ?? [];
  const [idx, setIdx] = useState(0);
  const current = lessons[idx];
  const videoId = current?.video;
  const percent = useMemo(() => (lessons.length ? Math.round(((idx + 1) / lessons.length) * 100) : 0), [idx, lessons.length]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  if (!lessons.length) return <EmptyState title="No lessons yet" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="gc-card p-4">
        <p className="text-xs uppercase tracking-widest text-gc-gold">Syllabus</p>
        <h1 className="mt-1 font-display text-lg">{data?.course.title}</h1>
        <div className="mt-3">
          <ProgressBar value={percent} />
        </div>
        <ul className="mt-4 space-y-1">
          {lessons.map((l, i) => (
            <li key={l._id}>
              <button
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200 ${i === idx ? 'bg-gc-blue' : 'hover:bg-gc-ink'}`}
                onClick={() => setIdx(i)}
              >
                {l.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div>
        <h2 className="font-display text-2xl text-gc-black">{current?.title}</h2>
        {videoId ? (
          <div className="mt-4">
            <VideoPlayer videoId={String(videoId)} />
          </div>
        ) : (
          <p className="mt-4 gc-card p-6 text-sm text-gc-mute">
            This lesson has no video yet. Demo content still requires a Cloudinary-backed Video document. Ask your teacher to attach a video.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="gc-btn-ghost" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            Previous
          </button>
          <button className="gc-btn-ghost" disabled={idx >= lessons.length - 1} onClick={() => setIdx((i) => Math.min(lessons.length - 1, i + 1))}>
            Next
          </button>
          <Link href="/student/doubts" className="gc-btn-gold">
            Ask a doubt
          </Link>
          <Link href="/student/materials" className="gc-btn-ghost">
            Materials
          </Link>
        </div>
      </div>
    </div>
  );
}

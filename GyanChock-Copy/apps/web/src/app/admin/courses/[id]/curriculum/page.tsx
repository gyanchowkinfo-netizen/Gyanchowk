'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Layers } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { CourseCurriculumManager } from '@/components/teachers/CourseCurriculumManager';

export default function AdminCourseCurriculumPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const courseId = params?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-course-detail', courseId],
    enabled: Boolean(courseId),
    queryFn: () => api<{ course: { _id: string; title: string; slug: string; status: string } }>(`/api/courses/by-id/${courseId}`),
  });

  if (isLoading) return <LoadingState label="Loading course curriculum…" />;
  if (error || !data?.course) {
    return <ErrorState message={(error as Error)?.message || 'Course not found'} onRetry={() => refetch()} />;
  }

  const course = data.course;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gc-border pb-4">
        <div>
          <Link
            href="/admin/courses"
            className="text-xs text-gc-mute hover:text-gc-ink flex items-center gap-1.5 mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Courses</span>
          </Link>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gc-primary shrink-0" />
            <h1 className="font-display text-2xl text-gc-ink">Curriculum Management</h1>
          </div>
          <p className="text-xs text-gc-mute mt-1">
            Course: <strong className="text-gc-ink">{course.title}</strong> · Status: <span className="uppercase font-semibold text-gc-primary">{course.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/student/learning/${course._id}?preview=1`} target="_blank">
            <Button variant="ghost" className="flex items-center gap-1.5 text-xs">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Classroom</span>
            </Button>
          </Link>
        </div>
      </div>

      <CourseCurriculumManager courseId={course._id} onBack={() => router.push('/admin/courses')} />
    </div>
  );
}

'use client';

import { CourseGrid } from '@/components/public/CourseCard';
import { EmptyState } from '@/components/ui/States';
import { AnimatedSection } from '@/components/motion';
import type { CourseCardData } from '@/lib/types';

export function TeacherCourses({ courses }: { courses: CourseCardData[] }) {
  return (
    <AnimatedSection>
      <h2 id="teacher-courses" className="mt-10 font-display text-2xl text-gc-black">
        Courses
      </h2>
      <div className="mt-4">
        {courses.length ? <CourseGrid courses={courses} /> : <EmptyState title="No published courses yet" />}
      </div>
    </AnimatedSection>
  );
}
